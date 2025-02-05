import inquirer from 'inquirer';

import { Tools } from './toolchain';
import { WorkspaceScope } from './workspace';

/**
 * Validate a kebab case name.
 * @param value - The value to validate.
 * @returns The validation result.
 */
function validateKebabCaseName(value: string) {
  if (!value || value.trim() === '') {
    return 'Workspace name is required';
  }

  if (!/^[a-z]+(-[a-z]+)*$/.test(value)) {
    return 'Workspace name must be in kebab case';
  }

  return true;
}

/**
 * Validate a repo name. (i.e. DynamicQuants/devkit)
 * @param value - The value to validate.
 * @returns The validation result.
 */
function validateRepoName(value: string) {
  if (!value || value.trim() === '') {
    return 'Repo name is required';
  }

  if (!/^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\/[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(value)) {
    return 'Repo name must be in the format of owner/repo';
  }

  return true;
}

/**
 * Prompt for the name of the workspace.
 * @returns The name of the workspace.
 */
async function namePrompt() {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the workspace?',
      validate: validateKebabCaseName,
      default: 'my-project',
    },
  ]);

  return name;
}

/**
 * Prompt for the description of the workspace.
 * @returns The description of the workspace.
 */
async function descriptionPrompt() {
  const { description } = await inquirer.prompt<{ description: string }>([
    {
      type: 'input',
      name: 'description',
      message: 'What is the description of the workspace?',
      default: 'My project',
    },
  ]);

  return description;
}

/**
 * Prompt if a library should be published.
 * @returns The publishable.
 */
async function publishableLibraryPrompt() {
  const { publishable } = await inquirer.prompt<{ publishable: boolean }>([
    {
      type: 'confirm',
      name: 'publishable',
      message: 'Do you want to publish this workspace?',
    },
  ]);

  return publishable;
}

/**
 * Prompt for the scope of the workspace. The values are given by the `WorkspaceScope` enum.
 * @returns The scope of the workspace.
 */
async function workspaceScopePrompt() {
  const { scope } = await inquirer.prompt<{ scope: WorkspaceScope }>([
    {
      type: 'list',
      choices: Object.values(WorkspaceScope),
      name: 'scope',
      message: 'What scope do you want to use?',
    },
  ]);

  return scope;
}

/**
 * Prompt for the extra tools for the workspace.
 * @returns The extra tools of the workspace.
 */
async function toolsPrompt() {
  const { tools } = await inquirer.prompt<{ tools: Tools[] }>([
    {
      type: 'checkbox',
      choices: Object.values(Tools),
      name: 'tools',
      message: 'What tools do you want to use?',
    },
  ]);

  return tools;
}

/**
 * Represents the license of the workspace.
 */
const License = {
  MIT: 'MIT',
  APACHE_2_0: 'APACHE_2_0',
  GPL_3_0: 'GPL_3_0',
  BSD_3_CLAUSE: 'GPL_3_0',
  ISC: 'ISC',
  UNLICENSED: 'UNLICENSED',
} as const;

type License = (typeof License)[keyof typeof License];

/**
 * Prompt for the license of the workspace.
 * @returns The license of the workspace.
 */
async function licensePrompt() {
  const { license } = await inquirer.prompt<{ license: License }>([
    {
      type: 'list',
      choices: Object.values(License),
      name: 'license',
      message: 'What license do you want to use?',
    },
  ]);

  return license;
}

/**
 * Prompt for the repo name of the workspace.
 * @returns The repo name of the workspace.
 */
async function repoNamePrompt() {
  const { repoName } = await inquirer.prompt<{ repoName: string }>([
    {
      type: 'input',
      name: 'repoName',
      message: 'What is the repo name of the workspace (e.g. @company/my-project)?',
      validate: validateRepoName,
    },
  ]);

  return repoName;
}

/**
 * Prompt for the private flag of the workspace.
 * @returns The private flag of the workspace.
 */
async function isPrivatePrompt() {
  const { isPrivate } = await inquirer.prompt<{ isPrivate: boolean }>([
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Is this workspace private?',
    },
  ]);

  return isPrivate;
}

export default {
  namePrompt,
  descriptionPrompt,
  publishableLibraryPrompt,
  workspaceScopePrompt,
  toolsPrompt,
  licensePrompt,
  isPrivatePrompt,
  repoNamePrompt,
};

export { License };
