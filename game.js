const { Scene, Game } = require('phaser');

class MinesweeperScene extends Scene {
  constructor() {
    super({ key: 'MinesweeperScene' });
    this.init()
  }

  preload() {
  }

  create() {
    this.createGrid();
    this.placeMines();
    this.createUI();
    this.timerText.text = 'Time: ' + this.timer + 's';

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  init() {
    // 初始化變數
    this.rows = 10;
    this.cols = 10;
    this.size = 40;
    this.mineCount = 10;
    this.grid = [];
    this.uiCanvas = null;
    this.minesLeft = this.mineCount;
    this.mineCounterText = null;
    this.timer = 0;
    this.timerEvent = null;
    this.timerText = null;
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
        rect.on('pointerdown', (pointer) => { // 添加點擊格子的監聽事件
          if (pointer.rightButtonDown()) {
            this.toggleMineMarker(row, col); // 標記該格子為地雷
          } else {
            this.revealCell(row, col);
          }
        }); 
        this.grid[row][col] = { rect, hasMine: false, revealed: false, marked: false }; // 初始化格子
      }
    }
  }

  // 畫出計時器/地雷計數器的UI
  createUI() {
    this.uiCanvas = new fabric.Canvas('uiCanvas', { renderOnAddRemove: false });
    this.uiCanvas.setWidth(800);
    this.uiCanvas.setHeight(100);
    this.uiCanvas.lowerCanvasEl.style.position = 'relative';
    


    const background = new fabric.Rect({ left: 0, top: 0, width: 800, height: 100, fill: 'rgba(107, 158, 185)' }); // 給UI一個背景
    this.timerText = new fabric.Text('Time: 0s', { left: 10, top: 10, fontSize: 20, fill: '#000000' });
    this.mineCounterText = new fabric.Text(`Mines Left: ${this.minesLeft}`, { left: 600, top: 10, fontSize: 20, fill: '#000000' });

    this.uiCanvas.add(background);
    this.uiCanvas.add(this.timerText);
    this.uiCanvas.add(this.mineCounterText);
    this.uiCanvas.renderAll();
    document.body.appendChild(this.uiCanvas.lowerCanvasEl);
  }

  // 更新計時器
  updateTimer() {
    this.timer += 1;
    this.timerText.text = 'Time: ' + this.timer + 's';
    this.timerText.canvas.renderAll();
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

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cell = this.grid[i][j];

        if (!cell.hasMine) {
          cell.number = this.calculateAdjacentMines(i, j);
        }
      }
    }
  }

  // 計算格子周遭的地雷數量
  calculateAdjacentMines(row, col) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    let count = 0;
    directions.forEach(([dx, dy]) => {
      const x = row + dx;
      const y = col + dy;
      if (x >= 0 && x < this.rows && y >= 0 && y < this.cols && this.grid[x][y].hasMine) {
        count++;
      }
    });

    return count;
  }

  // 標記該格子為地雷
  toggleMineMarker(row, col) {
    if (this.grid[row][col].revealed) {
      return;
    }
    this.grid[row][col].marked = !this.grid[row][col].marked;
    if (this.grid[row][col].marked) {
      this.grid[row][col].rect.setFillStyle(0xffff00);
      this.minesLeft--;
    } else {
      this.grid[row][col].rect.setFillStyle(0x666666);
      this.minesLeft++;
    }
    this.mineCounterText.text = 'Mines Left: ' + this.minesLeft;
    this.mineCounterText.canvas.renderAll();
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

      // 揭露該格子的地雷數字
      if (this.grid[row][col].number > 0) { 
        const x = col * this.size + this.size / 2;
        const y = row * this.size + this.size / 2;
        const text = this.add.text(x, y, this.grid[row][col].number.toString(), { fontSize: '16px', fill: '#000' });
        text.setOrigin(0.5);
      } else {
        this.revealAdjacentCells(row, col);
      }
  
      this.checkWinCondition();
    }
  }

  // 接露地雷數量為0周遭的格子
  revealAdjacentCells(row, col) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      const x = row + dx;
      const y = col + dy;
      if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
        this.revealCell(x, y);
      }
    });
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
    this.timerEvent.remove();
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
        document.body.removeChild(this.uiCanvas.lowerCanvasEl);
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
  height: 450,
  scene: MinesweeperScene,
  backgroundColor: '#444444',
};

const game = new Game(config);