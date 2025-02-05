import { program } from 'commander';
import { join } from 'path';

import logger from './logger';
import promps from './promps';
import { Tools } from './toolchain';
import { Workspace, WorkspaceScope } from './workspace';

/**
 * Create command.
 * Creates a new workspace for the selected type.
 */
async function create() {
  const name = await promps.namePrompt();
  const description = await promps.descriptionPrompt();
  const scope = await promps.workspaceScopePrompt();
  const repoName = await promps.repoNamePrompt();
  const tools = await promps.toolsPrompt();

  const workspace = new Workspace({
    scope,
    name,
    description,
    tools,
    repoName,
  });

  await workspace.create();
}

function main() {
  const packageJSON = join(__dirname, '..', 'package.json');
  const packageJson = require(packageJSON);
  program.version(packageJson.version).description('Dynamic Quants DevKit CLI');
  program.command('create').description('Create a new workspace').action(create);
  program.parse(process.argv);
}

async function main2() {
  logger.logo();
  const workspace = new Workspace({
    scope: WorkspaceScope.SYSTEM_MONOREPO,
    name: `test-workspace-${Date.now()}`,
    description: 'Some description',
    tools: [
      Tools.NODEJS,
      Tools.PYTHON,
      Tools.ACT,
      Tools.VERDACCIO,
      Tools.CHANGESETS,
      Tools.COMMITLINT,
    ],
    repoName: `@ccosming/test-workspace-${Date.now()}`,
    path: '/Users/ccosming/Temp/devkit-test',
  });
  await workspace.create();
}

main2();
