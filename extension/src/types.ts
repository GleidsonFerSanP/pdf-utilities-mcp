export interface PDFReadResult {
  text: string;
  pages: number;
  info: PDFInfo;
}

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

export interface PDFCreateResult {
  success: boolean;
  path: string;
  pages: number;
}

export interface PDFMergeResult {
  success: boolean;
  path: string;
  pages: number;
}

export interface PDFSplitResult {
  success: boolean;
  path: string;
  pages: number;
}

export interface PDFMetadataResult {
  success: boolean;
  path: string;
}

export interface PDFExtractResult {
  success: boolean;
  files: string[];
}
