import type { Level } from './types'

export const LEVELS: Level[] = [
  {
    id: 'bootcamp-1',
    title: 'Пролог: Маяк',
    intro:
      'Ты загружен в симуляцию. Управление отключено. Двигайся только кодом и отправь сигнал, когда дойдёшь до маяка.',
    initialWorld: (() => {
      const w = 20
      const h = 12
      const walls = new Set<string>()

      // border-ish obstacles
      for (let x = 0; x < w; x++) {
        walls.add(`${x},0`)
        walls.add(`${x},${h - 1}`)
      }
      for (let y = 0; y < h; y++) {
        walls.add(`0,${y}`)
        walls.add(`${w - 1},${y}`)
      }

      // a simple corridor challenge
      for (let x = 4; x <= 15; x++) walls.add(`${x},4`)
      for (let x = 4; x <= 15; x++) walls.add(`${x},8`)
      walls.delete('10,4')
      walls.delete('10,8')

      return {
        w,
        h,
        walls,
        goal: { x: 16, y: 6 },
        player: { x: 2, y: 6 },
        tick: 0,
        lastSay: '',
      }
    })(),
    objectives: [
      {
        id: 'reach-goal',
        text: 'Дойти до маяка (координата 16,6)',
        isComplete: (w) => w.player.x === w.goal.x && w.player.y === w.goal.y,
      },
      {
        id: 'say',
        text: 'Отправить сигнал: say("HELLO")',
        isComplete: (w) => (w.lastSay ?? '').toUpperCase().includes('HELLO'),
      },
    ],
    starterCode: {
      python: `# Ты управляешь миром только кодом.
# Доступные команды: move(dx, dy), say("text"), wait(steps)
#
# Цель: дойти до маяка (16,6) и отправить сигнал "HELLO".

for i in range(7):
  move(1, 0)

move(1, 0)
move(1, 0)
move(1, 0)
move(1, 0)
move(1, 0)
move(1, 0)

say("HELLO")
`,
      java: `// Ты управляешь миром только кодом.
// Доступные команды: move(dx, dy); say("text"); wait(steps);
//
// Цель: дойти до маяка (16,6) и отправить сигнал "HELLO".

for (int i = 0; i < 7; i++) {
  move(1, 0);
}

move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);

say("HELLO");
`,
      cpp: `// Ты управляешь миром только кодом.
// Доступные команды: move(dx, dy); say("text"); wait(steps);
//
// Цель: дойти до маяка (16,6) и отправить сигнал "HELLO".

for (int i = 0; i < 7; i++) {
  move(1, 0);
}

move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);
move(1, 0);

say("HELLO");
`,
    },
  },
]

