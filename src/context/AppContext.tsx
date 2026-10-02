import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ToolDef, ToolCategory, ScreenState, UploadedFileItem, ToolActionParams, ProcessResult, PdfPageItem, FormFieldItem, ScannedPageItem, ScanFilterMode } from '../types/tools';
import { MergeInputFile, validateMergeFiles, executeMerge } from '../services/mergeEngine';
import { validateSplitFile, executeSplit, SplitRange, parseAndValidateRanges, generateIntervalRanges } from '../services/splitEngine';
import { KantoDocument } from '../services/kantoDocument';
import type { PdfAnnotation } from '../services/editEngine';
import type { ImageInputItem } from '../services/jpgToPdfEngine';
import type { OrganizePageItem } from '../services/organizeEngine';
import { TOOLS_LIST } from '../data/toolsList';
import { translations, Translations } from '../i18n/translations';
import { SupportedLanguage } from './LanguageContext';
import { updatePageSeo } from '../utils/seo';
import { pdfWorker } from '../services/pdfWorkerClient';
import { clearAllCachedDocuments } from '../services/pdfDocumentCache';

const triggerConfetti = async (options?: any) => {
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti(options);
  } catch {
    // safe fallback
  }
};

interface AppContextType {
  lang: SupportedLanguage;
  isRtl: boolean;
  t: Translations;
  setLang: (lang: SupportedLanguage) => void;
  toggleLang: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;

  screen: ScreenState;
  setScreen: (s: ScreenState) => void;
  selectedTool: ToolDef;
  setSelectedTool: (t: ToolDef) => void;
  selectToolById: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategory: ToolCategory;
  setActiveCategory: (cat: ToolCategory) => void;

  uploadedFiles: UploadedFileItem[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFileItem[]>>;
  activeFileIndex: number;
  setActiveFileIndex: (idx: number) => void;
  addFiles: (files: File[]) => Promise<void>;
  loadSampleDoc: () => Promise<void>;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;

  // Dedicated Merge Files State & Controls
  mergeFiles: MergeInputFile[];
  reorderMergeFiles: (fromIdx: number, toIdx: number) => void;
  removeMergeFile: (index: number) => void;
  addMoreMergeFiles: (files: File[]) => Promise<void>;

  // Dedicated Split State & Controls
  splitMode: 'ranges' | 'interval';
  setSplitMode: (mode: 'ranges' | 'interval') => void;
  splitRangeInput: string;
  setSplitRangeInput: (str: string) => void;
  splitIntervalValue: number;
  setSplitIntervalValue: (val: number) => void;
  computedSplitRanges: SplitRange[];
  splitValidationError?: string;

  // Dedicated Edit PDF State
  editAnnotations: PdfAnnotation[];
  setEditAnnotations: React.Dispatch<React.SetStateAction<PdfAnnotation[]>>;
  editActiveTool: 'text' | 'rect' | 'draw' | 'highlight' | 'select';
  setEditActiveTool: (tool: 'text' | 'rect' | 'draw' | 'highlight' | 'select') => void;
  editActiveColor: string;
  setEditActiveColor: (color: string) => void;
  editActiveFontSize: number;
  setEditActiveFontSize: (size: number) => void;
  editActivePageIndex: number;
  setEditActivePageIndex: (index: number) => void;

  // Dedicated JPG to PDF State
  jpgToPdfImages: ImageInputItem[];
  setJpgToPdfImages: React.Dispatch<React.SetStateAction<ImageInputItem[]>>;
  addMoreJpgToPdfFiles: (files: File[]) => Promise<void>;
  
  // Dedicated Organize PDF State
  organizePages: OrganizePageItem[];
  setOrganizePages: React.Dispatch<React.SetStateAction<OrganizePageItem[]>>;
  resetOrganizePages: () => void;
  
  // Dedicated PDF Forms State
  formFields: FormFieldItem[];
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldItem[]>>;
  formFieldValues: Record<string, string | boolean>;
  updateFormFieldValue: (name: string, value: string | boolean) => void;
  resetFormFieldValues: () => void;
  formFlattenEnabled: boolean;
  setFormFlattenEnabled: React.Dispatch<React.SetStateAction<boolean>>;

  // Dedicated Scan to PDF State
  scannedPages: ScannedPageItem[];
  setScannedPages: React.Dispatch<React.SetStateAction<ScannedPageItem[]>>;
  scanFilterMode: ScanFilterMode;
  setScanFilterMode: React.Dispatch<React.SetStateAction<ScanFilterMode>>;
  scanThreshold: number;
  setScanThreshold: React.Dispatch<React.SetStateAction<number>>;
  scanPageSize: 'original' | 'a4_fit';
  setScanPageSize: React.Dispatch<React.SetStateAction<'original' | 'a4_fit'>>;

  // Page operations
  activePages: PdfPageItem[];
  rotatePage: (pageNumber: number, deg?: number) => void;
  deletePage: (pageNumber: number) => void;
  restorePage: (pageNumber: number) => void;
  rotateAllPages: (deg?: number) => void;
  resetAllRotations: () => void;
  selectAllPages: () => void;
  deselectAllPages: () => void;
  deleteSelectedPages: () => void;
  reorderPages: (sourceIdx: number, destIdx: number) => void;

  // Tool parameters & execution
  actionParams: ToolActionParams;
  updateActionParams: (params: Partial<ToolActionParams>) => void;
  isProcessing: boolean;
  processProgress: number;
  progressStatusText: string;
  processResult: ProcessResult | null;
  executeAction: () => Promise<void>;
  resetWorkspace: () => void;

  // Auth & Monetization state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
  userEmail: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const parseInitialRoute = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    const supportedLangs: SupportedLanguage[] = ['en', 'ar'];
    let initialLang: SupportedLanguage = 'en';
    let initialTool = TOOLS_LIST[0];
    let initialScreen: ScreenState = 'catalog';

    let remainingParts = parts;

    if (parts[0] && supportedLangs.includes(parts[0] as SupportedLanguage)) {
      initialLang = parts[0] as SupportedLanguage;
      remainingParts = parts.slice(1);
    } else {
      try {
        const saved = localStorage.getItem('kanto_language') as SupportedLanguage;
        if (saved && supportedLangs.includes(saved)) {
          initialLang = saved;
        }
      } catch {
        // ignore
      }
    }

    if (remainingParts[0] === 'privacy') {
      initialScreen = 'privacy';
    } else if (remainingParts[0] === 'terms') {
      initialScreen = 'terms';
    } else if (remainingParts[0]) {
      const found = TOOLS_LIST.find(t => t.id === remainingParts[0] || t.key === remainingParts[0]);
      if (found) {
        initialTool = found;
        initialScreen = 'upload';
      }
    }

    return { initialLang, initialTool, initialScreen };
  };

  const initial = parseInitialRoute();
  const [lang, setLangState] = useState<SupportedLanguage>(initial.initialLang);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [screen, setScreenState] = useState<ScreenState>(initial.initialScreen);
  const [selectedTool, setSelectedToolState] = useState<ToolDef>(initial.initialTool);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [mergeFiles, setMergeFiles] = useState<MergeInputFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [activePages, setActivePages] = useState<PdfPageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Split PDF state
  const [splitMode, setSplitMode] = useState<'ranges' | 'interval'>('ranges');
  const [splitRangeInput, setSplitRangeInput] = useState<string>('1-2, 3-4');
  const [splitIntervalValue, setSplitIntervalValue] = useState<number>(2);

  // Edit PDF state
  const [editAnnotations, setEditAnnotations] = useState<PdfAnnotation[]>([]);
  const [editActiveTool, setEditActiveTool] = useState<'text' | 'rect' | 'draw' | 'highlight' | 'select'>('text');
  const [editActiveColor, setEditActiveColor] = useState<string>('#0D0D0D');
  const [editActiveFontSize, setEditActiveFontSize] = useState<number>(14);
  const [editActivePageIndex, setEditActivePageIndex] = useState<number>(0);

  // JPG to PDF state
  const [jpgToPdfImages, setJpgToPdfImages] = useState<ImageInputItem[]>([]);

  // Organize PDF state
  const [organizePages, setOrganizePages] = useState<OrganizePageItem[]>([]);

  // PDF Forms state
  const [formFields, setFormFields] = useState<FormFieldItem[]>([]);
  const [formFieldValues, setFormFieldValues] = useState<Record<string, string | boolean>>({});
  const [formFlattenEnabled, setFormFlattenEnabled] = useState<boolean>(true);

  const updateFormFieldValue = (name: string, value: string | boolean) => {
    setFormFieldValues(prev => ({ ...prev, [name]: value }));
  };

  const resetFormFieldValues = () => {
    const initialValues: Record<string, string | boolean> = {};
    formFields.forEach(f => {
      initialValues[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'checkbox' ? false : '');
    });
    setFormFieldValues(initialValues);
  };

