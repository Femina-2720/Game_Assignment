class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // --- Game State ---
        this.gridArray = Array(16).fill(null);
        this.upcomingQueue = [];
        
        // Keep Slot State
        this.keepTileValue = null;
        this.keepTileSprite = null; // The visual in the Keep slot

        // Active / Queue State
        this.currentActiveTile = null; // The tile being dragged
        this.nextTilePreview = null;   // The static preview of the next tile
        
        this.score = 0;
        this.level = 1;
        this.trashCount = 10;
        this.bestScore = parseInt(localStorage.getItem('jd_best_score')) || 0;
        
        // --- Timer State ---
        this.gameTime = 0;
        this.timerEvent = null;
        this.isPaused = false;

        // --- Layout Configuration ---
        this.GRID_SPACING = 125;
        this.GRID_START_X = 720 - (1.5 * this.GRID_SPACING); 
        this.GRID_START_Y = 550; 
        
        this.colorsList = ['blue', 'red', 'purple', 'orange', 'pink'];
    }

    create() {
        // 1. Background
        this.add.image(720, 512, 'bg').setDisplaySize(1440, 1024);
        this.createDecorations();

        // 2. Pause/Resume Handling
        this.events.on('resume', () => {
            this.isPaused = false;
            if(this.timerEvent) this.timerEvent.paused = false;
        });

        this.events.on('pause', () => {
            this.isPaused = true;
            if(this.timerEvent) this.timerEvent.paused = true;
        });

        // 3. Global Input Listeners (Added only once)
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!this.isPaused) {
                gameObject.x = dragX;
                gameObject.y = dragY;
                // Bring to top while dragging so it doesn't go behind UI
                this.children.bringToTop(gameObject);
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (!this.isPaused) {
                this.handleDrop(gameObject);
            }
        });

        // 4. UI Setup
        this.createHeader();
        this.createGridSystem();
        this.createSidebar();

        // 5. Start Logic
        this.fillQueue();
        this.spawnNextTile(); 
        this.updateUI();

        // 6. Timer
        this.timerEvent = this.time.addEvent({ 
            delay: 1000, 
            callback: this.onTimerTick, 
            callbackScope: this, 
            loop: true 
        });
    }

    // ==========================================
    // UI CONSTRUCTION
    // ==========================================

    createHeader() {
        // Pause Button
        const pauseBtn = this.add.circle(70, 70, 35, 0x9b51e0).setInteractive({ useHandCursor: true });
        this.add.text(70, 70, "II", { fontFamily: 'Fredoka', fontSize: '28px', color: '#fff', fontStyle:'bold' }).setOrigin(0.5);
        
        pauseBtn.on('pointerdown', () => {
            this.scene.launch('PauseScene');
            this.scene.pause();
        });

        // Help Button
        const helpBtn = this.add.circle(1370, 70, 35, 0x00C853).setInteractive({ useHandCursor: true });
        this.add.text(1370, 70, "?", { fontFamily: 'Fredoka', fontSize: '32px', color: '#fff', fontStyle:'bold' }).setOrigin(0.5);

        // Title
        this.add.text(720, 70, "JUST DIVIDE", {
            fontFamily: 'Fredoka', fontSize: '60px', fontStyle: 'bold', color: '#2c3e50'
        }).setOrigin(0.5);

        // Timer
        this.add.text(720, 130, "⏳", { fontSize: '28px' }).setOrigin(1, 0.5);
        this.timerText = this.add.text(730, 130, "00:00", {
            fontFamily: 'Fredoka', fontSize: '32px', color: '#2c3e50', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Subtitle
        this.add.text(720, 180, "DIVIDE WITH THE NUMBERS TO SOLVE THE ROWS AND COLUMNS.", {
            fontFamily: 'Fredoka', fontSize: '24px', color: '#E67E22', fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createGridSystem() {
        // Cat
        this.add.image(720, 330, 'cat').setScale(0.9).setDepth(5);

        // Badges
        this.add.image(600, 420, 'levelScore').setScale(0.85).setDepth(4);
        this.levelText = this.add.text(600, 420, "LEVEL 1", {
            fontFamily: 'Fredoka', fontSize: '26px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5).setDepth(5);

        this.add.image(840, 420, 'levelScore').setScale(0.85).setDepth(4);
        this.scoreText = this.add.text(840, 420, "SCORE 0", {
            fontFamily: 'Fredoka', fontSize: '26px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5).setDepth(5);

        // Grid Background Box
        const gridBg = this.add.graphics();
        gridBg.fillStyle(0x008B9C, 1);
        // Calculate centered rect
        gridBg.fillRoundedRect(720 - 270, this.GRID_START_Y + 187.5 - 270, 540, 540, 25);
        gridBg.lineStyle(5, 0xffffff);
        gridBg.strokeRoundedRect(720 - 270, this.GRID_START_Y + 187.5 - 270, 540, 540, 25);

        // Grid Slots
        this.gridSlots = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const x = this.GRID_START_X + (c * this.GRID_SPACING);
                const y = this.GRID_START_Y + (r * this.GRID_SPACING);

                // Visual Slot
                const slotVis = this.add.graphics();
                slotVis.fillStyle(0x006d7a, 1);
                slotVis.fillRoundedRect(x - 55, y - 55, 110, 110, 15);
                slotVis.lineStyle(2, 0x4DD0E1);
                slotVis.strokeRoundedRect(x - 55, y - 55, 110, 110, 15);

                // Interaction Zone
                const zone = this.add.zone(x, y, 110, 110).setRectangleDropZone(110, 110);
                zone.gridIndex = (r * 4) + c;
                this.gridSlots.push({ x, y, zone });
            }
        }
    }

    createSidebar() {
        this.panelX = 1180;
        const topY = 380;

        // Sidebar Background
        const sidebar = this.add.graphics();
        sidebar.fillStyle(0xF5A623, 1);
        sidebar.fillRoundedRect(this.panelX - 85, topY, 170, 550, 30);
        sidebar.lineStyle(4, 0xCC7A00);
        sidebar.strokeRoundedRect(this.panelX - 85, topY, 170, 550, 30);

        // 1. KEEP SLOT
        const keepY = topY + 90;
        this.keepZone = this.add.zone(this.panelX, keepY, 110, 110).setRectangleDropZone(110, 110);
        
        const keepBg = this.add.rectangle(this.panelX, keepY, 100, 100, 0x2ECC71).setOrigin(0.5);
        keepBg.setStrokeStyle(4, 0xffffff);
        this.add.circle(this.panelX - 30, keepY - 30, 8, 0xffffff, 0.4);
        this.add.text(this.panelX, keepY + 65, "KEEP", { fontFamily: 'Fredoka', fontSize: '20px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

        // 2. QUEUE BOX (Wider to show Next tile)
        this.queueY = topY + 270;
        const queueBox = this.add.graphics();
        queueBox.fillStyle(0xffffff, 1);
        // Adjusted width to 160 to fit two small tiles
        queueBox.fillRoundedRect(this.panelX - 80, this.queueY - 65, 160, 130, 15);
        queueBox.lineStyle(2, 0xbdc3c7);
        queueBox.strokeRoundedRect(this.panelX - 80, this.queueY - 65, 160, 130, 15);

        // Define Positions
        this.activeTilePos = { x: this.panelX - 35, y: this.queueY };
        this.previewTilePos = { x: this.panelX + 45, y: this.queueY };

        // 3. TRASH SLOT
        const trashY = topY + 460;
        this.trashZone = this.add.zone(this.panelX, trashY, 110, 110).setRectangleDropZone(110, 110);
        
        this.add.text(this.panelX, trashY - 55, "TRASH", { fontFamily: 'Fredoka', fontSize: '20px', fontStyle: 'bold', color: '#D32F2F' }).setOrigin(0.5);
        const trashBox = this.add.rectangle(this.panelX, trashY + 5, 90, 80, 0xD32F2F).setOrigin(0.5);
        trashBox.setStrokeStyle(3, 0xffffff);
        this.add.text(this.panelX, trashY - 5, "🗑", { fontSize: '36px' }).setOrigin(0.5);
        this.trashText = this.add.text(this.panelX, trashY + 25, "X10", { fontFamily: 'Fredoka', fontSize: '20px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
    }

    createDecorations() {
        const g = this.add.graphics();
        g.fillStyle(0xFFAB91, 0.5);
        g.fillCircle(150, 850, 80);
        g.fillCircle(1300, 200, 50);
    }

    // ==========================================
    // GAME LOGIC - QUEUE & SPAWNING
    // ==========================================

    fillQueue() {
        while (this.upcomingQueue.length < 5) {
            const pool = [2, 2, 3, 3, 4, 4, 5, 5, 6, 8, 9, 10, 12, 15, 20, 25];
            const val = pool[Phaser.Math.Between(0, Math.min(pool.length-1, 4 + this.level))];
            this.upcomingQueue.push(val);
        }
    }

    spawnNextTile() {
        if (this.currentActiveTile) return; // Don't spawn if we already have a dragger

        // 1. Shift Queue
        const val = this.upcomingQueue.shift();
        this.fillQueue(); 

        // 2. Create Draggable Active Tile
        this.currentActiveTile = this.createTileContainer(this.activeTilePos.x, this.activeTilePos.y, val);
        this.currentActiveTile.isKeepTile = false; // Important flag
        this.currentActiveTile.setInteractive({ draggable: true, useHandCursor: true });
        this.input.setDraggable(this.currentActiveTile);

        // 3. Update Preview
        this.updateNextPreview();
    }

    updateNextPreview() {
        if (this.nextTilePreview) this.nextTilePreview.destroy();

        const nextVal = this.upcomingQueue[0];
        this.nextTilePreview = this.createTileContainer(this.previewTilePos.x, this.previewTilePos.y, nextVal);
        this.nextTilePreview.setScale(0.7);
        this.nextTilePreview.setAlpha(0.8);
        
        // Add dark overlay to indicate it's not active yet
        const darkOverlay = this.add.rectangle(0,0, 100, 100, 0x000000, 0.2);
        this.nextTilePreview.add(darkOverlay);
    }

    createTileContainer(x, y, value) {
        const container = this.add.container(x, y);
        container.value = value;

        const colorKey = this.colorsList[value % this.colorsList.length];
        const spriteKey = `tile_${colorKey}`;
        
        let bg;
        if (this.textures.exists(spriteKey)) {
            bg = this.add.image(0, 0, spriteKey).setDisplaySize(100, 100);
        } else {
            bg = this.add.rectangle(0, 0, 100, 100, 0x888888).setStrokeStyle(2, 0x000);
        }

        const text = this.add.text(0, 0, value.toString(), {
            fontFamily: 'Fredoka', fontSize: '42px', fontStyle: 'bold', color: '#333'
        }).setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(100, 100);
        return container;
    }

    // ==========================================
    // INTERACTION LOGIC
    // ==========================================

    handleDrop(tile) {
        // Use bounds for collision detection (better than distance)
        const tileBounds = tile.getBounds();

        // 1. Check Grid Drop
        for (let i = 0; i < this.gridSlots.length; i++) {
            const slot = this.gridSlots[i];
            if (Phaser.Geom.Intersects.RectangleToRectangle(tileBounds, slot.zone.getBounds())) {
                if (this.gridArray[i] === null) {
                    this.placeOnGrid(tile, i);
                    return;
                }
            }
        }

        // 2. Check Keep Drop
        if (Phaser.Geom.Intersects.RectangleToRectangle(tileBounds, this.keepZone.getBounds())) {
            // Cannot move a Keep tile back into Keep
            if (!tile.isKeepTile) {
                this.swapKeep(tile);
                return;
            }
        }

        // 3. Check Trash Drop
        if (Phaser.Geom.Intersects.RectangleToRectangle(tileBounds, this.trashZone.getBounds())) {
            this.useTrash(tile);
            return;
        }

        // Invalid Drop: Return to origin
        let homeX, homeY;
        if (tile.isKeepTile) {
            homeX = this.keepZone.x;
            homeY = this.keepZone.y;
        } else {
            homeX = this.activeTilePos.x;
            homeY = this.activeTilePos.y;
        }

        this.tweens.add({
            targets: tile,
            x: homeX,
            y: homeY,
            duration: 200,
            ease: 'Back.out'
        });
    }

    placeOnGrid(tile, index) {
        const slot = this.gridSlots[index];
        
        // Lock the tile to the grid
        this.input.setDraggable(tile, false);
        tile.removeInteractive();
        
        tile.x = slot.x;
        tile.y = slot.y;
        tile.setScale(1.0); // Ensure scale is normal

        this.gridArray[index] = tile;

        // Clean up state variables depending on where tile came from
        if (tile.isKeepTile) {
            this.keepTileValue = null;
            this.keepTileSprite = null;
        } else {
            this.currentActiveTile = null;
        }

        this.checkMerges(index).then(() => {
            if (this.isGameOver()) {
                this.scene.pause();
                alert(`Game Over! Score: ${this.score}`);
                this.scene.restart();
            } else {
                // Only spawn next if the Active tile was used (Keep tile usage doesn't advance queue)
                if (!this.currentActiveTile) {
                    this.spawnNextTile();
                }
            }
        });
    }

    swapKeep(tile) {
        // FIXED: Do NOT remove interactivity. Set flag isKeepTile = true.

        if (this.keepTileValue === null) {
            // Case A: Keep is empty
            this.keepTileValue = tile.value;
            
            tile.x = this.keepZone.x;
            tile.y = this.keepZone.y;
            tile.setScale(0.8);
            
            // Important: It stays interactive!
            tile.isKeepTile = true; 
            this.keepTileSprite = tile;
            
            this.currentActiveTile = null;
            this.spawnNextTile();
        } else {
            // Case B: Keep has a tile -> Swap logic
            const oldKeptVal = this.keepTileValue;
            this.keepTileValue = tile.value;

            // Destroy the visual currently in Keep
            if (this.keepTileSprite) this.keepTileSprite.destroy();

            // Create new Visual in Keep (from the dragged tile)
            this.keepTileSprite = this.createTileContainer(this.keepZone.x, this.keepZone.y, tile.value);
            this.keepTileSprite.setScale(0.8);
            this.keepTileSprite.isKeepTile = true;
            this.keepTileSprite.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(this.keepTileSprite);

            // Destroy the dragged tile
            tile.destroy();

            // Create new Active Tile (from the old kept value)
            this.currentActiveTile = this.createTileContainer(this.activeTilePos.x, this.activeTilePos.y, oldKeptVal);
            this.currentActiveTile.isKeepTile = false;
            this.currentActiveTile.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(this.currentActiveTile);
        }
    }

    useTrash(tile) {
        if (this.trashCount > 0) {
            this.trashCount--;
            
            // Clean up references
            if (tile.isKeepTile) {
                this.keepTileValue = null;
                this.keepTileSprite = null;
            } else {
                this.currentActiveTile = null;
            }

            tile.destroy();
            this.updateUI();

            // Only spawn if we trashed the active tile
            if (!this.currentActiveTile) {
                this.spawnNextTile();
            }
        } else {
            // Fail animation (bounce back)
            let homeX = tile.isKeepTile ? this.keepZone.x : this.activeTilePos.x;
            let homeY = tile.isKeepTile ? this.keepZone.y : this.activeTilePos.y;
            
            this.tweens.add({
                targets: tile,
                x: homeX, y: homeY,
                duration: 200, ease: 'Back.out'
            });
        }
    }

    // ==========================================
    // MERGE LOGIC
    // ==========================================

    async checkMerges(startIndex) {
        let stable = false;
        while (!stable) {
            stable = true;
            for (let i = 0; i < 16; i++) {
                if (!this.gridArray[i]) continue;
                const neighbors = this.getNeighbors(i);
                for (let nIdx of neighbors) {
                    if (!this.gridArray[nIdx]) continue;
                    
                    const tileA = this.gridArray[i];
                    const tileB = this.gridArray[nIdx];
                    const valA = tileA.value;
                    const valB = tileB.value;

                    // 1. EQUAL -> VANISH
                    if (valA === valB) {
                        await this.animateMerge(tileA, tileB, 'vanish');
                        this.gridArray[i] = null;
                        this.gridArray[nIdx] = null;
                        this.addScore(valA * 2);
                        stable = false;
                        break;
                    }

                    // 2. DIVISIBLE
                    let larger = null, smaller = null, lIdx = -1, sIdx = -1;
                    if (valA > valB && valA % valB === 0) { larger = tileA; smaller = tileB; lIdx = i; sIdx = nIdx; }
                    else if (valB > valA && valB % valA === 0) { larger = tileB; smaller = tileA; lIdx = nIdx; sIdx = i; }

                    if (larger) {
                        const result = larger.value / smaller.value;
                        if (result === 1) {
                             await this.animateMerge(larger, smaller, 'vanish');
                             this.gridArray[lIdx] = null;
                             this.gridArray[sIdx] = null;
                        } else {
                             await this.animateMerge(larger, smaller, 'combine');
                             this.updateTileVisuals(larger, result);
                             this.gridArray[sIdx] = null;
                        }
                        this.addScore(10);
                        stable = false;
                        break;
                    }
                }
                if (!stable) break;
            }
        }
    }

    getNeighbors(index) {
        const n = [];
        const r = Math.floor(index / 4);
        const c = index % 4;
        if (r > 0) n.push(index - 4);
        if (r < 3) n.push(index + 4);
        if (c > 0) n.push(index - 1);
        if (c < 3) n.push(index + 1);
        return n;
    }

    animateMerge(targetTile, sourceTile, type) {
        return new Promise(resolve => {
            this.tweens.add({
                targets: sourceTile, x: targetTile.x, y: targetTile.y, alpha: 0, duration: 200,
                onComplete: () => {
                    sourceTile.destroy();
                    if (type === 'vanish') {
                        this.tweens.add({
                            targets: targetTile, scaleX: 0, scaleY: 0, alpha: 0, duration: 150,
                            onComplete: () => { targetTile.destroy(); resolve(); }
                        });
                    } else { resolve(); }
                }
            });
        });
    }

    updateTileVisuals(container, newVal) {
        container.value = newVal;
        container.list[1].setText(newVal.toString());
        const colorKey = this.colorsList[newVal % this.colorsList.length];
        if (this.textures.exists(`tile_${colorKey}`)) {
            container.list[0].setTexture(`tile_${colorKey}`);
        }
        this.tweens.add({ targets: container, scaleX: 1.2, scaleY: 1.2, yoyo: true, duration: 100 });
    }

    addScore(pts) {
        this.score += pts;
        if (this.score > this.level * 100) {
            this.level++;
            this.trashCount += 2;
        }
        this.updateUI();
    }

    updateUI() {
        this.scoreText.setText(`SCORE ${this.score}`);
        this.levelText.setText(`LEVEL ${this.level}`);
        this.trashText.setText(`X${this.trashCount}`);
    }

    onTimerTick() {
        this.gameTime++;
        const m = Math.floor(this.gameTime / 60).toString().padStart(2, '0');
        const s = (this.gameTime % 60).toString().padStart(2, '0');
        this.timerText.setText(`${m}:${s}`);
    }

    isGameOver() {
        if (this.gridArray.some(t => t === null)) return false;
        for (let i = 0; i < 16; i++) {
            const val = this.gridArray[i].value;
            const neighbors = this.getNeighbors(i);
            for (let ni of neighbors) {
                const nVal = this.gridArray[ni].value;
                if (val === nVal || val % nVal === 0 || nVal % val === 0) return false;
            }
        }
        return true;
    }
}