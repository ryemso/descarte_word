// script.js
let wordData;
let selectedCells = [];
let foundWords = new Set();
let difficulty = "demo";
let timerInterval;
let timeRemaining = 60;
let score = 0;

document.addEventListener("DOMContentLoaded", async () => {
  await loadWordData();
  setDifficulty("demo");
});

async function loadWordData() {
  const response = await fetch("./assets/words.json");
  wordData = await response.json();
}

function setDifficulty(level) {
  if (!wordData) {
    console.error("wordData not loaded yet.");
    return;
  }
  difficulty = level;
  startGame();
}

function startGame() {
  clearInterval(timerInterval);
  timeRemaining = 60;
  score = 0;
  selectedCells = [];
  foundWords = new Set();
  document.getElementById("score").textContent = score;
  document.getElementById("timer").textContent = `${timeRemaining}초`;

  const config = wordData[difficulty];
  const gridSize = config.gridSize;
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.setProperty("--grid-size", gridSize);

  const wordList = document.getElementById("word-list");
  wordList.innerHTML = "";
  config.words.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    li.dataset.word = word;
    wordList.appendChild(li);
  });

  let letters = [];
  if (config.fixedBoard) {
    letters = config.fixedBoard.flat();
  } else {
    letters = Array(gridSize * gridSize)
      .fill(0)
      .map(() => {
        const fillers = wordData.fillers;
        return fillers[Math.floor(Math.random() * fillers.length)];
      });
  }

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const char = config.fixedBoard
      ? letters[i]
      : [...letters[i]].slice(0, 1); // 한글 1글자만
    cell.textContent = char;
    cell.dataset.index = i;
    cell.addEventListener("click", () => handleCellClick(cell, gridSize));
    board.appendChild(cell);
  }

  timerInterval = setInterval(() => {
    timeRemaining--;
    document.getElementById("timer").textContent = `${timeRemaining}초`;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏰ 시간이 종료되었습니다!");
    }
  }, 1000);
}

function handleCellClick(cell, gridSize) {
  if (cell.classList.contains("found")) return;

  cell.classList.toggle("selected");
  const index = parseInt(cell.dataset.index);
  if (selectedCells.includes(index)) {
    selectedCells = selectedCells.filter((i) => i !== index);
  } else {
    selectedCells.push(index);
  }

  const selectedText = selectedCells.map((i) => {
    const el = document.querySelector(`.cell[data-index='${i}']`);
    return el.textContent;
  });

  const formedWord = selectedText.join("");
  const reversed = selectedText.reverse().join("");

  for (const word of wordData[difficulty].words) {
    if (
      (formedWord.includes(word) || reversed.includes(word)) &&
      !foundWords.has(word)
    ) {
      foundWords.add(word);
      score += word.length;
      document.getElementById("score").textContent = score;

      selectedCells.forEach((i) => {
        const el = document.querySelector(`.cell[data-index='${i}']`);
        el.classList.add("found");
        el.classList.remove("selected");
      });

      selectedCells = [];

      const li = document.querySelector(`#word-list li[data-word='${word}']`);
      if (li) li.classList.add("found");

      break;
    }
  }
}
