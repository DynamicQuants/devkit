import { homedir } from 'os';
import { join } from 'path';

/**
 * Global directory for DevKit.
 */
const DEVKIT_GLOBAL_DIR = join(homedir(), '.devkit');

export { DEVKIT_GLOBAL_DIR };
