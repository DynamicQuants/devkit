import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import tiged from 'tiged';
import yml from 'yaml';

import { callPrompt, logger, runCommand, setFileData } from './common';
import { type Language, NodeLanguage, installLanguages } from './languages';
import { projectPrompt, workspacePrompt } from './promps';
import type { OptionalTool } from './tools';
import { checkRequiredTools, installMandatoryTools, installOptionalTools } from './tools';
import type { License, Scope } from './types';

// Constants.
const TEMPLATE_REPO_NAME = 'DynamicQuants/devkit';

// Commands.
const GET_PROTO_STATUS_CMD = 'proto status --json';
const RUN_TEMPLATE_SETUP_CMD = 'chmod +x ./.devkit/setup.sh && ./.devkit/setup.sh';

/**
 * Properties that are used related to a workspace.
 */
type WorkspaceProps = {
  scope: Scope;
  name: string;
  description: string;
  languages: Language[];
  tools: OptionalTool[];
  license: License;
  repoName: string | null;
  rootPath?: string;
};

/**
 * Represents the project properties.
 */
type ProjectProps = {
  name: string;
  description: string;
};

/**
 * Represents the template information.
 */
type TemplateProps = {
  name: string;
  description: string;
  language: Language;
  path: string;
};

/**
 * A workspace is a codebase space that contains a collection of tools and languages that are used
 * to maintain, build, test, and run software.
 */
class Workspace {
  constructor(public config: WorkspaceProps) {
    // We infer if the root path is not provided, the current working directory is the root path.
    // Otherwise, we use the provided root path adding the workspace name to it.
    config.rootPath = config.rootPath ? join(config.rootPath, config.name) : process.cwd();
  }

  /**
   * Loads an existing workspace using the devkit.json configuration file.
   * @returns The workspace instance.
   */
  static async load() {
    const devkit = JSON.parse(readFileSync(join(process.cwd(), 'devkit.json'), 'utf8'));
    const workspace = new Workspace(devkit);
    await workspace.check();
    return workspace;
  }

  /**
   * Creates a new workspace using the provided properties and prompts the user for the
   * missing ones.
   * @param params The workspace properties.
   * @returns The workspace instance.
   */
  static async create(params: Partial<WorkspaceProps>) {
    const config = await workspacePrompt(params);
    return new Workspace(config);
  }

  private async check() {
    const { scope, languages, rootPath } = this.config;

    logger.start('Checking workspace');

    const moon = yml.parse(readFileSync(join(rootPath, '.moon', 'workspace.yml'), 'utf8'));
    const toolchain = yml.parse(readFileSync(join(rootPath, '.moon', 'toolchain.yml'), 'utf8'));

    // TODO: Checking proto tools versions must be a static function of ProtoTool class.
    const protoTools = await runCommand({
      command: GET_PROTO_STATUS_CMD,
      name: 'Checking proto tools versions',
      stdio: 'pipe',
    });

    // console.log(protoTools);

    // Checking workspace for lib or app scope.
    if (scope === 'lib-or-app') {
      if (moon.projects.length !== 1) {
        logger.error('The workspace dir must be empty in workspace.yml for lib or app scope!');
      }
    }

    // Checking workspace dirs.
    if (languages.includes('node')) {
      const pnpm = yml.parse(readFileSync(join(rootPath, 'pnpm-workspace.yaml'), 'utf8'));
      const areDirsValid = (pnpm.packages as string[]).every((dir) => moon.projects.includes(dir));
      if (!areDirsValid) {
        logger.error('The project dirs in pnpm-workspace.yaml and workspace.yml are not the same!');
      }

      if (!toolchain.node) {
        logger.error('The node in toolchain.yml is not set!');
      }
    }

    // Checking python.
    if (languages.includes('python')) {
      if (!toolchain.python) {
        logger.error('The python in toolchain.yml is not set!');
      }
    }

    logger.success('Workspace checked successfully');
  }

  public async addProject(props: Partial<ProjectProps>) {
    logger.start('Adding project');

    const { rootPath } = this.config;
    const { template, ...project } = await callPrompt(() => projectPrompt(props, this.config));
    const projectPath = join(rootPath, project.dest, project.name);

    // Download the template.
    logger.info('Cloning template');
    const emitter = tiged(`${TEMPLATE_REPO_NAME}/${template.path}`, {});
    await emitter.clone(projectPath);

    // Change the directory to the project path.
    process.chdir(projectPath);

    // Running the template setup script.
    await runCommand({
      command: RUN_TEMPLATE_SETUP_CMD,
      name: 'Running setup script',
    });

    // Reading template devkit.json.
    logger.info('Setup project');
    const devkitConfig = JSON.parse(
      readFileSync(join(projectPath, '.devkit', 'template.json'), 'utf8'),
    );

    // Custom setup for node projects.
    if (template.language === 'node') {
      await NodeLanguage.updatePackageJSON({
        name: project.name,
        description: project.description,
        peerDependencies: devkitConfig.peerDependencies,
      });

      await NodeLanguage.installDependencies();
    }

    if (template.language === 'python') {
      // Nothing to do here yet.
    }

    logger.success('🎉 Project added successfully!');
  }

  public async setup() {
    const { rootPath, tools, languages } = this.config;

    // Check if the workspace already exists.
    const devkitFileExist = existsSync(join(rootPath, 'devkit.json'));
    if (devkitFileExist) {
      logger.warn('The current directory is already a workspace!');
      return;
    }

    // Prepare the workspace.
    mkdirSync(rootPath, { recursive: true });
    setFileData(join(rootPath, 'devkit.json'), this.config, 'if-not-exists');
    process.chdir(rootPath);

    // Prepare the workspace and installing all tools.
    await checkRequiredTools(this);
    await installMandatoryTools();
    await installLanguages(languages, this);
    await installOptionalTools(tools, this);

    logger.success('🎉 Workspace setup complete!');
  }
}

export { Workspace };
export type { WorkspaceProps, TemplateProps, ProjectProps };
