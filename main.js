const ui = {
  loadingScreen: document.getElementById("loading-screen"),
  loadingBar: document.getElementById("loading-bar-fill"),
  loadingStatus: document.getElementById("loading-status"),
  intro: document.getElementById("intro"),
  introNext: document.getElementById("intro-next"),
  introSkip: document.getElementById("intro-skip"),
  introDots: document.querySelectorAll("#intro-dots .dot"),
  introSlides: document.querySelectorAll(".intro-slide"),
  app: document.getElementById("app"),
  languageSelect: document.getElementById("language-select"),
  runButton: document.getElementById("run-button"),
  resetButton: document.getElementById("reset-button"),
  sampleButton: document.getElementById("sample-button"),
  clearButton: document.getElementById("clear-button"),
  codeEditor: document.getElementById("code-editor"),
  commandList: document.getElementById("command-list"),
  consoleOutput: document.getElementById("console-output"),
  energyValue: document.getElementById("energy-value"),
  missionList: document.getElementById("mission-list"),
  canvas: document.getElementById("game-canvas"),
};

const STORAGE = {
  language: "codex-language",
  missions: "codex-missions",
  codePrefix: "codex-code-",
};

const languageSpecs = {
  python: {
    label: "Python",
    sample: `# Boot sequence: Neon Delta
hero = Avatar()
hero.move()
hero.move()
hero.turn_left()
hero.move()
hero.scan()
hero.say("Gate online")
hero.wait(1)
`,
    hints: [
      "hero.move() - advance one tile",
      "hero.turn_left() - rotate left",
      "hero.turn_right() - rotate right",
      "hero.wait(n) - pause in seconds",
      "hero.say(\"text\") - broadcast message",
      "hero.scan() - inspect surroundings",
    ],
    rules: [
      { type: "move", regex: /(?:\.|\\b)move\\(\\)/ },
      { type: "turn_left", regex: /(?:\.|\\b)turn_left\\(\\)/ },
      { type: "turn_right", regex: /(?:\.|\\b)turn_right\\(\\)/ },
      { type: "wait", regex: /(?:\.|\\b)wait\\(\\s*(\\d+)\\s*\\)/ },
      {
        type: "say",
        regex: /(?:\.|\\b)say\\(\\s*["']([^"']*)["']\\s*\\)/,
      },
      { type: "scan", regex: /(?:\.|\\b)scan\\(\\)/ },
    ],
  },
  java: {
    label: "Java",
    sample: `// Boot sequence: Neon Delta
Avatar hero = new Avatar();
hero.move();
hero.move();
hero.turnLeft();
hero.move();
hero.scan();
hero.say("Gate online");
hero.wait(1);
`,
    hints: [
      "hero.move() - advance one tile",
      "hero.turnLeft() - rotate left",
      "hero.turnRight() - rotate right",
      "hero.wait(n) - pause in seconds",
      "hero.say(\"text\") - broadcast message",
      "hero.scan() - inspect surroundings",
    ],
    rules: [
      { type: "move", regex: /(?:\.|\\b)move\\(\\)\\s*;?/ },
      { type: "turn_left", regex: /(?:\.|\\b)turnLeft\\(\\)\\s*;?/ },
      { type: "turn_right", regex: /(?:\.|\\b)turnRight\\(\\)\\s*;?/ },
      { type: "wait", regex: /(?:\.|\\b)wait\\(\\s*(\\d+)\\s*\\)\\s*;?/ },
      {
        type: "say",
        regex: /(?:\.|\\b)say\\(\\s*["']([^"']*)["']\\s*\\)\\s*;?/,
      },
      { type: "scan", regex: /(?:\.|\\b)scan\\(\\)\\s*;?/ },
    ],
  },
  cpp: {
    label: "C++",
    sample: `// Boot sequence: Neon Delta
Avatar hero;
hero.move();
hero.move();
hero.turn_left();
hero.move();
hero.scan();
hero.say("Gate online");
hero.wait(1);
`,
    hints: [
      "hero.move() - advance one tile",
      "hero.turn_left() - rotate left",
      "hero.turn_right() - rotate right",
      "hero.wait(n) - pause in seconds",
      "hero.say(\"text\") - broadcast message",
      "hero.scan() - inspect surroundings",
    ],
    rules: [
      { type: "move", regex: /(?:\.|\\b)move\\(\\)\\s*;?/ },
      { type: "turn_left", regex: /(?:\.|\\b)turn_left\\(\\)\\s*;?/ },
      { type: "turn_right", regex: /(?:\.|\\b)turn_right\\(\\)\\s*;?/ },
      { type: "wait", regex: /(?:\.|\\b)wait\\(\\s*(\\d+)\\s*\\)\\s*;?/ },
      {
        type: "say",
        regex: /(?:\.|\\b)say\\(\\s*["']([^"']*)["']\\s*\\)\\s*;?/,
      },
      { type: "scan", regex: /(?:\.|\\b)scan\\(\\)\\s*;?/ },
    ],
  },
};

