import React, { useState, useCallback, useRef } from 'react';
import { Editor, EditorState, convertToRaw } from 'draft-js';
import { draftjsToMd } from 'draftjs-md-converter';

const PlainTextEditorExample = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);

  const focus = useCallback(() => {
    editorRef.current.focus();
  }, [editorRef]);

  const plainText = draftjsToMd(convertToRaw(editorState.getCurrentContent()));

  return (
    <div style={styles.root}>
      <div style={styles.editor} onClick={focus}>
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Enter some text..."
        />
      </div>
      <div style={styles.output}>{plainText}</div>
    </div>
  );
};

const styles = {
  root: {
    fontFamily: "'Helvetica', sans-serif",
    padding: 20,
    width: 600,
    margin: '0 auto'
  },
  editor: {
    border: '1px solid #ccc',
    cursor: 'text',
    minHeight: 80,
    padding: 10,
    color: 'white',
    marginBottom: 20
  },
  button: {
    marginTop: 10,
    textAlign: 'center'
  },
  output: {
    width: 600
  }
};

export default PlainTextEditorExample;
