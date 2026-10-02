import type { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPageItem } from '../types/tools';

let pdfLibInstance: typeof import('pdf-lib') | null = null;
let pdfjsLibInstance: typeof import('pdfjs-dist') | null = null;

async function getPdfLib(): Promise<typeof import('pdf-lib')> {
  if (!pdfLibInstance) {
    pdfLibInstance = await import('pdf-lib');
  }
  return pdfLibInstance;
}

async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfjsLibInstance) {
    const pdfjs = await import('pdfjs-dist');
    if (typeof window !== 'undefined' && pdfjs && pdfjs.GlobalWorkerOptions) {
      try {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;
        }
      } catch {
        // safe fallback
      }
    }
    pdfjsLibInstance = pdfjs;
  }
  return pdfjsLibInstance;
}

export interface DocumentInfo {
  pageCount: number;
  isEncrypted: boolean;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
}

export interface FormFieldInfo {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'button' | 'unknown';
  value?: string | boolean;
  options?: string[];
}

export class KantoDocument {
  private pdfLibDoc: PDFDocument | null = null;
  private pdfJsDoc: PDFDocumentProxy | null = null;
  private rawBuffer: ArrayBuffer;
  private _pageCount: number = 0;
  private _isEncrypted: boolean = false;

  constructor(buffer: ArrayBuffer) {
    this.rawBuffer = buffer;
  }

  /**
   * Initializes and loads the document with dual-engine capabilities.
   */
  async load(options: { password?: string; ignoreEncryption?: boolean } = {}): Promise<DocumentInfo> {
    try {
      // 1. Load via pdf-lib
      const { PDFDocument } = await getPdfLib();
      this.pdfLibDoc = await PDFDocument.load(this.rawBuffer, {
        ignoreEncryption: options.ignoreEncryption ?? true,
        updateMetadata: false,
      });

      this._pageCount = this.pdfLibDoc.getPageCount();

      // 2. Attempt loading via pdfjs-dist for rendering capabilities
      try {
        const pdfjs = await getPdfJs();
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(this.rawBuffer.slice(0)),
          password: options.password,
        });
        this.pdfJsDoc = await loadingTask.promise;
      } catch (pdfjsErr: unknown) {
        // If pdfjs fails due to password, flag it
        const errStr = String(pdfjsErr);
        if (errStr.includes('PasswordException') || errStr.includes('password')) {
          this._isEncrypted = true;
        }
      }

      return {
        pageCount: this._pageCount,
        isEncrypted: this._isEncrypted,
        title: this.pdfLibDoc.getTitle(),
        author: this.pdfLibDoc.getAuthor(),
        creator: this.pdfLibDoc.getCreator(),
        producer: this.pdfLibDoc.getProducer(),
      };
    } catch (err: unknown) {
      const errStr = String(err);
      if (errStr.includes('encrypted') || errStr.includes('password') || errStr.includes('Password')) {
        this._isEncrypted = true;
        throw new Error('PASSWORD_REQUIRED: Document is encrypted with password protection.');
      }
      throw new Error(`MALFORMED_PDF: Unable to parse document bytes. Error: ${errStr}`);
    }
  }

  get pageCount(): number {
    return this._pageCount;
  }

  get isEncrypted(): boolean {
    return this._isEncrypted;
  }

  get rawDoc(): PDFDocument {
    if (!this.pdfLibDoc) {
      throw new Error('KantoDocument not initialized. Call load() first.');
    }
    return this.pdfLibDoc;
  }

  /**
   * Renders a real high-fidelity page preview to a given canvas element using pdf.js.
   */
  async renderPageToCanvas(pageIndex: number, canvas: HTMLCanvasElement, scale: number = 0.5): Promise<void> {
    if (!this.pdfJsDoc) {
      // If pdfjsDoc is not available, render empty state
      return;
    }

    if (pageIndex < 0 || pageIndex >= this.pdfJsDoc.numPages) {
      return;
    }

    try {
      const page = await this.pdfJsDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.warn('Thumbnail render non-fatal notice:', err);
    }
  }

  /**
   * Generates page deck structure.
   */
  getPageDeck(fileIndex: number = 0): PdfPageItem[] {
    const pages: PdfPageItem[] = [];
    for (let i = 0; i < this._pageCount; i++) {
      let rotation = 0;
      if (this.pdfLibDoc) {
        try {
          const page = this.pdfLibDoc.getPage(i);
          rotation = page.getRotation().angle || 0;
        } catch {
          rotation = 0;
        }
      }
      pages.push({
        pageNumber: i + 1,
        originalIndex: i,
        rotation,
        isDeleted: false,
        sourceFileIndex: fileIndex,
      });
    }
    return pages;
  }

  /**
   * Inspects AcroForm interactive fields in the document.
   */
  getFormFields(): FormFieldInfo[] {
    if (!this.pdfLibDoc) return [];
    try {
      const form = this.pdfLibDoc.getForm();
      const fields = form.getFields();
      return fields.map(field => {
        const name = field.getName();
        const typeName = field.constructor.name;
        let type: FormFieldInfo['type'] = 'unknown';

        if (typeName.includes('TextField')) type = 'text';
        else if (typeName.includes('CheckBox')) type = 'checkbox';
        else if (typeName.includes('Dropdown')) type = 'dropdown';
        else if (typeName.includes('RadioGroup')) type = 'radio';
        else if (typeName.includes('Button')) type = 'button';

        return {
          name,
          type,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Disposes pdfjs and memory handles cleanly.
   */
  destroy(): void {
    if (this.pdfJsDoc) {
      this.pdfJsDoc.destroy();
      this.pdfJsDoc = null;
    }
    this.pdfLibDoc = null;
  }
}
