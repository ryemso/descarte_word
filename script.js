const boardSize = 10;
let selectedCells = [];
let wordsToFind = [];
let foundWords = new Set();
let board = [];
let timerInterval;
let timeLeft = 60;
let score = 0;

// 한글 단어 리스트 (내장형)
const wordsJSON = {
  easy: ["사과", "노트", "바나나", "강아지", "하늘"],
  medium: ["학교", "컴퓨터", "자전거", "연필", "구름"],
  hard: ["인공지능", "알고리즘", "프로그래밍", "데이터분석", "컴파일러"]
};

// ⭐ 이벤트 바인딩 (defer로 보장됨)
document.getElementById('easy-btn').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('medium-btn').addEventListener('click', () => setDifficulty('medium'));
document.getElementById('hard-btn').addEventListener('click', () => setDifficulty('hard'));

// 초기 로딩
setDifficulty('easy');

// ==================== 게임 설정 ====================
function setDifficulty(level) {
  wordsToFind = wordsJSON[level] || [];
  foundWords.clear();
  resetTimer();
  resetScore();
  setupWordList(wordsToFind);
  generateBoard(wordsToFind);
}

function setupWordList(words) {
  const list = document.getElementById('word-list');
  list.innerHTML = '';
  words.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    list.appendChild(li);
  });
}

function generateBoard(words) {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));

  words.forEach(word => placeWord(word));

  // 나머지 칸 채우기
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        board[r][c] = String.fromCharCode(44032 + Math.floor(Math.random() * 11172));
      }
    }
  }

  drawBoard();
}

function placeWord(word) {
  const directions = [[0,1], [1,0], [1,1], [-1,1]];
  for (let attempt = 0; attempt < 100; attempt++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    let fit = true;
    for (let i = 0; i < word.length; i++) {
      const r = row + dir[0] * i;
      const c = col + dir[1] * i;
      if (r < 0 || c < 0 || r >= boardSize || c >= boardSize || (board[r][c] && board[r][c] !== word[i])) {
        fit = false;
        break;
      }
    }

    if (fit) {
      for (let i = 0; i < word.length; i++) {
        board[row + dir[0] * i][col + dir[1] * i] = word[i];
      }
      return;
    }
  }
}

// ==================== 렌더링 및 선택 ====================
function drawBoard() {
  const boardContainer = document.getElementById('board');
  boardContainer.innerHTML = '';
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.textContent = board[r][c];

      cell.addEventListener('mousedown', selectStart);
      cell.addEventListener('mouseenter', selectMove);
      cell.addEventListener('mouseup', selectEnd);

      boardContainer.appendChild(cell);
    }
  }
  document.addEventListener('mouseup', selectEnd);
}

function selectStart(e) {
  clearSelection();
  e.target.classList.add('selected');
  selectedCells.push(e.target);
}

function selectMove(e) {
  if (e.buttons !== 1) return;
  if (!selectedCells.includes(e.target)) {
    e.target.classList.add('selected');
    selectedCells.push(e.target);
  }
}

function selectEnd() {
  if (selectedCells.length < 2) return;
  const word = selectedCells.map(cell => cell.textContent).join('');
  if (wordsToFind.includes(word) && !foundWords.has(word)) {
    selectedCells.forEach(cell => cell.classList.add('correct'));
    document.querySelectorAll('#word-list li').forEach(li => {
      if (li.textContent === word) li.classList.add('found');
    });
    foundWords.add(word);
    score += 100;
    updateScore();
    if (foundWords.size === wordsToFind.length) {
      clearInterval(timerInterval);
      score += timeLeft * 2;
      updateScore();
      document.getElementById('final-score').textContent = score;
      document.getElementById('overlay').classList.remove('hidden');
    }
  }
  clearSelection();
}

function clearSelection() {
  document.querySelectorAll('.cell.selected').forEach(cell => cell.classList.remove('selected'));
  selectedCells = [];
}

// ==================== 점수 & 타이머 ====================
function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('final-score').textContent = score;
      document.getElementById('overlay').classList.remove('hidden');
    }
  }, 1000);
}

function resetScore() {
  score = 0;
  updateScore();
}

function updateScore() {
  document.getElementById('score').textContent = score;
}
