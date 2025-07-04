let selectedCells = [];
let correctWords = [];
let currentWord = "";
let score = 0;
let timer;
let timeLeft = 60;

function setDifficulty(level) {
  // 난이도에 따른 단어/판 설정 생략
  resetGame();
  startGame(level);
}

function startGame(level) {
  // 실제 랜덤 보드 생성 생략
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("score").textContent = "0";
  score = 0;
  selectedCells = [];
  correctWords = [];
  // 타이머 시작, 단어 세팅 생략
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
