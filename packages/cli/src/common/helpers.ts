import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import handlebars from 'handlebars';
import { join } from 'path';
import { getPortPromise } from 'portfinder';
import yaml from 'yaml';

import { logger } from './logger';

type CommandResult = {
  name: string;
  success: boolean;
  result: string;
};

type CommandOptions = {
  command: string | (() => void);
  name: string;
  stdio?: 'inherit' | 'ignore' | 'pipe' | 'overlapped';
};

interface CopyFileOptions {
  file: string;
  fileName?: string;
}

interface GetFreePortOptions {
  startPort?: number;
  stopPort?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FileDataRecord = Record<string, any>;

/**
 * Set the data for the given file.
 *
 * @param filePath - The path to the file.
 * @param data - The data to set in the file.
 * @param mode - The mode to use. 'overwrite' will overwrite the file if it exists, 'merge' will
 * merge the data with the existing file.
 */
function setFileData(
  filePath: string,
  data: FileDataRecord | string,
  mode: 'overwrite' | 'merge' | 'if-not-exists' = 'merge',
  format: 'json' | 'yaml' = 'json',
) {
  function convertDataToString(data: FileDataRecord) {
    if (format === 'yaml') {
      return yaml.stringify(typeof data === 'string' ? yaml.parse(data) : data);
    }
    return JSON.stringify(data, null, 2);
  }

  // Create the destination directory if it doesn't exist.
  const destinationDir = filePath.split('/').slice(0, -1).join('/');
  if (!existsSync(destinationDir)) {
    mkdirSync(destinationDir, { recursive: true });
  }

  if ((!existsSync(filePath) && mode === 'if-not-exists') || mode === 'overwrite') {
    writeFileSync(filePath, typeof data === 'string' ? data : convertDataToString(data));
  } else {
    const existingData = readFileSync(filePath, 'utf8');
    if (typeof data === 'string') {
      writeFileSync(filePath, existingData + '\n' + data);
    } else {
      const updatedData = { ...yaml.parse(existingData), ...data };
      writeFileSync(filePath, convertDataToString(updatedData));
    }
  }
}

/**
 * Run a command in a generic way.
 *
 * @param options - The command options.
 * @returns The command result.
 */
async function runCommand(options: CommandOptions): Promise<CommandResult> {
  const { command, name, stdio = 'ignore' } = options;

  logger.info(name);

  try {
    let result = '';
    if (typeof command === 'function') {
      command();
    } else {
      result = execSync(command, { encoding: 'utf8', stdio });
    }

    return { name, success: true, result };
  } catch (error) {
    logger.error(`${name} command failed: ${error}`);

    return { name, success: false, result: '' };
  }
}

/**
 * Copy files to the given destination.
 *
 * @param files - The files to copy.
 * @param destination - The destination to copy the files to.
 */
function copyFiles(files: CopyFileOptions[], destination: string = process.cwd()) {
  files.forEach(({ file, fileName }) => {
    // An error must be thrown if the file is not found.
    if (!existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }

    // Another error must be thrown if the file is a directory.
    if (existsSync(file) && statSync(file).isDirectory()) {
      throw new Error(`File is a directory: ${file}`);
    }

    // We need to extract the file name from the path if it is not provided.
    if (!fileName) {
      fileName = file.split('/').pop();
    }

    // Create the destination directory if it doesn't exist.
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    // Copy the file to the destination.
    copyFileSync(file, join(destination, fileName));
  });
}

/**
 * Load devkit repo content.
 *
 * @param path - The path to the content.
 * @returns An array of files content.
 */
async function loadRepoContent(path: string) {
  const github = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  // Load templates from github devkit repo.
  const { data } = await github.rest.repos.getContent({
    owner: 'DynamicQuants',
    repo: 'devkit',
    ref: 'main',
    path,
  });

  if (!Array.isArray(data)) {
    logger.error(`No data found for path: ${path}`);
    return [];
  }

  return data;
}

/**
 * Get a free port. Commonly used for dockerservices.
 *
 * @returns The free port.
 */
async function getFreePort(
  { startPort, stopPort }: GetFreePortOptions = { startPort: 8000, stopPort: 9000 },
): Promise<number> {
  return await getPortPromise({ startPort, stopPort });
}

/**
 * Set the values for the given file.
 *
 * @param file - The file to set the values for.
 * @param values - The values to set.
 * @returns The updated file content.
 */
function getFileWithValues(file: string, values: FileDataRecord) {
  const content = readFileSync(file, 'utf8');
  const template = handlebars.compile(content);
  return template(values);
}

/**
 * Call a prompt function. Under the hood, it stops the logger and resumes it after the
 * prompt is done.
 *
 * @param prompt - The prompt function to call.
 * @returns The result of the prompt function.
 */
async function callPrompt<T>(prompt: () => Promise<T>) {
  logger.stop();
  const result = await prompt();
  logger.resume();
  return result;
}

export {
  setFileData,
  runCommand,
  loadRepoContent,
  copyFiles,
  getFreePort,
  getFileWithValues,
  callPrompt,
};
export type { CommandResult, FileDataRecord };
