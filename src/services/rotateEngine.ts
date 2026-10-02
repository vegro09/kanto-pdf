import { PDFDocument, degrees } from 'pdf-lib';

export interface PageRotationSpec {
  pageNumber: number; // 1-indexed
  originalIndex: number; // 0-indexed
  rotation: number; // user delta rotation, e.g. 0, 90, 180, 270
  isDeleted?: boolean;
}

export interface RotateResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  rotatedPagesCount: number;
  totalPages: number;
  rotationSummary: Array<{
    pageNumber: number;
    initialAngle: number;
    deltaAngle: number;
    finalAngle: number;
  }>;
}

/**
 * Validates a PDF file for Rotate PDF.
 */
export async function validateRotateFile(
  file: File,
  isArabic: boolean = false
): Promise<{ isValid: boolean; error?: string; pageCount?: number; arrayBuffer?: ArrayBuffer }> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة.'
        : 'The selected file is not a valid PDF document.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت).'
        : 'The selected file is empty (0 bytes).',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    if (pageCount === 0) {
      return {
        isValid: false,
        error: isArabic ? 'المستند لا يحتوي على أي صفحات صالحة.' : 'Document contains no pages.',
      };
    }

    return { isValid: true, pageCount, arrayBuffer: buffer };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً أو محمياً (${String(err).slice(0, 70)}).`
        : `Failed to read PDF document (${String(err).slice(0, 70)}).`,
    };
  }
}

/**
 * Executes Structural Metadata Rotation via pdf-lib.
 * 
 * Algorithm:
 * Step B: Load original PDF buffer into PDFDocument.load()
 * Step C: Loop through pages requested to rotate.
 * Step D: Read current structural rotation: const currentAngle = page.getRotation().angle;
 * Step E: Calculate cumulative new angle: const newAngle = ((currentAngle + userDelta) % 360 + 360) % 360;
 * Step F: Apply new angle: page.setRotation(degrees(newAngle));
 * Step G: Save modified document and trigger download.
 */
export async function executeRotate(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  pages: PageRotationSpec[],
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<RotateResult> {
  onProgress?.(15, isArabic ? 'جاري قراءة بنية المستند والزوايا الحالية...' : 'Loading PDF structural metadata...');

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(40, isArabic ? 'جاري حساب التدوير التراكمي وتعديل البيانات الوصفية...' : 'Calculating cumulative angles & applying metadata...');

  const rotationSummary: Array<{
    pageNumber: number;
    initialAngle: number;
    deltaAngle: number;
    finalAngle: number;
  }> = [];

  let rotatedCount = 0;

  // We operate directly on the target pages in the loaded document
  for (let i = 0; i < pages.length; i++) {
    const pageSpec = pages[i];
    if (pageSpec.isDeleted) continue;

    const pageIndex = pageSpec.originalIndex;
    if (pageIndex < 0 || pageIndex >= totalPages) continue;

    const pdfPage = pdfDoc.getPage(pageIndex);

    // Step D: Read current structural rotation angle from PDF metadata
    const currentAngle = pdfPage.getRotation().angle || 0;

    // Step E: Calculate cumulative angle
    const userDelta = pageSpec.rotation || 0;
    const newAngle = ((currentAngle + userDelta) % 360 + 360) % 360;

    // Step F: Apply permanent structural rotation
    pdfPage.setRotation(degrees(newAngle));

    if (userDelta !== 0) {
      rotatedCount++;
    }

    rotationSummary.push({
      pageNumber: pageSpec.pageNumber || pageIndex + 1,
      initialAngle: currentAngle,
      deltaAngle: userDelta,
      finalAngle: newAngle,
    });
  }

  onProgress?.(85, isArabic ? 'جاري تجميع وحفظ المستند المدور نهائياً...' : 'Compiling & saving modified PDF...');

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const outputBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], {
    type: 'application/pdf',
  });

  onProgress?.(100, isArabic ? 'اكتمل تدوير الصفحات بنجاح!' : 'Pages rotated successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_rotated.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    rotatedPagesCount: rotatedCount,
    totalPages,
    rotationSummary,
  };
}
