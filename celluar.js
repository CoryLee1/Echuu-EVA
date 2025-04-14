// 爱/癌/AI 纯文字元胞自动机
// 使用汉字和文本来表示不同状态
// 增加统计信息、说明文字和调参UI

let grid;
let nextGrid;
let cols;
let rows;
let cellSize = 20; // 单元格大小，增大以便更好地显示文字
let matisseFont;
let generation = 0; // 追踪演化代数
let stats = { empty: 0, love: 0, cancer: 0, ai: 0 }; // 统计各状态数量
let spacingY = 40; // UI元素之间的垂直间距

// 元胞状态
const EMPTY = 0;
const LOVE = 1;  // 爱
const CANCER = 2; // 癌
const AI = 3;    // AI

// 文字表示
const cellText = ["　", "愛", "癌", "AI"];

// 文字颜色
const textColors = [
  [200, 200, 200], // EMPTY - 浅灰色（基本不可见）
  [255, 105, 180], // LOVE - 粉红色
  [50, 50, 50],    // CANCER - 深灰色
  [255, 0, 0]      // AI - 红色
];

// 规则参数，可通过UI调整
let ruleParams = {
  loveSpreadThreshold: 2,    // 规则1: 爱传播所需的邻居数量
  cancerSpreadThreshold: 6,  // 规则2: 癌传播所需的邻居数量
  aiLoveInteraction: true,   // 规则3: AI与爱的互动是否启用
  loveOvercomesCancer: 1,    // 规则4: 爱战胜癌所需的邻居数量
  aiSurviveThreshold: 1,     // 规则5: AI存活所需的AI邻居数量
  loveSurviveThreshold: 2,   // 规则6: 爱存活所需的爱邻居数量
  overcrowdingThreshold: 7   // 规则7: 过度拥挤的阈值
};

// UI控件
let sliders = {};
let checkboxes = {};
let buttons = {};
let showUI = true; // 是否显示UI面板

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
  // 创建画布
  createCanvas(1000, 800); // 增加宽度以放置UI
  
  // 计算列数和行数
  cols = floor(800 / cellSize); // 使用固定宽度计算列数
  rows = floor(height / cellSize);
  
  // 初始化网格
  grid = make2DArray(cols, rows);
  nextGrid = make2DArray(cols, rows);
  
  // 初始随机布局
  initializeGrid();
  
  // 设置字体
  if (matisseFont) {
    textFont(matisseFont);
  }
  textAlign(CENTER, CENTER);
  textSize(cellSize * 0.7);
  
  // 设置帧率
  frameRate(5); // 减慢帧率以便观察
  
  // 设置背景色
  background(255);
  
  // 创建UI控件
  createUIControls();
}

function draw() {
  background(255);
  
  // 重置统计数据
  stats = { empty: 0, love: 0, cancer: 0, ai: 0 };
  
  // 显示当前网格
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      
      // 更新统计数据
      if (state === EMPTY) stats.empty++;
      else if (state === LOVE) stats.love++;
      else if (state === CANCER) stats.cancer++;
      else if (state === AI) stats.ai++;
      
      // 绘制单元格背景（可选，设为透明以突出文字）
      noFill();
      stroke(230);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
      
      // 绘制文字
      fill(textColors[state][0], textColors[state][1], textColors[state][2]);
      noStroke();
      text(cellText[state], i * cellSize + cellSize/2, j * cellSize + cellSize/2);
    }
  }
  
  // 计算下一代
  computeNextGeneration();
  
  // 更新网格
  updateGrid();
  
  // 增加代数计数
  generation++;
  
  // 绘制分隔线
  stroke(100);
  strokeWeight(2);
  line(cols * cellSize + 10, 0, cols * cellSize + 10, height);
  strokeWeight(1);
  
  // 显示统计信息和说明文字
  displayStats();
  
  // 显示说明文字
  drawInstructions();
  
  // 显示UI控件
  if (showUI) {
    updateUIControls();
  }
}

