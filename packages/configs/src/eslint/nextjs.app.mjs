import { fixupConfigRules } from '@eslint/compat';
import nx from '@nx/eslint-plugin';

import baseConfig from './base.mjs';

/**
 * Create a Next.js configuration using the base configuration and the Next.js
 * core web vitals configuration.
 * @param {import('@eslint/eslintrc').Config} compat
 * @returns {import('@eslint/eslintrc').Config[]}
 */
export default function createNextjsConfig(compat) {
  return [
    ...fixupConfigRules(compat.extends('next')),
    ...fixupConfigRules(compat.extends('next/core-web-vitals')),
    ...baseConfig,
    ...nx.configs['flat/react-typescript'],
    {
      ignores: ['.next/**/*'],
    },
  ];
}
