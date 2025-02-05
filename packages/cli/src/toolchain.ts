import os from 'os';

import { type CommandResult, runCommand } from './helpers';
import installers from './installers';
import logger from './logger';
import type { Workspace } from './workspace';

/**
 * Operating system map.
 */
export const OsMap = {
  darwin: 'MacOS',
  linux: 'Linux',
  win32: 'Windows',
} as const;

export type OsMap = (typeof OsMap)[keyof typeof OsMap];

/**
 * Available tools that can be installed and configured by the toolchain.
 */
export const Tools = {
  // NODEJS: 'NodeJS with TypeScript and pnpm',
  // PYTHON: 'Python with uv',
  // ACT: 'Nektos act local github actions runner',
  // VERDACCIO: 'Verdaccio local package registry',
  // CHANGESETS: 'ChangeSets local change management tool',
  // COMMITLINT: 'CommitLint local commit message linter',
  NODEJS: 'node',
  PYTHON: 'python',
  ACT: 'act',
  VERDACCIO: 'verdaccio',
  CHANGESETS: 'changeset',
  COMMITLINT: 'commitlint',
} as const;

export type Tools = (typeof Tools)[keyof typeof Tools];

const CHECK_GIT_COMMAND = 'git --version';
const CHECK_DOCKER_COMMAND = 'docker --version';

/**
 * Class that represents the toolchain for a workspace. This is configured based on the languages.
 * Under the hood, this is a collection of tools that are used to build, test, and run the
 * workspace using `proto` and `moonrepo`.
 */
export class Toolchain {
  private os: OsMap = OsMap[os.platform()];

  constructor(public workspace: Workspace) {
    logger.brand(`${this.os} \n`);
  }

  /**
   * Check the toolchain prerequisites after setup.
   * @private
   */
  private checkPrerequisites() {
    const results: CommandResult[] = [];

    logger.info('Checking toolchain prerequisites...');

    // Git always needs to be installed.
    const git = runCommand({ command: CHECK_GIT_COMMAND, name: 'Git' });
    results.push(git);

    // If docker is needed, check if is installed.
    if (this.workspace.config.tools?.includes(Tools.CHANGESETS)) {
      const docker = runCommand({ command: CHECK_DOCKER_COMMAND, name: 'Docker' });
      results.push(docker);
    }

    return results;
  }

  /**
   * Install the tools that are selected in the workspace configuration.
   * @private
   */
  private installTools() {
    const { tools, scope, rootPath, repoName } = this.workspace.config;

    logger.info('Setting up toolchain...');

    // All commands are executed in the workspace root.
    process.chdir(rootPath);

    // Install proto and moon is mandatory.
    installers.installProto();
    installers.installMoon();

    // Install Python if needed.
    if (tools.includes(Tools.PYTHON)) {
      installers.installPython();
    }

    // Install Node.js if needed.
    if (tools.includes(Tools.NODEJS)) {
      installers.installNode(scope);
    }

    // Install Act if needed.
    if (tools.includes(Tools.ACT)) {
      installers.installAct();
    }

    // Install Verdaccio if needed.
    if (tools.includes(Tools.VERDACCIO)) {
      installers.installVerdaccio();
    }

    // Install Changeset if needed.
    if (tools.includes(Tools.CHANGESETS)) {
      installers.installChangeset(repoName);
    }

    // Install Commitlint if needed.
    if (tools.includes(Tools.COMMITLINT)) {
      installers.installCommitlint();
    }
  }

  /**
   * Setup the toolchain.
   */
  public async setup() {
    const failedChecks = this.checkPrerequisites().filter((result) => !result.success);

    if (failedChecks.length > 0) {
      logger.error('Toolchain prerequisites not found. Please install the required tools:');
      failedChecks.forEach((result) => logger.error(`- ${result.name}`));
      process.exit();
    }

    this.installTools();
  }
}
