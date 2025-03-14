import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Options for the viteNextjsLib function.
 */
interface ViteNextjsLibOptions {
  /**
   * The name of the library. For example, `@company/library-name`.
   */
  name: string;

  /**
   * The entry point for the library. For example, `./src/index.ts`.
   */
  entry: string;

  /**
   * The path to the tsconfig file. For example, `tsconfig.build.json`.
   */
  tsConfigFile: string;

  /**
   * The assets to copy. For example, `['*.md']` will copy all markdown files.
   */
  assets?: string[];
}

/**
 * Vite configuration for a Next.js library.
 *
 * @param options - The options for the configuration.
 * @returns The Vite configuration.
 */
function viteNextjsLib({ name, entry, tsConfigFile, assets = [] }: ViteNextjsLibOptions) {
  return defineConfig({
    root: process.cwd(),
    cacheDir: './vite',
    plugins: [
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(assets),
      dts({
        entryRoot: './src',
        tsconfigPath: path.resolve(process.cwd(), tsConfigFile),
      }),
    ],
    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry,
        name,
        fileName: 'index',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: ['react', 'react-dom', 'react/jsx-runtime'],
      },
    },
  });
}

export default viteNextjsLib;
