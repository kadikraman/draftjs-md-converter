[![npm version](https://badge.fury.io/js/draftjs-md-converter.svg)](https://badge.fury.io/js/draftjs-md-converter)

<p align="center"><img src="https://raw.githubusercontent.com/kadikraman/draftjs-md-converter/main/demo/src/logo.svg" width=224></p>
<h2 align="center">Draft.js to Markdown to Draft.js converter</h2>
<p align="center">
<strong>Converts rich text content between Draft.js blocks and Markdown.</strong>
<br><br>

## Reasoning and background

This library exists because I needed a highly customisable rich text editor which posts to an external API in Markdown. [Draft.js](https://facebook.github.io/draft-js/) to the rescue! It provides the editor state but, alas, doesn't ship with any sort of conversion to or from markdown. So, I've written my own.

## Installation

```sh
npm install draftjs-md-converter
```

Node.js 22 or later is required. The package ships an ES module and a CommonJS build, both with type declarations, so `import` and `require` both work. It does not depend on `draft-js`: it reads and returns the raw content state that Draft.js's `convertToRaw` returns and `convertFromRaw` accepts.

Upgrading from 1.x? See [Upgrading to 2.0](#upgrading-to-20) below.

## Usage

```js
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import { draftjsToMd, mdToDraftjs } from 'draftjs-md-converter';

// Markdown to Draft.js
const rawContent = mdToDraftjs('Some __bold__ and *italic* text');
const editorState = EditorState.createWithContent(convertFromRaw(rawContent));

// Draft.js to Markdown
const markdown = draftjsToMd(convertToRaw(editorState.getCurrentContent()));
```

For example, an editor that starts from Markdown and reports Markdown on every change:

```jsx
import { convertFromRaw, convertToRaw, Editor, EditorState } from 'draft-js';
import { useState } from 'react';
import { draftjsToMd, mdToDraftjs } from 'draftjs-md-converter';

function MarkdownEditor({ defaultValue, onChange }) {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(convertFromRaw(mdToDraftjs(defaultValue))),
  );

  const handleChange = (nextEditorState) => {
    setEditorState(nextEditorState);
    onChange(draftjsToMd(convertToRaw(nextEditorState.getCurrentContent())));
  };

  return <Editor editorState={editorState} onChange={handleChange} />;
}
```

## One block, one line

Each Draft.js block is one line of Markdown. `draftjsToMd` joins blocks with a single newline, and `mdToDraftjs` makes a block from every line. An empty block is an empty line, so `'one\n\ntwo'` becomes three blocks: `one`, an empty block, and `two`. The only exception is a fenced code block, which is one block with the newlines inside it.

This is not how standard Markdown treats paragraphs. There, a single newline continues the paragraph and a blank line starts a new one. Apps already store content in this line-based format, so it stays as it is.

## Supported Markdown

| Markdown                                 | Draft.js                                                  |
| ---------------------------------------- | --------------------------------------------------------- |
| `__bold__` or `**bold**`                 | `BOLD` inline style                                       |
| `*italic*` or `_italic_`                 | `ITALIC` inline style                                     |
| `~~strikethrough~~`                      | `STRIKETHROUGH` inline style                              |
| `` `inline code` ``                      | `CODE` inline style                                       |
| `[text](https://example.com)`            | `LINK` entity                                             |
| `![alt text](https://example.com/a.png)` | `IMAGE` entity                                            |
| `# Heading` to `###### Heading`          | `header-one` to `header-six` blocks                       |
| `- item`                                 | `unordered-list-item` block                               |
| `1. item`                                | `ordered-list-item` block                                 |
| `> quote`                                | `blockquote` block                                        |
| A fenced code block                      | `code-block` block                                        |
| `[[ embed url=https://example.com ]]`    | `draft-js-video-plugin-video` entity in an `atomic` block |

`draftjsToMd` writes bold as `__bold__` and italic as `*italic*`. To change this, pass a [custom dictionary](#custom-markdown-symbols). Inline styles that are not in the dictionary, such as `UNDERLINE`, are written as plain text.

### Links

`mdToDraftjs` keeps the address in `data.url`. `draftjsToMd` reads `data.url`, or `data.href` when there is no `data.url`.

### Images

`mdToDraftjs` gives each image an `IMAGE` entity with this data:

```js
{
  url: 'https://example.com/a.png',
  src: 'https://example.com/a.png',
  fileName: 'alt text',
  alt: 'alt text',
}
```

A line that holds only an image becomes an `atomic` block, the block type Draft.js uses for media. An image with text before or after it stays inline in a text block. `draftjsToMd` writes images from both kinds of block. It takes the alt text from `data.alt`, or `data.fileName` when there is no `data.alt`, and the address from `data.url`, or `data.src` when there is no `data.url`.

### Lists

Nested list items use the block `depth`. `mdToDraftjs` reads the nesting from the indentation: two, three or four spaces, or a tab, per level. `draftjsToMd` indents nested items by four spaces per level. Ordered items are numbered per level, and a list that starts after another block starts again at 1.

### Code blocks

A fenced code block becomes one `code-block` block. Its text keeps the newlines, and the language tag, such as `js` in ` ```js `, is kept in the block's `data.language`. `draftjsToMd` writes the language back onto the opening fence.

### Videos

A line with the shortcode `[[ embed url=https://example.com ]]` becomes an `atomic` block with a `draft-js-video-plugin-video` entity, for use with draft-js-video-plugin. The address is in `data.src`. To parse the shortcode in other Markdown tools, use remark-shortcodes.

## API

### `mdToDraftjs(markdown, options?)`

```ts
function mdToDraftjs(markdown: string, options?: MdToDraftjsOptions): RawDraftContentState;
```

Converts Markdown to a raw content state. Pass the result to Draft.js's `convertFromRaw`. When the Markdown has no links, images or videos, `entityMap` is `{}`. Throws a `TypeError` when `markdown` is not a string.

`options.inlineStyles` and `options.blockStyles` extend or override the defaults. Their keys are [textlint AST node types](https://github.com/textlint/textlint/blob/master/docs/txtnode.md), so the Markdown parser decides which syntax gives each type. The defaults are:

```js
const inlineStyles = {
  Strong: { type: 'BOLD' },
  Emphasis: { type: 'ITALIC' },
  Delete: { type: 'STRIKETHROUGH' },
  Code: { type: 'CODE' },
};

const blockStyles = {
  List: 'unordered-list-item',
  Header1: 'header-one',
  Header2: 'header-two',
  Header3: 'header-three',
  Header4: 'header-four',
  Header5: 'header-five',
  Header6: 'header-six',
  CodeBlock: 'code-block',
  BlockQuote: 'blockquote',
};
```

For example, to give bold text your own inline style and turn a `---` line into a custom block type:

```js
const rawContent = mdToDraftjs(markdown, {
  inlineStyles: { Strong: { type: 'MY_BOLD' } },
  blockStyles: { HorizontalRule: 'horizontal-rule' },
});
```

### `draftjsToMd(rawContent, markdownDict?, options?)`

```ts
function draftjsToMd(
  rawContent: RawDraftContentState,
  markdownDict?: MarkdownDict,
  options?: DraftjsToMdOptions,
): string;
```

Converts a raw content state from Draft.js's `convertToRaw` to Markdown. Throws a `TypeError` when `rawContent` has no `blocks` array. A missing `entityMap`, `depth`, `inlineStyleRanges` or `entityRanges` counts as empty.

#### Custom Markdown symbols

`markdownDict` maps Draft.js inline styles to the Markdown symbols that wrap them. It extends or overrides the default dictionary:

```js
const markdownDict = {
  BOLD: '__',
  ITALIC: '*',
  STRIKETHROUGH: '~~',
  CODE: '`',
};
```

For example, to write bold with asterisks:

```js
const markdown = draftjsToMd(rawContent, { BOLD: '**' });
```

To write a style as plain text, set its symbol to an empty string, for example `{ CODE: '' }`. Block styles cannot be changed.

#### Escaping Markdown characters

By default, text is written as it is, so a paragraph containing `*` or `_` may be read back as styled text. Pass `{ escape: true }` as the third argument to escape such characters:

```js
const markdown = draftjsToMd(rawContent, undefined, { escape: true });
// 'Use *stars*' becomes 'Use \*stars\*'
```

Inline characters (`\`, `` ` ``, `*`, `_`, `[`, `]`, `<`, `~`) are escaped anywhere in the text. Heading, quote, list and rule markers are escaped only at the start of a block. Code blocks and inline code are never escaped.

## TypeScript

Type declarations ship with the package. The exported types are `RawDraftContentState`, `RawDraftContentBlock`, `RawDraftEntity`, `RawDraftEntityRange`, `RawDraftInlineStyleRange`, `DraftEntityMutability`, `MdToDraftjsOptions`, `InlineStyleMapping`, `MarkdownDict` and `DraftjsToMdOptions`.

`mdToDraftjs` leaves block keys for Draft.js to generate, but the types in `@types/draft-js` require a `key` on every block. When you use those types, assert the type before `convertFromRaw`:

```ts
import { convertFromRaw, type RawDraftContentState } from 'draft-js';

const contentState = convertFromRaw(mdToDraftjs(markdown) as RawDraftContentState);
```

## Upgrading to 2.0

2.0 has breaking changes. The [changelog](https://github.com/kadikraman/draftjs-md-converter/blob/main/CHANGELOG.md) lists every change.

- Node.js 22 or later is required, and the code targets ES2020.
- The package has an `exports` map. Import from `draftjs-md-converter` only. Paths inside the package, such as `draftjs-md-converter/dist/index.esm.js`, no longer work.
- `@textlint/markdown-to-ast` is a normal dependency and is no longer bundled.
- `mdToDraftjs` returns `entityMap: {}` when there are no entities, instead of a placeholder entity.
- Inline code and strikethrough convert by default in both directions. To get the 1.x output from `draftjsToMd`, pass `{ CODE: '', STRIKETHROUGH: '' }`.
- The `symbol` field of `inlineStyles` entries is gone from the types. It was never read.
- Image entities have `data.alt` next to `data.fileName`.
- A line that starts with an image and has more after it becomes a text block with the image inline, instead of an `atomic` block.

## Development

This project uses [pnpm](https://pnpm.io). Node.js 22 or later is required.

```sh
pnpm install
pnpm test          # run the tests once
pnpm test:watch    # run the tests in watch mode
pnpm lint          # check formatting and lint rules with Biome
pnpm lint:fix      # fix formatting and lint problems
pnpm typecheck     # type-check the source and tests
pnpm build         # build dist/ with tsdown
```
