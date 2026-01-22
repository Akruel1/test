/**
 * CODEWORLD - Presentation
 * Интерактивная презентация для новых пользователей
 */

const Presentation = {
    currentSlide: 0,
    slides: [],
    onComplete: null,

    /**
     * Данные слайдов
     */
    slidesData: [
        {
            icon: '🌍',
            title: 'Добро пожаловать в CodeWorld!',
            description: 'Это не просто игра — это <strong>целый мир</strong>, который живёт по законам кода. Здесь вы станете <em>программистом-волшебником</em>, управляющим реальностью.',
            special: 'welcome'
        },
        {
            icon: '💻',
            title: 'Программируй всё!',
            description: 'Забудьте про кнопки и мышку. В CodeWorld <strong>единственный способ</strong> взаимодействия — это <em>код</em>. Хотите переместить персонажа? Напишите команду!',
            code: `# Перемещение персонажа
player.move("right", 3)
player.jump()
player.collect("crystal")`
        },
        {
            icon: '🎮',
            title: 'Игровой процесс',
            description: 'Решайте <strong>головоломки</strong>, собирайте <em>кристаллы</em>, открывайте новые уровни. Каждая задача — это программистский вызов!',
            features: [
                { icon: '🎯', text: 'Миссии' },
                { icon: '💎', text: 'Награды' },
                { icon: '⭐', text: 'Рейтинг' },
                { icon: '🏆', text: 'Достижения' }
            ]
        },
        {
            icon: '🐍',
            title: 'Выбери свой язык',
            description: 'CodeWorld поддерживает <strong>несколько языков программирования</strong>. Начните с Python или выберите свой любимый!',
            languages: [
                { name: 'Python', code: 'player.move("right")' },
                { name: 'JavaScript', code: 'player.move("right");' },
                { name: 'Java', code: 'player.move("right");' }
            ]
        },
        {
            icon: '📚',
            title: 'Учись играя',
            description: 'Каждый уровень — это <strong>новый урок</strong>. Вы освоите циклы, условия, функции и многое другое. <em>Программирование ещё никогда не было таким увлекательным!</em>',
            demo: true
        },
        {
            icon: '🚀',
            title: 'Готовы начать?',
            description: 'Ваше путешествие в мир программирования начинается прямо сейчас. <strong>Напишите свою первую строку кода</strong> и измените мир!',
            special: 'start'
        }
    ],

    /**
     * Инициализация презентации
     */
    init(onComplete) {
        this.onComplete = onComplete;
        this.currentSlide = 0;
        this.renderSlides();
        this.bindEvents();
        this.showSlide(0);
    },

    /**
     * Рендер слайдов
     */
    renderSlides() {
        const container = Utils.$('presentation-slides');
        const dotsContainer = Utils.$('presentation-dots');
        
        container.innerHTML = '';
        dotsContainer.innerHTML = '';

        this.slidesData.forEach((slide, index) => {
            // Создать слайд
            const slideEl = Utils.createElement('div', 'slide');
            slideEl.dataset.index = index;
            
            let content = `
                <div class="slide-icon">${slide.icon}</div>
                <h2 class="slide-title">${slide.title}</h2>
                <p class="slide-description">${slide.description}</p>
            `;

            // Добавить код
            if (slide.code) {
                content += `
                    <div class="slide-code">
                        ${this.highlightCode(slide.code)}
                    </div>
                `;
            }

            // Добавить фичи
            if (slide.features) {
                content += '<div class="slide-features">';
                slide.features.forEach(f => {
                    content += `
                        <div class="feature-item">
                            <span class="feature-icon">${f.icon}</span>
                            <span class="feature-text">${f.text}</span>
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Добавить языки
            if (slide.languages) {
                content += '<div class="language-examples">';
                slide.languages.forEach(lang => {
                    content += `
                        <div class="lang-example">
                            <div class="lang-example-header">
                                <span class="lang-example-name">${lang.name}</span>
                            </div>
                            <pre class="lang-example-code">${lang.code}</pre>
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Добавить демо
            if (slide.demo) {
                content += `
                    <div class="slide-demo">
                        <div class="demo-editor">
                            <div class="demo-editor-header">main.py</div>
                            <div class="demo-code">
                                <span class="keyword">for</span> i <span class="keyword">in</span> <span class="builtin">range</span>(<span class="number">4</span>):<br>
                                &nbsp;&nbsp;player.<span class="function">move</span>(<span class="string">"right"</span>)
                            </div>
                        </div>
                        <div class="demo-preview">
                            <div class="demo-character"></div>
                        </div>
                    </div>
                `;
            }

            slideEl.innerHTML = content;

            // Добавить специальные классы
            if (slide.special === 'welcome') {
                slideEl.classList.add('slide-welcome');
            }

            container.appendChild(slideEl);

            // Создать точку навигации
            const dot = Utils.createElement('div', 'dot');
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });
    },

    /**
     * Подсветка кода
     */
    highlightCode(code) {
        return code
            .replace(/(#.*)/g, '<span class="comment">$1</span>')
            .replace(/\b(def|for|if|else|while|return|import|from|class|in|and|or|not)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(player|game|world)\b/g, '<span class="function">$1</span>')
            .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопка "Далее"
        Utils.$('btn-next').addEventListener('click', () => this.nextSlide());
        
        // Кнопка "Пропустить"
        Utils.$('btn-skip').addEventListener('click', () => this.complete());
        
        // Точки навигации
        Utils.$$('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.showSlide(parseInt(dot.dataset.index));
            });
        });

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (Utils.$('presentation-screen').classList.contains('hidden')) return;
            
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                this.nextSlide();
            } else if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'Escape') {
                this.complete();
            }
        });
    },

    /**
     * Показать слайд
     */
    showSlide(index) {
        const slides = Utils.$$('.slide');
        const dots = Utils.$$('.dot');
        const btnNext = Utils.$('btn-next');
        
        // Обновить текущий слайд
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (i === index) {
                slide.classList.add('active');
            } else if (i < index) {
                slide.classList.add('prev');
            }
        });

        // Обновить точки
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Обновить кнопку
        if (index === this.slidesData.length - 1) {
            btnNext.textContent = 'Начать!';
            btnNext.classList.add('btn-start');
        } else {
            btnNext.textContent = 'Далее';
            btnNext.classList.remove('btn-start');
        }

        this.currentSlide = index;
        
        // Звук
        AudioManager.play('click');
    },

    /**
     * Следующий слайд
     */
    nextSlide() {
        if (this.currentSlide < this.slidesData.length - 1) {
            this.showSlide(this.currentSlide + 1);
        } else {
            this.complete();
        }
    },

    /**
     * Предыдущий слайд
     */
    prevSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    },

    /**
     * Завершение презентации
     */
    complete() {
        const screen = Utils.$('presentation-screen');
        screen.classList.add('fade-out');
        
        AudioManager.play('success');
        
        setTimeout(() => {
            Utils.hide(screen);
            GameProgress.markAsVisited();
            if (this.onComplete) {
                this.onComplete();
            }
        }, 800);
    },

    /**
     * Показать презентацию
     */
    show() {
        Utils.show('presentation-screen');
        this.showSlide(0);
    },

    /**
     * Скрыть презентацию
     */
    hide() {
        Utils.hide('presentation-screen');
    }
};

// Экспорт
window.Presentation = Presentation;
