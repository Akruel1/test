/**
 * CODEWORLD - Sprite System
 * Система спрайтов и анимаций
 */

const SpriteManager = {
    sprites: {},
    animations: {},

    /**
     * Создать пиксельный спрайт программно
     */
    createPixelSprite(data, colors, scale = 1) {
        const width = data[0].length;
        const height = data.length;
        
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const colorIndex = data[y][x];
                if (colorIndex !== 0 && colors[colorIndex]) {
                    ctx.fillStyle = colors[colorIndex];
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
        
        return canvas;
    },

    /**
     * Инициализация спрайтов
     */
    init() {
        // Цвета для спрайтов
        const playerColors = {
            1: '#00ffff', // Основной
            2: '#006666', // Тёмный
            3: '#ffffff', // Блик
            4: '#000000'  // Глаза
        };

        const crystalColors = {
            1: '#ffff00', // Основной
            2: '#ffaa00', // Тёмный
            3: '#ffffff'  // Блик
        };

        // Спрайт игрока (8x8)
        const playerData = [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [0,1,4,1,1,4,1,0],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,1,1,1,1,0,0],
            [0,0,2,0,0,2,0,0],
            [0,0,2,0,0,2,0,0]
        ];

        // Спрайт кристалла (8x8)
        const crystalData = [
            [0,0,0,1,1,0,0,0],
            [0,0,1,3,1,1,0,0],
            [0,1,3,1,1,1,1,0],
            [0,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];

        this.sprites.player = this.createPixelSprite(playerData, playerColors, 4);
        this.sprites.crystal = this.createPixelSprite(crystalData, crystalColors, 4);
        
        // Создать анимации
        this.createAnimations();
    },

    /**
     * Создать анимации
     */
    createAnimations() {
        // Анимация ходьбы игрока
        this.animations.playerWalk = {
            frames: [0, 1, 0, 2],
            frameTime: 150,
            currentFrame: 0,
            elapsed: 0
        };

        // Анимация idle игрока
        this.animations.playerIdle = {
            frames: [0, 0, 0, 1],
            frameTime: 500,
            currentFrame: 0,
            elapsed: 0
        };

        // Анимация вращения кристалла
        this.animations.crystalSpin = {
            rotation: 0,
            speed: 0.02
        };
    },

    /**
     * Получить спрайт
     */
    getSprite(name) {
        return this.sprites[name];
    },

    /**
     * Обновить анимацию
     */
    updateAnimation(name, deltaTime) {
        const anim = this.animations[name];
        if (!anim || !anim.frames) return 0;
        
        anim.elapsed += deltaTime;
        if (anim.elapsed >= anim.frameTime) {
            anim.elapsed = 0;
            anim.currentFrame = (anim.currentFrame + 1) % anim.frames.length;
        }
        
        return anim.frames[anim.currentFrame];
    },

    /**
     * Отрисовать спрайт
     */
    draw(ctx, spriteName, x, y, options = {}) {
        const sprite = this.sprites[spriteName];
        if (!sprite) return;
        
        ctx.save();
        
        // Трансформации
        if (options.rotation) {
            ctx.translate(x + sprite.width / 2, y + sprite.height / 2);
            ctx.rotate(options.rotation);
            ctx.translate(-sprite.width / 2, -sprite.height / 2);
            x = 0;
            y = 0;
        }
        
        if (options.scale) {
            ctx.scale(options.scale, options.scale);
        }
        
        if (options.flipX) {
            ctx.scale(-1, 1);
            x = -x - sprite.width;
        }
        
        if (options.alpha !== undefined) {
            ctx.globalAlpha = options.alpha;
        }
        
        ctx.drawImage(sprite, x, y);
        ctx.restore();
    }
};

// Экспорт
window.SpriteManager = SpriteManager;
