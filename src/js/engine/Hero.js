/**
 * CodeWorld - Hero Character
 * Player character with pixel art rendering and animations
 */

export class Hero {
    constructor(tileX, tileY, tileSize) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.tileSize = tileSize;
        
        // Pixel position (for smooth movement)
        this.x = tileX * tileSize;
        this.y = tileY * tileSize;
        
        // Target position for movement
        this.targetX = this.x;
        this.targetY = this.y;
        
        // Movement state
        this.isMoving = false;
        this.moveSpeed = 4; // pixels per frame
        this.direction = 'down';
        
        // Animation state
        this.animFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 150; // ms per frame
        this.idleTimer = 0;
        
        // Colors for pixel art
        this.colors = {
            body: '#00ffff',
            bodyDark: '#00cccc',
            eyes: '#ffffff',
            outline: '#005555'
        };
        
        // Movement promise resolve
        this.moveResolve = null;
    }

    async moveTo(newTileX, newTileY, direction) {
        return new Promise((resolve) => {
            this.tileX = newTileX;
            this.tileY = newTileY;
            this.targetX = newTileX * this.tileSize;
            this.targetY = newTileY * this.tileSize;
            this.direction = direction;
            this.isMoving = true;
            this.moveResolve = resolve;
        });
    }

    update(deltaTime) {
        // Update animation timer
        this.animTimer += deltaTime;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
        
        // Update idle animation
        this.idleTimer += deltaTime;
        
        // Smooth movement towards target
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.moveSpeed) {
                // Arrived at target
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
                
                if (this.moveResolve) {
                    this.moveResolve();
                    this.moveResolve = null;
                }
            } else {
                // Move towards target
                this.x += (dx / distance) * this.moveSpeed;
                this.y += (dy / distance) * this.moveSpeed;
            }
        }
    }

    render(ctx) {
        const x = this.x;
        const y = this.y;
        const size = this.tileSize;
        
        // Apply idle bob animation
        const bobOffset = this.isMoving ? 0 : Math.sin(this.idleTimer / 300) * 2;
        
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2 + bobOffset);
        
        // Draw shadow
        this.drawShadow(ctx);
        
        // Draw body based on direction
        switch (this.direction) {
            case 'up':
                this.drawBack(ctx);
                break;
            case 'down':
                this.drawFront(ctx);
                break;
            case 'left':
                this.drawSide(ctx, true);
                break;
            case 'right':
                this.drawSide(ctx, false);
                break;
            default:
                this.drawFront(ctx);
        }
        
        ctx.restore();
    }

    drawShadow(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, this.tileSize / 2 - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFront(ctx) {
        const s = this.tileSize;
        const p = 2; // pixel size
        
        // Body outline
        ctx.fillStyle = this.colors.outline;
        this.fillPixelRect(ctx, -8, -8, 16, 20, p);
        
        // Body fill
        ctx.fillStyle = this.colors.body;
        this.fillPixelRect(ctx, -6, -6, 12, 16, p);
        
        // Head highlight
        ctx.fillStyle = this.colors.bodyDark;
        this.fillPixelRect(ctx, -4, -4, 8, 6, p);
        
        // Eyes
        ctx.fillStyle = this.colors.eyes;
        const eyeY = -2;
        const eyeOffset = this.isMoving ? Math.floor(this.animFrame / 2) : 0;
        this.fillPixelRect(ctx, -4 + eyeOffset, eyeY, 2, 2, p);
        this.fillPixelRect(ctx, 2 + eyeOffset, eyeY, 2, 2, p);
        
        // Walking animation - legs
        if (this.isMoving) {
            const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 2;
            ctx.fillStyle = this.colors.bodyDark;
            this.fillPixelRect(ctx, -4, 10, 2, 4 + legOffset, p);
            this.fillPixelRect(ctx, 2, 10, 2, 4 - legOffset, p);
        } else {
            ctx.fillStyle = this.colors.bodyDark;
            this.fillPixelRect(ctx, -4, 10, 2, 4, p);
            this.fillPixelRect(ctx, 2, 10, 2, 4, p);
        }
        
        // Glow effect
        this.drawGlow(ctx);
    }

    drawBack(ctx) {
        const p = 2;
        
        // Body outline
        ctx.fillStyle = this.colors.outline;
        this.fillPixelRect(ctx, -8, -8, 16, 20, p);
        
        // Body fill
        ctx.fillStyle = this.colors.bodyDark;
        this.fillPixelRect(ctx, -6, -6, 12, 16, p);
        
        // Back detail
        ctx.fillStyle = this.colors.body;
        this.fillPixelRect(ctx, -4, -4, 8, 4, p);
        
        // Walking legs
        if (this.isMoving) {
            const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 2;
            ctx.fillStyle = this.colors.outline;
            this.fillPixelRect(ctx, -4, 10, 2, 4 + legOffset, p);
            this.fillPixelRect(ctx, 2, 10, 2, 4 - legOffset, p);
        } else {
            ctx.fillStyle = this.colors.outline;
            this.fillPixelRect(ctx, -4, 10, 2, 4, p);
            this.fillPixelRect(ctx, 2, 10, 2, 4, p);
        }
        
        this.drawGlow(ctx);
    }

    drawSide(ctx, isLeft) {
        const p = 2;
        const flip = isLeft ? -1 : 1;
        
        // Body outline
        ctx.fillStyle = this.colors.outline;
        this.fillPixelRect(ctx, -6 * flip, -8, 12, 20, p);
        
        // Body fill
        ctx.fillStyle = this.colors.body;
        this.fillPixelRect(ctx, -4 * flip, -6, 8, 16, p);
        
        // Face
        ctx.fillStyle = this.colors.bodyDark;
        this.fillPixelRect(ctx, -2 * flip, -4, 4, 6, p);
        
        // Eye
        ctx.fillStyle = this.colors.eyes;
        this.fillPixelRect(ctx, 2 * flip, -2, 2, 2, p);
        
        // Walking legs
        if (this.isMoving) {
            const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 3;
            ctx.fillStyle = this.colors.bodyDark;
            this.fillPixelRect(ctx, -2 * flip + legOffset, 10, 2, 4, p);
            this.fillPixelRect(ctx, 2 * flip - legOffset, 10, 2, 4, p);
        } else {
            ctx.fillStyle = this.colors.bodyDark;
            this.fillPixelRect(ctx, 0, 10, 2, 4, p);
        }
        
        this.drawGlow(ctx);
    }

    drawGlow(ctx) {
        // Soft glow around character
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    fillPixelRect(ctx, x, y, width, height, pixelSize = 2) {
        ctx.fillRect(
            Math.floor(x / pixelSize) * pixelSize,
            Math.floor(y / pixelSize) * pixelSize,
            Math.ceil(width / pixelSize) * pixelSize,
            Math.ceil(height / pixelSize) * pixelSize
        );
    }

    stopMovement() {
        this.isMoving = false;
        this.x = this.tileX * this.tileSize;
        this.y = this.tileY * this.tileSize;
        this.targetX = this.x;
        this.targetY = this.y;
        
        if (this.moveResolve) {
            this.moveResolve();
            this.moveResolve = null;
        }
    }
}
