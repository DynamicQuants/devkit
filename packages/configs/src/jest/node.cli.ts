import type { Config } from 'jest';

import base from './base';

const config: Config = {
  ...base,
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  moduleFileExtensions: ['ts', 'js'],
  coveragePathIgnorePatterns: ['index.ts'],

  // CLI output almost always contains a lot of noise, so we'll silence it.
  silent: true,
};

export default config;
