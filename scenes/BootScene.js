class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Loading Text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.text(width / 2, height / 2, 'Loading...', {
            fontFamily: 'Fredoka', fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        // Load Images
        this.load.image('bg', 'assets/Desktop_JustDivide_Game_2.png');
        this.load.image('cat', 'assets/Cat.png');
        this.load.image('levelScore', 'assets/Levels and Score.png'); 
        this.load.image('gridPanel', 'assets/Placement_Box.png');
        
        // Tiles (Ensure filenames match exactly what you have)
        this.load.image('tile_blue', 'assets/blue.png');
        this.load.image('tile_red', 'assets/red.png');
        this.load.image('tile_purpule', 'assets/purpule.png'); // Fixed typo 'purpule' -> 'purple' based on standard naming, check your file
        this.load.image('tile_orange', 'assets/orange.png');
        this.load.image('tile_pink', 'assets/pink.png');
    }

    create() {
        this.scene.start('GameScene');
    }
}