import React from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useAppStore } from '../../store/appStore';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onExecute }) => {
  const { language } = useAppStore();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Configure editor if needed
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute();
    });
  };

  const mapLanguage = (lang: string) => {
    switch (lang) {
      case 'python': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 border-r border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-mono text-gray-400">EDITOR // {language.toUpperCase()}</span>
        <div className="flex gap-2">
            <button 
                onClick={onExecute}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
                RUN (Ctrl+Enter)
            </button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={mapLanguage(language)}
          language={mapLanguage(language)}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"Fira Code", monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
