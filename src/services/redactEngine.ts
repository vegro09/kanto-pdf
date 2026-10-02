import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Setup pdfjs worker safely for Vite / in-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface RedactionBox {
  id: string;
  pageNumber: number; // 1-indexed
  xPercent: number; // 0 - 100 (from left)
  yPercent: number; // 0 - 100 (from top)
  widthPercent: number; // 0 - 100
  heightPercent: number; // 0 - 100
  color?: 'black' | 'white';
}

export interface RedactValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface RedactResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
  redactedPagesCount: number;
  totalRedactionsApplied: number;
}

/**
 * Validates an uploaded PDF document for redaction.
 */
export async function validateRedactFile(
  file: File,
  isArabic: boolean = false
): Promise<RedactValidation> {
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
    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;

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
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً أو محمياً (${String(err).slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted or protected (${String(err).slice(0, 80)}).`,
    };
  }
}

/**
 * Performs TRUE permanent redaction:
 * Physically obliterates underlying text, images, and content streams
 * within redacted bounding boxes, preventing any copy-paste or text extraction.
 */
export async function executeRedact(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  redactions: RedactionBox[],
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<RedactResult> {
  onProgress?.(10, isArabic ? 'جاري فحص المستند ومناطق الحجب...' : 'Loading PDF & mapping redaction coordinates...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Load source doc with pdf-lib for unredacted page cloning
  let srcPdfLibDoc: PDFDocument | null = null;
  try {
    srcPdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch {
    srcPdfLibDoc = null;
  }

  const cleanDoc = await PDFDocument.create();

  // Strip all potential metadata leaks
  cleanDoc.setTitle('');
  cleanDoc.setAuthor('');
  cleanDoc.setSubject('');
  cleanDoc.setKeywords([]);
  cleanDoc.setProducer('');
  cleanDoc.setCreator('');

  // Group redactions by page
  const redactionsByPage = new Map<number, RedactionBox[]>();
  for (const r of redactions) {
    const list = redactionsByPage.get(r.pageNumber) || [];
    list.push(r);
    redactionsByPage.set(r.pageNumber, list);
  }

  let redactedPagesCount = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageRedactions = redactionsByPage.get(pageNum) || [];
    const stepProgress = 15 + Math.round((pageNum / totalPages) * 75);

    if (pageRedactions.length > 0) {
      redactedPagesCount++;
      onProgress?.(
        stepProgress,
        isArabic
          ? `جاري الإتلاف النهائي للبيانات في الصفحة ${pageNum} من ${totalPages}...`
          : `Permanently destroying sensitive data on page ${pageNum} of ${totalPages}...`
      );

      // Render high-DPI canvas
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // High-DPI 150-200 DPI

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to initialize offscreen 2D canvas context for redaction.');
      }

      // 1. Render visible page content
      await page.render({ canvasContext: ctx, viewport }).promise;

      // 2. Physically paint solid opaque redaction boxes directly over pixel buffer
      for (const box of pageRedactions) {
        const boxX = (box.xPercent / 100) * viewport.width;
        const boxY = (box.yPercent / 100) * viewport.height;
        const boxW = (box.widthPercent / 100) * viewport.width;
        const boxH = (box.heightPercent / 100) * viewport.height;

        ctx.fillStyle = box.color === 'white' ? '#FFFFFF' : '#000000';
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }

      // 3. Convert cleansed canvas to high-quality JPEG stream
      const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64Data = pageDataUrl.split(',')[1];
      const binaryStr = window.atob(base64Data);
      const imgBytes = new Uint8Array(binaryStr.length);
      for (let k = 0; k < binaryStr.length; k++) {
        imgBytes[k] = binaryStr.charCodeAt(k);
      }

      const embeddedImage = await cleanDoc.embedJpg(imgBytes);
      const origViewport = page.getViewport({ scale: 1.0 });
      const newPage = cleanDoc.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });
    } else {
      // Unredacted page: copy directly or render
      onProgress?.(
        stepProgress,
        isArabic
          ? `جاري نقل الصفحة ${pageNum} من ${totalPages}...`
          : `Preserving page ${pageNum} of ${totalPages}...`
      );

      if (srcPdfLibDoc) {
        const copied = await cleanDoc.copyPages(srcPdfLibDoc, [pageNum - 1]);
        cleanDoc.addPage(copied[0]);
      } else {
        const page = await pdfDoc.getPage(pageNum);
        const origViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = pageDataUrl.split(',')[1];
          const binaryStr = window.atob(base64Data);
          const imgBytes = new Uint8Array(binaryStr.length);
          for (let k = 0; k < binaryStr.length; k++) {
            imgBytes[k] = binaryStr.charCodeAt(k);
          }
          const embeddedImage = await cleanDoc.embedJpg(imgBytes);
          const newPage = cleanDoc.addPage([origViewport.width, origViewport.height]);
          newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          });
        }
      }
    }
  }

  onProgress?.(95, isArabic ? 'جاري تجميع وحفظ المستند المحجوب...' : 'Compiling sanitized, redacted PDF package...');

  const savedBytes = await cleanDoc.save({ useObjectStreams: true });
  const cleanBuffer = savedBytes.buffer.slice(
    savedBytes.byteOffset,
    savedBytes.byteOffset + savedBytes.byteLength
  ) as ArrayBuffer;

  onProgress?.(100, isArabic ? 'اكتمل الحجب والإتلاف بنجاح!' : 'Redaction completed successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_redacted.pdf`;
  const blob = new Blob([cleanBuffer], { type: 'application/pdf' });

  return {
    blob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: blob.size,
    totalPages,
    redactedPagesCount,
    totalRedactionsApplied: redactions.length,
  };
}
