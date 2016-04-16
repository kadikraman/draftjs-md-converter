const draftjsToMd = require('../src/draftjsToMd.js').draftjsToMd;
const chai = require('chai');
const expect = chai.expect; // eslint-disable-line no-unused-vars
const should = chai.should(); // eslint-disable-line no-unused-vars

describe('draftjsToMd', () => {
  it('returns an empty string correctly', () => {
    const blocks = [{
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: []
    }];
    const expectedMarkdown = '';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('returns unstyled text correctly', () => {
    const blocks = [{
      text: 'There is no styling anywhere in this text.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: []
    }];
    const expectedMarkdown = 'There is no styling anywhere in this text.';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts draftjs blocks to bold markdown', () => {
    const blocks = [{
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
    const expectedMarkdown = 'No style __bold__ no style.';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts several italic draftjs blocks to markdown', () => {
    const blocks = [{
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
        },
      ],
      entityRanges: []
    }];
    const expectedMarkdown = 'No style *italic* no style *more italic*.';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts nested styles correctly', () => {
    const blocks = [{
      text: 'I am a text with nested styles.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 7,
          length: 16,
          style: 'BOLD'
        },
        {
          offset: 12,
          length: 4,
          style: 'ITALIC'
        },
      ],
      entityRanges: []
    }];
    const expectedMarkdown = 'I am a __text *with* nested__ styles.';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts the last word correctly if it is styled', () => {
    const blocks = [{
      text: 'I am styled all over.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 0,
          length: 21,
          style: 'BOLD',
        },
      ],
      entityRanges: []
    }];
    const expectedMarkdown = '__I am styled all over.__';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts two styles applied to the same word correctly', () => {
    const blocks = [{
      text: 'Potato',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 0,
          length: 6,
          style: 'BOLD'
        },
        {
          offset: 0,
          length: 6,
          style: 'ITALIC'
        }
      ],
      entityRanges: []
    }];
    const expectedMarkdown = '__*Potato*__';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts several paragraphs to markdown correctly', () => {
    const blocks = [
      {
        text: 'First content block.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 0,
            length: 13,
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
            length: 14,
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
            length: 13,
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
    const expectedMarkdown =
      '*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts unordered lists to markdown correctly', () => {
    const blocks = [
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
    const expectedMarkdown = '- First\n- Second';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });

  it('converts ordered lists to markdown correctly', () => {
    const blocks = [
      {
        text: 'First',
        type: 'ordered-list-item',
        inlineStyleRanges: [],
        depth: 0,
        entityRanges: []
      },
      {
        text: 'Second',
        type: 'ordered-list-item',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      },
      {
        text: 'Third',
        type: 'ordered-list-item',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      }
    ];
    const expectedMarkdown = '1. First\n2. Second\n3. Third';
    draftjsToMd(blocks).should.equal(expectedMarkdown);
  });
});
