import { mkdirSync } from 'fs';
import { join } from 'path';

import { MOON_VERSION } from '../constants';
import { copyFiles, runCommand } from '../helpers';

const INSTALL_MOON = `proto install moon ${MOON_VERSION} --pin`;
const TOOLCHAIN_FILE = join(__dirname, '../../', 'files', 'moon', 'toolchain.yml');
const WORKSPACE_FILE = join(__dirname, '../../', 'files', 'moon', 'workspace.yml');

export default async function installMoon() {
  await runCommand({ command: INSTALL_MOON, name: 'Installing Moon tool' });

  // Create the moon config directory.
  mkdirSync(join(process.cwd(), '.moon'), { recursive: true });

  // Create the moon toolchain.yml and workspace.yml config files.
  copyFiles([WORKSPACE_FILE, TOOLCHAIN_FILE], join(process.cwd(), '.moon'));
}
