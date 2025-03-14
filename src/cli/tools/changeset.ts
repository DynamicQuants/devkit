import { join } from 'path';

import { Tool, copyFiles, setFileData } from '../common';
import { NodeLanguage } from '../languages';
import type { Workspace } from '../workspace';

// Constants.
const TOOL_NAME = 'changeset';
const TOOL_DESCRIPTION = 'Changeset is a tool for managing your project versioning';
const CHANGESET_VERSION = '~2.28.1';
const CHANGELOG_GITHUB_VERSION = '~0.5.1';

// Presets files.
const CHANGESET_CONFIG_FILE = join(__dirname, 'presets', TOOL_NAME, 'config.json');

/**
 * Tool implementation for the Changeset.
 * More info: https://github.com/changesets/changesets
 */
class ChangesetTool extends Tool {
  static readonly toolName = TOOL_NAME;
  readonly name = TOOL_NAME;
  readonly description = TOOL_DESCRIPTION;

  async install(workspace: Workspace) {
    const { repoName } = workspace.config;

    // Add dependencies to the project.
    await NodeLanguage.addDependency([
      { name: '@changesets/cli', version: CHANGESET_VERSION, dev: true },
      { name: '@changesets/changelog-github', version: CHANGELOG_GITHUB_VERSION, dev: true },
    ]);

    // Copy base config file.
    copyFiles([{ file: CHANGESET_CONFIG_FILE }], join(process.cwd(), '.changeset'));

    // Add repo name to the config file.
    setFileData(
      join(process.cwd(), '.changeset', 'config.json'),
      { changelog: [{ repo: repoName }] },
      'merge',
    );
  }
}

export { ChangesetTool };
