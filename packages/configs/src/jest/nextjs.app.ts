import type { Config } from 'jest';
import nextJest from 'next/jest';
import path from 'node:path';

import base from './base';
import nextjsBase from './nextjs.base';

// For more information about the config options, see:
// https://nextjs.org/docs/app/building-your-application/testing/jest
const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  ...base,
  ...nextjsBase,
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
};

export default createJestConfig(config) as Config;
