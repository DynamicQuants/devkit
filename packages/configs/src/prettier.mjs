/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  useTabs: false,

  // Sort imports using trivago/prettier-plugin-sort-imports.
  // Ref: https://github.com/trivago/prettier-plugin-sort-imports
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-multiline-arrays',
  ],
  importOrder: ['^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  // To avoid the error: SyntaxError: This experimental syntax requires enabling one of the
  // following parser plugin(s): "decorators", "decorators-legacy".
  // Ref: https://github.com/trivago/prettier-plugin-sort-imports/issues/120#issuecomment-1873414061
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    'classProperties',
    // To avoid the error: "SyntaxError: Decorators cannot be used to decorate parameters".
    'decorators-legacy',
  ],
};

export default config;
