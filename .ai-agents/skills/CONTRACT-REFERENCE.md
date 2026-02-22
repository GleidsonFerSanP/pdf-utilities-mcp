# Contract Reference - PDF Utilities MCP

**Purpose**: Critical interfaces and schemas that must be validated before changes.

---

## 🚨 What is a Contract?

A **contract** is a critical interface or schema that:
* Other code depends on
* Breaking it causes build failures or runtime errors
* Requires coordination to change

**When to register**: New public API, MCP tool schema, extension API, critical type definition.

**When to validate**: Before making changes that might break existing code.

---

## 📋 Registered Contracts

### Contract 1: PDFTools Class Interface

**Contract ID**: `pdf-tools-class-interface`

```typescript
// Critical methods that MCP server depends on
class PDFTools {
  async readPDF(
    filePath: string, 
    pageRange?: string
  ): Promise<{ text: string; pages: number; info: any }>;

  async getPDFInfo(
    filePath: string
  ): Promise<PDFInfo>;

  async createPDF(
    content: string, 
    outputPath: string, 
    options?: CreatePDFOptions
  ): Promise<{ path: string; pages: number }>;

  async mergePDFs(
    filePaths: string[], 
    outputPath: string
  ): Promise<{ path: string; totalPages: number }>;

  async splitPDF(
    filePath: string, 
    pageRange: string, 
    outputPath: string
  ): Promise<{ path: string; pages: number }>;

  async updatePDFMetadata(
    filePath: string, 
    metadata: Partial<PDFInfo>, 
    outputPath?: string
  ): Promise<{ path: string }>;

  async extractPages(
    filePath: string, 
    pages: number[], 
    outputDir: string, 
    prefix?: string
  ): Promise<{ files: string[] }>;
}
```

**Breaking Changes**:
* Removing a method
* Changing method signature (params, return type)
* Changing return object structure
* Renaming methods

**Safe Changes**:
* Adding optional parameters
* Adding new methods
* Internal implementation changes
* Private method changes

---

### Contract 2: MCP Tool Schema

**Contract ID**: `mcp-tool-schema`

```typescript
// Tool list that MCP clients expect
const TOOLS = [
  {
    name: "read_pdf",
    description: "Read text from PDF, optionally from specific pages",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Path to PDF file" },
        pageRange: { type: "string", description: "Optional page range (e.g., '1-3', '1,3,5')" }
      },
      required: ["filePath"]
    }
  },
  {
    name: "get_pdf_info",
    description: "Get PDF metadata",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Path to PDF file" }
      },
      required: ["filePath"]
    }
  },
  {
    name: "create_pdf",
    description: "Create new PDF from text",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Text content" },
        outputPath: { type: "string", description: "Output PDF path" },
        options: {
          type: "object",
          properties: {
            fontSize: { type: "number" },
            margin: { type: "number" },
            pageSize: { type: "string" }
          }
        }
      },
      required: ["content", "outputPath"]
    }
  },
  {
    name: "merge_pdfs",
    description: "Merge multiple PDFs into one",
    inputSchema: {
      type: "object",
      properties: {
        filePaths: { type: "array", items: { type: "string" }, description: "PDF files to merge" },
        outputPath: { type: "string", description: "Output PDF path" }
      },
      required: ["filePaths", "outputPath"]
    }
  },
  {
    name: "split_pdf",
    description: "Split PDF by page range",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Input PDF path" },
        pageRange: { type: "string", description: "Pages to extract (e.g., '1-3')" },
        outputPath: { type: "string", description: "Output PDF path" }
      },
      required: ["filePath", "pageRange", "outputPath"]
    }
  },
  {
    name: "update_pdf_metadata",
    description: "Update PDF metadata",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Input PDF path" },
        metadata: { type: "object", description: "Metadata fields to update" },
        outputPath: { type: "string", description: "Optional output path" }
      },
      required: ["filePath", "metadata"]
    }
  },
  {
    name: "extract_pages",
    description: "Extract pages to separate PDF files",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Input PDF path" },
        pages: { type: "array", items: { type: "number" }, description: "Page numbers" },
        outputDir: { type: "string", description: "Output directory" },
        prefix: { type: "string", description: "Optional filename prefix" }
      },
      required: ["filePath", "pages", "outputDir"]
    }
  }
];
```

**Breaking Changes**:
* Removing a tool
* Renaming a tool
* Changing required parameters
* Changing parameter types
* Removing properties from inputSchema

**Safe Changes**:
* Adding new tools
* Adding optional parameters
* Improving descriptions
* Adding examples

---

### Contract 3: VS Code Extension API

**Contract ID**: `vscode-extension-mcp-registration`

```typescript
// Extension exports for VS Code
export function activate(context: vscode.ExtensionContext) {
  // MCP server registration
  const registration = vscode.lm.registerMcpServerDefinitionProvider(
    'pdf-utilities',
    {
      provideMcpServerDefinition: async () => ({
        command: 'node',
        args: [serverPath], // Path to compiled MCP server
        transport: { type: 'stdio' }
      })
    }
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('pdf-utilities.configure', /* ... */),
    vscode.commands.registerCommand('pdf-utilities.restart', /* ... */),
    vscode.commands.registerCommand('pdf-utilities.viewDocs', /* ... */),
    registration
  );
}

export function deactivate() {}
```

