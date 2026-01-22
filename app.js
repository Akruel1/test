const ui = {
  bootScreen: document.getElementById("boot-screen"),
  bootBar: document.getElementById("boot-bar-fill"),
  bootStatus: document.getElementById("boot-status"),
  intro: document.getElementById("intro"),
  introTitle: document.getElementById("intro-title"),
  introBody: document.getElementById("intro-body"),
  introProgress: document.getElementById("intro-progress-bar"),
  introNext: document.getElementById("intro-next"),
  introSkip: document.getElementById("intro-skip"),
  app: document.getElementById("app"),
  languageSelect: document.getElementById("language-select"),
  codeEditor: document.getElementById("code-editor"),
  runButton: document.getElementById("run-code"),
  resetButton: document.getElementById("reset-world"),
  clearLog: document.getElementById("clear-log"),
  status: document.getElementById("world-status"),
  hudEnergy: document.getElementById("hud-energy"),
  hudSignal: document.getElementById("hud-signal"),
  mission: document.getElementById("mission-text"),
  logOutput: document.getElementById("log-output"),
  achievements: document.getElementById("achievement-list"),
  canvas: document.getElementById("world-canvas"),
};

const introSlides = [
  {
    title: "Welcome to Code Realms",
    body:
      "You are entering a world where every action is written in code. " +
      "Movement, interactions, and events respond to your programs.",
  },
  {
    title: "A programmable game world",
    body:
      "There are no movement keys or buttons. The only way to play is to " +
      "write instructions that the world understands.",
  },
  {
    title: "Experiment, learn, create",
    body:
      "Switch languages, test new ideas, and unlock missions by solving " +
      "logic challenges through programming.",
  },
];

const languageTemplates = {
  python: `# Move to the portal
move("right", 4)
move("down", 1)
speak("Portal check")`,
  java: `public class Program {
    public static void main(String[] args) {
        move("right", 4);
        move("down", 1);
        speak("Portal check");
    }
}`,
  cpp: `int main() {
    move("right", 4);
    move("down", 1);
    speak("Portal check");
    return 0;
}`,
};

const achievementData = [
  {
    id: "first-run",
    title: "Boot Sequence",
    description: "Run your first program.",
  },
  {
    id: "first-signal",
    title: "Open Channel",
    description: "Send a message with speak().",
  },
  {
    id: "shard-collector",
    title: "Shard Collector",
    description: "Collect every data shard.",
  },
  {
    id: "portal-sync",
    title: "Portal Sync",
    description: "Reach the portal after unlocking it.",
  },
];

const storageKey = "code-realms-state";
const baseCanvas = { width: 640, height: 360 };
const grid = { cols: 16, rows: 9, tile: 40 };
const maxCommands = 100;

const world = {
  player: { x: 2, y: 4 },
  portal: { x: 13, y: 4 },
  shards: [
    { x: 6, y: 2 },
    { x: 9, y: 6 },
    { x: 12, y: 2 },
  ],
  obstacles: [
    { x: 5, y: 4 },
    { x: 7, y: 4 },
    { x: 10, y: 4 },
  ],
  energy: 100,
  signal: "Stable",
  level: 1,
};

let runToken = 0;
let introIndex = 0;
let introTimer = null;

const ctx = ui.canvas.getContext("2d");
ui.canvas.width = baseCanvas.width;
ui.canvas.height = baseCanvas.height;

function init() {
  const stored = loadState();
  ui.languageSelect.value = stored.language;
  ui.codeEditor.value = stored.codeByLanguage[stored.language];
  renderAchievements(stored.achievements);
  updateHud();
  updateMission();
  drawWorld();
  logEvent("info", "World initialized. Awaiting code.");

  ui.languageSelect.addEventListener("change", handleLanguageChange);
  ui.runButton.addEventListener("click", handleRun);
  ui.resetButton.addEventListener("click", resetWorld);
  ui.clearLog.addEventListener("click", () => {
    ui.logOutput.innerHTML = "";
    logEvent("info", "Signal log cleared.");
  });
  ui.introNext.addEventListener("click", showNextIntro);
  ui.introSkip.addEventListener("click", finishIntro);

  startBootSequence();
}

