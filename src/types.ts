export interface Position {
  x: number;
  y: number;
}

export interface Player {
  position: Position;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: number;
}

export interface GameState {
  player: Player;
  gridSize: number;
  level: number;
  isRunning: boolean;
  logs: LogEntry[];
}
