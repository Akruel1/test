/**
 * CODEWORLD - World
 * Игровой мир и управление уровнями
 */

class World {
    constructor() {
        this.width = 20;
        this.height = 15;
        this.tiles = [];
        this.objects = [];
        this.npcs = [];
        this.player = null;
        this.playerStart = { x: 1, y: 1 };
        this.exit = null;
        this.switches = new Map();
        this.doors = new Map();
        this.levelData = null;
    }

    /**
     * Загрузить уровень
     */
    loadLevel(levelData) {
        this.levelData = levelData;
        this.width = levelData.width || 20;
        this.height = levelData.height || 15;
        this.tiles = [];
        this.objects = [];
        this.npcs = [];
        this.switches.clear();
        this.doors.clear();

        // Создать пустую карту
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = 'floor';
            }
        }

        // Загрузить тайлы из данных
        if (levelData.map) {
            for (let y = 0; y < levelData.map.length; y++) {
                for (let x = 0; x < levelData.map[y].length; x++) {
                    const tile = levelData.map[y][x];
                    this.setTile(x, y, this.parseTile(tile));
                }
            }
        }

        // Загрузить объекты
        if (levelData.objects) {
            levelData.objects.forEach(obj => {
                this.addObject(obj);
            });
        }

        // Загрузить NPC
        if (levelData.npcs) {
            levelData.npcs.forEach(npc => {
                this.npcs.push({
                    x: npc.x,
                    y: npc.y,
                    name: npc.name || 'NPC',
                    dialogue: npc.dialogue || []
                });
            });
        }

        // Установить стартовую позицию игрока
        if (levelData.playerStart) {
            this.playerStart = levelData.playerStart;
        }

        // Установить выход
        if (levelData.exit) {
            this.exit = levelData.exit;
        }

        return this;
    }

    /**
     * Парсинг типа тайла
     */
    parseTile(char) {
        const tileMap = {
            '#': 'wall',
            '.': 'floor',
            ' ': 'floor',
            'X': 'obstacle',
            'E': 'exit',
            'S': 'switch',
            'D': 'door'
        };
        return tileMap[char] || 'floor';
    }

    /**
     * Установить тайл
     */
    setTile(x, y, type) {
        if (this.isInBounds(x, y)) {
            this.tiles[y][x] = type;
            
            // Специальная обработка
            if (type === 'exit') {
                this.exit = { x, y };
            } else if (type === 'switch') {
                this.switches.set(`${x},${y}`, { x, y, active: false, targetId: null });
            } else if (type === 'door') {
                this.doors.set(`${x},${y}`, { x, y, open: false, switchId: null });
            }
        }
    }

    /**
     * Получить тайл
     */
    getTile(x, y) {
        if (this.isInBounds(x, y)) {
            return this.tiles[y][x];
        }
        return 'wall';
    }

    /**
     * Добавить объект
     */
    addObject(obj) {
        this.objects.push({
            id: obj.id || Utils.generateId(),
            type: obj.type,
            x: obj.x,
            y: obj.y,
            collected: false,
            ...obj
        });

        // Если это выход, сохранить
        if (obj.type === 'exit') {
            this.exit = { x: obj.x, y: obj.y };
        }
    }

    /**
     * Проверка границ
     */
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Можно ли переместиться
     */
    canMoveTo(x, y) {
        if (!this.isInBounds(x, y)) {
            return false;
        }

        const tile = this.getTile(x, y);
        
        // Стены и препятствия непроходимы
        if (tile === 'wall' || tile === 'obstacle') {
            return false;
        }

        // Закрытые двери непроходимы
        if (tile === 'door') {
            const door = this.doors.get(`${x},${y}`);
            if (door && !door.open) {
                return false;
            }
        }

        return true;
    }

    /**
     * Проверить сбор на позиции
     */
    checkCollection(x, y) {
        const floorX = Math.floor(x);
        const floorY = Math.floor(y);
        
        // Автоматический сбор кристаллов при прохождении
        for (const obj of this.objects) {
            if (!obj.collected && obj.x === floorX && obj.y === floorY) {
                if (obj.type === 'crystal') {
                    obj.collected = true;
                    Renderer.createCollectEffect(floorX, floorY);
                    AudioManager.play('collect');
                    Utils.emit('crystal-collected', { x: floorX, y: floorY });
                    return obj;
                }
            }
        }
        return null;
    }

    /**
     * Собрать объект на позиции
     */
    collectAt(x, y) {
        for (const obj of this.objects) {
            if (!obj.collected && obj.x === x && obj.y === y) {
                obj.collected = true;
                return obj;
            }
        }
        return null;
    }

    /**
     * Взаимодействие на позиции
     */
    interactAt(x, y) {
        // Проверить переключатели рядом
        const directions = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]];
        
        for (const [dx, dy] of directions) {
            const checkX = x + dx;
            const checkY = y + dy;
            
            // Переключатели
            const switchObj = this.switches.get(`${checkX},${checkY}`);
            if (switchObj) {
                switchObj.active = !switchObj.active;
                this.updateDoors();
                AudioManager.play('click');
                return { type: 'switch', active: switchObj.active };
            }

            // NPC
            for (const npc of this.npcs) {
                if (npc.x === checkX && npc.y === checkY) {
                    return { type: 'npc', npc };
                }
            }
        }

        return null;
    }

    /**
     * Обновить состояние дверей
     */
    updateDoors() {
        // Простая логика: если все переключатели активны, открыть все двери
        let allActive = true;
        this.switches.forEach(s => {
            if (!s.active) allActive = false;
        });

        this.doors.forEach(door => {
            door.open = allActive;
        });
    }

    /**
     * Проверить достижение выхода
     */
    checkExit(playerX, playerY) {
        if (this.exit) {
            const dist = Utils.distance(playerX, playerY, this.exit.x, this.exit.y);
            return dist < 0.5;
        }
        return false;
    }

    /**
     * Получить оставшиеся кристаллы
     */
    getRemainingCrystals() {
        return this.objects.filter(obj => obj.type === 'crystal' && !obj.collected).length;
    }

    /**
     * Получить всего кристаллов
     */
    getTotalCrystals() {
        return this.objects.filter(obj => obj.type === 'crystal').length;
    }

    /**
     * Получить позицию выхода
     */
    getExitPosition() {
        return this.exit;
    }

    /**
     * Получить объект по позиции
     */
    getObjectAt(x, y) {
        return this.objects.find(obj => obj.x === x && obj.y === y && !obj.collected);
    }

    /**
     * Получить NPC по позиции
     */
    getNPCAt(x, y) {
        return this.npcs.find(npc => npc.x === x && npc.y === y);
    }

    /**
     * Отрисовка мира
     */
    render(time = 0) {
        // Отрисовка тайлов
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                
                if (tile === 'door') {
                    const door = this.doors.get(`${x},${y}`);
                    Renderer.drawTile(x, y, 'door', { open: door?.open });
                } else if (tile === 'switch') {
                    const sw = this.switches.get(`${x},${y}`);
                    Renderer.drawTile(x, y, 'switch', { active: sw?.active });
                } else {
                    Renderer.drawTile(x, y, tile, { time });
                }
            }
        }

        // Отрисовка объектов
        for (const obj of this.objects) {
            if (!obj.collected) {
                Renderer.drawTile(obj.x, obj.y, obj.type, { time });
            }
        }

        // Отрисовка NPC
        for (const npc of this.npcs) {
            Renderer.drawNPC(npc, time);
        }
    }

    /**
     * Создать процедурный уровень
     */
    generateLevel(difficulty = 1) {
        // Очистить
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Границы - стены
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.tiles[y][x] = 'wall';
                } else {
                    this.tiles[y][x] = 'floor';
                }
            }
        }

        // Добавить случайные стены
        const wallCount = Math.floor(difficulty * 5);
        for (let i = 0; i < wallCount; i++) {
            const x = Utils.random(2, this.width - 3);
            const y = Utils.random(2, this.height - 3);
            this.tiles[y][x] = 'wall';
        }

        // Добавить кристаллы
        this.objects = [];
        const crystalCount = Math.floor(difficulty * 3) + 2;
        for (let i = 0; i < crystalCount; i++) {
            let x, y;
            do {
                x = Utils.random(2, this.width - 3);
                y = Utils.random(2, this.height - 3);
            } while (this.getTile(x, y) !== 'floor' || this.getObjectAt(x, y));
            
            this.addObject({ type: 'crystal', x, y });
        }

        // Установить выход
        this.exit = { x: this.width - 2, y: this.height - 2 };

        // Установить старт игрока
        this.playerStart = { x: 1, y: 1 };

        return this;
    }
}

// Экспорт
window.World = World;
