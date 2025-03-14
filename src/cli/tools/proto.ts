import { join } from 'path';

import { Tool, copyFiles, runCommand } from '../common';

// Constants.
const TOOL_NAME = 'proto';
const TOOL_DESCRIPTION = 'Proto is a tool for building and testing your projects';

// Commands.
const CHECK_PROTO_CMD = 'proto --version';
const INSTALL_PROTO_CMD = 'curl -fsSL https://moonrepo.dev/install/proto.sh | bash';
const UPGRADE_PROTO_CMD = 'proto install proto --pin local';

// Presets files.
const CONFIG_FILE = join(__dirname, 'presets', TOOL_NAME, 'config');

/**
 * Implementation of the Proto tool.
 * More info: https://moonrepo.dev/proto
 */
class ProtoTool extends Tool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  async install() {
    const status = await runCommand({ command: CHECK_PROTO_CMD, name: 'Checking proto toolchain' });

    if (status.success) {
      await runCommand({ command: UPGRADE_PROTO_CMD, name: 'Upgrading proto toolchain' });
    } else {
      await runCommand({ command: INSTALL_PROTO_CMD, name: 'Installing proto toolchain' });
    }

    // Create .prototools file with the base config.
    copyFiles([{ file: CONFIG_FILE, fileName: '.prototools' }], process.cwd());
  }
}

export { ProtoTool };
