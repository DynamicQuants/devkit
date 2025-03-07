import { join } from 'path';

import { Tool, copyFiles, logger, runCommand } from '../common';

// Constants.
const TOOL_NAME = 'act';
const TOOL_DESCRIPTION = 'Act is a tool for running your GitHub Actions locally';

// Commands.
const ACT_PLUGIN_URL =
  'https://raw.githubusercontent.com/theomessin/proto-toml-plugins/master/act.toml';
const INSTALL_ACT_CMD = `proto plugin add act "${ACT_PLUGIN_URL}" && proto install act --pin local`;

const PACKAGE_JSON_ACT_SCRIPT =
  'act --env-file ./.act/envs --var-file ./.act/vars --secret-file ./.act/secrets -j';

const ADD_ACT_SCRIPT_TO_PACKAGE_JSON = `pnpm pkg set scripts.act="${PACKAGE_JSON_ACT_SCRIPT}"`;

// Presets files.
const VARS_FILE = join(__dirname, 'presets', 'act', 'vars');
const SECRETS_FILE = join(__dirname, 'presets', 'act', 'secrets');
const ENVS_FILE = join(__dirname, 'presets', 'act', 'envs');

/**
 * Tool implementation for the Act.
 * More info: https://github.com/nektos/act
 */
export class ActTool extends Tool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  async install() {
    await runCommand({ command: INSTALL_ACT_CMD, name: 'Installing Act tool' });

    // Copy config base files.
    logger.info('Creating Act config base files');
    copyFiles(
      [{ file: VARS_FILE }, { file: SECRETS_FILE }, { file: ENVS_FILE }],
      join(process.cwd(), '.act'),
    );

    // Adding scripts to package.json.
    await runCommand({ command: ADD_ACT_SCRIPT_TO_PACKAGE_JSON, name: 'Setting up Act scripts' });
  }
}
