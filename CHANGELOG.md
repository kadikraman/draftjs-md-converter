# Changelog

## Unreleased

### Breaking changes

- Node.js 22 or later is required. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- The package now has an `exports` map. Import the package root only. The ESM entry is `dist/index.js` and the CommonJS entry is `dist/index.cjs`. The old `dist/index.esm.js` file no longer exists. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- Dependencies are no longer bundled into the published files. `@textlint/markdown-to-ast` is installed as a normal dependency. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- The published code targets ES2020. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- The `symbol` field on `inlineStyles` entries passed to `mdToDraftjs` is removed from the types. It was never read; the Markdown parser decides the syntax. ([#81](https://github.com/kadikraman/draftjs-md-converter/pull/81))

### Added

- `draftjsToMd` accepts a third argument, `{ escape: true }`, which escapes Markdown characters in plain text so that text such as `__not_bold__` or `# not a heading` survives the trip to Markdown and back. Off by default because existing content may already contain literal backslashes. ([#90](https://github.com/kadikraman/draftjs-md-converter/pull/90))

### Changed

- The source is TypeScript. Type declarations are generated from it and shipped for both ESM and CommonJS. They no longer import from `draft-js`, so `@types/draft-js` is not needed. The types `RawDraftContentState`, `RawDraftContentBlock`, `RawDraftEntity`, `MdToDraftjsOptions` and `MarkdownDict` are exported. ([#81](https://github.com/kadikraman/draftjs-md-converter/pull/81))
- Development tooling: pnpm, Vitest, Biome, and tsdown replace Yarn 1, Mocha, Chai, ESLint 3, Prettier 1, and esbuild 0.8. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- CI runs on Node.js 22 and 24 with current GitHub Actions. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- Releases publish to npm from a GitHub release through npm trusted publishing with provenance. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
- `@textlint/markdown-to-ast` updated from 12.0.2 to ^15.8.0. The parser output is unchanged. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))

### Fixed

- Nested lists are supported. `mdToDraftjs` reads the nesting level from the indentation of list items, accepting two, three, or four spaces or a tab per level, and sets the block `depth`. `draftjsToMd` indents nested items by four spaces per level and numbers ordered items per level. Indented list lines used to become code blocks or flat items. ([#89](https://github.com/kadikraman/draftjs-md-converter/pull/89))
- `draftjsToMd` dropped images that sit inside a text block instead of their own atomic block, which is what a pasted image or an inline `![alt](src)` in Markdown produces. Such IMAGE entities are now written as `![alt](src)` in place of their placeholder text. ([#88](https://github.com/kadikraman/draftjs-md-converter/pull/88))
- `draftjsToMd` no longer throws on an atomic block without an entity, or on an entity range whose key is missing from `entityMap`. Such blocks and ranges are written as plain text. Link entities that keep the address in `data.href` instead of `data.url` are written correctly, and a link without an address gets an empty target instead of the word "undefined". ([#87](https://github.com/kadikraman/draftjs-md-converter/pull/87))
- `draftjsToMd` could drop a space or lose a closing symbol when a styled range that ends in a space sat inside another style, for example "this is a test" became "*__this__ is atest*". Styled ranges are now trimmed to the text they wrap before symbols are written, and ranges that cover only whitespace are ignored. ([#86](https://github.com/kadikraman/draftjs-md-converter/pull/86))
- `draftjsToMd` numbered every ordered list in a document as one continuous sequence. A list that starts after another block now starts at 1 again. ([#85](https://github.com/kadikraman/draftjs-md-converter/pull/85))
- `mdToDraftjs` measured offsets and lengths in UTF-16 code units. Draft.js counts Unicode code points, so every style or link after an emoji was shifted by one position per emoji. Offsets are now counted in code points, matching `draftjsToMd`. ([#84](https://github.com/kadikraman/draftjs-md-converter/pull/84))
- Fenced code blocks with a language tag, such as ```js, were split into empty code blocks and plain text. They now become one code block. The language is kept in the block's `data.language` and `draftjsToMd` writes it back onto the opening fence. ([#83](https://github.com/kadikraman/draftjs-md-converter/pull/83))
- Markdown nodes without text, such as a thematic break `---` or a link reference definition, produced the word "undefined" as block text. They now produce an empty block. An image inside an inline style no longer throws. ([#82](https://github.com/kadikraman/draftjs-md-converter/pull/82))
- Source maps no longer point at files that are not in the package. ([#80](https://github.com/kadikraman/draftjs-md-converter/pull/80))
