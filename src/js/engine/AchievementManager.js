/**
 * CodeWorld - Achievement Manager
 * Handles game achievements and unlocking
 */

export class AchievementManager {
    constructor(saveManager) {
        this.save = saveManager;
        
        // Define all achievements
        this.achievements = [
            {
                id: 'first_login',
                name: 'Добро пожаловать!',
                description: 'Запустил CodeWorld впервые',
                icon: '🎮',
                hidden: false
            },
            {
                id: 'first_level',
                name: 'Первый успех',
                description: 'Прошёл первый уровень',
                icon: '🌟',
                hidden: false
            },
            {
                id: 'three_stars',
                name: 'Перфекционист',
                description: 'Получил 3 звезды на любом уровне',
                icon: '⭐',
                hidden: false
            },
            {
                id: 'five_levels',
                name: 'На полпути',
                description: 'Прошёл 5 уровней',
                icon: '🏃',
                hidden: false
            },
            {
                id: 'all_levels',
                name: 'Мастер кода',
                description: 'Прошёл все уровни',
                icon: '🏆',
                hidden: false
            },
            {
                id: 'efficient_coder',
                name: 'Эффективный кодер',
                description: 'Прошёл уровень менее чем за 5 строк кода',
                icon: '💻',
                hidden: false
            },
            {
                id: 'loop_master',
                name: 'Мастер циклов',
                description: 'Использовал цикл для прохождения уровня',
                icon: '🔄',
                hidden: true
            },
            {
                id: 'collector',
                name: 'Коллекционер',
                description: 'Собрал 10 звёзд в игре',
                icon: '💎',
                hidden: false
            },
            {
                id: 'speedrunner',
                name: 'Спидраннер',
                description: 'Прошёл уровень менее чем за 10 секунд',
                icon: '⚡',
                hidden: true
            },
            {
                id: 'no_errors',
                name: 'Без ошибок',
                description: 'Прошёл уровень без единой ошибки в коде',
                icon: '✨',
                hidden: false
            },
            {
                id: 'explorer',
                name: 'Исследователь',
                description: 'Попробовал все 3 языка программирования',
                icon: '🗺️',
                hidden: true
            },
            {
                id: 'night_owl',
                name: 'Ночная сова',
                description: 'Играл после полуночи',
                icon: '🦉',
                hidden: true
            }
        ];
        
        // Track session stats for achievements
        this.sessionStats = {
            errorsCount: 0,
            languagesUsed: new Set(),
            startTime: Date.now()
        };
    }

    getAll() {
        return this.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.save.hasAchievement(achievement.id)
        }));
    }

    getUnlocked() {
        return this.achievements.filter(a => this.save.hasAchievement(a.id));
    }

    getLocked() {
        return this.achievements.filter(a => !this.save.hasAchievement(a.id));
    }

    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;

        const wasNew = this.save.unlockAchievement(achievementId);
        
        if (wasNew) {
            // Trigger notification
            this.onAchievementUnlocked(achievement);
        }
        
        return wasNew;
    }

    onAchievementUnlocked(achievement) {
        // This will be called by UIManager to show notification
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: achievement
        }));
    }

    checkLevelAchievements(level, stats) {
        // First level completed
        if (level === 1) {
            this.unlock('first_level');
        }

        // Three stars
        if (stats.stars === 3) {
            this.unlock('three_stars');
        }

        // Efficient coder
        if (stats.codeLines <= 5) {
            this.unlock('efficient_coder');
        }

        // Speedrunner
        if (stats.time && stats.time < 10000) {
            this.unlock('speedrunner');
        }

        // Check total levels completed
        const completedCount = this.save.getCompletedLevelsCount();
        
        if (completedCount >= 5) {
            this.unlock('five_levels');
        }
        
        if (completedCount >= 8) {
            this.unlock('all_levels');
        }

        // Check total stars collected
        const totalStars = this.save.getTotalStars();
        if (totalStars >= 10) {
            this.unlock('collector');
        }

        // No errors achievement
        if (this.sessionStats.errorsCount === 0) {
            this.unlock('no_errors');
        }

        // Night owl
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) {
            this.unlock('night_owl');
        }
    }

    trackError() {
        this.sessionStats.errorsCount++;
    }

    trackLanguageUsed(language) {
        this.sessionStats.languagesUsed.add(language);
        
        if (this.sessionStats.languagesUsed.size >= 3) {
            this.unlock('explorer');
        }
    }

    checkLoopUsage(code) {
        // Check if code contains loop constructs
        const hasLoop = /\b(for|while|repeat)\b/.test(code);
        if (hasLoop) {
            this.unlock('loop_master');
        }
    }

    resetSessionStats() {
        this.sessionStats = {
            errorsCount: 0,
            languagesUsed: this.sessionStats.languagesUsed,
            startTime: Date.now()
        };
    }

    getProgress() {
        const unlocked = this.getUnlocked().length;
        const total = this.achievements.filter(a => !a.hidden).length;
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }
}
