# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

* Node.js 20+
* VS Code 1.85+
* GitHub Copilot Chat

### Installation & Testing

```bash
# 1. Navigate to project
cd /Users/gleidsonfersanp/workspace/AI/pdf-utilities-mcp

# 2. Everything is already built! Just package the extension
cd extension
npm run package

# 3. Install in VS Code
# - Open VS Code
# - Press Cmd+Shift+P
# - Type "Install from VSIX"
# - Select: extension/pdf-utilities-1.0.0.vsix

# 4. Reload VS Code
# - Press Cmd+Shift+P
# - Type "Reload Window"

# 5. Verify installation
# - Open VS Code Output panel (Cmd+Shift+U)
# - Select "PDF Utilities" from dropdown
# - Look for "MCP Server Definition Provider registered successfully"
```

### Try It Out

Open GitHub Copilot Chat and try:

```
You: "Create a PDF with the text 'Hello World!' and save it as test.pdf in my Downloads folder"

You: "Read the PDF at /path/to/your/document.pdf"

You: "How many pages are in document.pdf?"

You: "Merge file1.pdf and file2.pdf into combined.pdf"

You: "Extract pages 1-5 from report.pdf"
```

### Commands Available

* `PDF Utilities: Configure MCP` - Setup configuration
* `PDF Utilities: Restart Server` - Restart MCP server
* `PDF Utilities: Open Documentation` - View docs

Access via Cmd+Shift+P

### Troubleshooting

**Tools not showing in Copilot?**
1. Check Output panel > "PDF Utilities"
2. Run "PDF Utilities: Restart Server"
3. Reload VS Code window

**Extension not activating?**
1. Check Extensions panel - should show "PDF Utilities"
2. Look for errors in Output panel
3. Verify VS Code version is 1.85+

**Need to rebuild?**

```bash
cd /Users/gleidsonfersanp/workspace/AI/pdf-utilities-mcp
npm run build
npm run copy-to-extension
cd extension
npm run compile
npm run package
```

## 📖 Available Tools

1. **read_pdf** - Extract text from PDFs
2. **get_pdf_info** - Get metadata and info
3. **create_pdf** - Create new PDFs from text
4. **merge_pdfs** - Combine multiple PDFs
5. **split_pdf** - Extract page ranges
6. **update_pdf_metadata** - Modify PDF metadata
7. **extract_pages** - Save pages separately

## 🎯 Example Workflows

### Reading a PDF

```
You: "What does contract.pdf say?"
AI: Uses read_pdf to extract and summarize content
```

### Creating Documentation

```
You: "Create a PDF with my project README and save it as docs.pdf"
AI: Uses create_pdf with formatting
```

### Merging Reports

```
You: "Combine Q1.pdf, Q2.pdf, Q3.pdf, and Q4.pdf into annual-report.pdf"
AI: Uses merge_pdfs to create single file
```

### Extracting Sections

```
You: "Extract the first 10 pages from report.pdf and save as summary.pdf"
AI: Uses split_pdf with page range
```

## 🔧 Configuration

Settings in VS Code (Code > Settings):

* `pdfUtilities.autoStart`: Auto-start server (default: true)
* `pdfUtilities.logLevel`: Logging level (default: info)
* `pdfUtilities.maxPdfSize`: Max file size in MB (default: 50)

## 📚 Documentation

* [User Guide](extension/README.md)
* [Developer Guide](README.md)
* [Build Guide](BUILD_PUBLISH_GUIDE.md)
* [Implementation Plan](IMPLEMENTATION_PLAN.md)

## 🚢 Publishing to Marketplace

When ready to publish:

```bash
cd extension
npm run publish
# Uses credentials from .env file
```

Requires:
* VS Code Publisher account
* Personal Access Token (PAT)
* Already configured in `.env`

## 🎉 You're Ready!

The extension is fully built and ready to use. Just install the VSIX and start working with PDFs in GitHub Copilot Chat!

For detailed information, see [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
