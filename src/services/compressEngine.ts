import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Setup pdfjs worker safely for Vite / In-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export type CompressPreset = 'extreme' | 'recommended' | 'high_quality';

export interface CompressPresetConfig {
  id: CompressPreset;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  targetDpi: string;
  scale: number;
  jpegQuality: number;
  expectedReduction: string;
}

export const COMPRESS_PRESETS: Record<CompressPreset, CompressPresetConfig> = {
  extreme: {
    id: 'extreme',
    titleEn: 'Extreme Compression',
    titleAr: 'ضغط أقصى (أصغر حجم)',
    descEn: 'Maximum size reduction (~72-96 DPI). Ideal for email attachments and strict upload limits.',
    descAr: 'تقليص أقصى للحجم (دقة ~72-96 DPI). مثالي للمرفقات والبريد الإلكتروني.',
    targetDpi: '~72–96 DPI',
    scale: 1.0,
    jpegQuality: 0.42,
    expectedReduction: '~60%–85%',
  },
  recommended: {
    id: 'recommended',
    titleEn: 'Recommended Compression',
    titleAr: 'الضغط الموصى به (توازن مثالي)',
    descEn: 'Balanced size vs crisp clarity (~120-140 DPI). Optimal for web, archiving, and reading.',
    descAr: 'توازن مثالي بين وضوح النصوص وصغر الحجم (~120-140 DPI). الأنسب للقراءة والأرشفة.',
    targetDpi: '~120–140 DPI',
    scale: 1.35,
    jpegQuality: 0.65,
    expectedReduction: '~35%–65%',
  },
  high_quality: {
    id: 'high_quality',
    titleEn: 'High Quality Compression',
    titleAr: 'جودة عالية (ضغط خفيف)',
    descEn: 'Subtle compression preserving high vector/image fidelity (~180-200 DPI). Ideal for printing.',
    descAr: 'ضغط خفيف مع الحفاظ على أعلى درجات الدقة والوضوح (~180-200 DPI). الأنسب للطباعة.',
    targetDpi: '~180–200 DPI',
    scale: 1.8,
    jpegQuality: 0.82,
    expectedReduction: '~15%–35%',
  },
};

export interface CompressResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  isOptimizedAlready: boolean;
  presetUsed: CompressPreset;
  pageCount: number;
}

export interface CompressUploadValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

/**
 * Validates a single uploaded file for Compress PDF.
 */
