[![Build Status](https://travis-ci.org/kadikraman/draftjs-md-converter.svg?branch=master)](https://travis-ci.org/kadikraman/draftjs-md-converter)
[![npm version](https://badge.fury.io/js/draftjs-md-converter.svg)](https://badge.fury.io/js/draftjs-md-converter)

# Draft.js to Markdown to Draft.js converter

Converts content from Draft.js blocks to Markdown and vice versa.

## Reasoning and background
This exists because I needed a highly customisable rich text editor which posts to an external API in Markdown. [Draft.js](https://facebook.github.io/draft-js/) to the rescue! Alas, it doesn't ship with any sort of import or export to or from markdown so I've written my own.

## Installation
```
npm install draftjs-md-converter
```

## Support
The following inline styles are supported:

- bold
- italic
- H1 - H6

The following block syles are supported:

- ordered list
- unordered list
- block quote

The following media is supported:
- images

## Usage
Import `mdToDraftjs` and `draftjsToMd` into the React component. When instantiating the draft.js editor, use the `mdToDraftjs` function to convert the default value (in markdown) to draft.js raw js structure and use the `ContentState.createFromBlockArray()` function to create the immutable draft.js raw js structure.

Use the `this.state.editorState.getCurrentContent()` to get the current content and `draftjsToMd(convertToRaw(content))` to convert it back to markdown. That can be used with whatever onChange functionality used.

Below is a code example of the above in some context.

```
[---]

import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';
import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';

[---]

constructor(props) {
  super(props);

  // some default falue in markdown
  const defaultValue = this.props.defaultValue;
  const rawData = mdToDraftjs(defaultValue);
  const contentState = convertFromRaw(rawData);
  const newEditorState = EditorState.createWithContent(contentState);

  this.state = {
    editorState: newEditorState,
  };
  this.onChange = (editorState) => {
    this.props.onChange(this.getMarkdown());
    this.setState({ editorState });
  };
}

[---]

getMarkdown() {
  const content = this.state.editorState.getCurrentContent();
  return draftjsToMd(convertToRaw(content));
}

[---]
```

## Run tests
```
npm test
```

## Run tests with a watcher
```
npm run test-dev
```

## To Do
- block style: code block
- media: video