function loadState() {
  const fallback = {
    language: "python",
    codeByLanguage: { ...languageTemplates },
    achievements: achievementData.reduce((acc, entry) => {
      acc[entry.id] = false;
      return acc;
    }, {}),
  };

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      codeByLanguage: {
        ...fallback.codeByLanguage,
        ...parsed.codeByLanguage,
      },
      achievements: {
        ...fallback.achievements,
        ...parsed.achievements,
      },
    };
  } catch (error) {
    return fallback;
  }
}

function saveState(partial) {
  const current = loadState();
  const next = { ...current, ...partial };
  localStorage.setItem(storageKey, JSON.stringify(next));
}

function startBootSequence() {
  let progress = 0;
  const steps = [
    "Loading core modules...",
    "Synchronizing code engine...",
    "Calibrating world grid...",
    "Mounting sandbox runtime...",
    "Finalizing interface...",
  ];
  const timer = setInterval(() => {
    progress += 12 + Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      ui.bootStatus.textContent = "Boot complete. Entering simulation.";
      setTimeout(() => {
        ui.bootScreen.classList.add("hidden");
        startIntro();
      }, 500);
      return;
    }
    ui.bootBar.style.width = `${progress}%`;
    ui.bootStatus.textContent = steps[Math.floor(progress / 25) % steps.length];
  }, 320);
}

function startIntro() {
  ui.intro.classList.remove("hidden");
  ui.app.classList.remove("hidden");
  introIndex = 0;
  showIntroSlide(introIndex);
  introTimer = setInterval(showNextIntro, 5500);
}

function showIntroSlide(index) {
  const slide = introSlides[index];
  ui.introTitle.textContent = slide.title;
  ui.introBody.textContent = slide.body;
  ui.introProgress.style.width = `${((index + 1) / introSlides.length) * 100}%`;
  ui.introNext.textContent = index === introSlides.length - 1 ? "Enter" : "Next";
}

function showNextIntro() {
  introIndex += 1;
  if (introIndex >= introSlides.length) {
    finishIntro();
    return;
  }
  showIntroSlide(introIndex);
}

function finishIntro() {
  clearInterval(introTimer);
  ui.intro.classList.add("hidden");
}

function handleLanguageChange(event) {
  const stored = loadState();
  stored.codeByLanguage[stored.language] = ui.codeEditor.value;
  const nextLanguage = event.target.value;
  ui.codeEditor.value = stored.codeByLanguage[nextLanguage];
  saveState({ language: nextLanguage, codeByLanguage: stored.codeByLanguage });
  logEvent("info", `Language switched to ${nextLanguage}.`);
}

function handleRun() {
  const language = ui.languageSelect.value;
  const code = ui.codeEditor.value;
  saveState({
    language,
    codeByLanguage: {
      ...loadState().codeByLanguage,
      [language]: code,
    },
  });

  const { commands, errors, warnings } = parseCommands(code);
  warnings.forEach((warning) => logEvent("warning", warning));
  if (errors.length) {
    setSignal("Distorted");
    errors.forEach((error) => logEvent("error", error));
    return;
  }
  if (!commands.length) {
    setSignal("Distorted");
    logEvent("error", "No actionable commands found in the program.");
    return;
  }

  awardAchievement("first-run");
  executeCommands(commands);
}

