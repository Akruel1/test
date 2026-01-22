import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { GameObject, Player } from '../types';

const TILE_SIZE = 32;
const ANIMATION_FRAME_DELAY = 150;

// Colors for different object types
const OBJECT_COLORS: Record<string, string> = {
  wall: '#1a1a2e',
  floor: '#16213e',
  door: '#8b4513',
  key: '#ffd700',
  coin: '#ffd700',
  portal: '#b14aed',
  terminal: '#00f3ff',
  player: '#00f3ff',
  enemy: '#ff4444',
  npc: '#44ff44',
  chest: '#cd853f',
  trigger: 'transparent',
};

interface PixelCharacter {
  x: number;
  y: number;
  facing: string;
  state: string;
  animFrame: number;
}

// Animation frame counter for global animations
let globalAnimFrame = 0;
setInterval(() => {
  globalAnimFrame = (globalAnimFrame + 1) % 60;
}, ANIMATION_FRAME_DELAY);

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [pixelChar, setPixelChar] = useState<PixelCharacter>({
    x: 0,
    y: 0,
    facing: 'down',
    state: 'idle',
    animFrame: 0,
  });
  
  const { 
    currentLevel, 
    player, 
    objects,
    isExecutingCode,
    executionQueue,
    processNextCommand,
    updatePlayer,
    removeObject,
    addConsoleMessage,
  } = useGameStore();

  // Draw pixel art character
  const drawCharacter = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: string,
    animFrame: number
  ) => {
    const size = TILE_SIZE;
    const pixelSize = size / 16;
    
    // Character colors
    const skinColor = '#00f3ff';
    const bodyColor = '#b14aed';
    const eyeColor = '#0a0a0f';
    
    // Draw glow effect
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    
    // Simple pixel art character based on facing direction
    const drawPixel = (px: number, py: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + px * pixelSize, y + py * pixelSize, pixelSize, pixelSize);
    };
    
    // Head
    for (let px = 5; px <= 10; px++) {
      for (let py = 1; py <= 6; py++) {
        drawPixel(px, py, skinColor);
      }
    }
    
    // Eyes based on facing
    if (facing === 'down' || facing === 'left' || facing === 'right') {
      drawPixel(6, 3, eyeColor);
      drawPixel(7, 3, eyeColor);
      drawPixel(9, 3, eyeColor);
      drawPixel(10, 3, eyeColor);
    } else if (facing === 'up') {
      // Back of head
    }
    
    // Body
    for (let px = 4; px <= 11; px++) {
      for (let py = 7; py <= 11; py++) {
        drawPixel(px, py, bodyColor);
      }
    }
    
    // Arms with animation
    const armOffset = animFrame % 2 === 0 ? 0 : 1;
    for (let py = 7; py <= 10; py++) {
      drawPixel(2, py + armOffset, bodyColor);
      drawPixel(3, py + armOffset, bodyColor);
      drawPixel(12, py - armOffset, bodyColor);
      drawPixel(13, py - armOffset, bodyColor);
    }
    
    // Legs with walking animation
    const legOffset = animFrame % 2 === 0 ? 0 : 1;
    for (let py = 12; py <= 15; py++) {
      drawPixel(5 + legOffset, py, skinColor);
      drawPixel(6 + legOffset, py, skinColor);
      drawPixel(9 - legOffset, py, skinColor);
      drawPixel(10 - legOffset, py, skinColor);
    }
    
    ctx.shadowBlur = 0;
  }, []);

  // Draw a game object
  const drawObject = useCallback((ctx: CanvasRenderingContext2D, obj: GameObject) => {
    const { x, y } = obj.position;
    const { width, height } = obj.size;
    const color = obj.color || OBJECT_COLORS[obj.type] || '#ffffff';
    
    ctx.fillStyle = color;
    
    switch (obj.type) {
      case 'wall':
        // Brick pattern for walls
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#0f0f1a';
        ctx.lineWidth = 1;
        // Add brick lines
        for (let row = 0; row < height / 8; row++) {
          ctx.beginPath();
          ctx.moveTo(x, y + row * 8);
          ctx.lineTo(x + width, y + row * 8);
          ctx.stroke();
        }
        break;
        
      case 'coin':
        // Animated coin
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Inner circle
        ctx.fillStyle = '#ffed4a';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, width / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'key':
        // Key shape
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        // Key head
        ctx.beginPath();
        ctx.arc(x + 4, y + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        // Key shaft
        ctx.fillRect(x + 4, y + 4, 10, 3);
        // Key teeth
        ctx.fillRect(x + 12, y + 7, 2, 3);
        ctx.fillRect(x + 10, y + 7, 2, 2);
        ctx.shadowBlur = 0;
        break;
        
      case 'door':
        const isLocked = obj.data?.locked;
        ctx.fillStyle = isLocked ? '#8b4513' : '#228b22';
        ctx.fillRect(x, y, width, height);
        // Door frame
        ctx.strokeStyle = isLocked ? '#5d3a1a' : '#1a5f1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
        // Door handle
        ctx.fillStyle = isLocked ? '#ffd700' : '#00ff00';
        ctx.fillRect(x + width - 8, y + height / 2 - 2, 4, 4);
        if (isLocked) {
          // Lock icon
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(x + width / 2 - 3, y + height / 2 - 4, 6, 8);
        }
        break;
        
      case 'portal':
        // Animated portal
        ctx.shadowColor = '#b14aed';
        ctx.shadowBlur = 15;
        const time = Date.now() / 1000;
        const portalScale = 0.9 + Math.sin(time * 3) * 0.1;
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          (width / 2) * portalScale,
          (height / 2) * portalScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#b14aed';
        ctx.fill();
        // Inner glow
        ctx.beginPath();
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          (width / 4) * portalScale,
          (height / 4) * portalScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#e066ff';
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
        
      case 'terminal':
        // Computer terminal
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, width, height);
        // Screen
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 5;
        ctx.fillRect(x + 4, y + 4, width - 8, height - 12);
        // Screen content (blinking cursor)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
          ctx.fillStyle = '#0a0a0f';
          ctx.fillRect(x + 6, y + 6, 4, 8);
        }
        ctx.shadowBlur = 0;
        // Base
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(x + 8, y + height - 6, width - 16, 4);
        break;
        
      default:
        ctx.fillRect(x, y, width, height);
    }
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentLevel) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw objects (sorted by type for proper layering)
    const sortedObjects = [...objects].sort((a, b) => {
      const order = ['floor', 'trigger', 'coin', 'key', 'wall', 'door', 'terminal', 'portal', 'chest', 'npc', 'enemy'];
      return order.indexOf(a.type) - order.indexOf(b.type);
    });

    sortedObjects.forEach(obj => {
      drawObject(ctx, obj);
    });

    // Draw player
    if (player) {
      drawCharacter(
        ctx,
        pixelChar.x,
        pixelChar.y,
        pixelChar.facing,
        pixelChar.animFrame
      );
    }

    animationRef.current = requestAnimationFrame(render);
  }, [currentLevel, objects, player, pixelChar, drawObject, drawCharacter]);

  // Initialize player position
  useEffect(() => {
    if (player) {
      setPixelChar(prev => ({
        ...prev,
        x: player.position.x,
        y: player.position.y,
        facing: player.facing,
      }));
    }
  }, [player?.position.x, player?.position.y, player?.facing]);

  // Process command queue
  useEffect(() => {
    if (!isExecutingCode || executionQueue.length === 0) return;

    const processCommand = async () => {
      const command = processNextCommand();
      if (!command || !player) return;

      const { action, params, delay = 200 } = command;

      switch (action) {
        case 'move': {
          const direction = params.direction as string;
          const newPos = { ...player.position };
          
          switch (direction) {
            case 'up': newPos.y -= TILE_SIZE; break;
            case 'down': newPos.y += TILE_SIZE; break;
            case 'left': newPos.x -= TILE_SIZE; break;
            case 'right': newPos.x += TILE_SIZE; break;
          }

          // Check for wall collisions
          const collidesWithWall = objects.some(obj => 
            obj.solid &&
            newPos.x < obj.position.x + obj.size.width &&
            newPos.x + player.size.width > obj.position.x &&
            newPos.y < obj.position.y + obj.size.height &&
            newPos.y + player.size.height > obj.position.y
          );

          // Check level boundaries
          const outOfBounds = currentLevel && (
            newPos.x < 0 ||
            newPos.y < 0 ||
            newPos.x + player.size.width > currentLevel.width ||
            newPos.y + player.size.height > currentLevel.height
          );

          if (!collidesWithWall && !outOfBounds) {
            // Animate movement
            setPixelChar(prev => ({ ...prev, state: 'walking', facing: direction }));
            
            // Smooth movement animation
            const startX = pixelChar.x;
            const startY = pixelChar.y;
            const steps = 8;
            const stepDelay = delay / steps;
            
            for (let i = 1; i <= steps; i++) {
              await new Promise(resolve => setTimeout(resolve, stepDelay));
              setPixelChar(prev => ({
                ...prev,
                x: startX + ((newPos.x - startX) * i) / steps,
                y: startY + ((newPos.y - startY) * i) / steps,
                animFrame: prev.animFrame + 1,
              }));
            }

            updatePlayer({ position: newPos, facing: direction as Player['facing'] });

            // Check for collectibles at new position
            const collectible = objects.find(obj => 
              (obj.type === 'coin' || obj.type === 'key') &&
              newPos.x < obj.position.x + obj.size.width &&
              newPos.x + player.size.width > obj.position.x &&
              newPos.y < obj.position.y + obj.size.height &&
              newPos.y + player.size.height > obj.position.y
            );

            if (collectible) {
              removeObject(collectible.id);
              if (collectible.type === 'coin') {
                addConsoleMessage('success', `💰 Монета собрана! +${collectible.data?.value || 10} очков`);
              } else if (collectible.type === 'key') {
                updatePlayer({ inventory: [...player.inventory, collectible.data?.keyId as string] });
                addConsoleMessage('success', '🔑 Ключ найден!');
              }
            }

            // Check for portal
            const portal = objects.find(obj =>
              obj.type === 'portal' &&
              newPos.x < obj.position.x + obj.size.width &&
              newPos.x + player.size.width > obj.position.x &&
              newPos.y < obj.position.y + obj.size.height &&
              newPos.y + player.size.height > obj.position.y
            );

            if (portal) {
              addConsoleMessage('success', '🌀 Портал активирован! Уровень пройден!');
            }
          } else {
            addConsoleMessage('warning', '🚧 Путь заблокирован!');
            // Bump animation
            setPixelChar(prev => ({ ...prev, state: 'idle' }));
          }
          break;
        }

        case 'say': {
          addConsoleMessage('player', params.message as string);
          break;
        }

        case 'interact': {
          // Find nearby interactive objects
          const nearbyObjects = objects.filter(obj => 
            obj.interactive &&
            Math.abs(obj.position.x - player.position.x) <= TILE_SIZE &&
            Math.abs(obj.position.y - player.position.y) <= TILE_SIZE
          );

          if (nearbyObjects.length > 0) {
            const obj = nearbyObjects[0];
            if (obj.type === 'terminal') {
              addConsoleMessage('system', `📺 ${obj.data?.message || 'Терминал активирован'}`);
            } else if (obj.type === 'door') {
              if (obj.data?.locked && obj.data?.requiredKey) {
                if (player.inventory.includes(obj.data.requiredKey as string)) {
                  addConsoleMessage('success', '🔓 Дверь открыта!');
                  // Unlock the door
                  const doorIndex = objects.findIndex(o => o.id === obj.id);
                  if (doorIndex !== -1) {
                    const updatedObjects = [...objects];
                    updatedObjects[doorIndex] = {
                      ...obj,
                      solid: false,
                      data: { ...obj.data, locked: false },
                    };
                  }
                } else {
                  addConsoleMessage('warning', '🔒 Дверь заперта. Нужен ключ!');
                }
              }
            }
          } else {
            addConsoleMessage('info', 'Рядом нет интерактивных объектов');
          }
          break;
        }

        case 'wait': {
          await new Promise(resolve => setTimeout(resolve, params.duration as number));
          break;
        }
      }

      setPixelChar(prev => ({ ...prev, state: 'idle' }));

      // Process next command after delay
      if (executionQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    };

    processCommand();
  }, [isExecutingCode, executionQueue.length]);

  // Start render loop
  useEffect(() => {
    render();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render]);

  if (!currentLevel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-pixel text-neon-blue">Загрузка уровня...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative game-canvas-container"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={currentLevel.width}
        height={currentLevel.height}
        className="pixel-border bg-dark-bg"
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {/* Level Info Overlay */}
      <div className="absolute top-2 left-2 bg-dark-panel/80 px-3 py-1 rounded border border-dark-border">
        <span className="font-pixel text-xs text-neon-blue">
          {currentLevel.name}
        </span>
      </div>

      {/* Execution indicator */}
      {isExecutingCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 bg-neon-green/20 px-3 py-1 rounded border border-neon-green"
        >
          <span className="font-mono text-xs text-neon-green flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ●
            </motion.span>
            Выполнение...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameCanvas;
