import { PDFDocument, rgb } from 'pdf-lib';

export interface TextAnnotation {
  id: string;
  type: 'text';
  pageIndex: number;
  uiX: number; // UI pixel coordinate from top-left
  uiY: number; // UI pixel coordinate from top-left
  width: number; // UI pixel width
  height: number; // UI pixel height
  text: string;
  fontSize: number; // pt
  fontColor: string; // hex
  backgroundColor?: string;
  isBold?: boolean;
}

export interface RectAnnotation {
  id: string;
  type: 'rect';
  pageIndex: number;
  uiX: number;
  uiY: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
}

export interface DrawingAnnotation {
  id: string;
  type: 'draw';
  pageIndex: number;
  points: Array<{ x: number; y: number }>;
  strokeColor: string;
  strokeWidth: number;
}

export interface HighlightAnnotation {
  id: string;
  type: 'highlight';
  pageIndex: number;
  uiX: number;
  uiY: number;
  width: number;
  height: number;
  color: string;
}

export type PdfAnnotation =
  | TextAnnotation
  | RectAnnotation
  | DrawingAnnotation
  | HighlightAnnotation;

export interface EditPdfValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface EditPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  annotationCount: number;
}

/**
 * Validates a PDF document for editing.
 */
export async function validateEditFile(
  file: File,
  isArabic: boolean = false
): Promise<EditPdfValidation> {
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
          ? 'المستند لا يحتوي على أي صفحات صالحة للتحرير.'
          : 'The document contains no pages to edit.',
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
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً أو محمياً بكلمة مرور (${errStr.slice(0, 80)}).`
        : `Unable to open PDF: Document may be corrupted or encrypted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Executes PDF editing by mapping 2-layer UI annotations onto the final PDF using pdf-lib.
 * Uses exact coordinate transformation (Top-Left DOM -> Bottom-Left PDF)
 * and renders text via high-DPI canvas stamps to permanently eliminate WinAnsi Arabic crashes.
 */
export async function executeEditPdf(
  originalArrayBuffer: ArrayBuffer,
  originalFilename: string,
  annotations: PdfAnnotation[],
  uiDimensions: { width: number; height: number },
  onProgress?: (percent: number, status: string) => void,
  isArabicLang: boolean = false
): Promise<EditPdfResult> {
  onProgress?.(15, isArabicLang ? 'جاري تحميل بنية المستند والصفحات...' : 'Loading PDF document structure...');

  const pdfDoc = await PDFDocument.load(originalArrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  onProgress?.(35, isArabicLang ? 'جاري تحويل الإحداثيات وتطبيق التعديلات...' : 'Mapping coordinates & baking annotations...');

  const uiWidth = uiDimensions.width || 600;
  const uiHeight = uiDimensions.height || 800;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pages[pageIdx];
    const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

    // Calculate scale factor between UI viewport and PDF page points
    const scaleX = uiWidth / pdfPageWidth;
    const scaleY = uiHeight / pdfPageHeight;

    // Filter annotations for this specific page
    const pageAnnotations = annotations.filter(a => a.pageIndex === pageIdx);

    for (const ann of pageAnnotations) {
      if (ann.type === 'text') {
        const textAnn = ann as TextAnnotation;
        if (!textAnn.text || !textAnn.text.trim()) continue;

        const pdfX = textAnn.uiX / scaleX;
        const pdfWidth = Math.max(20, textAnn.width / scaleX);
        const pdfHeight = Math.max(16, textAnn.height / scaleY);

        // CRITICAL COORDINATE MATH: Top-Left to Bottom-Left Origin
        const pdfY = pdfPageHeight - (textAnn.uiY / scaleY) - pdfHeight;

        // Render text as a high-DPI raster stamp to ensure 100% Arabic RTL shaping and eliminate WinAnsi crashes
        const pngBytes = await renderTextAnnotationToPng(textAnn, pdfWidth, pdfHeight);
        if (pngBytes) {
          const pngImage = await pdfDoc.embedPng(pngBytes);
          page.drawImage(pngImage, {
            x: pdfX,
            y: Math.max(0, pdfY),
            width: pdfWidth,
            height: pdfHeight,
          });
        }
      } else if (ann.type === 'rect') {
        const rectAnn = ann as RectAnnotation;
        const pdfX = rectAnn.uiX / scaleX;
        const pdfWidth = Math.max(5, rectAnn.width / scaleX);
        const pdfHeight = Math.max(5, rectAnn.height / scaleY);

        // CRITICAL COORDINATE MATH
        const pdfY = pdfPageHeight - (rectAnn.uiY / scaleY) - pdfHeight;
        const strokeRgb = parseHexColor(rectAnn.strokeColor || '#0D0D0D');

        page.drawRectangle({
          x: pdfX,
          y: Math.max(0, pdfY),
          width: pdfWidth,
          height: pdfHeight,
          borderColor: strokeRgb,
          borderWidth: rectAnn.strokeWidth || 1.5,
          color: rectAnn.fillColor ? parseHexColor(rectAnn.fillColor) : undefined,
        });
      } else if (ann.type === 'highlight') {
        const hlAnn = ann as HighlightAnnotation;
        const pdfX = hlAnn.uiX / scaleX;
        const pdfWidth = Math.max(5, hlAnn.width / scaleX);
        const pdfHeight = Math.max(5, hlAnn.height / scaleY);

        // CRITICAL COORDINATE MATH
        const pdfY = pdfPageHeight - (hlAnn.uiY / scaleY) - pdfHeight;
        const colorRgb = parseHexColor(hlAnn.color || '#FACC15');

        page.drawRectangle({
          x: pdfX,
          y: Math.max(0, pdfY),
          width: pdfWidth,
          height: pdfHeight,
          color: colorRgb,
          opacity: 0.35,
        });
      } else if (ann.type === 'draw') {
        const drawAnn = ann as DrawingAnnotation;
        if (drawAnn.points && drawAnn.points.length > 1) {
          const strokeRgb = parseHexColor(drawAnn.strokeColor || '#EF4444');
          const strokeWidth = drawAnn.strokeWidth || 2;

          for (let p = 0; p < drawAnn.points.length - 1; p++) {
            const p1 = drawAnn.points[p];
            const p2 = drawAnn.points[p + 1];

            const x1 = p1.x / scaleX;
            const y1 = pdfPageHeight - (p1.y / scaleY);
            const x2 = p2.x / scaleX;
            const y2 = pdfPageHeight - (p2.y / scaleY);

            page.drawLine({
              start: { x: x1, y: y1 },
              end: { x: x2, y: y2 },
              thickness: strokeWidth,
              color: strokeRgb,
            });
          }
        }
      }
    }
  }

  onProgress?.(85, isArabicLang ? 'جاري حفظ التعديلات وتوليد ملف PDF...' : 'Saving annotations & compiling PDF...');

  const savedPdfBytes = await pdfDoc.save();
  const outputBlob = new Blob([new Uint8Array(savedPdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabicLang ? 'اكتمل تحرير وحفظ المستند بنجاح!' : 'PDF editing complete!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_edited.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    pageCount: totalPages,
    annotationCount: annotations.length,
  };
}

/**
 * Renders a text annotation to an offscreen PNG image buffer.
 * Supports full Arabic RTL cursive shaping and arbitrary Unicode without WinAnsi errors.
 */
async function renderTextAnnotationToPng(
  ann: TextAnnotation,
  targetWidthPt: number,
  targetHeightPt: number
): Promise<Uint8Array | null> {
  const pixelRatio = 2.0; // High-DPI Retina
  const widthPx = Math.max(60, Math.round(targetWidthPt * pixelRatio));
  const heightPx = Math.max(30, Math.round(targetHeightPt * pixelRatio));

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  if (ann.backgroundColor && ann.backgroundColor !== 'transparent') {
    ctx.fillStyle = ann.backgroundColor;
    ctx.fillRect(0, 0, widthPx, heightPx);
  }

  const isArabic = /[\u0600-\u06FF]/.test(ann.text);
  ctx.direction = isArabic ? 'rtl' : 'ltr';
  ctx.textAlign = isArabic ? 'right' : 'left';
  ctx.textBaseline = 'middle';

  const scaledFontSize = Math.max(10, Math.round((ann.fontSize || 12) * pixelRatio * 0.95));
  const fontWeight = ann.isBold ? 'bold' : 'normal';
  ctx.font = `${fontWeight} ${scaledFontSize}px 'Segoe UI', 'Tajawal', Tahoma, Arial, sans-serif`;
  ctx.fillStyle = ann.fontColor || '#0D0D0D';

  const padX = 8 * pixelRatio;
  const textX = isArabic ? widthPx - padX : padX;
  const textY = heightPx / 2;

  ctx.fillText(ann.text, textX, textY);

  // Convert canvas to PNG Blob and ArrayBuffer
  return new Promise<Uint8Array | null>(resolve => {
    canvas.toBlob(blob => {
      if (!blob) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(reader.result));
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

function parseHexColor(hex: string) {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return rgb(0.05, 0.05, 0.05);
}
