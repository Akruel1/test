/**
 * CodeWorld - Storage Manager
 * Handles saving and loading user progress
 */

const Storage = {
    KEYS: {
        USER_PROGRESS: 'codeworld_progress',
        USER_SETTINGS: 'codeworld_settings',
        USER_CODE: 'codeworld_code',
        ACHIEVEMENTS: 'codeworld_achievements',
        INTRO_SEEN: 'codeworld_intro_seen'
    },

    /**
     * Default user data
     */
    defaults: {
        progress: {
            currentLevel: 1,
            completedLevels: [],
            points: 0,
            totalPlayTime: 0,
            lastPlayed: null
        },
        settings: {
            language: 'javascript',
            theme: 'dark',
            soundEnabled: true,
            musicEnabled: true,
            showLineNumbers: true,
            fontSize: 14
        },
        achievements: [],
        code: {}
    },

    /**
     * Save data to localStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    /**
     * Load data from localStorage
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    /**
     * Clear all CodeWorld data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // Progress methods
    getProgress() {
        return this.load(this.KEYS.USER_PROGRESS, this.defaults.progress);
    },

    saveProgress(progress) {
        const current = this.getProgress();
        const updated = { ...current, ...progress, lastPlayed: new Date().toISOString() };
        return this.save(this.KEYS.USER_PROGRESS, updated);
    },

    // Settings methods
    getSettings() {
        return this.load(this.KEYS.USER_SETTINGS, this.defaults.settings);
    },

    saveSettings(settings) {
        const current = this.getSettings();
        return this.save(this.KEYS.USER_SETTINGS, { ...current, ...settings });
    },

    // Code methods
    getCode(levelId) {
        const allCode = this.load(this.KEYS.USER_CODE, {});
        return allCode[levelId] || '';
    },

    saveCode(levelId, code) {
        const allCode = this.load(this.KEYS.USER_CODE, {});
        allCode[levelId] = code;
        return this.save(this.KEYS.USER_CODE, allCode);
    },

    // Achievement methods
    getAchievements() {
        return this.load(this.KEYS.ACHIEVEMENTS, []);
    },

    addAchievement(achievementId) {
        const achievements = this.getAchievements();
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            return this.save(this.KEYS.ACHIEVEMENTS, achievements);
        }
        return false;
    },

    hasAchievement(achievementId) {
        return this.getAchievements().includes(achievementId);
    },

    // Intro seen
    hasSeenIntro() {
        return this.load(this.KEYS.INTRO_SEEN, false);
    },

    markIntroSeen() {
        return this.save(this.KEYS.INTRO_SEEN, true);
    },

    // Points management
    addPoints(amount) {
        const progress = this.getProgress();
        progress.points = (progress.points || 0) + amount;
        return this.saveProgress(progress);
    },

    getPoints() {
        return this.getProgress().points || 0;
    },

    // Level completion
    completeLevel(levelId) {
        const progress = this.getProgress();
        if (!progress.completedLevels) {
            progress.completedLevels = [];
        }
        if (!progress.completedLevels.includes(levelId)) {
            progress.completedLevels.push(levelId);
            progress.currentLevel = Math.max(progress.currentLevel, levelId + 1);
        }
        return this.saveProgress(progress);
    },

    isLevelCompleted(levelId) {
        const progress = this.getProgress();
        return progress.completedLevels && progress.completedLevels.includes(levelId);
    },

    getCurrentLevel() {
        return this.getProgress().currentLevel || 1;
    },

    // Export/Import save data
    exportSave() {
        const data = {
            progress: this.getProgress(),
            settings: this.getSettings(),
            achievements: this.getAchievements(),
            code: this.load(this.KEYS.USER_CODE, {}),
            exportDate: new Date().toISOString()
        };
        return btoa(JSON.stringify(data));
    },

    importSave(encodedData) {
        try {
            const data = JSON.parse(atob(encodedData));
            if (data.progress) this.save(this.KEYS.USER_PROGRESS, data.progress);
            if (data.settings) this.save(this.KEYS.USER_SETTINGS, data.settings);
            if (data.achievements) this.save(this.KEYS.ACHIEVEMENTS, data.achievements);
            if (data.code) this.save(this.KEYS.USER_CODE, data.code);
            return true;
        } catch (e) {
            console.error('Import save error:', e);
            return false;
        }
    }
};

// Make it globally available
window.Storage = Storage;
