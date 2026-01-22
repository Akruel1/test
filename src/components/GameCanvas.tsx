import React, { useRef, useEffect } from 'react';

interface GameCanvasProps {
  onMount?: (canvas: HTMLCanvasElement) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onMount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && onMount) {
      onMount(canvasRef.current);
    }
  }, [onMount]);

  return (
    <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
      <div className="absolute top-0 left-0 p-4 font-mono text-xs text-game-primary opacity-50 pointer-events-none">
        <div>COORDS: [0, 0]</div>
        <div>FPS: 60</div>
      </div>
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-800 shadow-2xl shadow-game-primary/20"
        width={800}
        height={600}
      />
    </div>
  );
};

export default GameCanvas;
