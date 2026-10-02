import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export interface PageSnapshotPayload {
  dataUrl?: string;
  imageDataBase64?: string;
  width: number;
  height: number;
  orientation?: 'portrait' | 'landscape';
}

export interface ServerUnlockOptions {
  password?: string;
  pages?: PageSnapshotPayload[];
  pdfBase64?: string;
}

export interface ServerUnlockResult {
  pdfBuffer: Buffer;
  pageCount: number;
  fileSize: number;
}

/**
 * Server-Side PDF Decryption & Password Removal Engine
 * Strips /Encrypt dictionary and exports an open, unrestricted PDF.
 */
export async function unlockPdfBufferOnServer(
  pdfBuffer: Buffer,
  options: ServerUnlockOptions = {}
): Promise<ServerUnlockResult> {
  const { password = '', pages = [] } = options;
  const cleanPassword = password.trim();

  // If pages array with snapshots is provided from client authorized session
  if (pages && pages.length > 0) {
    const totalPages = pages.length;
    let cleanDoc: jsPDF | null = null;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const width = page.width || 595.28;
      const height = page.height || 841.89;
      const orientation = page.orientation || (width > height ? 'landscape' : 'portrait');
      const imgData = page.dataUrl || page.imageDataBase64;

      if (i === 0) {
        cleanDoc = new jsPDF({
          orientation,
          unit: 'pt',
          format: [width, height],
          // Notice: NO encryption options passed -> Produces 100% open unencrypted PDF
        });

        if (imgData) {
          cleanDoc.addImage(imgData, 'JPEG', 0, 0, width, height);
        }
      } else if (cleanDoc) {
        cleanDoc.addPage([width, height], orientation);
        if (imgData) {
          cleanDoc.addImage(imgData, 'JPEG', 0, 0, width, height);
        }
      }
    }

    if (!cleanDoc) {
      throw new Error('Failed to create decrypted document from pages.');
    }

    const outputArrayBuffer = cleanDoc.output('arraybuffer');
    const outputBuffer = Buffer.from(outputArrayBuffer);

    if (outputBuffer.length < 500) {
      throw new Error('Server-side decryption produced an incomplete PDF buffer.');
    }

    return {
      pdfBuffer: outputBuffer,
      pageCount: totalPages,
      fileSize: outputBuffer.length,
    };
  }

  // Direct Server-Side Decryption via pdfjs-dist
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      password: cleanPassword,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    if (totalPages === 0) {
      throw new Error('PDF document contains zero pages.');
    }

    let cleanDoc: jsPDF | null = null;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const width = unscaledViewport.width;
      const height = unscaledViewport.height;
      const orientation = width > height ? 'landscape' : 'portrait';

      if (i === 1) {
        cleanDoc = new jsPDF({
          orientation,
          unit: 'pt',
          format: [width, height],
        });
      } else if (cleanDoc) {
        cleanDoc.addPage([width, height], orientation);
      }
    }

    if (!cleanDoc) {
      throw new Error('Failed to create decrypted document.');
    }

    const outputArrayBuffer = cleanDoc.output('arraybuffer');
    const outputBuffer = Buffer.from(outputArrayBuffer);

    return {
      pdfBuffer: outputBuffer,
      pageCount: totalPages,
      fileSize: outputBuffer.length,
    };
  } catch (err: unknown) {
    const errStr = String(err);
    if (
      errStr.includes('Password') ||
      errStr.includes('password') ||
      (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'PasswordException')
    ) {
      const authErr = new Error('Incorrect password. Failed to decrypt PDF.');
      (authErr as any).statusCode = 401;
      (authErr as any).code = 'INVALID_PASSWORD';
      throw authErr;
    }
    throw err;
  }
}
