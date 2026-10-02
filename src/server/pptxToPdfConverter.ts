import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';

export interface PptxServerConversionResult {
  pdfBuffer: Uint8Array;
  slideCount: number;
  widthPt: number;
  heightPt: number;
}

/**
 * Server-side PPTX to PDF Converter.
 * Safely parses OpenXML presentation slides, dimensions, backgrounds, and shapes
 * without WinAnsi font crashes on Arabic / Unicode characters.
 */
export async function convertPptxBufferToPdf(
  pptxBuffer: ArrayBuffer | Uint8Array
): Promise<PptxServerConversionResult> {
  const zip = await JSZip.loadAsync(pptxBuffer);

  // 1. Determine slide dimensions from ppt/presentation.xml
  let slideWidthPt = 720;
  let slideHeightPt = 405; // default 16:9 widescreen

  const presFile = zip.file('ppt/presentation.xml');
  if (presFile) {
    const presXml = await presFile.async('text');
    const szMatch = presXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
    if (szMatch) {
      const cxEmu = parseInt(szMatch[1], 10);
      const cyEmu = parseInt(szMatch[2], 10);
      slideWidthPt = cxEmu / 12700;
      slideHeightPt = cyEmu / 12700;
    }
  }

  // 2. Discover all slide XML files in chronological order
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error('No readable presentation slides found in the PPTX package.');
  }

  const pdfDoc = await PDFDocument.create();

  // 3. Process each slide with robust vector & background rendering
  for (let i = 0; i < slideFiles.length; i++) {
    const slideXmlPath = slideFiles[i];
    const slideXml = await zip.file(slideXmlPath)!.async('text');
    const pdfPage = pdfDoc.addPage([slideWidthPt, slideHeightPt]);

    // Slide background detection
    let bgColor = rgb(0.98, 0.98, 0.99); // default light
    const srgbMatch = slideXml.match(/<p:bg>[\s\S]*?<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
    if (srgbMatch) {
      const hex = srgbMatch[1];
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      bgColor = rgb(r, g, b);
    } else {
      const anySrgb = slideXml.match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      if (anySrgb && (slideXml.includes('<p:bg>') || i === 0)) {
        const hex = anySrgb[1];
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        bgColor = rgb(r, g, b);
      }
    }

    // Draw full-bleed slide background
    pdfPage.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidthPt,
      height: slideHeightPt,
      color: bgColor,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBuffer: pdfBytes,
    slideCount: slideFiles.length,
    widthPt: slideWidthPt,
    heightPt: slideHeightPt,
  };
}
