/**
 * CodeWorld - Game Engine
 * Core game logic and rendering
 */

import { Hero } from './Hero.js';
import { World } from './World.js';
import { CodeSandbox } from '../sandbox/CodeSandbox.js';
import { LEVELS } from '../levels/LevelData.js';

export class GameEngine {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = null;
        this.overlay = document.getElementById('game-overlay');
        
        // Game state
        this.currentLevel = 1;
        this.isRunning = false;
        this.isPaused = false;
        this.executionQueue = [];
        
        // Game objects
        this.hero = null;
        this.world = null;
        this.sandbox = null;
        
        // Rendering
        this.tileSize = 32;
        this.animationFrame = null;
        this.lastTime = 0;
        
        // Level state
        this.levelComplete = false;
        this.levelFailed = false;
        this.moveCount = 0;
        this.codeLines = 0;
    }

    init() {
        this.ctx = this.canvas.getContext('2d');
        this.sandbox = new CodeSandbox(this);
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start render loop
        this.startRenderLoop();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 32;
        const maxHeight = container.clientHeight - 32;
        
        // Calculate size based on level dimensions
        const level = LEVELS[this.currentLevel];
        if (level) {
            const levelWidth = level.width * this.tileSize;
            const levelHeight = level.height * this.tileSize;
            
            // Scale to fit container while maintaining aspect ratio
            const scale = Math.min(maxWidth / levelWidth, maxHeight / levelHeight, 1);
            
            this.canvas.width = levelWidth;
            this.canvas.height = levelHeight;
            this.canvas.style.width = `${levelWidth * scale}px`;
            this.canvas.style.height = `${levelHeight * scale}px`;
        } else {
            this.canvas.width = 480;
            this.canvas.height = 320;
        }
    }

    loadLevel(levelNum) {
        const level = LEVELS[levelNum];
        if (!level) {
            console.error(`Level ${levelNum} not found`);
            return;
        }

        this.currentLevel = levelNum;
        this.levelComplete = false;
        this.levelFailed = false;
        this.moveCount = 0;
        this.codeLines = 0;
        
        // Create world
        this.world = new World(level, this.tileSize);
        
        // Create hero at start position
        this.hero = new Hero(
            level.heroStart.x,
            level.heroStart.y,
            this.tileSize
        );

        // Update UI
        document.getElementById('current-level').textContent = levelNum;
        document.getElementById('current-objective').textContent = level.objective;

        // Resize canvas for level
        this.resizeCanvas();
        
        console.log(`Level ${levelNum} loaded: ${level.name}`);
    }

    startRenderLoop() {
        const render = (timestamp) => {
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            this.animationFrame = requestAnimationFrame(render);
        };
        
        this.animationFrame = requestAnimationFrame(render);
    }

    update(deltaTime) {
        if (this.isPaused) return;
        
        // Update hero animations
        if (this.hero) {
            this.hero.update(deltaTime);
        }
        
        // Update world objects
        if (this.world) {
            this.world.update(deltaTime);
        }
        
        // Process execution queue
        this.processExecutionQueue();
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw world
        if (this.world) {
            this.world.render(this.ctx);
        }
        
        // Draw hero
        if (this.hero) {
            this.hero.render(this.ctx);
        }
        
        // Draw grid overlay (optional, for debugging)
        // this.drawGrid();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // Execute user code
    async executeUserCode(code, language) {
        this.isRunning = true;
        this.codeLines = code.split('\n').filter(l => l.trim()).length;
        
        // Reset level state before execution
        this.resetCurrentLevel();
        
        try {
            // Create sandbox API
            const api = this.createGameAPI();
            
            // Execute code in sandbox
            await this.sandbox.execute(code, language, api);
            
            // Wait for all queued actions to complete
            await this.waitForActions();
            
            // Check win condition
            if (this.checkWinCondition()) {
                this.levelComplete = true;
                const stats = this.calculateStats();
                this.app.onLevelComplete(stats);
            }
            
        } catch (error) {
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    createGameAPI() {
        const self = this;
        
        return {
            hero: {
                // Movement
                move: (direction) => self.queueAction('move', { direction }),
                moveUp: () => self.queueAction('move', { direction: 'up' }),
                moveDown: () => self.queueAction('move', { direction: 'down' }),
                moveLeft: () => self.queueAction('move', { direction: 'left' }),
                moveRight: () => self.queueAction('move', { direction: 'right' }),
                
                // Position-based movement
                walkTo: (x, y) => self.queueAction('walkTo', { x, y }),
                
                // Actions
                interact: (target) => self.queueAction('interact', { target }),
                collect: () => self.queueAction('collect', {}),
                push: (direction) => self.queueAction('push', { direction }),
                
                // State queries
                getX: () => self.hero.tileX,
                getY: () => self.hero.tileY,
                getPosition: () => ({ x: self.hero.tileX, y: self.hero.tileY }),
                canMove: (direction) => self.canHeroMove(direction),
                
                // Wait
                wait: (ms) => self.queueAction('wait', { ms })
            },
            
            world: {
                // Object queries
                getObjectAt: (x, y) => self.world.getObjectAt(x, y),
                hasWall: (x, y) => self.world.isWall(x, y),
                hasCollectible: (x, y) => self.world.hasCollectible(x, y),
                getGoalPosition: () => self.world.getGoalPosition(),
                
                // Level info
                getWidth: () => self.world.width,
                getHeight: () => self.world.height
            },
            
            // Console logging
            log: (message) => self.app.console.log(message, 'user'),
            print: (message) => self.app.console.log(message, 'user'),
            
            // Loops and iteration helpers
            repeat: (times, callback) => {
                for (let i = 0; i < times; i++) {
                    callback(i);
                }
            },
            
            // Math helpers
            Math: Math,
            
            // Wait function for synchronization
            wait: (ms) => self.queueAction('wait', { ms })
        };
    }

    queueAction(type, params) {
        return new Promise((resolve, reject) => {
            this.executionQueue.push({
                type,
                params,
                resolve,
                reject
            });
        });
    }

    async processExecutionQueue() {
        if (this.executionQueue.length === 0) return;
        if (this.hero && this.hero.isMoving) return;
        
        const action = this.executionQueue.shift();
        if (!action) return;
        
        try {
            await this.executeAction(action);
            action.resolve();
        } catch (error) {
            action.reject(error);
        }
    }

    async executeAction(action) {
        const { type, params } = action;
        
        switch (type) {
            case 'move':
                await this.moveHero(params.direction);
                break;
                
            case 'walkTo':
                await this.walkHeroTo(params.x, params.y);
                break;
                
            case 'interact':
                await this.heroInteract(params.target);
                break;
                
            case 'collect':
                await this.heroCollect();
                break;
                
            case 'push':
                await this.heroPush(params.direction);
                break;
                
            case 'wait':
                await this.delay(params.ms || 500);
                break;
        }
    }

    async moveHero(direction) {
        if (!this.hero || !this.world) return;
        
        const directions = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };
        
        const dir = directions[direction.toLowerCase()];
        if (!dir) {
            throw new Error(`Unknown direction: ${direction}`);
        }
        
        const newX = this.hero.tileX + dir.dx;
        const newY = this.hero.tileY + dir.dy;
        
        // Check if movement is valid
        if (this.world.isWall(newX, newY)) {
            // Hit wall - show game event
            this.showGameEvent('wall_hit', 'Путь заблокирован!');
            return;
        }
        
        // Move hero
        await this.hero.moveTo(newX, newY, direction);
        this.moveCount++;
        
        // Log movement
        this.app.console.log(`→ Персонаж двигается: ${direction}`, 'game-event');
        
        // Check for collectibles
        this.checkCollectibles();
        
        // Check for hazards
        this.checkHazards();
    }

    async walkHeroTo(x, y) {
        // Simple pathfinding - move one step at a time towards target
        while (this.hero.tileX !== x || this.hero.tileY !== y) {
            let moved = false;
            
            if (this.hero.tileX < x && this.canHeroMove('right')) {
                await this.moveHero('right');
                moved = true;
            } else if (this.hero.tileX > x && this.canHeroMove('left')) {
                await this.moveHero('left');
                moved = true;
            } else if (this.hero.tileY < y && this.canHeroMove('down')) {
                await this.moveHero('down');
                moved = true;
            } else if (this.hero.tileY > y && this.canHeroMove('up')) {
                await this.moveHero('up');
                moved = true;
            }
            
            if (!moved) {
                this.showGameEvent('path_blocked', 'Невозможно добраться до цели!');
                break;
            }
            
            await this.delay(100);
        }
    }

    canHeroMove(direction) {
        if (!this.hero || !this.world) return false;
        
        const directions = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };
        
        const dir = directions[direction.toLowerCase()];
        if (!dir) return false;
        
        const newX = this.hero.tileX + dir.dx;
        const newY = this.hero.tileY + dir.dy;
        
        return !this.world.isWall(newX, newY);
    }

    async heroInteract(target) {
        const obj = this.world.getObjectAt(this.hero.tileX, this.hero.tileY);
        
        if (obj && obj.type === target) {
            this.world.interact(this.hero.tileX, this.hero.tileY);
            this.app.console.log(`✦ Взаимодействие с: ${target}`, 'game-event');
        } else {
            this.showGameEvent('no_interact', `Здесь нет объекта: ${target}`);
        }
    }

    async heroCollect() {
        this.checkCollectibles();
    }

    async heroPush(direction) {
        // Push mechanic for puzzles
        const directions = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };
        
        const dir = directions[direction.toLowerCase()];
        if (!dir) return;
        
        const targetX = this.hero.tileX + dir.dx;
        const targetY = this.hero.tileY + dir.dy;
        
        const pushed = this.world.pushObject(targetX, targetY, dir.dx, dir.dy);
        if (pushed) {
            this.app.console.log(`◆ Объект сдвинут: ${direction}`, 'game-event');
        }
    }

    checkCollectibles() {
        const collected = this.world.collectAt(this.hero.tileX, this.hero.tileY);
        if (collected) {
            this.app.console.log(`★ Собрано: ${collected.name}`, 'success');
            this.showFloatingText('+1', this.hero.x, this.hero.y);
        }
    }

    checkHazards() {
        const hazard = this.world.getHazardAt(this.hero.tileX, this.hero.tileY);
        if (hazard) {
            this.levelFailed = true;
            this.showGameEvent('hazard', hazard.message || 'Опасность!');
        }
    }

    checkWinCondition() {
        if (!this.world || !this.hero) return false;
        
        const level = LEVELS[this.currentLevel];
        if (!level) return false;
        
        // Check if hero reached goal
        const goal = this.world.getGoalPosition();
        if (goal && this.hero.tileX === goal.x && this.hero.tileY === goal.y) {
            // Check if all required collectibles are collected
            if (level.requiredCollectibles) {
                return this.world.collectedCount >= level.requiredCollectibles;
            }
            return true;
        }
        
        return false;
    }

    calculateStats() {
        const level = LEVELS[this.currentLevel];
        
        // Calculate stars based on performance
        let stars = 1;
        if (this.moveCount <= level.perfectMoves) {
            stars = 3;
        } else if (this.moveCount <= level.goodMoves) {
            stars = 2;
        }
        
        return {
            moves: this.moveCount,
            codeLines: this.codeLines,
            stars: stars,
            time: Date.now() - this.levelStartTime
        };
    }

    async waitForActions() {
        while (this.executionQueue.length > 0 || (this.hero && this.hero.isMoving)) {
            await this.delay(50);
        }
    }

    showGameEvent(type, message) {
        // Create game-style event notification
        const eventDiv = document.createElement('div');
        eventDiv.className = `game-message ${type === 'hazard' ? 'error' : ''}`;
        eventDiv.innerHTML = `
            <div class="message-icon">${this.getEventIcon(type)}</div>
            <div class="message-title">${message}</div>
        `;
        
        this.overlay.innerHTML = '';
        this.overlay.appendChild(eventDiv);
        
        setTimeout(() => {
            eventDiv.remove();
        }, 2000);
    }

    getEventIcon(type) {
        const icons = {
            'wall_hit': '🧱',
            'path_blocked': '🚫',
            'no_interact': '❓',
            'hazard': '💀',
            'success': '🎉'
        };
        return icons[type] || '📢';
    }

    showErrorEvent(error) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'game-message error';
        eventDiv.innerHTML = `
            <div class="message-icon">⚠️</div>
            <div class="message-title">${error.title}</div>
            <div class="message-text">${error.message}</div>
        `;
        
        this.overlay.innerHTML = '';
        this.overlay.appendChild(eventDiv);
    }

    showFloatingText(text, x, y) {
        const floater = document.createElement('div');
        floater.className = 'floating-text';
        floater.textContent = text;
        floater.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: #00ff88;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            pointer-events: none;
            animation: floatUp 1s ease forwards;
        `;
        
        this.overlay.appendChild(floater);
        
        setTimeout(() => floater.remove(), 1000);
    }

    resetCurrentLevel() {
        this.loadLevel(this.currentLevel);
        this.executionQueue = [];
        this.overlay.innerHTML = '';
        this.levelStartTime = Date.now();
    }

    stopExecution() {
        this.executionQueue = [];
        this.isRunning = false;
        if (this.hero) {
            this.hero.stopMovement();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
