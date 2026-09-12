import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2020',
  sourcemap: true,
  dts: false,
  clean: true,
});
