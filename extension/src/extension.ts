import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let outputChannel: vscode.OutputChannel;

function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    
    outputChannel.appendLine(logMessage);
    
    if (level === 'error') {
        console.error(logMessage);
    } else if (level === 'warn') {
        console.warn(logMessage);
    } else {
        console.log(logMessage);
    }
}

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('PDF Utilities', { log: true });
    context.subscriptions.push(outputChannel);
    
    log('PDF Utilities extension is now active!');
    log(`Extension path: ${context.extensionPath}`);

    let mcpAvailable = false;

    const extensionConfig = vscode.workspace.getConfiguration('pdfUtilities');
    const mcpDisabled = extensionConfig.get<boolean>('disableMCP', false);
    const mcpServerPath = path.join(context.extensionPath, 'mcp-server', 'index.js');
    
    if (mcpDisabled) {
        log('MCP is disabled via settings. Running in standalone mode.');
    } else {
        try {
            log('Attempting to register MCP Server Definition Provider...');
            log(`MCP Server path: ${mcpServerPath}`);
            
            if (!fs.existsSync(mcpServerPath)) {
                log(`MCP Server file not found at: ${mcpServerPath}`, 'warn');
                log('Please build the project: npm run build && npm run copy-to-extension', 'warn');
            } else {
                log('MCP Server file found successfully');
            }
            
            // Check if MCP API is available
            if (typeof vscode.lm?.registerMcpServerDefinitionProvider === 'function') {
                context.subscriptions.push(
                    vscode.lm.registerMcpServerDefinitionProvider('pdf-utilities', {
                        provideMcpServerDefinitions() {
                            log('Providing MCP Server definitions...');
                            return [
                                new vscode.McpStdioServerDefinition(
                                    'pdf-utilities',
                                    'node',
                                    [mcpServerPath]
                                )
                            ];
                        }
                    })
                );
                log('MCP Server Definition Provider registered successfully');
                mcpAvailable = true;
            } else {
                log('MCP API not available in this VS Code version', 'warn');
            }
        } catch (error) {
            log(`MCP registration failed: ${error}`, 'warn');
            log('Extension will continue in standalone mode');
        }
    }

    // Command: Configure MCP
    const configureCmd = vscode.commands.registerCommand('pdfUtilities.configure', () => {
        log('Command: Configure MCP');
        if (!mcpAvailable) {
            vscode.window.showWarningMessage(
                'MCP is not available in your environment.',
                'View Documentation'
            ).then(selection => {
                if (selection === 'View Documentation') {
                    vscode.commands.executeCommand('pdfUtilities.viewDocs');
                }
            });
            return;
        }
        vscode.window.showInformationMessage('PDF Utilities configured successfully! Tools are available in GitHub Copilot Chat.');
    });

    // Command: Restart MCP Server
    const restartCmd = vscode.commands.registerCommand('pdfUtilities.restart', () => {
        log('Command: Restart MCP Server');
        if (!mcpAvailable) {
            vscode.window.showWarningMessage('MCP is not available in your environment.');
            return;
        }
        vscode.window.showInformationMessage('Restarting PDF Utilities server... Please reload VS Code.');
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    });

    // Command: Open Documentation
    const viewDocsCmd = vscode.commands.registerCommand('pdfUtilities.viewDocs', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/GleidsonFerSanP/pdf-utilities-mcp#readme'));
    });

    context.subscriptions.push(configureCmd, restartCmd, viewDocsCmd);

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
    if (!hasShownWelcome && mcpAvailable) {
        vscode.window.showInformationMessage(
            'PDF Utilities is ready! Use GitHub Copilot Chat to work with PDFs.',
            'View Documentation',
            'Got it'
        ).then(selection => {
            if (selection === 'View Documentation') {
                vscode.commands.executeCommand('pdfUtilities.viewDocs');
            }
        });
        context.globalState.update('hasShownWelcome', true);
    }

    log('PDF Utilities extension activated successfully');
    log(`MCP Available: ${mcpAvailable}`);
}

export function deactivate() {
    log('PDF Utilities extension deactivated');
}
