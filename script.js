const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const playBtn = document.getElementById("playBtn");
const scoreText = document.getElementById("score");

let kitty, pipes, clouds, frame, score, highScore, running;
let pipeSpeed = 2.2;
let lastJump = 0;

/* ---------- PHYSICS (PREMIUM FEEL) ---------- */
const GRAVITY = 0.32;
const JUMP_FORCE = -6.8;
const MAX_FALL = 7.5;

/* ---------- SCORE ---------- */
highScore = localStorage.getItem("kittyHigh") || 0;
scoreText.innerText = `Score: 0 | High: ${highScore}`;

/* ---------- IMAGES ---------- */
const kittyImg = new Image();
kittyImg.src = "assest/jameie.png"; // fixed path

const cloudImg = new Image();
cloudImg.src = "assest/cloud.png";

/* ---------- RESET GAME ---------- */
function resetGame() {
  kitty = { x: 80, y: 200, size: 80, vel: 0 };
  pipes = [];
  clouds = [];
  frame = 0;
  score = 0;
  pipeSpeed = 1.2;
  running = true;
}

/* ---------- CONTROLS ---------- */
function jump() {
  if (!running) return;

  const now = performance.now();
  if (now - lastJump < 120) return; // debounce
  lastJump = now;

  kitty.vel = JUMP_FORCE;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});
canvas.addEventListener("click", jump);

/* ---------- PIPES ---------- */
function spawnPipe() {
  let gap = 160;
  let top = Math.random() * 200 + 40;
  pipes.push({ x: canvas.width, top, gap, passed: false });
}

/* ---------- CLOUDS ---------- */
function spawnCloud() {
  clouds.push({
    x: canvas.width + 40,
    y: Math.random() * 180 + 20,
    size: Math.random() * 80 + 80,
    speed: Math.random() * 0.6 + 0.3,
    opacity: Math.random() * 0.4 + 0.4
  });
}

function drawClouds() {
  clouds.forEach(c => {
    ctx.globalAlpha = c.opacity;
    ctx.drawImage(cloudImg, c.x, c.y, c.size, c.size * 0.6);
    c.x -= c.speed;
  });
  ctx.globalAlpha = 1;

  clouds = clouds.filter(c => c.x + c.size > 0);
}

/* ---------- DRAW PIPES ---------- */
function drawPipes() {
  ctx.fillStyle = "#fc56a9ff";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, 50, p.top);
    ctx.fillRect(p.x, p.top + p.gap, 50, canvas.height);
    p.x -= pipeSpeed;
  });
}

/* ---------- COLLISION ---------- */
function collision(p) {
  return (
    kitty.x + kitty.size > p.x &&
    kitty.x < p.x + 50 &&
    (kitty.y < p.top ||
      kitty.y + kitty.size > p.top + p.gap)
  );
  
}

/* ---------- GAME OVER ---------- */
function gameOver() {
  running = false;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("kittyHigh", highScore);
  }

  scoreText.innerText = `Game Over | Score: ${score} | High: ${highScore}`;
}

/* ---------- DRAW KITTY (ROTATION) ---------- */
function drawKitty() {
  ctx.save();

  let angle = kitty.vel < 0 ? -20 : 60;
  angle = angle * Math.PI / 180;

  ctx.translate(kitty.x + kitty.size / 2, kitty.y + kitty.size / 2);
  ctx.rotate(angle);
  ctx.drawImage(
    kittyImg,
    -kitty.size / 2,
    -kitty.size / 2,
    kitty.size,
    kitty.size
  );

  ctx.restore();
}

/* ---------- GAME LOOP ---------- */
function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frame++;

  if (frame % 160 === 0) spawnPipe();
  if (frame % 220 === 0) spawnCloud();

  if (frame % 600 === 0) pipeSpeed += 0.15; // difficulty scaling

  kitty.vel += GRAVITY;
  kitty.vel = Math.min(kitty.vel, MAX_FALL);
  kitty.y += kitty.vel;

  drawClouds();
  drawKitty();
  drawPipes();

  pipes.forEach(p => {
    if (collision(p)) gameOver();

    if (!p.passed && p.x + 50 < kitty.x) {
      p.passed = true;
      score++;
      scoreText.innerText = `Score: ${score} | High: ${highScore}`;
    }
  });

  if (kitty.y < 0 || kitty.y + kitty.size > canvas.height) gameOver();

  requestAnimationFrame(loop);
}

/* ---------- START BUTTON ---------- */
playBtn.onclick = () => {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  resetGame();
  requestAnimationFrame(loop);
};
