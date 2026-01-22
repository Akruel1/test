const bootScreen = document.getElementById("boot-screen");
const bootBar = document.getElementById("boot-bar");
const introScreen = document.getElementById("intro-screen");
const introTitle = document.getElementById("intro-title");
const introText = document.getElementById("intro-text");
const introNext = document.getElementById("intro-next");
const introPrev = document.getElementById("intro-prev");
const introSkip = document.getElementById("intro-skip");
const app = document.getElementById("app");
const languageSelect = document.getElementById("language");
const codeEditor = document.getElementById("code-editor");
const runButtons = [
  document.getElementById("run-code"),
  document.getElementById("run-code-secondary"),
];
const resetButton = document.getElementById("reset-world");
const insertTemplateButton = document.getElementById("insert-template");
const worldStatus = document.getElementById("world-status");
const objectiveText = document.getElementById("objective-text");
const taskList = document.getElementById("task-list");
const logOutput = document.getElementById("log-output");
const toast = document.getElementById("toast");
const achievementCount = document.getElementById("achievement-count");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const STORAGE_KEY = "codeforge_world_v1";
const MAX_COMMANDS = 80;
const MAX_STEP = 8;

const introSlides = [
  {
    title: "Добро пожаловать в CodeForge World",
    text: "Здесь мир подчиняется коду. Ты не игрок, ты архитектор виртуальной реальности.",
  },
  {
    title: "Единственный способ управления",
    text: "Персонажи, объекты и события реагируют только на написанные тобой программы.",
  },
  {
    title: "Несколько языков",
    text: "Выбирай Python, Java или C++ и переключайся между стилями управления.",
  },
  {
    title: "Учись через игру",
    text: "Ошибки превращаются в глитчи мира, а успех открывает новые возможности.",
  },
];

const templates = {
  python: `# Управляй миром только через код
move_right(3)
move_up(2)
scan()
say("Маяк в поле зрения")
signal("Запускаю контакт")`,
  java: `// Управляй миром только через код
player.moveRight(3);
player.moveUp(2);
world.scan();
player.say("Маяк в поле зрения");
world.setSignal("Запускаю контакт");`,
  cpp: `// Управляй миром только через код
player.moveRight(3);
player.moveUp(2);
world.scan();
player.say("Маяк в поле зрения");
world.setSignal("Запускаю контакт");`,
};

const TASKS = [
  {
    id: "reach_beacon",
    text: "Дойти до неонового маяка",
    objective: "Добраться до неонового маяка",
  },
  {
    id: "scan_area",
    text: "Запустить сканирование окружения",
    objective: "Запустить scan() для анализа зоны",
  },
  {
    id: "send_signal",
    text: "Передать сигнал миру",
    objective: "Использовать signal() или setSignal()",
  },
];

const ACHIEVEMENTS = {
  first_run: "Первый запуск",
  reach_beacon: "Контакт с маяком",
  scan_area: "Мир просканирован",
  send_signal: "Сигнал создателя",
};

const world = {
  width: 20,
  height: 12,
  tile: 16,
  beacon: { x: 16, y: 3 },
  obstacles: [
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 7, y: 3 },
    { x: 8, y: 3 },
    { x: 3, y: 6 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 7, y: 6 },
    { x: 8, y: 6 },
    { x: 12, y: 8 },
    { x: 13, y: 8 },
    { x: 14, y: 8 },
    { x: 10, y: 9 },
    { x: 11, y: 9 },
  ],
};

const player = {
  x: 2,
  y: 9,
};

const stars = Array.from({ length: 40 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  speed: 0.2 + Math.random() * 0.6,
  size: 1 + Math.random() * 1.5,
}));

let commandQueue = [];
let isExecuting = false;
let commandTimer = null;
let introIndex = 0;
let introTimer = null;
let toastTimer = null;
let saveTimer = null;

const state = loadState();

function startBootSequence() {
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 16, 100);
    bootBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(showIntro, 350);
    }
  }, 180);
}

function showIntro() {
  bootScreen.classList.remove("screen--active");
  introScreen.classList.add("screen--active");
  introIndex = 0;
  renderIntroSlide();
  if (introTimer) {
    clearInterval(introTimer);
  }
  introTimer = setInterval(() => {
    if (introIndex < introSlides.length - 1) {
      introIndex += 1;
      renderIntroSlide();
    }
  }, 6000);
}

function finishIntro() {
  if (introTimer) {
    clearInterval(introTimer);
  }
  introScreen.classList.remove("screen--active");
  app.classList.add("app--ready");
  addLog("Мир активирован. Введите команды для управления.", "system");
  updateObjective();
}

