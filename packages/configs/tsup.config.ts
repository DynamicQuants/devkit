import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/commitlint/index.ts',
    'src/eslint/index.ts',
    'src/jest/index.ts',
    'src/vite/index.ts',
    'src/playwright/index.ts',
    'src/prettier/index.ts',
    'src/tailwind/index.ts',
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
  outDir: 'dist',
});
