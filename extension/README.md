# PDF Utilities MCP

AI-powered PDF manipulation tools for GitHub Copilot Chat. Work with PDFs naturally through conversation - read, create, merge, split, and edit PDFs without leaving your editor.

## 🚀 Features

* **📖 Read PDFs**: Extract text content from any PDF file
* **📊 Get PDF Info**: Retrieve metadata, page count, file size, and more
* **✍️ Create PDFs**: Generate new PDFs from text with custom formatting
* **🔗 Merge PDFs**: Combine multiple PDF files into one
* **✂️ Split PDFs**: Extract specific pages or page ranges
* **📝 Update Metadata**: Modify PDF title, author, subject, and keywords
* **📄 Extract Pages**: Save individual pages as separate PDF files

All features are accessible through GitHub Copilot Chat with natural language commands!

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "PDF Utilities"
4. Click Install

### From VSIX File

1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Press Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
4. Type "Install from VSIX"
5. Select the downloaded file

## 🎯 Usage

Once installed, you can use PDF operations directly in GitHub Copilot Chat:

### Reading PDFs

```
You: "Read the PDF at /Users/name/Documents/report.pdf"
You: "What does contract.pdf say?"
You: "Extract text from pages 1-5 of document.pdf"
```

### Creating PDFs

```
You: "Create a PDF with this content: [your text]"
You: "Make a PDF from my meeting notes and save it as notes.pdf"
You: "Generate a PDF report with title 'Q1 Results'"
```

### Merging PDFs

```
You: "Merge report1.pdf and report2.pdf into final.pdf"
You: "Combine all PDFs in my Documents folder"
```

### Splitting PDFs

```
You: "Extract pages 1-10 from document.pdf"
You: "Split the first 5 pages into a separate file"
You: "Get pages 2, 4, and 6-10 from the report"
```

### Updating Metadata

```
You: "Change the PDF title to 'Annual Report 2024'"
You: "Update the author of contract.pdf to 'John Doe'"
```

### Extracting Pages

```
You: "Extract pages 1, 3, and 5 into separate files"
You: "Create individual PDFs for each page"
```

## 🛠️ Available Tools

This extension provides 7 powerful tools via Model Context Protocol (MCP):

1. **read_pdf** - Extract text from PDF files
2. **get_pdf_info** - Get metadata and information
3. **create_pdf** - Create new PDF documents
4. **merge_pdfs** - Combine multiple PDFs
5. **split_pdf** - Extract page ranges
6. **update_pdf_metadata** - Modify PDF metadata
7. **extract_pages** - Save pages as separate files

## ⚙️ Configuration

Access settings via: Code > Settings > Extensions > PDF Utilities

* `pdfUtilities.autoStart`: Auto-start MCP server on VS Code startup (default: true)
* `pdfUtilities.logLevel`: Logging level - error/warn/info/debug (default: info)
* `pdfUtilities.maxPdfSize`: Maximum PDF file size in MB (default: 50)

## 📋 Commands

* `PDF Utilities: Configure MCP` - Setup MCP server
* `PDF Utilities: Restart Server` - Restart the MCP server
* `PDF Utilities: Open Documentation` - View online documentation

Access commands via Command Palette (Cmd+Shift+P / Ctrl+Shift+P)

## 🔍 How It Works

This extension uses the Model Context Protocol (MCP) to provide PDF tools to AI assistants. When you ask GitHub Copilot to work with PDFs, it automatically uses these tools to:

1. Parse and understand your request
2. Call the appropriate PDF tool
3. Process the PDF file
4. Return results in a natural, conversational way

All powered by [pdf-lib](https://pdf-lib.js.org/) and [pdf-parse](https://www.npmjs.com/package/pdf-parse) for reliable, high-quality PDF processing.

## 🐛 Troubleshooting

### Tools not appearing in Copilot Chat

1. Check that the extension is activated (look for PDF Utilities in Extensions)
2. Open Output panel (View > Output) and select "PDF Utilities" from dropdown
3. Look for "MCP Server Definition Provider registered successfully"
4. If not found, run "PDF Utilities: Restart Server" command
5. Reload VS Code (Cmd+R / Ctrl+R)

### "File not found" errors

* Ensure you're using absolute paths (e.g.,  `/Users/name/file.pdf`)
* Check that the file actually exists at that location
* Verify file permissions

### "Invalid page range" errors

* Page numbers are 1-based (first page is 1, not 0)
* Use format: "1-5" for ranges, "1, 3, 5" for specific pages
* Ensure page numbers are within the document's page count

### Performance issues with large PDFs

* Check the file size (default limit: 50MB)
* Adjust `pdfUtilities.maxPdfSize` setting if needed
* Consider splitting very large PDFs before processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

* [GitHub Repository](https://github.com/GleidsonFerSanP/pdf-utilities-mcp)
* [Report Issues](https://github.com/GleidsonFerSanP/pdf-utilities-mcp/issues)
* [Model Context Protocol](https://modelcontextprotocol.io/)

## 🙏 Credits

Built with:
* [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
* [pdf-lib](https://pdf-lib.js.org/)
* [pdf-parse](https://www.npmjs.com/package/pdf-parse)

---

Made with ❤️ for the AI-assisted development community
