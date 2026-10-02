import React from 'react';
import { ToolDef, UploadedFileItem, PdfPageItem, ScreenState, ProcessResult, ToolActionParams } from '../types/tools';
import { MergeInputFile } from './mergeEngine';
import { SupportedLanguage } from '../context/LanguageContext';
import { ImageInputItem } from './jpgToPdfEngine';
import { OrganizePageItem } from './organizeEngine';

export interface LoadSampleContext {
  selectedTool: ToolDef;
  isRtl: boolean;
  lang: SupportedLanguage;
  setMergeFiles: React.Dispatch<React.SetStateAction<MergeInputFile[]>>;
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFileItem[]>>;
  setActiveFileIndex: (idx: number) => void;
  setActivePages: React.Dispatch<React.SetStateAction<PdfPageItem[]>>;
  setScreenState: (s: ScreenState) => void;
  setProcessResult: (r: ProcessResult | null) => void;
  syncUrl: (lang: SupportedLanguage, screen: ScreenState, tool: ToolDef | null) => void;
  setErrorMessage: (msg: string | null) => void;
  setActionParams: React.Dispatch<React.SetStateAction<ToolActionParams>>;
  setEditAnnotations?: any;
  setEditActivePageIndex?: any;
  setJpgToPdfImages?: any;
  setOrganizePages?: any;
  setFormFields?: any;
  setFormFieldValues?: any;
  setScannedPages?: any;
}