// 创建UI控件
function createUIControls() {
  let startX = cols * cellSize + 30;
  let startY = 180;
  let sliderWidth = 150;
  let sliderHeight = 20;
  let spacingY = 40;
  
  // 创建滑块控件
  sliders.loveSpread = createSlider(1, 8, ruleParams.loveSpreadThreshold, 1);
  sliders.loveSpread.position(startX, startY);
  sliders.loveSpread.size(sliderWidth, sliderHeight);
  
  sliders.cancerSpread = createSlider(1, 8, ruleParams.cancerSpreadThreshold, 1);
  sliders.cancerSpread.position(startX, startY + spacingY);
  sliders.cancerSpread.size(sliderWidth, sliderHeight);
  
  sliders.loveOvercomes = createSlider(1, 8, ruleParams.loveOvercomesCancer, 1);
  sliders.loveOvercomes.position(startX, startY + spacingY * 2);
  sliders.loveOvercomes.size(sliderWidth, sliderHeight);
  
  sliders.aiSurvive = createSlider(1, 8, ruleParams.aiSurviveThreshold, 1);
  sliders.aiSurvive.position(startX, startY + spacingY * 3);
  sliders.aiSurvive.size(sliderWidth, sliderHeight);
  
  sliders.loveSurvive = createSlider(1, 8, ruleParams.loveSurviveThreshold, 1);
  sliders.loveSurvive.position(startX, startY + spacingY * 4);
  sliders.loveSurvive.size(sliderWidth, sliderHeight);
  
  sliders.overcrowding = createSlider(3, 8, ruleParams.overcrowdingThreshold, 1);
  sliders.overcrowding.position(startX, startY + spacingY * 5);
  sliders.overcrowding.size(sliderWidth, sliderHeight);
  
  // 创建复选框控件
  checkboxes.aiLoveInteraction = createCheckbox('AI与爱互动', ruleParams.aiLoveInteraction);
  checkboxes.aiLoveInteraction.position(startX, startY + spacingY * 6);
  
  // 创建按钮
  buttons.reset = createButton('重置');
  buttons.reset.position(startX, startY + spacingY * 7);
  buttons.reset.mousePressed(initializeGrid);
  
  buttons.clear = createButton('清空');
  buttons.clear.position(startX + 60, startY + spacingY * 7);
  buttons.clear.mousePressed(clearGrid);
  
  buttons.addLove = createButton('添加爱');
  buttons.addLove.position(startX, startY + spacingY * 7 + 30);
  buttons.addLove.mousePressed(addLoveBurst);
  
  buttons.addCancer = createButton('添加癌');
  buttons.addCancer.position(startX + 60, startY + spacingY * 7 + 30);
  buttons.addCancer.mousePressed(addCancerBurst);
  
  buttons.addAI = createButton('添加AI');
  buttons.addAI.position(startX + 120, startY + spacingY * 7 + 30);
  buttons.addAI.mousePressed(addAIBurst);
  
  buttons.toggleUI = createButton('隐藏UI');
  buttons.toggleUI.position(startX, startY + spacingY * 7 + 60);
  buttons.toggleUI.mousePressed(toggleUI);
}

