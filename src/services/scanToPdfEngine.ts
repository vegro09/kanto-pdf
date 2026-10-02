import { PDFDocument } from 'pdf-lib';
import { ScannedPageItem, ScanFilterMode } from '../types/tools';

export interface ScanValidationResult {
  isValid: boolean;
  error?: string;
  pages: ScannedPageItem[];
}

export interface ScanExecutionResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
}

/**
 * Applies the high-contrast document scanner filter onto a canvas ImageData buffer.
 */
export function applyScannerFilterToCanvas(
  canvas: HTMLCanvasElement,
  mode: ScanFilterMode = 'bw_threshold',
  threshold: number = 140
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/jpeg', 0.92);

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale Luminance calculation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (mode === 'bw_threshold') {
      if (gray >= threshold) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        const dark = Math.max(0, Math.round(gray - 40));
        data[i] = dark;
        data[i + 1] = dark;
        data[i + 2] = dark;
      }
    } else if (mode === 'color_clean') {
      if (gray >= threshold - 20) {
        const factor = (gray - (threshold - 20)) / (255 - (threshold - 20));
        data[i] = Math.min(255, Math.round(r + (255 - r) * factor));
        data[i + 1] = Math.min(255, Math.round(g + (255 - g) * factor));
        data[i + 2] = Math.min(255, Math.round(b + (255 - b) * factor));
      } else {
        data[i] = Math.max(0, Math.round(r * 0.85));
        data[i + 1] = Math.max(0, Math.round(g * 0.85));
        data[i + 2] = Math.max(0, Math.round(b * 0.85));
      }
    } else if (mode === 'grayscale_enhanced') {
      if (gray >= threshold) {
        const bright = Math.min(255, Math.round(255 - (255 - gray) * 0.4));
        data[i] = bright;
        data[i + 1] = bright;
        data[i + 2] = bright;
      } else {
        const dark = Math.max(0, Math.round(gray * 0.75));
        data[i] = dark;
        data[i + 1] = dark;
        data[i + 2] = dark;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Loads an image from a Data URL or Image Element and renders it with rotation and filter.
 */
export async function renderProcessedScan(
  originalDataUrl: string,
  filterMode: ScanFilterMode,
  threshold: number,
  rotation: number = 0
): Promise<{ processedDataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const isRotated90or270 = rotation % 180 !== 0;
      const targetWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const targetHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ processedDataUrl: originalDataUrl, width: img.naturalWidth, height: img.naturalHeight });
        return;
      }

      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      const processedDataUrl = applyScannerFilterToCanvas(canvas, filterMode, threshold);
      resolve({ processedDataUrl, width: targetWidth, height: targetHeight });
    };
    img.onerror = () => reject(new Error('Failed to load image for scanning filter.'));
    img.src = originalDataUrl;
  });
}

/**
 * Processes a File object into a ScannedPageItem.
 */
