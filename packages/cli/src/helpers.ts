import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

import logger from './logger';
import type { TemplateInfo } from './template';

type CommandResult = {
  name: string;
  success: boolean;
  result: string;
};

type CommandOptions = {
  command: string | (() => void);
  name: string;
  logMessage?: boolean;
  stdio?: 'inherit' | 'ignore' | 'pipe' | 'overlapped';
};

interface Instruction {
  tool: string;
  instructions: string[];
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | string,
  mode: 'overwrite' | 'merge' | 'if-not-exists' = 'merge',
  format: 'json' | 'yaml' = 'json',
) {
  function convertDataToString(data: Record<string, any>) {
    if (format === 'yaml') {
      return yaml.stringify(typeof data === 'string' ? yaml.parse(data) : data);
    }
    return JSON.stringify(data, null, 2);
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

  await logger.info(name);

  try {
    let result = '';
    if (typeof command === 'function') {
      command();
    } else {
      result = execSync(command, { encoding: 'utf8', stdio });
    }
    return { name, success: true, result };
  } catch (error) {
    await logger.error(`${name} command failed: ${error}`);

    return { name, success: false, result: '' };
  }
}

/**
 * Add instructions to the local instructions array.
 *
 * @param instruction - The instruction to add.
 */
const instructions: Array<Instruction> = [];
function addInstructions(instruction: Instruction) {
  instructions.push(instruction);
}

/**
 * Get the instructions.
 *
 * @param format - The format to get the instructions in.
 * @returns The instructions.
 */
function getInstructions(format: 'string' | 'markdown' = 'string') {
  if (format === 'string') {
    return instructions.map((instruction) => instruction.instructions.join('\n')).join('\n\n');
  } else {
    return instructions
      .map((instruction) => {
        return `## ${instruction.tool}\n${instruction.instructions.join('\n')}`;
      })
      .join('\n\n');
  }
}

/**
 * Copy files to the given destination.
 *
 * @param files - The files to copy.
 * @param destination - The destination to copy the files to.
 */
function copyFiles(files: string[], destination: string = process.cwd()) {
  files.forEach((file) => {
    // Extract the file name from the path.
    const fileName = file.split('/').pop();
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
  const github = new Octokit();

  // Load templates from github devkit repo.
  const { data } = await github.rest.repos.getContent({
    owner: 'DynamicQuants',
    repo: 'devkit',
    ref: 'main',
    path,
  });

  if (!Array.isArray(data)) {
    await logger.error(`No data found for path: ${path}`);
    return [];
  }

  return data;
}

async function loadTemplates(): Promise<TemplateInfo[]> {
  const data = await loadRepoContent('templates');
  const templates = Promise.all(
    data
      .filter((item) => item.type === 'dir')
      .filter(async (item) => {
        const content = await loadRepoContent(item.path);
        const moonYmlContent = content.find((item) => item.name === 'moon.yml');
        const devkitJsonContent = content.find((item) => item.name === 'devkit.json');
        return moonYmlContent && devkitJsonContent;
      })
      .map(async (template) => {
        const content = await loadRepoContent(template.path);
        const devkit = content.find((item) => item.name === 'devkit.json');

        const devkitContent = await fetch(devkit.download_url);
        const devkitText = await devkitContent.text();
        const devkitJson = JSON.parse(devkitText);

        return {
          name: template.name,
          description: devkitJson.description,
          language: devkitJson.language,
          path: template.path,
        } as TemplateInfo;
      }),
  );

  return templates;
}

export { setFileData, runCommand, addInstructions, getInstructions, copyFiles, loadTemplates };
export type { CommandResult };
