/**
 * CodeWorld - Code Editor
 * Monaco Editor integration with custom themes
 */

import { LEVELS } from '../levels/LevelData.js';

export class CodeEditor {
    constructor(app) {
        this.app = app;
        this.editor = null;
        this.container = document.getElementById('code-editor');
        this.currentLanguage = 'javascript';
        this.isInitialized = false;
        
        // Editor state
        this.decorations = [];
        this.errorMarkers = [];
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadMonaco();
            this.createEditor();
            this.setupEventListeners();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Monaco Editor:', error);
            this.createFallbackEditor();
        }
    }

    loadMonaco() {
        return new Promise((resolve, reject) => {
            // Configure Monaco loader
            require.config({
                paths: {
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
                }
            });

            // Load Monaco
            require(['vs/editor/editor.main'], () => {
                this.defineCustomTheme();
                resolve();
            }, reject);
        });
    }

    defineCustomTheme() {
        monaco.editor.defineTheme('codeworld-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff79c6' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'number', foreground: 'bd93f9' },
                { token: 'function', foreground: '50fa7b' },
                { token: 'variable', foreground: '8be9fd' },
                { token: 'type', foreground: 'ffb86c' },
                { token: 'operator', foreground: 'ff79c6' }
            ],
            colors: {
                'editor.background': '#0a0a0f',
                'editor.foreground': '#e0e0e0',
                'editor.lineHighlightBackground': '#1a1a25',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#00ffff',
                'editorLineNumber.foreground': '#555566',
                'editorLineNumber.activeForeground': '#00ffff',
                'editorIndentGuide.background': '#2a2a3a',
                'editorIndentGuide.activeBackground': '#00ffff33',
                'editor.selectionHighlightBackground': '#264f7855',
                'editorBracketMatch.background': '#ff00ff33',
                'editorBracketMatch.border': '#ff00ff'
            }
        });
    }

    createEditor() {
        // Get initial code
        const level = LEVELS[this.app.game?.currentLevel || 1];
        const initialCode = level?.starterCode?.[this.currentLanguage] || this.getDefaultCode();

        this.editor = monaco.editor.create(this.container, {
            value: initialCode,
            language: this.getMonacoLanguage(),
            theme: 'codeworld-dark',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 22,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            renderWhitespace: 'selection',
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top'
        });

        // Register custom completions
        this.registerCompletions();
    }

    registerCompletions() {
        // Register completion provider for game API
        const completionProvider = {
            provideCompletionItems: (model, position) => {
                const suggestions = this.getCompletionSuggestions();
                return { suggestions };
            }
        };

        monaco.languages.registerCompletionItemProvider('javascript', completionProvider);
        monaco.languages.registerCompletionItemProvider('python', completionProvider);
    }

    getCompletionSuggestions() {
        const suggestions = [
            // Hero methods
            {
                label: 'hero.move',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.move("${1|up,down,left,right|}")',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Move the hero in a direction'
            },
            {
                label: 'hero.moveUp',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.moveUp()',
                documentation: 'Move the hero up'
            },
            {
                label: 'hero.moveDown',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.moveDown()',
                documentation: 'Move the hero down'
            },
            {
                label: 'hero.moveLeft',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.moveLeft()',
                documentation: 'Move the hero left'
            },
            {
                label: 'hero.moveRight',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.moveRight()',
                documentation: 'Move the hero right'
            },
            {
                label: 'hero.walkTo',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.walkTo(${1:x}, ${2:y})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Walk the hero to specific coordinates'
            },
            {
                label: 'hero.canMove',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.canMove("${1|up,down,left,right|}")',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Check if hero can move in a direction'
            },
            {
                label: 'hero.getX',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.getX()',
                documentation: 'Get hero X position'
            },
            {
                label: 'hero.getY',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.getY()',
                documentation: 'Get hero Y position'
            },
            {
                label: 'hero.interact',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.interact("${1:target}")',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Interact with an object'
            },
            {
                label: 'hero.push',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.push("${1|up,down,left,right|}")',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Push an object'
            },
            {
                label: 'hero.wait',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'hero.wait(${1:500})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Wait for milliseconds'
            },
            
            // World methods
            {
                label: 'world.hasWall',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'world.hasWall(${1:x}, ${2:y})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Check if there is a wall at position'
            },
            {
                label: 'world.hasCollectible',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'world.hasCollectible(${1:x}, ${2:y})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Check if there is a collectible at position'
            },
            {
                label: 'world.getGoalPosition',
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: 'world.getGoalPosition()',
                documentation: 'Get the goal position'
            },
            
            // Utility
            {
                label: 'log',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'log("${1:message}")',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Log a message to the console'
            },
            {
                label: 'repeat',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'repeat(${1:times}, () => {\n\t${2:// code}\n})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Repeat code n times'
            },
            {
                label: 'for loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n\t${3:// code}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
            },
            {
                label: 'while loop',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'while (${1:condition}) {\n\t${2:// code}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'While loop'
            },
            {
                label: 'if statement',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'If statement'
            }
        ];

        return suggestions;
    }

    createFallbackEditor() {
        // Fallback to textarea if Monaco fails to load
        const textarea = document.createElement('textarea');
        textarea.className = 'fallback-editor';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #0a0a0f;
            color: #e0e0e0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            padding: 16px;
            border: none;
            resize: none;
            outline: none;
        `;
        
        this.container.appendChild(textarea);
        
        // Create fake editor API
        this.editor = {
            getValue: () => textarea.value,
            setValue: (val) => textarea.value = val,
            getPosition: () => ({ lineNumber: 1, column: 1 }),
            focus: () => textarea.focus()
        };
    }

    setupEventListeners() {
        if (!this.editor || !this.editor.onDidChangeCursorPosition) return;

        // Update cursor position display
        this.editor.onDidChangeCursorPosition((e) => {
            const position = e.position;
            const positionDisplay = document.querySelector('.editor-position');
            if (positionDisplay) {
                positionDisplay.textContent = `Строка: ${position.lineNumber}, Столбец: ${position.column}`;
            }
        });

        // Clear error highlights on edit
        this.editor.onDidChangeModelContent(() => {
            this.clearErrorHighlights();
        });
    }

    getCode() {
        return this.editor ? this.editor.getValue() : '';
    }

    setCode(code) {
        if (this.editor) {
            this.editor.setValue(code);
        }
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        
        if (this.editor && monaco) {
            monaco.editor.setModelLanguage(
                this.editor.getModel(),
                this.getMonacoLanguage()
            );
        }
        
        // Update starter code for new language
        this.setDefaultCode(lang);
    }

    getMonacoLanguage() {
        const langMap = {
            'javascript': 'javascript',
            'python': 'python',
            'java': 'java'
        };
        return langMap[this.currentLanguage] || 'javascript';
    }

    setDefaultCode(lang) {
        const level = LEVELS[this.app.game?.currentLevel || 1];
        if (level && level.starterCode && level.starterCode[lang]) {
            this.setCode(level.starterCode[lang]);
        } else {
            this.setCode(this.getDefaultCode());
        }
    }

    getDefaultCode() {
        const templates = {
            javascript: `// Напиши свой код здесь
// Используй hero.move("direction") для движения

hero.move("right");
`,
            python: `# Напиши свой код здесь
# Используй hero.move("direction") для движения

hero.move("right")
`,
            java: `// Напиши свой код здесь
// Используй hero.move("direction") для движения

hero.move("right");
`
        };
        
        return templates[this.currentLanguage] || templates.javascript;
    }

    resetCode() {
        this.setDefaultCode(this.currentLanguage);
        this.clearErrorHighlights();
    }

    highlightError(lineNumber) {
        if (!this.editor || !monaco) return;

        // Clear previous decorations
        this.clearErrorHighlights();

        // Add error decoration
        this.decorations = this.editor.deltaDecorations([], [
            {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'error-line-highlight',
                    glyphMarginClassName: 'error-glyph',
                    overviewRuler: {
                        color: '#ff3366',
                        position: monaco.editor.OverviewRulerLane.Full
                    }
                }
            }
        ]);

        // Add inline error marker
        monaco.editor.setModelMarkers(this.editor.getModel(), 'errors', [
            {
                startLineNumber: lineNumber,
                startColumn: 1,
                endLineNumber: lineNumber,
                endColumn: 1000,
                message: 'Ошибка в этой строке',
                severity: monaco.MarkerSeverity.Error
            }
        ]);

        // Scroll to error line
        this.editor.revealLineInCenter(lineNumber);
    }

    clearErrorHighlights() {
        if (!this.editor) return;

        if (this.decorations.length > 0) {
            this.decorations = this.editor.deltaDecorations(this.decorations, []);
        }

        if (monaco) {
            monaco.editor.setModelMarkers(this.editor.getModel(), 'errors', []);
        }
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    updateForLevel(levelNum) {
        this.setDefaultCode(this.currentLanguage);
    }
}
