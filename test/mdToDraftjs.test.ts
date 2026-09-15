import { describe, expect, it } from 'vitest';
import mdToDraftjs from '../src/mdToDraftjs';

describe('mdToDraftjs', () => {
  it('returns empty text correctly', () => {
    const markdown = '';
    const expectedDraftjs = {
      blocks: [
        {
          text: '',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('returns unstyled text correctly', () => {
    const markdown = 'There is no styling anywhere in this text.';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'There is no styling anywhere in this text.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts bold markdown to draftjs blocks', () => {
    const markdown = 'No style __bold__ no style.';
    const expectedDraftjs = {
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts several italic markdown to draftjs blocks', () => {
    const markdown = 'No style *italic* no style *more italic*.';
    const expectedDraftjs = {
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts nested styles correctly', () => {
    const markdown = 'I am a __text *with* nested__ styles.';
    const expectedDraftjs = {
      blocks: [
        {
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
            },
          ],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts two styles applied to the same word correctly', () => {
    const markdown = '__*Potato*__';
    const expectedDraftjs = {
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts two styles applied outside a link correctly', () => {
    const markdown = '__*[label](http://example.com/here)*__';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'label',
          type: 'unstyled',
          depth: 0,
          entityRanges: [
            {
              key: 0,
              length: 5,
              offset: 0,
            },
          ],
          inlineStyleRanges: [
            {
              length: 5,
              offset: 0,
              style: 'BOLD',
            },
            {
              length: 5,
              offset: 0,
              style: 'ITALIC',
            },
          ],
        },
      ],
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'http://example.com/here' },
        },
      },
    };

    const resultDraftJs = mdToDraftjs(markdown);
    expect(resultDraftJs).toStrictEqual(expectedDraftjs);
  });

  it('converts a style applied inside a link correctly', () => {
    const markdown = '[la**b**el](http://example.com/here)';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'label',
          type: 'unstyled',
          depth: 0,
          entityRanges: [
            {
              key: 0,
              length: 5,
              offset: 0,
            },
          ],
          inlineStyleRanges: [
            {
              length: 1,
              offset: 2,
              style: 'BOLD',
            },
          ],
        },
      ],
      entityMap: {
        0: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: { url: 'http://example.com/here' },
        },
      },
    };

    const resultDraftJs = mdToDraftjs(markdown);
    expect(resultDraftJs).toStrictEqual(expectedDraftjs);
  });

  it('converts several paragraphs to markdown correctly', () => {
    const markdown =
      '*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'First content block.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 6,
              style: 'ITALIC',
            },
            {
              offset: 6,
              length: 7,
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
              length: 7,
              style: 'ITALIC',
            },
            {
              offset: 7,
              length: 7,
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
              length: 6,
              style: 'ITALIC',
            },
            {
              offset: 6,
              length: 7,
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to unordered lists correctly', () => {
    const markdown = '- First\n- Second';
    const expectedDraftjs = {
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to ordered lists correctly', () => {
    const markdown = '1. First\n2. Second\n3. Third';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'First',
          type: 'ordered-list-item',
          depth: 0,
          inlineStyleRanges: [],
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to H1 - H6 correctly', () => {
    const markdown = '# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six';
    const expectedDraftjs = {
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
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to code blocks correctly', () => {
    const markdown = '```\nconst country = Estonia;\n```';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'const country = Estonia;',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to code blocks with inline styles correctly', () => {
    const markdown = '```\nconst *country* = Estonia;\n```';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'const *country* = Estonia;',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts multiple markdown to code blocks correctly', () => {
    const markdown =
      'Cats are cool\n```\nPurr Purr 🐱\n```\nBut birds are too!\n```\nCaw-cawwww! 🐦\n```';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'Cats are cool',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Purr Purr 🐱',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'But birds are too!',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Caw-cawwww! 🐦',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to unclosed code blocks correctly', () => {
    const markdown = '```\nOh no, I only opened a code block';
    const expectedDraftjs = {
      blocks: [
        {
          text: '',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
        {
          text: 'Oh no, I only opened a code block',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
      entityMap: {
        type: '',
        mutability: '',
        data: '',
      },
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts link entities to markdown correctly', () => {
    const markdown = 'This is a [link](http://red-badger.com/) in text.';
    const expectedDraftjs = {
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
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to several links correctly', () => {
    const markdown = 'One [link](http://red-badger.com/). Two [links](http://red-badger.com/).';
    const expectedDraftjs = {
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
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('converts markdown to bold links correctly', () => {
    const markdown = 'I am a __[bold](http://red-badger.com/)__ link.';
    const expectedDraftjs = {
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
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  describe('Images', () => {
    it('converts markdown to image media correctly', () => {
      const markdown = '![My Image Name](//images.mine.com/myImage.jpg)';
      const expectedDraftjs = {
        entityMap: {
          0: {
            type: 'IMAGE',
            mutability: 'IMMUTABLE',
            data: {
              url: '//images.mine.com/myImage.jpg',
              src: '//images.mine.com/myImage.jpg',
              fileName: 'My Image Name',
            },
          },
        },
        blocks: [
          {
            text: ' ',
            type: 'atomic',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0,
              },
            ],
          },
        ],
      };
      expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
    });
  });

  describe('Videos', () => {
    it('converts markdown to video media correctly', () => {
      const markdown = '[[ embed url=//youtu.be/wfWIs2gFTAM ]]';
      const expectedDraftjs = {
        entityMap: {
          0: {
            type: 'draft-js-video-plugin-video',
            mutability: 'IMMUTABLE',
            data: {
              src: '//youtu.be/wfWIs2gFTAM',
            },
          },
        },
        blocks: [
          {
            text: ' ',
            type: 'atomic',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0,
              },
            ],
          },
        ],
      };
      expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
    });
  });

  it('converts markdown to block quotes correctly', () => {
    const markdown = '> Here is a block quote.';
    const expectedDraftjs = {
      entityMap: {
        data: '',
        mutability: '',
        type: '',
      },
      blocks: [
        {
          text: 'Here is a block quote.',
          type: 'blockquote',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    };
    expect(mdToDraftjs(markdown)).toStrictEqual(expectedDraftjs);
  });

  it('parses inline code correctly', () => {
    const markdown = '`code`';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'code',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [{ offset: 0, length: 4, style: 'CODE' }],
          entityRanges: [],
        },
      ],
      entityMap: { data: '', mutability: '', type: '' },
    };

    const customDict = {
      inlineStyles: {
        Code: {
          type: 'CODE',
        },
      },
    };

    expect(mdToDraftjs(markdown, customDict)).toStrictEqual(expectedDraftjs);
  });
  it('parses inline code mixed with other styles correctly', () => {
    const markdown = '__`code`__';
    const expectedDraftjs = {
      blocks: [
        {
          text: 'code',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: 4, style: 'BOLD' },
            { offset: 0, length: 4, style: 'CODE' },
          ],
          entityRanges: [],
        },
      ],
      entityMap: { data: '', mutability: '', type: '' },
    };

    const customDict = {
      inlineStyles: {
        Code: {
          type: 'CODE',
        },
      },
    };

    expect(mdToDraftjs(markdown, customDict)).toStrictEqual(expectedDraftjs);
  });

  describe('nodes without text', () => {
    it('converts a thematic break to an empty block instead of the word "undefined"', () => {
      const result = mdToDraftjs('text\n---\nmore');
      expect(result.blocks.map((block) => [block.type, block.text])).toStrictEqual([
        ['unstyled', 'text'],
        ['unstyled', ''],
        ['unstyled', 'more'],
      ]);
    });

    it('lets blockStyles map a thematic break to a custom block type', () => {
      const result = mdToDraftjs('---', { blockStyles: { HorizontalRule: 'horizontal-rule' } });
      expect(result.blocks).toStrictEqual([
        {
          text: '',
          type: 'horizontal-rule',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ]);
    });

    it('converts a link reference definition to an empty block', () => {
      const result = mdToDraftjs('[id]: http://example.com');
      expect(result.blocks).toStrictEqual([
        {
          text: '',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ]);
    });

    it('styles the placeholder of an image inside an inline style instead of throwing', () => {
      const result = mdToDraftjs('__![My Image](//images.mine.com/myImage.jpg)__');
      expect(result.blocks).toStrictEqual([
        {
          text: ' ',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [{ offset: 0, length: 1, style: 'BOLD' }],
          entityRanges: [{ key: 0, length: 1, offset: 0 }],
        },
      ]);
      expect(result.entityMap[0].type).toBe('IMAGE');
    });
  });

  describe('fenced code blocks with a language tag', () => {
    it('keeps the block together and stores the language in block data', () => {
      expect(mdToDraftjs('```js\nconst a = 1;\n```').blocks).toStrictEqual([
        {
          text: 'const a = 1;',
          type: 'code-block',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: { language: 'js' },
        },
      ]);
    });

    it('handles tagged and untagged blocks in one document', () => {
      const result = mdToDraftjs('Cats\n```ts\nPurr\n```\nBirds\n```\nCaw\n```');
      expect(result.blocks.map((block) => [block.type, block.text, block.data])).toStrictEqual([
        ['unstyled', 'Cats', undefined],
        ['code-block', 'Purr', { language: 'ts' }],
        ['unstyled', 'Birds', undefined],
        ['code-block', 'Caw', undefined],
      ]);
    });

    it('accepts a closing fence with trailing spaces', () => {
      const result = mdToDraftjs('```js\nx\n```  ');
      expect(result.blocks.map((block) => [block.type, block.text])).toStrictEqual([
        ['code-block', 'x'],
      ]);
    });
  });

  describe('emoji', () => {
    it('counts offsets in code points so a style after an emoji lines up', () => {
      const result = mdToDraftjs('🕺 __bold__');
      expect(result.blocks[0].text).toBe('🕺 bold');
      expect(result.blocks[0].inlineStyleRanges).toStrictEqual([
        { offset: 2, length: 4, style: 'BOLD' },
      ]);
    });

    it('counts the length of styled text in code points', () => {
      const result = mdToDraftjs('__🕺 dance__');
      expect(result.blocks[0].inlineStyleRanges).toStrictEqual([
        { offset: 0, length: 7, style: 'BOLD' },
      ]);
    });

    it('counts entity offsets in code points', () => {
      const result = mdToDraftjs('🚀 [Expo](https://expo.dev)');
      expect(result.blocks[0].entityRanges).toStrictEqual([{ key: 0, length: 4, offset: 2 }]);
      expect(result.entityMap[0].data.url).toBe('https://expo.dev');
    });
  });

  describe('nested lists', () => {
    const outline = (markdown: string) =>
      mdToDraftjs(markdown).blocks.map((block) => [block.type, block.depth, block.text]);

    it('reads nesting from two-space indentation', () => {
      expect(
        outline('- Install Expo\n  - Run create-expo-app\n    - Pick a template\n- Build'),
      ).toStrictEqual([
        ['unordered-list-item', 0, 'Install Expo'],
        ['unordered-list-item', 1, 'Run create-expo-app'],
        ['unordered-list-item', 2, 'Pick a template'],
        ['unordered-list-item', 0, 'Build'],
      ]);
    });

    it('reads nesting from four-space indentation instead of making a code block', () => {
      expect(
        outline('- Install Expo\n    - Run create-expo-app\n        - Pick a template'),
      ).toStrictEqual([
        ['unordered-list-item', 0, 'Install Expo'],
        ['unordered-list-item', 1, 'Run create-expo-app'],
        ['unordered-list-item', 2, 'Pick a template'],
      ]);
    });

    it('nests ordered items and returns to a middle level', () => {
      expect(
        outline('1. Build\n   1. iOS\n      - Simulator\n   2. Android\n2. Submit'),
      ).toStrictEqual([
        ['ordered-list-item', 0, 'Build'],
        ['ordered-list-item', 1, 'iOS'],
        ['unordered-list-item', 2, 'Simulator'],
        ['ordered-list-item', 1, 'Android'],
        ['ordered-list-item', 0, 'Submit'],
      ]);
    });

    it('starts a new list after a paragraph', () => {
      expect(outline('- a\n    - b\nText\n- c')).toStrictEqual([
        ['unordered-list-item', 0, 'a'],
        ['unordered-list-item', 1, 'b'],
        ['unstyled', 0, 'Text'],
        ['unordered-list-item', 0, 'c'],
      ]);
    });
  });

  describe('input validation', () => {
    it('throws a clear error when the input is not a string', () => {
      expect(() => mdToDraftjs(undefined as unknown as string)).toThrow(
        new TypeError('mdToDraftjs expects a Markdown string, received undefined'),
      );
      expect(() => mdToDraftjs(42 as unknown as string)).toThrow(
        new TypeError('mdToDraftjs expects a Markdown string, received a number'),
      );
    });
  });
});
