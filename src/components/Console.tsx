import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ConsoleProps {
  logs: LogEntry[];
}

const Console: React.FC<ConsoleProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{
      height: '100%',
      background: '#0f0f13',
      color: '#e0e0e0',
      fontFamily: 'monospace',
      padding: '10px',
      overflowY: 'auto',
      borderTop: '1px solid #333'
    }}>
      <div style={{ color: '#666', marginBottom: '5px' }}>// SYSTEM LOGS</div>
      {logs.map((log) => (
        <div key={log.id} style={{
          marginBottom: '4px',
          color: log.type === 'error' ? '#ff0055' : log.type === 'success' ? '#00ff9d' : '#aaa'
        }}>
          <span style={{ opacity: 0.5, marginRight: '10px' }}>
            [{new Date(log.timestamp).toLocaleTimeString()}]
          </span>
          {log.message}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default Console;
