/**
 * CODEWORLD - Loader
 * Загрузочный экран с анимацией
 */

const Loader = {
    progress: 0,
    status: '',
    tasks: [],
    onComplete: null,

    /**
     * Инициализация загрузчика
     */
    init(tasks, onComplete) {
        this.tasks = tasks;
        this.onComplete = onComplete;
        this.progress = 0;
        this.updateUI();
    },

    /**
     * Запуск загрузки
     */
    async start() {
        const progressBar = Utils.$('loader-progress');
        const percentText = Utils.$('loader-percentage');
        const statusText = Utils.$('loader-status');

        const totalTasks = this.tasks.length;
        
        for (let i = 0; i < totalTasks; i++) {
            const task = this.tasks[i];
            
            // Обновить статус
            this.status = task.name;
            statusText.textContent = task.name;
            
            // Выполнить задачу
            if (task.action) {
                await task.action();
            }
            
            // Имитация минимального времени загрузки для эффекта
            await Utils.delay(task.duration || 200);
            
            // Обновить прогресс
            this.progress = Math.floor(((i + 1) / totalTasks) * 100);
            progressBar.style.width = this.progress + '%';
            percentText.textContent = this.progress + '%';
            
            // Добавить визуальный эффект
            this.addGlitchEffect();
        }

        // Завершение
        statusText.textContent = 'Запуск...';
        await Utils.delay(500);
        
        // Плавное скрытие
        const loaderScreen = Utils.$('loader-screen');
        loaderScreen.classList.add('fade-out');
        
        await Utils.delay(500);
        
        if (this.onComplete) {
            this.onComplete();
        }
    },

    /**
     * Обновление UI
     */
    updateUI() {
        const progressBar = Utils.$('loader-progress');
        const percentText = Utils.$('loader-percentage');
        const statusText = Utils.$('loader-status');

        if (progressBar) progressBar.style.width = this.progress + '%';
        if (percentText) percentText.textContent = this.progress + '%';
        if (statusText) statusText.textContent = this.status;
    },

    /**
     * Добавить глитч эффект
     */
    addGlitchEffect() {
        const logo = document.querySelector('.loader-logo');
        if (logo && Math.random() > 0.7) {
            logo.classList.add('glitch');
            setTimeout(() => logo.classList.remove('glitch'), 100);
        }
    },

    /**
     * Скрыть загрузчик
     */
    hide() {
        Utils.hide('loader-screen');
    }
};

/**
 * Список задач загрузки
 */
const LoadingTasks = [
    {
        name: 'Инициализация системы...',
        duration: 300,
        action: () => {
            // Инициализация базовых систем
            GameProgress.init();
        }
    },
    {
        name: 'Загрузка игрового движка...',
        duration: 400,
        action: () => {
            // Подготовка canvas
        }
    },
    {
        name: 'Загрузка аудио системы...',
        duration: 250,
        action: () => {
            AudioManager.init();
        }
    },
    {
        name: 'Загрузка графики...',
        duration: 350,
        action: () => {
            // Инициализация спрайтов
        }
    },
    {
        name: 'Загрузка уровней...',
        duration: 300,
        action: () => {
            // Загрузка данных уровней
        }
    },
    {
        name: 'Инициализация редактора кода...',
        duration: 250,
        action: () => {
            // Подготовка редактора
        }
    },
    {
        name: 'Загрузка достижений...',
        duration: 200,
        action: () => {
            // Загрузка системы достижений
        }
    },
    {
        name: 'Подготовка интерфейса...',
        duration: 300,
        action: () => {
            // Финальная подготовка
        }
    }
];

// Экспорт
window.Loader = Loader;
window.LoadingTasks = LoadingTasks;
