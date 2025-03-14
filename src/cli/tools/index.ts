import chalk from 'chalk';

import { type RequiredTool, type Tool, logger } from '../common';
import { type Workspace } from '../workspace';
import { ActTool } from './act';
import { ChangesetTool } from './changeset';
import { CommitlintTool } from './commitlint';
import { DockerTool } from './docker';
import { GitTool } from './git';
import { MoonTool } from './moon';
import { ProtoTool } from './proto';
import { VerdaccioTool } from './verdaccio';

const requiredTools: Record<string, RequiredTool> = {
  [GitTool.toolName]: new GitTool(),
  [DockerTool.toolName]: new DockerTool(),
};

const mandatoryTools: Record<string, Tool> = {
  [MoonTool.toolName]: new MoonTool(),
  [ProtoTool.toolName]: new ProtoTool(),
};

const optionalTools = {
  [ActTool.toolName]: new ActTool(),
  [ChangesetTool.toolName]: new ChangesetTool(),
  [CommitlintTool.toolName]: new CommitlintTool(),
  [VerdaccioTool.toolName]: new VerdaccioTool(),
};

function joinNames(tools: any | string[]) {
  return chalk.yellow(
    Array.isArray(tools) ? tools.map((i) => i.name).join(', ') : Object.values(tools).join(', '),
  );
}

/**
 * Check the required tools. If any of them is not installed, it will throw a `FatalError`.
 */
async function checkRequiredTools(workspace: Workspace) {
  const reqTools = Object.values(requiredTools);
  logger.start('Checking required tools');
  await Promise.all(reqTools.map(async (tool) => await tool.checkAndSetup(workspace)));
  logger.success(`Required tools checked successfully: ${joinNames(reqTools)}`);
}

/**
 * Install the mandatory tools. If any of them is not installed, it will throw a `FatalError`.
 */
async function installMandatoryTools() {
  const tools = Object.values(mandatoryTools);
  logger.start('Installing mandatory tools');
  await Promise.all(
    tools.map(async (tool) => {
      logger.setContext(tool.name);
      await tool.install();
    }),
  );
  logger.success(`Mandatory tools installed: ${joinNames(tools)}`);
}

/**
 * Install the selected tools.
 */
async function installOptionalTools(workspace: Workspace) {
  const { tools } = workspace.config;
  const toolsInstances = tools.map((tool) => optionalTools[tool]);
  logger.start('Installing selected tools');
  for (const tool of toolsInstances) {
    logger.setContext(tool.name);
    await tool.install(workspace);
  }
  logger.success(`Selected tools installed: ${chalk.yellow(tools.join(', '))}`);
}

export {
  GitTool,
  DockerTool,
  MoonTool,
  ProtoTool,
  ActTool,
  ChangesetTool,
  CommitlintTool,
  VerdaccioTool,
  checkRequiredTools,
  installMandatoryTools,
  installOptionalTools,
  optionalTools,
};
