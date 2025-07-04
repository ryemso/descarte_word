let selectedCells = [];
let correctWords = [];
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 60;

function setDifficulty(level) {
  resetGame();
  startGame(level);
}

function startGame(level) {
  fetch("./assets/words.json")
    .then(response => response.json())
    .then(data => {
      const words = data[level].words;
      const gridSize = data[level].gridSize;

      createBoard(words, gridSize);
      renderWordList(words);
      startTimer();
    })
    .catch(error => console.error("단어 데이터를 불러오는 데 실패했습니다:", error));
}

function createBoard(words, gridSize) {
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  // 빈 그리드 초기화
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  // 단어 삽입 (가로 또는 세로 방향 랜덤)
  words.forEach(word => {
    const direction = Math.random() < 0.5 ? "H" : "V";
    let placed = false;

    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      if (direction === "H" && col + word.length <= gridSize) {
        // 충돌 확인
        if (word.split("").every((ch, i) => grid[row][col + i] === "" || grid[row][col + i] === ch)) {
          word.split("").forEach((ch, i) => grid[row][col + i] = ch);
          placed = true;
        }
      } else if (direction === "V" && row + word.length <= gridSize) {
        if (word.split("").every((ch, i) => grid[row + i][col] === "" || grid[row + i][col] === ch)) {
          word.split("").forEach((ch, i) => grid[row + i][col] = ch);
          placed = true;
        }
      }
    }
  });

  // 빈 칸 채우기 및 DOM 렌더링
  const letters = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허";
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleCellClick(cell));
      board.appendChild(cell);
    }
  }
}

function renderWordList(words) {
  const ul = document.getElementById("word-list");
  ul.innerHTML = "";
  words.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    ul.appendChild(li);
  });
}

function startTimer() {
  timeLeft = 60;
  document.getElementById("timer").textContent = `${timeLeft}초`;
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

      if ([...wordListItems].every(item => item.classList.contains("found"))) {
        clearInterval(timer);
        document.getElementById("final-score").textContent = score;
        document.getElementById("overlay").classList.remove("hidden");
      }
    }
  });
}

function resetGame() {
  clearInterval(timer);
  selectedCells = [];
  correctWords = [];
  currentWord = "";
  score = 0;
  document.getElementById("score").textContent = "0";
  document.getElementById("word-list").innerHTML = "";
  document.getElementById("board").innerHTML = "";
  document.getElementById("overlay").classList.add("hidden");
}
