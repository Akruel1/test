# Code Realms - Programmed World Prototype

This repository contains a static prototype for a game-like website where the
only way to interact with the world is through code. The interface combines a
pixel inspired world view, a built-in code console, and a signal log that
translates program output into in-world events.

## Features
- Boot sequence with animated loading screen
- Short interactive intro presentation
- World field rendered in a retro pixel style
- Integrated code editor with language switching (Python, Java, C++)
- Sandboxed command parser with game-like feedback
- Achievements and local progress storage
- Responsive layout for desktop and mobile

## Run Locally
Open `index.html` in a modern browser. No build step is required.

## Command API (Simulation)
The sandbox recognizes a small set of commands that work across languages:
- `move("right", 2)`
- `wait(1)`
- `speak("Hello, realm")`

## Project Structure
- `index.html` - layout and UI structure
- `styles.css` - neon pixel UI styling
- `app.js` - boot sequence, intro flow, command parser, world simulation

## Notes
This is a front-end prototype meant for future expansion into a full learning
platform with a secure execution backend, mission system, and persistent player
profiles.
