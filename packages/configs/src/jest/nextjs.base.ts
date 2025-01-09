import type { Config } from 'jest';
import path from 'node:path';

const config: Config = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['index.ts$', 'server.ts$', 'layout.tsx$', '.*stories.tsx'],
  snapshotResolver: path.resolve(__dirname, './snapshotResolver.js'),
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
};

export default config;
