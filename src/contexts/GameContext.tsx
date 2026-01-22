import React, { createContext, useContext, useState, ReactNode } from 'react';

type LogType = 'info' | 'error' | 'success';

interface LogMessage {
  id: string;
  message: string;
  type: LogType;
  timestamp: number;
}

interface GameAPI {
  move: (direction: 'up' | 'down' | 'left' | 'right') => void;
  wait: (ms: number) => Promise<unknown>;
}

interface GameContextType {
  code: string;
  setCode: (code: string) => void;
  logs: LogMessage[];
  addLog: (message: string, type?: LogType) => void;
  clearLogs: () => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  registerRuntime: (api: GameAPI) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [code, setCode] = useState<string>('// Async/Await is supported!\nasync function start() {\n  await hero.move("right");\n  await hero.move("down");\n  await hero.move("left");\n  await hero.move("up");\n}\n\nstart();');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [gameAPI, setGameAPI] = useState<GameAPI | null>(null);

  const addLog = (message: string, type: LogType = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    }]);
  };

  const clearLogs = () => setLogs([]);

  const registerRuntime = (api: GameAPI) => {
    setGameAPI(api);
  };

  // Execution Logic
  React.useEffect(() => {
    if (isRunning && gameAPI) {
      addLog('Compiling and running...', 'info');
      
      const runUserCode = async () => {
        try {
          // Create a safe-ish scope
          const hero = {
            move: async (dir: 'up' | 'down' | 'left' | 'right') => {
              addLog(`Hero moving ${dir}...`, 'info');
              gameAPI.move(dir);
              // Wait for movement to likely finish or just a small delay
              // In a real engine, we'd wait for the entity to reach target
              await new Promise(r => setTimeout(r, 500)); 
            }
          };

          // Wrap code to allow top-level await behavior or just async functions
          // We'll trust the user writes a function or we wrap it.
          // For now, let's assume simple JS execution
          
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          
          const userFn = new AsyncFunction('hero', 'console', `
            try {
              ${code}
            } catch (e) {
              throw e;
            }
          `);
          
          await userFn(hero, { log: (msg: string) => addLog(msg, 'info') });
          
          addLog('Execution finished.', 'success');
        } catch (err: any) {
          addLog(`Runtime Error: ${err.message}`, 'error');
        } finally {
          setIsRunning(false);
        }
      };

      runUserCode();
    }
  }, [isRunning, gameAPI]); // Removed 'code' from deps so it doesn't run on edit

  return (
    <GameContext.Provider value={{
      code,
      setCode,
      logs,
      addLog,
      clearLogs,
      isRunning,
      setIsRunning,
      registerRuntime
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
