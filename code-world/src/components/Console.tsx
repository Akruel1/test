import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { ConsoleMessage } from '../types';

const Console = () => {
  const { consoleMessages, clearConsole, currentLevel } = useGameStore();
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  const getMessageStyle = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-neon-green border-l-neon-green';
      case 'error':
        return 'text-red-400 border-l-red-400';
      case 'warning':
        return 'text-yellow-400 border-l-yellow-400';
      case 'system':
        return 'text-neon-purple border-l-neon-purple';
      case 'player':
        return 'text-neon-blue border-l-neon-blue';
      default:
        return 'text-gray-300 border-l-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-neon-purple">Консоль</span>
          <span className="text-xs text-gray-500 font-mono">
            ({consoleMessages.length} сообщений)
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={clearConsole}
          className="text-gray-400 hover:text-neon-blue transition-colors"
          title="Очистить консоль"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      </div>

      {/* Messages */}
      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-sm"
      >
        {consoleMessages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p className="mb-2">📺 Консоль пуста</p>
            <p className="text-xs">Запусти код, чтобы увидеть результат</p>
          </div>
        ) : (
          <AnimatePresence>
            {consoleMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`border-l-2 pl-3 py-1 ${getMessageStyle(msg.type)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 shrink-0">
                    [{formatTime(new Date(msg.timestamp))}]
                  </span>
                  <span className="break-all">{msg.content}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Hints Section */}
      {currentLevel && currentLevel.hints.length > 0 && (
        <div className="border-t border-dark-border p-3">
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-2">
              <span className="transform group-open:rotate-90 transition-transform">▶</span>
              Подсказки ({currentLevel.hints.length})
            </summary>
            <div className="mt-2 space-y-1">
              {currentLevel.hints.map((hint, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-xs text-gray-500 pl-4 border-l border-dark-border"
                >
                  💡 {hint}
                </motion.p>
              ))}
            </div>
          </details>
        </div>
      )}
    </motion.div>
  );
};

export default Console;