function renderIntroSlide() {
  const slide = introSlides[introIndex];
  introTitle.textContent = slide.title;
  introText.textContent = slide.text;
}

function setupIntroControls() {
  introNext.addEventListener("click", () => {
    if (introIndex < introSlides.length - 1) {
      introIndex += 1;
      renderIntroSlide();
    } else {
      finishIntro();
    }
  });

  introPrev.addEventListener("click", () => {
    if (introIndex > 0) {
      introIndex -= 1;
      renderIntroSlide();
    }
  });

  introSkip.addEventListener("click", finishIntro);
}

function updateObjective() {
  const nextTask = TASKS.find((task) => !state.tasks[task.id]);
  objectiveText.textContent = nextTask
    ? nextTask.objective
    : "Мир под контролем. Экспериментируй свободно.";
}

function updateTaskList() {
  taskList.innerHTML = "";
  TASKS.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    li.className = "task-item";
    if (state.tasks[task.id]) {
      li.classList.add("task-item--done");
    }
    taskList.appendChild(li);
  });
}

function updateAchievementCount() {
  const count = state.achievements.length;
  achievementCount.textContent = `${count} достижений`;
}

function showToast(message) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toast.textContent = message;
  toast.classList.add("toast--active");
  toastTimer = setTimeout(() => {
    toast.classList.remove("toast--active");
  }, 2600);
}

function addAchievement(id) {
  if (state.achievements.includes(id)) {
    return;
  }
  state.achievements.push(id);
  updateAchievementCount();
  showToast(`Достижение: ${ACHIEVEMENTS[id]}`);
  scheduleSave();
}

function completeTask(id) {
  if (state.tasks[id]) {
    return;
  }
  state.tasks[id] = true;
  updateTaskList();
  updateObjective();
  addLog(`Задание выполнено: ${TASKS.find((task) => task.id === id).text}`, "success");
  if (id in ACHIEVEMENTS) {
    addAchievement(id);
  }
  scheduleSave();
}

function addLog(message, type = "system") {
  const entry = document.createElement("div");
  entry.className = `log-entry log-entry--${type}`;
  entry.textContent = message;
  logOutput.appendChild(entry);
  const entries = logOutput.querySelectorAll(".log-entry");
  if (entries.length > 60) {
    logOutput.removeChild(entries[0]);
  }
  logOutput.scrollTop = logOutput.scrollHeight;
}

function setWorldStatus(text, isError = false) {
  worldStatus.textContent = text;
  worldStatus.style.color = isError ? "var(--danger)" : "";
}

function resetWorld() {
  stopExecution();
  player.x = 2;
  player.y = 9;
  addLog("Мир перезапущен. Координаты сброшены.", "system");
  setWorldStatus("Стабильно");
}

function handleRun() {
  const code = codeEditor.value;
  const { commands, errors, warnings } = parseCode(code, state.language);

  if (errors.length > 0) {
    setWorldStatus("Глитч", true);
    errors.forEach((error) => addLog(`Сбой реальности: ${error}`, "error"));
    return;
  }

  if (warnings.length > 0) {
    warnings.forEach((warning) => addLog(`Система предупреждает: ${warning}`, "system"));
  }

  addAchievement("first_run");
  setWorldStatus("Выполнение");
  runCommands(commands);
}

function runCommands(commands) {
  if (commands.length === 0) {
    addLog("Команды не обнаружены. Мир ждёт инструкций.", "system");
    setWorldStatus("Стабильно");
    return;
  }

  stopExecution();
  commandQueue = [...commands];
  isExecuting = true;
  executeNextCommand();
}

function executeNextCommand() {
  if (!isExecuting) {
    return;
  }
  const command = commandQueue.shift();
  if (!command) {
    isExecuting = false;
    setWorldStatus("Стабильно");
    addLog("Выполнение завершено. Мир стабилен.", "success");
    return;
  }
  handleCommand(command);
  commandTimer = setTimeout(executeNextCommand, 260);
}

function stopExecution() {
  if (commandTimer) {
    clearTimeout(commandTimer);
  }
  isExecuting = false;
}

