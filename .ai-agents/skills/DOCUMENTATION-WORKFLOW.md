# Documentation Workflow - PDF Utilities MCP

**Purpose**: When and how to document decisions, features, and architecture.

---

## 🎯 Documentation Types

### 1. Architectural Decision Records (ADR)

**When**: Making significant architectural decisions  
**Tool**: `add_decision()`

**Format**: Decision, rationale, consequences

### 2. Feature Documentation

**When**: Adding new capabilities  
**Tool**: `register_feature()` , `update_feature()`

**Format**: Description, usage, examples

### 3. Code Comments

**When**: Complex logic, non-obvious behavior  
**Tool**: Direct code editing  
**Format**: JSDoc, inline comments

### 4. User Documentation

**When**: Public API changes, new features  
**Files**: README.md, CHANGELOG.md  
**Tool**: File editing

---

## 📝 When to Document

### Should I Document This?

```typescript
// Use the should_document tool to check
const shouldDoc = await should_document({
  context: "mcp-server",
  change_description: "Added optional password parameter to read_pdf tool for encrypted PDFs"
});

// Returns: {
//   should_document: true,
//   recommended_types: ["feature", "changelog"],
//   reasoning: "New feature that affects public API"
// }
```

### Decision Matrix

| Change Type | ADR | Feature Doc | Code Comment | User Doc | Changelog |
|-------------|-----|-------------|--------------|----------|-----------|
| New MCP tool | Maybe | ✅ | ✅ | ✅ | ✅ |
| Internal refactor | Only if significant | ❌ | ✅ | ❌ | ❌ |
| Bug fix | Only if architectural | ❌ | If complex | If user-facing | ✅ |
| Dependency change | If affects architecture | ❌ | ❌ | If user-facing | ✅ |
| Performance optimization | If major approach change | Maybe | ✅ | If significant | ✅ |
| Breaking change | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🏗️ Architectural Decision Records

### When to Create ADR

✅ **Yes - Create ADR**:
* Choosing between MCP transport types (stdio vs HTTP)
* Deciding to bundle dependencies vs external install
* Choosing pdf-lib over other PDF libraries
* Changing error handling strategy
* Adding authentication/security layer

❌ **No - Skip ADR**:
* Adding one more PDF tool (follows existing pattern)
* Updating a dependency version
* Fixing a bug (unless it reveals architectural flaw)
* Reformatting code

### ADR Workflow

```typescript
// 1. Check existing decisions
const docs = await check_existing_documentation({
  topic: "PDF library choice",
  context: "mcp-server"
});

// 2. Add new decision
await add_decision({
  title: "Use pdf-lib for PDF creation and modification",
  decision: "Selected pdf-lib over PDFKit and jsPDF for PDF manipulation tasks",
  rationale: `
    - pdf-lib: Excellent TypeScript support, can modify existing PDFs, good documentation
    - PDFKit: Limited modification capabilities, mainly for creation
    - jsPDF: Primarily client-side, limited server features
  `,
  consequences: `
    Positive:
    - Full PDF manipulation (create, merge, split, modify)
    - Strong typing reduces errors
    - Active maintenance
    
    Negative:
    - Larger bundle size (~500KB)
    - Steeper learning curve than PDFKit
  `,
  alternatives: ["PDFKit", "jsPDF"],
  context: "mcp-server"
});

// 3. Reference in code
// src/pdf-tools.ts
/**
 * PDF manipulation using pdf-lib
 * See ADR: "Use pdf-lib for PDF creation and modification"
 */
import { PDFDocument } from 'pdf-lib';
```

### ADR Example

```markdown
# ADR: Bundle MCP Server Dependencies in VS Code Extension

## Decision

Bundle all MCP server dependencies (node_modules) in the VS Code extension package.

## Rationale

- Users shouldn't need to run `npm install` manually
- Extension should work immediately after installation
- Dependencies are runtime requirements, not dev-time only

## Consequences

### Positive
- Better user experience (install and use)
- No environment setup required
- Consistent dependency versions

### Negative

- Larger extension package size (20MB vs 100KB)
- Slower marketplace uploads
- Duplicated dependencies if user has them globally

## Alternatives Considered

1. External npm install in extension activation
   - Rejected: Poor UX, network dependency, errors
2. Use global dependencies
   - Rejected: Version conflicts, missing dependencies
3. Bundle dependencies ✅ Selected
```

