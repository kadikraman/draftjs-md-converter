const assert = require('assert');
const converter = require('../');
const chai = require('chai')
  , expect = chai.expect
  , should = chai.should();

describe('mdToDraftjs', () => {
  it('converts bold markdown to draftjs blocks', () => {
    const markdown = 'No style __bold__ no style.';
    const expectedDraftjs = [{
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
    }]
    converter.mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('converts several italic markdown to draftjs blocks', () => {
    const markdown = 'No style *italic* no style *more italic*.';
    const expectedDraftjs = [{
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
    }]
    converter.mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  })
});
