import { join } from 'path';

import { Tool, copyFiles, runCommand } from '../common';

// Constants.
const MOON_TOOL_NAME = 'moon';
const MOON_VERSION = '^1.31';
const TOOL_DESCRIPTION = 'Moon is a tool for building and testing your projects';
// Commands.
const INSTALL_MOON_CMD = `proto install moon ${MOON_VERSION} --pin local`;

// Presets.
const TOOLCHAIN_CONFIG = join(__dirname, 'presets', MOON_TOOL_NAME, 'toolchain.yml');
const WORKSPACE_CONFIG = join(__dirname, 'presets', MOON_TOOL_NAME, 'workspace.yml');

/**
 * Tool implementation for the Moon.
 * More info: https://moonrepo.dev/
 */
class MoonTool extends Tool {
  static readonly toolName = MOON_TOOL_NAME;
  readonly name = MOON_TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  async install() {
    await runCommand({ command: INSTALL_MOON_CMD, name: 'Installing Moon tool' });

    // Create the moon toolchain.yml and workspace.yml config files.
    copyFiles(
      [{ file: TOOLCHAIN_CONFIG }, { file: WORKSPACE_CONFIG }],
      join(process.cwd(), '.moon'),
    );
  }
}

export { MoonTool };
