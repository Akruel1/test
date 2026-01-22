/**
 * CODEWORLD - Audio Manager
 * Управление звуками и музыкой
 */

const AudioManager = {
    context: null,
    sounds: {},
    music: null,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    isMuted: false,

    /**
     * Инициализация аудио контекста
     */
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSounds();
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    },

    /**
     * Загрузка звуков (генерация синтетических)
     */
    loadSounds() {
        // Звуки генерируются синтетически для избежания внешних зависимостей
        this.sounds = {
            click: this.createTone(440, 0.1, 'square'),
            success: this.createSuccessSound(),
            error: this.createErrorSound(),
            collect: this.createCollectSound(),
            move: this.createTone(330, 0.05, 'sine'),
            levelComplete: this.createLevelCompleteSound(),
            achievement: this.createAchievementSound(),
            typing: this.createTone(800, 0.02, 'square'),
            run: this.createTone(220, 0.15, 'sawtooth')
        };
    },

    /**
     * Создать простой тон
     */
    createTone(frequency, duration, type = 'sine') {
        return { frequency, duration, type };
    },

    /**
     * Создать звук успеха
     */
    createSuccessSound() {
        return {
            notes: [
                { freq: 523, dur: 0.1 },
                { freq: 659, dur: 0.1 },
                { freq: 784, dur: 0.2 }
            ],
            type: 'square'
        };
    },

    /**
     * Создать звук ошибки
     */
    createErrorSound() {
        return {
            notes: [
                { freq: 200, dur: 0.15 },
                { freq: 150, dur: 0.2 }
            ],
            type: 'sawtooth'
        };
    },

    /**
     * Создать звук сбора
     */
    createCollectSound() {
        return {
            notes: [
                { freq: 880, dur: 0.05 },
                { freq: 1108, dur: 0.1 }
            ],
            type: 'square'
        };
    },

    /**
     * Создать звук завершения уровня
     */
    createLevelCompleteSound() {
        return {
            notes: [
                { freq: 523, dur: 0.15 },
                { freq: 659, dur: 0.15 },
                { freq: 784, dur: 0.15 },
                { freq: 1046, dur: 0.3 }
            ],
            type: 'square'
        };
    },

    /**
     * Создать звук достижения
     */
    createAchievementSound() {
        return {
            notes: [
                { freq: 587, dur: 0.1 },
                { freq: 784, dur: 0.1 },
                { freq: 987, dur: 0.1 },
                { freq: 1174, dur: 0.3 }
            ],
            type: 'square'
        };
    },

    /**
     * Воспроизвести звук
     */
    play(soundName) {
        if (this.isMuted || !this.context) return;
        
        const settings = GameProgress.state?.settings;
        if (settings && !settings.soundEffects) return;

        const sound = this.sounds[soundName];
        if (!sound) return;

        try {
            if (sound.notes) {
                this.playSequence(sound.notes, sound.type);
            } else {
                this.playTone(sound.frequency, sound.duration, sound.type);
            }
        } catch (e) {
            console.warn('Sound play error:', e);
        }
    },

    /**
     * Воспроизвести тон
     */
    playTone(frequency, duration, type = 'sine') {
        if (!this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    /**
     * Воспроизвести последовательность нот
     */
    playSequence(notes, type = 'sine') {
        if (!this.context) return;

        let time = this.context.currentTime;
        
        notes.forEach(note => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.type = type;
            oscillator.frequency.value = note.freq;
            
            gainNode.gain.setValueAtTime(this.sfxVolume, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.dur);

            oscillator.start(time);
            oscillator.stop(time + note.dur);
            
            time += note.dur;
        });
    },

    /**
     * Запустить фоновую музыку
     */
    startMusic() {
        if (this.isMuted || !this.context) return;
        
        const settings = GameProgress.state?.settings;
        if (settings && !settings.music) return;

        // Простая процедурная музыка
        this.playAmbientMusic();
    },

    /**
     * Процедурная эмбиент музыка
     */
    playAmbientMusic() {
        if (!this.context || this.musicPlaying) return;
        
        this.musicPlaying = true;
        
        const playNote = () => {
            if (!this.musicPlaying || this.isMuted) return;
            
            const settings = GameProgress.state?.settings;
            if (settings && !settings.music) return;

            const notes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94];
            const freq = notes[Math.floor(Math.random() * notes.length)];
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            const filterNode = this.context.createBiquadFilter();

            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 800;
            
            const now = this.context.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.3, now + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, now + 3);

            oscillator.start(now);
            oscillator.stop(now + 3);
            
            // Следующая нота через случайный интервал
            setTimeout(playNote, 2000 + Math.random() * 3000);
        };

        playNote();
    },

    /**
     * Остановить музыку
     */
    stopMusic() {
        this.musicPlaying = false;
    },

    /**
     * Переключить звук
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        }
        return this.isMuted;
    },

    /**
     * Установить громкость эффектов
     */
    setSfxVolume(volume) {
        this.sfxVolume = Utils.clamp(volume, 0, 1);
    },

    /**
     * Установить громкость музыки
     */
    setMusicVolume(volume) {
        this.musicVolume = Utils.clamp(volume, 0, 1);
    },

    /**
     * Возобновить контекст (для браузеров)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
};

// Экспорт
window.AudioManager = AudioManager;
