/**
 * CodeWorld - Code Editor
 * Main editor component with syntax highlighting and autocomplete
 */

const Editor = {
    // DOM elements
    textarea: null,
    container: null,
    highlightLayer: null,
    lineNumbers: null,
    
    // State
    currentLanguage: 'javascript',
    
    // Autocomplete
    autocompleteVisible: false,
    autocompleteItems: [],
    autocompleteIndex: 0,
    
    // API suggestions
    apiSuggestions: {
        javascript: [
            { name: 'await moveUp()', type: 'function', desc: 'Двигаться вверх на 1 клетку' },
            { name: 'await moveDown()', type: 'function', desc: 'Двигаться вниз на 1 клетку' },
            { name: 'await moveLeft()', type: 'function', desc: 'Двигаться влево на 1 клетку' },
            { name: 'await moveRight()', type: 'function', desc: 'Двигаться вправо на 1 клетку' },
            { name: 'await move(direction, steps)', type: 'function', desc: 'Двигаться в направлении N шагов' },
            { name: 'await collect()', type: 'function', desc: 'Собрать предмет на текущей позиции' },
            { name: 'await interact()', type: 'function', desc: 'Взаимодействовать с NPC' },
            { name: 'await wait(ms)', type: 'function', desc: 'Подождать N миллисекунд' },
            { name: 'say(message)', type: 'function', desc: 'Сказать сообщение' },
            { name: 'getPosition()', type: 'function', desc: 'Получить текущую позицию {x, y}' },
            { name: 'getInventory()', type: 'function', desc: 'Получить инвентарь игрока' },
            { name: 'hasItem(type)', type: 'function', desc: 'Проверить наличие предмета' },
            { name: 'canMove(direction)', type: 'function', desc: 'Проверить, можно ли двигаться' },
            { name: 'look()', type: 'function', desc: 'Осмотреть окрестности' },
            { name: 'log(...args)', type: 'function', desc: 'Вывести в консоль' },
            { name: 'repeat(times, callback)', type: 'function', desc: 'Повторить действие N раз' },
            { name: 'for', type: 'keyword', desc: 'Цикл for' },
            { name: 'while', type: 'keyword', desc: 'Цикл while' },
            { name: 'if', type: 'keyword', desc: 'Условный оператор' },
            { name: 'async', type: 'keyword', desc: 'Асинхронная функция' },
            { name: 'await', type: 'keyword', desc: 'Ожидание асинхронной операции' }
        ],
        python: [
            { name: 'await moveUp()', type: 'function', desc: 'Двигаться вверх на 1 клетку' },
            { name: 'await moveDown()', type: 'function', desc: 'Двигаться вниз на 1 клетку' },
            { name: 'await moveLeft()', type: 'function', desc: 'Двигаться влево на 1 клетку' },
            { name: 'await moveRight()', type: 'function', desc: 'Двигаться вправо на 1 клетку' },
            { name: 'await move(direction, steps)', type: 'function', desc: 'Двигаться в направлении N шагов' },
            { name: 'await collect()', type: 'function', desc: 'Собрать предмет' },
            { name: 'await interact()', type: 'function', desc: 'Взаимодействовать с NPC' },
            { name: 'await wait(ms)', type: 'function', desc: 'Подождать N миллисекунд' },
            { name: 'say(message)', type: 'function', desc: 'Сказать сообщение' },
            { name: 'getPosition()', type: 'function', desc: 'Получить позицию' },
            { name: 'canMove(direction)', type: 'function', desc: 'Проверить путь' },
            { name: 'look()', type: 'function', desc: 'Осмотреться' },
            { name: 'print(...args)', type: 'function', desc: 'Вывести в консоль' },
            { name: 'for i in range(n):', type: 'keyword', desc: 'Цикл for' },
            { name: 'while condition:', type: 'keyword', desc: 'Цикл while' },
            { name: 'if condition:', type: 'keyword', desc: 'Условный оператор' },
            { name: 'def function_name():', type: 'keyword', desc: 'Определение функции' }
        ]
    },

    /**
     * Initialize editor
     */
    init() {
        this.textarea = document.getElementById('code-editor');
        this.container = document.getElementById('editor-container');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set default code
        this.setDefaultCode();
        
        return this;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab key handling
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
            
            // Auto-close brackets
            if (e.key === '(' || e.key === '[' || e.key === '{') {
                e.preventDefault();
                this.insertBracket(e.key);
            }
            
            // Auto-close quotes
            if (e.key === '"' || e.key === "'" || e.key === '`') {
                e.preventDefault();
                this.insertQuote(e.key);
            }
            
            // Enter key - auto indent
            if (e.key === 'Enter') {
                e.preventDefault();
                this.insertNewline();
            }
            
            // Ctrl+Enter - run code
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                document.getElementById('run-code').click();
            }
        });
        
        // Update line numbers on input
        this.textarea.addEventListener('input', () => {
            this.updateLineNumbers();
            Storage.saveCode(Game.currentLevel?.id || 'default', this.textarea.value);
        });
        
        // Scroll sync
        this.textarea.addEventListener('scroll', () => {
            if (this.lineNumbers) {
                this.lineNumbers.scrollTop = this.textarea.scrollTop;
            }
        });
    },

    /**
     * Set language
     */
    setLanguage(language) {
        this.currentLanguage = language;
        Highlighter.setLanguage(language);
        Executor.setLanguage(language);
        this.setDefaultCode();
    },

    /**
     * Set default code based on language and level
     */
    setDefaultCode() {
        // Check for saved code first
        const savedCode = Storage.getCode(Game.currentLevel?.id || 'default');
        if (savedCode) {
            this.textarea.value = savedCode;
            this.updateLineNumbers();
            return;
        }
        
        // Default starter code
        const defaults = {
            javascript: `// Добро пожаловать в CodeWorld!
// Управляй персонажем с помощью кода

// Пример: двигаемся вправо 3 раза
for (let i = 0; i < 3; i++) {
    await moveRight();
}

// Собираем предмет
await collect();

// Твой код здесь:
`,
            python: `# Добро пожаловать в CodeWorld!
# Управляй персонажем с помощью кода

# Пример: двигаемся вправо 3 раза
for i in range(3):
    await moveRight()

# Собираем предмет
await collect()

# Твой код здесь:
`
        };
        
        this.textarea.value = defaults[this.currentLanguage] || defaults.javascript;
        this.updateLineNumbers();
    },

    /**
     * Update line numbers
     */
    updateLineNumbers() {
        // Create line numbers element if not exists
        if (!this.lineNumbers) {
            this.lineNumbers = document.createElement('div');
            this.lineNumbers.className = 'line-numbers active';
            this.container.insertBefore(this.lineNumbers, this.textarea);
        }
        
        const lines = this.textarea.value.split('\n');
        this.lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('<br>');
    },

    /**
     * Insert tab character
     */
    insertTab() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        
        this.updateLineNumbers();
    },

    /**
     * Insert bracket with auto-close
     */
    insertBracket(bracket) {
        const pairs = { '(': ')', '[': ']', '{': '}' };
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        this.textarea.value = value.substring(0, start) + bracket + pairs[bracket] + value.substring(start);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
        
        this.updateLineNumbers();
    },

    /**
     * Insert quote with auto-close
     */
    insertQuote(quote) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        if (start !== end) {
            // Wrap selection in quotes
            this.textarea.value = value.substring(0, start) + quote + 
                                  value.substring(start, end) + quote + 
                                  value.substring(end);
            this.textarea.selectionStart = start + 1;
            this.textarea.selectionEnd = end + 1;
        } else {
            // Insert pair of quotes
            this.textarea.value = value.substring(0, start) + quote + quote + value.substring(start);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
        }
        
        this.updateLineNumbers();
    },

    /**
     * Insert newline with auto-indent
     */
    insertNewline() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        // Get current line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        
        // Get current indent
        const indent = currentLine.match(/^(\s*)/)[1];
        
        // Check if we need extra indent (after : or {)
        const lastChar = value[start - 1];
        const extraIndent = (lastChar === ':' || lastChar === '{') ? '  ' : '';
        
        this.textarea.value = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 1 + indent.length + extraIndent.length;
        
        this.updateLineNumbers();
    },

    /**
     * Get current code
     */
    getCode() {
        return this.textarea.value;
    },

    /**
     * Set code
     */
    setCode(code) {
        this.textarea.value = code;
        this.updateLineNumbers();
    },

    /**
     * Clear code
     */
    clear() {
        this.textarea.value = '';
        this.updateLineNumbers();
    },

    /**
     * Focus editor
     */
    focus() {
        this.textarea.focus();
    },

    /**
     * Highlight error line
     */
    highlightError(lineNumber) {
        // This would require more sophisticated highlighting
        // For now, we'll show the error in console
    },

    /**
     * Clear error highlights
     */
    clearErrors() {
        // Clear any error highlighting
    },

    /**
     * Load code for level
     */
    loadLevelCode(levelId) {
        const code = Storage.getCode(levelId);
        if (code) {
            this.textarea.value = code;
        } else {
            this.setDefaultCode();
        }
        this.updateLineNumbers();
    }
};

// Make it globally available
window.Editor = Editor;
