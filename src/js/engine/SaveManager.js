/**
 * CodeWorld - Save Manager
 * Handles progress saving and loading using localStorage
 */

export class SaveManager {
    constructor() {
        this.storageKey = 'codeworld_save';
        this.data = null;
    }

    async init() {
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.data = JSON.parse(saved);
            } else {
                this.data = this.getDefaultData();
            }
        } catch (error) {
            console.error('Failed to load save data:', error);
            this.data = this.getDefaultData();
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    getDefaultData() {
        return {
            currentLevel: 1,
            completedLevels: [],
            levelStats: {},
            achievements: [],
            totalPlayTime: 0,
            settings: {
                soundEnabled: true,
                darkTheme: true,
                language: 'javascript'
            },
            createdAt: Date.now(),
            lastPlayed: Date.now()
        };
    }

    getProgress() {
        return this.data;
    }

    getCurrentLevel() {
        return this.data?.currentLevel || 1;
    }

    setCurrentLevel(level) {
        if (this.data) {
            this.data.currentLevel = level;
            this.save();
        }
    }

    saveLevelComplete(level, stats) {
        if (!this.data) return;

        // Add to completed levels
        if (!this.data.completedLevels.includes(level)) {
            this.data.completedLevels.push(level);
        }

        // Save level stats
        const existingStats = this.data.levelStats[level];
        if (!existingStats || stats.stars > existingStats.stars) {
            this.data.levelStats[level] = {
                ...stats,
                completedAt: Date.now()
            };
        }

        // Update current level to next
        const nextLevel = level + 1;
        if (nextLevel > this.data.currentLevel) {
            this.data.currentLevel = nextLevel;
        }

        this.data.lastPlayed = Date.now();
        this.save();
    }

    getLevelStats(level) {
        return this.data?.levelStats?.[level] || null;
    }

    isLevelCompleted(level) {
        return this.data?.completedLevels?.includes(level) || false;
    }

    getCompletedLevelsCount() {
        return this.data?.completedLevels?.length || 0;
    }

    getTotalStars() {
        if (!this.data?.levelStats) return 0;
        
        return Object.values(this.data.levelStats).reduce((total, stats) => {
            return total + (stats.stars || 0);
        }, 0);
    }

    // Achievement management
    unlockAchievement(achievementId) {
        if (!this.data) return false;
        
        if (!this.data.achievements.includes(achievementId)) {
            this.data.achievements.push(achievementId);
            this.save();
            return true;
        }
        return false;
    }

    hasAchievement(achievementId) {
        return this.data?.achievements?.includes(achievementId) || false;
    }

    getUnlockedAchievements() {
        return this.data?.achievements || [];
    }

    // Settings
    getSetting(key) {
        return this.data?.settings?.[key];
    }

    setSetting(key, value) {
        if (this.data && this.data.settings) {
            this.data.settings[key] = value;
            this.save();
        }
    }

    // Reset
    reset() {
        this.data = this.getDefaultData();
        this.save();
    }

    // Export/Import
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.data = { ...this.getDefaultData(), ...data };
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}
