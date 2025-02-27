import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { addInstructions, copyFiles, runCommand, setFileData } from '../helpers';
import logger from '../logger';

const VERDACCIO_DOCKER_SERVICE_FILE = join(
  __dirname,
  '../..',
  'files',
  'verdaccio',
  'docker-service.yaml',
);
const VERDACCIO_CONFIG_FILE = join(__dirname, '../..', 'files', 'verdaccio', 'config.yaml');

const verdaccioInstructions = {
  tool: 'Verdaccio',
  instructions: [
    'Please add the following to your .npmrc file:',
    `registry=http://localhost:4873`,
    'Please add the following to your package.json file:',
    `"publishConfig": { "registry": "http://localhost:4873" }`,
    'Create a user to login to the registry and follow the instructions:',
    `npm adduser --registry http://localhost:4873`,
    'You can now publish your packages to the registry:',
    `npm publish`,
  ],
};

/**
 * Install and configure Verdaccio tool.
 * For more information, please visit https://verdaccio.org/.
 */
export default async function installVerdaccio() {
  // Check if docker is installed.
  const dockerCheck = await runCommand({ command: 'docker --version', name: 'Checking Docker' });
  if (!dockerCheck.success) {
    await logger.warn(
      'Docker is not installed. Please install Docker from https://docs.docker.com/get-docker/',
    );
    return;
  }

  // Creating file system structure.
  mkdirSync(join(process.cwd(), '.verdaccio'), { recursive: true });
  mkdirSync(join(process.cwd(), '.verdaccio', 'storage'), { recursive: true });
  mkdirSync(join(process.cwd(), '.verdaccio', 'conf'), { recursive: true });
  mkdirSync(join(process.cwd(), '.verdaccio', 'plugins'), { recursive: true });

  // Adding verdaccio config file.
  copyFiles([VERDACCIO_CONFIG_FILE], join(process.cwd(), '.verdaccio', 'conf'));

  // Adding service file to docker compose file.
  const service_config = readFileSync(VERDACCIO_DOCKER_SERVICE_FILE, 'utf-8');
  setFileData(join(process.cwd(), 'docker-compose.yaml'), service_config, 'merge', 'yaml');

  // Add instructions to the instructions array.
  addInstructions(verdaccioInstructions);
}
