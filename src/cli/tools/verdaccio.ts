import { confirm } from '@inquirer/prompts';
import { join, relative } from 'path';

import {
  DEVKIT_GLOBAL_DIR,
  Tool,
  callPrompt,
  getFileWithValues,
  getFreePort,
  logger,
  setFileData,
} from '../common';
import { DockerTool } from './docker';
import { GitTool } from './git';

// Constants.
const TOOL_NAME = 'verdaccio';
const TOOL_DESCRIPTION = 'Verdaccio is a tool for managing your project versioning';

// Verdaccio files.
const VERDACCIO_DOCKER_SERVICE_FILE = join(__dirname, 'presets', 'verdaccio', 'service.yaml.hbs');
const VERDACCIO_CONFIG_FILE = join(__dirname, 'presets', 'verdaccio', 'config.yaml.hbs');
const VERDACCIO_GITIGNORE_FILE = join(__dirname, 'presets', 'verdaccio', 'gitignore-verdaccio');

/**
 * Prompt the user to confirm if they want to use a global config.
 * @returns The user's choice.
 */
async function isGlobalConfigPrompt() {
  return await callPrompt(() =>
    confirm(
      {
        message: `Do you want to use a global config for ${TOOL_NAME}?`,
        default: true,
        theme: {
          prefix: logger.context,
        },
      },
      {
        clearPromptOnDone: true,
      },
    ),
  );
}

/**
 * Install and configure Verdaccio tool.
 * For more information, please visit https://verdaccio.org/.
 */
class VerdaccioTool extends Tool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  async install() {
    // Checking if the user wants to use a global config.
    logger.info('Configuring Verdaccio');
    const isGlobalConfig = await isGlobalConfigPrompt();

    // Getting the port for the verdaccio service and setting the config path.
    const configPath = join(isGlobalConfig ? DEVKIT_GLOBAL_DIR : process.cwd(), '.verdaccio');
    const port = await getFreePort();

    // Adding verdaccio config file.
    logger.info('Creating Verdaccio config file');
    const config = getFileWithValues(VERDACCIO_CONFIG_FILE, { port });
    setFileData(join(configPath, 'conf', 'config.yaml'), config, 'if-not-exists', 'yaml');

    // Adding verdaccio docker service file.
    logger.info('Creating Verdaccio docker service file');
    const relativeConfigPath = relative(process.cwd(), configPath);
    const service = getFileWithValues(VERDACCIO_DOCKER_SERVICE_FILE, {
      port,
      storageDir: join(relativeConfigPath, 'storage'),
      confDir: join(relativeConfigPath, 'conf'),
      pluginsDir: join(relativeConfigPath, 'plugins'),
    });

    await DockerTool.addServiceFromString(service);

    // Adding the gitignore file.
    logger.info('Adding gitignore file');
    GitTool.addGitIgnore(VERDACCIO_GITIGNORE_FILE);
  }
}

export { VerdaccioTool };
