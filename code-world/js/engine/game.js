/**
 * CodeWorld - Game Engine
 * Main game loop and coordination
 */

const Game = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    // Game state
    running: false,
    paused: false,
    lastTime: 0,
    deltaTime: 0,
    
    // Current level
    currentLevel: null,
    levelCompleted: false,
    
    // Camera
    camera: {
        x: 0,
        y: 0,
        smoothing: 0.1
    },
    
    // Objectives
    objectives: [],
    
    // Event callbacks
    onLevelComplete: null,
    onObjectiveComplete: null,
    
    /**
     * Initialize game
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        return this;
    },

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = false;
        }
    },

    /**
     * Load level
     */
    loadLevel(levelData) {
        this.currentLevel = levelData;
        this.levelCompleted = false;
        
        // Initialize world
        World.init(levelData);
        
        // Initialize player
        Player.init(levelData.playerStart.x, levelData.playerStart.y);
        
        // Setup objectives
        this.objectives = Helpers.deepClone(levelData.objectives || []);
        
        // Setup player callbacks
        Player.onCollect = (obj) => this.onPlayerCollect(obj);
        Player.onMove = (dir, x, y) => this.onPlayerMove(dir, x, y);
        Player.onError = (error) => this.onPlayerError(error);
        
        // Center camera on player
        this.centerCameraOnPlayer(true);
        
        return this;
    },

    /**
     * Start game loop
     */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    },

    /**
     * Stop game loop
     */
    stop() {
        this.running = false;
    },

    /**
     * Pause game
     */
    pause() {
        this.paused = true;
    },

    /**
     * Resume game
     */
    resume() {
        this.paused = false;
    },

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.running) return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.paused) {
            this.update(this.deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    /**
     * Update game state
     */
    update(deltaTime) {
        // Update world
        World.update(deltaTime);
        
        // Update player
        Player.update(deltaTime);
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Check objectives
        this.checkObjectives();
    },

    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background
        this.drawGrid();
        
        // Render world
        World.render(this.ctx, this.camera);
        
        // Render player
        Player.render(this.ctx, this.camera);
        
        // Render UI overlay
        this.renderOverlay();
    },

    /**
     * Draw background grid
     */
    drawGrid() {
        const gridSize = 32;
        const offsetX = -this.camera.x % gridSize;
        const offsetY = -this.camera.y % gridSize;
        
        this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },

    /**
     * Render UI overlay
     */
    renderOverlay() {
        // Position indicator
        const pos = Player.getPosition();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 100, 24);
        this.ctx.fillStyle = '#00f5ff';
        this.ctx.font = '12px "JetBrains Mono"';
        this.ctx.fillText(`X: ${pos.x}  Y: ${pos.y}`, 18, 26);
        
        // Level completion overlay
        if (this.levelCompleted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('УРОВЕНЬ', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillText('ПРОЙДЕН!', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.textAlign = 'left';
        }
    },

    /**
     * Update camera position
     */
    updateCamera(deltaTime) {
        const targetX = Player.x * World.tileSize - this.canvas.width / 2 + World.tileSize / 2;
        const targetY = Player.y * World.tileSize - this.canvas.height / 2 + World.tileSize / 2;
        
        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
        
        // Clamp to world bounds
        const bounds = World.getBounds();
        this.camera.x = Helpers.clamp(this.camera.x, 0, Math.max(0, bounds.width - this.canvas.width));
        this.camera.y = Helpers.clamp(this.camera.y, 0, Math.max(0, bounds.height - this.canvas.height));
    },

    /**
     * Center camera on player instantly
     */
    centerCameraOnPlayer(instant = false) {
        const targetX = Player.x * World.tileSize - this.canvas.width / 2 + World.tileSize / 2;
        const targetY = Player.y * World.tileSize - this.canvas.height / 2 + World.tileSize / 2;
        
        if (instant) {
            this.camera.x = targetX;
            this.camera.y = targetY;
        }
    },

    /**
     * Check objectives completion
     */
    checkObjectives() {
        if (this.levelCompleted) return;
        
        let allComplete = true;
        
        this.objectives.forEach(objective => {
            if (objective.completed) return;
            
            let isComplete = false;
            
            switch (objective.type) {
                case 'collect':
                    const collected = Player.inventory.filter(i => i === objective.target).length;
                    isComplete = collected >= (objective.count || 1);
                    break;
                    
                case 'reach':
                    const pos = Player.getPosition();
                    isComplete = pos.x === objective.x && pos.y === objective.y;
                    break;
                    
                case 'collectAll':
                    isComplete = World.getRemainingObjects(objective.target) === 0;
                    break;
            }
            
            if (isComplete && !objective.completed) {
                objective.completed = true;
                if (this.onObjectiveComplete) {
                    this.onObjectiveComplete(objective);
                }
            }
            
            if (!objective.completed) {
                allComplete = false;
            }
        });
        
        // Check level completion
        if (allComplete && this.objectives.length > 0) {
            this.completeLevel();
        }
    },

    /**
     * Complete current level
     */
    completeLevel() {
        if (this.levelCompleted) return;
        
        this.levelCompleted = true;
        
        // Create celebration particles
        World.createParticleBurst(
            Player.x * World.tileSize + 16,
            Player.y * World.tileSize,
            30,
            ['#00ff88', '#ffff00', '#00f5ff', '#ff00ff']
        );
        
        if (this.onLevelComplete) {
            this.onLevelComplete(this.currentLevel, Player.points);
        }
    },

    /**
     * Player collected object callback
     */
    onPlayerCollect(obj) {
        // Update UI points
        document.getElementById('user-points').textContent = Player.points;
    },

    /**
     * Player moved callback
     */
    onPlayerMove(direction, x, y) {
        // Could add step sound here
    },

    /**
     * Player error callback
     */
    onPlayerError(error) {
        // Handled by executor
    },

    /**
     * Reset current level
     */
    reset() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel);
        }
    },

    /**
     * Get game state for saving
     */
    getState() {
        return {
            playerPosition: Player.getPosition(),
            playerInventory: [...Player.inventory],
            playerPoints: Player.points,
            objectives: Helpers.deepClone(this.objectives),
            levelCompleted: this.levelCompleted
        };
    }
};

// Make it globally available
window.Game = Game;
