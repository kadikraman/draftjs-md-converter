const esbuild = require('esbuild');
const pkg = require('./package.json');

const options = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  external: ['path'],
  target: 'es2015'
};
(async () => {
  await esbuild
    .build({ ...options, outfile: pkg.main, format: 'cjs' })
    .catch(() => process.exit(1));

  await esbuild
    .build({ ...options, outfile: pkg.module, format: 'esm' })
    .catch(() => process.exit(1));
})();
