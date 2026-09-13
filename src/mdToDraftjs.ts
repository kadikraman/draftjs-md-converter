import { parse } from '@textlint/markdown-to-ast';
import type {
  InlineStyleMapping,
  MdToDraftjsOptions,
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftEntity,
  RawDraftEntityRange,
  RawDraftInlineStyleRange,
} from './types';

/** The subset of the textlint AST that this converter reads. */
interface AstNode {
  type: string;
  raw: string;
  value?: string;
  children?: readonly AstNode[];
  url?: string;
  alt?: string | null;
  ordered?: boolean | null;
  depth?: number;
  lang?: string | null;
}

const defaultInlineStyles: Record<string, InlineStyleMapping> = {
  Strong: { type: 'BOLD' },
  Emphasis: { type: 'ITALIC' },
};

const defaultBlockStyles: Record<string, string> = {
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

// Draft.js counts offsets and lengths in Unicode code points, not UTF-16 units
const codePointLength = (value: string): number => Array.from(value).length;

// RegEx: [[ embed url=<anything> ]]
const videoShortcodeRegEx = /^\[\[\s(?:embed)\s(?:url=(\S+))\s\]\]/;

const getBlockStyleForMd = (
  node: AstNode,
  blockStyles: Record<string, string>,
): string | undefined => {
  const style = node.type;
  const ordered = node.ordered;
  const depth = node.depth;
  if (style === 'List' && ordered) {
    return 'ordered-list-item';
  }
  if (style === 'Header') {
    return blockStyles[`${style}${depth}`];
  }
  if (node.type === 'Paragraph' && node.children?.[0]?.type === 'Image') {
    return 'atomic';
  }
  if (node.type === 'Paragraph' && /^\[\[\s\S+\s.*\S+\s\]\]/.test(node.raw)) {
    return 'atomic';
  }
  return blockStyles[style];
};

const isOpeningFence = (line: string): boolean => line.startsWith('```');
const isClosingFence = (line: string): boolean => /^```\s*$/.test(line);

const joinCodeBlocks = (lines: string[]): string[] => {
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isOpeningFence(line)) {
      const closing = lines.findIndex((candidate, j) => j > i && isClosingFence(candidate));
      if (closing >= 0) {
        result.push(lines.slice(i, closing + 1).join('\n'));
        i = closing;
        continue;
      }
    }
    result.push(line);
  }
  return result;
};

const splitMdBlocks = (md: string): string[] => {
  const splitMd = md.split('\n');

  // keep fenced code blocks together as one block
  const splitMdWithCodeBlocks = joinCodeBlocks(splitMd);
  return splitMdWithCodeBlocks;
};

interface ParsedLine {
  text: string;
  inlineStyleRanges: RawDraftInlineStyleRange[];
  entityRanges: RawDraftEntityRange[];
  blockStyle: string;
  entityMap: Record<string, RawDraftEntity>;
  data?: Record<string, unknown>;
}

const parseMdLine = (
  line: string,
  existingEntities: Record<string, RawDraftEntity>,
  extraStyles: MdToDraftjsOptions = {},
): ParsedLine => {
  const inlineStyles: Partial<Record<string, InlineStyleMapping>> = {
    ...defaultInlineStyles,
    ...extraStyles.inlineStyles,
  };
  const blockStyles: Record<string, string> = { ...defaultBlockStyles, ...extraStyles.blockStyles };

  const astString = parse(line) as AstNode;
  let text = '';
  let textLength = 0;
  const inlineStyleRanges: RawDraftInlineStyleRange[] = [];
  const entityRanges: RawDraftEntityRange[] = [];
  const entityMap = existingEntities;

  const addInlineStyleRange = (offset: number, length: number, style: string): void => {
    inlineStyleRanges.push({ offset, length, style });
  };

  // text length a node adds to the block; images and videos add a one-space placeholder
  const getNodeLength = (node: AstNode): number => {
    if (node.type === 'Image' || videoShortcodeRegEx.test(node.raw)) {
      return 1;
    }
    if (node.value) {
      return codePointLength(node.value);
    }
    if (node.children?.length) {
      return getRawLength(node.children);
    }
    return 0;
  };

  const getRawLength = (children: readonly AstNode[]): number =>
    children.reduce((prev, current) => prev + getNodeLength(current), 0);

  const addLink = (child: AstNode): void => {
    const entityKey = Object.keys(entityMap).length;
    entityMap[entityKey] = {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url: child.url,
      },
    };
    entityRanges.push({
      key: entityKey,
      length: getRawLength(child.children ?? []),
      offset: textLength,
    });
  };

  const addImage = (child: AstNode): void => {
    const entityKey = Object.keys(entityMap).length;
    entityMap[entityKey] = {
      type: 'IMAGE',
      mutability: 'IMMUTABLE',
      data: {
        url: child.url,
        src: child.url,
        fileName: child.alt || '',
      },
    };
    entityRanges.push({
      key: entityKey,
      length: 1,
      offset: textLength,
    });
  };

  const addVideo = (child: AstNode): void => {
    const url = child.raw.match(videoShortcodeRegEx)?.[1];

    const entityKey = Object.keys(entityMap).length;
    entityMap[entityKey] = {
      type: 'draft-js-video-plugin-video',
      mutability: 'IMMUTABLE',
      data: {
        src: url,
      },
    };
    entityRanges.push({
      key: entityKey,
      length: 1,
      offset: textLength,
    });
  };

  const parseChildren = (child: AstNode, style?: InlineStyleMapping): void => {
    switch (child.type) {
      case 'Link':
        addLink(child);
        break;
      case 'Image':
        addImage(child);
        break;
      case 'Paragraph':
        if (videoShortcodeRegEx.test(child.raw)) {
          addVideo(child);
        }
        break;
    }

    const isVideo = videoShortcodeRegEx.test(child.raw);
    if (!isVideo && child.children && style) {
      const rawLength = getRawLength(child.children);
      addInlineStyleRange(textLength, rawLength, style.type);
      const newStyle = inlineStyles[child.type];
      for (const grandChild of child.children) {
        parseChildren(grandChild, newStyle);
      }
    } else if (!isVideo && child.children) {
      const newStyle = inlineStyles[child.type];
      for (const grandChild of child.children) {
        parseChildren(grandChild, newStyle);
      }
    } else {
      const value = child.type === 'Image' || isVideo ? ' ' : (child.value ?? '');
      const valueLength = codePointLength(value);
      if (valueLength > 0) {
        if (style) {
          addInlineStyleRange(textLength, valueLength, style.type);
        }
        const ownStyle = inlineStyles[child.type];
        if (ownStyle) {
          addInlineStyleRange(textLength, valueLength, ownStyle.type);
        }
      }
      text = `${text}${value}`;
      textLength += valueLength;
    }
  };

  for (const child of astString.children ?? []) {
    const style = inlineStyles[child.type];
    parseChildren(child, style);
  }

  let blockStyle = 'unstyled';
  let data: Record<string, unknown> | undefined;
  const firstChild = astString.children?.[0];
  if (firstChild) {
    const style = getBlockStyleForMd(firstChild, blockStyles);
    if (style) {
      blockStyle = style;
    }
    if (firstChild.type === 'CodeBlock' && firstChild.lang) {
      data = { language: firstChild.lang };
    }
  }

  return {
    text,
    inlineStyleRanges,
    entityRanges,
    blockStyle,
    entityMap,
    data,
  };
};

function mdToDraftjs(mdString: string, extraStyles?: MdToDraftjsOptions): RawDraftContentState {
  const paragraphs = splitMdBlocks(mdString);
  const blocks: RawDraftContentBlock[] = [];
  let entityMap: Record<string, RawDraftEntity> = {};

  for (const paragraph of paragraphs) {
    const result = parseMdLine(paragraph, entityMap, extraStyles);
    blocks.push({
      text: result.text,
      type: result.blockStyle,
      depth: 0,
      inlineStyleRanges: result.inlineStyleRanges,
      entityRanges: result.entityRanges,
      ...(result.data ? { data: result.data } : {}),
    });
    entityMap = result.entityMap;
  }

  // placeholder kept for compatibility; Draft.js accepts {} and 2.0 will return that
  if (Object.keys(entityMap).length === 0) {
    entityMap = { data: '', mutability: '', type: '' } as unknown as Record<string, RawDraftEntity>;
  }
  return {
    blocks,
    entityMap,
  };
}

export default mdToDraftjs;
