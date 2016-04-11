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

function draftjsToMd(blocks) {
  return blocks;
}


function mdToDraftjs(mdString) {
  var astString = parse(mdString);
  var text = '';
  const inlineStyleRanges = [];

  const parseChildren = (child, style) => {
    if (child.children) {
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

module.exports = {
  draftjsToMd,
  mdToDraftjs,
};
