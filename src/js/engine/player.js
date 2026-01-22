/**
 * CODEWORLD - Player
 * Класс игрока и его API
 */

class Player {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = 'down';
        this.isMoving = false;
        this.speed = 5; // Тайлов в секунду
        this.energy = 100;
        this.crystals = 0;
        this.inventory = [];
        this.state = 'idle'; // idle, moving, jumping, error
        this.actionQueue = [];
        this.currentAction = null;
        this.onActionComplete = null;
        this.onError = null;
    }

    /**
     * Сброс состояния
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = 'down';
        this.isMoving = false;
        this.state = 'idle';
        this.energy = 100;
        this.crystals = 0;
        this.inventory = [];
        this.actionQueue = [];
        this.currentAction = null;
    }

    /**
     * Добавить действие в очередь
     */
    queueAction(action) {
        this.actionQueue.push(action);
    }

    /**
     * Очистить очередь действий
     */
    clearQueue() {
        this.actionQueue = [];
        this.currentAction = null;
        this.isMoving = false;
        this.state = 'idle';
    }

    /**
     * Выполнить следующее действие
     */
    executeNextAction() {
        if (this.currentAction || this.actionQueue.length === 0) {
            return false;
        }

        this.currentAction = this.actionQueue.shift();
        return true;
    }

    /**
     * Движение в направлении
     */
    move(direction, steps = 1, world) {
        return new Promise((resolve, reject) => {
            const directions = {
                'up': { dx: 0, dy: -1 },
                'down': { dx: 0, dy: 1 },
                'left': { dx: -1, dy: 0 },
                'right': { dx: 1, dy: 0 }
            };

            const dir = directions[direction];
            if (!dir) {
                const error = `Неизвестное направление: ${direction}`;
                if (this.onError) this.onError(error);
                reject(new Error(error));
                return;
            }

            this.direction = direction;
            
            // Проверка энергии
            if (this.energy < steps) {
                const error = 'Недостаточно энергии!';
                if (this.onError) this.onError(error);
                reject(new Error(error));
                return;
            }

            const moveSteps = [];
            let currentX = this.x;
            let currentY = this.y;

            for (let i = 0; i < steps; i++) {
                const newX = currentX + dir.dx;
                const newY = currentY + dir.dy;

                // Проверка столкновений
                if (world && !world.canMoveTo(newX, newY)) {
                    if (i === 0) {
                        const error = 'Путь заблокирован!';
                        if (this.onError) this.onError(error);
                        reject(new Error(error));
                        return;
                    }
                    break;
                }

                moveSteps.push({ x: newX, y: newY });
                currentX = newX;
                currentY = newY;
            }

            if (moveSteps.length === 0) {
                resolve();
                return;
            }

            // Добавить шаги в очередь
            this.queueAction({
                type: 'move',
                steps: moveSteps,
                onComplete: () => {
                    this.energy -= moveSteps.length;
                    resolve();
                }
            });
        });
    }

    /**
     * Переместиться к координатам
     */
    moveTo(x, y, world) {
        return new Promise((resolve, reject) => {
            // Простой pathfinding: сначала по X, потом по Y
            const path = [];
            let currentX = this.x;
            let currentY = this.y;

            // Движение по X
            while (currentX !== x) {
                const nextX = currentX + (x > currentX ? 1 : -1);
                if (world && !world.canMoveTo(nextX, currentY)) {
                    const error = 'Путь заблокирован!';
                    if (this.onError) this.onError(error);
                    reject(new Error(error));
                    return;
                }
                currentX = nextX;
                path.push({ x: currentX, y: currentY });
            }

            // Движение по Y
            while (currentY !== y) {
                const nextY = currentY + (y > currentY ? 1 : -1);
                if (world && !world.canMoveTo(currentX, nextY)) {
                    const error = 'Путь заблокирован!';
                    if (this.onError) this.onError(error);
                    reject(new Error(error));
                    return;
                }
                currentY = nextY;
                path.push({ x: currentX, y: currentY });
            }

            if (path.length === 0) {
                resolve();
                return;
            }

            // Проверка энергии
            if (this.energy < path.length) {
                const error = 'Недостаточно энергии для такого пути!';
                if (this.onError) this.onError(error);
                reject(new Error(error));
                return;
            }

            this.queueAction({
                type: 'move',
                steps: path,
                onComplete: () => {
                    this.energy -= path.length;
                    resolve();
                }
            });
        });
    }

    /**
     * Прыжок
     */
    jump(direction = null, distance = 2, world) {
        return new Promise((resolve, reject) => {
            const dir = direction ? direction : this.direction;
            const directions = {
                'up': { dx: 0, dy: -distance },
                'down': { dx: 0, dy: distance },
                'left': { dx: -distance, dy: 0 },
                'right': { dx: distance, dy: 0 }
            };

            const offset = directions[dir];
            if (!offset) {
                reject(new Error('Неизвестное направление'));
                return;
            }

            const targetX = this.x + offset.dx;
            const targetY = this.y + offset.dy;

            // Проверка точки приземления
            if (world && !world.canMoveTo(targetX, targetY)) {
                const error = 'Невозможно приземлиться в эту точку!';
                if (this.onError) this.onError(error);
                reject(new Error(error));
                return;
            }

            // Проверка энергии (прыжок стоит больше)
            if (this.energy < distance * 2) {
                const error = 'Недостаточно энергии для прыжка!';
                if (this.onError) this.onError(error);
                reject(new Error(error));
                return;
            }

            this.queueAction({
                type: 'jump',
                targetX,
                targetY,
                onComplete: () => {
                    this.energy -= distance * 2;
                    resolve();
                }
            });
        });
    }

    /**
     * Собрать объект
     */
    collect(world) {
        return new Promise((resolve, reject) => {
            this.queueAction({
                type: 'collect',
                onComplete: (collected) => {
                    if (collected) {
                        this.crystals++;
                        AudioManager.play('collect');
                        resolve(collected);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    /**
     * Взаимодействие с объектом
     */
    interact(world) {
        return new Promise((resolve, reject) => {
            this.queueAction({
                type: 'interact',
                onComplete: (result) => {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Сказать (вывести сообщение)
     */
    say(message) {
        return new Promise((resolve) => {
            this.queueAction({
                type: 'say',
                message,
                onComplete: () => resolve()
            });
        });
    }

    /**
     * Ждать
     */
    wait(seconds) {
        return new Promise((resolve) => {
            this.queueAction({
                type: 'wait',
                duration: seconds * 1000,
                onComplete: () => resolve()
            });
        });
    }

    /**
     * Получить текущую позицию
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Получить направление
     */
    getDirection() {
        return this.direction;
    }

    /**
     * Получить энергию
     */
    getEnergy() {
        return this.energy;
    }

    /**
     * Добавить энергию
     */
    addEnergy(amount) {
        this.energy = Math.min(100, this.energy + amount);
    }

    /**
     * Обновление состояния
     */
    update(deltaTime, world) {
        // Если есть текущее действие, выполняем его
        if (this.currentAction) {
            this.processAction(deltaTime, world);
            return;
        }

        // Иначе берём следующее
        if (this.executeNextAction()) {
            this.processAction(deltaTime, world);
        }
    }

    /**
     * Обработка текущего действия
     */
    processAction(deltaTime, world) {
        if (!this.currentAction) return;

        const action = this.currentAction;

        switch (action.type) {
            case 'move':
                this.processMove(deltaTime, action, world);
                break;
            case 'jump':
                this.processJump(deltaTime, action, world);
                break;
            case 'collect':
                this.processCollect(action, world);
                break;
            case 'interact':
                this.processInteract(action, world);
                break;
            case 'say':
                this.processSay(action);
                break;
            case 'wait':
                this.processWait(deltaTime, action);
                break;
        }
    }

    /**
     * Обработка движения
     */
    processMove(deltaTime, action, world) {
        if (!action.currentStep) {
            action.currentStep = 0;
            action.progress = 0;
        }

        if (action.currentStep >= action.steps.length) {
            this.completeAction(action);
            return;
        }

        const target = action.steps[action.currentStep];
        const moveSpeed = this.speed * (deltaTime / 1000);

        // Интерполяция позиции
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < moveSpeed) {
            this.x = target.x;
            this.y = target.y;
            action.currentStep++;
            
            // Проверить сбор предметов на новой позиции
            if (world) {
                world.checkCollection(this.x, this.y);
            }
            
            AudioManager.play('move');
        } else {
            this.x += (dx / dist) * moveSpeed;
            this.y += (dy / dist) * moveSpeed;
        }

        // Обновить направление
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0) {
            this.direction = dy > 0 ? 'down' : 'up';
        }

        this.state = 'moving';
    }

    /**
     * Обработка прыжка
     */
    processJump(deltaTime, action, world) {
        if (!action.started) {
            action.started = true;
            action.progress = 0;
            action.duration = 500; // мс
            action.startX = this.x;
            action.startY = this.y;
        }

        action.progress += deltaTime;
        const t = Math.min(action.progress / action.duration, 1);
        
        // Параболическая траектория
        this.x = Utils.lerp(action.startX, action.targetX, t);
        this.y = Utils.lerp(action.startY, action.targetY, t) - Math.sin(t * Math.PI) * 1.5;
        
        this.state = 'jumping';

        if (t >= 1) {
            this.x = action.targetX;
            this.y = action.targetY;
            
            if (world) {
                world.checkCollection(this.x, this.y);
            }
            
            this.completeAction(action);
        }
    }

    /**
     * Обработка сбора
     */
    processCollect(action, world) {
        let collected = null;
        
        if (world) {
            const item = world.collectAt(Math.floor(this.x), Math.floor(this.y));
            if (item) {
                collected = item;
                if (item.type === 'crystal') {
                    this.crystals++;
                    Renderer.createCollectEffect(this.x, this.y);
                }
            }
        }

        action.collected = collected;
        this.completeAction(action, collected);
    }

    /**
     * Обработка взаимодействия
     */
    processInteract(action, world) {
        let result = null;
        
        if (world) {
            result = world.interactAt(Math.floor(this.x), Math.floor(this.y));
        }

        this.completeAction(action, result);
    }

    /**
     * Обработка речи
     */
    processSay(action) {
        if (!action.started) {
            action.started = true;
            action.duration = Math.max(1000, action.message.length * 50);
            action.elapsed = 0;
            
            // Показать сообщение
            Utils.emit('player-say', { message: action.message });
        }

        action.elapsed += 16; // примерно 60fps
        
        if (action.elapsed >= action.duration) {
            this.completeAction(action);
        }
    }

    /**
     * Обработка ожидания
     */
    processWait(deltaTime, action) {
        if (!action.elapsed) {
            action.elapsed = 0;
        }

        action.elapsed += deltaTime;

        if (action.elapsed >= action.duration) {
            this.completeAction(action);
        }
    }

    /**
     * Завершение действия
     */
    completeAction(action, result = null) {
        this.currentAction = null;
        this.state = 'idle';
        
        if (action.onComplete) {
            action.onComplete(result);
        }

        if (this.onActionComplete) {
            this.onActionComplete(action, result);
        }
    }
}

// Экспорт
window.Player = Player;