// 更新UI控件状态
function updateUIControls() {
  // 更新参数值
  ruleParams.loveSpreadThreshold = sliders.loveSpread.value();
  ruleParams.cancerSpreadThreshold = sliders.cancerSpread.value();
  ruleParams.loveOvercomesCancer = sliders.loveOvercomes.value();
  ruleParams.aiSurviveThreshold = sliders.aiSurvive.value();
  ruleParams.loveSurviveThreshold = sliders.loveSurvive.value();
  ruleParams.overcrowdingThreshold = sliders.overcrowding.value();
  ruleParams.aiLoveInteraction = checkboxes.aiLoveInteraction.checked();
  
  // 显示参数标签和值
  let startX = cols * cellSize + 30;
  let startY = 180;
  let spacingY = 40;
  
  fill(0);
  textAlign(LEFT, CENTER);
  textSize(12);
  
  text(`爱传播阈值: ${ruleParams.loveSpreadThreshold}`, startX, startY - 10);
  text(`癌传播阈值: ${ruleParams.cancerSpreadThreshold}`, startX, startY + spacingY - 10);
  text(`爱战胜癌阈值: ${ruleParams.loveOvercomesCancer}`, startX, startY + spacingY * 2 - 10);
  text(`AI存活阈值: ${ruleParams.aiSurviveThreshold}`, startX, startY + spacingY * 3 - 10);
  text(`爱存活阈值: ${ruleParams.loveSurviveThreshold}`, startX, startY + spacingY * 4 - 10);
  text(`过度拥挤阈值: ${ruleParams.overcrowdingThreshold}`, startX, startY + spacingY * 5 - 10);
}

// 切换UI显示状态
function toggleUI() {
  showUI = !showUI;
  
  // 更新按钮文本
  if (showUI) {
    buttons.toggleUI.html('隐藏UI');
    // 显示所有控件
    for (let key in sliders) {
      sliders[key].style('visibility', 'visible');
    }
    for (let key in checkboxes) {
      checkboxes[key].style('visibility', 'visible');
    }
    for (let key in buttons) {
      if (key !== 'toggleUI') {
        buttons[key].style('visibility', 'visible');
      }
    }
  } else {
    buttons.toggleUI.html('显示UI');
    // 隐藏所有控件，除了toggleUI按钮
    for (let key in sliders) {
      sliders[key].style('visibility', 'hidden');
    }
    for (let key in checkboxes) {
      checkboxes[key].style('visibility', 'hidden');
    }
    for (let key in buttons) {
      if (key !== 'toggleUI') {
        buttons[key].style('visibility', 'hidden');
      }
    }
  }
}

// 创建2D数组
function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

// 初始化网格
function initializeGrid() {
  // 重置代数计数
  generation = 0;
  
  // 随机放置一些初始状态
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let r = random(1);
      if (r < 0.1) {
        grid[i][j] = LOVE; // 10%的概率是爱
      } else if (r < 0.13) {
        grid[i][j] = CANCER; // 3%的概率是癌
      } else if (r < 0.18) {
        grid[i][j] = AI; // 5%的概率是AI
      } else {
        grid[i][j] = EMPTY; // 82%的概率是空
      }
    }
  }
  
  // 清空nextGrid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      nextGrid[i][j] = 0;
    }
  }
}

// 清空网格
function clearGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = EMPTY;
      nextGrid[i][j] = EMPTY;
    }
  }
  generation = 0;
}

// 计算下一代
function computeNextGeneration() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // 获取当前状态
      let state = grid[i][j];
      
      // 统计邻居状态
      let neighbors = countNeighbors(grid, i, j);
      let loveCount = neighbors[LOVE];
      let cancerCount = neighbors[CANCER];
      let aiCount = neighbors[AI];
      
      // 规则1: 爱的传播 - 如果一个空单元格周围有足够的爱，它会变成爱
      if (state === EMPTY && loveCount >= ruleParams.loveSpreadThreshold) {
        nextGrid[i][j] = LOVE;
      }
      // 规则2: 癌的侵蚀 - 如果一个单元格（包括爱）周围有足够的癌，它会变成癌
      else if (cancerCount >= ruleParams.cancerSpreadThreshold) {
        nextGrid[i][j] = CANCER;
      }
      // 规则3: AI与爱的互动 - 如果周围有足够的AI和爱，会产生更多AI
      else if (ruleParams.aiLoveInteraction && (state === EMPTY || state === LOVE) && aiCount >= 1 && loveCount >= 1) {
        nextGrid[i][j] = AI;
      }
      // 规则4: 爱战胜癌 - 如果一个癌单元格周围有足够的爱，它会转变为爱
      else if (state === CANCER && loveCount >= ruleParams.loveOvercomesCancer) {
        nextGrid[i][j] = LOVE;
      }
      // 规则5: AI的演化 - AI在适当条件下可以持续存在
      else if (state === AI && aiCount >= ruleParams.aiSurviveThreshold) {
        nextGrid[i][j] = AI;
      }
      // 规则6: 爱的衰减 - 如果爱周围没有足够的支持，会消失
      else if (state === LOVE && loveCount < ruleParams.loveSurviveThreshold) {
        nextGrid[i][j] = EMPTY;
      }
      // 规则7: 过度拥挤导致消亡 - 任何单元格如果周围单元格过多，会变为空
      else if ((loveCount + cancerCount + aiCount) >= ruleParams.overcrowdingThreshold) {
        nextGrid[i][j] = EMPTY;
      }
      // 其他情况保持原状态
      else {
        nextGrid[i][j] = state;
      }
    }
  }
}

