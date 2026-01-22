/**
 * CodeWorld - Syntax Highlighter
 * Simple syntax highlighting for JavaScript and Python
 */

const Highlighter = {
    // Current language
    language: 'javascript',
    
    // Language patterns
    patterns: {
        javascript: {
            keywords: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|try|catch|finally|throw|async|await|of|in|typeof|instanceof)\b/g,
            functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
            strings: /(["'`])(?:(?!\1|\\).|\\.)*?\1/g,
            numbers: /\b(\d+\.?\d*)\b/g,
            comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
            operators: /([+\-*/%=<>!&|^~?:]+)/g,
            booleans: /\b(true|false|null|undefined)\b/g
        },
        python: {
            keywords: /\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|lambda|pass|yield|global|nonlocal|assert|del|in|is|not|and|or)\b/g,
            functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
            strings: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
            numbers: /\b(\d+\.?\d*)\b/g,
            comments: /(#.*$)/gm,
            operators: /([+\-*/%=<>!&|^~@]+)/g,
            booleans: /\b(True|False|None)\b/g
        }
    },

    // Escape HTML
    escapeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Set current language
     */
    setLanguage(lang) {
        this.language = lang;
    },

    /**
     * Highlight code string
     */
    highlight(code) {
        const patterns = this.patterns[this.language];
        if (!patterns) return this.escapeHTML(code);
        
        // First, extract and replace strings/comments to protect them
        const tokens = [];
        let tokenIndex = 0;
        
        // Extract strings
        code = code.replace(patterns.strings, (match) => {
            tokens.push({ type: 'string', value: match });
            return `\x00STRING${tokenIndex++}\x00`;
        });
        
        // Extract comments
        code = code.replace(patterns.comments, (match) => {
            tokens.push({ type: 'comment', value: match });
            return `\x00COMMENT${tokenIndex++}\x00`;
        });
        
        // Escape HTML
        code = this.escapeHTML(code);
        
        // Apply highlighting
        code = code.replace(patterns.keywords, '<span class="token-keyword">$1</span>');
        code = code.replace(patterns.functions, '<span class="token-function">$1</span>');
        code = code.replace(patterns.booleans, '<span class="token-keyword">$1</span>');
        code = code.replace(patterns.numbers, '<span class="token-number">$1</span>');
        
        // Restore strings and comments with highlighting
        tokens.forEach((token, i) => {
            const escaped = this.escapeHTML(token.value);
            const className = token.type === 'string' ? 'token-string' : 'token-comment';
            code = code.replace(
                new RegExp(`\x00${token.type.toUpperCase()}${i}\x00`, 'g'),
                `<span class="${className}">${escaped}</span>`
            );
        });
        
        return code;
    },

    /**
     * Get line numbers HTML
     */
    getLineNumbers(code) {
        const lines = code.split('\n');
        return lines.map((_, i) => i + 1).join('\n');
    },

    /**
     * Create highlighted code display
     */
    createHighlightedDisplay(code) {
        const highlighted = this.highlight(code);
        const lineNumbers = this.getLineNumbers(code);
        
        return {
            code: highlighted,
            lineNumbers: lineNumbers,
            lineCount: code.split('\n').length
        };
    }
};

// Make it globally available
window.Highlighter = Highlighter;
