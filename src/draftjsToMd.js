'use strict';

const defaultMarkdownDict = {
  BOLD: '__',
  ITALIC: '*'
};

const blockStyleDict = {
  'unordered-list-item': '- ',
  'header-one': '# ',
  'header-two': '## ',
  'header-three': '### ',
  'header-four': '#### ',
  'header-five': '##### ',
  'header-six': '###### ',
};

const wrappingBlockStyleDict = {
  'code-block': '```'
};

const getBlockStyle = (currentStyle, appliedBlockStyles) => {
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

const applyWrappingBlockStyle = (currentStyle, content) => {
  if (currentStyle in wrappingBlockStyleDict) {
    const wrappingSymbol = wrappingBlockStyleDict[currentStyle];
    return `${wrappingSymbol}\n${content}\n${wrappingSymbol}`;
  }

  return content;
};

const applyAtomicStyle = (block, entityMap, content) => {
  if (block.type !== 'atomic') return content;
  // strip the test that was added in the media block
  const strippedContent = content.substring(0, content.length - block.text.length);
  const key = block.entityRanges[0].key;
  const data = entityMap[key].data;
  return `${strippedContent}![${data.fileName}](${data.url})`;
};

const getEntityStart = entity => {
  switch (entity.type) {
    case 'LINK':
      return '[';
    default:
      return '';
  }
};

const getEntityEnd = entity => {
  switch (entity.type) {
    case 'LINK':
      return `](${entity.data.url})`;
    default:
      return '';
  }
};

function draftjsToMd(raw, extraMarkdownDict) {
  const markdownDict = { ...defaultMarkdownDict, ...extraMarkdownDict };
  let returnString = '';
  const appliedBlockStyles = [];
  raw.blocks.forEach((block, blockIndex) => {
    if (blockIndex !== 0) returnString += '\n';

    // add block style
    returnString += getBlockStyle(block.type, appliedBlockStyles);
    appliedBlockStyles.push(block.type);

    const appliedStyles = [];
    returnString += block.text.split('').reduce((text, currentChar, index) => {
      let newText = text;

      // find all styled at this character
      const stylesStartAtChar = block.inlineStyleRanges.filter(range => range.offset === index);

      // add the symbol to the md string and push the style in the applied styles stack
      stylesStartAtChar.forEach(currentStyle => {
        newText += markdownDict[currentStyle.style];
        appliedStyles.push({
          symbol: markdownDict[currentStyle.style],
          end: currentStyle.offset + currentStyle.length - 1
        });
      });

      // check for entityRanges starting and add if existing
      const entitiesStartAtChar = block.entityRanges.filter(range => range.offset === index);
      entitiesStartAtChar.forEach(entity => {
        newText += getEntityStart(raw.entityMap[entity.key]);
      });


      // add the current character to the md string
      newText += currentChar;

      // check for entityRanges ending and add if existing
      const entitiesEndAtChar = block.entityRanges
                                    .filter(range => range.offset + range.length - 1 === index);
      entitiesEndAtChar.forEach(entity => {
        newText += getEntityEnd(raw.entityMap[entity.key]);
      });

      // apply the 'ending' tags for any styles that end in the current position in order (stack)
      while (appliedStyles.length !== 0 && appliedStyles[appliedStyles.length - 1].end === index) {
        const endingStyle = appliedStyles.pop();
        newText += endingStyle.symbol;
      }

      return newText;
    }, '');

    returnString = applyWrappingBlockStyle(block.type, returnString);
    returnString = applyAtomicStyle(block, raw.entityMap, returnString);
  });
  return returnString;
}

module.exports.draftjsToMd = draftjsToMd;