**Breaking Changes**:
* Changing server ID (`'pdf-utilities'`)
* Changing command names
* Removing commands
* Changing server path resolution
* Changing transport type

**Safe Changes**:
* Adding new commands
* Improving error messages
* Adding logging
* Changing internal implementation

---

### Contract 4: TypeScript Interfaces

**Contract ID**: `typescript-interfaces`

```typescript
// Public interfaces used by MCP server and extension
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

export interface CreatePDFOptions {
  fontSize?: number;
  margin?: number;
  pageSize?: 'letter' | 'a4';
}

export interface ReadPDFResult {
  text: string;
  pages: number;
  info: Partial<PDFInfo>;
}

export interface MergePDFResult {
  path: string;
  totalPages: number;
}

export interface SplitPDFResult {
  path: string;
  pages: number;
}

export interface ExtractPagesResult {
  files: string[];
}
```

**Breaking Changes**:
* Removing interface
* Removing required property
* Changing property type
* Renaming interface or property

**Safe Changes**:
* Adding optional properties
* Adding new interfaces
* Making required property optional
* Adding union types

---

## 🛠️ How to Use Contract Validation

### Before Making Changes

```typescript
// Step 1: Identify the contract
const contracts = await get_contracts({ context: "mcp-server" });
// Review all contracts for the context

// Step 2: Plan your change
// Example: Want to add optional 'password' param to read_pdf

// Step 3: Validate the change won't break the contract
await validate_contract({
  contract_id: "mcp-tool-schema",
  implementation: `
    {
      name: "read_pdf",
      description: "Read text from PDF, optionally from specific pages",
      inputSchema: {
        type: "object",
        properties: {
          filePath: { type: "string", description: "Path to PDF file" },
          pageRange: { type: "string", description: "Optional page range" },
          password: { type: "string", description: "Optional password for encrypted PDFs" }
        },
        required: ["filePath"]  // Still only filePath is required
      }
    }
  `
});
// ✅ Safe - added optional parameter
```

### Registering New Contracts

```typescript
// When you add a new public API or critical interface
await register_contract({
  name: "PDF Encryption API",
  contract_id: "pdf-encryption-interface",
  description: "Interface for PDF encryption functionality",
  code: `
    interface EncryptPDFOptions {
      userPassword: string;
      ownerPassword?: string;
      permissions?: {
        printing?: boolean;
        modifying?: boolean;
        copying?: boolean;
      };
    }
    
    async encryptPDF(
      filePath: string,
      outputPath: string,
      options: EncryptPDFOptions
    ): Promise<{ path: string }>;
  `
});
```

---

## ⚠️ Detecting Breaking Changes

### Example 1: Breaking Change

```typescript
// ❌ BREAKING - Changing return type
// OLD:
async readPDF(filePath: string): Promise<{ text: string; pages: number; info: any }>;

// NEW:
async readPDF(filePath: string): Promise<string>;
// Breaks contract - return type changed

// Validation:
await validate_contract({
  contract_id: "pdf-tools-class-interface",
  implementation: "async readPDF(filePath: string): Promise<string>;"
});
// ❌ Validation fails - contract violation detected
```

### Example 2: Safe Change

```typescript
// ✅ SAFE - Adding optional parameter
// OLD:
async readPDF(filePath: string, pageRange?: string): Promise<...>;

// NEW:
async readPDF(filePath: string, pageRange?: string, password?: string): Promise<...>;
// Safe - existing calls still work

// Validation:
await validate_contract({
  contract_id: "pdf-tools-class-interface",
  implementation: "async readPDF(filePath: string, pageRange?: string, password?: string): Promise<...>;"
});
// ✅ Validation passes - backward compatible
```

---

## 🎯 Contract Validation Workflow

```typescript
// Complete workflow for making changes to critical interfaces

// 1. Identify context and load contracts
const context = await identify_context({ file_path: "./src/pdf-tools.ts" });
const contracts = await get_contracts({ context: "mcp-server" });

// 2. Review contracts
// Determine which contracts your change might affect

// 3. Validate proposed change
await validate_contract({
  contract_id: "pdf-tools-class-interface",
  implementation: "// your new code"
});

// 4. If validation fails:
// - Redesign to be backward compatible, OR
// - Plan migration strategy, OR
// - Update all dependents, OR
// - Version bump (breaking change)

// 5. If validation passes:
// - Make the change
// - Update tests
// - Document in CHANGELOG.md

// 6. Optional: Register new contract if adding new API
await register_contract({
  name: "New Feature API",
  contract_id: "new-feature-interface",
  description: "...",
  code: "..."
});
```

---

## 🔗 Related Files

* **Quick Reference**: `../QUICK-REFERENCE.md`
* **Main Skills**: `./SKILL.md`
* **Session Management**: `./SESSION-WORKFLOW.md`
* **Code Patterns**: `./PATTERNS-REFERENCE.md`
* **Documentation**: `./DOCUMENTATION-WORKFLOW.md`

---

**Remember**: Contracts protect users from breaking changes. Always validate before modifying public APIs.
