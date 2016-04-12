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

const markdownDict = {
  BOLD: '__',
  ITALIC: '*'
};

function mdToDraftjs(mdString) {
  const astString = parse(mdString);
  let text = '';
  const inlineStyleRanges = [];

  const getRawLength = children => {
    let length = 0;
    children.forEach(child => {
      length = length + child.value.length;
    });
    return length;
  };

  const parseChildren = (child, style) => {
    if (child.children && style) {
      const rawLength = getRawLength(child.children);
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

  const returnValue = [{
    text,
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges,
    entityRanges: [],
  }];
  return returnValue;
}

function draftjsToMd(blocks) {
  const block = blocks[0];
  let returnString = '';
  for (let index = 0; index < block.text.length; index++) {
    const character = block.text.charAt(index);
    const stylesStartAtChar = block.inlineStyleRanges.filter(range => range.offset === index);
    const stylesEndAtChar = block.inlineStyleRanges.filter(range => {
      return range.offset + range.length === index + 1;
    });
    stylesStartAtChar.forEach(currentStyle => {
      returnString += markdownDict[currentStyle.style];
    });
    returnString += character;
    stylesEndAtChar.forEach(currentStyle => {
      returnString += markdownDict[currentStyle.style];
    });
  }
  return returnString;
}

module.exports = {
  mdToDraftjs,
  draftjsToMd,
};
