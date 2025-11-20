const config = {
    type: Phaser.AUTO,
    width: 1440,
    height: 1024,
    parent: 'game-container',
    backgroundColor: '#FCEFE9',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, GameScene, PauseScene]
};

const game = new Phaser.Game(config);