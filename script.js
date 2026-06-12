let currentPhase = 0;
let lockMemory = false;
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let selectedPuzzle = null;
let snakeInterval = null;
let snakeState = null;
let snakeLastCollision = null;
let selectedWordCells = [];
let foundWords = [];
let hiddenFoundObjects = [];
let completedGames = new Set();
let game2048State = null;


const phases = [
  {
    title: "O começou",
    menuTitle: "Caça-palavras",
    menuDescription: "Encontre as palavras que marcaram o início da nossa história.",
    icon: "🔎",
    text: "Antes de tudo ser certeza, existia curiosidade, conversa, descoberta e aquele friozinho bom de quando o amor começa a ser procurado. Encontre as palavras que representam o início da nossa história no LOVO.",
    type: "wordSearch",
    words: ["LOVO", "MATCH", "CONVERSA", "CURIOSIDADE", "SORRISO", "ENCANTO", "DESCOBERTA", "DESTINO", "AMOR"],
    success: "Você encontrou as primeiras pistas da nossa história. Tudo começou no LOVO, entre curiosidade, conversa e um amor que ainda estava se revelando."
  },
  {
    title: "Memórias",
    menuTitle: "Jogo da memória",
    menuDescription: "Encontre os pares das nossas fotos especiais.",
    icon: "📸",
    text: "Encontre os pares das nossas fotos para desbloquear a próxima lembrança.",
    type: "memory"
  },
  {
    title: "Caminhos do Amor",
    menuTitle: "Labirinto do amor",
    menuDescription: "Leve o coração até o nosso destino, desviando dos caminhos errados.",
    icon: "💘",
    text: "Nem todo caminho é simples, mas quando existe amor, carinho e parceria, a gente encontra a saída juntos.",
    type: "maze",
    success: "Mesmo quando os caminhos parecem difíceis, o ninja do amor sempre encontra uma forma de chegar ao destino mais bonito: nós dois. ❤️"
  },
  {
    title: "2048 do Amor",
    menuTitle: "2048 do amor",
    menuDescription: "Junte os bloquinhos até formar o nosso 2048 especial.",
    icon: "💞",
    text: "No amor, pequenas escolhas se somam e viram algo maior. Junte os blocos, combine memórias e tente chegar ao 2048 do nosso carinho.",
    type: "game2048",
    success: "Você chegou ao nosso 2048 do amor. De combinação em combinação, construímos algo cada vez maior: a nossa história. ❤️"
  },
  {
    title: "Encontre as Peças",
    menuTitle: "Peças escondidas",
    menuDescription: "Localize.",
    icon: "❤️",
    text: "Clique nele para continuar.",
    type: "hiddenHeart"
  },
  {
    title: "Nosso quebra-cabeça",
    menuTitle: "Quebra-cabeça",
    menuDescription: "Monte uma imagem especial peça por peça.",
    icon: "🧩",
    text: "Monte a imagem da nossa lembrança clicando em uma peça e depois em outra para trocar de lugar.",
    type: "puzzle"
  }
];

function startGame() {
  openMenu();
}

function restartGame() {
  stopSnakeGame();
  currentPhase = 0;
  setTheme("light");
  showScreen("startScreen");
}

function openMenu() {
  stopSnakeGame();
  renderMenu();
  showScreen("menuScreen");
}

function renderMenu() {
  const menu = document.getElementById("gameMenu");

  if (!menu) {
    console.error("Elemento #gameMenu não encontrado.");
    return;
  }

  menu.innerHTML = phases.map((phase, index) => `
    <div class="menu-card" onclick="startPhase(${index})">
      <span>${completedGames.has(index) ? "✓" : phase.icon}</span>
      <h3>${phase.menuTitle}</h3>
      <p>${phase.menuDescription}</p>
    </div>
  `).join("");
}

function startPhase(index) {
  stopSnakeGame();
  currentPhase = index;
  showScreen("gameScreen");
  renderPhase();
  toast(`Fase ${index + 1} iniciada ❤️`);
}

function showScreen(id) {
  const targetScreen = document.getElementById(id);

  if (!targetScreen) {
    console.error(`Tela não encontrada: ${id}`);
    return;
  }

  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  targetScreen.classList.add("active");
}

function renderPhase() {
  const phase = phases[currentPhase];

  const card = document.getElementById("phaseCard");

  if (!card) {
    console.error("Elemento #phaseCard não encontrado.");
    return;
  }

  card.innerHTML = `
    <p class="tag">${phase.title}</p>
    <h2>${phase.title}</h2>
    <p>${phase.text}</p>
    <div id="phaseContent"></div>
  `;

  if (phase.type === "wordSearch") renderWordSearch(phase);
  if (phase.type === "quiz") renderQuiz(phase);
  if (phase.type === "game2048") render2048Game(phase);
  if (phase.type === "memory") renderMemory();
  if (phase.type === "maze") renderMaze(phase);
  if (phase.type === "hiddenHeart") renderHiddenHeart();
  if (phase.type === "puzzle") renderPuzzle();
}

function renderQuiz(phase) {
  const content = document.getElementById("phaseContent");
  content.innerHTML = `
    <h3>${phase.question}</h3>
    <div class="options">
      ${phase.options.map((option, index) => `
        <button class="option" onclick="answerQuiz(${index})">${option}</button>
      `).join("")}
    </div>
  `;
}

function answerQuiz(index) {
  const phase = phases[currentPhase];
  const buttons = document.querySelectorAll(".option");

  buttons.forEach((button, i) => {
    button.disabled = true;
    if (i === phase.answer) button.classList.add("correct");
    if (i === index && i !== phase.answer) button.classList.add("wrong");
  });

  setTimeout(() => {
    if (index === phase.answer) {
      showSuccess(phase.success);
    } else {
      toast("Quase! Tente de novo com o coração.");
      renderPhase();
    }
  }, 700);
}

function renderSnakeGame(phase) {
  stopSnakeGame();

  document.getElementById("phaseContent").innerHTML = `
    <div class="snake-game-wrap">
      <div class="snake-game-info">
        <div>
          <strong>Pontos:</strong>
          <span id="snakeScore">0</span>
        </div>

        <div>
          <strong>Objetivo:</strong>
          <span id="snakeGoal">8 corações</span>
        </div>
      </div>

      <canvas id="loveSnakeCanvas" width="420" height="420" aria-label="Jogo da cobrinha do amor"></canvas>

      <div class="snake-controls" aria-label="Controles da cobrinha">
        <button class="secondary snake-btn up" onclick="changeSnakeDirection('up')">↑</button>
        <button class="secondary snake-btn left" onclick="changeSnakeDirection('left')">←</button>
        <button class="secondary snake-btn down" onclick="changeSnakeDirection('down')">↓</button>
        <button class="secondary snake-btn right" onclick="changeSnakeDirection('right')">→</button>
      </div>

      <div class="start-actions">
        <button onclick="startSnakeGame()">Começar</button>
        <button class="secondary" onclick="restartSnakeGame()">Reiniciar</button>
        <button class="secondary" onclick="openMenu()">Voltar ao menu</button>
      </div>

      <p class="hint">
        Use as setas do teclado ou os botões na tela. Colete 8 corações. Se bater na parede ou no próprio corpo, o jogo mostra exatamente onde foi o impacto.
      </p>
    </div>
  `;

  setupSnakeGame(phase);
}


