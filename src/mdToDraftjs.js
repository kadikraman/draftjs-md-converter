'use strict';

const parse = require('markdown-to-ast').parse;

const defaultInlineStyles = {
  Strong: {
    type: 'BOLD',
    symbol: '__'
  },
  Emphasis: {
    type: 'ITALIC',
    symbol: '*'
  }
};

const defaultBlockStyles = {
  List: 'unordered-list-item',
  Header1: 'header-one',
  Header2: 'header-two',
  Header3: 'header-three',
  Header4: 'header-four',
  Header5: 'header-five',
  Header6: 'header-six',
  CodeBlock: 'code-block',
};

const getBlockStyleForMd = (node, blockStyles) => {
  const style = node.type;
  const ordered = node.ordered;
  const depth = node.depth;
  if (style === 'List' && ordered) {
    return 'ordered-list-item';
  } else if (style === 'Header') {
    return blockStyles[`${style}${depth}`];
  } else if (node.type === 'Paragraph' && node.children && node.children[0] && node.children[0].type === 'Image') { // eslint-disable-line max-len
    return 'atomic';
  }
  return blockStyles[style];
};

const joinCodeBlocks = (mdArr) => {
  const mdArrLength = mdArr.length;
  const result = mdArr.reduce((pre, cur, index) => {
    let { baffer, draft } = pre;
    const isCodeBlock = cur.indexOf('```') === 0;
    const isLastOne = index === (mdArrLength - 1);

    if (draft.length === 0) {
      if (isCodeBlock) {
        draft.push(cur);
      } else {
        baffer.push(cur);
      }
    } else {
      draft.push(cur);
      if (isCodeBlock) {
        baffer.push(draft.join('\n'));
        draft = [];
      } else if (isLastOne) {
        baffer = baffer.concat(draft);
      }
    }
    return { baffer, draft };
  }, { baffer: [], draft: [] });
  return result.baffer;
};

const splitMdBlocks = (md) => {
  const splitMd = md.split('\n');

  // Process the split markdown include the
  // one syntax where there's an block level opening
  // and closing symbol with content in the middle.
  const splitMdWithCodeBlocks = joinCodeBlocks(splitMd);
  return splitMdWithCodeBlocks;
};

const parseMdLine = (line, existingEntities, extraStyles = {}) => {
  const inlineStyles = { ...defaultInlineStyles, ...extraStyles.inlineStyles };
  const blockStyles = { ...defaultBlockStyles, ...extraStyles.blockStyles };

  const astString = parse(line);
  let text = '';
  const inlineStyleRanges = [];
  const entityRanges = [];
  const entityMap = existingEntities;

  const addInlineStyleRange = (offset, length, style) => {
    inlineStyleRanges.push({ offset, length, style });
  };

  const getRawLength = children =>
                        children.reduce((prev, current) => prev + current.value.length, 0);

  const addLink = child => {
    const entityKey = Object.keys(entityMap).length;
    entityMap[entityKey] = {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url: child.url
      }
    };
    entityRanges.push({
      key: entityKey,
      length: getRawLength(child.children),
      offset: text.length
    });
  };

  const addImage = child => {
    const entityKey = Object.keys(entityMap).length;
    entityMap[entityKey] = {
      type: 'image',
      mutability: 'IMMUTABLE',
      data: {
        url: child.url,
        fileName: child.alt
      }
    };
    entityRanges.push({
      key: entityKey,
      length: 1,
      offset: text.length
    });
  };

  const parseChildren = (child, style) => {
    switch (child.type) {
      case 'Link':
        addLink(child);
        break;
      case 'Image':
        addImage(child);
        break;
      default:
    }

    if (child.children && style) {
      const rawLength = getRawLength(child.children);
      addInlineStyleRange(text.length, rawLength, style.type);
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
      if (style) addInlineStyleRange(text.length, child.value.length, style.type);
      text = `${text}${child.type === 'Image' ? ' ' : child.value}`;
    }
  };

  astString.children.forEach(child => {
    const style = inlineStyles[child.type];
    parseChildren(child, style);
  });

  // add block style if it exists
  let blockStyle = 'unstyled';
  const data = {};
  if (astString.children[0]) {
    const style = getBlockStyleForMd(astString.children[0], blockStyles);
    const language = astString.children[0].lang;
    if (style) {
      blockStyle = style;
    }
    if (language) {
      data.language = language;
    }
  }

  return {
    text,
    data,
    inlineStyleRanges,
    entityRanges,
    blockStyle,
    entityMap
  };
};

function mdToDraftjs(mdString, extraStyles) {
  const paragraphs = splitMdBlocks(mdString);
  const blocks = [];
  let entityMap = {};

  paragraphs.forEach(paragraph => {
    const result = parseMdLine(paragraph, entityMap, extraStyles);
    blocks.push({
      data: result.data,
      text: result.text,
      type: result.blockStyle,
      depth: 0,
      inlineStyleRanges: result.inlineStyleRanges,
      entityRanges: result.entityRanges
    });
    entityMap = result.entityMap;
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
