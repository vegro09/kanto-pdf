import type { PDFDocumentProxy } from 'pdfjs-dist';

let pdfjsLibInstance: typeof import('pdfjs-dist') | null = null;
async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfjsLibInstance) {
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
      try {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
        }
      } catch {
        // fallback
      }
    }
    pdfjsLibInstance = pdfjs;
  }
  return pdfjsLibInstance;
}

interface CacheEntry {
  promise: Promise<PDFDocumentProxy>;
  doc?: PDFDocumentProxy;
}

const documentCache = new Map<string, CacheEntry>();

/**
 * Returns a cached PDFDocumentProxy or loads it once if not already present.
 */
export async function getOrLoadPdfDocument(key: string, arrayBuffer: ArrayBuffer): Promise<PDFDocumentProxy> {
  const existing = documentCache.get(key);
  if (existing) {
    return existing.promise;
  }

  // Safety check: ensure buffer is not already detached
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return Promise.reject(new Error('Cannot parse PDF: ArrayBuffer is detached or empty.'));
  }

  const pdfjsLib = await getPdfJs();
  // CRITICAL: Always clone arrayBuffer.slice(0) so PDF.js worker transport
  // does not detach the master ArrayBuffer on the main thread!
  const safeData = new Uint8Array(arrayBuffer.slice(0));
  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
  });

  const promise = loadingTask.promise.then(doc => {
    const entry = documentCache.get(key);
    if (entry) {
      entry.doc = doc;
    }
    return doc;
  });

  documentCache.set(key, { promise });
  return promise;
}

export interface RenderCanvasOptions {
  key: string;
  arrayBuffer?: ArrayBuffer;
  pageNumber: number; // 1-indexed
  canvas: HTMLCanvasElement;
  scale?: number;
  rotation?: number; // optional additional rotation
}

export interface RenderHandle {
  cancel: () => void;
  promise: Promise<boolean>;
}

/**
 * Renders a PDF page to a canvas with strict memory management, cancellation,
 * and page.cleanup() to prevent RAM leaks.
 */
export function renderPageToCanvas({
  key,
  arrayBuffer,
  pageNumber,
  canvas,
  scale = 0.28,
  rotation = 0,
}: RenderCanvasOptions): RenderHandle {
  let isCancelled = false;
  let activeRenderTask: any = null;
  let activePdfPage: any = null;

  const cancel = () => {
    isCancelled = true;
    if (activeRenderTask) {
      try {
        activeRenderTask.cancel();
      } catch {
        // Task already finished or canceled
      }
    }
    if (activePdfPage) {
      try {
        activePdfPage.cleanup();
      } catch {
        // Page cleanup safe guard
      }
      activePdfPage = null;
    }
  };

  const promise = (async (): Promise<boolean> => {
    if (!arrayBuffer && !documentCache.has(key)) {
      return false;
    }

    try {
      const doc = await getOrLoadPdfDocument(key, arrayBuffer || new ArrayBuffer(0));
      if (isCancelled) return false;

      if (pageNumber < 1 || pageNumber > doc.numPages) {
        return false;
      }

      const page = await doc.getPage(pageNumber);
      activePdfPage = page;
      if (isCancelled) {
        page.cleanup();
        return false;
      }

      const viewport = page.getViewport({ scale, rotation });
      if (!canvas || isCancelled) {
        page.cleanup();
        return false;
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx || isCancelled) {
        page.cleanup();
        return false;
      }

      activeRenderTask = page.render({
        canvasContext: ctx,
        viewport,
      });

      await activeRenderTask.promise;
      return true;
    } catch (err: any) {
      // PDF.js throws RenderingCancelledException when canceled
      if (err?.name === 'RenderingCancelledException' || isCancelled) {
        return false;
      }
      console.warn(`[pdfDocumentCache] Thumbnail render error for page ${pageNumber}:`, err);
      return false;
    } finally {
      if (activePdfPage) {
        try {
          activePdfPage.cleanup();
        } catch {
          // ignore
        }
        activePdfPage = null;
      }
      activeRenderTask = null;
    }
  })();

  return { cancel, promise };
}

/**
 * Destroys a cached PDFDocumentProxy and removes it from cache.
 */
export function destroyCachedDocument(key: string): void {
  const entry = documentCache.get(key);
  if (entry) {
    documentCache.delete(key);
    entry.promise.then(doc => {
      try {
        doc.destroy();
      } catch {
        // ignore
      }
    }).catch(() => {});
  }
}

/**
 * Clears all cached documents and releases their worker instances.
 */
export function clearAllCachedDocuments(): void {
  for (const entry of documentCache.values()) {
    entry.promise.then(doc => {
      try {
        doc.destroy();
      } catch {
        // ignore
      }
    }).catch(() => {});
  }
  documentCache.clear();
}
