import { readFileSync } from 'fs';
import { join } from 'path';

import { PYTHON_VERSION, UV_VERSION } from '../constants';
import { runCommand, setFileData } from '../helpers';

const INSTALL_PYTHON = `proto install python ${PYTHON_VERSION} --pin`;
const INSTALL_UV = `proto install uv ${UV_VERSION} --pin`;
const MOON_PYTHON_FILE = join(__dirname, '../../', 'files', 'moon', 'python-toolchain.yaml');

export default function installPython() {
  runCommand({ command: INSTALL_PYTHON, name: 'Python' });
  runCommand({ command: INSTALL_UV, name: 'uv' });

  // Adding to the moon toolchain.yaml config the python config.
  const moonPythonConfig = readFileSync(MOON_PYTHON_FILE, 'utf8');
  setFileData(join(process.cwd(), '.moon', 'toolchain.yaml'), moonPythonConfig, 'merge', 'yaml');
}
