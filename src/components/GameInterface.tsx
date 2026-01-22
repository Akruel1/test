import React, { useState, useEffect, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import GameCanvas from './GameCanvas';
import Console from './Console';
import { GameState, LogEntry } from '../types';

const INITIAL_CODE = `// Write your code here to reach the purple target
// Available commands:
// moveRight()
// moveLeft()
// moveUp()
// moveDown()

function start() {
  moveRight();
  moveRight();
  moveDown();
}

start();
`;

const GameInterface: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem('cw_code') || INITIAL_CODE;
  });
  
  const [gameState, setGameState] = useState<GameState>({
    player: { position: { x: 1, y: 1 }, direction: 'RIGHT' },
    gridSize: 10,
    level: 1,
    isRunning: false,
    logs: []
  });

  const [commandQueue, setCommandQueue] = useState<string[]>([]);

  // Save code to local storage
  useEffect(() => {
    localStorage.setItem('cw_code', code);
  }, [code]);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setGameState(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
  }, []);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      player: { position: { x: 1, y: 1 }, direction: 'RIGHT' },
      logs: [],
      isRunning: false
    }));
    setCommandQueue([]);
    addLog('System reset.', 'info');
  };

  const handleRun = () => {
    resetGame();
    addLog('Compiling code...', 'info');

    const commands: string[] = [];
    
    try {
      // Look for function calls in the code string
      // This is a naive implementation for the prototype
      const regex = /(moveRight|moveLeft|moveUp|moveDown)\(\)/g;
      let match;
      while ((match = regex.exec(code)) !== null) {
        commands.push(match[1]);
      }
      
      if (commands.length === 0) {
        addLog('No valid commands found.', 'error');
        return;
      }

      setCommandQueue(commands);
      setGameState(prev => ({ ...prev, isRunning: true }));
      addLog(`Execution started. ${commands.length} commands queued.`, 'success');

    } catch (e) {
      addLog('Syntax Error.', 'error');
    }
  };

  useEffect(() => {
    if (!gameState.isRunning || commandQueue.length === 0) {
      if (gameState.isRunning && commandQueue.length === 0) {
         setGameState(prev => ({ ...prev, isRunning: false }));
         addLog('Execution finished.', 'info');
         // Check win condition
         if (gameState.player.position.x === 8 && gameState.player.position.y === 8) {
             addLog('LEVEL COMPLETED! Progress Saved.', 'success');
             // In a real game, this would unlock the next level
         }
      }
      return;
    }

    const timer = setTimeout(() => {
      const command = commandQueue[0];
      const rest = commandQueue.slice(1);
      
      setCommandQueue(rest);
      
      setGameState(prev => {
        const { x, y } = prev.player.position;
        let newX = x;
        let newY = y;

        switch (command) {
          case 'moveRight': newX = Math.min(x + 1, prev.gridSize - 1); break;
          case 'moveLeft': newX = Math.max(x - 1, 0); break;
          case 'moveDown': newY = Math.min(y + 1, prev.gridSize - 1); break;
          case 'moveUp': newY = Math.max(y - 1, 0); break;
        }

        addLog(`Executing: ${command}()`, 'info');

        return {
          ...prev,
          player: { ...prev.player, position: { x: newX, y: newY } }
        };
      });

    }, 500); // 500ms delay between steps

    return () => clearTimeout(timer);
  }, [gameState.isRunning, commandQueue, addLog]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f0f13' }}>
      <div style={{ flex: 1, borderRight: '1px solid #333', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, color: '#666' }}>
          LEVEL: 01 // SECTOR_7
        </div>
        <GameCanvas gameState={gameState} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 2, borderBottom: '1px solid #333', overflow: 'hidden' }}>
          <CodeEditor 
            code={code} 
            onChange={(val) => setCode(val || '')} 
            onRun={handleRun} 
          />
        </div>
        <div style={{ flex: 1, minHeight: '200px' }}>
          <Console logs={gameState.logs} />
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
