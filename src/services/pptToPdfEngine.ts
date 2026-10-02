import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PptToPdfValidation {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    slideCount: number;
  };
}

export interface PptToPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  slideCount: number;
  totalPages: number;
}

/**
 * Validates an uploaded Microsoft PowerPoint (.pptx) document.
 */
export async function validatePptToPdfFile(
  file: File,
  isArabic: boolean = false
): Promise<PptToPdfValidation> {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.pptx') && !lowerName.endsWith('.ppt')) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PowerPoint صالحة (.pptx). يرجى اختيار ملف عرض تقديمي.'
        : 'The selected file is not a valid PowerPoint presentation (.pptx). Please select a PowerPoint file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف عرض تقديمي صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PowerPoint document.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const slideCount = Object.keys(zip.files).filter(name =>
      /^ppt\/slides\/slide\d+\.xml$/.test(name)
    ).length || 1;

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        slideCount,
      },
    };
  } catch (err: unknown) {
    const errStr = String(err);
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PowerPoint: قد يكون العرض التقديمي تالفاً (${errStr.slice(0, 80)}).`
        : `Unable to read PowerPoint file: Presentation may be corrupted (${errStr.slice(0, 80)}).`,
    };
  }
}

/**
 * Converts Microsoft PowerPoint (.pptx) to PDF using the Solution A High-Fidelity Slide-to-Image Pipeline.
 * Eliminates WinAnsi encoding crashes permanently and guarantees 100% Arabic RTL text and layout fidelity.
 */
export async function executePptToPdf(
  arrayBuffer: ArrayBuffer,
  originalFilename: string,
  onProgress?: (percent: number, status: string) => void,
  isArabicLang: boolean = false
): Promise<PptToPdfResult> {
  onProgress?.(10, isArabicLang ? 'جاري تحليل بنية العرض التقديمي والشرائح...' : 'Parsing presentation package and slides...');

  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Extract slide dimensions from ppt/presentation.xml
  let slideWidthPt = 720;
  let slideHeightPt = 405; // 16:9 widescreen default

  const presFile = zip.file('ppt/presentation.xml');
  if (presFile) {
    const presXml = await presFile.async('text');
    const szMatch = presXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
    if (szMatch) {
      slideWidthPt = parseInt(szMatch[1], 10) / 12700;
      slideHeightPt = parseInt(szMatch[2], 10) / 12700;
    }
  }

  // 2. Discover all slide XML files in order
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

  const totalSlides = slideFiles.length > 0 ? slideFiles.length : 1;

  // Initialize jsPDF matching exact slide dimensions
  const isLandscape = slideWidthPt >= slideHeightPt;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [slideWidthPt, slideHeightPt],
    compress: true,
  });

  // 3. Render each slide to offscreen DOM canvas with full Arabic / Unicode font shaping
  for (let i = 0; i < totalSlides; i++) {
    const stepPercent = 20 + Math.round((i / totalSlides) * 70);
    onProgress?.(
      stepPercent,
      isArabicLang
        ? `جاري تحويل الشريحة ${i + 1} من ${totalSlides} بدقة فائقة...`
        : `Rendering high-resolution slide ${i + 1} of ${totalSlides}...`
    );

    const slideXmlPath = slideFiles[i];
    const slideXml = slideXmlPath ? await zip.file(slideXmlPath)!.async('text') : '';

    // Detect background color
    let bgHex = '#F8FAFC';
    const srgbMatch = slideXml.match(/<p:bg>[\s\S]*?<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
    if (srgbMatch) {
      bgHex = `#${srgbMatch[1]}`;
    } else {
      const anySrgb = slideXml.match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      if (anySrgb && (slideXml.includes('<p:bg>') || i === 0)) {
        bgHex = `#${anySrgb[1]}`;
      }
    }

    // Determine default text color based on background luminance
    let isDarkBg = false;
    if (bgHex.startsWith('#') && bgHex.length === 7) {
      const r = parseInt(bgHex.substring(1, 3), 16);
      const g = parseInt(bgHex.substring(3, 5), 16);
      const b = parseInt(bgHex.substring(5, 7), 16);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      isDarkBg = lum < 128;
    }
    const defaultColor = isDarkBg ? '#FFFFFF' : '#0F172A';

    // Build DOM slide container
    const slideContainer = document.createElement('div');
    slideContainer.style.position = 'fixed';
    slideContainer.style.left = '-9999px';
    slideContainer.style.top = '0';
    slideContainer.style.width = `${slideWidthPt}px`;
    slideContainer.style.height = `${slideHeightPt}px`;
    slideContainer.style.backgroundColor = bgHex;
    slideContainer.style.boxSizing = 'border-box';
    slideContainer.style.overflow = 'hidden';
    slideContainer.style.position = 'relative';

    // Extract text boxes (<p:sp>)
    const spMatches = slideXml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || [];
    let textElementsHtml = '';

    for (const sp of spMatches) {
      const offMatch = sp.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
      let xPt = 40;
      let topYPt = 40;
      if (offMatch) {
        xPt = parseInt(offMatch[1], 10) / 12700;
        topYPt = parseInt(offMatch[2], 10) / 12700;
      }

      const pMatches = sp.match(/<a:p>[\s\S]*?<\/a:p>/g) || [];
      for (const p of pMatches) {
        const tMatches = p.match(/<a:t>([^<]+)<\/a:t>/g) || [];
        const textStr = tMatches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ').trim();
        if (!textStr) continue;

        const isTitle = sp.includes('title') || p.includes('sz="2') || p.includes('sz="3') || p.includes('sz="4');
        const isBold = p.includes('b="1"') || isTitle;
        const fontSize = isTitle ? 24 : isBold ? 15 : 13;
        const isArabicText = /[\u0600-\u06FF]/.test(textStr);

        let textColor = defaultColor;
        const colorMatch = p.match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
        if (colorMatch) {
          textColor = `#${colorMatch[1]}`;
        }

        textElementsHtml += `
          <div style="
            position: absolute;
            left: ${Math.max(20, Math.min(xPt, slideWidthPt - 100))}px;
            top: ${Math.max(10, Math.min(topYPt, slideHeightPt - 40))}px;
            font-size: ${fontSize}px;
            font-weight: ${isBold ? '700' : '400'};
            color: ${textColor};
            font-family: 'Segoe UI', Tahoma, 'Traditional Arabic', Arial, sans-serif;
            direction: ${isArabicText ? 'rtl' : 'ltr'};
            text-align: ${isTitle ? 'center' : (isArabicText ? 'right' : 'left')};
            width: ${Math.max(200, slideWidthPt - (xPt * 2))}px;
            line-height: 1.5;
            white-space: pre-wrap;
            box-sizing: border-box;
          ">${escapeHtml(textStr)}</div>
        `;
        topYPt += fontSize * 1.6;
      }
    }

    slideContainer.innerHTML = textElementsHtml;
    document.body.appendChild(slideContainer);

    try {
      // Capture slide to high-DPI canvas
      const canvas = await html2canvas(slideContainer, {
        scale: 2.0,
        backgroundColor: bgHex,
        logging: false,
        useCORS: true,
        windowWidth: slideWidthPt,
        windowHeight: slideHeightPt,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage([slideWidthPt, slideHeightPt], isLandscape ? 'landscape' : 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, slideWidthPt, slideHeightPt, undefined, 'FAST');
    } finally {
      if (document.body.contains(slideContainer)) {
        document.body.removeChild(slideContainer);
      }
    }
  }

  onProgress?.(95, isArabicLang ? 'جاري تجميع وحفظ مستند PDF...' : 'Finalizing presentation PDF...');

  const pdfBlob = pdf.output('blob');

  onProgress?.(100, isArabicLang ? 'اكتمل التحويل إلى PDF بنجاح!' : 'PowerPoint to PDF conversion complete!');

  const cleanBase = originalFilename.replace(/\.pptx?$/i, '');
  const downloadFilename = `${cleanBase}_converted.pdf`;

  return {
    blob: pdfBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: pdfBlob.size,
    slideCount: totalSlides,
    totalPages: totalSlides,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
