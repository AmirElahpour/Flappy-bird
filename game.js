var cvs = document.getElementById("myCanvas");
var ctx = cvs.getContext("2d");

var degree = Math.PI / 180;
var frames = 0;

var bgSprite = new Image();
bgSprite.src = "sprite/background-day.png";
var baseSprite = new Image();
baseSprite.src = "sprite/base.png";
var sprite = new Image();
sprite.src = "sprite/Flappy bird.png";
var getReadySprite = new Image();
getReadySprite.src = "sprite/message.png";
var gameOverSprite = new Image();
gameOverSprite.src = "sprite/gameover.png";
var pipeSprite = new Image();
pipeSprite.src = "sprite/pipe-green.png";

var point = new Audio();
point.src = "audio/point.ogg";
var die = new Audio();
die.src = "audio/die.ogg";
var Flap = new Audio();
Flap.src = "audio/wing.ogg";
var hit = new Audio();
hit.src = "audio/hit.ogg";
var start = new Audio();
start.src = "audio/swoosh.ogg"

var state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

function clickHandler() {
  switch (state.current) {
    case state.getReady:
      start.play();
      state.current = state.game;
      break;
    case state.game:
      Flap.play();
      bird.flap();
      break;
    default:
      bird.speed = 0;
      bird.rotation = 0;
      pipes.position = [];
      score.value = 0;
      state.current = state.getReady;
      break;
  }
}

document.addEventListener("click", clickHandler);
document.addEventListener("keydown", function (event) {
  if (event.which === 32) {
    clickHandler();
  }
});

var bg = {
  sX: 0,
  sY: 0,
  w: 288,
  h: 512,
  x: 0,
  y: 0,
  draw: function () {
    ctx.drawImage(
      bgSprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    ctx.drawImage(
      bgSprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
};
var base = {
  sX: 0,
  sY: 0,
  w: 336,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,
  draw: function () {
    ctx.drawImage(
      baseSprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
  },
  update: function () {
    if (state.current === state.game) {
      this.x = (this.x - this.dx) % (this.w / 22);
    }
  },
};

var pipes = {
  top: {
    sX: 143,
    sY: 315,
  },
  bottom: {
    sX: 55,
    sY: 322,
  },
  w: 52,
  h: 320,
  dx: 2,
  gap: 100,
  //   x: cvs.width - this.w / 2,
  //   y: 90,
  maxYPosition: -150,
  position: [],
  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPosition = p.y; // this is the bottom edge of the top pipe
      let bottomYPosition = p.y + this.gap; // top edge of the bottom pipe
      // Draw top pipe flipped vertically
      ctx.save();
      ctx.translate(p.x, topYPosition);
      ctx.scale(1, -1);
      ctx.drawImage(pipeSprite, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
      ctx.restore();

      // Draw bottom pipe
      ctx.drawImage(
        pipeSprite,

        0,
        0,
        this.w,
        this.h,
        p.x,
        bottomYPosition,
        this.w,
        this.h
      );
    }
  },
  update: function () {
    if (state.current != state.game) return;
    if (frames % 100 === 0) {
      // Randomize visible gap position: p.y is bottom edge of top pipe
      let margin = 20;
      let minY = margin;
      let maxY = cvs.height - base.h - margin - this.gap;
      if (maxY < minY) maxY = minY; // small canvas fallback
      let y = minY + Math.random() * (maxY - minY);
      this.position.push({ x: cvs.width, y });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      // Collision detection: use actual drawn pipe ranges
      let birdLeft = bird.x - bird.radius;
      let birdRight = bird.x + bird.radius;
      let birdTop = bird.y - bird.radius;
      let birdBottom = bird.y + bird.radius;

      let overlapX = birdRight > p.x && birdLeft < p.x + this.w;
      if (overlapX) {
        let topPipeTop = p.y - this.h; // top pipe extends upward
        let topPipeBottom = p.y;
        let bottomPipeTop = p.y + this.gap;
        let bottomPipeBottom = bottomPipeTop + this.h;

        let collideTop = birdTop < topPipeBottom && birdBottom > topPipeTop;
        let collideBottom =
          birdBottom > bottomPipeTop && birdTop < bottomPipeBottom;
        if (collideTop || collideBottom) {
          hit.play();
          state.current = state.over;
        }
      }

      if (p.x + this.w <= 0) {
        this.position.shift();
        point.play();
        score.value++;
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  },
};

var getReady = {
  sX: 0,
  sY: 0,
  w: 184,
  h: 267,
  x: cvs.width / 2 - 184 / 2,
  y: 80,
  draw: function () {
    if (state.current === state.getReady) {
      ctx.drawImage(
        getReadySprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
var gameOver = {
  sX: 0,
  sY: 0,
  w: 192,
  h: 42,
  x: cvs.width / 2 - 192 / 2,
  y: 90,
  draw: function () {
    if (state.current === state.over) {
      ctx.drawImage(
        gameOverSprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
var scoreBoard = {
  sX: 2,
  sY: 258,
  w: 115,
  h: 58,
  x: cvs.width / 2 - 230 / 2,
  y: 140,
  draw: function () {
    if (state.current === state.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w * 2,
        this.h * 2
      );
    }
  },
};

var bird = {
  animation: [
    { sX: 31, sY: 491 },
    { sX: 3, sY: 491 },
    { sX: 59, sY: 491 },
    { sX: 31, sY: 491 },
  ],
  w: 25,
  h: 24,
  x: 50,
  y: 150,
  speed: 0,
  gravity: 0.25,
  jump: 4.6,
  radius: 15,
  rotation: 0,
  animationIndex: 0,
  draw: function () {
    let bird = this.animation[this.animationIndex];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w * 2,
      this.h * 2
    );
    ctx.restore();
  },
  update: function () {
    let period = state.current === state.getReady ? 10 : 5;
    this.animationIndex += frames % period === 0 ? 1 : 0;
    this.animationIndex = this.animationIndex % this.animation.length;
    if (state.current === state.getReady) {
      this.y = 150;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;
      if (this.speed < this.jump) {
        this.rotation = -25 * degree;
      } else {
        this.rotation = 60 * degree;
      }
    }
    if (this.y + this.h / 2 >= cvs.height - base.h) {
      this.y = cvs.height - base.h - this.h / 2;
      this.animationIndex = 0;
      if (state.current === state.game) {
        die.play();
        state.current = state.over;
      }
    }
    if (this.y - this.h /2 <= 0){
      this.animationIndex = 0;
      if (state.current === state.game){
        hit.play();
        state.current = state.over;
      }
    }
  },
  flap: function () {
    this.speed = -this.jump;
  },
};

var score = {
  best: parseInt(localStorage.getItem("best") || 0), 
  value:0,
  draw: function () {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    if(state.current === state.game){
      ctx.lineWidth = 1;
      ctx.font = "35px IMPACT";

      ctx.fillText(this.value, cvs.width / 2 , 50)
      ctx.strokeText(this.value, cvs.width / 2 , 50)
    }else if(state.current === state.over){
      ctx.lineWidth = 1;
      ctx.font = "22px IMPACT";

      ctx.fillText(this.value, 225 , 192)
      ctx.strokeText(this.value, 225 , 192)
      ctx.fillText(this.best, 225,237)
      ctx.strokeText(this.best, 225,237)
    }
  }
}

function update() {
  bird.update();
  base.update();
  pipes.update();
}
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  pipes.draw();
  base.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  scoreBoard.draw();
  score.draw();
}

function animate() {
  update();
  draw();
  frames++;
  requestAnimationFrame(animate);
}
animate();
