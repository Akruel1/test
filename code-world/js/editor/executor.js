/**
 * CodeWorld - Code Executor
 * Safe execution environment for user code
 */

const Executor = {
    // Current language
    language: 'javascript',
    
    // Running state
    running: false,
    
    // Console output callback
    onOutput: null,
    
    // Abort controller for stopping execution
    abortController: null,
    
    /**
     * Game API available to user code
     */
    createGameAPI() {
        const api = {
            // Movement functions
            moveUp: async () => {
                this.log('player-action', 'Персонаж двигается вверх');
                return Player.queueAction({ type: 'move', direction: 'up' });
            },
            
            moveDown: async () => {
                this.log('player-action', 'Персонаж двигается вниз');
                return Player.queueAction({ type: 'move', direction: 'down' });
            },
            
            moveLeft: async () => {
                this.log('player-action', 'Персонаж двигается влево');
                return Player.queueAction({ type: 'move', direction: 'left' });
            },
            
            moveRight: async () => {
                this.log('player-action', 'Персонаж двигается вправо');
                return Player.queueAction({ type: 'move', direction: 'right' });
            },
            
            // Shorthand movement
            up: async () => api.moveUp(),
            down: async () => api.moveDown(),
            left: async () => api.moveLeft(),
            right: async () => api.moveRight(),
            
            // Move multiple steps
            move: async (direction, steps = 1) => {
                const moveFunc = api[direction] || api['moveRight'];
                for (let i = 0; i < steps; i++) {
                    await moveFunc();
                }
            },
            
            // Collect item at current position
            collect: async () => {
                this.log('player-action', 'Персонаж собирает предмет');
                return Player.queueAction({ type: 'collect' });
            },
            
            // Interact with NPC
            interact: async () => {
                this.log('player-action', 'Персонаж взаимодействует');
                return Player.queueAction({ type: 'interact' });
            },
            
            // Wait for specified milliseconds
            wait: async (ms) => {
                this.log('info', `Ожидание ${ms}мс...`);
                return Player.queueAction({ type: 'wait', duration: ms });
            },
            
            // Say something (shows in console)
            say: (message) => {
                this.log('player-action', `💬 "${message}"`);
                return Player.queueAction({ type: 'say', message });
            },
            
            // Get player position
            getPosition: () => {
                return Player.getPosition();
            },
            
            // Get player inventory
            getInventory: () => {
                return Player.getInventorySummary();
            },
            
            // Check if player has item
            hasItem: (type) => {
                return Player.hasItem(type);
            },
            
            // Get points
            getPoints: () => {
                return Player.points;
            },
            
            // World inspection
            canMove: (direction) => {
                const pos = Player.getPosition();
                let checkX = pos.x;
                let checkY = pos.y;
                
                switch(direction) {
                    case 'up': checkY -= 1; break;
                    case 'down': checkY += 1; break;
                    case 'left': checkX -= 1; break;
                    case 'right': checkX += 1; break;
                }
                
                return World.isWalkable(checkX, checkY);
            },
            
            // Check what's at a position
            lookAt: (x, y) => {
                const tile = World.getTile(x, y);
                const obj = World.objects.find(o => o.x === x && o.y === y && !o.collected);
                
                return {
                    tile: tile,
                    object: obj ? obj.type : null,
                    walkable: World.isWalkable(x, y)
                };
            },
            
            // Get surrounding tiles
            look: () => {
                const pos = Player.getPosition();
                return {
                    up: api.lookAt(pos.x, pos.y - 1),
                    down: api.lookAt(pos.x, pos.y + 1),
                    left: api.lookAt(pos.x - 1, pos.y),
                    right: api.lookAt(pos.x + 1, pos.y),
                    here: api.lookAt(pos.x, pos.y)
                };
            },
            
            // Custom logging
            log: (...args) => {
                this.log('log', args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a) : String(a)
                ).join(' '));
            },
            
            // For loops helper
            repeat: async (times, callback) => {
                for (let i = 0; i < times; i++) {
                    await callback(i);
                }
            }
        };
        
        return api;
    },

    /**
     * Set language
     */
    setLanguage(lang) {
        this.language = lang;
    },

    /**
     * Log to console
     */
    log(type, message) {
        if (this.onOutput) {
            this.onOutput(type, message);
        }
    },

    /**
     * Execute JavaScript code
     */
    async executeJavaScript(code) {
        const api = this.createGameAPI();
        
        // Create function with API in scope
        const wrappedCode = `
            return (async () => {
                ${code}
            })();
        `;
        
        try {
            // Create function with API variables
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction(
                'moveUp', 'moveDown', 'moveLeft', 'moveRight',
                'up', 'down', 'left', 'right',
                'move', 'collect', 'interact', 'wait', 'say',
                'getPosition', 'getInventory', 'hasItem', 'getPoints',
                'canMove', 'lookAt', 'look', 'log', 'repeat',
                wrappedCode
            );
            
            await fn(
                api.moveUp, api.moveDown, api.moveLeft, api.moveRight,
                api.up, api.down, api.left, api.right,
                api.move, api.collect, api.interact, api.wait, api.say,
                api.getPosition, api.getInventory, api.hasItem, api.getPoints,
                api.canMove, api.lookAt, api.look, api.log, api.repeat
            );
            
            this.log('success', 'Программа выполнена успешно!');
            
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    },

    /**
     * Execute Python code (transpiled to JS)
     * Note: This is a simplified Python interpreter for basic commands
     */
    async executePython(code) {
        // Convert Python to JavaScript (basic conversion)
        let jsCode = code;
        
        // def -> async function
        jsCode = jsCode.replace(/def\s+(\w+)\s*\((.*?)\)\s*:/g, 'async function $1($2) {');
        
        // for i in range(n): -> for (let i = 0; i < n; i++) {
        jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\((\d+)\)\s*:/g, 'for (let $1 = 0; $1 < $2; $1++) {');
        jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\)\s*:/g, 'for (let $1 = $2; $1 < $3; $1++) {');
        
        // while condition: -> while (condition) {
        jsCode = jsCode.replace(/while\s+(.+?):/g, 'while ($1) {');
        
        // if condition: -> if (condition) {
        jsCode = jsCode.replace(/if\s+(.+?):/g, 'if ($1) {');
        
        // elif -> } else if
        jsCode = jsCode.replace(/elif\s+(.+?):/g, '} else if ($1) {');
        
        // else: -> } else {
        jsCode = jsCode.replace(/else\s*:/g, '} else {');
        
        // True/False/None
        jsCode = jsCode.replace(/\bTrue\b/g, 'true');
        jsCode = jsCode.replace(/\bFalse\b/g, 'false');
        jsCode = jsCode.replace(/\bNone\b/g, 'null');
        
        // print() -> log()
        jsCode = jsCode.replace(/print\s*\(/g, 'log(');
        
        // await for game functions
        const awaitFuncs = ['moveUp', 'moveDown', 'moveLeft', 'moveRight', 
                           'up', 'down', 'left', 'right', 'move', 
                           'collect', 'interact', 'wait'];
        awaitFuncs.forEach(fn => {
            jsCode = jsCode.replace(new RegExp(`(?<!await\\s)\\b${fn}\\(`, 'g'), `await ${fn}(`);
        });
        
        // Handle Python indentation (convert to braces)
        jsCode = this.convertIndentation(jsCode);
        
        // Execute as JavaScript
        return this.executeJavaScript(jsCode);
    },

    /**
     * Convert Python indentation to JavaScript braces
     * Simplified version - handles basic cases
     */
    convertIndentation(code) {
        const lines = code.split('\n');
        let result = [];
        let indentStack = [0];
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            const indent = line.search(/\S/);
            const currentIndent = indentStack[indentStack.length - 1];
            
            // Close blocks if indent decreases
            while (indent < currentIndent && indentStack.length > 1) {
                indentStack.pop();
                result.push('}');
            }
            
            // Track new indent level if line ends with {
            if (trimmed.endsWith('{')) {
                result.push(trimmed);
                indentStack.push(indent + 4);
            } else {
                result.push(trimmed);
            }
        }
        
        // Close remaining blocks
        while (indentStack.length > 1) {
            indentStack.pop();
            result.push('}');
        }
        
        return result.join('\n');
    },

    /**
     * Execute code in current language
     */
    async execute(code) {
        if (this.running) {
            this.log('warning', 'Программа уже выполняется!');
            return;
        }
        
        this.running = true;
        this.log('system', 'Запуск программы...');
        
        try {
            if (this.language === 'javascript') {
                await this.executeJavaScript(code);
            } else if (this.language === 'python') {
                await this.executePython(code);
            }
        } catch (error) {
            // Error already logged in handleError
        } finally {
            this.running = false;
        }
    },

    /**
     * Handle execution error
     */
    handleError(error) {
        const message = error.message || String(error);
        
        // Make errors more user-friendly
        const friendlyErrors = {
            'is not defined': 'Переменная или функция не определена',
            'is not a function': 'Это не функция',
            'Unexpected token': 'Синтаксическая ошибка',
            'Invalid or unexpected': 'Неверный синтаксис'
        };
        
        let friendlyMessage = message;
        for (const [key, value] of Object.entries(friendlyErrors)) {
            if (message.includes(key)) {
                friendlyMessage = `${value}: ${message}`;
                break;
            }
        }
        
        this.log('error', friendlyMessage);
        
        // Visual feedback in game
        World.createParticleBurst(
            Player.x * World.tileSize + 16,
            Player.y * World.tileSize,
            15,
            ['#ff0044', '#ff4444', '#ff8800']
        );
    },

    /**
     * Stop execution
     */
    stop() {
        if (this.running) {
            this.running = false;
            Player.clearActions();
            this.log('warning', 'Выполнение прервано');
        }
    },

    /**
     * Check if code is valid
     */
    validate(code) {
        try {
            if (this.language === 'javascript') {
                new Function(code);
            }
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                line: this.extractLineNumber(error)
            };
        }
    },

    /**
     * Extract line number from error
     */
    extractLineNumber(error) {
        const match = error.stack?.match(/<anonymous>:(\d+)/);
        return match ? parseInt(match[1]) - 2 : null;
    }
};

// Make it globally available
window.Executor = Executor;
