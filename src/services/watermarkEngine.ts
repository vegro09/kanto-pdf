import { PDFDocument, degrees } from 'pdf-lib';

export interface WatermarkOptions {
  text?: string;
  fontSize?: number;
  opacity?: number; // 0.1 to 1.0
  rotation?: number; // degrees, e.g. 45 or -45
  color?: string; // hex or rgb
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  imageDataUrl?: string; // optional image watermark
}

export interface WatermarkResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  watermarkedPagesCount: number;
  totalPages: number;
}

/**
 * Renders watermark text onto an offscreen canvas at high resolution, returning a transparent PNG buffer.
 * CRITICAL: This completely eliminates the `WinAnsi cannot encode "س" (0x0633)` crash
 * for Arabic, Chinese, Japanese, Hebrew, and Unicode text while preserving native typography and ligatures.
 */
export async function renderWatermarkToPng(
  text: string,
  fontSize: number = 48,
  color: string = '#DC2626'
): Promise<{ pngBytes: Uint8Array; width: number; height: number }> {
  if (typeof window === 'undefined') {
    // Fallback for Node/SSR testing
    const fallbackCanvas = document?.createElement('canvas');
    if (!fallbackCanvas) {
      return { pngBytes: new Uint8Array(), width: 300, height: 100 };
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const scale = 2.0; // Retina 2x scale for ultra-crisp text
      const effectiveFontSize = Math.max(16, fontSize) * scale;

      // Measure text width using an offscreen canvas
      const measureCanvas = document.createElement('canvas');
      const measureCtx = measureCanvas.getContext('2d');
      if (!measureCtx) {
        reject(new Error('Canvas 2D context unavailable.'));
        return;
      }

      measureCtx.font = `bold ${effectiveFontSize}px "Noto Sans Arabic", "Segoe UI", -apple-system, Roboto, sans-serif`;
      const metrics = measureCtx.measureText(text);

      const padding = 24 * scale;
      const textWidth = Math.ceil(metrics.width) + padding * 2;
      const textHeight = Math.ceil(effectiveFontSize * 1.4) + padding * 2;

      // Create target canvas
      const canvas = document.createElement('canvas');
      canvas.width = textWidth;
      canvas.height = textHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Target canvas context failed.'));
        return;
      }

      // Transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Setup typography
      ctx.font = `bold ${effectiveFontSize}px "Noto Sans Arabic", "Segoe UI", -apple-system, Roboto, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Detect Arabic / RTL text for correct ligature rendering
      const isRtl = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
      if (isRtl) {
        canvas.dir = 'rtl';
      }

      // Draw text at exact center of canvas
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('PNG Blob conversion failed.'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve({
              pngBytes: new Uint8Array(reader.result),
              width: textWidth / scale,
              height: textHeight / scale,
            });
          } else {
            reject(new Error('ArrayBuffer conversion failed.'));
          }
        };
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Converts a base64 Data URL to a Uint8Array.
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Executes Center-Anchored Batch Watermark Stamping across 100% of pages.
 */
export async function executeWatermark(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  options: WatermarkOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<WatermarkResult> {
  onProgress?.(10, isArabic ? 'جاري تحميل المستند وقراءة الصفحات...' : 'Loading PDF document...');

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  if (totalPages === 0) {
    throw new Error(isArabic ? 'المستند لا يحتوي على أي صفحات صالحة للعلامة المائية.' : 'The document contains no readable pages.');
  }

  onProgress?.(25, isArabic ? 'جاري توليد العلامة المائية وتنسيق الخطوط...' : 'Generating transparent watermark stamp...');

  const text = options.text || (isArabic ? 'سري للغاية' : 'CONFIDENTIAL');
  const fontSize = options.fontSize || 48;
  const opacity = options.opacity !== undefined ? Math.max(0.05, Math.min(1.0, options.opacity)) : 0.35;
  const rotationAngle = options.rotation !== undefined ? options.rotation : 45;
  const color = options.color || '#DC2626';

  let embeddedStamp;
  let stampWidth = 300;
  let stampHeight = 100;

  if (options.imageDataUrl) {
    // Image Watermark
    const imgBytes = dataUrlToBytes(options.imageDataUrl);
    embeddedStamp = options.imageDataUrl.includes('png')
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes);
    const dims = embeddedStamp.scale(1);
    stampWidth = dims.width;
    stampHeight = dims.height;
  } else {
    // Text Watermark: Render via high-DPI transparent PNG (Zero WinAnsi crash guarantee)
    const { pngBytes, width, height } = await renderWatermarkToPng(text, fontSize, color);
    embeddedStamp = await pdfDoc.embedPng(pngBytes);
    stampWidth = width;
    stampHeight = height;
  }

  onProgress?.(45, isArabic ? `جاري تطبيق العلامة المائية على ${totalPages} صفحة...` : `Stamping watermark across ${totalPages} page(s)...`);

  // Batch Loop: Stamp EVERY SINGLE PAGE
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // Mathematical Center-Anchored Coordinates with Rotation:
    // Rotating around the lower-left origin of the image:
    // To position the center of the rotated rectangle [stampWidth x stampHeight] exactly at (centerX, centerY):
    const rad = (rotationAngle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const drawX = centerX - (stampWidth * cosA - stampHeight * sinA) / 2;
    const drawY = centerY - (stampWidth * sinA + stampHeight * cosA) / 2;

    page.drawImage(embeddedStamp, {
      x: drawX,
      y: drawY,
      width: stampWidth,
      height: stampHeight,
      opacity: opacity,
      rotate: degrees(rotationAngle),
    });

    const progressPercent = Math.round(45 + ((i + 1) / totalPages) * 45);
    onProgress?.(
      progressPercent,
      isArabic
        ? `تم وسم الصفحة ${i + 1} من ${totalPages}...`
        : `Stamped page ${i + 1} of ${totalPages}...`
    );
  }

  onProgress?.(92, isArabic ? 'جاري ضغط وحفظ مستند PDF الموسوم...' : 'Saving watermarked document...');

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const outputBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabic ? 'اكتمل وضع العلامة المائية بنجاح!' : 'Watermark applied successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_watermarked.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    watermarkedPagesCount: totalPages,
    totalPages,
  };
}
