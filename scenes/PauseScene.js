class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Overlay
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.7);

        // Box
        const box = this.add.rectangle(w/2, h/2, 500, 300, 0xffffff).setStrokeStyle(8, 0x008B9C, 1);
        
        // Text
        this.add.text(w/2, h/2 - 60, "PAUSED", {
            fontFamily: 'Fredoka', fontSize: '60px', color: '#333', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Resume Button
        const btn = this.add.rectangle(w/2, h/2 + 60, 220, 70, 0xF5A623).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(4, 0xffffff);
        
        this.add.text(w/2, h/2 + 60, "RESUME", {
            fontFamily: 'Fredoka', fontSize: '32px', color: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            // 1. Stop this scene
            this.scene.stop();
            // 2. Resume the GameScene
            this.scene.resume('GameScene');
        });
        
        btn.on('pointerover', () => btn.setFillStyle(0xFFB74D));
        btn.on('pointerout', () => btn.setFillStyle(0xF5A623));
    }
}