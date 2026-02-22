import { PageSizes } from 'pdf-lib';
export interface PDFInfo {
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
export interface PDFTextContent {
    text: string;
    pages: number;
    info: PDFInfo;
}
export interface CreatePDFOptions {
    title?: string;
    author?: string;
    subject?: string;
    fontSize?: number;
    pageSize?: keyof typeof PageSizes;
    margins?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
export declare class PDFTools {
    /**
     * Read and extract text from a PDF file
     */
    readPDF(filePath: string, pageRange?: string): Promise<PDFTextContent>;
    /**
     * Get PDF metadata and information
     */
    getPDFInfo(filePath: string): Promise<PDFInfo>;
    /**
     * Create a new PDF from text content
     */
    createPDF(content: string, outputPath: string, options?: CreatePDFOptions): Promise<{
        success: boolean;
        path: string;
        pages: number;
    }>;
    /**
     * Merge multiple PDFs into one
     */
    mergePDFs(filePaths: string[], outputPath: string): Promise<{
        success: boolean;
        path: string;
        pages: number;
    }>;
    /**
     * Split PDF or extract specific pages
     */
    splitPDF(filePath: string, pageRange: string, outputPath: string): Promise<{
        success: boolean;
        path: string;
        pages: number;
    }>;
    /**
     * Update PDF metadata
     */
    updatePDFMetadata(filePath: string, metadata: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
    }, outputPath?: string): Promise<{
        success: boolean;
        path: string;
    }>;
    /**
     * Extract pages from PDF into separate files
     */
    extractPages(filePath: string, pages: number[], outputDir: string, prefix?: string): Promise<{
        success: boolean;
        files: string[];
    }>;
    private parsePageRange;
    private wrapText;
}
//# sourceMappingURL=pdf-tools.d.ts.map