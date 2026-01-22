/**
 * CODEWORLD - Storage Manager
 * Управление сохранением данных
 */

const Storage = {
    PREFIX: 'codeworld_',

    /**
     * Сохранить данные
     */
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.PREFIX + key, serialized);
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    /**
     * Загрузить данные
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    },

    /**
     * Удалить данные
     */
    remove(key) {
        try {
            localStorage.removeItem(this.PREFIX + key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    /**
     * Очистить все данные игры
     */
    clear() {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
            keys.forEach(k => localStorage.removeItem(k));
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },

    /**
     * Проверить наличие данных
     */
    has(key) {
        return localStorage.getItem(this.PREFIX + key) !== null;
    },

    /**
     * Получить все ключи
     */
    getKeys() {
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.PREFIX))
            .map(k => k.replace(this.PREFIX, ''));
    }
};

/**
 * Менеджер прогресса игрока
 */
const GameProgress = {
    DEFAULT_STATE: {
        currentLevel: 1,
        unlockedLevels: [1],
        completedLevels: [],
        achievements: [],
        totalScore: 0,
        totalCrystals: 0,
        playTime: 0,
        settings: {
            language: 'python',
            editorTheme: 'dark',
            fontSize: 16,
            soundEffects: true,
            music: true,
            showHints: true
        },
        levelScores: {},
        levelStars: {},
        codeHistory: {},
        firstVisit: true,
        lastPlayed: null
    },

    state: null,

    /**
     * Инициализация
     */
    init() {
        this.state = Storage.load('progress', Utils.deepClone(this.DEFAULT_STATE));
        this.state.lastPlayed = Date.now();
        this.save();
    },

    /**
     * Сохранить прогресс
     */
    save() {
        Storage.save('progress', this.state);
    },

    /**
     * Сбросить прогресс
     */
    reset() {
        this.state = Utils.deepClone(this.DEFAULT_STATE);
        this.save();
    },

    /**
     * Получить текущий уровень
     */
    getCurrentLevel() {
        return this.state.currentLevel;
    },

    /**
     * Установить текущий уровень
     */
    setCurrentLevel(level) {
        this.state.currentLevel = level;
        this.save();
    },

    /**
     * Разблокировать уровень
     */
    unlockLevel(level) {
        if (!this.state.unlockedLevels.includes(level)) {
            this.state.unlockedLevels.push(level);
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Проверить разблокирован ли уровень
     */
    isLevelUnlocked(level) {
        return this.state.unlockedLevels.includes(level);
    },

    /**
     * Завершить уровень
     */
    completeLevel(level, score, stars) {
        if (!this.state.completedLevels.includes(level)) {
            this.state.completedLevels.push(level);
        }
        
        // Обновить лучший результат
        if (!this.state.levelScores[level] || score > this.state.levelScores[level]) {
            this.state.levelScores[level] = score;
        }
        
        // Обновить звезды
        if (!this.state.levelStars[level] || stars > this.state.levelStars[level]) {
            this.state.levelStars[level] = stars;
        }
        
        // Разблокировать следующий уровень
        this.unlockLevel(level + 1);
        
        this.save();
    },

    /**
     * Добавить очки
     */
    addScore(points) {
        this.state.totalScore += points;
        this.save();
    },

    /**
     * Добавить кристаллы
     */
    addCrystals(amount) {
        this.state.totalCrystals += amount;
        this.save();
    },

    /**
     * Получить достижение
     */
    unlockAchievement(achievementId) {
        if (!this.state.achievements.includes(achievementId)) {
            this.state.achievements.push(achievementId);
            this.save();
            return true;
        }
        return false;
    },

    /**
     * Проверить получено ли достижение
     */
    hasAchievement(achievementId) {
        return this.state.achievements.includes(achievementId);
    },

    /**
     * Получить настройки
     */
    getSettings() {
        return this.state.settings;
    },

    /**
     * Обновить настройки
     */
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    },

    /**
     * Сохранить код уровня
     */
    saveCode(level, code) {
        this.state.codeHistory[level] = code;
        this.save();
    },

    /**
     * Получить сохранённый код уровня
     */
    getCode(level) {
        return this.state.codeHistory[level] || '';
    },

    /**
     * Пометить как посещённый
     */
    markAsVisited() {
        this.state.firstVisit = false;
        this.save();
    },

    /**
     * Проверка первого визита
     */
    isFirstVisit() {
        return this.state.firstVisit;
    },

    /**
     * Добавить время игры
     */
    addPlayTime(seconds) {
        this.state.playTime += seconds;
        this.save();
    },

    /**
     * Получить статистику
     */
    getStats() {
        return {
            levelsCompleted: this.state.completedLevels.length,
            totalScore: this.state.totalScore,
            totalCrystals: this.state.totalCrystals,
            achievements: this.state.achievements.length,
            playTime: this.state.playTime,
            totalStars: Object.values(this.state.levelStars).reduce((a, b) => a + b, 0)
        };
    },

    /**
     * Экспорт данных
     */
    export() {
        return JSON.stringify(this.state);
    },

    /**
     * Импорт данных
     */
    import(data) {
        try {
            const parsed = JSON.parse(data);
            this.state = { ...this.DEFAULT_STATE, ...parsed };
            this.save();
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};

// Экспорт
window.Storage = Storage;
window.GameProgress = GameProgress;
