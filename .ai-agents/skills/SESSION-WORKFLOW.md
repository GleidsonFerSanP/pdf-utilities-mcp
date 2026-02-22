# Session Workflow - PDF Utilities MCP

**Purpose**: Complete guide to managing work sessions using Project Docs MCP tools.

---

## 🎯 Session Lifecycle

### 1. Start Every Conversation

```typescript
// Step 1: Where am I?
const context = await identify_context({
  file_path: "./src/index.ts"  // ALWAYS relative!
});
// Returns: { context: "mcp-server", ... }

// Step 2: Is there an active session?
const focus = await get_current_focus();
// Returns: { current_focus: "...", session_id: "..." } or null

// Step 3a: If NO session, start one
if (!focus) {
  await start_session({
    context: "mcp-server",
    current_focus: "Adding PDF watermark feature",
    objectives: [
      "Implement watermarkPDF method in PDFTools",
      "Register tool in MCP server",
      "Add TypeScript interfaces",
      "Update documentation"
    ],
    files: [
      "./src/pdf-tools.ts",
      "./src/index.ts"
    ]
  });
}

// Step 3b: If session EXISTS, load guidelines
if (focus) {
  const guidelines = await get_merged_guidelines({
    context: "mcp-server"
  });
  // Review guidelines before continuing work
}
```

### 2. During Work

```typescript
// Every 5-10 turns: Refresh context
await refresh_session_context();
// Prevents stale context, keeps track of work

// When switching focus:
await update_focus({
  new_focus: "Fixing error handling in mergePDFs"
});

// After meaningful progress:
await create_checkpoint({
  summary: "Completed watermark implementation with positioning options",
  next_focus: "Add tests for watermark rotation"
});
```

### 3. End Session

```typescript
// When task is complete:
await complete_session();
// Saves final state, clears active session
```

---

## 📋 Checkpoint Patterns

### When to Checkpoint

✅ **Good times to checkpoint**:
* Completed a feature (e.g., "Added rotatePDF tool")
* Fixed a bug (e.g., "Fixed merge error for large files")
* Finished a sub-task (e.g., "Updated all type definitions")
* Before context refresh (save state first)
* End of work session

❌ **Too early**:
* After reading files
* After small code changes
* Before testing

### Checkpoint Format

```typescript
// ✅ GOOD - Specific, actionable
await create_checkpoint({
  summary: "Implemented PDF rotation with 90/180/270 degree support. Added input validation.",
  next_focus: "Add tests for rotation edge cases (empty PDFs, corrupted files)"
});

// ❌ BAD - Vague, not actionable
await create_checkpoint({
  summary: "Made changes",
  next_focus: "Do other stuff"
});
```

---

## 🔄 Context Refresh Strategy

### Why Refresh?

* Context window has limits
* Summaries lose detail over time
* Prevents forgetting earlier decisions

### When to Refresh

```typescript
// Pattern 1: Turn counter
let turnCount = 0;
// After each interaction:
turnCount++;
if (turnCount >= 10) {
  await refresh_session_context();
  turnCount = 0;
}

// Pattern 2: Before complex operation
// About to refactor large file
await refresh_session_context();
// Now proceed with full context

// Pattern 3: After interruption
// User asked about something unrelated, now returning to task
await refresh_session_context();
// Restore task context
```

---

## 🎯 Focus Management

### Updating Focus

```typescript
// Starting work: Initial focus
await start_session({
  current_focus: "Implement PDF compression tool"
});

// Mid-work: Discovered related issue
await update_focus({
  new_focus: "Fix memory leak in PDF parsing before adding compression"
});

// Completed: Return to original goal
await update_focus({
  new_focus: "Resume: Implement PDF compression tool"
});
```

### Focus Best Practices

```typescript
// ✅ GOOD - Specific and scoped
current_focus: "Add watermark support with opacity and positioning"

// ❌ BAD - Too broad
current_focus: "Improve PDF tools"

// ✅ GOOD - Includes context
current_focus: "Fix extractPages filename collision (issue #42)"

// ❌ BAD - No context
current_focus: "Fix bug"
```

---

## 📊 Session State Patterns

### Check Session State

```typescript
// Get full session details
const state = await get_session_state();
// Returns: {
//   session_id: "...",
//   project_name: "pdf-utilities-mcp",
//   context: "mcp-server",
//   current_focus: "...",
//   objectives: [...],
//   files: [...],
//   created_at: "...",
//   checkpoints: [...]
// }

// Use to:
// - Resume after interruption
// - Review objectives
// - Check which files are tracked
// - See checkpoint history
```

### List Active Sessions

```typescript
// See all active sessions (useful if working on multiple tasks)
const sessions = await list_active_sessions();
// Returns: [{ session_id, project_name, current_focus, created_at }, ...]

// Resume specific session
await resume_session({ session_id: "..." });
```

