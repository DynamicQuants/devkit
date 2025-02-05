import chalk from 'chalk';

/**
 * A simple logger class for the CLI using chalk.
 */
class Logger {
  public info(message: string) {
    console.log(chalk.gray(message));
  }

  public error(message: string) {
    console.error(chalk.red(message));
  }

  public success(message: string) {
    console.log(chalk.green(message));
  }

  public warn(message: string) {
    console.log(chalk.yellow(message));
  }

  public brand(message: string) {
    console.log(chalk.magenta(message));
  }

  public logo() {
    this.brand(' ____                   _      _   _');
    this.brand('|  _ \\    ___  __   __ | | __ (_) | |_');
    this.brand('| | | |  / _ \\ \\ \\ / / | |/ / | | | __|');
    this.brand('| |_| | |  __/  \\ V /  |   <  | | | |_');
    this.brand('|____/   \\___|   \\_/   |_|\\_\\ |_|  \\__|');
    this.brand('by Dynamic Quants');
    this.brand('https://dynamic-quants.com/devkit');
  }
}

export default new Logger();
