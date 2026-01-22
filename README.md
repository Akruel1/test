# Code World

A programmable game world where logic is your only controller.

## Features

- **Code-Driven Gameplay**: Control the hero using JavaScript commands.
- **Interactive Environment**: Dynamic game engine built with HTML5 Canvas.
- **Modern Aesthetic**: Neon pixel-art style interface.
- **Safe Execution**: Sandboxed code runner (Client-side).

## Getting Started

1. `npm install`
2. `npm run dev`

## How to Play

1. Wait for the system to initialize.
2. Enter the simulation.
3. Use the code editor to control the hero:
   ```javascript
   await hero.move('right');
   await hero.move('down');
   ```
4. Reach the green goal to trigger the win state.
