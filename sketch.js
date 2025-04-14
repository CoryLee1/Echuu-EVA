// 爱/AI/LOVE 打字机与描边效果
// AI为红色实心，其他为描边
// 右侧使用网格布局记录整词变化历史
let loveWords = ['AI', '愛', 'LOVE'];
let currentWordIndex = 0;
let cycleTimer = 0;
let transitionAmount = 0;
let isTransitioning = false;
let nextWordIndex = 0;
let fontSize = 80;
let matisseFont;
let typewriterPos = 0; // 打字机效果的位置
let typewriterSpeed = 3; // 打字机效果的速度

// 网格布局参数
let gridCols = 10; // 网格列数
let gridRows = 10; // 网格行数
let gridCells = []; // 网格单元格数组
let cellSize = 0; // 单元格尺寸，将在setup中计算

// 为每个词设置不同的显示时间
const displayTimes = [0.8, 0.05, 0.05]; // AI停留0.8秒，其他词停留0.05秒

// 预加载FOT-マティス字体
function preload() {
  // 尝试加载FOT-マティスpro-EB.otf字体
  try {
    matisseFont = loadFont('FOT-マティスpro-EB.otf');
  } catch (e) {
    console.log('字体加载失败，使用默认字体', e);
  }
}

function setup() {
  // 创建一个更大的画布，包含左中右三个部分
  let canvasHeight = min(windowWidth, windowHeight) * 0.8;
  let canvasWidth = canvasHeight * 2; // 左右两部分宽度相等
  
  createCanvas(canvasWidth, canvasHeight);
  textAlign(CENTER, CENTER);
  
  // 计算网格单元格尺寸
  cellSize = (canvasHeight / gridRows);
  
  // 尝试应用加载的字体
  if (matisseFont) {
    textFont(matisseFont);
    console.log('成功应用FOT-マティス字体');
  } else {
    console.log('使用默认字体');
  }
  
  textSize(fontSize);
  
  // 初始化网格单元格
  initializeGrid();
}

// 初始化网格
function initializeGrid() {
  gridCells = [];
  for (let i = 0; i < gridRows * gridCols; i++) {
    gridCells.push({
      word: "",
      isAI: false,
      opacity: 0 // 初始透明度为0
    });
  }
}

function draw() {
  // 设置背景色
  // 左侧显示：E2DEE6 (淡灰色)
  // 右侧显示：白色
  fill(226, 222, 230);
  rect(0, 0, width/2, height);
  fill(255);
  rect(width/2, 0, width/2, height);
  
  cycleTimer += deltaTime / 1000;
  
  // 根据当前显示的词决定切换时间
  if (cycleTimer > displayTimes[currentWordIndex] && !isTransitioning) {
    isTransitioning = true;
    nextWordIndex = (currentWordIndex + 1) % loveWords.length;
    // 重置打字机位置
    typewriterPos = 0;
    
    // 在切换时添加当前词到网格
    addWordToGrid(loveWords[currentWordIndex]);
  }
  
  // 处理过渡 - 加快过渡速度
  if (isTransitioning) {
    transitionAmount += 0.3; // 加快过渡速度
    
    if (transitionAmount >= 1) {
      transitionAmount = 0;
      currentWordIndex = nextWordIndex;
      isTransitioning = false;
      cycleTimer = 0;
    }
  }
  
  // 在左侧画布区域绘制文字
  push();
  translate(width/4, height/2);
  
  // 根据过渡状态绘制文字
  if (!isTransitioning) {
    // 更新打字机位置
    if (typewriterPos < 1) {
      typewriterPos = min(typewriterPos + 0.05 * typewriterSpeed, 1);
    }
    
    // 正常显示当前词
    drawWordWithTypewriter(loveWords[currentWordIndex], 0, 0, 255, typewriterPos);
  } else {
    // 淡出当前词
    let currentAlpha = 255 * (1 - transitionAmount);
    drawWord(loveWords[currentWordIndex], 0, 0, currentAlpha);
    
    // 淡入下一个词
    let nextAlpha = 255 * transitionAmount;
    drawWord(loveWords[nextWordIndex], 0, 0, nextAlpha);
  }
  
  pop();
  
  // 在右侧画布绘制网格
  drawGrid();
  
  // 显示字体状态信息和调试信息（左下角）
  push();
  fill(50);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text(`Current: ${loveWords[currentWordIndex]} | Next: ${loveWords[nextWordIndex]} | Time: ${cycleTimer.toFixed(1)}s`, 10, height - 10);
  pop();
  
  // 淡化网格单元格
  fadeGridCells();
}

