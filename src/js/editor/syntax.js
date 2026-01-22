/**
 * CODEWORLD - Syntax Highlighting
 * Подсветка синтаксиса для разных языков
 */

const SyntaxHighlighter = {
    // Определения языков
    languages: {
        python: {
            keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 
                      'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'break', 
                      'continue', 'pass', 'raise', 'and', 'or', 'not', 'in', 'is', 'True', 
                      'False', 'None', 'lambda', 'global', 'nonlocal', 'async', 'await'],
            builtins: ['print', 'range', 'len', 'int', 'str', 'float', 'list', 'dict', 'set',
                      'tuple', 'bool', 'type', 'input', 'open', 'abs', 'min', 'max', 'sum',
                      'sorted', 'enumerate', 'zip', 'map', 'filter'],
            api: ['player', 'world', 'game'],
            commentSingle: '#',
            stringDelimiters: ['"', "'", '"""', "'''"],
            numberPattern: /\b\d+\.?\d*\b/g
        },
        javascript: {
            keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do',
                      'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally',
                      'throw', 'new', 'class', 'extends', 'import', 'export', 'from', 'async',
                      'await', 'this', 'super', 'typeof', 'instanceof', 'true', 'false', 'null',
                      'undefined', 'of', 'in'],
            builtins: ['console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean',
                      'Date', 'JSON', 'Promise', 'setTimeout', 'setInterval', 'parseInt',
                      'parseFloat', 'isNaN', 'isFinite'],
            api: ['player', 'world', 'game'],
            commentSingle: '//',
            commentMulti: ['/*', '*/'],
            stringDelimiters: ['"', "'", '`'],
            numberPattern: /\b\d+\.?\d*\b/g
        },
        java: {
            keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends',
                      'implements', 'static', 'final', 'void', 'int', 'double', 'float',
                      'boolean', 'char', 'String', 'if', 'else', 'for', 'while', 'do',
                      'switch', 'case', 'break', 'continue', 'return', 'try', 'catch',
                      'finally', 'throw', 'throws', 'new', 'this', 'super', 'true', 'false',
                      'null', 'import', 'package'],
            builtins: ['System', 'Math', 'Integer', 'Double', 'Float', 'Boolean', 'Character',
                      'Arrays', 'ArrayList', 'HashMap', 'Scanner'],
            api: ['player', 'world', 'game'],
            commentSingle: '//',
            commentMulti: ['/*', '*/'],
            stringDelimiters: ['"'],
            numberPattern: /\b\d+\.?\d*[fFdDlL]?\b/g
        },
        cpp: {
            keywords: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
                      'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int',
                      'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
                      'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile',
                      'while', 'class', 'public', 'private', 'protected', 'virtual', 'friend',
                      'inline', 'namespace', 'new', 'delete', 'this', 'true', 'false', 'nullptr',
                      'template', 'typename', 'try', 'catch', 'throw', 'using', 'include'],
            builtins: ['cout', 'cin', 'endl', 'string', 'vector', 'map', 'set', 'list',
                      'queue', 'stack', 'pair', 'printf', 'scanf', 'malloc', 'free'],
            api: ['player', 'world', 'game'],
            commentSingle: '//',
            commentMulti: ['/*', '*/'],
            stringDelimiters: ['"', "'"],
            numberPattern: /\b\d+\.?\d*[fFuUlL]*\b/g
        }
    },

    /**
     * Получить определение языка
     */
    getLanguage(lang) {
        return this.languages[lang] || this.languages.python;
    },

    /**
     * Подсветить код
     */
    highlight(code, language = 'python') {
        const lang = this.getLanguage(language);
        let result = this.escapeHtml(code);

        // Строки (обрабатываем первыми)
        result = this.highlightStrings(result, lang);

        // Комментарии
        result = this.highlightComments(result, lang);

        // Ключевые слова
        result = this.highlightKeywords(result, lang);

        // Встроенные функции
        result = this.highlightBuiltins(result, lang);

        // API функции
        result = this.highlightAPI(result, lang);

        // Числа
        result = this.highlightNumbers(result, lang);

        // Функции
        result = this.highlightFunctions(result, lang);

        return result;
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Подсветка строк
     */
    highlightStrings(code, lang) {
        // Многострочные строки (для Python)
        if (lang.stringDelimiters.includes('"""')) {
            code = code.replace(/"""[\s\S]*?"""/g, '<span class="syntax-string">$&</span>');
            code = code.replace(/'''[\s\S]*?'''/g, '<span class="syntax-string">$&</span>');
        }

        // Обычные строки
        code = code.replace(/"([^"\\]|\\.)*"/g, '<span class="syntax-string">$&</span>');
        code = code.replace(/'([^'\\]|\\.)*'/g, '<span class="syntax-string">$&</span>');
        
        // Template strings (JavaScript)
        if (lang.stringDelimiters.includes('`')) {
            code = code.replace(/`([^`\\]|\\.)*`/g, '<span class="syntax-string">$&</span>');
        }

        return code;
    },

    /**
     * Подсветка комментариев
     */
    highlightComments(code, lang) {
        // Однострочные комментарии
        if (lang.commentSingle) {
            const commentRegex = new RegExp(`(${this.escapeRegex(lang.commentSingle)}.*)$`, 'gm');
            code = code.replace(commentRegex, '<span class="syntax-comment">$1</span>');
        }

        // Многострочные комментарии
        if (lang.commentMulti) {
            const [start, end] = lang.commentMulti;
            const multiRegex = new RegExp(`${this.escapeRegex(start)}[\\s\\S]*?${this.escapeRegex(end)}`, 'g');
            code = code.replace(multiRegex, '<span class="syntax-comment">$&</span>');
        }

        return code;
    },

    /**
     * Подсветка ключевых слов
     */
    highlightKeywords(code, lang) {
        if (!lang.keywords) return code;

        const keywordRegex = new RegExp(`\\b(${lang.keywords.join('|')})\\b`, 'g');
        return code.replace(keywordRegex, '<span class="syntax-keyword">$1</span>');
    },

    /**
     * Подсветка встроенных функций
     */
    highlightBuiltins(code, lang) {
        if (!lang.builtins) return code;

        const builtinRegex = new RegExp(`\\b(${lang.builtins.join('|')})\\b`, 'g');
        return code.replace(builtinRegex, '<span class="syntax-builtin">$1</span>');
    },

    /**
     * Подсветка API функций
     */
    highlightAPI(code, lang) {
        if (!lang.api) return code;

        const apiRegex = new RegExp(`\\b(${lang.api.join('|')})\\b`, 'g');
        return code.replace(apiRegex, '<span class="syntax-api">$1</span>');
    },

    /**
     * Подсветка чисел
     */
    highlightNumbers(code, lang) {
        if (!lang.numberPattern) return code;

        return code.replace(lang.numberPattern, '<span class="syntax-number">$&</span>');
    },

    /**
     * Подсветка функций
     */
    highlightFunctions(code, lang) {
        // Вызовы функций
        return code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="syntax-function">$1</span>(');
    },

    /**
     * Экранирование для regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Получить токены для автодополнения
     */
    getTokens(code, language = 'python') {
        const lang = this.getLanguage(language);
        const tokens = [];

        // Добавить ключевые слова
        tokens.push(...lang.keywords.map(k => ({ name: k, type: 'keyword' })));

        // Добавить встроенные функции
        tokens.push(...lang.builtins.map(b => ({ name: b, type: 'builtin' })));

        // Добавить API
        tokens.push(...lang.api.map(a => ({ name: a, type: 'api' })));

        // Найти пользовательские переменные и функции
        const varPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;
        const funcPattern = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;

        let match;
        while ((match = varPattern.exec(code)) !== null) {
            if (!tokens.find(t => t.name === match[1])) {
                tokens.push({ name: match[1], type: 'variable' });
            }
        }

        while ((match = funcPattern.exec(code)) !== null) {
            if (!tokens.find(t => t.name === match[1])) {
                tokens.push({ name: match[1], type: 'function' });
            }
        }

        return tokens;
    }
};

// Экспорт
window.SyntaxHighlighter = SyntaxHighlighter;
