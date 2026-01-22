/**
 * CodeWorld - World Engine
 * Handles the game world, tiles, and objects
 */

const World = {
    // Grid settings
    tileSize: 32,
    width: 0,
    height: 0,
    
    // World data
    tiles: [],
    objects: [],
    npcs: [],
    
    // Particle system
    particles: [],
    
    /**
     * Initialize world from level data
     */
    init(levelData) {
        this.width = levelData.width;
        this.height = levelData.height;
        this.tiles = Helpers.deepClone(levelData.tiles);
        this.objects = Helpers.deepClone(levelData.objects || []);
        this.npcs = Helpers.deepClone(levelData.npcs || []);
        this.particles = [];
        
        // Initialize object states
        this.objects.forEach(obj => {
            obj.collected = false;
            obj.animFrame = 0;
            obj.animTimer = 0;
        });
        
        return this;
    },

    /**
     * Update world state
     */
    update(deltaTime) {
        // Update object animations
        this.objects.forEach(obj => {
            if (!obj.collected) {
                obj.animTimer += deltaTime;
                if (obj.animTimer >= 200) {
                    obj.animFrame = (obj.animFrame + 1) % 2;
                    obj.animTimer = 0;
                }
            }
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.vy += particle.gravity * deltaTime / 16;
            return particle.life > 0;
        });
    },

    /**
     * Render world to canvas
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        const startCol = Math.floor(camera.x / this.tileSize);
        const startRow = Math.floor(camera.y / this.tileSize);
        const endCol = Math.ceil((camera.x + ctx.canvas.width) / this.tileSize);
        const endRow = Math.ceil((camera.y + ctx.canvas.height) / this.tileSize);
        
        // Draw tiles
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row >= 0 && row < this.tiles.length && 
                    col >= 0 && col < this.tiles[row].length) {
                    const tile = this.tiles[row][col];
                    const x = col * this.tileSize - camera.x;
                    const y = row * this.tileSize - camera.y;
                    
                    this.renderTile(ctx, tile, x, y);
                }
            }
        }
        
        // Draw objects
        this.objects.forEach(obj => {
            if (!obj.collected) {
                const x = obj.x * this.tileSize - camera.x;
                const y = obj.y * this.tileSize - camera.y;
                
                // Float animation for collectibles
                const floatOffset = Math.sin(Date.now() / 300 + obj.x) * 3;
                
                Sprites.drawObject(ctx, obj.type, x, y - floatOffset, obj.animFrame);
            }
        });
        
        // Draw NPCs
        this.npcs.forEach(npc => {
            const x = npc.x * this.tileSize - camera.x;
            const y = npc.y * this.tileSize - camera.y;
            
            Sprites.drawObject(ctx, 'npc', x, y - 16);
            
            // Draw speech bubble if has message
            if (npc.showMessage) {
                this.renderSpeechBubble(ctx, npc.message, x, y - 50);
            }
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / particle.maxLife;
            ctx.fillRect(
                particle.x - camera.x,
                particle.y - camera.y,
                particle.size,
                particle.size
            );
        });
        ctx.globalAlpha = 1;
    },

    /**
     * Render single tile
     */
    renderTile(ctx, tile, x, y) {
        switch (tile) {
            case 0: // Empty/void
                ctx.fillStyle = '#0a0a0f';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
                break;
            case 1: // Ground
                Sprites.drawTile(ctx, 'ground', x, y);
                break;
            case 2: // Wall
                Sprites.drawObject(ctx, 'wall', x, y);
                break;
            case 3: // Grass
                Sprites.drawTile(ctx, 'grass', x, y);
                break;
            case 4: // Water
                Sprites.drawTile(ctx, 'water', x, y);
                break;
            default:
                ctx.fillStyle = '#13131f';
                ctx.fillRect(x, y, this.tileSize, this.tileSize);
        }
    },

    /**
     * Render speech bubble
     */
    renderSpeechBubble(ctx, text, x, y) {
        const padding = 10;
        const fontSize = 12;
        
        ctx.font = `${fontSize}px 'JetBrains Mono'`;
        const textWidth = ctx.measureText(text).width;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = fontSize + padding * 2;
        
        // Bubble background
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight, bubbleWidth, bubbleHeight, 4);
        ctx.fill();
        ctx.stroke();
        
        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x + 5, y);
        ctx.fill();
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y - padding - 2);
    },

    /**
     * Check if position is walkable
     */
    isWalkable(x, y) {
        const col = Math.floor(x);
        const row = Math.floor(y);
        
        if (row < 0 || row >= this.tiles.length || 
            col < 0 || col >= this.tiles[0].length) {
            return false;
        }
        
        const tile = this.tiles[row][col];
        // 0 = void, 2 = wall, 4 = water (not walkable)
        return tile !== 0 && tile !== 2 && tile !== 4;
    },

    /**
     * Check for object collision
     */
    checkObjectCollision(x, y) {
        for (const obj of this.objects) {
            if (!obj.collected && 
                Math.abs(obj.x - x) < 0.5 && 
                Math.abs(obj.y - y) < 0.5) {
                return obj;
            }
        }
        return null;
    },

    /**
     * Collect object
     */
    collectObject(obj) {
        obj.collected = true;
        
        // Create particles
        this.createCollectParticles(obj.x * this.tileSize + 16, obj.y * this.tileSize + 16, obj.type);
        
        return obj;
    },

    /**
     * Check NPC collision
     */
    checkNPCCollision(x, y) {
        for (const npc of this.npcs) {
            if (Math.abs(npc.x - x) < 1 && Math.abs(npc.y - y) < 1) {
                return npc;
            }
        }
        return null;
    },

    /**
     * Create particle effect
     */
    createCollectParticles(x, y, type) {
        const colors = {
            gem: ['#00f5ff', '#00a5b0', '#ffffff'],
            coin: ['#ffff00', '#ff8800', '#ffffff'],
            key: ['#ffff00', '#ff8800'],
            default: ['#00f5ff', '#ff00ff', '#9d00ff']
        };
        
        const particleColors = colors[type] || colors.default;
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Helpers.randomFloat(-3, 3),
                vy: Helpers.randomFloat(-5, -1),
                gravity: 0.2,
                size: Helpers.randomInt(2, 5),
                color: Helpers.randomPick(particleColors),
                life: Helpers.randomFloat(500, 1000),
                maxLife: 1000
            });
        }
    },

    /**
     * Create custom particle burst
     */
    createParticleBurst(x, y, count = 20, colors = ['#00f5ff']) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Helpers.randomFloat(2, 5);
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
                size: Helpers.randomInt(2, 4),
                color: Helpers.randomPick(colors),
                life: Helpers.randomFloat(400, 800),
                maxLife: 800
            });
        }
    },

    /**
     * Get world bounds in pixels
     */
    getBounds() {
        return {
            width: this.width * this.tileSize,
            height: this.height * this.tileSize
        };
    },

    /**
     * Convert pixel position to grid position
     */
    pixelToGrid(x, y) {
        return {
            x: Math.floor(x / this.tileSize),
            y: Math.floor(y / this.tileSize)
        };
    },

    /**
     * Convert grid position to pixel position
     */
    gridToPixel(x, y) {
        return {
            x: x * this.tileSize,
            y: y * this.tileSize
        };
    },

    /**
     * Get uncollected objects count
     */
    getRemainingObjects(type = null) {
        return this.objects.filter(obj => 
            !obj.collected && (type === null || obj.type === type)
        ).length;
    },

    /**
     * Place new object
     */
    placeObject(x, y, type) {
        this.objects.push({
            x: x,
            y: y,
            type: type,
            collected: false,
            animFrame: 0,
            animTimer: 0
        });
    },

    /**
     * Modify tile
     */
    setTile(x, y, type) {
        if (y >= 0 && y < this.tiles.length && x >= 0 && x < this.tiles[0].length) {
            this.tiles[y][x] = type;
        }
    },

    /**
     * Get tile at position
     */
    getTile(x, y) {
        if (y >= 0 && y < this.tiles.length && x >= 0 && x < this.tiles[0].length) {
            return this.tiles[y][x];
        }
        return -1;
    }
};

// Make it globally available
window.World = World;
