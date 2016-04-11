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
}

const markdownDict = {
  BOLD: '__',
  ITALIC: '*'
}

function mdToDraftjs(mdString) {
  var astString = parse(mdString);
  var text = '';
  const inlineStyleRanges = [];

  const getRawLength = children => {
    let length = 0;
    children.forEach(child => {
      length = length + child.value.length;
    })
    return length;
  }

  const parseChildren = (child, style) => {
    if (child.children && style) {
      const rawLength = getRawLength(child.children);
      inlineStyleRanges.push({
        offset: text.length,
        length: rawLength,
        style: style.type
      })
      const newStyle = inlineStyles[child.type]
      child.children.forEach(child => {
        parseChildren(child, newStyle);
      })
    } else if (child.children) {
      const newStyle = inlineStyles[child.type]
      child.children.forEach(child => {
        parseChildren(child, newStyle);
      })
    } else {
      if (style) {
        inlineStyleRanges.push({
          offset: text.length,
          length: child.value.length,
          style: style.type
        })
      }
      text = text + child.value;
    }
  }

  astString.children.forEach(child => {
    const style = inlineStyles[child.type];
    parseChildren(child, style);
  })

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
  for (var index = 0; index < block.text.length; index++) {
    var character = block.text.charAt(index);
    var stylesStartAtChar = block.inlineStyleRanges.filter(range => range.offset === index);
    var stylesEndAtChar = block.inlineStyleRanges.filter(range => range.offset + range.length === index + 1);
    stylesStartAtChar.forEach(style => {
      returnString += markdownDict[style.style]
    });
    returnString += character;
    stylesEndAtChar.forEach(style => {
      returnString += markdownDict[style.style]
    });
  }
  return returnString;
}

module.exports = {
  mdToDraftjs,
  draftjsToMd,
};
