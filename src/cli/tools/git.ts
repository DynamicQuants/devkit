import { input } from '@inquirer/prompts';
import { readFileSync } from 'fs';
import { join } from 'path';

import { RequiredTool, copyFiles, logger, runCommand, setFileData } from '../common';

// Constants.
const TOOL_NAME = 'git';
const TOOL_DESCRIPTION = 'Git is a tool for managing your project versioning';
const MAIN_BRANCH = 'main';
const INITIAL_COMMIT_MESSAGE = '🎉 Initial commit';

// Commands.
const CHECK_GIT_COMMAND = 'git --version';
const GIT_INIT_COMMAND = `git init --initial-branch=${MAIN_BRANCH}`;
const INITIAL_COMMIT_COMMAND = `git commit -m "${INITIAL_COMMIT_MESSAGE}"`;
const GIT_ADD_ALL_COMMAND = 'git add .';
const GIT_GET_USER_COMMAND = 'git config user.email && git config user.name';

// Presets.
const GITIGNORE_PRESET_FILE = join(__dirname, 'presets', 'git', 'base');

type GitUser = {
  name: string;
  email: string;
};

async function gitUserPrompt(): Promise<GitUser> {
  return {
    name: await input({ message: 'Enter your git name:', required: true }),
    email: await input({ message: 'Enter your git email:', required: true }),
  };
}

/**
 * Required tool implementation for the Git.
 * For more info: https://git-scm.com/
 */
export class GitTool extends RequiredTool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  constructor() {
    super(
      GitTool.toolName,
      CHECK_GIT_COMMAND,
      'Please install using this guide: https://github.com/git-guides/install-git',
    );
  }

  override async setup() {
    // Initialize git repository.
    logger.info('Initializing git repository');
    await runCommand({ command: GIT_INIT_COMMAND, name: 'Initializing git repository' });

    // Copy the gitignore file.
    logger.info('Copying gitignore file');
    copyFiles([{ file: GITIGNORE_PRESET_FILE, fileName: '.gitignore' }]);
  }

  /**
   * Initialize the git repository and creates the initial commit.
   */
  public static async firstCommit() {
    await runCommand({ command: GIT_ADD_ALL_COMMAND, name: 'Adding files to git' });
    await runCommand({ command: INITIAL_COMMIT_COMMAND, name: 'Committing initial changes' });
  }

  /**
   * Set the git user. It will prompt the user for the name and email.
   */
  public static async setupUser() {
    const { name, email } = await gitUserPrompt();
    await runCommand({ command: `git config user.name ${name}`, name: 'Setting user name' });
    await runCommand({ command: `git config user.email ${email}`, name: 'Setting user email' });
  }

  /**
   * Add a gitignore file to the workspace.
   *
   * @param file - The file to add to the gitignore.
   */
  public static async addGitIgnore(file: string) {
    const content = '\n' + readFileSync(file, 'utf8').trim();
    setFileData(join(process.cwd(), '.gitignore'), content, 'merge');
  }

  /**
   * Get the current git user.
   * @returns The current git user.
   */
  public static async getCurrentUser(): Promise<GitUser> {
    const { success, result: user } = await runCommand({
      command: GIT_GET_USER_COMMAND,
      name: 'Getting current user',
      stdio: 'pipe',
    });

    if (!success) {
      throw new Error('Failed to get current user');
    }

    return { name: user.split('\n')[0], email: user.split('\n')[1] };
  }
}