function handleCommand(command) {
  if (command.type === "move") {
    const targetX = player.x + command.dx;
    const targetY = player.y + command.dy;
    if (!isInsideWorld(targetX, targetY)) {
      addLog("Барьер удержал координаты: за пределами сетки.", "error");
      return;
    }
    if (isBlocked(targetX, targetY)) {
      addLog("Объект блокирует путь. Попробуй другой маршрут.", "error");
      return;
    }
    player.x = targetX;
    player.y = targetY;
    addLog(`Смещение: (${player.x}, ${player.y})`, "system");
    if (player.x === world.beacon.x && player.y === world.beacon.y) {
      completeTask("reach_beacon");
      addLog("Контакт с маяком установлен.", "success");
    }
    return;
  }

  if (command.type === "scan") {
    const nearby = world.obstacles.filter(
      (obs) =>
        Math.abs(obs.x - player.x) <= 2 && Math.abs(obs.y - player.y) <= 2
    );
    addLog(
      `Сканирование: поблизости объектов ${nearby.length}, маяк на (${world.beacon.x}, ${world.beacon.y}).`,
      "system"
    );
    completeTask("scan_area");
    return;
  }

  if (command.type === "say") {
    addLog(`Сообщение оператора: ${command.text}`, "system");
    return;
  }

  if (command.type === "signal") {
    addLog(`Сигнал миру: ${command.text}`, "success");
    completeTask("send_signal");
    return;
  }

  if (command.type === "wait") {
    addLog("Пауза: стабилизация ядра мира.", "system");
  }
}

function isInsideWorld(x, y) {
  return x >= 0 && y >= 0 && x < world.width && y < world.height;
}

function isBlocked(x, y) {
  return world.obstacles.some((obs) => obs.x === x && obs.y === y);
}

function parseCode(code, language) {
  const lines = code.split("\n");
  const commands = [];
  const errors = [];
  const warnings = [];
  let commandCount = 0;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = stripComments(rawLine, language).trim();
    if (!line) {
      return;
    }
    const result = parseLine(line, language);
    if (result.error) {
      errors.push(`Линия ${lineNumber}: ${result.error}`);
      return;
    }
    if (result.warning) {
      warnings.push(`Линия ${lineNumber}: ${result.warning}`);
    }
    if (result.commands) {
      commandCount += result.commands.length;
      if (commandCount > MAX_COMMANDS) {
        errors.push("Слишком много команд за один запуск.");
        return;
      }
      commands.push(...result.commands);
    }
  });

  return { commands, errors, warnings };
}

function stripComments(line, language) {
  if (language === "python") {
    const hashIndex = line.indexOf("#");
    if (hashIndex >= 0) {
      return line.slice(0, hashIndex);
    }
    return line;
  }
  const slashIndex = line.indexOf("//");
  if (slashIndex >= 0) {
    return line.slice(0, slashIndex);
  }
  return line;
}

function parseLine(line, language) {
  const patterns = language === "python" ? PYTHON_PATTERNS : JAVA_PATTERNS;
  for (const pattern of patterns) {
    const match = line.match(pattern.regex);
    if (match) {
      return pattern.handler(match);
    }
  }
  return { error: "неизвестная команда. Проверь синтаксис." };
}

function normalizeSteps(rawValue) {
  if (!rawValue) {
    return { steps: 1 };
  }
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { error: "некорректное число шагов" };
  }
  if (parsed > MAX_STEP) {
    return {
      steps: MAX_STEP,
      warning: `шаг ограничен до ${MAX_STEP}`,
    };
  }
  return { steps: parsed };
}

function buildMoveCommands(dx, dy, steps) {
  return Array.from({ length: steps }, () => ({ type: "move", dx, dy }));
}

function buildWaitCommands(steps) {
  return Array.from({ length: steps }, () => ({ type: "wait" }));
}

