# Code Patterns Reference - PDF Utilities MCP

**Purpose**: Common code patterns, conventions, and best practices for this project.

---

## 🎨 MCP Server Patterns

### Tool Registration Pattern

```typescript
// src/index.ts - Standard tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "tool_name",
      description: "Clear, concise description of what tool does",
      inputSchema: {
        type: "object",
        properties: {
          requiredParam: { 
            type: "string", 
            description: "What this parameter does"
          },
          optionalParam: { 
            type: "string", 
            description: "What this optional parameter does (optional)"
          }
        },
        required: ["requiredParam"]
      }
    }
  ]
}));
```

### Tool Handler Pattern

```typescript
// src/index.ts - Tool call handler with validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // ALWAYS validate args first
    if (!args) {
      throw new Error("Missing arguments");
    }

    switch (name) {
      case "read_pdf": {
        // Destructure with validation
        const { filePath, pageRange } = args;
        if (!filePath) {
          throw new Error("filePath is required");
        }

        // Call implementation
        const result = await this.pdfTools.readPDF(filePath, pageRange);

        // Return structured response
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Structured error response
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error)
          })
        }
      ],
      isError: true
    };
  }
});
```

---

## 📚 PDF Manipulation Patterns

### File Validation Pattern

```typescript
// Always check file existence before operations
import { existsSync } from 'fs';

async readPDF(filePath: string): Promise<ReadPDFResult> {
  // Check file exists
  if (!existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  // Check file extension (optional but recommended)
  if (!filePath.toLowerCase().endsWith('.pdf')) {
    throw new Error('File must be a PDF');
  }

  // Proceed with operation
  const dataBuffer = readFileSync(filePath);
  // ...
}
```

### Page Range Parsing Pattern

```typescript
// Parse page range strings like "1-3,5,7-9"
private parsePageRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = range.split(',');

  for (const part of parts.map(p => p.trim())) {
    if (part.includes('-')) {
      // Handle range like "1-3"
      const [start, end] = part.split('-').map(Number);
      
      // Validate
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range: ${part}`);
      }
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range: ${part} (total pages: ${totalPages})`);
      }

      // Add all pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    } else {
      // Handle single page like "5"
      const page = Number(part);
      if (isNaN(page) || page < 1 || page > totalPages) {
        throw new Error(`Invalid page number: ${part} (total pages: ${totalPages})`);
      }
      pages.push(page);
    }
  }

  return pages;
}
```

### Error Handling Pattern

```typescript
async mergePDFs(filePaths: string[], outputPath: string): Promise<MergePDFResult> {
  try {
    // Validate inputs
    if (!filePaths || filePaths.length === 0) {
      throw new Error('No PDF files provided');
    }

    // Check all files exist
    for (const filePath of filePaths) {
      if (!existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Perform operation
    const mergedPdf = await PDFDocument.create();
    
    for (const filePath of filePaths) {
      const pdfBytes = readFileSync(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save result
    const mergedPdfBytes = await mergedPdf.save();
    writeFileSync(outputPath, mergedPdfBytes);

    return {
      path: outputPath,
      totalPages: mergedPdf.getPageCount()
    };

  } catch (error) {
    // Re-throw with context
    throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

---

## 🎯 TypeScript Patterns

### Strict Type Definitions

```typescript
// Use explicit return types
async readPDF(
  filePath: string, 
  pageRange?: string
): Promise<ReadPDFResult> {  // ✅ Explicit return type
  // ...
}

// Define interfaces for complex objects
export interface PDFInfo {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  keywords?: string;
  pages?: number;
}

// Use type guards
function isPDFInfo(obj: any): obj is PDFInfo {
  return typeof obj === 'object' && obj !== null;
}
```

### Options Pattern

```typescript
// Use optional options object with defaults
export interface CreatePDFOptions {
  fontSize?: number;
  margin?: number;
  pageSize?: 'letter' | 'a4';
}

async createPDF(
  content: string,
  outputPath: string,
  options: CreatePDFOptions = {}  // Default to empty object
): Promise<CreatePDFResult> {
  // Destructure with defaults
  const {
    fontSize = 12,
    margin = 50,
    pageSize = 'letter'
  } = options;

  // Use values
  const page = pdfDoc.addPage(PAGE_SIZES[pageSize]);
  // ...
}
```

### Enum Pattern

```typescript
// Use const objects instead of enums for better tree-shaking
const PAGE_SIZES = {
  letter: [612, 792],
  a4: [595, 842]
} as const;