---

## 📦 Feature Documentation

### Registering Features

```typescript
// When adding a new MCP tool
await register_feature({
  name: "PDF Encryption",
  feature_id: "pdf-encryption-tool",
  description: "Encrypt PDFs with user/owner passwords and permissions",
  implementation_notes: `
    - Uses pdf-lib PDFDocument.encrypt() method
    - Supports user password and owner password
    - Configurable permissions (print, modify, copy)
    - Validates password strength
  `,
  related_files: [
    "./src/pdf-tools.ts",
    "./src/index.ts"
  ],
  context: "mcp-server"
});
```

### Updating Features

```typescript
// When modifying existing feature
await update_feature({
  feature_id: "pdf-encryption-tool",
  updates: {
    description: "Encrypt PDFs with AES-256 encryption and granular permissions",
    implementation_notes: `
      - Upgraded to AES-256 encryption
      - Added per-action permissions (print, modify, copy, annotate)
      - Password strength validator (min 8 chars)
      - Support for certificate-based encryption
    `
  }
});
```

### Removing Features

```typescript
// When deprecating a feature
await remove_feature({
  feature_id: "legacy-pdf-export",
  reason: "Replaced by create_pdf tool with better options"
});
```

---

## 💬 Code Comments

### JSDoc for Public APIs

```typescript
/**
 * Read text content from a PDF file
 * 
 * @param filePath - Absolute or relative path to PDF file
 * @param pageRange - Optional page range (e.g., "1-3", "1,3,5")
 * @returns Object containing extracted text, page count, and metadata
 * 
 * @example
 * ```typescript
 * const result = await pdfTools.readPDF('./document.pdf', '1-5');
 * console.log(result.text); // Text from pages 1-5
 * console.log(result.pages); // 5
 * ```

 * 
 * @throws {Error} If file doesn't exist or is not a valid PDF
 */
async readPDF(
  filePath: string, 
  pageRange?: string
): Promise<ReadPDFResult> {
  // Implementation...
}

```

### Inline Comments for Complex Logic

```typescript
// ✅ GOOD - Explains WHY, not WHAT
// Parse page ranges like "1-3,5,7-9" into array [1,2,3,5,7,8,9]
// Handles both comma-separated and hyphen ranges
private parsePageRange(range: string, totalPages: number): number[] {
  // ...
}

// ❌ BAD - States the obvious
// This function parses page range
private parsePageRange(range: string, totalPages: number): number[] {
  // Loop through the range
  for (const part of range.split(',')) {
    // ...
  }
}
```

### TODO Comments

```typescript
// TODO(v2.0): Add support for PDF forms
// Current limitation: Can't fill form fields
async readPDF(filePath: string): Promise<ReadPDFResult> {
  // ...
}
```

---

## 📄 User Documentation

### README.md Updates

```typescript
// After adding new feature, update README.md

// Check current README
const docs = await check_existing_documentation({
  topic: "README",
  context: "mcp-server"
});

// Update using file editing
// Add to "Available Tools" section
```

**Structure**:

```markdown

## Available Tools

### read_pdf

Read text from a PDF file, optionally specifying page ranges.

**Parameters**:
- `filePath` (string, required): Path to PDF file
- `pageRange` (string, optional): Page range like "1-3" or "1,3,5"

**Returns**:
```json
{
  "text": "Extracted text content...",
  "pages": 10,
  "info": { "title": "Document Title", "author": "..." }
}
```

**Example**:

```typescript
const result = await read_pdf({
  filePath: "./document.pdf",
  pageRange: "1-5"
});
console.log(result.text);
```

```

### CHANGELOG.md Updates

**Always update CHANGELOG.md for user-facing changes**

```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added

- `encrypt_pdf` tool for password protection and permissions
- Support for encrypted PDFs in `read_pdf` (password parameter)

### Changed

- Improved error messages for invalid page ranges
- Updated pdf-lib to v1.18.0

### Fixed

- Memory leak in `merge_pdfs` for large files
- File handle not closed in `split_pdf` on error

## [1.0.1] - 2024-01-10

### Fixed

- Missing dependencies in extension package
```

