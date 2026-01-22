import type { Level, GameObject } from '../types';

// Helper to create wall objects
const createWall = (id: string, x: number, y: number, width: number, height: number): GameObject => ({
  id,
  type: 'wall',
  position: { x, y },
  size: { width, height },
  solid: true,
  interactive: false,
  color: '#1a1a2e',
});

// Helper to create collectible coins
const createCoin = (id: string, x: number, y: number): GameObject => ({
  id,
  type: 'coin',
  position: { x, y },
  size: { width: 16, height: 16 },
  solid: false,
  interactive: true,
  color: '#ffd700',
  data: { value: 10 },
});

// Helper to create doors
const createDoor = (id: string, x: number, y: number, locked: boolean = true): GameObject => ({
  id,
  type: 'door',
  position: { x, y },
  size: { width: 32, height: 32 },
  solid: locked,
  interactive: true,
  color: locked ? '#8b4513' : '#228b22',
  data: { locked, requiredKey: locked ? 'key-1' : null },
});

// Helper to create keys
const createKey = (id: string, x: number, y: number): GameObject => ({
  id,
  type: 'key',
  position: { x, y },
  size: { width: 16, height: 16 },
  solid: false,
  interactive: true,
  color: '#ffd700',
  data: { keyId: 'key-1' },
});

// Helper to create terminal/computer
const createTerminal = (id: string, x: number, y: number, message: string): GameObject => ({
  id,
  type: 'terminal',
  position: { x, y },
  size: { width: 32, height: 32 },
  solid: true,
  interactive: true,
  color: '#00f3ff',
  data: { message },
});

// Helper to create portal
const createPortal = (id: string, x: number, y: number, targetLevel: string): GameObject => ({
  id,
  type: 'portal',
  position: { x, y },
  size: { width: 32, height: 32 },
  solid: false,
  interactive: true,
  color: '#b14aed',
  data: { targetLevel },
});

// Level 1: Introduction - Learn to move
export const level1: Level = {
  id: 'level-1',
  name: 'Пробуждение',
  description: 'Научитесь управлять персонажем с помощью кода. Используйте команды движения, чтобы достичь портала.',
  width: 320,
  height: 320,
  tileSize: 32,
  playerStart: { x: 48, y: 48 },
  objects: [
    // Walls around the room
    createWall('wall-top', 0, 0, 320, 16),
    createWall('wall-bottom', 0, 304, 320, 16),
    createWall('wall-left', 0, 0, 16, 320),
    createWall('wall-right', 304, 0, 16, 320),
    
    // Some inner walls to create a path
    createWall('wall-inner-1', 96, 96, 128, 16),
    createWall('wall-inner-2', 96, 192, 16, 96),
    
    // Coins to collect
    createCoin('coin-1', 144, 48),
    createCoin('coin-2', 240, 144),
    createCoin('coin-3', 144, 240),
    
    // Portal at the end
    createPortal('portal-1', 256, 256, 'level-2'),
  ],
  objectives: [
    {
      id: 'obj-1',
      description: 'Напиши код, чтобы переместить персонажа',
      type: 'execute_code',
      completed: false,
    },
    {
      id: 'obj-2',
      description: 'Собери хотя бы одну монету',
      type: 'collect_item',
      target: 'coin',
      completed: false,
    },
    {
      id: 'obj-3',
      description: 'Достигни портала',
      type: 'reach_position',
      target: 'portal-1',
      completed: false,
    },
  ],
  hints: [
    'Используй player.move("right") для движения вправо',
    'Команды движения: "up", "down", "left", "right"',
    'Можешь указать количество шагов: player.move("right", 3)',
  ],
  starterCode: {
    javascript: `// Добро пожаловать в CodeWorld!
// Используй команды для управления персонажем

// Двигайся вправо
player.move("right", 2);

// Двигайся вниз
player.move("down", 2);

// Попробуй собрать монеты и дойти до портала!
`,
    python: `# Добро пожаловать в CodeWorld!
# Используй команды для управления персонажем

# Двигайся вправо
player.move("right", 2)

# Двигайся вниз
player.move("down", 2)

# Попробуй собрать монеты и дойти до портала!
`,
    typescript: `// Добро пожаловать в CodeWorld!
// Используй команды для управления персонажем

// Двигайся вправо
player.move("right", 2);

// Двигайся вниз  
player.move("down", 2);

// Попробуй собрать монеты и дойти до портала!
`,
  },
};

