# AGENTS.md

Guidance for AI coding agents working in this repository. Humans are welcome to read it too.

## What this project is

`draftjs-md-converter` converts between the Draft.js raw content state and Markdown. It exposes two functions:

- `mdToDraftjs(markdown, extraStyles?)` returns a raw content state for Draft.js `convertFromRaw`.
- `draftjsToMd(raw, extraMarkdownDict?)` takes the output of Draft.js `convertToRaw` and returns a Markdown string.

Draft.js itself is archived. People who use this package maintain existing apps, so stability of the output format and the public API matters more than new features.

## Layout

- `src/`: library source as ES modules. `index.js` re-exports the two converters.
- `test/`: Vitest tests, one file per converter. These are the regression baseline.
- `index.d.ts`: hand-written type declarations, published as the package types.
- `demo/`: a separate Create React App demo site. It is not part of the pnpm install and Biome skips it. Leave it alone unless the task is about the demo.
- `dist/`: build output. Git-ignored, published to npm.

## Commands

Node.js 22 or later. The pnpm version is pinned in the `packageManager` field of `package.json`.

```sh
pnpm install
pnpm test          # run the tests once
pnpm test:watch    # run the tests in watch mode
pnpm lint          # Biome: formatting and lint rules
pnpm lint:fix      # apply Biome fixes
pnpm build         # tsdown: emits dist/index.js (ESM) and dist/index.cjs (CJS)
```

Run `pnpm lint` and `pnpm test` before handing over changes.

## Conventions and gotchas

- One Draft.js block maps to one Markdown line. `draftjsToMd` joins blocks with a single newline and `mdToDraftjs` splits on newlines. This is not CommonMark paragraph semantics, but existing users depend on it. Do not change the output format without an explicit decision from the maintainer and a changelog entry.
- Draft.js measures `inlineStyleRanges` and `entityRanges` offsets in Unicode code points, not UTF-16 code units. Walk text with `Array.from(text)` and count lengths the same way. Plain `.length` breaks on emoji.
- Custom inline styles for `mdToDraftjs` are keyed by textlint AST node type, for example `Strong`, `Emphasis`, `Delete`, `Code`. The parser decides the syntax.
- Every bug fix needs a test in `test/` that fails before the fix. When a bug affects both directions, add a round-trip case as well.
- Dependencies are not bundled into `dist/`. `@textlint/markdown-to-ast` stays a runtime dependency.
- Formatting is Biome's job. Do not hand-format or argue with it.

## Working with the maintainer

- Do not commit, do not open pull requests, and do not post on GitHub issues or pull requests. Leave changes in the working tree for the maintainer to review, test, and commit.
- Never add AI attribution to commit messages or pull request descriptions. No `Co-Authored-By` trailers and no "generated with" lines.
- Add an entry under Unreleased in `CHANGELOG.md` for every user-visible change. Mark breaking changes clearly.
- Keep `readme.md` in sync when the public API or the supported Markdown syntax changes.

## Releasing

1. Bump `version` in `package.json` and move the Unreleased notes in `CHANGELOG.md` under a version heading.
2. Push, then publish a GitHub release whose tag is `v<version>`.
3. `.github/workflows/release.yml` checks that the tag matches `package.json`, runs lint, tests, and build, and publishes to npm with provenance through trusted publishing.
