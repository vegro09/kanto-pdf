import * as pdfjsLib from 'pdfjs-dist';
import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  PageOrientation,
} from 'docx';

// Setup pdfjs worker safely for Vite / In-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PdfToWordValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfToWordResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  totalPages: number;
}

/**
 * Validates an uploaded PDF document for Word conversion.
 */
export async function validatePdfToWordFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfToWordValidation> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار مستند PDF.'
        : 'The selected file is not a valid PDF document. Please select a PDF file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف PDF صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PDF document.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer.slice(0)),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند لا يحتوي على أي صفحات صالحة.'
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
          : 'Document is password-protected. Please unlock the PDF before converting.',
      };
    }
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً (${errStr.slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Converts PDF to Microsoft Word (.docx) using the bulletproof High-Fidelity Rasterization (Image-to-DOCX) algorithm.
 * Guarantees 100% visual layout, table, vector, and RTL (Arabic) text fidelity.
 */
export async function executePdfToWord(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PdfToWordResult> {
  // Step A: Load the user's PDF file using pdfjs-dist
  onProgress?.(5, isArabic ? 'جاري قراءة صفحات وبنية المستند...' : 'Loading PDF document & parsing pages...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Collection of Word Sections (one section per PDF page with 0 margins)
  const docxSections = [];

  // Step C: Loop through every page of the loaded PDF
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const stepPercent = 10 + Math.round((pageNum / totalPages) * 75);
    onProgress?.(
      stepPercent,
      isArabic
        ? `جاري تحويل وتضمين الصفحة ${pageNum} من ${totalPages} بدقة فائقة...`
        : `Rendering high-resolution page ${pageNum} of ${totalPages} into Word...`
    );

    const page = await pdfDoc.getPage(pageNum);

    // Step D: Render to offscreen canvas at high resolution (scale: 2.0+ for 150-200 DPI crisp quality)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to initialize 2D canvas context for page rendering.');
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Step E: Convert canvas to high-quality image buffer (JPEG 95% quality)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64Data = dataUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Step F & G: Calculate dimensions in points, dxa (1 pt = 20 dxa), and 96-DPI screen pixels
    // docx transforms ImageRun dimensions by multiplying width/height by 9525 EMUs (1 px = 9525 EMUs at 96 DPI).
    // Because PDF points are at 72 DPI (1 pt = 12700 EMUs), we scale: px = (pt * 96) / 72 = pt * 1.3333333333333333.
    // This gives an exact 1:1 match: px * 9525 = pt * 12700 = dxa * 635 EMUs.
    const origVp = page.getViewport({ scale: 1.0 });
    const ptWidth = origVp.width;
    const ptHeight = origVp.height;
    const dxaWidth = Math.round(ptWidth * 20);
    const dxaHeight = Math.round(ptHeight * 20);
    const imageWidthPx = (ptWidth * 96) / 72;
    const imageHeightPx = (ptHeight * 96) / 72;
    const isLandscape = ptWidth > ptHeight;

    // Add new section with 0 margin, exact page dimensions, and 1:1 scaled ImageRun
    docxSections.push({
      properties: {
        page: {
          size: {
            width: dxaWidth,
            height: dxaHeight,
            orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
          },
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            header: 0,
            footer: 0,
            gutter: 0,
          },
        },
      },
      children: [
        new Paragraph({
          spacing: {
            before: 0,
            after: 0,
            line: 240,
          },
          indent: {
            left: 0,
            right: 0,
            start: 0,
            end: 0,
          },
          children: [
            new ImageRun({
              data: bytes,
              transformation: {
                width: imageWidthPx,
                height: imageHeightPx,
              },
              type: 'jpg',
            }),
          ],
        }),
      ],
    });
  }

  onProgress?.(90, isArabic ? 'جاري تجميع حزمة مستند Word (.docx)...' : 'Compiling Word XML package (.docx)...');

  // Step B & H: Initialize Word Document with sections and compile via Packer
  const wordDoc = new Document({
    sections: docxSections,
  });

  const docxBlob = await Packer.toBlob(wordDoc);

  onProgress?.(100, isArabic ? 'اكتمل التحويل إلى Word بنجاح!' : 'High-fidelity Word conversion complete!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = cleanBase ? `${cleanBase}_converted.docx` : 'kanto-document.docx';

  return {
    blob: docxBlob,
    downloadFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: docxBlob.size,
    pageCount: totalPages,
    totalPages,
  };
}
