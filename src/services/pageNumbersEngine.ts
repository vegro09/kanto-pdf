import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export type PageNumberFormat =
  | 'page_x_of_y'
  | 'x_of_y'
  | 'page_x'
  | 'standard'
  | 'roman';

export interface PageNumberOptions {
  position?: PageNumberPosition;
  format?: PageNumberFormat;
  startNumber?: number;
  fontSize?: number;
  margin?: number;
  color?: string;
  excludeFirstPage?: boolean;
}

export interface PageNumberResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  numberedPagesCount: number;
  totalPages: number;
}

function toRoman(num: number): string {
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let res = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      res += roman;
      n -= val;
    }
  }
  return res || 'I';
}

function formatPageText(
  pageIndex: number,
  totalPages: number,
  startNumber: number,
  format: PageNumberFormat,
  isArabic: boolean
): string {
  const currentNum = pageIndex + startNumber;

  if (isArabic) {
    switch (format) {
      case 'page_x_of_y':
        return `صفحة ${currentNum} من ${totalPages}`;
      case 'x_of_y':
        return `${currentNum} من ${totalPages}`;
      case 'page_x':
        return `صفحة ${currentNum}`;
      case 'roman':
        return toRoman(currentNum);
      case 'standard':
      default:
        return `${currentNum}`;
    }
  }

  switch (format) {
    case 'page_x_of_y':
      return `Page ${currentNum} of ${totalPages}`;
    case 'x_of_y':
      return `${currentNum} of ${totalPages}`;
    case 'page_x':
      return `Page ${currentNum}`;
    case 'roman':
      return toRoman(currentNum);
    case 'standard':
    default:
      return `${currentNum}`;
  }
}

/**
 * High-DPI transparent rasterizer for Arabic typography to prevent WinAnsi encoding crashes.
 */
function renderArabicPageNumberToPng(
  text: string,
  fontSize: number,
  color: string
): { buffer: Uint8Array; width: number; height: number } | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scale = 2.0;
    const fontSpec = `600 ${fontSize * scale}px "Noto Sans Arabic", -apple-system, system-ui, sans-serif`;
    ctx.font = fontSpec;

    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontSize * scale * 1.4);

    canvas.width = textWidth + Math.ceil(20 * scale);
    canvas.height = textHeight + Math.ceil(10 * scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSpec;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return {
      buffer: bytes,
      width: canvas.width / scale,
      height: canvas.height / scale,
    };
  } catch {
    return null;
  }
}

/**
 * DYNAMIC COORDINATE PAGE NUMBERING ENGINE
 */
export async function executePageNumbers(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  options: PageNumberOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PageNumberResult> {
  const {
    position = 'bottom-center',
    format = 'page_x_of_y',
    startNumber = 1,
    fontSize = 11,
    margin = 32,
    color = '#262626',
    excludeFirstPage = false,
  } = options;

  onProgress?.(15, isArabic ? 'جاري تحميل المستند وقراءة أبعاد الصفحات...' : 'Loading PDF & reading dynamic dimensions...');

  // Step B: Load PDF Buffer
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Step C: Embed standard font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Step D: Loop through every page
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  onProgress?.(40, isArabic ? 'جاري حساب الإحداثيات الديناميكية وترقيم الصفحات...' : 'Calculating dynamic coordinates & stamping numbers...');

  let numberedCount = 0;

  for (let i = 0; i < totalPages; i++) {
    if (excludeFirstPage && i === 0) {
      continue;
    }

    const page = pages[i];

    // Step E: Read specific page dimensions dynamically (CRITICAL)
    const { width, height } = page.getSize();

    // Step F: Formatted text string
    const pageText = formatPageText(i, totalPages, startNumber, format, isArabic);

    // Check if text has Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(pageText);

    if (hasArabic) {
      const stamp = renderArabicPageNumberToPng(pageText, fontSize, color);
      if (stamp) {
        const embeddedPng = await pdfDoc.embedPng(stamp.buffer);
        const stampW = stamp.width;
        const stampH = stamp.height;

        let x = (width / 2) - (stampW / 2);
        let y = margin - 4;

        if (position === 'bottom-left') {
          x = margin;
          y = margin - 4;
        } else if (position === 'bottom-right') {
          x = width - margin - stampW;
          y = margin - 4;
        } else if (position === 'top-center') {
          x = (width / 2) - (stampW / 2);
          y = height - margin - stampH + 4;
        } else if (position === 'top-left') {
          x = margin;
          y = height - margin - stampH + 4;
        } else if (position === 'top-right') {
          x = width - margin - stampW;
          y = height - margin - stampH + 4;
        }

        page.drawImage(embeddedPng, {
          x: Math.max(10, Math.min(width - stampW - 10, x)),
          y: Math.max(10, Math.min(height - stampH - 10, y)),
          width: stampW,
          height: stampH,
          opacity: 0.95,
        });

        numberedCount++;
        continue;
      }
    }

    // Standard Latin Numbering
    const textWidth = helveticaFont.widthOfTextAtSize(pageText, fontSize);

    // Exact Dynamic Coordinate Math:
    let x = (width / 2) - (textWidth / 2);
    let y = margin;

    if (position === 'bottom-left') {
      x = margin;
      y = margin;
    } else if (position === 'bottom-right') {
      x = width - margin - textWidth;
      y = margin;
    } else if (position === 'top-center') {
      x = (width / 2) - (textWidth / 2);
      y = height - margin - fontSize;
    } else if (position === 'top-left') {
      x = margin;
      y = height - margin - fontSize;
    } else if (position === 'top-right') {
      x = width - margin - textWidth;
      y = height - margin - fontSize;
    }

    // Step G: Draw text
    page.drawText(pageText, {
      x: Math.max(10, Math.min(width - textWidth - 10, x)),
      y: Math.max(10, Math.min(height - fontSize - 10, y)),
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.15, 0.15, 0.15),
    });

    numberedCount++;
  }

  onProgress?.(85, isArabic ? 'جاري حفظ وتجهيز ملف PDF المرقم...' : 'Compiling & saving numbered PDF...');

  // Step H: Save and download
  const outputBytes = await pdfDoc.save({ useObjectStreams: true });
  const outputBlob = new Blob([new Uint8Array(outputBytes).buffer as ArrayBuffer], {
    type: 'application/pdf',
  });

  onProgress?.(100, isArabic ? 'اكتمل ترقيم الصفحات بنجاح!' : 'Page numbering completed successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_numbered.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    numberedPagesCount: numberedCount,
    totalPages,
  };
}