---

## 🔄 Documentation Workflow Example

```typescript
// === Scenario: Adding PDF Encryption Feature ===

// 1. CHECK IF SHOULD DOCUMENT
const shouldDoc = await should_document({
  context: "mcp-server",
  change_description: "Adding PDF encryption with password protection"
});
// Returns: { should_document: true, recommended_types: ["feature", "adr", "changelog"] }

// 2. CREATE ADR (architectural decision)
await add_decision({
  title: "Use pdf-lib encryption for password protection",
  decision: "Implement encryption using pdf-lib's built-in encrypt() method",
  rationale: "Native support, AES-256, no additional dependencies",
  consequences: "Positive: Secure, well-tested. Negative: Limited to pdf-lib's encryption options.",
  context: "mcp-server"
});

// 3. REGISTER FEATURE
await register_feature({
  name: "PDF Encryption",
  feature_id: "pdf-encryption",
  description: "Password protect PDFs with configurable permissions",
  implementation_notes: "Uses PDFDocument.encrypt() with AES-256",
  related_files: ["./src/pdf-tools.ts", "./src/index.ts"],
  context: "mcp-server"
});

// 4. ADD JSDOC COMMENTS
// (In code)
/**
 * Encrypt a PDF file with password protection
 * @param filePath - Input PDF path
 * @param outputPath - Output encrypted PDF path
 * @param options - Encryption options (passwords, permissions)
 */
async encryptPDF(/* ... */) { /* ... */ }

// 5. UPDATE README.md
// Add to "Available Tools" section with examples

// 6. UPDATE CHANGELOG.md
// Add to [Unreleased] or next version section

// 7. SYNC TO FILES (optional, for persistence)
await sync_documentation_files({
  context: "mcp-server"
});
```

---

## 🔍 Finding Existing Documentation

```typescript
// Check what's already documented
const existingDocs = await check_existing_documentation({
  topic: "PDF encryption",
  context: "mcp-server"
});

// List all documentation
const allDocs = await list_documentation({
  context: "mcp-server",
  type: "adr"  // or "feature", "api", "guide"
});

// Get complete project context (includes all docs)
const fullContext = await get_complete_project_context();
```

---

## ✅ Documentation Checklist

### For New Features

* [ ] Check if should document: `should_document()`
* [ ] Register feature: `register_feature()`
* [ ] Add JSDoc comments to public APIs
* [ ] Update README.md with usage examples
* [ ] Add entry to CHANGELOG.md
* [ ] Create ADR if architectural decision
* [ ] Add inline comments for complex logic

### For Bug Fixes

* [ ] Add CHANGELOG.md entry
* [ ] Add code comments explaining the fix
* [ ] Create ADR only if reveals architectural issue
* [ ] Update docs if user-facing behavior changes

### For Refactoring

* [ ] Add inline comments for complex logic
* [ ] Create ADR if approach significantly changes
* [ ] Update JSDoc if public API affected
* [ ] Update README.md if usage changes

---

## 🚨 Common Mistakes

```typescript
// ❌ Over-documenting (documenting the obvious)
/**
 * Gets the file path
 * @param filePath The file path
 * @returns The file path
 */
getFilePath(filePath: string): string {
  return filePath;
}

// ❌ Under-documenting (missing critical info)
// No explanation of complex algorithm
function parsePageRange(range: string) { /* complex logic */ }

// ✅ CORRECT - Document complexity, not obvious stuff
/**
 * Parse page range string into array of page numbers
 * Supports formats: "1-3" (range), "1,3,5" (list), "1-3,5,7-9" (mixed)
 * @throws {Error} If range is invalid or exceeds total pages
 */
private parsePageRange(range: string, totalPages: number): number[] {
  // ...
}
```

---

## 🔗 Related Files

* **Quick Reference**: `../QUICK-REFERENCE.md`
* **Main Skills**: `./SKILL.md`
* **Session Management**: `./SESSION-WORKFLOW.md`
* **Contracts**: `./CONTRACT-REFERENCE.md`
* **Code Patterns**: `./PATTERNS-REFERENCE.md`

---

**Remember**: Document decisions and public APIs, not every line of code. Focus on WHY, not WHAT.
