const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
let snake, food, aiSnake, score, direction, game, mode;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let speed = 150;

document.getElementById("high-score").textContent = `High Score: ${highScore}`;
const overlay = document.getElementById("game-over-overlay");
const finalScoreDisplay = document.getElementById("final-score");
const eatSound = document.getElementById("eatSound");
const gameOverSound= document.getElementById("gameOverSound");
const clickSound = document.getElementById("clickSound");

function setMode(selectedMode) {
  mode = selectedMode;
  document.getElementById("start-button").style.display = "inline-block";
}

function startGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  aiSnake = [{ x: 1 * box, y: 1 * box }];
  food = spawnFood();
  score = 0;
  direction = "RIGHT";
  speed = 150;
  clearInterval(game);
  game = setInterval(draw, speed);
  overlay.classList.add("hidden");
}

function restartGame() {
  overlay.classList.add("hidden");
  startGame();
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
  };
}

function drawBox(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, box, box);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(x, y, box, box);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.forEach(part => drawBox(part.x, part.y, "#6bbe92"));
  if (mode === "duel") aiSnake.forEach(part => drawBox(part.x, part.y, "#e46464"));
  drawBox(food.x, food.y, "#ffd700");

  moveSnake(snake);
  if (mode === "duel") moveAI();

  document.getElementById("score-display").textContent = `Score: ${score}`;

  speed = 150 - Math.min(score * 5, 100);
  clearInterval(game);
  game = setInterval(draw, speed);
}

function moveSnake(s) {
  let head = { ...s[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else {
    s.pop();
  }

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, s) ||
    (mode === "duel" && collision(head, aiSnake))
  ) return gameOver();

  s.unshift(head);
}

function moveAI() {
  let head = { ...aiSnake[0] };

  if (food.x > head.x) head.x += box;
  else if (food.x < head.x) head.x -= box;
  else if (food.y > head.y) head.y += box;
  else if (food.y < head.y) head.y -= box;

  if (head.x === food.x && head.y === food.y) {
    food = spawnFood();
  } else {
    aiSnake.pop();
  }

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, aiSnake) ||
    collision(head, snake)
  ) return; // AI dies silently

  aiSnake.unshift(head);
}

function collision(head, array) {
  return array.some(part => part.x === head.x && part.y === head.y);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (x < canvas.width / 2 && direction !== "RIGHT") direction = "LEFT";
  else if (x > canvas.width / 2 && direction !== "LEFT") direction = "RIGHT";
  else if (y < canvas.height / 2 && direction !== "DOWN") direction = "UP";
  else if (y > canvas.height / 2 && direction !== "UP") direction = "DOWN";
});

let startX, startY;
canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }

  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: false });

function gameOver() {
  clearInterval(game);
  overlay.classList.remove("hidden");
  finalScoreDisplay.textContent = `Final Score: ${score}`;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", score);
    document.getElementById("high-score").textContent = `High Score: ${highScore}`;
  }
}