import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onRun }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '10px',
        background: '#1a1a20',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>SCRIPT_EDITOR_V1.0</span>
        <button
          onClick={onRun}
          style={{
            background: '#00ff9d',
            border: 'none',
            padding: '5px 15px',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '2px'
          }}
        >
          EXECUTE
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Courier New',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
