export interface MergeInputFile {
  id: string;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}

export interface MergeResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
}

export interface MergeValidationResult {
  isValid: boolean;
  error?: string;
  validFiles: MergeInputFile[];
  rejectedFiles: { name: string; reason: string }[];
}

/**
 * Validates a batch of files specifically for Merge PDF.
 * Allows 1 or more valid files to enter the workspace (action is gated at the merge button).
 */
export async function validateMergeFiles(
  files: File[],
  isArabic: boolean = false
): Promise<MergeValidationResult> {
  const validFiles: MergeInputFile[] = [];
  const rejectedFiles: { name: string; reason: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 1. Check file extension / MIME type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      rejectedFiles.push({
        name: file.name,
        reason: isArabic ? 'الملف ليس بصيغة PDF صالحة' : 'File is not a valid PDF document',
      });
      continue;
    }

    // 2. Check 0-byte files
    if (file.size === 0) {
      rejectedFiles.push({
        name: file.name,
        reason: isArabic ? 'الملف فارغ (0 بايت)' : 'File is empty (0 bytes)',
      });
      continue;
    }

    // 3. Read arrayBuffer and test with PDFDocument parser
    try {
      const buffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = doc.getPageCount();

      if (pageCount === 0) {
        rejectedFiles.push({
          name: file.name,
          reason: isArabic ? 'المستند لا يحتوي على أي صفحات' : 'Document contains 0 pages',
        });
        continue;
      }

      validFiles.push({
        id: `merge-file-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        pageCount,
      });
    } catch (err: unknown) {
      rejectedFiles.push({
        name: file.name,
        reason: isArabic ? `الملف تالف أو تعذرت قراءته (${String(err)})` : `File is corrupted or unreadable (${String(err)})`,
      });
    }
  }

  // If zero valid files were found
  if (validFiles.length === 0) {
    const errorMsg = isArabic
      ? (rejectedFiles.length > 0
          ? `تعذرت قراءة الملفات المحددة. (الملفات المرفوضة: ${rejectedFiles.map(r => `${r.name}: ${r.reason}`).join(', ')})`
          : 'لم يتم العثور على أي ملفات PDF صالحة. يرجى اختيار ملفات PDF.')
      : (rejectedFiles.length > 0
          ? `Could not read the selected files. (Rejected: ${rejectedFiles.map(r => `${r.name}: ${r.reason}`).join('; ')})`
          : 'No valid PDF files found. Please select a valid PDF.');

    return {
      isValid: false,
      error: errorMsg,
      validFiles,
      rejectedFiles,
    };
  }

  return {
    isValid: true,
    validFiles,
    rejectedFiles,
  };
}

/**
 * Merges multiple validated PDF documents in exact order into one output document.
 */
export async function executeMerge(
  files: MergeInputFile[],
  onProgress?: (progressPercent: number, statusText: string) => void,
  isArabic: boolean = false
): Promise<MergeResult> {
  if (files.length < 2) {
    throw new Error(isArabic ? 'يتطلب الدمج ملفين على الأقل.' : 'Merge requires at least 2 files.');
  }

  onProgress?.(10, isArabic ? 'تهيئة محرك الدمج...' : 'Initializing merge engine...');

  const { PDFDocument } = await import('pdf-lib');
  const mergedDoc = await PDFDocument.create();
  mergedDoc.setTitle('Merged Document - Kanto PDF');
  mergedDoc.setProducer('Kanto PDF Sovereign Engine');
  mergedDoc.setCreator('Kanto PDF');
  mergedDoc.setCreationDate(new Date());

  let totalPagesMerged = 0;
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const currentFile = files[i];
    const fileProgress = Math.round(15 + ((i / totalFiles) * 70));

    onProgress?.(
      fileProgress,
      isArabic
        ? `جاري دمج "${currentFile.name}" (${i + 1} من ${totalFiles} - ${currentFile.pageCount} صفحات)...`
        : `Merging "${currentFile.name}" (${i + 1} of ${totalFiles} - ${currentFile.pageCount} pages)...`
    );

    try {
      const srcDoc = await PDFDocument.load(currentFile.arrayBuffer, { ignoreEncryption: true });
      const indices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);

      for (const page of copiedPages) {
        mergedDoc.addPage(page);
      }

      totalPagesMerged += copiedPages.length;
    } catch (err: unknown) {
      throw new Error(
        isArabic
          ? `فشل أثناء دمج الملف "${currentFile.name}": ${String(err)}`
          : `Failed while merging file "${currentFile.name}": ${String(err)}`
      );
    }
  }

  onProgress?.(90, isArabic ? 'ضغط وتجهيز المستند النهائي...' : 'Optimizing and finalizing merged document...');

  const mergedBytes = await mergedDoc.save({ useObjectStreams: true });
  const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabic ? 'اكتمل الدمج بنجاح!' : 'Merge completed successfully!');

  return {
    blob,
    downloadFilename: 'kanto_merged.pdf',
    mimeType: 'application/pdf',
    fileSize: blob.size,
    pageCount: totalPagesMerged,
  };
}
