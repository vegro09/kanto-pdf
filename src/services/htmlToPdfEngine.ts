export interface HtmlToPdfOptions {
  url?: string;
  htmlContent?: string;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  printBackground?: boolean;
}

export interface HtmlToPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  sourceType: 'url' | 'code';
}

/**
 * Validates the user-provided URL or raw HTML code.
 */
export function validateHtmlToPdfInput(
  options: HtmlToPdfOptions,
  isArabic: boolean = false
): { isValid: boolean; error?: string } {
  const { url, htmlContent } = options;

  if (!url && !htmlContent) {
    return {
      isValid: false,
      error: isArabic
        ? 'يرجى إدخال رابط الموقع (URL) أو لصق كود HTML لتحويله إلى PDF.'
        : 'Please provide either a website URL or HTML code to convert to PDF.',
    };
  }

  if (url && url.trim().length > 0) {
    const trimmed = url.trim();
    if (!trimmed.includes('.') || trimmed.length < 4) {
      return {
        isValid: false,
        error: isArabic
          ? 'رابط الموقع المدخل غير صالح. يرجى إدخال عنوان URL صحيح مثل https://example.com'
          : 'Invalid website URL format. Please enter a valid URL like https://example.com',
      };
    }
  }

  if (htmlContent && htmlContent.trim().length === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'كود HTML المدخل فارغ. يرجى لصق كود HTML صالح.'
        : 'The provided HTML code is empty. Please enter valid HTML content.',
    };
  }

  return { isValid: true };
}

/**
 * NATIVE VECTOR HTML/URL TO PDF PIPELINE (POST /api/html-to-pdf)
 * 
 * Uses Headless Chromium on the backend to natively render the webpage/HTML
 * into a true Vector PDF where all text is selectable and CSS styling is preserved.
 * NO client-side canvas rasterization is used.
 */
export async function executeHtmlToPdf(
  options: HtmlToPdfOptions,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<HtmlToPdfResult> {
  const validation = validateHtmlToPdfInput(options, isArabic);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid input.');
  }

  const isUrl = Boolean(options.url && options.url.trim().length > 0);
  const sourceType = isUrl ? 'url' : 'code';

  onProgress?.(
    15,
    isArabic
      ? (isUrl ? 'جاري الاتصال بخادم المتصفح لتحميل صفحة الويب...' : 'جاري تهيئة بيئة المتصفح لعرض كود HTML...')
      : (isUrl ? 'Connecting to headless browser engine...' : 'Initializing headless renderer for HTML code...')
  );

  onProgress?.(
    40,
    isArabic
      ? 'جاري تحميل الخطوط وتنسيقات CSS وانتظار اكتمال الشبكة...'
      : 'Loading web fonts, CSS stylesheets, and awaiting network idle...'
  );

  // Step B: Send payload to /api/html-to-pdf backend route
  const payload = {
    url: options.url?.trim() || undefined,
    htmlContent: options.htmlContent || undefined,
    pageSize: options.pageSize || 'a4',
    orientation: options.orientation || 'portrait',
    printBackground: options.printBackground !== undefined ? options.printBackground : true,
  };

  const response = await fetch('/api/html-to-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errMsg = 'Webpage vector conversion failed.';
    try {
      const errJson = await response.json();
      errMsg = errJson.error || errMsg;
    } catch {
      errMsg = `Server returned HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(
      isArabic
        ? `فشل تحويل صفحة الويب إلى PDF: ${errMsg}`
        : `HTML to Vector PDF conversion failed: ${errMsg}`
    );
  }

  onProgress?.(
    80,
    isArabic
      ? 'جاري طباعة المستند الشعاعي النقي (Vector PDF)...'
      : 'Generating native vector PDF stream...'
  );

  // Step E: Receive binary PDF Blob
  const blob = await response.blob();

  // Step D: Buffer Validation
  if (blob.size < 500) {
    throw new Error(
      isArabic
        ? 'فشلت المعالجة: الملف الناتج فارغ أو تالف.'
        : 'Processing failed: Output vector PDF is empty or corrupt.'
    );
  }

  onProgress?.(100, isArabic ? 'اكتمل التحويل بنجاح!' : 'Vector PDF generated successfully!');

  // Step F: Trigger download of kanto-webpage.pdf
  const downloadFilename = 'kanto-webpage.pdf';

  return {
    blob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: blob.size,
    pageCount: 1,
    sourceType,
  };
}
