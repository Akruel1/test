import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { entities } = useAppStore();
  
  const GRID_SIZE = 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#111827'; // gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid
    ctx.strokeStyle = '#1f2937'; // gray-800
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw Entities
    entities.forEach(entity => {
      const x = entity.x * GRID_SIZE;
      const y = entity.y * GRID_SIZE;
      
      if (entity.type === 'player') {
        ctx.fillStyle = '#10b981'; // emerald-500
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fillRect(x + 5, y + 5, GRID_SIZE - 10, GRID_SIZE - 10);
        ctx.shadowBlur = 0;
      } else if (entity.type === 'wall') {
        ctx.fillStyle = '#374151'; // gray-700
        ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
      } else if (entity.type === 'goal') {
        ctx.fillStyle = '#f59e0b'; // amber-500
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
  }, [entities]);

  return (
    <div className="flex-1 bg-gray-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-4 left-4 text-green-500 font-mono text-sm opacity-50">
        GAME VIEW // LIVE
      </div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="border border-gray-800 rounded shadow-2xl"
      />
    </div>
  );
};
