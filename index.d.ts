declare module 'draftjs-md-converter' {
  import { RawDraftContentState } from 'draft-js';
  export function draftjsToMd(
    raw: RawDraftContentState,
    extraMarkdownDict?: { [key: string]: string }
  ): string[];
  export function mdToDraftjs(mdString: string, extraStyles?: { [key: string]: string });
}
