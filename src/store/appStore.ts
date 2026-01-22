import { create } from 'zustand';

export type Entity = {
  id: string;
  type: 'player' | 'wall' | 'goal' | 'collectible';
  x: number;
  y: number;
  color?: string;
};

export type LogMessage = {
  id: string;
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: number;
};

type AppState = {
  view: 'intro' | 'game';
  setView: (view: 'intro' | 'game') => void;
  language: 'python' | 'javascript' | 'java' | 'cpp';
  setLanguage: (lang: 'python' | 'javascript' | 'java' | 'cpp') => void;
  
  // Game State
  entities: Entity[];
  setEntities: (entities: Entity[]) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  addLog: (message: string, type?: 'info' | 'error' | 'success') => void;
  logs: LogMessage[];
  clearLogs: () => void;
  
  // Code State
  code: string;
  setCode: (code: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: 'intro',
  setView: (view) => set({ view }),
  language: 'python',
  setLanguage: (language) => set({ language }),
  
  entities: [
    { id: 'player', type: 'player', x: 1, y: 1 },
    { id: 'wall1', type: 'wall', x: 3, y: 1 },
    { id: 'wall2', type: 'wall', x: 3, y: 2 },
    { id: 'wall3', type: 'wall', x: 3, y: 3 },
    { id: 'goal', type: 'goal', x: 8, y: 5 },
  ],
  setEntities: (entities) => set({ entities }),
  updateEntity: (id, updates) => set((state) => ({
    entities: state.entities.map(e => e.id === id ? { ...e, ...updates } : e)
  })),
  
  logs: [],
  addLog: (message, type = 'info') => set((state) => ({ 
    logs: [...state.logs, { id: Math.random().toString(36), message, type, timestamp: Date.now() }] 
  })),
  clearLogs: () => set({ logs: [] }),

  code: '# Write your code here to control the player\n# Available commands:\n# player.move_right()\n# player.move_left()\n# player.move_up()\n# player.move_down()\n\nplayer.move_right()\nplayer.move_right()\nplayer.move_down()',
  setCode: (code) => set({ code }),
}));
