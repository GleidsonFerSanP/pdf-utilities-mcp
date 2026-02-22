# AI Agents Documentation

This directory contains progressive context documentation for AI agents working with this project.

---

## 📂 Structure

```
.ai-agents/
├── README.md                     # This file - directory overview
├── QUICK-REFERENCE.md            # <500 token checklist for every conversation
├── copilot-instructions.md       # GitHub Copilot custom instructions
└── skills/
    ├── SKILL.md                  # Main skills hub with quick start
    ├── SESSION-WORKFLOW.md       # Session management patterns
    ├── CONTRACT-REFERENCE.md     # Critical interfaces and validation
    ├── DOCUMENTATION-WORKFLOW.md # When and how to document
    └── PATTERNS-REFERENCE.md     # Code patterns and conventions
```

---

## 🎯 How to Use

### For AI Agents

**Every conversation:**

1. **Start**: Read [../AGENTS.md](../AGENTS.md) (main entry point)
2. **Quick context**: Load [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **Deep dive** (only as needed):
   - [skills/SKILL.md](./skills/SKILL.md) - Comprehensive guide
   - [skills/SESSION-WORKFLOW.md](./skills/SESSION-WORKFLOW.md) - Session management
   - [skills/CONTRACT-REFERENCE.md](./skills/CONTRACT-REFERENCE.md) - Interface validation
   - [skills/DOCUMENTATION-WORKFLOW.md](./skills/DOCUMENTATION-WORKFLOW.md) - Documentation
   - [skills/PATTERNS-REFERENCE.md](./skills/PATTERNS-REFERENCE.md) - Code patterns

### For GitHub Copilot

Load [copilot-instructions.md](./copilot-instructions.md) for project-specific rules.

---

## 🚨 Critical Rule

**ALL file paths in MCP tool calls MUST be relative!**

```typescript
// ✅ CORRECT
identify_context({ file_path: "./src/index.ts" })

// ❌ WRONG
identify_context({ file_path: "/absolute/path/to/file.ts" })
```

---

## 📚 Progressive Disclosure Pattern

**Don't load everything at once!**

* **Level 1**: AGENTS.md (always start here)
* **Level 2**: QUICK-REFERENCE.md (condensed checklist)
* **Level 3**: skills/SKILL.md (comprehensive guide)
* **Level 4**: Specific workflow files (only when needed)

This keeps context window usage efficient while ensuring relevant information is available when needed.

---

## 🔗 Main Entry Point

**👉 Start here**: [AGENTS.md](../AGENTS.md) (at project root)

That file provides:
* Project overview
* MCP workflow integration
* Architecture overview
* Code conventions
* Getting started guide
* Links to all other documentation

---

## 📝 File Purposes

| File | Purpose | When to Load |
|------|---------|--------------|
| **AGENTS.md** | Main guide, project overview | Every conversation (start here) |
| **QUICK-REFERENCE.md** | Condensed checklist (<500 tokens) | Quick orientation |
| **copilot-instructions.md** | Copilot custom instructions | Automatic (Copilot loads it) |
| **skills/SKILL.md** | Comprehensive skills hub | Complex features, deep work |
| **skills/SESSION-WORKFLOW.md** | Session management | Starting work, checkpoints |
| **skills/CONTRACT-REFERENCE.md** | Interface validation | Before changing APIs |
| **skills/DOCUMENTATION-WORKFLOW.md** | Documentation patterns | Adding features, ADRs |
| **skills/PATTERNS-REFERENCE.md** | Code conventions | Implementing features |

---

## 🎓 Example Usage

```typescript
// Scenario: Adding new PDF compression feature

// 1. Load main guide
// Read: ../AGENTS.md

// 2. Quick orientation
// Read: QUICK-REFERENCE.md

// 3. Start session with MCP tools
identify_context({ file_path: "./src/pdf-tools.ts" });
start_session({
  context: "mcp-server",
  current_focus: "Add PDF compression tool"
});

// 4. Load relevant workflows (progressive)
// Read: skills/PATTERNS-REFERENCE.md (for code patterns)
// Read: skills/CONTRACT-REFERENCE.md (for interface validation)

// 5. Work...

// 6. Load documentation guide when ready to document
// Read: skills/DOCUMENTATION-WORKFLOW.md

// 7. Complete
create_checkpoint({ summary: "...", next_focus: "..." });
complete_session();
```

---

## ✅ Quality Checks

Before creating new documentation in this directory:

* [ ] Does it follow progressive disclosure pattern?
* [ ] Does it use **relative paths** in all examples?
* [ ] Is it organized by specific task/workflow?
* [ ] Does it link to related files?
* [ ] Is it concise and actionable?

---

**Remember**: These files help AI agents work efficiently with this project. Keep them accurate, concise, and focused on project-specific knowledge.
