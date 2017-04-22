const draftjsToMd = require('../src/draftjsToMd.js').draftjsToMd;
const chai = require('chai');
const expect = chai.expect; // eslint-disable-line no-unused-vars
const should = chai.should(); // eslint-disable-line no-unused-vars

describe('draftjsToMd', () => {
  it('returns an empty string correctly', () => {
    const raw = {
      blocks: [{
        data: {},
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      }]
    };
    const expectedMarkdown = '';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('returns unstyled text correctly', () => {
    const raw = {
      blocks: [{
        data: {},
        text: 'There is no styling anywhere in this text.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: []
      }]
    };
    const expectedMarkdown = 'There is no styling anywhere in this text.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts draftjs blocks to bold markdown', () => {
    const raw = {
      blocks: [{
        data: {},
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
      }]
    };
    const expectedMarkdown = 'No style __bold__ no style.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts several italic draftjs blocks to markdown', () => {
    const raw = {
      blocks: [{
        data: {},
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
      }]
    };
    const expectedMarkdown = 'No style *italic* no style *more italic*.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts nested styles correctly', () => {
    const raw = {
      blocks: [{
        data: {},
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
      }]
    };
    const expectedMarkdown = 'I am a __text *with* nested__ styles.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts the last word correctly if it is styled', () => {
    const raw = {
      blocks: [{
        data: {},
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
      }]
    };
    const expectedMarkdown = '__I am styled all over.__';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts two styles applied to the same word correctly', () => {
    const raw = {
      blocks: [{
        data: {},
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
      }]
    };
    const expectedMarkdown = '__*Potato*__';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts several paragraphs to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          data: {},
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
          data: {},
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
          data: {},
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
      ]
    };
    const expectedMarkdown =
      '*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts unordered lists to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          data: {},
          text: 'First',
          type: 'unordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Second',
          type: 'unordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ]
    };
    const expectedMarkdown = '- First\n- Second';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts ordered lists to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          data: {},
          text: 'First',
          type: 'ordered-list-item',
          inlineStyleRanges: [],
          depth: 0,
          entityRanges: []
        },
        {
          data: {},
          text: 'Second',
          type: 'ordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Third',
          type: 'ordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ]
    };
    const expectedMarkdown = '1. First\n2. Second\n3. Third';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts H1 - H6 to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          data: {},
          text: 'One',
          type: 'header-one',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Two',
          type: 'header-two',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Three',
          type: 'header-three',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Four',
          type: 'header-four',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Five',
          type: 'header-five',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          data: {},
          text: 'Six',
          type: 'header-six',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ]
    };
    const expectedMarkdown = '# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts code blocks to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          data: {},
          text: 'const country = Estonia;',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ]
    };
    const expectedMarkdown = '```\nconst country = Estonia;\n```';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts link entities to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/'
          }
        }
      },
      blocks: [
        {
          data: {},
          text: 'This is a link in text.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 10,
              length: 4,
              key: 0
            }
          ]
        }
      ]
    };
    const expectedMarkdown = 'This is a [link](http://red-badger.com/) in text.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts several links to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/'
          }
        },
        1: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/'
          }
        }
      },
      blocks: [
        {
          data: {},
          text: 'One link. Two links.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [

          ],
          entityRanges: [
            {
              offset: 4,
              length: 4,
              key: 0
            },
            {
              offset: 14,
              length: 5,
              key: 1
            }
          ]
        }
      ]
    };
    const expectedMarkdown = 'One [link](http://red-badger.com/). Two [links](http://red-badger.com/).';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts bold links to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/'
          }
        }
      },
      blocks: [
        {
          data: {},
          text: 'I am a bold link.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 7,
              length: 4,
              style: 'BOLD'
            }
          ],
          entityRanges: [
            {
              offset: 7,
              length: 4,
              key: 0
            }
          ]
        }
      ]
    };
    const expectedMarkdown = 'I am a __[bold](http://red-badger.com/)__ link.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('converts image media to markdown correctly', () => {
    const raw = {
      entityMap: {
        1: {
          type: 'image',
          mutability: 'IMMUTABLE',
          data: {
            url: '//images.mine.com/myImage.jpg',
            fileName: 'My Image Name'
          }
        }
      },
      blocks: [
        {
          data: {},
          key: 'fag2v',
          text: ' ',
          type: 'atomic',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 0,
              length: 1,
              key: 1
            }
          ]
        }
      ]
    };
    const expectedMarkdown = '![My Image Name](//images.mine.com/myImage.jpg)';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('handles leading and trailing spaces around styled text', () => {
    const raw = {
      blocks: [{
        data: {},
        text: 'No style  bold  no style.',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 9,
            length: 6,
            style: 'BOLD'
          },
        ],
        entityRanges: []
      }]
    };
    const expectedMarkdown = 'No style  __bold__  no style.';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  it('handles leading and trailing spaces around styled text without duplicating string', () => {
    const raw = {
      blocks: [{
        data: {},
        text: 'this is a test',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [
          {
            offset: 5,
            length: 2,
            style: 'BOLD'
          },
        ],
        entityRanges: []
      }]
    };
    const expectedMarkdown = 'this __is__ a test';
    draftjsToMd(raw).should.equal(expectedMarkdown);
  });

  describe('custom markdownDict', () => {
    const customMarkdownDict = {
      BOLD: '**',
      STRIKETHROUGH: '~~'
    };

    it('returns unstyled text correctly', () => {
      const raw = {
        blocks: [{
          data: {},
          text: 'There is no styling anywhere in this text.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }]
      };
      const expectedMarkdown = 'There is no styling anywhere in this text.';
      draftjsToMd(raw, customMarkdownDict).should.equal(expectedMarkdown);
    });

    it('converts draftjs blocks to bold markdown with overriden style', () => {
      const raw = {
        blocks: [{
          data: {},
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
        }]
      };
      const expectedMarkdown = 'No style **bold** no style.';
      draftjsToMd(raw, customMarkdownDict).should.equal(expectedMarkdown);
    });

    it('converts draftjs blocks to italic markdown with default style', () => {
      const raw = {
        blocks: [{
          data: {},
          text: 'No style italic no style.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 6,
              style: 'ITALIC'
            },
          ],
          entityRanges: []
        }]
      };
      const expectedMarkdown = 'No style *italic* no style.';
      draftjsToMd(raw, customMarkdownDict).should.equal(expectedMarkdown);
    });

    it('converts draftjs blocks to strike-through markdown with overriden style', () => {
      const raw = {
        blocks: [{
          data: {},
          text: 'No style strike-through no style.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 14,
              style: 'STRIKETHROUGH'
            },
          ],
          entityRanges: []
        }]
      };
      const expectedMarkdown = 'No style ~~strike-through~~ no style.';
      draftjsToMd(raw, customMarkdownDict).should.equal(expectedMarkdown);
    });
  });
});
