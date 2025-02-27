import { type CommandResult, runCommand } from './helpers';
import installers from './installers';
import logger from './logger';
import { Language, Tools } from './types';
import { type Workspace } from './workspace';

const CHECK_GIT_COMMAND = 'git --version';
const CHECK_DOCKER_COMMAND = 'docker --version';

/**
 * Class that represents the toolchain for a workspace. This is configured based on the languages.
 * Under the hood, this is a collection of tools that are used to build, test, and run the
 * workspace using `proto` and `moonrepo`.
 */
export class Toolchain {
  constructor(public workspace: Workspace) {}

  /**
   * Check the toolchain prerequisites after setup.
   * @private
   */
  private async checkPrerequisites() {
    const results: CommandResult[] = [];

    await logger.info('Checking toolchain prerequisites...');

    // Git always needs to be installed.
    const git = await runCommand({
      command: CHECK_GIT_COMMAND,
      name: 'Checking if git is installed',
    });
    results.push(git);

    // If docker is needed, check if is installed.
    if (this.workspace.config.tools?.includes(Tools.CHANGESETS)) {
      const docker = await runCommand({
        command: CHECK_DOCKER_COMMAND,
        name: 'Checking if docker is installed',
      });
      results.push(docker);
    }

    return results;
  }

  /**
   * Install the tools that are selected in the workspace configuration.
   * @private
   */
  private async installTools() {
    const { languages, tools, scope, rootPath, repoName } = this.workspace.config;

    await logger.info('Setting up toolchain...');

    // All commands are executed in the workspace root.
    process.chdir(rootPath);

    // Install proto and moon is mandatory.
    await installers.installProto();
    await installers.installMoon();

    // Install Python if needed.
    if (languages.includes(Language.PYTHON)) {
      await installers.installPython();
    }

    // Install Node.js if needed.
    if (languages.includes(Language.NODEJS)) {
      await installers.installNode(scope);
    }

    // Install Act if needed.
    if (tools.includes(Tools.ACT)) {
      await installers.installAct();
    }

    // Install Verdaccio if needed.
    if (tools.includes(Tools.VERDACCIO)) {
      await installers.installVerdaccio();
    }

    // Install Changeset if needed.
    if (tools.includes(Tools.CHANGESETS)) {
      await installers.installChangeset(repoName);
    }

    // Install Commitlint if needed.
    if (tools.includes(Tools.COMMITLINT)) {
      await installers.installCommitlint();
    }
  }

  /**
   * Setup the toolchain.
   */
  public async setup() {
    const failedChecks = (await this.checkPrerequisites()).filter((result) => !result.success);

    if (failedChecks.length > 0) {
      logger.error('Toolchain prerequisites not found. Please install the required tools:');
      failedChecks.forEach(async (result) => await logger.error(`- ${result.name}`));
      process.exit();
    }

    await this.installTools();
  }
}
