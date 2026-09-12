import type {
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
  'unordered-list-item': '- ',
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

/** An opened inline style waiting for its closing symbol. */
interface AppliedStyle {
  symbol: string;
  range: { start: number; end: number };
  end: number;
}

const getBlockStyle = (currentStyle: string, appliedBlockStyles: string[]): string => {
  if (currentStyle === 'ordered-list-item') {
    const counter = appliedBlockStyles.reduce((prev, style) => {
      if (style === 'ordered-list-item') {
        return prev + 1;
      }
      return prev;
    }, 1);
    return `${counter}. `;
  }
  return blockStyleDict[currentStyle] || '';
};

const applyWrappingBlockStyle = (currentStyle: string, content: string): string => {
  if (currentStyle in wrappingBlockStyleDict) {
    const wrappingSymbol = wrappingBlockStyleDict[currentStyle];
    return `${wrappingSymbol}\n${content}\n${wrappingSymbol}`;
  }

  return content;
};

const applyAtomicStyle = (
  block: RawDraftContentBlock,
  entityMap: Record<string, RawDraftEntity>,
  content: string,
): string => {
  if (block.type !== 'atomic') return content;
  // drop the placeholder text of the media block
  const strippedContent = content.substring(0, content.length - block.text.length);
  const key = block.entityRanges[0].key;
  const { type, data } = entityMap[key];
  if (type === 'draft-js-video-plugin-video') {
    return `${strippedContent}[[ embed url=${data.url || data.src} ]]`;
  }
  return `${strippedContent}![${data.fileName || ''}](${data.url || data.src})`;
};

const getEntityStart = (entity: RawDraftEntity): string => {
  switch (entity.type) {
    case 'LINK':
      return '[';
    default:
      return '';
  }
};

const getEntityEnd = (entity: RawDraftEntity): string => {
  switch (entity.type) {
    case 'LINK':
      return `](${entity.data.url})`;
    default:
      return '';
  }
};

function fixWhitespacesInsideStyle(text: string, style: AppliedStyle): string {
  // Move spaces at the edges of a styled range outside its markers: "__ a __" -> " __a__ "
  const { symbol } = style;

  const pre = text.slice(0, style.range.start);
  const body = text.slice(style.range.start, style.range.end);
  const bodyTrimmed = body.trim();
  const post = text.slice(style.range.end);

  const bodyTrimmedStart = style.range.start + body.indexOf(bodyTrimmed);

  const prefix = text.slice(style.range.start, bodyTrimmedStart);
  const postfix = text.slice(bodyTrimmedStart + bodyTrimmed.length, style.range.end);

  const newText = `${pre}${bodyTrimmed}${post}`;
  return newText.replace(
    `${symbol}${bodyTrimmed}${symbol}`,
    `${prefix}${symbol}${bodyTrimmed}${symbol}${postfix}`,
  );
}

function getInlineStyleRangesByLength(
  inlineStyleRanges: RawDraftInlineStyleRange[],
): RawDraftInlineStyleRange[] {
  return [...inlineStyleRanges].sort((a, b) => b.length - a.length);
}

function draftjsToMd(raw: RawDraftContentState, extraMarkdownDict?: MarkdownDict): string {
  const markdownDict: MarkdownDict = { ...defaultMarkdownDict, ...extraMarkdownDict };
  const appliedBlockStyles: string[] = [];

  return raw.blocks
    .map((block) => {
      // symbol characters inserted so far
      let totalOffset = 0;
      let returnString = '';

      returnString += getBlockStyle(block.type, appliedBlockStyles);
      appliedBlockStyles.push(block.type);

      const appliedStyles: AppliedStyle[] = [];
      const lastAppliedStyle = (): AppliedStyle | undefined =>
        appliedStyles[appliedStyles.length - 1];

      returnString += Array.from(block.text).reduce((text, currentChar, index) => {
        let newText = text;

        const sortedInlineStyleRanges = getInlineStyleRangesByLength(block.inlineStyleRanges);

        const stylesStartAtChar = sortedInlineStyleRanges
          .filter((range) => range.offset === index)
          .filter((range) => markdownDict[range.style]); // skip styles the dict does not know

        // open styles starting here
        for (const currentStyle of stylesStartAtChar) {
          const symbol = markdownDict[currentStyle.style];
          newText += symbol;
          totalOffset += symbol.length;
          appliedStyles.push({
            symbol,
            range: {
              start: currentStyle.offset + totalOffset,
              end: currentStyle.offset + currentStyle.length + totalOffset,
            },
            end: currentStyle.offset + (currentStyle.length - 1),
          });
        }

        const entitiesStartAtChar = block.entityRanges.filter((range) => range.offset === index);
        for (const entity of entitiesStartAtChar) {
          newText += getEntityStart(raw.entityMap[entity.key]);
        }

        newText += currentChar;

        const entitiesEndAtChar = block.entityRanges.filter(
          (range) => range.offset + range.length - 1 === index,
        );
        for (const entity of entitiesEndAtChar) {
          newText += getEntityEnd(raw.entityMap[entity.key]);
        }

        // close styles ending here, innermost first
        let endingStyle = lastAppliedStyle();
        while (endingStyle?.end === index) {
          appliedStyles.pop();
          newText += endingStyle.symbol;

          newText = fixWhitespacesInsideStyle(newText, endingStyle);
          totalOffset += endingStyle.symbol.length;
          endingStyle = lastAppliedStyle();
        }

        return newText;
      }, '');

      returnString = applyWrappingBlockStyle(block.type, returnString);
      returnString = applyAtomicStyle(block, raw.entityMap, returnString);

      return returnString;
    })
    .join('\n');
}

export default draftjsToMd;
