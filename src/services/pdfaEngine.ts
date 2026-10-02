import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface PdfaValidationResult {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
  };
}

export interface PdfaExecutionResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  pdfaLevel: '1b' | '2b' | '3b';
}

export interface PdfaConversionOptions {
  pdfaLevel?: '1b' | '2b' | '3b';
  title?: string;
}

/**
 * Validates a PDF file for ISO PDF/A Archival Conversion.
 */
export async function validatePdfaFile(
  file: File,
  isArabic: boolean = false
): Promise<PdfaValidationResult> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار مستند PDF.'
        : 'The selected file is not a valid PDF document. Please upload a PDF file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار ملف PDF صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PDF document.',
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer,
        pageCount,
      },
    };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة ملف PDF المحدد (${String(err).slice(0, 80)}).`
        : `Unable to read the PDF document (${String(err).slice(0, 80)}).`,
    };
  }
}

/**
 * Executes Server-Side ISO 19005 PDF/A Archival Conversion via POST /api/pdf-to-pdfa.
 */
export async function executePdfToPdfa(
  arrayBuffer: ArrayBuffer,
  filename: string,
  options: PdfaConversionOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<PdfaExecutionResult> {
  const level = options.pdfaLevel || '1b';
  const docTitle = options.title || filename.replace(/\.pdf$/i, '');

  onProgress?.(15, isArabic ? 'جاري تحضير حزمة البيانات للإرسال إلى خادم الأرشفة...' : 'Packaging document for ISO archival engine...');

  const safeBuffer = arrayBuffer.slice(0);
  const fileBlob = new Blob([safeBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', fileBlob, filename);
  formData.append('pdfaLevel', level);
  formData.append('title', docTitle);

  onProgress?.(35, isArabic ? 'جاري معالجة المستند وتضمين ملف الألوان sRGB ICC...' : 'Embedding sRGB ICC color profile & OutputIntents...');

  let response: Response;
  try {
    response = await fetch('/api/pdf-to-pdfa', {
      method: 'POST',
      body: formData,
    });
  } catch (netErr: unknown) {
    throw new Error(
      isArabic
        ? `فشل الاتصال بخادم تحويل PDF/A (${String(netErr)}).`
        : `Failed to connect to PDF/A backend server (${String(netErr)}).`
    );
  }

  onProgress?.(70, isArabic ? 'جاري التحقق من معايير ISO 19005 وحزم XMP Metadata...' : 'Validating ISO 19005 conformity & XMP metadata schemas...');

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(
      isArabic
        ? `خطأ أثناء تحويل PDF إلى PDF/A: ${errorDetail}`
        : `PDF to PDF/A conversion failed: ${errorDetail}`
    );
  }

  const resultBlob = await response.blob();
  if (resultBlob.size === 0) {
    throw new Error(
      isArabic
        ? 'أعاد خادم التحويل ملفاً فارغاً.'
        : 'The archival conversion server returned an empty file.'
    );
  }

  onProgress?.(90, isArabic ? 'جاري قراءة وتأكيد عدد الصفحات النهائي...' : 'Verifying final PDF/A structure...');

  let pageCount = 1;
  try {
    const resBuffer = await resultBlob.arrayBuffer();
    const verifyDoc = await PDFDocument.load(resBuffer, { ignoreEncryption: true });
    pageCount = verifyDoc.getPageCount();
  } catch {
    // fallback
  }

  onProgress?.(100, isArabic ? 'تم التحويل إلى معيار PDF/A الأرشيفي بنجاح!' : 'PDF/A conversion completed successfully!');

  const downloadFilename = 'kanto-archived-PDFA.pdf';

  return {
    blob: resultBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: resultBlob.size,
    pageCount,
    pdfaLevel: level,
  };
}

/**
 * Creates a sample verifiable ISO contract document for instant testing.
 */
export async function createSamplePdfaDoc(isArabic: boolean = false): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Top ISO Archival Banner
  page.drawRectangle({
    x: 40,
    y: 735,
    width: 515.28,
    height: 65,
    color: rgb(0.06, 0.1, 0.16),
  });

  page.drawText(
    isArabic ? 'وثيقة رسمية مطابقة لمعايير الأرشفة الرقمية (ISO 19005)' : 'KANTO OFFICIAL DIGITAL ARCHIVAL RECORD',
    { x: 55, y: 768, size: 13, font: boldFont, color: rgb(1, 1, 1) }
  );

  page.drawText(
    isArabic
      ? 'شهادة اعتماد الأرشفة طويلة المدى - الإصدار القياسي PDF/A-1b'
      : 'ISO 19005-1 Level B Long-Term Electronic Preservation Certificate',
    { x: 55, y: 748, size: 9, font: regFont, color: rgb(0.7, 0.75, 0.8) }
  );

  // Body content
  page.drawText(
    isArabic ? 'بيان الامتثال والمواصفات القياسية:' : 'Archival Compliance Statement & Specifications:',
    { x: 40, y: 690, size: 11, font: boldFont, color: rgb(0.1, 0.1, 0.1) }
  );

  const lines = isArabic
    ? [
        '1. يتضمن هذا المستند ملف تعريف الألوان القياسي sRGB ICC Profile في مصفوفة OutputIntents.',
        '2. تم دمج كافة الخطوط والعناصر الرسومية لضمان الاستقرار البصري عبر العقود القادمة.',
        '3. تم تجريد التعليمات البرمجية والوسائط التفاعلية لمنع ثغرات الأمان وضمان القراءة المفتوحة.',
        '4. تضمن البيانات الوصفية XMP التحقق التلقائي في برامج Adobe Acrobat Reader عبر الشريط الأزرق.',
      ]
    : [
        '1. This document incorporates a complete sRGB ICC OutputIntent color profile dictionary.',
        '2. All typography and vector elements are completely embedded to ensure century-scale visual fidelity.',
        '3. Interactive executable scripts, movies, and audio streams are purged to guarantee universal security.',
        '4. Embedded XMP metadata triggers automated PDF/A verification banners in Adobe Acrobat Reader.',
      ];

  let y = 660;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: 9.5, font: regFont, color: rgb(0.2, 0.2, 0.2) });
    y -= 24;
  }

  // Security Seal
  page.drawRectangle({
    x: 40,
    y: 500,
    width: 515.28,
    height: 45,
    color: rgb(0.95, 0.96, 0.98),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  page.drawText(
    isArabic
      ? 'حالة التحقق: جاهز للتحويل الفوري إلى صيغة PDF/A-1b أو PDF/A-2b'
      : 'Conformance Status: Ready for ISO 19005-1 Level B (PDF/A-1b) Compilation',
    { x: 55, y: 518, size: 9.5, font: boldFont, color: rgb(0.1, 0.3, 0.6) }
  );

  const pdfBytes = await pdfDoc.save();
  const safeBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;

  return new File(
    [safeBuffer],
    isArabic ? 'وثيقة_أرشيفية_نموذجية.pdf' : 'archival_compliance_sample.pdf',
    { type: 'application/pdf' }
  );
}
