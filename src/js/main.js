/**
 * CodeWorld - Main Entry Point
 * Initializes and orchestrates all game systems
 */

import { LoadingManager } from './ui/LoadingManager.js';
import { IntroPresentation } from './ui/IntroPresentation.js';
import { GameEngine } from './engine/GameEngine.js';
import { CodeEditor } from './ui/CodeEditor.js';
import { ConsoleManager } from './ui/ConsoleManager.js';
import { UIManager } from './ui/UIManager.js';
import { SaveManager } from './engine/SaveManager.js';
import { AchievementManager } from './engine/AchievementManager.js';
import { SoundManager } from './engine/SoundManager.js';

class CodeWorld {
    constructor() {
        this.loading = null;
        this.intro = null;
        this.game = null;
        this.editor = null;
        this.console = null;
        this.ui = null;
        this.save = null;
        this.achievements = null;
        this.sound = null;
        
        this.currentLanguage = 'javascript';
        this.isFirstVisit = true;
    }

    async init() {
        console.log('🎮 CodeWorld initializing...');
        
        // Check if first visit
        this.isFirstVisit = !localStorage.getItem('codeworld_visited');
        
        // Initialize Save Manager first
        this.save = new SaveManager();
        await this.save.init();
        
        // Initialize Sound Manager
        this.sound = new SoundManager();
        
        // Initialize Loading Screen
        this.loading = new LoadingManager();
        await this.loading.init();
        
        // Start loading process
        await this.loadGame();
    }

    async loadGame() {
        // Simulate loading stages
        const stages = [
            { name: 'init', text: 'ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...', progress: 10 },
            { name: 'assets', text: 'ЗАГРУЗКА РЕСУРСОВ...', progress: 30 },
            { name: 'engine', text: 'ЗАПУСК ДВИЖКА...', progress: 50 },
            { name: 'editor', text: 'ПОДГОТОВКА РЕДАКТОРА...', progress: 70 },
            { name: 'world', text: 'СОЗДАНИЕ МИРА...', progress: 90 },
            { name: 'ready', text: 'ГОТОВО!', progress: 100 }
        ];

        for (const stage of stages) {
            this.loading.updateProgress(stage.progress, stage.text);
            await this.processLoadingStage(stage.name);
            await this.delay(400);
        }

        // Complete loading
        await this.delay(500);
        this.onLoadingComplete();
    }

    async processLoadingStage(stageName) {
        switch (stageName) {
            case 'init':
                // Initialize achievement system
                this.achievements = new AchievementManager(this.save);
                break;
                
            case 'assets':
                // Load sprites and assets
                await this.loadAssets();
                break;
                
            case 'engine':
                // Initialize game engine
                this.game = new GameEngine(this);
                break;
                
            case 'editor':
                // Initialize code editor (lazy loaded)
                this.editor = new CodeEditor(this);
                break;
                
            case 'world':
                // Initialize console and UI
                this.console = new ConsoleManager();
                this.ui = new UIManager(this);
                break;
                
            case 'ready':
                // Final preparations
                this.setupEventListeners();
                break;
        }
    }

    async loadAssets() {
        // Asset loading would go here
        // For now, we'll use CSS-based sprites
        return Promise.resolve();
    }

    onLoadingComplete() {
        this.loading.hide();
        
        if (this.isFirstVisit) {
            // Show intro presentation
            this.intro = new IntroPresentation(() => {
                this.startGame();
                localStorage.setItem('codeworld_visited', 'true');
            });
            this.intro.show();
        } else {
            // Skip to game directly
            this.startGame();
        }
    }

    startGame() {
        // Show game screen
        document.getElementById('game-screen').classList.add('active');
        
        // Initialize game engine
        this.game.init();
        
        // Initialize code editor
        this.editor.init();
        
        // Initialize UI
        this.ui.init();
        
        // Welcome message
        this.console.log('Добро пожаловать в CodeWorld!', 'system');
        this.console.log('Напиши код и нажми "ЗАПУСТИТЬ" для выполнения', 'info');
        
        // Load saved progress
        this.loadProgress();
        
        // Check for first-time achievement
        this.achievements.unlock('first_login');
    }

