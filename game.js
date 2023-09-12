const { Scene, Game } = require('phaser');

class MinesweeperScene extends Scene {
  constructor() {
    super({ key: 'MinesweeperScene' });
    // 格子相關變數都放置到建構函式裡
    this.rows = 10;
    this.cols = 10;
    this.size = 40;
    this.mineCount = 5;
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
      this.gameOver('You Lost!', false); // 判斷為遊戲失敗
    } else {
      this.grid[row][col].rect.setFillStyle(0x00ff00); // 如果不是地雷就讓格子變成綠色
      this.checkWinCondition();
    }
  }

  // 檢查遊戲是否勝利
  checkWinCondition() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col].hasMine && !this.grid[row][col].revealed) {
          // 如果場上還有未放置地雷的格子沒被揭露，則直接return
          return;
        }
      }
    }
    // 若是都沒有的話則判斷為勝利
    this.gameOver('You Win!', true);
  }

  // 遊戲結束時觸發
  gameOver(message, isWin) {
    this.disableInteraction();

    // 用fabric創建一個彈窗
    const popupCanvas = new fabric.Canvas();
    popupCanvas.setWidth(800);
    popupCanvas.setHeight(600);
    popupCanvas.lowerCanvasEl.style.zIndex = '1000';
    document.body.appendChild(popupCanvas.lowerCanvasEl);

    const background = new fabric.Rect({ left: 0, top: 0, width: 800, height: 600, fill: 'rgba(0, 0, 0, 0.5)' }); // 給彈窗一個半透明的背景
    const gameOverText = new fabric.Text(message, { left: 300, top: 200, fontSize: 40, fill: isWin ? '#00ff00' : '#ff0000' });
    const restartButton = new fabric.Rect({ left: 350, top: 300, width: 100, height: 50, fill: '#00ff00' });
    const buttonText = new fabric.Text('Restart', { left: 370, top: 310, fontSize: 20, fill: '#000000' });

    popupCanvas.add(background, gameOverText, restartButton, buttonText); // 把所有創建的元素都丟進彈窗


    // 為彈窗設定原生JS的事件監聽器
    popupCanvas.lowerCanvasEl.addEventListener('click', (event) => {
      // console.log('restartButton觸發')
      const rect = popupCanvas.lowerCanvasEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 計算restartButton的位置，判斷是否點擊
      if (x > 350 && x < 450 && y > 300 && y < 350) {
        document.body.removeChild(popupCanvas.lowerCanvasEl);
        this.scene.start('MinesweeperScene');
      }
    });
  }

  // 禁用使用者與格子的互動
  disableInteraction() {
    this.grid.forEach(row => {
      row.forEach(col => {
        col.rect.disableInteractive();
      });
    });
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