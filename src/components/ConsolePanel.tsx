import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const ConsolePanel: React.FC = () => {
  const { logs, clearLogs } = useGame();

  return (
    <div className="h-48 border-t border-gray-800 bg-black flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal size={14} />
          <span className="font-bold">SYSTEM_LOGS</span>
        </div>
        <button 
          onClick={clearLogs}
          className="text-gray-500 hover:text-red-400 transition-colors"
          title="Clear Console"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">>> No logs available...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-gray-600 select-none">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            <span className={`
              ${log.type === 'error' ? 'text-red-500' : ''}
              ${log.type === 'success' ? 'text-green-500' : ''}
              ${log.type === 'info' ? 'text-blue-300' : ''}
            `}>
              {log.type === 'error' && '❌ '}
              {log.type === 'success' && '✅ '}
              >> {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel;
