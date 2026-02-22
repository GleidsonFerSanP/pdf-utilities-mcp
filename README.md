# PDF Utilities MCP

A VS Code extension that provides comprehensive PDF manipulation tools for GitHub Copilot Chat via Model Context Protocol (MCP).

## Overview

This project combines an MCP server with a VS Code extension to enable AI assistants like GitHub Copilot to work with PDF files through natural language commands. Users can read, create, merge, split, and edit PDFs directly from their chat interface.

## Architecture

```
pdf-utilities-mcp/
├── src/                   # MCP Server implementation
│   ├── index.ts          # Server entry point and tool registration
│   └── pdf-tools.ts      # PDF manipulation utilities
├── extension/            # VS Code Extension
│   ├── src/
│   │   ├── extension.ts # Extension activation and MCP integration
│   │   └── types.ts     # TypeScript type definitions
│   ├── resources/
│   │   └── instructions/ # Copilot Chat instruction files
│   └── mcp-server/      # Built MCP server (copied from ../dist)
└── dist/                # Compiled MCP server output
```

## Features

* 📖 **Read PDFs**: Extract text content with optional page range selection
* 📊 **Get Info**: Retrieve metadata (pages, title, author, size, etc.)
* ✍️ **Create PDFs**: Generate new PDFs from text with formatting options
* 🔗 **Merge**: Combine multiple PDF files into one
* ✂️ **Split**: Extract specific pages or ranges
* 📝 **Update Metadata**: Modify title, author, subject, keywords
* 📄 **Extract Pages**: Save individual pages as separate files

## Installation

### For Users

Install from VS Code Marketplace:
1. Open VS Code
2. Search for "PDF Utilities" in Extensions
3. Click Install

### For Developers

```bash
# Clone the repository
git clone https://github.com/GleidsonFerSanP/pdf-utilities-mcp.git
cd pdf-utilities-mcp

# Install MCP server dependencies
npm install

# Build MCP server
npm run build

# Install extension dependencies
cd extension
npm install

# Build extension
npm run compile

# Copy MCP server to extension
cd ..
npm run copy-to-extension
```

## Development

### Project Structure

**MCP Server** ( `src/` ):
* Uses @modelcontextprotocol/sdk for standardized tool interface
* Implements 7 PDF tools using pdf-lib and pdf-parse
* Runs as Node.js process via stdio transport

**VS Code Extension** ( `extension/` ):
* Registers MCP server with VS Code's lm.registerMcpServerDefinitionProvider
* Provides commands for configuration and server management
* Includes chat instructions for optimal Copilot integration

### Building

```bash
# Build MCP server
npm run build

# Build extension
cd extension
npm run compile

# Copy server to extension folder
cd ..
npm run copy-to-extension
```

### Testing

```bash
# Test MCP server directly
node dist/index.js

# Package extension for testing
cd extension
npm run package  # Creates .vsix file

# Install .vsix in VS Code for testing
# Extensions > ... > Install from VSIX
```

### Development Workflow

1. Make changes to MCP server in `src/`
2. Run `npm run build` to compile
3. Run `npm run copy-to-extension` to update extension
4. Reload VS Code window to test changes
5. Check logs in Output panel > "PDF Utilities"

## Publishing

### Prerequisites

1. Create VS Code Publisher account at https://marketplace.visualstudio.com/
2. Generate Personal Access Token (PAT)
3. Update `extension/.env` with your PAT

### Publish Steps

```bash
# Build everything
npm run build
cd extension
npm run compile
cd ..
npm run copy-to-extension

# Package extension
cd extension
npm run package

# Verify the .vsix file works
# Install it manually in VS Code and test

# Publish to marketplace
npm run publish
```

### Version Management

Update version in both:
* `package.json` (root)
* `extension/package.json`

Follow semantic versioning: MAJOR. MINOR. PATCH

## Configuration

### Extension Settings

