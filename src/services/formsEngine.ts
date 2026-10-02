import { PDFDocument, StandardFonts, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFButton, rgb } from 'pdf-lib';
import { FormFieldItem, PdfFormFieldType } from '../types/tools';

export interface FormsValidationResult {
  isValid: boolean;
  error?: string;
  file?: {
    name: string;
    size: number;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
    fields: FormFieldItem[];
  };
}

export interface FormsExecutionResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  totalPages: number;
  fieldsFilledCount: number;
}

/**
 * Extracts all fillable AcroForm fields from a PDF ArrayBuffer.
 */
export async function extractAcroFormFields(
  arrayBuffer: ArrayBuffer
): Promise<{ fields: FormFieldItem[]; pageCount: number }> {
  const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  let form;
  try {
    form = pdfDoc.getForm();
  } catch {
    return { fields: [], pageCount };
  }

  let pdfFields;
  try {
    pdfFields = form.getFields();
  } catch {
    return { fields: [], pageCount };
  }

  const items: FormFieldItem[] = [];

  for (let i = 0; i < pdfFields.length; i++) {
    const f = pdfFields[i];
    const name = f.getName();
    let type: PdfFormFieldType = 'unknown';
    let value: string | boolean = '';
    let defaultValue: string | boolean = '';
    let options: string[] | undefined = undefined;
    let isMultiline = false;
    let isReadOnly = false;
    let isRequired = false;

    if (f instanceof PDFTextField) {
      type = 'text';
      value = f.getText() || '';
      defaultValue = value;
      isMultiline = f.isMultiline();
      isReadOnly = f.isReadOnly();
      isRequired = f.isRequired();
    } else if (f instanceof PDFCheckBox) {
      type = 'checkbox';
      value = f.isChecked();
      defaultValue = value;
      isReadOnly = f.isReadOnly();
      isRequired = f.isRequired();
    } else if (f instanceof PDFDropdown) {
      type = 'dropdown';
      options = f.getOptions();
      const selected = f.getSelected();
      value = selected && selected.length > 0 ? selected[0] : (options[0] || '');
      defaultValue = value;
      isReadOnly = f.isReadOnly();
      isRequired = f.isRequired();
    } else if (f instanceof PDFRadioGroup) {
      type = 'radio';
      options = f.getOptions();
      value = f.getSelected() || options[0] || '';
      defaultValue = value;
      isReadOnly = f.isReadOnly();
      isRequired = f.isRequired();
    } else if (f instanceof PDFButton) {
      type = 'button';
      value = '';
    }

    items.push({
      id: `form-field-${i}-${name}`,
      name,
      type,
      value,
      defaultValue,
      options,
      isMultiline,
      isReadOnly,
      isRequired,
    });
  }

  return { fields: items, pageCount };
}

/**
 * Validates a PDF file for interactive form handling.
 */
export async function validatePdfFormFile(
  file: File,
  isArabic: boolean = false
): Promise<FormsValidationResult> {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف المحدد ليس بصيغة PDF صالحة. يرجى اختيار مستند PDF.'
        : 'The selected file is not a valid PDF document. Please select a PDF file.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: isArabic
        ? 'الملف فارغ (0 بايت). يرجى اختيار مستند PDF صالح.'
        : 'The selected file is empty (0 bytes). Please upload a valid PDF document.',
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const { fields, pageCount } = await extractAcroFormFields(arrayBuffer);

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        arrayBuffer,
        pageCount,
        fields,
      },
    };
  } catch (err: unknown) {
    return {
      isValid: false,
      error: isArabic
        ? `تعذر قراءة حقول نموذج PDF (${String(err).slice(0, 80)}).`
        : `Unable to read PDF form fields (${String(err).slice(0, 80)}).`,
    };
  }
}

/**
 * ACROFORM FILLING & FLATTENING ENGINE
 * 
 * Writes user values into AcroForm fields, updates font appearances,
 * flattens the document into permanent uneditable vector content, and exports.
 */
