/**
 * CODEWORLD - Renderer
 * Система рендеринга на Canvas
 */

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    scale: 1,
    tileSize: 32,
    camera: { x: 0, y: 0 },
    particles: [],
    
    // Цвета
    colors: {
        background: '#0d0d15',
        grid: 'rgba(0, 255, 255, 0.05)',
        player: '#00ffff',
        wall: '#2a2a3a',
        floor: '#1a1a25',
        crystal: '#ffff00',
        exit: '#00ff88',
        obstacle: '#ff3366',
        npc: '#aa55ff'
    },

    /**
     * Инициализация рендерера
     */
    init(canvasId) {
        this.canvas = Utils.$(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Отключить сглаживание для пиксельной графики
        this.ctx.imageSmoothingEnabled = false;
    },

    /**
     * Изменение размера canvas
     */
    resize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Рассчитать размер для соотношения 16:9
        let width = containerWidth;
        let height = containerWidth * 9 / 16;
        
        if (height > containerHeight) {
            height = containerHeight;
            width = height * 16 / 9;
        }
        
        // Округлить для пиксельной графики
        width = Math.floor(width / this.tileSize) * this.tileSize;
        height = Math.floor(height / this.tileSize) * this.tileSize;
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        
        // Масштаб
        this.scale = width / 640;
        
        // Пересчитать размер тайла
        this.ctx.imageSmoothingEnabled = false;
    },

    /**
     * Очистка canvas
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    /**
     * Отрисовка сетки
     */
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    },

    /**
     * Отрисовка тайла
     */
    drawTile(x, y, type, options = {}) {
        const px = x * this.tileSize - this.camera.x;
        const py = y * this.tileSize - this.camera.y;
        
        // Проверка видимости
        if (px + this.tileSize < 0 || px > this.width ||
            py + this.tileSize < 0 || py > this.height) {
            return;
        }
        
        switch (type) {
            case 'wall':
                this.drawWall(px, py);
                break;
            case 'floor':
                this.drawFloor(px, py);
                break;
            case 'crystal':
                this.drawCrystal(px, py, options);
                break;
            case 'exit':
                this.drawExit(px, py, options);
                break;
            case 'obstacle':
                this.drawObstacle(px, py);
                break;
            case 'switch':
                this.drawSwitch(px, py, options);
                break;
            case 'door':
                this.drawDoor(px, py, options);
                break;
        }
    },

    /**
     * Отрисовка стены
     */
    drawWall(x, y) {
        const size = this.tileSize;
        
        // Основа
        this.ctx.fillStyle = this.colors.wall;
        this.ctx.fillRect(x, y, size, size);
        
        // Пиксельный узор
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < size; i += 4) {
            for (let j = 0; j < size; j += 4) {
                if ((i + j) % 8 === 0) {
                    this.ctx.fillRect(x + i, y + j, 2, 2);
                }
            }
        }
        
        // Граница
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    },

    /**
     * Отрисовка пола
     */
    drawFloor(x, y) {
        const size = this.tileSize;
        
        this.ctx.fillStyle = this.colors.floor;
        this.ctx.fillRect(x, y, size, size);
        
        // Тонкая сетка
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    },

    /**
     * Отрисовка кристалла
     */
    drawCrystal(x, y, options = {}) {
        const size = this.tileSize;
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const crystalSize = size * 0.4;
        const time = options.time || 0;
        
        // Анимация
        const pulse = Math.sin(time * 3) * 0.1 + 1;
        const rotation = time * 0.5;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        this.ctx.scale(pulse, pulse);
        
        // Свечение
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, crystalSize * 1.5);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-crystalSize, -crystalSize, crystalSize * 2, crystalSize * 2);
        
        // Кристалл (ромб)
        this.ctx.beginPath();
        this.ctx.moveTo(0, -crystalSize);
        this.ctx.lineTo(crystalSize * 0.6, 0);
        this.ctx.lineTo(0, crystalSize);
        this.ctx.lineTo(-crystalSize * 0.6, 0);
        this.ctx.closePath();
        
        this.ctx.fillStyle = this.colors.crystal;
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    },

    /**
     * Отрисовка выхода
     */
    drawExit(x, y, options = {}) {
        const size = this.tileSize;
        const time = options.time || 0;
        const pulse = Math.sin(time * 2) * 0.2 + 0.8;
        
        // Платформа
        this.ctx.fillStyle = this.colors.floor;
        this.ctx.fillRect(x, y, size, size);
        
        // Портал
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const portalSize = size * 0.4 * pulse;
        
        // Свечение
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, portalSize * 1.5);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, portalSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Центр
        this.ctx.fillStyle = this.colors.exit;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, portalSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Стрелка вверх
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - portalSize * 0.3);
        this.ctx.lineTo(centerX - portalSize * 0.2, centerY + portalSize * 0.1);
        this.ctx.lineTo(centerX + portalSize * 0.2, centerY + portalSize * 0.1);
        this.ctx.closePath();
        this.ctx.fill();
    },

    /**
     * Отрисовка препятствия
     */
    drawObstacle(x, y) {
        const size = this.tileSize;
        
        // Основа
        this.ctx.fillStyle = this.colors.obstacle;
        this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        
        // Крест (опасность)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y + 10);
        this.ctx.lineTo(x + size - 10, y + size - 10);
        this.ctx.moveTo(x + size - 10, y + 10);
        this.ctx.lineTo(x + 10, y + size - 10);
        this.ctx.stroke();
    },

    /**
     * Отрисовка переключателя
     */
    drawSwitch(x, y, options = {}) {
        const size = this.tileSize;
        const isActive = options.active || false;
        
        // Платформа
        this.ctx.fillStyle = this.colors.floor;
        this.ctx.fillRect(x, y, size, size);
        
        // Кнопка
        const btnSize = size * 0.5;
        const btnX = x + (size - btnSize) / 2;
        const btnY = y + (size - btnSize) / 2;
        
        this.ctx.fillStyle = isActive ? this.colors.exit : '#666666';
        this.ctx.fillRect(btnX, btnY, btnSize, btnSize);
        
        this.ctx.strokeStyle = isActive ? '#ffffff' : '#444444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(btnX, btnY, btnSize, btnSize);
    },

    /**
     * Отрисовка двери
     */
    drawDoor(x, y, options = {}) {
        const size = this.tileSize;
        const isOpen = options.open || false;
        
        if (isOpen) {
            this.drawFloor(x, y);
        } else {
            this.ctx.fillStyle = '#884400';
            this.ctx.fillRect(x, y, size, size);
            
            // Узор двери
            this.ctx.fillStyle = '#663300';
            this.ctx.fillRect(x + 4, y + 4, size - 8, (size - 8) / 2);
            this.ctx.fillRect(x + 4, y + size / 2 + 2, size - 8, (size - 8) / 2);
            
            // Ручка
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.beginPath();
            this.ctx.arc(x + size * 0.7, y + size / 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },

    /**
     * Отрисовка игрока
     */
    drawPlayer(player, time = 0) {
        const x = player.x * this.tileSize - this.camera.x;
        const y = player.y * this.tileSize - this.camera.y;
        const size = this.tileSize;
        
        // Анимация дыхания
        const breathe = Math.sin(time * 2) * 2;
        
        // Тень
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + size / 2, y + size - 4, size * 0.35, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Тело (пиксельный робот)
        const bodyY = y + breathe;
        
        // Ноги
        this.ctx.fillStyle = '#006666';
        this.ctx.fillRect(x + 8, bodyY + size - 8, 6, 8);
        this.ctx.fillRect(x + size - 14, bodyY + size - 8, 6, 8);
        
        // Тело
        this.ctx.fillStyle = this.colors.player;
        this.ctx.fillRect(x + 6, bodyY + 10, size - 12, size - 18);
        
        // Голова
        this.ctx.fillRect(x + 8, bodyY + 2, size - 16, 12);
        
        // Глаза
        this.ctx.fillStyle = '#000000';
        const eyeOffset = player.direction === 'left' ? -2 : player.direction === 'right' ? 2 : 0;
        this.ctx.fillRect(x + 11 + eyeOffset, bodyY + 5, 3, 4);
        this.ctx.fillRect(x + size - 14 + eyeOffset, bodyY + 5, 3, 4);
        
        // Блики глаз
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 12 + eyeOffset, bodyY + 6, 1, 1);
        this.ctx.fillRect(x + size - 13 + eyeOffset, bodyY + 6, 1, 1);
        
        // Антенна
        this.ctx.fillStyle = this.colors.player;
        this.ctx.fillRect(x + size / 2 - 1, bodyY - 4, 2, 6);
        
        // Шарик антенны (пульсирует)
        const antennaPulse = Math.sin(time * 5) * 0.3 + 1;
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, bodyY - 6, 3 * antennaPulse, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Свечение
        this.ctx.shadowColor = this.colors.player;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(x + size / 2, bodyY - 6, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    },

    /**
     * Отрисовка NPC
     */
    drawNPC(npc, time = 0) {
        const x = npc.x * this.tileSize - this.camera.x;
        const y = npc.y * this.tileSize - this.camera.y;
        const size = this.tileSize;
        
        // Подобно игроку, но другой цвет
        const float = Math.sin(time * 1.5 + npc.x) * 3;
        
        this.ctx.fillStyle = this.colors.npc;
        this.ctx.fillRect(x + 6, y + 8 + float, size - 12, size - 14);
        this.ctx.fillRect(x + 8, y + 2 + float, size - 16, 10);
        
        // Глаза
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 10, y + 5 + float, 4, 4);
        this.ctx.fillRect(x + size - 14, y + 5 + float, 4, 4);
        
        // Зрачки
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12, y + 6 + float, 2, 2);
        this.ctx.fillRect(x + size - 12, y + 6 + float, 2, 2);
    },

    /**
     * Добавить частицу
     */
    addParticle(x, y, color, options = {}) {
        this.particles.push({
            x: x * this.tileSize + this.tileSize / 2,
            y: y * this.tileSize + this.tileSize / 2,
            vx: (Math.random() - 0.5) * (options.speed || 4),
            vy: (Math.random() - 0.5) * (options.speed || 4) - 2,
            size: options.size || 4,
            color: color,
            life: options.life || 1,
            decay: options.decay || 0.02
        });
    },

    /**
     * Создать эффект сбора
     */
    createCollectEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.addParticle(x, y, this.colors.crystal, {
                speed: 6,
                size: 3,
                life: 1,
                decay: 0.03
            });
        }
    },

    /**
     * Создать эффект ошибки
     */
    createErrorEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            this.addParticle(x, y, this.colors.obstacle, {
                speed: 8,
                size: 4,
                life: 1,
                decay: 0.04
            });
        }
    },

    /**
     * Обновление и отрисовка частиц
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Гравитация
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Отрисовка
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(
                p.x - this.camera.x - p.size / 2,
                p.y - this.camera.y - p.size / 2,
                p.size * p.life,
                p.size * p.life
            );
            this.ctx.globalAlpha = 1;
        }
    },

    /**
     * Отрисовка текста
     */
    drawText(text, x, y, options = {}) {
        const fontSize = options.fontSize || 16;
        const color = options.color || '#ffffff';
        const align = options.align || 'left';
        const font = options.font || 'Press Start 2P';
        
        this.ctx.font = `${fontSize}px '${font}'`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = options.baseline || 'top';
        
        if (options.shadow) {
            this.ctx.shadowColor = options.shadowColor || color;
            this.ctx.shadowBlur = options.shadowBlur || 10;
        }
        
        this.ctx.fillText(text, x, y);
        this.ctx.shadowBlur = 0;
    },

    /**
     * Установить камеру
     */
    setCamera(x, y) {
        this.camera.x = x;
        this.camera.y = y;
    },

    /**
     * Центрировать камеру на позиции
     */
    centerCamera(x, y, worldWidth, worldHeight) {
        const targetX = x * this.tileSize - this.width / 2 + this.tileSize / 2;
        const targetY = y * this.tileSize - this.height / 2 + this.tileSize / 2;
        
        // Ограничить камеру границами мира
        this.camera.x = Utils.clamp(targetX, 0, worldWidth * this.tileSize - this.width);
        this.camera.y = Utils.clamp(targetY, 0, worldHeight * this.tileSize - this.height);
    }
};

// Экспорт
window.Renderer = Renderer;
