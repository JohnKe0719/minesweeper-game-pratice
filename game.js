const { Scene, Game } = require('phaser');

class MinesweeperScene extends Scene {
  constructor() {
    super({ key: 'MinesweeperScene' });
    // 格子相關變數都放置到建構函式裡
    this.rows = 10;
    this.cols = 10;
    this.size = 40;
    this.mineCount = 20;
    this.grid = [];
  }

  preload() {
  }

  create() {
    this.createGrid();
    this.placeMines();
  }

  // 畫出踩地雷的格子，並初始化
  createGrid() {
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.size + this.size / 2;
        const y = row * this.size + this.size / 2;
        const rect = this.add.rectangle(x, y, this.size, this.size, 0x666666); // 繪製格子
        rect.setStrokeStyle(2, 0xffffff); // 設置格子的邊框
        rect.setInteractive(); // 讓格子可以被監聽事件
        rect.on('pointerdown', () => this.revealCell(row, col)); // 添加點擊格子的監聽事件
        this.grid[row][col] = { rect, hasMine: false, revealed: false }; // 初始化格子
      }
    }
  }

  // 放置地雷
  placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      // 隨機決定一個格子放置地雷
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      
      if (!this.grid[row][col].hasMine) {
        this.grid[row][col].hasMine = true;
        minesPlaced++;
      }
    }
  }

  // 揭露該格子的內容
  revealCell(row, col) {
    if (this.grid[row][col].revealed) {
      return;
    }
    this.grid[row][col].revealed = true;
    if (this.grid[row][col].hasMine) {
      this.grid[row][col].rect.setFillStyle(0xff0000); // 如果是地雷就讓格子變成紅色
    } else {
      this.grid[row][col].rect.setFillStyle(0x00ff00); // 如果不是地雷就讓格子變成綠色
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