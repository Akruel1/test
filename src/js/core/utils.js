/**
 * CODEWORLD - Utility Functions
 * Вспомогательные функции и утилиты
 */

const Utils = {
    /**
     * Получить DOM элемент по ID
     */
    $(id) {
        return document.getElementById(id);
    },

    /**
     * Получить все элементы по селектору
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Создать DOM элемент
     */
    createElement(tag, className = '', innerHTML = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (innerHTML) el.innerHTML = innerHTML;
        return el;
    },

    /**
     * Добавить/удалить класс
     */
    toggleClass(element, className, force) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.toggle(className, force);
        }
    },

    /**
     * Показать элемент
     */
    show(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },

    /**
     * Скрыть элемент
     */
    hide(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },

    /**
     * Задержка (Promise)
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Случайное число в диапазоне
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Случайный элемент массива
     */
    randomElement(array) {
        return array[this.random(0, array.length - 1)];
    },

    /**
     * Ограничить значение
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Линейная интерполяция
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Форматировать время
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Форматировать число
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Дебаунс
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Троттлинг
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Глубокое копирование объекта
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Генерация уникального ID
     */
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Проверка мобильного устройства
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Получить текущую дату в формате
     */
    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Анимация числа
     */
    animateNumber(element, start, end, duration = 500) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(this.lerp(start, end, progress));
            element.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    },

    /**
     * Проверка столкновения прямоугольников
     */
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },

    /**
     * Расстояние между точками
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * Преобразование угла в радианы
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    /**
     * Преобразование радиан в угол
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    /**
     * Событие с данными
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    },

    /**
     * Слушатель события
     */
    on(eventName, callback) {
        document.addEventListener(eventName, (e) => callback(e.detail));
    },

    /**
     * Получить время выполнения кода
     */
    measureTime(func) {
        const start = performance.now();
        func();
        return performance.now() - start;
    },

    /**
     * Создание canvas изображения из текста
     */
    createTextSprite(text, fontSize = 16, color = '#ffffff') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontSize}px 'Press Start 2P'`;
        const metrics = ctx.measureText(text);
        canvas.width = metrics.width + 4;
        canvas.height = fontSize + 4;
        ctx.font = `${fontSize}px 'Press Start 2P'`;
        ctx.fillStyle = color;
        ctx.fillText(text, 2, fontSize);
        return canvas;
    }
};

// Экспорт для глобального использования
window.Utils = Utils;
