import { type Workspace } from '../workspace';
import { NotImplementedError, RequiredToolNotFoundError } from './errors';
import { runCommand } from './helpers';

/**
 * Available tools that can be installed and configured by the toolchain.
 */
export const Tools = {
  // NODEJS: 'NodeJS with TypeScript and pnpm',
  // PYTHON: 'Python with uv',
  // ACT: 'Nektos act local github actions runner',
  // VERDACCIO: 'Verdaccio local package registry',
  // CHANGESETS: 'ChangeSets local change management tool',
  // COMMITLINT: 'CommitLint local commit message linter',
  ACT: 'act',
  VERDACCIO: 'verdaccio',
  CHANGESETS: 'changeset',
  COMMITLINT: 'commitlint',
} as const;

export type Tools = (typeof Tools)[keyof typeof Tools];

/**
 * Represents the license of the workspace.
 */
export const License = {
  MIT: 'MIT',
  APACHE_2_0: 'APACHE_2_0',
  GPL_3_0: 'GPL_3_0',
  BSD_3_CLAUSE: 'GPL_3_0',
  ISC: 'ISC',
  UNLICENSED: 'UNLICENSED',
} as const;

export type License = (typeof License)[keyof typeof License];

/**
 * Abstract class to implement a tool configuration.
 */
export abstract class Tool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract install(workspace: Workspace): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public uninstall(_workspace: Workspace): Promise<void> {
    throw new NotImplementedError('uninstall');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_workspace: Workspace): Promise<void> {
    throw new NotImplementedError('update');
  }
}

/**
 * Abstract class to implement a language setup.
 */
export abstract class LanguageSetup {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract setup(workspace: Workspace): Promise<void>;
}

/**
 * Interface to implement a checker.
 */
export abstract class RequiredTool {
  static readonly toolName: string;

  abstract readonly description: string;

  constructor(
    public readonly name: string,
    public readonly command: string,
    public readonly instructions: string,
  ) {}

  async checkAndSetup(workspace: Workspace): Promise<void> {
    const result = await runCommand({
      command: this.command,
      name: `Checking if ${this.name} is installed`,
    });

    if (!result.success) {
      throw new RequiredToolNotFoundError(this.name, this.instructions);
    }

    // Running setup if the tool is installed.
    await this.setup(workspace);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setup(_workspace: Workspace): Promise<void> {
    // By default, we don't need to do anything.
  }
}
