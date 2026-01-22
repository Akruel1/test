export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: 'PLAYER' | 'WALL' | 'GOAL' | 'ITEM';
  pos: Position;
  color: string;
  size: number;
}

export interface GameState {
  entities: Entity[];
  width: number;
  height: number;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  logs: string[];
}
