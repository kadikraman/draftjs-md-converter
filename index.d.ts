declare module "draftjs-md-converter" {
  import type { Syntax as ASTNodeTypes } from "@textlint/markdown-to-ast";
  import type { RawDraftContentState } from "draft-js";
  export function draftjsToMd(
    raw: RawDraftContentState,
    extraMarkdownDict?: { [key: string]: string }
  ): string;
  export function mdToDraftjs(
    mdString: string,
    extraStyles?: {
      inlineStyles?: {
        [key in ASTNodeTypes]?: {
          type: string;
          symbol: string;
          [key: string]: string;
        };
      };
      blockStyles?: {
        [key: string]: string;
      };
    }
  ): RawDraftContentState;
}
