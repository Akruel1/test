/**
 * CODEWORLD - Main Application
 * Точка входа и управление приложением
 */

const App = {
    state: 'loading', // loading, presentation, menu, game
    
    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Initializing CodeWorld...');
        
        // Запустить загрузчик
        Loader.init(LoadingTasks, () => this.onLoadComplete());
        await Loader.start();
    },

    /**
     * Загрузка завершена
     */
    onLoadComplete() {
        console.log('✅ Loading complete');
        
        Loader.hide();
        
        // Проверить первый визит
        if (GameProgress.isFirstVisit()) {
            this.showPresentation();
        } else {
            this.showMainMenu();
        }
    },

    /**
     * Показать презентацию
     */
    showPresentation() {
        this.state = 'presentation';
        Presentation.init(() => this.showMainMenu());
        Presentation.show();
    },

    /**
     * Показать главное меню
     */
    showMainMenu() {
        this.state = 'menu';
        
        Utils.hide('loader-screen');
        Utils.hide('presentation-screen');
        Utils.hide('game-screen');
        Utils.show('main-menu');
        
        this.initMenu();
        this.initMenuParticles();
        
        // Запустить музыку
        AudioManager.startMusic();
    },

    /**
     * Инициализация меню
     */
    initMenu() {
        // Установить выбранный язык
        const savedLang = GameProgress.getSettings().language;
        Utils.$('programming-language').value = savedLang;

        // Проверить возможность продолжения
        const progress = GameProgress.state;
        const continueBtn = Utils.$('btn-continue');
        if (progress.completedLevels.length > 0) {
            continueBtn.disabled = false;
        }

        // Привязка кнопок
        Utils.$('btn-new-game').onclick = () => this.startNewGame();
        Utils.$('btn-continue').onclick = () => this.continueGame();
        Utils.$('btn-sandbox').onclick = () => this.startSandbox();
        Utils.$('btn-achievements').onclick = () => this.showAchievements();
        Utils.$('btn-settings').onclick = () => this.showSettings();

        // Выбор языка
        Utils.$('programming-language').onchange = (e) => {
            GameProgress.updateSettings({ language: e.target.value });
            CodeEditor.setLanguage(e.target.value);
            AudioManager.play('click');
        };
    },

    /**
     * Анимация частиц в меню
     */
    initMenuParticles() {
        const canvas = Utils.$('menu-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        // Создать частицы
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: ['#00ffff', '#ff00ff', '#00ff88', '#ffff00'][Math.floor(Math.random() * 4)],
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            if (this.state !== 'menu') return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Движение
                p.x += p.speedX;
                p.y += p.speedY;

                // Границы
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Отрисовка
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };

        animate();

        // Обработка изменения размера
        window.onresize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
    },

    /**
     * Начать новую игру
     */
    startNewGame() {
        AudioManager.play('click');
        
        // Можно сбросить прогресс или начать с первого уровня
        this.startGame(1);
    },

    /**
     * Продолжить игру
     */
    continueGame() {
        AudioManager.play('click');
        
        const currentLevel = GameProgress.getCurrentLevel();
        this.startGame(currentLevel);
    },

    /**
     * Запустить игру с уровня
     */
    startGame(levelNumber) {
        this.state = 'game';
        
        Utils.hide('main-menu');
        Utils.show('game-screen');
        
        // Инициализация игровых компонентов
        Game.init();
        CodeEditor.init();
        SpriteManager.init();
        
        // Загрузить уровень
        Game.loadLevel(levelNumber);
        
        // Первый рендер
        Game.render();
        
        // Привязка кнопки меню
        Utils.$('btn-menu-toggle').onclick = () => this.showMainMenu();
    },

    /**
     * Запустить песочницу
     */
    startSandbox() {
        AudioManager.play('click');
        
        this.state = 'game';
        
        Utils.hide('main-menu');
        Utils.show('game-screen');
        
        Game.init();
        CodeEditor.init();
        SpriteManager.init();
        
        Game.startSandbox();
        Game.render();
        
        Utils.$('btn-menu-toggle').onclick = () => this.showMainMenu();
    },

    /**
     * Показать достижения
     */
    showAchievements() {
        AudioManager.play('click');
        
        // Создать модальное окно достижений
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'achievements-list-modal';
        modal.innerHTML = `
            <div class="modal-content achievements-list">
                <div class="modal-header">
                    <h3>🏆 Достижения</h3>
                    <button class="close-btn" id="close-achievements">✕</button>
                </div>
                <div class="achievements-content" id="achievements-content"></div>
            </div>
        `;
        document.body.appendChild(modal);

        AchievementSystem.renderList('achievements-content');

        Utils.$('close-achievements').onclick = () => {
            modal.remove();
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    },

    /**
     * Показать настройки
     */
    showSettings() {
        AudioManager.play('click');
        
        const settings = GameProgress.getSettings();
        
        Utils.$('editor-theme').value = settings.editorTheme;
        Utils.$('font-size').value = settings.fontSize;
        Utils.$('font-size-value').textContent = settings.fontSize + 'px';
        Utils.$('sound-effects').checked = settings.soundEffects;
        Utils.$('music').checked = settings.music;
        Utils.$('show-hints').checked = settings.showHints;

        Utils.show('settings-modal');

        // Обработчики
        Utils.$('font-size').oninput = (e) => {
            Utils.$('font-size-value').textContent = e.target.value + 'px';
        };

        Utils.$('close-settings').onclick = () => {
            Utils.hide('settings-modal');
        };

        Utils.$('save-settings').onclick = () => {
            const newSettings = {
                editorTheme: Utils.$('editor-theme').value,
                fontSize: parseInt(Utils.$('font-size').value),
                soundEffects: Utils.$('sound-effects').checked,
                music: Utils.$('music').checked,
                showHints: Utils.$('show-hints').checked
            };

            GameProgress.updateSettings(newSettings);
            this.applySettings(newSettings);
            
            Utils.hide('settings-modal');
            AudioManager.play('success');
        };
    },

    /**
     * Применить настройки
     */
    applySettings(settings) {
        // Тема редактора
        document.body.className = `theme-${settings.editorTheme}`;
        
        // Размер шрифта
        const editor = Utils.$('code-editor');
        if (editor) {
            editor.style.fontSize = settings.fontSize + 'px';
        }

        // Музыка
        if (!settings.music) {
            AudioManager.stopMusic();
        } else if (this.state === 'menu') {
            AudioManager.startMusic();
        }
    }
};

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Возобновить аудио контекст при первом взаимодействии
    document.addEventListener('click', () => {
        AudioManager.resume();
    }, { once: true });

    // Инициализация
    App.init();
});

// Обработка ухода со страницы
window.addEventListener('beforeunload', () => {
    // Сохранить время игры
    GameProgress.addPlayTime(1);
});

// Экспорт
window.App = App;
