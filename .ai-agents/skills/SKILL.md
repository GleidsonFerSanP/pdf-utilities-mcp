# PDF Utilities MCP - Skills Hub

**Progressive Disclosure Pattern**: Start here for quick orientation, then load specific workflow files as needed.

---

## 🚀 Quick Start Code

### Essential Pattern (Copy-Paste Ready)

```typescript
// 1. Identify context (ALWAYS use relative paths!)
const context = await identify_context({ 
  file_path: "./src/index.ts"  // ✅ Relative path
});

// 2. Check for active session
const currentFocus = await get_current_focus();

// 3. Start session or load guidelines
if (!currentFocus) {
  await start_session({
    context: context.context,
    current_focus: "Implementing new PDF tool",
    objectives: [
      "Add tool to PDFTools class",
      "Register in MCP server",
      "Add TypeScript interfaces"
    ]
  });
} else {
  const guidelines = await get_merged_guidelines({ context: context.context });
  // Review guidelines before proceeding
}

// 4. Do your work
// ... implementation ...

// 5. Save progress
await create_checkpoint({
  summary: "Completed watermark tool implementation",
  next_focus: "Add tests and update documentation"
});

// 6. Complete when done
await complete_session();
```

---

## 🚨 Path Convention Rule

**CRITICAL**: All file paths in MCP tool calls MUST be relative.

```typescript
// ✅ CORRECT
identify_context({ file_path: "./src/pdf-tools.ts" })
start_session({ files: ["./src/index.ts", "./src/pdf-tools.ts"] })

// ❌ WRONG - Breaks for other developers
identify_context({ file_path: "/Users/gleidsonfersanp/workspace/AI/pdf-utilities-mcp/src/pdf-tools.ts" })
```

**Why?** Absolute paths only work on one machine. Relative paths work for everyone.

---

## 📚 Workflow Files (Load As Needed)

### Session Management
**File**: `./SESSION-WORKFLOW.md`  
**When**: Starting new work, managing focus, handling interruptions  
**Topics**: Session lifecycle, checkpoint patterns, focus updates

### Contract Validation
**File**: `./CONTRACT-REFERENCE.md`  
**When**: Modifying MCP tools, changing interfaces, adding features  
**Topics**: Critical interfaces, tool schemas, breaking change detection

### Documentation
**File**: `./DOCUMENTATION-WORKFLOW.md`  
**When**: Adding features, making architectural decisions, updating docs  
**Topics**: When to document, ADR patterns, changelog updates

### Code Patterns
**File**: `./PATTERNS-REFERENCE.md`  
**When**: Implementing new features, refactoring, unsure of conventions  
**Topics**: MCP patterns, error handling, TypeScript conventions, VS Code integration

---

## 🎯 Project-Specific Context

### What This Project Does
PDF Utilities MCP provides 7 PDF manipulation tools to AI assistants via Model Context Protocol:
1. Read text from PDFs
2. Get PDF metadata
3. Create PDFs from text
4. Merge PDFs
5. Split PDFs by page range
6. Update PDF metadata
7. Extract individual pages

### Architecture
- **MCP Server** (`./src/`) - TypeScript, MCP SDK, pdf-lib, pdf-parse
- **VS Code Extension** (`./extension/`) - Registers MCP server, provides Copilot integration

### Key Components
- `./src/index.ts` - MCP server initialization and tool registration
- `./src/pdf-tools.ts` - PDF manipulation logic
- `./extension/src/extension.ts` - VS Code extension activation

---

## ⚡ Common Workflows

### Adding a New PDF Tool

1. **Identify context**
   ```typescript
   identify_context({ file_path: "./src/pdf-tools.ts" })
   ```

2. **Start focused session**
   ```typescript
   start_session({
     context: "mcp-server",
     current_focus: "Adding PDF rotation tool",
     objectives: ["Add rotatePDF method", "Register in MCP server", "Add types"]
   })
   ```

3. **Check contracts**
   ```typescript
   get_contracts({ context: "mcp-server" })
   // Review PDFTools class contract, MCP tool schema contract
   ```

