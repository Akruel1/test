/**
 * CodeWorld - UI Manager
 * Handles all UI interactions and updates
 */

import { LEVELS, TOTAL_LEVELS, getNextLevel } from '../levels/LevelData.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        
        // UI Elements
        this.runBtn = document.getElementById('run-code-btn');
        this.stopBtn = document.getElementById('stop-code-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.menuBtn = document.querySelector('.menu-btn');
        this.sidePanel = document.getElementById('side-panel');
        this.closePanelBtn = document.querySelector('.close-panel-btn');
        this.langBtns = document.querySelectorAll('.lang-btn');
        this.panelNavBtns = document.querySelectorAll('.panel-nav-btn');
        this.notificationContainer = document.getElementById('notification-container');
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalContent = document.getElementById('modal-content');
        
        // State
        this.isRunning = false;
    }

    init() {
        this.setupEventListeners();
        this.renderLevelsGrid();
        this.renderAchievements();
        this.renderDocs();
    }

    setupEventListeners() {
        // Run code button
        this.runBtn.addEventListener('click', () => {
            const code = this.app.editor.getCode();
            this.app.executeCode(code);
        });

        // Stop button
        this.stopBtn.addEventListener('click', () => {
            this.app.stopExecution();
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.app.resetLevel();
        });

        // Menu button
        this.menuBtn.addEventListener('click', () => {
            this.toggleSidePanel();
        });

        // Close panel button
        this.closePanelBtn.addEventListener('click', () => {
            this.closeSidePanel();
        });

        // Language selector
        this.langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectLanguage(btn.dataset.lang);
            });
        });

        // Panel navigation
        this.panelNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchPanelSection(btn.dataset.panel);
            });
        });

        // Modal close on outside click
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to run
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const code = this.app.editor.getCode();
                this.app.executeCode(code);
            }
            
            // Escape to close panel/modal
            if (e.key === 'Escape') {
                this.closeSidePanel();
                this.closeModal();
            }
        });
    }

    // Language selection
    selectLanguage(lang) {
        this.langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        this.app.setLanguage(lang);
    }

    // Side panel
    toggleSidePanel() {
        this.sidePanel.classList.toggle('open');
    }

    closeSidePanel() {
        this.sidePanel.classList.remove('open');
    }

    switchPanelSection(sectionName) {
        // Update nav buttons
        this.panelNavBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panel === sectionName);
        });

        // Update sections
        document.querySelectorAll('.panel-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`panel-${sectionName}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Running state
    setRunningState(running) {
        this.isRunning = running;
        
        this.runBtn.classList.toggle('running', running);
        this.runBtn.disabled = running;
        this.stopBtn.disabled = !running;
        
        const statusEl = document.querySelector('.editor-status');
        if (statusEl) {
            statusEl.textContent = running ? 'Выполняется...' : 'Готов к выполнению';
            statusEl.classList.toggle('running', running);
        }
    }

    // Level display
    updateLevelDisplay(levelNum) {
        document.getElementById('current-level').textContent = levelNum;
        
        const level = LEVELS[levelNum];
        if (level) {
            document.getElementById('current-objective').textContent = level.objective;
        }
        
        // Update levels grid
        this.renderLevelsGrid();
    }

    // Levels grid
    renderLevelsGrid() {
        const grid = document.getElementById('levels-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const progress = this.app.save.getProgress();
        const completedLevels = progress?.completedLevels || [];
        const currentLevel = this.app.game?.currentLevel || 1;

        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const item = document.createElement('div');
            item.className = 'level-item';
            item.textContent = i;
            
            if (completedLevels.includes(i)) {
                item.classList.add('completed');
            } else if (i === currentLevel) {
                item.classList.add('current');
            } else if (i > currentLevel && !completedLevels.includes(i - 1)) {
                item.classList.add('locked');
            }

            item.addEventListener('click', () => {
                if (!item.classList.contains('locked')) {
                    this.loadLevel(i);
                }
            });

            grid.appendChild(item);
        }
    }

    loadLevel(levelNum) {
        this.app.game.loadLevel(levelNum);
        this.app.editor.updateForLevel(levelNum);
        this.updateLevelDisplay(levelNum);
        this.app.console.clear();
        this.app.console.log(`Загружен уровень ${levelNum}: ${LEVELS[levelNum].name}`, 'system');
        this.closeSidePanel();
    }

    // Achievements
    renderAchievements() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        
        list.innerHTML = '';
        const achievements = this.app.achievements.getAll();

        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // Documentation
    renderDocs() {
        const docsContent = document.getElementById('docs-content');
        if (!docsContent) return;

        docsContent.innerHTML = `
            <div class="docs-section">
                <h5>Управление персонажем</h5>
                <div class="docs-method">
                    <code>hero.move(direction)</code>
                    <p>Двигает персонажа. direction: "up", "down", "left", "right"</p>
                </div>
                <div class="docs-method">
                    <code>hero.moveUp() / moveDown() / moveLeft() / moveRight()</code>
                    <p>Короткие команды для движения</p>
                </div>
                <div class="docs-method">
                    <code>hero.walkTo(x, y)</code>
                    <p>Идти к указанным координатам</p>
                </div>
                <div class="docs-method">
                    <code>hero.canMove(direction)</code>
                    <p>Проверяет, можно ли двигаться в направлении</p>
                </div>
                <div class="docs-method">
                    <code>hero.getX() / hero.getY()</code>
                    <p>Возвращает текущую позицию персонажа</p>
                </div>
            </div>
            
            <div class="docs-section">
                <h5>Взаимодействие с миром</h5>
                <div class="docs-method">
                    <code>hero.interact(target)</code>
                    <p>Взаимодействовать с объектом</p>
                </div>
                <div class="docs-method">
                    <code>hero.push(direction)</code>
                    <p>Толкнуть объект в направлении</p>
                </div>
                <div class="docs-method">
                    <code>world.hasWall(x, y)</code>
                    <p>Проверяет наличие стены</p>
                </div>
                <div class="docs-method">
                    <code>world.hasCollectible(x, y)</code>
                    <p>Проверяет наличие звезды</p>
                </div>
            </div>
            
            <div class="docs-section">
                <h5>Вспомогательные функции</h5>
                <div class="docs-method">
                    <code>log(message)</code>
                    <p>Выводит сообщение в консоль</p>
                </div>
                <div class="docs-method">
                    <code>repeat(n, callback)</code>
                    <p>Повторяет действие n раз</p>
                </div>
                <div class="docs-method">
                    <code>wait(ms)</code>
                    <p>Ждёт указанное количество миллисекунд</p>
                </div>
            </div>
        `;
    }

    // Level complete overlay
    showLevelComplete(level, stats) {
        const levelData = LEVELS[level];
        const nextLevel = getNextLevel(level);
        
        const starsHtml = '⭐'.repeat(stats.stars) + '☆'.repeat(3 - stats.stars);
        
        this.modalContent.innerHTML = `
            <div class="level-complete-content">
                <h2 class="level-complete-title">🎉 Уровень пройден!</h2>
                <div class="level-complete-stars">${starsHtml}</div>
                <div class="level-complete-stats">
                    <div class="stat-item">
                        <span>Ходов:</span>
                        <span class="stat-value">${stats.moves}</span>
                    </div>
                    <div class="stat-item">
                        <span>Строк кода:</span>
                        <span class="stat-value">${stats.codeLines}</span>
                    </div>
                </div>
                <div class="level-complete-actions">
                    ${nextLevel ? `
                        <button class="pixel-button next-level-btn" data-level="${nextLevel}">
                            Следующий уровень ▶
                        </button>
                    ` : `
                        <div class="game-complete-message">
                            🏆 Поздравляем! Все уровни пройдены!
                        </div>
                    `}
                    <button class="pixel-button retry-btn">
                        Повторить ↺
                    </button>
                </div>
            </div>
        `;

        // Event listeners for buttons
        const nextLevelBtn = this.modalContent.querySelector('.next-level-btn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.closeModal();
                this.loadLevel(parseInt(nextLevelBtn.dataset.level));
            });
        }

        const retryBtn = this.modalContent.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.closeModal();
                this.app.resetLevel();
            });
        }

        this.openModal();
    }

    // Modal
    openModal() {
        this.modalOverlay.classList.add('active');
    }

    closeModal() {
        this.modalOverlay.classList.remove('active');
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.notificationContainer.appendChild(notification);
        
        // Auto remove after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'notification achievement';
        notification.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <div style="font-weight: bold;">Достижение разблокировано!</div>
                <div>${achievement.name}</div>
            </div>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
        
        // Update achievements list
        this.renderAchievements();
    }
}