function resizeSnakeCanvas(canvas) {
  const maxSize = Math.min(420, Math.floor(window.innerWidth - 48));
  const adjustedSize = Math.max(280, Math.floor(maxSize / 20) * 20);

  canvas.width = adjustedSize;
  canvas.height = adjustedSize;
}

function setupSnakeGame(phase) {
  const canvas = document.getElementById("loveSnakeCanvas");
  resizeSnakeCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const grid = 20;
  const cells = canvas.width / grid;

  snakeState = {
    canvas,
    ctx,
    grid,
    cells,
    snake: [{ x: 160, y: 160 }],
    dx: grid,
    dy: 0,
    nextDx: grid,
    nextDy: 0,
    food: getRandomSnakeFood(cells, grid, [{ x: 160, y: 160 }]),
    score: 0,
    target: 8,
    running: false,
    phase
  };

  drawSnakeGame();
}

function startSnakeGame() {
  if (!snakeState || snakeState.running) return;

  snakeState.running = true;
  snakeInterval = setInterval(snakeLoop, 95);
  toast("A cobrinha do amor começou 💘");
}

function restartSnakeGame() {
  stopSnakeGame();
  setupSnakeGame(phases[currentPhase]);
  startSnakeGame();
}

function stopSnakeGame() {
  if (snakeInterval) {
    clearInterval(snakeInterval);
    snakeInterval = null;
  }

  if (snakeState) {
    snakeState.running = false;
  }
}

function snakeLoop() {
  if (!snakeState) return;

  const state = snakeState;

  state.dx = state.nextDx;
  state.dy = state.nextDy;

  const head = {
    x: state.snake[0].x + state.dx,
    y: state.snake[0].y + state.dy
  };

  const hitWall =
    head.x < 0 ||
    head.x >= state.canvas.width ||
    head.y < 0 ||
    head.y >= state.canvas.height;

  const hitSelf = state.snake.some(part => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    snakeLastCollision = {
      type: hitWall ? "wall" : "self",
      x: hitWall ? state.snake[0].x : head.x,
      y: hitWall ? state.snake[0].y : head.y
    };

    stopSnakeGame();
    drawSnakeGame();
    drawSnakeImpact(snakeLastCollision);
    showSnakeGameOver(hitWall ? "parede" : "próprio caminho");
    return;
  }

  state.snake.unshift(head);

  if (head.x === state.food.x && head.y === state.food.y) {
    state.score++;
    document.getElementById("snakeScore").textContent = state.score;
    state.food = getRandomSnakeFood(state.cells, state.grid, state.snake);

    if (state.score >= state.target) {
      stopSnakeGame();
      setTimeout(() => {
        showSuccess(state.phase.success);
      }, 450);
      return;
    }
  } else {
    state.snake.pop();
  }

  drawSnakeGame();
}

function drawSnakeGame() {
  if (!snakeState) return;

  const { canvas, ctx, grid, snake, food } = snakeState;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#16091f");
  bg.addColorStop(0.55, "#2a1038");
  bg.addColorStop(1, "#3d123d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSnakeGrid(ctx, canvas, grid);
  drawHeartFood(ctx, food.x + grid / 2, food.y + grid / 2, grid * 0.78);

  snake.forEach((part, index) => {
    drawSnakeHeartPart(ctx, part.x, part.y, grid, index === 0);
  });
}

function drawSnakeImpact(collision) {
  if (!snakeState || !collision) return;

  const { ctx, grid } = snakeState;
  const x = collision.x + grid / 2;
  const y = collision.y + grid / 2;

  ctx.save();
  ctx.shadowColor = "rgba(255, 95, 130, 0.95)";
  ctx.shadowBlur = 24;

  ctx.beginPath();
  ctx.arc(x, y, grid * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 95, 130, 0.52)";
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ffd0e5";
  ctx.beginPath();
  ctx.moveTo(x - grid * 0.5, y - grid * 0.5);
  ctx.lineTo(x + grid * 0.5, y + grid * 0.5);
  ctx.moveTo(x + grid * 0.5, y - grid * 0.5);
  ctx.lineTo(x - grid * 0.5, y + grid * 0.5);
  ctx.stroke();

  ctx.restore();
}

function drawSnakeGrid(ctx, canvas, grid) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawSnakeHeartPart(ctx, x, y, grid, isHead) {
  const centerX = x + grid / 2;
  const centerY = y + grid / 2;
  const size = isHead ? grid * 0.9 : grid * 0.76;

  ctx.save();
  ctx.shadowColor = isHead ? "rgba(255, 79, 154, 0.9)" : "rgba(143, 91, 255, 0.55)";
  ctx.shadowBlur = isHead ? 16 : 10;
  drawHeartShape(ctx, centerX, centerY, size, isHead ? "#ff4f9a" : "#8f5bff");

  if (isHead) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 3, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHeartFood(ctx, centerX, centerY, size) {
  ctx.save();
  ctx.shadowColor = "rgba(255, 208, 229, 0.9)";
  ctx.shadowBlur = 18;
  drawHeartShape(ctx, centerX, centerY, size, "#ffd0e5");
  ctx.restore();
}

function drawHeartShape(ctx, x, y, size, color) {
  const topCurveHeight = size * 0.3;

  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(
    x - size / 2,
    y - topCurveHeight,
    x - size,
    y + size / 3,
    x,
    y + size
  );
  ctx.bezierCurveTo(
    x + size,
    y + size / 3,
    x + size / 2,
    y - topCurveHeight,
    x,
    y + size / 4
  );
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}

function getRandomSnakeFood(cells, grid, snake) {
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * cells) * grid,
      y: Math.floor(Math.random() * cells) * grid
    };
  } while (snake.some(part => part.x === food.x && part.y === food.y));

  return food;
}

