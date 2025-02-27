import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yml from 'yaml';

import { getInstructions, runCommand, setFileData } from './helpers';
import logger from './logger';
import promps, { License } from './promps';
import { Toolchain } from './toolchain';
import { Language, Scope, type Tools } from './types';

const GET_PROTOTOOLS_VERSIONS = 'proto status --json';

/**
 * Properties that are used related to a workspace.
 */
interface WorkspaceProps {
  scope: Scope;
  name: string;
  description: string;
  languages: Language[];
  tools: Tools[];
  rootPath: string;
  license: License;
  repoName: string | null;
}

/**
 * A workspace is a codebase space that contains a collection of tools and languages that are used
 * to maintain, build, test, and run software.
 */
export class Workspace {
  public config: Partial<Omit<WorkspaceProps, 'path'>>;
  public toolchain: Toolchain;

  constructor(config: Omit<WorkspaceProps, 'toolchain' | 'rootPath' | 'license'>, path?: string) {
    this.config = { ...config, rootPath: path ? join(path, config.name) : process.cwd() };
    this.toolchain = new Toolchain(this);
  }

  /**
   * Check if the workspace already exists.
   * @returns {boolean} - True if the workspace already exists, false otherwise.
   * @private
   */
  private async checkIfWorkspaceExists(): Promise<boolean> {
    const { rootPath } = this.config;

    // Check if the workspace root exists.
    if (!existsSync(rootPath)) {
      return false;
    }

    // Check if the devkit.json file exists.
    const devkitFileExist = existsSync(join(rootPath, 'devkit.json'));
    if (devkitFileExist) {
      await logger.warn('Workspace already exists!');
      const devkit = JSON.parse(readFileSync(join(rootPath, 'devkit.json'), 'utf8'));

      // if configuration is different we warn the user.
      if (JSON.stringify(devkit) !== JSON.stringify(this.config)) {
        await logger.warn('Please check the devkit.json file and the workspace configuration.');
      }

      return true;
    }

    return false;
  }

  /**
   * Initialize the git repository.
   */
  private async initGit(): Promise<void> {
    const baseGitPath = join(__dirname, '..', 'files', 'git');

    // Creating base git base files.
    const baseGitIgnore = join(baseGitPath, 'base');
    const baseGitIgnoreContent = readFileSync(baseGitIgnore, 'utf8');
    setFileData(join(this.config.rootPath, '.gitignore'), baseGitIgnoreContent, 'if-not-exists');

    // Adding the tool/language specific gitignore files.
    readdirSync(baseGitPath)
      .filter((file) => file.startsWith('gitignore'))
      .forEach(async (file) => {
        const toolOrLanguage = file.replace('gitignore-', '');
        if (
          this.config.tools.includes(toolOrLanguage as Tools) ||
          this.config.languages.includes(toolOrLanguage as Language)
        ) {
          await logger.info(`Adding ${toolOrLanguage} configuration to .gitignore`);
          const content = '\n' + readFileSync(join(baseGitPath, file), 'utf8').trim();
          setFileData(join(this.config.rootPath, '.gitignore'), content, 'merge');
        }
      });

    // Initialize the git repository.
    await runCommand({
      command: 'git init --initial-branch=main',
      name: 'Initializing git repository',
    });
    await runCommand({ command: 'git add .', name: 'Adding files to git' });
    await runCommand({
      command: 'git commit --no-verify -m "🎉 Initial commit"',
      name: 'Creating initial commit',
    });
  }

  /**
   * Prepare the workspace.
   */
  private async prepareWorkspace(): Promise<void> {
    const { rootPath, scope } = this.config;

    // Assigning the license.
    if (scope === Scope.LIB_OR_APP) {
      this.config.license = await promps.licensePrompt();
    }

    // Create workspace root.
    mkdirSync(rootPath, { recursive: true });

    // Create devkit.json file.
    setFileData(join(rootPath, 'devkit.json'), this.config, 'if-not-exists');
  }

