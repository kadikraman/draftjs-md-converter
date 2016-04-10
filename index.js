'use strict';

const inlineStyles = [
  {
    type: 'BOLD',
    symbol: '__',
    regex: /__(.*?)__/,
  },
  {
    type: 'ITALIC',
    symbol: '*',
    regex: /\*(.*?)\*/,
  },
];

function draftjsToMd(blocks) {
  return blocks;
}

function mdToDraftjs(mdString) {
  let text = mdString;
  const inlineStyleRanges = [];
  inlineStyles.forEach(style => {
    let found = text.match(style.regex);
    while (found) {
      const split = text.split(found[0]);
      inlineStyleRanges.push({
        offset: split[0].length,
        length: found[1].length,
        style: style.type,
      });
      text = text.replace(found[0], found[1]);
      found = text.match(style.regex);
    }
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

module.exports = {
  draftjsToMd,
  mdToDraftjs,
};
