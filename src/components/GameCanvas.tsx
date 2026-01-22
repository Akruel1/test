import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
}

const TILE_SIZE = 40;

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gameState.gridSize; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, gameState.gridSize * TILE_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= gameState.gridSize; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(gameState.gridSize * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }

    // Draw Player
    const { x, y } = gameState.player.position;
    ctx.fillStyle = '#00ff9d';
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 10;
    ctx.fillRect(x * TILE_SIZE + 5, y * TILE_SIZE + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    ctx.shadowBlur = 0;

    // Draw Target (Goal) - Mock goal at (8, 8)
    ctx.fillStyle = '#bd00ff';
    ctx.shadowColor = '#bd00ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(8 * TILE_SIZE + 10, 8 * TILE_SIZE + 10, TILE_SIZE - 20, TILE_SIZE - 20);
    ctx.shadowBlur = 0;

  }, [gameState]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      background: '#0a0a0c'
    }}>
      <canvas
        ref={canvasRef}
        width={gameState.gridSize * TILE_SIZE}
        height={gameState.gridSize * TILE_SIZE}
        style={{ border: '2px solid #333', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
};

export default GameCanvas;
