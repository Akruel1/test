import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Square, ChevronDown } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python (Beta)' },
  { id: 'java', name: 'Java (Beta)' },
  { id: 'cpp', name: 'C++ (Beta)' },
];

const CodeEditor: React.FC = () => {
  const { code, setCode, isRunning, setIsRunning } = useGame();
  const [lang, setLang] = useState('javascript');

  const handleRun = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-400">SCRIPT_EDITOR</span>
          
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs text-neon-blue bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
              {languages.find(l => l.id === lang)?.name}
              <ChevronDown size={12} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-32 bg-gray-900 border border-gray-800 rounded shadow-xl hidden group-hover:block z-50">
              {languages.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-800 ${lang === l.id ? 'text-neon-blue' : 'text-gray-400'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleRun}
          className={`
            flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-all
            ${isRunning 
              ? 'bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900' 
              : 'bg-green-900/50 text-green-400 border border-green-800 hover:bg-green-900'
            }
          `}
        >
          {isRunning ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          {isRunning ? 'STOP' : 'RUN_CODE'}
        </button>
      </div>
      <div className="flex-1 pt-2">
        <Editor
          height="100%"
          language={lang}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Courier New',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