// 添加单词到网格
function addWordToGrid(word) {
  // 找一个随机位置
  let randomCell = floor(random(gridRows * gridCols));
  
  // 确保该位置是空的或者已经很淡了
  let attempts = 0;
  while (gridCells[randomCell].opacity > 0.3 && attempts < 10) {
    randomCell = floor(random(gridRows * gridCols));
    attempts++;
  }
  
  // 设置单词
  gridCells[randomCell] = {
    word: word,
    isAI: word === 'AI',
    opacity: 1.0 // 完全不透明
  };
}

// 淡化网格单元格
function fadeGridCells() {
  for (let i = 0; i < gridCells.length; i++) {
    if (gridCells[i].opacity > 0) {
      gridCells[i].opacity -= 0.002; // 逐渐淡化
    }
  }
}

// 绘制网格
function drawGrid() {
  push();
  
  // 计算网格起始位置（在右侧）
  let gridStartX = width/2;
  let gridStartY = 0;
  
  // 绘制网格线
  stroke(230);
  strokeWeight(1);
  for (let i = 0; i <= gridCols; i++) {
    line(gridStartX + i * cellSize, gridStartY, gridStartX + i * cellSize, gridStartY + height);
  }
  for (let i = 0; i <= gridRows; i++) {
    line(gridStartX, gridStartY + i * cellSize, gridStartX + gridCols * cellSize, gridStartY + i * cellSize);
  }
  
  // 绘制每个单元格的内容
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      let index = row * gridCols + col;
      let cell = gridCells[index];
      
      if (cell.word && cell.opacity > 0) {
        // 计算单元格中心位置
        let cellX = gridStartX + col * cellSize + cellSize/2;
        let cellY = gridStartY + row * cellSize + cellSize/2;
        
        // 根据单词长度调整文字大小
        let wordLength = cell.word.length;
        let cellFontSize = wordLength <= 2 ? cellSize * 0.6 : cellSize * 0.4;
        textSize(cellFontSize);
        
        // 设置字符样式
        if (cell.isAI) {
          // AI为红色实心
          fill(255, 0, 0, 255 * cell.opacity);
          noStroke();
        } else {
          // 其他词为黑色描边
          noFill();
          stroke(0, 0, 0, 255 * cell.opacity);
          strokeWeight(1);
        }
        
        // 绘制单词
        text(cell.word, cellX, cellY);
      }
    }
  }
  
  pop();
}

// 辅助函数：带打字机效果绘制单词
function drawWordWithTypewriter(word, x, y, alpha, progress) {
  // 如果是单个字符的单词，调整大小
  let wordSize = word.length === 1 ? fontSize : fontSize * 0.8;
  textSize(wordSize);
  
  // 根据单词类型设置不同的颜色和样式
  if (word === 'AI') {
    // AI显示为红色实心
    fill(255, 0, 0, alpha);
    noStroke();
    
    // 计算应显示的字符数量
    let visibleChars = ceil(word.length * progress);
    text(word.substring(0, visibleChars), x, y);
  } else {
    // 其他词显示为黑色描边
    noFill();
    stroke(0, 0, 0, alpha);
    strokeWeight(2);
    
    // 计算应显示的字符数量
    let visibleChars = ceil(word.length * progress);
    text(word.substring(0, visibleChars), x, y);
    noStroke();
  }
}

// 辅助函数：绘制单词（用于过渡）
function drawWord(word, x, y, alpha) {
  // 如果是单个字符的单词，调整大小
  let wordSize = word.length === 1 ? fontSize : fontSize * 0.8;
  textSize(wordSize);
  
  // 根据单词类型设置不同的颜色和样式
  if (word === 'AI') {
    // AI显示为红色实心
    fill(255, 0, 0, alpha);
    noStroke();
    text(word, x, y);
  } else {
    // 其他词显示为黑色描边
    noFill();
    stroke(0, 0, 0, alpha);
    strokeWeight(2);
    text(word, x, y);
    noStroke();
  }
}

function windowResized() {
  let canvasHeight = min(windowWidth, windowHeight) * 0.8;
  let canvasWidth = canvasHeight * 2; 
  resizeCanvas(canvasWidth, canvasHeight);
  
  // 重新计算单元格尺寸
  cellSize = (canvasHeight / gridRows);
}