const PYTHON_PATTERNS = [
  {
    regex: /^move_up\(\s*(\d+)?\s*\)$/i,
    handler: (match) => createMoveResult(match[1], 0, -1),
  },
  {
    regex: /^move_down\(\s*(\d+)?\s*\)$/i,
    handler: (match) => createMoveResult(match[1], 0, 1),
  },
  {
    regex: /^move_left\(\s*(\d+)?\s*\)$/i,
    handler: (match) => createMoveResult(match[1], -1, 0),
  },
  {
    regex: /^move_right\(\s*(\d+)?\s*\)$/i,
    handler: (match) => createMoveResult(match[1], 1, 0),
  },
  {
    regex: /^scan\(\s*\)$/i,
    handler: () => ({ commands: [{ type: "scan" }] }),
  },
  {
    regex: /^say\(\s*(['"])(.+?)\1\s*\)$/i,
    handler: (match) => ({ commands: [{ type: "say", text: match[2] }] }),
  },
  {
    regex: /^signal\(\s*(['"])(.+?)\1\s*\)$/i,
    handler: (match) => ({ commands: [{ type: "signal", text: match[2] }] }),
  },
  {
    regex: /^wait\(\s*(\d+)?\s*\)$/i,
    handler: (match) => createWaitResult(match[1]),
  },
];

const JAVA_PATTERNS = [
  {
    regex: /^player\.moveUp\(\s*(\d+)?\s*\);?$/i,
    handler: (match) => createMoveResult(match[1], 0, -1),
  },
  {
    regex: /^player\.moveDown\(\s*(\d+)?\s*\);?$/i,
    handler: (match) => createMoveResult(match[1], 0, 1),
  },
  {
    regex: /^player\.moveLeft\(\s*(\d+)?\s*\);?$/i,
    handler: (match) => createMoveResult(match[1], -1, 0),
  },
  {
    regex: /^player\.moveRight\(\s*(\d+)?\s*\);?$/i,
    handler: (match) => createMoveResult(match[1], 1, 0),
  },
  {
    regex: /^(world|player)\.scan\(\s*\);?$/i,
    handler: () => ({ commands: [{ type: "scan" }] }),
  },
  {
    regex: /^player\.say\(\s*(['"])(.+?)\1\s*\);?$/i,
    handler: (match) => ({ commands: [{ type: "say", text: match[2] }] }),
  },
  {
    regex: /^world\.setSignal\(\s*(['"])(.+?)\1\s*\);?$/i,
    handler: (match) => ({ commands: [{ type: "signal", text: match[2] }] }),
  },
  {
    regex: /^(wait|world\.wait)\(\s*(\d+)?\s*\);?$/i,
    handler: (match) => createWaitResult(match[2]),
  },
];

function createMoveResult(stepValue, dx, dy) {
  const normalized = normalizeSteps(stepValue);
  if (normalized.error) {
    return { error: normalized.error };
  }
  return {
    commands: buildMoveCommands(dx, dy, normalized.steps),
    warning: normalized.warning,
  };
}

function createWaitResult(stepValue) {
  const normalized = normalizeSteps(stepValue);
  if (normalized.error) {
    return { error: normalized.error };
  }
  return {
    commands: buildWaitCommands(normalized.steps),
    warning: normalized.warning,
  };
}

function renderWorld(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#05060b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.fillStyle = "rgba(88,255,201,0.15)";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  ctx.strokeStyle = "rgba(88, 255, 201, 0.08)";
  for (let x = 0; x <= world.width; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * world.tile, 0);
    ctx.lineTo(x * world.tile, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= world.height; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * world.tile);
    ctx.lineTo(canvas.width, y * world.tile);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(19, 41, 61, 0.8)";
  world.obstacles.forEach((obs) => {
    ctx.fillRect(obs.x * world.tile, obs.y * world.tile, world.tile, world.tile);
  });

  const pulse = 0.6 + 0.4 * Math.sin(timestamp / 240);
  ctx.fillStyle = `rgba(0, 245, 255, ${pulse})`;
  ctx.fillRect(
    world.beacon.x * world.tile,
    world.beacon.y * world.tile,
    world.tile,
    world.tile
  );

  ctx.fillStyle = "#58ffc9";
  ctx.fillRect(player.x * world.tile, player.y * world.tile, world.tile, world.tile);

  requestAnimationFrame(renderWorld);
}

function setupControls() {
  runButtons.forEach((button) => button.addEventListener("click", handleRun));
  resetButton.addEventListener("click", resetWorld);
  insertTemplateButton.addEventListener("click", () => {
    codeEditor.value = templates[state.language];
    state.codeByLang[state.language] = codeEditor.value;
    scheduleSave();
  });
  languageSelect.addEventListener("change", (event) => {
    state.language = event.target.value;
    codeEditor.value = state.codeByLang[state.language] || templates[state.language];
    scheduleSave();
  });
  codeEditor.addEventListener("input", () => {
    state.codeByLang[state.language] = codeEditor.value;
    scheduleSave();
  });
}

function scheduleSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(saveState, 400);
}

function saveState() {
  const payload = {
    language: state.language,
    codeByLang: state.codeByLang,
    tasks: state.tasks,
    achievements: state.achievements,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadState() {
  const fallback = {
    language: "python",
    codeByLang: { ...templates },
    tasks: TASKS.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {}),
    achievements: [],
  };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      language: parsed.language || fallback.language,
      codeByLang: { ...fallback.codeByLang, ...(parsed.codeByLang || {}) },
      tasks: { ...fallback.tasks, ...(parsed.tasks || {}) },
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : [],
    };
  } catch (error) {
    return fallback;
  }
}

function initialize() {
  languageSelect.value = state.language;
  codeEditor.value = state.codeByLang[state.language] || templates[state.language];
  updateTaskList();
  updateAchievementCount();
  setupControls();
  setupIntroControls();
  startBootSequence();
  requestAnimationFrame(renderWorld);
}

initialize();
