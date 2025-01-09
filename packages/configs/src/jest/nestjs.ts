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
  moduleFileExtensions: ['ts', 'js', 'html'],

  // This files commonly have no meaningful coverage.
  coveragePathIgnorePatterns: ['index.ts', 'main.ts', '.*.module.ts'],
};

export default config;
