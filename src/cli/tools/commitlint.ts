import { join } from 'path';

import { Tool, copyFiles, logger, runCommand } from '../common';
import { NodeLanguage } from '../languages';

// Constants.
const TOOL_NAME = 'commitlint';
const TOOL_DESCRIPTION = 'Commitlint is a tool for managing your commit messages';
const COMMITLINT_VERSION = '~19.7.1';
const COMMITLINT_TYPES_VERSION = '~19.5.0';
const HUSKY_VERSION = '~9.1.7';

// Commands.
const INIT_HUSKY_CMD = 'pnpm husky init && pnpm prepare';

// Node scripts.
const COMMITLINT_SCRIPT = 'commitlint --edit';
const COMMIT_SCRIPT = 'commit';
const HUSKY_PREPARE_SCRIPT = 'husky';

// Presets files.
const COMMITLINT_CONFIG_FILE = join(__dirname, 'presets', 'commitlint', 'commitlint.config.ts');
const HUSKY_PRE_COMMIT_FILE = join(__dirname, 'presets', 'commitlint', 'pre-commit');
const HUSKY_COMMIT_MSG_FILE = join(__dirname, 'presets', 'commitlint', 'commit-msg');

/**
 * Implementation of the Commitlint tool.
 * For more info: https://commitlint.js.org/
 */
class CommitlintTool extends Tool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  public static async initHusky() {
    await runCommand({ command: INIT_HUSKY_CMD, name: 'Initializing Husky' });
  }

  async install() {
    // Add commitlint and husky dependencies packages to workspace.
    await NodeLanguage.addDependency([
      { name: '@commitlint/cli', version: COMMITLINT_VERSION, dev: true },
      { name: '@commitlint/config-conventional', version: COMMITLINT_VERSION, dev: true },
      { name: '@commitlint/prompt-cli', version: COMMITLINT_VERSION, dev: true },
      { name: '@commitlint/types', version: COMMITLINT_TYPES_VERSION, dev: true },
      { name: 'husky', version: HUSKY_VERSION, dev: true },
    ]);

    // Add commitlint config file to workspace and husky files.
    logger.info('Adding commitlint config and husky files');
    copyFiles([{ file: COMMITLINT_CONFIG_FILE }], process.cwd());
    copyFiles([{ file: HUSKY_PRE_COMMIT_FILE }], join(process.cwd(), '.husky'));
    copyFiles([{ file: HUSKY_COMMIT_MSG_FILE }], join(process.cwd(), '.husky'));

    // Add scripts to package.json.
    logger.info('Adding scripts to package.json');
    await NodeLanguage.addScript([
      { name: 'commitlint', script: COMMITLINT_SCRIPT },
      { name: 'commit', script: COMMIT_SCRIPT },
      { name: 'prepare', script: HUSKY_PREPARE_SCRIPT },
    ]);
  }
}

export { CommitlintTool };
