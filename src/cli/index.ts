import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

import { loadTemplates } from './prompts';
import type { TemplateProps, WorkspaceProps } from './types';
import { Workspace } from './workspace';

/**
 * Creates a new workspace for the selected type.
 */
async function create(args: Partial<WorkspaceProps>) {
  const workspace = await Workspace.create(args);
  await workspace.setup();
}

type TemplateCommandOptions = Partial<TemplateProps> & {
  list: boolean;
};

async function template(args: TemplateCommandOptions) {
  if (args.list) {
    const templates = await loadTemplates();
    console.log(templates);
    return;
  }

  const workspace = await Workspace.load();
  await workspace.addProject(args);
}

async function test() {
  const id = Date.now();
  const workspace = new Workspace({
    scope: 'system-monorepo',
    name: `test-workspace-${id}`,
    description: 'Some description',
    languages: ['node', 'python'],
    tools: ['act', 'changeset', 'commitlint', 'verdaccio'],
    license: 'mit',
    repoName: `@ccosming/test-workspace-${id}`,
    rootPath: '/Users/ccosming/Temp/devkit-test',
  });
  await workspace.setup();
}

/**
 * Main function for the CLI.
 */
function main() {
  const packageJSON = JSON.parse(readFileSync(join(__dirname, '../..', 'package.json'), 'utf8'));
  program.version(packageJSON.version).description('Dynamic Quants DevKit CLI');
  program
    .command('create')
    .option('-n, --name <name>', 'The name of the workspace')
    .option('-d, --description <description>', 'The description of the workspace')
    .description('Create a new workspace with the selected configuration')
    .action(create);
  program
    .command('template')
    .option('-l, --list', 'List all available templates')
    .description('Add a new project to the workspace based on a template')
    .action(template);
  program.command('test').description('Test the workspace').action(test);
  program.parse(process.argv);
}

main();
