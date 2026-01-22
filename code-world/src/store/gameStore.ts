import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppScreen,
  ProgrammingLanguage,
  ConsoleMessage,
  Level,
  Player,
  GameObject,
  GameCommand,
  UserProgress,
} from '../types';

interface GameStore {
  // App State
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  
  // Game State
  isPlaying: boolean;
  isPaused: boolean;
  currentLevel: Level | null;
  player: Player | null;
  objects: GameObject[];
  
  // Code State
  selectedLanguage: ProgrammingLanguage;
  code: string;
  isExecutingCode: boolean;
  executionQueue: GameCommand[];
  
  // Console
  consoleMessages: ConsoleMessage[];
  
  // Progress
  userProgress: UserProgress;
  
  // Actions
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentLevel: (level: Level | null) => void;
  setPlayer: (player: Player | null) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  setObjects: (objects: GameObject[]) => void;
  addObject: (object: GameObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<GameObject>) => void;
  
  setLanguage: (language: ProgrammingLanguage) => void;
  setCode: (code: string) => void;
  setExecutingCode: (executing: boolean) => void;
  addToQueue: (command: GameCommand) => void;
  clearQueue: () => void;
  processNextCommand: () => GameCommand | null;
  
  addConsoleMessage: (type: ConsoleMessage['type'], content: string) => void;
  clearConsole: () => void;
  
  completeLevel: (levelId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  
  resetGame: () => void;
  initializeLevel: (level: Level) => void;
}

const createInitialPlayer = (position: { x: number; y: number }): Player => ({
  id: 'player',
  type: 'player',
  position: { ...position },
  size: { width: 32, height: 32 },
  solid: true,
  interactive: false,
  health: 100,
  maxHealth: 100,
  inventory: [],
  facing: 'down',
  state: 'idle',
});

const defaultProgress: UserProgress = {
  currentLevel: 'level-1',
  completedLevels: [],
  achievements: [],
  totalCodeExecutions: 0,
  totalErrors: 0,
  playTime: 0,
  lastPlayed: new Date(),
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial State
      screen: 'loading',
      isPlaying: false,
      isPaused: false,
      currentLevel: null,
      player: null,
      objects: [],
      selectedLanguage: 'javascript',
      code: '',
      isExecutingCode: false,
      executionQueue: [],
      consoleMessages: [],
      userProgress: defaultProgress,

      // Screen Actions
      setScreen: (screen) => set({ screen }),

      // Game Actions
      setPlaying: (isPlaying) => set({ isPlaying }),
      setPaused: (isPaused) => set({ isPaused }),
      setCurrentLevel: (currentLevel) => set({ currentLevel }),
      
      setPlayer: (player) => set({ player }),
      updatePlayer: (updates) => set((state) => ({
        player: state.player ? { ...state.player, ...updates } : null,
      })),

      setObjects: (objects) => set({ objects }),
      addObject: (object) => set((state) => ({
        objects: [...state.objects, object],
      })),
      removeObject: (id) => set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
      })),
      updateObject: (id, updates) => set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj
        ),
      })),

      // Code Actions
      setLanguage: (selectedLanguage) => {
        const level = get().currentLevel;
        const code = level?.starterCode[selectedLanguage] || '';
        set({ selectedLanguage, code });
      },
      setCode: (code) => set({ code }),
      setExecutingCode: (isExecutingCode) => set({ isExecutingCode }),
      
      addToQueue: (command) => set((state) => ({
        executionQueue: [...state.executionQueue, command],
      })),
      clearQueue: () => set({ executionQueue: [] }),
      processNextCommand: () => {
        const state = get();
        if (state.executionQueue.length === 0) return null;
        const [command, ...rest] = state.executionQueue;
        set({ executionQueue: rest });
        return command;
      },

      // Console Actions
      addConsoleMessage: (type, content) => set((state) => ({
        consoleMessages: [
          ...state.consoleMessages,
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            type,
            content,
            timestamp: new Date(),
          },
        ].slice(-100), // Keep last 100 messages
      })),
      clearConsole: () => set({ consoleMessages: [] }),

      // Progress Actions
      completeLevel: (levelId) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          completedLevels: state.userProgress.completedLevels.includes(levelId)
            ? state.userProgress.completedLevels
            : [...state.userProgress.completedLevels, levelId],
        },
      })),
      unlockAchievement: (achievementId) => set((state) => {
        const existing = state.userProgress.achievements.find(a => a.id === achievementId);
        if (existing?.unlocked) return state;
        
        return {
          userProgress: {
            ...state.userProgress,
            achievements: state.userProgress.achievements.map(a =>
              a.id === achievementId
                ? { ...a, unlocked: true, unlockedAt: new Date() }
                : a
            ),
          },
        };
      }),
      updateProgress: (updates) => set((state) => ({
        userProgress: { ...state.userProgress, ...updates },
      })),

      // Game Reset & Init
      resetGame: () => set({
        isPlaying: false,
        isPaused: false,
        currentLevel: null,
        player: null,
        objects: [],
        code: '',
        isExecutingCode: false,
        executionQueue: [],
        consoleMessages: [],
      }),

      initializeLevel: (level) => {
        const state = get();
        const player = createInitialPlayer(level.playerStart);
        const starterCode = level.starterCode[state.selectedLanguage] || '';
        
        set({
          currentLevel: level,
          player,
          objects: [...level.objects],
          code: starterCode,
          isPlaying: true,
          isPaused: false,
          executionQueue: [],
          consoleMessages: [{
            id: 'init',
            type: 'system',
            content: `🎮 Level loaded: ${level.name}`,
            timestamp: new Date(),
          }],
        });
      },
    }),
    {
      name: 'code-world-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
);