function changeSnakeDirection(direction) {
  if (!snakeState) return;

  const grid = snakeState.grid;
  const currentDx = snakeState.nextDx;
  const currentDy = snakeState.nextDy;

  if (direction === "left" && currentDx !== grid) {
    snakeState.nextDx = -grid;
    snakeState.nextDy = 0;
  }

  if (direction === "up" && currentDy !== grid) {
    snakeState.nextDx = 0;
    snakeState.nextDy = -grid;
  }

  if (direction === "right" && currentDx !== -grid) {
    snakeState.nextDx = grid;
    snakeState.nextDy = 0;
  }

  if (direction === "down" && currentDy !== -grid) {
    snakeState.nextDx = 0;
    snakeState.nextDy = grid;
  }

  startSnakeGame();
}

function showSnakeGameOver(reason = "obstáculo") {
  const content = document.getElementById("phaseContent");
  if (!snakeState || !content) return;

  const reasonText = reason === "parede"
    ? "A cobrinha encostou na borda do caminho."
    : "A cobrinha cruzou o próprio caminho.";

  content.innerHTML = `
    <div class="snake-game-over">
      <p class="tag">Impacto detectado</p>
      <h2>Ops, a cobrinha parou 💥</h2>

      <div class="snake-impact-card">
        <div class="snake-impact-icon">💘</div>
        <div>
          <strong>${reasonText}</strong>
          <p>
            Sua pontuação foi <strong>${snakeState.score}</strong>.
            No amor também é assim: às vezes a gente esbarra, respira e tenta de novo com mais cuidado.
          </p>
        </div>
      </div>

      <div class="start-actions">
        <button onclick="renderSnakeGame(phases[currentPhase])">Tentar novamente</button>
        <button class="secondary" onclick="openMenu()">Voltar ao menu</button>
      </div>
    </div>
  `;
}

document.addEventListener("keydown", function(event) {
  const activeGame = document.getElementById("gameScreen")?.classList.contains("active");
  const isSnake = phases[currentPhase]?.type === "snake";

  if (!activeGame || !isSnake) return;

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    changeSnakeDirection(keyMap[event.key]);
  }
});



function render2048Game(phase) {
  game2048State = {
    board: create2048EmptyBoard(),
    score: 0,
    best: Number(localStorage.getItem("love2048Best") || 0),
    won: false,
    over: false,
    phase
  };

  add2048Tile();
  add2048Tile();

  document.getElementById("phaseContent").innerHTML = `
    <div class="game-2048-wrap">
      <div class="game-2048-info">
        <div class="game-2048-score-card">
          <span>Pontos</span>
          <strong id="score2048">0</strong>
        </div>

        <div class="game-2048-score-card">
          <span>Recorde</span>
          <strong id="best2048">${game2048State.best}</strong>
        </div>
      </div>

      <p class="puzzle-instruction">
        Use as setas do teclado ou deslize no celular. Junte blocos iguais até chegar ao 2048 do amor.
      </p>

      <div class="game-2048-board" id="board2048"></div>

      <div class="controls-2048" aria-label="Controles do 2048">
        <button class="secondary control-2048 up" onclick="move2048('up')">↑</button>
        <button class="secondary control-2048 left" onclick="move2048('left')">←</button>
        <button class="secondary control-2048 down" onclick="move2048('down')">↓</button>
        <button class="secondary control-2048 right" onclick="move2048('right')">→</button>
      </div>

      <div class="start-actions">
        <button class="secondary" onclick="render2048Game(phases[currentPhase])">Reiniciar 2048</button>
        <button class="secondary" onclick="openMenu()">Voltar ao menu</button>
      </div>
    </div>
  `;

  render2048Board();
  setup2048TouchControls();
}

function create2048EmptyBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function add2048Tile() {
  const empty = [];

  game2048State.board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value === 0) empty.push({ r, c });
    });
  });

  if (empty.length === 0) return;

  const spot = empty[Math.floor(Math.random() * empty.length)];
  game2048State.board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
}

function render2048Board() {
  const boardEl = document.getElementById("board2048");
  if (!boardEl || !game2048State) return;

  boardEl.innerHTML = game2048State.board.map(row =>
    row.map(value => `
      <div class="tile-2048 tile-${value}">
        ${value ? get2048TileLabel(value) : ""}
      </div>
    `).join("")
  ).join("");

  const scoreEl = document.getElementById("score2048");
  const bestEl = document.getElementById("best2048");

  if (scoreEl) scoreEl.textContent = game2048State.score;
  if (bestEl) bestEl.textContent = game2048State.best;
}

function get2048TileLabel(value) {
  const labels = {
    2: "2",
    4: "4",
    8: "8",
    16: "16",
    32: "32",
    64: "64",
    128: "128",
    256: "256",
    512: "512",
    1024: "1024",
    2048: "2048 ❤️"
  };

  return labels[value] || value;
}

function move2048(direction) {
  if (!game2048State || game2048State.over) return;

  const previous = JSON.stringify(game2048State.board);

  if (direction === "left") {
    game2048State.board = game2048State.board.map(row => slide2048Row(row));
  }

  if (direction === "right") {
    game2048State.board = game2048State.board.map(row => slide2048Row([...row].reverse()).reverse());
  }

  if (direction === "up") {
    const transposed = transpose2048(game2048State.board);
    const moved = transposed.map(row => slide2048Row(row));
    game2048State.board = transpose2048(moved);
  }

  if (direction === "down") {
    const transposed = transpose2048(game2048State.board);
    const moved = transposed.map(row => slide2048Row([...row].reverse()).reverse());
    game2048State.board = transpose2048(moved);
  }

  const changed = previous !== JSON.stringify(game2048State.board);

  if (!changed) {
    toast("Esse movimento não mudou o tabuleiro 💕");
    return;
  }

  add2048Tile();
  update2048Best();
  render2048Board();

  if (has2048Won() && !game2048State.won) {
    game2048State.won = true;

    setTimeout(() => {
      showSuccess(game2048State.phase.success);
    }, 500);

    return;
  }

  if (!canMove2048()) {
    game2048State.over = true;

    setTimeout(() => {
      show2048GameOver();
    }, 300);
  }
}

function slide2048Row(row) {
  const filtered = row.filter(value => value !== 0);
  const result = [];

  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      game2048State.score += merged;
      i++;
    } else {
      result.push(filtered[i]);
    }
  }

  while (result.length < 4) result.push(0);

  return result;
}

function transpose2048(board) {
  return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
}

function update2048Best() {
  if (game2048State.score > game2048State.best) {
    game2048State.best = game2048State.score;
    localStorage.setItem("love2048Best", game2048State.best);
  }
}

function has2048Won() {
  return game2048State.board.some(row => row.some(value => value >= 2048));
}