type PageSize = keyof typeof PAGE_SIZES;
```

---

## 🔧 VS Code Extension Patterns

### Graceful Degradation Pattern

```typescript
// Handle missing APIs gracefully
export function activate(context: vscode.ExtensionContext) {
  // Check if MCP API is available
  if (!vscode.lm || !vscode.lm.registerMcpServerDefinitionProvider) {
    vscode.window.showWarningMessage(
      'PDF Utilities: MCP integration requires VS Code 1.85.0 or later'
    );
    return;
  }

  // Proceed with registration
  try {
    const registration = vscode.lm.registerMcpServerDefinitionProvider(/* ... */);
    context.subscriptions.push(registration);
  } catch (error) {
    outputChannel.appendLine(`Failed to register MCP server: ${error}`);
    vscode.window.showErrorMessage('PDF Utilities: Failed to initialize');
  }
}
```

### Logging Pattern

```typescript
// Use output channel for debugging
const outputChannel = vscode.window.createOutputChannel('PDF Utilities');

outputChannel.appendLine('PDF Utilities extension activated');
outputChannel.appendLine(`MCP server path: ${serverPath}`);

// Show output channel on errors
if (error) {
  outputChannel.appendLine(`ERROR: ${error.message}`);
  outputChannel.show();  // Make visible to user
}
```

### Path Resolution Pattern

```typescript
import * as path from 'path';

// Get extension directory
const extensionPath = context.extensionPath;

// Resolve server path relative to extension
const serverPath = path.join(
  extensionPath,
  'mcp-server',
  'index.js'
);

// Always check if file exists
if (!fs.existsSync(serverPath)) {
  throw new Error(`MCP server not found at: ${serverPath}`);
}
```

---

## 📦 Build & Package Patterns

### Copy Script Pattern

```json
// package.json - Scripts for build pipeline
{
  "scripts": {
    "build": "tsc",
    "copy-to-extension": "npm run clean-extension && cp -r dist extension/mcp-server && cp package.json extension/mcp-server/ && cp -r node_modules extension/mcp-server/",
    "clean-extension": "rm -rf extension/mcp-server",
    "prepare": "npm run build",
    "watch": "tsc --watch"
  }
}
```

### .vscodeignore Pattern

```
# Exclude dev files
src/**
tsconfig.json
*.md

# Include runtime dependencies
!mcp-server/**
!mcp-server/node_modules/**

# Exclude unnecessary files
**/.DS_Store
**/node_modules/**/test/**
**/node_modules/**/*.md
```

---

## 🧪 Testing Patterns

### Manual MCP Testing

```bash
# Test tool list
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ./dist/index.js

# Test tool call
echo '{
  "jsonrpc":"2.0",
  "method":"tools/call",
  "params":{
    "name":"read_pdf",
    "arguments":{"filePath":"./test.pdf"}
  },
  "id":2
}' | node ./dist/index.js
```

### Validation Pattern

```typescript
// Validate before processing
function validateMetadata(metadata: Partial<PDFInfo>): void {
  // Type check
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('Metadata must be an object');
  }

  // Value validation
  if (metadata.title && typeof metadata.title !== 'string') {
    throw new Error('Title must be a string');
  }

  // Date validation
  if (metadata.creationDate) {
    const date = new Date(metadata.creationDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid creation date format');
    }
  }
}
```

---

## 🚨 Anti-Patterns to Avoid

### ❌ Missing Args Validation

```typescript
// ❌ BAD - No validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { filePath } = request.params.arguments;  // Might be undefined!
  return await this.pdfTools.readPDF(filePath);   // Will crash
});

// ✅ GOOD - Validate first
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments;
  if (!args || !args.filePath) {
    throw new Error('filePath is required');
  }
  return await this.pdfTools.readPDF(args.filePath);
});
```

### ❌ Silent Error Swallowing

```typescript
// ❌ BAD - Errors disappear
try {
  await operation();
} catch {
  // Silent failure - user has no idea what went wrong
}

// ✅ GOOD - Propagate or log
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

### ❌ Not Checking File Existence

```typescript
// ❌ BAD - Will throw cryptic error
const data = readFileSync(filePath);

// ✅ GOOD - Clear error message
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}
const data = readFileSync(filePath);
```

### ❌ Hardcoded Paths

```typescript
// ❌ BAD - Only works on one machine
const configPath = '/Users/username/project/config.json';

// ✅ GOOD - Relative or resolved paths
const configPath = path.join(__dirname, 'config.json');
```

### ❌ Using `any` Without Reason

```typescript
// ❌ BAD - Loses type safety
function processPDF(data: any) {
  return data.pages;  // No autocomplete, no type checking
}

// ✅ GOOD - Proper typing
function processPDF(data: PDFInfo) {
  return data.pages;  // Type-safe
}
```

---

## 📚 Common Code Snippets

### Create Directory If Not Exists

```typescript
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
```

### Wrap Text for PDF Creation

```typescript
private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Approximate character width
  const charWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
```

---

## 🔗 Related Files

* **Quick Reference**: `../QUICK-REFERENCE.md`
* **Main Skills**: `./SKILL.md`
* **Session Management**: `./SESSION-WORKFLOW.md`
* **Contracts**: `./CONTRACT-REFERENCE.md`
* **Documentation**: `./DOCUMENTATION-WORKFLOW.md`

---

**Remember**: Follow established patterns for consistency. When adding new features, look at existing implementations first.
