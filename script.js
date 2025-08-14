const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Buttons
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
let direction = "RIGHT";
let food = {};
let score = 0;
let speed = 120;
let gameInterval;
let gameStarted = false;

// Keyboard controls
document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(e) {
  clickSound.play();
  const key = e.key.toLowerCase();
  if (key === "arrowup" && direction !== "DOWN") direction = "UP";
  else if (key === "arrowdown" && direction !== "UP") direction = "DOWN";
  else if (key === "arrowleft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "arrowright" && direction !== "LEFT") direction = "RIGHT";
}

// Game start/reset
function startGame() {
  direction = "RIGHT";
  score = 0;
  speed = 120;
  snake = [{ x: 8 * box, y: 10 * box }];
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
    if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) {
      validPosition = true;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff5555";
  ctx.fillRect(food.x, food.y, box, box);

  moveSnake();
  drawSnake();
}

function drawSnake() {
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#fff" : "#4caf84";
    ctx.fillRect(seg.x, seg.y, box, box);
  });
}

function moveSnake() {
  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, snake)
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
    snake.pop();
  }

  snake.unshift(head);
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

// Touch controls
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
startBtn.addEventListener("click", () => clickSound.play() || startGame());
restartBtn.addEventListener("click", () => clickSound.play() || startGame());
