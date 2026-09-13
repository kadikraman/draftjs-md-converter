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
});
