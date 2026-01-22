const state = {
  language: "python",
  isRunning: false,
  energy: 0,
  missionIndex: 0,
  achievements: {},
  missions: [
    "Reach the neon node and interact to stabilize the sector.",
    "Transmit a greeting with say(\"...\") to unlock comms.",
    "Sector stabilized. Keep experimenting with new logic.",
  ],
};

const elements = {
  loadingScreen: document.getElementById("loading-screen"),
  loadingFill: document.getElementById("loading-fill"),
  loadingPercent: document.getElementById("loading-percent"),
  introScreen: document.getElementById("intro-screen"),
  introTitle: document.getElementById("intro-title"),
  introBody: document.getElementById("intro-body"),
  introStep: document.getElementById("intro-step"),
  introDots: Array.from(document.querySelectorAll(".intro-progress .dot")),
  introNext: document.getElementById("intro-next"),
  introSkip: document.getElementById("intro-skip"),
  app: document.getElementById("app"),
  tabs: Array.from(document.querySelectorAll(".language-selector .tab")),
  runBtn: document.getElementById("run-btn"),
  resetBtn: document.getElementById("reset-btn"),
  guideBtn: document.getElementById("guide-btn"),
  saveBtn: document.getElementById("save-btn"),
  editor: document.getElementById("code-editor"),
  outputLog: document.getElementById("output-log"),
  eventBanner: document.getElementById("event-banner"),
  worldStatus: document.getElementById("world-status"),
  logStatus: document.getElementById("log-status"),
  hudCoords: document.getElementById("hud-coords"),
  hudEnergy: document.getElementById("hud-energy"),
  missionText: document.getElementById("mission-text"),
  achievementList: document.getElementById("achievement-list"),
  canvas: document.getElementById("game-canvas"),
};

const introSlides = [
  {
    title: "Welcome to the Codeworld",
    body:
      "You are entering a programmable game realm. Every action, object, and event is driven by code you write.",
  },
  {
    title: "Programming is the Controller",
    body:
      "Move, interact, and solve challenges by writing scripts. There are no buttons for movement here.",
  },
  {
    title: "Learn Through Play",
    body:
      "The world responds in real time to your logic. Errors appear as world anomalies, not dry system alerts.",
  },
  {
    title: "Switch Languages",
    body:
      "Choose Python, Java, or C++ to express the same core commands and experiment with different syntax.",
  },
];

const languageTemplates = {
  python: `# Use the API to control the agent
move("up")
move("up")
move("right")
say("Signal online")
repeat(2):
  move("right")
interact()`,
  java: `// Use the API to control the agent
move("up");
move("up");
move("right");
say("Signal online");
repeat(2) {
  move("right");
}
interact();`,
  cpp: `// Use the API to control the agent
move("up");
move("up");
move("right");
say("Signal online");
repeat(2) {
  move("right");
}
interact();`,
};

const achievementsCatalog = [
  { id: "first-run", label: "First boot sequence" },
  { id: "first-move", label: "First movement command" },
  { id: "first-interact", label: "First interaction" },
  { id: "energy-collected", label: "Energy node stabilized" },
  { id: "voice-online", label: "Signal transmitted" },
];

const world = {
  size: 16,
  player: { x: 2, y: 12, color: "#59f4ff" },
  nodes: [
    { x: 11, y: 4, glow: 0 },
    { x: 4, y: 2, glow: 0 },
  ],
  obstacles: [
    { x: 6, y: 8 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 9, y: 8 },
    { x: 10, y: 8 },
    { x: 11, y: 8 },
    { x: 12, y: 8 },
  ],
  drone: { x: 13, y: 12, dir: -1 },
};

let introIndex = 0;
let ctx;
let animationId;

function startLoading() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(showIntro, 400);
    }
    elements.loadingFill.style.width = `${progress}%`;
    elements.loadingPercent.textContent = `${progress}%`;
  }, 180);
}

