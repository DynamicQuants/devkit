import { readFileSync } from 'fs';
import { join } from 'path';

import { LanguageSetup, logger, runCommand, setFileData } from '../common';

// Constants.
const LANGUAGE_NAME = 'python';
const LANGUAGE_DESCRIPTION = 'Python a programming language';
const UV_VERSION = '0.5';
const PYTHON_VERSION = '3.12.1';

// Commands.
const INSTALL_PYTHON_CMD = `proto install python ${PYTHON_VERSION} --pin local`;
const INSTALL_UV_CMD = `proto install uv ${UV_VERSION} --pin local`;

// Presets files.
const MOON_PYTHON_FILE = join(__dirname, 'presets', LANGUAGE_NAME, 'moon-python-toolchain.yml');

/**
 * Implementation of the Python language setup.
 * For more info: https://www.python.org/
 */
class PythonLanguage extends LanguageSetup {
  static readonly languageName = LANGUAGE_NAME;
  readonly description = LANGUAGE_DESCRIPTION;
  readonly name = PythonLanguage.languageName;

  async setup() {
    await runCommand({ command: INSTALL_PYTHON_CMD, name: 'Installing Python' });
    await runCommand({ command: INSTALL_UV_CMD, name: 'Installing uv' });

    // Adding to the moon toolchain.yaml config the python config.
    logger.info('Adding moon python toolchain config');
    const moonPythonConfig = readFileSync(MOON_PYTHON_FILE, 'utf8');
    setFileData(join(process.cwd(), '.moon', 'toolchain.yml'), moonPythonConfig, 'merge', 'yaml');
  }
}

export { PythonLanguage };
