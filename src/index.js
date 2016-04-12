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
  const returnString = block.text.split('').reduce((text, currentChar, index) => {
    let newText = text;
    const stylesStartAtChar = block.inlineStyleRanges.filter(range => range.offset === index);
    const stylesEndAtChar = block.inlineStyleRanges.filter(range => {
      return range.offset + range.length === index + 1;
    });
    stylesStartAtChar.forEach(currentStyle => {
      newText += markdownDict[currentStyle.style];
    });
    newText += currentChar;
    stylesEndAtChar.forEach(currentStyle => {
      newText += markdownDict[currentStyle.style];
    });
    return newText;
  }, '');
  return returnString;
}

module.exports = {
  mdToDraftjs,
  draftjsToMd,
};
