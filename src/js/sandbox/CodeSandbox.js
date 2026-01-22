/**
 * CodeWorld - Code Sandbox
 * Safe execution environment for user code
 */

export class CodeSandbox {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.isRunning = false;
        this.executionTimeout = 30000; // 30 seconds max
    }

    async execute(code, language, api) {
        this.isRunning = true;
        
        try {
            // Transform code based on language
            const transformedCode = this.transformCode(code, language);
            
            // Execute with timeout protection
            await this.executeWithTimeout(transformedCode, api);
            
        } catch (error) {
            throw this.formatError(error);
        } finally {
            this.isRunning = false;
        }
    }

    transformCode(code, language) {
        switch (language) {
            case 'python':
                return this.transformPython(code);
            case 'java':
                return this.transformJava(code);
            case 'javascript':
            default:
                return this.transformJavaScript(code);
        }
    }

    transformJavaScript(code) {
        // JavaScript is executed directly (with some safety measures)
        return code;
    }

    transformPython(code) {
        // Transform Python-like syntax to JavaScript
        // This is a simplified transpiler for basic Python
        
        let jsCode = code;
        
        // Transform print() to log()
        jsCode = jsCode.replace(/print\s*\((.*?)\)/g, 'log($1)');
        
        // Transform for i in range(n): to for loop
        jsCode = jsCode.replace(
            /for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:/g,
            'for (let $1 = 0; $1 < $2; $1++) {'
        );
        
        // Transform for i in range(start, end):
        jsCode = jsCode.replace(
            /for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*:/g,
            'for (let $1 = $2; $1 < $3; $1++) {'
        );
        
        // Transform if condition:
        jsCode = jsCode.replace(
            /if\s+(.+?):\s*$/gm,
            'if ($1) {'
        );
        
        // Transform elif to else if
        jsCode = jsCode.replace(
            /elif\s+(.+?):\s*$/gm,
            '} else if ($1) {'
        );
        
        // Transform else:
        jsCode = jsCode.replace(
            /else\s*:\s*$/gm,
            '} else {'
        );
        
        // Transform while condition:
        jsCode = jsCode.replace(
            /while\s+(.+?):\s*$/gm,
            'while ($1) {'
        );
        
        // Transform def function_name(args):
        jsCode = jsCode.replace(
            /def\s+(\w+)\s*\((.*?)\)\s*:/g,
            'function $1($2) {'
        );
        
        // Transform True/False
        jsCode = jsCode.replace(/\bTrue\b/g, 'true');
        jsCode = jsCode.replace(/\bFalse\b/g, 'false');
        jsCode = jsCode.replace(/\bNone\b/g, 'null');
        
        // Transform and/or/not
        jsCode = jsCode.replace(/\band\b/g, '&&');
        jsCode = jsCode.replace(/\bor\b/g, '||');
        jsCode = jsCode.replace(/\bnot\b/g, '!');
        
        // Transform # comments to //
        jsCode = jsCode.replace(/#(.*)$/gm, '//$1');
        
        // Handle indentation-based blocks
        jsCode = this.handlePythonIndentation(jsCode);
        
        return jsCode;
    }

    handlePythonIndentation(code) {
        // Simplified indentation handling
        // Add closing braces based on indentation changes
        
        const lines = code.split('\n');
        const result = [];
        let indentStack = [0];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('//')) {
                result.push(line);
                continue;
            }
            
            // Calculate current indent
            const currentIndent = line.search(/\S/);
            if (currentIndent === -1) {
                result.push(line);
                continue;
            }
            
            // Close blocks when indent decreases
            while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
                indentStack.pop();
                const closingIndent = ' '.repeat(indentStack[indentStack.length - 1]);
                result.push(closingIndent + '}');
            }
            
            result.push(line);
            
            // Open block if line ends with {
            if (trimmed.endsWith('{')) {
                indentStack.push(currentIndent + 4);
            }
        }
        
        // Close remaining blocks
        while (indentStack.length > 1) {
            indentStack.pop();
            result.push('}');
        }
        
        return result.join('\n');
    }

    transformJava(code) {
        // Transform Java-like syntax to JavaScript
        let jsCode = code;
        
        // Remove type declarations
        jsCode = jsCode.replace(/\b(int|String|boolean|float|double|void)\s+/g, 'let ');
        jsCode = jsCode.replace(/\bpublic\s+static\s+void\s+main.*?\{/g, '');
        jsCode = jsCode.replace(/\bSystem\.out\.println\s*\((.*?)\)/g, 'log($1)');
        jsCode = jsCode.replace(/\bSystem\.out\.print\s*\((.*?)\)/g, 'log($1)');
        
        return jsCode;
    }

    async executeWithTimeout(code, api) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Execution timeout - код выполняется слишком долго'));
            }, this.executionTimeout);

            try {
                // Create sandbox function with API access
                const sandboxFunction = this.createSandboxFunction(code, api);
                
                // Execute
                const result = sandboxFunction();
                
                // Handle async execution
                if (result instanceof Promise) {
                    result
                        .then(() => {
                            clearTimeout(timeoutId);
                            resolve();
                        })
                        .catch((error) => {
                            clearTimeout(timeoutId);
                            reject(error);
                        });
                } else {
                    clearTimeout(timeoutId);
                    resolve();
                }
                
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    createSandboxFunction(code, api) {
        // Wrap code with async to support await
        const wrappedCode = `
            return (async () => {
                ${code}
            })();
        `;

        // Create function with limited scope
        const fn = new Function(
            'hero',
            'world',
            'log',
            'print',
            'repeat',
            'wait',
            'Math',
            wrappedCode
        );

        // Bind API
        return () => fn(
            api.hero,
            api.world,
            api.log,
            api.print,
            api.repeat,
            api.wait,
            api.Math
        );
    }

    formatError(error) {
        // Extract useful information from error
        const message = error.message || String(error);
        const stack = error.stack || '';
        
        // Try to extract line number from stack
        let lineNumber = null;
        const lineMatch = stack.match(/<anonymous>:(\d+):/);
        if (lineMatch) {
            // Adjust for wrapper code
            lineNumber = parseInt(lineMatch[1]) - 3;
            if (lineNumber < 1) lineNumber = 1;
        }

        const formattedError = new Error(message);
        formattedError.lineNumber = lineNumber;
        formattedError.originalStack = stack;
        
        return formattedError;
    }

    stop() {
        this.isRunning = false;
    }
}
