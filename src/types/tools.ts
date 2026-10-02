export type ToolCategory = 
  | 'all' 
  | 'organize' 
  | 'convert-to' 
  | 'convert-from' 
  | 'security';

export interface ToolDef {
  id: string;
  key: string;
  nameKey: string;
  descKey: string;
  category: ToolCategory;
  badge?: 'HOT' | 'NEW' | 'PRO' | 'ISO' | 'POPULAR';
  icon: string;
  acceptedFileTypes: string[];
  maxFiles: number;
}

export interface PdfPageItem {
  pageNumber: number;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  isDeleted: boolean;
  thumbnailUrl?: string;
  sourceFileIndex: number;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  pages: PdfPageItem[];
}

export type ScreenState = 'catalog' | 'upload' | 'workspace' | 'download' | 'privacy' | 'terms';

export interface ToolActionParams {
  splitRanges?: string;
  splitMode?: 'ranges' | 'extract_all' | 'chunks';
  chunkSize?: number;
  compressPreset?: 'extreme' | 'recommended' | 'high_quality';
  targetFormat?: 'docx' | 'pptx' | 'xlsx' | 'jpg' | 'png' | 'txt' | 'html';
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkRotation?: number;
  watermarkFontSize?: number;
  watermarkColor?: string;
  watermarkPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  pageNumberPosition?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  pageNumberFormat?: 'standard' | 'page_of_total' | 'page_x_of_y' | 'x_of_y' | 'page_x' | 'roman';
  pageNumberStart?: number;
  pageNumberFontSize?: number;
  pageNumberMargin?: number;
  pageNumberExcludeFirstPage?: boolean;
  password?: string;
  ownerPassword?: string;
  protectPassword?: string;
  protectConfirmPassword?: string;
  protectAllowPrinting?: boolean;
  protectAllowCopying?: boolean;
  rotateDegrees?: number;
  aiPrompt?: string;
  aiLanguage?: 'en' | 'ar';
  cropMargin?: { top: number; right: number; bottom: number; left: number };
  cropMarginPercent?: number;
  cropRegion?: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number };
  cropApplyToAllPages?: boolean;
  formFieldValues?: Record<string, string | boolean>;
  signatureType?: 'draw' | 'type' | 'upload';
  signatureDataUrl?: string;
  signaturePlacementMode?: 'current' | 'last' | 'all' | 'custom';
  signatureCustomPages?: number[];
  signaturePosition?: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number };
  signatureTargetPage?: number;
  encryptionType?: 'none' | 'owner_restrictions' | 'open_password';
  repairIssues?: string[];
  repairAttempt?: boolean;
  redactionBoxes?: Array<{
    id: string;
    pageNumber: number;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    color?: 'black' | 'white';
  }>;
  redactionColor?: 'black' | 'white';
  ocrLanguage?: 'ar' | 'en' | 'ar+en';
  jpgScale?: number;
  jpgQuality?: number;
  jpgPageSizingMode?: 'original' | 'a4_fit';
  htmlMode?: 'url' | 'code';
  htmlUrl?: string;
  htmlContent?: string;
  htmlPageSize?: 'a4' | 'letter' | 'legal';
  htmlOrientation?: 'portrait' | 'landscape';
  htmlPrintBackground?: boolean;
  scanFilterMode?: ScanFilterMode;
  scanThreshold?: number;
  scanPageSize?: 'original' | 'a4_fit';
  pdfaLevel?: '1b' | '2b' | '3b';
}

export type ScanFilterMode = 'bw_threshold' | 'color_clean' | 'grayscale_enhanced' | 'original';

export interface ScannedPageItem {
  id: string;
  originalDataUrl: string;
  processedDataUrl: string;
  width: number;
  height: number;
  filterMode: ScanFilterMode;
  threshold: number;
  rotation: number;
}

export type PdfFormFieldType = 'text' | 'checkbox' | 'dropdown' | 'radio' | 'button' | 'unknown';

export interface FormFieldItem {
  id: string;
  name: string;
  type: PdfFormFieldType;
  value: string | boolean;
  defaultValue?: string | boolean;
  options?: string[];
  isReadOnly?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
}

export interface ProcessResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  originalSize?: number;
  compressedSize?: number;
  savingsPercent?: number;
  isOptimizedAlready?: boolean;
  unlockedType?: 'none' | 'owner_restrictions' | 'open_password';
  isAlreadyHealthy?: boolean;
  pageCount?: number;
  slideCount?: number;
  sheetCount?: number;
  isZipBundle?: boolean;
  imageCount?: number;
  previewUrl?: string;
  textOutput?: string;
  outputSummary?: {
    filename: string;
    pageCount: number;
    rangeText: string;
    blob: Blob;
  }[];
}
