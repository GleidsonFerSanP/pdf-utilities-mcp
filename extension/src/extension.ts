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

/**
 * Extract text content from a PDF file using pdf-parse.
 * Resolves pdf-parse from the bundled mcp-server/node_modules.
 */
async function extractPDFText(
    pdfPath: string,
    extensionPath: string
): Promise<{ text: string; numPages: number; info: Record<string, unknown> }> {
    const pdfParsePath = path.join(extensionPath, 'mcp-server', 'node_modules', 'pdf-parse');
    const pdfParse = require(pdfParsePath);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return {
        text: data.text || '',
        numPages: data.numpages || 0,
        info: data.info || {}
    };
}

/**
 * Extract text from a PDF provided as a byte buffer.
 */
async function extractPDFTextFromBuffer(
    buffer: Buffer,
    extensionPath: string
): Promise<{ text: string; numPages: number; info: Record<string, unknown> }> {
    const pdfParsePath = path.join(extensionPath, 'mcp-server', 'node_modules', 'pdf-parse');
    const pdfParse = require(pdfParsePath);
    const data = await pdfParse(buffer);
    return {
        text: data.text || '',
        numPages: data.numpages || 0,
        info: data.info || {}
    };
}

/**
 * Register the @pdf Chat Participant.
 * Allows users to attach PDF files in Copilot Chat and interact with them.
 */
