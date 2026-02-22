# Changelog

All notable changes to the PDF Utilities extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-22

### Added

* Initial release of PDF Utilities MCP extension
* MCP server with 7 PDF manipulation tools
* Integration with GitHub Copilot Chat
* Tool: read_pdf - Extract text from PDF files
* Tool: get_pdf_info - Get PDF metadata and information
* Tool: create_pdf - Create new PDFs from text
* Tool: merge_pdfs - Combine multiple PDFs
* Tool: split_pdf - Extract page ranges
* Tool: update_pdf_metadata - Modify PDF metadata
* Tool: extract_pages - Save pages as separate files
* VS Code commands for configuration and management
* Comprehensive documentation and usage instructions
* Chat instructions for optimal Copilot integration
* Support for A4, Letter, Legal, A3, A5 page sizes
* Configurable settings (autoStart, logLevel, maxPdfSize)
* Error handling and logging
* Welcome message for first-time users

### Technical Details

* Built with Model Context Protocol SDK 1.0.0
* PDF processing using pdf-lib 1.17.1 and pdf-parse 1.1.1
* TypeScript implementation with strict mode
* Cross-platform support (Windows, macOS, Linux)
* MCP registration via VS Code lm API

### Documentation

* User guide in extension README
* Developer documentation in project README
* Detailed implementation plan for AI agents
* Troubleshooting guide
* API documentation for all tools
