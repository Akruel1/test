/**
 * CodeWorld - Achievement System
 * Tracks and awards achievements
 */

const Achievements = {
    // All achievements
    data: [
        {
            id: 'first_steps',
            name: 'Первые шаги',
            description: 'Выполни свою первую программу',
            icon: '👣',
            points: 10
        },
        {
            id: 'collector',
            name: 'Коллекционер',
            description: 'Собери 10 предметов',
            icon: '💎',
            points: 25,
            requirement: { type: 'collect', count: 10 }
        },
        {
            id: 'treasure_hunter',
            name: 'Охотник за сокровищами',
            description: 'Собери 50 предметов',
            icon: '🏆',
            points: 100,
            requirement: { type: 'collect', count: 50 }
        },
        {
            id: 'level_1',
            name: 'Ученик',
            description: 'Пройди первый уровень',
            icon: '📗',
            points: 20
        },
        {
            id: 'level_3',
            name: 'Путешественник',
            description: 'Пройди 3 уровня',
            icon: '🗺️',
            points: 50
        },
        {
            id: 'level_5',
            name: 'Исследователь',
            description: 'Пройди 5 уровней',
            icon: '🧭',
            points: 100
        },
        {
            id: 'all_levels',
            name: 'Мастер CodeWorld',
            description: 'Пройди все уровни',
            icon: '👑',
            points: 500
        },
        {
            id: 'no_errors',
            name: 'Безупречный код',
            description: 'Пройди уровень без ошибок',
            icon: '✨',
            points: 30
        },
        {
            id: 'speed_runner',
            name: 'Скоростной забег',
            description: 'Пройди уровень менее чем за 10 строк кода',
            icon: '⚡',
            points: 40
        },
        {
            id: 'loop_master',
            name: 'Мастер циклов',
            description: 'Используй цикл для сбора 5 предметов',
            icon: '🔄',
            points: 35
        },
        {
            id: 'condition_master',
            name: 'Мастер условий',
            description: 'Используй условный оператор',
            icon: '🎯',
            points: 35
        },
        {
            id: 'function_creator',
            name: 'Создатель функций',
            description: 'Создай свою функцию',
            icon: '🔧',
            points: 45
        },
        {
            id: 'points_100',
            name: 'Сто очков',
            description: 'Набери 100 очков',
            icon: '💯',
            points: 25
        },
        {
            id: 'points_500',
            name: 'Пятьсот',
            description: 'Набери 500 очков',
            icon: '🌟',
            points: 75
        },
        {
            id: 'points_1000',
            name: 'Тысячник',
            description: 'Набери 1000 очков',
            icon: '🎖️',
            points: 150
        },
        {
            id: 'persistent',
            name: 'Настойчивый',
            description: 'Запусти код 50 раз',
            icon: '🔁',
            points: 40
        },
        {
            id: 'python_user',
            name: 'Питонист',
            description: 'Пройди уровень на Python',
            icon: '🐍',
            points: 30
        },
        {
            id: 'js_user',
            name: 'JavaScript разработчик',
            description: 'Пройди уровень на JavaScript',
            icon: '📜',
            points: 30
        }
    ],

    // Stats tracking
    stats: {
        itemsCollected: 0,
        levelsCompleted: 0,
        codeRuns: 0,
        errorFreeRuns: 0
    },

    /**
     * Initialize achievements
     */
    init() {
        // Load stats from storage
        const saved = Storage.load('codeworld_stats', this.stats);
        this.stats = { ...this.stats, ...saved };
        
        return this;
    },

    /**
     * Save stats
     */
    saveStats() {
        Storage.save('codeworld_stats', this.stats);
    },

    /**
     * Get achievement by ID
     */
    getAchievement(id) {
        return this.data.find(a => a.id === id);
    },

    /**
     * Get all achievements
     */
    getAllAchievements() {
        return this.data;
    },

    /**
     * Get unlocked achievements
     */
    getUnlockedAchievements() {
        const unlocked = Storage.getAchievements();
        return this.data.filter(a => unlocked.includes(a.id));
    },

    /**
     * Get locked achievements
     */
    getLockedAchievements() {
        const unlocked = Storage.getAchievements();
        return this.data.filter(a => !unlocked.includes(a.id));
    },

    /**
     * Check if achievement is unlocked
     */
    isUnlocked(id) {
        return Storage.hasAchievement(id);
    },

    /**
     * Award achievement
     */
    award(id) {
        if (this.isUnlocked(id)) return false;
        
        const achievement = this.getAchievement(id);
        if (!achievement) return false;
        
        Storage.addAchievement(id);
        Storage.addPoints(achievement.points);
        
        // Show notification
        this.showNotification(achievement);
        
        // Update UI
        this.updateUI();
        
        return true;
    },

    /**
     * Show achievement notification
     */
    showNotification(achievement) {
        const notification = document.getElementById('achievement-notification');
        const nameEl = document.getElementById('achievement-name');
        const iconEl = notification.querySelector('.achievement-icon');
        
        iconEl.textContent = achievement.icon;
        nameEl.textContent = achievement.name;
        
        notification.classList.remove('hidden');
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 4000);
    },

    /**
     * Update UI counters
     */
    updateUI() {
        const achievementCount = this.getUnlockedAchievements().length;
        document.getElementById('user-achievements').textContent = achievementCount;
        document.getElementById('user-points').textContent = Storage.getPoints();
    },

    /**
     * Track item collected
     */
    trackCollect(item) {
        this.stats.itemsCollected++;
        this.saveStats();
        
        // Check collection achievements
        if (this.stats.itemsCollected >= 10) {
            this.award('collector');
        }
        if (this.stats.itemsCollected >= 50) {
            this.award('treasure_hunter');
        }
    },

    /**
     * Track level completed
     */
    trackLevelComplete(levelId) {
        this.stats.levelsCompleted++;
        this.saveStats();
        
        // Level-specific achievements
        if (levelId === 1) {
            this.award('level_1');
        }
        
        const completedLevels = Storage.getProgress().completedLevels || [];
        
        if (completedLevels.length >= 3) {
            this.award('level_3');
        }
        if (completedLevels.length >= 5) {
            this.award('level_5');
        }
        if (completedLevels.length >= Levels.getLevelCount()) {
            this.award('all_levels');
        }
    },

    /**
     * Track code run
     */
    trackCodeRun(hadErrors, language) {
        this.stats.codeRuns++;
        
        if (!hadErrors) {
            this.stats.errorFreeRuns++;
        }
        
        this.saveStats();
        
        // First run
        if (this.stats.codeRuns === 1) {
            this.award('first_steps');
        }
        
        // Persistent coder
        if (this.stats.codeRuns >= 50) {
            this.award('persistent');
        }
        
        // Language achievements
        if (language === 'python') {
            this.award('python_user');
        } else if (language === 'javascript') {
            this.award('js_user');
        }
    },

    /**
     * Track points
     */
    trackPoints(total) {
        if (total >= 100) {
            this.award('points_100');
        }
        if (total >= 500) {
            this.award('points_500');
        }
        if (total >= 1000) {
            this.award('points_1000');
        }
    },

    /**
     * Analyze code for achievements
     */
    analyzeCode(code, language) {
        // Check for loops
        const hasLoop = /for|while/i.test(code);
        
        // Check for conditions
        const hasCondition = /if\s*\(|if\s+/i.test(code);
        
        // Check for functions
        const hasFunction = /function|def\s+/i.test(code);
        
        if (hasLoop && Player.inventory.length >= 5) {
            this.award('loop_master');
        }
        
        if (hasCondition) {
            this.award('condition_master');
        }
        
        if (hasFunction) {
            this.award('function_creator');
        }
        
        // Check code length
        const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
        if (lines <= 10 && Game.levelCompleted) {
            this.award('speed_runner');
        }
    },

    /**
     * Get total achievement points
     */
    getTotalPoints() {
        return this.getUnlockedAchievements().reduce((sum, a) => sum + a.points, 0);
    },

    /**
     * Get progress percentage
     */
    getProgress() {
        return Math.round((this.getUnlockedAchievements().length / this.data.length) * 100);
    },

    /**
     * Generate achievements modal content
     */
    generateModalContent() {
        const unlocked = this.getUnlockedAchievements();
        const locked = this.getLockedAchievements();
        
        let html = `
            <div class="achievements-summary">
                <div class="summary-stat">
                    <span class="stat-value">${unlocked.length}/${this.data.length}</span>
                    <span class="stat-label">Получено</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${this.getTotalPoints()}</span>
                    <span class="stat-label">Очков</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${this.getProgress()}%</span>
                    <span class="stat-label">Прогресс</span>
                </div>
            </div>
            <div class="achievements-list">
                <h3>Полученные</h3>
        `;
        
        if (unlocked.length > 0) {
            unlocked.forEach(a => {
                html += `
                    <div class="achievement-item unlocked">
                        <span class="achievement-icon">${a.icon}</span>
                        <div class="achievement-details">
                            <span class="achievement-name">${a.name}</span>
                            <span class="achievement-desc">${a.description}</span>
                        </div>
                        <span class="achievement-points">+${a.points}</span>
                    </div>
                `;
            });
        } else {
            html += '<p class="no-achievements">Пока нет достижений. Начни играть!</p>';
        }
        
        html += '<h3>Заблокированные</h3>';
        
        locked.forEach(a => {
            html += `
                <div class="achievement-item locked">
                    <span class="achievement-icon">🔒</span>
                    <div class="achievement-details">
                        <span class="achievement-name">${a.name}</span>
                        <span class="achievement-desc">${a.description}</span>
                    </div>
                    <span class="achievement-points">+${a.points}</span>
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    }
};

// Make it globally available
window.Achievements = Achievements;
