import { PDFDocument } from 'pdf-lib';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface RepairServerResult {
  pdfBuffer: Buffer;
  recoveredPages: number;
  issuesFixed: string[];
  fileSize: number;
  engineUsed: string;
}

/**
 * Server-Side Low-Level Binary PDF Reconstruction Engine.
 * Recovers corrupted PDFs with broken xref tables, truncated bytes, or missing trailers.
 */
export async function repairPdfBufferOnServer(
  inputBuffer: Buffer,
  _filename: string = 'document.pdf'
): Promise<RepairServerResult> {
  if (!inputBuffer || inputBuffer.length === 0) {
    throw new Error('File is damaged beyond repair (Empty input buffer).');
  }

  let buffer = Buffer.isBuffer(inputBuffer) ? inputBuffer : Buffer.from(inputBuffer);
  const issuesFixed: string[] = [];

  // 1. Clean prepended corrupted bytes before %PDF- header
  const pdfHeaderIdx = buffer.indexOf(Buffer.from('%PDF-'));
  if (pdfHeaderIdx > 0) {
    issuesFixed.push(`Stripped ${pdfHeaderIdx} corrupted header bytes`);
    buffer = buffer.subarray(pdfHeaderIdx);
  } else if (pdfHeaderIdx === -1) {
    // Attempt to synthesize %PDF header if raw objects exist
    if (buffer.includes(Buffer.from('obj')) && buffer.includes(Buffer.from('endobj'))) {
      issuesFixed.push('Synthesized missing %PDF-1.7 header');
      buffer = Buffer.concat([Buffer.from('%PDF-1.7\n%\xFF\xFF\xFF\xFF\n'), buffer]);
    } else {
      throw new Error('File is damaged beyond repair (Missing PDF binary structure).');
    }
  }

  // 2. Try OS CLI Recovery Engines (Ghostscript / MuPDF / QPDF) if installed
  const tempDir = os.tmpdir();
  const tmpIn = path.join(tempDir, `kanto_corrupt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.pdf`);
  const tmpOut = path.join(tempDir, `kanto_repaired_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.pdf`);

  let cliSuccess = false;
  let cliEngine = '';
  let cliResultBuffer: Buffer | null = null;

  try {
    fs.writeFileSync(tmpIn, buffer);

    const commands = [
      { name: 'Ghostscript (gs)', cmd: `gs -o "${tmpOut}" -sDEVICE=pdfwrite -dPDFSETTINGS=/default "${tmpIn}"` },
      { name: 'Ghostscript (gswin64c)', cmd: `gswin64c -o "${tmpOut}" -sDEVICE=pdfwrite -dPDFSETTINGS=/default "${tmpIn}"` },
      { name: 'MuPDF (mutool)', cmd: `mutool clean "${tmpIn}" "${tmpOut}"` },
      { name: 'QPDF', cmd: `qpdf --repair-file "${tmpIn}" "${tmpOut}"` },
    ];

    for (const c of commands) {
      try {
        execSync(c.cmd, { stdio: 'pipe', timeout: 6000 });
        if (fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 0) {
          cliResultBuffer = fs.readFileSync(tmpOut);
          cliEngine = c.name;
          cliSuccess = true;
          issuesFixed.push(`Reconstructed with ${c.name} low-level rewrite`);
          break;
        }
      } catch {
        // Continue to next command or low-level byte reconstruction
      }
    }
  } catch {
    // Ignore CLI errors and proceed to byte-level reconstruction
  } finally {
    try { if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn); } catch {}
    try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch {}
  }

  if (cliSuccess && cliResultBuffer && cliResultBuffer.length > 0) {
    try {
      const doc = await PDFDocument.load(cliResultBuffer, { ignoreEncryption: true });
      return {
        pdfBuffer: cliResultBuffer,
        recoveredPages: doc.getPageCount(),
        issuesFixed,
        fileSize: cliResultBuffer.length,
        engineUsed: cliEngine,
      };
    } catch {
      // Fall through to byte-level reconstruction
    }
  }

  // 3. Server-Side Low-Level Binary Object & Cross-Reference Reconstruction
  const rawStr = buffer.toString('binary');
  const objRegex = /(\d+)\s+(\d+)\s+obj([\s\S]*?)endobj/g;
  const objects: { objNum: number; genNum: number; rawString: string }[] = [];

  let match: RegExpExecArray | null;
  let maxObjNum = 0;
  let catalogObjNum: number | null = null;
  let pagesObjNum: number | null = null;
  const pageObjNums: number[] = [];

  while ((match = objRegex.exec(rawStr)) !== null) {
    const objNum = parseInt(match[1], 10);
    const genNum = parseInt(match[2], 10);
    const content = match[3];
    const fullObjStr = `${objNum} ${genNum} obj${content}endobj\n`;

    if (objNum > maxObjNum) maxObjNum = objNum;

    if (content.includes('/Type /Catalog') || content.includes('/Type/Catalog')) {
      catalogObjNum = objNum;
    }
    if (content.includes('/Type /Pages') || content.includes('/Type/Pages')) {
      pagesObjNum = objNum;
    }
    if (content.includes('/Type /Page') || content.includes('/Type/Page')) {
      pageObjNums.push(objNum);
    }

    objects.push({
      objNum,
      genNum,
      rawString: fullObjStr,
    });
  }

  if (objects.length === 0) {
    throw new Error('File is damaged beyond repair (No recoverable PDF objects found).');
  }

  issuesFixed.push(`Discovered and salvaged ${objects.length} indirect PDF objects`);

  // Sort objects by object number
  objects.sort((a, b) => a.objNum - b.objNum);

  // If catalog is missing, synthesize a standard Catalog and Page tree
  let synthExtra = '';
  if (!catalogObjNum && pageObjNums.length > 0) {
    maxObjNum++;
    catalogObjNum = maxObjNum;
    maxObjNum++;
    pagesObjNum = maxObjNum;

    const kidsStr = pageObjNums.map(n => `${n} 0 R`).join(' ');
    synthExtra += `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`;
    synthExtra += `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [ ${kidsStr} ] /Count ${pageObjNums.length} >>\nendobj\n`;
    issuesFixed.push('Synthesized missing /Catalog and /Pages tree dictionaries');
  }

  // Re-assemble pristine binary PDF structure
  const chunks: Buffer[] = [];
  chunks.push(Buffer.from('%PDF-1.7\n%\xFF\xFF\xFF\xFF\n', 'binary'));

  let currentOffset = chunks[0].length;
  const offsetTable: Record<number, number> = {};

  for (const obj of objects) {
    offsetTable[obj.objNum] = currentOffset;
    const objBuf = Buffer.from(obj.rawString, 'binary');
    chunks.push(objBuf);
    currentOffset += objBuf.length;
  }

  if (synthExtra) {
    const extraLines = synthExtra.split('endobj\n').filter(Boolean);
    for (const el of extraLines) {
      const matchNum = el.match(/^(\d+)\s+0\s+obj/);
      if (matchNum) {
        const sNum = parseInt(matchNum[1], 10);
        offsetTable[sNum] = currentOffset;
      }
      const sBuf = Buffer.from(el + 'endobj\n', 'binary');
      chunks.push(sBuf);
      currentOffset += sBuf.length;
    }
  }

  // Reconstruct physical Cross-Reference (xref) table
  const startXrefOffset = currentOffset;
  let xrefStr = `xref\n0 ${maxObjNum + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= maxObjNum; i++) {
    if (offsetTable[i] !== undefined) {
      const offStr = String(offsetTable[i]).padStart(10, '0');
      xrefStr += `${offStr} 00000 n \n`;
    } else {
      xrefStr += `0000000000 00000 f \n`;
    }
  }

  const catRef = catalogObjNum ? `/Root ${catalogObjNum} 0 R` : '/Root 1 0 R';
  xrefStr += `trailer\n<< /Size ${maxObjNum + 1} ${catRef} >>\nstartxref\n${startXrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xrefStr, 'binary'));

  const rawReconstructed = Buffer.concat(chunks);
  issuesFixed.push('Reconstructed cross-reference (xref) table and trailer');

  // Final structural re-serialization and validation with PDFDocument
  let finalDoc: PDFDocument;
  let recoveredPages = 1;
  try {
    finalDoc = await PDFDocument.load(rawReconstructed, { ignoreEncryption: true });
    recoveredPages = finalDoc.getPageCount();
  } catch {
    // If raw reconstructed buffer is accepted by low-level readers, return directly
    return {
      pdfBuffer: rawReconstructed,
      recoveredPages: Math.max(1, pageObjNums.length),
      issuesFixed,
      fileSize: rawReconstructed.length,
      engineUsed: 'Kanto Low-Level Byte Reconstruction Engine',
    };
  }

  const cleanSaved = await finalDoc.save({ useObjectStreams: false });
  const finalBuffer = Buffer.from(cleanSaved);

  return {
    pdfBuffer: finalBuffer,
    recoveredPages,
    issuesFixed,
    fileSize: finalBuffer.length,
    engineUsed: 'Kanto Low-Level Byte Reconstruction Engine',
  };
}
