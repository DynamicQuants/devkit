import { readFileSync } from 'fs';
import { join } from 'path';

import { RequiredTool, copyFiles, setFileData } from '../common';
import type { Workspace } from '../workspace';

const TOOL_NAME = 'docker';
const TOOL_DESCRIPTION = 'Docker is a tool for building and testing your projects';
const CHECK_DOCKER_CMD = 'docker --version';
const DOCKER_COMPOSE_BASE_FILE = join(__dirname, 'presets', TOOL_NAME, 'docker-compose.yaml');

/**
 * Required tool implementation for the Docker.
 * For more info: https://www.docker.com/
 */
export class DockerTool extends RequiredTool {
  static readonly toolName = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  constructor() {
    super(
      DockerTool.toolName,
      CHECK_DOCKER_CMD,
      'Please install using this guide: https://docs.docker.com/get-docker/',
    );
  }

  async setup(workspace: Workspace) {
    const { rootPath, name } = workspace.config;

    // Copy docker-compose.yml base file.
    copyFiles([{ file: DOCKER_COMPOSE_BASE_FILE }], rootPath);

    // Adding workspace name to docker-compose.yml file.
    setFileData(join(rootPath, 'docker-compose.yaml'), { name }, 'merge', 'yaml');
  }

  /**
   * Add a service to the docker-compose.yml file.
   * @param ymlFile - The path to the docker-compose.yml file.
   */
  public static async addServiceFromFile(ymlFile: string) {
    const service = readFileSync(ymlFile, 'utf-8');
    setFileData(join(process.cwd(), 'docker-compose.yaml'), service, 'merge', 'yaml');
  }

  /**
   * Add a service to the docker-compose.yml file.
   * @param service - The service config string.
   */
  public static async addServiceFromString(service: string) {
    setFileData(join(process.cwd(), 'docker-compose.yaml'), service, 'merge', 'yaml');
  }
}
