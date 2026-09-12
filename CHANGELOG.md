# Changelog

## Unreleased

### Breaking changes

- Node.js 22 or later is required.
- The package now has an `exports` map. Import the package root only. The ESM entry is `dist/index.js` and the CommonJS entry is `dist/index.cjs`. The old `dist/index.esm.js` file no longer exists.
- Dependencies are no longer bundled into the published files. `@textlint/markdown-to-ast` is installed as a normal dependency.
- The published code targets ES2020.

### Changed

- Development tooling: pnpm, Vitest, Biome, and tsdown replace Yarn 1, Mocha, Chai, ESLint 3, Prettier 1, and esbuild 0.8.
- CI runs on Node.js 22 and 24 with current GitHub Actions.
- Releases publish to npm from a GitHub release through npm trusted publishing with provenance.
- `@textlint/markdown-to-ast` updated from 12.0.2 to ^15.8.0. The parser output is unchanged.

### Fixed

- Source maps no longer point at files that are not in the package (#78).
