import { PDFDocument } from 'pdf-lib';

export interface SignaturePosition {
  xPercent: number; // 0 to 100 (% from left)
  yPercent: number; // 0 to 100 (% from top in visual DOM)
  widthPercent: number; // e.g. 25% of page width
  heightPercent: number; // e.g. 10% of page height
}

export interface SignValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface SignResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  signedPagesCount: number;
  totalPages: number;
}

/**
 * Validates a single uploaded file for Sign PDF.
 */
export async function validateSignFile(
  file: File,
  isArabic: boolean = false
): Promise<SignValidation> {
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

  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند لا يحتوي على أي صفحات صالحة للتوقيع.'
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
          : 'Document is password-protected. Please unlock the PDF before signing.',
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
 * Converts a base64 Data URL into a Uint8Array.
 */
function dataUrlToUint8Array(dataUrl: string): { bytes: Uint8Array; isPng: boolean } {
  const parts = dataUrl.split(',');
  const mime = parts[0];
  const isPng = mime.includes('png');
  const base64Str = parts[1];
  const binaryStr = typeof window !== 'undefined' ? window.atob(base64Str) : Buffer.from(base64Str, 'base64').toString('binary');
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { bytes, isPng };
}

/**
 * Processes an uploaded image to remove pure white backgrounds, returning a transparent PNG DataURL.
 */
export async function makeSignatureBackgroundTransparent(dataUrl: string): Promise<string> {
  if (typeof window === 'undefined') return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Filter near-white pixels (R>225, G>225, B>225) to transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 220 && g > 220 && b > 220) {
          data[i + 3] = 0; // alpha = 0
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Executes signature embedding onto target PDF pages with exact coordinate matching.
 */
export async function executeSign(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  signatureDataUrl: string,
  position: SignaturePosition,
  placementMode: 'current' | 'last' | 'all' | 'custom' = 'current',
  targetPages: number[] = [1],
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<SignResult> {
  onProgress?.(10, isArabic ? 'جاري تحميل المستند...' : 'Loading PDF document...');

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(30, isArabic ? 'جاري معالجة وتضمين التوقيع المشفر...' : 'Processing & embedding cryptographic signature...');

  const { bytes: imageBytes, isPng } = dataUrlToUint8Array(signatureDataUrl);
  const embeddedImage = isPng
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  // Determine pages to stamp
  let pagesToStamp: number[] = [];
  if (placementMode === 'current') {
    const pageToUse = targetPages[0] && targetPages[0] <= totalPages ? targetPages[0] : 1;
    pagesToStamp = [pageToUse];
  } else if (placementMode === 'last') {
    pagesToStamp = [totalPages];
  } else if (placementMode === 'all') {
    pagesToStamp = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (placementMode === 'custom') {
    pagesToStamp = targetPages.filter(p => p >= 1 && p <= totalPages);
    if (pagesToStamp.length === 0) pagesToStamp = [1];
  }

  onProgress?.(60, isArabic ? `جاري تطبيق التوقيع على ${pagesToStamp.length} صفحة...` : `Applying signature to ${pagesToStamp.length} page(s)...`);

  for (let i = 0; i < pagesToStamp.length; i++) {
    const pageNum = pagesToStamp[i];
    const page = pdfDoc.getPage(pageNum - 1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Map normalized percentages (0-100) to standard PDF points coordinate space (Origin at Bottom-Left)
    const drawWidth = (pageWidth * position.widthPercent) / 100;
    const drawHeight = (pageHeight * position.heightPercent) / 100;
    const drawX = (pageWidth * position.xPercent) / 100;
    // PDF Y is inverted (0 is bottom of page)
    const drawY = pageHeight - (pageHeight * position.yPercent) / 100 - drawHeight;

    page.drawImage(embeddedImage, {
      x: Math.max(0, drawX),
      y: Math.max(0, drawY),
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress?.(90, isArabic ? 'جاري تجميع وحفظ المستند الموقع...' : 'Compiling signed document package...');

  const signedBytes = await pdfDoc.save({ useObjectStreams: true });
  const signedBuffer = signedBytes.buffer.slice(
    signedBytes.byteOffset,
    signedBytes.byteOffset + signedBytes.byteLength
  ) as ArrayBuffer;

  onProgress?.(100, isArabic ? 'اكتمل توقيع المستند بنجاح!' : 'Document signed successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_signed.pdf`;
  const blob = new Blob([signedBuffer], { type: 'application/pdf' });

  return {
    blob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: blob.size,
    signedPagesCount: pagesToStamp.length,
    totalPages,
  };
}
