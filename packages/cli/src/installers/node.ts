import { readFileSync } from 'fs';
import { join } from 'path';

import { NODE_VERSION, PNPM_VERSION } from '../constants';
import { runCommand, setFileData } from '../helpers';
import { Scope } from '../types';

const INSTALL_NODE = `proto install node ${NODE_VERSION} --pin`;
const INSTALL_PNPM = `proto install pnpm ${PNPM_VERSION} --pin`;
const MOON_NODE_FILE = join(__dirname, '../../', 'files', 'moon', 'node-toolchain.yml');

/**
 * Install Node.js and pnpm. Also adds the pnpm workspace if needed.
 *
 * @param scope - The scope of the workspace.
 */
export default async function installNode(scope: Scope) {
  await runCommand({ command: INSTALL_NODE, name: 'Installing Node.js' });

  // For now only install pnpm is mandatory for Node.js.
  await runCommand({ command: INSTALL_PNPM, name: 'Installing pnpm' });

  // Adding to the moon toolchain.yaml config the node config.
  const moonNodeConfig = readFileSync(MOON_NODE_FILE, 'utf8');
  setFileData(join(process.cwd(), '.moon', 'toolchain.yml'), moonNodeConfig, 'merge', 'yaml');

  if (scope !== Scope.LIB_OR_APP) {
    // Add pnpm workspace if needed.
    setFileData(
      join(process.cwd(), 'pnpm-workspace.yaml'),
      {
        packages:
          scope === Scope.LIB_MONOREPO ? ['packages/*'] : ['packages/*', 'libs/*', 'apps/*'],
      },
      'if-not-exists',
      'yaml',
    );
  }
}
