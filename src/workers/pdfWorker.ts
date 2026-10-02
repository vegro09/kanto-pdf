import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';

export interface WorkerTaskMessage {
  id: string;
  action: 'MERGE' | 'SPLIT' | 'ROTATE' | 'ORGANIZE' | 'COMPRESS';
  payload: any;
}

export interface WorkerProgressMessage {
  id: string;
  type: 'PROGRESS';
  progress: number;
  statusText: string;
}

export interface WorkerSuccessMessage {
  id: string;
  type: 'SUCCESS';
  result: any;
}

export interface WorkerErrorMessage {
  id: string;
  type: 'ERROR';
  error: string;
}

function sendProgress(id: string, progress: number, statusText: string) {
  self.postMessage({
    id,
    type: 'PROGRESS',
    progress: Math.min(100, Math.max(0, Math.round(progress))),
    statusText,
  } as WorkerProgressMessage);
}

// 1. Worker MERGE implementation
async function handleMerge(id: string, payload: { files: Array<{ name: string; arrayBuffer: ArrayBuffer; rotation?: number }> }) {
  const { files } = payload;
  sendProgress(id, 10, 'Initializing merge engine...');

  const mergedDoc = await PDFDocument.create();
  mergedDoc.setTitle('Merged Document - Kanto PDF');
  mergedDoc.setProducer('Kanto PDF Sovereign Engine (Worker)');
  mergedDoc.setCreator('Kanto PDF');
  mergedDoc.setCreationDate(new Date());

  const totalFiles = files.length;
  let totalPages = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const progress = 15 + Math.round((i / totalFiles) * 70);
    sendProgress(id, progress, `Merging "${file.name}" (${i + 1}/${totalFiles})...`);

    const srcDoc = await PDFDocument.load(new Uint8Array(file.arrayBuffer.slice(0)), { ignoreEncryption: true });
    const indices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, indices);

    for (const page of copiedPages) {
      if (file.rotation && file.rotation !== 0) {
        const currentRot = page.getRotation().angle || 0;
        page.setRotation(degrees((currentRot + file.rotation) % 360));
      }
      mergedDoc.addPage(page);
      totalPages++;
    }
  }

  sendProgress(id, 90, 'Serializing merged document...');
  const mergedBytes = await mergedDoc.save({ useObjectStreams: true });
  sendProgress(id, 100, 'Merge completed!');

  return {
    bytes: mergedBytes.buffer,
    fileName: `kanto-merged-${Date.now()}.pdf`,
    pageCount: totalPages,
    fileSize: mergedBytes.byteLength,
  };
}