function registerChatParticipant(context: vscode.ExtensionContext): boolean {
    try {
        if (typeof vscode.chat?.createChatParticipant !== 'function') {
            log('Chat Participant API not available in this VS Code version', 'warn');
            return false;
        }

        const participant = vscode.chat.createChatParticipant('pdf-utilities.pdf', async (request, chatContext, response, token) => {
            log(`@pdf request: "${request.prompt}"`);

            // Collect PDF file references from attachments
            const pdfUris: vscode.Uri[] = [];
            if (request.references && request.references.length > 0) {
                for (const ref of request.references) {
                    const value = ref.value;
                    if (value instanceof vscode.Uri) {
                        if (value.fsPath.toLowerCase().endsWith('.pdf')) {
                            pdfUris.push(value);
                        }
                    } else if (value && typeof value === 'object' && 'uri' in value) {
                        const loc = value as vscode.Location;
                        if (loc.uri.fsPath.toLowerCase().endsWith('.pdf')) {
                            pdfUris.push(loc.uri);
                        }
                    }
                }
            }

            // If no PDF was attached, guide the user
            if (pdfUris.length === 0) {
                response.markdown(
                    '📎 **No PDF file detected.** To use `@pdf`, attach a PDF file to the chat:\n\n' +
                    '1. Click the **📎 attach** button in the chat input\n' +
                    '2. Select a PDF file from your workspace or file system\n' +
                    '3. Type your question about the PDF\n\n' +
                    '*Example:* `@pdf Summarize this document`\n\n' +
                    '> You can also use the MCP tools directly: ask Copilot to `read_pdf`, `get_pdf_info`, `merge_pdfs`, etc.'
                );
                return;
            }

            // Extract text from all attached PDFs
            const pdfContents: string[] = [];
            let totalPages = 0;

            for (const uri of pdfUris) {
                const fileName = path.basename(uri.fsPath);
                try {
                    response.progress(`Reading ${fileName}...`);

                    let pdfData: { text: string; numPages: number; info: Record<string, unknown> };

                    // Try reading via workspace.fs first (works for virtual file systems too)
                    try {
                        const fileBytes = await vscode.workspace.fs.readFile(uri);
                        pdfData = await extractPDFTextFromBuffer(
                            Buffer.from(fileBytes),
                            context.extensionPath
                        );
                    } catch {
                        // Fallback to fs.readFileSync for local files
                        pdfData = await extractPDFText(uri.fsPath, context.extensionPath);
                    }

                    totalPages += pdfData.numPages;

                    const header = `📄 **${fileName}** (${pdfData.numPages} page${pdfData.numPages !== 1 ? 's' : ''})`;
                    pdfContents.push(`${header}\n\n${pdfData.text}`);

                    log(`Extracted ${pdfData.numPages} pages from ${fileName}`);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    log(`Failed to read PDF ${fileName}: ${errorMsg}`, 'error');
                    response.markdown(`⚠️ Could not read **${fileName}**: ${errorMsg}\n\n`);
                }
            }

            if (pdfContents.length === 0) {
                response.markdown('❌ Could not extract text from any of the attached PDFs.');
                return;
            }

            // Build the prompt with PDF content + user question
            const pdfContext = pdfContents.join('\n\n---\n\n');
            const userQuestion = request.prompt?.trim() || 'Analyze and summarize this PDF document.';

            const systemMessage = vscode.LanguageModelChatMessage.User(
                `You are a helpful assistant specialized in analyzing PDF documents. ` +
                `The user has attached ${pdfUris.length} PDF file(s) with a total of ${totalPages} pages. ` +
                `Below is the extracted text content from the PDF(s). ` +
                `Answer the user's question based on this content.\n\n` +
                `--- PDF CONTENT START ---\n${pdfContext}\n--- PDF CONTENT END ---\n\n` +
                `User's question: ${userQuestion}`
            );

            // Build conversation history from previous turns
            const messages: vscode.LanguageModelChatMessage[] = [];

            // Add relevant history
            for (const turn of chatContext.history) {
                if (turn instanceof vscode.ChatRequestTurn) {
                    messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
                } else if (turn instanceof vscode.ChatResponseTurn) {
                    const responseText = turn.response
                        .filter((part): part is vscode.ChatResponseMarkdownPart => part instanceof vscode.ChatResponseMarkdownPart)
                        .map(part => part.value.value)
                        .join('');
                    if (responseText) {
                        messages.push(vscode.LanguageModelChatMessage.Assistant(responseText));
                    }
                }
            }

            // Add current request with PDF content
            messages.push(systemMessage);

            // Select a language model
            try {
                const models = await vscode.lm.selectChatModels({
                    vendor: 'copilot',
                    family: 'gpt-4o'
                });

                let model = models?.[0];

                // Fallback: try any copilot model
                if (!model) {
                    const fallbackModels = await vscode.lm.selectChatModels({ vendor: 'copilot' });
                    model = fallbackModels?.[0];
                }

                if (!model) {
                    response.markdown('⚠️ No language model available. Make sure GitHub Copilot is active.');
                    return;
                }

                log(`Using model: ${model.name} (${model.family})`);

                const chatResponse = await model.sendRequest(messages, {}, token);

                for await (const fragment of chatResponse.text) {
                    response.markdown(fragment);
                }
            } catch (error) {
                if (error instanceof vscode.CancellationError) {
                    log('Request cancelled by user');
                    return;
                }
                const errorMsg = error instanceof Error ? error.message : String(error);
                log(`Language model error: ${errorMsg}`, 'error');
                response.markdown(`⚠️ Error communicating with the language model: ${errorMsg}`);
            }
        });

        // Configure participant metadata
        participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');

        context.subscriptions.push(participant);
        log('Chat Participant @pdf registered successfully');
        return true;
    } catch (error) {
        log(`Failed to register Chat Participant: ${error}`, 'warn');
        return false;
    }
}

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('PDF Utilities', { log: true });
    context.subscriptions.push(outputChannel);
    
    log('PDF Utilities extension is now active!');
    log(`Extension path: ${context.extensionPath}`);

    let mcpAvailable = false;
    let chatParticipantAvailable = false;

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

    // Register @pdf Chat Participant
    chatParticipantAvailable = registerChatParticipant(context);

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
    if (!hasShownWelcome && (mcpAvailable || chatParticipantAvailable)) {
        const features: string[] = [];
        if (mcpAvailable) { features.push('MCP tools'); }
        if (chatParticipantAvailable) { features.push('@pdf chat'); }

        vscode.window.showInformationMessage(
            `PDF Utilities is ready! Features: ${features.join(', ')}. Use @pdf in chat to analyze PDFs.`,
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
    log(`Chat Participant @pdf Available: ${chatParticipantAvailable}`);
}

export function deactivate() {
    log('PDF Utilities extension deactivated');
}
