/**
 * CodeWorld - Sound Manager
 * Handles game audio (currently using Web Audio API for generated sounds)
 */

export class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        
        // Initialize on first user interaction
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Play a generated sound effect
    playSound(type) {
        if (!this.enabled || !this.initialized) return;
        
        // Initialize on first use (requires user interaction)
        if (!this.audioContext) {
            this.init();
            if (!this.audioContext) return;
        }

        switch (type) {
            case 'move':
                this.playTone(200, 0.05, 'square');
                break;
            case 'collect':
                this.playCollectSound();
                break;
            case 'success':
                this.playSuccessSound();
                break;
            case 'error':
                this.playErrorSound();
                break;
            case 'click':
                this.playTone(400, 0.03, 'square');
                break;
            case 'levelComplete':
                this.playLevelCompleteSound();
                break;
            case 'achievement':
                this.playAchievementSound();
                break;
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCollectSound() {
        // Ascending notes
        this.playTone(523, 0.1); // C5
        setTimeout(() => this.playTone(659, 0.1), 50); // E5
        setTimeout(() => this.playTone(784, 0.15), 100); // G5
    }

    playSuccessSound() {
        // Happy ascending arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15), i * 80);
        });
    }

    playErrorSound() {
        // Descending buzzy sound
        this.playTone(200, 0.15, 'sawtooth');
        setTimeout(() => this.playTone(150, 0.2, 'sawtooth'), 100);
    }

    playLevelCompleteSound() {
        // Celebratory fanfare
        const melody = [
            { freq: 523, dur: 0.1 },  // C5
            { freq: 523, dur: 0.1 },
            { freq: 523, dur: 0.1 },
            { freq: 659, dur: 0.2 },  // E5
            { freq: 523, dur: 0.1 },  // C5
            { freq: 659, dur: 0.1 },  // E5
            { freq: 784, dur: 0.4 }   // G5
        ];

        let time = 0;
        melody.forEach(note => {
            setTimeout(() => this.playTone(note.freq, note.dur), time);
            time += note.dur * 800;
        });
    }

    playAchievementSound() {
        // Special achievement jingle
        const notes = [784, 988, 1175, 1568]; // G5, B5, D6, G6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2), i * 100);
        });
    }

    // Resume audio context (required after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