// 统计邻居状态
function countNeighbors(grid, x, y) {
  let counts = [0, 0, 0, 0]; // 统计每种状态的数量
  
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // 排除自身
      if (i === 0 && j === 0) continue;
      
      // 计算邻居坐标（考虑环绕边界）
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      
      // 统计各种状态
      let state = grid[col][row];
      counts[state]++;
    }
  }
  
  return counts;
}

// 更新网格
function updateGrid() {
  // 交换网格
  let temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

// 添加一批爱
function addLoveBurst() {
  for (let i = 0; i < 20; i++) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    grid[x][y] = LOVE;
  }
}

// 添加一批癌
function addCancerBurst() {
  for (let i = 0; i < 20; i++) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    grid[x][y] = CANCER;
  }
}

// 添加一批AI
function addAIBurst() {
  for (let i = 0; i < 20; i++) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    grid[x][y] = AI;
  }
}

// 显示统计信息
function displayStats() {
  let startX = cols * cellSize + 30;
  let startY = 20;
  
  // 计算百分比
  let total = cols * rows;
  let lovePercent = (stats.love / total * 100).toFixed(1);
  let cancerPercent = (stats.cancer / total * 100).toFixed(1);
  let aiPercent = (stats.ai / total * 100).toFixed(1);
  let emptyPercent = (stats.empty / total * 100).toFixed(1);
  
  // 确定主导状态
  let dominantState = "空";
  let dominantColor = color(100, 100, 100);
  let maxCount = stats.empty;
  
  if (stats.love > maxCount) { 
    dominantState = "爱"; 
    maxCount = stats.love; 
    dominantColor = color(255, 105, 180);
  }
  if (stats.cancer > maxCount) { 
    dominantState = "癌"; 
    maxCount = stats.cancer; 
    dominantColor = color(50, 50, 50);
  }
  if (stats.ai > maxCount) { 
    dominantState = "AI"; 
    maxCount = stats.ai; 
    dominantColor = color(255, 0, 0);
  }
  
  // 绘制统计信息
  textAlign(LEFT, CENTER);
  textSize(18);
  fill(0);
  text(`元胞自动机统计 (第${generation}代)`, startX, startY);
  
  textSize(14);
  fill(255, 105, 180);
  text(`爱: ${stats.love} (${lovePercent}%)`, startX, startY + 30);
  
  fill(50, 50, 50);
  text(`癌: ${stats.cancer} (${cancerPercent}%)`, startX, startY + 50);
  
  fill(255, 0, 0);
  text(`AI: ${stats.ai} (${aiPercent}%)`, startX, startY + 70);
  
  fill(100);
  text(`空: ${stats.empty} (${emptyPercent}%)`, startX, startY + 90);
  
  fill(dominantColor);
  text(`主导状态: ${dominantState} (${(maxCount/total*100).toFixed(1)}%)`, startX, startY + 120);
  
  // 绘制系统说明
  textSize(12);
  fill(0);
  let descY = startY + spacingY * 8 + 30;
  text(`系统说明:`, startX, descY);
  text(`- 这是一个元胞自动机系统，模拟爱、癌和AI的相互作用`, startX, descY + 20);
  text(`- 每个单元格根据周围邻居的状态变化`, startX, descY + 40); 
  text(`- 通过调整上方参数可以改变系统规则`, startX, descY + 60);
  text(`- 观察不同规则下系统的整体演化趋势`, startX, descY + 80);
  
  // 绘制规则说明
  text(`规则说明:`, startX, descY + 110);
  text(`规则1: 空单元格周围有足够的爱会变成爱`, startX, descY + 130);
  text(`规则2: 单元格周围有足够的癌会变成癌`, startX, descY + 150);
  text(`规则3: 空/爱单元格周围有AI和爱会变成AI`, startX, descY + 170);
  text(`规则4: 癌单元格周围有足够的爱会变成爱`, startX, descY + 190);
  text(`规则5: AI单元格需要周围有足够的AI才能存活`, startX, descY + 210);
  text(`规则6: 爱单元格需要周围有足够的爱才能存活`, startX, descY + 230);
  text(`规则7: 任何单元格周围过于拥挤会变为空`, startX, descY + 250);
}

