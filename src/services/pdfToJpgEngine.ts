import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Safely configure pdfjs worker
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch {
    // safe fallback
  }
}

export interface PdfToJpgValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfToJpgResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  isZipBundle: boolean;
  imageCount: number;
}

export interface PdfToJpgOptions {
  scale?: number; // 1.5, 2.0 (High), 3.0 (Ultra HD)
  quality?: number; // 0.8 - 1.0 (Default 0.92)
}

/**
 * Validates a PDF file for JPG conversion.
 */
export async function validatePdfToJpgFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfToJpgValidation> {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.pdf')) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار ملف PDF.'
        : 'The selected file is not a valid PDF document.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار مستند PDF صالح.'
        : 'The selected file is empty (0 bytes).',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند لا يحتوي على أي صفحات صالحة للتحويل.'
          : 'The document contains no pages to convert.',
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
    return {
      isValid: false,
      error: isArabic
        ? `تعذر فتح ملف PDF: (${errStr.slice(0, 80)}).`
        : `Unable to open PDF: (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Executes PDF to JPG conversion.
 * Step A: Load PDF via pdfjs-dist.
 * Step B: Initialize JSZip if multi-page.
 * Step C & D: Render each page to hidden canvas at high-resolution scale (2.0 - 3.0).
 * Step E: Convert canvas to JPEG blob with solid white background.
 * Step F & G: Single page -> direct .jpg download; Multi-page -> single bundled .zip download.
 */
export async function executePdfToJpg(
  originalArrayBuffer: ArrayBuffer,
  originalFilename: string,
  options: PdfToJpgOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabicLang: boolean = false
): Promise<PdfToJpgResult> {
  const scale = options.scale || 2.5; // High-DPI Retina scale
  const quality = options.quality || 0.92;

  onProgress?.(10, isArabicLang ? 'جاري قراءة بنية صفحات PDF...' : 'Reading PDF document structure...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(originalArrayBuffer.slice(0)),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  if (totalPages === 0) {
    throw new Error(isArabicLang ? 'المستند لا يحتوي على صفحات صالحة.' : 'The document contains no valid pages.');
  }

  const cleanBase = originalFilename.replace(/\.pdf$/i, '').trim() || 'kanto_converted';
  const isMultiPage = totalPages > 1;
  const zip = isMultiPage ? new JSZip() : null;

  let singlePageBlob: Blob | null = null;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const progressPercent = Math.round(15 + (pageNum / totalPages) * 70);
    onProgress?.(
      progressPercent,
      isArabicLang
        ? `جاري تحويل الصفحة ${pageNum} من ${totalPages} بدقة فائقة...`
        : `Rendering page ${pageNum} of ${totalPages} at Ultra-HD...`
    );

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Failed to create canvas 2D rendering context.');
    }

    // Fill background with solid white to avoid black background on transparent PDF pages
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page to canvas
    await page.render({
      canvasContext: ctx,
      viewport,
      intent: 'print',
    }).promise;

    // Convert canvas to JPEG blob
    const pageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => {
          if (b) resolve(b);
          else reject(new Error(`Failed to encode page ${pageNum} to JPEG`));
        },
        'image/jpeg',
        quality
      );
    });

    if (isMultiPage && zip) {
      const paddedNum = String(pageNum).padStart(totalPages >= 10 ? 2 : 1, '0');
      const filenameInZip = `${cleanBase}_page_${paddedNum}.jpg`;
      zip.file(filenameInZip, pageBlob);
    } else {
      singlePageBlob = pageBlob;
    }
  }

  // Logic Fork: Single image vs ZIP bundle
  if (isMultiPage && zip) {
    onProgress?.(90, isArabicLang ? 'جاري تجميع وحزم الصور في ملف ZIP واحد...' : 'Bundling images into single ZIP archive...');

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      metadata => {
        const zipProgress = Math.round(90 + (metadata.percent / 100) * 8);
        onProgress?.(
          zipProgress,
          isArabicLang
            ? `جاري ضغط أرشيف ZIP (${Math.round(metadata.percent)}%)...`
            : `Compressing ZIP bundle (${Math.round(metadata.percent)}%)...`
        );
      }
    );

    onProgress?.(100, isArabicLang ? 'اكتمل التحويل والتجميع في ملف ZIP بنجاح!' : 'PDF to JPG conversion complete!');

    return {
      blob: zipBlob,
      downloadFilename: `${cleanBase}_images.zip`,
      mimeType: 'application/zip',
      fileSize: zipBlob.size,
      pageCount: totalPages,
      isZipBundle: true,
      imageCount: totalPages,
    };
  } else if (singlePageBlob) {
    onProgress?.(100, isArabicLang ? 'اكتمل تحويل الصفحة إلى صورة JPEG بنجاح!' : 'Page converted to JPEG successfully!');

    return {
      blob: singlePageBlob,
      downloadFilename: `${cleanBase}_page_1.jpg`,
      mimeType: 'image/jpeg',
      fileSize: singlePageBlob.size,
      pageCount: 1,
      isZipBundle: false,
      imageCount: 1,
    };
  } else {
    throw new Error('Conversion output failed to produce valid image data.');
  }
}
