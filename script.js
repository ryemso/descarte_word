const wordsData = {
  "demo": {
    "gridSize": 8,
    "words": ["사랑", "행복", "친구"],
    "fixedBoard": [
      ["사", "기", "행", "복", "마", "음", "별", "빛"],
      ["랑", "억", "오", "늘", "하", "나", "둘", "셋"],
      ["우", "리", "오", "늘", "눈", "물", "책", "상"],
      ["운", "동", "노", "래", "감", "자", "고", "기"],
      ["바", "람", "구", "름", "하", "늘", "땅", "물"],
      ["꽃", "잎", "나", "무", "숲", "길", "집", "문"],
      ["학", "교", "친", "구", "행", "복", "시", "제"],
      ["가", "족", "구", "모", "형", "제", "조", "조"]
    ]
  },
  "easy": {
    "gridSize": 8,
    "words": ["강아지", "토끼", "햇빛", "방랑"]
  },
  "medium": {
    "gridSize": 10,
    "words": ["필사즉생", "지피지기", "삼인성호", "횡단보도"]
  },
  "hard": {
    "gridSize": 12,
    "words": ["백전불태", "유비무환", "우공이산", "진인사대천명"]
  },
  "fillers": ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"]
};

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
  score = 0;
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
  const config = wordsData[difficulty];
  const fillers = wordsData.fillers || [];

  if (!config) {
    alert(`난이도 "${difficulty}"에 대한 설정이 없습니다.`);
    return;
  }

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
      document.getElementById("final-score").textContent = score;
      document.getElementById("overlay").classList.add("active");
    }
  }, 1000);

  if (fixedBoard) {
    renderBoard(fixedBoard, words);
  } else {
    const emptyBoard = createEmptyBoard(gridSize);
    const wordBoard = placeWordsOnBoard(emptyBoard, words, fillers);
    renderBoard(wordBoard, words);
  }
}

document.getElementById("demoBtn").addEventListener("click", () => startGame("demo"));
document.getElementById("easyBtn").addEventListener("click", () => startGame("easy"));
document.getElementById("mediumBtn").addEventListener("click", () => startGame("medium"));
document.getElementById("hardBtn").addEventListener("click", () => startGame("hard"));
