export interface ToolSeoData {
  titleEn: string;
  descEn: string;
  titleAr: string;
  descAr: string;
  relatedToolIds: string[];
  howToStepsEn: { name: string; text: string }[];
  howToStepsAr: { name: string; text: string }[];
}

export const SEO_METADATA: Record<string, ToolSeoData> = {
  'merge-pdf': {
    titleEn: 'Merge PDF Online Free — Combine PDF Files In-Browser | Kanto',
    descEn: 'Combine multiple PDF documents into one organized file directly in your browser. 100% private WebAssembly processing with zero server uploads.',
    titleAr: 'دمج ملفات PDF أونلاين مجاناً وبأمان تام داخل المتصفح | كانتو',
    descAr: 'ادمج عدة مستندات PDF في ملف واحد مرتب بسهولة وسرعة فائقة. معالجة سيادية 100% داخل المتصفح دون رفع أي بيانات لخوادم خارجية.',
    relatedToolIds: ['split-pdf', 'organize-pdf', 'compress-pdf', 'rotate-pdf'],
    howToStepsEn: [
      { name: 'Upload Files', text: 'Select or drag-and-drop multiple PDF files into the local workspace.' },
      { name: 'Reorder Sheets', text: 'Drag page thumbnails to arrange documents into your exact sequence.' },
      { name: 'Merge & Export', text: 'Click Merge PDF to instantly synthesize and download your unified file.' }
    ],
    howToStepsAr: [
      { name: 'تحميل الملفات', text: 'اختر أو اسحب ملفات PDF متعددة إلى مساحة العمل المحلية.' },
      { name: 'ترتيب الصفحات', text: 'اسحب بطاقات الصفحات لترتيبها بالتسلسل المناسب لك.' },
      { name: 'الدمج والتصدير', text: 'انقر على زر الدمج لتوليد المستند النهائي وتحميله فوراً.' }
    ]
  },
  'split-pdf': {
    titleEn: 'Split PDF Online Free — Extract PDF Pages Instantly | Kanto',
    descEn: 'Separate PDF pages or extract custom page ranges into independent files with total privacy. Local in-memory processing, no file size limits.',
    titleAr: 'تقسيم ملفات PDF واستخراج الصفحات أونلاين مجاناً | كانتو',
    descAr: 'افصل صفحات مستند PDF أو استخرج نطاقات محددة لتكوين ملفات مستقلة بأمان تام وسرعة استجابة فورية في ذاكرة جهازك.',
    relatedToolIds: ['merge-pdf', 'organize-pdf', 'crop-pdf', 'compress-pdf'],
    howToStepsEn: [
      { name: 'Select Document', text: 'Load your PDF file directly into local browser memory.' },
      { name: 'Define Ranges', text: 'Enter page ranges (e.g. 1-3, 5) or select individual pages to extract.' },
      { name: 'Download Split PDF', text: 'Export extracted pages into a single PDF or standalone files.' }
    ],
    howToStepsAr: [
      { name: 'اختيار المستند', text: 'قم بتحميل ملف PDF مباشرة في ذاكرة المتصفح المحلية.' },
      { name: 'تحديد النطاقات', text: 'أدخل أرقام الصفحات المطلوبة أو حدد الصفحات بصرياً.' },
      { name: 'تنزيل الملف', text: 'صدّر الصفحات المفصولة في مستند جديد بضغطة زر.' }
    ]
  },
  'compress-pdf': {
    titleEn: 'Compress PDF Online — Reduce PDF File Size with Crisp DPI | Kanto',
    descEn: 'Reduce PDF file size while preserving high graphical fidelity and vector sharpness. 100% offline WebAssembly compression with zero data retention.',
    titleAr: 'ضغط ملفات PDF وتقليص الحجم مع الحفاظ على الجودة | كانتو',
    descAr: 'قلص حجم مستندات PDF الكبيرة مع الحفاظ على نقاء النصوص والصور. معالجة محلية بالكامل عبر تقنية WebAssembly لضمان الخصوصية.',
    relatedToolIds: ['merge-pdf', 'pdf-to-word', 'split-pdf', 'pdf-to-pdfa'],
    howToStepsEn: [
      { name: 'Add Document', text: 'Drop your oversized PDF document into the compression sandbox.' },
      { name: 'Select Preset', text: 'Choose Extreme, Recommended (~60%), or High Fidelity compression.' },
      { name: 'Save Optimized PDF', text: 'Download your lightweight, optimized document immediately.' }
    ],
    howToStepsAr: [
      { name: 'إضافة المستند', text: 'أسقط ملف PDF المراد تقليص حجمه في بيئة العمل المحلية.' },
      { name: 'اختيار مستوى الضغط', text: 'اختر الضغط الموصى به أو الأقصى أو الحفاظ على الجودة.' },
      { name: 'حفظ المستند', text: 'حمّل المستند المحسن والمضغوط فورياً على جهازك.' }
    ]
  },
  'pdf-to-word': {
    titleEn: 'Convert PDF to Word DOCX Online — Editable & Private | Kanto',
    descEn: 'Convert PDF files into editable Microsoft Word DOCX documents with structured paragraph and typography preservation. Zero cloud leaks.',
    titleAr: 'تحويل PDF إلى Word DOCX قابل للتعديل أونلاين | كانتو',
    descAr: 'حوّل مستندات PDF إلى ملفات وورد DOCX قابلة للتعديل مع الحفاظ على التنسيق والفقرات. سرية تامة دون إرسال ملفاتك لأي خادم.',
    relatedToolIds: ['word-to-pdf', 'pdf-to-excel', 'pdf-to-powerpoint', 'pdf-to-jpg'],
    howToStepsEn: [
      { name: 'Upload PDF', text: 'Select the PDF document you wish to convert to Word.' },
      { name: 'Parse Structure', text: 'The client-side engine extracts text blocks and formatting.' },
      { name: 'Download DOCX', text: 'Save your editable Microsoft Word document file.' }
    ],
    howToStepsAr: [
      { name: 'تحميل PDF', text: 'اختر مستند PDF المراد تحويله إلى وورد.' },
      { name: 'استخراج الهيكل', text: 'يقوم المحرك الداخلي باستخراج النصوص والتنسيقات بدقة.' },
      { name: 'تنزيل DOCX', text: 'احفظ ملف الوورد القابل للتعديل على جهازك فوراً.' }
    ]
  },
  'pdf-to-powerpoint': {
    titleEn: 'PDF to PowerPoint Online — Convert PDF to PPTX Slides | Kanto',
    descEn: 'Transform PDF pages into editable Microsoft PowerPoint presentations (.pptx). Fast client-side slide extraction with layout fidelity.',
    titleAr: 'تحويل PDF إلى PowerPoint PPTX عروض تقديمية | كانتو',
    descAr: 'حوّل صفحات مستند PDF إلى شرائح عرض بوربوينت PPTX قابلة للتعديل بسهولة وخصوصية تامة داخل متصفحك.',
    relatedToolIds: ['powerpoint-to-pdf', 'pdf-to-word', 'pdf-to-jpg', 'pdf-to-excel'],
    howToStepsEn: [
      { name: 'Input PDF', text: 'Select presentation PDF document to convert.' },
      { name: 'Extract Slides', text: 'Pages are parsed into presentation slide geometries.' },
      { name: 'Export PPTX', text: 'Download your editable PowerPoint presentation deck.' }
    ],
    howToStepsAr: [
      { name: 'اختيار المستند', text: 'حدد مستند PDF المراد تحويله إلى شرائح بوربوينت.' },
      { name: 'تجهيز الشرائح', text: 'تتم معالجة الصفحات وتحويلها إلى شرائح عرض منفصلة.' },
      { name: 'تصدير PPTX', text: 'حمّل العرض التقديمي المكتمل بصيغة PPTX مباشرة.' }
    ]
  },
  'pdf-to-excel': {
    titleEn: 'PDF to Excel Online — Extract Tables into XLSX Spreadsheets | Kanto',
    descEn: 'Extract tabular data and financial statements from PDF into editable Microsoft Excel (XLSX/CSV) files with high numerical precision.',
    titleAr: 'تحويل PDF إلى Excel استخراج الجداول إلى XLSX | كانتو',
    descAr: 'استخرج الجداول والبيانات المالية من ملفات PDF إلى جداول إكسل XLSX منظمة دون أي مخاطر تسريب للبيانات.',
    relatedToolIds: ['excel-to-pdf', 'pdf-to-word', 'pdf-to-html', 'compress-pdf'],
    howToStepsEn: [
      { name: 'Upload PDF Table', text: 'Load your tabular PDF document into the browser.' },
      { name: 'Detect Grid', text: 'Algorithmic table detection isolates numerical rows.' },
      { name: 'Export XLSX/CSV', text: 'Download structured Excel spreadsheet file.' }
    ],
    howToStepsAr: [
      { name: 'رفع المستند', text: 'حمّل مستند PDF الذي يحتوي على جداول وأرقام.' },
      { name: 'اكتشاف الجداول', text: 'يتعرف المحرك على الخلايا والصفوف الرقمية تلقائياً.' },
      { name: 'تصدير XLSX', text: 'حمّل جدول الإكسل المنظم مباشرة على جهازك.' }
    ]
  },
  'word-to-pdf': {
    titleEn: 'Word to PDF Online — Convert DOCX to Standard PDF | Kanto',
    descEn: 'Convert Microsoft Word DOCX and DOC files into clean, print-ready vector PDF documents with accurate font embedding and layout fidelity.',
    titleAr: 'تحويل Word إلى PDF تحويل ملفات DOCX بدقة أونلاين | كانتو',
    descAr: 'حوّل ملفات مايكروسوفت وورد DOCX إلى مستندات PDF قياسية وثابتة التنسيق ومعدة للطباعة بخصوصية تامة.',
    relatedToolIds: ['pdf-to-word', 'powerpoint-to-pdf', 'excel-to-pdf', 'merge-pdf'],
    howToStepsEn: [
      { name: 'Select DOCX', text: 'Choose your Microsoft Word document file.' },
      { name: 'Compile PDF', text: 'Render vector typography and layout styles.' },
      { name: 'Save PDF', text: 'Download standardized PDF document.' }
    ],
    howToStepsAr: [
      { name: 'اختيار ملف Word', text: 'اختر ملف الوورد المراد تحويله إلى مستند PDF.' },
      { name: 'بناء الـ PDF', text: 'يتم بناء التنسيقات والخطوط بدقة قياسية عالية.' },
      { name: 'تنزيل PDF', text: 'احفظ مستند PDF النهائي على جهازك.' }
    ]
  },
  'powerpoint-to-pdf': {
    titleEn: 'PowerPoint to PDF Online — Convert PPTX to Vector PDF | Kanto',
    descEn: 'Render PowerPoint slide decks into high-resolution, universal PDF files for seamless presentation sharing and secure archival.',
    titleAr: 'تحويل PowerPoint إلى PDF تحويل شرائح PPTX | كانتو',
    descAr: 'حوّل عروض البوربوينت PPTX إلى ملفات PDF عالية الدقة وجاهزة للعرض والطباعة في أي بيئة عمل.',
    relatedToolIds: ['pdf-to-powerpoint', 'word-to-pdf', 'excel-to-pdf', 'jpg-to-pdf'],
    howToStepsEn: [
      { name: 'Add PPTX', text: 'Upload your presentation slides deck.' },
      { name: 'Render Vector', text: 'Process slide vector graphics and color bounds.' },
      { name: 'Export PDF', text: 'Download unified presentation PDF file.' }
    ],
    howToStepsAr: [
      { name: 'إضافة العرض', text: 'اختر ملف البوربوينت PPTX الخاص بك.' },
      { name: 'معالجة الشرائح', text: 'يقوم النظام بتحويل الرسوم والنصوص إلى متجهات PDF.' },
      { name: 'تصدير PDF', text: 'حمّل ملف PDF الموحد فوراً.' }
    ]
  },
  'excel-to-pdf': {
    titleEn: 'Excel to PDF Online — Convert Spreadsheets to PDF Pages | Kanto',
    descEn: 'Convert spreadsheets (XLSX, XLS, CSV) into cleanly formatted, pagination-adjusted PDF sheets with zero remote data transfer.',
    titleAr: 'تحويل Excel إلى PDF تحويل جداول البيانات لـ PDF | كانتو',
    descAr: 'حوّل جداول الإكسل والنماذج المحاسبية إلى صفحات PDF متناسقة ومعدة للطباعة والمراجعة الرسمية.',
    relatedToolIds: ['pdf-to-excel', 'word-to-pdf', 'powerpoint-to-pdf', 'page-numbers'],
    howToStepsEn: [
      { name: 'Input Spreadsheet', text: 'Select your Excel spreadsheet file.' },
      { name: 'Format Grid', text: 'Adjust print margins and column fitting.' },
      { name: 'Save PDF', text: 'Download finalized PDF spreadsheet report.' }
    ],
    howToStepsAr: [
      { name: 'إدخال الجدول', text: 'اختر ملف الإكسل المراد تحويله لـ PDF.' },
      { name: 'ضبط الصفحات', text: 'تتم مواءمة الأعمدة والصفوف لتناسب أبعاد الصفحة.' },
      { name: 'حفظ PDF', text: 'حمّل تقرير الـ PDF المكتمل.' }
    ]
  },
  'edit-pdf': {
    titleEn: 'Edit PDF Online Free — Annotate, Highlight & Draw on PDF | Kanto',
    descEn: 'Add freehand annotations, highlight text boxes, insert comments, and draw shapes on PDF pages in your local browser sandbox.',
    titleAr: 'تعديل ملفات PDF والكتابة عليها أونلاين مجاناً | كانتو',
    descAr: 'أضف ملاحظات نصية، ورسوماً حرة، وتظليلاً للفقرات الهامة على مستندات PDF بكل سهولة ودون تسجيل حساب.',
    relatedToolIds: ['sign-pdf', 'watermark-pdf', 'redact-pdf', 'organize-pdf'],
    howToStepsEn: [
      { name: 'Load File', text: 'Open PDF in the interactive editing studio.' },
      { name: 'Annotate & Draw', text: 'Add text notes, vector rectangles, or freehand lines.' },
      { name: 'Save Changes', text: 'Export modified PDF with baked annotations.' }
    ],
    howToStepsAr: [
      { name: 'فتح الملف', text: 'افتح مستند PDF في مساحة التعديل التفاعلية.' },
      { name: 'إضافة الملاحظات', text: 'أضف نصوصاً ومربعات تظليل ورسوماً يدوية.' },
      { name: 'حفظ التعديلات', text: 'صدّر المستند المعدل بضغطة زر واحدة.' }
    ]
  },
  'pdf-to-jpg': {
    titleEn: 'PDF to JPG Online — Extract High-DPI Images from PDF | Kanto',
    descEn: 'Convert PDF pages into high-resolution JPG or PNG images with crisp rendering. Extract raster figures with zero compression artifacts.',
    titleAr: 'تحويل PDF إلى صور JPG عالية النقاء أونلاين | كانتو',
    descAr: 'استخرج صفحات مستند PDF كصور JPG أو PNG عالية الدقة للطباعة أو المشاركة السريعة بأمان تام.',
    relatedToolIds: ['jpg-to-pdf', 'pdf-to-word', 'crop-pdf', 'scan-to-pdf'],
    howToStepsEn: [
      { name: 'Drop PDF', text: 'Choose the PDF you want to rasterize into images.' },
      { name: 'Select Format', text: 'Choose JPG or PNG image output resolution.' },
      { name: 'Download Images', text: 'Save individual image frames or archive.' }
    ],
    howToStepsAr: [
      { name: 'إسقاط الملف', text: 'اختر مستند PDF لتحويل صفحاته إلى صور.' },
      { name: 'تحديد الصيغة', text: 'اختر حفظ الصور بصيغة JPG أو PNG عالية الجودة.' },
      { name: 'تنزيل الصور', text: 'حمّل الصور المستخرجة مباشرة على جهازك.' }
    ]
  },
  'jpg-to-pdf': {
    titleEn: 'JPG to PDF Online — Combine Images into One PDF Document | Kanto',
    descEn: 'Compile multiple JPG, PNG, and WebP images into a standardized vector PDF with custom margins and auto-orientation alignment.',
    titleAr: 'تحويل الصور JPG إلى مستند PDF واحد أونلاين | كانتو',
    descAr: 'جمّع مجموعة من الصور (JPG, PNG, WebP) في ملف PDF واحد منسق ومرتب بالترتيب والمقاس المناسب لك.',
    relatedToolIds: ['pdf-to-jpg', 'scan-to-pdf', 'merge-pdf', 'organize-pdf'],
    howToStepsEn: [
      { name: 'Upload Images', text: 'Drop photos and graphics into the compilation grid.' },
      { name: 'Reorder Sheets', text: 'Arrange image order and select A4 or Fit page sizing.' },
      { name: 'Compile PDF', text: 'Download unified high-quality PDF album.' }
    ],
    howToStepsAr: [
      { name: 'رفع الصور', text: 'أسقط مجموعة الصور المراد تجميعها في مساحة العمل.' },
      { name: 'ترتيب الصور', text: 'رتّب تسلسل الصور وحدد مقاس الصفحة المطلوب.' },
      { name: 'توليد PDF', text: 'حمّل مستند PDF الموحد والمنسق فوراً.' }
    ]
  },
  'sign-pdf': {
    titleEn: 'Sign PDF Online Free — Draw or Type Digital Signature | Kanto',
    descEn: 'Draw your verified signature or type formal cursive script to stamp digital signatures on any PDF page with cryptographic integrity.',
    titleAr: 'توقيع ملفات PDF إلكترونياً مجاناً بالرسم أو الكتابة | كانتو',
    descAr: 'وقّع مستنداتك وعقودك الرسمية برسم توقيعك اليدوي أو كتابته بخط معتمد مع الحفاظ الكامل على سرية المستند.',
    relatedToolIds: ['protect-pdf', 'watermark-pdf', 'edit-pdf', 'unlock-pdf'],
    howToStepsEn: [
      { name: 'Load Contract', text: 'Open your document in the secure signature pad.' },
      { name: 'Create Signature', text: 'Draw freehand or type your legal name.' },
      { name: 'Stamp & Export', text: 'Place signature precisely and download signed PDF.' }
    ],
    howToStepsAr: [
      { name: 'فتح العقد', text: 'افتح المستند في لوحة التوقيع الآمنة.' },
      { name: 'إنشاء التوقيع', text: 'ارسم توقيعك باليد أو اكتب اسمك بالخط المعتمد.' },
      { name: 'تثبيت وتصدير', text: 'ثبّت التوقيع في الموضع المطلوب وحمّل الملف.' }
    ]
  },
  'watermark-pdf': {
    titleEn: 'Watermark PDF Online — Add Custom Text or Copyright Stamp | Kanto',
    descEn: 'Stamp customizable watermark text, copyright notices, and security badges across all pages with angle and opacity control.',
    titleAr: 'إضافة علامة مائية لملفات PDF لحماية الحقوق أونلاين | كانتو',
    descAr: 'أضف نصاً مائياً مخصصاً أو ختماً رسمياً لحماية الملكية الفكرية والسرية عبر كافة صفحات مستند PDF.',
    relatedToolIds: ['protect-pdf', 'page-numbers', 'sign-pdf', 'redact-pdf'],
    howToStepsEn: [
      { name: 'Upload PDF', text: 'Select the file requiring watermark protection.' },
      { name: 'Customize Text', text: 'Enter text, opacity level, rotation angle, and position.' },
      { name: 'Apply Stamp', text: 'Download watermarked PDF document.' }
    ],
    howToStepsAr: [
      { name: 'تحميل المستند', text: 'اختر ملف PDF المراد حمايته بعلامة مائية.' },
      { name: 'تخصيص النص', text: 'اكتب النص وحدد زاوية الميلان ومستوى الشفافية.' },
      { name: 'تطبيق التثبيت', text: 'حمّل المستند النهائي محمي بالعلامة المائية.' }
    ]
  },
  'rotate-pdf': {
    titleEn: 'Rotate PDF Online — Rotate Pages 90°, 180° or 270° | Kanto',
    descEn: 'Rotate individual or all pages within a PDF document clockwise or counter-clockwise with permanent metadata persistence.',
    titleAr: 'تدوير صفحات PDF بزاوية 90 أو 180 درجة أونلاين | كانتو',
    descAr: 'عدّل اتجاه صفحات المستند المقلوبة بتدويرها 90° أو 180° أو 270° وتثبيت الاتجاه بصورة دائمة.',
    relatedToolIds: ['organize-pdf', 'split-pdf', 'crop-pdf', 'merge-pdf'],
    howToStepsEn: [
      { name: 'Open Document', text: 'Load PDF pages into the visual thumbnail deck.' },
      { name: 'Rotate Pages', text: 'Click individual rotate icons or Rotate All 90°.' },
      { name: 'Save Orientation', text: 'Download corrected PDF document.' }
    ],
    howToStepsAr: [
      { name: 'فتح المستند', text: 'اعرض صفحات المستند في لوحة العمل البصرية.' },
      { name: 'تدوير الصفحات', text: 'انقر على رمز التدوير للصفحة أو دور كافة الصفحات.' },
      { name: 'حفظ الاتجاه', text: 'حمّل المستند المصحح الاتجاه فوراً.' }
    ]
  },
  'html-to-pdf': {
    titleEn: 'HTML to PDF Online — Convert Web Pages and HTML Code to PDF | Kanto',
    descEn: 'Convert HTML markup, CSS stylesheets, or web URLs into clean, high-resolution printable PDF documents with zero external tracking.',
    titleAr: 'تحويل HTML وكود الويب إلى مستند PDF أونلاين | كانتو',
    descAr: 'حوّل صفحات الويب وكود HTML إلى ملفات PDF قياسية جاهزة للطباعة مع الحفاظ على التنسيقات والألوان.',
    relatedToolIds: ['word-to-pdf', 'pdf-to-pdfa', 'jpg-to-pdf', 'crop-pdf'],
    howToStepsEn: [
      { name: 'Input HTML', text: 'Paste HTML code or URL to compile into PDF.' },
      { name: 'Render Layout', text: 'Engine generates vector typography and bounding boxes.' },
      { name: 'Export PDF', text: 'Download finalized printable PDF document.' }
    ],
    howToStepsAr: [
      { name: 'إدخال الكود', text: 'ألصق كود HTML أو رابط الصفحة المراد تحويلها.' },
      { name: 'معالجة التنسيق', text: 'يقوم المحرك برسم الصفحة وتنسيقها بدقة.' },
      { name: 'تصدير PDF', text: 'احفظ مستند PDF الناتج على جهازك.' }
    ]
  },
  'unlock-pdf': {
    titleEn: 'Unlock PDF Online — Remove Password & Restrictions from PDF | Kanto',
    descEn: 'Remove user permissions and password restrictions from accessible PDF files securely in your local browser sandbox.',
    titleAr: 'فك قفل ملفات PDF وإزالة كلمات المرور والقيود أونلاين | كانتو',
    descAr: 'أزل قيود التعديل والطباعة وكلمات المرور من مستندات PDF المصرح بفتحها محلياً دون أي خوادم وسيطة.',
    relatedToolIds: ['protect-pdf', 'edit-pdf', 'merge-pdf', 'repair-pdf'],
    howToStepsEn: [
      { name: 'Load Locked PDF', text: 'Select your password-restricted document.' },
      { name: 'Decrypt Permissions', text: 'Engine strips security permissions locally.' },
      { name: 'Download Unlocked', text: 'Save restriction-free PDF document.' }
    ],
    howToStepsAr: [
      { name: 'تحميل الملف المقفل', text: 'اختر مستند PDF المحمي بكلمة مرور أو قيود.' },
      { name: 'فك التشفير', text: 'يقوم النظام بإزالة القيود البرمجية محلياً.' },
      { name: 'تنزيل الملف', text: 'حمّل ملف PDF المفتوح وغير المقيد فوراً.' }
    ]
  },
  'protect-pdf': {
    titleEn: 'Protect PDF Online — Encrypt PDF with AES-256 Password | Kanto',
    descEn: 'Encrypt sensitive PDF files with standard AES-256 bit military-grade password security. Passwords never leave your device memory.',
    titleAr: 'تشفير وحماية ملفات PDF بكلمة مرور قوية AES-256 | كانتو',
    descAr: 'شفّر مستنداتك الهامة بكلمة سر قوية وفق معيار الأمان المتقدم AES-256 لضمان عدم فتحها إلا للمصرح لهم.',
    relatedToolIds: ['unlock-pdf', 'sign-pdf', 'redact-pdf', 'watermark-pdf'],
    howToStepsEn: [
      { name: 'Upload PDF', text: 'Select the sensitive PDF document to secure.' },
      { name: 'Set Password', text: 'Enter a strong AES-256 access password.' },
      { name: 'Download Encrypted', text: 'Save fully encrypted, secure PDF file.' }
    ],
    howToStepsAr: [
      { name: 'رفع المستند', text: 'اختر ملف PDF المراد حمايته وتشفيره.' },
      { name: 'تعيين كلمة السر', text: 'أدخل كلمة مرور قوية لتشفير المستند.' },
      { name: 'تنزيل الملف المشفر', text: 'حمّل مستند PDF المشفر والمحمي بالكامل.' }
    ]
  },
  'organize-pdf': {
    titleEn: 'Organize PDF Online — Sort, Reorder, Duplicate & Delete Pages | Kanto',
    descEn: 'Rearrange page sequences, delete unnecessary sheets, and duplicate key pages with an intuitive visual drag-and-drop workspace.',
    titleAr: 'ترتيب وتنظيم صفحات PDF وحذف وتكرار الصفحات | كانتو',
    descAr: 'أعد ترتيب صفحات مستند PDF بالسحب والإفلات، واحذف الصفحات الزائدة وكرر الصفحات المطلوبة بكل مرونة.',
    relatedToolIds: ['rotate-pdf', 'split-pdf', 'merge-pdf', 'crop-pdf'],
    howToStepsEn: [
      { name: 'View Page Deck', text: 'Inspect all pages as interactive thumbnail cards.' },
      { name: 'Drag & Reorder', text: 'Drag sheets to change order, or click trash to remove.' },
      { name: 'Save Organized PDF', text: 'Download your newly arranged PDF document.' }
    ],
    howToStepsAr: [
      { name: 'استعراض الصفحات', text: 'شاهد كافة صفحات المستند كبطاقات مصغرة تفاعلية.' },
      { name: 'السحب والترتيب', text: 'اسحب الصفحات لتغيير ترتيبها أو احذف ما لا تحتاجه.' },
      { name: 'حفظ المستند', text: 'حمّل ملف PDF المنظم والمرتب بالشكل النهائي.' }
    ]
  },
  'pdf-to-pdfa': {
    titleEn: 'PDF to PDF/A Online — ISO Archival Standard Conversion | Kanto',
    descEn: 'Convert PDF documents into ISO 19005-1 compliant PDF/A archival format for long-term document preservation and compliance.',
    titleAr: 'تحويل PDF إلى صيغة الأرشفة القياسية PDF/A الدولية | كانتو',
    descAr: 'حوّل مستنداتك إلى معيار الأرشفة الدولي ISO PDF/A لضمان حفظها ومطابقتها للمتطلبات القانونية والتاريخية.',
    relatedToolIds: ['compress-pdf', 'repair-pdf', 'protect-pdf', 'pdf-to-word'],
    howToStepsEn: [
      { name: 'Select PDF', text: 'Upload the document requiring long-term archival.' },
      { name: 'Enforce Compliance', text: 'Engine validates font embedding and color spaces.' },
      { name: 'Download PDF/A', text: 'Save ISO-standard archival compliant PDF.' }
    ],
    howToStepsAr: [
      { name: 'اختيار المستند', text: 'اختر ملف PDF المراد تحويله للأرشفة الدائمة.' },
      { name: 'تطبيق المعايير', text: 'يتحقق النظام من تضمين الخطوط وفضاءات الألوان القياسية.' },
      { name: 'تنزيل PDF/A', text: 'حمّل الملف المطابق لمواصفات ISO 19005-1.' }
    ]
  },
  'repair-pdf': {
    titleEn: 'Repair PDF Online Free — Fix Corrupted or Damaged PDF Files | Kanto',
    descEn: 'Analyze and reconstruct damaged, corrupted, or unreadable PDF cross-reference byte structures entirely inside your browser memory.',
    titleAr: 'إصلاح ملفات PDF التالفة واستعادة البيانات أونلاين | كانتو',
    descAr: 'افحص وأعد بناء هياكل ملفات PDF التالفة أو غير القابلة للفتح واستعد محتواها الثمين بأمان محلي تام.',
    relatedToolIds: ['unlock-pdf', 'organize-pdf', 'compress-pdf', 'pdf-to-pdfa'],
    howToStepsEn: [
      { name: 'Upload Corrupt PDF', text: 'Drop damaged or unreadable PDF document.' },
      { name: 'Reconstruct Stream', text: 'Local parser rebuilds cross-reference tables.' },
      { name: 'Export Repaired PDF', text: 'Download restored, readable PDF document.' }
    ],
    howToStepsAr: [
      { name: 'رفع الملف التالف', text: 'أسقط ملف PDF المعطوب أو غير القابل للقراءة.' },
      { name: 'إعادة البناء', text: 'يقوم المحرك بفحص الجداول والبيانات وإصلاح الخلل.' },
      { name: 'تصدير الملف السليم', text: 'حمّل مستند PDF بعد استعادته وإصلاحه.' }
    ]
  },
  'page-numbers': {
    titleEn: 'Add Page Numbers to PDF Online — Number Headers & Footers | Kanto',
    descEn: 'Stamp customizable page numbering (Page 1 of N, sequential digits) on header or footer positions with font and margin controls.',
    titleAr: 'ترقيم صفحات PDF وإضافة أرقام الصفحات أونلاين | كانتو',
    descAr: 'أضف أرقاماً تسلسلية واضحة في رأس أو تذييل صفحات مستند PDF بتنسيق مخصص وأنيق يناسب المستندات الرسمية.',
    relatedToolIds: ['watermark-pdf', 'organize-pdf', 'merge-pdf', 'crop-pdf'],
    howToStepsEn: [
      { name: 'Add PDF', text: 'Open document in page numbering configuration tool.' },
      { name: 'Select Position', text: 'Choose Bottom-Center, Bottom-Right, or Top headers.' },
      { name: 'Stamp Numbers', text: 'Download numbered PDF document immediately.' }
    ],
    howToStepsAr: [
      { name: 'إضافة المستند', text: 'افتح الملف في أداة ضبط ترقيم الصفحات.' },
      { name: 'تحديد الموضع', text: 'اختر مكان الترقيم (أسفل المنتصف، أسفل اليمين، أو الرأس).' },
      { name: 'تثبيت الأرقام', text: 'حمّل مستند PDF بعد إدراج الأرقام بتناسق.' }
    ]
  },
  'scan-to-pdf': {
    titleEn: 'Scan to PDF Online — Enhance & Convert Photos to Clean PDF | Kanto',
    descEn: 'Clean, deskew, and optimize camera photos and paper scans into crisp, contrast-balanced digital PDF documents.',
    titleAr: 'مسح ضوئي وتحويل الصور إلى مستندات PDF نقية | كانتو',
    descAr: 'حوّل صور المستندات الملتقطة بالكاميرا إلى ملفات PDF نقية مع ضبط التباين وإزالة الظلال والانحناءات.',
    relatedToolIds: ['jpg-to-pdf', 'pdf-to-pdfa', 'crop-pdf', 'pdf-to-jpg'],
    howToStepsEn: [
      { name: 'Input Scans', text: 'Upload phone photos or flatbed scan images.' },
      { name: 'Enhance Contrast', text: 'Auto-adjust black and white text sharpness.' },
      { name: 'Export Scanned PDF', text: 'Download clean digitized PDF document.' }
    ],
    howToStepsAr: [
      { name: 'إدخال الصور', text: 'ارفع صور الأوراق والمستندات الملتقطة بالكاميرا.' },
      { name: 'تحسين التباين', text: 'يقوم النظام بضبط وضوح الحروف وإزالة الشوائب.' },
      { name: 'تصدير PDF', text: 'حمّل المستند الرقمي النقي والمعد للطباعة.' }
    ]
  },
  'redact-pdf': {
    titleEn: 'Redact PDF Online — Permanently Black Out Sensitive Data | Kanto',
    descEn: 'Permanently remove and black out confidential text, financial figures, and private metadata before public distribution. Zero byte retention.',
    titleAr: 'طمس وحجب البيانات الحساسة والسرية في PDF أونلاين | كانتو',
    descAr: 'احجب الأرقام والبيانات السرية والمعلومات الشخصية من مستندات PDF نهائياً دون إمكانية استرجاعها بعد التصدير.',
    relatedToolIds: ['protect-pdf', 'edit-pdf', 'watermark-pdf', 'sign-pdf'],
    howToStepsEn: [
      { name: 'Open Document', text: 'Load PDF into the secure redaction canvas.' },
      { name: 'Select Sensitive Areas', text: 'Place blackout bounding boxes over confidential text.' },
      { name: 'Burn & Export', text: 'Download sanitized PDF with data permanently stripped.' }
    ],
    howToStepsAr: [
      { name: 'فتح المستند', text: 'افتح ملف PDF في مساحة حجب البيانات الآمنة.' },
      { name: 'تحديد المناطق الحساسة', text: 'ضع مربعات الحجب السوداء فوق المعلومات السرية.' },
      { name: 'التثبيت والتصدير', text: 'حمّل المستند بعد مسح وحجب البيانات نهائياً.' }
    ]
  },
  'crop-pdf': {
    titleEn: 'Crop PDF Online — Trim Page Margins & Adjust Bounding Box | Kanto',
    descEn: 'Trim white margins, crop visible canvas bounds, and calibrate print dimensions across all document sheets with instant preview.',
    titleAr: 'قص هوامش PDF وتعديل أبعاد الصفحات أونلاين | كانتو',
    descAr: 'قلّم الهوامش البيضاء الزائدة واضبط إطار عرض الصفحات بما يتناسب مع أجهزة القراءة والطباعة بدقة.',
    relatedToolIds: ['organize-pdf', 'rotate-pdf', 'split-pdf', 'scan-to-pdf'],
    howToStepsEn: [
      { name: 'Upload PDF', text: 'Open document in the interactive crop viewer.' },
      { name: 'Adjust Bounding Box', text: 'Drag margin handles to set custom page limits.' },
      { name: 'Apply & Save', text: 'Download precisely cropped PDF document.' }
    ],
    howToStepsAr: [
      { name: 'رفع المستند', text: 'افتح ملف PDF في عارض قص الهوامش التفاعلي.' },
      { name: 'ضبط حدود القص', text: 'اسحب مقابض الهوامش لتحديد مساحة المحتوى المطلوبة.' },
      { name: 'التطبيق والحفظ', text: 'حمّل مستند PDF المقصوص بدقة.' }
    ]
  },
  'pdf-forms': {
    titleEn: 'PDF Forms Online — Fill & Export Interactive AcroForms | Kanto',
    descEn: 'Fill interactive PDF text fields, checkboxes, and radio buttons with local memory validation and clean finalized export.',
    titleAr: 'تعبئة نماذج PDF التفاعلية وتصدير الاستمارات أونلاين | كانتو',
    descAr: 'املأ حقول النماذج التفاعلية في ملفات PDF بسهولة مع الحفاظ على التنسيق القانوني وتصدير الاستمارة مكتملة.',
    relatedToolIds: ['sign-pdf', 'edit-pdf', 'protect-pdf', 'watermark-pdf'],
    howToStepsEn: [
      { name: 'Open Form', text: 'Load interactive AcroForm PDF document.' },
      { name: 'Fill Fields', text: 'Complete text fields, select options, and checkboxes.' },
      { name: 'Export Filled PDF', text: 'Download completed and flattened form.' }
    ],
    howToStepsAr: [
      { name: 'فتح النموذج', text: 'افتح استمارة PDF التفاعلية في مساحة العمل.' },
      { name: 'تعبئة البيانات', text: 'اكتب في الحقول النصية وحدد الخيارات المطلوبة.' },
      { name: 'تصدير النموذج', text: 'حمّل الاستمارة المكتملة البيانات فوراً.' }
    ]
  }
};