// 响应鼠标点击，添加新元素
function mouseClicked() {
  // 只处理网格区域内的点击
  if (mouseX < cols * cellSize) {
    let i = floor(mouseX / cellSize);
    let j = floor(mouseY / cellSize);
    
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      // 循环切换状态：EMPTY -> LOVE -> CANCER -> AI -> EMPTY
      grid[i][j] = (grid[i][j] + 1) % 4;
    }
  }
  
  return false; // 防止触发默认事件
}

// 鼠标拖动也可以添加元素
function mouseDragged() {
  // 只处理网格区域内的拖动
  if (mouseX < cols * cellSize) {
    let i = floor(mouseX / cellSize);
    let j = floor(mouseY / cellSize);
    
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      // 按住Shift键时添加爱
      if (keyIsDown(SHIFT)) {
        grid[i][j] = LOVE;
      }
      // 按住Ctrl/Cmd键时添加癌
      else if (keyIsDown(CONTROL) || keyIsDown(COMMAND)) {
        grid[i][j] = CANCER;
      }
      // 按住Alt键时添加AI
      else if (keyIsDown(ALT)) {
        grid[i][j] = AI;
      }
      // 不按任何键时切换状态
      else {
        grid[i][j] = (grid[i][j] + 1) % 4;
      }
    }
  }
  
  return false; // 防止触发默认事件
}

// 按下空格键暂停/继续
let paused = false;
function keyPressed() {
  if (key === ' ') {
    paused = !paused;
    if (paused) {
      noLoop();
    } else {
      loop();
    }
  } else if (key === 'r' || key === 'R') {
    // 重置网格
    initializeGrid();
    if (paused) {
      redraw(); // 如果暂停状态，强制重绘一次
    }
  } else if (key === 'c' || key === 'C') {
    // 清空网格
    clearGrid();
    if (paused) {
      redraw();
    }
  } else if (key === 'l' || key === 'L') {
    // 添加一批爱
    addLoveBurst();
  } else if (key === 'n' || key === 'N') {
    // 添加一批癌
    addCancerBurst();
  } else if (key === 'a' || key === 'A') {
    // 添加一批AI
    addAIBurst();
  } else if (key === 'h' || key === 'H') {
    // 切换UI显示
    toggleUI();
  }
}

// 显示说明文字
function drawInstructions() {
  push();
  fill(0);
  textAlign(LEFT, BOTTOM);
  textSize(12);
  let instructions = "点击: 切换状态 | 拖动+Shift: 添加爱 | 拖动+Ctrl: 添加癌 | 拖动+Alt: 添加AI | 空格: 暂停/继续 | R: 重置 | C: 清空 | L: 添加爱批量 | N: 添加癌批量 | A: 添加AI批量 | H: 隐藏/显示UI";
  text(instructions, 10, height - 10);
  pop();
}