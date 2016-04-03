const assert = require('assert');
const converter = require('./');

assert.deepEqual(
  converter.mdToDraftjs('No style __bold__ no style.'),
  [{
    text: 'No style bold no style.',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 9,
        length: 4,
        style: 'BOLD'
      }
    ],
    entityRanges: []
  }],
  'should convert bold makdown to draftjs blocks'
);