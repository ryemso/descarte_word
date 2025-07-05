// script.js

let selectedCells = [];
let foundWords = new Set();
let score = 0;
let timer;
let timeLeft = 60;
let currentWords = [];
let boardData = [];
let easterEggAudio = new Audio('./assets/jojo.mp3');

function createEmptyBoard(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function randomFiller(fillers) {
  return fillers[Math.floor(Math.random() * fillers.length)];
}

function placeWordsOnBoard(board, words, fillers) {
  const size = board.length;
  words.forEach(word => {
    const length = word.length;
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      const isHorizontal = Math.random() < 0.5;
      const maxRow = isHorizontal ? size : size - length;
      const maxCol = isHorizontal ? size - length : size;

      const row = Math.floor(Math.random() * maxRow);
      const col = Math.floor(Math.random() * maxCol);

      let canPlace = true;
      for (let i = 0; i < length; i++) {
        const r = row + (isHorizontal ? 0 : i);
        const c = col + (isHorizontal ? i : 0);
        if (board[r][c] !== "" && board[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < length; i++) {
          const r = row + (isHorizontal ? 0 : i);
          const c = col + (isHorizontal ? i : 0);
          board[r][c] = word[i];
        }
        placed = true;
      }
      attempts++;
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === "") {
        board[r][c] = randomFiller(fillers);
      }
    }
  }

  return board;
}

function renderBoard(board, words) {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  selectedCells = [];
  foundWords = new Set();
  document.getElementById("score").textContent = 0;

  const size = board.length;
  boardData = board;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = board[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleCellClick(cell, words));
      gameBoard.appendChild(cell);
    }
  }

  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
}

function handleCellClick(cell, words) {
  const index = selectedCells.findIndex(
    c => c.dataset.row === cell.dataset.row && c.dataset.col === cell.dataset.col
  );
  if (index >= 0) {
    selectedCells.splice(index, 1);
    cell.classList.remove("selected");
  } else {
    selectedCells.push(cell);
    cell.classList.add("selected");
  }

  const selectedText = selectedCells.map(c => c.textContent).join("");
  const reversedText = selectedCells.map(c => c.textContent).reverse().join("");

  for (const word of words) {
    if ((selectedText === word || reversedText === word) && !foundWords.has(word)) {
      selectedCells.forEach(c => c.classList.add("found"));
      foundWords.add(word);
      score++;
      document.getElementById("score").textContent = score;
      selectedCells = [];

      if (word === "조조") {
        easterEggAudio.play();
      }
      break;
    }
  }
}

function displayWords(words) {
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  words.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    list.appendChild(li);
  });
}

function startGame(difficulty) {
  fetch("./assets/words.json")
    .then(res => res.json())
    .then(data => {
      const config = data[difficulty];
      const fillers = data.fillers || [];
      const gridSize = config.gridSize;
      const words = config.words;
      const fixedBoard = config.fixedBoard || null;

      currentWords = words;
      displayWords(words);
      timeLeft = 60;
      document.getElementById("timer").textContent = timeLeft + "초";
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft + "초";
        if (timeLeft === 0) {
          clearInterval(timer);
          alert("\u23f0 \uc2dc간이 종료되었습니다!");
        }
      }, 1000);

      if (fixedBoard) {
        renderBoard(fixedBoard, words);
      } else {
        const emptyBoard = createEmptyBoard(gridSize);
        const wordBoard = placeWordsOnBoard(emptyBoard, words, fillers);
        renderBoard(wordBoard, words);
      }
    });
}

document.getElementById("demoBtn").addEventListener("click", () => startGame("demo"));
document.getElementById("easyBtn").addEventListener("click", () => startGame("easy"));
document.getElementById("mediumBtn").addEventListener("click", () => startGame("medium"));
document.getElementById("hardBtn").addEventListener("click", () => startGame("hard"));
