import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { runCommand, setFileData } from '../helpers';

const INSTALL_CHANGESET = 'pnpm add -w -D @changesets/{cli,changelog-github}';

const CHANGESET_CONFIG_FILE = join(__dirname, '../..', 'files', 'changeset', 'config.json');

export default function installChangeset(repo: string) {
  // Install the changeset CLI.
  runCommand({ command: INSTALL_CHANGESET, name: 'Changeset' });

  // Create the .changeset directory.
  mkdirSync(join(process.cwd(), '.changeset'), { recursive: true });

  // Create the changeset config file.
  const changesetConfig = JSON.parse(readFileSync(CHANGESET_CONFIG_FILE, 'utf-8'));
  changesetConfig.changelog.push({ repo });
  setFileData(join(process.cwd(), '.changeset', 'config.json'), changesetConfig, 'if-not-exists');
}
