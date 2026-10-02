import * as pdfjsLib from 'pdfjs-dist';

// Setup pdfjs worker safely for Vite / in-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PdfToHtmlOptions {
  includeStyles?: boolean;
  scale?: number;
  containerBg?: string;
  pageBg?: string;
}

export interface PdfToHtmlValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfToHtmlResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  htmlString: string;
  totalTextElements: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates a single uploaded PDF file for PDF to HTML conversion.
 */
export async function validatePdfToHtmlFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfToHtmlValidation> {
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
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً أو محمياً بكلمة مرور (${String(err).slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted or password protected (${String(err).slice(0, 80)}).`,
    };
  }
}

/**
 * CLIENT-SIDE PDF TO HTML ENGINE (HIGH-DPI / RETINA DECOUPLED VIEWPORT ARCHITECTURE)
 * 
 * Step A: Dual Scale Definition
 *   - CSS_SCALE = 1.5: Used for the HTML container sizing and text overlay coordinates.
 *   - RENDER_SCALE = CSS_SCALE * 3: Triple resolution (4.5) for ultra-crisp canvas rasterization.
 * 
 * Step B: Viewport Decoupling
 *   - displayViewport: calculated at CSS_SCALE.
 *   - renderViewport: calculated at RENDER_SCALE.
 * 
 * Step C: High-Res Canvas Rendering
 *   - canvas.width = renderViewport.width, canvas.height = renderViewport.height.
 *   - Rendered using the massive renderViewport and exported at JPEG quality 0.95.
 * 
 * Step D: HTML Container & Image Sizing
 *   - Container sized with displayViewport.width / displayViewport.height.
 *   - Image forced to 100% of display container, yielding pixel-perfect Retina density.
 * 
 * Step E: Text Overlay Math
 *   - convertToViewportPoint strictly called on displayViewport (NEVER renderViewport).
 *   - fontSize calculated using CSS_SCALE and transform matrix.
 */
export async function executePdfToHtml(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  options?: PdfToHtmlOptions,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PdfToHtmlResult> {
  onProgress?.(5, isArabic ? 'جاري تحميل وقراءة مستند PDF...' : 'Loading PDF document stream...');

  // Step A: Load PDF buffer with pdfjsLib
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  if (totalPages === 0) {
    throw new Error(isArabic ? 'المستند لا يحتوي على أي صفحات صالحة.' : 'PDF document contains no valid pages.');
  }

  const baseName = originalFilename.replace(/\.pdf$/i, '');
  const documentTitle = `${baseName || 'Kanto Document'} — Kanto PDF to HTML`;

  // Step A: Dual Scale Definition
  const CSS_SCALE = options?.scale || 1.5; // Used for HTML container and text coordinates
  const RENDER_SCALE = Math.max(CSS_SCALE * 2, 3.0); // High-DPI 3.0x scale (captures native resolution for lossless PNG)

  onProgress?.(15, isArabic ? 'جاري إعداد هيكل وتنسيقات صفحات HTML...' : 'Constructing HTML scaffolding and styling...');

  // HTML Scaffolding with CSS rules
  let html = `<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    body {
      margin: 0;
      padding: 30px 10px;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .pdf-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      max-width: 100%;
    }
    .pdf-page {
      position: relative;
      margin: 0 auto 20px auto;
      overflow: hidden;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .pdf-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: auto;
      image-rendering: high-quality;
      -webkit-image-rendering: high-quality;
      z-index: 1;
      pointer-events: none;
      display: block;
    }
    .pdf-text {
      position: absolute;
      white-space: pre;
      z-index: 2;
      color: transparent;
      cursor: text;
      line-height: 1;
      transform: translateY(-80%);
      transform-origin: left bottom;
      user-select: text;
      -webkit-user-select: text;
    }
    ::selection {
      background: rgba(0, 100, 255, 0.3);
      color: transparent;
    }
    ::-moz-selection {
      background: rgba(0, 100, 255, 0.3);
      color: transparent;
    }
    @media print {
      body {
        padding: 0;
        background: none;
      }
      .pdf-container {
        gap: 0;
      }
      .pdf-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="pdf-container">`;

  let totalTextElements = 0;

  // Extraction Loop with Decoupled Viewports
  for (let i = 1; i <= totalPages; i++) {
    const progressPercent = 20 + Math.round((i / totalPages) * 70);
    onProgress?.(
      progressPercent,
      isArabic
        ? `جاري تصيير طبقة الصور بصيغة PNG النقية واستخراج نصوص الصفحة ${i} من ${totalPages}...`
        : `Rendering lossless PNG visual layer & extracting selectable text for page ${i} of ${totalPages}...`
    );

    const page = await pdfDoc.getPage(i);

    // Step B: Viewport Decoupling
    const displayViewport = page.getViewport({ scale: CSS_SCALE });
    const renderViewport = page.getViewport({ scale: RENDER_SCALE });

    // Step C: High-Res Canvas Rendering (CRITICAL: LOSSLESS PNG EXPORT)
    const canvas = document.createElement('canvas');
    canvas.width = renderViewport.width;
    canvas.height = renderViewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to initialize 2D canvas context for page rendering.');
    }

    // Render using the high-DPI renderViewport (3.0x scale)
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

    // Export as lossless PNG to completely eliminate compression artifacts and banding
    const imgData = canvas.toDataURL('image/png');

    // Prompt memory cleanup of canvas surface
    canvas.width = 0;
    canvas.height = 0;

    // Fetch text content items
    const textContent = await page.getTextContent();

    // Step D: HTML Container & Image Sizing
    // The container uses the CSS_SCALE dimensions
    html += `\n    <!-- Page ${i} Container -->\n    <div class="pdf-page" id="page-${i}" style="position: relative; width: ${displayViewport.width}px; height: ${displayViewport.height}px; margin: 0 auto 20px auto; overflow: hidden; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">`;

    // The image source is the high-DPI lossless PNG, forced to fit the container with high-quality rendering
    html += `\n      <img class="pdf-bg" src="${imgData}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; image-rendering: auto; image-rendering: high-quality; z-index: 1; pointer-events: none;" alt="Page ${i} Background" />`;

    // Step E: Text Overlay Math
    // MUST use the displayViewport for calculating coordinates so the text matches the CSS container
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        const tx = item.transform;
        // Use native PDF.js math on displayViewport for subpixel coordinates
        const [x, y] = displayViewport.convertToViewportPoint(tx[4], tx[5]);
        // Calculate font size using the transform matrix and CSS_SCALE
        const fontSize = Math.sqrt((tx[0] * tx[0]) + (tx[1] * tx[1])) * CSS_SCALE;

        html += `\n      <span class="pdf-text" style="position: absolute; left: ${x}px; top: ${y}px; font-size: ${fontSize}px; color: transparent; z-index: 2; white-space: pre; cursor: text; line-height: 1; transform: translateY(-80%); transform-origin: left bottom; user-select: text;" dir="auto">${escapeHtml(item.str)}</span>`;
        totalTextElements++;
      }
    }

    html += `\n    </div>`;
    page.cleanup();
  }

  // Close tags, generate the Blob (text/html), and return result
  html += `\n  </div>\n</body>\n</html>`;

  onProgress?.(95, isArabic ? 'جاري تجميع وحزم مستند HTML النهائي...' : 'Packaging standalone HTML document...');

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

  onProgress?.(100, isArabic ? 'تم تحويل PDF إلى HTML بنجاح!' : 'PDF converted to HTML successfully!');

  const downloadFilename = baseName ? `${baseName}.html` : 'kanto-document.html';

  return {
    blob,
    downloadFilename,
    mimeType: 'text/html',
    fileSize: blob.size,
    pageCount: totalPages,
    htmlString: html,
    totalTextElements,
  };
}