function parseCommands(code) {
  const errors = [];
  const warnings = [];
  const commands = [];
  const restrictedPattern =
    /(import\s|#include|System\.|Runtime\.|exec\s*\(|eval\s*\(|ProcessBuilder|fork\s*\()/i;

  if (restrictedPattern.test(code)) {
    errors.push("Security lock: restricted operations detected.");
    return { commands, errors, warnings };
  }

  const commandPattern = /(move|wait|speak)\s*\(([^)]*)\)/gi;
  let match = null;
  while ((match = commandPattern.exec(code)) !== null) {
    const name = match[1].toLowerCase();
    const rawArgs = match[2].trim();
    if (name === "move") {
      const parts = rawArgs.split(",").map((part) => part.trim());
      const direction = parts[0]?.replace(/["']/g, "");
      const steps = parts[1] ? Number.parseInt(parts[1], 10) : 1;
      if (!["up", "down", "left", "right"].includes(direction)) {
        errors.push(`Unknown direction for move(): ${direction || "none"}.`);
        continue;
      }
      if (Number.isNaN(steps) || steps < 1) {
        errors.push("move() requires a positive step count.");
        continue;
      }
      commands.push({ type: "move", direction, steps });
    }
    if (name === "wait") {
      const seconds = Number.parseFloat(rawArgs);
      if (Number.isNaN(seconds) || seconds < 0) {
        errors.push("wait() requires a positive number of seconds.");
        continue;
      }
      commands.push({ type: "wait", duration: seconds });
    }
    if (name === "speak") {
      const messageMatch = rawArgs.match(/["']([^"']+)["']/);
      if (!messageMatch) {
        errors.push("speak() requires a quoted message.");
        continue;
      }
      commands.push({ type: "speak", message: messageMatch[1] });
    }
  }

  if (commands.length > maxCommands) {
    warnings.push("Program truncated: too many commands in queue.");
    commands.splice(maxCommands);
  }

  return { commands, errors, warnings };
}

async function executeCommands(commands) {
  runToken += 1;
  const token = runToken;
  setStatus("Running");
  ui.runButton.disabled = true;

  for (const command of commands) {
    if (token !== runToken) {
      return;
    }
    if (command.type === "move") {
      await movePlayer(command.direction, command.steps, token);
    }
    if (command.type === "wait") {
      logEvent("info", `Waiting for ${command.duration} seconds.`);
      await sleep(command.duration * 700);
    }
    if (command.type === "speak") {
      logEvent("success", `Signal broadcast: "${command.message}"`);
      awardAchievement("first-signal");
    }
  }

  setStatus("Ready");
  ui.runButton.disabled = false;
  setSignal("Stable");
}

async function movePlayer(direction, steps, token) {
  const delta = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  for (let i = 0; i < steps; i += 1) {
    if (token !== runToken) {
      return;
    }
    if (world.energy <= 0) {
      logEvent("warning", "Energy depleted. Movement halted.");
      setSignal("Distorted");
      break;
    }
    const nextX = world.player.x + delta[direction].x;
    const nextY = world.player.y + delta[direction].y;
    if (!isInside(nextX, nextY)) {
      logEvent("warning", "World boundary reached. Movement blocked.");
      setSignal("Distorted");
      break;
    }
    if (isObstacle(nextX, nextY)) {
      logEvent("warning", "Obstruction detected. Reroute required.");
      setSignal("Distorted");
      break;
    }
    world.player.x = nextX;
    world.player.y = nextY;
    world.energy = Math.max(0, world.energy - 2);
    handleTileInteraction();
    updateHud();
    drawWorld();
    await sleep(240);
  }
}

function handleTileInteraction() {
  const shardIndex = world.shards.findIndex(
    (shard) => shard.x === world.player.x && shard.y === world.player.y
  );
  if (shardIndex !== -1) {
    world.shards.splice(shardIndex, 1);
    logEvent("success", "Data shard collected.");
    if (world.shards.length === 0) {
      awardAchievement("shard-collector");
      logEvent("info", "All shards secured. Portal unlocked.");
    }
  }

  if (world.player.x === world.portal.x && world.player.y === world.portal.y) {
    if (world.shards.length === 0) {
      logEvent("success", "Portal synchronized. Mission complete.");
      awardAchievement("portal-sync");
    } else {
      logEvent("warning", "Portal locked. Collect all shards first.");
    }
  }

  updateMission();
}

function updateMission() {
  if (world.shards.length > 0) {
    ui.mission.textContent = `Collect ${world.shards.length} data shards.`;
  } else {
    ui.mission.textContent = "Reach the neon portal.";
  }
}

function updateHud() {
  ui.hudEnergy.textContent = world.energy;
  ui.hudSignal.textContent = world.signal;
}

function setStatus(text) {
  ui.status.textContent = text;
}

function setSignal(signal) {
  world.signal = signal;
  ui.hudSignal.textContent = signal;
}

function resetWorld() {
  runToken += 1;
  world.player = { x: 2, y: 4 };
  world.energy = 100;
  world.signal = "Stable";
  world.shards = [
    { x: 6, y: 2 },
    { x: 9, y: 6 },
    { x: 12, y: 2 },
  ];
  updateMission();
  updateHud();
  drawWorld();
  setStatus("Ready");
  ui.runButton.disabled = false;
  logEvent("info", "World reset. Awaiting new commands.");
}

function drawWorld() {
  ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

  drawGrid();
  drawPortal();
  drawObstacles();
  drawShards();
  drawPlayer();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= grid.cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * grid.tile, 0);
    ctx.lineTo(x * grid.tile, baseCanvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= grid.rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * grid.tile);
    ctx.lineTo(baseCanvas.width, y * grid.tile);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPortal() {
  ctx.save();
  const x = world.portal.x * grid.tile;
  const y = world.portal.y * grid.tile;
  ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
  ctx.shadowColor = "rgba(59, 130, 246, 0.7)";
  ctx.shadowBlur = 20;
  ctx.fillRect(x + 6, y + 6, grid.tile - 12, grid.tile - 12);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
  ctx.strokeRect(x + 10, y + 10, grid.tile - 20, grid.tile - 20);
  ctx.restore();
}

function drawObstacles() {
  ctx.save();
  ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
  world.obstacles.forEach((cell) => {
    const x = cell.x * grid.tile;
    const y = cell.y * grid.tile;
    ctx.fillRect(x + 8, y + 8, grid.tile - 16, grid.tile - 16);
  });
  ctx.restore();
}

function drawShards() {
  ctx.save();
  world.shards.forEach((cell) => {
    const x = cell.x * grid.tile;
    const y = cell.y * grid.tile;
    ctx.fillStyle = "rgba(34, 211, 238, 0.8)";
    ctx.fillRect(x + 14, y + 10, grid.tile - 28, grid.tile - 20);
  });
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  const x = world.player.x * grid.tile;
  const y = world.player.y * grid.tile;
  ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
  ctx.shadowColor = "rgba(34, 197, 94, 0.7)";
  ctx.shadowBlur = 10;
  ctx.fillRect(x + 8, y + 8, grid.tile - 16, grid.tile - 16);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
  ctx.strokeRect(x + 10, y + 10, grid.tile - 20, grid.tile - 20);
  ctx.restore();
}

function isInside(x, y) {
  return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows;
}

function isObstacle(x, y) {
  return world.obstacles.some((cell) => cell.x === x && cell.y === y);
}

function logEvent(type, message) {
  const entry = document.createElement("div");
  entry.className = `log-entry log-entry--${type}`;
  const time = document.createElement("div");
  time.className = "log-time";
  time.textContent = new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
  const text = document.createElement("div");
  text.className = "log-message";
  text.textContent = message;
  entry.appendChild(time);
  entry.appendChild(text);
  ui.logOutput.appendChild(entry);
  ui.logOutput.scrollTop = ui.logOutput.scrollHeight;
}

function renderAchievements(achievements) {
  ui.achievements.innerHTML = "";
  achievementData.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "achievement-item";
    if (achievements[entry.id]) {
      item.classList.add("active");
    }
    item.textContent = `${entry.title}: ${entry.description}`;
    ui.achievements.appendChild(item);
  });
}

function awardAchievement(id) {
  const stored = loadState();
  if (stored.achievements[id]) {
    return;
  }
  stored.achievements[id] = true;
  saveState({ achievements: stored.achievements });
  renderAchievements(stored.achievements);
  logEvent("success", `Achievement unlocked: ${id}.`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", init);
