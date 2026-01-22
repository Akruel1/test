import { GameEngine } from './GameEngine';

export class CodeExecutor {
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  public async run(code: string) {
    try {
      // Create a secure-ish context
      const context = {
        moveRight: () => this.queueAction('right'),
        moveLeft: () => this.queueAction('left'),
        moveUp: () => this.queueAction('up'),
        moveDown: () => this.queueAction('down'),
        wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
        console: {
          log: (msg: string) => console.log(`[USER]: ${msg}`)
        }
      };

      // Wrap code in async IIFE
      // We are creating the function with the keys of our context as arguments
      const argNames = Object.keys(context);
      const args = Object.values(context);

      const wrappedCode = `
        return (async () => {
          "use strict";
          try {
            ${code}
          } catch (err) {
            throw err;
          }
        })();
      `;

      const fn = new Function(...argNames, wrappedCode);
      
      // Execute
      await fn(...args);
      
    } catch (error: any) {
      console.error("Execution Error:", error);
      this.engine.triggerGlitch();
      // Display error in game log
    }
  }

  private async queueAction(direction: 'up' | 'down' | 'left' | 'right') {
    // Add a small delay for visualization
    await new Promise(resolve => setTimeout(resolve, 300));
    this.engine.movePlayer(direction);
  }
}
