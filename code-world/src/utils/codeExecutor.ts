import type { GameCommand, GameAction, ProgrammingLanguage, CodeExecutionResult, GameError } from '../types';

interface PlayerAPI {
  move: (direction: string, steps?: number) => void;
  turn: (direction: string) => void;
  say: (message: string) => void;
  interact: () => void;
  collect: () => void;
  use: (item: string) => void;
  wait: (duration: number) => void;
  inspect: () => void;
}

interface WorldAPI {
  getObjectAt: (x: number, y: number) => unknown;
  getPlayerPosition: () => { x: number; y: number };
  getObjects: () => unknown[];
}

// Collected commands during execution
let commandQueue: GameCommand[] = [];
let outputMessages: string[] = [];

// Create sandboxed player API
const createPlayerAPI = (): PlayerAPI => ({
  move: (direction: string, steps: number = 1) => {
    const validDirections = ['up', 'down', 'left', 'right'];
    if (!validDirections.includes(direction.toLowerCase())) {
      throw new Error(`Invalid direction: ${direction}. Use: up, down, left, right`);
    }
    for (let i = 0; i < steps; i++) {
      commandQueue.push({
        action: 'move' as GameAction,
        params: { direction: direction.toLowerCase() },
        delay: 200,
      });
    }
  },
  turn: (direction: string) => {
    commandQueue.push({
      action: 'turn' as GameAction,
      params: { direction: direction.toLowerCase() },
      delay: 100,
    });
  },
  say: (message: string) => {
    outputMessages.push(`💬 ${message}`);
    commandQueue.push({
      action: 'say' as GameAction,
      params: { message },
      delay: 500,
    });
  },
  interact: () => {
    commandQueue.push({
      action: 'interact' as GameAction,
      params: {},
      delay: 300,
    });
  },
  collect: () => {
    commandQueue.push({
      action: 'collect' as GameAction,
      params: {},
      delay: 200,
    });
  },
  use: (item: string) => {
    commandQueue.push({
      action: 'use' as GameAction,
      params: { item },
      delay: 300,
    });
  },
  wait: (duration: number) => {
    commandQueue.push({
      action: 'wait' as GameAction,
      params: { duration },
      delay: duration,
    });
  },
  inspect: () => {
    commandQueue.push({
      action: 'inspect' as GameAction,
      params: {},
      delay: 200,
    });
  },
});

// Create sandboxed world API
const createWorldAPI = (gameState: { playerPosition: { x: number; y: number }; objects: unknown[] }): WorldAPI => ({
  getObjectAt: (x: number, y: number) => {
    return gameState.objects.find((obj: unknown) => {
      const o = obj as { position: { x: number; y: number }; size: { width: number; height: number } };
      return x >= o.position.x && x < o.position.x + o.size.width &&
             y >= o.position.y && y < o.position.y + o.size.height;
    });
  },
  getPlayerPosition: () => ({ ...gameState.playerPosition }),
  getObjects: () => [...gameState.objects],
});

// Custom console for sandboxed execution
const createSandboxConsole = () => ({
  log: (...args: unknown[]) => {
    outputMessages.push(args.map(a => String(a)).join(' '));
  },
  error: (...args: unknown[]) => {
    outputMessages.push(`❌ ${args.map(a => String(a)).join(' ')}`);
  },
  warn: (...args: unknown[]) => {
    outputMessages.push(`⚠️ ${args.map(a => String(a)).join(' ')}`);
  },
  info: (...args: unknown[]) => {
    outputMessages.push(`ℹ️ ${args.map(a => String(a)).join(' ')}`);
  },
});

