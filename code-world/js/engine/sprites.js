/**
 * CodeWorld - Sprite System
 * Pixel art sprites and animations
 */

const Sprites = {
    // Pixel scale multiplier
    scale: 4,
    
    // Color palette
    colors: {
        transparent: 'transparent',
        black: '#0a0a0f',
        darkGray: '#13131f',
        gray: '#606070',
        lightGray: '#a0a0b0',
        white: '#ffffff',
        cyan: '#00f5ff',
        darkCyan: '#00a5b0',
        pink: '#ff00ff',
        purple: '#9d00ff',
        green: '#00ff88',
        yellow: '#ffff00',
        orange: '#ff8800',
        red: '#ff0044',
        blue: '#0066ff'
    },

    /**
     * Player sprite data (8x12 pixels)
     * 0 = transparent, 1-9 = colors
     */
    player: {
        idle: [
            [0,0,1,1,1,1,0,0],
            [0,1,2,2,2,2,1,0],
            [0,1,3,2,2,3,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,4,1,1,4,1,1],
            [0,1,4,1,1,4,1,0],
            [0,0,4,4,4,4,0,0],
            [0,0,4,0,0,4,0,0],
            [0,0,1,0,0,1,0,0],
            [0,1,1,0,0,1,1,0]
        ],
        walk1: [
            [0,0,1,1,1,1,0,0],
            [0,1,2,2,2,2,1,0],
            [0,1,3,2,2,3,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,4,1,1,4,1,1],
            [0,1,4,1,1,4,1,0],
            [0,0,4,4,4,4,0,0],
            [0,1,1,0,0,4,0,0],
            [1,1,0,0,0,1,0,0],
            [0,0,0,0,1,1,0,0]
        ],
        walk2: [
            [0,0,1,1,1,1,0,0],
            [0,1,2,2,2,2,1,0],
            [0,1,3,2,2,3,1,0],
            [0,0,1,1,1,1,0,0],
            [0,0,0,1,1,0,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,4,1,1,4,1,1],
            [0,1,4,1,1,4,1,0],
            [0,0,4,4,4,4,0,0],
            [0,0,4,0,0,1,1,0],
            [0,0,1,0,0,0,1,1],
            [0,0,1,1,0,0,0,0]
        ],
        colorMap: {
            1: 'cyan',      // Outline/glow
            2: 'pink',      // Skin/face
            3: 'white',     // Eyes
            4: 'purple'     // Clothes
        }
    },

    /**
     * Object sprites
     */
    objects: {
        gem: {
            frames: [
                [
                    [0,0,1,1,0,0],
                    [0,1,2,2,1,0],
                    [1,2,3,2,2,1],
                    [1,2,2,2,2,1],
                    [0,1,2,2,1,0],
                    [0,0,1,1,0,0]
                ],
                [
                    [0,0,1,1,0,0],
                    [0,1,3,2,1,0],
                    [1,3,3,2,2,1],
                    [1,2,2,2,2,1],
                    [0,1,2,2,1,0],
                    [0,0,1,1,0,0]
                ]
            ],
            colorMap: {
                1: 'darkCyan',
                2: 'cyan',
                3: 'white'
            }
        },
        flag: {
            frames: [
                [
                    [0,1,1,1,1,0],
                    [0,1,2,2,1,0],
                    [0,1,2,2,1,0],
                    [0,1,1,1,1,0],
                    [0,0,3,0,0,0],
                    [0,0,3,0,0,0],
                    [0,0,3,0,0,0],
                    [0,0,3,0,0,0]
                ]
            ],
            colorMap: {
                1: 'green',
                2: 'yellow',
                3: 'gray'
            }
        },
        coin: {
            frames: [
                [
                    [0,1,1,0],
                    [1,2,2,1],
                    [1,2,2,1],
                    [0,1,1,0]
                ],
                [
                    [0,1,1,0],
                    [1,3,2,1],
                    [1,2,3,1],
                    [0,1,1,0]
                ]
            ],
            colorMap: {
                1: 'orange',
                2: 'yellow',
                3: 'white'
            }
        },
        wall: {
            frames: [
                [
                    [1,1,1,1,1,1,1,1],
                    [1,2,2,1,2,2,2,1],
                    [1,2,2,1,2,2,2,1],
                    [1,1,1,1,1,1,1,1],
                    [1,2,2,2,1,2,2,1],
                    [1,2,2,2,1,2,2,1],
                    [1,1,1,1,1,1,1,1],
                    [1,2,2,1,2,2,2,1]
                ]
            ],
            colorMap: {
                1: 'gray',
                2: 'darkGray'
            }
        },
        door: {
            frames: [
                [
                    [1,1,1,1,1,1],
                    [1,2,2,2,2,1],
                    [1,2,3,2,2,1],
                    [1,2,2,2,2,1],
                    [1,2,2,2,2,1],
                    [1,2,4,2,2,1],
                    [1,2,2,2,2,1],
                    [1,1,1,1,1,1]
                ]
            ],
            colorMap: {
                1: 'purple',
                2: 'darkGray',
                3: 'cyan',
                4: 'yellow'
            }
        },
        key: {
            frames: [
                [
                    [0,1,1,1,0],
                    [1,2,2,2,1],
                    [0,1,1,1,0],
                    [0,0,2,0,0],
                    [0,0,2,0,0],
                    [0,0,2,1,0]
                ]
            ],
            colorMap: {
                1: 'orange',
                2: 'yellow'
            }
        },
        terminal: {
            frames: [
                [
                    [1,1,1,1,1,1,1,1],
                    [1,2,2,2,2,2,2,1],
                    [1,2,3,3,3,2,2,1],
                    [1,2,2,2,2,2,2,1],
                    [1,2,3,3,2,2,2,1],
                    [1,2,2,2,2,2,2,1],
                    [1,1,1,1,1,1,1,1],
                    [0,0,4,4,4,4,0,0]
                ]
            ],
            colorMap: {
                1: 'gray',
                2: 'black',
                3: 'green',
                4: 'darkGray'
            }
        },
        npc: {
            frames: [
                [
                    [0,0,1,1,1,1,0,0],
                    [0,1,5,5,5,5,1,0],
                    [0,1,2,5,5,2,1,0],
                    [0,0,1,1,1,1,0,0],
                    [0,0,0,1,1,0,0,0],
                    [0,1,1,1,1,1,1,0],
                    [1,1,3,1,1,3,1,1],
                    [0,1,3,1,1,3,1,0],
                    [0,0,3,3,3,3,0,0],
                    [0,0,3,0,0,3,0,0],
                    [0,0,1,0,0,1,0,0],
                    [0,1,1,0,0,1,1,0]
                ]
            ],
            colorMap: {
                1: 'green',
                2: 'white',
                3: 'darkGray',
                5: 'yellow'
            }
        }
    },

    /**
     * Tile sprites for world
     */
    tiles: {
        ground: {
            data: [
                [1,1,1,1,1,1,1,1],
                [1,2,2,2,2,2,2,1],
                [1,2,1,2,2,1,2,1],
                [1,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,1],
                [1,2,1,2,2,1,2,1],
                [1,2,2,2,2,2,2,1],
                [1,1,1,1,1,1,1,1]
            ],
            colorMap: {
                1: 'darkGray',
                2: 'black'
            }
        },
        grass: {
            data: [
                [0,0,3,0,0,3,0,0],
                [0,3,3,0,3,3,0,0],
                [1,1,1,1,1,1,1,1],
                [1,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,1],
                [1,1,1,1,1,1,1,1]
            ],
            colorMap: {
                1: 'darkGray',
                2: 'black',
                3: 'green'
            }
        },
        water: {
            data: [
                [1,1,2,1,1,2,1,1],
                [1,2,2,1,2,2,1,1],
                [2,2,1,1,2,1,1,2],
                [2,1,1,2,2,1,2,2],
                [1,1,2,2,1,1,2,1],
                [1,2,2,1,1,2,2,1],
                [2,2,1,1,2,2,1,2],
                [1,1,1,2,2,1,1,1]
            ],
            colorMap: {
                1: 'blue',
                2: 'cyan'
            }
        }
    },

    /**
     * Draw a sprite to canvas context
     */
    draw(ctx, spriteData, colorMap, x, y, scale = this.scale) {
        for (let row = 0; row < spriteData.length; row++) {
            for (let col = 0; col < spriteData[row].length; col++) {
                const pixel = spriteData[row][col];
                if (pixel !== 0) {
                    const colorKey = colorMap[pixel];
                    ctx.fillStyle = this.colors[colorKey] || colorKey;
                    ctx.fillRect(
                        x + col * scale,
                        y + row * scale,
                        scale,
                        scale
                    );
                }
            }
        }
    },

    /**
     * Draw player sprite
     */
    drawPlayer(ctx, x, y, frame = 'idle', direction = 1, scale = this.scale) {
        const sprite = this.player[frame] || this.player.idle;
        
        ctx.save();
        
        if (direction === -1) {
            ctx.translate(x + sprite[0].length * scale, y);
            ctx.scale(-1, 1);
            x = 0;
            y = 0;
        }
        
        // Draw glow effect
        ctx.shadowColor = this.colors.cyan;
        ctx.shadowBlur = 10;
        
        this.draw(ctx, sprite, this.player.colorMap, x, y, scale);
        
        ctx.restore();
    },

    /**
     * Draw object sprite
     */
    drawObject(ctx, type, x, y, frameIndex = 0, scale = this.scale) {
        const obj = this.objects[type];
        if (!obj) return;
        
        const frame = obj.frames[frameIndex % obj.frames.length];
        this.draw(ctx, frame, obj.colorMap, x, y, scale);
    },

    /**
     * Draw tile
     */
    drawTile(ctx, type, x, y, scale = this.scale) {
        const tile = this.tiles[type];
        if (!tile) return;
        
        this.draw(ctx, tile.data, tile.colorMap, x, y, scale);
    },

    /**
     * Create animated sprite controller
     */
    createAnimator(frames, frameRate = 8) {
        return {
            frames,
            frameRate,
            currentFrame: 0,
            elapsed: 0,
            
            update(deltaTime) {
                this.elapsed += deltaTime;
                const frameDuration = 1000 / this.frameRate;
                
                if (this.elapsed >= frameDuration) {
                    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
                    this.elapsed = 0;
                }
                
                return this.frames[this.currentFrame];
            },
            
            reset() {
                this.currentFrame = 0;
                this.elapsed = 0;
            }
        };
    },

    /**
     * Get sprite dimensions
     */
    getSpriteDimensions(spriteData, scale = this.scale) {
        return {
            width: spriteData[0].length * scale,
            height: spriteData.length * scale
        };
    }
};

// Make it globally available
window.Sprites = Sprites;
