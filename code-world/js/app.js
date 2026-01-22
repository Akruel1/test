/**
 * CodeWorld - Main Application
 * Initializes and coordinates all components
 */

const App = {
    // Current state
    state: {
        currentScreen: 'loading',
        introSlide: 0,
        currentLevel: 1
    },
    
    // Intro slides content
    introSlides: [
        {
            icon: '🌍',
            title: 'Добро пожаловать в CodeWorld!',
            text: 'Это не просто игра — это <strong>программируемый мир</strong>, где ты управляешь всем с помощью <span class="highlight">кода</span>.'
        },
        {
            icon: '🎮',
            title: 'Как это работает?',
            text: 'Забудь про кнопки и клавиши! Здесь персонаж двигается только когда ты <strong>напишешь программу</strong>. Каждое действие — это команда в коде.'
        },
        {
            icon: '💻',
            title: 'Пиши код — управляй миром',
            text: 'Используй функции вроде <code>moveRight()</code>, <code>collect()</code> и другие. Создавай циклы и условия для решения задач!',
            showCode: true,
            codeExample: `<span class="code-comment">// Пример кода</span>
<span class="code-keyword">for</span> (<span class="code-keyword">let</span> i = <span class="code-number">0</span>; i < <span class="code-number">3</span>; i++) {
    <span class="code-keyword">await</span> <span class="code-function">moveRight</span>();
}
<span class="code-keyword">await</span> <span class="code-function">collect</span>();`
        },
        {
            icon: '🏆',
            title: 'Решай задачи и развивайся',
            text: 'Проходи уровни, собирай достижения, учись программированию на практике. Поддерживаются <strong>JavaScript</strong> и <strong>Python</strong>!'
        },
        {
            icon: '🚀',
            title: 'Готов начать?',
            text: 'Погрузись в мир, где <strong>программирование</strong> — единственный способ взаимодействия с реальностью!',
            showStart: true
        }
    ],

    /**
     * Initialize application
     */
    async init() {
        console.log('CodeWorld initializing...');
        
        // Create loading particles
        this.createParticles();
        
        // Simulate loading
        await this.simulateLoading();
        
        // Initialize components
        Game.init();
        Editor.init();
        Achievements.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check if intro was seen
        if (Storage.hasSeenIntro()) {
            this.showGameScreen();
        } else {
            this.showIntroScreen();
        }
    },

    /**
     * Create loading screen particles
     */
    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            container.appendChild(particle);
        }
    },

    /**
     * Simulate loading progress
     */
    async simulateLoading() {
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        const stages = [
            { progress: 20, text: 'Загрузка ресурсов...' },
            { progress: 40, text: 'Инициализация мира...' },
            { progress: 60, text: 'Подготовка редактора...' },
            { progress: 80, text: 'Настройка уровней...' },
            { progress: 100, text: 'Готово!' }
        ];
        
        for (const stage of stages) {
            progressBar.style.width = stage.progress + '%';
            loadingText.textContent = stage.text;
            await Helpers.wait(400);
        }
        
        await Helpers.wait(500);
    },

    /**
     * Show intro screen
     */
    showIntroScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const introScreen = document.getElementById('intro-screen');
        
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            introScreen.classList.remove('hidden');
            this.renderIntroSlide(0);
            this.state.currentScreen = 'intro';
        }, 500);
    },

    /**
     * Render intro slide
     */
    renderIntroSlide(index) {
        const slide = this.introSlides[index];
        const content = document.getElementById('intro-content');
        const dotsContainer = document.getElementById('intro-dots');
        const nextBtn = document.getElementById('intro-next');
        
        // Update dots
        dotsContainer.innerHTML = '';
        this.introSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'intro-dot' + (i === index ? ' active' : '');
            dot.onclick = () => this.goToSlide(i);
            dotsContainer.appendChild(dot);
        });
        
        // Render slide content
        let html = `
            <div class="intro-slide active">
                <div class="slide-icon">${slide.icon}</div>
                <h2 class="slide-title">${slide.title}</h2>
                <p class="slide-text">${slide.text}</p>
        `;
        
        if (slide.showCode) {
            html += `
                <div class="intro-code-preview">
                    <code>${slide.codeExample}</code>
                </div>
            `;
        }
        
        if (slide.showStart) {
            html += `
                <button class="start-button" id="start-game">
                    НАЧАТЬ ПРИКЛЮЧЕНИЕ
                </button>
            `;
        }
        
        html += '</div>';
        content.innerHTML = html;
        
        // Update next button
        if (index === this.introSlides.length - 1) {
            nextBtn.style.visibility = 'hidden';
        } else {
            nextBtn.style.visibility = 'visible';
        }
        
        // Add start button listener
        if (slide.showStart) {
            document.getElementById('start-game').onclick = () => this.startGame();
        }
        
        this.state.introSlide = index;
    },

    /**
     * Go to specific slide
     */
    goToSlide(index) {
        if (index >= 0 && index < this.introSlides.length) {
            this.renderIntroSlide(index);
        }
    },

    /**
     * Next slide
     */
    nextSlide() {
        if (this.state.introSlide < this.introSlides.length - 1) {
            this.renderIntroSlide(this.state.introSlide + 1);
        }
    },

    /**
     * Skip intro
     */
    skipIntro() {
        this.startGame();
    },

    /**
     * Start game
     */
    startGame() {
        Storage.markIntroSeen();
        this.showGameScreen();
    },

    /**
     * Show game screen
     */
    showGameScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const introScreen = document.getElementById('intro-screen');
        const gameScreen = document.getElementById('game-screen');
        
        loadingScreen.classList.add('hidden');
        introScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        this.state.currentScreen = 'game';
        
        // Load first level
        this.loadLevel(Storage.getCurrentLevel());
        
        // Start game loop
        Game.start();
        
        // Update UI
        Achievements.updateUI();
    },

    /**
     * Load level
     */
    loadLevel(levelId) {
        const level = Levels.getLevel(levelId);
        if (!level) {
            console.error('Level not found:', levelId);
            return;
        }
        
        this.state.currentLevel = levelId;
        
        // Load level in game
        Game.loadLevel(level);
        
        // Set up game callbacks
        Game.onLevelComplete = (level, points) => this.onLevelComplete(level, points);
        Game.onObjectiveComplete = (objective) => this.onObjectiveComplete(objective);
        
        // Update UI
        document.getElementById('current-level').textContent = `Уровень ${level.id}`;
        document.getElementById('level-name').textContent = level.name;
        
        // Update task panel
        this.updateTaskPanel(level);
        
        // Load level code or starter code
        const savedCode = Storage.getCode(levelId);
        if (savedCode) {
            Editor.setCode(savedCode);
        } else {
            const starterCode = Levels.getStarterCode(levelId, Editor.currentLanguage);
            Editor.setCode(starterCode);
        }
    },

    /**
     * Update task panel
     */
    updateTaskPanel(level) {
        const content = document.getElementById('task-content');
        
        let html = `
            <p class="task-description">${level.description}</p>
            <ul class="task-objectives">
        `;
        
        level.objectives.forEach(obj => {
            html += `<li class="task-objective">${obj.description}</li>`;
        });
        
        html += '</ul>';
        
        if (level.hints && level.hints.length > 0) {
            html += `<p class="task-hint">💡 ${level.hints[0]}</p>`;
        }
        
        content.innerHTML = html;
    },

    /**
     * On level complete
     */
    onLevelComplete(level, points) {
        // Save progress
        Storage.completeLevel(level.id);
        Storage.addPoints(points);
        
        // Track achievements
        Achievements.trackLevelComplete(level.id);
        Achievements.trackPoints(Storage.getPoints());
        Achievements.analyzeCode(Editor.getCode(), Editor.currentLanguage);
        
        // Update UI
        Achievements.updateUI();
        
        // Log to console
        this.logToConsole('level-complete', `🎉 Уровень "${level.name}" пройден! +${points} очков`);
        
        // Show next level button after delay
        setTimeout(() => {
            const nextLevel = Levels.getNextLevel(level.id);
            if (nextLevel) {
                this.logToConsole('info', `Следующий уровень: "${nextLevel.name}" - нажми кнопку в меню или перезапусти`);
            } else {
                this.logToConsole('success', '🏆 Поздравляем! Ты прошел все уровни!');
            }
        }, 2000);
    },

    /**
     * On objective complete
     */
    onObjectiveComplete(objective) {
        this.logToConsole('success', `✓ Цель выполнена: ${objective.description}`);
        
        // Update task panel
        const objectives = document.querySelectorAll('.task-objective');
        const index = Game.objectives.indexOf(objective);
        if (objectives[index]) {
            objectives[index].classList.add('completed');
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Intro navigation
        document.getElementById('intro-next').onclick = () => this.nextSlide();
        document.getElementById('intro-skip').onclick = () => this.skipIntro();
        
        // Run code button
        document.getElementById('run-code').onclick = () => this.runCode();
        
        // Stop code button
        document.getElementById('stop-code').onclick = () => this.stopCode();
        
        // Clear console button
        document.getElementById('clear-console').onclick = () => this.clearConsole();
        
        // Language selector
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => this.changeLanguage(btn.dataset.lang);
        });
        
        // Menu button
        document.getElementById('menu-btn').onclick = () => this.toggleMenu();
        document.getElementById('close-menu').onclick = () => this.toggleMenu();
        
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.onclick = () => this.handleMenuAction(item.dataset.action);
        });
        
        // Task panel collapse
        document.getElementById('collapse-task').onclick = () => this.toggleTaskPanel();
        
        // Modal close
        document.getElementById('modal-close').onclick = () => this.closeModal();
        document.getElementById('modal-overlay').onclick = (e) => {
            if (e.target.id === 'modal-overlay') this.closeModal();
        };
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modal/menu
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeMenu();
            }
        });
    },

    /**
     * Run code
     */
    async runCode() {
        const code = Editor.getCode();
        
        // Clear console
        this.clearConsole();
        
        // Reset level if completed
        if (Game.levelCompleted) {
            Game.reset();
        }
        
        // Set up executor output callback
        Executor.onOutput = (type, message) => this.logToConsole(type, message);
        
        // Track code run
        let hadErrors = false;
        
        try {
            await Executor.execute(code);
        } catch (error) {
            hadErrors = true;
        }
        
        // Track for achievements
        Achievements.trackCodeRun(hadErrors, Editor.currentLanguage);
        
        // Save code
        Storage.saveCode(this.state.currentLevel, code);
    },

    /**
     * Stop code execution
     */
    stopCode() {
        Executor.stop();
    },

    /**
     * Log to console
     */
    logToConsole(type, message) {
        const output = document.getElementById('console-output');
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        const timestamp = Helpers.timestamp();
        line.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    },

    /**
     * Clear console
     */
    clearConsole() {
        const output = document.getElementById('console-output');
        output.innerHTML = '<div class="console-line system">Консоль очищена. Готов к запуску.</div>';
    },

    /**
     * Change programming language
     */
    changeLanguage(language) {
        // Update buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === language);
        });
        
        // Update editor
        Editor.setLanguage(language);
        
        // Update tab name
        const tab = document.querySelector('.tab');
        tab.textContent = language === 'python' ? 'main.py' : 'main.js';
        
        this.logToConsole('info', `Язык изменён на ${language === 'python' ? 'Python' : 'JavaScript'}`);
    },

    /**
     * Toggle side menu
     */
    toggleMenu() {
        const menu = document.getElementById('side-menu');
        menu.classList.toggle('hidden');
    },

    /**
     * Close menu
     */
    closeMenu() {
        const menu = document.getElementById('side-menu');
        menu.classList.add('hidden');
    },

    /**
     * Handle menu action
     */
    handleMenuAction(action) {
        this.closeMenu();
        
        switch (action) {
            case 'levels':
                this.showLevelsModal();
                break;
            case 'achievements':
                this.showAchievementsModal();
                break;
            case 'docs':
                this.showDocsModal();
                break;
            case 'settings':
                this.showSettingsModal();
                break;
            case 'about':
                this.showAboutModal();
                break;
        }
    },

    /**
     * Toggle task panel
     */
    toggleTaskPanel() {
        const content = document.getElementById('task-content');
        const btn = document.getElementById('collapse-task');
        content.classList.toggle('collapsed');
        btn.textContent = content.classList.contains('collapsed') ? '▲' : '▼';
    },

    /**
     * Show modal
     */
    showModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-content').innerHTML = content;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    /**
     * Show levels modal
     */
    showLevelsModal() {
        const levels = Levels.getAllLevels();
        const progress = Storage.getProgress();
        
        let html = '<div class="levels-grid">';
        
        levels.forEach(level => {
            const isUnlocked = Levels.isUnlocked(level.id);
            const isCompleted = progress.completedLevels?.includes(level.id);
            const isCurrent = level.id === this.state.currentLevel;
            
            html += `
                <div class="level-card ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}"
                     onclick="${isUnlocked ? `App.selectLevel(${level.id})` : ''}">
                    <div class="level-number">${isUnlocked ? level.id : '🔒'}</div>
                    <div class="level-info">
                        <span class="level-title">${level.name}</span>
                        <span class="level-difficulty">${level.difficulty}</span>
                    </div>
                    ${isCompleted ? '<span class="level-check">✓</span>' : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add styles inline for modal
        html += `
            <style>
                .levels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
                .level-card { background: var(--bg-tertiary); padding: 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
                .level-card:hover:not(.locked) { border-color: var(--accent-primary); transform: translateY(-2px); }
                .level-card.locked { opacity: 0.5; cursor: not-allowed; }
                .level-card.completed { border-color: var(--accent-success); }
                .level-card.current { border-color: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
                .level-number { font-family: var(--font-pixel); font-size: 24px; color: var(--accent-primary); }
                .level-info { margin-top: 8px; }
                .level-title { display: block; font-size: 14px; color: var(--text-primary); }
                .level-difficulty { font-size: 12px; color: var(--text-muted); }
                .level-check { color: var(--accent-success); font-size: 20px; float: right; }
            </style>
        `;
        
        this.showModal('📚 Уровни', html);
    },

    /**
     * Select level from modal
     */
    selectLevel(levelId) {
        this.closeModal();
        this.loadLevel(levelId);
        Game.reset();
    },

    /**
     * Show achievements modal
     */
    showAchievementsModal() {
        const html = Achievements.generateModalContent() + `
            <style>
                .achievements-summary { display: flex; justify-content: space-around; padding: 20px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 20px; }
                .summary-stat { text-align: center; }
                .summary-stat .stat-value { display: block; font-family: var(--font-pixel); font-size: 24px; color: var(--accent-primary); }
                .summary-stat .stat-label { font-size: 12px; color: var(--text-muted); }
                .achievements-list h3 { font-family: var(--font-pixel); font-size: 12px; color: var(--accent-primary); margin: 20px 0 10px; }
                .achievement-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; }
                .achievement-item.locked { opacity: 0.5; }
                .achievement-icon { font-size: 28px; }
                .achievement-details { flex: 1; }
                .achievement-name { display: block; font-size: 14px; color: var(--text-primary); }
                .achievement-desc { font-size: 12px; color: var(--text-muted); }
                .achievement-points { font-family: var(--font-pixel); font-size: 12px; color: var(--accent-success); }
                .no-achievements { color: var(--text-muted); text-align: center; padding: 20px; }
            </style>
        `;
        
        this.showModal('🏆 Достижения', html);
    },

    /**
     * Show documentation modal
     */
    showDocsModal() {
        const html = `
            <div class="docs-content">
                <h3>🎮 Основные команды</h3>
                <table class="docs-table">
                    <tr><td><code>await moveUp()</code></td><td>Двигаться вверх</td></tr>
                    <tr><td><code>await moveDown()</code></td><td>Двигаться вниз</td></tr>
                    <tr><td><code>await moveLeft()</code></td><td>Двигаться влево</td></tr>
                    <tr><td><code>await moveRight()</code></td><td>Двигаться вправо</td></tr>
                    <tr><td><code>await move(dir, n)</code></td><td>Двигаться в направлении dir на n шагов</td></tr>
                    <tr><td><code>await collect()</code></td><td>Собрать предмет</td></tr>
                    <tr><td><code>await wait(ms)</code></td><td>Подождать ms миллисекунд</td></tr>
                </table>
                
                <h3>🔍 Исследование</h3>
                <table class="docs-table">
                    <tr><td><code>getPosition()</code></td><td>Получить позицию {x, y}</td></tr>
                    <tr><td><code>canMove(dir)</code></td><td>Можно ли двигаться в направлении</td></tr>
                    <tr><td><code>look()</code></td><td>Информация об окружении</td></tr>
                    <tr><td><code>hasItem(type)</code></td><td>Есть ли предмет в инвентаре</td></tr>
                </table>
                
                <h3>💡 Примеры</h3>
                <pre class="docs-code">
// Цикл для повторения действия
for (let i = 0; i < 5; i++) {
    await moveRight();
}

// Условие для проверки пути
if (canMove('right')) {
    await moveRight();
}

// Сбор предметов в цикле
for (let i = 0; i < 3; i++) {
    await moveRight();
    await collect();
}
                </pre>
            </div>
            <style>
                .docs-content h3 { font-family: var(--font-pixel); font-size: 12px; color: var(--accent-primary); margin: 20px 0 10px; }
                .docs-table { width: 100%; border-collapse: collapse; }
                .docs-table td { padding: 8px; border-bottom: 1px solid var(--bg-tertiary); }
                .docs-table code { background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; color: var(--neon-cyan); }
                .docs-code { background: var(--bg-tertiary); padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
            </style>
        `;
        
        this.showModal('📖 Документация', html);
    },

    /**
     * Show settings modal
     */
    showSettingsModal() {
        const settings = Storage.getSettings();
        
        const html = `
            <div class="settings-content">
                <div class="setting-group">
                    <label>Размер шрифта редактора</label>
                    <input type="range" min="12" max="20" value="${settings.fontSize}" 
                           onchange="App.updateSetting('fontSize', this.value)">
                    <span>${settings.fontSize}px</span>
                </div>
                
                <div class="setting-group">
                    <label>
                        <input type="checkbox" ${settings.showLineNumbers ? 'checked' : ''} 
                               onchange="App.updateSetting('showLineNumbers', this.checked)">
                        Показывать номера строк
                    </label>
                </div>
                
                <div class="setting-group">
                    <button class="pixel-button" onclick="App.resetProgress()">
                        🗑️ Сбросить прогресс
                    </button>
                </div>
                
                <div class="setting-group">
                    <button class="pixel-button" onclick="App.exportSave()">
                        📤 Экспорт сохранения
                    </button>
                    <button class="pixel-button" onclick="App.importSave()">
                        📥 Импорт сохранения
                    </button>
                </div>
            </div>
            <style>
                .settings-content { display: flex; flex-direction: column; gap: 20px; }
                .setting-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .setting-group label { color: var(--text-primary); }
                .setting-group input[type="range"] { flex: 1; min-width: 100px; }
                .setting-group button { margin-top: 10px; }
            </style>
        `;
        
        this.showModal('⚙️ Настройки', html);
    },

    /**
     * Update setting
     */
    updateSetting(key, value) {
        Storage.saveSettings({ [key]: value });
        
        if (key === 'fontSize') {
            document.getElementById('code-editor').style.fontSize = value + 'px';
        }
    },

    /**
     * Reset progress
     */
    resetProgress() {
        if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
            Storage.clearAll();
            location.reload();
        }
    },

    /**
     * Export save
     */
    exportSave() {
        const data = Storage.exportSave();
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codeworld-save.txt';
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Import save
     */
    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (Storage.importSave(e.target.result)) {
                    alert('Сохранение импортировано!');
                    location.reload();
                } else {
                    alert('Ошибка импорта!');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    /**
     * Show about modal
     */
    showAboutModal() {
        const html = `
            <div class="about-content">
                <div class="about-logo">
                    <span>CODE</span><span class="accent">WORLD</span>
                </div>
                <p>Программируемая игровая вселенная</p>
                <p class="about-version">Версия 1.0.0</p>
                
                <div class="about-features">
                    <div class="feature">🎮 Игровой мир, управляемый кодом</div>
                    <div class="feature">💻 Поддержка JavaScript и Python</div>
                    <div class="feature">🏆 Система достижений</div>
                    <div class="feature">📚 Обучающие уровни</div>
                </div>
                
                <p class="about-desc">
                    CodeWorld — это интерактивная платформа для изучения программирования 
                    через игру. Управляй персонажем с помощью кода, решай задачи и 
                    развивай навыки программирования!
                </p>
            </div>
            <style>
                .about-content { text-align: center; }
                .about-logo { font-family: var(--font-pixel); font-size: 24px; margin-bottom: 10px; }
                .about-logo .accent { color: var(--accent-primary); }
                .about-version { color: var(--text-muted); font-size: 12px; margin: 10px 0 20px; }
                .about-features { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 20px 0; }
                .about-features .feature { background: var(--bg-tertiary); padding: 8px 16px; border-radius: 20px; font-size: 13px; }
                .about-desc { color: var(--text-secondary); line-height: 1.6; margin-top: 20px; }
            </style>
        `;
        
        this.showModal('ℹ️ О проекте', html);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make it globally available
window.App = App;
