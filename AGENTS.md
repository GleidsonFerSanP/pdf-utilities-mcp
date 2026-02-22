# PDF Utilities MCP - AI Agent Guide

**Version**: 1.0.1  
**Last Updated**: 2026-02-22  
**Project Type**: Model Context Protocol Server + VS Code Extension

---

## 🎯 Project Overview

PDF Utilities MCP is a dual-component system that provides PDF manipulation capabilities to AI assistants through the Model Context Protocol (MCP). It consists of:

1. **MCP Server** (`./src/`) - Implements 7 PDF tools using pdf-lib and pdf-parse
2. **VS Code Extension** (`./extension/`) - Registers the MCP server and integrates with GitHub Copilot

### Core Capabilities

* Read & extract text from PDFs (with page range support)
* Get PDF metadata (pages, title, author, size, dates)
* Create PDFs from text with formatting options
* Merge multiple PDFs into one
* Split PDFs by page range
* Update PDF metadata
* Extract individual pages to separate files

---

## 🚀 Quick Start for AI Agents

### Critical Path Rule: Always Use Relative Paths

```typescript
// ✅ CORRECT - Use relative paths
identify_context({ file_path: "./src/index.ts" })
start_session({ context: "mcp-server", files: ["./src/pdf-tools.ts"] })

// ❌ WRONG - Never use absolute paths
identify_context({ file_path: "/Users/username/project/src/index.ts" })
```

### Essential MCP Workflow

1. **Identify Where You Are**
   

```typescript
   identify_context({ file_path: "./src/index.ts" })
   // Returns: { project: "pdf-utilities-mcp", context: "mcp-server" }
   ```

2. **Check Active Session**
   

```typescript
   get_current_focus()
   // Returns current session state or null if none active
   ```

3. **Start Focused Work** (or load guidelines if continuing)
   

```typescript
   start_session({
     context: "mcp-server",
     current_focus: "implementing new PDF tool",
     objectives: ["Add watermark tool", "Update tool registry"]
   })
   // OR if session exists:
   get_merged_guidelines({ context: "mcp-server" })
   ```

4. **Do Your Work** - Implement, debug, or refactor

5. **Save Progress**
   

```typescript
   create_checkpoint({
     summary: "Completed watermark tool implementation",
     next_focus: "Add tests for watermark feature"
   })
   ```

6. **Complete Session**
   

```typescript
   complete_session()
   ```

---

## 🏗️ Architecture

### Directory Structure

```
pdf-utilities-mcp/
├── src/                      # MCP Server source
│   ├── index.ts             # Server entry, tool registration
│   └── pdf-tools.ts         # PDF manipulation implementations
├── extension/               # VS Code Extension
│   ├── src/
│   │   ├── extension.ts    # Extension activation, MCP registration
│   │   └── types.ts        # TypeScript interfaces
│   ├── mcp-server/         # Compiled MCP server + dependencies
│   └── resources/
│       └── instructions/   # Copilot Chat instructions
├── dist/                    # Compiled MCP server output
└── .ai-agents/             # Progressive context files (this guide)
```

### Component Responsibilities

**MCP Server** ( `./src/index.ts` ):
* Initializes MCP server with stdio transport
* Registers 7 PDF tools via `ListToolsRequestSchema`
* Handles tool calls via `CallToolRequestSchema`
* Delegates to `PDFTools` class for PDF operations

**PDF Tools** ( `./src/pdf-tools.ts` ):
* Implements actual PDF manipulation logic
* Uses `pdf-lib` for creation/modification
* Uses `pdf-parse` for text extraction
* Exports TypeScript interfaces for type safety

**VS Code Extension** ( `./extension/src/extension.ts` ):
* Activates on VS Code startup
* Registers MCP server via `vscode.lm.registerMcpServerDefinitionProvider`
* Provides commands and configuration
* Handles graceful degradation if MCP unavailable

---

## 🛠️ Development Environment

### Prerequisites

```bash
# Required
node >= 20.0.0
npm >= 9.0.0
VS Code >= 1.85.0  # For extension development

# Optional but recommended
imagemagick  # For icon generation
```

### Setup

```bash
# 1. Install dependencies
npm install
cd ./extension && npm install && cd ..

# 2. Build MCP server
npm run build

# 3. Copy server to extension
npm run copy-to-extension

# 4. Build extension
cd ./extension && npm run compile
```

### Build Commands

```bash
# MCP Server
npm run build          # Compile TypeScript to ./dist/
npm run dev            # Watch mode
npm run start          # Run server directly

# Extension
cd ./extension
npm run compile        # Build extension
npm run watch          # Watch mode
npm run package        # Create VSIX
npm run publish        # Publish to marketplace
```

### Testing the MCP Server

```bash
# Test directly via stdio
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ./dist/index.js
```

---

## 📝 Code Conventions

### TypeScript Standards