export async function processFileToScannedItem(
  file: File,
  filterMode: ScanFilterMode = 'bw_threshold',
  threshold: number = 140
): Promise<ScannedPageItem> {
  const originalDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });

  const { processedDataUrl, width, height } = await renderProcessedScan(
    originalDataUrl,
    filterMode,
    threshold,
    0
  );

  return {
    id: `scan-page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    originalDataUrl,
    processedDataUrl,
    width,
    height,
    filterMode,
    threshold,
    rotation: 0,
  };
}

/**
 * Validates uploaded image files for Scan to PDF.
 */
export async function validateScanFiles(
  files: File[],
  isArabic: boolean = false
): Promise<ScanValidationResult> {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: isArabic ? 'يرجى اختيار صور للمسح الضوئي.' : 'Please select image files to scan.',
      pages: [],
    };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const pages: ScannedPageItem[] = [];

  for (const f of files) {
    if (!validTypes.includes(f.type.toLowerCase()) && !f.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return {
        isValid: false,
        error: isArabic
          ? `الملف ${f.name} ليس صورة مدعومة. يرجى اختيار ملفات JPEG أو PNG.`
          : `File ${f.name} is not a supported image. Please upload JPEG or PNG files.`,
        pages: [],
      };
    }

    try {
      const item = await processFileToScannedItem(f, 'bw_threshold', 140);
      pages.push(item);
    } catch {
      // ignore corrupt item
    }
  }

  if (pages.length === 0) {
    return {
      isValid: false,
      error: isArabic ? 'تعذر قراءة ملفات الصور المحددة.' : 'Failed to process selected images.',
      pages: [],
    };
  }

  return { isValid: true, pages };
}

/**
 * Compiles an array of ScannedPageItems into a single PDF document.
 */
export async function executeScanToPdf(
  scannedPages: ScannedPageItem[],
  pageSize: 'original' | 'a4_fit' = 'original',
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<ScanExecutionResult> {
  if (!scannedPages || scannedPages.length === 0) {
    throw new Error(isArabic ? 'لا توجد صفحات ملتقطة للتحويل إلى PDF.' : 'No captured pages available to compile.');
  }

  onProgress?.(10, isArabic ? 'جاري تهيئة مستند PDF الممسوح ضوئياً...' : 'Initializing scanned PDF document...');

  const pdfDoc = await PDFDocument.create();
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (let i = 0; i < scannedPages.length; i++) {
    const pageItem = scannedPages[i];
    const stepProgress = Math.round(15 + ((i + 1) / scannedPages.length) * 75);
    onProgress?.(
      stepProgress,
      isArabic
        ? `جاري تحسين وحزم الصفحة ${i + 1} من ${scannedPages.length}...`
        : `Embedding scanned page ${i + 1} of ${scannedPages.length}...`
    );

    // Convert data URL to binary Uint8Array
    const base64Data = pageItem.processedDataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }

    let embeddedImg;
    if (pageItem.processedDataUrl.startsWith('data:image/png')) {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else {
      embeddedImg = await pdfDoc.embedJpg(bytes);
    }

    if (pageSize === 'a4_fit') {
      const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      const imgAspect = embeddedImg.width / embeddedImg.height;
      const pageAspect = A4_WIDTH / A4_HEIGHT;

      let drawWidth = A4_WIDTH;
      let drawHeight = A4_HEIGHT;
      let x = 0;
      let y = 0;

      if (imgAspect > pageAspect) {
        drawWidth = A4_WIDTH;
        drawHeight = A4_WIDTH / imgAspect;
        y = (A4_HEIGHT - drawHeight) / 2;
      } else {
        drawHeight = A4_HEIGHT;
        drawWidth = A4_HEIGHT * imgAspect;
        x = (A4_WIDTH - drawWidth) / 2;
      }

      page.drawImage(embeddedImg, { x, y, width: drawWidth, height: drawHeight });
    } else {
      // Exact native capture dimensions
      const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: embeddedImg.width,
        height: embeddedImg.height,
      });
    }
  }

  onProgress?.(95, isArabic ? 'جاري حفظ وحزم ملف PDF النهائي...' : 'Saving completed scanned PDF...');

  const pdfBytes = await pdfDoc.save();
  const safeBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  const blob = new Blob([safeBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabic ? 'تم إنشاء مستند PDF الممسوح ضوئياً بنجاح!' : 'Scanned PDF created successfully!');

  return {
    blob,
    downloadFilename: 'kanto-scanned.pdf',
    mimeType: 'application/pdf',
    fileSize: pdfBytes.byteLength,
    totalPages: scannedPages.length,
  };
}

/**
 * Creates a sample simulated camera capture page for instant testing without webcam.
 */
export async function createSampleScannedItem(isArabic: boolean = false): Promise<ScannedPageItem> {
  const width = 800;
  const height = 1100;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Simulate room lighting shadow on paper
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#D4D0C6');
  grad.addColorStop(0.5, '#E5E1D8');
  grad.addColorStop(1, '#CDC8BF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(
    isArabic ? 'مذكرة رسمية - عينة ماسح ضوئي' : 'KANTO OFFICIAL NOTIFICATION MEMO',
    50,
    80
  );

  ctx.fillStyle = '#333333';
  ctx.font = '15px sans-serif';
  ctx.fillText(
    isArabic ? 'التاريخ: 28 أغسطس 2026' : 'Date: August 28, 2026',
    50,
    125
  );
  ctx.fillText(
    isArabic ? 'الموضوع: فحص خوارزمية المسح الضوئي وتبييض الورق' : 'Subject: High-Contrast Document Scanner Verification',
    50,
    155
  );

  ctx.font = '14px sans-serif';
  const lines = isArabic
    ? [
        'تم التقاط هذه الصفحة لمحاكاة كاميرا الهاتف تحت إضاءة الغرفة العادية.',
        'تقوم خوارزمية المسح الضوئي بإزالة ظلال الإضاءة واللون الرمادي،',
        'وتحويل الخلفية إلى اللون الأبيض النقي مع زيادة حدة ووضوح النصوص.',
        '',
        'المعايير المعتمدة:',
        '1. تبييض خلفية الورق إلى 255,255,255.',
        '2. زيادة تباين وسواد الأحرف المطبوعة.',
        '3. الحفظ بأبعاد الكاميرا الأصلية أو ملاءمة A4.',
      ]
    : [
        'This page simulates a camera photo taken under ambient room lighting.',
        'The scanner algorithm cleans shadows, eliminates gray backgrounds,',
        'and creates a high-contrast black-on-white printable document.',
        '',
        'Verification Checklist:',
        '1. Paper Background: Pure White (#FFFFFF, RGB 255,255,255).',
        '2. Text Inks: Darkened, sharpened, high-contrast typography.',
        '3. Seamless export to multi-page searchable PDF document.',
      ];

  let y = 205;
  for (const line of lines) {
    ctx.fillText(line, 50, y);
    y += 26;
  }

  // Stamp seal
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(670, 115, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(isArabic ? 'معتمد' : 'VERIFIED', 645, 112);
  ctx.fillText(isArabic ? 'رسمي' : 'KANTO', 648, 128);

  const originalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const { processedDataUrl } = await renderProcessedScan(originalDataUrl, 'bw_threshold', 140, 0);

  return {
    id: `sample-scan-${Date.now()}`,
    originalDataUrl,
    processedDataUrl,
    width,
    height,
    filterMode: 'bw_threshold',
    threshold: 140,
    rotation: 0,
  };
}
