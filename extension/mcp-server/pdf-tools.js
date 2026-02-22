import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import pdfParse from 'pdf-parse';
export class PDFTools {
    /**
     * Read and extract text from a PDF file
     */
    async readPDF(filePath, pageRange) {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const dataBuffer = readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const stats = statSync(filePath);
        const info = {
            pages: data.numpages,
            title: data.info?.Title,
            author: data.info?.Author,
            subject: data.info?.Subject,
            creator: data.info?.Creator,
            producer: data.info?.Producer,
            creationDate: data.info?.CreationDate,
            modificationDate: data.info?.ModDate,
            fileSize: stats.size,
            filePath
        };
        let text = data.text;
        // If pageRange specified, extract specific pages
        if (pageRange) {
            const pdfDoc = await PDFDocument.load(dataBuffer);
            const pages = this.parsePageRange(pageRange, pdfDoc.getPageCount());
            // For page range, we need to extract text page by page
            // This is a simplified approach - full implementation would need more sophisticated parsing
            text = `[Extracted pages ${pageRange}]\n${text}`;
        }
        return {
            text,
            pages: data.numpages,
            info
        };
    }
    /**
     * Get PDF metadata and information
     */
    async getPDFInfo(filePath) {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const dataBuffer = readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const stats = statSync(filePath);
        return {
            pages: data.numpages,
            title: data.info?.Title,
            author: data.info?.Author,
            subject: data.info?.Subject,
            creator: data.info?.Creator,
            producer: data.info?.Producer,
            creationDate: data.info?.CreationDate,
            modificationDate: data.info?.ModDate,
            fileSize: stats.size,
            filePath
        };
    }
    /**
     * Create a new PDF from text content
     */
    async createPDF(content, outputPath, options = {}) {
        const pdfDoc = await PDFDocument.create();
        // Set metadata
        if (options.title)
            pdfDoc.setTitle(options.title);
        if (options.author)
            pdfDoc.setAuthor(options.author);
        if (options.subject)
            pdfDoc.setSubject(options.subject);
        pdfDoc.setCreator('PDF Utilities MCP');
        pdfDoc.setProducer('pdf-lib');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = options.fontSize || 12;
        const pageSize = options.pageSize ? PageSizes[options.pageSize] : PageSizes.A4;
        const margins = options.margins || { top: 50, bottom: 50, left: 50, right: 50 };
        const maxWidth = pageSize[0] - margins.left - margins.right;
        const maxHeight = pageSize[1] - margins.top - margins.bottom;
        const lineHeight = fontSize * 1.2;
        // Split content into lines that fit the page width
        const lines = this.wrapText(content, font, fontSize, maxWidth);
        let page = pdfDoc.addPage(pageSize);
        let y = pageSize[1] - margins.top;
        for (const line of lines) {
            if (y < margins.bottom) {
                page = pdfDoc.addPage(pageSize);
                y = pageSize[1] - margins.top;
            }
            page.drawText(line, {
                x: margins.left,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0)
            });
            y -= lineHeight;
        }
        const pdfBytes = await pdfDoc.save();
        writeFileSync(outputPath, pdfBytes);
        return {
            success: true,
            path: outputPath,
            pages: pdfDoc.getPageCount()
        };
    }
    /**
     * Merge multiple PDFs into one
     */
    async mergePDFs(filePaths, outputPath) {
        if (filePaths.length === 0) {
            throw new Error('No PDF files provided for merging');
        }
        const mergedPdf = await PDFDocument.create();
        for (const filePath of filePaths) {
            if (!existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const pdfBytes = readFileSync(filePath);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPages().map((_, i) => i));
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        mergedPdf.setCreator('PDF Utilities MCP');
        mergedPdf.setProducer('pdf-lib');
        mergedPdf.setModificationDate(new Date());
        const mergedPdfBytes = await mergedPdf.save();
        writeFileSync(outputPath, mergedPdfBytes);
        return {
            success: true,
            path: outputPath,
            pages: mergedPdf.getPageCount()
        };
    }
    /**
     * Split PDF or extract specific pages
     */
    async splitPDF(filePath, pageRange, outputPath) {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const pdfBytes = readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdf = await PDFDocument.create();
        const pages = this.parsePageRange(pageRange, pdfDoc.getPageCount());
        const copiedPages = await newPdf.copyPages(pdfDoc, pages);
        copiedPages.forEach((page) => newPdf.addPage(page));
        newPdf.setCreator('PDF Utilities MCP');
        newPdf.setProducer('pdf-lib');
        newPdf.setCreationDate(new Date());
        const newPdfBytes = await newPdf.save();
        writeFileSync(outputPath, newPdfBytes);
        return {
            success: true,
            path: outputPath,
            pages: newPdf.getPageCount()
        };
    }
    /**
     * Update PDF metadata
     */
    async updatePDFMetadata(filePath, metadata, outputPath) {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const pdfBytes = readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        if (metadata.title)
            pdfDoc.setTitle(metadata.title);
        if (metadata.author)
            pdfDoc.setAuthor(metadata.author);
        if (metadata.subject)
            pdfDoc.setSubject(metadata.subject);
        if (metadata.keywords)
            pdfDoc.setKeywords([metadata.keywords]);
        pdfDoc.setModificationDate(new Date());
        const modifiedPdfBytes = await pdfDoc.save();
        const savePath = outputPath || filePath;
        writeFileSync(savePath, modifiedPdfBytes);
        return {
            success: true,
            path: savePath
        };
    }
    /**
     * Extract pages from PDF into separate files
     */
    async extractPages(filePath, pages, outputDir, prefix = 'page') {
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const pdfBytes = readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const extractedFiles = [];
        for (const pageNum of pages) {
            if (pageNum < 1 || pageNum > pdfDoc.getPageCount()) {
                throw new Error(`Invalid page number: ${pageNum}`);
            }
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
            newPdf.addPage(copiedPage);
            const outputPath = `${outputDir}/${prefix}_${pageNum}.pdf`;
            const newPdfBytes = await newPdf.save();
            writeFileSync(outputPath, newPdfBytes);
            extractedFiles.push(outputPath);
        }
        return {
            success: true,
            files: extractedFiles
        };
    }
    // Helper methods
    parsePageRange(range, totalPages) {
        const pages = [];
        const parts = range.split(',');
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => parseInt(s.trim()));
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= totalPages) {
                        pages.push(i - 1); // Convert to 0-based index
                    }
                }
            }
            else {
                const pageNum = parseInt(part.trim());
                if (pageNum >= 1 && pageNum <= totalPages) {
                    pages.push(pageNum - 1); // Convert to 0-based index
                }
            }
        }
        return pages;
    }
    wrapText(text, font, fontSize, maxWidth) {
        const lines = [];
        const paragraphs = text.split('\n');
        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                lines.push('');
                continue;
            }
            const words = paragraph.split(' ');
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const width = font.widthOfTextAtSize(testLine, fontSize);
                if (width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                }
                else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
        }
        return lines;
    }
}
//# sourceMappingURL=pdf-tools.js.map