---

## 🔁 Interruption Handling

### User Changes Topic Mid-Task

```typescript
// Save checkpoint before handling interruption
await create_checkpoint({
  summary: "WIP: Halfway through implementing rotation tool",
  next_focus: "Complete rotation implementation after addressing user question"
});

// Handle interruption...
// (answer question, fix unrelated bug, etc.)

// Resume: Refresh context
await refresh_session_context();
const state = await get_session_state();
// Review checkpoints to remember where you were

// Continue work
```

### Long Conversations

```typescript
// Pattern for multi-day or very long sessions

// Day 1 end:
await create_checkpoint({
  summary: "Completed watermark tool implementation and basic tests",
  next_focus: "Tomorrow: Add advanced positioning and rotation options"
});

// Day 2 start:
const focus = await get_current_focus();
if (focus) {
  // Session still active
  await refresh_session_context();
  const state = await get_session_state();
  // Review checkpoints, continue from next_focus
}
```

---

## 🎓 Example: Complete Session

```typescript
// === NEW FEATURE: PDF Encryption Tool ===

// 1. IDENTIFY CONTEXT
const context = await identify_context({
  file_path: "./src/pdf-tools.ts"
});

// 2. CHECK ACTIVE SESSION
const currentFocus = await get_current_focus();

// 3. START SESSION
await start_session({
  context: "mcp-server",
  current_focus: "Implement PDF encryption tool",
  objectives: [
    "Research pdf-lib encryption APIs",
    "Add encryptPDF method to PDFTools",
    "Register encrypt_pdf tool in MCP server",
    "Add TypeScript interfaces",
    "Update README.md with new tool"
  ],
  files: [
    "./src/pdf-tools.ts",
    "./src/index.ts",
    "./README.md"
  ]
});

// 4. WORK: Research
// ... read pdf-lib docs, check examples ...

// 5. CHECKPOINT: Research complete
await create_checkpoint({
  summary: "Researched pdf-lib encryption. Plan: Use PDFDocument.encrypt() with user/owner passwords and permissions.",
  next_focus: "Implement encryptPDF method in PDFTools class"
});

// 6. WORK: Implement method
// ... add encryptPDF to pdf-tools.ts ...

// 7. CHECKPOINT: Method implemented
await create_checkpoint({
  summary: "Implemented encryptPDF method with password protection and permission settings",
  next_focus: "Register tool in MCP server index.ts"
});

// 8. WORK: Register in MCP server
// ... add to tool list, add case in CallToolRequestSchema handler ...

// 9. REFRESH (if conversation getting long)
await refresh_session_context();

// 10. CHECKPOINT: Registration complete
await create_checkpoint({
  summary: "Registered encrypt_pdf tool in MCP server with proper schema",
  next_focus: "Add TypeScript interfaces and update documentation"
});

// 11. WORK: Types and docs
// ... add interfaces, update README.md ...

// 12. FINAL CHECKPOINT
await create_checkpoint({
  summary: "Completed PDF encryption tool: method, registration, types, docs. Ready for testing.",
  next_focus: "Test encrypt_pdf tool with various password scenarios"
});

// 13. COMPLETE SESSION
await complete_session();
```

---

## 🚨 Common Mistakes

### Mistake 1: No Session Management

```typescript
// ❌ Starting work without identify_context() or start_session()
// Just start coding...

// ✅ CORRECT
const context = await identify_context({ file_path: "./src/index.ts" });
const focus = await get_current_focus();
if (!focus) {
  await start_session({ context: "mcp-server", current_focus: "..." });
}
```

### Mistake 2: Never Refreshing Context

```typescript
// ❌ Long conversation (30+ turns) without refresh
// Context becomes stale, forgets earlier decisions

// ✅ CORRECT
// Every 10 turns:
await refresh_session_context();
```

### Mistake 3: Vague Checkpoints

```typescript
// ❌ Not useful later
await create_checkpoint({
  summary: "Did stuff",
  next_focus: "Do more stuff"
});

// ✅ CORRECT
await create_checkpoint({
  summary: "Fixed mergePDFs to handle files >100MB by using streams",
  next_focus: "Add tests for large file merging"
});
```

### Mistake 4: Forgetting to Complete Session

```typescript
// ❌ Task is done but session still active
// Next conversation will have stale session

// ✅ CORRECT
await complete_session();
```

---

## 🔗 Related Files

* **Quick Reference**: `../QUICK-REFERENCE.md`
* **Main Skills**: `./SKILL.md`
* **Contracts**: `./CONTRACT-REFERENCE.md`
* **Documentation**: `./DOCUMENTATION-WORKFLOW.md`
* **Patterns**: `./PATTERNS-REFERENCE.md`

---

**Remember**: Session management is about tracking progress and maintaining context. Use it to stay focused and avoid repeating work.
