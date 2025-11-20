const config = {
    type: Phaser.AUTO,
    width: 1440,
    height: 1024,
    backgroundColor: "#000",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ BootScene, GameScene ]
};

const game = new Phaser.Game(config);
