import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

import logger from './logger';
import promps from './promps';
import { Template } from './template';
import { Language, Scope, Tools } from './types';
import { Workspace } from './workspace';

/**
 * Creates a new workspace for the selected type.
 */
async function create() {
  const name = await promps.namePrompt('workspace');
  const description = await promps.descriptionPrompt('workspace');
  const languages = await promps.workspaceLanguagesPrompt();
  const scope = await promps.workspaceScopePrompt();
  const repoName = await promps.repoNamePrompt();
  const tools = await promps.toolsPrompt();

  const workspace = new Workspace({
    scope,
    name,
    description,
    languages,
    tools,
    repoName,
  });

  await workspace.create();
  logger.stop();
}

async function template() {
  // Load workspace and check if it is valid.
  const workspace = await Workspace.load();

  // Get the template name and description.
  const name = await promps.namePrompt('project');
  const description = await promps.descriptionPrompt('project');
  const tmpl = await promps.templatePrompt(workspace.config.languages, workspace.config.scope);

  const template = new Template({
    name,
    description,
    template: tmpl,
    workspace,
  });

  await template.setup();
}

async function test() {
  const workspace = new Workspace(
    {
      scope: Scope.SYSTEM_MONOREPO,
      name: `test-workspace-${Date.now()}`,
      description: 'Some description',
      languages: [Language.NODEJS, Language.PYTHON],
      tools: [Tools.ACT, Tools.VERDACCIO, Tools.CHANGESETS, Tools.COMMITLINT],
      repoName: `@ccosming/test-workspace-${Date.now()}`,
    },
    '/Users/ccosming/Temp/devkit-test',
  );
  await workspace.create();
}

function main() {
  logger.logo();

  const packageJSON = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
  program.version(packageJSON.version).description('Dynamic Quants DevKit CLI');
  program
    .command('create')
    .description('Create a new workspace with the selected configuration')
    .action(create);
  program
    .command('template')
    .description('Add a new project to the workspace based on a template')
    .action(template);
  program.command('test').description('Test the workspace').action(test);
  program.parse(process.argv);
}

main();
