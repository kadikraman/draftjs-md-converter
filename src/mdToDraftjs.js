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
  let entityMap = {};
  const linkRegex = /\[(.*)\]\((.*)\)/;

  paragraphs.forEach(paragraph => {
    let mutableParagraph = paragraph;
    // this ast library doesn't support urls so add these separately
    let match = linkRegex.exec(mutableParagraph);
    const entityRanges = [];
    while (match) {
      // add entity to entity map
      const entityKey = Object.keys(entityMap).length;
      entityMap[entityKey] = {
        type: 'LINK',
        mutability: 'MUTABLE',
        data: {
          url: match[2]
        }
      };

      // remove the markdown link and leave just the text
      mutableParagraph = mutableParagraph.replace(match[0], match[1]);

      // add entity to entityRanges
      entityRanges.push({
        key: entityKey,
        length: match[1].length,
        offset: mutableParagraph.indexOf(match[1])
      });

      match = linkRegex.exec(mutableParagraph);
    }

    const result = parseMdLine(mutableParagraph);
    blocks.push({
      text: result.text,
      type: result.blockStyle,
      depth: 0,
      inlineStyleRanges: result.inlineStyleRanges,
      entityRanges
    });
  });

  // add a default value
  // not sure why that's needed but Draftjs convertToRaw fails without it
  if (Object.keys(entityMap).length === 0) {
    entityMap = {
      data: '',
      mutability: '',
      type: ''
    };
  }
  return {
    blocks,
    entityMap
  };
}

module.exports.mdToDraftjs = mdToDraftjs;