function canMove2048() {
  const board = game2048State.board;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true;
      if (c < 3 && board[r][c] === board[r][c + 1]) return true;
      if (r < 3 && board[r][c] === board[r + 1][c]) return true;
    }
  }

  return false;
}

function show2048GameOver() {
  const content = document.getElementById("phaseContent");

  if (!content || !game2048State) return;

  content.innerHTML = `
    <div class="game-2048-over">
      <p class="tag">Fim da rodada</p>
      <h2>O tabuleiro ficou sem caminhos 😅</h2>
      <p>
        Sua pontuação foi <strong>${game2048State.score}</strong>.
        Mas como no amor, algumas combinações precisam de uma nova tentativa.
      </p>

      <div class="start-actions">
        <button onclick="render2048Game(phases[currentPhase])">Tentar novamente</button>
        <button class="secondary" onclick="openMenu()">Voltar ao menu</button>
      </div>
    </div>
  `;
}

function setup2048TouchControls() {
  const board = document.getElementById("board2048");
  if (!board) return;

  let startX = 0;
  let startY = 0;

  board.addEventListener("touchstart", function(event) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true });

  board.addEventListener("touchend", function(event) {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      move2048(dx > 0 ? "right" : "left");
    } else {
      move2048(dy > 0 ? "down" : "up");
    }
  }, { passive: true });
}

document.addEventListener("keydown", function(event) {
  const activeGame = document.getElementById("gameScreen")?.classList.contains("active");
  const is2048 = phases[currentPhase]?.type === "game2048";

  if (!activeGame || !is2048) return;

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    move2048(keyMap[event.key]);
  }
});