// Transform Python-like syntax to JavaScript
const transformPythonToJS = (code: string): string => {
  let jsCode = code;
  
  // Transform Python comments to JS comments
  jsCode = jsCode.replace(/#(.*)$/gm, '//$1');
  
  // Transform def to function
  jsCode = jsCode.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {');
  
  // Transform for i in range(n): to for (let i = 0; i < n; i++) {
  jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/g, 
    'for (let $1 = 0; $1 < $2; $1++) {');
  
  // Transform for i in range(start, end): 
  jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*:/g, 
    'for (let $1 = $2; $1 < $3; $1++) {');
  
  // Transform while condition:
  jsCode = jsCode.replace(/while\s+(.+):/g, 'while ($1) {');
  
  // Transform if condition:
  jsCode = jsCode.replace(/if\s+(.+):/g, 'if ($1) {');
  
  // Transform elif condition:
  jsCode = jsCode.replace(/elif\s+(.+):/g, '} else if ($1) {');
  
  // Transform else:
  jsCode = jsCode.replace(/else\s*:/g, '} else {');
  
  // Transform True/False to true/false
  jsCode = jsCode.replace(/\bTrue\b/g, 'true');
  jsCode = jsCode.replace(/\bFalse\b/g, 'false');
  jsCode = jsCode.replace(/\bNone\b/g, 'null');
  
  // Transform and/or/not
  jsCode = jsCode.replace(/\band\b/g, '&&');
  jsCode = jsCode.replace(/\bor\b/g, '||');
  jsCode = jsCode.replace(/\bnot\b/g, '!');
  
  // Transform print() to console.log()
  jsCode = jsCode.replace(/print\s*\(/g, 'console.log(');
  
  // Handle Python indentation - add closing braces
  const lines = jsCode.split('\n');
  const processedLines: string[] = [];
  const indentStack: number[] = [0];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '') {
      processedLines.push('');
      continue;
    }
    
    // Count leading spaces
    const indent = line.search(/\S/);
    const currentIndent = indent === -1 ? 0 : indent;
    
    // If dedent, close blocks
    while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      processedLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }
    
    processedLines.push(line);
    
    // If this line opens a block
    if (trimmed.endsWith('{')) {
      indentStack.push(currentIndent + 4);
    }
  }
  
  // Close remaining blocks
  while (indentStack.length > 1) {
    indentStack.pop();
    processedLines.push('}');
  }
  
  return processedLines.join('\n');
};

// Execute code in a sandboxed environment
export const executeCode = async (
  code: string,
  language: ProgrammingLanguage,
  gameState: { playerPosition: { x: number; y: number }; objects: unknown[] }
): Promise<CodeExecutionResult> => {
  // Reset state
  commandQueue = [];
  outputMessages = [];
  
  const startTime = performance.now();
  const errors: GameError[] = [];
  
  try {
    // Transform code if needed
    let executableCode = code;
    if (language === 'python') {
      executableCode = transformPythonToJS(code);
    }
    
    // Create sandboxed APIs
    const player = createPlayerAPI();
    const world = createWorldAPI(gameState);
    const sandboxConsole = createSandboxConsole();
    
    // Create sandboxed function
    const sandboxedFunction = new Function(
      'player',
      'world', 
      'console',
      `
        "use strict";
        ${executableCode}
      `
    );
    
    // Execute with timeout protection
    const executeWithTimeout = () => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Execution timeout: код выполняется слишком долго'));
        }, 5000);
        
        try {
          sandboxedFunction(player, world, sandboxConsole);
          clearTimeout(timeout);
          resolve();
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      });
    };
    
    await executeWithTimeout();
    
  } catch (error) {
    const err = error as Error;
    
    // Parse error for line numbers if possible
    const lineMatch = err.message.match(/line (\d+)/i) || 
                      err.stack?.match(/<anonymous>:(\d+)/);
    const line = lineMatch ? parseInt(lineMatch[1]) - 2 : undefined;
    
    // Create friendly error message
    let friendlyMessage = err.message;
    let hint = '';
    
    if (err.message.includes('is not defined')) {
      const varMatch = err.message.match(/(\w+) is not defined/);
      if (varMatch) {
        friendlyMessage = `🔮 Неизвестная сущность "${varMatch[1]}" пытается материализоваться!`;
        hint = `Проверь, что переменная "${varMatch[1]}" объявлена перед использованием`;
      }
    } else if (err.message.includes('Unexpected token')) {
      friendlyMessage = '📜 Древний свиток не может быть прочитан - синтаксическая ошибка!';
      hint = 'Проверь скобки, точки с запятой и кавычки';
    } else if (err.message.includes('Invalid direction')) {
      friendlyMessage = '🧭 Компас сломался! Неверное направление движения.';
      hint = 'Используй: "up", "down", "left", "right"';
    } else if (err.message.includes('timeout')) {
      friendlyMessage = '⏰ Время застыло! Код выполняется слишком долго.';
      hint = 'Проверь, нет ли бесконечных циклов в твоём коде';
    }
    
    errors.push({
      type: err.name === 'SyntaxError' ? 'syntax' : 'runtime',
      message: friendlyMessage,
      line,
      hint,
    });
  }
  
  const executionTime = performance.now() - startTime;
  
  return {
    success: errors.length === 0,
    output: outputMessages,
    errors,
    commands: commandQueue,
    executionTime,
  };
};

// Get language display info
export const getLanguageInfo = (language: ProgrammingLanguage) => {
  const info = {
    javascript: {
      name: 'JavaScript',
      icon: '🟨',
      color: '#f7df1e',
    },
    python: {
      name: 'Python',
      icon: '🐍',
      color: '#3776ab',
    },
    typescript: {
      name: 'TypeScript',
      icon: '🔷',
      color: '#3178c6',
    },
  };
  return info[language];
};
