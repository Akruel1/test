/**
 * CODEWORLD - Game Engine
 * Основной игровой движок
 */

const Game = {
    // Состояние
    isRunning: false,
    isPaused: false,
    speed: 1,
    time: 0,
    lastTime: 0,
    
    // Объекты
    world: null,
    player: null,
    
    // Уровень
    currentLevel: 1,
    levelComplete: false,
    levelStartTime: 0,
    
    // Статистика
    score: 0,
    linesOfCode: 0,
    executionTime: 0,
    
    // Callbacks
    onLevelComplete: null,
    onError: null,
    onLog: null,

    /**
     * Инициализация игры
     */
    init() {
        // Создать мир
        this.world = new World();
        
        // Создать игрока
        this.player = new Player();
        
        // Инициализировать рендерер
        Renderer.init('game-canvas');
        
        // Привязка событий
        this.bindEvents();
        
        // Подписка на события
        Utils.on('crystal-collected', () => {
            this.score += 100;
            this.updateUI();
        });
        
        Utils.on('player-say', (data) => {
            this.showMessage(data.message);
        });

        // Обработчик завершения действий игрока
        this.player.onActionComplete = (action, result) => {
            this.checkWinCondition();
        };

        // Обработчик ошибок игрока
        this.player.onError = (error) => {
            this.handleError(error);
        };
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопка запуска
        Utils.$('btn-run').addEventListener('click', () => this.runCode());
        
        // Кнопка остановки
        Utils.$('btn-stop').addEventListener('click', () => this.stopExecution());
        
        // Кнопка сброса
        Utils.$('btn-reset').addEventListener('click', () => this.resetLevel());
        
        // Скорость
        Utils.$('game-speed').addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            Utils.$('speed-value').textContent = this.speed + 'x';
        });

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' && !e.ctrlKey) {
                e.preventDefault();
                this.runCode();
            } else if (e.key === 'Escape') {
                this.stopExecution();
            }
        });
    },

    /**
     * Загрузить уровень
     */
    loadLevel(levelNumber) {
        const levelData = LevelData.getLevel(levelNumber);
        
        if (!levelData) {
            console.error('Level not found:', levelNumber);
            return false;
        }

        this.currentLevel = levelNumber;
        this.levelComplete = false;
        this.score = 0;
        this.linesOfCode = 0;
        this.executionTime = 0;

        // Загрузить мир
        this.world.loadLevel(levelData);

        // Сбросить игрока
        this.player.reset(
            this.world.playerStart.x,
            this.world.playerStart.y
        );

        // Обновить UI
        Utils.$('current-level').textContent = levelData.name;
        Utils.$('current-objective').querySelector('.objective-text').textContent = levelData.objective;

        // Загрузить начальный код
        const savedCode = GameProgress.getCode(levelNumber);
        if (savedCode) {
            CodeEditor.setValue(savedCode);
        } else if (levelData.starterCode) {
            CodeEditor.setValue(levelData.starterCode);
        } else {
            CodeEditor.setValue(this.getDefaultCode());
        }

        // Загрузить подсказки
        this.loadHints(levelData.hints || []);

        this.updateUI();
        
        return true;
    },

    /**
     * Получить код по умолчанию
     */
    getDefaultCode() {
        const lang = GameProgress.getSettings().language;
        
        const templates = {
            python: `# Напишите код для управления персонажем
# Используйте player.move("направление", шаги)

player.move("right", 3)
`,
            javascript: `// Напишите код для управления персонажем
// Используйте await player.move("направление", шаги)

await player.move("right", 3);
`,
            java: `// Напишите код для управления персонажем
// Используйте player.move("направление", шаги)

player.move("right", 3);
`
        };

        return templates[lang] || templates.python;
    },

    /**
     * Загрузить подсказки
     */
    loadHints(hints) {
        const container = Utils.$('hints-content');
        container.innerHTML = '';

        hints.forEach((hint, index) => {
            const hintEl = Utils.createElement('div', 'hint-item');
            hintEl.innerHTML = `
                <div class="hint-number">Подсказка ${index + 1}</div>
                <div class="hint-text">${hint}</div>
            `;
            container.appendChild(hintEl);
        });

        if (hints.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted)">Для этого уровня подсказок нет</p>';
        }
    },

    /**
     * Запустить код
     */
    async runCode() {
        if (this.isRunning) return;

        const code = CodeEditor.getValue();
        
        // Сохранить код
        GameProgress.saveCode(this.currentLevel, code);

        // Очистить консоль
        this.clearConsole();
        
        // Сбросить состояние
        this.resetLevel(false);

        this.isRunning = true;
        this.levelStartTime = performance.now();
        this.linesOfCode = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('//')).length;

        this.log('Запуск программы...', 'info');
        AudioManager.play('run');

        // Запустить игровой цикл
        this.startGameLoop();

        try {
            // Выполнить код
            await Interpreter.execute(code, this.player, this.world);
            
            // Ждать завершения всех действий
            while (this.player.actionQueue.length > 0 || this.player.currentAction) {
                await Utils.delay(100);
            }

            this.executionTime = (performance.now() - this.levelStartTime) / 1000;
            
            // Проверить победу
            this.checkWinCondition();

        } catch (error) {
            this.handleError(error.message);
        }

        this.isRunning = false;
    },

    /**
     * Остановить выполнение
     */
    stopExecution() {
        this.isRunning = false;
        this.player.clearQueue();
        Interpreter.stop();
        this.log('Выполнение остановлено', 'warning');
    },

    /**
     * Сбросить уровень
     */
    resetLevel(clearCode = false) {
        this.isRunning = false;
        this.levelComplete = false;
        this.player.clearQueue();
        Interpreter.stop();

        // Перезагрузить уровень
        if (this.currentLevel) {
            const levelData = LevelData.getLevel(this.currentLevel);
            if (levelData) {
                this.world.loadLevel(levelData);
                this.player.reset(
                    this.world.playerStart.x,
                    this.world.playerStart.y
                );
            }
        }

        if (clearCode) {
            CodeEditor.setValue(this.getDefaultCode());
        }

        this.updateUI();
    },

    /**
     * Игровой цикл
     */
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    },

    /**
     * Один кадр игрового цикла
     */
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) * this.speed;
        this.lastTime = currentTime;
        this.time += deltaTime / 1000;

        // Обновление
        this.update(deltaTime);

        // Отрисовка
        this.render();

        // Продолжить цикл если игра активна
        if (this.isRunning || this.player.actionQueue.length > 0 || this.player.currentAction) {
            requestAnimationFrame(() => this.gameLoop());
        }
    },

    /**
     * Обновление состояния
     */
    update(deltaTime) {
        // Обновить игрока
        this.player.update(deltaTime, this.world);

        // Центрировать камеру на игроке
        Renderer.centerCamera(
            this.player.x,
            this.player.y,
            this.world.width,
            this.world.height
        );

        // Обновить UI
        this.updateUI();
    },

    /**
     * Отрисовка
     */
    render() {
        Renderer.clear();
        Renderer.drawGrid();
        
        // Отрисовать мир
        this.world.render(this.time);
        
        // Отрисовать игрока
        Renderer.drawPlayer(this.player, this.time);
        
        // Отрисовать частицы
        Renderer.updateParticles();
    },

    /**
     * Проверка условия победы
     */
    checkWinCondition() {
        if (this.levelComplete) return;

        // Проверить достижение выхода
        if (this.world.checkExit(this.player.x, this.player.y)) {
            // Проверить сбор всех кристаллов (если требуется)
            const levelData = LevelData.getLevel(this.currentLevel);
            
            if (levelData.requireAllCrystals && this.world.getRemainingCrystals() > 0) {
                this.log('Соберите все кристаллы перед выходом!', 'warning');
                return;
            }

            this.completeLevel();
        }
    },

    /**
     * Завершение уровня
     */
    completeLevel() {
        this.levelComplete = true;
        this.isRunning = false;

        // Подсчёт звёзд
        const stars = this.calculateStars();

        // Подсчёт очков
        const crystalBonus = this.player.crystals * 100;
        const timeBonus = Math.max(0, 1000 - Math.floor(this.executionTime * 100));
        const codeBonus = Math.max(0, 500 - this.linesOfCode * 20);
        this.score += crystalBonus + timeBonus + codeBonus;

        // Сохранить прогресс
        GameProgress.completeLevel(this.currentLevel, this.score, stars);
        GameProgress.addScore(this.score);
        GameProgress.addCrystals(this.player.crystals);

        // Показать модальное окно
        this.showLevelCompleteModal(stars);

        // Проверить достижения
        AchievementSystem.checkLevelComplete(this.currentLevel, stars, this.linesOfCode, this.executionTime);

        AudioManager.play('levelComplete');
        this.log('Уровень пройден!', 'success');
    },

    /**
     * Подсчёт звёзд
     */
    calculateStars() {
        let stars = 1; // Минимум за прохождение

        // Бонус за сбор всех кристаллов
        if (this.world.getRemainingCrystals() === 0) {
            stars++;
        }

        // Бонус за эффективный код
        if (this.linesOfCode <= 10) {
            stars++;
        }

        return Math.min(stars, 3);
    },

    /**
     * Показать модальное окно завершения
     */
    showLevelCompleteModal(stars) {
        const modal = Utils.$('level-complete-modal');
        const starsEl = Utils.$('complete-stars');
        
        starsEl.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        starsEl.style.color = stars === 3 ? 'var(--neon-yellow)' : 'var(--text-secondary)';
        
        Utils.$('stat-lines').textContent = this.linesOfCode;
        Utils.$('stat-time').textContent = this.executionTime.toFixed(2) + 's';
        Utils.$('stat-score').textContent = this.score;

        Utils.show(modal);

        // Кнопки
        Utils.$('btn-retry-level').onclick = () => {
            Utils.hide(modal);
            this.resetLevel();
        };

        Utils.$('btn-next-level').onclick = () => {
            Utils.hide(modal);
            this.loadLevel(this.currentLevel + 1);
        };
    },

    /**
     * Обработка ошибки
     */
    handleError(message) {
        this.isRunning = false;
        this.player.clearQueue();
        
        // Визуальный эффект
        Renderer.createErrorEffect(this.player.x, this.player.y);
        
        // Звук
        AudioManager.play('error');
        
        // Логирование
        this.logError(message);

        // Показать оверлей
        this.showOverlay(message);
    },

    /**
     * Показать сообщение оверлея
     */
    showOverlay(message) {
        const overlay = Utils.$('game-overlay');
        const msgEl = Utils.$('overlay-message');
        msgEl.textContent = message;
        overlay.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 2000);
    },

    /**
     * Показать сообщение персонажа
     */
    showMessage(message) {
        this.log(`Персонаж: "${message}"`, 'info');
    },

    /**
     * Логирование
     */
    log(message, type = 'info') {
        const console = Utils.$('console-output');
        const line = Utils.createElement('div', `console-line ${type}`);
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="console-timestamp">[${timestamp}]</span> ${Utils.escapeHtml(message)}`;
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;
    },

    /**
     * Логирование ошибки
     */
    logError(message) {
        const console = Utils.$('console-errors');
        const line = Utils.createElement('div', 'console-line error');
        line.textContent = `❌ ${message}`;
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;

        // Подсветить таб ошибок
        const errorTab = document.querySelector('[data-console="errors"]');
        errorTab.classList.add('has-errors');
    },

    /**
     * Очистить консоль
     */
    clearConsole() {
        Utils.$('console-output').innerHTML = '';
        Utils.$('console-errors').innerHTML = '';
        Utils.$('console-log').innerHTML = '';
        
        const errorTab = document.querySelector('[data-console="errors"]');
        errorTab.classList.remove('has-errors');
    },

    /**
     * Обновить UI
     */
    updateUI() {
        Utils.$('energy-count').textContent = this.player.energy;
        Utils.$('crystals-count').textContent = this.player.crystals;
        Utils.$('score-count').textContent = this.score;
    },

    /**
     * Запуск в режиме песочницы
     */
    startSandbox() {
        this.world.generateLevel(1);
        this.player.reset(
            this.world.playerStart.x,
            this.world.playerStart.y
        );
        
        Utils.$('current-level').textContent = 'Песочница';
        Utils.$('current-objective').querySelector('.objective-text').textContent = 'Свободное исследование';
        
        CodeEditor.setValue(this.getDefaultCode());
        this.updateUI();
    },

    /**
     * Пауза
     */
    pause() {
        this.isPaused = true;
    },

    /**
     * Продолжить
     */
    resume() {
        this.isPaused = false;
    }
};

// Экспорт
window.Game = Game;
