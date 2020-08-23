import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ghLogoSrc from './github-logo.png';
import copySrc from './copy.svg';
import clearSrc from './clear.svg';

import 'draft-js/dist/Draft.css';

const initial = `# Title time
This text is __bold__ and this is *italic*!

\`\`\`
This bit of text is inside a code block!
\`\`\`

I can also do ordered lists:
1. One
2. Two
3. Three

And unordered lists:
- one
- two
- three`;

function App() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(convertFromRaw(mdToDraftjs(initial)))
  );
  const [markdown, setMarkdown] = useState(initial);
  const editorRef = useRef(null);
  const [showCopied, setShowCopied] = useState(false);
  const [currentFocus, setCurrentFocus] = useState("markdown"); // draftjs, markdown

  const focusDraftjs = useCallback(() => {
    editorRef.current.focus();
  }, [editorRef]);

  const handleChangeMarkdown = useCallback(event => {
    const newValue = event.target.value;
    setMarkdown(newValue);
    const rawData = mdToDraftjs(newValue);
    const contentState = convertFromRaw(rawData);
    const newEditorState = EditorState.createWithContent(contentState);
    setEditorState(newEditorState);
  }, []);

  const handleChangeDraftJS = useCallback(newState => {
    setEditorState(newState);
    const plainText = draftjsToMd(convertToRaw(newState.getCurrentContent()));
    setMarkdown(plainText);
  }, []);

  const currentBlocks = useMemo(() => {
    return JSON.stringify(editorState.getCurrentContent(), null, 2)
  }, [editorState]);

  const handleCopied = useCallback(() => {
    setShowCopied(true);

    setTimeout(() => {
      setShowCopied(false)
    }, 1000);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown("");
    setEditorState(EditorState.createEmpty());
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1 className="headerText">draftjs-md-converter</h1>
        <a className="githubLink" href="https://github.com/kadikraman/draftjs-md-converter" target="_blank">
          <img src={ghLogoSrc} />
          <span className="githubText">GitHub</span>
        </a>
      </header>
      <div className="instructions">
        <div className="instructionLine">
          Type in either box to and the result is automaticaly coverted using draftjs-md-converter
        </div>
        <div className="instructionLine">
          <img src={copySrc} className="inlineCopy" />
          to copy the current draft.js blocks to your clipboard
        </div>
      </div>
      <div className="copyContainer">
        {showCopied ? <span>Copied!</span> :
        <CopyToClipboard text={currentBlocks} onCopy={handleCopied}>
          <button className="copyButton">
            <img src={copySrc} />
          </button>
        </CopyToClipboard>}
      </div>
      <div className="editors">
        <div className="half">
          {currentFocus === "markdown" ?
          <button className="clearButton markdownButton" onClick={handleClear}>
            <img src={clearSrc} />
          </button> : null}
          <h2 className="editorHeading markdownEditorHeading">Markdown</h2>
          <textarea
            className="editor markdownEditor"
            value={markdown}
            onChange={handleChangeMarkdown}
            placeholder="Enter some text..."
            onFocus={event => {
              // automatically set the cursor at the end ¯\_(ツ)_/¯
              // https://stackoverflow.com/questions/35951771/react-autofocus-sets-cursor-to-beginning-of-input-value
              const val = event.target.value;
              event.target.value = '';
              event.target.value = val;
              setCurrentFocus("markdown")
            }}
            autoFocus
          />
        </div>
        <div className="half">
          {currentFocus === "draftjs" ?
          <button className="clearButton draftjsButton" onClick={handleClear}>
            <img src={clearSrc} />
          </button> : null}
          <h2 className="editorHeading draftjsEditorHeading">Draft.js</h2>
          <div className="editor draftjsEditor" onClick={focusDraftjs}>
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={handleChangeDraftJS}
              placeholder="Enter some text..."
              onFocus={() => setCurrentFocus("draftjs")}
            />
          </div>
        </div>
      </div>
      <footer className="footer">
        an OSS project by <a href="https://github.com/kadikraman" target="_blank" className="kadiLink">Kadi Kraman</a>
      </footer>
    </div>
  );
}

export default App;
