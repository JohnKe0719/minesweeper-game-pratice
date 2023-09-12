const { Scene, Game } = require('phaser');

class MinesweeperScene extends Scene {
  constructor() {
    super({ key: 'MinesweeperScene' });
  }

  preload() {
  }

  create() {
    this.createGrid();
  }

  // 畫出踩地雷的格子
  createGrid() {
    const rows = 10;
    const cols = 10;
    const size = 40;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * size + size / 2;
        const y = row * size + size / 2;
        const rect = this.add.rectangle(x, y, size, size, 0x666666);
        rect.setStrokeStyle(2, 0xffffff);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MinesweeperScene,
  backgroundColor: '#444444',
};

const game = new Game(config);