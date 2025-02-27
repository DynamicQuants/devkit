import { join } from 'path';

import { runCommand, setFileData } from '../helpers';

const CHECK_PROTO = 'proto --version';
const INSTALL_PROTO = 'curl -fsSL https://moonrepo.dev/install/proto.sh | bash';
const UPGRADE_PROTO = 'proto upgrade';

/**
 * Install the proto toolchain.
 */
export default async function installProto() {
  const checkProto = await runCommand({ command: CHECK_PROTO, name: 'Checking proto toolchain' });

  if (checkProto.success) {
    await runCommand({ command: UPGRADE_PROTO, name: 'Upgrading proto toolchain' });
  } else {
    await runCommand({ command: INSTALL_PROTO, name: 'Installing proto toolchain' });
  }

  // Create .prototools file.
  setFileData(join(process.cwd(), '.prototools'), '', 'if-not-exists');
}
