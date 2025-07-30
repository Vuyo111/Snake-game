const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const soloBtn = document.getElementById("soloBtn");
const duelBtn = document.getElementById("duelBtn");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

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
let gameInterval;
let gameMode = "solo";
let gameStarted = false;


function handleKeyPress(e) {
  clickSound.play();
  const key = e.key;
  if (key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";

  // Controls for second snake (duel mode)
  if (gameMode === "duel") {
    if (key === "w" && direction2 !== "DOWN") direction2 = "UP";
    else if (key === "s" && direction2 !== "UP") direction2 = "DOWN";
    else if (key === "a" && direction2 !== "RIGHT") direction2 = "LEFT";
    else if (key === "d" && direction2 !== "LEFT") direction2 = "RIGHT";
  }
}
document.addEventListener("keydown", handleKeyPress);

window.addEventListener("keydown", () => {
  if (!gameStarted){
    gameStarted = true;
    document.getElementById("startOverlay").classList.add("hidden")
    startGame();
  }
});


// 🟩 Game start/reset logic
function startGame() {
  direction = "RIGHT";
  direction2 = "LEFT";
  score = 0;
  snake = [{ x: 8 * box, y: 10 * box }];
  snake2 = [{ x: 12 * box, y: 10 * box }];
  generateFood();
  clearInterval(gameInterval);
  gameOverScreen.classList.add("hidden");
  gameInterval = setInterval(draw, 100);
  
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * 18 + 1) * box,
    y: Math.floor(Math.random() * 18 + 1) * box,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  moveSnake(snake, direction);
  if (gameMode === "duel") {
     moveSnake(snake2, direction2, true);
  } 

  // Draw snakes
  drawSnake(snake, "#5ba57b");
  if (gameMode === "duel") drawSnake(snake2, "#b44a4a");
}

function drawSnake(snakeArr, color) {
  for (let i = 0; i < snakeArr.length; i++) {
    ctx.fillStyle = i === 0 ? "white" : color;
    ctx.fillRect(snakeArr[i].x, snakeArr[i].y, box, box);
  }
}

function moveSnake(snakeArr, dir, isSecond = false) {
  let head = { ...snakeArr[0] };
  if (dir === "LEFT") head.x -= box;
  else if (dir === "RIGHT") head.x += box;
  else if (dir === "UP") head.y -= box;
  else if (dir === "DOWN") head.y += box;

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, snakeArr) ||
    (!isSecond && gameMode === "duel" && collision(head, snake2)) ||
    (isSecond && collision(head, snake))
  ) {
    return gameOver();
  }

  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    score++;
    generateFood();
  } else {
    snakeArr.pop();
  }

  snakeArr.unshift(head);

}

function collision(head, array){
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
  gameOverSound.play();
  clearInterval(gameInterval);
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

// 🧠 Mobile swipe support
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

// 🔘 Button Event Listeners
startBtn.addEventListener("click", () => {
  clickSound.play();
  startGame();
});
restartBtn.addEventListener("click", () => {
  clickSound.play();
  startGame();
});
soloBtn.addEventListener("click", () => {
  clickSound.play();
  gameMode = "solo";
});
duelBtn.addEventListener("click", () => {
  gameMode = "duel";
  clickSound.play();
});