const IGNORE_PATTERNS = [
  /^\\s*from\\s+/i,
  /^\\s*import\\s+/i,
  /^\\s*using\\s+/i,
  /^\\s*#include/i,
  /^\\s*class\\s+/i,
  /^\\s*public\\s+/i,
  /^\\s*private\\s+/i,
  /^\\s*protected\\s+/i,
  /^\\s*static\\s+/i,
  /^\\s*int\\s+main/i,
  /^\\s*return\\b/i,
  /^\\s*\\{/,
  /^\\s*\\}/,
  /Avatar/,
];

const worldConfig = {
  width: 20,
  height: 11,
  tileSize: 32,
  gate: { x: 18, y: 5 },
  beacon: { x: 8, y: 2 },
  obstacles: new Set(
    [
      [6, 2],
      [6, 3],
      [6, 4],
      [10, 6],
      [11, 6],
      [12, 6],
      [13, 6],
      [4, 7],
      [4, 8],
      [4, 9],
      [15, 3],
      [16, 3],
      [15, 7],
      [16, 7],
    ].map(([x, y]) => `${x},${y}`)
  ),
};

const player = {
  x: 2,
  y: 5,
  dir: 1,
  energy: 100,
  moving: false,
  fromX: 2,
  fromY: 5,
  toX: 2,
  toY: 5,
  moveStart: 0,
  moveDuration: 320,
};

const effects = [];
const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const missionState = {
  "first-run": false,
  "gate-unlock": false,
  "beacon-online": false,
};

let currentLanguage = "python";
let introIndex = 0;
let introTimer = null;
let executionTimer = null;
let running = false;
let queuedCommands = [];
let lastLogId = 0;

const canvas = ui.canvas;
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const lerp = (start, end, t) => start + (end - start) * t;

const addPulse = (x, y, color) => {
  effects.push({
    x,
    y,
    color,
    start: performance.now(),
    duration: 600,
  });
};

const logEvent = (message, type = "info") => {
  if (!ui.consoleOutput) return;
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const text = document.createElement("div");
  text.textContent = message;
  const stamp = document.createElement("span");
  stamp.className = "timestamp";
  stamp.textContent = `Signal ${++lastLogId}`;
  entry.appendChild(text);
  entry.appendChild(stamp);
  ui.consoleOutput.appendChild(entry);
  ui.consoleOutput.scrollTop = ui.consoleOutput.scrollHeight;
};

const updateEnergy = () => {
  if (ui.energyValue) {
    ui.energyValue.textContent = Math.max(player.energy, 0);
  }
};

const saveMissions = () => {
  localStorage.setItem(STORAGE.missions, JSON.stringify(missionState));
};

const updateMissionsUI = () => {
  if (!ui.missionList) return;
  const items = ui.missionList.querySelectorAll(".mission");
  items.forEach((item) => {
    const key = item.dataset.mission;
    if (!key) return;
    if (missionState[key]) {
      item.classList.add("complete");
      const status = item.querySelector(".mission-status");
      if (status) status.textContent = "Complete";
    }
  });
};

const unlockMission = (key, message) => {
  if (missionState[key]) return;
  missionState[key] = true;
  saveMissions();
  updateMissionsUI();
  if (message) logEvent(message, "success");
};

const loadMissionState = () => {
  const saved = localStorage.getItem(STORAGE.missions);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    Object.keys(missionState).forEach((key) => {
      if (typeof parsed[key] === "boolean") {
        missionState[key] = parsed[key];
      }
    });
  } catch (error) {
    logEvent("Mission cache corrupted, rebuilding state.", "error");
  }
};

