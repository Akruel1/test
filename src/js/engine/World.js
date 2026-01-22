/**
 * CodeWorld - World/Level Manager
 * Handles tile rendering, objects, and interactions
 */

export class World {
    constructor(levelData, tileSize) {
        this.tileSize = tileSize;
        this.width = levelData.width;
        this.height = levelData.height;
        this.tiles = levelData.tiles;
        this.objects = JSON.parse(JSON.stringify(levelData.objects || []));
        this.collectibles = JSON.parse(JSON.stringify(levelData.collectibles || []));
        this.hazards = levelData.hazards || [];
        this.goal = levelData.goal;
        
        this.collectedCount = 0;
        this.animTimer = 0;
        
        // Tile colors
        this.colors = {
            floor: '#1a1a25',
            floorAlt: '#15151f',
            wall: '#2a2a3a',
            wallTop: '#3a3a4a',
            wallSide: '#222230',
            goal: '#00ff88',
            hazard: '#ff3366',
            collectible: '#ffff00'
        };
    }

    update(deltaTime) {
        this.animTimer += deltaTime;
        
        // Update object animations
        this.objects.forEach(obj => {
            if (obj.animate) {
                obj.animFrame = Math.floor(this.animTimer / 200) % 4;
            }
        });
    }

    render(ctx) {
        // Draw floor tiles
        this.renderFloor(ctx);
        
        // Draw walls
        this.renderWalls(ctx);
        
        // Draw goal
        this.renderGoal(ctx);
        
        // Draw collectibles
        this.renderCollectibles(ctx);
        
        // Draw hazards
        this.renderHazards(ctx);
        
        // Draw objects
        this.renderObjects(ctx);
    }

