import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { executeCode, getLanguageInfo } from '../utils/codeExecutor';
import type { ProgrammingLanguage } from '../types';

const CodeEditor = () => {
  const {
    code,
    setCode,
    selectedLanguage,
    setLanguage,
    isExecutingCode,
    setExecutingCode,
    addToQueue,
    clearQueue,
    addConsoleMessage,
    clearConsole,
    player,
    objects,
    updateProgress,
    userProgress,
  } = useGameStore();

  const languages: ProgrammingLanguage[] = ['javascript', 'python', 'typescript'];

  const handleRunCode = useCallback(async () => {
    if (isExecutingCode || !player) return;

    clearConsole();
    clearQueue();
    setExecutingCode(true);
    addConsoleMessage('system', '🚀 Запуск программы...');

    const gameState = {
      playerPosition: player.position,
      objects: objects,
    };

    try {
      const result = await executeCode(code, selectedLanguage, gameState);

      // Add output messages to console
      result.output.forEach(msg => {
        addConsoleMessage('info', msg);
      });

      // Add errors to console
      result.errors.forEach(error => {
        addConsoleMessage('error', error.message);
        if (error.hint) {
          addConsoleMessage('warning', `💡 Подсказка: ${error.hint}`);
        }
      });

      // Queue commands for execution
      result.commands.forEach(cmd => {
        addToQueue(cmd);
      });

      // Update progress
      updateProgress({
        totalCodeExecutions: userProgress.totalCodeExecutions + 1,
        totalErrors: userProgress.totalErrors + result.errors.length,
      });

      if (result.success) {
        addConsoleMessage('success', `✅ Программа выполнена за ${result.executionTime.toFixed(2)}мс`);
      } else {
        addConsoleMessage('error', '❌ Программа завершилась с ошибками');
      }
    } catch (error) {
      addConsoleMessage('error', `💥 Критическая ошибка: ${(error as Error).message}`);
    }

    // Execution will be set to false when all commands are processed
    setTimeout(() => {
      setExecutingCode(false);
    }, 100);
  }, [code, selectedLanguage, player, objects, isExecutingCode, clearConsole, clearQueue, setExecutingCode, addConsoleMessage, addToQueue, updateProgress, userProgress]);

  const handleEditorMount = (editor: unknown) => {
    // Focus editor on mount
    (editor as { focus: () => void }).focus();
  };

  const getMonacoLanguage = (lang: ProgrammingLanguage) => {
    switch (lang) {
      case 'python': return 'python';
      case 'typescript': return 'typescript';
      default: return 'javascript';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full panel"
    >
      {/* Header with language selector */}
      <div className="flex items-center justify-between p-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-neon-blue">Редактор</span>
        </div>
        
        {/* Language Selector */}
        <div className="flex gap-1">
          {languages.map((lang) => {
            const info = getLanguageInfo(lang);
            return (
              <motion.button
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  selectedLanguage === lang
                    ? 'bg-neon-blue/20 border border-neon-blue text-neon-blue'
                    : 'bg-dark-bg border border-dark-border text-gray-400 hover:text-gray-200'
                }`}
                title={info.name}
              >
                <span className="mr-1">{info.icon}</span>
                {info.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getMonacoLanguage(selectedLanguage)}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Run Button */}
      <div className="p-3 border-t border-dark-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunCode}
          disabled={isExecutingCode}
          className={`w-full py-3 font-pixel text-sm rounded transition-all flex items-center justify-center gap-2 ${
            isExecutingCode
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green hover:text-dark-bg'
          }`}
        >
          {isExecutingCode ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.span>
              Выполнение...
            </>
          ) : (
            <>
              <span>▶</span>
              ЗАПУСТИТЬ КОД
            </>
          )}
        </motion.button>
        
        {/* Keyboard shortcut hint */}
        <p className="text-center text-xs text-gray-500 mt-2 font-mono">
          Ctrl + Enter для запуска
        </p>
      </div>
    </motion.div>
  );
};

export default CodeEditor;
