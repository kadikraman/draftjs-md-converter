const inlineStyles = [
  {
    type: 'BOLD',
    symbol: '__',
    regex: /__(.*?)__/
  }
]

function draftjsToMd(blocks) {
  return blocks;
}

function mdToDraftjs(mdString) {
  var text = mdString;
  var inlineStyleRanges = [];
  inlineStyles.forEach(style => {
    const found = text.match(style.regex);
    if (found) {
      var split = text.split(found[0]);
      inlineStyleRanges.push({
        offset: split[0].length,
        length: found[1].length,
        style: style.type
      })
      text = text.replace(found[0], found[1]);
  }
  })
  const returnValue = [{
    text: text,
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: inlineStyleRanges,
    entityRanges: []
  }];
  return returnValue;
}

module.exports = {
  draftjsToMd,
  mdToDraftjs
}
