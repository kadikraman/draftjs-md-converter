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
  List: 'unordered-list-item',
  Header1: 'header-one',
  Header2: 'header-two',
  Header3: 'header-three',
  Header4: 'header-four',
  Header5: 'header-five',
  Header6: 'header-six'
};

const getBlockStyleForMd = node => {
  const style = node.type;
  const ordered = node.ordered;
  const depth = node.depth;
  if (style === 'List' && ordered) {
    return 'ordered-list-item';
  } else if (style === 'Header') {
    return blockStyles[`${style}${depth}`];
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
    const style = getBlockStyleForMd(astString.children[0]);
    if (style) {
      blockStyle = style;
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
  const blocks = [];
  paragraphs.forEach(paragraph => {
    const result = parseMdLine(paragraph);
    blocks.push({
      text: result.text,
      type: result.blockStyle,
      depth: 0,
      inlineStyleRanges: result.inlineStyleRanges,
      entityRanges: [],
    });
  });
  return {
    blocks,
    entityMap: {
      type: '',
      mutability: '',
      data: ''
    }
  };
}

module.exports.mdToDraftjs = mdToDraftjs;
