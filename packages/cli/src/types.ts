/**
 * Represents the scope of the workspace.
 */
export const Scope = {
  // LIB_OR_APP: 'Single Library or Application project',
  // LIB_MONOREPO: 'Library Monorepo with multiple packages',
  // SYSTEM_MONOREPO: 'System Monorepo with packages, libs and apps',
  LIB_OR_APP: 'lib-or-app',
  LIB_MONOREPO: 'lib-monorepo',
  SYSTEM_MONOREPO: 'system-monorepo',
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

export const Language = {
  NODEJS: 'node',
  PYTHON: 'python',
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export interface TemplateInfo {
  name: string;
  description: string;
  language: Language;
  scope: Scope[];
  path: string;
}

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
