import { checkbox, input, select } from '@inquirer/prompts';
import { readFileSync } from 'fs';
import { join } from 'path';
import yml from 'yaml';

import { InvalidParameterError, loadRepoContent, logger } from './common';
import { type Language, supportedLanguages } from './languages';
import { type OptionalTool, optionalTools } from './tools';
import { type License, type Scope, licenses, scopes } from './types';
import type { ProjectProps, TemplateProps } from './workspace';
import { type WorkspaceProps } from './workspace';

/**
 * Get the supported tools.
 * @returns The supported tools.
 */
function getSupportedTools() {
  return Object.keys(optionalTools).map((tool: OptionalTool) => ({
    name: optionalTools[tool].description,
    value: tool as OptionalTool,
  }));
}

/**
 * Get the supported languages.
 * @returns The supported languages.
 */
function getSupportedLanguages() {
  return Object.keys(supportedLanguages).map((language: Language) => ({
    name: supportedLanguages[language].description,
    value: language as Language,
  }));
}

/**
 * Get the supported licenses.
 * @returns The supported licenses.
 */
function getSupportedLicenses() {
  return Object.values(licenses).map((license: License) => ({
    name: licenses[license],
    value: license,
  }));
}

/**
 * Get the supported scopes.
 * @returns The supported scopes.
 */
function getSupportedScopes() {
  return Object.values(scopes).map((scope: Scope) => ({
    name: scopes[scope],
    value: scope,
  }));
}

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
 * Get the workspace directories to place a new project.
 * @param config - The workspace configuration.
 * @returns The workspace directories list.
 */
function getWorkspaceDirs(config: WorkspaceProps): string[] {
  const { languages, rootPath } = config;
  let dirs: string[] = [];
  if (languages.includes('node')) {
    const pnpm = yml.parse(readFileSync(join(rootPath, 'pnpm-workspace.yaml'), 'utf8'));
    dirs = pnpm.packages;
  } else {
    const moon = yml.parse(readFileSync(join(rootPath, '.moon', 'workspace.yml'), 'utf8'));
    dirs = moon.projects;
  }

  return dirs.map((dir) => dir.replace('*', ''));
}

/**
 * Load the templates from the devkit repo.
 *
 * @returns The templates information array.
 */
async function loadTemplates(): Promise<TemplateProps[]> {
  const data = await loadRepoContent('templates');

  const templates = Promise.all(
    data
      .filter((item) => item.type === 'dir')
      .map(async (template) => {
        const content = await loadRepoContent(template.path);
        const devkit = content.find((item) => item.name === '.devkit' && item.type === 'dir');

        if (!devkit) {
          logger.warn(`No .devkit config found for template: ${template.path}`);
          return null;
        }

        const templateConfig = await loadRepoContent(devkit.path);
        const templateJson = templateConfig.find((item) => item.name === 'template.json');

        if (!templateJson) {
          logger.warn(`No template.json found for template: ${template.path}`);
          return null;
        }

        const devkitContent = await fetch(templateJson.download_url);
        const devkitText = await devkitContent.text();
        const devkitJson = JSON.parse(devkitText);

        return {
          name: template.name,
          description: devkitJson.description,
          language: devkitJson.language,
          path: template.path,
        } as TemplateProps;
      })
      .filter((template) => !!template),
  );

  // Sort the templates alphabetically by language.
  return (await templates).sort((a, b) => a.language.localeCompare(b.language));
}

/**
 * Prompt the user for the workspace configuration.
 * @param params - The workspace configuration.
 * @returns The workspace configuration.
 */
async function workspacePrompt(params: Partial<WorkspaceProps>): Promise<WorkspaceProps> {
  const { name, description, languages, license, tools, scope, repoName } = params;

  if (name && !validateKebabCaseName(name)) {
    throw new InvalidParameterError('name');
  }

  if (repoName && !validateRepoName(repoName)) {
    throw new InvalidParameterError('repoName');
  }

  return {
    name:
      name ??
      (await input({
        message: 'What is the workspace name?',
        validate: validateKebabCaseName,
        required: true,
      })),
    description:
      description ??
      (await input({
        message: 'What is the workspace description?',
        required: true,
      })),
    languages:
      languages ??
      (await checkbox({
        message: 'What languages do you want to use?',
        choices: getSupportedLanguages(),
        required: true,
      })),
    license:
      license ??
      (await select<License>({
        message: 'What license do you want to use?',
        choices: getSupportedLicenses(),
        default: 'unlicensed',
      })),
    tools:
      tools ??
      (await checkbox({
        message: 'What tools do you want to use?',
        choices: getSupportedTools(),
      })),
    scope:
      scope ??
      (await select({
        message: 'What scope do you want to use?',
        choices: getSupportedScopes(),
      })),
    repoName: await input({
      message: 'Enter the workspace repo name (username/project)',
      default: null,
    }),
  };
}

/**
 * Prompt the user for the project configuration.
 * @param projectName - The project name.
 * @param templateName - The template name.
 * @param workspace - The workspace configuration.
 * @returns The project configuration.
 */
async function projectPrompt(projectProps: Partial<ProjectProps>, workspace: WorkspaceProps) {
  const { name, description } = projectProps;
  return {
    name:
      name ??
      (await input({
        message: 'What is the project name?',
        required: true,
        validate: validateKebabCaseName,
      })),
    description:
      description ??
      (await input({
        message: 'What is the project description?',
        required: true,
      })),
    template: await select({
      message: 'What template do you want to use?',
      choices: (await loadTemplates()).map((template) => ({
        name: `${template.language} - ${template.description}`,
        value: template,
      })),
    }),
    dest: await select({
      message: 'Where do you want to place the project?',
      choices: getWorkspaceDirs(workspace).map((dir) => ({
        name: dir,
        value: dir,
      })),
    }),
  };
}

export { workspacePrompt, projectPrompt, loadTemplates };
