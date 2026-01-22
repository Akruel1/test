import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import GameCanvas from './GameCanvas';
import CodeEditor from './CodeEditor';
import Console from './Console';

const GameLayout = () => {
  const { 
    setScreen, 
    isPaused, 
    setPaused, 
    currentLevel,
    setExecutingCode,
    clearQueue,
  } = useGameStore();

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  const handlePause = useCallback(() => {
    setPaused(!isPaused);
  }, [isPaused, setPaused]);

  const handleStopExecution = () => {
    clearQueue();
    setExecutingCode(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handlePause();
      }
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Trigger run from CodeEditor
        const runButton = document.querySelector('[data-run-code]') as HTMLButtonElement;
        runButton?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePause]);

  return (
    <div className="fixed inset-0 bg-dark-bg overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Main Layout */}
      <div className="relative h-full flex flex-col">
        {/* Top Bar */}
        <header className="h-12 border-b border-dark-border bg-dark-panel/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
          {/* Left: Back button and level name */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBackToMenu}
              className="text-gray-400 hover:text-neon-blue transition-colors"
              title="Вернуться в меню"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>

            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm text-neon-blue">
                {currentLevel?.name || 'Code World'}
              </span>
            </div>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="font-pixel text-xs">
              <span className="text-neon-blue">CODE</span>
              <span className="text-neon-purple">WORLD</span>
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStopExecution}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Остановить выполнение"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePause}
              className="text-gray-400 hover:text-neon-purple transition-colors"
              title="Пауза (ESC)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex min-h-0 p-4 gap-4">
          {/* Left Panel: Game Canvas and Objectives */}
          <div className="w-1/2 flex flex-col gap-4">
            {/* Game Canvas */}
            <div className="flex-1 flex items-center justify-center">
              <GameCanvas />
            </div>

            {/* Objectives */}
            {currentLevel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel p-4"
              >
                <h3 className="font-pixel text-xs text-neon-purple mb-3">ЗАДАНИЯ</h3>
                <div className="space-y-2">
                  {currentLevel.objectives.map((obj) => (
                    <div
                      key={obj.id}
                      className={`flex items-center gap-2 text-sm font-mono ${
                        obj.completed ? 'text-neon-green' : 'text-gray-400'
                      }`}
                    >
                      <span className={obj.completed ? 'text-neon-green' : 'text-gray-500'}>
                        {obj.completed ? '✓' : '○'}
                      </span>
                      <span>{obj.description}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel: Code Editor and Console */}
          <div className="w-1/2 flex flex-col gap-4">
            {/* Code Editor */}
            <div className="flex-1 min-h-0">
              <CodeEditor />
            </div>

            {/* Console */}
            <div className="h-48">
              <Console />
            </div>
          </div>
        </main>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-dark-bg/90 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handlePause}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="panel p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-pixel text-2xl text-neon-blue mb-6 neon-text">
              ПАУЗА
            </h2>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="btn-neon w-full"
              >
                ПРОДОЛЖИТЬ
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToMenu}
                className="w-full py-3 font-pixel text-sm bg-transparent border-2 border-gray-500 text-gray-400 hover:border-red-500 hover:text-red-400 transition-all"
              >
                В ГЛАВНОЕ МЕНЮ
              </motion.button>
            </div>

            <p className="mt-6 text-xs text-gray-500 font-mono">
              Нажми ESC для продолжения
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GameLayout;
