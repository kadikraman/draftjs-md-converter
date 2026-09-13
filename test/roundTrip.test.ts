import { describe, expect, it } from 'vitest';
import { draftjsToMd, mdToDraftjs } from '../src/index';

describe('round trip', () => {
  it('keeps the language tag of a fenced code block', () => {
    const markdown = 'Before\n```js\nconst a = 1;\n```\nAfter';
    expect(draftjsToMd(mdToDraftjs(markdown))).toBe(markdown);
  });
});
