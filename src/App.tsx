import React, { useState } from 'react';
import { Terminal, Play, Code2, Settings, HelpCircle } from 'lucide-react';
import { GameProvider } from './contexts/GameContext';
import GameViewport from './components/GameViewport';
import CodeEditor from './components/CodeEditor';
import ConsolePanel from './components/ConsolePanel';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'editor' | 'game'>('game');

  return (
    <div className="flex h-screen w-full bg-dark-bg text-white overflow-hidden font-mono selection:bg-neon-purple selection:text-white">
      {/* Sidebar / Navigation */}
      <div className="w-16 flex flex-col items-center py-4 bg-gray-950 border-r border-gray-800 z-10">
        <div className="p-2 mb-6 bg-neon-purple/20 text-neon-purple rounded-lg shadow-[0_0_15px_rgba(176,38,255,0.3)]">
          <Code2 size={24} />
        </div>
        
        <div className="flex flex-col gap-6 w-full items-center">
          <button 
            onClick={() => setActiveTab('game')}
            className={`p-2 rounded-lg transition-all duration-300 relative group ${activeTab === 'game' ? 'text-neon-blue' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Play size={20} />
            {activeTab === 'game' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-blue rounded-r-full -ml-4" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('editor')}
            className={`p-2 rounded-lg transition-all duration-300 relative group ${activeTab === 'editor' ? 'text-neon-purple' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Terminal size={20} />
            {activeTab === 'editor' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-purple rounded-r-full -ml-4" />}
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4 text-gray-600">
          <button className="hover:text-gray-400 transition-colors"><Settings size={20} /></button>
          <button className="hover:text-gray-400 transition-colors"><HelpCircle size={20} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-12 border-b border-gray-800 flex items-center px-6 bg-gray-900/50 backdrop-blur-sm z-10">
          <h1 className="text-sm font-bold tracking-[0.2em] text-neon-purple drop-shadow-[0_0_5px_rgba(176,38,255,0.5)]">
            CODE_WORLD<span className="text-gray-600">_V1.0</span>
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
              <span className="text-[10px] font-bold text-neon-green tracking-wider">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <main className="flex-1 flex overflow-hidden">
          {/* Game View (Left) */}
          <GameViewport />

          {/* Code Editor & Console (Right) */}
          <div className="w-[500px] flex flex-col border-l border-gray-800 bg-gray-950 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-10">
            <div className="flex-1 flex flex-col min-h-0">
              <CodeEditor />
            </div>
            <ConsolePanel />
          </div>
        </main>
      </div>
    </div>
  );
}

import IntroOverlay from './components/IntroOverlay';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <GameProvider>
      {showIntro ? (
        <IntroOverlay onComplete={() => setShowIntro(false)} />
      ) : (
        <AppContent />
      )}
    </GameProvider>
  );
}

export default App;