function showIntro() {
  elements.loadingScreen.classList.add("hidden");
  elements.introScreen.classList.remove("hidden");
  renderIntro();
}

function renderIntro() {
  const slide = introSlides[introIndex];
  elements.introTitle.textContent = slide.title;
  elements.introBody.textContent = slide.body;
  elements.introStep.textContent = String(introIndex + 1).padStart(2, "0");
  elements.introDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === introIndex);
  });
  elements.introNext.textContent = introIndex === introSlides.length - 1 ? "Enter" : "Next";
}

function nextIntro() {
  if (introIndex < introSlides.length - 1) {
    introIndex += 1;
    renderIntro();
  } else {
    elements.introScreen.classList.add("hidden");
    elements.app.classList.remove("hidden");
    initializeApp();
  }
}

function initializeApp() {
  restoreProgress();
  if (!elements.editor.value.trim()) {
    elements.editor.value = languageTemplates[state.language];
  }
  elements.missionText.textContent = state.missions[state.missionIndex];
  updateAchievements();
  updateHud();
  setupCanvas();
  logEvent("system", "Simulation online. Awaiting code input.");
  elements.worldStatus.textContent = "Simulation ready";
}

function setupCanvas() {
  ctx = elements.canvas.getContext("2d");
  const resize = () => {
    const rect = elements.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    elements.canvas.width = rect.width * ratio;
    elements.canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  window.addEventListener("resize", resize);
  resize();
  animationLoop();
}

function animationLoop() {
  drawWorld();
  animationId = requestAnimationFrame(animationLoop);
}

function drawWorld() {
  const { width, height } = elements.canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b0f1d";
  ctx.fillRect(0, 0, width, height);

  const cell = Math.floor(Math.min(width, height) / world.size);
  const offsetX = Math.floor((width - cell * world.size) / 2);
  const offsetY = Math.floor((height - cell * world.size) / 2);

  ctx.strokeStyle = "rgba(120, 130, 180, 0.14)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= world.size; i += 1) {
    const x = offsetX + i * cell;
    const y = offsetY + i * cell;
    ctx.beginPath();
    ctx.moveTo(x, offsetY);
    ctx.lineTo(x, offsetY + cell * world.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + cell * world.size, y);
    ctx.stroke();
  }

  drawObstacles(cell, offsetX, offsetY);
  drawNodes(cell, offsetX, offsetY);
  drawDrone(cell, offsetX, offsetY);
  drawPlayer(cell, offsetX, offsetY);
}

function drawPlayer(cell, offsetX, offsetY) {
  const { x, y, color } = world.player;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillRect(offsetX + x * cell + 4, offsetY + y * cell + 4, cell - 8, cell - 8);
  ctx.shadowBlur = 0;
}

