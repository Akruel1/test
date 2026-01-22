/**
 * CODEWORLD - Code Editor
 * Простой редактор кода с подсветкой синтаксиса
 */

const CodeEditor = {
    textarea: null,
    lineNumbers: null,
    language: 'python',
    history: [],
    historyIndex: -1,
    maxHistory: 50,

    /**
     * Инициализация редактора
     */
    init() {
        this.textarea = Utils.$('code-editor');
        this.lineNumbers = Utils.$('line-numbers');
        
        if (!this.textarea || !this.lineNumbers) {
            console.error('Editor elements not found');
            return;
        }

        this.language = GameProgress.getSettings().language || 'python';
        this.updateLanguageBadge();
        
        this.bindEvents();
        this.updateLineNumbers();
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Ввод текста
        this.textarea.addEventListener('input', () => {
            this.updateLineNumbers();
            this.saveToHistory();
        });

        // Прокрутка
        this.textarea.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.textarea.scrollTop;
        });

        // Клавиши
        this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Позиция курсора
        this.textarea.addEventListener('click', () => this.updateCursorPosition());
        this.textarea.addEventListener('keyup', () => this.updateCursorPosition());

        // Табы файлов
        Utils.$$('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Кнопки действий
        Utils.$('btn-docs')?.addEventListener('click', () => this.toggleDocs());
        Utils.$('btn-hints')?.addEventListener('click', () => this.toggleHints());
        Utils.$('btn-fullscreen-editor')?.addEventListener('click', () => this.toggleFullscreen());

        // Закрытие панелей
        Utils.$('close-docs')?.addEventListener('click', () => this.closeDocs());
        Utils.$('close-hints')?.addEventListener('click', () => this.closeHints());

        // Консольные табы
        Utils.$$('.console-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchConsoleTab(tab));
        });

        // Очистка консоли
        Utils.$('btn-clear-console')?.addEventListener('click', () => {
            Game.clearConsole();
        });
    },

    /**
     * Обработка нажатий клавиш
     */
    handleKeyDown(e) {
        // Tab - вставить отступ
        if (e.key === 'Tab') {
            e.preventDefault();
            this.insertAtCursor('    ');
        }

        // Enter - автоотступ
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleEnter();
        }

        // Ctrl+Z - отмена
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }

        // Ctrl+Y - повтор
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }

        // Ctrl+/ - комментарий
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            this.toggleComment();
        }

        // Ctrl+D - дублировать строку
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            this.duplicateLine();
        }
    },

    /**
     * Обработка Enter с автоотступом
     */
    handleEnter() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        // Найти текущую строку
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        
        // Определить отступ
        const indent = currentLine.match(/^(\s*)/)[1];
        
        // Увеличить отступ после : (Python)
        let extraIndent = '';
        if (this.language === 'python' && currentLine.trimEnd().endsWith(':')) {
            extraIndent = '    ';
        }
        
        // Увеличить отступ после { (JS/Java/C++)
        if (['javascript', 'java', 'cpp'].includes(this.language) && currentLine.trimEnd().endsWith('{')) {
            extraIndent = '    ';
        }
        
        this.insertAtCursor('\n' + indent + extraIndent);
    },

    /**
     * Вставить текст в позицию курсора
     */
    insertAtCursor(text) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        this.textarea.value = value.substring(0, start) + text + value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
        
        this.updateLineNumbers();
        this.saveToHistory();
    },

    /**
     * Переключить комментарий
     */
    toggleComment() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        // Найти начало и конец строки
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        
        const line = value.substring(lineStart, actualLineEnd);
        
        // Определить символ комментария
        const commentChar = this.language === 'python' ? '# ' : '// ';
        
        let newLine;
        if (line.trimStart().startsWith(commentChar.trim())) {
            // Убрать комментарий
            newLine = line.replace(commentChar, '');
        } else {
            // Добавить комментарий
            const indent = line.match(/^(\s*)/)[1];
            newLine = indent + commentChar + line.trimStart();
        }
        
        this.textarea.value = value.substring(0, lineStart) + newLine + value.substring(actualLineEnd);
        this.textarea.selectionStart = this.textarea.selectionEnd = lineStart + newLine.length;
        
        this.updateLineNumbers();
        this.saveToHistory();
    },

    /**
     * Дублировать строку
     */
    duplicateLine() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        
        const line = value.substring(lineStart, actualLineEnd);
        
        this.textarea.value = value.substring(0, actualLineEnd) + '\n' + line + value.substring(actualLineEnd);
        this.textarea.selectionStart = this.textarea.selectionEnd = actualLineEnd + line.length + 1;
        
        this.updateLineNumbers();
        this.saveToHistory();
    },

    /**
     * Обновить номера строк
     */
    updateLineNumbers() {
        const lines = this.textarea.value.split('\n');
        const currentLine = this.getCurrentLine();
        
        this.lineNumbers.innerHTML = lines.map((_, i) => {
            const num = i + 1;
            const isActive = num === currentLine ? ' active' : '';
            return `<div class="line-number${isActive}">${num}</div>`;
        }).join('');
    },

    /**
     * Получить текущую строку
     */
    getCurrentLine() {
        const value = this.textarea.value;
        const start = this.textarea.selectionStart;
        return value.substring(0, start).split('\n').length;
    },

    /**
     * Обновить позицию курсора в UI
     */
    updateCursorPosition() {
        const value = this.textarea.value;
        const start = this.textarea.selectionStart;
        
        const lines = value.substring(0, start).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        const positionEl = Utils.$('cursor-position');
        if (positionEl) {
            positionEl.textContent = `Строка: ${line}, Столбец: ${column}`;
        }
        
        this.updateLineNumbers();
    },

    /**
     * Сохранить в историю
     */
    saveToHistory() {
        const value = this.textarea.value;
        
        // Удалить будущую историю при новом изменении
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Добавить в историю
        this.history.push(value);
        this.historyIndex = this.history.length - 1;
        
        // Ограничить размер истории
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    },

    /**
     * Отмена
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.textarea.value = this.history[this.historyIndex];
            this.updateLineNumbers();
        }
    },

    /**
     * Повтор
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.textarea.value = this.history[this.historyIndex];
            this.updateLineNumbers();
        }
    },

    /**
     * Получить значение
     */
    getValue() {
        return this.textarea.value;
    },

    /**
     * Установить значение
     */
    setValue(value) {
        this.textarea.value = value;
        this.updateLineNumbers();
        this.history = [value];
        this.historyIndex = 0;
    },

    /**
     * Установить язык
     */
    setLanguage(lang) {
        this.language = lang;
        this.updateLanguageBadge();
        GameProgress.updateSettings({ language: lang });
    },

    /**
     * Обновить бейдж языка
     */
    updateLanguageBadge() {
        const badge = Utils.$('current-lang-badge');
        if (badge) {
            const names = {
                python: 'Python',
                javascript: 'JavaScript',
                java: 'Java',
                cpp: 'C++'
            };
            badge.textContent = names[this.language] || 'Python';
        }
    },

    /**
     * Переключить таб
     */
    switchTab(tab) {
        Utils.$$('.editor-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        AudioManager.play('click');
    },

    /**
     * Переключить консольный таб
     */
    switchConsoleTab(tab) {
        const panel = tab.dataset.console;
        
        Utils.$$('.console-tab').forEach(t => t.classList.remove('active'));
        Utils.$$('.console-panel').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        Utils.$(`console-${panel}`).classList.add('active');
        
        AudioManager.play('click');
    },

    /**
     * Переключить документацию
     */
    toggleDocs() {
        const panel = Utils.$('docs-panel');
        panel.classList.toggle('hidden');
        this.closeHints();
        this.loadDocs();
        AudioManager.play('click');
    },

    /**
     * Переключить подсказки
     */
    toggleHints() {
        const panel = Utils.$('hints-panel');
        panel.classList.toggle('hidden');
        this.closeDocs();
        AudioManager.play('click');
    },

    /**
     * Закрыть документацию
     */
    closeDocs() {
        Utils.$('docs-panel').classList.add('hidden');
    },

    /**
     * Закрыть подсказки
     */
    closeHints() {
        Utils.$('hints-panel').classList.add('hidden');
    },

    /**
     * Загрузить документацию
     */
    loadDocs() {
        const container = Utils.$('docs-content');
        
        const docs = this.getAPIDocs();
        
        container.innerHTML = docs.map(section => `
            <div class="doc-section">
                <h4>${section.title}</h4>
                ${section.functions.map(func => `
                    <div class="doc-function">
                        <div class="doc-function-name">${func.name}</div>
                        <div class="doc-function-desc">${func.description}</div>
                        ${func.example ? `<div class="doc-function-example">${func.example}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    /**
     * Получить документацию API
     */
    getAPIDocs() {
        return [
            {
                title: '🤖 Игрок (player)',
                functions: [
                    {
                        name: 'player.move(direction, steps)',
                        description: 'Переместить персонажа в указанном направлении',
                        example: 'player.move("right", 3)'
                    },
                    {
                        name: 'player.moveTo(x, y)',
                        description: 'Переместить персонажа к указанным координатам',
                        example: 'player.moveTo(5, 3)'
                    },
                    {
                        name: 'player.jump(direction, distance)',
                        description: 'Прыгнуть через препятствия',
                        example: 'player.jump("right", 2)'
                    },
                    {
                        name: 'player.collect()',
                        description: 'Собрать предмет на текущей позиции',
                        example: 'player.collect()'
                    },
                    {
                        name: 'player.interact()',
                        description: 'Взаимодействовать с объектом рядом',
                        example: 'player.interact()'
                    },
                    {
                        name: 'player.say(message)',
                        description: 'Показать сообщение от персонажа',
                        example: 'player.say("Привет!")'
                    },
                    {
                        name: 'player.wait(seconds)',
                        description: 'Подождать указанное время',
                        example: 'player.wait(1)'
                    },
                    {
                        name: 'player.getPosition()',
                        description: 'Получить текущую позицию {x, y}',
                        example: 'pos = player.getPosition()'
                    },
                    {
                        name: 'player.getEnergy()',
                        description: 'Получить текущий уровень энергии',
                        example: 'energy = player.getEnergy()'
                    }
                ]
            },
            {
                title: '🌍 Мир (world)',
                functions: [
                    {
                        name: 'world.getTile(x, y)',
                        description: 'Получить тип тайла на позиции',
                        example: 'tile = world.getTile(3, 2)'
                    },
                    {
                        name: 'world.canMoveTo(x, y)',
                        description: 'Проверить можно ли пройти на позицию',
                        example: 'if world.canMoveTo(x, y):'
                    },
                    {
                        name: 'world.getExitPosition()',
                        description: 'Получить позицию выхода',
                        example: 'exit = world.getExitPosition()'
                    },
                    {
                        name: 'world.getRemainingCrystals()',
                        description: 'Получить количество оставшихся кристаллов',
                        example: 'count = world.getRemainingCrystals()'
                    }
                ]
            },
            {
                title: '📊 Направления',
                functions: [
                    { name: '"up"', description: 'Вверх' },
                    { name: '"down"', description: 'Вниз' },
                    { name: '"left"', description: 'Влево' },
                    { name: '"right"', description: 'Вправо' }
                ]
            }
        ];
    },

    /**
     * Переключить полноэкранный режим
     */
    toggleFullscreen() {
        const section = document.querySelector('.code-editor-section');
        section.classList.toggle('editor-fullscreen');
        AudioManager.play('click');
    }
};

// Экспорт
window.CodeEditor = CodeEditor;
