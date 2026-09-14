import type {
  DraftjsToMdOptions,
  MarkdownDict,
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftEntity,
  RawDraftInlineStyleRange,
} from './types';

const defaultMarkdownDict: MarkdownDict = {
  BOLD: '__',
  ITALIC: '*',
};

const blockStyleDict: Record<string, string> = {
  'header-one': '# ',
  'header-two': '## ',
  'header-three': '### ',
  'header-four': '#### ',
  'header-five': '##### ',
  'header-six': '###### ',
  blockquote: '> ',
};

const wrappingBlockStyleDict: Record<string, string> = {
  'code-block': '```',
};

/** An opened inline style waiting for its closing symbol at character index `end`. */
interface AppliedStyle {
  symbol: string;
  end: number;
}

const listItemTypes = new Set(['unordered-list-item', 'ordered-list-item']);

// four spaces nest under both "- " and "1. " markers in CommonMark
const listIndent = '    ';

const getBlockStyle = (
  block: RawDraftContentBlock,
  previousBlocks: RawDraftContentBlock[],
): string => {
  if (!listItemTypes.has(block.type)) {
    return blockStyleDict[block.type] || '';
  }
  const indent = listIndent.repeat(block.depth);
  if (block.type === 'unordered-list-item') {
    return `${indent}- `;
  }
  // count the ordered siblings directly before this item; deeper items in between do not break the run
  let counter = 1;
  for (let i = previousBlocks.length - 1; i >= 0; i--) {
    const previous = previousBlocks[i];
    if (!listItemTypes.has(previous.type) || previous.depth < block.depth) {
      break;
    }
    if (previous.depth > block.depth) {
      continue;
    }
    if (previous.type !== 'ordered-list-item') {
      break;
    }
    counter++;
  }
  return `${indent}${counter}. `;
};

const applyWrappingBlockStyle = (block: RawDraftContentBlock, content: string): string => {
  const wrappingSymbol = wrappingBlockStyleDict[block.type];
  if (!wrappingSymbol) {
    return content;
  }
  const language = typeof block.data?.language === 'string' ? block.data.language : '';
  return `${wrappingSymbol}${language}\n${content}\n${wrappingSymbol}`;
};

// entityMap is typed as complete, but content from the wild can reference keys it lacks
const getEntity = (
  entityMap: Record<string, RawDraftEntity>,
  key: number,
): RawDraftEntity | undefined => entityMap[key];

const isImage = (entity: RawDraftEntity | undefined): boolean =>
  entity?.type.toUpperCase() === 'IMAGE';

const imageMarkdown = ({ data }: RawDraftEntity): string =>
  `![${data.fileName || ''}](${data.url || data.src})`;

const applyAtomicStyle = (
  block: RawDraftContentBlock,
  entityMap: Record<string, RawDraftEntity>,
  content: string,
): string => {
  if (block.type !== 'atomic') return content;
  const entityRange = block.entityRanges[0];
  const entity = entityRange ? getEntity(entityMap, entityRange.key) : undefined;
  if (!entity) return content;
  // drop the placeholder text of the media block
  const strippedContent = content.substring(0, content.length - block.text.length);
  const { type, data } = entity;
  if (type === 'draft-js-video-plugin-video') {
    return `${strippedContent}[[ embed url=${data.url || data.src} ]]`;
  }
  return `${strippedContent}${imageMarkdown(entity)}`;
};

const getEntityStart = (entity: RawDraftEntity | undefined): string => {
  switch (entity?.type) {
    case 'LINK':
      return '[';
    default:
      return '';
  }
};

const getEntityEnd = (entity: RawDraftEntity | undefined): string => {
  switch (entity?.type) {
    case 'LINK':
      return `](${entity.data.url || entity.data.href || ''})`;
    default:
      return '';
  }
};

const isWhitespace = (char: string): boolean => /\s/u.test(char);

// Draft.js may style the spaces around a word, but Markdown symbols must hug the word.
// Returns the range without leading and trailing whitespace, or undefined if nothing is left.
function trimRange(
  range: RawDraftInlineStyleRange,
  chars: string[],
): RawDraftInlineStyleRange | undefined {
  let start = range.offset;
  let end = range.offset + range.length;
  while (start < end && isWhitespace(chars[start])) {
    start++;
  }
  while (end > start && isWhitespace(chars[end - 1])) {
    end--;
  }
  return end > start ? { ...range, offset: start, length: end - start } : undefined;
}

