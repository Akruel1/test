/**
 * CodeWorld - Intro Presentation
 * Interactive slideshow explaining the game concept
 */

export class IntroPresentation {
    constructor(onComplete) {
        this.screen = document.getElementById('intro-screen');
        this.slides = document.querySelectorAll('.intro-slide');
        this.dots = document.querySelectorAll('.slide-dots .dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.skipBtn = document.querySelector('.skip-btn');
        this.startBtn = document.querySelector('.start-button');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.onComplete = onComplete;
        this.isAnimating = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.skipBtn.addEventListener('click', () => this.skip());
        
        // Start button (on last slide)
        this.startBtn.addEventListener('click', () => this.complete());
        
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.screen.classList.contains('active')) return;
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.nextSlide();
            } else if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'Escape') {
                this.skip();
            } else if (e.key === 'Enter' && this.currentSlide === this.totalSlides - 1) {
                this.complete();
            }
        });

        // Swipe support for mobile
        this.setupSwipe();
    }

    setupSwipe() {
        let startX = 0;
        let startY = 0;

        this.screen.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.screen.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: true });
    }

    show() {
        this.screen.classList.add('active');
        this.animateSlideIn(0);
        this.typeWriterEffect();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;
        if (index < 0 || index >= this.totalSlides) return;

        this.isAnimating = true;
        const direction = index > this.currentSlide ? 1 : -1;

        // Update current slide
        this.slides[this.currentSlide].classList.remove('active');
        this.slides[this.currentSlide].classList.add(direction > 0 ? 'prev' : '');
        this.dots[this.currentSlide].classList.remove('active');

        this.currentSlide = index;

        // Show new slide
        this.slides[this.currentSlide].classList.remove('prev');
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');

        // Update navigation buttons
        this.updateNavigation();

        // Animate elements in new slide
        this.animateSlideIn(this.currentSlide);

        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    updateNavigation() {
        // Update prev button
        this.prevBtn.disabled = this.currentSlide === 0;

        // Update next button
        if (this.currentSlide === this.totalSlides - 1) {
            this.nextBtn.style.display = 'none';
        } else {
            this.nextBtn.style.display = '';
        }
    }

    animateSlideIn(slideIndex) {
        const slide = this.slides[slideIndex];
        const elements = slide.querySelectorAll('.slide-title, .slide-text, .code-preview, .feature-list, .concept-icons, .languages-grid, .start-button');
        
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.4s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 100 + 200);
        });

        // Special animations for certain slides
        this.triggerSlideSpecificAnimations(slideIndex);
    }

    triggerSlideSpecificAnimations(slideIndex) {
        switch (slideIndex) {
            case 0:
                // Character animation on first slide
                this.animateCharacter();
                break;
            case 1:
                // Concept icons pop animation
                this.animateConceptIcons();
                break;
            case 3:
                // Language badges glow animation
                this.animateLanguageBadges();
                break;
            case 4:
                // Rocket animation
                this.animateRocket();
                break;
        }
    }

    animateCharacter() {
        const character = document.querySelector('.intro-character');
        if (character) {
            character.style.animation = 'characterBounce 0.5s ease';
            setTimeout(() => {
                character.style.animation = '';
            }, 500);
        }
    }

    animateConceptIcons() {
        const icons = document.querySelectorAll('.concept-icon');
        icons.forEach((icon, i) => {
            setTimeout(() => {
                icon.style.animation = 'iconPop 0.3s ease';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 300);
            }, i * 150);
        });

        // Add icon pop animation if not exists
        if (!document.getElementById('icon-pop-style')) {
            const style = document.createElement('style');
            style.id = 'icon-pop-style';
            style.textContent = `
                @keyframes iconPop {
                    0% { transform: scale(0.8); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes characterBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    animateLanguageBadges() {
        const badges = document.querySelectorAll('.lang-badge');
        badges.forEach((badge, i) => {
            setTimeout(() => {
                badge.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    badge.style.transform = '';
                }, 200);
            }, i * 100);
        });
    }

    animateRocket() {
        const rocket = document.querySelector('.ready-icon');
        if (rocket) {
            rocket.style.animation = 'rocketShake 0.5s ease';
            setTimeout(() => {
                rocket.style.animation = 'readyPulse 1.5s ease-in-out infinite';
            }, 500);
        }

        if (!document.getElementById('rocket-style')) {
            const style = document.createElement('style');
            style.id = 'rocket-style';
            style.textContent = `
                @keyframes rocketShake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    25% { transform: translateX(-5px) rotate(-5deg); }
                    75% { transform: translateX(5px) rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    typeWriterEffect() {
        // Optional: Add typewriter effect to code preview
        const codePreview = document.querySelector('.intro-slide.active .code-preview code');
        if (codePreview) {
            const text = codePreview.textContent;
            codePreview.textContent = '';
            let i = 0;
            
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    codePreview.textContent += text[i];
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 50);
        }
    }

    skip() {
        this.complete();
    }

    complete() {
        // Fade out intro screen
        this.screen.style.opacity = '0';
        
        setTimeout(() => {
            this.screen.classList.remove('active');
            if (this.onComplete) {
                this.onComplete();
            }
        }, 500);
    }
}
