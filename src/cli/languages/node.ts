import { readFileSync } from 'fs';
import { join } from 'path';

import type { FileDataRecord } from '../common';
import { LanguageSetup, copyFiles, logger, runCommand, setFileData } from '../common';
import { GitTool } from '../tools';
import { type Workspace } from '../workspace';

// Constants.
const LANGUAGE_NAME = 'node';
const LANGUAGE_DESCRIPTION = 'Node.js a JavaScript runtime';
const NODE_VERSION = '20.18.1';
const PNPM_VERSION = '10.2.0';
const DYNAMIC_QUANTS_CONFIGS_VERSION = '^1.0.0';
const DYNAMIC_QUANTS_CLI_VERSION = 'file:/Users/ccosming/Codes/DynamicQuants/devkit/packages/cli';

// Commands.
const INSTALL_NODE_CMD = `proto install node ${NODE_VERSION} --pin local`;
const INSTALL_PNPM_CMD = `proto install pnpm ${PNPM_VERSION} --pin local`;
const INSTALL_DEPS_CMD = `pnpm install`;
// Presets files.
const MOON_NODE_FILE = join(__dirname, 'presets', LANGUAGE_NAME, 'moon-node-toolchain.yml');
const NPMRC_FILE = join(__dirname, 'presets', LANGUAGE_NAME, 'npmrc');
const GITIGNORE_PRESET_FILE = join(__dirname, 'presets', LANGUAGE_NAME, 'gitignore-node');

type AddDependencyOptions = {
  name: string;
  version?: string;
  dev?: boolean;
};

type AddScriptOptions = {
  name: string;
  script: string;
};

/**
 * Class that represents the Node.js language setup.
 * For more info: https://nodejs.org
 */
class NodeLanguage extends LanguageSetup {
  static readonly languageName = LANGUAGE_NAME;
  readonly description = LANGUAGE_DESCRIPTION;
  readonly name = NodeLanguage.languageName;

  /**
   * Add the given dependencies to the package.json project.
   * @param dependencies - The dependencies to add.
   */
  public static async addDependency(dependencies: AddDependencyOptions[]) {
    await Promise.all(
      dependencies.map(async ({ name, version, dev }) => {
        const target = dev ? 'devDependencies' : 'dependencies';
        const command = `pnpm pkg set ${target}.${name}=${version ?? 'latest'}`;
        await runCommand({ command, name: `Adding ${name} to the project` });
      }),
    );
  }

  /**
   * Add a script to the package.json file.
   * @param options - The options to add the script.
   */
  public static async addScript(options: AddScriptOptions[]) {
    await Promise.all(
      options.map(async ({ name, script }) => {
        const command = `pnpm pkg set scripts.${name}=${script}`;
        await runCommand({ command, name: `Adding ${name} script to the project` });
      }),
    );
  }

  /**
   * Update the package.json file with the given properties. It asumes that the current directory
   * contains the package.json file.
   * @param props - The properties to update the package.json file with.
   */
  public static async updatePackageJSON(props: FileDataRecord) {
    const packageJSON = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    setFileData(
      join(process.cwd(), 'package.json'),
      {
        ...packageJSON,
        ...props,
      },
      'overwrite',
    );
  }

  /**
   * Install the dependencies for the current directory.
   */
  public static async installDependencies() {
    const { name } = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const installDepsResult = await runCommand({
      command: INSTALL_DEPS_CMD,
      name: `Installing Node.js dependencies for ${name}`,
      stdio: 'pipe',
    });

    console.log(installDepsResult);
  }

  async setup(workspace: Workspace) {
    const { name, description, rootPath, scope, repoName, license } = workspace.config;

    // Install Node.js and pnpm.
    logger.info('Installing Node.js and pnpm');
    await runCommand({ command: INSTALL_NODE_CMD, name: 'Installing Node.js with proto' });
    await runCommand({ command: INSTALL_PNPM_CMD, name: 'Installing pnpm with proto' });

    // Adding to the moon toolchain.yaml config the node config.
    logger.info('Adding moon node toolchain config');
    const moonNodeConfig = readFileSync(MOON_NODE_FILE, 'utf8');
    setFileData(join(process.cwd(), '.moon', 'toolchain.yml'), moonNodeConfig, 'merge', 'yaml');

    // Add pnpm workspace if needed.
    if (scope !== 'lib-or-app') {
      logger.info('Adding pnpm workspace');
      setFileData(
        join(process.cwd(), 'pnpm-workspace.yaml'),
        {
          packages: scope === 'lib-monorepo' ? ['packages/*'] : ['packages/*', 'libs/*', 'apps/*'],
        },
        'if-not-exists',
        'yaml',
      );
    }

    // Add .npmrc file.
    logger.info('Adding .npmrc file');
    copyFiles([{ file: NPMRC_FILE, fileName: '.npmrc' }], process.cwd());

    // Create package.json file.
    logger.info('Creating package.json file');
    setFileData(
      join(rootPath, 'package.json'),
      {
        name,
        version: '0.0.0',
        description,
        private: license === 'unlicensed',
        license: license,
        repository: {
          type: 'git',
          url: `https://github.com/${repoName}.git`,
        },
        scripts: {},
      },
      'if-not-exists',
    );

    // Add @dynamic-quants/devkit dependencies to the project.
    await NodeLanguage.addDependency([
      { name: '@dynamic-quants/configs', version: DYNAMIC_QUANTS_CONFIGS_VERSION, dev: true },
      { name: '@dynamic-quants/devkit-cli', version: DYNAMIC_QUANTS_CLI_VERSION, dev: true },
    ]);

    // TODO: this adding projects array to the workspace.yml file doest not related to node.
    if (scope !== 'lib-or-app') {
      logger.info('Adding projects array to the workspace.yml file');
      setFileData(
        join(rootPath, '.moon', 'workspace.yml'),
        {
          projects: scope === 'lib-monorepo' ? ['packages/*'] : ['packages/*', 'libs/*', 'apps/*'],
        },
        'merge',
        'yaml',
      );
    }

    // Adding the gitignore file.
    logger.info('Adding gitignore file');
    GitTool.addGitIgnore(GITIGNORE_PRESET_FILE);
  }
}

export { NodeLanguage };
