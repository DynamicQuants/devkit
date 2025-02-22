import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/eslint.ts',
    'src/jest.ts',
    'src/playwright.ts',
    'src/prettier.mjs',
    'src/tailwind.ts',
    'src/vite.ts',
  ],
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  tsconfig: './tsconfig.json',
  shims: true,
  onSuccess: 'pnpm run cp',
  treeshake: true,
  outDir: 'dist/src',
});
