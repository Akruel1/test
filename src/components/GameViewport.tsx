import React, { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameEngine } from '../game/Engine';

const GameViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { registerRuntime, addLog } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fix canvas DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context if needed, but Engine handles drawing, so let's pass dimensions
    // Actually, let's keep it simple for now and rely on CSS size vs internal size
    
    if (!engineRef.current) {
      engineRef.current = new GameEngine(canvas, () => {
        addLog('GOAL REACHED! Sequence Complete.', 'success');
      });
      engineRef.current.start();
      
      // Register API
      registerRuntime(engineRef.current.getAPI());
      addLog('Game Engine initialized.', 'info');
    }

    const handleResize = () => {
      if (canvas && engineRef.current) {
         canvas.width = canvas.offsetWidth;
         canvas.height = canvas.offsetHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      engineRef.current?.stop();
    };
  }, []);

  return (
    <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
      />
      
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <div className="text-xs text-gray-500 font-mono bg-black/50 p-2 rounded border border-gray-800 backdrop-blur-sm">
          <div>STATUS: RUNNING</div>
          <div>FPS: 60</div>
        </div>
      </div>
    </div>
  );
};

export default GameViewport;
