import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface WordToPdfValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    htmlPreview?: string;
  };
}

export interface WordToPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  totalPages: number;
}

/**
 * Validates an uploaded Microsoft Word (.docx) document.
 */
export async function validateWordToPdfFile(
  file: File,
  isArabic: boolean = false
): Promise<WordToPdfValidation> {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.docx') && !lowerName.endsWith('.doc')) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة Word صالحة (.docx). يرجى اختيار ملف Word.'
        : 'The selected file is not a valid Word document (.docx). Please select a Word file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف Word صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid Word document.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        htmlPreview: result.value,
      },
    };
  } catch (err: unknown) {
    const errStr = String(err);
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف Word: قد يكون المستند تالفاً أو بتنسيق قديم (${errStr.slice(0, 80)}).`
        : `Unable to read Word file: Document may be corrupted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Converts Microsoft Word (.docx) to PDF using the 2-step HTML Translation & Canvas Rendering algorithm.
 */
export async function executeWordToPdf(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<WordToPdfResult> {
  // Step A: Load the user's .docx file as an ArrayBuffer
  onProgress?.(10, isArabic ? 'جاري تحليل بنية مستند Word واستخراج النصوص...' : 'Parsing Word document structure & styles...');

  // Step B: Pass ArrayBuffer to mammoth to extract HTML string
  const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
  const rawHtml = mammothResult.value;

  onProgress?.(30, isArabic ? 'جاري تهيئة نموذج العرض والطباعة A4...' : 'Building high-fidelity A4 document layout...');

  // Step C: Create a hidden DOM element with fixed A4 dimensions (794px width) and styling
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.padding = '48px 56px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#111827';
  container.style.fontFamily = isArabic
    ? "'Segoe UI', Tahoma, 'Traditional Arabic', Arial, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  container.style.boxSizing = 'border-box';
  container.style.direction = isArabic ? 'rtl' : 'ltr';

  // Step D: Inject generated HTML with standard document styling
  container.innerHTML = `
    <style>
      .word-render-content h1 { font-size: 24px; font-weight: 700; margin: 20px 0 12px 0; color: #0f172a; }
      .word-render-content h2 { font-size: 20px; font-weight: 700; margin: 18px 0 10px 0; color: #1e293b; }
      .word-render-content h3 { font-size: 16px; font-weight: 600; margin: 14px 0 8px 0; color: #334155; }
      .word-render-content p { margin: 0 0 12px 0; }
      .word-render-content table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
      .word-render-content table, .word-render-content th, .word-render-content td { border: 1px solid #cbd5e1; }
      .word-render-content th, .word-render-content td { padding: 8px 12px; text-align: ${isArabic ? 'right' : 'left'}; }
      .word-render-content tr:first-child { background-color: #f8fafc; font-weight: 600; }
      .word-render-content img { max-width: 100%; height: auto; margin: 12px 0; border-radius: 4px; }
      .word-render-content ul, .word-render-content ol { margin: 8px 0 12px 24px; padding: 0; }
      .word-render-content li { margin-bottom: 4px; }
      .word-render-content blockquote { border-${isArabic ? 'right' : 'left'}: 4px solid #cbd5e1; margin: 12px 0; padding: 4px 16px; color: #475569; font-style: italic; }
    </style>
    <div class="word-render-content">
      ${rawHtml || '<p>No content found in document.</p>'}
    </div>
  `;

  document.body.appendChild(container);

  onProgress?.(50, isArabic ? 'جاري تحويل ومعالجة الصفحات بدقة Retina...' : 'Rendering high-resolution document pages...');

  let pdfBlob: Blob;
  let pageCount = 1;

  try {
    // Step E: Render DOM element with html2canvas at scale 2.0+
    const canvas = await html2canvas(container, {
      scale: 2.0,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 794,
    });

    onProgress?.(80, isArabic ? 'جاري إنشاء وتقسيم حزمة PDF...' : 'Compiling PDF page streams...');

    // A4 dimensions in pt (595.28 x 841.89)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = 595.28;
    const pdfPageHeight = 841.89;

    // Proportional canvas height mapping to PDF points
    const imgWidth = pdfPageWidth;
    const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Page 1
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Additional pages if document is longer than single A4 page
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
      pageCount++;
    }

    onProgress?.(95, isArabic ? 'جاري حفظ مستند PDF النهائي...' : 'Finalizing PDF output package...');

    const pdfBuffer = pdf.output('arraybuffer');
    pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  } finally {
    // Step F: Clean up and remove the hidden DOM element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }

  onProgress?.(100, isArabic ? 'اكتمل التحويل إلى PDF بنجاح!' : 'Word to PDF conversion complete!');

  const cleanBase = originalFilename.replace(/\.docx?$/i, '');
  const downloadFilename = `${cleanBase}_converted.pdf`;

  return {
    blob: pdfBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: pdfBlob.size,
    pageCount,
    totalPages: pageCount,
  };
}
