/**
 * CodeWorld - Console Manager
 * Handles output, errors, and hints display
 */

export class ConsoleManager {
    constructor() {
        this.outputPanel = document.getElementById('console-output');
        this.errorsPanel = document.getElementById('console-errors');
        this.hintsPanel = document.getElementById('console-hints');
        this.tabs = document.querySelectorAll('.console-tab');
        this.clearBtn = document.querySelector('.clear-console-btn');
        
        this.maxLines = 100;
        this.lineCount = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.console);
            });
        });

        // Clear button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clear();
            });
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.console === tabName);
        });

        // Update panels
        document.querySelectorAll('.console-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`console-${tabName}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    log(message, type = 'info') {
        this.lineCount++;
        
        // Create log line
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        // Add timestamp
        const timestamp = this.getTimestamp();
        
        // Format message
        let prefix = '';
        switch (type) {
            case 'system':
                prefix = '◈ ';
                break;
            case 'info':
                prefix = 'ℹ ';
                break;
            case 'success':
                prefix = '✓ ';
                break;
            case 'warning':
                prefix = '⚠ ';
                break;
            case 'error':
                prefix = '✖ ';
                break;
            case 'user':
                prefix = '› ';
                break;
            case 'game-event':
                prefix = '◆ ';
                break;
        }
        
        line.innerHTML = `<span class="timestamp">[${timestamp}]</span>${prefix}${this.escapeHtml(message)}`;
        
        // Add to output panel
        this.outputPanel.appendChild(line);
        
        // Scroll to bottom
        this.outputPanel.scrollTop = this.outputPanel.scrollHeight;
        
        // Trim old lines if necessary
        if (this.lineCount > this.maxLines) {
            this.trimOldLines();
        }
        
        // If error, also add to errors panel and highlight tab
        if (type === 'error') {
            this.addError(message);
        }
    }

    addError(message) {
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';
        errorItem.innerHTML = `
            <div class="error-title">Ошибка</div>
            <div class="error-message">${this.escapeHtml(message)}</div>
            <div class="error-time">${this.getTimestamp()}</div>
        `;
        
        this.errorsPanel.appendChild(errorItem);
        
        // Highlight errors tab
        const errorsTab = document.querySelector('.console-tab[data-console="errors"]');
        if (errorsTab) {
            errorsTab.classList.add('has-errors');
        }
    }

    addHint(hint) {
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item';
        hintItem.innerHTML = `
            <span class="hint-icon">💡</span>
            <span class="hint-text">${hint}</span>
        `;
        
        // Add to beginning of hints
        this.hintsPanel.insertBefore(hintItem, this.hintsPanel.firstChild);
    }

    clear() {
        // Clear output (keep welcome message)
        const welcomeDiv = this.outputPanel.querySelector('.console-welcome');
        this.outputPanel.innerHTML = '';
        if (welcomeDiv) {
            this.outputPanel.appendChild(welcomeDiv);
        }
        
        // Clear errors
        this.errorsPanel.innerHTML = '';
        
        // Remove error highlight from tab
        const errorsTab = document.querySelector('.console-tab[data-console="errors"]');
        if (errorsTab) {
            errorsTab.classList.remove('has-errors');
        }
        
        this.lineCount = 0;
    }

    trimOldLines() {
        const lines = this.outputPanel.querySelectorAll('.console-line');
        const toRemove = lines.length - this.maxLines;
        
        for (let i = 0; i < toRemove; i++) {
            if (lines[i]) {
                lines[i].remove();
            }
        }
    }

    getTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Shorthand methods
    info(message) {
        this.log(message, 'info');
    }

    success(message) {
        this.log(message, 'success');
    }

    warning(message) {
        this.log(message, 'warning');
    }

    error(message) {
        this.log(message, 'error');
    }

    system(message) {
        this.log(message, 'system');
    }
}