const parseCommands = (code, lang) => {
  const spec = languageSpecs[lang];
  const lines = code.split("\\n");
  const commands = [];
  const anomalies = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("#") || trimmed.startsWith("//")) return;
    if (IGNORE_PATTERNS.some((pattern) => pattern.test(trimmed))) return;

    let matched = false;
    for (const rule of spec.rules) {
      const match = trimmed.match(rule.regex);
      if (match) {
        matched = true;
        const command = { type: rule.type, line: index + 1 };
        if (rule.type === "wait") {
          command.value = Math.max(parseInt(match[1], 10) || 1, 1);
        }
        if (rule.type === "say") {
          command.message = match[1] || "Message received";
        }
        commands.push(command);
        break;
      }
    }

    if (!matched && /[A-Za-z0-9]/.test(trimmed)) {
      anomalies.push({ line: index + 1, text: trimmed });
    }
  });

  return { commands, anomalies };
};

const stopExecution = () => {
  running = false;
  queuedCommands = [];
  if (executionTimer) {
    clearTimeout(executionTimer);
  }
};

const resetWorld = (announce = true) => {
  stopExecution();
  player.x = 2;
  player.y = 5;
  player.dir = 1;
  player.energy = 100;
  player.moving = false;
  updateEnergy();
  if (announce) logEvent("World reset. Awaiting new instructions.");
};

const handleTileEvent = () => {
  const key = `${player.x},${player.y}`;
  if (key === `${worldConfig.gate.x},${worldConfig.gate.y}`) {
    unlockMission("gate-unlock", "Gate unlocked. The world expands.");
  }
};

const handleScan = () => {
  const distance =
    Math.abs(player.x - worldConfig.beacon.x) +
    Math.abs(player.y - worldConfig.beacon.y);
  if (distance <= 1) {
    unlockMission("beacon-online", "Beacon online. Signal amplified.");
    addPulse(worldConfig.beacon.x, worldConfig.beacon.y, "#69f59b");
  } else {
    logEvent("Scan ping returned faint echoes.", "info");
  }
};

const attemptMove = () => {
  const vector = directions[player.dir];
  const targetX = player.x + vector.x;
  const targetY = player.y + vector.y;
  const key = `${targetX},${targetY}`;

  if (
    targetX < 0 ||
    targetX >= worldConfig.width ||
    targetY < 0 ||
    targetY >= worldConfig.height
  ) {
    logEvent("Boundary locked. The void pushes back.", "error");
    player.energy -= 5;
    updateEnergy();
    addPulse(targetX, targetY, "#ff5c7c");
    return player.moveDuration;
  }

  if (worldConfig.obstacles.has(key)) {
    logEvent("Collision detected. Energy drained.", "error");
    player.energy -= 8;
    updateEnergy();
    addPulse(targetX, targetY, "#ff5c7c");
    return player.moveDuration;
  }

  player.moving = true;
  player.fromX = player.x;
  player.fromY = player.y;
  player.toX = targetX;
  player.toY = targetY;
  player.moveStart = performance.now();
  player.energy -= 1;
  updateEnergy();
  addPulse(targetX, targetY, "#6df0ff");
  return player.moveDuration + 100;
};

const runNextCommand = () => {
  if (!running) return;
  if (player.energy <= 0) {
    logEvent("Energy depleted. Reset required.", "error");
    stopExecution();
    return;
  }

  const command = queuedCommands.shift();
  if (!command) {
    running = false;
    logEvent("Sequence complete. World stabilized.");
    return;
  }

  let delay = 500;
  switch (command.type) {
    case "move":
      delay = attemptMove();
      break;
    case "turn_left":
      player.dir = (player.dir + 3) % 4;
      addPulse(player.x, player.y, "#6df0ff");
      logEvent("Rotation vector set to left.");
      delay = 380;
      break;
    case "turn_right":
      player.dir = (player.dir + 1) % 4;
      addPulse(player.x, player.y, "#6df0ff");
      logEvent("Rotation vector set to right.");
      delay = 380;
      break;
    case "wait":
      logEvent(`Holding position for ${command.value} seconds.`);
      delay = command.value * 1000;
      break;
    case "say":
      logEvent(`Broadcast: ${command.message}`);
      addPulse(player.x, player.y, "#ff4fd8");
      delay = 500;
      break;
    case "scan":
      handleScan();
      delay = 520;
      break;
    default:
      logEvent("Unknown signal received. World ignores it.", "error");
      delay = 420;
      break;
  }

  executionTimer = setTimeout(runNextCommand, delay);
};

