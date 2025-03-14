import { join } from 'path';

function makePath(path: string, file: string) {
  return join(__dirname, '../..', 'presets', path, file);
}

/**
 * Presets for the changeset configuration.
 */
const changeSet = {
  CONFIG_FILE: makePath('changeset', 'config.json'),
};

/**
 * Presets for the commitlint configuration.
 */
const commitlint = {
  CONFIG_FILE: makePath('commitlint', 'commitlint.config.ts'),
};

/**
 * Presets for the git configuration.
 */
const git = {
  BASE_CONFIG: makePath('git', 'base'),
  GITIGNORE_NODE: makePath('git', 'gitignore-node'),
  GITIGNORE_PYTHON: makePath('git', 'gitignore-python'),
};

/**
 * Presets for the moon configuration.
 */
const moon = {
  TOOLCHAIN_CONFIG: makePath('moon', 'toolchain.yml'),
  WORKSPACE_CONFIG: makePath('moon', 'workspace.yml'),
  TOOLCHAIN_NODE: makePath('moon', 'toolchain-node.yml'),
  TOOLCHAIN_PYTHON: makePath('moon', 'toolchain-python.yml'),
};

/**
 * Presets for the verdaccio configuration.
 */
const verdaccio = {
  CONFIG_FILE: makePath('verdaccio', 'config.yml'),
  DOCKER_SERVICE: makePath('verdaccio', 'docker-service.yml'),
};

export const presets = { changeSet, commitlint, git, moon, verdaccio };
