import { useAppStore } from '../store/appStore';

export const executeCode = async (code: string) => {
  const store = useAppStore.getState();
  const { updateEntity, entities, addLog } = store;
  
  const player = entities.find(e => e.type === 'player');
  if (!player) {
      addLog('System Error: Player entity not found.', 'error');
      return;
  }

  addLog('Initializing Runtime Environment...', 'info');
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simple Mock Interpreter
  const lines = code.split('\n');
  
  // Reset player to start position (optional, or we continue from where we are? Game design choice. Usually reset.)
  // For now let's assume we continue, or we can reset if we store initial pos.
  // Let's reset to 1,1 for testing if it's not there? No, let's just run from current pos.
  
  let currentX = player.x;
  let currentY = player.y;

  addLog('Executing sequence...', 'info');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    // Small delay to visualize steps
    await new Promise(resolve => setTimeout(resolve, 500));

    let moved = false;
    let nextX = currentX;
    let nextY = currentY;

    if (trimmed.includes('move_right')) { // Loose matching for python/cpp/java syntax variations
        nextX++; moved = true;
    } else if (trimmed.includes('move_left')) {
        nextX--; moved = true;
    } else if (trimmed.includes('move_up')) {
        nextY--; moved = true;
    } else if (trimmed.includes('move_down')) {
        nextY++; moved = true;
    } else {
        // Unknown or just structural code
        // addLog(`Skipping: ${trimmed}`, 'info');
    }

    if (moved) {
        // Check collision with walls
        // We need to get fresh state in case dynamic things happened (not yet but good practice)
        // actually for this sync loop we use local `currentX` `currentY` but check against `store.entities`
        
        const currentEntities = useAppStore.getState().entities; 
        const collision = currentEntities.find(e => e.type === 'wall' && e.x === nextX && e.y === nextY);
        
        if (collision) {
            addLog(`RUNTIME ERROR: Collision detected at (${nextX}, ${nextY})`, 'error');
            // Shake effect or red flash could go here
            return; // Halt execution
        }

        // Check bounds (Canvas is 800x600, Grid 40 => 20x15)
        if (nextX < 0 || nextY < 0 || nextX >= 20 || nextY >= 15) {
             addLog(`RUNTIME ERROR: IndexOutOfBoundsException (${nextX}, ${nextY})`, 'error');
             return;
        }

        currentX = nextX;
        currentY = nextY;
        updateEntity(player.id, { x: currentX, y: currentY });
        
        // Check goal
        const goal = currentEntities.find(e => e.type === 'goal' && e.x === currentX && e.y === currentY);
        if (goal) {
            addLog('SUCCESS: Target reachable. Sequence complete.', 'success');
            // Trigger win state / next level
            return;
        }
    }
  }
  
  addLog('Sequence completed.', 'info');
};