const executeProgram = () => {
  stopExecution();
  const { commands, anomalies } = parseCommands(ui.codeEditor.value, currentLanguage);

  ui.consoleOutput.innerHTML = "";
  lastLogId = 0;
  logEvent("Sandbox engaged. Parsing instructions.");
  unlockMission("first-run", "Signal link established.");

  if (anomalies.length) {
    anomalies.forEach((issue) => {
      logEvent(
        `Anomaly at line ${issue.line}: unrecognized instruction.`,
        "error"
      );
    });
  }

  if (!commands.length) {
    logEvent("No valid commands detected. Provide core instructions.", "error");
    return;
  }

  queuedCommands = commands;
  running = true;
  runNextCommand();
};

const updateCodeHints = (lang) => {
  const spec = languageSpecs[lang];
  if (!spec) return;
  ui.commandList.innerHTML = "";
  spec.hints.forEach((hint) => {
    const li = document.createElement("li");
    li.textContent = hint;
    ui.commandList.appendChild(li);
  });
};

const loadCodeForLanguage = (lang, forceSample = false) => {
  const saved = localStorage.getItem(`${STORAGE.codePrefix}${lang}`);
  if (!forceSample && saved) {
    ui.codeEditor.value = saved;
    return;
  }
  ui.codeEditor.value = languageSpecs[lang].sample;
};

const setLanguage = (lang, forceSample = false) => {
  if (!languageSpecs[lang]) return;
  currentLanguage = lang;
  ui.languageSelect.value = lang;
  localStorage.setItem(STORAGE.language, lang);
  updateCodeHints(lang);
  loadCodeForLanguage(lang, forceSample);
  saveCode();
};

const saveCode = () => {
  localStorage.setItem(
    `${STORAGE.codePrefix}${currentLanguage}`,
    ui.codeEditor.value
  );
};

const startLoading = () => {
  const statusSteps = [
    "Booting simulation core",
    "Loading neon terrain",
    "Linking sandbox runtime",
    "Syncing avatar telemetry",
    "Calibration complete",
  ];
  let progress = 0;
  let step = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random() * 12) + 6, 100);
    ui.loadingBar.style.width = `${progress}%`;
    ui.loadingStatus.textContent = statusSteps[step % statusSteps.length];
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        ui.loadingScreen.classList.add("hidden");
        startIntro();
      }, 300);
    }
    step += 1;
  }, 180);
};

const showIntroSlide = (index) => {
  ui.introSlides.forEach((slide, idx) => {
    slide.classList.toggle("active", idx === index);
  });
  ui.introDots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === index);
  });
  if (index >= ui.introSlides.length - 1) {
    ui.introNext.textContent = "Enter World";
  } else {
    ui.introNext.textContent = "Next";
  }
};

const startIntro = () => {
  ui.intro.classList.remove("hidden");
  ui.intro.setAttribute("aria-hidden", "false");
  introIndex = 0;
  showIntroSlide(introIndex);
  introTimer = setInterval(() => {
    introIndex += 1;
    if (introIndex >= ui.introSlides.length) {
      finishIntro();
    } else {
      showIntroSlide(introIndex);
    }
  }, 4200);
};

const finishIntro = () => {
  if (introTimer) clearInterval(introTimer);
  ui.intro.classList.add("hidden");
  ui.intro.setAttribute("aria-hidden", "true");
  ui.app.classList.remove("hidden");
  ui.app.setAttribute("aria-hidden", "false");
};

