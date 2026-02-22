#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { PDFTools } from './pdf-tools.js';
class PDFUtilitiesServer {
    server;
    pdfTools;
    constructor() {
        this.pdfTools = new PDFTools();
        this.server = new Server({
            name: 'pdf-utilities-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'read_pdf',
                        description: 'Extract text content from a PDF file. Optionally specify page range (e.g., "1-5" or "1,3,5").',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Absolute path to the PDF file',
                                },
                                pageRange: {
                                    type: 'string',
                                    description: 'Optional page range (e.g., "1-5", "1,3,5-10")',
                                },
                            },
                            required: ['filePath'],
                        },
                    },
                    {
                        name: 'get_pdf_info',
                        description: 'Get metadata and information about a PDF file (pages, title, author, size, etc.).',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Absolute path to the PDF file',
                                },
                            },
                            required: ['filePath'],
                        },
                    },
                    {
                        name: 'create_pdf',
                        description: 'Create a new PDF from text content with optional formatting and metadata.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                content: {
                                    type: 'string',
                                    description: 'Text content to include in the PDF',
                                },
                                outputPath: {
                                    type: 'string',
                                    description: 'Absolute path where the PDF will be saved',
                                },
                                options: {
                                    type: 'object',
                                    description: 'Optional formatting and metadata options',
                                    properties: {
                                        title: { type: 'string' },
                                        author: { type: 'string' },
                                        subject: { type: 'string' },
                                        fontSize: { type: 'number' },
                                        pageSize: {
                                            type: 'string',
                                            enum: ['A4', 'Letter', 'Legal', 'A3', 'A5']
                                        },
                                    },
                                },
                            },
                            required: ['content', 'outputPath'],
                        },
                    },
                    {
                        name: 'merge_pdfs',
                        description: 'Merge multiple PDF files into a single PDF.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePaths: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Array of absolute paths to PDF files to merge',
                                },
                                outputPath: {
                                    type: 'string',
                                    description: 'Absolute path where the merged PDF will be saved',
                                },
                            },
                            required: ['filePaths', 'outputPath'],
                        },
                    },
                    {
                        name: 'split_pdf',
                        description: 'Extract specific pages from a PDF into a new file.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Absolute path to the source PDF file',
                                },
                                pageRange: {
                                    type: 'string',
                                    description: 'Page range to extract (e.g., "1-5", "2,4,6-10")',
                                },
                                outputPath: {
                                    type: 'string',
                                    description: 'Absolute path where the extracted PDF will be saved',
                                },
                            },
                            required: ['filePath', 'pageRange', 'outputPath'],
                        },
                    },
                    {
                        name: 'update_pdf_metadata',
                        description: 'Update metadata (title, author, subject, keywords) of a PDF file.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Absolute path to the PDF file',
                                },
                                metadata: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        author: { type: 'string' },
                                        subject: { type: 'string' },
                                        keywords: { type: 'string' },
                                    },
                                    description: 'Metadata fields to update',
                                },
                                outputPath: {
                                    type: 'string',
                                    description: 'Optional output path (defaults to overwriting original)',
                                },
                            },
                            required: ['filePath', 'metadata'],
                        },
                    },
                    {
                        name: 'extract_pages',
                        description: 'Extract specific pages from a PDF into separate PDF files.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                filePath: {
                                    type: 'string',
                                    description: 'Absolute path to the source PDF file',
                                },
                                pages: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    description: 'Array of page numbers to extract (1-based)',
                                },
                                outputDir: {
                                    type: 'string',
                                    description: 'Directory where extracted pages will be saved',
                                },
                                prefix: {
                                    type: 'string',
                                    description: 'Optional filename prefix for extracted pages (default: "page")',
                                },
                            },
                            required: ['filePath', 'pages', 'outputDir'],
                        },
                    },
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                if (!args) {
                    throw new Error('Missing arguments for tool call');
                }
                switch (name) {
                    case 'read_pdf': {
                        const result = await this.pdfTools.readPDF(args.filePath, args.pageRange);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_pdf_info': {
                        const result = await this.pdfTools.getPDFInfo(args.filePath);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'create_pdf': {
                        const result = await this.pdfTools.createPDF(args.content, args.outputPath, args.options);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'merge_pdfs': {
                        const result = await this.pdfTools.mergePDFs(args.filePaths, args.outputPath);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'split_pdf': {
                        const result = await this.pdfTools.splitPDF(args.filePath, args.pageRange, args.outputPath);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'update_pdf_metadata': {
                        const result = await this.pdfTools.updatePDFMetadata(args.filePath, args.metadata, args.outputPath);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'extract_pages': {
                        const result = await this.pdfTools.extractPages(args.filePath, args.pages, args.outputDir, args.prefix);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: errorMessage,
                                success: false,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('PDF Utilities MCP Server running on stdio');
    }
}
const server = new PDFUtilitiesServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map