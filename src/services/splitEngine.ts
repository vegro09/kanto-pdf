export interface SplitRange {
  id: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  label: string;
  suggestedFilename: string;
}

export interface SplitRangeValidation {
  isValid: boolean;
  ranges: SplitRange[];
  error?: string;
}

export interface SplitOutputPart {
  filename: string;
  pageCount: number;
  rangeText: string;
  blob: Blob;
}

export interface SplitResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  fileCount: number;
  outputSummary: SplitOutputPart[];
}

export interface SplitUploadValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

/**
 * Validates a single uploaded file for Split PDF.
 * Enforces PDF format, byte readability, and minimum 2-page document requirement.
 */
export async function validateSplitFile(
  file: File,
  isArabic: boolean = false
): Promise<SplitUploadValidation> {
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

  // 3. Read and test with PDFDocument
  try {
    const buffer = await file.arrayBuffer();
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    if (pageCount < 2) {
      return {
        isValid: false,
        error: isArabic
          ? `المستند يحتوي على صفحة واحدة فقط (${pageCount} صفحة). أداة التقسيم تتطلب مستنداً يحتوي على صفحتين على الأقل.`
          : `The document only contains 1 page. Split PDF requires a document with at least 2 pages.`,
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
    return {
      isValid: false,
      error: isArabic
        ? `تعذرت قراءة ملف PDF أو المستند تالف (${String(err)}).`
        : `Could not parse PDF document or file is corrupted (${String(err)}).`,
    };
  }
}

/**
 * Parses and validates range strings (e.g. "1-5, 6-10, 11-15") against the total page count.
 * Catches out-of-bounds, overlaps, start > end, and syntax errors with instant inline feedback.
 */
export function parseAndValidateRanges(
  rangeString: string,
  totalDocPages: number,
  baseDocName: string = 'document',
  isArabic: boolean = false
): SplitRangeValidation {
  if (!rangeString || rangeString.trim().length === 0) {
    return {
      isValid: false,
      ranges: [],
      error: isArabic
        ? 'يرجى إدخال نطاق صفحات صالح (مثال: 1-3, 4-6)'
        : 'Please enter a valid page range (e.g. 1-3, 4-6)',
    };
  }

  const rawParts = rangeString.split(',').map(p => p.trim()).filter(Boolean);
  if (rawParts.length === 0) {
    return {
      isValid: false,
      ranges: [],
      error: isArabic ? 'يرجى تحديد نطاق واحد على الأقل.' : 'Please specify at least one page range.',
    };
  }

  const ranges: SplitRange[] = [];
  const claimedPages = new Set<number>();
  const cleanBaseName = baseDocName.replace(/\.pdf$/i, '');

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];

    let start = 0;
    let end = 0;

    if (part.includes('-')) {
      const sides = part.split('-');
      if (sides.length !== 2) {
        return {
          isValid: false,
          ranges: [],
          error: isArabic
            ? `صيغة النطاق "${part}" غير صحيحة. استخدم الصيغة (البداية-النهاية).`
            : `Invalid range format "${part}". Use standard format (start-end).`,
        };
      }
      start = parseInt(sides[0].trim(), 10);
      end = parseInt(sides[1].trim(), 10);
    } else {
      // Single page range like "5"
      start = parseInt(part, 10);
      end = start;
    }

    if (isNaN(start) || isNaN(end)) {
      return {
        isValid: false,
        ranges: [],
        error: isArabic
          ? `النطاق "${part}" يحتوي على أرقام غير صالحة.`
          : `Range "${part}" contains non-numeric page values.`,
      };
    }

    if (start <= 0 || end <= 0) {
      return {
        isValid: false,
        ranges: [],
        error: isArabic
          ? `أرقام الصفحات يجب أن تبدأ من 1 فما فوق (وجدت "${part}").`
          : `Page numbers must start from 1 or greater (found "${part}").`,
      };
    }

    if (start > end) {
      return {
        isValid: false,
        ranges: [],
        error: isArabic
          ? `بداية النطاق (${start}) أكبر من نهايته (${end}) في "${part}".`
          : `Range start (${start}) cannot be greater than end (${end}) in "${part}".`,
      };
    }

    if (end > totalDocPages) {
      return {
        isValid: false,
        ranges: [],
        error: isArabic
          ? `الصفحة ${end} تتجاوز إجمالي صفحات المستند (${totalDocPages} صفحات).`
          : `Page ${end} exceeds total document pages (${totalDocPages} pages).`,
      };
    }

    // Check overlaps
    for (let p = start; p <= end; p++) {
      if (claimedPages.has(p)) {
        return {
          isValid: false,
          ranges: [],
          error: isArabic
            ? `تداخل في الصفحات: الصفحة ${p} محددة في أكثر من نطاق.`
            : `Overlapping pages: Page ${p} is specified in multiple ranges.`,
        };
      }
      claimedPages.add(p);
    }

    const count = end - start + 1;
    const label = start === end ? `Page ${start}` : `Pages ${start}–${end}`;
    const filename = `${cleanBaseName}_part${i + 1}_p${start}-${end}.pdf`;

    ranges.push({
      id: `range-${i}-${start}-${end}`,
      startPage: start,
      endPage: end,
      pageCount: count,
      label,
      suggestedFilename: filename,
    });
  }

  return {
    isValid: true,
    ranges,
  };
}

