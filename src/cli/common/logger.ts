import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import os from 'os';

/**
 * A simple logger class for the CLI using Ora and chalk.
 */
class Logger {
  static _spinner: Ora;
  public context = '';

  public start(text: string) {
    Logger._spinner = ora({
      text,
      color: 'white',
      discardStdin: false,
    }).start();
  }

  public stop() {
    Logger._spinner.stop();
  }

  public setContext(prefix: string) {
    this.context = chalk.bgGray(chalk.bold(prefix));
  }

  public resume() {
    Logger._spinner = Logger._spinner.clear();
  }

  public info(message: string) {
    const prefix = this.context.length > 0 ? `${this.context}` : '';
    Logger._spinner.text = `${prefix} ${message}`;
    Logger._spinner.render();
  }

  public error(message: string) {
    Logger._spinner.fail(message);
  }

  public success(message: string) {
    Logger._spinner.succeed(message);
  }

  public warn(message: string) {
    Logger._spinner.warn(message);
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

export const logger = new Logger();
