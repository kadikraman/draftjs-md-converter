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

const joinCodeBlocks = (splitMd: string[]): string[] => {
  const opening = splitMd.indexOf('```');
  const closing = splitMd.indexOf('```', opening + 1);

  if (opening >= 0 && closing >= 0) {
    const codeBlock = splitMd.slice(opening, closing + 1);
    const codeBlockJoined = codeBlock.join('\n');
    const updatedSplitMarkdown = [
      ...splitMd.slice(0, opening),
      codeBlockJoined,
      ...splitMd.slice(closing + 1),
    ];

    return joinCodeBlocks(updatedSplitMarkdown);
  }

  return splitMd;
};

const splitMdBlocks = (md: string): string[] => {
  const splitMd = md.split('\n');

  // Process the split markdown include the
  // one syntax where there's an block level opening
  // and closing symbol with content in the middle.
  const splitMdWithCodeBlocks = joinCodeBlocks(splitMd);
  return splitMdWithCodeBlocks;
};

interface ParsedLine {
  text: string;
  inlineStyleRanges: RawDraftInlineStyleRange[];
  entityRanges: RawDraftEntityRange[];
  blockStyle: string;
  entityMap: Record<string, RawDraftEntity>;
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
  const inlineStyleRanges: RawDraftInlineStyleRange[] = [];
  const entityRanges: RawDraftEntityRange[] = [];
  const entityMap = existingEntities;

  const addInlineStyleRange = (offset: number, length: number, style: string): void => {
    inlineStyleRanges.push({ offset, length, style });
  };

  const getRawLength = (children: readonly AstNode[]): number =>
    children.reduce((prev, current) => {
      if (current.value) {
        return prev + current.value.length;
      }
      if (current.children?.length) {
        return prev + getRawLength(current.children);
      }
      return prev;
    }, 0);

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
      offset: text.length,
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
      offset: text.length,
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
      offset: text.length,
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
      addInlineStyleRange(text.length, rawLength, style.type);
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
      // `value` is undefined for nodes without text, such as thematic breaks.
      // The text then becomes the string "undefined"; that is a known bug (#79).
      const value = child.value as string;
      if (style) {
        addInlineStyleRange(text.length, value.length, style.type);
      }
      const ownStyle = inlineStyles[child.type];
      if (ownStyle) {
        addInlineStyleRange(text.length, value.length, ownStyle.type);
      }
      text = `${text}${child.type === 'Image' || isVideo ? ' ' : value}`;
    }
  };

  for (const child of astString.children ?? []) {
    const style = inlineStyles[child.type];
    parseChildren(child, style);
  }

  // add block style if it exists
  let blockStyle = 'unstyled';
  const firstChild = astString.children?.[0];
  if (firstChild) {
    const style = getBlockStyleForMd(firstChild, blockStyles);
    if (style) {
      blockStyle = style;
    }
  }

  return {
    text,
    inlineStyleRanges,
    entityRanges,
    blockStyle,
    entityMap,
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
    });
    entityMap = result.entityMap;
  }

  // Draft.js accepts an empty entityMap. This placeholder has been part of the
  // output since 1.0 and is kept for compatibility until the 2.0 release.
  if (Object.keys(entityMap).length === 0) {
    entityMap = { data: '', mutability: '', type: '' } as unknown as Record<string, RawDraftEntity>;
  }
  return {
    blocks,
    entityMap,
  };
}

export default mdToDraftjs;
