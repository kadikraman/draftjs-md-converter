const { Editor, EditorState, RichUtils, ContentState } = Draft;

const STYLES = [
  { label: 'B', style: 'BOLD' },
  { label: 'I', style: 'ITALIC' }
];

class StyleButton extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    const { active } = this.props;
    let classes = "StyleButton";
    if (active) {
      classes = classes + " --active";
    }
    return (
      <div className={classes} onMouseDown={this.onToggle}>
        {this.props.label}
      </div>
    );
  }
}

class StyleButtons extends React.Component {
  render() {
    const { type, editorState } = this.props;
    const currentStyle = editorState.getCurrentInlineStyle();
    return (
      <div className="StyleButtons">
        {STYLES.map(type =>
          <StyleButton
            key={type.label}
            label={type.label}
            style={type.style}
            onToggle={this.props.onToggle}
            active={currentStyle.has(type.style)}
          />
        )}
      </div>
    );
  }
}

class Example extends React.Component {
  constructor(props) {
    super(props);
    const contentState = ContentState.createFromText(this.props.initialText);
    const newEditorState = EditorState.createWithContent(contentState);
    this.state = { editorState: newEditorState };
    this.onChange = (editorState) => this.setState({ editorState });
    this.toggleStyle = (toggledStyle) => this.toggleInlineStyle(toggledStyle);
  }

  toggleInlineStyle(toggledStyle) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, toggledStyle));
  }

  render() {
    const { editorState } = this.state;
    return (
      <div className="Example">
        <StyleButtons editorState={editorState} onToggle={this.toggleStyle} />
        <div className="Editor">
          <Editor editorState={editorState} onChange={this.onChange} />
        </div>
        <div className="Markdown">
          {editorState.getCurrentContent().getPlainText()}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Example initialText="Hello, world!" />,
  document.getElementById('content')
);
