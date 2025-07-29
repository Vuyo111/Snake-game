const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const difficultyDisplay = document.getElementById('difficulty');
const soloBtn = document.getElementById('soloBtn');
const duelBtn = document.getElementById('duelBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');

const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');
const clickSound = document.getElementById('clickSound');

const box = 20;
let snake, aiSnake, direction, aiDirection, food, score, speed, gameMode, animationId;
let bestScore = localStorage.getItem('bestScore') || 0;
bestScoreDisplay.textContent = bestScore;

let lastTime = 0;

// Touch controls
let touchStartX = 0, touchStartY = 0;

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
    else if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
  } else {
    if (dy > 0 && direction !== 'UP') direction = 'DOWN';
    else if (dy < 0 && direction !== 'DOWN') direction = 'UP';
  }
}, { passive: false });

// Mouse click control
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  if (clickX > clickY && clickX + clickY < canvas.width) direction = 'UP';
  else if (clickX > clickY && clickX + clickY > canvas.width) direction = 'RIGHT';
  else if (clickX < clickY && clickX + clickY > canvas.width) direction = 'DOWN';
  else direction = 'LEFT';
});

soloBtn.addEventListener('click', () => { clickSound.play(); startGame('solo'); });
duelBtn.addEventListener('click', () => { clickSound.play(); startGame('duel'); });
restartBtn.addEventListener('click', () => { clickSound.play(); overlay.style.display = 'none'; startGame(gameMode); });

document.addEventListener('keydown', setDirection);

function startGame(mode) {
  cancelAnimationFrame(animationId); // stop any old loop
  gameMode = mode;
  snake = [{ x: 9 * box, y: 10 * box }];
  aiSnake = [{ x: 10 * box, y: 9 * box }];
  direction = null;
  aiDirection = 'LEFT';
  score = 0;
  speed = 150;
  lastTime = 0;
  scoreDisplay.textContent = score;
  difficultyDisplay.textContent = 'Easy';
  food = randomFood();
  overlay.style.display = 'none';
  animationId = requestAnimationFrame(gameLoop);
}

function setDirection(e) {
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;

  if (deltaTime > speed) {
    update();
    lastTime = timestamp;
  }

  draw();
  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  if (score >= 10) { speed = 90; difficultyDisplay.textContent = 'Hard'; }
  else if (score >= 5) { speed = 120; difficultyDisplay.textContent = 'Medium'; }

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === 'LEFT') snakeX -= box;
  if (direction === 'UP') snakeY -= box;
  if (direction === 'RIGHT') snakeX += box;
  if (direction === 'DOWN') snakeY += box;

  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreDisplay.textContent = score;
    eatSound.play();
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
      bestScoreDisplay.textContent = bestScore;
    }
    food = randomFood();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  if (checkCollision(newHead, snake) || checkCollision(newHead, aiSnake) ||
      snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height) {
    gameOver();
    return;
  }

  snake.unshift(newHead);

  if (gameMode === 'duel') smartAIMove();
}

function draw() {
  ctx.fillStyle = '#081c15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#d8f3dc';
  ctx.fillRect(food.x, food.y, box, box);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#95d5b2' : '#52b788';
    ctx.fillRect(segment.x, segment.y, box, box);
    ctx.strokeStyle = '#1b4332';
    ctx.strokeRect(segment.x, segment.y, box, box);
  });

  if (gameMode === 'duel') {
    aiSnake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffb703' : '#f4a261';
      ctx.fillRect(segment.x, segment.y, box, box);
      ctx.strokeStyle = '#1b4332';
      ctx.strokeRect(segment.x, segment.y, box, box);
    });
  }
}

function smartAIMove() {
  let aiX = aiSnake[0].x;
  let aiY = aiSnake[0].y;

  if (aiX < food.x) aiDirection = 'RIGHT';
  else if (aiX > food.x) aiDirection = 'LEFT';
  else if (aiY < food.y) aiDirection = 'DOWN';
  else if (aiY > food.y) aiDirection = 'UP';

  if (aiDirection === 'LEFT') aiX -= box;
  if (aiDirection === 'UP') aiY -= box;
  if (aiDirection === 'RIGHT') aiX += box;
  if (aiDirection === 'DOWN') aiY += box;

  if (aiX === food.x && aiY === food.y) {
    aiSnake.unshift({ x: aiX, y: aiY });
    food = randomFood();
  } else {
    aiSnake.pop();
    aiSnake.unshift({ x: aiX, y: aiY });
  }
}

function checkCollision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
  cancelAnimationFrame(animationId);
  gameOverSound.play();
  finalScoreDisplay.textContent = score;
  overlay.style.display = 'flex';
}