* **Strict Mode**: Enabled in all `tsconfig.json` files
* **Module System**: ES2022 (MCP server), CommonJS (extension)
* **Target**: ES2022
* **Null Safety**: Always check `existsSync()` before file operations
* **Error Handling**: Try-catch with descriptive error messages

### Naming Conventions

```typescript
// Classes: PascalCase
class PDFTools {}
class PDFUtilitiesServer {}

// Interfaces: PascalCase with I prefix or descriptive name
interface PDFInfo {}
interface CreatePDFOptions {}

// Functions/Methods: camelCase
async readPDF(filePath: string): Promise<PDFTextContent>
private setupHandlers(): void

// Constants: UPPER_SNAKE_CASE
const MAX_PDF_SIZE = 50 * 1024 * 1024;

// Tool Names: snake_case (MCP convention)
'read_pdf', 'get_pdf_info', 'create_pdf'
```

### File Organization

* **One class per file** - `PDFTools` in `pdf-tools.ts`
* **Interfaces at top** - Define types before implementation
* **Private methods last** - Public API first, helpers after
* **Helper functions in same file** - Unless reused across files

### Error Patterns

```typescript
// ✅ GOOD - Descriptive errors
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

// ✅ GOOD - Try-catch in MCP handlers
try {
  const result = await this.pdfTools.readPDF(args.filePath);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
    isError: true
  };
}

// ❌ BAD - Silent failures
try { await operation(); } catch {}
```

---

## 🔧 Key Technical Patterns

### 1. MCP Tool Registration

```typescript
// Pattern: Define tool schema in ListToolsRequestSchema handler
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'tool_name',
        description: 'Clear, concise description',
        inputSchema: {
          type: 'object',
          properties: { /* ... */ },
          required: ['requiredField']
        }
      }
    ]
  };
});
```

### 2. Tool Execution

```typescript
// Pattern: Handle in CallToolRequestSchema, validate args first
this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!args) {
    throw new Error('Missing arguments for tool call');
  }
  
  switch (name) {
    case 'tool_name':
      const result = await this.pdfTools.toolMethod(args.param);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
});
```

### 3. VS Code Extension MCP Registration

```typescript
// Pattern: Use vscode.lm API with McpStdioServerDefinition
vscode.lm.registerMcpServerDefinitionProvider('extension-id', {
  provideMcpServerDefinitions() {
    return [
      new vscode.McpStdioServerDefinition(
        'server-id',
        'node',
        [serverPath]  // Path to compiled server
      )
    ];
  }
});
```

---

## 📚 Progressive Context Files

For detailed workflows and patterns, see:

* **[Quick Reference](./.ai-agents/QUICK-REFERENCE.md)** - Condensed checklist for every conversation
* **[Skills Hub](./.ai-agents/skills/SKILL.md)** - Progressive disclosure starting point
* **[Session Workflow](./.ai-agents/skills/SESSION-WORKFLOW.md)** - How to manage work sessions
* **[Contract Reference](./.ai-agents/skills/CONTRACT-REFERENCE.md)** - Critical interfaces to respect
* **[Documentation Workflow](./.ai-agents/skills/DOCUMENTATION-WORKFLOW.md)** - When and how to document
* **[Patterns Reference](./.ai-agents/skills/PATTERNS-REFERENCE.md)** - Project-specific code patterns
* **[Copilot Instructions](./.ai-agents/copilot-instructions.md)** - GitHub Copilot custom instructions

---

## 🎓 Learning Resources

### MCP Documentation

* [Model Context Protocol Spec](https://modelcontextprotocol.io/)
* [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
* [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/copilot-extensibility)

### PDF Libraries

* [pdf-lib Documentation](https://pdf-lib.js.org/)
* [pdf-parse npm package](https://www.npmjs.com/package/pdf-parse)

### Project Documentation

* [README.md](./README.md) - Full project documentation
* [BUILD_PUBLISH_GUIDE.md](./BUILD_PUBLISH_GUIDE.md) - Build and publish instructions
* [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Original implementation plan

---

## ⚠️ Critical Reminders

1. **Always use relative paths** (`./src/...` not `/absolute/path/...`)
2. **Run `identify_context()` at start** of every conversation
3. **Check `get_current_focus()`** before starting new work
4. **Validate args** in tool handlers before use
5. **Include dependencies** when copying MCP server to extension
6. **Test MCP server** with stdio before packaging extension
7. **Update CHANGELOG.md** when publishing new version
8. **Never commit `.env`** with sensitive tokens

---

## 🔗 Quick Links

* **Repository**: https://github.com/GleidsonFerSanP/pdf-utilities-mcp
* **Marketplace**: https://marketplace.visualstudio.com/items?itemName=GleidsonFerSanP.pdf-utilities
* **Issues**: https://github.com/GleidsonFerSanP/pdf-utilities-mcp/issues

---

**Remember**: Context is finite. Start with this file, then progressively load detailed workflows from `.ai-agents/` as needed. Use MCP tools to maintain focus and track progress.
