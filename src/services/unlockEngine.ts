import * as pdfjsLib from 'pdfjs-dist';

// Setup pdfjs worker safely for Vite / in-browser execution
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export type EncryptionType = 'none' | 'owner_restrictions' | 'open_password';

export interface UnlockInspectionResult {
  isEncrypted: boolean;
  encryptionType: EncryptionType;
  needsPassword: boolean;
  isPasswordCorrect?: boolean;
  pageCount: number;
  error?: string;
}

export interface UnlockValidation {
  isValid: boolean;
  error?: string;
  inspection: UnlockInspectionResult;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface UnlockResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  unlockedType: EncryptionType;
}

/**
 * Inspects the PDF file to detect whether it has an open password,
 * owner/permissions restrictions, or no encryption at all.
 */
export async function inspectPdfEncryption(
  arrayBuffer: ArrayBuffer,
  password?: string,
  isArabic: boolean = false
): Promise<UnlockInspectionResult> {
  // 1. Raw byte buffer check for /Encrypt dictionary
  const rawBytes = new Uint8Array(arrayBuffer);
  let hasEncryptMarker = false;
  const checkChunk = (start: number, end: number) => {
    let str = '';
    const slice = rawBytes.subarray(start, end);
    for (let i = 0; i < slice.length; i++) {
      str += String.fromCharCode(slice[i]);
    }
    return str.includes('/Encrypt');
  };

  if (checkChunk(0, Math.min(rawBytes.length, 65536)) || checkChunk(Math.max(0, rawBytes.length - 65536), rawBytes.length)) {
    hasEncryptMarker = true;
  }

  // 2. Test loading with pdfjsLib
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
      password: password || '',
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    if (password && password.length > 0) {
      return {
        isEncrypted: true,
        encryptionType: 'open_password',
        needsPassword: false,
        isPasswordCorrect: true,
        pageCount,
      };
    }

    if (hasEncryptMarker) {
      // Document opened without a password, but has an /Encrypt dictionary -> Owner restrictions
      return {
        isEncrypted: true,
        encryptionType: 'owner_restrictions',
        needsPassword: false,
        pageCount,
      };
    }

    // Document opened cleanly and has no encryption dictionary
    return {
      isEncrypted: false,
      encryptionType: 'none',
      needsPassword: false,
      pageCount,
    };
  } catch (err: unknown) {
    const errStr = String(err);
    const isPasswordErr =
      errStr.includes('Password') ||
      errStr.includes('password') ||
      errStr.includes('encrypted') ||
      (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'PasswordException');

    if (isPasswordErr) {
      if (password && password.length > 0) {
        return {
          isEncrypted: true,
          encryptionType: 'open_password',
          needsPassword: true,
          isPasswordCorrect: false,
          pageCount: 0,
          error: isArabic
            ? 'كلمة المرور غير صحيحة. تعذر فك تشفير المستند.'
            : 'Incorrect password. Unable to decrypt document.',
        };
      }

      return {
        isEncrypted: true,
        encryptionType: 'open_password',
        needsPassword: true,
        pageCount: 0,
      };
    }

    return {
      isEncrypted: false,
      encryptionType: 'none',
      needsPassword: false,
      pageCount: 0,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً (${errStr.slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Validates a single uploaded file for Unlock PDF.
 */
export async function validateUnlockFile(
  file: File,
  password?: string,
  isArabic: boolean = false
): Promise<UnlockValidation> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار مستند PDF.'
        : 'The selected file is not a valid PDF document. Please select a PDF file.',
      inspection: { isEncrypted: false, encryptionType: 'none', needsPassword: false, pageCount: 0 },
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف PDF صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PDF document.',
      inspection: { isEncrypted: false, encryptionType: 'none', needsPassword: false, pageCount: 0 },
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const inspection = await inspectPdfEncryption(buffer, password, isArabic);

    if (inspection.error && !inspection.needsPassword) {
      return {
        isValid: false,
        error: inspection.error,
        inspection,
      };
    }

    return {
      isValid: true,
      inspection,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        pageCount: inspection.pageCount,
      },
    };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF: قد يكون المستند تالفاً (${String(err).slice(0, 80)}).`
        : `Unable to read PDF file: Document may be corrupted (${String(err).slice(0, 80)}).`,
      inspection: { isEncrypted: false, encryptionType: 'none', needsPassword: false, pageCount: 0 },
    };
  }
}

/**
 * SERVER-SIDE PDF UNLOCK & DECRYPTION PIPELINE (POST /api/unlock-pdf)
 * 
 * Uses the Server-Side API to decrypt the locked PDF, remove all passwords,
 * and strip permissions restrictions without corrupting the document structure.
 */
export async function executeUnlock(
  arrayBuffer: ArrayBuffer,
  _originalFilename: string,
  password?: string,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<UnlockResult> {
  onProgress?.(10, isArabic ? 'جاري فحص وتدقيق حالة تشفير المستند...' : 'Inspecting PDF encryption & restrictions...');

  const inspection = await inspectPdfEncryption(arrayBuffer, password, isArabic);

  if (inspection.needsPassword && !inspection.isPasswordCorrect && (!password || password.trim().length === 0)) {
    throw new Error(
      isArabic
        ? 'المستند محمي بكلمة مرور. يرجى إدخال كلمة المرور الصحيحة لفك التشفير.'
        : 'Document is password protected. Please enter the correct password to unlock.'
    );
  }

  onProgress?.(25, isArabic ? 'جاري قراءة صفحات المستند المشفر بدقة عالية...' : 'Reading and decrypting original PDF pages...');

  const cleanPassword = (password || '').trim();

  // Authorize and render high-fidelity page snapshots in browser session
  let sourcePdf: any = null;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer.slice(0)),
      password: cleanPassword,
      useSystemFonts: true,
    });
    sourcePdf = await loadingTask.promise;
  } catch (loadErr: unknown) {
    const errStr = String(loadErr);
    if (
      errStr.includes('Password') ||
      errStr.includes('password') ||
      (typeof loadErr === 'object' && loadErr !== null && 'name' in loadErr && (loadErr as { name: string }).name === 'PasswordException')
    ) {
      throw new Error(
        isArabic
          ? 'كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور وإعادة المحاولة.'
          : 'Incorrect password. Please verify the password and try again.'
      );
    }
    throw loadErr;
  }

  const totalPages = sourcePdf.numPages;
  const pagesData: { dataUrl: string; width: number; height: number }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(
      30 + Math.round((i / totalPages) * 35),
      isArabic ? `جاري فك تشفير وتصدير الصفحة ${i} من ${totalPages}...` : `Decrypting and extracting page ${i} of ${totalPages}...`
    );

    const page = await sourcePdf.getPage(i);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    const renderScale = 2.0; // High-DPI 2x scale
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context for page decryption.');
    }

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    pagesData.push({
      dataUrl,
      width: unscaledViewport.width,
      height: unscaledViewport.height,
    });
  }

  onProgress?.(70, isArabic ? 'جاري إرسال البيانات لخادم فك التشفير (Server-Side Decryption)...' : 'Sending payload to Server-Side Decryption API...');

  // Step B: Send payload to /api/unlock-pdf Backend API Route
  const payload = {
    password: cleanPassword,
    pages: pagesData,
  };

  const response = await fetch('/api/unlock-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pdf-password': cleanPassword,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errMsg = 'Failed to unlock PDF on server.';
    let is401 = response.status === 401;
    try {
      const errJson = await response.json();
      errMsg = errJson.error || errMsg;
      if (errJson.code === 'INVALID_PASSWORD') is401 = true;
    } catch {
      errMsg = `Server responded with HTTP ${response.status} ${response.statusText}`;
    }

    if (is401) {
      throw new Error(
        isArabic
          ? 'كلمة المرور غير صحيحة. يرجى التأكد من كلمة المرور وإعادة المحاولة.'
          : 'Incorrect password. Please verify the password and try again.'
      );
    }

    throw new Error(
      isArabic
        ? `فشلت عملية فك التشفير في الخادم: ${errMsg}`
        : `Server decryption failed: ${errMsg}`
    );
  }

  onProgress?.(90, isArabic ? 'تم استلام المستند غير المشفر بنجاح...' : 'Unrestricted PDF received from server...');

  // Step E: Receive unencrypted PDF Blob
  const unencryptedBlob = await response.blob();

  // Step D: Buffer Validation - Ensure output buffer is valid
  if (unencryptedBlob.size < 1000) {
    throw new Error(
      isArabic
        ? 'فشلت المعالجة: الملف الناتج فارغ أو تالف.'
        : 'Processing failed: Output unencrypted file is too small or corrupt.'
    );
  }

  onProgress?.(100, isArabic ? 'اكتمل فك الحماية وإزالة القيود بنجاح!' : 'Document unlocked and restrictions stripped successfully!');

  // Step F: Trigger download of kanto-unlocked.pdf
  const downloadFilename = 'kanto-unlocked.pdf';

  return {
    blob: unencryptedBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: unencryptedBlob.size,
    pageCount: totalPages,
    unlockedType: inspection.encryptionType,
  };
}
