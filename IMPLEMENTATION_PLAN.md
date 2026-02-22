# PDF Utilities MCP - Implementation Plan

## Project Overview

VS Code Extension that provides PDF manipulation tools to GitHub Copilot Chat via Model Context Protocol (MCP).

## Architecture Decision

* **Hybrid Approach**: MCP Server + VS Code Extension
* **Why**: MCP provides standardized tool interface for AI assistants, VS Code extension provides seamless integration
* **Benefits**: Best of both worlds - powerful PDF tools accessible via chat commands

## Project Structure

```
pdf-utilities-mcp/
├── src/                      # MCP Server source
│   ├── index.ts             # Main MCP server entry point
│   └── pdf-tools.ts         # PDF manipulation tools
├── extension/               # VS Code Extension
│   ├── src/
│   │   ├── extension.ts    # Extension activation & commands
│   │   └── types.ts        # TypeScript definitions
│   ├── resources/
│   │   └── instructions/
│   │       └── pdf-utilities.instructions.md  # Copilot instructions
│   ├── dist/               # Compiled extension
│   ├── mcp-server/         # Compiled MCP server (copied from ../dist)
│   ├── package.json        # Extension manifest
│   ├── tsconfig.json       # TypeScript config
│   ├── icon.png            # Extension icon (128x128)
│   ├── .env                # Publishing credentials
│   ├── .vscodeignore       # Files to exclude from VSIX
│   └── README.md           # Extension documentation
├── dist/                    # Compiled MCP server
├── package.json             # MCP server package
├── tsconfig.json            # MCP TypeScript config
├── README.md                # Project documentation
└── .gitignore              # Git ignore rules
```

## Implementation Steps

### STEP 1: Create Base Structure

**AI Agent Instructions:**
1. Create all directories listed in project structure
2. Initialize package.json files for both MCP server and extension
3. Create tsconfig.json for TypeScript compilation
4. Create .gitignore to exclude node_modules, dist, *.vsix

### STEP 2: Configure Package Manifests

**AI Agent Instructions:**

**Root package.json (MCP Server):**
* name: "pdf-utilities-mcp"
* version: "1.0.0"
* type: "module"
* main: "dist/index.js"
* bin: "./dist/index.js"
* dependencies: @modelcontextprotocol/sdk, pdf-lib, pdf-parse
* devDependencies: @types/node, typescript

**Extension package.json:**
* name: "pdf-utilities"
* displayName: "PDF Utilities for GitHub Copilot"
* publisher: "GleidsonFerSanP"
* version: "1.0.0"
* icon: "icon.png"
* engines.vscode: "^1.85.0"
* categories: ["AI", "Other"]
* activationEvents: ["onStartupFinished"]
* main: "./dist/extension.js"
* contributes:
  + mcpServerDefinitionProviders
  + chatInstructions
  + commands (configure, restart, viewDocs)
  + configuration (autoStart, logLevel)

### STEP 3: Implement MCP Server PDF Tools

**AI Agent Instructions:**

Create `src/pdf-tools.ts` with:
* PDFReader class: Extract text, metadata, page count from PDFs
* PDFWriter class: Create PDFs, add pages, add text
* PDFMerger class: Merge multiple PDFs
* PDFSplitter class: Extract pages/ranges from PDFs
* PDFMetadataEditor: Update PDF metadata
* PDFCompressor: Optimize PDF file size (if feasible)

Create `src/index.ts` with:
* MCP Server initialization using @modelcontextprotocol/sdk
* Register tools:
  + `read_pdf`: Extract text from PDF (params: filePath, pageRange?)
  + `get_pdf_info`: Get metadata (pages, size, author, etc)
  + `create_pdf`: Create new PDF from text/content
  + `merge_pdfs`: Combine multiple PDFs (params: filePaths[])
  + `split_pdf`: Extract pages (params: filePath, pageRange)
  + `extract_pages`: Export specific pages to new PDF
  + `update_pdf_metadata`: Change title, author, etc
  + `compress_pdf`: Reduce file size (if feasible)
* Error handling for all operations
* Logging for debugging

### STEP 4: Implement VS Code Extension

**AI Agent Instructions:**

Create `extension/src/extension.ts` :
* Load and register MCP server on activation
* Use vscode.lm.registerMcpServerDefinitionProvider
* Provide McpStdioServerDefinition pointing to mcp-server/index.js
* Register commands:
  + Configure MCP
  + Restart server
  + Open documentation
* Handle MCP blocked scenarios gracefully
* Create output channel for logs

