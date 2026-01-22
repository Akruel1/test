/**
 * CodeWorld - Level Data
 * All game levels with objectives, tiles, and objects
 */

export const LEVELS = {
    1: {
        id: 1,
        name: "Первые шаги",
        objective: "Помоги персонажу добраться до зелёной цели",
        hint: "Используй hero.move('right') и hero.move('down') для движения",
        width: 8,
        height: 6,
        heroStart: { x: 1, y: 1 },
        goal: { x: 6, y: 4 },
        perfectMoves: 8,
        goodMoves: 12,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 1: Первые шаги
// Двигай персонажа к зелёной цели!

// Доступные команды:
// hero.move("right") - вправо
// hero.move("down") - вниз
// hero.move("left") - влево
// hero.move("up") - вверх

hero.move("right");
hero.move("right");
// Продолжай писать код...
`,
            python: `# Уровень 1: Первые шаги
# Двигай персонажа к зелёной цели!

# Доступные команды:
# hero.move("right") - вправо
# hero.move("down") - вниз
# hero.move("left") - влево
# hero.move("up") - вверх

hero.move("right")
hero.move("right")
# Продолжай писать код...
`,
            java: `// Уровень 1: Первые шаги
// Двигай персонажа к зелёной цели!

// Доступные команды:
// hero.move("right") - вправо
// hero.move("down") - вниз

hero.move("right");
hero.move("right");
// Продолжай писать код...
`
        }
    },
    
    2: {
        id: 2,
        name: "Обход препятствия",
        objective: "Обойди стену и доберись до цели",
        hint: "Стены блокируют путь. Найди обходной маршрут!",
        width: 10,
        height: 7,
        heroStart: { x: 1, y: 3 },
        goal: { x: 8, y: 3 },
        perfectMoves: 10,
        goodMoves: 14,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 2: Обход препятствия
// В центре карты стена - найди обход!

// Подсказка: сначала двигайся вверх или вниз,
// потом обходи стену

hero.move("up");
// Продолжай...
`,
            python: `# Уровень 2: Обход препятствия
# В центре карты стена - найди обход!

# Подсказка: сначала двигайся вверх или вниз,
# потом обходи стену

hero.move("up")
# Продолжай...
`,
            java: `// Уровень 2: Обход препятствия
// В центре карты стена - найди обход!

hero.move("up");
// Продолжай...
`
        }
    },
    
    3: {
        id: 3,
        name: "Сбор звёзд",
        objective: "Собери все 3 звезды и доберись до цели",
        hint: "Используй циклы для повторяющихся действий!",
        width: 10,
        height: 7,
        heroStart: { x: 1, y: 1 },
        goal: { x: 8, y: 5 },
        perfectMoves: 15,
        goodMoves: 20,
        requiredCollectibles: 3,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [
            { x: 3, y: 1, name: "Звезда", collected: false },
            { x: 5, y: 3, name: "Звезда", collected: false },
            { x: 7, y: 5, name: "Звезда", collected: false }
        ],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 3: Сбор звёзд
// Собери все звёзды перед тем как идти к цели!

// Совет: используй repeat() для повторений
// repeat(3, () => { hero.move("right"); });

// Или цикл for:
// for (let i = 0; i < 3; i++) {
//     hero.move("right");
// }

hero.move("right");
`,
            python: `# Уровень 3: Сбор звёзд
# Собери все звёзды перед тем как идти к цели!

# Совет: используй цикл for для повторений
# for i in range(3):
#     hero.move("right")

hero.move("right")
`,
            java: `// Уровень 3: Сбор звёзд
// Собери все звёзды!

for (int i = 0; i < 3; i++) {
    hero.move("right");
}
`
        }
    },
    
    4: {
        id: 4,
        name: "Лабиринт",
        objective: "Найди выход из лабиринта",
        hint: "Планируй маршрут заранее!",
        width: 12,
        height: 9,
        heroStart: { x: 1, y: 1 },
        goal: { x: 10, y: 7 },
        perfectMoves: 20,
        goodMoves: 28,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 4: Лабиринт
// Найди путь через лабиринт!

// Можешь использовать функции для организации кода:
// function goRight(steps) {
//     for (let i = 0; i < steps; i++) {
//         hero.move("right");
//     }
// }

`,
            python: `# Уровень 4: Лабиринт
# Найди путь через лабиринт!

# Можешь использовать функции:
# def go_right(steps):
#     for i in range(steps):
#         hero.move("right")

`,
            java: `// Уровень 4: Лабиринт
// Найди путь через лабиринт!

`
        }
    },
    
    5: {
        id: 5,
        name: "Опасная зона",
        objective: "Избегай красных зон и доберись до цели",
        hint: "Красные зоны опасны! Один шаг - и придётся начать заново.",
        width: 10,
        height: 8,
        heroStart: { x: 1, y: 1 },
        goal: { x: 8, y: 6 },
        perfectMoves: 14,
        goodMoves: 18,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [],
        hazards: [
            { x: 2, y: 2, message: "Попал в ловушку!" },
            { x: 3, y: 2, message: "Попал в ловушку!" },
            { x: 4, y: 3, message: "Опасная зона!" },
            { x: 5, y: 3, message: "Опасная зона!" },
            { x: 5, y: 4, message: "Опасная зона!" },
            { x: 6, y: 5, message: "Ловушка!" },
            { x: 7, y: 5, message: "Ловушка!" }
        ],
        starterCode: {
            javascript: `// Уровень 5: Опасная зона
// Красные зоны опасны - избегай их!

// Можешь проверять путь:
// if (hero.canMove("right")) {
//     hero.move("right");
// }

`,
            python: `# Уровень 5: Опасная зона
# Красные зоны опасны - избегай их!

# Можешь проверять путь:
# if hero.canMove("right"):
#     hero.move("right")

`,
            java: `// Уровень 5: Опасная зона
// Избегай красных зон!

`
        }
    },
    
    6: {
        id: 6,
        name: "Толкай ящики",
        objective: "Столкни ящик на кнопку, чтобы открыть дверь",
        hint: "Используй hero.push('direction') чтобы толкать ящики",
        width: 10,
        height: 8,
        heroStart: { x: 1, y: 4 },
        goal: { x: 8, y: 4 },
        perfectMoves: 12,
        goodMoves: 16,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [
            { id: 'box1', type: 'box', x: 4, y: 4, pushable: true, blocking: true },
            { id: 'switch1', type: 'switch', x: 5, y: 2, active: false, links: ['door1'] },
            { id: 'door1', type: 'door', x: 6, y: 4, open: false, blocking: true }
        ],
        collectibles: [],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 6: Толкай ящики
// Толкни ящик на кнопку чтобы открыть дверь!

// hero.push("right") - толкнуть вправо
// hero.interact("switch") - нажать кнопку

`,
            python: `# Уровень 6: Толкай ящики
# Толкни ящик на кнопку чтобы открыть дверь!

# hero.push("right") - толкнуть вправо
# hero.interact("switch") - нажать кнопку

`,
            java: `// Уровень 6: Толкай ящики
// Толкни ящик на кнопку!

`
        }
    },
    
    7: {
        id: 7,
        name: "Алгоритмическое мышление",
        objective: "Напиши эффективный алгоритм для сбора всех звёзд",
        hint: "Используй циклы и условия для оптимального решения",
        width: 12,
        height: 10,
        heroStart: { x: 1, y: 1 },
        goal: { x: 10, y: 8 },
        perfectMoves: 25,
        goodMoves: 35,
        requiredCollectibles: 5,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [
            { x: 3, y: 1, name: "Звезда", collected: false },
            { x: 8, y: 1, name: "Звезда", collected: false },
            { x: 5, y: 4, name: "Звезда", collected: false },
            { x: 3, y: 8, name: "Звезда", collected: false },
            { x: 8, y: 8, name: "Звезда", collected: false }
        ],
        hazards: [],
        starterCode: {
            javascript: `// Уровень 7: Алгоритмическое мышление
// Собери все 5 звёзд и доберись до цели!

// Подсказка: world.hasCollectible(x, y) проверяет 
// есть ли звезда в позиции

// hero.getX() и hero.getY() возвращают 
// текущую позицию персонажа

`,
            python: `# Уровень 7: Алгоритмическое мышление
# Собери все 5 звёзд и доберись до цели!

# Подсказка: world.hasCollectible(x, y) проверяет 
# есть ли звезда в позиции

# hero.getX() и hero.getY() возвращают 
# текущую позицию персонажа

`,
            java: `// Уровень 7: Алгоритмическое мышление
// Собери все 5 звёзд!

`
        }
    },
    
    8: {
        id: 8,
        name: "Финальный уровень",
        objective: "Пройди все испытания и победи!",
        hint: "Используй всё что узнал!",
        width: 14,
        height: 12,
        heroStart: { x: 1, y: 1 },
        goal: { x: 12, y: 10 },
        perfectMoves: 40,
        goodMoves: 55,
        requiredCollectibles: 3,
        tiles: [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        objects: [],
        collectibles: [
            { x: 6, y: 1, name: "Звезда", collected: false },
            { x: 1, y: 7, name: "Звезда", collected: false },
            { x: 12, y: 7, name: "Звезда", collected: false }
        ],
        hazards: [
            { x: 7, y: 3, message: "Ловушка!" },
            { x: 8, y: 3, message: "Ловушка!" },
            { x: 3, y: 7, message: "Опасность!" },
            { x: 4, y: 7, message: "Опасность!" }
        ],
        starterCode: {
            javascript: `// Уровень 8: Финальный уровень
// Используй все свои навыки!

// Доступные команды:
// hero.move(direction) - движение
// hero.canMove(direction) - проверка пути
// hero.getX(), hero.getY() - позиция
// world.hasCollectible(x, y) - проверка звёзд

// Удачи!

`,
            python: `# Уровень 8: Финальный уровень
# Используй все свои навыки!

# Доступные команды:
# hero.move(direction) - движение
# hero.canMove(direction) - проверка пути
# hero.getX(), hero.getY() - позиция
# world.hasCollectible(x, y) - проверка звёзд

# Удачи!

`,
            java: `// Уровень 8: Финальный уровень
// Используй все свои навыки!

`
        }
    }
};

// Helper to get level count
export const TOTAL_LEVELS = Object.keys(LEVELS).length;

// Get next level
export function getNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    return LEVELS[nextLevel] ? nextLevel : null;
}

// Check if level exists
export function levelExists(levelNum) {
    return LEVELS.hasOwnProperty(levelNum);
}
