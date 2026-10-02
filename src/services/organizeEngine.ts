import { PDFDocument, degrees } from 'pdf-lib';

export interface OrganizePageItem {
  id: string; // Unique UI key (crucial for React keys during duplication/reordering)
  originalIndex: number; // 0-indexed reference to source page in the original PDF
  pageNumber?: number; // 1-indexed visual display number
  rotation?: number; // 0, 90, 180, 270
  isDuplicate?: boolean;
}

export interface OrganizeResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  outputPageCount: number;
  sourcePageCount: number;
  duplicateCount: number;
  deletedCount: number;
}

/**
 * Validates a PDF file for Organize PDF.
 */
export async function validateOrganizeFile(
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
      error: isArabic ? 'الملف فارغ (0 بايت).' : 'The selected file is empty (0 bytes).',
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
        ? `تعذر قراءة ملف PDF (${String(err).slice(0, 70)}).`
        : `Failed to read PDF document (${String(err).slice(0, 70)}).`,
    };
  }
}

/**
 * DRAG-AND-DROP PAGE ARRAY MUTATION & FRESH RECONSTRUCTION ALGORITHM
 * 
 * Step D: Load original document and create a completely fresh master document.
 * Step E: Sequentially copy target indices from originalPdf into newPdf according to UI state array.
 * Step F: Save and download uncorrupted kanto_organized.pdf.
 */
export async function executeOrganize(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  pageDeck: OrganizePageItem[],
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<OrganizeResult> {
  if (pageDeck.length === 0) {
    throw new Error(
      isArabic
        ? 'لا يمكن إنشاء مستند بدون أي صفحات. يرجى الإبقاء على صفحة واحدة على الأقل.'
        : 'Cannot generate an empty document. Please keep at least one page.'
    );
  }

  onProgress?.(15, isArabic ? 'جاري تحميل المستند الأصلي وقراءة الفهارس...' : 'Loading source document buffer...');

  // Step D1: Load source document without destructive mutations
  const originalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const sourcePageCount = originalPdf.getPageCount();

  // Step D2: Create fresh, uncorrupted master PDF
  const newPdf = await PDFDocument.create();
  newPdf.setTitle('Organized Document - Kanto PDF');
  newPdf.setProducer('Kanto PDF Sovereign Engine');
  newPdf.setCreator('Kanto PDF');
  newPdf.setCreationDate(new Date());

  onProgress?.(40, isArabic ? 'جاري نسخ وبناء الصفحات وفقاً للتسلسل الجديد...' : 'Copying & assembling pages in target order...');

  let duplicates = 0;

  // Step E: Copy & Append Loop in the exact UI Array Order
  for (let i = 0; i < pageDeck.length; i++) {
    const item = pageDeck[i];
    const sourceIdx = item.originalIndex;

    if (sourceIdx < 0 || sourceIdx >= sourcePageCount) {
      continue;
    }

    if (item.isDuplicate) {
      duplicates++;
    }

    // Safely copy page from source document
    const [copiedPage] = await newPdf.copyPages(originalPdf, [sourceIdx]);

    // Apply any page-specific rotation if specified
    if (item.rotation) {
      const existingRot = copiedPage.getRotation().angle || 0;
      const combined = ((existingRot + item.rotation) % 360 + 360) % 360;
      copiedPage.setRotation(degrees(combined));
    }

    newPdf.addPage(copiedPage);

    const progressPct = Math.round(40 + (i / pageDeck.length) * 45);
    onProgress?.(
      progressPct,
      isArabic
        ? `جاري تجهيز الصفحة ${i + 1} من ${pageDeck.length}...`
        : `Assembling page ${i + 1} of ${pageDeck.length}...`
    );
  }

  onProgress?.(90, isArabic ? 'جاري ضغط وحفظ المستند المنظم النهائي...' : 'Optimizing and finalizing organized PDF...');

  // Step F: Save and download
  const outputBytes = await newPdf.save({ useObjectStreams: true });
  const outputBlob = new Blob([new Uint8Array(outputBytes).buffer as ArrayBuffer], {
    type: 'application/pdf',
  });

  onProgress?.(100, isArabic ? 'اكتمل تنظيم المستند بنجاح!' : 'Document organized successfully!');

  const cleanBase = originalFilename.replace(/\.pdf$/i, '');
  const downloadFilename = `${cleanBase}_organized.pdf`;

  const deletedCount = Math.max(0, sourcePageCount - (pageDeck.length - duplicates));

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    outputPageCount: newPdf.getPageCount(),
    sourcePageCount,
    duplicateCount: duplicates,
    deletedCount,
  };
}
