let boardSize = 10;
let board = [];
let selectedCells = [];
let wordList = [];
let words = {};
let timer = null;
let timeLeft = 60;
let score = 0;

// 단어 데이터 로드 완료 후에만 게임 시작 가능하도록 DOMContentLoaded에 fetch 삽입
document.addEventListener("DOMContentLoaded", () => {
  fetch("./assets/words.json")
    .then((res) => res.json())
    .then((data) => {
      words = data;
      console.log("단어 데이터 로드 완료:", words);
      // 초기 로딩 시 기본 난이도 지정
      setDifficulty("easy");
    })
    .catch((err) => {
      console.error("words.json 로드 실패:", err);
      alert("단어 데이터를 불러올 수 없습니다. 관리자에게 문의하세요.");
    });
});

function setDifficulty(level) {
  wordList = [...words[level]];
  score = 0;
  document.getElementById("score").textContent = "0";
  generateBoard(wordList);
  renderBoard();
  renderWordList();
  startTimer();
}

function generateBoard(wordList) {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));

  const directions = [
    { x: 0, y: 1 },  // 가로
    { x: 1, y: 0 }   // 세로
  ];

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

  // 채우기: 의미 있는 글자 조합으로 구성된 fillerWords 사용
  const fillerWords = words.easy.concat(words.medium).concat(words.hard);
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
      cell.addEventListener("click", handleCellClick);
      boardEl.appendChild(cell);
    }
  }
}

function renderWordList() {
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  wordList.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    list.appendChild(li);
  });
}

// ✨ 위치: handleCellClick 함수 **위쪽** 아무 곳에 추가
function areCellsLinear(cells) {
  if (cells.length <= 1) return true;

  const rows = cells.map(c => +c.dataset.row);
  const cols = cells.map(c => +c.dataset.col);

  const sameRow = rows.every(r => r === rows[0]);
  const sameCol = cols.every(c => c === cols[0]);

  if (sameRow) {
    const sorted = cols.slice().sort((a, b) => a - b);
    return sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
  }

  if (sameCol) {
    const sorted = rows.slice().sort((a, b) => a - b);
    return sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
  }

  return false;
}


function handleCellClick(e) {
  const cell = e.target;
  const r = +cell.dataset.row;
  const c = +cell.dataset.col;

  if (cell.classList.contains("found")) return;
  // ✅ 다시 클릭하면 선택 해제
  if (selectedCells.includes(cell)) {
    cell.classList.remove("selected");
    selectedCells = selectedCells.filter(c => c !== cell);
    return;
  }

  selectedCells.push(cell);
  cell.classList.add("selected");

  const selectedWord = selectedCells.map(c => c.textContent).join("");
  const foundIndex = wordList.findIndex(w => w === selectedWord);
  

    // ✅ 반드시 연속된 선상인지 확인
  if (foundIndex !== -1 && areCellsLinear(selectedCells)) {
    selectedCells.forEach(c => c.classList.add("found"));
    wordList.splice(foundIndex, 1);
    document.querySelectorAll("#word-list li")[foundIndex].style.textDecoration = "line-through";

    score += 10;
    document.getElementById("score").textContent = score;

    selectedCells = [];

    if (wordList.length === 0) endGame();
  } else {
    // 최대 글자 수 초과되면 선택 초기화
    if (selectedCells.length >= 10) {
      selectedCells.forEach(c => c.classList.remove("selected"));
      selectedCells = [];
    }
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  document.getElementById("timer").textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft === 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  document.getElementById("final-score").textContent = score.toString();
  document.getElementById("overlay").classList.remove("hidden");
}