* `pdfUtilities.autoStart`: Auto-start MCP server (default: true)
* `pdfUtilities.logLevel`: Logging verbosity (default: info)
* `pdfUtilities.maxPdfSize`: Maximum file size in MB (default: 50)

### MCP Server Configuration

The MCP server is configured via the extension and doesn't require separate configuration.

## API Documentation

### Tool: read_pdf

Extract text from PDF file.

**Parameters:**
* `filePath` (string, required): Absolute path to PDF
* `pageRange` (string, optional): Pages to extract (e.g., "1-5", "1, 3, 5-10")

**Returns:**

```typescript
{
  text: string;
  pages: number;
  info: PDFInfo;
}
```

### Tool: get_pdf_info

Get PDF metadata and information.

**Parameters:**
* `filePath` (string, required): Absolute path to PDF

**Returns:**

```typescript
{
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  fileSize: number;
  filePath: string;
}
```

### Tool: create_pdf

Create new PDF from text content.

**Parameters:**
* `content` (string, required): Text content
* `outputPath` (string, required): Save location
* `options` (object, optional): Formatting options
  + `title`,  `author`,  `subject` (string): Metadata
  + `fontSize` (number): Text size (default: 12)
  + `pageSize` (string): Page size (default: "A4")

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  pages: number;
}
```

### Tool: merge_pdfs

Combine multiple PDFs.

**Parameters:**
* `filePaths` (string[], required): PDFs to merge
* `outputPath` (string, required): Output location

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  pages: number;
}
```

### Tool: split_pdf

Extract pages to new PDF.

**Parameters:**
* `filePath` (string, required): Source PDF
* `pageRange` (string, required): Pages to extract
* `outputPath` (string, required): Output location

**Returns:**

```typescript
{
  success: boolean;
  path: string;
  pages: number;
}
```

### Tool: update_pdf_metadata

Modify PDF metadata.

**Parameters:**
* `filePath` (string, required): PDF to update
* `metadata` (object, required): Fields to update
  + `title`,  `author`,  `subject`,  `keywords` (string)
* `outputPath` (string, optional): Save location (defaults to overwrite)

**Returns:**

```typescript
{
  success: boolean;
  path: string;
}
```

### Tool: extract_pages

Extract pages to separate files.

**Parameters:**
* `filePath` (string, required): Source PDF
* `pages` (number[], required): Page numbers to extract
* `outputDir` (string, required): Output directory
* `prefix` (string, optional): Filename prefix (default: "page")

**Returns:**

```typescript
{
  success: boolean;
  files: string[];
}
```

## Troubleshooting

### MCP Server Not Starting

Check Output panel:

```
View > Output > Select "PDF Utilities"
```

Look for initialization messages. If server fails:
1. Verify `mcp-server/index.js` exists in extension folder
2. Run rebuild: `npm run build && npm run copy-to-extension`
3. Reload VS Code

### Tools Not Available in Copilot

1. Ensure extension is activated (check Extensions panel)
2. Verify MCP API is available (requires VS Code 1.85+)
3. Check that Copilot Chat is enabled
4. Restart Copilot: Command Palette > "GitHub Copilot: Restart Language Server"

### Build Errors

Common issues:
* **TypeScript errors**: Run `npm install` in both root and extension folders
* **Missing dependencies**: `npm install` in correct directory
* **Path issues**: Use `npm run copy-to-extension` to sync files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

Please follow existing code style and conventions.

## License

MIT License - see LICENSE file for details.

## Support

* [GitHub Issues](https://github.com/GleidsonFerSanP/pdf-utilities-mcp/issues)
* [Documentation](https://github.com/GleidsonFerSanP/pdf-utilities-mcp#readme)

## Credits

* Built with [Model Context Protocol](https://modelcontextprotocol.io/)
* PDF processing by [pdf-lib](https://pdf-lib.js.org/) and [pdf-parse](https://www.npmjs.com/package/pdf-parse)
* Icon design: Custom SVG

---

**Note**: This project requires GitHub Copilot Chat and VS Code 1.85+ with MCP support.
