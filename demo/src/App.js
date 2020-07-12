import React, { useState, useCallback, useRef } from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { mdToDraftjs, draftjsToMd } from 'draftjs-md-converter';

import 'draft-js/dist/Draft.css';

const initial = "Here is some *bold* test and here's some _italics_!";

function App() {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(convertFromRaw(mdToDraftjs(initial)))
  );
  const [markdown, setMarkdown] = useState(initial);
  const editorRef = useRef(null);

  const focus = useCallback(() => {
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

  return (
    <div style={styles.background}>
      <h1 style={styles.heading}>Draft.js Markdown Converter Demo</h1>
      <div style={styles.root}>
        <div style={styles.third}>
          <h2 style={styles.draftHeading}>Draft.js</h2>
          <div style={styles.editor} onClick={focus}>
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={handleChangeDraftJS}
              placeholder="Enter some text..."
            />
          </div>
        </div>
        <div style={styles.third}>
          <div>
            <h2 style={styles.markdownHeading}>Markdown</h2>
            <textarea style={styles.textarea} value={markdown} onChange={handleChangeMarkdown} />
          </div>
        </div>
        <div style={styles.third}>
          <div style={styles.blocks}>
            <h2 style={styles.blocksHeading}>Draft.js blocks</h2>
            <pre>{JSON.stringify(editorState.getCurrentContent(), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  background: {
    minHeight: '100vh',
    color: '#fdf6e3',
    paddingTop: 40
  },
  heading: {
    textAlign: 'center'
  },
  root: {
    fontFamily: "'Helvetica', sans-serif",
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  editor: {
    border: '1px solid #fdf6e3',
    cursor: 'text',
    minHeight: 80,
    color: '#fdf6e3',
    padding: 20,
    height: 'fit-content'
  },
  button: {
    marginTop: 10,
    textAlign: 'center'
  },
  output: {
    padding: 20,
    width: '33%',
    overflow: 'auto'
  },
  third: {
    padding: 20,
    width: '33%',
    overflow: 'auto'
  },
  textarea: {
    resize: 'none',
    padding: 20,
    backgroundColor: 'transparent',
    border: '1px solid rgb(204, 204, 204)',
    color: '#fdf6e3',
    width: 'calc(100% - 40px)',
    minHeight: 80
  },
  blocks: {
    width: 'calc(100% - 40px)'
  },
  draftHeading: {
    color: '#d33682'
  },
  markdownHeading: {
    color: '#2aa198'
  },
  blocksHeading: {
    color: '#b58900'
  }
};

export default App;