Create `extension/src/types.ts` :
* TypeScript interfaces for PDF operations
* Type definitions for MCP responses

### STEP 5: Create Extension Icon

**AI Agent Instructions:**
Create `extension/icon.png` :
* Size: 128x128 pixels
* Design: PDF document icon with tools/utilities visual
* Colors: Professional palette (blues, grays)
* Style: Modern, flat design
* Format: PNG with transparency
* Note to AI: Generate SVG code that can be converted to PNG, or describe requirements for manual creation

### STEP 6: Create Documentation & Instructions

**AI Agent Instructions:**

Create `extension/resources/instructions/pdf-utilities.instructions.md` :

```markdown
# PDF Utilities - GitHub Copilot Instructions

This extension provides PDF manipulation tools via MCP. Use these tools when user asks to:
- Read/extract text from PDFs
- Get PDF information (pages, metadata)
- Create new PDFs
- Merge multiple PDFs
- Split PDFs or extract specific pages
- Update PDF metadata

## Available Tools:

1. read_pdf(filePath, pageRange?) - Extract text from PDF
2. get_pdf_info(filePath) - Get metadata and info
3. create_pdf(content, outputPath, options?) - Create new PDF
4. merge_pdfs(filePaths[], outputPath) - Combine PDFs
5. split_pdf(filePath, pageRange, outputPath) - Extract pages
6. update_pdf_metadata(filePath, metadata) - Update PDF info

## Usage Examples:

- "Read the PDF at /path/to/file.pdf"
- "Extract pages 1-5 from document.pdf"
- "Merge these three PDFs into one"
- "Create a PDF with this content"
```

Create `extension/README.md` :
* Extension overview and features
* Installation instructions
* Usage examples with screenshots/GIFs (placeholders)
* Available commands
* Configuration options
* Troubleshooting
* License information

Create root `README.md` :
* Project description
* How it works (MCP + Extension)
* Installation for developers
* Build instructions
* Publishing guide
* Contributing guidelines

### STEP 7: Configure Build & Publishing

**AI Agent Instructions:**

Create `extension/.env` :

```
VSCE_PAT=your_personal_access_token_here
```

Create `extension/.vscodeignore` :

```
.vscode/**
.vscode-test/**
src/**
.gitignore
tsconfig.json
node_modules/**
*.vsix
.env
```

Create TypeScript configs for both server and extension:
* Target: ES2022
* Module: NodeNext/CommonJS
* Strict mode enabled
* Source maps for debugging

Add build scripts to package.json:
* compile: Build TypeScript
* watch: Development mode
* package: Create VSIX
* publish: Publish to marketplace
* copy-server: Copy MCP server to extension folder

### STEP 8: Implementation Verification Checklist

**AI Agent Instructions:**
After implementation, verify:
* [ ] All files created in correct locations
* [ ] No TypeScript compilation errors
* [ ] package.json files have all required fields
* [ ] Icon file exists and is correct size
* [ ] All tools properly registered in MCP server
* [ ] Extension activates without errors
* [ ] MCP server responds to tool calls
* [ ] Documentation is complete and accurate
* [ ] .gitignore excludes build artifacts
* [ ] Publishing credentials in .env

## Dependencies Required

### MCP Server (root package.json)

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.0.0",
  "pdf-lib": "^1.17.1",
  "pdf-parse": "^1.1.1"
}
```

### Extension (extension/package.json)

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.0.0"
}
```

## Build & Test Commands

```bash
# Build MCP Server
npm install
npm run build

# Build Extension
cd extension
npm install
npm run compile

# Copy MCP server to extension
npm run copy-server

# Package extension
npm run package

# Publish extension (requires credentials)
npm run publish
```

## Validation Tests

1. Test read_pdf with sample PDF
2. Test create_pdf with text content
3. Test merge_pdfs with 2+ files
4. Test split_pdf with page range
5. Test get_pdf_info on various PDFs
6. Test error handling (invalid paths, corrupted files)

## Success Criteria

* Extension installs without errors
* MCP server registers successfully
* All 6+ PDF tools are available in Copilot Chat
* Tools handle errors gracefully
* Documentation is clear and complete
* Extension can be published to marketplace

## Notes for AI Agents

* Use absolute paths for file operations
* Validate all input paths before operations
* Provide detailed error messages
* Log all operations for debugging
* Handle large PDFs efficiently (streaming if needed)
* Support common PDF versions (1.4+)
* Ensure cross-platform compatibility (Windows, macOS, Linux)
