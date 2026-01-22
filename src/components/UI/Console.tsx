import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Terminal, Trash2 } from 'lucide-react';

export const Console: React.FC = () => {
  const { logs, clearLogs } = useAppStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal size={14} />
          <span className="text-xs font-mono font-bold">SYSTEM LOGS</span>
        </div>
        <button 
          onClick={clearLogs}
          className="text-gray-500 hover:text-red-400 transition-colors"
          title="Clear Logs"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-sm space-y-1">
        {logs.length === 0 && (
          <div className="text-gray-600 italic px-2">System ready. Waiting for input...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`px-2 py-0.5 rounded ${
            log.type === 'error' ? 'text-red-400 bg-red-900/20' : 
            log.type === 'success' ? 'text-green-400 bg-green-900/20' : 
            'text-gray-300'
          }`}>
            <span className="opacity-50 text-xs mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            {log.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};
