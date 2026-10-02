import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Setup pdfjs worker safely for Vite / In-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface PdfToExcelValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfToExcelResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  sheetCount: number;
  totalRows: number;
  totalPages: number;
}

interface RawSpatialItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Validates an uploaded PDF document for Excel conversion.
 */
export async function validatePdfToExcelFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfToExcelValidation> {
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

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic
          ? 'المستند لا يحتوي على أي صفحات صالحة.'
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
          : 'Document is password-protected. Please unlock the PDF before converting.',
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
 * Converts PDF to Microsoft Excel (.xlsx) using the Spatial Text Parsing algorithm.
 * Groups positioned text streams into rows and columns, creating an editable spreadsheet workbook.
 */
export async function executePdfToExcel(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PdfToExcelResult> {
  // Step A: Load the user's PDF file using pdfjs-dist
  onProgress?.(5, isArabic ? 'جاري قراءة بنية المستند والبيانات المكانية...' : 'Loading PDF document & reading spatial layout...');

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Step B: Initialize a new Excel Workbook instance using XLSX
  const wb = XLSX.utils.book_new();
  let totalExtractedRows = 0;

  // Step C: Loop through every page of the loaded PDF
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const stepPercent = 10 + Math.round((pageNum / totalPages) * 75);
    onProgress?.(
      stepPercent,
      isArabic
        ? `جاري استخراج الجداول والخلايا من الصفحة ${pageNum} من ${totalPages}...`
        : `Extracting table cells from page ${pageNum} of ${totalPages}...`
    );

    const page = await pdfDoc.getPage(pageNum);

    // Step D: Extract text content and spatial coordinates (x, y)
    const textContent = await page.getTextContent();
    const rawItems: RawSpatialItem[] = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue;
      const str = item.str.trim();
      if (!str) continue;

      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const x = transform[4];
      const y = transform[5];
      const width = item.width || 0;
      const height = item.height || 0;

      rawItems.push({ str, x, y, width, height });
    }

    // Step E: Group extracted text items into Rows based on y position (top of page first)
    rawItems.sort((a, b) => b.y - a.y);

    const rowGroups: RawSpatialItem[][] = [];
    let currentRow: RawSpatialItem[] = [];
    let currentY: number | null = null;

    for (const item of rawItems) {
      if (currentY === null) {
        currentRow.push(item);
        currentY = item.y;
      } else if (Math.abs(item.y - currentY) <= 4) {
        currentRow.push(item);
      } else {
        // Step F: Sort items within each Row by their x position to form Columns
        currentRow.sort((a, b) => a.x - b.x);
        rowGroups.push(currentRow);
        currentRow = [item];
        currentY = item.y;
      }
    }

    if (currentRow.length > 0) {
      currentRow.sort((a, b) => a.x - b.x);
      rowGroups.push(currentRow);
    }

    // Step G: Convert grouped spatial data into a 2D array (Array of Arrays)
    const page2DData: (string | number)[][] = [];

    for (const row of rowGroups) {
      const cellValues: (string | number)[] = [];
      let cellText = '';
      let lastXEnd: number | null = null;

      for (let i = 0; i < row.length; i++) {
        const it = row[i];
        if (lastXEnd === null) {
          cellText = it.str;
          lastXEnd = it.x + (it.width || 20);
        } else if (it.x - lastXEnd > 15) {
          // Significant horizontal distance represents a distinct table column
          const trimmed = cellText.trim();
          cellValues.push(parseCellValue(trimmed));
          cellText = it.str;
          lastXEnd = it.x + (it.width || 20);
        } else {
          // Merge text within the same cell
          cellText += ' ' + it.str;
          lastXEnd = it.x + (it.width || 20);
        }
      }

      if (cellText) {
        const trimmed = cellText.trim();
        cellValues.push(parseCellValue(trimmed));
      }

      page2DData.push(cellValues);
      totalExtractedRows++;
    }

    // Step H: Convert 2D array into Excel worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(
      page2DData.length > 0 ? page2DData : [['No structured data extracted on this page']]
    );

    // Auto-fit column widths
    const maxCols = Math.max(...page2DData.map(r => r.length), 1);
    const colWidths = [];
    for (let c = 0; c < maxCols; c++) {
      let maxLen = 10;
      for (const row of page2DData) {
        if (row[c]) {
          maxLen = Math.max(maxLen, String(row[c]).length + 2);
        }
      }
      colWidths.push({ wch: Math.min(maxLen, 45) });
    }
    worksheet['!cols'] = colWidths;

    // Step I: Append worksheet to Workbook (e.g., "Page 1", "Page 2")
    const sheetName = isArabic ? `صفحة ${pageNum}` : `Page ${pageNum}`;
    XLSX.utils.book_append_sheet(wb, worksheet, sheetName);
  }

  // Step J: Use XLSX.write and trigger download of .xlsx file
  onProgress?.(92, isArabic ? 'جاري تجميع وحفظ مصنف Excel (.xlsx)...' : 'Compiling Excel OpenXML workbook (.xlsx)...');

  const xlsxArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxBlob = new Blob([xlsxArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  onProgress?.(100, isArabic ? 'اكتمل التحويل إلى Excel بنجاح!' : 'Excel spreadsheet generated successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_spreadsheet.xlsx`;

  return {
    blob: xlsxBlob,
    downloadFilename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: xlsxBlob.size,
    sheetCount: totalPages,
    totalRows: totalExtractedRows,
    totalPages,
  };
}

/**
 * Parses cell string into numbers or clean text
 */
function parseCellValue(value: string): string | number {
  if (!value) return '';
  // Check if pure integer or float
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const num = Number(value);
    if (!isNaN(num)) return num;
  }
  return value;
}