// characters that can start inline Markdown anywhere in a line
const inlineMarkdownChar = /[\\`*_[\]<~]/;

const escapeChar = (char: string): string => (inlineMarkdownChar.test(char) ? `\\${char}` : char);

// constructs that only count at the start of a block: headings, quotes, list markers, rules
const blockStartPatterns: [RegExp, string][] = [
  [/^(\s*)(#{1,6})(?=\s|$)/, '$1\\$2'],
  [/^(\s*)>/, '$1\\>'],
  [/^(\s*)([-+])(?=\s|$)/, '$1\\$2'],
  [/^(\s*)(\d+)([.)])(?=\s|$)/, '$1$2\\$3'],
  [/^(\s*)([-=])(?=[-=\s]*$)/, '$1\\$2'],
];

const escapeBlockStart = (text: string): string => {
  for (const [pattern, replacement] of blockStartPatterns) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }
  return text;
};

function getInlineStyleRangesByLength(
  inlineStyleRanges: RawDraftInlineStyleRange[],
): RawDraftInlineStyleRange[] {
  return [...inlineStyleRanges].sort((a, b) => b.length - a.length);
}

function draftjsToMd(
  raw: RawDraftContentState,
  extraMarkdownDict?: MarkdownDict,
  options: DraftjsToMdOptions = {},
): string {
  const markdownDict: MarkdownDict = { ...defaultMarkdownDict, ...extraMarkdownDict };
  const previousBlocks: RawDraftContentBlock[] = [];

  return raw.blocks
    .map((block) => {
      const blockPrefix = getBlockStyle(block, previousBlocks);
      previousBlocks.push(block);
      const shouldEscape =
        options.escape === true && block.type !== 'code-block' && block.type !== 'atomic';

      const appliedStyles: AppliedStyle[] = [];
      const lastAppliedStyle = (): AppliedStyle | undefined =>
        appliedStyles[appliedStyles.length - 1];

      const chars = Array.from(block.text);
      const inlineStyleRanges = getInlineStyleRangesByLength(
        block.inlineStyleRanges
          .filter((range) => markdownDict[range.style]) // skip styles the dict does not know
          .flatMap((range) => trimRange(range, chars) ?? []),
      );

      // images inside a text block are written in place of their placeholder text
      const inlineImages =
        block.type === 'atomic'
          ? []
          : block.entityRanges.filter((range) => isImage(getEntity(raw.entityMap, range.key)));
      const isImagePlaceholder = (index: number): boolean =>
        inlineImages.some((range) => index >= range.offset && index < range.offset + range.length);

      let body = chars.reduce((text, currentChar, index) => {
        let newText = text;

        // open styles starting here
        for (const currentStyle of inlineStyleRanges) {
          if (currentStyle.offset === index) {
            const symbol = markdownDict[currentStyle.style];
            newText += symbol;
            appliedStyles.push({ symbol, end: currentStyle.offset + currentStyle.length - 1 });
          }
        }

        const entitiesStartAtChar = block.entityRanges.filter((range) => range.offset === index);
        for (const entity of entitiesStartAtChar) {
          newText += getEntityStart(getEntity(raw.entityMap, entity.key));
        }

        for (const range of inlineImages) {
          const entity = getEntity(raw.entityMap, range.key);
          if (range.offset === index && entity) {
            newText += imageMarkdown(entity);
          }
        }
        if (!isImagePlaceholder(index)) {
          newText += shouldEscape ? escapeChar(currentChar) : currentChar;
        }

        const entitiesEndAtChar = block.entityRanges.filter(
          (range) => range.offset + range.length - 1 === index,
        );
        for (const entity of entitiesEndAtChar) {
          newText += getEntityEnd(getEntity(raw.entityMap, entity.key));
        }

        // close styles ending here, innermost first
        let endingStyle = lastAppliedStyle();
        while (endingStyle?.end === index) {
          appliedStyles.pop();
          newText += endingStyle.symbol;
          endingStyle = lastAppliedStyle();
        }

        return newText;
      }, '');

      if (shouldEscape) {
        body = escapeBlockStart(body);
      }
      let returnString = blockPrefix + body;
      returnString = applyWrappingBlockStyle(block, returnString);
      returnString = applyAtomicStyle(block, raw.entityMap, returnString);

      return returnString;
    })
    .join('\n');
}

export default draftjsToMd;
