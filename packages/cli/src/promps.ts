import inquirer from 'inquirer';

import { loadTemplates } from './helpers';
import type { TemplateInfo } from './template';
import { Language, License, Scope, Tools } from './types';

/**
 * Validate a kebab case name.
 * @param value - The value to validate.
 * @returns The validation result.
 */
function validateKebabCaseName(value: string) {
  if (!value || value.trim() === '') {
    return 'Name is required';
  }

  if (!/^[a-z]+(-[a-z]+)*$/.test(value)) {
    return 'Name must be in kebab case (e.g. my-project)';
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
 * Prompt for the name of the workspace/project.
 * @returns The name of the workspace/project.
 */
async function namePrompt(suffix: 'project' | 'workspace') {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: `What is the name of the ${suffix}?`,
      validate: validateKebabCaseName,
      default: 'my-project',
    },
  ]);

  return name;
}

/**
 * Prompt for the description of the workspace/project.
 * @returns The description of the workspace/project.
 */
async function descriptionPrompt(suffix: 'project' | 'workspace') {
  const { description } = await inquirer.prompt<{ description: string }>([
    {
      type: 'input',
      name: 'description',
      message: `What is the description of the ${suffix}?`,
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
  const { scope } = await inquirer.prompt<{ scope: Scope }>([
    {
      type: 'list',
      choices: Object.values(Scope),
      name: 'scope',
      message: 'What scope do you want to use?',
    },
  ]);

  return scope;
}

async function workspaceLanguagesPrompt() {
  const { languages } = await inquirer.prompt<{ languages: Language[] }>([
    {
      type: 'checkbox',
      choices: Object.values(Language),
      name: 'languages',
      message: 'What languages do you want to use?',
    },
  ]);

  return languages;
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

/**
 * Prompt for available templates.
 * @returns The template of the workspace.
 */
async function templatePrompt(languages: Language[], scope: Scope) {
  const { template } = await inquirer.prompt<{ template: TemplateInfo }>([
    {
      type: 'list',
      name: 'template',
      message: 'What is the template you want to use?',
      choices: (await loadTemplates())
        .filter(
          (template) => languages.includes(template.language) || template.scope.includes(scope),
        )
        .map((template) => ({
          name: `${template.name}: ${template.description}`,
          value: template,
        })),
    },
  ]);

  return template;
}

/**
 * Prompt for the workspace directories.
 * @returns The workspace directories.
 */
async function templateDestinationPrompt(choices: string[]) {
  const { templateDestination } = await inquirer.prompt<{ templateDestination: string }>([
    {
      type: 'list',
      name: 'templateDestination',
      message: 'Where do you want to install the template?',
      choices,
    },
  ]);

  return templateDestination;
}

export default {
  namePrompt,
  descriptionPrompt,
  publishableLibraryPrompt,
  workspaceScopePrompt,
  workspaceLanguagesPrompt,
  toolsPrompt,
  licensePrompt,
  isPrivatePrompt,
  repoNamePrompt,
  templatePrompt,
  templateDestinationPrompt,
};

export { License };
