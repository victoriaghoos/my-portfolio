import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Home is lazy-loaded, so without this the browser only requests its chunk after index.js has
 * downloaded and run, and the chunks Home imports only after that. Listing all of them and their
 * CSS in index.html lets the browser fetch everything in parallel with index.js.
 */
const preloadHomeChunk = (): Plugin => ({
  name: 'preload-home-chunk',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return;
      const chunks = Object.values(bundle).filter((c) => c.type === 'chunk');
      const home = chunks.find((c) => c.facadeModuleId?.endsWith('/src/components/Home.tsx'));
      if (!home) return;

      // Home's chunk plus everything it imports, directly or through another chunk
      const byFile = new Map(chunks.map((c) => [c.fileName, c]));
      const needed = new Set<string>();
      const visit = (file: string) => {
        if (needed.has(file)) return;
        needed.add(file);
        byFile.get(file)?.imports.forEach(visit);
      };
      visit(home.fileName);

      const scripts = [...needed];
      const styles = scripts.flatMap((file) => [
        ...(byFile.get(file)?.viteMetadata?.importedCss ?? []),
      ]);
      // index.html already loads what index.js itself imports
      const isNew = (file: string) => !html.includes(`/${file}`);

      return [
        ...scripts.filter(isNew).map((file) => ({
          tag: 'link',
          attrs: { rel: 'modulepreload', crossorigin: true, href: `/${file}` },
          injectTo: 'head' as const,
        })),
        ...styles.filter(isNew).map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'style', href: `/${file}` },
          injectTo: 'head' as const,
        })),
      ];
    },
  },
});

export default defineConfig({
  plugins: [react(), preloadHomeChunk()],
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
});