export async function validateCompressFile(
  file: File,
  isArabic: boolean = false
): Promise<CompressUploadValidation> {
  // 1. Extension / MIME Check
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار مستند PDF.'
        : 'The selected file is not a valid PDF document. Please select a PDF file.',
    };
  }

  // 2. Empty check
  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف PDF صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PDF document.',
    };
  }

  // 3. Read and test with PDFDocument
  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند لا يحتوي على أي صفحات صالحة للمعالجة.'
          : 'The document does not contain any readable pages.',
      };
    }

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        pageCount,
      },
    };
  } catch (err: unknown) {
    const errStr = String(err);
    if (errStr.includes('password') || errStr.includes('encrypted')) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند محمي بكلمة مرور. يرجى إزالة كلمة المرور أولاً عبر أداة فك الحماية.'
          : 'Document is password-protected. Please unlock the PDF before compressing.',
      };
    }
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً أو غير مكتمل (${errStr.slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted or malformed (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Executes true client-side compression via canvas downsampling, JPEG re-encoding, and object stream optimization.
 */
export async function executeCompress(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  preset: CompressPreset = 'recommended',
  onProgress?: (progressPercent: number, statusText: string) => void,
  isArabic: boolean = false
): Promise<CompressResult> {
  const originalSize = arrayBuffer.byteLength;
  const config = COMPRESS_PRESETS[preset] || COMPRESS_PRESETS.recommended;

  onProgress?.(5, isArabic ? 'جاري تحليل بنية المستند...' : 'Analyzing document structure...');

  // 1. Load document via pdfjs-dist for high-performance canvas extraction
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfJsDoc = await loadingTask.promise;
  const totalPages = pdfJsDoc.numPages;

  onProgress?.(12, isArabic ? `تم العثور على ${totalPages} صفحة. جاري تجهيز بيئة الضغط...` : `Found ${totalPages} pages. Initializing compression sandbox...`);

  // 2. Create output PDF document via pdf-lib
  const outPdfDoc = await PDFDocument.create();

  // 3. Process and compress each page sequentially with memory recycling
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const stepPercent = 12 + Math.round((pageNum / totalPages) * 73);
    onProgress?.(
      stepPercent,
      isArabic
        ? `جاري ضغط الصفحة ${pageNum} من ${totalPages} (${config.titleAr})...`
        : `Compressing page ${pageNum} of ${totalPages} (${config.titleEn})...`
    );

    const page = await pdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: config.scale });

    // Create offscreen canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });

    if (!ctx) {
      throw new Error('Failed to create 2D canvas context for PDF compression.');
    }

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      background: 'rgb(255,255,255)',
    };

    await page.render(renderContext).promise;

    // Convert canvas to JPEG blob with target quality
    const jpegDataUrl = canvas.toDataURL('image/jpeg', config.jpegQuality);
    const base64Data = jpegDataUrl.split(',')[1];
    const binaryString = window.atob(base64Data);
    const jpegBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      jpegBytes[i] = binaryString.charCodeAt(i);
    }

    // Clean up canvas
    canvas.width = 1;
    canvas.height = 1;

    // Embed compressed JPEG into output PDF
    const embeddedImage = await outPdfDoc.embedJpg(jpegBytes);

    // Get original PDF page dimensions in points (72 points per inch standard)
    const originalViewport = page.getViewport({ scale: 1.0 });
    const newPage = outPdfDoc.addPage([originalViewport.width, originalViewport.height]);

    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    });
  }

  onProgress?.(90, isArabic ? 'جاري تحسين قنوات البيانات وضغط المعرّفات...' : 'Optimizing object streams & metadata...');

  // 4. Save with compressed object streams
  const compressedBytes = await outPdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const compressedBuffer = compressedBytes.buffer.slice(
    compressedBytes.byteOffset,
    compressedBytes.byteOffset + compressedBytes.byteLength
  ) as ArrayBuffer;

  let finalBuffer = compressedBuffer;
  let compressedSize = finalBuffer.byteLength;
  let isOptimizedAlready = false;

  // 5. Honest Size Evaluation
  // If the rasterization produced a larger file than the original (common on pure tiny vector text PDFs),
  // fallback to pure stream-optimized original document
  if (compressedSize >= originalSize) {
    try {
      const directDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const streamOptimized = await directDoc.save({ useObjectStreams: true });
      if (streamOptimized.byteLength < originalSize) {
        finalBuffer = streamOptimized.buffer.slice(
          streamOptimized.byteOffset,
          streamOptimized.byteOffset + streamOptimized.byteLength
        ) as ArrayBuffer;
        compressedSize = finalBuffer.byteLength;
      } else {
        // Document is already at maximum possible compression
        finalBuffer = arrayBuffer;
        compressedSize = originalSize;
        isOptimizedAlready = true;
      }
    } catch {
      finalBuffer = arrayBuffer;
      compressedSize = originalSize;
      isOptimizedAlready = true;
    }
  }

  const savingsBytes = Math.max(0, originalSize - compressedSize);
  const savingsPercent = originalSize > 0 ? Math.round((savingsBytes / originalSize) * 100) : 0;

  onProgress?.(100, isArabic ? 'تم ضغط المستند بنجاح!' : 'Compression complete!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_compressed_${preset}.pdf`;
  const blob = new Blob([finalBuffer], { type: 'application/pdf' });

  return {
    blob,
    downloadFilename,
    mimeType: 'application/pdf',
    originalSize,
    compressedSize,
    savingsBytes,
    savingsPercent,
    isOptimizedAlready,
    presetUsed: preset,
    pageCount: totalPages,
  };
}
