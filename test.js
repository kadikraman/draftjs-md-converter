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
  'should convert bold markdown to draftjs blocks'
);

assert.deepEqual(
  converter.mdToDraftjs('No style __bold__ no style __more bold__.'),
  [{
    text: 'No style bold no style more bold.',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 9,
        length: 4,
        style: 'BOLD'
      },
      {
        offset: 23,
        length: 9,
        style: 'BOLD'
      }
    ],
    entityRanges: []
  }],
  'should convert several bold markdown to draftjs blocks'
);

assert.deepEqual(
  converter.mdToDraftjs('No style *italic* no style *more italic*.'),
  [{
    text: 'No style italic no style more italic.',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [
      {
        offset: 9,
        length: 6,
        style: 'ITALIC'
      },
      {
        offset: 25,
        length: 11,
        style: 'ITALIC'
      }
    ],
    entityRanges: []
  }],
  'should convert several italic markdown to draftjs blocks'
);
