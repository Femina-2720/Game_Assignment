class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // --- Game State ---
        this.gridArray = Array(16).fill(null);
        this.upcomingQueue = [];
        this.keepTileValue = null;
        this.keepTileSprite = null; // The visual in the Keep slot
        this.currentActiveTile = null; // The tile being dragged
        this.nextTilePreview = null; // The static preview of the next tile
        
        this.score = 0;
        this.level = 1;
        this.trashCount = 10;
        this.bestScore = parseInt(localStorage.getItem('jd_best_score')) || 0;
        
        // --- Timer State ---
        this.gameTime = 0;
        this.timerEvent = null;
        this.isPaused = false;

        // --- Configuration ---
        this.GRID_SPACING = 125;
        this.GRID_START_X = 720 - (1.5 * this.GRID_SPACING); 
        this.GRID_START_Y = 550; 
        
        this.colorsList = ['blue', 'red', 'purple', 'orange', 'pink'];
    }

    create() {
        // 1. Background
        this.add.image(720, 512, 'bg').setDisplaySize(1440, 1024);
        this.createDecorations();

        // 2. Setup Pause/Resume Listener
        this.events.on('resume', () => {
            this.isPaused = false;
            this.timerEvent.paused = false;
        });

        this.events.on('pause', () => {
            this.isPaused = true;
            this.timerEvent.paused = true;
        });

        // 3. Input Listeners (One-time setup)
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!this.isPaused) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (!this.isPaused) {
                this.handleDrop(gameObject);
            }
        });

        // 4. UI Components
        this.createHeader();
        this.createGridSystem();
        this.createSidebar();

        // 5. Logic Start
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

        // Grid Background
        const gridBg = this.add.graphics();
        gridBg.fillStyle(0x008B9C, 1);
        gridBg.fillRoundedRect(720 - 270, this.GRID_START_Y + 187.5 - 270, 540, 540, 25);
        gridBg.lineStyle(5, 0xffffff);
        gridBg.strokeRoundedRect(720 - 270, this.GRID_START_Y + 187.5 - 270, 540, 540, 25);

        // Slots
        this.gridSlots = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const x = this.GRID_START_X + (c * this.GRID_SPACING);
                const y = this.GRID_START_Y + (r * this.GRID_SPACING);

                const slotVis = this.add.graphics();
                slotVis.fillStyle(0x006d7a, 1);
                slotVis.fillRoundedRect(x - 55, y - 55, 110, 110, 15);
                slotVis.lineStyle(2, 0x4DD0E1);
                slotVis.strokeRoundedRect(x - 55, y - 55, 110, 110, 15);

                const zone = this.add.zone(x, y, 110, 110).setRectangleDropZone(110, 110);
                zone.gridIndex = (r * 4) + c;
                this.gridSlots.push({ x, y, zone });
            }
        }
    }

    createSidebar() {
        this.panelX = 1180;
        const topY = 380;

        // Background
        const sidebar = this.add.graphics();
        sidebar.fillStyle(0xF5A623, 1);
        sidebar.fillRoundedRect(this.panelX - 85, topY, 170, 550, 30);
        sidebar.lineStyle(4, 0xCC7A00);
        sidebar.strokeRoundedRect(this.panelX - 85, topY, 170, 550, 30);

        // 1. KEEP SLOT
        const keepY = topY + 90;
        this.keepZone = { x: this.panelX, y: keepY }; 
        
        const keepBg = this.add.rectangle(this.panelX, keepY, 100, 100, 0x2ECC71).setOrigin(0.5);
        keepBg.setStrokeStyle(4, 0xffffff);
        this.add.circle(this.panelX - 30, keepY - 30, 8, 0xffffff, 0.4);
        this.add.text(this.panelX, keepY + 65, "KEEP", { fontFamily: 'Fredoka', fontSize: '20px', fontStyle: 'bold', color: '#333' }).setOrigin(0.5);

        // 2. QUEUE BOX (Double width)
        this.queueY = topY + 270;
        const queueBox = this.add.graphics();
        queueBox.fillStyle(0xffffff, 1);
        // Make box wider to fit two tiles (Active + Next)
        queueBox.fillRoundedRect(this.panelX - 80, this.queueY - 65, 160, 130, 15);
        queueBox.lineStyle(2, 0xbdc3c7);
        queueBox.strokeRoundedRect(this.panelX - 80, this.queueY - 65, 160, 130, 15);

        // Coordinates for Active Tile and Preview Tile
        this.activeTilePos = { x: this.panelX - 35, y: this.queueY };
        this.previewTilePos = { x: this.panelX + 45, y: this.queueY };

        // 3. TRASH
        const trashY = topY + 460;
        this.trashZone = { x: this.panelX, y: trashY };
        
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
    // GAME LOGIC
    // ==========================================

    fillQueue() {
        while (this.upcomingQueue.length < 5) {
            const pool = [2, 2, 3, 3, 4, 4, 5, 5, 6, 8, 9, 10, 12, 15, 20, 25];
            const val = pool[Phaser.Math.Between(0, Math.min(pool.length-1, 4 + this.level))];
            this.upcomingQueue.push(val);
        }
    }

    spawnNextTile() {
        if (this.currentActiveTile) return; // Don't spawn if one exists

        // 1. Get new active value
        const val = this.upcomingQueue.shift();
        this.fillQueue(); // Replenish

        // 2. Create Draggable Active Tile
        this.currentActiveTile = this.createTileContainer(this.activeTilePos.x, this.activeTilePos.y, val);
        this.currentActiveTile.setInteractive({ draggable: true, useHandCursor: true });
        this.input.setDraggable(this.currentActiveTile);

        // 3. Update the "Next" Preview (The grey tile to the right)
        this.updateNextPreview();
    }

    updateNextPreview() {
        // Remove old preview
        if (this.nextTilePreview) {
            this.nextTilePreview.destroy();
        }

        const nextVal = this.upcomingQueue[0];
        // Create a smaller, static, greyed-out tile
        this.nextTilePreview = this.createTileContainer(this.previewTilePos.x, this.previewTilePos.y, nextVal);
        this.nextTilePreview.setScale(0.7);
        this.nextTilePreview.setAlpha(0.8);
        
        // Make it look inactive (grey tint or overlay)
        const darkOverlay = this.add.rectangle(0,0, 100, 100, 0x000000, 0.3);
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

    handleDrop(tile) {
        const tileX = tile.x;
        const tileY = tile.y;

        // 1. Grid
        for (let i = 0; i < this.gridSlots.length; i++) {
            const slot = this.gridSlots[i];
            if (Phaser.Math.Distance.Between(tileX, tileY, slot.x, slot.y) < 60) { 
                if (this.gridArray[i] === null) {
                    this.placeOnGrid(tile, i);
                    return;
                }
            }
        }

        // 2. Keep
        if (Phaser.Math.Distance.Between(tileX, tileY, this.keepZone.x, this.keepZone.y) < 60) {
            this.swapKeep(tile);
            return;
        }

        // 3. Trash
        if (Phaser.Math.Distance.Between(tileX, tileY, this.trashZone.x, this.trashZone.y) < 60) {
            this.useTrash(tile);
            return;
        }

        // Return to Spawn
        this.tweens.add({
            targets: tile,
            x: this.activeTilePos.x,
            y: this.activeTilePos.y,
            duration: 200,
            ease: 'Back.out'
        });
    }

    placeOnGrid(tile, index) {
        const slot = this.gridSlots[index];
        this.input.setDraggable(tile, false);
        tile.removeInteractive();
        tile.x = slot.x;
        tile.y = slot.y;
        this.gridArray[index] = tile;
        this.currentActiveTile = null;

        this.checkMerges(index).then(() => {
            if (this.isGameOver()) {
                this.scene.pause();
                alert(`Game Over! Score: ${this.score}`);
                this.scene.restart();
            } else {
                this.spawnNextTile();
            }
        });
    }

    swapKeep(tile) {
        if (this.keepTileValue === null) {
            // 1. Keep is empty: Store active, Spawn NEW active
            this.keepTileValue = tile.value;
            
            tile.x = this.keepZone.x;
            tile.y = this.keepZone.y;
            tile.setScale(0.8);
            this.input.setDraggable(tile, false);
            tile.removeInteractive();
            
            this.keepTileSprite = tile;
            this.currentActiveTile = null;
            
            this.spawnNextTile();
        } else {
            // 2. Keep is full: SWAP active with keep. Do NOT spawn new from queue.
            const oldKeptVal = this.keepTileValue;
            this.keepTileValue = tile.value;

            // Update visual in keep box
            if (this.keepTileSprite) this.keepTileSprite.destroy();
            this.keepTileSprite = this.createTileContainer(this.keepZone.x, this.keepZone.y, tile.value);
            this.keepTileSprite.setScale(0.8);

            // Destroy dragged tile
            tile.destroy();

            // Create new active tile using the OLD kept value
            this.currentActiveTile = this.createTileContainer(this.activeTilePos.x, this.activeTilePos.y, oldKeptVal);
            this.currentActiveTile.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(this.currentActiveTile);
        }
    }

    useTrash(tile) {
        if (this.trashCount > 0) {
            this.trashCount--;
            tile.destroy();
            this.currentActiveTile = null;
            this.updateUI();
            this.spawnNextTile();
        } else {
            // Bounce back
            this.tweens.add({
                targets: tile,
                x: this.activeTilePos.x,
                y: this.activeTilePos.y,
                duration: 200,
                ease: 'Back.out'
            });
        }
    }

    // ==========================================
    // MERGE & UTILS
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

                    if (valA === valB) {
                        await this.animateMerge(tileA, tileB, 'vanish');
                        this.gridArray[i] = null;
                        this.gridArray[nIdx] = null;
                        this.addScore(valA * 2);
                        stable = false;
                        break;
                    }

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