const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 24;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 18;
const BALL_SPEED = 6;

// Game objects
let leftPaddle = {
  x: PADDLE_MARGIN,
  y: HEIGHT/2 - PADDLE_HEIGHT/2,
  w: PADDLE_WIDTH,
  h: PADDLE_HEIGHT,
};

let rightPaddle = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT/2 - PADDLE_HEIGHT/2,
  w: PADDLE_WIDTH,
  h: PADDLE_HEIGHT,
};

let ball = {
  x: WIDTH/2 - BALL_SIZE/2,
  y: HEIGHT/2 - BALL_SIZE/2,
  w: BALL_SIZE,
  h: BALL_SIZE,
  vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  vy: BALL_SPEED * ((Math.random()-0.5)*2),
};

let leftScore = 0, rightScore = 0;

// Player controls left paddle with mouse
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  leftPaddle.y = mouseY - leftPaddle.h/2;
  // Clamp within canvas
  leftPaddle.y = Math.max(0, Math.min(HEIGHT-leftPaddle.h, leftPaddle.y));
});

// Simple AI for right paddle
function moveRightPaddle() {
  let target = ball.y + ball.h/2 - rightPaddle.h/2;
  // Smoothly follow the ball
  if (rightPaddle.y < target) {
    rightPaddle.y += PADDLE_SPEED;
    if (rightPaddle.y > target) rightPaddle.y = target;
  } else if (rightPaddle.y > target) {
    rightPaddle.y -= PADDLE_SPEED;
    if (rightPaddle.y < target) rightPaddle.y = target;
  }
  // Clamp within canvas
  rightPaddle.y = Math.max(0, Math.min(HEIGHT-rightPaddle.h, rightPaddle.y));
}

// Ball and paddle collision check
function collide(ball, paddle) {
  return (
    ball.x < paddle.x + paddle.w &&
    ball.x + ball.w > paddle.x &&
    ball.y < paddle.y + paddle.h &&
    ball.y + ball.h > paddle.y
  );
}

// Reset after score
function resetBall(direction) {
  ball.x = WIDTH/2 - BALL_SIZE/2;
  ball.y = HEIGHT/2 - BALL_SIZE/2;
  ball.vx = BALL_SPEED * direction;
  ball.vy = BALL_SPEED * ((Math.random()-0.5)*1.5);
}

// Game loop
function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom wall collision
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy *= -1;
  }
  if (ball.y + ball.h >= HEIGHT) {
    ball.y = HEIGHT - ball.h;
    ball.vy *= -1;
  }

  // Left paddle collision
  if (collide(ball, leftPaddle)) {
    ball.x = leftPaddle.x + leftPaddle.w;
    ball.vx *= -1;
    // Add a little "spin"
    ball.vy += (ball.y + ball.h/2 - (leftPaddle.y + leftPaddle.h/2)) * 0.15;
  }

  // Right paddle collision
  if (collide(ball, rightPaddle)) {
    ball.x = rightPaddle.x - ball.w;
    ball.vx *= -1;
    ball.vy += (ball.y + ball.h/2 - (rightPaddle.y + rightPaddle.h/2)) * 0.15;
  }

  // Score detection
  if (ball.x < 0) {
    rightScore++;
    resetBall(1);
  } else if (ball.x + ball.w > WIDTH) {
    leftScore++;
    resetBall(-1);
  }

  moveRightPaddle();
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw center line
  ctx.strokeStyle = "#555";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(WIDTH/2, 0);
  ctx.lineTo(WIDTH/2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h);

  // Draw ball
  ctx.fillStyle = "#fff";
  ctx.fillRect(ball.x, ball.y, ball.w, ball.h);

  // Draw scores
  ctx.font = "48px monospace";
  ctx.textAlign = "center";
  ctx.fillText(leftScore, WIDTH/2 - 80, 60);
  ctx.fillText(rightScore, WIDTH/2 + 80, 60);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();