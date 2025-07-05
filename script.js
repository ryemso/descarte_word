// Updated script.js to ensure square grid rendering

const boardElement = document.getElementById("board");
const wordListElement = document.getElementById("word-list");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("final-score");

let selectedCells = [];
let foundWords = [];
let wordsToFind = [];
let score = 0;
let timer;
let timeLeft = 60;
let board = [];
let currentDifficulty = "easy";
let fixedBoard = null;

async function loadWords() {
  const res = await fetch("./assets/words.json");
  return await res.json();
}

function resetGame() {
  clearInterval(timer);
  selectedCells = [];
  foundWords = [];
  score = 0;
  scoreElement.textContent = score;
  timeLeft = 60;
  timerElement.textContent = timeLeft + "초";
  overlay.classList.add("hidden");
}

function setDifficulty(level) {
  currentDifficulty = level;
  resetGame();
  initGame();
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft + "초";
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  overlay.classList.remove("hidden");
  finalScore.textContent = score;
}

function handleRestart() {
  setDifficulty(currentDifficulty);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function fillBoard(gridSize, wordList, fixedBoard = null, fillers = []) {
  board = [];
  if (fixedBoard) {
    board = fixedBoard;
  } else {
    // Fill the board with filler letters first
    for (let i = 0; i < gridSize; i++) {
      board[i] = [];
      for (let j = 0; j < gridSize; j++) {
        board[i][j] = shuffleArray(fillers)[0].charAt(0);
      }
    }
    // Place words horizontally or vertically
    for (const word of wordList) {
      let placed = false;
      while (!placed) {
        const dir = Math.random() > 0.5 ? "H" : "V";
        const row = Math.floor(Math.random() * (dir === "H" ? gridSize : gridSize - word.length));
        const col = Math.floor(Math.random() * (dir === "H" ? gridSize - word.length : gridSize));

        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = dir === "H" ? row : row + i;
          const c = dir === "H" ? col + i : col;
          if (board[r][c] !== fillers[0].charAt(0)) {
            fits = false;
            break;
          }
        }
        if (fits) {
          for (let i = 0; i < word.length; i++) {
            const r = dir === "H" ? row : row + i;
            const c = dir === "H" ? col + i : col;
            board[r][c] = word[i];
          }
          placed = true;
        }
      }
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${board.length}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = document.createElement("div");
      cell.textContent = board[row][col];
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

function renderWordList(words) {
  wordListElement.innerHTML = "";
  words.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    wordListElement.appendChild(li);
  });
}

function handleCellClick(e) {
  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const coord = `${row},${col}`;
  if (!selectedCells.includes(coord)) {
    selectedCells.push(coord);
    cell.classList.add("selected");
  } else {
    selectedCells = selectedCells.filter((c) => c !== coord);
    cell.classList.remove("selected");
  }

  checkSelectedCells();
}

function checkSelectedCells() {
  const selectedWord = selectedCells.map((coord) => {
    const [r, c] = coord.split(",").map(Number);
    return board[r][c];
  }).join("");

  const reversedWord = selectedWord.split("").reverse().join("");

  for (const word of wordsToFind) {
    if ((selectedWord === word || reversedWord === word) && !foundWords.includes(word)) {
      foundWords.push(word);
      score += 10;
      scoreElement.textContent = score;
      selectedCells.forEach((coord) => {
        const [r, c] = coord.split(",").map(Number);
        const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
        if (cell) cell.classList.add("found");
      });
      selectedCells = [];
      if (foundWords.length === wordsToFind.length) endGame();
      break;
    }
  }
}

async function initGame() {
  const data = await loadWords();
  const { words, gridSize, fixedBoard } = data[currentDifficulty];
  const fillers = data.fillers;
  wordsToFind = words;
  fillBoard(gridSize, words, fixedBoard || null, fillers);
  renderBoard();
  renderWordList(words);
  startTimer();
}
