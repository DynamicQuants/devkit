import type { supportedLanguages } from './languages';
import type { optionalTools } from './tools';

type Language = keyof typeof supportedLanguages;

type OptionalTool = keyof typeof optionalTools;

/**
 * Properties that are used related to a workspace.
 */
type WorkspaceProps = {
  scope: Scope;
  name: string;
  description: string;
  languages: Language[];
  tools: OptionalTool[];
  license: License;
  repoName: string | null;
  rootPath?: string;
};

/**
 * Represents the project properties.
 */
type ProjectProps = {
  name: string;
  description: string;
};

/**
 * Represents the template information.
 */
type TemplateProps = {
  name: string;
  description: string;
  language: Language;
  path: string;
};

/**
 * List of scopes that can be used for the workspace.
 */
const scopes = {
  'lib-or-app': 'Single Library or Application project',
  'lib-monorepo': 'Library Monorepo with multiple packages',
  'system-monorepo': 'System Monorepo with packages, libs and apps',
};

type Scope = keyof typeof scopes;

/**
 * List of licenses that can be used for the workspace or a specific project.
 */
const licenses = {
  mit: 'MIT License: Permits free use, modification, and distribution.',
  apache: 'Apache License: Allows free use, modification, and distribution.',
  gpl: 'GPL License: Ensures software freedom, including source code access.',
  gpl_3: 'GPL-3.0 License: Strongest copyleft license, ensuring software freedom.',
  gpl_2: 'GPL-2.0 License: Ensures software freedom, with some restrictions.',
  bsd: 'BSD License: Allows free use, modification, and distribution with minimal restrictions.',
  bsd_2: 'BSD-2-Clause License: Simplified BSD License with two clauses.',
  bsd_3: 'BSD-3-Clause License: New BSD License with three clauses.',
  unlicensed: 'Unlicensed: No license can be used with no restrictions.',
};

/**
 * Represents the license of the workspace.
 */
type License = keyof typeof licenses;

export { licenses, scopes };
export type { License, Scope, Language, WorkspaceProps, ProjectProps, TemplateProps, OptionalTool };
