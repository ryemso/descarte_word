// script.js 전체 코드 (한 글자씩 셀에 배치되도록 수정)

let board = [];
let wordList = [];
let selectedCells = [];
let foundWords = new Set();
let timer;
let timeLeft = 60;
let score = 0;
let currentDifficulty = 'easy';
let gameData = {};

const boardElement = document.getElementById('board');
const wordListElement = document.getElementById('word-list');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const overlayElement = document.getElementById('overlay');
const easterEggAudio = document.getElementById('easter-egg-audio');

fetch('./assets/words.json')
  .then(res => res.json())
  .then(data => {
    gameData = data;
  });

function setDifficulty(level) {
  currentDifficulty = level;
  startGame();
}

function startGame() {
  clearInterval(timer);
  timeLeft = 60;
  score = 0;
  selectedCells = [];
  foundWords.clear();
  timerElement.textContent = '60초';
  scoreElement.textContent = '0';
  overlayElement.classList.add('hidden');

  const config = gameData[currentDifficulty];
  const fillers = gameData.fillers;
  const size = config.gridSize;
  wordList = [...config.words];

  // 고정된 보드가 있는 경우 사용
  if (config.fixedBoard) {
    board = config.fixedBoard;
  } else {
    board = Array.from({ length: size }, () => Array(size).fill(''));
    wordList.forEach(word => placeWord(word, size));
    fillEmptyCells(size, fillers);
  }

  renderBoard();
  renderWordList();
  startTimer();
}

function placeWord(word, size) {
  const wordChars = word.split('');
  let placed = false;

  while (!placed) {
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    const row = Math.floor(Math.random() * (direction === 'horizontal' ? size : size - wordChars.length));
    const col = Math.floor(Math.random() * (direction === 'vertical' ? size : size - wordChars.length));

    let fits = true;
    for (let i = 0; i < wordChars.length; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;
      if (board[r][c] !== '' && board[r][c] !== wordChars[i]) {
        fits = false;
        break;
      }
    }

    if (fits) {
      for (let i = 0; i < wordChars.length; i++) {
        const r = direction === 'horizontal' ? row : row + i;
        const c = direction === 'horizontal' ? col + i : col;
        board[r][c] = wordChars[i];
      }
      placed = true;
    }
  }
}

function fillEmptyCells(size, fillers) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board[r][c]) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)].charAt(0);
        board[r][c] = filler;
      }
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  board.forEach((row, rIdx) => {
    row.forEach((char, cIdx) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = char;
      cell.dataset.row = rIdx;
      cell.dataset.col = cIdx;
      cell.addEventListener('click', () => handleCellClick(cell));
      boardElement.appendChild(cell);
    });
  });
}

function handleCellClick(cell) {
  cell.classList.add('selected');
  selectedCells.push(cell);
  checkWord();
}

function checkWord() {
  const selectedWord = selectedCells.map(cell => cell.textContent).join('');
  const reversedWord = selectedWord.split('').reverse().join('');

  const match = wordList.find(word =>
    word === selectedWord || word === reversedWord || isPermutationMatch(word, selectedWord)
  );

  if (match && !foundWords.has(match)) {
    foundWords.add(match);
    selectedCells.forEach(cell => cell.classList.add('found'));
    wordListElement.querySelectorAll('li').forEach(li => {
      if (li.textContent === match) li.classList.add('found');
    });
    score += match.length;
    scoreElement.textContent = score;
  }
  selectedCells.forEach(cell => cell.classList.remove('selected'));
  selectedCells = [];

  if (foundWords.size === wordList.length) {
    endGame();
  }
}

function isPermutationMatch(word, input) {
  if (word.length !== input.length) return false;
  const sortedWord = word.split('').sort().join('');
  const sortedInput = input.split('').sort().join('');
  return sortedWord === sortedInput;
}

function renderWordList() {
  wordListElement.innerHTML = '';
  wordList.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    wordListElement.appendChild(li);
  });
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `${timeLeft}초`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  finalScoreElement.textContent = score;
  overlayElement.classList.remove('hidden');
}

function handleRestart() {
  startGame();
}
