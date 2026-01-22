/**
 * CodeWorld - Player Controller
 * Player character with programmable actions
 */

const Player = {
    // Position (grid coordinates)
    x: 0,
    y: 0,
    
    // Target position for smooth movement
    targetX: 0,
    targetY: 0,
    
    // Movement
    speed: 0.1, // Grid units per frame
    moving: false,
    direction: 1, // 1 = right, -1 = left
    
    // Animation
    animFrame: 'idle',
    walkAnimator: null,
    
    // State
    inventory: [],
    points: 0,
    
    // Action queue
    actionQueue: [],
    currentAction: null,
    actionPromiseResolve: null,
    
    // Callbacks
    onCollect: null,
    onMove: null,
    onError: null,
    onComplete: null,

    /**
     * Initialize player
     */
    init(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.direction = 1;
        this.moving = false;
        this.inventory = [];
        this.points = 0;
        this.actionQueue = [];
        this.currentAction = null;
        
        // Create walk animator
        this.walkAnimator = Sprites.createAnimator(['walk1', 'walk2'], 6);
        
        return this;
    },

    /**
     * Update player state
     */
    update(deltaTime) {
        // Process action queue if not busy
        if (!this.currentAction && this.actionQueue.length > 0) {
            this.processNextAction();
        }
        
        // Smooth movement
        if (this.moving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.05) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                this.animFrame = 'idle';
                
                // Complete current action
                if (this.currentAction && this.currentAction.type === 'move') {
                    this.completeAction();
                }
            } else {
                const moveSpeed = this.speed * (deltaTime / 16);
                this.x += (dx / dist) * moveSpeed;
                this.y += (dy / dist) * moveSpeed;
                
                // Update walk animation
                this.animFrame = this.walkAnimator.update(deltaTime);
            }
        }
    },

    /**
     * Render player
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        const pixelX = this.x * World.tileSize - camera.x;
        const pixelY = this.y * World.tileSize - camera.y - 16; // Offset for sprite height
        
        Sprites.drawPlayer(ctx, pixelX, pixelY, this.animFrame, this.direction);
    },

    /**
     * Add action to queue
     */
    queueAction(action) {
        return new Promise((resolve, reject) => {
            this.actionQueue.push({
                ...action,
                resolve,
                reject
            });
        });
    },

    /**
     * Process next action in queue
     */
    processNextAction() {
        if (this.actionQueue.length === 0) return;
        
        this.currentAction = this.actionQueue.shift();
        
        switch (this.currentAction.type) {
            case 'move':
                this.executeMove(this.currentAction.direction);
                break;
            case 'collect':
                this.executeCollect();
                break;
            case 'interact':
                this.executeInteract();
                break;
            case 'wait':
                setTimeout(() => this.completeAction(), this.currentAction.duration);
                break;
            case 'say':
                this.executeSay(this.currentAction.message);
                break;
            default:
                this.completeAction();
        }
    },

    /**
     * Complete current action
     */
    completeAction() {
        if (this.currentAction) {
            this.currentAction.resolve(true);
            this.currentAction = null;
        }
    },

    /**
     * Fail current action
     */
    failAction(error) {
        if (this.currentAction) {
            this.currentAction.reject(error);
            this.currentAction = null;
        }
        
        if (this.onError) {
            this.onError(error);
        }
    },

    /**
     * Execute move action
     */
    executeMove(direction) {
        let newX = this.x;
        let newY = this.y;
        
        switch (direction) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                this.direction = -1;
                break;
            case 'right':
                newX += 1;
                this.direction = 1;
                break;
        }
        
        // Check if can move
        if (World.isWalkable(newX, newY)) {
            this.targetX = newX;
            this.targetY = newY;
            this.moving = true;
            
            if (this.onMove) {
                this.onMove(direction, newX, newY);
            }
        } else {
            // Can't move there
            this.failAction(`Невозможно двигаться ${direction}: путь заблокирован!`);
        }
    },

    /**
     * Execute collect action
     */
    executeCollect() {
        const obj = World.checkObjectCollision(this.x, this.y);
        
        if (obj) {
            World.collectObject(obj);
            this.inventory.push(obj.type);
            
            // Add points based on object type
            const pointValues = {
                gem: 100,
                coin: 50,
                key: 25
            };
            this.points += pointValues[obj.type] || 10;
            
            if (this.onCollect) {
                this.onCollect(obj);
            }
            
            this.completeAction();
        } else {
            this.failAction('Здесь нечего собирать!');
        }
    },

    /**
     * Execute interact action
     */
    executeInteract() {
        const npc = World.checkNPCCollision(this.x, this.y);
        
        if (npc) {
            npc.showMessage = true;
            
            setTimeout(() => {
                npc.showMessage = false;
                this.completeAction();
            }, 2000);
        } else {
            this.failAction('Рядом никого нет для взаимодействия!');
        }
    },

    /**
     * Execute say action
     */
    executeSay(message) {
        if (this.onSay) {
            this.onSay(message);
        }
        
        setTimeout(() => {
            this.completeAction();
        }, 1000);
    },

    /**
     * Clear action queue
     */
    clearActions() {
        // Reject all pending actions
        this.actionQueue.forEach(action => {
            action.reject('Выполнение прервано');
        });
        this.actionQueue = [];
        
        if (this.currentAction) {
            this.currentAction.reject('Выполнение прервано');
            this.currentAction = null;
        }
        
        this.moving = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.animFrame = 'idle';
    },

    /**
     * Check if player has item
     */
    hasItem(type) {
        return this.inventory.includes(type);
    },

    /**
     * Get player grid position
     */
    getPosition() {
        return {
            x: Math.round(this.x),
            y: Math.round(this.y)
        };
    },

    /**
     * Set player position directly
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    },

    /**
     * Check if player is busy
     */
    isBusy() {
        return this.moving || this.currentAction !== null || this.actionQueue.length > 0;
    },

    /**
     * Get inventory summary
     */
    getInventorySummary() {
        const summary = {};
        this.inventory.forEach(item => {
            summary[item] = (summary[item] || 0) + 1;
        });
        return summary;
    }
};

// Make it globally available
window.Player = Player;