// Level 2: Loops and conditions
export const level2: Level = {
  id: 'level-2',
  name: 'Циклы Судьбы',
  description: 'Используй циклы, чтобы пройти через лабиринт и собрать все монеты.',
  width: 480,
  height: 320,
  tileSize: 32,
  playerStart: { x: 48, y: 144 },
  objects: [
    // Outer walls
    createWall('wall-top', 0, 0, 480, 16),
    createWall('wall-bottom', 0, 304, 480, 16),
    createWall('wall-left', 0, 0, 16, 320),
    createWall('wall-right', 464, 0, 16, 320),
    
    // Maze walls
    createWall('maze-1', 96, 16, 16, 128),
    createWall('maze-2', 96, 176, 16, 128),
    createWall('maze-3', 192, 64, 16, 128),
    createWall('maze-4', 288, 128, 16, 176),
    createWall('maze-5', 384, 16, 16, 192),
    
    // Line of coins (perfect for a loop)
    createCoin('coin-1', 144, 144),
    createCoin('coin-2', 176, 144),
    createCoin('coin-3', 208, 144),
    createCoin('coin-4', 240, 144),
    createCoin('coin-5', 272, 144),
    
    // Key for the door
    createKey('key-1', 336, 240),
    
    // Locked door
    createDoor('door-1', 432, 144, true),
    
    // Terminal with hint
    createTerminal('terminal-1', 144, 48, 'Подсказка: используй цикл for для сбора всех монет в ряду!'),
    
    // Exit portal
    createPortal('portal-2', 432, 80, 'level-3'),
  ],
  objectives: [
    {
      id: 'obj-1',
      description: 'Используй цикл для сбора монет',
      type: 'execute_code',
      completed: false,
    },
    {
      id: 'obj-2',
      description: 'Собери все монеты',
      type: 'collect_item',
      target: 'coin',
      completed: false,
    },
    {
      id: 'obj-3',
      description: 'Найди ключ и открой дверь',
      type: 'interact_object',
      target: 'door-1',
      completed: false,
    },
    {
      id: 'obj-4',
      description: 'Пройди через портал',
      type: 'reach_position',
      target: 'portal-2',
      completed: false,
    },
  ],
  hints: [
    'Используй цикл: for (let i = 0; i < 5; i++) { player.move("right"); }',
    'Собирай монеты автоматически при прохождении по ним',
    'Найди ключ, чтобы открыть дверь',
  ],
  starterCode: {
    javascript: `// Уровень 2: Циклы
// Тебе нужно собрать все монеты в ряду

// Попробуй использовать цикл!
for (let i = 0; i < 5; i++) {
  player.move("right");
}

// Теперь найди путь к ключу и двери
`,
    python: `# Уровень 2: Циклы
# Тебе нужно собрать все монеты в ряду

# Попробуй использовать цикл!
for i in range(5):
    player.move("right")

# Теперь найди путь к ключу и двери
`,
    typescript: `// Уровень 2: Циклы
// Тебе нужно собрать все монеты в ряду

// Попробуй использовать цикл!
for (let i = 0; i < 5; i++) {
  player.move("right");
}

// Теперь найди путь к ключу и двери
`,
  },
  unlockRequirements: ['level-1'],
};

// Level 3: Functions
export const level3: Level = {
  id: 'level-3',
  name: 'Функциональный Хаос',
  description: 'Создавай свои функции для решения сложных задач.',
  width: 480,
  height: 480,
  tileSize: 32,
  playerStart: { x: 48, y: 432 },
  objects: [
    // Outer walls
    createWall('wall-top', 0, 0, 480, 16),
    createWall('wall-bottom', 0, 464, 480, 16),
    createWall('wall-left', 0, 0, 16, 480),
    createWall('wall-right', 464, 0, 16, 480),
    
    // Complex maze
    createWall('maze-1', 96, 16, 16, 368),
    createWall('maze-2', 192, 96, 16, 368),
    createWall('maze-3', 288, 16, 16, 368),
    createWall('maze-4', 384, 96, 16, 368),
    
    // Coins in pattern
    createCoin('coin-1', 48, 48),
    createCoin('coin-2', 48, 240),
    createCoin('coin-3', 144, 432),
    createCoin('coin-4', 144, 48),
    createCoin('coin-5', 240, 432),
    createCoin('coin-6', 240, 48),
    createCoin('coin-7', 336, 432),
    createCoin('coin-8', 336, 48),
    createCoin('coin-9', 432, 240),
    
    // Terminal
    createTerminal('terminal-1', 48, 144, 'Создай функцию для повторяющегося паттерна движения!'),
    
    // Exit portal
    createPortal('portal-3', 432, 432, 'complete'),
  ],
  objectives: [
    {
      id: 'obj-1',
      description: 'Создай функцию для навигации',
      type: 'execute_code',
      completed: false,
    },
    {
      id: 'obj-2',
      description: 'Собери все монеты',
      type: 'collect_item',
      target: 'coin',
      completed: false,
    },
    {
      id: 'obj-3',
      description: 'Достигни финального портала',
      type: 'reach_position',
      target: 'portal-3',
      completed: false,
    },
  ],
  hints: [
    'Создай функцию: function navigateColumn() { ... }',
    'Замечаешь паттерн? Вверх-вниз повторяется',
    'Используй функции для избежания повторения кода',
  ],
  starterCode: {
    javascript: `// Уровень 3: Функции
// Создай свои функции для навигации по лабиринту

// Пример функции для движения вверх по коридору
function goUp(steps) {
  for (let i = 0; i < steps; i++) {
    player.move("up");
  }
}

// Пример функции для движения вниз
function goDown(steps) {
  for (let i = 0; i < steps; i++) {
    player.move("down");
  }
}

// Используй свои функции!
goUp(5);
player.move("right", 2);
`,
    python: `# Уровень 3: Функции
# Создай свои функции для навигации по лабиринту

# Пример функции для движения вверх по коридору
def go_up(steps):
    for i in range(steps):
        player.move("up")

# Пример функции для движения вниз
def go_down(steps):
    for i in range(steps):
        player.move("down")

# Используй свои функции!
go_up(5)
player.move("right", 2)
`,
    typescript: `// Уровень 3: Функции
// Создай свои функции для навигации по лабиринту

// Пример функции для движения вверх по коридору
function goUp(steps: number): void {
  for (let i = 0; i < steps; i++) {
    player.move("up");
  }
}

// Пример функции для движения вниз
function goDown(steps: number): void {
  for (let i = 0; i < steps; i++) {
    player.move("down");
  }
}

// Используй свои функции!
goUp(5);
player.move("right", 2);
`,
  },
  unlockRequirements: ['level-2'],
};

export const levels: Level[] = [level1, level2, level3];

export const getLevelById = (id: string): Level | undefined => {
  return levels.find(level => level.id === id);
};