    renderFloor(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                
                if (tile !== 1) { // Not a wall
                    // Checkerboard pattern
                    ctx.fillStyle = (x + y) % 2 === 0 ? this.colors.floor : this.colors.floorAlt;
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                    
                    // Grid lines
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
                    ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }

    renderWalls(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                
                if (tile === 1) {
                    this.drawWall(ctx, x, y);
                }
            }
        }
    }

    drawWall(ctx, tileX, tileY) {
        const x = tileX * this.tileSize;
        const y = tileY * this.tileSize;
        const s = this.tileSize;
        
        // Wall base
        ctx.fillStyle = this.colors.wall;
        ctx.fillRect(x, y, s, s);
        
        // Wall top highlight
        ctx.fillStyle = this.colors.wallTop;
        ctx.fillRect(x, y, s, s / 4);
        
        // Wall side shadow
        ctx.fillStyle = this.colors.wallSide;
        ctx.fillRect(x, y + s * 0.75, s, s / 4);
        
        // Pixel detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x + 4, y + 4, 4, 4);
        ctx.fillRect(x + s - 8, y + 4, 4, 4);
        
        // Border
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.strokeRect(x, y, s, s);
    }

    renderGoal(ctx) {
        if (!this.goal) return;
        
        const x = this.goal.x * this.tileSize;
        const y = this.goal.y * this.tileSize;
        const s = this.tileSize;
        
        // Glowing effect
        const pulseSize = Math.sin(this.animTimer / 300) * 4;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
            x + s/2, y + s/2, 0,
            x + s/2, y + s/2, s/2 + pulseSize
        );
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2 + pulseSize + 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Goal tile
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
        
        // Goal border
        ctx.strokeStyle = this.colors.goal;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
        
        // Inner decoration
        ctx.fillStyle = this.colors.goal;
        ctx.fillRect(x + s/2 - 4, y + s/2 - 4, 8, 8);
        
        // Arrow/door icon
        ctx.beginPath();
        ctx.moveTo(x + s/2, y + 8);
        ctx.lineTo(x + s/2 + 6, y + 14);
        ctx.lineTo(x + s/2 - 6, y + 14);
        ctx.closePath();
        ctx.fill();
        
        ctx.lineWidth = 1;
    }

    renderCollectibles(ctx) {
        this.collectibles.forEach(item => {
            if (item.collected) return;
            
            const x = item.x * this.tileSize;
            const y = item.y * this.tileSize;
            const s = this.tileSize;
            
            // Floating animation
            const floatY = Math.sin(this.animTimer / 200 + item.x) * 3;
            
            // Glow
            const gradient = ctx.createRadialGradient(
                x + s/2, y + s/2 + floatY, 0,
                x + s/2, y + s/2 + floatY, 15
            );
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + s/2, y + s/2 + floatY, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Star/coin shape
            this.drawStar(ctx, x + s/2, y + s/2 + floatY, 8, 5, 0.5);
        });
    }

    drawStar(ctx, cx, cy, outerRadius, points, innerRadiusRatio) {
        const innerRadius = outerRadius * innerRadiusRatio;
        
        ctx.beginPath();
        ctx.fillStyle = this.colors.collectible;
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    renderHazards(ctx) {
        this.hazards.forEach(hazard => {
            const x = hazard.x * this.tileSize;
            const y = hazard.y * this.tileSize;
            const s = this.tileSize;
            
            // Pulsing danger zone
            const pulse = Math.sin(this.animTimer / 150) * 0.2 + 0.3;
            
            ctx.fillStyle = `rgba(255, 51, 102, ${pulse})`;
            ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
            
            // Warning pattern
            ctx.strokeStyle = this.colors.hazard;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
            ctx.setLineDash([]);
            
            // Skull/danger icon
            ctx.fillStyle = this.colors.hazard;
            ctx.font = `${s/2}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☠', x + s/2, y + s/2);
            
            ctx.lineWidth = 1;
        });
    }

    renderObjects(ctx) {
        this.objects.forEach(obj => {
            const x = obj.x * this.tileSize;
            const y = obj.y * this.tileSize;
            const s = this.tileSize;
            
            switch (obj.type) {
                case 'box':
                    this.drawBox(ctx, x, y, s, obj);
                    break;
                case 'door':
                    this.drawDoor(ctx, x, y, s, obj);
                    break;
                case 'switch':
                    this.drawSwitch(ctx, x, y, s, obj);
                    break;
                case 'portal':
                    this.drawPortal(ctx, x, y, s, obj);
                    break;
            }
        });
    }

    drawBox(ctx, x, y, s, obj) {
        // Box shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 4, y + s - 4, s - 4, 4);
        
        // Box body
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
        
        // Box highlight
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(x + 4, y + 4, s - 8, 4);
        ctx.fillRect(x + 4, y + 4, 4, s - 8);
        
        // Box shadow edge
        ctx.fillStyle = '#6d28d9';
        ctx.fillRect(x + 4, y + s - 8, s - 8, 4);
        ctx.fillRect(x + s - 8, y + 4, 4, s - 8);
    }

    drawDoor(ctx, x, y, s, obj) {
        const isOpen = obj.open;
        
        // Door frame
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(x + 2, y, s - 4, s);
        
        if (!isOpen) {
            // Closed door
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(x + 4, y + 2, s - 8, s - 2);
            
            // Door handle
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + s - 12, y + s/2 - 2, 4, 4);
        } else {
            // Open door (darker inside)
            ctx.fillStyle = '#1a1a25';
            ctx.fillRect(x + 4, y + 2, s - 8, s - 2);
        }
    }

    drawSwitch(ctx, x, y, s, obj) {
        const isActive = obj.active;
        
        // Base
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(x + s/4, y + s/2, s/2, s/2);
        
        // Switch lever
        ctx.fillStyle = isActive ? '#00ff88' : '#ff3366';
        ctx.fillRect(x + s/4 + 4, y + (isActive ? s/2 - 8 : s/2 + 4), s/2 - 8, 12);
        
        // Glow
        if (isActive) {
            const gradient = ctx.createRadialGradient(x + s/2, y + s/2, 0, x + s/2, y + s/2, s/2);
            gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x + s/2, y + s/2, s/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPortal(ctx, x, y, s, obj) {
        const rotation = this.animTimer / 500;
        
        ctx.save();
        ctx.translate(x + s/2, y + s/2);
        
        // Outer ring
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, s/2 - 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner spinning effect
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(rotation + (i * Math.PI * 2 / 3));
            ctx.strokeStyle = `rgba(255, 0, 255, ${0.8 - i * 0.2})`;
            ctx.beginPath();
            ctx.arc(0, 0, s/3 - i * 3, 0, Math.PI);
            ctx.stroke();
            ctx.restore();
        }
        
        // Center glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s/3);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, s/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        ctx.lineWidth = 1;
    }

    // Utility methods
    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 1; // Out of bounds = wall
        }
        return this.tiles[y * this.width + x];
    }

    isWall(x, y) {
        const tile = this.getTile(x, y);
        if (tile === 1) return true;
        
        // Check for blocking objects
        const obj = this.getObjectAt(x, y);
        if (obj && obj.blocking) return true;
        
        return false;
    }

    getObjectAt(x, y) {
        return this.objects.find(obj => obj.x === x && obj.y === y);
    }

    hasCollectible(x, y) {
        return this.collectibles.some(c => c.x === x && c.y === y && !c.collected);
    }

    collectAt(x, y) {
        const item = this.collectibles.find(c => c.x === x && c.y === y && !c.collected);
        if (item) {
            item.collected = true;
            this.collectedCount++;
            return item;
        }
        return null;
    }

    getHazardAt(x, y) {
        return this.hazards.find(h => h.x === x && h.y === y);
    }

    getGoalPosition() {
        return this.goal;
    }

    interact(x, y) {
        const obj = this.getObjectAt(x, y);
        if (!obj) return false;
        
        switch (obj.type) {
            case 'door':
                if (obj.requiresKey) {
                    // Check if player has key
                    return false;
                }
                obj.open = !obj.open;
                obj.blocking = !obj.open;
                return true;
                
            case 'switch':
                obj.active = !obj.active;
                this.triggerLinkedObjects(obj.links);
                return true;
        }
        
        return false;
    }

    triggerLinkedObjects(links) {
        if (!links) return;
        
        links.forEach(link => {
            const obj = this.objects.find(o => o.id === link);
            if (obj) {
                if (obj.type === 'door') {
                    obj.open = !obj.open;
                    obj.blocking = !obj.open;
                }
            }
        });
    }

    pushObject(x, y, dx, dy) {
        const obj = this.getObjectAt(x, y);
        if (!obj || !obj.pushable) return false;
        
        const newX = x + dx;
        const newY = y + dy;
        
        if (this.isWall(newX, newY)) return false;
        if (this.getObjectAt(newX, newY)) return false;
        
        obj.x = newX;
        obj.y = newY;
        return true;
    }
}
