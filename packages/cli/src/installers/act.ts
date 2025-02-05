import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { runCommand } from '../helpers';
import logger from '../logger';

const ACT_PLUGIN_URL =
  'https://raw.githubusercontent.com/theomessin/proto-toml-plugins/master/act.toml';
const INSTALL_ACT = `proto plugin add act "${ACT_PLUGIN_URL}" && proto install act --pin`;

const PACKAGE_JSON_ACT_SCRIPT =
  'act --env-file ./.act/envs --var-file ./.act/variables --secret-file ./.act/secrets -j';

const ADD_ACT_SCRIPT_TO_PACKAGE_JSON = `pnpm pkg set scripts.act="${PACKAGE_JSON_ACT_SCRIPT}"`;

export default function installAct() {
  runCommand({ command: INSTALL_ACT, name: 'Act' });

  // Create act directory.
  mkdirSync(join(process.cwd(), '.act'), { recursive: true });

  // Create act files templates.
  ['envs', 'variables', 'secrets'].forEach((file) => {
    writeFileSync(join(process.cwd(), '.act', file), '');
  });

  // Adding scripts to package.json.
  logger.info('Adding Act scripts to package.json...');
  runCommand({ command: ADD_ACT_SCRIPT_TO_PACKAGE_JSON, name: 'Setting up Act scripts' });
}
