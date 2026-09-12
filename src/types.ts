/**
 * Raw Draft.js content state, as produced by `convertToRaw` and accepted by
 * `convertFromRaw`. Declared here so this package does not depend on `draft-js`.
 */

export type DraftEntityMutability = 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED';

export interface RawDraftInlineStyleRange {
  offset: number;
  length: number;
  style: string;
}

export interface RawDraftEntityRange {
  offset: number;
  length: number;
  key: number;
}

export interface RawDraftEntity {
  type: string;
  mutability: DraftEntityMutability;
  data: Record<string, unknown>;
}

export interface RawDraftContentBlock {
  key?: string;
  type: string;
  text: string;
  depth: number;
  inlineStyleRanges: RawDraftInlineStyleRange[];
  entityRanges: RawDraftEntityRange[];
  data?: Record<string, unknown>;
}

export interface RawDraftContentState {
  blocks: RawDraftContentBlock[];
  entityMap: Record<string, RawDraftEntity>;
}

/**
 * Maps a Draft.js inline style name to the Markdown symbol that wraps it,
 * for example `{ BOLD: '__', ITALIC: '*' }`.
 */
export type MarkdownDict = Record<string, string>;

/** The Draft.js inline style to apply for a Markdown AST node type. */
export interface InlineStyleMapping {
  type: string;
}

export interface MdToDraftjsOptions {
  /**
   * Keyed by textlint AST node type, for example `Strong`, `Emphasis`, `Delete` or `Code`.
   * The Markdown parser decides which syntax produces each node type.
   */
  inlineStyles?: Record<string, InlineStyleMapping>;
  /**
   * Keyed by textlint AST node type, for example `Header1` to `Header6`, `List`,
   * `CodeBlock` or `BlockQuote`. Values are Draft.js block types.
   */
  blockStyles?: Record<string, string>;
}