export async function executeFillAndFlattenForm(
  arrayBuffer: ArrayBuffer,
  _originalFilename: string,
  fieldValues: Record<string, string | boolean>,
  flattenForm: boolean = true,
  onProgress?: (percent: number, status: string) => void,
  isArabic: boolean = false
): Promise<FormsExecutionResult> {
  onProgress?.(15, isArabic ? 'جاري فتح وقراءة بنية الحقول التفاعلية...' : 'Loading interactive PDF AcroForm stream...');

  // Step A: Load PDF buffer
  const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(35, isArabic ? 'جاري مطابقة وكتابة البيانات في الحقول...' : 'Populating form field values...');

  let form;
  let pdfFields: any[] = [];
  try {
    form = pdfDoc.getForm();
    pdfFields = form.getFields();
  } catch {
    form = null;
  }

  let fieldsFilledCount = 0;

  if (form && pdfFields.length > 0) {
    // Step D: Write values back to fields
    for (const f of pdfFields) {
      const name = f.getName();
      if (!(name in fieldValues)) continue;

      const userVal = fieldValues[name];

      try {
        if (f instanceof PDFTextField) {
          f.setText(String(userVal ?? ''));
          fieldsFilledCount++;
        } else if (f instanceof PDFCheckBox) {
          if (Boolean(userVal)) {
            f.check();
          } else {
            f.uncheck();
          }
          fieldsFilledCount++;
        } else if (f instanceof PDFDropdown) {
          if (userVal) {
            f.select(String(userVal));
            fieldsFilledCount++;
          }
        } else if (f instanceof PDFRadioGroup) {
          if (userVal) {
            f.select(String(userVal));
            fieldsFilledCount++;
          }
        }
      } catch {
        // Continue safely if single field update fails
      }
    }

    onProgress?.(65, isArabic ? 'جاري تحديث المظهر وتضمين الخط القياسي...' : 'Embedding standard typography & updating appearances...');

    // Step E: Font Handling
    try {
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      form.updateFieldAppearances(helveticaFont);
    } catch {
      // Fallback
    }

    // Step F: Flattening
    if (flattenForm) {
      onProgress?.(85, isArabic ? 'جاري تجميد وتثبيت النموذج (Flatten Form)...' : 'Flattening AcroForm into permanent document text...');
      try {
        form.flatten();
      } catch {
        // Fallback
      }
    }
  }

  onProgress?.(95, isArabic ? 'جاري حفظ وحزم ملف PDF النهائي...' : 'Saving completed PDF document...');

  const pdfBytes = await pdfDoc.save();
  const safeBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  const blob = new Blob([safeBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabic ? 'تم تعبئة وتجميد النموذج بنجاح!' : 'Form populated and flattened successfully!');

  const downloadFilename = 'kanto-filled-form.pdf';

  return {
    blob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: pdfBytes.byteLength,
    totalPages,
    fieldsFilledCount,
  };
}

/**
 * Creates a beautiful sample interactive PDF AcroForm for testing and demonstrations.
 */
export async function createSampleFillableForm(isArabic: boolean = false): Promise<{ file: File; fields: FormFieldItem[] }> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header Banner
  page.drawRectangle({
    x: 40,
    y: 735,
    width: 515.28,
    height: 65,
    color: rgb(0.05, 0.08, 0.12),
  });

  page.drawText('KANTO INTERACTIVE VERIFIED ACROFORM', {
    x: 55,
    y: 768,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText('Official Digital Registration & Disclosure Document (Form K-2026)', {
    x: 55,
    y: 748,
    size: 9,
    font: regFont,
    color: rgb(0.7, 0.75, 0.8),
  });

  page.drawText('Fill the interactive fields below and click Export to freeze the entries permanently.', {
    x: 40,
    y: 705,
    size: 10,
    font: regFont,
    color: rgb(0.3, 0.35, 0.4),
  });

  const form = pdfDoc.getForm();

  // 1. Full Legal Name
  page.drawText('1. Full Legal Name / Full Signatory Entity:', { x: 40, y: 665, size: 10, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  const nameField = form.createTextField('fullName');
  nameField.setText('Jane Doe, Principal Engineer');
  nameField.addToPage(page, { x: 40, y: 632, width: 515, height: 26 });

  // 2. Email Address
  page.drawText('2. Business Email Address:', { x: 40, y: 605, size: 10, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  const emailField = form.createTextField('emailAddress');
  emailField.setText('jane.doe@enterprise-kanto.com');
  emailField.addToPage(page, { x: 40, y: 572, width: 515, height: 26 });

  // 3. Organization / Company
  page.drawText('3. Organization & Division:', { x: 40, y: 545, size: 10, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  const orgField = form.createTextField('organization');
  orgField.setText('Kanto Global Technologies Inc.');
  orgField.addToPage(page, { x: 40, y: 512, width: 250, height: 26 });

  // 4. Department Dropdown
  page.drawText('4. Primary Department:', { x: 305, y: 545, size: 10, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  const deptDropdown = form.createDropdown('department');
  deptDropdown.addOptions(['Engineering & Architecture', 'Financial Operations', 'Legal & Compliance', 'Executive Leadership']);
  deptDropdown.select('Engineering & Architecture');
  deptDropdown.addToPage(page, { x: 305, y: 512, width: 250, height: 26 });

  // 5. Checkboxes
  const termsCb = form.createCheckBox('agreeTerms');
  termsCb.check();
  termsCb.addToPage(page, { x: 40, y: 460, width: 16, height: 16 });
  page.drawText('I confirm that all provided disclosures are complete, verifiable, and legally binding.', {
    x: 64,
    y: 464,
    size: 9.5,
    font: regFont,
    color: rgb(0.15, 0.15, 0.15),
  });

  const ndaCb = form.createCheckBox('agreeNda');
  ndaCb.check();
  ndaCb.addToPage(page, { x: 40, y: 430, width: 16, height: 16 });
  page.drawText('I consent to confidential cryptographic archival compliance.', {
    x: 64,
    y: 434,
    size: 9.5,
    font: regFont,
    color: rgb(0.15, 0.15, 0.15),
  });

  const pdfBytes = await pdfDoc.save();
  const safeBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  const file = new File(
    [safeBuffer],
    isArabic ? 'نموذج_تفاعلي_قابل_للتعبئة.pdf' : 'interactive_fillable_form.pdf',
    { type: 'application/pdf' }
  );

  const { fields } = await extractAcroFormFields(safeBuffer);
  return { file, fields };
}
