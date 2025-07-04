// 📜 script.js
let board = [];
let boardSize = 10;
let selectedCells = [];
let correctWords = [];
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 60;
let words = {};

fetch("./assets/words.json")
  .then(res => res.json())
  .then(data => {
    words = data;
  })
  .catch(err => alert("단어 데이터를 불러오지 못했습니다."));

function setDifficulty(level) {
  if (!words[level]) return;
  resetGame();
  generateBoard(words[level]);
  renderBoard();
  renderWordList(words[level]);
  startTimer();
}

function generateBoard(wordList) {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));
  const directions = [ { x: 0, y: 1 }, { x: 1, y: 0 } ]; // 가로, 세로

  wordList.forEach(word => {
    let placed = false;
    while (!placed) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * (boardSize - (dir.x ? word.length : 0)));
      const col = Math.floor(Math.random() * (boardSize - (dir.y ? word.length : 0)));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir.x * i;
        const c = col + dir.y * i;
        if (board[r][c] && board[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.x * i;
          const c = col + dir.y * i;
          board[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  const fillerWords = words.easy.concat(words.medium, words.hard);
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        const filler = fillerWords[Math.floor(Math.random() * fillerWords.length)];
        board[r][c] = filler[Math.floor(Math.random() * filler.length)];
      }
    }
  }
}

function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = board[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleCellClick(cell));
      boardEl.appendChild(cell);
    }
  }
}

function renderWordList(wordList) {
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  wordList.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    list.appendChild(li);
  });
}

function handleCellClick(cell) {
  if (cell.classList.contains("correct")) return;

  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    selectedCells = selectedCells.filter(c => c !== cell);
    currentWord = currentWord.slice(0, -1);
  } else {
    cell.classList.add("selected");
    selectedCells.push(cell);
    currentWord += cell.textContent;
  }

  checkWord();
}

function checkWord() {
  const items = document.querySelectorAll("#word-list li");
  items.forEach((item, index) => {
    if (item.textContent === currentWord && !item.classList.contains("found")) {
      item.classList.add("found");
      selectedCells.forEach(c => {
        c.classList.remove("selected");
        c.classList.add("correct");
      });
      selectedCells = [];
      currentWord = "";
      score += 5;
      document.getElementById("score").textContent = score;

      if ([...items].every(i => i.classList.contains("found"))) {
        endGame();
      }
    }
  });
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  document.getElementById("timer").textContent = `${timeLeft}초`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `${timeLeft}초`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  document.getElementById("final-score").textContent = score;
  document.getElementById("overlay").classList.remove("hidden");
}

function resetGame() {
  clearInterval(timer);
  score = 0;
  selectedCells = [];
  currentWord = "";
  correctWords = [];
  document.getElementById("score").textContent = "0";
  document.getElementById("timer").textContent = "60초";
  document.getElementById("board").innerHTML = "";
  document.getElementById("word-list").innerHTML = "";
  document.getElementById("overlay").classList.add("hidden");
} 