    loadProgress() {
        const progress = this.save.getProgress();
        if (progress) {
            this.game.loadLevel(progress.currentLevel || 1);
            this.ui.updateLevelDisplay(progress.currentLevel || 1);
        } else {
            this.game.loadLevel(1);
        }
    }

    // Execute user code
    async executeCode(code) {
        if (!code.trim()) {
            this.console.log('Пустой код не может быть выполнен', 'warning');
            return;
        }

        this.console.log('▶ Выполнение кода...', 'system');
        this.ui.setRunningState(true);

        try {
            await this.game.executeUserCode(code, this.currentLanguage);
            this.console.log('✓ Код выполнен успешно', 'success');
        } catch (error) {
            this.handleCodeError(error);
        } finally {
            this.ui.setRunningState(false);
        }
    }

    handleCodeError(error) {
        // Convert technical error to game-style message
        const gameError = this.translateError(error);
        
        this.console.log(`✖ ${gameError.title}`, 'error');
        this.console.log(`  ${gameError.message}`, 'error');
        
        if (gameError.line) {
            this.console.log(`  Строка: ${gameError.line}`, 'error');
            this.editor.highlightError(gameError.line);
        }

        // Show game-style error overlay
        this.game.showErrorEvent(gameError);
    }

    translateError(error) {
        const errorMessage = error.message || String(error);
        
        // Common error translations
        const translations = {
            'is not defined': {
                title: 'Неизвестная команда!',
                message: 'Персонаж не понимает эту команду. Проверь правильность написания.'
            },
            'is not a function': {
                title: 'Это не действие!',
                message: 'Персонаж не может выполнить это как действие.'
            },
            'Unexpected token': {
                title: 'Синтаксическая ошибка!',
                message: 'В коде есть опечатка или пропущен символ.'
            },
            'Unexpected end': {
                title: 'Незавершённый код!',
                message: 'Код обрывается неожиданно. Проверь скобки и точки с запятой.'
            }
        };

        for (const [key, value] of Object.entries(translations)) {
            if (errorMessage.includes(key)) {
                return {
                    ...value,
                    line: this.extractLineNumber(error),
                    original: errorMessage
                };
            }
        }

        return {
            title: 'Ошибка в коде!',
            message: errorMessage,
            line: this.extractLineNumber(error)
        };
    }

    extractLineNumber(error) {
        if (error.lineNumber) return error.lineNumber;
        
        const match = error.stack?.match(/:(\d+):\d+/);
        return match ? parseInt(match[1]) : null;
    }

    // Change programming language
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.editor.setLanguage(lang);
        this.console.log(`Язык изменён на: ${lang.toUpperCase()}`, 'info');
        
        // Update default code template
        this.editor.setDefaultCode(lang);
    }

    // Reset current level
    resetLevel() {
        this.game.resetCurrentLevel();
        this.editor.resetCode();
        this.console.clear();
        this.console.log('Уровень сброшен', 'system');
    }

    // Stop execution
    stopExecution() {
        this.game.stopExecution();
        this.ui.setRunningState(false);
        this.console.log('Выполнение остановлено', 'warning');
    }

    // Level completed
    onLevelComplete(stats) {
        const level = this.game.currentLevel;
        
        // Save progress
        this.save.saveLevelComplete(level, stats);
        
        // Check achievements
        this.achievements.checkLevelAchievements(level, stats);
        
        // Show completion overlay
        this.ui.showLevelComplete(level, stats);
        
        this.console.log(`🎉 Уровень ${level} пройден!`, 'success');
    }

    // Utility
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.codeWorld = new CodeWorld();
    window.codeWorld.init();
});
