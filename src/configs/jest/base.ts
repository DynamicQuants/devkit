import nxPreset from '@nx/jest/preset';
import type { Config } from 'jest';

const base: Config = {
  // Ref: https://github.com/nrwl/nx/blob/master/packages/jest/preset/jest-preset.ts
  ...nxPreset,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'html'],
  watchman: false,
};

export default base;