function drawNodes(cell, offsetX, offsetY) {
  world.nodes.forEach((node) => {
    node.glow += 0.05;
    const pulse = (Math.sin(node.glow) + 1) / 2;
    const glow = 8 + pulse * 8;
    ctx.fillStyle = "#ff5ef7";
    ctx.shadowColor = "#ff5ef7";
    ctx.shadowBlur = glow;
    ctx.beginPath();
    ctx.arc(
      offsetX + node.x * cell + cell / 2,
      offsetY + node.y * cell + cell / 2,
      cell / 4 + pulse * 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawObstacles(cell, offsetX, offsetY) {
  ctx.fillStyle = "rgba(89, 244, 255, 0.3)";
  world.obstacles.forEach((block) => {
    ctx.fillRect(offsetX + block.x * cell + 2, offsetY + block.y * cell + 2, cell - 4, cell - 4);
  });
}

function drawDrone(cell, offsetX, offsetY) {
  const drone = world.drone;
  drone.x += drone.dir * 0.02;
  if (drone.x < 3 || drone.x > world.size - 3) {
    drone.dir *= -1;
  }
  ctx.fillStyle = "#5cff8d";
  ctx.shadowColor = "#5cff8d";
  ctx.shadowBlur = 6;
  ctx.fillRect(offsetX + drone.x * cell + cell / 4, offsetY + drone.y * cell + cell / 4, cell / 2, cell / 2);
  ctx.shadowBlur = 0;
}

function updateHud() {
  elements.hudCoords.textContent = `${world.player.x},${world.player.y}`;
  elements.hudEnergy.textContent = String(state.energy);
}

function showBanner(message, variant = "info") {
  elements.eventBanner.textContent = message;
  elements.eventBanner.classList.add("active");
  elements.eventBanner.style.color =
    variant === "error" ? "var(--danger)" : variant === "success" ? "var(--success)" : "var(--neon)";
  setTimeout(() => {
    elements.eventBanner.classList.remove("active");
  }, 1600);
}

function logEvent(tag, message, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  const tagEl = document.createElement("span");
  tagEl.className = "tag";
  tagEl.textContent = tag;
  const msgEl = document.createElement("div");
  msgEl.className = "message";
  msgEl.textContent = message;
  entry.append(tagEl, msgEl);
  elements.outputLog.prepend(entry);
  elements.logStatus.textContent = type === "error" ? "Error detected" : "Live";
}

function setRunning(flag) {
  state.isRunning = flag;
  elements.runBtn.disabled = flag;
  elements.runBtn.textContent = flag ? "Running" : "Run";
  elements.logStatus.textContent = flag ? "Executing" : "Idle";
}

function executeCode() {
  if (state.isRunning) return;
  const code = elements.editor.value;
  const { commands, errors } = parseCode(code, state.language);
  if (errors.length) {
    errors.forEach((error) => logEvent("anomaly", error, "error"));
    showBanner("Anomaly detected: check the log.", "error");
    setRunning(false);
    return;
  }
  if (!commands.length) {
    logEvent("system", "No executable commands found.");
    showBanner("No commands detected.", "error");
    return;
  }
  unlockAchievement("first-run");
  setRunning(true);
  runCommands(commands).then(() => {
    setRunning(false);
    elements.worldStatus.textContent = "Simulation ready";
  });
}

async function runCommands(commands) {
  elements.worldStatus.textContent = "Executing code...";
  for (const command of commands) {
    if (!state.isRunning) break;
    await performCommand(command);
  }
}

function performCommand(command) {
  return new Promise((resolve) => {
    switch (command.type) {
      case "move":
        movePlayer(command.direction);
        unlockAchievement("first-move");
        setTimeout(resolve, 350);
        break;
      case "say":
        showBanner(`Agent: ${command.text}`, "success");
        logEvent("signal", `"${command.text}" transmitted`, "success");
        unlockAchievement("voice-online");
        advanceMission("voice");
        setTimeout(resolve, 800);
        break;
      case "wait":
        logEvent("system", `Waiting ${command.duration} cycle(s)...`);
        setTimeout(resolve, 240 * command.duration);
        break;
      case "interact":
        handleInteraction();
        unlockAchievement("first-interact");
        setTimeout(resolve, 500);
        break;
      case "color":
        world.player.color = command.color;
        logEvent("system", `Suit color set to ${command.color}`);
        setTimeout(resolve, 200);
        break;
      default:
        resolve();
        break;
    }
  });
}

function movePlayer(direction) {
  const next = { x: world.player.x, y: world.player.y };
  if (direction === "up") next.y -= 1;
  if (direction === "down") next.y += 1;
  if (direction === "left") next.x -= 1;
  if (direction === "right") next.x += 1;

  if (next.x < 0 || next.y < 0 || next.x >= world.size || next.y >= world.size) {
    logEvent("barrier", "The world edge shimmers. Movement blocked.", "error");
    showBanner("Barrier hit.", "error");
    return;
  }

  if (world.obstacles.some((block) => block.x === next.x && block.y === next.y)) {
    logEvent("barrier", "A neon wall blocks the path.", "error");
    showBanner("Obstacle detected.", "error");
    return;
  }

  world.player.x = next.x;
  world.player.y = next.y;
  updateHud();
  logEvent("move", `Moved ${direction}.`);
  showBanner(`Moved ${direction}.`);
}

function handleInteraction() {
  const nodeIndex = world.nodes.findIndex(
    (node) => node.x === world.player.x && node.y === world.player.y
  );
  if (nodeIndex === -1) {
    logEvent("scan", "No interactive node nearby.", "error");
    showBanner("Nothing to interact with.", "error");
    return;
  }
  world.nodes.splice(nodeIndex, 1);
  state.energy += 1;
  updateHud();
  logEvent("system", "Energy node stabilized.", "success");
  showBanner("Node stabilized.", "success");
  unlockAchievement("energy-collected");
  advanceMission("energy");
}

function parseCode(code, lang) {
  const lines = code.split(/\r?\n/);
  const root = { commands: [] };
  const stack = [root];
  const errors = [];

  function pushCommand(cmd) {
    stack[stack.length - 1].commands.push(cmd);
  }

  function closeBlock() {
    if (stack.length <= 1) return;
    const block = stack.pop();
    const parent = stack[stack.length - 1];
    if (block.type === "repeat") {
      for (let i = 0; i < block.count; i += 1) {
        parent.commands.push(...block.commands);
      }
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = stripComments(raw, lang).trim();
    if (!trimmed) continue;

    if (lang === "python") {
      const indent = raw.match(/^\s*/)[0].length;
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        closeBlock();
      }
      const repeatMatch = trimmed.match(/^repeat\s*\(\s*(\d+)\s*\)\s*:\s*$/i);
      if (repeatMatch) {
        stack.push({
          type: "repeat",
          count: Number(repeatMatch[1]),
          commands: [],
          indent,
        });
        continue;
      }
    } else {
      if (/^\}\s*;?\s*$/.test(trimmed)) {
        closeBlock();
        continue;
      }
      const repeatMatch = trimmed.match(/^repeat\s*\(\s*(\d+)\s*\)\s*\{\s*$/i);
      if (repeatMatch) {
        stack.push({
          type: "repeat",
          count: Number(repeatMatch[1]),
          commands: [],
          indent: 0,
        });
        continue;
      }
    }

    const command = parseCommand(trimmed);
    if (!command) {
      errors.push(`Unknown command on line ${i + 1}.`);
    } else {
      pushCommand(command);
    }
  }

  if (stack.length > 1) {
    errors.push("Unclosed repeat block detected.");
  }
  while (stack.length > 1) {
    closeBlock();
  }

  return { commands: root.commands, errors };
}

function stripComments(line, lang) {
  let cleaned = line;
  if (lang === "python") {
    const hashIndex = cleaned.indexOf("#");
    if (hashIndex !== -1) cleaned = cleaned.slice(0, hashIndex);
  } else {
    const slashIndex = cleaned.indexOf("//");
    if (slashIndex !== -1) cleaned = cleaned.slice(0, slashIndex);
  }
  return cleaned;
}

function parseCommand(line) {
  const normalized = line.replace(/;$/, "").trim();
  const moveMatch = normalized.match(/move\s*\(\s*(.+)\s*\)/i);
  if (moveMatch) {
    const direction = normalizeDirection(moveMatch[1]);
    if (!direction) return null;
    return { type: "move", direction };
  }
  const sayMatch = normalized.match(/say\s*\(\s*["'](.+?)["']\s*\)/i);
  if (sayMatch) {
    return { type: "say", text: sayMatch[1] };
  }
  const waitMatch = normalized.match(/wait\s*\(\s*(\d+)\s*\)/i);
  if (waitMatch) {
    return { type: "wait", duration: Number(waitMatch[1]) };
  }
  if (/interact\s*\(\s*\)/i.test(normalized)) {
    return { type: "interact" };
  }
  const colorMatch = normalized.match(/setColor\s*\(\s*["']?(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)["']?\s*\)/i);
  if (colorMatch) {
    return { type: "color", color: colorMatch[1] };
  }
  return null;
}

function normalizeDirection(raw) {
  const cleaned = raw
    .replace(/Direction(::)?/i, "")
    .replace(/\./g, "")
    .replace(/["']/g, "")
    .trim()
    .toLowerCase();
  if (["up", "down", "left", "right"].includes(cleaned)) {
    return cleaned;
  }
  return null;
}

function unlockAchievement(id) {
  if (state.achievements[id]) return;
  state.achievements[id] = true;
  updateAchievements();
  saveProgress({ silent: true });
}

function advanceMission(trigger) {
  if (trigger === "energy" && state.missionIndex === 0) {
    state.missionIndex = 1;
    elements.missionText.textContent = state.missions[state.missionIndex];
    showBanner("Mission updated.", "success");
  }
  if (trigger === "voice" && state.missionIndex === 1) {
    state.missionIndex = 2;
    elements.missionText.textContent = state.missions[state.missionIndex];
    showBanner("Sector stable. Explore freely.", "success");
  }
}

function updateAchievements() {
  elements.achievementList.innerHTML = "";
  achievementsCatalog.forEach((achievement) => {
    const li = document.createElement("li");
    const unlocked = Boolean(state.achievements[achievement.id]);
    li.textContent = unlocked ? achievement.label : `${achievement.label} (locked)`;
    if (unlocked) li.classList.add("unlocked");
    elements.achievementList.append(li);
  });
}

function saveProgress({ silent = false } = {}) {
  const payload = {
    language: state.language,
    code: elements.editor.value,
    energy: state.energy,
    missionIndex: state.missionIndex,
    achievements: state.achievements,
  };
  localStorage.setItem("neon-codeworld", JSON.stringify(payload));
  if (!silent) {
    logEvent("system", "Progress saved locally.");
  }
}

function restoreProgress() {
  const saved = localStorage.getItem("neon-codeworld");
  if (!saved) return;
  try {
    const payload = JSON.parse(saved);
    state.language = payload.language || state.language;
    state.energy = payload.energy || 0;
    state.missionIndex = payload.missionIndex || 0;
    state.achievements = payload.achievements || {};
    elements.editor.value = payload.code || languageTemplates[state.language];
    setActiveTab(state.language);
  } catch (error) {
    logEvent("system", "Saved data corrupted, starting fresh.", "error");
  }
}

function setActiveTab(lang) {
  state.language = lang;
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.lang === lang);
  });
  if (!elements.editor.value.trim()) {
    elements.editor.value = languageTemplates[lang];
  }
}

function resetWorld() {
  world.player.x = 2;
  world.player.y = 12;
  world.player.color = "#59f4ff";
  world.nodes = [
    { x: 11, y: 4, glow: 0 },
    { x: 4, y: 2, glow: 0 },
  ];
  state.energy = 0;
  state.missionIndex = 0;
  updateHud();
  elements.missionText.textContent = state.missions[state.missionIndex];
  logEvent("system", "World reset. Nodes restored.");
  showBanner("World reset.", "success");
  saveProgress({ silent: true });
}

elements.introNext.addEventListener("click", nextIntro);
elements.introSkip.addEventListener("click", () => {
  introIndex = introSlides.length - 1;
  nextIntro();
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab.dataset.lang);
    elements.editor.value = languageTemplates[tab.dataset.lang];
    saveProgress({ silent: true });
  });
});

elements.runBtn.addEventListener("click", executeCode);
elements.resetBtn.addEventListener("click", resetWorld);
elements.guideBtn.addEventListener("click", () => {
  showBanner("Tip: use repeat(3) to loop commands.", "success");
  logEvent("guide", "API reference shown at right. Start with move() and say().");
});
elements.saveBtn.addEventListener("click", () => saveProgress());

startLoading();