// 2. Worker SPLIT implementation
async function handleSplit(id: string, payload: {
  arrayBuffer: ArrayBuffer;
  fileName: string;
  ranges: Array<{ label: string; startPage: number; endPage: number }>;
  mode: 'ranges' | 'extract_all';
}) {
  const { arrayBuffer, fileName, ranges, mode } = payload;
  sendProgress(id, 10, 'Parsing document for splitting...');

  const baseName = fileName.replace(/\.pdf$/i, '');
  const srcDoc = await PDFDocument.load(new Uint8Array(arrayBuffer.slice(0)), { ignoreEncryption: true });
  const totalDocPages = srcDoc.getPageCount();

  // If single range extracted
  if (ranges.length === 1 && mode !== 'extract_all') {
    const range = ranges[0];
    sendProgress(id, 30, `Extracting range ${range.label}...`);

    const splitDoc = await PDFDocument.create();
    const pageIndices: number[] = [];
    for (let p = range.startPage; p <= range.endPage; p++) {
      if (p >= 1 && p <= totalDocPages) {
        pageIndices.push(p - 1);
      }
    }

    const copied = await splitDoc.copyPages(srcDoc, pageIndices);
    copied.forEach(p => splitDoc.addPage(p));

    sendProgress(id, 85, 'Finalizing extracted PDF...');
    const bytes = await splitDoc.save({ useObjectStreams: true });
    sendProgress(id, 100, 'Split completed!');

    return {
      bytes: bytes.buffer,
      fileName: `${baseName}_part_${range.startPage}-${range.endPage}.pdf`,
      pageCount: copied.length,
      isZip: false,
    };
  }

  // Multiple ranges / extract all -> Produce a structured ZIP archive
  sendProgress(id, 20, 'Creating ZIP package...');
  const zip = new JSZip();

  for (let idx = 0; idx < ranges.length; idx++) {
    const range = ranges[idx];
    const progress = 20 + Math.round((idx / ranges.length) * 65);
    sendProgress(id, progress, `Generating Part ${idx + 1} of ${ranges.length} (${range.label})...`);

    const subDoc = await PDFDocument.create();
    const indices: number[] = [];
    for (let p = range.startPage; p <= range.endPage; p++) {
      if (p >= 1 && p <= totalDocPages) {
        indices.push(p - 1);
      }
    }

    if (indices.length > 0) {
      const copied = await subDoc.copyPages(srcDoc, indices);
      copied.forEach(p => subDoc.addPage(p));
      const subBytes = await subDoc.save({ useObjectStreams: true });
      const partFileName = `${baseName}_part_${String(idx + 1).padStart(2, '0')}_p${range.startPage}-p${range.endPage}.pdf`;
      zip.file(partFileName, subBytes);
    }
  }

  sendProgress(id, 88, 'Compressing ZIP package...');
  const zipBlob = await zip.generateAsync(
    { type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    metadata => {
      sendProgress(id, 88 + Math.round(metadata.percent * 0.1), `Packaging ZIP: ${Math.round(metadata.percent)}%`);
    }
  );

  sendProgress(id, 100, 'Split package ready!');

  return {
    bytes: zipBlob.buffer,
    fileName: `${baseName}_split_package.zip`,
    pageCount: ranges.length,
    isZip: true,
  };
}

// 3. Worker ROTATE implementation
async function handleRotate(id: string, payload: {
  arrayBuffer: ArrayBuffer;
  pageRotations: Record<number, number>; // pageNumber (1-indexed) -> angle
}) {
  const { arrayBuffer, pageRotations } = payload;
  sendProgress(id, 15, 'Loading PDF for rotation...');

  const doc = await PDFDocument.load(new Uint8Array(arrayBuffer.slice(0)), { ignoreEncryption: true });
  const count = doc.getPageCount();

  for (let i = 0; i < count; i++) {
    const pageNum = i + 1;
    const rot = pageRotations[pageNum];
    if (rot !== undefined && rot !== 0) {
      const page = doc.getPage(i);
      const current = page.getRotation().angle || 0;
      page.setRotation(degrees((current + rot) % 360));
    }
    sendProgress(id, 20 + Math.round((i / count) * 60), `Rotating page ${pageNum}/${count}...`);
  }

  sendProgress(id, 85, 'Saving rotated document...');
  const bytes = await doc.save({ useObjectStreams: true });
  sendProgress(id, 100, 'Rotation completed!');

  return {
    bytes: bytes.buffer,
    fileName: `kanto-rotated-${Date.now()}.pdf`,
    pageCount: count,
  };
}

// 4. Worker ORGANIZE implementation
async function handleOrganize(id: string, payload: {
  sourceBuffer: ArrayBuffer;
  pages: Array<{ originalIndex: number; rotation: number }>;
}) {
  const { sourceBuffer, pages } = payload;
  sendProgress(id, 15, 'Loading source document...');

  const srcDoc = await PDFDocument.load(new Uint8Array(sourceBuffer.slice(0)), { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();
  outDoc.setTitle('Organized Document - Kanto PDF');
  outDoc.setProducer('Kanto PDF Sovereign Engine (Worker)');

  const total = pages.length;
  for (let i = 0; i < total; i++) {
    const p = pages[i];
    const progress = 20 + Math.round((i / total) * 65);
    sendProgress(id, progress, `Organizing page ${i + 1} of ${total}...`);

    const [copied] = await outDoc.copyPages(srcDoc, [p.originalIndex]);
    if (p.rotation && p.rotation !== 0) {
      const current = copied.getRotation().angle || 0;
      copied.setRotation(degrees((current + p.rotation) % 360));
    }
    outDoc.addPage(copied);
  }

  sendProgress(id, 88, 'Finalizing output PDF...');
  const bytes = await outDoc.save({ useObjectStreams: true });
  sendProgress(id, 100, 'Organize completed!');

  return {
    bytes: bytes.buffer,
    fileName: `kanto-organized-${Date.now()}.pdf`,
    pageCount: total,
  };
}

// 5. Worker COMPRESS implementation
async function handleCompress(id: string, payload: {
  sourceBuffer: ArrayBuffer;
  preset: 'extreme' | 'recommended' | 'lossless';
}) {
  const { sourceBuffer } = payload;
  sendProgress(id, 15, 'Analyzing PDF streams for compression...');

  const doc = await PDFDocument.load(new Uint8Array(sourceBuffer.slice(0)), { ignoreEncryption: true });
  const pageCount = doc.getPageCount();

  sendProgress(id, 40, 'Purging unused metadata and optimizing xref catalogs...');
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('Kanto PDF Optimized');
  doc.setCreator('Kanto PDF');

  sendProgress(id, 75, 'Encoding object streams...');
  const compressedBytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  sendProgress(id, 100, 'Compression completed!');

  return {
    bytes: compressedBytes.buffer,
    fileName: `kanto-compressed-${Date.now()}.pdf`,
    pageCount,
    originalSize: sourceBuffer.byteLength,
    compressedSize: compressedBytes.byteLength,
  };
}

// Main message listener
self.onmessage = async (e: MessageEvent<WorkerTaskMessage>) => {
  const { id, action, payload } = e.data;

  try {
    let result: any;

    switch (action) {
      case 'MERGE':
        result = await handleMerge(id, payload);
        break;
      case 'SPLIT':
        result = await handleSplit(id, payload);
        break;
      case 'ROTATE':
        result = await handleRotate(id, payload);
        break;
      case 'ORGANIZE':
        result = await handleOrganize(id, payload);
        break;
      case 'COMPRESS':
        result = await handleCompress(id, payload);
        break;
      default:
        throw new Error(`Unsupported worker action: ${action}`);
    }

    // Zero-copy transfer of result buffer if present
    const transferList: Transferable[] = [];
    if (result && result.bytes instanceof ArrayBuffer) {
      transferList.push(result.bytes);
    }

    (self as any).postMessage(
      {
        id,
        type: 'SUCCESS',
        result,
      } as WorkerSuccessMessage,
      transferList
    );
  } catch (err: any) {
    self.postMessage({
      id,
      type: 'ERROR',
      error: err?.message || String(err),
    } as WorkerErrorMessage);
  }
};
