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

module.exports = {
  mdToDraftjs,
};
