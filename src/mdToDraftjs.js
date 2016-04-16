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
  List: 'unordered-list-item'
};

const getBlockStyleForMd = (style, ordered) => {
  if (style === 'List' && ordered) {
    return 'ordered-list-item';
  }
  return blockStyles[style];
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
      blockStyle = getBlockStyleForMd(astString.children[0].type, astString.children[0].ordered);
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

module.exports.mdToDraftjs = mdToDraftjs;
