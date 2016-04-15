const mdToDraftjs = require('../src/index.js').mdToDraftjs;
const chai = require('chai');
const expect = chai.expect; // eslint-disable-line no-unused-vars
const should = chai.should(); // eslint-disable-line no-unused-vars

describe('mdToDraftjs', () => {
  it('returns empty text correctly', () => {
    const markdown = '';
    const expectedDraftjs = [{
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: []
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('returns unstyled text correctly', () => {
    const markdown = 'There is no styling anywhere in this text.';
    const expectedDraftjs = [{
      text: 'There is no styling anywhere in this text.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: []
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

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
        },
      ],
      entityRanges: []
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
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
          style: 'ITALIC',
        },
        {
          offset: 25,
          length: 11,
          style: 'ITALIC'
        },
      ],
      entityRanges: []
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('converts nested styles correctly', () => {
    const markdown = 'I am a __text *with* nested__ styles.';
    const expectedDraftjs = [{
      text: 'I am a text with nested styles.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 7,
          length: 5,
          style: 'BOLD',
        },
        {
          offset: 12,
          length: 4,
          style: 'BOLD',
        },
        {
          offset: 12,
          length: 4,
          style: 'ITALIC',
        },
        {
          offset: 16,
          length: 7,
          style: 'BOLD',
        }
      ],
      entityRanges: []
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('converts two styles applied to the same word correctly', () => {
    const markdown = '__*Potato*__';
    const expectedDraftjs = [{
      text: 'Potato',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 0,
          length: 6,
          style: 'BOLD',
        },
        {
          offset: 0,
          length: 6,
          style: 'ITALIC',
        }
      ],
      entityRanges: [],
    }];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('converts several paragraphs to markdown correctly', () => {
    const markdown =
      '*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.';
    const expectedDraftjs = [
      {
        text: 'First content block.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 0,
            length: 6,
            style: 'ITALIC'
          },
          {
            offset: 6,
            length: 7,
            style: 'ITALIC'
          },
          {
            offset: 6,
            length: 7,
            style: 'BOLD'
          }
        ],
        entityRanges: []
      },
      {
        text: 'Second content block.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 0,
            length: 7,
            style: 'ITALIC'
          },
          {
            offset: 7,
            length: 7,
            style: 'ITALIC'
          },
          {
            offset: 7,
            length: 7,
            style: 'BOLD'
          }
        ],
        entityRanges: []
      },
      {
        text: 'Third content block.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 0,
            length: 6,
            style: 'ITALIC'
          },
          {
            offset: 6,
            length: 7,
            style: 'ITALIC'
          },
          {
            offset: 6,
            length: 7,
            style: 'BOLD'
          }
        ],
        entityRanges: []
      }
    ];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it('converts markdown to unordered lists correctly', () => {
    const markdown = '- First\n- Second';
    const expectedDraftjs = [
      {
        text: 'First',
        type: 'unordered-list-item',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      },
      {
        text: 'Second',
        type: 'unordered-list-item',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      }
    ];
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });
});
