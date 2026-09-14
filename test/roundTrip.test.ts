import { describe, expect, it } from 'vitest';
import { draftjsToMd, mdToDraftjs } from '../src/index';

describe('round trip', () => {
  it('keeps the language tag of a fenced code block', () => {
    const markdown = 'Before\n```js\nconst a = 1;\n```\nAfter';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });

  it('keeps styles and links that follow an emoji', () => {
    const markdown =
      '🚀 Build your __apps__ with *Expo* and read the [docs](https://docs.expo.dev) 🎉';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });

  it('keeps two ordered lists separate', () => {
    const markdown =
      '1. Install Expo\n2. Build your app\nThen ship it:\n1. Run EAS Build\n2. Submit';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });

  it('keeps an image inside a paragraph', () => {
    const markdown = 'Read the ![Expo logo](https://expo.dev/logo.png) docs';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });

  it('keeps nested lists', () => {
    const markdown =
      '- Install Expo\n    - Run create-expo-app\n        - Pick a template\n- Build\n1. First\n    1. Nested\n2. Second';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });

  it('brings escaped plain text back unchanged and unstyled', () => {
    const texts = [
      '__not_bold__ with *stars* and `ticks`',
      '# not a heading',
      '1. not a list',
      '- not a list',
      '---',
    ];
    const raw = {
      entityMap: {},
      blocks: texts.map((text) => ({
        text,
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
      })),
    };
    const back = mdToDraftjs(draftjsToMd(raw, undefined, { escape: true }));
    expect(
      back.blocks.map((block) => [block.type, block.text, block.inlineStyleRanges]),
    ).toStrictEqual(texts.map((text) => ['unstyled', text, []]));
  });
});
