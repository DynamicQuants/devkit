import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['esm', 'cjs'],
  dts: false,
  tsconfig: 'tsconfig.app.json',
  shims: true,
  onSuccess: 'pnpm run copy',
  treeshake: true,
  outDir: 'dist/src',
});
