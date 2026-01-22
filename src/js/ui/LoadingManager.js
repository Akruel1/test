/**
 * CodeWorld - Loading Manager
 * Handles the loading screen with pixel art animations
 */

export class LoadingManager {
    constructor() {
        this.screen = document.getElementById('loading-screen');
        this.progressBar = document.querySelector('.loading-progress');
        this.loadingText = document.querySelector('.loading-text');
        this.particles = document.querySelector('.loading-particles');
        
        this.currentProgress = 0;
        this.particleElements = [];
    }

    async init() {
        this.createParticles();
        this.startAnimations();
    }

    createParticles() {
        // Create floating pixel particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'pixel-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${this.getRandomColor()};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.2};
                animation: particleFloat ${Math.random() * 4 + 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            this.particles.appendChild(particle);
            this.particleElements.push(particle);
        }
    }

    getRandomColor() {
        const colors = ['#00ffff', '#ff00ff', '#00ff88', '#8b5cf6', '#ff6b35'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    startAnimations() {
        // Add CSS for particle animation if not exists
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(-30px) rotate(90deg);
                    }
                    50% {
                        transform: translateY(-15px) rotate(180deg);
                    }
                    75% {
                        transform: translateY(-45px) rotate(270deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateProgress(progress, text) {
        // Animate progress bar
        this.currentProgress = progress;
        this.progressBar.style.width = `${progress}%`;
        
        // Update text
        if (text) {
            this.loadingText.textContent = text;
        }

        // Add glitch effect at certain points
        if (progress === 50 || progress === 90) {
            this.glitchEffect();
        }
    }

    glitchEffect() {
        const logo = document.querySelector('.pixel-logo');
        logo.style.animation = 'none';
        logo.offsetHeight; // Trigger reflow
        logo.style.animation = 'glitch 0.3s ease';
        
        setTimeout(() => {
            logo.style.animation = '';
        }, 300);

        // Add glitch animation if not exists
        if (!document.getElementById('glitch-style')) {
            const style = document.createElement('style');
            style.id = 'glitch-style';
            style.textContent = `
                @keyframes glitch {
                    0%, 100% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(2px, -2px); }
                    60% { transform: translate(-2px, -2px); }
                    80% { transform: translate(2px, 2px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hide() {
        // Fade out loading screen
        this.screen.style.opacity = '0';
        
        setTimeout(() => {
            this.screen.classList.remove('active');
            this.cleanup();
        }, 500);
    }

    cleanup() {
        // Remove particle elements
        this.particleElements.forEach(p => p.remove());
        this.particleElements = [];
    }
}