  private async check() {
    await logger.info('Checking workspace...');
    const { scope, languages, rootPath } = this.config;

    const moon = yml.parse(readFileSync(join(rootPath, '.moon', 'workspace.yml'), 'utf8'));
    const toolchain = yml.parse(readFileSync(join(rootPath, '.moon', 'toolchain.yml'), 'utf8'));

    // Checking proto tools versions.
    const protoTools = await runCommand({
      command: GET_PROTOTOOLS_VERSIONS,
      name: 'Checking proto tools versions',
      logMessage: false,
      stdio: 'pipe',
    });

    console.log(protoTools);

    // Checking workspace for lib or app scope.
    if (scope === Scope.LIB_OR_APP) {
      if (moon.projects.length !== 1) {
        await logger.error(
          'The workspace dir must be empty in workspace.yml for lib or app scope!',
        );
      }
    }

    // Checking workspace dirs.
    if (languages.includes(Language.NODEJS)) {
      const pnpm = yml.parse(readFileSync(join(rootPath, 'pnpm-workspace.yaml'), 'utf8'));
      const areDirsValid = (pnpm.packages as string[]).every((dir) => moon.projects.includes(dir));
      if (!areDirsValid) {
        await logger.error(
          'The project dirs in pnpm-workspace.yaml and workspace.yml are not the same!',
        );
      }

      if (!toolchain.node) {
        await logger.error('The node in toolchain.yml is not set!');
      }
    }

    // Checking python.
    if (languages.includes(Language.PYTHON)) {
      if (!toolchain.python) {
        await logger.error('The python in toolchain.yml is not set!');
      }
    }
  }

  /**
   * Create the workspace based on the configuration.
   */
  public async create(): Promise<void> {
    // Check if the workspace already exists.
    if (await this.checkIfWorkspaceExists()) {
      await logger.warn('Nothing to do here, exiting...');
      process.exit(0);
    }

    // Prepare the workspace.
    await this.prepareWorkspace();

    const { name, description, rootPath, scope, languages, repoName, license } = this.config;

    // Create package.json file.
    if (languages.includes(Language.NODEJS)) {
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
          devDependencies: {
            '@dynamic-quants/configs': '^1.0.0',
          },
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
    await this.toolchain.setup();

    // Adding projects array to the workspace.yml file.
    if (scope !== Scope.LIB_OR_APP) {
      setFileData(
        join(rootPath, '.moon', 'workspace.yml'),
        {
          projects:
            scope === Scope.LIB_MONOREPO ? ['packages/*'] : ['packages/*', 'libs/*', 'apps/*'],
        },
        'merge',
        'yaml',
      );
    }

    // Start git repository.
    await this.initGit();

    // Get the instructions.
    const instructions = getInstructions('markdown');
    console.log(instructions);
    await logger.success('Workspace created!');
  }

  /**
   * Get the workspace directories to place a new template.
   * @returns The workspace directories list.
   */
  public getTemplateDirs(): string[] {
    const { languages, rootPath } = this.config;
    let dirs: string[] = [];
    if (languages.includes(Language.NODEJS)) {
      const pnpm = yml.parse(readFileSync(join(rootPath, 'pnpm-workspace.yaml'), 'utf8'));
      dirs = pnpm.packages;
    } else {
      const moon = yml.parse(readFileSync(join(rootPath, '.moon', 'workspace.yml'), 'utf8'));
      dirs = moon.projects;
    }

    return dirs.map((dir) => dir.replace('*', ''));
  }

  /**
   * Load the workspace from the devkit.json file. If the file does not exist throw a error.
   * @returns The workspace instance.
   */
  static async load() {
    const devkit = JSON.parse(readFileSync(join(process.cwd(), 'devkit.json'), 'utf8'));
    const workspace = new Workspace(devkit);
    await workspace.check();
    return workspace;
  }
}