const drawWorld = (now) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#040814";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(108, 240, 255, 0.08)";
  for (let x = 0; x <= worldConfig.width; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * worldConfig.tileSize, 0);
    ctx.lineTo(x * worldConfig.tileSize, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= worldConfig.height; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * worldConfig.tileSize);
    ctx.lineTo(canvas.width, y * worldConfig.tileSize);
    ctx.stroke();
  }

  worldConfig.obstacles.forEach((cell) => {
    const [x, y] = cell.split(",").map(Number);
    ctx.fillStyle = "rgba(108, 240, 255, 0.2)";
    ctx.fillRect(
      x * worldConfig.tileSize + 4,
      y * worldConfig.tileSize + 4,
      worldConfig.tileSize - 8,
      worldConfig.tileSize - 8
    );
  });

  ctx.fillStyle = "rgba(255, 79, 216, 0.2)";
  ctx.fillRect(
    worldConfig.gate.x * worldConfig.tileSize + 2,
    worldConfig.gate.y * worldConfig.tileSize + 2,
    worldConfig.tileSize - 4,
    worldConfig.tileSize - 4
  );
  ctx.strokeStyle = "rgba(255, 79, 216, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    worldConfig.gate.x * worldConfig.tileSize + 3,
    worldConfig.gate.y * worldConfig.tileSize + 3,
    worldConfig.tileSize - 6,
    worldConfig.tileSize - 6
  );

  ctx.fillStyle = "rgba(108, 240, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(
    worldConfig.beacon.x * worldConfig.tileSize + worldConfig.tileSize / 2,
    worldConfig.beacon.y * worldConfig.tileSize + worldConfig.tileSize / 2,
    10,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "rgba(108, 240, 255, 0.65)";
  ctx.stroke();

  effects.forEach((pulse, index) => {
    const progress = (now - pulse.start) / pulse.duration;
    if (progress >= 1) return;
    const radius = 8 + progress * 20;
    ctx.strokeStyle = pulse.color;
    ctx.globalAlpha = 1 - progress;
    ctx.beginPath();
    ctx.arc(
      pulse.x * worldConfig.tileSize + worldConfig.tileSize / 2,
      pulse.y * worldConfig.tileSize + worldConfig.tileSize / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  for (let i = effects.length - 1; i >= 0; i -= 1) {
    if ((now - effects[i].start) / effects[i].duration >= 1) {
      effects.splice(i, 1);
    }
  }

  const moveProgress = player.moving
    ? Math.min((now - player.moveStart) / player.moveDuration, 1)
    : 1;
  const drawX = player.moving
    ? lerp(player.fromX, player.toX, moveProgress)
    : player.x;
  const drawY = player.moving
    ? lerp(player.fromY, player.toY, moveProgress)
    : player.y;

  if (player.moving && moveProgress >= 1) {
    player.x = player.toX;
    player.y = player.toY;
    player.moving = false;
    handleTileEvent();
  }

  const px = drawX * worldConfig.tileSize + 6;
  const py = drawY * worldConfig.tileSize + 6;
  ctx.fillStyle = "#6df0ff";
  ctx.fillRect(px, py, worldConfig.tileSize - 12, worldConfig.tileSize - 12);

  ctx.fillStyle = "#04101c";
  const arrowSize = 6;
  const centerX = px + (worldConfig.tileSize - 12) / 2;
  const centerY = py + (worldConfig.tileSize - 12) / 2;
  ctx.beginPath();
  if (player.dir === 0) {
    ctx.moveTo(centerX, centerY - arrowSize);
    ctx.lineTo(centerX - arrowSize, centerY + arrowSize);
    ctx.lineTo(centerX + arrowSize, centerY + arrowSize);
  } else if (player.dir === 1) {
    ctx.moveTo(centerX + arrowSize, centerY);
    ctx.lineTo(centerX - arrowSize, centerY - arrowSize);
    ctx.lineTo(centerX - arrowSize, centerY + arrowSize);
  } else if (player.dir === 2) {
    ctx.moveTo(centerX, centerY + arrowSize);
    ctx.lineTo(centerX - arrowSize, centerY - arrowSize);
    ctx.lineTo(centerX + arrowSize, centerY - arrowSize);
  } else {
    ctx.moveTo(centerX - arrowSize, centerY);
    ctx.lineTo(centerX + arrowSize, centerY - arrowSize);
    ctx.lineTo(centerX + arrowSize, centerY + arrowSize);
  }
  ctx.closePath();
  ctx.fill();
};

const startRenderLoop = () => {
  const loop = (now) => {
    drawWorld(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

const bindEvents = () => {
  ui.introNext.addEventListener("click", () => {
    introIndex += 1;
    if (introIndex >= ui.introSlides.length) {
      finishIntro();
    } else {
      showIntroSlide(introIndex);
    }
  });

  ui.introSkip.addEventListener("click", () => {
    finishIntro();
  });

  ui.languageSelect.addEventListener("change", (event) => {
    saveCode();
    setLanguage(event.target.value);
  });

  ui.runButton.addEventListener("click", executeProgram);
  ui.resetButton.addEventListener("click", () => resetWorld(true));
  ui.sampleButton.addEventListener("click", () => setLanguage(currentLanguage, true));
  ui.clearButton.addEventListener("click", () => {
    ui.codeEditor.value = "";
    saveCode();
  });
  ui.codeEditor.addEventListener("input", saveCode);
};

const init = () => {
  loadMissionState();
  updateMissionsUI();
  resetWorld(false);

  const savedLanguage = localStorage.getItem(STORAGE.language);
  setLanguage(savedLanguage || "python");

  bindEvents();
  startRenderLoop();
  startLoading();
};

init();
