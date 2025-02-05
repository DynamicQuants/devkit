import { join } from 'path';

import { runCommand, setFileData } from '../helpers';

const CHECK_PROTO = 'proto --version';
const INSTALL_PROTO = 'curl -fsSL https://moonrepo.dev/install/proto.sh | bash';
const UPGRADE_PROTO = 'proto upgrade';

/**
 * Install the proto toolchain.
 */
export default function installProto() {
  const checkProto = runCommand({ command: CHECK_PROTO, name: 'Proto Check' });

  if (checkProto.success) {
    runCommand({ command: UPGRADE_PROTO, name: 'Proto Upgrade' });
  } else {
    runCommand({ command: INSTALL_PROTO, name: 'Proto Install' });
  }

  // Create .prototools file.
  setFileData(join(process.cwd(), '.prototools'), '', 'if-not-exists');
}
