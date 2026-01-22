// Game Types
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface GameObject {
  id: string;
  type: GameObjectType;
  position: Position;
  size: { width: number; height: number };
  sprite?: string;
  color?: string;
  solid: boolean;
  interactive: boolean;
  data?: Record<string, unknown>;
}

export type GameObjectType = 
  | 'player'
  | 'wall'
  | 'floor'
  | 'door'
  | 'key'
  | 'coin'
  | 'enemy'
  | 'npc'
  | 'portal'
  | 'terminal'
  | 'chest'
  | 'trigger';

export interface Player extends GameObject {
  type: 'player';
  health: number;
  maxHealth: number;
  inventory: string[];
  facing: 'up' | 'down' | 'left' | 'right';
  state: PlayerState;
}

export type PlayerState = 'idle' | 'walking' | 'running' | 'interacting' | 'celebrating';

export interface Level {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  tileSize: number;
  objects: GameObject[];
  playerStart: Position;
  objectives: Objective[];
  hints: string[];
  starterCode: Record<ProgrammingLanguage, string>;
  unlockRequirements?: string[];
}

export interface Objective {
  id: string;
  description: string;
  type: ObjectiveType;
  target?: string;
  completed: boolean;
}

export type ObjectiveType = 
  | 'reach_position'
  | 'collect_item'
  | 'interact_object'
  | 'defeat_enemy'
  | 'solve_puzzle'
  | 'execute_code';

// Programming Types
export type ProgrammingLanguage = 'python' | 'javascript' | 'typescript';

export interface CodeExecutionResult {
  success: boolean;
  output: string[];
  errors: GameError[];
  commands: GameCommand[];
  executionTime: number;
}

export interface GameError {
  type: 'syntax' | 'runtime' | 'logic';
  message: string;
  line?: number;
  column?: number;
  hint?: string;
}

export interface GameCommand {
  action: GameAction;
  params: Record<string, unknown>;
  delay?: number;
}

export type GameAction = 
  | 'move'
  | 'turn'
  | 'interact'
  | 'say'
  | 'collect'
  | 'use'
  | 'wait'
  | 'jump'
  | 'attack'
  | 'inspect'
  | 'create'
  | 'destroy'
  | 'setProperty';

// UI Types
export interface ConsoleMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'player';
  content: string;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProgress {
  currentLevel: string;
  completedLevels: string[];
  achievements: Achievement[];
  totalCodeExecutions: number;
  totalErrors: number;
  playTime: number;
  lastPlayed: Date;
}

// App State Types
export type AppScreen = 
  | 'loading'
  | 'intro'
  | 'menu'
  | 'game'
  | 'levelSelect'
  | 'settings'
  | 'achievements';

export interface GameState {
  screen: AppScreen;
  isPlaying: boolean;
  isPaused: boolean;
  currentLevel: Level | null;
  player: Player | null;
  objects: GameObject[];
  consoleMessages: ConsoleMessage[];
  isExecutingCode: boolean;
  selectedLanguage: ProgrammingLanguage;
  code: string;
  executionQueue: GameCommand[];
}
