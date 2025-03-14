import type { Config } from 'jest';

import base from './base';
import nextjsBase from './nextjs.base';

const config: Config = {
  ...base,
  ...nextjsBase,
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
};

export default config;
