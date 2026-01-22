import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language = 'javascript' }) => {
  return (
    <div className="h-full w-full border-l border-gray-700 bg-[#1e1e1e] flex flex-col">
      <div className="bg-[#252526] px-4 py-2 text-xs text-gray-400 flex justify-between items-center border-b border-gray-800">
        <span>script.js</span>
        <span className="bg-game-primary text-black px-2 py-0.5 rounded text-[10px] font-bold">READY</span>
      </div>
      <Editor
        height="100%"
        defaultLanguage={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Fira Code, monospace',
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