/**
 * Auto-generates ranges for "Every N Pages" interval mode.
 */
export function generateIntervalRanges(
  totalDocPages: number,
  interval: number,
  baseDocName: string = 'document'
): SplitRange[] {
  if (interval <= 0 || totalDocPages <= 0) return [];
  const ranges: SplitRange[] = [];
  const cleanBaseName = baseDocName.replace(/\.pdf$/i, '');

  let partIndex = 1;
  for (let start = 1; start <= totalDocPages; start += interval) {
    const end = Math.min(start + interval - 1, totalDocPages);
    const count = end - start + 1;
    const label = start === end ? `Page ${start}` : `Pages ${start}–${end}`;
    const filename = `${cleanBaseName}_part${partIndex}_p${start}-${end}.pdf`;

    ranges.push({
      id: `interval-range-${partIndex}-${start}-${end}`,
      startPage: start,
      endPage: end,
      pageCount: count,
      label,
      suggestedFilename: filename,
    });
    partIndex++;
  }

  return ranges;
}

/**
 * Executes the real Split PDF extraction.
 * If 1 range -> returns direct single PDF Blob.
 * If 2+ ranges -> bundles all resulting PDFs into a clean ZIP archive via JSZip,
 * AND includes individual part Blobs in outputSummary for single-part download.
 */
export async function executeSplit(
  fileBuffer: ArrayBuffer,
  ranges: SplitRange[],
  baseDocName: string = 'document',
  onProgress?: (progressPercent: number, statusText: string) => void,
  isArabic: boolean = false
): Promise<SplitResult> {
  if (!ranges || ranges.length === 0) {
    throw new Error(isArabic ? 'لم يتم تحديد أي نطاق للتقسيم.' : 'No split ranges defined.');
  }

  onProgress?.(10, isArabic ? 'جاري تحميل المستند الأصلي...' : 'Loading source document...');

  const { PDFDocument } = await import('pdf-lib');
  const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  const totalDocPages = srcDoc.getPageCount();
  const cleanBaseName = baseDocName.replace(/\.pdf$/i, '');

  // Case A: Single range extraction -> Single PDF output
  if (ranges.length === 1) {
    const r = ranges[0];
    onProgress?.(40, isArabic ? `استخراج ${r.label}...` : `Extracting ${r.label}...`);

    const newDoc = await PDFDocument.create();
    newDoc.setTitle(`${cleanBaseName} - ${r.label}`);
    newDoc.setProducer('Kanto PDF Sovereign Engine');

    const targetIndices: number[] = [];
    for (let p = r.startPage; p <= r.endPage; p++) {
      if (p >= 1 && p <= totalDocPages) {
        targetIndices.push(p - 1);
      }
    }

    const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
    copiedPages.forEach(page => newDoc.addPage(page));

    onProgress?.(80, isArabic ? 'حفظ وضغط المستند...' : 'Finalizing PDF stream...');
    const bytes = await newDoc.save({ useObjectStreams: true });
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    onProgress?.(100, isArabic ? 'اكتمل الاستخراج بنجاح!' : 'Extraction completed!');

    return {
      blob,
      downloadFilename: r.suggestedFilename || `${cleanBaseName}_extracted.pdf`,
      mimeType: 'application/pdf',
      fileSize: blob.size,
      fileCount: 1,
      outputSummary: [
        {
          filename: r.suggestedFilename,
          pageCount: copiedPages.length,
          rangeText: r.label,
          blob,
        },
      ],
    };
  }

  // Case B: Multi-range extraction -> Bundled ZIP output + Individual Part Blobs
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const outputSummary: SplitOutputPart[] = [];
  const totalRanges = ranges.length;

  for (let i = 0; i < totalRanges; i++) {
    const r = ranges[i];
    const progressPercent = Math.round(15 + ((i / totalRanges) * 70));

    onProgress?.(
      progressPercent,
      isArabic
        ? `جاري استخراج الملف ${i + 1} من ${totalRanges} (${r.label})...`
        : `Extracting file ${i + 1} of ${totalRanges} (${r.label})...`
    );

    const newDoc = await PDFDocument.create();
    newDoc.setTitle(`${cleanBaseName} - Part ${i + 1} (${r.label})`);
    newDoc.setProducer('Kanto PDF Sovereign Engine');

    const targetIndices: number[] = [];
    for (let p = r.startPage; p <= r.endPage; p++) {
      if (p >= 1 && p <= totalDocPages) {
        targetIndices.push(p - 1);
      }
    }

    const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
    copiedPages.forEach(page => newDoc.addPage(page));

    const partBytes = await newDoc.save({ useObjectStreams: true });
    const partBlob = new Blob([partBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    zip.file(r.suggestedFilename, partBytes);

    outputSummary.push({
      filename: r.suggestedFilename,
      pageCount: copiedPages.length,
      rangeText: r.label,
      blob: partBlob,
    });
  }

  onProgress?.(90, isArabic ? 'تجميع الملفات داخل حزمة ZIP مضغوطة...' : 'Packaging files into ZIP archive...');

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.(100, isArabic ? 'تم التقسيم وتوليد الأرشيف بنجاح!' : 'Split complete!');

  return {
    blob: zipBlob,
    downloadFilename: `${cleanBaseName}_split_bundle.zip`,
    mimeType: 'application/zip',
    fileSize: zipBlob.size,
    fileCount: totalRanges,
    outputSummary,
  };
}
