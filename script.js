const boardSize = 10;
let board = [];
let wordList = [];
let selectedCells = [];
let score = 0;
let timer = 60;
let interval;

async function setDifficulty(level) {
  const res = await fetch("assets/words.json");
  const allWords = await res.json();
  wordList = [...allWords[level]];
  document.getElementById("word-list").innerHTML = wordList.map(w => `<li>${w}</li>`).join("");

  score = 0;
  timer = 60;
  document.getElementById("score").textContent = "0";
  document.getElementById("timer").textContent = "60";
  document.getElementById("overlay").classList.add("hidden");

  generateBoard(wordList);
  startTimer();
}

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    timer--;
    document.getElementById("timer").textContent = timer;
    if (timer === 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(interval);
  document.getElementById("final-score").textContent = score.toString();
  document.getElementById("overlay").classList.remove("hidden");
}

function generateBoard(words) {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(""));
  selectedCells = [];

  words.forEach(word => placeWord(word));
  fillBoardWithTwoLetterWords();
  renderBoard();
}

function placeWord
