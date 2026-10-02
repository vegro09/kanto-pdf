import { ToolDef } from '../types/tools';

export const TOOLS_LIST: ToolDef[] = [
  {
    id: 'merge-pdf',
    key: 'merge',
    nameKey: 'tool_merge_name',
    descKey: 'tool_merge_desc',
    category: 'organize',
    badge: 'POPULAR',
    icon: 'Layers',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 20
  },
  {
    id: 'split-pdf',
    key: 'split',
    nameKey: 'tool_split_name',
    descKey: 'tool_split_desc',
    category: 'organize',
    badge: 'HOT',
    icon: 'Scissors',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'compress-pdf',
    key: 'compress',
    nameKey: 'tool_compress_name',
    descKey: 'tool_compress_desc',
    category: 'organize',
    badge: 'POPULAR',
    icon: 'Minimize2',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'pdf-to-word',
    key: 'pdfToWord',
    nameKey: 'tool_pdf_word_name',
    descKey: 'tool_pdf_word_desc',
    category: 'convert-to',
    badge: 'HOT',
    icon: 'FileType2',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'pdf-to-powerpoint',
    key: 'pdfToPpt',
    nameKey: 'tool_pdf_ppt_name',
    descKey: 'tool_pdf_ppt_desc',
    category: 'convert-to',
    icon: 'Presentation',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'pdf-to-excel',
    key: 'pdfToExcel',
    nameKey: 'tool_pdf_excel_name',
    descKey: 'tool_pdf_excel_desc',
    category: 'convert-to',
    icon: 'Sheet',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'word-to-pdf',
    key: 'wordToPdf',
    nameKey: 'tool_word_pdf_name',
    descKey: 'tool_word_pdf_desc',
    category: 'convert-from',
    icon: 'FileText',
    acceptedFileTypes: ['.docx', '.doc'],
    maxFiles: 5
  },
  {
    id: 'powerpoint-to-pdf',
    key: 'pptToPdf',
    nameKey: 'tool_ppt_pdf_name',
    descKey: 'tool_ppt_pdf_desc',
    category: 'convert-from',
    icon: 'FileSpreadsheet',
    acceptedFileTypes: ['.pptx', '.ppt'],
    maxFiles: 5
  },
  {
    id: 'excel-to-pdf',
    key: 'excelToPdf',
    nameKey: 'tool_excel_pdf_name',
    descKey: 'tool_excel_pdf_desc',
    category: 'convert-from',
    icon: 'Table',
    acceptedFileTypes: ['.xlsx', '.xls', '.csv'],
    maxFiles: 5
  },
  {
    id: 'edit-pdf',
    key: 'edit',
    nameKey: 'tool_edit_name',
    descKey: 'tool_edit_desc',
    category: 'organize',
    badge: 'NEW',
    icon: 'PenTool',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'pdf-to-jpg',
    key: 'pdfToJpg',
    nameKey: 'tool_pdf_jpg_name',
    descKey: 'tool_pdf_jpg_desc',
    category: 'convert-to',
    icon: 'Image',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'jpg-to-pdf',
    key: 'jpgToPdf',
    nameKey: 'tool_jpg_pdf_name',
    descKey: 'tool_jpg_pdf_desc',
    category: 'convert-from',
    icon: 'Images',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20
  },
  {
    id: 'sign-pdf',
    key: 'sign',
    nameKey: 'tool_sign_name',
    descKey: 'tool_sign_desc',
    category: 'security',
    badge: 'PRO',
    icon: 'Feather',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'watermark-pdf',
    key: 'watermark',
    nameKey: 'tool_watermark_name',
    descKey: 'tool_watermark_desc',
    category: 'organize',
    icon: 'Stamp',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'rotate-pdf',
    key: 'rotate',
    nameKey: 'tool_rotate_name',
    descKey: 'tool_rotate_desc',
    category: 'organize',
    icon: 'RotateCw',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'pdf-to-html',
    key: 'pdfToHtml',
    nameKey: 'tool_pdf_html_name',
    descKey: 'tool_pdf_html_desc',
    category: 'convert-to',
    badge: 'HOT',
    icon: 'Code2',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'html-to-pdf',
    key: 'htmlToPdf',
    nameKey: 'tool_html_pdf_name',
    descKey: 'tool_html_pdf_desc',
    category: 'convert-from',
    icon: 'Code2',
    acceptedFileTypes: ['.html', '.htm', '.txt'],
    maxFiles: 3
  },
  {
    id: 'unlock-pdf',
    key: 'unlock',
    nameKey: 'tool_unlock_name',
    descKey: 'tool_unlock_desc',
    category: 'security',
    icon: 'Unlock',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'protect-pdf',
    key: 'protect',
    nameKey: 'tool_protect_name',
    descKey: 'tool_protect_desc',
    category: 'security',
    badge: 'PRO',
    icon: 'Lock',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'organize-pdf',
    key: 'organize',
    nameKey: 'tool_organize_name',
    descKey: 'tool_organize_desc',
    category: 'organize',
    badge: 'HOT',
    icon: 'Grid',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'pdf-to-pdfa',
    key: 'pdfToPdfa',
    nameKey: 'tool_pdfa_name',
    descKey: 'tool_pdfa_desc',
    category: 'convert-to',
    badge: 'ISO',
    icon: 'Archive',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'repair-pdf',
    key: 'repair',
    nameKey: 'tool_repair_name',
    descKey: 'tool_repair_desc',
    category: 'organize',
    icon: 'Wrench',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'page-numbers',
    key: 'pageNumbers',
    nameKey: 'tool_page_numbers_name',
    descKey: 'tool_page_numbers_desc',
    category: 'organize',
    icon: 'Binary',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 5
  },
  {
    id: 'scan-to-pdf',
    key: 'scanToPdf',
    nameKey: 'tool_scan_pdf_name',
    descKey: 'tool_scan_pdf_desc',
    category: 'convert-from',
    icon: 'Scan',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
    maxFiles: 10
  },
  {
    id: 'redact-pdf',
    key: 'redact',
    nameKey: 'tool_redact_name',
    descKey: 'tool_redact_desc',
    category: 'security',
    badge: 'PRO',
    icon: 'EyeOff',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'crop-pdf',
    key: 'crop',
    nameKey: 'tool_crop_name',
    descKey: 'tool_crop_desc',
    category: 'organize',
    icon: 'Crop',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  },
  {
    id: 'pdf-forms',
    key: 'forms',
    nameKey: 'tool_forms_name',
    descKey: 'tool_forms_desc',
    category: 'organize',
    icon: 'CheckSquare',
    acceptedFileTypes: ['.pdf'],
    maxFiles: 1
  }
];