  // Scan to PDF state
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);
  const [scanFilterMode, setScanFilterMode] = useState<ScanFilterMode>('bw_threshold');
  const [scanThreshold, setScanThreshold] = useState<number>(140);
  const [scanPageSize, setScanPageSize] = useState<'original' | 'a4_fit'>('original');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [userEmail] = useState<string | null>(null);

  const [actionParams, setActionParams] = useState<ToolActionParams>({
    compressPreset: 'recommended',
    targetFormat: 'docx',
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 0.35,
    watermarkRotation: 45,
    watermarkPosition: 'center',
    pageNumberPosition: 'bottom-center',
    pageNumberFormat: 'page_x_of_y',
    pageNumberStart: 1,
    pageNumberFontSize: 11,
    pageNumberMargin: 32,
    pageNumberExcludeFirstPage: false,
    splitMode: 'ranges',
    splitRanges: '1-2',
    cropMarginPercent: 5,
    cropRegion: { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 },
    cropApplyToAllPages: true,
    protectPassword: '',
    protectConfirmPassword: '',
    protectAllowPrinting: false,
    protectAllowCopying: false,
    password: '',
    aiLanguage: 'en',
    ocrLanguage: 'ar+en'
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [progressStatusText, setProgressStatusText] = useState<string>('');
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);

  const isRtl = lang === 'ar';
  const t = translations[lang];

  // Dynamic computation of active split ranges
  const activeDocPagesCount = uploadedFiles[0]?.pageCount || activePages.length || 0;
  const activeDocName = uploadedFiles[0]?.name || 'document.pdf';

  let computedSplitRanges: SplitRange[] = [];
  let splitValidationError: string | undefined = undefined;

  if (selectedTool.key === 'split' && activeDocPagesCount > 0) {
    if (splitMode === 'interval') {
      computedSplitRanges = generateIntervalRanges(activeDocPagesCount, splitIntervalValue, activeDocName);
    } else {
      const parsed = parseAndValidateRanges(splitRangeInput, activeDocPagesCount, activeDocName, isRtl);
      computedSplitRanges = parsed.ranges;
      splitValidationError = parsed.error;
    }
  }

  const syncUrl = useCallback((currentLang: SupportedLanguage, currentScreen: ScreenState, currentTool: ToolDef | null) => {
    let targetUrl = `/${currentLang}/`;
    if (currentScreen === 'privacy') {
      targetUrl = '/privacy';
    } else if (currentScreen === 'terms') {
      targetUrl = '/terms';
    } else if (currentScreen !== 'catalog' && currentTool) {
      targetUrl = `/${currentLang}/${currentTool.id}`;
    }
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    updatePageSeo(currentScreen !== 'catalog' && currentScreen !== 'privacy' && currentScreen !== 'terms' ? currentTool : null, currentLang);
  }, []);

  useEffect(() => {
    const isLegalScreen = screen === 'privacy' || screen === 'terms';
    document.documentElement.dir = (isRtl && !isLegalScreen) ? 'rtl' : 'ltr';
    document.documentElement.lang = isLegalScreen ? 'en' : lang;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    syncUrl(lang, screen, selectedTool);
  }, [lang, isRtl, isDarkMode, screen, selectedTool, syncUrl]);

  useEffect(() => {
    const handlePopState = () => {
      const { initialLang, initialTool, initialScreen } = parseInitialRoute();
      setLangState(initialLang);
      setSelectedToolState(initialTool);
      setScreenState(initialScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem('kanto_language', newLang);
    } catch {
      // ignore
    }
    syncUrl(newLang, screen, selectedTool);
  };

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setLangState(nextLang);
    try {
      localStorage.setItem('kanto_language', nextLang);
    } catch {
      // ignore
    }
    syncUrl(nextLang, screen, selectedTool);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setScreen = (newScreen: ScreenState) => {
    setScreenState(newScreen);
    setErrorMessage(null);
    syncUrl(lang, newScreen, selectedTool);
  };

  const setSelectedTool = (tool: ToolDef) => {
    setSelectedToolState(tool);
    setErrorMessage(null);
    syncUrl(lang, screen, tool);
  };

  const selectToolById = (id: string) => {
    const found = TOOLS_LIST.find(t => t.id === id || t.key === id);
    if (found) {
      setSelectedToolState(found);
      setScreenState('upload');
      setProcessResult(null);
      setErrorMessage(null);
      syncUrl(lang, 'upload', found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addMoreJpgToPdfFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    try {
      const { validateJpgToPdfFiles } = await import('../services/jpgToPdfEngine');
      const validation = await validateJpgToPdfFiles(files, isRtl);
      if (!validation.isValid || validation.images.length === 0) {
        setErrorMessage(validation.error || 'Failed to add image files.');
        return;
      }
      const merged = [...jpgToPdfImages, ...validation.images];
      setJpgToPdfImages(merged);
      const pages: PdfPageItem[] = merged.map((_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));
      setActivePages(pages);
      setUploadedFiles(prev => [
        {
          id: prev[0]?.id || `jpg-to-pdf-doc-${Date.now()}`,
          file: prev[0]?.file || merged[0].file,
          name: `${merged[0].name} and ${merged.length - 1} more`,
          size: merged.reduce((acc, img) => acc + img.size, 0),
          pageCount: merged.length,
          arrayBuffer: merged[0].arrayBuffer,
          pages,
        },
      ]);
    } catch {
      setErrorMessage(isRtl ? 'تعذر إضافة الصور الجديدة.' : 'Failed to add more images.');
    }
  };

  // Main file uploader
  const addFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    // 1. Merge PDF Path
    if (selectedTool.key === 'merge') {
      const validation = await validateMergeFiles(files, isRtl);
      if (!validation.isValid) {
        setErrorMessage(validation.error || 'Invalid files for Merge PDF.');
        return;
      }

      setMergeFiles(validation.validFiles);
      setUploadedFiles(
        validation.validFiles.map(vf => ({
          id: vf.id,
          file: new File([vf.arrayBuffer], vf.name, { type: 'application/pdf' }),
          name: vf.name,
          size: vf.size,
          pageCount: vf.pageCount,
          arrayBuffer: vf.arrayBuffer,
          pages: [],
        }))
      );
      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 2. Split PDF Path (Single File with >= 2 pages)
    if (selectedTool.key === 'split') {
      const validation = await validateSplitFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Split PDF.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `split-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);

      // Initialize default split range: half / half
      const mid = Math.ceil(fileItem.pageCount / 2);
      setSplitRangeInput(`1-${mid}, ${mid + 1}-${fileItem.pageCount}`);

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 3. Compress PDF Path (Single File)
    if (selectedTool.key === 'compress') {
      const { validateCompressFile } = await import('../services/compressEngine');
      const validation = await validateCompressFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Compress PDF.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `compress-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4. PDF to Word Path (Single File with Text Extraction)
    if (selectedTool.key === 'pdfToWord' || selectedTool.id === 'pdf-to-word') {
      const { validatePdfToWordFile } = await import('../services/pdfToWordEngine');
      const validation = await validatePdfToWordFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF to Word conversion.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `word-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4b. PDF to PowerPoint Path (High-Fidelity Rasterization)
    if (selectedTool.key === 'pdfToPpt' || selectedTool.id === 'pdf-to-powerpoint') {
      const { validatePdfToPptFile } = await import('../services/pdfToPowerpointEngine');
      const validation = await validatePdfToPptFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF to PowerPoint conversion.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `ppt-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4c. PDF to Excel Path (Spatial Data Extraction)
    if (selectedTool.key === 'pdfToExcel' || selectedTool.id === 'pdf-to-excel') {
      const { validatePdfToExcelFile } = await import('../services/pdfToExcelEngine');
      const validation = await validatePdfToExcelFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF to Excel conversion.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `excel-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4d. Word to PDF Path (Mammoth HTML Translation & Rendering)
    if (selectedTool.key === 'wordToPdf' || selectedTool.id === 'word-to-pdf') {
      const { validateWordToPdfFile } = await import('../services/wordToPdfEngine');
      const validation = await validateWordToPdfFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Word to PDF conversion.');
        return;
      }

      const fileItem = validation.file;
      const pages: PdfPageItem[] = [
        { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
      ];

      setUploadedFiles([
        {
          id: `word-to-pdf-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: 1,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4e. PowerPoint to PDF Path (Server-Side API Route)
    if (selectedTool.key === 'pptToPdf' || selectedTool.id === 'powerpoint-to-pdf') {
      const { validatePptToPdfFile } = await import('../services/pptToPdfEngine');
      const validation = await validatePptToPdfFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PowerPoint to PDF conversion.');
        return;
      }

      const fileItem = validation.file;
      const pages: PdfPageItem[] = Array.from({ length: fileItem.slideCount }, (_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setUploadedFiles([
        {
          id: `ppt-to-pdf-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.slideCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4f. Excel to PDF Path (SheetJS HTML Table Rendering)
    if (selectedTool.key === 'excelToPdf' || selectedTool.id === 'excel-to-pdf') {
      const { validateExcelToPdfFile } = await import('../services/excelToPdfEngine');
      const validation = await validateExcelToPdfFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Excel to PDF conversion.');
        return;
      }

      const fileItem = validation.file;
      const pages: PdfPageItem[] = Array.from({ length: fileItem.sheetCount }, (_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setUploadedFiles([
        {
          id: `excel-to-pdf-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.sheetCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4g. Edit PDF Path (Interactive 2-Layer Workspace)
    if (selectedTool.key === 'edit' || selectedTool.id === 'edit-pdf') {
      const { validateEditFile } = await import('../services/editEngine');
      const validation = await validateEditFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Edit PDF.');
        return;
      }

      const fileItem = validation.file;
      const pages: PdfPageItem[] = Array.from({ length: fileItem.pageCount }, (_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setUploadedFiles([
        {
          id: `edit-pdf-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setEditAnnotations([]);
      setEditActivePageIndex(0);

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 4h. PDF to JPG Path (High-Res Canvas & JSZip Bundling)
    if (selectedTool.key === 'pdfToJpg' || selectedTool.id === 'pdf-to-jpg') {
      const { validatePdfToJpgFile } = await import('../services/pdfToJpgEngine');
      const validation = await validatePdfToJpgFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF to JPG conversion.');
        return;
      }

      const fileItem = validation.file;
      const pages: PdfPageItem[] = Array.from({ length: fileItem.pageCount }, (_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setUploadedFiles([
        {
          id: `pdf-to-jpg-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 4h. JPG to PDF Path (Multi-Image Bundling & Dynamic Page Sizing)
    if (selectedTool.key === 'jpgToPdf' || selectedTool.id === 'jpg-to-pdf') {
      const { validateJpgToPdfFiles } = await import('../services/jpgToPdfEngine');
      const validation = await validateJpgToPdfFiles(files, isRtl);
      if (!validation.isValid || validation.images.length === 0) {
        setErrorMessage(validation.error || 'Invalid image files for JPG to PDF conversion.');
        return;
      }

      const images = validation.images;
      const pages: PdfPageItem[] = images.map((_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setJpgToPdfImages(images);
      setUploadedFiles([
        {
          id: `jpg-to-pdf-doc-${Date.now()}`,
          file: images[0].file,
          name: images.length > 1 ? `${images[0].name} and ${images.length - 1} more` : images[0].name,
          size: images.reduce((acc, img) => acc + img.size, 0),
          pageCount: images.length,
          arrayBuffer: images[0].arrayBuffer,
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

    // 4j. Watermark PDF Path (Center-Anchored Batch Stamping)
    if (selectedTool.key === 'watermark' || selectedTool.id === 'watermark-pdf') {
      try {
        const buffer = await files[0].arrayBuffer();
        const kantoDoc = new KantoDocument(buffer);
        await kantoDoc.load({ ignoreEncryption: true });
        const pages = kantoDoc.getPageDeck(0);

        setUploadedFiles([
          {
            id: `watermark-doc-${Date.now()}`,
            file: files[0],
            name: files[0].name,
            size: files[0].size,
            pageCount: pages.length,
            arrayBuffer: buffer,
            pages,
          },
        ]);
        setActiveFileIndex(0);
        setActivePages(pages);
        setActionParams(prev => ({
          ...prev,
          watermarkText: prev.watermarkText || (isRtl ? 'سري للغاية' : 'CONFIDENTIAL'),
          watermarkFontSize: prev.watermarkFontSize || 48,
          watermarkOpacity: prev.watermarkOpacity !== undefined ? prev.watermarkOpacity : 0.35,
          watermarkRotation: prev.watermarkRotation !== undefined ? prev.watermarkRotation : 45,
          watermarkColor: prev.watermarkColor || '#DC2626',
        }));

        setScreenState('workspace');
        setProcessResult(null);
        syncUrl(lang, 'workspace', selectedTool);
        return;
      } catch {
        setErrorMessage(isRtl ? 'تعذر تحميل ملف PDF للعلامة المائية.' : 'Failed to load PDF for Watermark.');
        return;
      }
    }

    // 5. Sign PDF Path (Single Document Signing)
    if (selectedTool.key === 'sign') {
      const { validateSignFile } = await import('../services/signEngine');
      const validation = await validateSignFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Sign PDF.');
        return;
      }

      const fileItem = validation.file;
      const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
      await kantoDoc.load({ ignoreEncryption: true });
      const pages = kantoDoc.getPageDeck(0);

      setUploadedFiles([
        {
          id: `sign-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setActionParams(prev => ({
        ...prev,
        signaturePlacementMode: 'current',
        signatureTargetPage: 1,
        signaturePosition: prev.signaturePosition || {
          xPercent: 62,
          yPercent: 78,
          widthPercent: 28,
          heightPercent: 12,
        },
      }));

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 6. Unlock PDF Path (Inspection & Password Detection)
    if (selectedTool.key === 'unlock') {
      const { validateUnlockFile } = await import('../services/unlockEngine');
      const validation = await validateUnlockFile(files[0], undefined, isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Unlock PDF.');
        return;
      }

      const fileItem = validation.file;
      let pages: PdfPageItem[] = [];

      // If document does not require open password immediately, load page deck
      if (!validation.inspection.needsPassword) {
        try {
          const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
          await kantoDoc.load({ ignoreEncryption: true });
          pages = kantoDoc.getPageDeck(0);
        } catch {
          pages = Array.from({ length: fileItem.pageCount || 1 }, (_, i) => ({
            pageNumber: i + 1,
            originalIndex: i,
            rotation: 0,
            isDeleted: false,
            sourceFileIndex: 0,
          }));
        }
      } else {
        pages = [
          {
            pageNumber: 1,
            originalIndex: 0,
            rotation: 0,
            isDeleted: false,
            sourceFileIndex: 0,
          },
        ];
      }

      setUploadedFiles([
        {
          id: `unlock-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount || 1,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setActionParams(prev => ({
        ...prev,
        encryptionType: validation.inspection.encryptionType,
        password: '',
      }));

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 7. Repair PDF Path (Structural Diagnosis & Recovery)
    if (selectedTool.key === 'repair') {
      const { validateRepairFile } = await import('../services/repairEngine');
      const validation = await validateRepairFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Repair PDF.');
        return;
      }

      const fileItem = validation.file;
      let pages: PdfPageItem[] = [];

      try {
        const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
        await kantoDoc.load({ ignoreEncryption: true });
        pages = kantoDoc.getPageDeck(0);
      } catch {
        pages = Array.from({ length: fileItem.pageCount || 1 }, (_, i) => ({
          pageNumber: i + 1,
          originalIndex: i,
          rotation: 0,
          isDeleted: false,
          sourceFileIndex: 0,
        }));
      }

      setUploadedFiles([
        {
          id: `repair-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount || 1,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setActionParams(prev => ({
        ...prev,
        repairIssues: validation.diagnosis.issues,
      }));

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 8. Redact PDF Path (True Permanent Redaction)
    if (selectedTool.key === 'redact') {
      const { validateRedactFile } = await import('../services/redactEngine');
      const validation = await validateRedactFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for Redact PDF.');
        return;
      }

      const fileItem = validation.file;
      let pages: PdfPageItem[] = [];

      try {
        const kantoDoc = new KantoDocument(fileItem.arrayBuffer);
        await kantoDoc.load({ ignoreEncryption: true });
        pages = kantoDoc.getPageDeck(0);
      } catch {
        pages = Array.from({ length: fileItem.pageCount || 1 }, (_, i) => ({
          pageNumber: i + 1,
          originalIndex: i,
          rotation: 0,
          isDeleted: false,
          sourceFileIndex: 0,
        }));
      }

      const defaultRedactionBox = {
        id: `redact-box-${Date.now()}`,
        pageNumber: 1,
        xPercent: 12,
        yPercent: 32,
        widthPercent: 76,
        heightPercent: 6,
        color: 'black' as const,
      };

      setUploadedFiles([
        {
          id: `redact-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount || 1,
          arrayBuffer: fileItem.arrayBuffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setActionParams(prev => ({
        ...prev,
        redactionBoxes: [defaultRedactionBox],
        redactionColor: 'black',
      }));

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 8b. Organize PDF Path
    if (selectedTool.key === 'organize' || selectedTool.id === 'organize-pdf') {
      const { validateOrganizeFile } = await import('../services/organizeEngine');
      const validation = await validateOrganizeFile(files[0], isRtl);
      if (!validation.isValid || !validation.arrayBuffer) {
        setErrorMessage(validation.error || 'Invalid file for Organize PDF.');
        return;
      }

      const pageCount = validation.pageCount || 1;
      const pages: OrganizePageItem[] = [];
      const standardPages: PdfPageItem[] = [];

      for (let i = 0; i < pageCount; i++) {
        pages.push({
          id: `org-page-${i}-${Date.now()}`,
          originalIndex: i,
          pageNumber: i + 1,
          rotation: 0,
        });
        standardPages.push({
          pageNumber: i + 1,
          originalIndex: i,
          rotation: 0,
          isDeleted: false,
          sourceFileIndex: 0,
        });
      }

      setUploadedFiles([
        {
          id: `organize-doc-${Date.now()}`,
          file: files[0],
          name: files[0].name,
          size: files[0].size,
          pageCount,
          arrayBuffer: validation.arrayBuffer,
          pages: standardPages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(standardPages);
      setOrganizePages(pages);

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 8c. Page Numbers Path
    if (selectedTool.key === 'pageNumbers' || selectedTool.id === 'page-numbers') {
      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const buffer = await files[0].arrayBuffer();
      const pages = await loadPdfPagesInfo(buffer, 0);

      setUploadedFiles([
        {
          id: `numbered-doc-${Date.now()}`,
          file: files[0],
          name: files[0].name,
          size: files[0].size,
          pageCount: pages.length,
          arrayBuffer: buffer,
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

    // 8d. Crop PDF Path
    if (selectedTool.key === 'crop' || selectedTool.id === 'crop-pdf') {
      const { validateCropFile } = await import('../services/cropEngine');
      const validation = await validateCropFile(files[0], isRtl);
      if (!validation.isValid || !validation.arrayBuffer) {
        setErrorMessage(validation.error || 'Invalid file for Crop PDF.');
        return;
      }

      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const pages = await loadPdfPagesInfo(validation.arrayBuffer, 0);

      setUploadedFiles([
        {
          id: `crop-doc-${Date.now()}`,
          file: files[0],
          name: files[0].name,
          size: files[0].size,
          pageCount: validation.pageCount || pages.length,
          arrayBuffer: validation.arrayBuffer,
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

    // 8e. Protect PDF Path
    if (selectedTool.key === 'protect' || selectedTool.id === 'protect-pdf') {
      const { validateProtectFile } = await import('../services/protectEngine');
      const validation = await validateProtectFile(files[0], isRtl);
      if (!validation.isValid || !validation.arrayBuffer) {
        setErrorMessage(validation.error || 'Invalid file for Protect PDF.');
        return;
      }

      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const pages = await loadPdfPagesInfo(validation.arrayBuffer, 0);

      setUploadedFiles([
        {
          id: `protect-doc-${Date.now()}`,
          file: files[0],
          name: files[0].name,
          size: files[0].size,
          pageCount: validation.pageCount || pages.length,
          arrayBuffer: validation.arrayBuffer,
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

    // 8f. HTML to PDF Path
    if (selectedTool.key === 'htmlToPdf' || selectedTool.id === 'html-to-pdf') {
      const file = files[0];
      const buffer = await file.arrayBuffer();
      let rawText = '';
      try {
        rawText = new TextDecoder('utf-8').decode(buffer);
      } catch {
        rawText = '';
      }

      const pages: PdfPageItem[] = [
        { pageNumber: 1, originalIndex: 0, rotation: 0, isDeleted: false, sourceFileIndex: 0 },
      ];

      setUploadedFiles([
        {
          id: `html-to-pdf-doc-${Date.now()}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: 1,
          arrayBuffer: buffer,
          pages,
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(pages);
      setActionParams(prev => ({
        ...prev,
        htmlMode: 'code',
        htmlContent: rawText,
        htmlPageSize: 'a4',
        htmlOrientation: 'portrait',
        htmlPrintBackground: true,
      }));

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 8g. PDF to HTML Path (Text-Layer Extraction & Absolute Positioning)
    if (selectedTool.key === 'pdfToHtml' || selectedTool.id === 'pdf-to-html') {
      const { validatePdfToHtmlFile } = await import('../services/pdfToHtmlEngine');
      const validation = await validatePdfToHtmlFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF to HTML conversion.');
        return;
      }

      const fileItem = validation.file;
      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const pages = await loadPdfPagesInfo(fileItem.arrayBuffer, 0);

      setUploadedFiles([
        {
          id: `pdf-to-html-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 8h. PDF Forms Path (AcroForm Extraction & Flattening)
    if (selectedTool.key === 'forms' || selectedTool.id === 'pdf-forms') {
      const { validatePdfFormFile } = await import('../services/formsEngine');
      const validation = await validatePdfFormFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF Forms.');
        return;
      }

      const fileItem = validation.file;
      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const pages = await loadPdfPagesInfo(fileItem.arrayBuffer, 0);

      const initialValues: Record<string, string | boolean> = {};
      fileItem.fields.forEach(f => {
        initialValues[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'checkbox' ? false : '');
      });

      setFormFields(fileItem.fields);
      setFormFieldValues(initialValues);
      setUploadedFiles([
        {
          id: `pdf-form-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 8i. Scan to PDF Path (Webcam & Image Scanner Filter)
    if (selectedTool.key === 'scanToPdf' || selectedTool.id === 'scan-to-pdf') {
      const { validateScanFiles } = await import('../services/scanToPdfEngine');
      const validation = await validateScanFiles(files, isRtl);
      if (!validation.isValid || validation.pages.length === 0) {
        setErrorMessage(validation.error || 'Invalid images for Scan to PDF.');
        return;
      }

      setScannedPages(validation.pages);
      setUploadedFiles([
        {
          id: `scan-doc-${Date.now()}`,
          file: files[0],
          name: files[0].name,
          size: files[0].size,
          pageCount: validation.pages.length,
          arrayBuffer: new ArrayBuffer(0),
          pages: validation.pages.map((_, i) => ({
            pageNumber: i + 1,
            originalIndex: i,
            rotation: 0,
            isDeleted: false,
            sourceFileIndex: 0,
          })),
        },
      ]);
      setActiveFileIndex(0);
      setActivePages(
        validation.pages.map((_, i) => ({
          pageNumber: i + 1,
          originalIndex: i,
          rotation: 0,
          isDeleted: false,
          sourceFileIndex: 0,
        }))
      );

      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
      return;
    }

    // 8j. PDF to PDF/A Path (ISO Archival Compliance)
    if (selectedTool.key === 'pdfToPdfa' || selectedTool.id === 'pdf-to-pdfa') {
      const { validatePdfaFile } = await import('../services/pdfaEngine');
      const validation = await validatePdfaFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF/A conversion.');
        return;
      }

      const fileItem = validation.file;
      const { loadPdfPagesInfo } = await import('../services/pdfEngine');
      const pages = await loadPdfPagesInfo(fileItem.arrayBuffer, 0);

      setUploadedFiles([
        {
          id: `pdfa-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 8k. Repair PDF Path (Corrupted Document Recovery)
    if (selectedTool.key === 'repair' || selectedTool.id === 'repair-pdf') {
      const { validateRepairFile } = await import('../services/repairEngine');
      const validation = await validateRepairFile(files[0], isRtl);
      if (!validation.isValid || !validation.file) {
        setErrorMessage(validation.error || 'Invalid file for PDF repair.');
        return;
      }

      const fileItem = validation.file;
      const pages = Array.from({ length: fileItem.pageCount }, (_, i) => ({
        pageNumber: i + 1,
        originalIndex: i,
        rotation: 0,
        isDeleted: false,
        sourceFileIndex: 0,
      }));

      setUploadedFiles([
        {
          id: `repair-doc-${Date.now()}`,
          file: files[0],
          name: fileItem.name,
          size: fileItem.size,
          pageCount: fileItem.pageCount,
          arrayBuffer: fileItem.arrayBuffer,
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

    // 9. Standard single/multi tool loader
    const MAX_BYTES = 150 * 1024 * 1024;
    for (const f of files) {
      if (f.size > MAX_BYTES) {
        setErrorMessage(
          isRtl
            ? `الملف "${f.name}" يتجاوز الحد الأقصى للمعالجة (150 ميغابايت).`
            : `File "${f.name}" exceeds the maximum in-browser memory threshold (150 MB).`
        );
        return;
      }
      if (f.size === 0) {
        setErrorMessage(
          isRtl
            ? `الملف "${f.name}" فارغ (0 بايت).`
            : `File "${f.name}" is empty (0 bytes).`
        );
        return;
      }
    }

    try {
      const { loadPdfPagesInfo } = await import('../services/pdfEngine');

      const newItems: UploadedFileItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = await file.arrayBuffer();

        try {
          const kantoDoc = new KantoDocument(buffer);
          await kantoDoc.load({ ignoreEncryption: true });
          const filePages = kantoDoc.getPageDeck(uploadedFiles.length + i);

          newItems.push({
            id: `file-${Date.now()}-${i}`,
            file,
            name: file.name,
            size: file.size,
            pageCount: filePages.length,
            arrayBuffer: buffer,
            pages: filePages,
          });
        } catch {
          const filePages = await loadPdfPagesInfo(buffer, uploadedFiles.length + i);
          newItems.push({
            id: `file-${Date.now()}-${i}`,
            file,
            name: file.name,
            size: file.size,
            pageCount: filePages.length,
            arrayBuffer: buffer,
            pages: filePages,
          });
        }
      }

      const combined = [...uploadedFiles, ...newItems];
      setUploadedFiles(combined);
      setActiveFileIndex(0);

      const initialPages = combined.flatMap(f => f.pages);
      setActivePages(initialPages);
      setScreenState('workspace');
      setProcessResult(null);
      syncUrl(lang, 'workspace', selectedTool);
    } catch (err: unknown) {
      setErrorMessage(
        isRtl
          ? `حدث خطأ أثناء قراءة المستند: ${String(err)}`
          : `Error loading document: ${String(err)}`
      );
    }
  };

  // Append more files to Merge batch
  const addMoreMergeFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validation = await validateMergeFiles(files, isRtl);
    if (validation.validFiles.length === 0) {
      setErrorMessage(validation.error || 'No valid PDF files found to add.');
      return;
    }

    setMergeFiles(prev => [...prev, ...validation.validFiles]);
  };

  const reorderMergeFiles = (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= mergeFiles.length || toIdx >= mergeFiles.length) return;
    setMergeFiles(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < 2) {
        setErrorMessage(
          isRtl
            ? 'تنبيه: يجب أن يحتوي الدمج على ملفين على الأقل.'
            : 'Notice: Merge requires at least 2 files. Add more files to proceed.'
        );
      }
      return updated;
    });
  };

  const loadSampleDoc = async () => {
    setErrorMessage(null);
    try {
      const { runLoadSampleDoc } = await import('../services/sampleDocService');
      await runLoadSampleDoc({
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
        setActionParams,
        setEditAnnotations,
        setEditActivePageIndex,
        setJpgToPdfImages,
        setOrganizePages,
        setFormFields,
        setFormFieldValues,
        setScannedPages,
      });
    } catch (err: unknown) {
      console.error('Failed to load sample document:', err);
      setErrorMessage(isRtl ? 'فشل تحميل المستند النموذجي' : 'Failed to load sample document.');
    }
  };
  const rotatePage = (pageNumber: number, deg: number = 90) => {
    setActivePages(prev =>
      prev.map(p =>
        p.pageNumber === pageNumber
          ? { ...p, rotation: (p.rotation + deg) % 360 }
          : p
      )
    );
  };

  const deletePage = (pageNumber: number) => {
    setActivePages(prev =>
      prev.map(p =>
        p.pageNumber === pageNumber
          ? { ...p, isDeleted: true }
          : p
      )
    );
  };

  const restorePage = (pageNumber: number) => {
    setActivePages(prev =>
      prev.map(p =>
        p.pageNumber === pageNumber
          ? { ...p, isDeleted: false }
          : p
      )
    );
  };

  const rotateAllPages = (deg: number = 90) => {
    setActivePages(prev =>
      prev.map(p => ({
        ...p,
        rotation: (p.rotation + deg) % 360,
      }))
    );
  };

  const resetAllRotations = () => {
    setActivePages(prev =>
      prev.map(p => ({
        ...p,
        rotation: 0,
      }))
    );
  };

  const resetOrganizePages = () => {
    const activeFile = uploadedFiles[0];
    if (!activeFile) return;
    const initial: OrganizePageItem[] = [];
    for (let i = 0; i < activeFile.pageCount; i++) {
      initial.push({
        id: `org-page-${i}-${Date.now()}`,
        originalIndex: i,
        pageNumber: i + 1,
        rotation: 0,
      });
    }
    setOrganizePages(initial);
  };

  const selectAllPages = () => {
    setActivePages(prev =>
      prev.map(p => ({
        ...p,
        isDeleted: false,
      }))
    );
  };

  const deselectAllPages = () => {
    setActivePages(prev =>
      prev.map(p => ({
        ...p,
        isDeleted: true,
      }))
    );
  };

  const deleteSelectedPages = () => {
    setActivePages(prev => prev.filter(p => !p.isDeleted));
  };

  const reorderPages = (sourceIdx: number, destIdx: number) => {
    setActivePages(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(sourceIdx, 1);
      copy.splice(destIdx, 0, removed);
      return copy;
    });
  };

  const updateActionParams = (newParams: Partial<ToolActionParams>) => {
    setActionParams(prev => ({ ...prev, ...newParams }));
  };

  // Main Action Executor
  const executeAction = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessProgress(10);
    setProgressStatusText(isRtl ? 'جاري التحضير...' : 'Initializing...');

    try {
      // 1. Merge PDF Path (Web Worker Offloaded)
      if (selectedTool.key === 'merge') {
        if (mergeFiles.length < 2) {
          throw new Error(isRtl ? 'يجب اختيار ملفين على الأقل للدمج.' : 'Please select at least 2 files to merge.');
        }

        let result: any;
        if (pdfWorker.available) {
          try {
            const workerResult = await pdfWorker.runTask('MERGE', {
              files: mergeFiles.map(f => ({
                name: f.name,
                arrayBuffer: f.arrayBuffer.slice(0),
              })),
            }, (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            });

            const blob = new Blob([workerResult.bytes], { type: 'application/pdf' });
            result = {
              blob,
              downloadFilename: workerResult.fileName,
              mimeType: 'application/pdf',
              fileSize: workerResult.fileSize,
              pageCount: workerResult.pageCount,
              outputSummary: [
                {
                  filename: workerResult.fileName,
                  pageCount: workerResult.pageCount,
                  rangeText: isRtl
                    ? `تم دمج ${mergeFiles.length} ملفات بإجمالي ${workerResult.pageCount} صفحة بنجاح (عبر محرك الويب وركر)`
                    : `Merged ${mergeFiles.length} documents into ${workerResult.pageCount} pages (Web Worker Engine)`,
                  blob,
                }
              ]
            };
          } catch (workerErr) {
            console.warn('[AppContext] Worker merge fallback to main thread:', workerErr);
            result = await executeMerge(
              mergeFiles,
              (progress, status) => {
                setProcessProgress(progress);
                setProgressStatusText(status);
              },
              isRtl
            );
          }
        } else {
          result = await executeMerge(
            mergeFiles,
            (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            },
            isRtl
          );
        }

        setProcessResult(result);

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 2. Split PDF Path (Web Worker Offloaded)
      if (selectedTool.key === 'split') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للتقسيم.' : 'No document uploaded to split.');
        }

        if (computedSplitRanges.length === 0 || splitValidationError) {
          throw new Error(splitValidationError || (isRtl ? 'يرجى تصحيح نطاقات التقسيم.' : 'Please enter valid split ranges.'));
        }

        let result: any;
        if (pdfWorker.available) {
          try {
            const workerResult = await pdfWorker.runTask('SPLIT', {
              arrayBuffer: activeFile.arrayBuffer.slice(0),
              fileName: activeFile.name,
              ranges: computedSplitRanges,
              mode: splitMode,
            }, (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            });

            const mimeType = workerResult.isZip ? 'application/zip' : 'application/pdf';
            const blob = new Blob([workerResult.bytes], { type: mimeType });

            result = {
              blob,
              downloadFilename: workerResult.fileName,
              mimeType,
              fileSize: blob.size,
              pageCount: workerResult.pageCount,
              isZip: workerResult.isZip,
              outputSummary: [
                {
                  filename: workerResult.fileName,
                  pageCount: workerResult.pageCount,
                  rangeText: workerResult.isZip
                    ? (isRtl ? `حزمة ZIP تحتوي على ${workerResult.pageCount} ملفات مجزأة` : `ZIP package containing ${workerResult.pageCount} split documents`)
                    : (isRtl ? `ملف PDF مجزأ (${workerResult.pageCount} صفحة)` : `Split PDF document (${workerResult.pageCount} page(s))`),
                  blob,
                }
              ]
            };
          } catch (workerErr) {
            console.warn('[AppContext] Worker split fallback to main thread:', workerErr);
            result = await executeSplit(
              activeFile.arrayBuffer,
              computedSplitRanges,
              activeFile.name,
              (progress, status) => {
                setProcessProgress(progress);
                setProgressStatusText(status);
              },
              isRtl
            );
          }
        } else {
          result = await executeSplit(
            activeFile.arrayBuffer,
            computedSplitRanges,
            activeFile.name,
            (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            },
            isRtl
          );
        }

        setProcessResult(result);

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 3. Compress PDF Path (Web Worker Offloaded)
      if (selectedTool.key === 'compress') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للضغط.' : 'No document uploaded to compress.');
        }

        const preset = actionParams.compressPreset || 'recommended';
        let result: any;

        if (pdfWorker.available) {
          try {
            const workerResult = await pdfWorker.runTask('COMPRESS', {
              sourceBuffer: activeFile.arrayBuffer.slice(0),
              preset,
            }, (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            });

            const blob = new Blob([workerResult.bytes], { type: 'application/pdf' });
            const savingsPercent = Math.max(0, Math.round(((workerResult.originalSize - workerResult.compressedSize) / Math.max(1, workerResult.originalSize)) * 100));

            result = {
              blob,
              downloadFilename: workerResult.fileName,
              mimeType: 'application/pdf',
              fileSize: workerResult.compressedSize,
              originalSize: workerResult.originalSize,
              compressedSize: workerResult.compressedSize,
              savingsPercent,
              isOptimizedAlready: workerResult.compressedSize >= workerResult.originalSize,
              pageCount: workerResult.pageCount,
              outputSummary: [
                {
                  filename: workerResult.fileName,
                  pageCount: workerResult.pageCount,
                  rangeText: `Original: ${(workerResult.originalSize / 1024).toFixed(1)} KB → Result: ${(workerResult.compressedSize / 1024).toFixed(1)} KB (${savingsPercent}% saved)`,
                  blob,
                }
              ]
            };
          } catch (workerErr) {
            console.warn('[AppContext] Worker compress fallback to main thread:', workerErr);
            const { executeCompress } = await import('../services/compressEngine');
            result = await executeCompress(
              activeFile.arrayBuffer,
              activeFile.name,
              preset,
              (progress, status) => {
                setProcessProgress(progress);
                setProgressStatusText(status);
              },
              isRtl
            );
          }
        } else {
          const { executeCompress } = await import('../services/compressEngine');
          result = await executeCompress(
            activeFile.arrayBuffer,
            activeFile.name,
            preset,
            (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            },
            isRtl
          );
        }

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.compressedSize,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savingsPercent: result.savingsPercent,
          isOptimizedAlready: result.isOptimizedAlready,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: `Original: ${(result.originalSize / 1024).toFixed(1)} KB → Result: ${(result.compressedSize / 1024).toFixed(1)} KB (${result.savingsPercent}% saved)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4. PDF to Word Path
      if (selectedTool.key === 'pdfToWord' || selectedTool.id === 'pdf-to-word') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للتحويل.' : 'No document uploaded to convert.');
        }

        const { executePdfToWord } = await import('../services/pdfToWordEngine');

        const result = await executePdfToWord(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl ? `تم تحويل ${result.pageCount} صفحة بدقة بصرية فائقة 100%` : `Converted ${result.pageCount} page(s) with 100% visual fidelity`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4b. PDF to PowerPoint Path (Rasterization Algorithm)
      if (selectedTool.key === 'pdfToPpt' || selectedTool.id === 'pdf-to-powerpoint') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للتحويل إلى بوربوينت.' : 'No document uploaded to convert to PowerPoint.');
        }

        const { executePdfToPpt } = await import('../services/pdfToPowerpointEngine');

        const result = await executePdfToPpt(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          slideCount: result.slideCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.slideCount,
              rangeText: `Generated ${result.slideCount} PowerPoint slide(s) in Retina high-DPI resolution`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4c. PDF to Excel Path (Spatial Text Parsing)
      if (selectedTool.key === 'pdfToExcel' || selectedTool.id === 'pdf-to-excel') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للتحويل إلى إكسيل.' : 'No document uploaded to convert to Excel.');
        }

        const { executePdfToExcel } = await import('../services/pdfToExcelEngine');

        const result = await executePdfToExcel(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          sheetCount: result.sheetCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.sheetCount,
              rangeText: isRtl
                ? `تم استخراج ${result.sheetCount} ورقة عمل (${result.totalRows} صفاً من البيانات المجدولة)`
                : `Extracted ${result.sheetCount} sheet(s) (${result.totalRows} structured data rows)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4d. Word to PDF Path (Mammoth HTML Translation & Rendering)
      if (selectedTool.key === 'wordToPdf' || selectedTool.id === 'word-to-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لتحويله إلى PDF.' : 'No Word document uploaded to convert to PDF.');
        }

        const { executeWordToPdf } = await import('../services/wordToPdfEngine');

        const result = await executeWordToPdf(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم إنشاء مستند PDF بدقة عالية (${result.pageCount} صفحة)`
                : `Generated high-fidelity PDF (${result.pageCount} page(s))`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4e. PowerPoint to PDF Path (Server-Side API Route)
      if (selectedTool.key === 'pptToPdf' || selectedTool.id === 'powerpoint-to-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف عرض تقديمي للتحويل.' : 'No PowerPoint presentation uploaded to convert.');
        }

        const { executePptToPdf } = await import('../services/pptToPdfEngine');

        const result = await executePptToPdf(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.slideCount,
          slideCount: result.slideCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.slideCount,
              rangeText: isRtl
                ? `تم تحويل العرض التقديمي إلى مستند PDF (${result.slideCount} شريحة بدقة عريضة)`
                : `Converted presentation to widescreen PDF (${result.slideCount} slide(s))`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4f. Excel to PDF Path (SheetJS HTML Table Rendering)
      if (selectedTool.key === 'excelToPdf' || selectedTool.id === 'excel-to-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف جدول بيانات للتحويل.' : 'No Excel spreadsheet uploaded to convert.');
        }

        const { executeExcelToPdf } = await import('../services/excelToPdfEngine');

        const result = await executeExcelToPdf(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          sheetCount: result.sheetCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم تحويل جداول البيانات إلى مستند PDF (${result.sheetCount} ورقة عمل، ${result.pageCount} صفحة)`
                : `Converted spreadsheet to table PDF (${result.sheetCount} sheet(s), ${result.pageCount} page(s))`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4g. Edit PDF Path (Interactive 2-Layer Workspace)
      if (selectedTool.key === 'edit' || selectedTool.id === 'edit-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للتحرير.' : 'No PDF document uploaded to edit.');
        }

        const { executeEditPdf } = await import('../services/editEngine');

        const result = await executeEditPdf(
          activeFile.arrayBuffer,
          activeFile.name,
          editAnnotations,
          { width: 540, height: 760 },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم حفظ التعديلات وإدراج ${result.annotationCount} عنصر بدقة إحداثيات كاملة`
                : `Saved ${result.annotationCount} annotation(s) with exact coordinate mapping`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4h. PDF to JPG Path (High-Res Canvas & JSZip Bundling)
      if (selectedTool.key === 'pdfToJpg' || selectedTool.id === 'pdf-to-jpg') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للتحويل إلى صور.' : 'No PDF document uploaded to convert to images.');
        }

        const { executePdfToJpg } = await import('../services/pdfToJpgEngine');

        const result = await executePdfToJpg(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            scale: actionParams.jpgScale || 2.5,
            quality: actionParams.jpgQuality || 0.92,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          isZipBundle: result.isZipBundle,
          imageCount: result.imageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: result.isZipBundle
                ? isRtl
                  ? `تم تحويل ${result.imageCount} صفحات إلى صور عالية الدقة وتجميعها في ملف ZIP واحد`
                  : `Converted ${result.imageCount} pages to High-DPI JPEG and bundled into a single ZIP archive`
                : isRtl
                ? `تم تحويل الصفحة إلى صورة JPEG عالية الدقة جاهزة للتنزيل`
                : `Converted single page to High-DPI JPEG image`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4i. JPG to PDF Path (Multi-Image Bundling & Dynamic Sizing)
      if (selectedTool.key === 'jpgToPdf' || selectedTool.id === 'jpg-to-pdf') {
        if (!jpgToPdfImages || jpgToPdfImages.length === 0) {
          throw new Error(isRtl ? 'لم يتم تحميل أي صور للتحويل إلى مستند PDF.' : 'No images uploaded to convert to PDF.');
        }

        const { executeJpgToPdf } = await import('../services/jpgToPdfEngine');

        const result = await executeJpgToPdf(
          jpgToPdfImages,
          {
            pageSizingMode: actionParams.jpgPageSizingMode || 'original',
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          imageCount: result.imageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم تحويل وتجميع ${result.imageCount} صور في مستند PDF واحد بأبعاد ديناميكية 1:1`
                : `Bundled ${result.imageCount} images into a single PDF with dynamic 1:1 page sizing`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4j. Watermark PDF Path (Center-Anchored Batch Stamping)
      if (selectedTool.key === 'watermark' || selectedTool.id === 'watermark-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي مستند PDF للعلامة المائية.' : 'No PDF document uploaded for watermark.');
        }

        const { executeWatermark } = await import('../services/watermarkEngine');

        const result = await executeWatermark(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            text: actionParams.watermarkText || (isRtl ? 'سري للغاية' : 'CONFIDENTIAL'),
            fontSize: actionParams.watermarkFontSize || 48,
            opacity: actionParams.watermarkOpacity !== undefined ? actionParams.watermarkOpacity : 0.35,
            rotation: actionParams.watermarkRotation !== undefined ? actionParams.watermarkRotation : 45,
            color: actionParams.watermarkColor || '#DC2626',
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: isRtl
                ? `تم تطبيق العلامة المائية في المركز على كافة الصفحات (${result.totalPages} صفحة) بنجاح`
                : `Applied center-anchored watermark across all ${result.totalPages} pages with zero WinAnsi crashes`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4k. Rotate PDF Path (Web Worker Offloaded)
      if (selectedTool.key === 'rotate' || selectedTool.id === 'rotate-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لتدويره.' : 'No PDF document uploaded to rotate.');
        }

        let result: any;
        if (pdfWorker.available) {
          try {
            const pageRotations: Record<number, number> = {};
            activePages.forEach(p => {
              if (p.rotation !== 0) {
                pageRotations[p.pageNumber] = p.rotation;
              }
            });

            const workerResult = await pdfWorker.runTask('ROTATE', {
              arrayBuffer: activeFile.arrayBuffer.slice(0),
              pageRotations,
            }, (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            });

            const blob = new Blob([workerResult.bytes], { type: 'application/pdf' });
            result = {
              blob,
              downloadFilename: workerResult.fileName,
              mimeType: 'application/pdf',
              fileSize: blob.size,
              pageCount: workerResult.pageCount,
              outputSummary: [
                {
                  filename: workerResult.fileName,
                  pageCount: workerResult.pageCount,
                  rangeText: isRtl
                    ? `تم تدوير وحفظ ${Object.keys(pageRotations).length} صفحة في الخلفية`
                    : `Permanently rotated ${Object.keys(pageRotations).length} page(s) via Web Worker`,
                  blob,
                }
              ]
            };
          } catch (workerErr) {
            console.warn('[AppContext] Worker rotate fallback to main thread:', workerErr);
            const { executeRotate } = await import('../services/rotateEngine');
            result = await executeRotate(
              activeFile.arrayBuffer,
              activeFile.name,
              activePages,
              (progress, status) => {
                setProcessProgress(progress);
                setProgressStatusText(status);
              },
              isRtl
            );
          }
        } else {
          const { executeRotate } = await import('../services/rotateEngine');
          result = await executeRotate(
            activeFile.arrayBuffer,
            activeFile.name,
            activePages,
            (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            },
            isRtl
          );
        }

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount || result.totalPages,
          outputSummary: result.outputSummary || [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount || result.totalPages,
              rangeText: isRtl
                ? `تم تدوير وحفظ الصفحات بنجاح`
                : `Permanently rotated page(s)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4l. Organize PDF Path (Web Worker Offloaded)
      if (selectedTool.key === 'organize' || selectedTool.id === 'organize-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لتنظيمه.' : 'No PDF document uploaded to organize.');
        }

        if (organizePages.length === 0) {
          throw new Error(
            isRtl
              ? 'يجب الإبقاء على صفحة واحدة على الأقل لتنظيم المستند.'
              : 'Please keep at least one page to organize the document.'
          );
        }

        let result: any;
        if (pdfWorker.available) {
          try {
            const workerResult = await pdfWorker.runTask('ORGANIZE', {
              sourceBuffer: activeFile.arrayBuffer.slice(0),
              pages: organizePages.map(p => ({
                originalIndex: p.originalIndex,
                rotation: p.rotation || 0,
              })),
            }, (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            });

            const blob = new Blob([workerResult.bytes], { type: 'application/pdf' });
            result = {
              blob,
              downloadFilename: workerResult.fileName,
              mimeType: 'application/pdf',
              fileSize: blob.size,
              pageCount: workerResult.pageCount,
              outputSummary: [
                {
                  filename: workerResult.fileName,
                  pageCount: workerResult.pageCount,
                  rangeText: isRtl
                    ? `تم تجميع وبناء ${workerResult.pageCount} صفحة في الخلفية (Web Worker)`
                    : `Constructed document with ${workerResult.pageCount} page(s) via Web Worker`,
                  blob,
                }
              ]
            };
          } catch (workerErr) {
            console.warn('[AppContext] Worker organize fallback to main thread:', workerErr);
            const { executeOrganize } = await import('../services/organizeEngine');
            result = await executeOrganize(
              activeFile.arrayBuffer,
              activeFile.name,
              organizePages,
              (progress, status) => {
                setProcessProgress(progress);
                setProgressStatusText(status);
              },
              isRtl
            );
          }
        } else {
          const { executeOrganize } = await import('../services/organizeEngine');
          result = await executeOrganize(
            activeFile.arrayBuffer,
            activeFile.name,
            organizePages,
            (progress, status) => {
              setProcessProgress(progress);
              setProgressStatusText(status);
            },
            isRtl
          );
        }

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.outputPageCount || result.pageCount,
          outputSummary: result.outputSummary || [
            {
              filename: result.downloadFilename,
              pageCount: result.outputPageCount || result.pageCount,
              rangeText: isRtl
                ? `تم تجميع وبناء ${result.outputPageCount || result.pageCount} صفحة`
                : `Constructed fresh document with ${result.outputPageCount || result.pageCount} page(s)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4m. Page Numbers Path (Dynamic Coordinate Stamping)
      if (selectedTool.key === 'pageNumbers' || selectedTool.id === 'page-numbers') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لترقيم صفحاته.' : 'No PDF document uploaded to number.');
        }

        const { executePageNumbers } = await import('../services/pageNumbersEngine');

        const result = await executePageNumbers(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            position: actionParams.pageNumberPosition || 'bottom-center',
            format: (actionParams.pageNumberFormat as any) || 'page_x_of_y',
            startNumber: actionParams.pageNumberStart || 1,
            fontSize: actionParams.pageNumberFontSize || 11,
            margin: actionParams.pageNumberMargin || 32,
            excludeFirstPage: actionParams.pageNumberExcludeFirstPage || false,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: isRtl
                ? `تم ترقيم ${result.numberedPagesCount} صفحة بإحداثيات ديناميكية دقيقة وفقاً لأبعاد كل صفحة`
                : `Stamped dynamic page numbers across ${result.numberedPagesCount} page(s) matching exact page dimensions`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4n. Crop PDF Path (Metadata CropBox & Y-Axis Coordinate Inversion)
      if (selectedTool.key === 'crop' || selectedTool.id === 'crop-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لقصه.' : 'No PDF document uploaded to crop.');
        }

        const { executeCrop } = await import('../services/cropEngine');

        const result = await executeCrop(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            cropBox: actionParams.cropRegion || { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 },
            applyToAllPages: actionParams.cropApplyToAllPages !== undefined ? actionParams.cropApplyToAllPages : true,
            targetPageIndex: activeFileIndex,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: isRtl
                ? `تم تطبيق القص الهيكلي على ${result.croppedPagesCount} صفحة بنجاح (الأبعاد: ${result.cropBoxApplied.width} × ${result.cropBoxApplied.height} نقطة)`
                : `Applied structural metadata crop to ${result.croppedPagesCount} page(s) (Dimensions: ${result.cropBoxApplied.width} × ${result.cropBoxApplied.height} pt)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 4o. Protect PDF Path (Native Encryption & Permissions Matrix)
      if (selectedTool.key === 'protect' || selectedTool.id === 'protect-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لتشفيره.' : 'No PDF document uploaded to protect.');
        }

        const pwd = actionParams.protectPassword || actionParams.password || '';
        if (!pwd || pwd.trim().length === 0) {
          throw new Error(
            isRtl
              ? 'يرجى إدخال كلمة مرور لتشفير وحماية المستند.'
              : 'Please provide a password to encrypt and protect the document.'
          );
        }

        const confirmPwd = actionParams.protectConfirmPassword;
        if (confirmPwd !== undefined && confirmPwd.length > 0 && confirmPwd !== pwd) {
          throw new Error(
            isRtl
              ? 'كلمتا المرور غير متطابقتين. يرجى التأكد من تطابق كلمة المرور وتأكيدها.'
              : 'Passwords do not match. Please verify your password confirmation.'
          );
        }

        const { executeProtect } = await import('../services/protectEngine');

        const result = await executeProtect(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            userPassword: pwd,
            ownerPassword: pwd,
            allowPrinting: actionParams.protectAllowPrinting || false,
            allowCopying: actionParams.protectAllowCopying || false,
            allowModifying: false,
            allowAnnotating: false,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم قفل وتشفير ${result.pageCount} صفحات بتشفير معياري محمي بكلمة مرور بنجاح`
                : `Encrypted ${result.pageCount} page(s) with standard password protection and restricted permissions`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 5. Sign PDF Path
      if (selectedTool.key === 'sign') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للتوقيع.' : 'No document uploaded to sign.');
        }

        if (!actionParams.signatureDataUrl) {
          throw new Error(
            isRtl
              ? 'يرجى رسم أو كتابة أو رفع توقيع أولاً قبل تطبيق التوقيع.'
              : 'Please draw, type, or upload a signature before signing.'
          );
        }

        const { executeSign } = await import('../services/signEngine');

        const pos = actionParams.signaturePosition || {
          xPercent: 62,
          yPercent: 78,
          widthPercent: 28,
          heightPercent: 12,
        };

        const result = await executeSign(
          activeFile.arrayBuffer,
          activeFile.name,
          actionParams.signatureDataUrl,
          pos,
          actionParams.signaturePlacementMode || 'current',
          [actionParams.signatureTargetPage || 1],
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.signedPagesCount,
              rangeText: `Cryptographically signed ${result.signedPagesCount} page(s) out of ${result.totalPages}`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 6. Unlock PDF Path
      if (selectedTool.key === 'unlock') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف لفك القفل.' : 'No document uploaded to unlock.');
        }

        const { executeUnlock } = await import('../services/unlockEngine');

        const result = await executeUnlock(
          activeFile.arrayBuffer,
          activeFile.name,
          actionParams.password,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          unlockedType: result.unlockedType,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: `Unlocked ${result.pageCount} page(s) • Restrictions & passwords permanently removed`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 7. Repair PDF Path
      if (selectedTool.key === 'repair') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للإصلاح.' : 'No document uploaded to repair.');
        }

        const { executeRepair } = await import('../services/repairEngine');

        const result = await executeRepair(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.recoveredPagesCount,
          isAlreadyHealthy: result.isAlreadyHealthy,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.recoveredPagesCount,
              rangeText: result.isAlreadyHealthy
                ? `Standardized ${result.recoveredPagesCount} page(s) (File was already structurally intact)`
                : `Successfully repaired ${result.recoveredPagesCount} page(s) • Fixed ${result.issuesFixed.length} defect(s)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8. Redact PDF Path
      if (selectedTool.key === 'redact') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف للحجب.' : 'No document uploaded to redact.');
        }

        const { executeRedact } = await import('../services/redactEngine');

        const result = await executeRedact(
          activeFile.arrayBuffer,
          activeFile.name,
          actionParams.redactionBoxes || [],
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: `Permanently redacted ${result.totalRedactionsApplied} sensitive region(s) across ${result.redactedPagesCount} page(s)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.5 HTML to PDF Path (Native Chromium Vector Rendering)
      if (selectedTool.key === 'htmlToPdf' || selectedTool.id === 'html-to-pdf') {
        const { executeHtmlToPdf } = await import('../services/htmlToPdfEngine');

        const isUrlMode = (actionParams.htmlMode || 'url') === 'url';
        let rawHtml = actionParams.htmlContent || '';
        let targetUrl = actionParams.htmlUrl || '';

        // If file was uploaded into workspace, read its text content
        if (uploadedFiles.length > 0 && !targetUrl && !rawHtml) {
          const activeFile = uploadedFiles[0];
          try {
            const dec = new TextDecoder('utf-8');
            rawHtml = dec.decode(activeFile.arrayBuffer);
          } catch {
            // ignore
          }
        }

        const result = await executeHtmlToPdf(
          {
            url: isUrlMode ? targetUrl : undefined,
            htmlContent: !isUrlMode ? rawHtml : (targetUrl ? undefined : rawHtml),
            pageSize: actionParams.htmlPageSize || 'a4',
            orientation: actionParams.htmlOrientation || 'portrait',
            printBackground: actionParams.htmlPrintBackground !== undefined ? actionParams.htmlPrintBackground : true,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: `Converted ${isUrlMode ? 'URL' : 'HTML'} into native Vector PDF (${(result.fileSize / 1024).toFixed(1)} KB) • 100% Selectable Text`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.6 PDF to HTML Path (Text-Layer Extraction & Absolute Positioning)
      if (selectedTool.key === 'pdfToHtml' || selectedTool.id === 'pdf-to-html') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للتحويل.' : 'No PDF document uploaded to convert.');
        }

        const { executePdfToHtml } = await import('../services/pdfToHtmlEngine');

        const result = await executePdfToHtml(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            scale: 1.5,
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم تحويل ${result.pageCount} صفحة (${result.totalTextElements} عنصر نصي) إلى HTML بدقة بصرية 100% وطبقة نصية قابلة للتحديد`
                : `Converted ${result.pageCount} page(s) (${result.totalTextElements} selectable text elements) to 100% pixel-perfect HTML`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.7 PDF Forms Path (AcroForm Filling & Flattening)
      if (selectedTool.key === 'forms' || selectedTool.id === 'pdf-forms') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للنموذج.' : 'No PDF document uploaded for form processing.');
        }

        const { executeFillAndFlattenForm } = await import('../services/formsEngine');

        const result = await executeFillAndFlattenForm(
          activeFile.arrayBuffer,
          activeFile.name,
          formFieldValues,
          formFlattenEnabled,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: isRtl
                ? `تمت تعبئة ${result.fieldsFilledCount} حقول وتجميد المستند (${(result.fileSize / 1024).toFixed(1)} ك.ب)`
                : `Populated ${result.fieldsFilledCount} form field(s) & flattened document (${(result.fileSize / 1024).toFixed(1)} KB)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.8 Scan to PDF Path (Webcam & Image Scanner Filter)
      if (selectedTool.key === 'scanToPdf' || selectedTool.id === 'scan-to-pdf') {
        if (!scannedPages || scannedPages.length === 0) {
          throw new Error(isRtl ? 'لا توجد صفحات ممسوحة ضوئياً للتجميع.' : 'No scanned pages available to compile into PDF.');
        }

        const { executeScanToPdf } = await import('../services/scanToPdfEngine');

        const result = await executeScanToPdf(
          scannedPages,
          scanPageSize,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.totalPages,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.totalPages,
              rangeText: isRtl
                ? `تم تحسين وحزم ${result.totalPages} صفحة في مستند PDF (${(result.fileSize / 1024).toFixed(1)} ك.ب)`
                : `Filtered & compiled ${result.totalPages} scanned page(s) into PDF (${(result.fileSize / 1024).toFixed(1)} KB)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.9 PDF to PDF/A Path (ISO Archival Compliance)
      if (selectedTool.key === 'pdfToPdfa' || selectedTool.id === 'pdf-to-pdfa') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للتحويل إلى PDF/A.' : 'No PDF document uploaded for PDF/A archival conversion.');
        }

        const { executePdfToPdfa } = await import('../services/pdfaEngine');

        const result = await executePdfToPdfa(
          activeFile.arrayBuffer,
          activeFile.name,
          {
            pdfaLevel: actionParams.pdfaLevel || '1b',
            title: activeFile.name.replace(/\.pdf$/i, ''),
          },
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.pageCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.pageCount,
              rangeText: isRtl
                ? `تم تحويل ${result.pageCount} صفحة إلى معيار ISO 19005 (${result.pdfaLevel.toUpperCase()}) بنجاح (${(result.fileSize / 1024).toFixed(1)} ك.ب)`
                : `Converted ${result.pageCount} page(s) to ISO 19005 (${result.pdfaLevel.toUpperCase()}) Archival Standard (${(result.fileSize / 1024).toFixed(1)} KB)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 8.10 Repair PDF Path (Byte-Level Reconstruction & Recovery)
      if (selectedTool.key === 'repair' || selectedTool.id === 'repair-pdf') {
        const activeFile = uploadedFiles[0];
        if (!activeFile) {
          throw new Error(isRtl ? 'لم يتم تحميل أي ملف PDF للإصلاح.' : 'No PDF file uploaded for structural repair.');
        }

        const { executeRepair } = await import('../services/repairEngine');

        const result = await executeRepair(
          activeFile.arrayBuffer,
          activeFile.name,
          (progress, status) => {
            setProcessProgress(progress);
            setProgressStatusText(status);
          },
          isRtl
        );

        setProcessResult({
          blob: result.blob,
          downloadFilename: result.downloadFilename,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          pageCount: result.recoveredPagesCount,
          outputSummary: [
            {
              filename: result.downloadFilename,
              pageCount: result.recoveredPagesCount,
              rangeText: isRtl
                ? `تم استرداد وإعادة بناء ${result.recoveredPagesCount} صفحة بنجاح (${(result.fileSize / 1024).toFixed(1)} ك.ب)`
                : `Recovered and reconstructed ${result.recoveredPagesCount} page(s) successfully (${(result.fileSize / 1024).toFixed(1)} KB)`,
              blob: result.blob,
            }
          ]
        });

        try {
          triggerConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
          });
        } catch {
          // safe fallback
        }
        return;
      }

      // 9. Standard single/multi tool path
      if (uploadedFiles.length === 0) return;
      const activeFile = uploadedFiles[activeFileIndex] || uploadedFiles[0];

      const { executeToolAction } = await import('../services/pdfEngine');
      setProcessProgress(70);
      setProgressStatusText(isRtl ? 'جاري المعالجة...' : 'Processing document...');

      const allBuffers = uploadedFiles.map(f => f.arrayBuffer);
      const result = await executeToolAction(
        selectedTool.key,
        activeFile.arrayBuffer,
        activePages,
        actionParams as Record<string, unknown>,
        isRtl,
        allBuffers
      );

      setProcessProgress(100);
      setProgressStatusText(isRtl ? 'اكتملت العملية!' : 'Completed!');
      setProcessResult(result);

      try {
        triggerConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0D0D0D', '#C7C9CC', '#F5F0E6']
        });
      } catch {
        // safe fallback
      }
    } catch (err: unknown) {
      console.error('Execution error:', err);
      setErrorMessage(
        isRtl
          ? `تعذرت معالجة الملف: ${String(err)}`
          : `Processing failed: ${String(err)}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWorkspace = () => {
    clearAllCachedDocuments();
    setUploadedFiles([]);
    setMergeFiles([]);
    setActivePages([]);
    setProcessResult(null);
    setIsProcessing(false);
    setProcessProgress(0);
    setProgressStatusText('');
    setErrorMessage(null);
    setScreenState('catalog');
    syncUrl(lang, 'catalog', null);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        isRtl,
        t,
        setLang,
        toggleLang,
        isDarkMode,
        toggleTheme,
        screen,
        setScreen,
        selectedTool,
        setSelectedTool,
        selectToolById,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        uploadedFiles,
        activeFileIndex,
        setActiveFileIndex,
        addFiles,
        loadSampleDoc,
        errorMessage,
        setErrorMessage,
        mergeFiles,
        reorderMergeFiles,
        removeMergeFile,
        addMoreMergeFiles,
        splitMode,
        setSplitMode,
        splitRangeInput,
        setSplitRangeInput,
        splitIntervalValue,
        setSplitIntervalValue,
        computedSplitRanges,
        splitValidationError,
        setUploadedFiles,
        editAnnotations,
        setEditAnnotations,
        editActiveTool,
        setEditActiveTool,
        editActiveColor,
        setEditActiveColor,
        editActiveFontSize,
        setEditActiveFontSize,
        editActivePageIndex,
        setEditActivePageIndex,
        jpgToPdfImages,
        setJpgToPdfImages,
        addMoreJpgToPdfFiles,
        organizePages,
        setOrganizePages,
        resetOrganizePages,
        formFields,
        setFormFields,
        formFieldValues,
        updateFormFieldValue,
        resetFormFieldValues,
        formFlattenEnabled,
        setFormFlattenEnabled,
        scannedPages,
        setScannedPages,
        scanFilterMode,
        setScanFilterMode,
        scanThreshold,
        setScanThreshold,
        scanPageSize,
        setScanPageSize,
        activePages,
        rotatePage,
        deletePage,
        restorePage,
        rotateAllPages,
        resetAllRotations,
        selectAllPages,
        deselectAllPages,
        deleteSelectedPages,
        reorderPages,
        actionParams,
        updateActionParams,
        isProcessing,
        processProgress,
        progressStatusText,
        processResult,
        executeAction,
        resetWorkspace,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProModalOpen,
        setIsProModalOpen,
        userEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
