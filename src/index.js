'use strict';

const parse = require('markdown-to-ast').parse;

const inlineStyles = {
  Strong: {
    type: 'BOLD',
    symbol: '__'
  },
  Emphasis: {
    type: 'ITALIC',
    symbol: '*'
  }
};

const blockStyles = {
  List: {
    type: 'unordered-list-item'
  }
};

const markdownDict = {
  BOLD: '__',
  ITALIC: '*'
};

const blockStyleDict = {
  unstyled: '',
  'unordered-list-item': '- '
};

const parseMdLine = line => {
  const astString = parse(line);
  let text = '';
  const inlineStyleRanges = [];

  const parseChildren = (child, style) => {
    if (child.children && style) {
      const rawLength = child.children.reduce((prev, current) => prev + current.value.length, 0);
      inlineStyleRanges.push({
        offset: text.length,
        length: rawLength,
        style: style.type
      });
      const newStyle = inlineStyles[child.type];
      child.children.forEach(grandChild => {
        parseChildren(grandChild, newStyle);
      });
    } else if (child.children) {
      const newStyle = inlineStyles[child.type];
      child.children.forEach(grandChild => {
        parseChildren(grandChild, newStyle);
      });
    } else {
      if (style) {
        inlineStyleRanges.push({
          offset: text.length,
          length: child.value.length,
          style: style.type
        });
      }
      text = text + child.value;
    }
  };

  astString.children.forEach(child => {
    const style = inlineStyles[child.type];
    parseChildren(child, style);
  });

  // add block style if it exists
  let blockStyle = 'unstyled';
  if (astString.children[0]) {
    const style = blockStyles[astString.children[0].type];
    if (style) {
      blockStyle = blockStyles[astString.children[0].type].type;
    }
  }


  return {
    text,
    inlineStyleRanges,
    blockStyle
  };
};

function mdToDraftjs(mdString) {
  const paragraphs = mdString.split('\n');
  const returnValue = [];
  paragraphs.forEach(paragraph => {
    const result = parseMdLine(paragraph);
    returnValue.push({
      text: result.text,
      type: result.blockStyle,
      depth: 0,
      inlineStyleRanges: result.inlineStyleRanges,
      entityRanges: [],
    });
  });
  return returnValue;
}

function draftjsToMd(blocks) {
  let returnString = '';
  blocks.forEach((block, blockIndex) => {
    if (blockIndex !== 0) returnString += '\n';

    // add block style
    returnString += blockStyleDict[block.type];
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

module.exports = {
  mdToDraftjs,
  draftjsToMd
};
