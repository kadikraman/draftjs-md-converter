import { describe, expect, it } from 'vitest';
import draftjsToMd from '../src/draftjsToMd.js';

describe('draftjsToMd', () => {
  it('returns an empty string correctly', () => {
    const raw = {
      blocks: [
        {
          text: '',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('returns unstyled text correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'There is no styling anywhere in this text.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'There is no styling anywhere in this text.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts draftjs blocks to bold markdown', () => {
    const raw = {
      blocks: [
        {
          text: 'No style bold no style.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 4,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'No style __bold__ no style.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts draftjs blocks to unstyled markdown if the style is not in dict', () => {
    const raw = {
      blocks: [
        {
          text: 'I should have no style anywhere.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 4,
              style: 'FAKE_STYLE',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'I should have no style anywhere.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts several italic draftjs blocks to markdown', () => {
    const raw = {
      blocks: [
        {
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
              style: 'ITALIC',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'No style *italic* no style *more italic*.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts nested styles correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'I am a text with nested styles.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 7,
              length: 16,
              style: 'BOLD',
            },
            {
              offset: 12,
              length: 4,
              style: 'ITALIC',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'I am a __text *with* nested__ styles.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts overlapping styles correctly, whether or not the "longer" one is first', () => {
    const raw = {
      blocks: [
        {
          text: 'I start with italic bold and end with only bold.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 24,
              style: 'ITALIC',
            },
            {
              offset: 0,
              length: 48,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '__*I start with italic bold* and end with only bold.__';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts the last word correctly if it is styled', () => {
    const raw = {
      blocks: [
        {
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
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '__I am styled all over.__';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts two styles applied to the same word correctly', () => {
    const raw = {
      blocks: [
        {
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
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '__*Potato*__';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts several paragraphs to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'First content block.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 13,
              style: 'ITALIC',
            },
            {
              offset: 6,
              length: 7,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
        {
          text: 'Second content block.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 14,
              style: 'ITALIC',
            },
            {
              offset: 7,
              length: 7,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
        {
          text: 'Third content block.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 13,
              style: 'ITALIC',
            },
            {
              offset: 6,
              length: 7,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown =
      '*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts several consecutive styled draftjs paragraphs to markdown', () => {
    const raw = {
      blocks: [
        {
          text: 'A [b]',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 1,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
        {
          text: 'C [d]',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 2,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
        {
          text: 'Want more',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 9,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '__A__ [b]\n__C__ [d]\n__Want more__';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts unordered lists to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'First',
          type: 'unordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Second',
          type: 'unordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '- First\n- Second';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts ordered lists to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'First',
          type: 'ordered-list-item',
          inlineStyleRanges: [],
          depth: 0,
          entityRanges: [],
        },
        {
          text: 'Second',
          type: 'ordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Third',
          type: 'ordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '1. First\n2. Second\n3. Third';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts H1 - H6 to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'One',
          type: 'header-one',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Two',
          type: 'header-two',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Three',
          type: 'header-three',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Four',
          type: 'header-four',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Five',
          type: 'header-five',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Six',
          type: 'header-six',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = '# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts code blocks to markdown correctly', () => {
    const raw = {
      blocks: [
        {
          text: 'Country Code:',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'const country = Estonia;',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'Country Code:\n```\nconst country = Estonia;\n```';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts link entities to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/',
          },
        },
      },
      blocks: [
        {
          text: 'This is a link in text.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 10,
              length: 4,
              key: 0,
            },
          ],
        },
      ],
    };
    const expectedMarkdown = 'This is a [link](http://red-badger.com/) in text.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts several links to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/',
          },
        },
        1: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/',
          },
        },
      },
      blocks: [
        {
          text: 'One link. Two links.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 4,
              length: 4,
              key: 0,
            },
            {
              offset: 14,
              length: 5,
              key: 1,
            },
          ],
        },
      ],
    };
    const expectedMarkdown =
      'One [link](http://red-badger.com/). Two [links](http://red-badger.com/).';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts bold links to markdown correctly', () => {
    const raw = {
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {
            url: 'http://red-badger.com/',
          },
        },
      },
      blocks: [
        {
          text: 'I am a bold link.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 7,
              length: 4,
              style: 'BOLD',
            },
          ],
          entityRanges: [
            {
              offset: 7,
              length: 4,
              key: 0,
            },
          ],
        },
      ],
    };
    const expectedMarkdown = 'I am a __[bold](http://red-badger.com/)__ link.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('handles leading and trailing spaces around styled text', () => {
    const raw = {
      blocks: [
        {
          text: 'No style  bold  no style.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 6,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'No style  __bold__  no style.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('handles leading and trailing spaces around styled text without duplicating string', () => {
    const raw = {
      blocks: [
        {
          text: 'this is a test',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 5,
              length: 2,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
        },
      ],
    };
    const expectedMarkdown = 'this __is__ a test';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('converts block quotes to markdown correctly', () => {
    const raw = {
      entityMap: {},
      blocks: [
        {
          text: 'Here is a block quote.',
          type: 'blockquote',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    };
    const expectedMarkdown = '> Here is a block quote.';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  it('inline styles do not remove spaces', () => {
    const raw = {
      entityMap: {},
      blocks: [
        {
          data: {},
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [
            { offset: 0, length: 4, style: 'BOLD' },
            { offset: 12, length: 4, style: 'ITALIC' },
          ],
          text: 'This is not fine',
          type: 'unstyled',
        },
      ],
    };
    const expectedMarkdown = '__This__ is not *fine*';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });

  describe('custom markdownDict', () => {
    const customMarkdownDict = {
      BOLD: '**',
      STRIKETHROUGH: '~~',
    };

    it('returns unstyled text correctly', () => {
      const raw = {
        blocks: [
          {
            text: 'There is no styling anywhere in this text.',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
          },
        ],
      };
      const expectedMarkdown = 'There is no styling anywhere in this text.';
      expect(draftjsToMd(raw, customMarkdownDict)).toBe(expectedMarkdown);
    });

    it('converts draftjs blocks to bold markdown with overriden style', () => {
      const raw = {
        blocks: [
          {
            text: 'No style bold no style.',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [
              {
                offset: 9,
                length: 4,
                style: 'BOLD',
              },
            ],
            entityRanges: [],
          },
        ],
      };
      const expectedMarkdown = 'No style **bold** no style.';
      expect(draftjsToMd(raw, customMarkdownDict)).toBe(expectedMarkdown);
    });

    it('converts draftjs blocks to italic markdown with default style', () => {
      const raw = {
        blocks: [
          {
            text: 'No style italic no style.',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [
              {
                offset: 9,
                length: 6,
                style: 'ITALIC',
              },
            ],
            entityRanges: [],
          },
        ],
      };
      const expectedMarkdown = 'No style *italic* no style.';
      expect(draftjsToMd(raw, customMarkdownDict)).toBe(expectedMarkdown);
    });

    it('converts draftjs blocks to strike-through markdown with overriden style', () => {
      const raw = {
        blocks: [
          {
            text: 'No style strike-through no style.',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [
              {
                offset: 9,
                length: 14,
                style: 'STRIKETHROUGH',
              },
            ],
            entityRanges: [],
          },
        ],
      };
      const expectedMarkdown = 'No style ~~strike-through~~ no style.';
      expect(draftjsToMd(raw, customMarkdownDict)).toBe(expectedMarkdown);
    });
  });

  describe('Images', () => {
    it('converts image media to markdown correctly with url/filename', () => {
      const raw = {
        entityMap: {
          1: {
            type: 'image',
            mutability: 'IMMUTABLE',
            data: {
              url: '//images.mine.com/myImage.jpg',
              fileName: 'My Image Name',
            },
          },
        },
        blocks: [
          {
            key: 'fag2v',
            text: ' ',
            type: 'atomic',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 1,
              },
            ],
          },
        ],
      };
      const expectedMarkdown = '![My Image Name](//images.mine.com/myImage.jpg)';
      expect(draftjsToMd(raw)).toBe(expectedMarkdown);
    });

    it('converts image media to markdown correctly with src format', () => {
      const raw = {
        entityMap: {
          1: {
            type: 'image',
            mutability: 'IMMUTABLE',
            data: {
              src: '//images.mine.com/myImage.jpg',
            },
          },
        },
        blocks: [
          {
            key: 'fag2v',
            text: ' ',
            type: 'atomic',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 1,
              },
            ],
          },
        ],
      };
      const expectedMarkdown = '![](//images.mine.com/myImage.jpg)';
      expect(draftjsToMd(raw)).toBe(expectedMarkdown);
    });
  });

  describe('Videos', () => {
    it('converts video media created by draft-js-video-plugin to markdown correctly with src format', () => {
      const raw = {
        entityMap: {
          1: {
            type: 'draft-js-video-plugin-video',
            mutability: 'IMMUTABLE',
            data: {
              src: '//youtu.be/wfWIs2gFTAM',
            },
          },
        },
        blocks: [
          {
            key: 'ov7r',
            text: ' ',
            type: 'atomic',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 1,
              },
            ],
          },
        ],
      };
      const expectedMarkdown = '[[ embed url=//youtu.be/wfWIs2gFTAM ]]';
      expect(draftjsToMd(raw)).toBe(expectedMarkdown);
    });
  });

  it('Handles emoji', () => {
    const raw = {
      blocks: [
        {
          key: '24hvu',
          text: 'Trying again.🕺',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 14,
              style: 'BOLD',
            },
          ],
          entityRanges: [],
          data: {},
        },
      ],
      entityMap: {},
    };
    const expectedMarkdown = '__Trying again.🕺__';
    expect(draftjsToMd(raw)).toBe(expectedMarkdown);
  });
});
