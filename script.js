const boardSize = 10;
let selectedCells = [];
let wordsToFind = [];
let foundWords = new Set();
let board = [];
let timerInterval;
let timeLeft = 60;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
  setDifficulty('easy');
});

function setDifficulty(level) {
  fetch('assets/words.json')
    .then(res => res.json())
    .then(data => {
      wordsToFind = data[level];
      foundWords.clear();
      resetTimer();
      resetScore();
      setupWordList(wordsToFind);
      generateBoard(wordsToFind);
    });
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

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        const han = String.fromCharCode(44032 + Math.floor(Math.random() * 11172));
        board[r][c] = han;
      }
    }
  }

  drawBoard();
}

function placeWord(word) {
  const directions = [[0,1],[1,0],[1,1],[-1,1]];
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
        const r = row + dir[0] * i;
        const c = col + dir[1] * i;
        board[r][c] = word[i];
      }
      return;
    }
  }
}

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
