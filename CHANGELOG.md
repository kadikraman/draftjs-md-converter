# Changelog

## Unreleased

### Breaking changes

- Node.js 22 or later is required.
- The package now has an `exports` map. Import the package root only. The ESM entry is `dist/index.js` and the CommonJS entry is `dist/index.cjs`. The old `dist/index.esm.js` file no longer exists.
- Dependencies are no longer bundled into the published files. `@textlint/markdown-to-ast` is installed as a normal dependency.
- The published code targets ES2020.
- The `symbol` field on `inlineStyles` entries passed to `mdToDraftjs` is removed from the types. It was never read; the Markdown parser decides the syntax.

### Changed

- The source is TypeScript. Type declarations are generated from it and shipped for both ESM and CommonJS. They no longer import from `draft-js`, so `@types/draft-js` is not needed. The types `RawDraftContentState`, `RawDraftContentBlock`, `RawDraftEntity`, `MdToDraftjsOptions` and `MarkdownDict` are exported.
- Development tooling: pnpm, Vitest, Biome, and tsdown replace Yarn 1, Mocha, Chai, ESLint 3, Prettier 1, and esbuild 0.8.
- CI runs on Node.js 22 and 24 with current GitHub Actions.
- Releases publish to npm from a GitHub release through npm trusted publishing with provenance.
- `@textlint/markdown-to-ast` updated from 12.0.2 to ^15.8.0. The parser output is unchanged.

### Fixed

- `draftjsToMd` could drop a space or lose a closing symbol when a styled range that ends in a space sat inside another style, for example "this is a test" became "*__this__ is atest*". Styled ranges are now trimmed to the text they wrap before symbols are written, and ranges that cover only whitespace are ignored (#52).
- `draftjsToMd` numbered every ordered list in a document as one continuous sequence. A list that starts after another block now starts at 1 again (#74).
- `mdToDraftjs` measured offsets and lengths in UTF-16 code units. Draft.js counts Unicode code points, so every style or link after an emoji was shifted by one position per emoji. Offsets are now counted in code points, matching `draftjsToMd`.
- Fenced code blocks with a language tag, such as ```js, were split into empty code blocks and plain text. They now become one code block. The language is kept in the block's `data.language` and `draftjsToMd` writes it back onto the opening fence.
- Markdown nodes without text, such as a thematic break `---` or a link reference definition, produced the word "undefined" as block text. They now produce an empty block. An image inside an inline style no longer throws (#79).
- Source maps no longer point at files that are not in the package (#78).