export async function runLoadSampleDoc(ctx: LoadSampleContext): Promise<void> {
  const {
    selectedTool,
    isRtl,
    lang,
    setMergeFiles,
    setUploadedFiles,
    setActiveFileIndex,
    setActivePages,
    setScreenState,
    setProcessResult,
    syncUrl,
    setErrorMessage,
    setActionParams = () => {},
    setEditAnnotations = () => {},
    setEditActivePageIndex = () => {},
    setJpgToPdfImages = () => {},
    setOrganizePages = () => {},
    setFormFields = () => {},
    setFormFieldValues = () => {},
    setScannedPages = () => {},
  } = ctx;

    setErrorMessage(null);
    try {
      // Sample for Merge PDF
      if (selectedTool.key === 'merge') {
        const { createSamplePdf } = await import('../services/pdfEngine');
        const s1 = await createSamplePdf(isRtl);
        const s2 = await createSamplePdf(isRtl);

        const m1: MergeInputFile = {
          id: 'sample-merge-1',
          name: isRtl ? 'تقرير_العمليات_الرئيسي.pdf' : 'operations_report_v1.pdf',
          size: s1.buffer.byteLength,
          pageCount: s1.pages.length,
          arrayBuffer: s1.buffer,
        };

        const m2: MergeInputFile = {
          id: 'sample-merge-2',
          name: isRtl ? 'الملحق_المالي_والتوثيق.pdf' : 'financial_appendix_v2.pdf',
          size: s2.buffer.byteLength,
          pageCount: s2.pages.length,
          arrayBuffer: s2.buffer,
        };

        setMergeFiles([m1, m2]);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Split PDF (6 rich pages)
      if (selectedTool.key === 'split') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const chapterTitles = isRtl
          ? ['الفصل الأول: نظرة عامة', 'الفصل الثاني: البنية التحتية', 'الفصل الثالث: تقييم الأداء', 'الفصل الرابع: الأمان والخصوصية', 'الفصل الخامس: التوصيات', 'الملحق الفني']
          : ['Chapter 1: Overview', 'Chapter 2: Architecture', 'Chapter 3: Benchmarks', 'Chapter 4: Cryptography', 'Chapter 5: Roadmap', 'Technical Appendix'];

        for (let i = 0; i < 6; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawText(`Kanto PDF Multi-Page Document — Page ${i + 1} of 6`, {
            x: 50,
            y: 800,
            size: 14,
            font: font,
            color: rgb(0.1, 0.1, 0.1),
          });
          page.drawText(chapterTitles[i], {
            x: 50,
            y: 750,
            size: 20,
            font: font,
            color: rgb(0.15, 0.15, 0.15),
          });
          page.drawText('This sample document is rendered in-browser for zero-server testing.', {
            x: 50,
            y: 710,
            size: 11,
            font: regFont,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'مستند_كانتو_نموذجي_6_صفحات.pdf' : 'kanto_multipage_sample_6pages.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 4, originalIndex: 3, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 5, originalIndex: 4, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 6, originalIndex: 5, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-split-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 6,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Compress PDF (Multi-page graphical document)
      if (selectedTool.key === 'compress') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        for (let i = 0; i < 4; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawRectangle({
            x: 40,
            y: 730,
            width: 515.28,
            height: 70,
            color: rgb(0.08, 0.08, 0.08),
          });
          page.drawText(`KANTO HIGH-DENSITY REPORT — SECTION ${i + 1}`, {
            x: 60,
            y: 760,
            size: 15,
            font: font,
            color: rgb(1, 1, 1),
          });

          for (let j = 0; j < 5; j++) {
            page.drawRectangle({
              x: 60 + j * 95,
              y: 480,
              width: 80,
              height: 200 + (j * 10),
              color: rgb(0.85 - j * 0.08, 0.88 - j * 0.08, 0.92 - j * 0.06),
            });
          }

          page.drawText('Sample multi-page document prepared for real-time WebAssembly compression testing.', {
            x: 60,
            y: 430,
            size: 12,
            font: regFont,
            color: rgb(0.2, 0.2, 0.2),
          });
        }

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'تقرير_كبير_للضغط.pdf' : 'heavy_report_for_compression.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 4, originalIndex: 3, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-compress-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 4,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({ ...prev, compressPreset: 'recommended' }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to Word (Multi-page structured article with headings and paragraphs)
      if (selectedTool.key === 'pdfToWord' || selectedTool.id === 'pdf-to-word') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: Title, Executive Summary, Headings
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawText('KANTO QUARTERLY RESEARCH WHITE PAPER', {
          x: 50,
          y: 770,
          size: 22,
          font: boldFont,
          color: rgb(0.08, 0.08, 0.08),
        });
        p1.drawText('Section 1: Executive Overview & Client-Side Architecture', {
          x: 50,
          y: 730,
          size: 15,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        p1.drawText('This document demonstrates structured paragraph extraction from PDF to Microsoft Word (.docx).', {
          x: 50,
          y: 690,
          size: 11,
          font: regFont,
          color: rgb(0.25, 0.25, 0.25),
        });
        p1.drawText('WebAssembly cryptographic modules execute natively on device hardware, completely bypassing remote cloud processing.', {
          x: 50,
          y: 660,
          size: 11,
          font: regFont,
          color: rgb(0.25, 0.25, 0.25),
        });

        p1.drawText('Section 2: Technical Specifications & Data Privacy', {
          x: 50,
          y: 610,
          size: 15,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        p1.drawText('All extracted paragraphs, text styles, and headings are converted into standard Word XML structures.', {
          x: 50,
          y: 575,
          size: 11,
          font: regFont,
          color: rgb(0.25, 0.25, 0.25),
        });

        // Page 2: Recommendations
        const p2 = doc.addPage([595.28, 841.89]);
        p2.drawText('Section 3: Strategic Roadmap & Deployment Guidelines', {
          x: 50,
          y: 770,
          size: 18,
          font: boldFont,
          color: rgb(0.08, 0.08, 0.08),
        });
        p2.drawText('Editable text runs preserve line breaks and reading order across multi-page document decks.', {
          x: 50,
          y: 730,
          size: 11,
          font: regFont,
          color: rgb(0.25, 0.25, 0.25),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'مستند_أبحاث_كانتو_لتحويل_Word.pdf' : 'kanto_research_for_word_conversion.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-word-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to PowerPoint (Widescreen 16:9 Presentation Deck with Graphics & Metrics)
      if (selectedTool.key === 'pdfToPpt' || selectedTool.id === 'pdf-to-powerpoint') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Slide 1: 16:9 Title Slide (960 x 540)
        const p1 = doc.addPage([960, 540]);
        p1.drawRectangle({ x: 0, y: 0, width: 960, height: 540, color: rgb(0.06, 0.08, 0.12) });
        p1.drawText('KANTO ENTERPRISE ARCHITECTURE 2026', {
          x: 60,
          y: 430,
          size: 28,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('Next-Generation Client-Side PDF Cryptography & Document Engines', {
          x: 60,
          y: 380,
          size: 16,
          font: regFont,
          color: rgb(0.78, 0.82, 0.88),
        });

        // Metric Card 1
        p1.drawRectangle({ x: 60, y: 140, width: 260, height: 180, color: rgb(0.12, 0.15, 0.22) });
        p1.drawText('0.0 ms', { x: 80, y: 250, size: 36, font: boldFont, color: rgb(0.2, 0.8, 0.4) });
        p1.drawText('Server Data Exposure', { x: 80, y: 210, size: 14, font: regFont, color: rgb(0.9, 0.9, 0.9) });
        p1.drawText('Complete Zero-Knowledge Architecture', { x: 80, y: 175, size: 11, font: regFont, color: rgb(0.6, 0.65, 0.72) });

        // Metric Card 2
        p1.drawRectangle({ x: 350, y: 140, width: 260, height: 180, color: rgb(0.12, 0.15, 0.22) });
        p1.drawText('100% Native', { x: 370, y: 250, size: 36, font: boldFont, color: rgb(0.38, 0.68, 0.98) });
        p1.drawText('In-Browser Execution', { x: 370, y: 210, size: 14, font: regFont, color: rgb(0.9, 0.9, 0.9) });
        p1.drawText('WebAssembly & High-DPI Canvas', { x: 370, y: 175, size: 11, font: regFont, color: rgb(0.6, 0.65, 0.72) });

        // Metric Card 3
        p1.drawRectangle({ x: 640, y: 140, width: 260, height: 180, color: rgb(0.12, 0.15, 0.22) });
        p1.drawText('100% RTL', { x: 660, y: 250, size: 36, font: boldFont, color: rgb(0.98, 0.75, 0.25) });
        p1.drawText('Layout & Typography', { x: 660, y: 210, size: 14, font: regFont, color: rgb(0.9, 0.9, 0.9) });
        p1.drawText('Perfect Visual Alignment Guarantee', { x: 660, y: 175, size: 11, font: regFont, color: rgb(0.6, 0.65, 0.72) });

        // Slide 2: Strategic Roadmap (960 x 540)
        const p2 = doc.addPage([960, 540]);
        p2.drawRectangle({ x: 0, y: 0, width: 960, height: 540, color: rgb(0.96, 0.96, 0.98) });
        p2.drawRectangle({ x: 50, y: 440, width: 860, height: 60, color: rgb(0.08, 0.12, 0.2) });
        p2.drawText('STRATEGIC ROADMAP: ENTERPRISE DOCUMENT PIPELINE', {
          x: 70,
          y: 462,
          size: 18,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        p2.drawText('High-fidelity rasterization converts every PDF page into a presentation slide without text corruption.', {
          x: 60,
          y: 390,
          size: 13,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'عرض_تقديمي_كانتو_لتحويل_البوربوينت.pdf' : 'kanto_presentation_deck_for_powerpoint.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-ppt-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to Excel (Financial Ledger Table with Numerical Columns)
      if (selectedTool.key === 'pdfToExcel' || selectedTool.id === 'pdf-to-excel') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: Financial Ledger
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawText('KANTO ENTERPRISE FINANCIAL LEDGER Q3 2026', {
          x: 50,
          y: 780,
          size: 16,
          font: boldFont,
          color: rgb(0.08, 0.08, 0.08),
        });
        p1.drawText('Generated for spatial tabular parsing into Microsoft Excel (.xlsx)', {
          x: 50,
          y: 755,
          size: 10,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });

        // Table Header
        p1.drawText('Transaction ID', { x: 50, y: 710, size: 11, font: boldFont });
        p1.drawText('Client Account', { x: 160, y: 710, size: 11, font: boldFont });
        p1.drawText('Region', { x: 300, y: 710, size: 11, font: boldFont });
        p1.drawText('Units', { x: 390, y: 710, size: 11, font: boldFont });
        p1.drawText('Revenue', { x: 460, y: 710, size: 11, font: boldFont });

        // Row 1
        p1.drawText('TX-90210', { x: 50, y: 675, size: 10, font: regFont });
        p1.drawText('Acme Global Corp', { x: 160, y: 675, size: 10, font: regFont });
        p1.drawText('US-East', { x: 300, y: 675, size: 10, font: regFont });
        p1.drawText('150', { x: 390, y: 675, size: 10, font: regFont });
        p1.drawText('$45,000.00', { x: 460, y: 675, size: 10, font: regFont });

        // Row 2
        p1.drawText('TX-90211', { x: 50, y: 645, size: 10, font: regFont });
        p1.drawText('Starlight Ventures', { x: 160, y: 645, size: 10, font: regFont });
        p1.drawText('EU-Central', { x: 300, y: 645, size: 10, font: regFont });
        p1.drawText('85', { x: 390, y: 645, size: 10, font: regFont });
        p1.drawText('$28,500.00', { x: 460, y: 645, size: 10, font: regFont });

        // Row 3
        p1.drawText('TX-90212', { x: 50, y: 615, size: 10, font: regFont });
        p1.drawText('Oasis Digital Media', { x: 160, y: 615, size: 10, font: regFont });
        p1.drawText('MENA-Riyadh', { x: 300, y: 615, size: 10, font: regFont });
        p1.drawText('240', { x: 390, y: 615, size: 10, font: regFont });
        p1.drawText('$72,000.00', { x: 460, y: 615, size: 10, font: regFont });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'سجل_مالي_لتحويل_إكسيل.pdf' : 'financial_ledger_for_excel.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-excel-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Word to PDF (Sample Word .docx document with headers, paragraphs & table)
      if (selectedTool.key === 'wordToPdf' || selectedTool.id === 'word-to-pdf') {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import('docx');

        const docxObj = new Document({
          sections: [{
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: isRtl ? 'اتفاقية تقديم خدمات تقنية ومستندات' : 'Enterprise Service Agreement 2026', bold: true })]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: isRtl
                      ? 'تم تحرير هذا المستند كملف Word لتحويله عبر متصفحك إلى PDF بدقة طباعة فائقة.'
                      : 'This document was authored in Microsoft Word and converted client-side into PDF via Kanto PDF.',
                  }),
                ]
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRtl ? 'البند' : 'Service Tier', bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRtl ? 'التكلفة الشهرية' : 'Monthly Fee', bold: true })] })] }),
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRtl ? 'سحابة خاصة مخصصة' : 'Enterprise Dedicated Cloud' })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRtl ? '$2,500.00' : '$2,500.00' })] })] }),
                    ]
                  }),
                ]
              }),
            ]
          }]
        });

        const docxBlob = await Packer.toBlob(docxObj);
        const buf = await docxBlob.arrayBuffer();
        const file = new File([buf], isRtl ? 'مستند_عقد_لتحويل_PDF.docx' : 'service_agreement_sample.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-word-to-pdf-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PowerPoint to PDF (Multi-slide deck with dark/light themes)
      if (selectedTool.key === 'pptToPdf' || selectedTool.id === 'powerpoint-to-pdf') {
        const pptxgen = (await import('pptxgenjs')).default;
        const pptx = new pptxgen();
        pptx.layout = 'LAYOUT_16x9';

        const slide1 = pptx.addSlide();
        slide1.background = { color: '1A1F2C' };
        slide1.addText(isRtl ? 'بنية السحابة المؤسسية 2026' : 'KANTO ENTERPRISE CLOUD ARCHITECTURE', {
          x: 0.8,
          y: 1.2,
          w: 8.4,
          h: 1.2,
          fontSize: 26,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
        });
        slide1.addText(isRtl ? 'محرك تحويل العروض التقديمية إلى PDF عبر الخادم' : 'Server-Side PPTX to PDF Conversion Engine Q3 2026', {
          x: 0.8,
          y: 2.6,
          w: 8.4,
          h: 0.8,
          fontSize: 14,
          color: '94A3B8',
          align: 'center',
        });

        const slide2 = pptx.addSlide();
        slide2.background = { color: 'F8FAFC' };
        slide2.addText(isRtl ? 'المميزات الرئيسية والتوافقية' : 'Executive Summary & Pipeline Key Features', {
          x: 0.8,
          y: 0.6,
          w: 8.4,
          h: 0.6,
          fontSize: 20,
          bold: true,
          color: '0F172A',
        });
        slide2.addText(isRtl
          ? '• دقة بصرية 100% لخلفيات الشرائح والتنسيقات\n• دعم كامل للتخطيطات العريضة 16:9 و 4:3\n• معالجة خادم سريعة وآمنة بدون تخزين دائم'
          : '• 100% Visual fidelity of presentation slides\n• Precise text layout and font scale preservation\n• Multi-slide OpenXML parsing into high-quality PDF', {
          x: 0.8,
          y: 1.5,
          w: 8.4,
          h: 2.2,
          fontSize: 14,
          color: '334155',
          lineSpacing: 28,
        });

        const pptxBlob = (await pptx.write({ outputType: 'blob' })) as Blob;
        const buf = await pptxBlob.arrayBuffer();
        const file = new File([buf], isRtl ? 'عرض_تقديمي_لتحويل_PDF.pptx' : 'cloud_architecture_sample.pptx', {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-ppt-to-pdf-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Excel to PDF (Multi-column financial spreadsheet with calculations)
      if (selectedTool.key === 'excelToPdf' || selectedTool.id === 'excel-to-pdf') {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        const data = [
          [isRtl ? 'تقرير الإيرادات والعمليات ربع السنوي 2026' : 'Quarterly Revenue & Operations Report 2026', '', '', '', ''],
          [isRtl ? 'العملة المعتمدة: دولار أمريكي ($) | النطاق: دولي' : 'Generated on August 26, 2026 | Currency: USD', '', '', '', ''],
          ['', '', '', '', ''],
          [
            isRtl ? 'رمز الخدمة' : 'SKU ID',
            isRtl ? 'بيان البند والخدمة' : 'Product Description',
            isRtl ? 'المنطقة الجغرافية' : 'Region',
            isRtl ? 'عدد الوحدات' : 'Units Sold',
            isRtl ? 'إجمالي الإيراد' : 'Total Revenue',
          ],
          ['SKU-1001', isRtl ? 'سحابة البيانات المؤسسية الفائقة' : 'Enterprise Cloud Tier Alpha', 'US-East', 340, '$85,000.00'],
          ['SKU-1002', isRtl ? 'مصفوفة التخزين المخصصة والمعزولة' : 'Dedicated Storage Cluster', 'EU-Central', 180, '$54,000.00'],
          ['SKU-1003', isRtl ? 'رخصة الدعم الفني الفوري 99.99%' : 'SLA 99.99% Support License', 'MENA-Riyadh', 220, '$66,000.00'],
          ['SKU-1004', isRtl ? 'تسريع شبكات التوزيع الطرفية CDN' : 'Edge CDN Acceleration Addon', 'APAC-Tokyo', 410, '$41,000.00'],
          ['SKU-1005', isRtl ? 'خزينة التشفير الرقمي الخاصة' : 'Private Cryptographic Vault', 'US-West', 95, '$38,000.00'],
          ['', '', '', isRtl ? 'المجموع الكلي:' : 'Total Gross:', '$284,000.00'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, isRtl ? 'الملخص المالي' : 'Financial Summary');

        const xlsxArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const buf = new Uint8Array(xlsxArray).buffer;
        const file = new File([buf], isRtl ? 'تقرير_مالي_لتحويل_PDF.xlsx' : 'financial_report_sample.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-excel-to-pdf-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Edit PDF (Review & Approval Draft)
      if (selectedTool.key === 'edit' || selectedTool.id === 'edit-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const page1 = doc.addPage([595.28, 841.89]);
        page1.drawRectangle({
          x: 40,
          y: 750,
          width: 515.28,
          height: 48,
          color: rgb(0.08, 0.08, 0.08),
        });
        page1.drawText(isRtl ? 'KANTO PDF — EDITABLE DOCUMENT DRAFT' : 'KANTO PDF — EDITABLE DOCUMENT DRAFT', {
          x: 55,
          y: 768,
          size: 15,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        page1.drawText(
          'Document ID: KP-EDIT-2026 | Status: Draft Review | Author: Executive Ops',
          { x: 55, y: 720, size: 10, font: regFont, color: rgb(0.3, 0.3, 0.3) }
        );

        page1.drawRectangle({
          x: 40,
          y: 400,
          width: 515.28,
          height: 300,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 1,
          color: rgb(0.98, 0.98, 0.99),
        });

        page1.drawText(
          'Section 1: Interactive Annotations & Verification Notes',
          { x: 55, y: 670, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.1) }
        );

        page1.drawText(
          'Use the top toolbar to insert Text Boxes, Highlighting, and Freehand Pen notes.\nAll coordinates map precisely to the bottom-left PDF coordinate system.',
          { x: 55, y: 640, size: 10, font: regFont, color: rgb(0.3, 0.35, 0.4), lineHeight: 18 }
        );

        const buf = await doc.save();
        const file = new File([new Uint8Array(buf).buffer as ArrayBuffer], isRtl ? 'مسودة_قابلة_للتحرير.pdf' : 'editable_document_draft.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-edit-pdf-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf.buffer as ArrayBuffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setEditAnnotations([
          {
            id: 'sample-ann-1',
            type: 'text',
            pageIndex: 0,
            uiX: 60,
            uiY: 280,
            width: 220,
            height: 36,
            text: isRtl ? 'ملاحظة: تم تدقيق ومراجعة المسودة' : 'Verified & Reviewed by QA Team',
            fontSize: 12,
            fontColor: '#059669',
            isBold: true,
          }
        ]);
        setEditActivePageIndex(0);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to JPG (Multi-page Visual Magazine / Portfolio)
      if (selectedTool.key === 'pdfToJpg' || selectedTool.id === 'pdf-to-jpg') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: Cover
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 0,
          y: 600,
          width: 595.28,
          height: 241.89,
          color: rgb(0.08, 0.08, 0.08),
        });
        p1.drawText(isRtl ? 'كانتو للطباعة والتصميم الرقمي 2026' : 'KANTO DIGITAL PORTFOLIO & BRAND GUIDE', {
          x: 45,
          y: 720,
          size: 18,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText(
          isRtl
            ? 'المجلد الأول: تصاميم الهوية البصرية ودليل التنسيق العالي'
            : 'Volume 1: Brand Guidelines, Typography & High-Res Color Systems',
          { x: 45, y: 680, size: 11, font: regFont, color: rgb(0.8, 0.8, 0.8) }
        );
        p1.drawRectangle({
          x: 45,
          y: 200,
          width: 505.28,
          height: 340,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
          color: rgb(0.97, 0.98, 1),
        });
        p1.drawText(isRtl ? 'نموذج الصفحة الأولى — غلاف المستند' : 'Sample Page 1 — Cover & Introduction', {
          x: 65,
          y: 480,
          size: 14,
          font: boldFont,
          color: rgb(0.1, 0.2, 0.5),
        });

        // Page 2: Infographic Sheet
        const p2 = doc.addPage([595.28, 841.89]);
        p2.drawRectangle({
          x: 45,
          y: 740,
          width: 505.28,
          height: 55,
          color: rgb(0.95, 0.95, 0.95),
        });
        p2.drawText(isRtl ? 'القسم الثاني: الرسوم البيانية ومؤشرات الأداء' : 'Section 2: Analytics & Visual Infographics', {
          x: 65,
          y: 760,
          size: 15,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        p2.drawRectangle({
          x: 45,
          y: 350,
          width: 505.28,
          height: 350,
          color: rgb(0.98, 0.98, 0.96),
          borderColor: rgb(0.85, 0.85, 0.8),
          borderWidth: 1,
        });

        // Page 3: Summary Sheet
        const p3 = doc.addPage([595.28, 841.89]);
        p3.drawRectangle({
          x: 45,
          y: 740,
          width: 505.28,
          height: 55,
          color: rgb(0.08, 0.45, 0.3),
        });
        p3.drawText(isRtl ? 'القسم الثالث: ملخص المشروع والتوصيات' : 'Section 3: Project Summary & Roadmap', {
          x: 65,
          y: 760,
          size: 15,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        const buf = await doc.save();
        const file = new File([new Uint8Array(buf).buffer as ArrayBuffer], isRtl ? 'كتيب_معاينة_الصور.pdf' : 'portfolio_showcase.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-pdf-jpg-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 3,
            arrayBuffer: buf.buffer as ArrayBuffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for JPG to PDF (Multi-image bundle with 3 different aspect ratios: Square, Wide Landscape, Tall Portrait)
      if (selectedTool.key === 'jpgToPdf' || selectedTool.id === 'jpg-to-pdf') {
        const createSampleImage = async (
          w: number,
          h: number,
          title: string,
          subtitle: string,
          bgColor: string,
          filename: string
        ): Promise<ImageInputItem> => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);

            // Subtle border grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, w - 40, h - 40);

            // Title
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${Math.max(22, Math.round(w / 20))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(title, w / 2, h / 2 - 20);

            // Subtitle & Dimensions
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = `500 ${Math.max(14, Math.round(w / 32))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillText(`${subtitle} (${w} × ${h} px)`, w / 2, h / 2 + 30);
          }

          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
          );
          const buf = await blob.arrayBuffer();
          const file = new File([buf], filename, { type: 'image/png' });
          const previewUrl = URL.createObjectURL(blob);

          return {
            id: `sample-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            file,
            name: filename,
            size: buf.byteLength,
            arrayBuffer: buf,
            width: w,
            height: h,
            previewUrl,
            type: 'image/png',
          };
        };

        const img1 = await createSampleImage(
          600,
          600,
          isRtl ? 'صورة مربعة 1:1' : 'SQUARE PHOTO 1:1',
          isRtl ? 'تصميم هوية مربعة' : 'Square Profile / Artwork',
          '#1E293B',
          isRtl ? 'صورة_مربعة_1.png' : 'square_photo.png'
        );

        const img2 = await createSampleImage(
          1200,
          600,
          isRtl ? 'بانر عريض 2:1' : 'WIDE LANDSCAPE BANNER 2:1',
          isRtl ? 'عرض تقديمي بنسبة 16:9' : 'Panoramic Landscape View',
          '#0F766E',
          isRtl ? 'بانر_عريض_2.png' : 'wide_landscape.png'
        );

        const img3 = await createSampleImage(
          600,
          1000,
          isRtl ? 'ملصق طولي 1:1.67' : 'TALL PORTRAIT POSTER 1:1.67',
          isRtl ? 'ملصق إعلاني عمودي' : 'Vertical Infographic / Poster',
          '#4338CA',
          isRtl ? 'ملصق_طولي_3.png' : 'tall_portrait.png'
        );

        const sampleImages = [img1, img2, img3];
        setJpgToPdfImages(sampleImages);

        const pages: PdfPageItem[] = sampleImages.map((_, i) => ({
          pageNumber: i + 1,
          originalIndex: i,
          rotation: 0,
          isDeleted: false,
          sourceFileIndex: 0,
        }));

        setUploadedFiles([
          {
            id: `sample-jpg-to-pdf-${Date.now()}`,
            file: img1.file,
            name: isRtl ? 'حزمة_صور_متعددة_الأبعاد.png' : 'multi_aspect_image_bundle.png',
            size: sampleImages.reduce((acc, img) => acc + img.size, 0),
            pageCount: 3,
            arrayBuffer: img1.arrayBuffer,
            pages,
          },
        ]);

        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Watermark PDF (3-Page Confidential Business Report)
      if (selectedTool.key === 'watermark' || selectedTool.id === 'watermark-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        for (let i = 1; i <= 3; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawRectangle({
            x: 40,
            y: 750,
            width: 515.28,
            height: 50,
            color: rgb(0.08, 0.12, 0.2),
          });
          page.drawText(
            isRtl
              ? `تقرير العمليات والبيانات السرية — الصفحة ${i} من 3`
              : `CONFIDENTIAL OPERATIONS REPORT — PAGE ${i} OF 3`,
            {
              x: 60,
              y: 768,
              size: 13,
              font: boldFont,
              color: rgb(1, 1, 1),
            }
          );

          for (let j = 0; j < 6; j++) {
            page.drawText(
              `Section ${i}.${j + 1}: Enterprise Data Protection & Zero-Knowledge Architecture`,
              {
                x: 60,
                y: 700 - j * 50,
                size: 11,
                font: boldFont,
                color: rgb(0.2, 0.2, 0.2),
              }
            );
            page.drawText(
              'All watermark stamping operations execute client-side via WebAssembly without cloud transmission.',
              {
                x: 60,
                y: 684 - j * 50,
                size: 9,
                font: regFont,
                color: rgb(0.4, 0.4, 0.4),
              }
            );
          }
        }

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'تقرير_العمليات_السرية_للعلامة_المائية.pdf' : 'confidential_operations_report.pdf',
          { type: 'application/pdf' }
        );

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-watermark-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 3,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          watermarkText: isRtl ? 'سري للغاية' : 'CONFIDENTIAL',
          watermarkFontSize: 48,
          watermarkOpacity: 0.35,
          watermarkRotation: 45,
          watermarkColor: '#DC2626',
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Rotate PDF (3-Page Multi-Orientation Document)
      if (selectedTool.key === 'rotate' || selectedTool.id === 'rotate-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const pageTitles = isRtl
          ? [
              'الصفحة 1: صفحة طولية (جاهزة للتدوير 90 درجة مع عقارب الساعة)',
              'الصفحة 2: رسم بياني ومخطط (جاهزة للقلب 180 درجة)',
              'الصفحة 3: ملخص تنفيذي (تبقى بدون تدوير 0 درجة)',
            ]
          : [
              'PAGE 1: PORTRAIT DOCUMENT (Ready for +90° Clockwise Rotation)',
              'PAGE 2: ARCHITECTURE DIAGRAM (Ready for 180° Inversion)',
              'PAGE 3: EXECUTIVE SUMMARY (Untouched 0° Default Orientation)',
            ];

        for (let i = 0; i < 3; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawRectangle({
            x: 40,
            y: 750,
            width: 515.28,
            height: 50,
            color: rgb(0.1, 0.15, 0.25),
          });
          page.drawText(
            isRtl ? `مستند تجريبي للتدوير الهيكلي — صفحة ${i + 1}` : `STRUCTURAL ROTATION TEST — PAGE ${i + 1}`,
            {
              x: 60,
              y: 768,
              size: 13,
              font: boldFont,
              color: rgb(1, 1, 1),
            }
          );
          page.drawText(pageTitles[i], {
            x: 60,
            y: 710,
            size: 11,
            font: boldFont,
            color: rgb(0.15, 0.15, 0.15),
          });
          page.drawText('All structural metadata rotation angles are permanently saved in PDF page dictionary.', {
            x: 60,
            y: 685,
            size: 9.5,
            font: regFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'مستند_نموذجي_لتدوير_الصفحات.pdf' : 'sample_document_for_rotation.pdf',
          { type: 'application/pdf' }
        );

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-rotate-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 3,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Organize PDF (3-Page Modular Document)
      if (selectedTool.key === 'organize' || selectedTool.id === 'organize-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const pageColors = [
          rgb(0.12, 0.16, 0.24),
          rgb(0.15, 0.35, 0.2),
          rgb(0.35, 0.15, 0.15),
        ];

        const sectionNames = isRtl
          ? ['القسم الأول: المقدمة ونطاق العمل', 'القسم الثاني: المواصفات الفنية والهندسة', 'القسم الثالث: الشروط والأحكام والاعتماد']
          : ['SECTION 1: INTRODUCTION & SCOPE', 'SECTION 2: ARCHITECTURE & ENGINEERING', 'SECTION 3: TERMS & SIGN-OFF'];

        for (let i = 0; i < 3; i++) {
          const page = doc.addPage([595.28, 841.89]);
          page.drawRectangle({
            x: 40,
            y: 750,
            width: 515.28,
            height: 50,
            color: pageColors[i],
          });
          page.drawText(`KANTO MODULAR DOCUMENT — ORIGINAL PAGE ${i + 1}`, {
            x: 60,
            y: 768,
            size: 13,
            font: boldFont,
            color: rgb(1, 1, 1),
          });
          page.drawText(sectionNames[i], {
            x: 60,
            y: 710,
            size: 11,
            font: boldFont,
            color: rgb(0.15, 0.15, 0.15),
          });
          page.drawText('This modular page block is ready for visual drag-and-drop reordering, duplication, or deletion.', {
            x: 60,
            y: 685,
            size: 9.5,
            font: regFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'مستند_نموذجي_لتنظيم_الصفحات.pdf' : 'sample_document_for_organize.pdf',
          { type: 'application/pdf' }
        );

        const orgPages: OrganizePageItem[] = [
          { id: `sample-org-1`, originalIndex: 0, pageNumber: 1, rotation: 0 },
          { id: `sample-org-2`, originalIndex: 1, pageNumber: 2, rotation: 0 },
          { id: `sample-org-3`, originalIndex: 2, pageNumber: 3, rotation: 0 },
        ];

        const stdPages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-organize-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 3,
            arrayBuffer: buf,
            pages: stdPages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(stdPages);
        setOrganizePages(orgPages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Page Numbers (3-Page Multi-Dimension Document)
      if (selectedTool.key === 'pageNumbers' || selectedTool.id === 'page-numbers') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

        // Page 1: A4 Portrait (595.28 x 841.89 pt) - Cover Page
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.12, 0.16, 0.24),
        });
        p1.drawText('ANNUAL ENTERPRISE ARCHITECTURE REPORT', {
          x: 60,
          y: 765,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('Page 1: A4 Standard Portrait (595 × 842 pt)', {
          x: 60,
          y: 700,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Page 2: Landscape Dimension (841.89 x 595.28 pt)
        const p2 = doc.addPage([841.89, 595.28]);
        p2.drawRectangle({
          x: 40,
          y: 500,
          width: 761.89,
          height: 50,
          color: rgb(0.15, 0.35, 0.2),
        });
        p2.drawText('TECHNICAL BENCHMARKS & HIGH-THROUGHPUT METRICS', {
          x: 60,
          y: 520,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p2.drawText('Page 2: A4 Wide Landscape (842 × 595 pt) — Dynamic centering test', {
          x: 60,
          y: 450,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Page 3: US Letter Dimension (612.00 x 792.00 pt)
        const p3 = doc.addPage([612.00, 792.00]);
        p3.drawRectangle({
          x: 40,
          y: 700,
          width: 532.00,
          height: 50,
          color: rgb(0.35, 0.15, 0.15),
        });
        p3.drawText('APPENDIX & COMPLIANCE SPECIFICATIONS', {
          x: 60,
          y: 720,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p3.drawText('Page 3: US Letter Format (612 × 792 pt) — Dynamic margin calculation', {
          x: 60,
          y: 650,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'تقرير_متعدد_الأبعاد_للترقيم.pdf' : 'multi_dimension_numbering_sample.pdf',
          { type: 'application/pdf' }
        );

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 3, originalIndex: 2, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-page-numbers-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 3,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          pageNumberPosition: 'bottom-center',
          pageNumberFormat: 'page_x_of_y',
          pageNumberStart: 1,
          pageNumberFontSize: 11,
          pageNumberMargin: 32,
          pageNumberExcludeFirstPage: false,
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Crop PDF (2-Page Vector Document with distinct Header and Body sections)
      if (selectedTool.key === 'crop' || selectedTool.id === 'crop-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: A4 Document with distinct top header and bottom body
        const p1 = doc.addPage([595.28, 841.89]);
        
        // Top Half (0% to 50% from top, Y: 421 to 842 pt)
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.12, 0.16, 0.24),
        });
        p1.drawText('TOP HALF SECTION: HEADER & METADATA', {
          x: 60,
          y: 765,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('This upper region contains document classification codes and headers.', {
          x: 60,
          y: 700,
          size: 11,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        p1.drawText('Target for cropping out in the Proof-of-Work demonstration.', {
          x: 60,
          y: 675,
          size: 10.5,
          font: regFont,
          color: rgb(0.4, 0.4, 0.4),
        });

        // Dividing Line at exactly 50% height (Y = 421 pt)
        p1.drawLine({
          start: { x: 40, y: 421 },
          end: { x: 555.28, y: 421 },
          thickness: 2,
          color: rgb(0.8, 0.2, 0.2),
        });
        p1.drawText('--- 50% HORIZONTAL DIVISION LINE ---', {
          x: 200,
          y: 426,
          size: 9,
          font: boldFont,
          color: rgb(0.8, 0.2, 0.2),
        });

        // Bottom Half (50% to 100% from top, Y: 0 to 421 pt)
        p1.drawRectangle({
          x: 40,
          y: 330,
          width: 515.28,
          height: 60,
          color: rgb(0.15, 0.45, 0.25),
        });
        p1.drawText('BOTTOM HALF SECTION: TARGET SELECTABLE TEXT BODY', {
          x: 60,
          y: 355,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('This essential bottom paragraph must remain 100% visible and selectable after cropping.', {
          x: 60,
          y: 290,
          size: 10.5,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        p1.drawText('Vector quality and font streams are structurally preserved via page.setCropBox().', {
          x: 60,
          y: 265,
          size: 10.5,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Page 2: Second page
        const p2 = doc.addPage([595.28, 841.89]);
        p2.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.25, 0.15, 0.35),
        });
        p2.drawText('PAGE 2: TERMS OF EXECUTION & COMPLIANCE', {
          x: 60,
          y: 765,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p2.drawText('Structural cropping applies cleanly across all pages without raster degradation.', {
          x: 60,
          y: 700,
          size: 11,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'مستند_نموذجي_لقص_الهوامش.pdf' : 'vector_sample_for_crop.pdf',
          { type: 'application/pdf' }
        );

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-crop-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          cropRegion: { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 },
          cropApplyToAllPages: true,
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Protect PDF (Unencrypted Document ready for security encryption)
      if (selectedTool.key === 'protect' || selectedTool.id === 'protect-pdf') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: Confidential Financial Audit
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.12, 0.16, 0.24),
        });
        p1.drawText('CONFIDENTIAL FINANCIAL AUDIT & VALUATION', {
          x: 60,
          y: 765,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('This document is currently unencrypted. Ready to be sealed with password protection.', {
          x: 60,
          y: 700,
          size: 11,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        p1.drawText('Target for native pdfDoc.encrypt() with user and owner passwords.', {
          x: 60,
          y: 675,
          size: 10.5,
          font: regFont,
          color: rgb(0.4, 0.4, 0.4),
        });

        // Page 2: Valuation Breakdown
        const p2 = doc.addPage([595.28, 841.89]);
        p2.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.15, 0.45, 0.25),
        });
        p2.drawText('PAGE 2: SHAREHOLDER LEDGER & DIVIDEND METRICS', {
          x: 60,
          y: 765,
          size: 13.5,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p2.drawText('Strict permission flags prevent unauthorized text extraction and printing.', {
          x: 60,
          y: 700,
          size: 11,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File(
          [buf],
          isRtl ? 'تقرير_مالي_سري_جاهز_للتشفير.pdf' : 'confidential_audit_for_protection.pdf',
          { type: 'application/pdf' }
        );

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-protect-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          protectPassword: '',
          protectConfirmPassword: '',
          protectAllowPrinting: false,
          protectAllowCopying: false,
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Sign PDF (Multi-page Enterprise Contract with signature block)
      if (selectedTool.key === 'sign') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        // Page 1: Terms & Conditions
        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 750,
          width: 515.28,
          height: 50,
          color: rgb(0.08, 0.08, 0.08),
        });
        p1.drawText('KANTO ENTERPRISE SERVICE AGREEMENT — PAGE 1', {
          x: 60,
          y: 768,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        for (let i = 0; i < 6; i++) {
          p1.drawText(`1.${i + 1} Terms of Client-Side WebAssembly Data Sovereignty:`, {
            x: 60,
            y: 700 - i * 50,
            size: 12,
            font: boldFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          p1.drawText('All cryptographic signing operations execute within isolated in-browser memory buffers.', {
            x: 60,
            y: 682 - i * 50,
            size: 10,
            font: regFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }

        // Page 2: Execution & Signature Execution Block
        const p2 = doc.addPage([595.28, 841.89]);
        p2.drawRectangle({
          x: 40,
          y: 750,
          width: 515.28,
          height: 50,
          color: rgb(0.08, 0.08, 0.08),
        });
        p2.drawText('SIGNATURE EXECUTION & LEGAL ATTESTATION — PAGE 2', {
          x: 60,
          y: 768,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        p2.drawText('By applying a digital signature below, both parties confirm adherence to zero data retention.', {
          x: 60,
          y: 690,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Signature boundary box on Page 2
        p2.drawRectangle({
          x: 320,
          y: 120,
          width: 215,
          height: 90,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 1,
          color: rgb(0.97, 0.97, 0.98),
        });
        p2.drawText('Authorized Signature Line (Page 2)', {
          x: 330,
          y: 195,
          size: 9,
          font: boldFont,
          color: rgb(0.4, 0.4, 0.4),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'اتفاقية_كانتو_للتوقيع_الرقمي.pdf' : 'kanto_service_contract_to_sign.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
          { pageNumber: 2, originalIndex: 1, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-sign-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 2,
            arrayBuffer: buf,
            pages,
          },
        ]);
        const sigCanvas = document.createElement('canvas');
        sigCanvas.width = 400;
        sigCanvas.height = 140;
        const sigCtx = sigCanvas.getContext('2d');
        if (sigCtx) {
          sigCtx.font = 'italic 34px "Brush Script MT", "Segoe Script", cursive';
          sigCtx.fillStyle = '#0D0D0D';
          sigCtx.textAlign = 'center';
          sigCtx.textBaseline = 'middle';
          sigCtx.fillText('Alex Mercer', sigCanvas.width / 2, sigCanvas.height / 2);
        }
        const sampleSigUrl = sigCanvas.toDataURL('image/png');

        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          signatureDataUrl: prev.signatureDataUrl || sampleSigUrl,
          signaturePlacementMode: 'last',
          signatureTargetPage: 2,
          signaturePosition: {
            xPercent: 55,
            yPercent: 76,
            widthPercent: 36,
            heightPercent: 12,
          },
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Unlock PDF (Permissions-restricted financial report)
      if (selectedTool.key === 'unlock') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.12, 0.12, 0.14),
        });
        p1.drawText('KANTO AUDITED FINANCIAL REPORT (PERMISSIONS RESTRICTED)', {
          x: 55,
          y: 765,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        p1.drawText('Notice: This sample document simulates owner-restricted printing and editing policies.', {
          x: 55,
          y: 690,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        p1.drawText('Kanto Unlock engine will strip all security dictionaries, exporting a clean, unrestricted copy.', {
          x: 55,
          y: 660,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'تقرير_مالي_مقيد_الأذونات.pdf' : 'restricted_financial_report.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-unlock-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          encryptionType: 'owner_restrictions',
          password: '',
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Repair PDF (Simulates corrupted/damaged byte structure)
      if (selectedTool.key === 'repair') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.1, 0.1, 0.1),
        });
        p1.drawText('DAMAGED ENTERPRISE LEDGER (RECONSTRUCTED DATA)', {
          x: 55,
          y: 765,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        p1.drawText('This document has been parsed and recovered by the Kanto fault-tolerant byte engine.', {
          x: 55,
          y: 690,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        const cleanBytes = await doc.save();

        // Create damaged buffer with 64 leading corrupted junk bytes
        const junk = new TextEncoder().encode('###CORRUPT_BUFFER_HEADER_FRAGMENT_MALFORMED_BYTES_0X4949439294###');
        const damagedBuffer = new Uint8Array(junk.length + cleanBytes.length);
        damagedBuffer.set(junk, 0);
        damagedBuffer.set(cleanBytes, junk.length);

        const buf = damagedBuffer.buffer.slice(
          damagedBuffer.byteOffset,
          damagedBuffer.byteOffset + damagedBuffer.byteLength
        ) as ArrayBuffer;

        const file = new File([buf], isRtl ? 'مستند_تالف_تم_تحليله.pdf' : 'damaged_ledger_reconstructed.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-repair-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          repairIssues: [
            isRtl
              ? 'تم عزل وحذف 65 بايت تالفة سابقة لترويسة PDF القياسية'
              : 'Stripped 65 corrupt leading junk bytes prepended before PDF header',
          ],
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Redact PDF (Confidential Onboarding Record with Sensitive SSN & Salary)
      if (selectedTool.key === 'redact') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.12, 0.08, 0.08),
        });
        p1.drawText('CONFIDENTIAL EXECUTIVE ONBOARDING RECORD', {
          x: 55,
          y: 765,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        p1.drawText('Employee Full Name: Alexander Hamilton', {
          x: 55,
          y: 690,
          size: 11,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        p1.drawText('Confidential Social Security Number: 987-65-4321', {
          x: 55,
          y: 655,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        p1.drawText('Annual Executive Base Compensation: $285,000 / year', {
          x: 55,
          y: 620,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        p1.drawText('Direct Deposit Routing Number: 021000021-99887766', {
          x: 55,
          y: 585,
          size: 11,
          font: regFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

        const file = new File([buf], isRtl ? 'سجل_توظيف_سري_للحجب.pdf' : 'confidential_employee_record.pdf', {
          type: 'application/pdf',
        });

        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];

        setUploadedFiles([
          {
            id: `sample-redact-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          redactionBoxes: [
            {
              id: `redact-box-1`,
              pageNumber: 1,
              xPercent: 9,
              yPercent: 21,
              widthPercent: 62,
              heightPercent: 3,
              color: 'black',
            },
            {
              id: `redact-box-2`,
              pageNumber: 1,
              xPercent: 9,
              yPercent: 25.5,
              widthPercent: 68,
              heightPercent: 3,
              color: 'black',
            },
          ],
          redactionColor: 'black',
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for HTML to PDF (Native Chromium Vector Conversion)
      if (selectedTool.key === 'htmlToPdf' || selectedTool.id === 'html-to-pdf') {
        const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; }
    h1 { color: #0f172a; font-size: 26px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    p { font-size: 14px; line-height: 1.6; color: #334155; }
    .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 999px; font-weight: 600; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Native Chromium Vector PDF Printing</h1>
  <p>This PDF is rendered directly from HTML code via Headless Chromium, preserving vector text crispness and CSS backgrounds without any rasterization artifacts.</p>
  <div class="badge">100% Selectable Vector Text</div>
</body>
</html>`;
        const buf = new TextEncoder().encode(sampleHtml).buffer;
        const file = new File([buf], isRtl ? 'صفحة_نموذجية.html' : 'sample_webpage.html', {
          type: 'text/html',
        });
        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];
        setUploadedFiles([
          {
            id: `sample-html-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          htmlMode: 'code',
          htmlContent: sampleHtml,
          htmlUrl: 'https://example.com',
          htmlPageSize: 'a4',
          htmlOrientation: 'portrait',
          htmlPrintBackground: true,
        }));
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to HTML (Text-Layer Extraction)
      if (selectedTool.key === 'pdfToHtml' || selectedTool.id === 'pdf-to-html') {
        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
        const regFont = await doc.embedFont(StandardFonts.Helvetica);

        const p1 = doc.addPage([595.28, 841.89]);
        p1.drawRectangle({
          x: 40,
          y: 740,
          width: 515.28,
          height: 60,
          color: rgb(0.08, 0.12, 0.18),
        });
        p1.drawText('KANTO PDF TO HTML VECTOR EXTRACTION', {
          x: 55,
          y: 765,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        p1.drawText('Section 1: Pure HTML/CSS Positioning Demonstration', {
          x: 55,
          y: 700,
          size: 12,
          font: boldFont,
          color: rgb(0.15, 0.15, 0.15),
        });
        p1.drawText('All text elements are extracted into individual, selectable <span> elements with exact coordinates.', {
          x: 55,
          y: 670,
          size: 10,
          font: regFont,
          color: rgb(0.3, 0.3, 0.3),
        });

        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const file = new File([buf], isRtl ? 'مستند_نموذجي_للتحويل_إلى_HTML.pdf' : 'sample_document_for_html.pdf', {
          type: 'application/pdf',
        });
        const pages: PdfPageItem[] = [
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
        ];
        setUploadedFiles([
          {
            id: `sample-pdf-to-html-${Date.now()}`,
            file,
            name: file.name,
            size: buf.byteLength,
            pageCount: 1,
            arrayBuffer: buf,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF Forms (Interactive AcroForm)
      if (selectedTool.key === 'forms' || selectedTool.id === 'pdf-forms') {
        const { createSampleFillableForm } = await import('../services/formsEngine');
        const { file, fields } = await createSampleFillableForm(isRtl);
        const { loadPdfPagesInfo } = await import('../services/pdfEngine');
        const buffer = await file.arrayBuffer();
        const pages = await loadPdfPagesInfo(buffer, 0);

        const initialValues: Record<string, string | boolean> = {};
        fields.forEach(f => {
          initialValues[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'checkbox' ? false : '');
        });

        setFormFields(fields);
        setFormFieldValues(initialValues);
        setUploadedFiles([
          {
            id: `sample-pdf-forms-${Date.now()}`,
            file,
            name: file.name,
            size: buffer.byteLength,
            pageCount: pages.length,
            arrayBuffer: buffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Scan to PDF (Simulated Camera Document)
      if (selectedTool.key === 'scanToPdf' || selectedTool.id === 'scan-to-pdf') {
        const { createSampleScannedItem } = await import('../services/scanToPdfEngine');
        const sample = await createSampleScannedItem(isRtl);

        setScannedPages([sample]);
        setUploadedFiles([
          {
            id: `sample-scan-${Date.now()}`,
            file: new File([], isRtl ? 'عينة_ماسح_ضوئي.jpg' : 'scanned_sample.jpg', { type: 'image/jpeg' }),
            name: isRtl ? 'عينة_ماسح_ضوئي.jpg' : 'scanned_sample.jpg',
            size: 64000,
            pageCount: 1,
            arrayBuffer: new ArrayBuffer(0),
            pages: [
              { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 }
            ],
          },
        ]);
        setActiveFileIndex(0);
        setActivePages([
          { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 }
        ]);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for PDF to PDF/A (ISO Archival Document)
      if (selectedTool.key === 'pdfToPdfa' || selectedTool.id === 'pdf-to-pdfa') {
        const { createSamplePdfaDoc } = await import('../services/pdfaEngine');
        const file = await createSamplePdfaDoc(isRtl);
        const { loadPdfPagesInfo } = await import('../services/pdfEngine');
        const buffer = await file.arrayBuffer();
        const pages = await loadPdfPagesInfo(buffer, 0);

        setUploadedFiles([
          {
            id: `sample-pdfa-${Date.now()}`,
            file,
            name: file.name,
            size: buffer.byteLength,
            pageCount: pages.length,
            arrayBuffer: buffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Sample for Repair PDF (Corrupted Sample Document)
      if (selectedTool.key === 'repair' || selectedTool.id === 'repair-pdf') {
        const { createSampleCorruptedPdf } = await import('../services/repairEngine');
        const file = await createSampleCorruptedPdf(isRtl);
        const buffer = await file.arrayBuffer();
        const pages = [
          {
            pageNumber: 1,
            originalIndex: 0,
            rotation: 0,
            isDeleted: false,
            sourceFileIndex: 0,
          },
        ];

        setUploadedFiles([
          {
            id: `sample-repair-${Date.now()}`,
            file,
            name: file.name,
            size: buffer.byteLength,
            pageCount: 1,
            arrayBuffer: buffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      }

      // Default sample generator
      const { createSamplePdf } = await import('../services/pdfEngine');
      const sample = await createSamplePdf(isRtl);
      const item: UploadedFileItem = {
        id: `sample-${Date.now()}`,
        file: sample.file,
        name: sample.file.name,
        size: sample.buffer.byteLength,
        pageCount: sample.pages.length,
        arrayBuffer: sample.buffer,
        pages: sample.pages,
      };

      setUploadedFiles([item]);
      setActiveFileIndex(0);
      setActivePages(sample.pages);
      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
    } catch (err: unknown) {
      setErrorMessage(`Failed to load sample: ${String(err)}`);
    }
}
