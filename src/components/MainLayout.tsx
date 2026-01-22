import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Save } from 'lucide-react';
import GameCanvas from './GameCanvas';
import CodeEditor from './CodeEditor';
import { GameEngine } from '../game/GameEngine';
import { CodeExecutor } from '../game/CodeExecutor';

const DEFAULT_CODE = `// Welcome to Code World!
// Control your character with code.
// Goal: Reach the Red Square.
// API: moveRight(), moveLeft(), moveUp(), moveDown(), wait(ms)

await moveRight();
await moveRight();
await moveRight();
await moveDown();
await moveDown();
// Try adding more commands!
`;

const MainLayout: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const engineRef = useRef<GameEngine>(new GameEngine());
  const executorRef = useRef<CodeExecutor>(new CodeExecutor(engineRef.current));
  
  const handleCanvasMount = (canvas: HTMLCanvasElement) => {
    engineRef.current.setCanvas(canvas);
    engineRef.current.start();
  };

  const handleRun = async () => {
    console.log("Running code...");
    // Reset state before running? Maybe optional.
    engineRef.current.reset(); 
    await executorRef.current.run(code);
  };

  const handleReset = () => {
    engineRef.current.reset();
  };

  return (
    <div className="flex h-screen w-full bg-game-bg text-white overflow-hidden font-mono">
      {/* Game Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-full border border-game-primary/30 z-10 flex gap-6 shadow-lg shadow-game-primary/10">
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 text-game-primary hover:text-white hover:scale-105 transition-all"
            title="Run Code"
          >
            <Play size={20} fill="currentColor" />
            <span className="text-sm font-bold tracking-wider">EXECUTE</span>
          </button>
          
          <div className="w-px bg-gray-700 h-6 my-auto"></div>
          
          <button 
            onClick={handleReset}
            className="text-gray-400 hover:text-white hover:rotate-180 transition-all duration-500"
            title="Reset Level"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <GameCanvas onMount={handleCanvasMount} />
        
        {/* Output Console */}
        <div className="h-48 bg-[#0f0f1a] border-t border-gray-800 p-4 font-mono text-sm overflow-y-auto font-fira">
          <div className="text-gray-500 mb-2 uppercase tracking-widest text-xs">System Logs</div>
          <div className="text-game-primary">> System initialized.</div>
          <div className="text-game-text">> Environment loaded.</div>
          <div className="text-game-text">> Waiting for input sequence...</div>
        </div>
      </div>

      {/* Sidebar / Editor */}
      <div className="w-[45%] h-full flex flex-col border-l border-gray-800 shadow-2xl z-20 bg-[#1e1e1e]">
        <div className="bg-[#1e1e1e] border-b border-gray-800 p-3 flex justify-between items-center px-4 shadow-md">
          <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-game-primary animate-pulse"></span>
            SOURCE_CODE
          </span>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Save size={18} />
          </button>
        </div>
        <CodeEditor code={code} onChange={(val) => setCode(val || '')} />
      </div>
    </div>
  );
};

export default MainLayout;
