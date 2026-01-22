/**
 * CodeWorld - Level System
 * Level definitions and management
 */

const Levels = {
    // All levels data
    data: [
        // Level 1: Tutorial - Basic Movement
        {
            id: 1,
            name: 'Первые шаги',
            description: 'Научись управлять персонажем с помощью кода. Двигайся к цели!',
            difficulty: 'easy',
            width: 10,
            height: 8,
            playerStart: { x: 1, y: 3 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 8, y: 3, type: 'gem' }
            ],
            npcs: [],
            objectives: [
                { type: 'collect', target: 'gem', count: 1, description: 'Собери кристалл' }
            ],
            hints: [
                'Используй await moveRight() чтобы двигаться вправо',
                'Используй await collect() чтобы собрать предмет'
            ],
            starterCode: {
                javascript: `// Двигайся вправо к кристаллу и собери его!
// Подсказка: до кристалла 7 клеток

for (let i = 0; i < 7; i++) {
    await moveRight();
}
await collect();
`,
                python: `# Двигайся вправо к кристаллу и собери его!
# Подсказка: до кристалла 7 клеток

for i in range(7):
    await moveRight()
await collect()
`
            }
        },
        
        // Level 2: Multiple Items
        {
            id: 2,
            name: 'Собиратель',
            description: 'Собери все монеты на уровне!',
            difficulty: 'easy',
            width: 10,
            height: 8,
            playerStart: { x: 1, y: 1 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 3, y: 1, type: 'coin' },
                { x: 5, y: 1, type: 'coin' },
                { x: 7, y: 1, type: 'coin' }
            ],
            npcs: [],
            objectives: [
                { type: 'collectAll', target: 'coin', description: 'Собери все монеты (3 шт)' }
            ],
            hints: [
                'Используй цикл для повторяющихся действий',
                'После каждого перемещения не забудь собрать монету'
            ],
            starterCode: {
                javascript: `// Собери 3 монеты в ряд
// Между монетами - 2 клетки

// Твой код здесь:
`,
                python: `# Собери 3 монеты в ряд
# Между монетами - 2 клетки

# Твой код здесь:
`
            }
        },
        
        // Level 3: Navigation
        {
            id: 3,
            name: 'Лабиринт',
            description: 'Найди путь через препятствия к выходу!',
            difficulty: 'medium',
            width: 12,
            height: 10,
            playerStart: { x: 1, y: 1 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,2,1,1,1,1,1,1,2],
                [2,1,2,1,2,1,2,2,2,2,1,2],
                [2,1,2,1,1,1,1,1,1,2,1,2],
                [2,1,2,2,2,2,2,2,1,2,1,2],
                [2,1,1,1,1,1,1,2,1,1,1,2],
                [2,2,2,2,2,2,1,2,2,2,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 10, y: 8, type: 'flag' }
            ],
            npcs: [],
            objectives: [
                { type: 'reach', x: 10, y: 8, description: 'Доберись до флага' }
            ],
            hints: [
                'Используй canMove(direction) чтобы проверить путь',
                'Планируй маршрут заранее'
            ],
            starterCode: {
                javascript: `// Найди путь к флагу!
// Используй moveRight(), moveDown(), moveLeft(), moveUp()

// Можешь проверять путь: if (canMove('right')) { ... }

// Твой код здесь:
`,
                python: `# Найди путь к флагу!
# Используй moveRight(), moveDown(), moveLeft(), moveUp()

# Можешь проверять путь: if canMove('right'): ...

# Твой код здесь:
`
            }
        },
        
        // Level 4: Loops
        {
            id: 4,
            name: 'Сила циклов',
            description: 'Используй циклы для эффективного сбора кристаллов!',
            difficulty: 'medium',
            width: 12,
            height: 10,
            playerStart: { x: 1, y: 5 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 2, y: 5, type: 'gem' },
                { x: 4, y: 5, type: 'gem' },
                { x: 6, y: 5, type: 'gem' },
                { x: 8, y: 5, type: 'gem' },
                { x: 10, y: 5, type: 'gem' }
            ],
            npcs: [],
            objectives: [
                { type: 'collectAll', target: 'gem', description: 'Собери все 5 кристаллов' }
            ],
            hints: [
                'Кристаллы расположены через одну клетку',
                'Используй цикл с действиями: moveRight + collect'
            ],
            starterCode: {
                javascript: `// Собери 5 кристаллов эффективно!
// Кристаллы расположены через клетку

// Подсказка: move + collect в цикле

for (let i = 0; i < 5; i++) {
    await moveRight();
    await collect();
    // Нужен ещё один moveRight между кристаллами (кроме последнего)
}
`,
                python: `# Собери 5 кристаллов эффективно!
# Кристаллы расположены через клетку

# Подсказка: move + collect в цикле

for i in range(5):
    await moveRight()
    await collect()
    # Нужен ещё один moveRight между кристаллами (кроме последнего)
`
            }
        },
        
        // Level 5: Conditions
        {
            id: 5,
            name: 'Умный сборщик',
            description: 'Используй условия, чтобы собрать только монеты!',
            difficulty: 'medium',
            width: 10,
            height: 8,
            playerStart: { x: 1, y: 4 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 2, y: 4, type: 'coin' },
                { x: 3, y: 4, type: 'gem' },
                { x: 4, y: 4, type: 'coin' },
                { x: 5, y: 4, type: 'coin' },
                { x: 6, y: 4, type: 'gem' },
                { x: 7, y: 4, type: 'coin' }
            ],
            npcs: [],
            objectives: [
                { type: 'collect', target: 'coin', count: 4, description: 'Собери 4 монеты' }
            ],
            hints: [
                'Используй look() чтобы узнать что под тобой',
                'Собирай только если там монета'
            ],
            starterCode: {
                javascript: `// Собери только монеты, пропусти кристаллы!
// Используй look().here.object чтобы узнать что под тобой

for (let i = 0; i < 6; i++) {
    await moveRight();
    
    const info = look();
    if (info.here.object === 'coin') {
        await collect();
    }
}
`,
                python: `# Собери только монеты, пропусти кристаллы!
# Используй look().here.object чтобы узнать что под тобой

for i in range(6):
    await moveRight()
    
    info = look()
    if info.here.object == 'coin':
        await collect()
`
            }
        },
        
        // Level 6: Complex Maze
        {
            id: 6,
            name: 'Сложный лабиринт',
            description: 'Собери все кристаллы в сложном лабиринте!',
            difficulty: 'hard',
            width: 14,
            height: 12,
            playerStart: { x: 1, y: 1 },
            tiles: [
                [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
                [2,1,1,1,1,2,1,1,1,1,1,1,1,2],
                [2,2,2,2,1,2,1,2,2,2,2,2,1,2],
                [2,1,1,1,1,2,1,1,1,1,1,2,1,2],
                [2,1,2,2,2,2,2,2,2,2,1,2,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2,1,2],
                [2,2,2,2,2,2,2,2,2,2,1,2,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,2,1,2],
                [2,1,2,2,2,2,2,2,2,2,2,2,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
                [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
                [2,2,2,2,2,2,2,2,2,2,2,2,2,2]
            ],
            objects: [
                { x: 4, y: 1, type: 'gem' },
                { x: 12, y: 1, type: 'gem' },
                { x: 1, y: 5, type: 'gem' },
                { x: 10, y: 7, type: 'gem' },
                { x: 1, y: 9, type: 'gem' }
            ],
            npcs: [],
            objectives: [
                { type: 'collectAll', target: 'gem', description: 'Собери все 5 кристаллов' }
            ],
            hints: [
                'Планируй маршрут заранее',
                'Можешь использовать функции для повторяющихся паттернов'
            ],
            starterCode: {
                javascript: `// Пройди лабиринт и собери все кристаллы!
// Это сложный уровень - планируй маршрут!

// Подсказка: создай вспомогательные функции

async function collectAndMove(direction, steps) {
    for (let i = 0; i < steps; i++) {
        await move(direction, 1);
    }
    await collect();
}

// Твой маршрут здесь:
`,
                python: `# Пройди лабиринт и собери все кристаллы!
# Это сложный уровень - планируй маршрут!

# Подсказка: создай вспомогательные функции

async def collectAndMove(direction, steps):
    for i in range(steps):
        await move(direction, 1)
    await collect()

# Твой маршрут здесь:
`
            }
        }
    ],

    /**
     * Get level by ID
     */
    getLevel(id) {
        return this.data.find(level => level.id === id);
    },

    /**
     * Get all levels
     */
    getAllLevels() {
        return this.data;
    },

    /**
     * Get unlocked levels
     */
    getUnlockedLevels() {
        const progress = Storage.getProgress();
        return this.data.filter(level => level.id <= progress.currentLevel);
    },

    /**
     * Get next level
     */
    getNextLevel(currentId) {
        const currentIndex = this.data.findIndex(l => l.id === currentId);
        return this.data[currentIndex + 1] || null;
    },

    /**
     * Get level count
     */
    getLevelCount() {
        return this.data.length;
    },

    /**
     * Check if level is unlocked
     */
    isUnlocked(levelId) {
        const progress = Storage.getProgress();
        return levelId <= progress.currentLevel;
    },

    /**
     * Get starter code for level
     */
    getStarterCode(levelId, language = 'javascript') {
        const level = this.getLevel(levelId);
        if (level && level.starterCode) {
            return level.starterCode[language] || level.starterCode.javascript;
        }
        return '';
    }
};

// Make it globally available
window.Levels = Levels;
