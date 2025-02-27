import chalk from 'chalk';
import ora, { oraPromise } from 'ora';
import os from 'os';

/**
 * A simple logger class for the CLI using chalk.
 */
class Logger {
  static _spinner = ora({
    color: 'magenta',
    text: 'Starting...',
  }).start();

  public stop() {
    Logger._spinner.stop();
  }

  public async info(message: string) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    Logger._spinner.text = message;
  }

  public async error(message: string) {
    Logger._spinner.fail(message);
    Logger._spinner.stop();
  }

  public async success(message: string) {
    Logger._spinner.succeed(message);
    Logger._spinner.stop();
  }

  public async warn(message: string) {
    Logger._spinner.warn(message);
    Logger._spinner.stop();
  }

  public brand(message: string) {
    console.log(chalk.magenta(message));
  }

  public logo() {
    const OsMap = {
      darwin: 'MacOS',
      linux: 'Linux',
      win32: 'Windows',
    };

    this.brand(' ____                   _      _   _');
    this.brand('|  _ \\    ___  __   __ | | __ (_) | |_');
    this.brand('| | | |  / _ \\ \\ \\ / / | |/ / | | | __|');
    this.brand('| |_| | |  __/  \\ V /  |   <  | | | |_');
    this.brand('|____/   \\___|   \\_/   |_|\\_\\ |_|  \\__|');
    this.brand(OsMap[os.platform()]);
    this.brand('by Dynamic Quants');
    this.brand('https://dynamic-quants.com/devkit');
  }
}

export default new Logger();
