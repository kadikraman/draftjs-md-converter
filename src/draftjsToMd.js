'use strict';

const markdownDict = {
  BOLD: '__',
  ITALIC: '*'
};

const blockStyleDict = {
  unstyled: '',
  'unordered-list-item': '- ',
  'header-one': '# ',
  'header-two': '## ',
  'header-three': '### ',
  'header-four': '#### ',
  'header-five': '##### ',
  'header-six': '###### ',
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
  return blockStyleDict[currentStyle];
};

function draftjsToMd(raw) {
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

      // add the current character to the md string
      newText += currentChar;

      // apply the 'ending' tags for any styles that end in the current position in order (stack)
      while (appliedStyles.length !== 0 && appliedStyles[appliedStyles.length - 1].end === index) {
        const endingStyle = appliedStyles.pop();
        newText += endingStyle.symbol;
      }
      return newText;
    }, '');
  });
  return returnString;
}

module.exports.draftjsToMd = draftjsToMd;
