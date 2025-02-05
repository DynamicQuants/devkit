import { readFileSync } from 'fs';
import { join } from 'path';

import { NODE_VERSION, PNPM_VERSION } from '../constants';
import { runCommand, setFileData } from '../helpers';
import { WorkspaceScope } from '../workspace';

const INSTALL_NODE = `proto install node ${NODE_VERSION} --pin`;
const INSTALL_PNPM = `proto install pnpm ${PNPM_VERSION} --pin`;
const MOON_NODE_FILE = join(__dirname, '../../', 'files', 'moon', 'node-toolchain.yaml');

/**
 * Install Node.js and pnpm. Also adds the pnpm workspace if needed.
 *
 * @param scope - The scope of the workspace.
 */
export default function installNode(scope: WorkspaceScope) {
  runCommand({ command: INSTALL_NODE, name: 'Node.js' });

  // For now only install pnpm is mandatory for Node.js.
  runCommand({ command: INSTALL_PNPM, name: 'pnpm' });

  // Adding to the moon toolchain.yaml config the node config.
  const moonNodeConfig = readFileSync(MOON_NODE_FILE, 'utf8');
  setFileData(join(process.cwd(), '.moon', 'toolchain.yaml'), moonNodeConfig, 'merge', 'yaml');

  if (scope !== WorkspaceScope.LIB_OR_APP) {
    // Add pnpm workspace if needed.
    setFileData(
      join(process.cwd(), 'pnpm-workspace.yaml'),
      {
        packages:
          scope === WorkspaceScope.LIB_MONOREPO
            ? ['packages/*']
            : ['packages/*', 'libs/*', 'apps/*'],
      },
      'if-not-exists',
      'yaml',
    );
  }
}
