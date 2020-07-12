import React, { useState, useCallback, useRef } from 'react';
import { Editor, EditorState, convertToRaw } from 'draft-js';
import { draftjsToMd } from 'draftjs-md-converter';

import 'draft-js/dist/Draft.css';

function App() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);

  const focus = useCallback(() => {
    editorRef.current.focus();
  }, [editorRef]);

  const plainText = draftjsToMd(convertToRaw(editorState.getCurrentContent()));

  return (
    <div style={styles.background}>
      <h1 style={styles.heading}>Draft.js Markdown Converter Demo</h1>
      <div style={styles.root}>
        <div style={styles.third}>
          <h3>Draft.js</h3>
          <div style={styles.editor} onClick={focus}>
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={setEditorState}
              placeholder="Enter some text..."
            />
          </div>
        </div>
        <div style={styles.third}>
          <div>
            <h3>Markdown</h3>
            <textarea style={styles.textarea} value={plainText} />
          </div>
        </div>
        <div style={styles.third}>
          <div style={styles.blocks}>
            <h3>Draft.js blocks</h3>
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
    color: 'white',
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
    border: '1px solid #ccc',
    cursor: 'text',
    minHeight: 80,
    color: 'white',
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
    color: 'white',
    width: 'calc(100% - 40px)',
    minHeight: 80
  },
  blocks: {
    width: 'calc(100% - 40px)'
  }
};

export default App;
