// 전역 변수
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

// JSON 파일 로드
async function loadWordData() {
  try {
    const response = await fetch('./assets/word.json');
    if (!response.ok) {
      throw new Error('단어 데이터를 불러올 수 없습니다.');
    }
    const data = await response.json();
    
    // 데모용 고정 보드 데이터 추가
    data.demo = {
      "gridSize": 8,
      "words": ["사랑", "행복", "친구"],
      "fixedBoard": [
        ["사", "랑", "행", "복", "마", "음", "별", "빛"],
        ["기", "억", "친", "구", "하", "나", "둘", "셋"],
        ["우", "리", "오", "늘", "눈", "물", "책", "상"],
        ["운", "동", "노", "래", "감", "자", "고", "기"],
        ["바", "람", "구", "름", "하", "늘", "땅", "물"],
        ["꽃", "잎", "나", "무", "숲", "길", "집", "문"],
        ["학", "교", "선", "생", "공", "부", "시", "험"],
        ["가", "족", "부", "모", "형", "제", "자", "매"]
      ]
    };
    
    wordData = data;
    console.log('단어 데이터 로드 완료:', wordData);
  } catch (error) {
    console.error('단어 데이터 로드 실패:', error);
    // 기본값 설정 (JSON 파일 없을 경우)
    wordData = {
      "demo": {
        "gridSize": 8,
        "words": ["사랑", "행복", "친구"],
        "fixedBoard": [
          ["사", "랑", "행", "복", "마", "음", "별", "빛"],
          ["기", "억", "친", "구", "하", "나", "둘", "셋"],
          ["우", "리", "오", "늘", "눈", "물", "책", "상"],
          ["운", "동", "노", "래", "감", "자", "고", "기"],
          ["바", "람", "구", "름", "하", "늘", "땅", "물"],
          ["꽃", "잎", "나", "무", "숲", "길", "집", "문"],
          ["학", "교", "선", "생", "공", "부", "시", "험"],
          ["가", "족", "부", "모", "형", "제", "자", "매"]
        ]
      },
      "easy": {
        "gridSize": 10,
        "words": ["강아지", "토끼", "햇빛"]
      },
      "medium": {
        "gridSize": 12,
        "words": ["필사즉생", "지피지기", "삼인성호"]
      },
      "hard": {
        "gridSize": 14,
        "words": ["지피지기백전불태", "유비무환", "우공이산"]
      },
      "fillers": ["사랑", "기억", "하나", "둘", "셋", "우리", "오늘", "눈물", "마음", "친구", "별빛", "행복", "추억", "감자", "고기", "책상", "운동", "노래"]
    };
  }
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const levelData = wordData[difficulty];
  if (!levelData) {
    console.warn("해당 난이도의 단어를 찾을 수 없습니다:", difficulty);
    return;
  }

  const { words, gridSize, fixedBoard } = levelData;
  const fillers = wordData.fillers || [];

  console.log("선택 난이도:", difficulty, "단어:", words, "격자:", gridSize);

  boardSize = gridSize;
  resetGame();
  
  if (fixedBoard) {
    // 고정 보드 사용 (데모용)
    board = fixedBoard.map(row => [...row]);
  } else {
    // 동적 보드 생성
    generateBoard(words, fillers);
  }
  
  renderBoard();
  renderWordList(words);
  startTimer();
}

function generateBoard(words, fillers) {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));
  const directions = [ { x: 0, y: 1 }, { x: 1, y: 0 } ]; // 가로, 세로

  words.forEach(word => {
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

  // 남은 칸 채우기
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!board[r][c]) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        board[r][c] = filler[Math.floor(Math.random() * filler.length)];
      }
    }
  }
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

  console.log("총 셀 수:", boardSize * boardSize);
}

function renderWordList(words) {
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
  const items = document.querySelectorAll("#word-list li");
  items.forEach((item) => {
    const targetWord = item.textContent;
    const selectedWord = currentWord;

    const isMatch =
      !item.classList.contains("found") &&
      targetWord.length === selectedWord.length &&
      [...targetWord].sort().join("") === [...selectedWord].sort().join("");

    if (isMatch) {
      item.classList.add("found");

      selectedCells.forEach((c) => {
        c.classList.remove("selected");
        c.classList.add("correct");
      });
      selectedCells = [];
      currentWord = "";
      score += 10;
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

function handleRestart() {
  document.getElementById("overlay").classList.add("hidden");
  setDifficulty(currentDifficulty);
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', async () => {
  await loadWordData();
  setDifficulty('demo');
});
