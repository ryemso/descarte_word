let wordData = {};
let board = [];
let boardSize = 8;
let selectedCells = [];
let correctWords = [];
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 60;
let currentDifficulty = 'demo';
let gameStarted = false;
let easterEggTriggered = false;

async function initializeWordData() {
  try {
    const response = await fetch("./assets/words.json");
    const data = await response.json();
    wordData = {
      ...data,
      fillers: data.fillers || "가나다라마바사아자차카타파하".split("")
    };
    setDifficulty('demo');
  } catch (error) {
    console.error("단어 데이터를 불러오는 데 실패했습니다:", error);
  }
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const levelData = wordData[difficulty];
  if (!levelData) return;

  document.querySelectorAll('.difficulty-buttons button').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(difficulty + '-btn');
  if (btn) btn.classList.add('active');

  const { words, gridSize, fixedBoard } = levelData;
  const fillers = wordData.fillers;
  boardSize = gridSize;
  resetGame();

  board = fixedBoard ? fixedBoard.map(row => [...row]) : generateBoard(words, fillers);
  renderBoard();
  renderWordList(words);
  startTimer();
}

function generateBoard(words, fillers) {
  const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));

  const directions = [
    { x: 0, y: 1 }, // 가로
    { x: 1, y: 0 }, // 세로
  ];

  words.forEach(word => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts++ < 100) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * (boardSize - (dir.x ? word.length : 0)));
      const col = Math.floor(Math.random() * (boardSize - (dir.y ? word.length : 0)));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dir.x;
        const c = col + i * dir.y;
        if (board[r][c] && board[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = row + i * dir.x;
          const c = col + i * dir.y;
          board[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        board[r][c] = fillers[Math.floor(Math.random() * fillers.length)];
      }
    }
  }

  return board;
}

function renderBoard() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;

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

function renderWordList(words) {
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  words.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    li.dataset.word = word;
    list.appendChild(li);
  });
}

function handleCellClick(cell) {
  if (!gameStarted || cell.classList.contains("correct")) return;

  if (cell.classList.contains("selected")) {
    const index = selectedCells.indexOf(cell);
    if (index === selectedCells.length - 1) {
      cell.classList.remove("selected");
      selectedCells.pop();
      currentWord = currentWord.slice(0, -1);
    }
  } else {
    cell.classList.add("selected");
    selectedCells.push(cell);
    currentWord += cell.textContent;
  }

  checkWord();
}

function checkWord() {
  const items = document.querySelectorAll("#word-list li");
  const currentWordSorted = [...currentWord].sort().join("");

  items.forEach(item => {
    const targetWord = item.dataset.word;
    const sortedTarget = [...targetWord].sort().join("");

    if (!item.classList.contains("found") &&
        (currentWord === targetWord || currentWordSorted === sortedTarget)) {
      item.classList.add("found");
      selectedCells.forEach(c => {
        c.classList.remove("selected");
        c.classList.add("correct");
      });
      selectedCells = [];
      currentWord = "";
      score += targetWord.length * 10;
      document.getElementById("score").textContent = score;

      if ([...items].every(i => i.classList.contains("found"))) {
        endGame(true);
      }
    }
  });

  if (currentWord === "조조" && !easterEggTriggered) triggerEasterEgg();
}

function startTimer() {
  clearInterval(timer);
  gameStarted = true;
  timeLeft = 60;
  document.getElementById("timer").textContent = `${timeLeft}초`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `${timeLeft}초`;
    if (timeLeft <= 0) endGame(false);
  }, 1000);
}

function endGame(won = false) {
  clearInterval(timer);
  gameStarted = false;
  document.getElementById("final-score").textContent = score;
  document.getElementById("overlay").classList.remove("hidden");
  const resultElement = document.getElementById("game-result");
  resultElement.textContent = won ? "🎉 모든 단어를 찾았습니다!" : "⏰ 시간이 끝났습니다!";
}

function resetGame() {
  clearInterval(timer);
  gameStarted = false;
  score = 0;
  selectedCells = [];
  currentWord = "";
  easterEggTriggered = false;
  stopMusic();
  document.getElementById("score").textContent = "0";
  document.getElementById("timer").textContent = "60초";
  document.getElementById("overlay").classList.add("hidden");
}

function handleRestart() {
  document.getElementById("overlay").classList.add("hidden");
  setDifficulty(currentDifficulty);
}

function triggerEasterEgg() {
  easterEggTriggered = true;
  const notification = document.getElementById("easter-egg-notification");
  const audio = document.getElementById("easter-egg-audio");

  selectedCells.forEach(c => {
    c.classList.remove("selected");
    c.classList.add("correct");
    c.style.backgroundColor = "#ff6b6b";
    c.style.color = "white";
  });

  selectedCells = [];
  currentWord = "";

  notification.classList.add("show");
  audio.play().catch(e => console.log("오디오 재생 실패:", e));

  setTimeout(() => notification.classList.remove("show"), 3000);
}

function stopMusic() {
  const audio = document.getElementById("easter-egg-audio");
  audio.pause();
  audio.currentTime = 0;
}

window.addEventListener('DOMContentLoaded', () => {
  initializeWordData();
});

