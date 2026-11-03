import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Draft.js and fbjs read Node's `global`, which browsers do not have
const browserGlobals = { global: 'globalThis' };

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const gitCommit = (): string => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

export default defineConfig({
  base: './',
  define: {
    ...browserGlobals,
    __CONVERTER_VERSION__: JSON.stringify(version),
    __CONVERTER_COMMIT__: JSON.stringify(process.env.GITHUB_SHA ?? gitCommit()),
  },
  optimizeDeps: { rolldownOptions: { transform: { define: browserGlobals } } },
  plugins: [react()],
  resolve: {
    alias: {
      // the demo runs on the source in this repo, not the published package
      'draftjs-md-converter': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
});
