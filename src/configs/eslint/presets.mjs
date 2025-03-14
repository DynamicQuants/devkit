import tseslint from 'typescript-eslint';

/**
 * @type {import('@eslint/eslintrc').Config[]}
 */
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-exports': 'error',
  },
});
