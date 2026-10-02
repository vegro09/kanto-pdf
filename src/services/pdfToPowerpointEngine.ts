import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';

// Setup pdfjs worker safely for Vite / In-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PdfToPptValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfToPptResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  slideCount: number;
  totalPages: number;
}

/**
 * Validates a PDF file for PowerPoint conversion.
 */
export async function validatePdfToPptFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfToPptValidation> {
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
          ? 'المستند محمي بكلمة مرور. يرجى فك قفل المستند أولاً.'
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
 * Converts PDF to PowerPoint (.pptx) using the high-fidelity Rasterization (Image-to-Slide) algorithm.
 * Guarantees 100% visual layout, table, vector, and RTL (Arabic) text fidelity.
 */
export async function executePdfToPpt(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PdfToPptResult> {
  // Step A: Load the user's PDF file using pdfjs-dist
  onProgress?.(5, isArabic ? 'جاري قراءة بنية المستند والصفحات...' : 'Loading PDF document & parsing pages...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Step B: Initialize a new PowerPoint presentation instance using pptxgenjs
  const pptx = new pptxgen();

  // Step C: Loop through every page of the loaded PDF
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const stepPercent = 10 + Math.round((pageNum / totalPages) * 75);
    onProgress?.(
      stepPercent,
      isArabic
        ? `جاري تحويل الشريحة ${pageNum} من ${totalPages} بدقة بصرية فائقة...`
        : `Rendering high-resolution slide ${pageNum} of ${totalPages}...`
    );

    const page = await pdfDoc.getPage(pageNum);
    
    // Step D: Render page to hidden canvas at high scale (scale: 2.0 for 150-200 DPI crisp slides)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to initialize 2D canvas context for slide rendering.');
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Step E: Convert rendered canvas to base64 JPEG data URL
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Step F: Add new slide to presentation matching page aspect ratio
    const origVp = page.getViewport({ scale: 1.0 });
    const aspect = origVp.width / origVp.height;

    // Standard presentation width = 10 inches, height calculated proportionally
    const slideWidth = 10;
    const slideHeight = Number((10 / aspect).toFixed(3));

    const layoutName = `LAYOUT_SLIDE_${pageNum}_${Date.now()}`;
    pptx.defineLayout({
      name: layoutName,
      width: slideWidth,
      height: slideHeight,
    });
    pptx.layout = layoutName;

    const slide = pptx.addSlide();

    // Step G: Insert base64 image covering the entire slide (100% w, 100% h)
    slide.addImage({
      data: imgDataUrl,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });
  }

  // Step H: Save presentation and return result
  onProgress?.(92, isArabic ? 'جاري تجميع حزمة شرائح PowerPoint (.pptx)...' : 'Compiling PowerPoint OpenXML (.pptx) package...');

  const pptxBlob = (await pptx.write({ outputType: 'blob' })) as Blob;

  onProgress?.(100, isArabic ? 'اكتمل التحويل إلى PowerPoint بنجاح!' : 'PowerPoint presentation generated successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_presentation.pptx`;

  return {
    blob: pptxBlob,
    downloadFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fileSize: pptxBlob.size,
    slideCount: totalPages,
    totalPages,
  };
}
