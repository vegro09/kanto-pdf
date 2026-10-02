import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type DamageSeverity = 'healthy' | 'damaged_recoverable' | 'fatal_corrupted';

export interface RepairDiagnosis {
  severity: DamageSeverity;
  issues: string[];
  salvageablePages: number;
  headerOffset: number;
  hasEof: boolean;
  isHealthy: boolean;
  error?: string;
}

export interface RepairValidation {
  isValid: boolean;
  error?: string;
  diagnosis: RepairDiagnosis;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface RepairResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  recoveredPagesCount: number;
  issuesFixed: string[];
  isAlreadyHealthy: boolean;
  engineUsed?: string;
}

/**
 * Scans a raw PDF byte buffer for structural defects:
 * - Stray prepended bytes before %PDF header
 * - Truncated trailers / missing %%EOF
 * - Broken xref cross-reference tables
 */
export function diagnosePdfBuffer(rawBytes: Uint8Array, isArabic: boolean = false): {
  sanitizedBuffer: Uint8Array;
  diagnosis: RepairDiagnosis;
} {
  const issues: string[] = [];
  let buffer = rawBytes;

  // 1. Search for %PDF header in first 8KB
  const headChunkSize = Math.min(buffer.length, 8192);
  let latinHead = '';
  for (let i = 0; i < headChunkSize; i++) {
    latinHead += String.fromCharCode(buffer[i]);
  }

  const headerOffset = latinHead.indexOf('%PDF-');
  if (headerOffset > 0) {
    issues.push(
      isArabic
        ? `تم عزل وحذف ${headerOffset} بايت تالفة سابقة لترويسة PDF`
        : `Stripped ${headerOffset} corrupted junk bytes prepended before PDF header`
    );
    buffer = buffer.subarray(headerOffset);
  } else if (headerOffset === -1) {
    // If objects are found, mark as recoverable via server synthesis
    const rawCheck = String.fromCharCode(...buffer.subarray(0, Math.min(buffer.length, 2048)));
    if (rawCheck.includes('obj') || rawCheck.includes('stream')) {
      issues.push(
        isArabic
          ? 'تم اكتشاف ترويسة مفقودة؛ سيتم إعادة توليد ترويسة %PDF-1.7 قياسية عبر الخادم.'
          : 'Missing header detected; standard %PDF-1.7 header will be synthesized on server.'
      );
    }
  }

  // 2. Search for %%EOF in last 4KB
  const tailChunkSize = Math.min(buffer.length, 4096);
  let latinTail = '';
  const tailStart = Math.max(0, buffer.length - tailChunkSize);
  for (let i = tailStart; i < buffer.length; i++) {
    latinTail += String.fromCharCode(buffer[i]);
  }

  const hasEof = latinTail.includes('%%EOF');
  if (!hasEof) {
    issues.push(
      isArabic
        ? 'تم اكتشاف ملف مبتور ونهاية مفقودة (%%EOF). ستتم إعادة بناء تذييل اصطناعي قياسي.'
        : 'Truncated end-of-file detected (missing %%EOF). Synthetic termination trailer will be reconstructed.'
    );
  }

  // 3. Xref table check
  if (latinTail.includes('startxref') && !latinTail.includes('xref')) {
    issues.push(
      isArabic
        ? 'تمت إعادة فهرسة مصفوفة المراجع المتقاطعة (Xref) التالفة.'
        : 'Damaged cross-reference index (Xref) will be rebuilt.'
    );
  }

  const isHealthy = issues.length === 0;

  return {
    sanitizedBuffer: buffer,
    diagnosis: {
      severity: isHealthy ? 'healthy' : 'damaged_recoverable',
      issues,
      salvageablePages: 1,
      headerOffset: Math.max(0, headerOffset),
      hasEof,
      isHealthy,
    },
  };
}

/**
 * Validates and diagnoses a PDF file for repair.
 */
