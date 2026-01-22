/**
 * CODEWORLD - Achievement System
 * Система достижений
 */

const AchievementSystem = {
    // Определения достижений
    achievements: [
        {
            id: 'first_steps',
            name: 'Первые шаги',
            description: 'Завершите первый уровень',
            icon: '👣',
            condition: (stats) => stats.levelsCompleted >= 1
        },
        {
            id: 'collector',
            name: 'Коллекционер',
            description: 'Соберите 10 кристаллов',
            icon: '💎',
            condition: (stats) => stats.crystals >= 10
        },
        {
            id: 'rich',
            name: 'Богач',
            description: 'Соберите 50 кристаллов',
            icon: '💰',
            condition: (stats) => stats.crystals >= 50
        },
        {
            id: 'speedrunner',
            name: 'Спидраннер',
            description: 'Пройдите уровень менее чем за 5 секунд',
            icon: '⚡',
            condition: (stats, levelStats) => levelStats && levelStats.time < 5
        },
        {
            id: 'minimalist',
            name: 'Минималист',
            description: 'Пройдите уровень используя менее 5 строк кода',
            icon: '📝',
            condition: (stats, levelStats) => levelStats && levelStats.lines < 5
        },
        {
            id: 'perfectionist',
            name: 'Перфекционист',
            description: 'Получите 3 звезды на уровне',
            icon: '⭐',
            condition: (stats, levelStats) => levelStats && levelStats.stars === 3
        },
        {
            id: 'five_stars',
            name: 'Пять звёзд',
            description: 'Получите 3 звезды на 5 уровнях',
            icon: '🌟',
            condition: (stats) => stats.perfectLevels >= 5
        },
        {
            id: 'programmer',
            name: 'Программист',
            description: 'Завершите 5 уровней',
            icon: '💻',
            condition: (stats) => stats.levelsCompleted >= 5
        },
        {
            id: 'master',
            name: 'Мастер',
            description: 'Завершите все 10 уровней',
            icon: '🏆',
            condition: (stats) => stats.levelsCompleted >= 10
        },
        {
            id: 'loop_master',
            name: 'Мастер циклов',
            description: 'Используйте цикл в решении',
            icon: '🔄',
            condition: (stats, levelStats) => levelStats && levelStats.usedLoop
        },
        {
            id: 'function_creator',
            name: 'Создатель функций',
            description: 'Создайте собственную функцию',
            icon: '🔧',
            condition: (stats, levelStats) => levelStats && levelStats.usedFunction
        },
        {
            id: 'no_hints',
            name: 'Самостоятельный',
            description: 'Пройдите уровень без подсказок',
            icon: '🧠',
            condition: (stats, levelStats) => levelStats && !levelStats.usedHints
        },
        {
            id: 'persistent',
            name: 'Настойчивый',
            description: 'Попробуйте 10 раз на одном уровне',
            icon: '💪',
            condition: (stats) => stats.maxAttempts >= 10
        },
        {
            id: 'marathon',
            name: 'Марафонец',
            description: 'Проведите в игре более 30 минут',
            icon: '🏃',
            condition: (stats) => stats.playTime >= 1800
        },
        {
            id: 'efficient',
            name: 'Эффективность',
            description: 'Наберите более 1000 очков на одном уровне',
            icon: '📊',
            condition: (stats, levelStats) => levelStats && levelStats.score >= 1000
        },
        {
            id: 'high_score',
            name: 'Рекордсмен',
            description: 'Наберите 10000 очков в общем',
            icon: '🎯',
            condition: (stats) => stats.totalScore >= 10000
        }
    ],

    /**
     * Проверить и выдать достижения
     */
    check(stats, levelStats = null) {
        const unlocked = [];

        for (const achievement of this.achievements) {
            // Проверить не получено ли уже
            if (GameProgress.hasAchievement(achievement.id)) {
                continue;
            }

            // Проверить условие
            if (achievement.condition(stats, levelStats)) {
                if (GameProgress.unlockAchievement(achievement.id)) {
                    unlocked.push(achievement);
                }
            }
        }

        // Показать уведомления
        unlocked.forEach(a => this.showNotification(a));

        return unlocked;
    },

    /**
     * Проверка после завершения уровня
     */
    checkLevelComplete(levelNumber, stars, linesOfCode, executionTime) {
        const code = CodeEditor.getValue();
        
        const levelStats = {
            level: levelNumber,
            stars: stars,
            lines: linesOfCode,
            time: executionTime,
            score: Game.score,
            usedLoop: /for\s+|while\s+/.test(code),
            usedFunction: /def\s+\w+|function\s+\w+/.test(code),
            usedHints: false // TODO: трекинг использования подсказок
        };

        const stats = this.getStats();
        
        this.check(stats, levelStats);
    },

    /**
     * Получить статистику игрока
     */
    getStats() {
        const progress = GameProgress.state;
        
        return {
            levelsCompleted: progress.completedLevels.length,
            crystals: progress.totalCrystals,
            totalScore: progress.totalScore,
            playTime: progress.playTime,
            perfectLevels: Object.values(progress.levelStars).filter(s => s === 3).length,
            maxAttempts: 0 // TODO: трекинг попыток
        };
    },

    /**
     * Показать уведомление о достижении
     */
    showNotification(achievement) {
        const modal = Utils.$('achievement-modal');
        Utils.$('achievement-icon').textContent = achievement.icon;
        Utils.$('achievement-name').textContent = achievement.name;
        Utils.$('achievement-desc').textContent = achievement.description;
        
        Utils.show(modal);
        AudioManager.play('achievement');

        Utils.$('achievement-close').onclick = () => {
            Utils.hide(modal);
        };

        // Автоскрытие через 5 секунд
        setTimeout(() => {
            Utils.hide(modal);
        }, 5000);
    },

    /**
     * Получить список всех достижений
     */
    getAll() {
        return this.achievements.map(a => ({
            ...a,
            unlocked: GameProgress.hasAchievement(a.id)
        }));
    },

    /**
     * Получить полученные достижения
     */
    getUnlocked() {
        return this.achievements.filter(a => GameProgress.hasAchievement(a.id));
    },

    /**
     * Получить прогресс достижений
     */
    getProgress() {
        const total = this.achievements.length;
        const unlocked = this.getUnlocked().length;
        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100)
        };
    },

    /**
     * Отрисовать список достижений
     */
    renderList(containerId) {
        const container = Utils.$(containerId);
        if (!container) return;

        const achievements = this.getAll();
        
        container.innerHTML = `
            <div class="achievements-header">
                <h3>🏆 Достижения</h3>
                <div class="achievements-progress">
                    ${this.getProgress().unlocked} / ${this.getProgress().total}
                </div>
            </div>
            <div class="achievements-grid">
                ${achievements.map(a => `
                    <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-card-icon">${a.unlocked ? a.icon : '🔒'}</div>
                        <div class="achievement-card-info">
                            <div class="achievement-card-name">${a.unlocked ? a.name : '???'}</div>
                            <div class="achievement-card-desc">${a.unlocked ? a.description : 'Достижение не разблокировано'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Экспорт
window.AchievementSystem = AchievementSystem;
