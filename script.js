const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let aiSnake = [{ x: 5, y: 5 }];
let food = { x: 15, y: 15 };
let velocity = { x: 0, y: 0 };
let aiVelocity = { x: 1, y: 0 };
let score = 0;
let gameInterval = null;
let mode = "solo";

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const clickSound = document.getElementById("clickSound");

document.getElementById("soloBtn").onclick = () => {
  clickSound.play();
  mode = "solo";
  resetGame();
};

document.getElementById("duelBtn").onclick = () => {
  clickSound.play();
  mode = "duel";
  resetGame();
};

document.getElementById("restartBtn").onclick = () => {
  document.getElementById("gameOverScreen").classList.add("hidden");
  clickSound.play();
  resetGame();
};

document.getElementById("muteBtn").onclick = () => {
  const muted = eatSound.muted = gameOverSound.muted = clickSound.muted = !eatSound.muted;
  document.getElementById("muteBtn").textContent = muted ? "🔇" : "🔊";
};

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  aiSnake = [{ x: 5, y: 5 }];
  food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
  velocity = { x: 0, y: 0 };
  aiVelocity = { x: 1, y: 0 };
  score = 0;
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 150);
}

function gameLoop() {
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
  const aiHead = { x: aiSnake[0].x + aiVelocity.x, y: aiSnake[0].y + aiVelocity.y };

  // Wall collisions
  if (
    head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
    aiHead.x < 0 || aiHead.x >= tileCount || aiHead.y < 0 || aiHead.y >= tileCount
  ) {
    return endGame();
  }

  // Self and player collision
  if (
    snake.some((segment, idx) => idx > 0 && segment.x === head.x && segment.y === head.y) ||
    aiSnake.some((segment, idx) => idx > 0 && segment.x === aiHead.x && segment.y === aiHead.y) ||
    snake.some(seg => seg.x === aiHead.x && seg.y === aiHead.y) ||
    aiSnake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    return endGame();
  }

  snake.unshift(head);
  aiSnake.unshift(aiHead);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    eatSound.currentTime = 0;
    eatSound.play();
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } else {
    snake.pop();
  }

  if (mode === "duel") {
    if (aiHead.x === food.x && aiHead.y === food.y) {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } else {
      aiSnake.pop();
    }
    aiVelocity = getAIMove(aiSnake[0]);
  }

  // Clear & Draw
  ctx.fillStyle = "#1f3b28";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food
  ctx.fillStyle = "#e63946";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Snake
  ctx.fillStyle = "#a8dadc";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
  });

  // AI Snake
  if (mode === "duel") {
    ctx.fillStyle = "#f1fa8c";
    aiSnake.forEach(segment => {
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
  }
}

function endGame() {
  clearInterval(gameInterval);
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOverScreen").classList.remove("hidden");
}

function getAIMove(aiHead) {
  const dx = food.x - aiHead.x;
  const dy = food.y - aiHead.y;

  let directions = [];

  if (Math.abs(dx) > Math.abs(dy)) {
    directions.push({ x: Math.sign(dx), y: 0 });
    directions.push({ x: 0, y: Math.sign(dy) });
  } else {
    directions.push({ x: 0, y: Math.sign(dy) });
    directions.push({ x: Math.sign(dx), y: 0 });
  }

  // Fallback directions
  directions.push({ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 });

  for (let dir of directions) {
    const newHead = { x: aiHead.x + dir.x, y: aiHead.y + dir.y };

    const isInside = newHead.x >= 0 && newHead.x < tileCount && newHead.y >= 0 && newHead.y < tileCount;
    const hitsSnake = snake.some(seg => seg.x === newHead.x && seg.y === newHead.y);
    const hitsItself = aiSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y);

    if (isInside && !hitsSnake && !hitsItself) return dir;
  }

  return { x: 0, y: 0 }; // stuck fallback
}

// Keyboard controls
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": if (velocity.y === 0) velocity = { x: 0, y: -1 }; break;
    case "ArrowDown": if (velocity.y === 0) velocity = { x: 0, y: 1 }; break;
    case "ArrowLeft": if (velocity.x === 0) velocity = { x: -1, y: 0 }; break;
    case "ArrowRight": if (velocity.x === 0) velocity = { x: 1, y: 0 }; break;
  }
});

// Swipe controls
let startX, startY;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && velocity.x === 0) velocity = { x: 1, y: 0 };
    else if (dx < 0 && velocity.x === 0) velocity = { x: -1, y: 0 };
  } else {
    if (dy > 0 && velocity.y === 0) velocity = { x: 0, y: 1 };
    else if (dy < 0 && velocity.y === 0) velocity = { x: 0, y: -1 };
  }

  startX = touch.clientX;
  startY = touch.clientY;
}, { passive: false });

// Default launch
resetGame();

