/**
 * CODEWORLD - Code Interpreter
 * Безопасное выполнение пользовательского кода
 */

const Interpreter = {
    isRunning: false,
    shouldStop: false,

    /**
     * Выполнить код
     */
    async execute(code, player, world) {
        this.isRunning = true;
        this.shouldStop = false;

        const language = GameProgress.getSettings().language || 'python';

        try {
            // Преобразовать код в JavaScript
            const jsCode = this.transpile(code, language);
            
            // Создать безопасное окружение
            const context = this.createContext(player, world);
            
            // Выполнить
            await this.runInContext(jsCode, context);

        } catch (error) {
            this.isRunning = false;
            throw this.formatError(error, language);
        }

        this.isRunning = false;
    },

    /**
     * Остановить выполнение
     */
    stop() {
        this.shouldStop = true;
        this.isRunning = false;
    },

    /**
     * Транспиляция кода в JavaScript
     */
    transpile(code, language) {
        switch (language) {
            case 'python':
                return this.transpilePython(code);
            case 'javascript':
                return this.transpileJavaScript(code);
            case 'java':
                return this.transpileJava(code);
            case 'cpp':
                return this.transpileCpp(code);
            default:
                return this.transpilePython(code);
        }
    },

    /**
     * Транспиляция Python в JavaScript
     */
    transpilePython(code) {
        let result = code;

        // Удалить комментарии для упрощения парсинга
        const comments = [];
        result = result.replace(/#.*/g, (match) => {
            comments.push(match);
            return `__COMMENT_${comments.length - 1}__`;
        });

        // for i in range(n) -> for (let i = 0; i < n; i++)
        result = result.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)/g, 
            'for (let $1 = 0; $1 < $2; $1++)');
        
        // for i in range(start, end) -> for (let i = start; i < end; i++)
        result = result.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, 
            'for (let $1 = $2; $1 < $3; $1++)');

        // while condition: -> while (condition) {
        result = result.replace(/while\s+(.+):\s*$/gm, 'while ($1) {');

        // if condition: -> if (condition) {
        result = result.replace(/if\s+(.+):\s*$/gm, 'if ($1) {');

        // elif condition: -> } else if (condition) {
        result = result.replace(/elif\s+(.+):\s*$/gm, '} else if ($1) {');

        // else: -> } else {
        result = result.replace(/else:\s*$/gm, '} else {');

        // def func(): -> async function func() {
        result = result.replace(/def\s+(\w+)\s*\(([^)]*)\):\s*$/gm, 'async function $1($2) {');

        // Python True/False/None -> JS true/false/null
        result = result.replace(/\bTrue\b/g, 'true');
        result = result.replace(/\bFalse\b/g, 'false');
        result = result.replace(/\bNone\b/g, 'null');

        // and/or/not -> &&/||/!
        result = result.replace(/\band\b/g, '&&');
        result = result.replace(/\bor\b/g, '||');
        result = result.replace(/\bnot\b/g, '!');

        // print() -> console.log()
        result = result.replace(/\bprint\s*\(/g, 'console.log(');

        // len() -> .length
        result = result.replace(/\blen\s*\(\s*(\w+)\s*\)/g, '$1.length');

        // Добавить await к методам player
        result = result.replace(/player\.(move|moveTo|jump|collect|interact|say|wait)\s*\(/g, 
            'await player.$1(');

        // Добавить закрывающие скобки для блоков на основе отступов
        result = this.addBrackets(result);

        // Восстановить комментарии как JS комментарии
        comments.forEach((comment, i) => {
            result = result.replace(`__COMMENT_${i}__`, '//' + comment.slice(1));
        });

        return result;
    },

    /**
     * Добавить скобки на основе отступов (для Python)
     */
    addBrackets(code) {
        const lines = code.split('\n');
        const result = [];
        const indentStack = [0];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed) {
                result.push('');
                continue;
            }

            // Подсчитать отступ
            const indent = line.search(/\S/);
            if (indent === -1) continue;

            // Закрыть блоки с большим отступом
            while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
                indentStack.pop();
                result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
            }

            result.push(line);

            // Открыть новый блок если строка заканчивается на {
            if (trimmed.endsWith('{')) {
                indentStack.push(indent + 4);
            }
        }

        // Закрыть оставшиеся блоки
        while (indentStack.length > 1) {
            indentStack.pop();
            result.push('}');
        }

        return result.join('\n');
    },

    /**
     * Транспиляция JavaScript (минимальные изменения)
     */
    transpileJavaScript(code) {
        let result = code;

        // Добавить await к методам player если ещё нет
        result = result.replace(/(?<!await\s+)player\.(move|moveTo|jump|collect|interact|say|wait)\s*\(/g, 
            'await player.$1(');

        return result;
    },

    /**
     * Транспиляция Java (упрощённая)
     */
    transpileJava(code) {
        let result = code;

        // Удалить типы и модификаторы доступа
        result = result.replace(/\b(public|private|protected|static|final|void|int|double|float|boolean|String)\s+/g, 'let ');
        
        // System.out.println -> console.log
        result = result.replace(/System\.out\.println\s*\(/g, 'console.log(');

        // Добавить await
        result = result.replace(/(?<!await\s+)player\.(move|moveTo|jump|collect|interact|say|wait)\s*\(/g, 
            'await player.$1(');

        return result;
    },

    /**
     * Транспиляция C++ (упрощённая)
     */
    transpileCpp(code) {
        let result = code;

        // Удалить типы
        result = result.replace(/\b(int|double|float|bool|char|string|void|auto)\s+/g, 'let ');
        
        // cout -> console.log
        result = result.replace(/cout\s*<<\s*/g, 'console.log(');
        result = result.replace(/\s*<<\s*endl\s*;/g, ');');

        // Добавить await
        result = result.replace(/(?<!await\s+)player\.(move|moveTo|jump|collect|interact|say|wait)\s*\(/g, 
            'await player.$1(');

        return result;
    },

    /**
     * Создать контекст выполнения
     */
    createContext(player, world) {
        const self = this;

        // Безопасные обёртки
        const safePlayer = {
            async move(direction, steps = 1) {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.move(direction, steps, world);
            },
            async moveTo(x, y) {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.moveTo(x, y, world);
            },
            async jump(direction = null, distance = 2) {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.jump(direction, distance, world);
            },
            async collect() {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.collect(world);
            },
            async interact() {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.interact(world);
            },
            async say(message) {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.say(message);
            },
            async wait(seconds) {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return await player.wait(seconds);
            },
            getPosition() {
                return player.getPosition();
            },
            getDirection() {
                return player.getDirection();
            },
            getEnergy() {
                return player.getEnergy();
            }
        };

        const safeWorld = {
            getTile(x, y) {
                return world.getTile(x, y);
            },
            canMoveTo(x, y) {
                return world.canMoveTo(x, y);
            },
            getExitPosition() {
                return world.getExitPosition();
            },
            getRemainingCrystals() {
                return world.getRemainingCrystals();
            },
            getTotalCrystals() {
                return world.getTotalCrystals();
            },
            width: world.width,
            height: world.height
        };

        // Безопасный console.log
        const safeConsole = {
            log(...args) {
                const message = args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a) : String(a)
                ).join(' ');
                Game.log(message);
            }
        };

        return {
            player: safePlayer,
            world: safeWorld,
            console: safeConsole,
            // Базовые функции
            Math: Math,
            parseInt: parseInt,
            parseFloat: parseFloat,
            String: String,
            Number: Number,
            Boolean: Boolean,
            Array: Array,
            Object: Object,
            // Утилиты
            range: function*(n) {
                for (let i = 0; i < n; i++) yield i;
            },
            sleep: async (ms) => {
                if (self.shouldStop) throw new Error('Выполнение остановлено');
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        };
    },

    /**
     * Выполнить код в контексте
     */
    async runInContext(code, context) {
        // Создать функцию с контекстом
        const contextKeys = Object.keys(context);
        const contextValues = Object.values(context);

        // Обернуть код в async функцию
        const wrappedCode = `
            return (async () => {
                ${code}
            })();
        `;

        try {
            // Создать функцию
            const func = new Function(...contextKeys, wrappedCode);
            
            // Выполнить
            await func(...contextValues);

        } catch (error) {
            throw error;
        }
    },

    /**
     * Форматировать ошибку
     */
    formatError(error, language) {
        let message = error.message || 'Неизвестная ошибка';

        // Преобразовать типичные JS ошибки в понятные
        const errorMappings = {
            'is not defined': 'не определено',
            'is not a function': 'не является функцией',
            'Cannot read properties of undefined': 'Попытка доступа к свойству неопределённого объекта',
            'Cannot read properties of null': 'Попытка доступа к свойству null',
            'Unexpected token': 'Синтаксическая ошибка',
            'Unexpected end of input': 'Неожиданный конец кода',
            'Invalid or unexpected token': 'Недопустимый символ',
            'missing ) after argument list': 'Пропущена закрывающая скобка',
            'Путь заблокирован': 'Путь заблокирован! Проверьте направление движения',
            'Недостаточно энергии': 'Недостаточно энергии для этого действия'
        };

        for (const [eng, rus] of Object.entries(errorMappings)) {
            if (message.includes(eng)) {
                message = message.replace(eng, rus);
            }
        }

        // Добавить контекст для Python-стиля
        if (language === 'python') {
            if (message.includes('Unexpected token')) {
                message += '\n💡 Подсказка: проверьте отступы и двоеточия после if/for/while';
            }
        }

        return new Error(`⚠️ Ошибка выполнения:\n${message}`);
    },

    /**
     * Валидация кода (без выполнения)
     */
    validate(code, language) {
        const errors = [];

        try {
            const jsCode = this.transpile(code, language);
            new Function(jsCode);
        } catch (error) {
            errors.push({
                line: this.extractLineNumber(error),
                message: error.message
            });
        }

        return errors;
    },

    /**
     * Извлечь номер строки из ошибки
     */
    extractLineNumber(error) {
        const match = error.stack?.match(/:(\d+):\d+/);
        return match ? parseInt(match[1]) : 1;
    }
};

// Экспорт
window.Interpreter = Interpreter;
