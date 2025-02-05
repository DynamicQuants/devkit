import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { copyFiles, getInstructions, runCommand, setFileData } from './helpers';
import logger from './logger';
import promps, { License } from './promps';
import { Toolchain, Tools } from './toolchain';

/**
 * Represents the scope of the workspace.
 */
export const WorkspaceScope = {
  LIB_OR_APP: 'Single Library or Application project',
  LIB_MONOREPO: 'Library Monorepo with multiple packages',
  SYSTEM_MONOREPO: 'System Monorepo with packages, libs and apps',
} as const;

export type WorkspaceScope = (typeof WorkspaceScope)[keyof typeof WorkspaceScope];

interface WorkspaceProps {
  scope: WorkspaceScope;
  name: string;
  description: string;
  tools: Tools[];
  rootPath: string;
  license: License;
  repoName: string | null;
  path?: string;
}

/**
 * A workspace is a codebase space that contains a collection of tools and languages that are used
 * to maintain, build, test, and run software.
 */
export class Workspace {
  public config: Partial<Omit<WorkspaceProps, 'path'>>;
  public toolchain: Toolchain;

  constructor(config: Omit<WorkspaceProps, 'toolchain' | 'rootPath' | 'license'>) {
    this.config = { ...config, rootPath: join(config.path, config.name) };
    this.toolchain = new Toolchain(this);
  }

  /**
   * Check if the workspace already exists.
   * @returns {boolean} - True if the workspace already exists, false otherwise.
   * @private
   */
  private checkIfWorkspaceExists(): boolean {
    const { rootPath } = this.config;
    // Check if the workspace root exists.
    if (!existsSync(rootPath)) {
      return false;
    }

    // Check if the devkit.json file exists.
    const devkitFileExist = existsSync(join(rootPath, 'devkit.json'));
    if (devkitFileExist) {
      logger.warn('Workspace already exists!');
      const devkit = JSON.parse(readFileSync(join(rootPath, 'devkit.json'), 'utf8'));

      // if configuration is different we warn the user.
      if (JSON.stringify(devkit) !== JSON.stringify(this.config)) {
        logger.warn('Please check the devkit.json file and the workspace configuration.');
      }

      return true;
    }

    return false;
  }

  /**
   * Initialize the git repository.
   */
  private initGit(): void {
    const baseGitPath = join(__dirname, '..', 'files', 'git');

    // Creating base git base files.
    copyFiles([join(baseGitPath, '.gitignore')], this.config.rootPath);

    readdirSync(baseGitPath)
      .filter((file) => file.startsWith('gitignore'))
      .forEach((file) => {
        const tool = file.replace('gitignore-', '');
        if (this.config.tools.includes(tool as Tools)) {
          logger.info(`Adding ${tool} configuration to .gitignore`);
          const content = '\n' + readFileSync(join(baseGitPath, file), 'utf8').trim();
          setFileData(join(this.config.rootPath, '.gitignore'), content, 'merge');
        }
      });

    runCommand({ command: 'git init --initial-branch=main', name: 'Git Init' });
  }

  /**
   * Prepare the workspace.
   */
  private async prepareWorkspace(): Promise<void> {
    const { rootPath, scope } = this.config;

    // Assigning the license.
    if (scope === WorkspaceScope.LIB_OR_APP) {
      this.config.license = await promps.licensePrompt();
    }

    // Create workspace root.
    mkdirSync(rootPath, { recursive: true });

    // Create devkit.json file.
    setFileData(join(rootPath, 'devkit.json'), this.config, 'if-not-exists');
  }

  /**
   * Create the workspace based on the configuration.
   */
  public async create(): Promise<void> {
    // Check if the workspace already exists.
    if (this.checkIfWorkspaceExists()) {
      logger.warn('Nothing to do here, exiting...');
      process.exit(0);
    }

    // Prepare the workspace.
    await this.prepareWorkspace();

    const { name, description, rootPath, scope, tools, repoName, license } = this.config;

    // Create package.json file.
    if (tools.includes(Tools.NODEJS)) {
      setFileData(
        join(rootPath, 'package.json'),
        {
          name,
          version: '0.0.0',
          description,
          private: license === License.UNLICENSED,
          license: license,
          repository: {
            type: 'git',
            url: `https://github.com/${repoName}.git`,
          },
          scripts: {},
        },
        'if-not-exists',
      );
    }

    // Create docker-compose.yml file if not exists.
    setFileData(
      join(rootPath, 'docker-compose.yaml'),
      {
        version: '3.8',
        name,
      },
      'if-not-exists',
      'yaml',
    );

    // Setup the toolchain.
    this.toolchain.setup();

    // Adding projects array to the workspace.yml file.
    if (scope !== WorkspaceScope.LIB_OR_APP) {
      setFileData(
        join(rootPath, '.moon', 'workspace.yaml'),
        {
          projects:
            scope === WorkspaceScope.LIB_MONOREPO
              ? ['packages/*']
              : ['packages/*', 'libs/*', 'apps/*'],
        },
        'merge',
        'yaml',
      );
    }

    // Start git repository.
    this.initGit();

    // Get the instructions.
    const instructions = getInstructions('markdown');
    logger.info(instructions);

    logger.brand('🎉 Workspace created successfully!!!');
  }
}
