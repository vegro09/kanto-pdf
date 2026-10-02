import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExcelToPdfValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    sheetCount: number;
    sheetNames: string[];
  };
}

export interface ExcelToPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  sheetCount: number;
  pageCount: number;
  totalPages: number;
}

/**
 * Validates an uploaded Microsoft Excel (.xlsx, .xls) or CSV document.
 */
export async function validateExcelToPdfFile(
  file: File,
  isArabic: boolean = false
): Promise<ExcelToPdfValidation> {
  const lowerName = file.name.toLowerCase();
  const isValidExt = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv');

  if (!isValidExt) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة Excel صالحة (.xlsx, .xls, .csv). يرجى اختيار ملف جدول بيانات.'
        : 'The selected file is not a valid Excel spreadsheet (.xlsx, .xls, .csv).',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف جدول بيانات صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid spreadsheet.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames || [];

    if (sheetNames.length === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'لا يحتوي ملف Excel على أي أوراق عمل صالحة.'
          : 'The spreadsheet does not contain any readable sheets.',
      };
    }

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        sheetCount: sheetNames.length,
        sheetNames,
      },
    };
  } catch (err: unknown) {
    const errStr = String(err);
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف Excel: قد يكون الملف تالفاً (${errStr.slice(0, 80)}).`
        : `Unable to read Excel file: Spreadsheet may be corrupted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Converts Microsoft Excel (.xlsx, .xls, .csv) to PDF using the HTML Table Rendering Algorithm.
 * Translates worksheets into clean styled HTML grids and renders them into high-fidelity PDF pages.
 */
export async function executeExcelToPdf(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<ExcelToPdfResult> {
  // Step A: Load the user's file as an ArrayBuffer
  onProgress?.(10, isArabic ? 'جاري قراءة مصنف Excel وتحليل أوراق العمل...' : 'Reading Excel workbook & analyzing sheets...');

  // Step B: Parse workbook with SheetJS
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames || ['Sheet1'];

  onProgress?.(30, isArabic ? 'جاري توليد جداول HTML المنسقة...' : 'Generating styled HTML spreadsheet tables...');

  // Step C: Convert each worksheet into an HTML table string
  let combinedHtml = '';
  let maxColCount = 1;

  for (let idx = 0; idx < sheetNames.length; idx++) {
    const name = sheetNames[idx];
    const ws = workbook.Sheets[name];
    if (!ws) continue;

    // Check column span
    const ref = ws['!ref'];
    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      const cols = range.e.c - range.s.c + 1;
      if (cols > maxColCount) maxColCount = cols;
    }

    let tableHtml = XLSX.utils.sheet_to_html(ws, { id: `sheet-table-${idx}`, editable: false });

    // Step A: Dynamically add dir="auto" to table and cells for proper RTL / LTR text handling
    tableHtml = tableHtml
      .replace(/<table/gi, '<table dir="auto"')
      .replace(/<td/gi, '<td dir="auto"')
      .replace(/<th/gi, '<th dir="auto"');

    // Clean html table content
    const bodyMatch = tableHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const innerContent = bodyMatch ? bodyMatch[1] : tableHtml;

    // Step C: Clean header title (no emojis)
    combinedHtml += `
      <div class="excel-sheet-section" style="margin-bottom: 28px;">
        <div class="sheet-title" style="
          font-size: 14px;
          font-weight: 700;
          color: #000000;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #000000;
          display: flex;
          align-items: center;
          justify-content: space-between;
        " dir="auto">
          <span>${escapeHtml(name)}</span>
          <span style="font-size: 10px; font-weight: 500; color: #555555;">Sheet ${idx + 1} of ${sheetNames.length}</span>
        </div>
        <div class="table-scroll-container">
          ${innerContent}
        </div>
      </div>
    `;
  }

  // Step D: Create a hidden DOM element with spreadsheet styling
  // If spreadsheet has 6+ columns, use landscape width (1123px), otherwise portrait (794px)
  const isLandscape = maxColCount >= 6;
  const containerWidth = isLandscape ? 1123 : 794;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${containerWidth}px`;
  container.style.padding = '40px 48px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#000000';
  container.style.boxSizing = 'border-box';

  // Step B: Inject exact CSS for table-layout fixed, word-wrap break-word, cream header (#F5F5DC), and 1px solid black borders
  container.innerHTML = `
    <style>
      table { width: 100%; table-layout: fixed; border-collapse: collapse; font-family: 'Inter', 'Tajawal', sans-serif; direction: auto; }
      th, td { border: 1px solid #000000; padding: 8px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; vertical-align: top; font-size: 10px; }
      th, tr:first-child td { background-color: #F5F5DC; font-weight: bold; color: #000000; }
      h1, h2 { color: #000000; font-family: 'Playfair Display', serif; }
    </style>
    <div class="excel-render-root" dir="auto">
      <div style="margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #000000;">
        <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 4px 0;">
          ${escapeHtml(originalFilename.replace(/\.[^.]+$/, ''))}
        </h1>
        <h2 style="font-size: 10px; margin: 0; font-weight: normal; color: #444444;">
          ${isArabic ? 'تم التحويل إلى مستند PDF عبر Kanto PDF' : 'Converted to PDF via Kanto PDF'}
        </h2>
      </div>
      ${combinedHtml || '<p>No spreadsheet data found.</p>'}
    </div>
  `;

  document.body.appendChild(container);

  onProgress?.(50, isArabic ? 'جاري تصيير الجداول والخلايا بدقة عالية...' : 'Rendering high-DPI spreadsheet pages...');

  let pdfBlob: Blob;
  let pageCount = 1;

  try {
    // Step E: Render DOM element via html2canvas and slice into A4 pages
    const canvas = await html2canvas(container, {
      scale: 2.0,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: containerWidth,
    });

    onProgress?.(80, isArabic ? 'جاري تقسيم أوراق العمل وتوليد ملف PDF...' : 'Compiling PDF page streams...');

    // Standard A4 dimensions in pt: Portrait (595.28 x 841.89) / Landscape (841.89 x 595.28)
    const pdfPageWidth = isLandscape ? 841.89 : 595.28;
    const pdfPageHeight = isLandscape ? 595.28 : 841.89;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    const imgWidth = pdfPageWidth;
    const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Page 1
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
      pageCount++;
    }

    onProgress?.(95, isArabic ? 'جاري حفظ مستند PDF النهائي...' : 'Finalizing spreadsheet PDF package...');

    const pdfBuffer = pdf.output('arraybuffer');
    pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  } finally {
    // Step F: Clean up and remove hidden DOM element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }

  onProgress?.(100, isArabic ? 'اكتمل التحويل إلى PDF بنجاح!' : 'Excel to PDF conversion complete!');

  const cleanBase = originalFilename.replace(/\.(xlsx|xls|csv)$/i, '');
  const downloadFilename = `${cleanBase}_converted.pdf`;

  return {
    blob: pdfBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: pdfBlob.size,
    sheetCount: sheetNames.length,
    pageCount,
    totalPages: pageCount,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
