import { join } from 'path';

import { copyFiles, runCommand, setFileData } from '../helpers';

const INSTALL_COMMITLINT = 'pnpm add -w -D @commitlint/{cli,config-conventional,prompt-cli,types}';
const INSTALL_HUSKY = 'pnpm add -w -D husky';
const INIT_HUSKY = 'pnpm husky init && pnpm prepare';
const COMMITLINT_SCRIPT = 'pnpm pkg set scripts.commitlint="commitlint --edit"';
const COMMIT_SCRIPT = 'pnpm pkg set scripts.commit="commit"';
const HUSKY_PREPARE_SCRIPT = 'pnpm pkg set scripts.prepare="husky"';
const CREATE_COMMIT_MSG_FILE = 'pnpm commitlint ${1}';

const COMMITLINT_CONFIG_FILE = join(
  __dirname,
  '../..',
  'files',
  'commitlint',
  'commitlint.config.ts',
);

/**
 * Install Commitlint tool with Husky.
 */
export default async function installCommitlint() {
  await runCommand({ command: INSTALL_COMMITLINT, name: 'Installing Commitlint tool' });
  await runCommand({ command: INSTALL_HUSKY, name: 'Installing Husky tool' });

  // Add scripts to package.json.
  await runCommand({ command: COMMITLINT_SCRIPT, name: 'Adding Commitlint script' });
  await runCommand({ command: COMMIT_SCRIPT, name: 'Adding Commit script' });
  await runCommand({ command: HUSKY_PREPARE_SCRIPT, name: 'Adding Husky Prepare script' });

  // Initialize Husky.
  await runCommand({ command: INIT_HUSKY, name: 'Initializing Husky' });
  setFileData(join(process.cwd(), '.husky/pre-commit'), '', 'overwrite');

  // Create .commitlint.config.ts file.
  copyFiles([COMMITLINT_CONFIG_FILE], process.cwd());

  // Create .husky/commit-msg file.
  setFileData(join(process.cwd(), '.husky/commit-msg'), CREATE_COMMIT_MSG_FILE, 'if-not-exists');
}
