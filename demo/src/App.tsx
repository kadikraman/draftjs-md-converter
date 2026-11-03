import {
  CompositeDecorator,
  type ContentBlock,
  type ContentState,
  convertFromRaw,
  convertToRaw,
  type DraftHandleValue,
  type DraftStyleMap,
  Editor,
  EditorState,
  type RawDraftContentState,
  RichUtils,
} from 'draft-js';
import { draftjsToMd, mdToDraftjs } from 'draftjs-md-converter';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, ChevronIcon, CopyIcon, EraserIcon, ExternalIcon, GitHubIcon } from './icons';
import logoSrc from './logo.svg';

const repoUrl = 'https://github.com/kadikraman/draftjs-md-converter';

const initialMarkdown = [
  '# draftjs-md-converter',
  'Type in either box, and the other box follows.',
  '',
  'Inline styles: __bold__, *italic*, ~~strikethrough~~ and `inline code`.',
  'Links work too: [read the docs](https://github.com/kadikraman/draftjs-md-converter#readme).',
  '> Each Draft.js block is one line of Markdown.',
  '1. Ordered lists',
  '2. With nested items',
  '    1. Like this one',
  '- Unordered lists',
  '    - Nested too',
  '```js',
  'const markdown = draftjsToMd(convertToRaw(content));',
  '```',
].join('\n');

const modifierKey = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl+';

const shortcuts = [
  { key: 'B', label: 'bold' },
  { key: 'I', label: 'italic' },
  { key: 'J', label: 'code' },
];

const styleMap: DraftStyleMap = {
  CODE: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85em',
    padding: '0.1em 0.35em',
    borderRadius: 4,
    border: '1px solid var(--border)',
    background: 'var(--code-bg)',
  },
};

const findLinkEntities = (
  block: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) => {
  block.findEntityRanges((character) => {
    const key = character.getEntity();
    return key !== null && contentState.getEntity(key).getType() === 'LINK';
  }, callback);
};

interface LinkProps {
  contentState: ContentState;
  entityKey: string;
  children: ReactNode;
}

function Link({ contentState, entityKey, children }: LinkProps) {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const decorator = new CompositeDecorator([{ strategy: findLinkEntities, component: Link }]);

const editorStateFromMarkdown = (markdown: string): EditorState =>
  EditorState.createWithContent(
    convertFromRaw(mdToDraftjs(markdown) as RawDraftContentState),
    decorator,
  );

export function App() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [editorState, setEditorState] = useState(() => editorStateFromMarkdown(initialMarkdown));
  const [rawOpen, setRawOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const raw = useMemo(() => convertToRaw(editorState.getCurrentContent()), [editorState]);
  const rawJson = useMemo(() => JSON.stringify(raw, null, 2), [raw]);

  useEffect(() => {
    const textarea = markdownRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
    setEditorState(editorStateFromMarkdown(value));
  };

  const handleEditorChange = (nextEditorState: EditorState) => {
    setEditorState(nextEditorState);
    setMarkdown(draftjsToMd(convertToRaw(nextEditorState.getCurrentContent())));
  };

  const handleKeyCommand = (command: string, state: EditorState): DraftHandleValue => {
    const nextEditorState = RichUtils.handleKeyCommand(state, command);
    if (!nextEditorState) return 'not-handled';
    handleEditorChange(nextEditorState);
    return 'handled';
  };

  const handleClear = () => {
    setMarkdown('');
    setEditorState(EditorState.createEmpty(decorator));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawJson);
    clearTimeout(copiedTimer.current);
    setCopied(true);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page">
      <header className="siteHeader">
        <div className="container headerInner">
          <div className="brand">
            <img className="logo" src={logoSrc} alt="" width={30} height={30} />
            <span className="brandName">draftjs-md-converter</span>
            <a
              className="versionBadge"
              href={`https://www.npmjs.com/package/draftjs-md-converter/v/${__CONVERTER_VERSION__}`}
              aria-label={`Version ${__CONVERTER_VERSION__} on npm`}
              target="_blank"
              rel="noreferrer"
            >
              v{__CONVERTER_VERSION__}
              <ExternalIcon className="wideOnly" />
            </a>
          </div>
          <a
            className="githubLink"
            href={repoUrl}
            aria-label="draftjs-md-converter on GitHub"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon size={18} />
            <span className="wideOnly">GitHub</span>
          </a>
        </div>
      </header>

      <main className="container main">
        <div className="intro">
          <div className="introText">
            <h1 className="title">Convert between Draft.js and Markdown</h1>
            <p className="subtitle">Type in either box, and the other one follows.</p>
          </div>
          <button type="button" className="button" onClick={handleClear}>
            <EraserIcon />
            Clear
          </button>
        </div>

        <div className="editors">
          <section className="panel markdownPanel">
            <div className="panelHeader">
              <span className="swatch markdownSwatch" aria-hidden="true" />
              <label htmlFor="markdown-input" className="panelTitle">
                Markdown
              </label>
              <span className="panelHint">plain text</span>
            </div>
            <textarea
              id="markdown-input"
              ref={markdownRef}
              className="markdownInput"
              value={markdown}
              onChange={(event) => handleMarkdownChange(event.target.value)}
              spellCheck={false}
              placeholder="Type Markdown here"
            />
          </section>

          <section className="panel draftjsPanel">
            <div className="panelHeader">
              <span className="swatch draftjsSwatch" aria-hidden="true" />
              <span id="draftjs-label" className="panelTitle">
                Draft.js
              </span>
              <span className="panelHint">rich text</span>
              <div className="shortcuts">
                {shortcuts.map(({ key, label }) => (
                  <span key={key} className="shortcut">
                    <kbd>
                      {modifierKey}
                      {key}
                    </kbd>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="draftjsBody">
              <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                handleKeyCommand={handleKeyCommand}
                customStyleMap={styleMap}
                placeholder="Type rich text here"
                ariaLabelledBy="draftjs-label"
              />
            </div>
          </section>
        </div>

        <section className="panel rawPanel">
          <div className="rawHeader">
            <button
              type="button"
              className="rawToggle"
              aria-expanded={rawOpen}
              aria-controls="raw-json"
              onClick={() => setRawOpen(!rawOpen)}
            >
              <ChevronIcon className="chevron" />
              <span>Raw Draft.js content</span>
              <span className="blockCount wideOnly">
                {raw.blocks.length} {raw.blocks.length === 1 ? 'block' : 'blocks'}
              </span>
            </button>
            <button
              type="button"
              className={copied ? 'button copied' : 'button'}
              onClick={handleCopy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
          {rawOpen ? (
            <pre id="raw-json" className="rawJson">
              {rawJson}
            </pre>
          ) : null}
          <div className="visuallyHidden" aria-live="polite">
            {copied ? 'Draft.js JSON copied to clipboard' : ''}
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="container footerInner">
          <span>
            an OSS project by{' '}
            <a href="https://github.com/kadikraman" target="_blank" rel="noreferrer">
              Kadi Kraman
            </a>
          </span>
          {__CONVERTER_COMMIT__ ? (
            <span>
              built from{' '}
              <a
                className="commitLink"
                href={`${repoUrl}/commit/${__CONVERTER_COMMIT__}`}
                target="_blank"
                rel="noreferrer"
              >
                {__CONVERTER_COMMIT__.slice(0, 7)}
              </a>
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