4. **Implement** (see `./PATTERNS-REFERENCE.md` for code patterns)

5. **Validate contract**
   ```typescript
   validate_contract({
     contract_id: "mcp-tool-schema",
     implementation: "// your tool schema code"
   })
   ```

6. **Checkpoint**
   ```typescript
   create_checkpoint({
     summary: "Added rotatePDF tool with 90/180/270 degree support",
     next_focus: "Add tests and update CHANGELOG.md"
   })
   ```

### Fixing Bugs

1. **Identify file**
   ```typescript
   identify_context({ file_path: "./src/pdf-tools.ts" })
   ```

2. **Get guidelines**
   ```typescript
   get_merged_guidelines({ context: "mcp-server" })
   ```

3. **Check existing docs**
   ```typescript
   check_existing_documentation({
     topic: "PDF error handling",
     context: "mcp-server"
   })
   ```

4. **Fix bug** (follow error handling patterns)

5. **Document decision if architectural**
   ```typescript
   add_decision({
     title: "Handle corrupted PDF files gracefully",
     decision: "Return error object instead of throwing",
     rationale: "Allows MCP clients to handle errors appropriately"
   })
   ```

### Updating Documentation

1. **Check what exists**
   ```typescript
   check_existing_documentation({ topic: "PDF tools", context: "mcp-server" })
   ```

2. **Create or update**
   ```typescript
   manage_documentation({
     operation: "update",
     doc_type: "api",
     content: "// Updated API docs"
   })
   ```

See `./DOCUMENTATION-WORKFLOW.md` for complete patterns.

---

## 🔍 Debugging Tips

### MCP Server Not Starting
```bash
# Test server directly
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ./dist/index.js

# Check build
npm run build
npm run copy-to-extension
```

### Extension Not Loading
- Check VS Code Output panel: "PDF Utilities"
- Verify `./extension/mcp-server/node_modules/` exists
- Check `./extension/mcp-server/index.js` is present

### TypeScript Errors
```bash
# Clean rebuild
rm -rf ./dist ./extension/dist ./extension/mcp-server
npm run build
npm run copy-to-extension
cd ./extension && npm run compile
```

---

## 📖 Anti-Patterns

```typescript
// ❌ Starting work without identifying context
// Just start coding without knowing project structure

// ❌ Using absolute paths
identify_context({ file_path: "/absolute/path/..." })

// ❌ Skipping session management
// No start_session(), get_current_focus(), or checkpoints

// ❌ Making breaking changes without contract validation
// Change PDFTools method signatures without validation

// ❌ Not validating args in tool handlers
const result = await this.pdfTools.readPDF(args.filePath)  // args might be undefined!

// ❌ Silent error handling
try { await operation(); } catch {}  // Lost context

// ❌ Forgetting to run refresh_session_context() in long conversations
// Context gets stale after 10+ turns
```

---

## 🎓 Progressive Learning Path

1. **First conversation**
   - Read: AGENTS.md (main guide)
   - Read: This file (SKILL.md)
   - Practice: Run identify_context(), start_session()

2. **Adding features**
   - Read: `./PATTERNS-REFERENCE.md`
   - Read: `./CONTRACT-REFERENCE.md`
   - Practice: Implement tool following patterns

3. **Managing work**
   - Read: `./SESSION-WORKFLOW.md`
   - Practice: Use checkpoints, focus updates

4. **Documentation**
   - Read: `./DOCUMENTATION-WORKFLOW.md`
   - Practice: Add ADR, update changelog

---

## 🔗 Links to Other Files

- **Main Guide**: `../AGENTS.md` (at project root)
- **Quick Checklist**: `../QUICK-REFERENCE.md`
- **Session Details**: `./SESSION-WORKFLOW.md`
- **Contracts**: `./CONTRACT-REFERENCE.md`
- **Documentation**: `./DOCUMENTATION-WORKFLOW.md`
- **Code Patterns**: `./PATTERNS-REFERENCE.md`
- **Copilot Instructions**: `../copilot-instructions.md`

---

**Remember**: Load files progressively. Start with quick reference, dive deeper only when needed. Use MCP tools to maintain context and track progress.
