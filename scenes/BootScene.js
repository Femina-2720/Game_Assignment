class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {

        // Background wallpaper
        this.load.image("bg", "assets/Landscape_JustDivide_Game_2.png");

        // Cat
        this.load.image("cat", "assets/Cat.png");

        // Level & Score header
        this.load.image("levelScore", "assets/Levels and Score.png");

        // Grid background
        this.load.image("gridPanel", "assets/Placement_Box.png");

        // Tile colors
        this.load.image("tileBlue", "assets/blue.png");
        this.load.image("tileRed", "assets/red.png");
        this.load.image("tilePurple", "assets/purple.png");
        this.load.image("tileOrange", "assets/orange.png");
        this.load.image("tilePink", "assets/pink.png");
    }

    create() {
        this.scene.start("GameScene");
    }
}
