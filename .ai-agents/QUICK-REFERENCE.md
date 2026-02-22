# Quick Reference - PDF Utilities MCP

**Purpose**: Condensed checklist that fits in context window. Load this for quick orientation.

---

## 🎯 Every Conversation Workflow

```typescript
// 1. WHERE AM I?
identify_context({ file_path: "./src/index.ts" })  // ALWAYS RELATIVE PATHS!

// 2. WHAT'S ACTIVE?
get_current_focus()  // Check existing session

// 3. START OR CONTINUE
// If no session:
start_session({ context: "mcp-server", current_focus: "task description", objectives: ["goal1"] })
// If session exists:
get_merged_guidelines({ context: "mcp-server" })

// 4. WORK
// ... do your implementation ...

// 5. REFRESH (every 10 turns)
refresh_session_context()

// 6. CHECKPOINT (after meaningful progress)
create_checkpoint({ summary: "what I did", next_focus: "what's next" })

// 7. COMPLETE
complete_session()  // When task is done
```

---

## 🚨 Critical Rules

### PATH CONVENTION (MOST IMPORTANT!)

```typescript
// ✅ CORRECT - All examples must use relative paths
"./src/index.ts"
"./extension/package.json"
"./dist/pdf-tools.js"

// ❌ WRONG - Never use absolute paths
"/Users/username/project/src/index.ts"
"/absolute/path/to/file.ts"
```

### Before Every Change

* [ ] Run `identify_context({ file_path: "./relevant/file.ts" })`
* [ ] Check `get_current_focus()` for active session
* [ ] Load guidelines: `get_merged_guidelines({ context })`

### During Work

* [ ] Validate args before using in tool handlers (`if (!args) throw Error`)
* [ ] Use try-catch in MCP CallToolRequestSchema handlers
* [ ] Check file existence with `existsSync()` before operations
* [ ] Follow strict TypeScript (no `any` without reason)

### After Meaningful Progress

* [ ] Save checkpoint: `create_checkpoint({ summary, next_focus })`
* [ ] Every 10 turns: `refresh_session_context()`
* [ ] Update CHANGELOG.md if user-facing changes
* [ ] Run build before testing: `npm run build && npm run copy-to-extension`

---

## 📂 Project Structure Cheat Sheet

```
./src/index.ts           # MCP server entry, tool registration
./src/pdf-tools.ts       # PDF implementations (pdf-lib, pdf-parse)
./extension/src/extension.ts  # VS Code activation, MCP registration
./dist/                  # Compiled MCP server
./extension/mcp-server/  # MCP server copy with node_modules
```

---

## 🛠️ Common Commands

```bash
# Build & Test
npm run build                    # Compile MCP server
npm run copy-to-extension        # Copy server to extension
cd ./extension && npm run compile  # Build extension
cd ./extension && npm run package  # Create VSIX

# Development
npm run dev                      # Watch mode (MCP server)
cd ./extension && npm run watch  # Watch mode (extension)

# Testing
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ./dist/index.js
```

---

## 🔧 7 PDF Tools

| Tool | Input | Output |
|------|-------|--------|
| `read_pdf` | filePath, pageRange? | text, pages, info |
| `get_pdf_info` | filePath | metadata |
| `create_pdf` | content, outputPath, options? | path, pages |
| `merge_pdfs` | filePaths[], outputPath | path, pages |
| `split_pdf` | filePath, pageRange, outputPath | path, pages |
| `update_pdf_metadata` | filePath, metadata, outputPath? | path |
| `extract_pages` | filePath, pages[], outputDir, prefix? | files[] |

---

## 🎓 When to Load Detailed Files

Load these from `.ai-agents/` only when needed:

* **Starting new session?** → Read `./skills/SESSION-WORKFLOW.md`
* **Changing MCP tools?** → Read `./skills/CONTRACT-REFERENCE.md`
* **Adding documentation?** → Read `./skills/DOCUMENTATION-WORKFLOW.md`
* **Learning patterns?** → Read `./skills/PATTERNS-REFERENCE.md`
* **Need comprehensive guide?** → Read `./skills/SKILL.md`

---

## ⚡ Anti-Patterns to Avoid

```typescript
// ❌ Absolute paths in MCP calls
identify_context({ file_path: "/Users/name/project/src/index.ts" })

// ❌ Skipping args validation
const result = await this.pdfTools.readPDF(args.filePath)  // args might be undefined!

// ❌ Silent error handling
try { await operation(); } catch {}  // Lost error context

// ❌ Missing file checks
const data = readFileSync(path)  // Might throw if file doesn't exist

// ❌ Working without session context
// Just start coding without identify_context() or get_current_focus()
```

---

## 🔗 Progressive Disclosure

1. **Start here** - This file (Quick Reference)
2. **Need workflow details?** - Load `.ai-agents/skills/SKILL.md`
3. **Deep dive on specific topic?** - Load relevant workflow file
4. **Context getting stale?** - Run `refresh_session_context()`

**Remember**: Context is finite. Load only what you need, when you need it.
