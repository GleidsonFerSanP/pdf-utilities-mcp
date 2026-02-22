# GitHub Copilot Instructions - PDF Utilities MCP

**Purpose**: Custom instructions for GitHub Copilot when working with this project.

---

## 🎯 Primary Reference

**ALWAYS start by reading**: [AGENTS.md](../AGENTS.md) for complete project context.

---

## 🚨 Critical Rules

### 1. Path Convention (MOST IMPORTANT!)

**ALL file paths in MCP tool calls MUST be relative to project root.**

```typescript
// ✅ CORRECT
identify_context({ file_path: "./src/index.ts" })
start_session({ files: ["./src/pdf-tools.ts", "./extension/src/extension.ts"] })

// ❌ WRONG - NEVER use absolute paths
identify_context({ file_path: "/Users/username/workspace/AI/pdf-utilities-mcp/src/index.ts" })
```

**Why?** This project is shared. Absolute paths only work on one machine. Relative paths work for everyone.

---

## 2. Session Management

**Every conversation MUST follow this pattern:**

```typescript
// 1. Identify context
const context = await identify_context({ file_path: "./src/index.ts" });

// 2. Check for active session
const focus = await get_current_focus();

// 3. Start or resume
if (!focus) {
  await start_session({
    context: context.context,
    current_focus: "Task description",
    objectives: ["Goal 1", "Goal 2"]
  });
} else {
  await get_merged_guidelines({ context: context.context });
}

// 4. Work...

// 5. Checkpoint after progress
await create_checkpoint({
  summary: "What was completed",
  next_focus: "What's next"
});

// 6. Complete when done
await complete_session();
```

---

## 3. Progressive Disclosure

**Don't load everything at once. Load context as needed:**

1. **Start**: Read AGENTS.md (main guide)
2. **Quick ref**: `.ai-agents/QUICK-REFERENCE.md`
3. **Deep dive**: Load specific workflow files only when needed
   - `.ai-agents/skills/SESSION-WORKFLOW.md` - Session management
   - `.ai-agents/skills/CONTRACT-REFERENCE.md` - Before changing interfaces
   - `.ai-agents/skills/DOCUMENTATION-WORKFLOW.md` - When documenting
   - `.ai-agents/skills/PATTERNS-REFERENCE.md` - When coding

---

## 4. Before Any Changes

```typescript
// Always validate args in MCP tool handlers
if (!args || !args.requiredParam) {
  throw new Error('requiredParam is required');
}

// Always check file existence
if (!existsSync(filePath)) {
  throw new Error(`File not found: ${filePath}`);
}

// Always use try-catch in tool handlers
try {
  const result = await this.pdfTools.method(args);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
    isError: true
  };
}
```

---

## 5. Code Conventions

```typescript
// ✅ Use strict TypeScript
export interface MyInterface { /* ... */ }
async function myFunction(): Promise<ReturnType> { /* ... */ }

// ✅ Validate before processing
if (!input || typeof input !== 'string') {
  throw new Error('Invalid input');
}

// ✅ Ensure directories exist before writing
const dir = dirname(outputPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// ✅ Provide clear error messages
throw new Error(`Failed to merge PDFs: ${error.message}`);

// ❌ Never use any without reason
function process(data: any) { /* ... */ }  // BAD

// ❌ Never silently swallow errors
try { await op(); } catch {}  // BAD
```

---

## 6. Project-Specific Context

### Architecture
- **MCP Server** (`./src/`) - TypeScript, MCP SDK 1.0.0, pdf-lib, pdf-parse
- **VS Code Extension** (`./extension/`) - Registers MCP server for Copilot

### Key Files
- `./src/index.ts` - MCP server entry, tool registration
- `./src/pdf-tools.ts` - PDF implementations
- `./extension/src/extension.ts` - VS Code activation

### 7 PDF Tools
1. `read_pdf` - Extract text from PDF
2. `get_pdf_info` - Get metadata
3. `create_pdf` - Create PDF from text
4. `merge_pdfs` - Combine PDFs
5. `split_pdf` - Extract page range
6. `update_pdf_metadata` - Modify metadata
7. `extract_pages` - Extract individual pages

---

## 7. Build & Test Commands

```bash
# Build MCP server
npm run build

# Copy server to extension
npm run copy-to-extension

# Build extension
cd ./extension && npm run compile

# Package extension
cd ./extension && npm run package

# Test MCP server
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ./dist/index.js
```

---

## 8. When to Document

Use `should_document()` to check if change needs documentation.

**Document when**:
- Adding new MCP tool ✅
- Making architectural decision ✅
- Changing public API ✅
- Fixing user-facing bug ✅

**Skip when**:
- Internal refactoring only ❌
- Fixing typos ❌
- Updating dependencies (unless breaking) ❌

---

## 9. Contract Validation

**Before changing interfaces**, validate contracts:

```typescript
// Get contracts for context
const contracts = await get_contracts({ context: "mcp-server" });

// Validate proposed change
await validate_contract({
  contract_id: "pdf-tools-class-interface",
  implementation: "// your new code"
});
```

**Critical contracts**:
- `pdf-tools-class-interface` - PDFTools public methods
- `mcp-tool-schema` - MCP tool definitions
- `vscode-extension-mcp-registration` - Extension API
- `typescript-interfaces` - Public type definitions

---

## 10. Common Workflows

### Adding New PDF Tool
1. `identify_context({ file_path: "./src/pdf-tools.ts" })`
2. `start_session()` with clear objectives
3. Implement method in PDFTools class
4. Register in MCP server (`./src/index.ts`)
5. Add TypeScript interfaces
6. Update documentation (README, CHANGELOG)
7. `create_checkpoint()` and `complete_session()`

### Fixing Bugs
1. `identify_context()` for relevant file
2. `get_merged_guidelines()` to load context
3. Fix bug following error handling patterns
4. Update CHANGELOG.md
5. `create_checkpoint()` with summary

### Refactoring
1. `get_contracts()` to check dependencies
2. `validate_contract()` before breaking changes
3. Refactor with proper error handling
4. Add code comments for complex logic
5. `create_checkpoint()`

---

## 📚 Quick Links

- **Main Guide**: [AGENTS.md](../AGENTS.md)
- **Quick Ref**: [.ai-agents/QUICK-REFERENCE.md](.ai-agents/QUICK-REFERENCE.md)
- **Skills Hub**: [.ai-agents/skills/SKILL.md](.ai-agents/skills/SKILL.md)

---

## 🎯 Summary for Copilot

When working on this project:

1. **ALWAYS use relative paths** (e.g., `./src/index.ts`)
2. **Start conversations** with `identify_context()` and session management
3. **Load context progressively** - start with quick ref, dive deeper as needed
4. **Validate before changing** - check contracts, args, file existence
5. **Follow patterns** - see `.ai-agents/skills/PATTERNS-REFERENCE.md`
6. **Document wisely** - use `should_document()`, update CHANGELOG
7. **Checkpoint progress** - save meaningful milestones

**Remember**: This project helps AI assistants manipulate PDFs via MCP. Keep the user experience simple and reliable.

---

_For complete instructions, ALWAYS read [AGENTS.md](../AGENTS.md) first._
