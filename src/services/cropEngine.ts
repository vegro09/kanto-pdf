import { PDFDocument } from 'pdf-lib';

export interface CropBoxRegion {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface CropOptions {
  cropBox?: CropBoxRegion;
  applyToAllPages?: boolean;
  targetPageIndex?: number;
}

export interface CropResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  croppedPagesCount: number;
  totalPages: number;
  cropBoxApplied: {
    x: number;
    y: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface CropFileValidation {
  isValid: boolean;
  error?: string;
  arrayBuffer?: ArrayBuffer;
  pageCount?: number;
}

/**
 * Validates the uploaded file for Crop PDF operations.
 */
export async function validateCropFile(
  file: File,
  isArabic: boolean = false
): Promise<CropFileValidation> {
  const MAX_BYTES = 150 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return {
      isValid: false,
      error: isArabic
        ? 'حجم الملف يتجاوز الحد المسموح به (150 ميجابايت).'
        : 'File size exceeds maximum memory threshold (150 MB).',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic ? 'الملف المحدد فارغ (0 بايت).' : 'Selected file is empty (0 bytes).',
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic ? 'مستند PDF لا يحتوي على أي صفحات.' : 'PDF document contains zero pages.',
      };
    }

    return {
      isValid: true,
      arrayBuffer,
      pageCount,
    };
  } catch (err) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: ${err instanceof Error ? err.message : String(err)}`
        : `Could not load PDF: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * METADATA CROPBOX & COORDINATE INVERSION ALGORITHM
 * 
 * Performs purely structural metadata cropping using page.setCropBox() without
 * rasterizing the document to preserve 100% vector sharpness and text selectability.
 */
export async function executeCrop(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  options: CropOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<CropResult> {
  const {
    cropBox = { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 },
    applyToAllPages = true,
    targetPageIndex = 0,
  } = options;

  onProgress?.(15, isArabic ? 'جاري تحميل بنية المستند والهيكل الشعاعي...' : 'Loading PDF vector structures...');

  // Step C: Load original document buffer (zero rasterization)
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  if (totalPages === 0) {
    throw new Error(isArabic ? 'المستند فارغ.' : 'PDF document contains no pages.');
  }

  onProgress?.(45, isArabic ? 'جاري حساب إحداثيات القص المعكوسة (Y-Axis Inversion)...' : 'Calculating inverted Y-axis crop coordinates...');

  // Normalize percentage bounds (clamped to 0..100)
  const clampedXPercent = Math.max(0, Math.min(95, cropBox.xPercent));
  const clampedYPercent = Math.max(0, Math.min(95, cropBox.yPercent));
  const clampedWPercent = Math.max(5, Math.min(100 - clampedXPercent, cropBox.widthPercent));
  const clampedHPercent = Math.max(5, Math.min(100 - clampedYPercent, cropBox.heightPercent));

  let croppedCount = 0;
  let sampleCropBoxPts = { x: 0, y: 0, width: 0, height: 0, unit: 'pt' };

  for (let i = 0; i < totalPages; i++) {
    if (!applyToAllPages && i !== targetPageIndex) {
      continue;
    }

    const page = pages[i];

    // Step D: Read real page dimensions dynamically
    const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

    // Step E: Translate UI percentage bounds to real PDF point dimensions
    const realCropX = (clampedXPercent / 100) * pdfPageWidth;
    const realCropY = (clampedYPercent / 100) * pdfPageHeight;
    const realCropWidth = (clampedWPercent / 100) * pdfPageWidth;
    const realCropHeight = (clampedHPercent / 100) * pdfPageHeight;

    // Step F: Invert the Y-Axis (CRITICAL: PDF origin is Bottom-Left, DOM is Top-Left)
    // Formula: pdfCropY = pdfPageHeight - realCropY - realCropHeight
    const pdfCropY = pdfPageHeight - realCropY - realCropHeight;

    // Step G: Apply Structural Crop directly onto PDF metadata
    page.setCropBox(realCropX, pdfCropY, realCropWidth, realCropHeight);

    if (i === 0 || i === targetPageIndex) {
      sampleCropBoxPts = {
        x: Math.round(realCropX * 100) / 100,
        y: Math.round(pdfCropY * 100) / 100,
        width: Math.round(realCropWidth * 100) / 100,
        height: Math.round(realCropHeight * 100) / 100,
        unit: 'pt',
      };
    }

    croppedCount++;
  }

  onProgress?.(80, isArabic ? 'جاري تطبيق البيانات الوصفية وحفظ المستند...' : 'Baking CropBox metadata and finalizing...');

  // Step H: Save vector document without rasterization
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  const outputBlob = new Blob([new Uint8Array(outputBytes).buffer as ArrayBuffer], {
    type: 'application/pdf',
  });

  onProgress?.(100, isArabic ? 'اكتمل قص المستند بنجاح!' : 'PDF cropping completed successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_cropped.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    croppedPagesCount: croppedCount,
    totalPages,
    cropBoxApplied: sampleCropBoxPts,
  };
}
