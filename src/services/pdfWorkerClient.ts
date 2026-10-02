import { WorkerTaskMessage } from '../workers/pdfWorker';

interface PendingTask {
  resolve: (result: any) => void;
  reject: (error: any) => void;
  onProgress?: (progress: number, statusText: string) => void;
}

class PdfWorkerClient {
  private worker: Worker | null = null;
  private pendingTasks = new Map<string, PendingTask>();
  private isAvailable: boolean = true;

  constructor() {
    // Lazy initialization: do not spin up the worker thread until a PDF task is executed
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      this.isAvailable = false;
      return;
    }

    try {
      this.worker = new Worker(new URL('../workers/pdfWorker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (!data || !data.id) return;

        const task = this.pendingTasks.get(data.id);
        if (!task) return;

        if (data.type === 'PROGRESS') {
          task.onProgress?.(data.progress, data.statusText);
        } else if (data.type === 'SUCCESS') {
          this.pendingTasks.delete(data.id);
          task.resolve(data.result);
        } else if (data.type === 'ERROR') {
          this.pendingTasks.delete(data.id);
          task.reject(new Error(data.error || 'Worker operation failed'));
        }
      };

      this.worker.onerror = (err) => {
        console.error('[pdfWorkerClient] Worker runtime error:', err);
      };
    } catch (err) {
      console.warn('[pdfWorkerClient] Unable to initialize Web Worker; fallback mode enabled:', err);
      this.isAvailable = false;
    }
  }

  public get available(): boolean {
    return this.isAvailable && this.worker !== null;
  }

  public runTask<T = any>(
    action: WorkerTaskMessage['action'],
    payload: any,
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<T> {
    if (!this.worker) {
      this.initWorker();
    }

    if (!this.worker) {
      return Promise.reject(new Error('Web Worker is not supported in this environment.'));
    }

    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return new Promise<T>((resolve, reject) => {
      this.pendingTasks.set(id, { resolve, reject, onProgress });

      try {
        this.worker!.postMessage({ id, action, payload } as WorkerTaskMessage);
      } catch (postErr) {
        this.pendingTasks.delete(id);
        reject(postErr);
      }
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingTasks.clear();
  }
}

// Global singleton instance
export const pdfWorker = new PdfWorkerClient();
