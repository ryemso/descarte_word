let boardSize = 10;
let wordList = [];
let score = 0;
let timer;
let timeLeft = 60;
let selectedCells = [];

async function setDifficulty(level) {
  const res = await fetch('words.json');
  const data = await res.json();
  wordList = data[level];
  fillers = data.fillers;
  generateBoard(wordList, fillers);
  document.getElementById('score').textContent = 0;
  document.getElementById('timer').textContent = timeLeft;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function generateBoard(words, fillers) {
  const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
  const directions = [
    { x: 1, y: 0 }, // 가로
    { x: 0, y: 1 }  // 세로만 허용
  ];

  words.forEach(word => {
    let placed = false;
    while (!placed) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);

      if (
        row + dir.y * word.length <= boardSize &&
        col + dir.x * word.length <= boardSize
      ) {
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.y * i;
          const c = col + dir.x * i;
          if (board[r][c] && board[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            board[row + dir.y * i][col + dir.x * i] = word[i];
          }
          placed = true;
        }
      }
    }
  });

  // 주변을 의미 있는 단어로 채움 (2글자 filler 단어 기준)
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        board[r][c] = filler[Math.floor(Math.random() * filler.length)];
      }
    }
  }

  renderBoard(board);
  renderWordList(words);
}

function renderBoard(board) {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;

  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = cell;
      div.dataset.row = i;
      div.dataset.col = j;
      div.addEventListener("click", () => handleCellClick(div));
      boardEl.appendChild(div);
    });
  });
}

function renderWordList(words) {
  const listEl = document.getElementById("word-list");
  listEl.innerHTML = "";
  words.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    listEl.appendChild(li);
  });
}

function handleCellClick(cell) {
  cell.classList.toggle("selected");
  selectedCells.push(cell);
  const selectedWord = selectedCells.map(c => c.textContent).join("");

  const foundIndex = wordList.indexOf(selectedWord);
  if (foundIndex !== -1) {
    selectedCells.forEach(c => c.classList.add("found"));
    wordList.splice(foundIndex, 1);
    document.querySelectorAll("#word-list li")[foundIndex].style.textDecoration = "line-through";
    score += 10;
    document.getElementById("score").textContent = score;
    if (wordList.length === 0) endGame();
  }

  if (selectedCells.length > 10 || selectedWord.length > 6) {
    selectedCells.forEach(c => c.classList.remove("selected"));
    selectedCells = [];
  }
}

function endGame() {
  clearInterval(timer);
  document.getElementById("final-score").textContent = score;
  document.getElementById("overlay").classList.remove("hidden");
}