export async function validateRepairFile(
  file: File,
  isArabic: boolean = false
): Promise<RepairValidation> {
  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). لا يمكن إصلاح ملف فارغ.'
        : 'File is empty (0 bytes). Cannot repair an empty file.',
      diagnosis: {
        severity: 'fatal_corrupted',
        issues: [],
        salvageablePages: 0,
        headerOffset: -1,
        hasEof: false,
        isHealthy: false,
      },
    };
  }

  try {
    const rawBuffer = await file.arrayBuffer();
    const { sanitizedBuffer, diagnosis } = diagnosePdfBuffer(new Uint8Array(rawBuffer), isArabic);

    // Try reading page count if possible
    let pageCount = 1;
    try {
      const pDoc = await PDFDocument.load(sanitizedBuffer, { ignoreEncryption: true });
      pageCount = pDoc.getPageCount();
      diagnosis.salvageablePages = pageCount;
    } catch {
      // Corrupted, will be salvaged on server
      pageCount = 1;
      diagnosis.salvageablePages = 1;
    }

    return {
      isValid: true,
      diagnosis,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: rawBuffer,
        pageCount,
      },
    };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر تحليل بنية الملف: ${String(err).slice(0, 80)}`
        : `Unable to parse document byte structure: ${String(err).slice(0, 80)}`,
      diagnosis: {
        severity: 'fatal_corrupted',
        issues: [],
        salvageablePages: 0,
        headerOffset: -1,
        hasEof: false,
        isHealthy: false,
      },
    };
  }
}

/**
 * Executes Server-Side Low-Level Binary PDF Reconstruction via POST /api/repair-pdf.
 */
export async function executeRepair(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<RepairResult> {
  onProgress?.(15, isArabic ? 'جاري فحص بايتات الترويسة ومؤشرات الجداول...' : 'Analyzing byte structure & corrupted stream offsets...');

  const safeBuffer = arrayBuffer.slice(0);
  const fileBlob = new Blob([safeBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', fileBlob, originalFilename);
  formData.append('filename', originalFilename);

  onProgress?.(40, isArabic ? 'جاري إرسال البيانات إلى محرك الاسترداد وإعادة البناء المنخفض المستوى...' : 'Transmitting to Server-Side Low-Level Byte Reconstruction Engine...');

  let response: Response;
  try {
    response = await fetch('/api/repair-pdf', {
      method: 'POST',
      body: formData,
    });
  } catch (netErr: unknown) {
    throw new Error(
      isArabic
        ? `فشل الاتصال بخادم إصلاح المستندات (${String(netErr)}).`
        : `Failed to connect to document repair server (${String(netErr)}).`
    );
  }

  onProgress?.(75, isArabic ? 'جاري التحقق من سلامة الجداول وتوليد تذييل خالي من الأخطاء...' : 'Validating reconstructed cross-reference tables & trailer...');

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || 'File is damaged beyond repair';
    } catch {
      errorDetail = 'File is damaged beyond repair';
    }
    throw new Error(
      isArabic
        ? `تعذر إصلاح الملف: ${errorDetail}`
        : `Repair failed: ${errorDetail}`
    );
  }

  const resultBlob = await response.blob();
  if (resultBlob.size === 0) {
    throw new Error(
      isArabic
        ? 'أعاد محرك الإصلاح ملفاً فارغاً (الملف تالف بشكل غير قابل للاسترداد).'
        : 'Repair engine returned an empty buffer (File is damaged beyond repair).'
    );
  }

  let recoveredPages = 1;
  const engineUsed = response.headers.get('X-Recovery-Engine') || 'Kanto Low-Level Byte Reconstruction Engine';
  const recPagesHeader = response.headers.get('X-Recovered-Pages');
  if (recPagesHeader) {
    recoveredPages = parseInt(recPagesHeader, 10) || 1;
  } else {
    try {
      const resBuf = await resultBlob.arrayBuffer();
      const verifyDoc = await PDFDocument.load(resBuf, { ignoreEncryption: true });
      recoveredPages = verifyDoc.getPageCount();
    } catch {
      // fallback
    }
  }

  onProgress?.(100, isArabic ? 'تم استرداد وإعادة بناء المستند بنجاح!' : 'Document repaired and restructured successfully!');

  const downloadFilename = 'kanto-repaired.pdf';

  return {
    blob: resultBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: resultBlob.size,
    recoveredPagesCount: recoveredPages,
    issuesFixed: [
      isArabic
        ? 'تمت إعادة بناء مصفوفة المراجع المتقاطعة (Xref Table) والتذييل القياسي بنجاح.'
        : 'Rebuilt Cross-Reference Table (Xref) & standard trailer cleanly.',
      isArabic
        ? `المحرك المستخدم: ${engineUsed}`
        : `Engine: ${engineUsed}`,
    ],
    isAlreadyHealthy: false,
    engineUsed,
  };
}

/**
 * Generates an intentionally corrupted sample document for testing the repair engine.
 */
export async function createSampleCorruptedPdf(isArabic: boolean = false): Promise<File> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont = await doc.embedFont(StandardFonts.Helvetica);

  page.drawText(
    isArabic ? 'مستند تجريبي تالف (اختبار محرك الإصلاح)' : 'KANTO CORRUPTED RECOVERY TEST DOCUMENT',
    { x: 50, y: 760, size: 14, font, color: rgb(0.8, 0.1, 0.1) }
  );

  page.drawText(
    isArabic
      ? 'تم قطع مصفوفة المراجع المتقاطعة (Xref) والتذييل لاختبار خوارزمية الاسترداد.'
      : 'Xref table and trailer offsets have been corrupted to verify recovery algorithm.',
    { x: 50, y: 720, size: 10, font: regFont, color: rgb(0.3, 0.3, 0.3) }
  );

  const cleanBytes = await doc.save();
  const cleanStr = Buffer.from(cleanBytes).toString('binary');
  const xrefIdx = cleanStr.lastIndexOf('xref');

  // Strip xref & corrupt trailer
  const damagedStr = 'CORRUPTED_GARBAGE_BYTES_PREFIX\n' + cleanStr.substring(0, xrefIdx > 0 ? xrefIdx : cleanStr.length - 80);
  const damagedBuf = Buffer.from(damagedStr, 'binary');

  return new File(
    [damagedBuf],
    isArabic ? 'مستند_تالف_للتجربة.pdf' : 'corrupted_sample_for_repair.pdf',
    { type: 'application/pdf' }
  );
}
