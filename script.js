const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Buttons
const soloBtn = document.getElementById("soloBtn");
const duelBtn = document.getElementById("duelBtn");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// UI
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

// Sounds
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const clickSound = document.getElementById("clickSound");

let box = 20;
let snake = [];
let snake2 = [];
let direction = "RIGHT";
let direction2 = "LEFT";
let food = {};
let score = 0;
let speed = 120;
let gameInterval;
let gameMode = "solo";
let gameStarted = false;
let modeSelected = false;

document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(e) {
  clickSound.play();
  const key = e.key.toLowerCase();

  if (key === "arrowup" && direction !== "DOWN") direction = "UP";
  else if (key === "arrowdown" && direction !== "UP") direction = "DOWN";
  else if (key === "arrowleft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "arrowright" && direction !== "LEFT") direction = "RIGHT";

  if (gameMode === "duel") {
    if (key === "w" && direction2 !== "DOWN") direction2 = "UP";
    else if (key === "s" && direction2 !== "UP") direction2 = "DOWN";
    else if (key === "a" && direction2 !== "RIGHT") direction2 = "LEFT";
    else if (key === "d" && direction2 !== "LEFT") direction2 = "RIGHT";
  }
}

function startGame() {
  direction = "RIGHT";
  direction2 = "LEFT";
  score = 0;
  speed = 120;
  snake = [{ x: 8 * box, y: 10 * box }];
  snake2 = [{ x: 12 * box, y: 10 * box }];
  generateFood();
  clearInterval(gameInterval);
  gameOverScreen.classList.add("hidden");
  gameInterval = setInterval(draw, speed);
  gameStarted = true;
}

function generateFood() {
  let validPosition = false;
  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    if (
      !snake.some(seg => seg.x === food.x && seg.y === food.y) &&
      !snake2.some(seg => seg.x === food.x && seg.y === food.y)
    ) {
      validPosition = true;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff5555";
  ctx.fillRect(food.x, food.y, box, box);

  moveSnake(snake, direction);
  if (gameMode === "duel") moveSnake(snake2, direction2, true);

  drawSnake(snake, "#4caf84");
  if (gameMode === "duel") drawSnake(snake2, "#e57373");
}

function drawSnake(arr, color) {
  arr.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#fff" : color;
    ctx.fillRect(seg.x, seg.y, box, box);
  });
}

function moveSnake(arr, dir, isSecond = false) {
  let head = { ...arr[0] };
  if (dir === "LEFT") head.x -= box;
  if (dir === "RIGHT") head.x += box;
  if (dir === "UP") head.y -= box;
  if (dir === "DOWN") head.y += box;

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, arr) ||
    (!isSecond && gameMode === "duel" && collision(head, snake2)) ||
    (isSecond && collision(head, snake))
  ) {
    return endGame();
  }

  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    score++;
    if (speed > 60) {
      clearInterval(gameInterval);
      speed -= 3;
      gameInterval = setInterval(draw, speed);
    }
    generateFood();
  } else {
    arr.pop();
  }
  arr.unshift(head);
}

function collision(head, arr) {
  return arr.some(seg => seg.x === head.x && seg.y === head.y);
}

function endGame() {
  gameOverSound.play();
  clearInterval(gameInterval);
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");
  gameStarted = false;
}

// Touch controls for Player 1
let touchStartX, touchStartY;
canvas.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 && direction !== "LEFT" ? "RIGHT" : dx < 0 && direction !== "RIGHT" ? "LEFT" : direction;
  } else {
    direction = dy > 0 && direction !== "UP" ? "DOWN" : dy < 0 && direction !== "DOWN" ? "UP" : direction;
  }
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: false });

// Buttons
soloBtn.addEventListener("click", () => {
  clickSound.play();
  gameMode = "solo";
  modeSelected = true;
});
duelBtn.addEventListener("click", () => {
  clickSound.play();
  gameMode = "duel";
  modeSelected = true;
});
startBtn.addEventListener("click", () => {
  if (modeSelected) startGame();
});
restartBtn.addEventListener("click", startGame);
