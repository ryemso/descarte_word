let selectedCells = [];
let correctWords = [];
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 60;
let wordsData = {};

fetch("assets/words.json")
  .then(response => response.json())
  .then(data => {
    wordsData = data;
  });

function setDifficulty(level) {
  resetGame();
  if (wordsData[level]) {
    startGame(level, wordsData[level]);
  } else {
    alert("단어 데이터를 불러올 수 없습니다.");
  }
}

function startGame(level, words) {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("score").textContent = "0";
  score = 0;
  selectedCells = [];
  correctWords = [];

  createBoard(words);
  displayWordList(words);

  timeLeft = 60;
  document.getElementById("timer").textContent = `${timeLeft}초`;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `${timeLeft}초`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("final-score").textContent = score;
      document.getElementById("overlay").classList.remove("hidden");
    }
  }, 1000);
}

function createBoard(words) {
  const boardSize = 10;
  const board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => "")
  );

  // 단어 삽입 (가로 또는 세로)
  words.forEach(word => {
    const isHorizontal = Math.random() < 0.5;
    const maxRow = isHorizontal ? boardSize : boardSize - word.length;
    const maxCol = isHorizontal ? boardSize - word.length : boardSize;
    let placed = false;

    while (!placed) {
      const row = Math.floor(Math.random() * maxRow);
      const col = Math.floor(Math.random() * maxCol);
      let fits = true;

      for (let i = 0; i < word.length; i++) {
        const r = isHorizontal ? row : row + i;
        const c = isHorizontal ? col + i : col;
        if (board[r][c] !== "" && board[r][c] !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = isHorizontal ? row : row + i;
          const c = isHorizontal ? col + i : col;
          board[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  // 빈칸 무작위 채우기
  const characters = "가나다라마바사아자차카타파하";
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === "") {
        board[r][c] = characters[Math.floor(Math.random() * characters.length)];
      }
    }
  }

  // 보드 DOM 렌더링
  const boardContainer = document.getElementById("board");
  boardContainer.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.textContent = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      cell.addEventListener("click", () => handleCellClick(cell));
      boardContainer.appendChild(cell);
    });
  });
}

function displayWordList(words) {
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  words.forEach(word => {
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
  const wordListItems = document.querySelectorAll("#word-list li");
  wordListItems.forEach(item => {
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

      const allFound = [...wordListItems].every(item =>
        item.classList.contains("found")
      );
      if (allFound) {
        clearInterval(timer);
        document.getElementById("final-score").textContent = score;
        document.getElementById("overlay").classList.remove("hidden");
      }
    }
  });
}

function resetGame() {
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("word-list").innerHTML = "";
  document.getElementById("board").innerHTML = "";
  score = 0;
  currentWord = "";
  selectedCells = [];
  correctWords = [];
  clearInterval(timer);
  document.getElementById("score").textContent = "0";
}
