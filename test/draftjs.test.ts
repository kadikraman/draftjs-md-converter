import { convertFromRaw, convertToRaw, type RawDraftContentState as DraftRaw } from 'draft-js';
import { describe, expect, it } from 'vitest';
import { draftjsToMd, mdToDraftjs } from '../src/index';
import { documents } from './fixtures/documents';

// Draft.js's own types require a block key, which mdToDraftjs leaves to Draft.js to generate
const fromRaw = (raw: ReturnType<typeof mdToDraftjs>) => convertFromRaw(raw as unknown as DraftRaw);

// These tests run the output through Draft.js itself, so they catch anything
// Draft.js reads differently from what this package writes.
describe('with Draft.js in the loop', () => {
  for (const [name, markdown] of Object.entries(documents)) {
    it(`round-trips "${name}" through convertFromRaw and convertToRaw`, () => {
      const contentState = fromRaw(mdToDraftjs(markdown));
      expect(draftjsToMd(convertToRaw(contentState))).toBe(markdown);
    });
  }

  it('applies inline styles at the right characters after an emoji', () => {
    const block = fromRaw(mdToDraftjs('🚀 __Expo__ Go')).getFirstBlock();
    const bold = Array.from({ length: block.getLength() }, (_, i) =>
      block.getInlineStyleAt(i).has('BOLD'),
    );
    // "🚀" is two UTF-16 units, then a space, then the four bold characters
    expect(block.getText()).toBe('🚀 Expo Go');
    expect(bold).toStrictEqual([false, false, false, true, true, true, true, false, false, false]);
  });

  it('keeps nested list depth and code block language through Draft.js', () => {
    const raw = convertToRaw(fromRaw(mdToDraftjs('- a\n    - b\n        - c\n```ts\nlet x\n```')));
    expect(raw.blocks.map((block) => [block.type, block.depth, block.data])).toStrictEqual([
      ['unordered-list-item', 0, {}],
      ['unordered-list-item', 1, {}],
      ['unordered-list-item', 2, {}],
      ['code-block', 0, { language: 'ts' }],
    ]);
  });

  it('merges the split ranges of a style nested inside another style', () => {
    // mdToDraftjs writes one range per text run, so the italic here arrives as three ranges.
    // Draft.js merges adjacent ranges of one style, and the Markdown comes back unchanged.
    const markdown = 'EAS Build is *now __generally__ available*.';
    const viaDraft = convertToRaw(fromRaw(mdToDraftjs(markdown)));
    expect(viaDraft.blocks[0].inlineStyleRanges).toStrictEqual([
      { offset: 13, length: 23, style: 'ITALIC' },
      { offset: 17, length: 9, style: 'BOLD' },
    ]);
    expect(draftjsToMd(viaDraft)).toBe(markdown);
  });
});
