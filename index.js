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
  },
  Str: {
    type: 'no style',
    symbol: ''
  }
}

function draftjsToMd(blocks) {
  return blocks;
}

function mdToDraftjs(mdString) {
  var astString = parse(mdString);
  var text = '';
  const inlineStyleRanges = [];
  astString.children.forEach(child => {
    child.children.forEach(grandChild => {
      if (!grandChild.children) {
        text = text + grandChild.value;
      } else {
        const inlineStyle = inlineStyles[grandChild.type];
        inlineStyleRanges.push({
          offset: text.length,
          length: grandChild.children[0].value.length,
          style: inlineStyle.type
        })
        text = text + grandChild.children[0].value;
      }
    })
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
