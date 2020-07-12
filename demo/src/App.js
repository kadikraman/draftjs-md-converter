import React from 'react';
import Editor from './components/Editor';
import 'draft-js/dist/Draft.css';

function App() {
  return (
    <div style={styles.background}>
      <h1>Draft.js Markdown Converter Demo</h1>
      <h2>Draft.js -> Markdown</h2>
      <Editor />
    </div>
  );
}

const styles = {
  background: {
    backgroundColor: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
    paddingTop: 40
  }
};

export default App;
