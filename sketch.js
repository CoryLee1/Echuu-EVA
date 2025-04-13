// 爱/AI/LOVE 打字机与描边效果
// AI为红色实心，其他为描边
// 右侧记录文字变化历史
let loveWords = ['AI', '愛', 'LOVE'];
let currentWordIndex = 0;
let cycleTimer = 0;
let transitionAmount = 0;
let isTransitioning = false;
let nextWordIndex = 0;
let fontSize = 100;
let matisseFont;
let typewriterPos = 0; // 打字机效果的位置
let typewriterSpeed = 3; // 打字机效果的速度

// 历史记录数组
let history = [];
let maxHistoryEntries = 15; // 最大历史记录数
let lastRecordedWord = ""; // 上次记录的词，用于避免重复记录

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
  // 创建正方形画布，左右分成两部分
  let canvasSize = min(windowWidth, windowHeight) * 0.8;
  createCanvas(canvasSize * 2, canvasSize);
  textAlign(CENTER, CENTER);
  
  // 尝试应用加载的字体
  if (matisseFont) {
    textFont(matisseFont);
    console.log('成功应用FOT-マティス字体');
  } else {
    console.log('使用默认字体');
  }
  
  textSize(fontSize);
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
    
    // 在切换时记录当前词到历史记录
    recordWordToHistory(loveWords[currentWordIndex]);
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
  
  // 在右侧画布绘制历史记录
  drawHistory();
  
  // 显示字体状态信息和调试信息（左下角）
  push();
  fill(50);
  textSize(12);
  textAlign(LEFT, BOTTOM);
  text(`Current: ${loveWords[currentWordIndex]} | Next: ${loveWords[nextWordIndex]} | Time: ${cycleTimer.toFixed(1)}s`, 10, height - 10);
  pop();
}

// 记录单词到历史记录
function recordWordToHistory(word) {
  // 避免连续记录相同的单词
  if (word !== lastRecordedWord) {
    // 创建一个新的历史记录项
    let historyItem = {
      word: word,
      timestamp: new Date().toLocaleTimeString(),
      isAI: word === 'AI'
    };
    
    // 添加到历史记录数组
    history.push(historyItem);
    
    // 如果历史记录超过最大数量，移除最早的记录
    if (history.length > maxHistoryEntries) {
      history.shift();
    }
    
    // 更新上次记录的词
    lastRecordedWord = word;
  }
}

// 绘制历史记录
function drawHistory() {
  push();
  
  // 设置文本对齐方式和大小
  textAlign(LEFT, TOP);
  textSize(16);
  
  // 设置起始位置
  let x = width/2 + 20;
  let y = 20;
  
  // 绘制标题
  fill(0);
  textStyle(BOLD);
  text("HISTORY", x, y);
  y += 30;
  
  // 绘制每个历史记录项
  textStyle(NORMAL);
  for (let i = 0; i < history.length; i++) {
    let item = history[i];
    
    // 设置文字样式
    if (item.isAI) {
      // AI使用红色实心
      fill(255, 0, 0);
      noStroke();
    } else {
      // 其他词使用灰色
      fill(100);
      noStroke();
    }
    
    // 绘制历史记录项
    text(`${item.timestamp}: ${item.word}`, x, y);
    y += 24; // 行间距
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
  let canvasSize = min(windowWidth, windowHeight) * 0.8;
  resizeCanvas(canvasSize * 2, canvasSize);
}