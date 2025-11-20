class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const w = this.cameras.main.width;

    this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', color: '#1f2d3d' });
    this.levelText = this.add.text(20, 46, 'Level: 1', { fontSize: '18px', color: '#1f2d3d' });
    this.timerText = this.add.text(w - 20, 20, 'Time: 0', { fontSize: '20px', color: '#1f2d3d' }).setOrigin(1,0);

    // hint button
    const hintBox = this.add.rectangle(w - 20, 62, 120, 36, 0xffffff).setOrigin(1,0).setStrokeStyle(2, 0x4e85ff);
    this.hintText = this.add.text(w - 80, 70, 'Hint', { fontSize: '18px', color: '#1f2d3d' }).setOrigin(0.5);
    hintBox.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.get('GameScene').useHint();
    });

    // Listen to events from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateHUD', this.updateHUD, this);
    gameScene.events.on('timeUpdate', (t) => { this.timerText.setText('Time: ' + t); }, this);
    gameScene.events.on('gameOver', (data) => { this.showEndPopup(data); }, this);
    gameScene.events.on('flash', (msg, color) => { this.flash(msg, color); }, this);
  }

  updateHUD(score, level) {
    this.scoreText.setText('Score: ' + score);
    this.levelText.setText('Level: ' + level);
  }

  flash(msg, color = '#2ecc71') {
    const w = this.cameras.main.width;
    const t = this.add.text(w/2, 120, msg, { fontSize: '28px', color }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      alpha: 0,
      duration: 1200,
      onComplete: () => t.destroy()
    });
  }

  showEndPopup({ score, level }) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bg = this.add.rectangle(w/2, h/2, 520, 300, 0xffffff).setStrokeStyle(2, 0x2c3e50);
    const txt = this.add.text(w/2, h/2 - 40, 'Game Over', { fontSize: '36px', color: '#1f2d3d' }).setOrigin(0.5);
    const detail = this.add.text(w/2, h/2, `Score: ${score}\nLevel: ${level}`, { fontSize: '20px', color: '#34495e', align: 'center' }).setOrigin(0.5);
    const btn = this.add.text(w/2, h/2 + 80, 'Restart', { fontSize: '22px', backgroundColor: '#4e85ff', color: '#fff', padding: { x: 12, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
      this.scene.bringToTop();
      bg.destroy(); txt.destroy(); detail.destroy(); btn.destroy();
    });
  }
}