function renderMemory() {
  const images = [
    "assets/memory/1.png",
    "assets/memory/2.png",
    "assets/memory/3.png",
    "assets/memory/4.png",
    "assets/memory/5.png",
    "assets/memory/6.png"
  ];

  const cards = shuffleArray([...images, ...images]);

  matchedPairs = 0;
  firstCard = null;
  secondCard = null;
  lockMemory = false;

  document.getElementById("phaseContent").innerHTML = `
    <div class="memory-grid image-memory-grid">
      ${cards.map(image => `
        <div
          class="memory-card image-memory-card"
          data-image="${image}"
          onclick="openMemoryCard(this)"
        >
          <div class="memory-card-inner">
            <div class="memory-card-front">❤️</div>
            <div class="memory-card-back">
              <img src="${image}" alt="Memória" />
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <p class="hint">
      Coloque suas fotos em <strong>assets/memory/1.png</strong> até <strong>assets/memory/6.png</strong>.
    </p>
  `;
}

function openMemoryCard(card) {
  if (
    lockMemory ||
    card.classList.contains("open") ||
    card.classList.contains("matched")
  ) return;

  card.classList.add("open");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockMemory = true;

  const firstImage = firstCard.dataset.image;
  const secondImage = secondCard.dataset.image;

  if (firstImage === secondImage) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs++;
    resetMemoryTurn();

    if (matchedPairs === 6) {
      setTimeout(() => {
        showSuccess("Você encontrou todas as nossas memórias. Algumas fotos ficam no jogo, outras ficam para sempre no coração. ❤️");
      }, 700);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("open");
      secondCard.classList.remove("open");
      resetMemoryTurn();
    }, 1000);
  }
}

function resetMemoryTurn() {
  firstCard = null;
  secondCard = null;
  lockMemory = false;
}

function renderMaze(phase) {
  const maze = [
    [0,0,0,1,0,0,0,0,0],
    [1,1,0,1,0,1,1,1,0],
    [0,0,0,0,0,1,0,0,0],
    [0,1,1,1,0,0,0,1,1],
    [0,0,0,1,1,1,0,0,0],
    [1,1,0,0,0,1,1,1,0],
    [0,0,0,1,0,0,0,1,0],
    [0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,1,0]
  ];

  window.loveMaze = {
    grid: maze,
    player: { row: 0, col: 0 },
    goal: { row: 8, col: 8 },
    moves: 0,
    completed: false,
    success: phase.success
  };

  document.getElementById("phaseContent").innerHTML = `
    <div class="love-maze-intro">
      <p class="puzzle-instruction">
        Use as setas do teclado ou os botões na tela para levar o coração até o nosso destino.
      </p>
      <div class="maze-status">
        <span id="mazeMoves">0 passos</span>
        <span>Destino: nós dois 💘</span>
      </div>
    </div>

    <div class="love-maze-board" id="loveMazeBoard"></div>

    <div class="maze-controls" aria-label="Controles do labirinto">
      <button class="secondary maze-btn up" onclick="moveMazePlayer('up')">↑</button>
      <button class="secondary maze-btn left" onclick="moveMazePlayer('left')">←</button>
      <button class="secondary maze-btn down" onclick="moveMazePlayer('down')">↓</button>
      <button class="secondary maze-btn right" onclick="moveMazePlayer('right')">→</button>
    </div>

    <div class="start-actions">
      <button class="secondary" onclick="renderMaze(phases[currentPhase])">Reiniciar labirinto</button>
      <button class="secondary" onclick="openMenu()">Voltar ao menu</button>
    </div>
  `;

  drawLoveMaze();
}

function drawLoveMaze() {
  const state = window.loveMaze;
  const board = document.getElementById("loveMazeBoard");
  if (!state || !board) return;

  board.innerHTML = state.grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const isPlayer = state.player.row === rowIndex && state.player.col === colIndex;
      const isGoal = state.goal.row === rowIndex && state.goal.col === colIndex;
      const isWall = cell === 1;

      return `
        <div class="maze-cell ${isWall ? "wall" : "path"} ${isGoal ? "goal" : ""}">
          ${isGoal ? `<img class="maze-goal-img" src="assets/maze/love-portal.svg" alt="Portal do Amor" />` : ""}
          ${isPlayer ? `<img class="maze-player-img" src="assets/maze/ninja.svg" alt="Ninja do Amor" />` : ""}
        </div>
      `;
    }).join("")
  ).join("");
}

function moveMazePlayer(direction) {
  const state = window.loveMaze;
  if (!state || state.completed) return;

  const moves = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
  };

  const [deltaRow, deltaCol] = moves[direction];
  const nextRow = state.player.row + deltaRow;
  const nextCol = state.player.col + deltaCol;

  if (
    nextRow < 0 ||
    nextRow >= state.grid.length ||
    nextCol < 0 ||
    nextCol >= state.grid[0].length
  ) {
    toast("Esse caminho não leva ao nosso destino ❤️");
    return;
  }

  if (state.grid[nextRow][nextCol] === 1) {
    toast("Ops! Esse caminho tem um obstáculo. Tente outro 💕");
    pulseMazeWall(nextRow, nextCol);
    return;
  }

  state.player.row = nextRow;
  state.player.col = nextCol;
  state.moves++;

  const movesLabel = document.getElementById("mazeMoves");
  if (movesLabel) movesLabel.textContent = `${state.moves} passos`;

  drawLoveMaze();

  if (state.player.row === state.goal.row && state.player.col === state.goal.col) {
    state.completed = true;
    setTimeout(() => {
      showSuccess(state.success);
    }, 550);
  }
}

function pulseMazeWall(row, col) {
  const cells = [...document.querySelectorAll(".maze-cell")];
  const index = row * window.loveMaze.grid[0].length + col;
  const cell = cells[index];

  if (!cell) return;

  cell.classList.add("blocked");
  setTimeout(() => cell.classList.remove("blocked"), 450);
}

document.addEventListener("keydown", function(event) {
  const activeGame = document.getElementById("gameScreen")?.classList.contains("active");
  const isMaze = phases[currentPhase]?.type === "maze";

  if (!activeGame || !isMaze) return;

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    moveMazePlayer(keyMap[event.key]);
  }
});



function renderHiddenHeart() {
  hiddenFoundObjects = [];
  closeMemoryModal();

  const objects = [
    {
      id: "chocolate",
      name: "Chocolate",
      emoji: "🍫",
      x: 37.2,
      y: 41.8,
      w: 11.2,
      h: 8.2,
      message: "O chocolate representa os pequenos mimos, os detalhes doces e aquelas lembranças simples que fazem o amor ficar ainda mais gostoso."
    },
    {
      id: "gauntlet",
      name: "Manopla do Thanos LEGO",
      emoji: "🟡",
      x: 50.0,
      y: 40.6,
      w: 7.2,
      h: 14.6,
      message: "A manopla do Thanos LEGO guarda a lembrança do aniversário de 5 anos. Mesmo com todas as joias do universo, eu ainda escolheria viver essa história com você."
    },
    {
      id: "beau",
      name: "BEAU TEM MEDO",
      emoji: "🎬",
      x: 47.5,
      y: 56.4,
      w: 8.0,
      h: 12.4,
      message: "Filmes e histórias também fazem parte de nós. Alguns momentos ficam marcados não só pelo que assistimos, mas por quem estava ao nosso lado."
    },
    {
      id: "kami",
      name: "Kami em cartoon",
      emoji: "🐕",
      x: 76.0,
      y: 36.3,
      w: 8.0,
      h: 8.0,
      message: "Kami aparece como parte fofa da nossa vida, lembrando que amor também mora nas pequenas bagunças, nos carinhos e nos detalhes do dia a dia."
    },
    {
      id: "terreno",
      name: "Lote / terreno vazio",
      emoji: "🌱",
      x: 83.0,
      y: 57.0,
      w: 33.0,
      h: 20.0,
      message: "O terreno vazio representa futuro, planos e tudo aquilo que ainda vamos construir juntos. Um espaço em branco esperando os próximos capítulos."
    },
    {
      id: "numero6",
      name: "Número 6",
      emoji: "6️⃣",
      x: 61.0,
      y: 61.5,
      w: 8.0,
      h: 14.0,
      message: "O número 6 representa nossos seis anos: seis fases, muitas memórias e uma história que continua crescendo."
    }
  ];

  document.getElementById("phaseContent").innerHTML = `
    <div class="hidden-room-header">
      <p class="puzzle-instruction">
        Procure os objetos escondidos na cena. Cada item representa uma memória, uma brincadeira ou um plano da nossa história.
      </p>

      <div class="hidden-room-progress">
        <span id="hiddenProgressText">0/${objects.length} memórias encontradas</span>
        <div class="hidden-room-progress-bar">
          <div id="hiddenProgressBar"></div>
        </div>
      </div>
    </div>

    <div class="search-scene-wrapper">
      <div class="search-scene" id="hiddenRoomScene">
        <img class="search-scene-bg" src="assets/hidden-room/cidade_memorias.png" alt="Cidade de memórias" />

        <div class="search-scene-vignette"></div>

        ${objects.map(object => `
          <button
            class="search-hotspot"
            id="hidden-${object.id}"
            style="
              left:${object.x}%;
              top:${object.y}%;
              width:${object.w}%;
              height:${object.h}%;
            "
            onclick="findHiddenObject('${object.id}')"
            aria-label="${object.name}"
            title="${object.name}"
          >
            <span>${object.emoji}</span>
          </button>
        `).join("")}
      </div>
    </div>

    <div class="hidden-object-bank">
      ${objects.map(object => `
        <span class="hidden-chip" id="chip-${object.id}">
          <span>${object.emoji}</span> ${object.name}
        </span>
      `).join("")}
    </div>

    <div class="start-actions">
      <button class="secondary" onclick="giveHiddenHint()">Me dê uma dica</button>
      <button class="secondary" onclick="revealHiddenPulse()">Mostrar brilho rápido</button>
    </div>

    <div class="memory-modal" id="memoryModal">
      <div class="memory-modal-card">
        <button class="modal-close" onclick="closeMemoryModal()">×</button>
        <p class="tag" id="memoryModalTag">Memória encontrada</p>
        <h2 id="memoryModalTitle"></h2>
        <p id="memoryModalText"></p>
      </div>
    </div>
  `;

  window.hiddenRoomObjects = objects;
  updateHiddenProgress();
}
function findHiddenObject(id) {
  if (hiddenFoundObjects.includes(id)) return;

  const object = window.hiddenRoomObjects.find(item => item.id === id);
  if (!object) return;

  hiddenFoundObjects.push(id);

  const objectEl = document.getElementById(`hidden-${id}`);
  const chipEl = document.getElementById(`chip-${id}`);

  if (objectEl) {
    objectEl.classList.add("found");
    objectEl.disabled = true;
  }

  if (chipEl) {
    chipEl.classList.add("found");
  }

  showMemoryModal(object);
  updateHiddenProgress();

  if (hiddenFoundObjects.length === window.hiddenRoomObjects.length) {
    setTimeout(() => {
      showSuccess("Você encontrou todos os detalhes escondidos na nossa cena. Cada objeto era uma pista de uma memória, de uma brincadeira ou de um sonho que faz parte da nossa história. ❤️");
    }, 1800);
  }
}

function updateHiddenProgress() {
  const total = window.hiddenRoomObjects ? window.hiddenRoomObjects.length : 6;
  const current = hiddenFoundObjects.length;

  const text = document.getElementById("hiddenProgressText");
  const bar = document.getElementById("hiddenProgressBar");

  if (text) text.textContent = `${current}/${total} memórias encontradas`;
  if (bar) bar.style.width = `${(current / total) * 100}%`;
}

function showMemoryModal(object) {
  const modal = document.getElementById("memoryModal");
  const title = document.getElementById("memoryModalTitle");
  const text = document.getElementById("memoryModalText");
  const tag = document.getElementById("memoryModalTag");

  if (!modal || !title || !text || !tag) return;

  tag.textContent = `${object.emoji} Memória encontrada`;
  title.textContent = object.name;
  text.textContent = object.message;

  modal.classList.add("show");
}

function closeMemoryModal() {
  const modal = document.getElementById("memoryModal");
  if (modal) modal.classList.remove("show");
}

function giveHiddenHint() {
  if (!window.hiddenRoomObjects) return;

  const remaining = window.hiddenRoomObjects.filter(
    object => !hiddenFoundObjects.includes(object.id)
  );

  if (remaining.length === 0) {
    toast("Você já encontrou tudo ❤️");
    return;
  }

  const next = remaining[0];

  const hints = {
    chocolate: "Dica: procure algo doce perto do centro-esquerda da imagem 🍫",
    gauntlet: "Dica: a manopla está brilhando perto do centro da praça 🟡",
    beau: "Dica: procure um pôster escuro perto da ponte 🎬",
    kami: "Dica: Kami está em um cartaz no lado direito superior 🐕",
    terreno: "Dica: o terreno vazio está no lado direito, cercado e com mato 🌱",
    numero6: "Dica: o número 6 está grande, amarelo e perto do centro-direita 6️⃣"
  };

  toast(hints[next.id] || `Procure por: ${next.name}`);
}

function revealHiddenPulse() {
  document.querySelectorAll(".search-hotspot:not(.found)").forEach(item => {
    item.classList.add("hint-pulse");
  });

  setTimeout(() => {
    document.querySelectorAll(".search-hotspot").forEach(item => {
      item.classList.remove("hint-pulse");
    });
  }, 1200);
}

function renderPuzzle() {
  const gridSize = 3;
  const totalPieces = gridSize * gridSize;
  const imagePath = "assets/puzzle.jpg";

  let order = Array.from({ length: totalPieces }, (_, index) => index);

  do {
    order = shuffleArray(order);
  } while (isSolved(order));

  document.getElementById("phaseContent").innerHTML = `
    <p class="puzzle-instruction">
      Clique em uma peça e depois em outra para trocar de lugar.
      Quando a imagem estiver completa, clique em verificar.
    </p>

    <div class="image-puzzle" id="imagePuzzle" style="--grid-size:${gridSize};">
      ${order.map(pieceIndex => {
        const row = Math.floor(pieceIndex / gridSize);
        const col = pieceIndex % gridSize;

        return `
          <div
            class="image-puzzle-piece"
            data-piece="${pieceIndex}"
            onclick="selectImagePuzzlePiece(this)"
            style="
              background-image: url('${imagePath}');
              background-size: ${gridSize * 100}% ${gridSize * 100}%;
              background-position: ${col * 50}% ${row * 50}%;
            "
          ></div>
        `;
      }).join("")}
    </div>

    <div class="start-actions">
      <button class="secondary" onclick="shuffleImagePuzzle()">Embaralhar</button>
      <button onclick="checkImagePuzzle()">Verificar</button>
    </div>

    <p class="hint">
      Para personalizar, coloque sua foto em <strong>assets/puzzle.jpg</strong>.
    </p>
  `;
}

function renderWordSearch(phase) {
  selectedWordCells = [];
  foundWords = [];

  const gridSize = 14;
  const words = phase.words;
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
  const placedWords = [];

  const fixedPlacements = [
    { word: "LOVO", row: 0, col: 0, direction: "horizontal" },
    { word: "MATCH", row: 2, col: 1, direction: "horizontal" },
    { word: "CONVERSA", row: 4, col: 0, direction: "horizontal" },
    { word: "CURIOSIDADE", row: 6, col: 0, direction: "horizontal" },
    { word: "SORRISO", row: 0, col: 13, direction: "vertical" },
    { word: "ENCANTO", row: 8, col: 2, direction: "horizontal" },
    { word: "DESCOBERTA", row: 10, col: 0, direction: "horizontal" },
    { word: "DESTINO", row: 6, col: 12, direction: "vertical" },
    { word: "AMOR", row: 13, col: 3, direction: "horizontal" }
  ];

  fixedPlacements.forEach(item => {
    const cells = [];
    const word = normalizeWord(item.word);

    for (let i = 0; i < word.length; i++) {
      let row = item.row;
      let col = item.col;

      if (item.direction === "horizontal") col += i;
      if (item.direction === "vertical") row += i;

      grid[row][col] = word[i];
      cells.push(`${row}-${col}`);
    }

    placedWords.push({
      word: item.word,
      cells
    });
  });

  fillEmptyCells(grid);

  document.getElementById("phaseContent").innerHTML = `
    <div class="word-search-layout">
      <div>
        <p class="puzzle-instruction">
          Encontre as palavras escondidas que representam o começo da nossa história no LOVO ❤️
          <br />
          Clique nas letras em sequência e depois em <strong>Confirmar palavra</strong>.
        </p>

        <div class="word-search-grid" style="--word-grid-size:${gridSize};">
          ${grid.map((row, rowIndex) => row.map((letter, colIndex) => `
            <button
              class="word-cell"
              data-row="${rowIndex}"
              data-col="${colIndex}"
              data-letter="${letter}"
              onclick="selectWordCell(this)"
            >
              ${letter}
            </button>
          `).join("")).join("")}
        </div>

        <div class="start-actions">
          <button class="secondary" onclick="clearWordSelection()">Limpar seleção</button>
          <button onclick="confirmWordSelection()">Confirmar palavra</button>
        </div>
      </div>

      <div class="word-bank">
        <h3>Palavras escondidas</h3>
        <div id="wordList">
          ${words.map(word => `<span class="word-chip" data-word="${word}">${word}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  window.currentWordSearch = {
    words,
    placedWords,
    success: phase.success
  };
}

function fillEmptyCells(grid) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid.length; col++) {
      if (grid[row][col] === "") {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function normalizeWord(word) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function selectWordCell(cell) {
  if (cell.classList.contains("found")) return;

  const alreadySelected = selectedWordCells.includes(cell);

  if (alreadySelected) {
    cell.classList.remove("selected");
    selectedWordCells = selectedWordCells.filter(selected => selected !== cell);
    return;
  }

  selectedWordCells.push(cell);
  cell.classList.add("selected");
}

function clearWordSelection() {
  selectedWordCells.forEach(cell => cell.classList.remove("selected"));
  selectedWordCells = [];
}

function confirmWordSelection() {
  if (!window.currentWordSearch || selectedWordCells.length === 0) return;

  const selectedPositions = selectedWordCells.map(
    cell => `${cell.dataset.row}-${cell.dataset.col}`
  );

  const matched = window.currentWordSearch.placedWords.find(item => {
    const direct = JSON.stringify(item.cells);
    const reverse = JSON.stringify([...item.cells].reverse());
    const selected = JSON.stringify(selectedPositions);

    return selected === direct || selected === reverse;
  });

  if (!matched) {
    toast("Essa sequência não forma uma palavra válida ❤️");
    clearWordSelection();
    return;
  }

  if (foundWords.includes(matched.word)) {
    toast("Essa palavra já foi encontrada ✨");
    clearWordSelection();
    return;
  }

  foundWords.push(matched.word);

  selectedWordCells.forEach(cell => {
    cell.classList.remove("selected");
    cell.classList.add("found");
  });

  const chip = document.querySelector(`.word-chip[data-word="${matched.word}"]`);
  if (chip) chip.classList.add("found");

  selectedWordCells = [];
  toast(`Você encontrou: ${matched.word} ❤️`);

  if (foundWords.length === window.currentWordSearch.words.length) {
    setTimeout(() => {
      showSuccess(window.currentWordSearch.success);
    }, 900);
  }
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

function isSolved(order) {
  return order.every((piece, index) => Number(piece) === index);
}

function selectImagePuzzlePiece(piece) {
  if (!selectedPuzzle) {
    selectedPuzzle = piece;
    piece.classList.add("selected");
    return;
  }

  if (selectedPuzzle === piece) {
    piece.classList.remove("selected");
    selectedPuzzle = null;
    return;
  }

  swapImagePieces(selectedPuzzle, piece);

  selectedPuzzle.classList.remove("selected");
  selectedPuzzle = null;
}

function swapImagePieces(first, second) {
  const firstPiece = first.dataset.piece;
  const firstBg = first.style.backgroundPosition;

  first.dataset.piece = second.dataset.piece;
  first.style.backgroundPosition = second.style.backgroundPosition;

  second.dataset.piece = firstPiece;
  second.style.backgroundPosition = firstBg;
}

function checkImagePuzzle() {
  const pieces = [...document.querySelectorAll(".image-puzzle-piece")];
  const solved = pieces.every((piece, index) => Number(piece.dataset.piece) === index);

  if (solved) {
    showSuccess("Você completou a última fase. Nosso amor é a imagem mais bonita que a vida montou peça por peça.");
  } else {
    toast("Ainda não está completo. Continue montando nossa lembrança ❤️");
  }
}

function shuffleImagePuzzle() {
  const pieces = [...document.querySelectorAll(".image-puzzle-piece")];
  let order = pieces.map(piece => Number(piece.dataset.piece));

  do {
    order = shuffleArray(order);
  } while (isSolved(order));

  pieces.forEach((piece, position) => {
    const pieceIndex = order[position];
    const gridSize = 3;
    const row = Math.floor(pieceIndex / gridSize);
    const col = pieceIndex % gridSize;

    piece.dataset.piece = pieceIndex;
    piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
    piece.classList.remove("selected");
  });

  selectedPuzzle = null;
  toast("Quebra-cabeça embaralhado ✨");
}

function showSuccess(message) {
  completedGames.add(currentPhase);

  const card = document.getElementById("phaseCard");

  if (!card) {
    console.error("Elemento #phaseCard não encontrado.");
    return;
  }

  card.innerHTML = `
    <p class="tag">Fase concluída</p>
    <h2>❤️</h2>
    <p>${message}</p>
    <div class="start-actions">
      <button onclick="openMenu()">Voltar ao menu</button>
      <button class="secondary" onclick="renderPhase()">Jogar novamente</button>
    </div>
  `;
}

function openSurpriseMessage() {
  try {
    if (typeof stopSnakeGame === "function") {
      stopSnakeGame();
    }

    if (typeof renderMSG === "function") {
      renderMSG();
      return;
    }

    showFallbackSurpriseMessage();
  } catch (error) {
    console.error("Erro ao abrir mensagem surpresa:", error);
    showFallbackSurpriseMessage();
  }
}

function showFallbackSurpriseMessage() {

  const finalScreen = document.getElementById("finalScreen");
  finalScreen.innerHTML = `
    <div class="card hero final-card surprise-card">
      <p class="tag">Dia dos Namorados + Nosso 6º Aniversário</p>

      <h1>E no fim de todas as fases… o prêmio sempre foi você</h1>

      <h1>❤️</h1>

      <p>
        Seis anos atrás, talvez nenhum de nós imaginasse que aquela primeira conversa seria o início
        da aventura mais bonita da minha vida.
      </p>

      <p>
        E olhando para trás, percebo que a nossa história sempre foi um pouco como esses jogos:
        cheia de descobertas, escolhas, desafios, risadas, memórias escondidas e caminhos que,
        de alguma forma, sempre nos trouxeram de volta um para o outro.
      </p>

      <p>
        No começo, procurávamos algo sem saber exatamente o que encontrar, como no caça-palavras.
        Em meio a tantas possibilidades, foi ali, no LOVO, que encontrei você. E sem perceber,
        encontrei também um lugar bonito para o meu coração descansar.
      </p>

      <p>
        Depois vieram as memórias. Algumas engraçadas, outras simples, outras tão nossas que talvez
        só a gente consiga entender. Como no jogo da memória, cada foto, cada detalhe e cada lembrança
        formam pares perfeitos dentro de mim, porque todas elas carregam um pedacinho de nós.
      </p>

      <p>
        Também tivemos nossos labirintos. Caminhos que nem sempre foram fáceis, obstáculos que exigiram
        paciência, carinho e coragem. Mas, como o pequeno ninja do amor, seguimos tentando encontrar a saída,
        e no fim o destino mais bonito sempre foi o mesmo: nós dois.
      </p>

      <p>
        Tivemos fases leves também, daquelas que parecem uma brincadeira. Como a cobrinha do amor,
        fomos crescendo um pouquinho a cada riso, a cada abraço, a cada plano compartilhado e a cada
        pequena alegria que colecionamos pelo caminho.
      </p>

      <p>
        E no meio dessa nossa cena cheia de objetos escondidos — chocolates, filmes, livros, Kami,
        presentes, sonhos, planos e até um terreno esperando o futuro — existe uma certeza que nunca
        esteve escondida:
      </p>

      <p class="love-letter">
        eu escolheria você de novo.
      </p>

      <p>
        Escolheria aquela primeira conversa. Escolheria nossas risadas. Escolheria os abraços apertados,
        os dias tranquilos, os dias difíceis, os planos que já fizemos e todos os que ainda vamos construir.
      </p>

      <p>
        Porque depois de seis anos, você continua sendo minha pessoa favorita, meu melhor amigo,
        meu porto seguro, minha parceria mais bonita e o amor que eu quero continuar escolhendo todos os dias.
      </p>

      <p>
        Obrigada por caminhar comigo, por permanecer, por dividir a vida, por fazer parte das minhas melhores
        memórias e por transformar até os dias comuns em capítulos especiais da nossa história.
      </p>

      <p>
        Que venham muitos novos níveis, novas fases, novas aventuras, novos sonhos e muitos outros anos
        para comemorarmos juntos.
      </p>

      <p class="love-letter">
        Feliz Dia dos Namorados, meu amor.<br>
        Feliz aniversário de 6 anos para nós.<br><br>
        Eu te amo infinitamente.<br>
        Hoje, amanhã e em todos os próximos níveis que a vida ainda reservar para nós. <br>
        ❤️
      </p>

      <div class="start-actions">
        <button onclick="openMenu()">Menu</button>
      </div>
    </div>
  `;

  showScreen("finalScreen");
}

function renderMSG() {
  if (typeof stopSnakeGame === "function") {
    stopSnakeGame();
  }
  setTheme("dark");

  const finalScreen = document.getElementById("finalScreen");
  finalScreen.innerHTML = `
    <div class="card hero final-card surprise-card">
      <p class="tag">Dia dos Namorados + Nosso 6º Aniversário</p>

      <h1>E no fim de todas as fases… o prêmio sempre foi você</h1>

      <h1>❤️</h1>

      <p>
        Seis anos atrás, talvez nenhum de nós imaginasse que aquela primeira conversa seria o início
        da aventura mais bonita da minha vida.
      </p>

      <p>
        E olhando para trás, percebo que a nossa história sempre foi um pouco como esses jogos:
        cheia de descobertas, escolhas, desafios, risadas, memórias escondidas e caminhos que,
        de alguma forma, sempre nos trouxeram de volta um para o outro.
      </p>

      <p>
        No começo, procurávamos algo sem saber exatamente o que encontrar, como no caça-palavras.
        Em meio a tantas possibilidades, foi ali, no LOVO, que encontrei você. E sem perceber,
        encontrei também um lugar bonito para o meu coração descansar.
      </p>

      <p>
        Depois vieram as memórias. Algumas engraçadas, outras simples, outras tão nossas que talvez
        só a gente consiga entender. Como no jogo da memória, cada foto, cada detalhe e cada lembrança
        formam pares perfeitos dentro de mim, porque todas elas carregam um pedacinho de nós.
      </p>

      <p>
        Também tivemos nossos labirintos. Caminhos que nem sempre foram fáceis, obstáculos que exigiram
        paciência, carinho e coragem. Mas, como o pequeno ninja do amor, seguimos tentando encontrar a saída,
        e no fim o destino mais bonito sempre foi o mesmo: nós dois.
      </p>

      <p>
        Tivemos fases leves também, daquelas que parecem uma brincadeira. Como a cobrinha do amor,
        fomos crescendo um pouquinho a cada riso, a cada abraço, a cada plano compartilhado e a cada
        pequena alegria que colecionamos pelo caminho.
      </p>

      <p>
        E no meio dessa nossa cena cheia de objetos escondidos — chocolates, filmes, livros, Kami,
        presentes, sonhos, planos e até um terreno esperando o futuro — existe uma certeza que nunca
        esteve escondida:
      </p>

      <p class="love-letter">
        eu escolheria você de novo.
      </p>

      <p>
        Escolheria aquela primeira conversa. Escolheria nossas risadas. Escolheria os abraços apertados,
        os dias tranquilos, os dias difíceis, os planos que já fizemos e todos os que ainda vamos construir.
      </p>

      <p>
        Porque depois de seis anos, você continua sendo minha pessoa favorita, meu melhor amigo,
        meu porto seguro, minha parceria mais bonita e o amor que eu quero continuar escolhendo todos os dias.
      </p>

      <p>
        Obrigada por caminhar comigo, por permanecer, por dividir a vida, por fazer parte das minhas melhores
        memórias e por transformar até os dias comuns em capítulos especiais da nossa história.
      </p>

      <p>
        Que venham muitos novos níveis, novas fases, novas aventuras, novos sonhos e muitos outros anos
        para comemorarmos juntos.
      </p>

      <p class="love-letter">
        Feliz Dia dos Namorados, meu amor.<br>
        Feliz aniversário de 6 anos para nós.<br><br>
        Eu te amo infinitamente.<br>
        Hoje, amanhã e em todos os próximos níveis que a vida ainda reservar para nós. <br>
        ❤️
      </p>

      <div class="start-actions">
        <button onclick="openMenu()">Menu</button>
      </div>
    </div>
  `;

  showScreen("finalScreen");
  toast("Mensagem surpresa desbloqueada ❤️");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const button = document.getElementById("themeToggle");
  const badge = document.getElementById("themeBadge");

  if (theme === "dark") {
    button.textContent = "☀️ Modo Memórias";
    if (badge) badge.textContent = "🌙 Modo Madrugada";
  } else {
    button.textContent = "🌙 Modo Madrugada";
    if (badge) badge.textContent = "☀️ Modo Memórias";
  }

  localStorage.setItem("loveGameTheme", theme);
}

function startBackgroundMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  audio.loop = true;
  audio.volume = 0.55;

  const tryPlay = () => {
    audio.play().catch(() => {
      // Navegadores móveis normalmente exigem o primeiro toque do usuário.
      // Por isso o play também é chamado no primeiro clique/toque da tela.
    });
  };

  tryPlay();

  const unlockAudio = () => {
    tryPlay();
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });
}

function playMusic() {
  startBackgroundMusic();
}

function toast(message) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
}

function createFloatingHearts() {
  const hearts = document.getElementById("hearts");

  setInterval(() => {
    const heart = document.createElement("span");
    heart.textContent = ["❤️", "💕", "💖", "💘"][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 4 + 5 + "s";
    hearts.appendChild(heart);

    setTimeout(() => heart.remove(), 9000);
  }, 650);
}

function createStars() {
  const stars = document.getElementById("stars");

  for (let i = 0; i < 55; i++) {
    const star = document.createElement("span");
    star.textContent = "✦";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";
    star.style.animationDelay = Math.random() * 4 + "s";
    stars.appendChild(star);
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem("loveGameTheme") || "light";
  setTheme(savedTheme);
}

loadTheme();
createStars();
createFloatingHearts();
