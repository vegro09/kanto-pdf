import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PageThumbnail } from '../ui/PageThumbnail';
import { VirtualizedPageGrid } from '../ui/VirtualizedPageGrid';
import { PageDetailModal } from '../ui/PageDetailModal';
import { MergeFileCard } from '../ui/MergeFileCard';
import { SplitRangeConfig } from '../ui/SplitRangeConfig';
import { CompressPresetConfig } from '../ui/CompressPresetConfig';
import { WordConversionConfig } from '../ui/WordConversionConfig';
import { PptConversionConfig } from '../ui/PptConversionConfig';
import { ExcelConversionConfig } from '../ui/ExcelConversionConfig';
import { WordToPdfConfig } from '../ui/WordToPdfConfig';
import { PptToPdfConfig } from '../ui/PptToPdfConfig';
import { ExcelToPdfConfig } from '../ui/ExcelToPdfConfig';
import { EditPdfWorkspace } from '../ui/EditPdfWorkspace';
import { EditPdfConfig } from '../ui/EditPdfConfig';
import { PdfToJpgConfig } from '../ui/PdfToJpgConfig';
import { JpgToPdfWorkspace } from '../ui/JpgToPdfWorkspace';
import { JpgToPdfConfig } from '../ui/JpgToPdfConfig';
import { SignPdfWorkspace } from '../ui/SignPdfWorkspace';
import { SignConfig } from '../ui/SignConfig';
import { WatermarkWorkspace } from '../ui/WatermarkWorkspace';
import { WatermarkConfig } from '../ui/WatermarkConfig';
import { RotateConfig } from '../ui/RotateConfig';
import { OrganizePdfWorkspace } from '../ui/OrganizePdfWorkspace';
import { OrganizeConfig } from '../ui/OrganizeConfig';
import { PageNumbersWorkspace } from '../ui/PageNumbersWorkspace';
import { PageNumbersConfig } from '../ui/PageNumbersConfig';
import { CropPdfWorkspace } from '../ui/CropPdfWorkspace';
import { CropConfig } from '../ui/CropConfig';
import { ProtectPdfWorkspace } from '../ui/ProtectPdfWorkspace';
import { ProtectConfig } from '../ui/ProtectConfig';
import { UnlockPdfWorkspace } from '../ui/UnlockPdfWorkspace';
import { UnlockConfig } from '../ui/UnlockConfig';
import { HtmlToPdfWorkspace } from '../ui/HtmlToPdfWorkspace';
import { HtmlToPdfConfig } from '../ui/HtmlToPdfConfig';
import { PdfToHtmlWorkspace } from '../ui/PdfToHtmlWorkspace';
import { PdfToHtmlConfig } from '../ui/PdfToHtmlConfig';
import { PdfFormsWorkspace } from '../ui/PdfFormsWorkspace';
import { PdfFormsConfig } from '../ui/PdfFormsConfig';
import { ScanToPdfWorkspace } from '../ui/ScanToPdfWorkspace';
import { ScanToPdfConfig } from '../ui/ScanToPdfConfig';
import { PdfaWorkspace } from '../ui/PdfaWorkspace';
import { PdfaConfig } from '../ui/PdfaConfig';
import { RepairConfig } from '../ui/RepairConfig';
import { RedactConfig } from '../ui/RedactConfig';
import { QrCodeModal } from '../ui/QrCodeModal';
import { RelatedTools } from '../ui/RelatedTools';
import {
  ArrowLeft,
  RotateCw,
  Trash2,
  Plus,
  Download,
  Smartphone,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Layers,
  Scissors,
  Minimize2,
  Stamp,
  Binary,
  Crop,
  FileCheck2,
  Wrench,
  Zap,
  AlertTriangle,
  Info,
  FileDown,
  FileType2,
  Presentation,
  FileSpreadsheet,
  PenTool,
  Image as ImageIcon,
  Feather,
  Unlock,
  Lock as LockIcon,
  Grid,
  Globe,
  Code2,
  CheckSquare,
  Scan,
  Archive,
} from 'lucide-react';

export const WorkspaceScreen: React.FC = () => {
  const {
    t,
    lang,
    selectedTool,
    setScreen,
    uploadedFiles,
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
    activePages,
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
    addFiles,
    errorMessage,
    setErrorMessage,
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
    setIsProModalOpen,
    rotatePage,
  } = useApp();

  const isAr = lang === 'ar';

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [cropActivePageIndex, setCropActivePageIndex] = useState<number>(0);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewPageNumber, setPreviewPageNumber] = useState<number>(1);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);

  const isMergeTool = selectedTool.key === 'merge';
  const isSplitTool = selectedTool.key === 'split';
  const isCompressTool = selectedTool.key === 'compress';
  const isWordTool = selectedTool.key === 'pdfToWord' || selectedTool.id === 'pdf-to-word';
  const isPptTool = selectedTool.key === 'pdfToPpt' || selectedTool.id === 'pdf-to-powerpoint';
  const isExcelTool = selectedTool.key === 'pdfToExcel' || selectedTool.id === 'pdf-to-excel';
  const isWordToPdfTool = selectedTool.key === 'wordToPdf' || selectedTool.id === 'word-to-pdf';
  const isPptToPdfTool = selectedTool.key === 'pptToPdf' || selectedTool.id === 'powerpoint-to-pdf';
  const isExcelToPdfTool = selectedTool.key === 'excelToPdf' || selectedTool.id === 'excel-to-pdf';
  const isPdfToJpgTool = selectedTool.key === 'pdfToJpg' || selectedTool.id === 'pdf-to-jpg';
  const isJpgToPdfTool = selectedTool.key === 'jpgToPdf' || selectedTool.id === 'jpg-to-pdf';
  const isScanToPdfTool = selectedTool.key === 'scanToPdf' || selectedTool.id === 'scan-to-pdf';
  const isEditTool = selectedTool.key === 'edit' || selectedTool.id === 'edit-pdf';
  const isSignTool = selectedTool.key === 'sign';
  const isWatermarkTool = selectedTool.key === 'watermark' || selectedTool.id === 'watermark-pdf';
  const isRotateTool = selectedTool.key === 'rotate' || selectedTool.id === 'rotate-pdf';
  const isOrganizeTool = selectedTool.key === 'organize' || selectedTool.id === 'organize-pdf';
  const isPageNumbersTool = selectedTool.key === 'pageNumbers' || selectedTool.id === 'page-numbers';
  const isCropTool = selectedTool.key === 'crop' || selectedTool.id === 'crop-pdf';
  const isProtectTool = selectedTool.key === 'protect' || selectedTool.id === 'protect-pdf';
  const isUnlockTool = selectedTool.key === 'unlock';
  const isHtmlToPdfTool = selectedTool.key === 'htmlToPdf' || selectedTool.id === 'html-to-pdf';
  const isPdfToHtmlTool = selectedTool.key === 'pdfToHtml' || selectedTool.id === 'pdf-to-html';
  const isFormsTool = selectedTool.key === 'forms' || selectedTool.id === 'pdf-forms';
  const isPdfaTool = selectedTool.key === 'pdfToPdfa' || selectedTool.id === 'pdf-to-pdfa';
  const isRepairTool = selectedTool.key === 'repair';
  const isRedactTool = selectedTool.key === 'redact';

  const activeFile = uploadedFiles[0];
  const validPagesCount = activePages.filter(p => !p.isDeleted).length;
  const activeDocPagesCount = activeFile?.pageCount || validPagesCount || 0;

  // Merge specific summary calculations
  const totalMergePages = mergeFiles.reduce((acc, f) => acc + f.pageCount, 0);
  const totalMergeBytes = mergeFiles.reduce((acc, f) => acc + f.size, 0);

  // Drag handlers for Page deck
  const handlePageDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
  };

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      reorderPages(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  // Drag handlers for Merge file deck
  const handleMergeDragStart = (_e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
  };

  const handleMergeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMergeDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      reorderMergeFiles(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (isMergeTool) {
        addMoreMergeFiles(Array.from(e.target.files));
      } else {
        addFiles(Array.from(e.target.files));
      }
      e.target.value = '';
    }
  };

  const handleDownload = () => {
    if (!processResult) return;
    const url = URL.createObjectURL(processResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = processResult.downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleDownloadSinglePart = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white dark:bg-[#0D0D0D] transition-colors duration-250 ease-apple">
      {/* Error / Diagnostic Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-[#F5F0E6] dark:bg-[#1A1A1A] border border-[#0D0D0D] dark:border-white text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-250">
          <div className="flex items-center gap-2 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline font-bold hover:opacity-75"
          >
            {isAr ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Top Bar Navigation & Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C7C9CC]/40 dark:border-[#262626]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setErrorMessage(null);
              setScreen('catalog');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-[#F5F0E6] dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] text-xs font-semibold hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors duration-250 ease-apple"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            <span>{t.change_file}</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isMergeTool
                ? (isAr ? 'دمج مستندات PDF' : 'Merge PDF Workspace')
                : isSplitTool
                ? (isAr ? `تقسيم: ${activeFile?.name || 'مستند PDF'}` : `Split: ${activeFile?.name || 'PDF Document'}`)
                : (activeFile?.name || 'Document Workspace')}
            </h1>
            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
              {isMergeTool ? (
                <>
                  <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">{mergeFiles.length}</span> {isAr ? 'ملفات جاهزة للدمج' : 'PDF files in queue'} •{' '}
                  <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">{totalMergePages}</span> {isAr ? 'إجمالي الصفحات' : 'total pages'} •{' '}
                  {(totalMergeBytes / 1024).toFixed(1)} KB • In-Memory Sandbox
                </>
              ) : isSplitTool ? (
                <>
                  <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">{activeFile?.pageCount || validPagesCount}</span> {t.pages_count} •{' '}
                  <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">{computedSplitRanges.length}</span> {isAr ? 'ملفات ناتجة مخططة' : 'planned output parts'} •{' '}
                  {(activeFile?.size ? (activeFile.size / 1024).toFixed(1) : 0)} KB • Local RAM
                </>
              ) : (
                <>
                  {validPagesCount} {t.pages_count} • {(activeFile?.size ? (activeFile.size / 1024).toFixed(1) : 0)} KB • Local RAM
                </>
              )}
            </p>
          </div>
        </div>

        {/* Global Page Tools or Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isMergeTool && (
            <>
              <button
                onClick={() => rotateAllPages(90)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] text-xs font-semibold hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] transition-colors duration-250 ease-apple"
              >
                <RotateCw size={13} />
                <span>{t.rotate_all_right}</span>
              </button>

              <button
                onClick={selectAllPages}
                className="px-3 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] text-xs font-semibold hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] transition-colors duration-250 ease-apple"
              >
                {t.select_all_pages}
              </button>

              <button
                onClick={deselectAllPages}
                className="px-3 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] text-xs font-semibold hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] transition-colors duration-250 ease-apple"
              >
                {t.deselect_all}
              </button>
            </>
          )}

          {isMergeTool && (
            <>
              <input
                ref={mergeFileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleAddMoreFiles}
                className="hidden"
              />
              <button
                onClick={() => mergeFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#0D0D0D] dark:border-white bg-[#0D0D0D] dark:bg-white text-white dark:text-[#0D0D0D] text-xs font-bold hover:opacity-90 transition-opacity duration-250 ease-apple shadow-sm"
              >
                <Plus size={13} />
                <span>{isAr ? 'إضافة ملفات أخرى' : 'Add More PDFs'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual File / Page Deck */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isMergeTool
                ? (isAr ? 'اسحب الملفات لإعادة ترتيب تسلسل الدمج' : 'Drag or use arrows to set merge sequence')
                : isSplitTool
                ? (isAr ? 'معاينة صفحات المستند مع تحديد النطاقات الملونة' : 'Document Page Deck — Visual group indicators per output file')
                : t.drag_to_reorder}
            </span>
            {!isMergeTool && !isSplitTool && activePages.some(p => p.isDeleted) && (
              <button
                onClick={deleteSelectedPages}
                className="text-xs text-[#0D0D0D] dark:text-[#F5F0E6] font-bold hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>{t.delete_selected}</span>
              </button>
            )}
          </div>

          <div className="p-6 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-[#F5F0E6]/50 dark:bg-[#141414] min-h-[440px]">
            {isJpgToPdfTool ? (
              /* JPG TO PDF: Interactive Multi-Image Gallery Deck */
              <JpgToPdfWorkspace
                images={jpgToPdfImages}
                onImagesChange={setJpgToPdfImages}
                onAddMoreFiles={addMoreJpgToPdfFiles}
              />
            ) : isEditTool ? (
              /* EDIT PDF: Interactive 2-Layer Canvas & Annotation Workspace */
              <EditPdfWorkspace
                activePageIndex={editActivePageIndex}
                annotations={editAnnotations}
                onAnnotationsChange={setEditAnnotations}
                activeTool={editActiveTool}
                onActiveToolChange={setEditActiveTool}
                activeColor={editActiveColor}
                activeFontSize={editActiveFontSize}
              />
            ) : isSignTool ? (
              /* SIGN PDF: Interactive PDF Page Canvas & Drag-to-Place Transparent Signature Badge */
              <SignPdfWorkspace
                activePageIndex={(actionParams.signatureTargetPage || 1) - 1}
                signatureDataUrl={actionParams.signatureDataUrl}
                position={
                  actionParams.signaturePosition || {
                    xPercent: 62,
                    yPercent: 78,
                    widthPercent: 28,
                    heightPercent: 12,
                  }
                }
                onPositionChange={pos => updateActionParams({ signaturePosition: pos })}
                onSelectPage={pageIdx => updateActionParams({ signatureTargetPage: pageIdx + 1 })}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isWatermarkTool ? (
              /* WATERMARK PDF: Live Center-Anchored Preview with Instant WYSIWYG Rendering */
              <WatermarkWorkspace
                watermarkText={actionParams.watermarkText || (isAr ? 'سري للغاية' : 'CONFIDENTIAL')}
                fontSize={actionParams.watermarkFontSize || 48}
                opacity={actionParams.watermarkOpacity !== undefined ? actionParams.watermarkOpacity : 0.35}
                rotation={actionParams.watermarkRotation !== undefined ? actionParams.watermarkRotation : 45}
                color={actionParams.watermarkColor || '#DC2626'}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isOrganizeTool ? (
              /* ORGANIZE PDF: Visual Drag-and-Drop Page Array Mutation Deck */
              <OrganizePdfWorkspace
                pages={organizePages}
                sourceBuffer={activeFile?.arrayBuffer}
                onPagesChange={setOrganizePages}
                onResetOriginal={resetOrganizePages}
              />
            ) : isPageNumbersTool ? (
              /* PAGE NUMBERS: Live WYSIWYG Stamping Preview */
              <PageNumbersWorkspace
                position={actionParams.pageNumberPosition || 'bottom-center'}
                format={(actionParams.pageNumberFormat as any) || 'page_x_of_y'}
                fontSize={actionParams.pageNumberFontSize || 11}
                margin={actionParams.pageNumberMargin || 32}
                excludeFirstPage={actionParams.pageNumberExcludeFirstPage || false}
                startNumber={actionParams.pageNumberStart || 1}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isCropTool ? (
              /* CROP PDF: Visual Metadata CropBox & Inverted Coordinate Overlay */
              <CropPdfWorkspace
                cropBox={actionParams.cropRegion || { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 }}
                onCropBoxChange={box => updateActionParams({ cropRegion: box })}
                activePageIndex={cropActivePageIndex}
                onActivePageIndexChange={setCropActivePageIndex}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isProtectTool ? (
              /* PROTECT PDF: Security Cryptographic Vault & Permissions Preview */
              <ProtectPdfWorkspace
                hasPasswordEntered={Boolean((actionParams.protectPassword || actionParams.password || '').trim().length > 0)}
                allowPrinting={Boolean(actionParams.protectAllowPrinting)}
                allowCopying={Boolean(actionParams.protectAllowCopying)}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isUnlockTool ? (
              /* UNLOCK PDF: Security Status & Decryption Terminal */
              <UnlockPdfWorkspace
                hasPasswordEntered={Boolean((actionParams.password || '').trim().length > 0)}
                filename={activeFile?.name || ''}
                totalPages={activeDocPagesCount || 1}
              />
            ) : isHtmlToPdfTool ? (
              /* HTML TO PDF: Native Vector Rendering & Headless Browser Viewport */
              <HtmlToPdfWorkspace
                mode={actionParams.htmlMode || 'url'}
                url={actionParams.htmlUrl || ''}
                htmlContent={actionParams.htmlContent || ''}
                pageSize={actionParams.htmlPageSize || 'a4'}
                orientation={actionParams.htmlOrientation || 'portrait'}
              />
            ) : isPdfToHtmlTool ? (
              /* PDF TO HTML: Text-Layer Extraction & Absolute Positioning Preview */
              <PdfToHtmlWorkspace
                pages={activePages.filter(p => !p.isDeleted)}
                filename={activeFile?.name || ''}
              />
            ) : isFormsTool ? (
              /* PDF FORMS: Interactive AcroForm & Fillable Document Workspace */
              <PdfFormsWorkspace
                pages={activePages.filter(p => !p.isDeleted)}
                filename={activeFile?.name || ''}
                fields={formFields}
              />
            ) : isScanToPdfTool ? (
              /* SCAN TO PDF: Webcam Shutter & Pixel Filter Workspace */
              <ScanToPdfWorkspace
                scannedPages={scannedPages}
                onPagesChange={setScannedPages}
                filterMode={scanFilterMode}
                threshold={scanThreshold}
              />
            ) : isPdfaTool ? (
              /* PDF TO PDF/A: ISO 19005 Archival Preservation Deck */
              <PdfaWorkspace
                pages={activePages.filter(p => !p.isDeleted)}
                filename={activeFile?.name || ''}
                pdfaLevel={actionParams.pdfaLevel || '1b'}
              />
            ) : isMergeTool ? (
              /* MERGE PDF: Real File Deck with real Canvas Previews & Controls */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mergeFiles.map((fileItem, idx) => (
                  <MergeFileCard
                    key={fileItem.id}
                    fileItem={fileItem}
                    index={idx}
                    totalCount={mergeFiles.length}
                    onRemove={removeMergeFile}
                    onMoveLeft={(i) => reorderMergeFiles(i, i - 1)}
                    onMoveRight={(i) => reorderMergeFiles(i, i + 1)}
                    onDragStart={handleMergeDragStart}
                    onDragOver={handleMergeDragOver}
                    onDrop={handleMergeDrop}
                  />
                ))}

                {/* Inline Add More Button in Grid */}
                <button
                  type="button"
                  onClick={() => mergeFileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D] dark:hover:border-white bg-white/40 dark:bg-[#1A1A1A]/40 min-h-[220px] transition-colors group text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F5F0E6] dark:bg-[#262626] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-white mb-2 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                    {isAr ? 'إضافة ملف PDF' : 'Add Another PDF'}
                  </span>
                  <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] mt-0.5">
                    {isAr ? 'ضم إلى تسلسل الدمج' : 'Append to merge queue'}
                  </span>
                </button>
              </div>
            ) : (
              /* STANDARD TOOLS & SPLIT PDF: Virtualized Page Deck (Enterprise Scale) */
              <VirtualizedPageGrid
                items={activePages}
                estimateRowHeight={270}
                renderItem={(page, idx) => {
                  let splitGroup: { index: number; label: string; startPage: number; endPage: number } | undefined = undefined;
                  if (isSplitTool && computedSplitRanges.length > 0) {
                    const groupIdx = computedSplitRanges.findIndex(
                      r => page.pageNumber >= r.startPage && page.pageNumber <= r.endPage
                    );
                    if (groupIdx !== -1) {
                      const grp = computedSplitRanges[groupIdx];
                      splitGroup = {
                        index: groupIdx,
                        label: grp.label,
                        startPage: grp.startPage,
                        endPage: grp.endPage,
                      };
                    }
                  }

                  return (
                    <PageThumbnail
                      key={`${page.sourceFileIndex}-${page.originalIndex}-${idx}`}
                      page={page}
                      index={idx}
                      splitGroup={splitGroup}
                      onDragStart={handlePageDragStart}
                      onDragOver={handlePageDragOver}
                      onDrop={handlePageDrop}
                      onPreview={pageNum => {
                        setPreviewPageNumber(pageNum);
                        setPreviewModalOpen(true);
                      }}
                    />
                  );
                }}
              />
            )}
          </div>
        </section>

        {/* Right Column: Contextual Action Sidebar */}
        <section className="lg:col-span-4 space-y-6">
          {/* Pro Upsell Card */}
          <div className="p-4 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[#0D0D0D] dark:text-[#C7C9CC] shrink-0" />
              <div className="text-[11px]">
                <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">Kanto Pro: </span>
                <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
                  {isAr ? 'معالجة دفعات غير محدودة' : 'Unlimited batch queue'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsProModalOpen(true)}
              className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#0D0D0D] dark:bg-white text-white dark:text-[#0D0D0D] hover:opacity-90 shrink-0"
            >
              {isAr ? 'ترقية' : 'Upgrade'}
            </button>
          </div>

          <div className="p-6 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[#C7C9CC]/40 dark:border-[#262626]">
              <div className="w-10 h-10 rounded-xl bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] border border-[#C7C9CC]/60 flex items-center justify-center font-bold shadow-sm">
                {selectedTool.key === 'split' ? <Scissors size={16} /> :
                 selectedTool.key === 'merge' ? <Layers size={16} /> :
                 selectedTool.key === 'compress' ? <Minimize2 size={16} /> :
                 selectedTool.key === 'watermark' ? <Stamp size={16} /> :
                 selectedTool.key === 'crop' ? <Crop size={16} /> :
                 selectedTool.key === 'repair' ? <Wrench size={16} /> :
                 selectedTool.key === 'forms' ? <FileCheck2 size={16} /> :
                 selectedTool.key === 'pageNumbers' ? <Binary size={16} /> :
                 <Sparkles size={16} />}
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  {isMergeTool ? (isAr ? 'إعدادات دمج PDF' : 'Merge Configuration') :
                   isSplitTool ? (isAr ? 'إعدادات تقسيم PDF' : 'Split Configuration') :
                   t.tool_settings}
                </h2>
                <span className="text-[11px] font-mono text-[#5A5D61] dark:text-[#A0A2A6]">
                  Tool: {selectedTool.id}
                </span>
              </div>
            </div>

            {/* MERGE PDF Specific Action Panel */}
            {isMergeTool && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-[#F5F0E6] dark:bg-[#1F1F1F] rounded-lg border border-[#C7C9CC] dark:border-[#333333] space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                    <span>{isAr ? 'عدد الملفات في الدفعة:' : 'Files in Batch:'}</span>
                    <span className="font-mono">{mergeFiles.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5A5D61] dark:text-[#A0A2A6]">
                    <span>{isAr ? 'إجمالي الصفحات المدمجة:' : 'Total Resulting Pages:'}</span>
                    <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{totalMergePages}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#5A5D61] dark:text-[#A0A2A6]">
                    <span>{isAr ? 'الحجم الإجمالي التقريبي:' : 'Estimated Total Size:'}</span>
                    <span className="font-mono">{(totalMergeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                {mergeFiles.length < 2 && (
                  <div className="p-3 bg-[#F5F0E6] dark:bg-[#252018] rounded-lg border border-[#0D0D0D] text-xs font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-2">
                    <Info size={15} className="shrink-0" />
                    <span>{isAr ? 'أضف ملفاً واحداً إضافياً على الأقل لإتمام الدمج.' : 'Add at least one more PDF to merge.'}</span>
                  </div>
                )}
              </div>
            )}

            {/* SPLIT PDF Specific Action Panel */}
            {isSplitTool && (
              <SplitRangeConfig
                splitMode={splitMode}
                setSplitMode={setSplitMode}
                rangeInput={splitRangeInput}
                setRangeInput={setSplitRangeInput}
                intervalValue={splitIntervalValue}
                setIntervalValue={setSplitIntervalValue}
                totalDocPages={activeDocPagesCount}
                activeRanges={computedSplitRanges}
                validationError={splitValidationError}
                isArabic={isAr}
              />
            )}

            {/* COMPRESS PDF Specific Action Panel */}
            {isCompressTool && (
              <CompressPresetConfig
                currentPreset={actionParams.compressPreset || 'recommended'}
                onSelectPreset={(p) => updateActionParams({ compressPreset: p })}
                originalSizeBytes={activeFile?.size || 0}
              />
            )}

            {/* PDF TO WORD Specific Action Panel */}
            {isWordTool && (
              <WordConversionConfig
                filename={activeFile?.name || ''}
                pageCount={activeDocPagesCount}
                totalChars={activeDocPagesCount * 420}
              />
            )}

            {/* PDF TO POWERPOINT Specific Action Panel */}
            {isPptTool && (
              <PptConversionConfig
                filename={activeFile?.name || ''}
                pageCount={activeDocPagesCount}
              />
            )}

            {/* PDF TO EXCEL Specific Action Panel */}
            {isExcelTool && (
              <ExcelConversionConfig
                filename={activeFile?.name || ''}
                pageCount={activeDocPagesCount}
              />
            )}

            {/* WORD TO PDF Specific Action Panel */}
            {isWordToPdfTool && (
              <WordToPdfConfig
                filename={activeFile?.name || ''}
                filesize={activeFile?.size || 0}
              />
            )}

            {/* POWERPOINT TO PDF Specific Action Panel */}
            {isPptToPdfTool && (
              <PptToPdfConfig
                filename={activeFile?.name || ''}
                slideCount={activeDocPagesCount}
              />
            )}

            {/* EXCEL TO PDF Specific Action Panel */}
            {isExcelToPdfTool && (
              <ExcelToPdfConfig
                filename={activeFile?.name || ''}
                sheetCount={activeDocPagesCount}
              />
            )}

            {/* EDIT PDF Specific Action Panel */}
            {isEditTool && (
              <EditPdfConfig
                activeTool={editActiveTool}
                onActiveToolChange={setEditActiveTool}
                activeColor={editActiveColor}
                onActiveColorChange={setEditActiveColor}
                activeFontSize={editActiveFontSize}
                onActiveFontSizeChange={setEditActiveFontSize}
                annotations={editAnnotations}
                onClearPageAnnotations={() =>
                  setEditAnnotations(editAnnotations.filter(a => a.pageIndex !== editActivePageIndex))
                }
                activePageIndex={editActivePageIndex}
                totalPages={activeDocPagesCount || 1}
                onSelectPage={setEditActivePageIndex}
              />
            )}

            {/* PDF TO JPG Specific Action Panel */}
            {isPdfToJpgTool && (
              <PdfToJpgConfig
                pageCount={activeDocPagesCount || 1}
                filename={activeFile?.name || ''}
                selectedScale={actionParams.jpgScale || 2.5}
                onScaleChange={scale => updateActionParams({ jpgScale: scale })}
                selectedQuality={actionParams.jpgQuality || 0.92}
                onQualityChange={quality => updateActionParams({ jpgQuality: quality })}
              />
            )}

            {/* JPG TO PDF Specific Action Panel */}
            {isJpgToPdfTool && (
              <JpgToPdfConfig
                images={jpgToPdfImages}
                onReorder={(fromIdx, toIdx) => {
                  if (toIdx < 0 || toIdx >= jpgToPdfImages.length) return;
                  const copy = [...jpgToPdfImages];
                  const [moved] = copy.splice(fromIdx, 1);
                  copy.splice(toIdx, 0, moved);
                  setJpgToPdfImages(copy);
                }}
                onRemove={(idx) => {
                  setJpgToPdfImages(jpgToPdfImages.filter((_, i) => i !== idx));
                }}
                pageSizingMode={actionParams.jpgPageSizingMode || 'original'}
                onPageSizingModeChange={(mode) => updateActionParams({ jpgPageSizingMode: mode })}
              />
            )}

            {/* SIGN PDF Specific Action Panel */}
            {isSignTool && (
              <SignConfig
                signatureDataUrl={actionParams.signatureDataUrl}
                onSignatureChange={url => updateActionParams({ signatureDataUrl: url || undefined })}
                placementMode={actionParams.signaturePlacementMode || 'current'}
                onPlacementModeChange={m => updateActionParams({ signaturePlacementMode: m })}
                targetPage={actionParams.signatureTargetPage || 1}
                onTargetPageChange={p => updateActionParams({ signatureTargetPage: p })}
                totalPages={activeDocPagesCount}
                position={
                  actionParams.signaturePosition || {
                    xPercent: 62,
                    yPercent: 78,
                    widthPercent: 28,
                    heightPercent: 12,
                  }
                }
                onPositionChange={pos => updateActionParams({ signaturePosition: pos })}
              />
            )}

            {/* UNLOCK PDF Specific Action Panel */}
            {isUnlockTool && (
              <UnlockConfig
                encryptionType={actionParams.encryptionType || 'none'}
                passwordValue={actionParams.password || ''}
                onPasswordChange={val => {
                  setErrorMessage(null);
                  updateActionParams({ password: val });
                }}
                onSubmitUnlock={executeAction}
                pageCount={activeDocPagesCount}
                filename={activeFile?.name || ''}
                authError={errorMessage}
              />
            )}

            {/* REPAIR PDF Specific Action Panel */}
            {isRepairTool && (
              <RepairConfig
                diagnosis={{
                  severity: (actionParams.repairIssues && actionParams.repairIssues.length > 0) ? 'damaged_recoverable' : 'healthy',
                  issues: actionParams.repairIssues || [],
                  salvageablePages: activeDocPagesCount,
                  headerOffset: 0,
                  hasEof: true,
                  isHealthy: !actionParams.repairIssues || actionParams.repairIssues.length === 0,
                }}
                filename={activeFile?.name || ''}
                pageCount={activeDocPagesCount}
              />
            )}

            {/* REDACT PDF Specific Action Panel */}
            {isRedactTool && (
              <RedactConfig
                redactions={actionParams.redactionBoxes || []}
                onAddRedaction={box => {
                  const current = actionParams.redactionBoxes || [];
                  updateActionParams({ redactionBoxes: [...current, box] });
                }}
                onRemoveRedaction={id => {
                  const current = actionParams.redactionBoxes || [];
                  updateActionParams({ redactionBoxes: current.filter(b => b.id !== id) });
                }}
                onClearAll={() => updateActionParams({ redactionBoxes: [] })}
                selectedPage={actionParams.signatureTargetPage || 1}
                onSelectPage={p => updateActionParams({ signatureTargetPage: p })}
                totalPages={activeDocPagesCount}
                redactionColor={actionParams.redactionColor || 'black'}
                onColorChange={c => updateActionParams({ redactionColor: c })}
              />
            )}

            {/* Watermark PDF Configuration */}
            {!isMergeTool && !isSplitTool && isWatermarkTool && (
              <WatermarkConfig
                watermarkText={actionParams.watermarkText || (isAr ? 'سري للغاية' : 'CONFIDENTIAL')}
                onWatermarkTextChange={text => updateActionParams({ watermarkText: text })}
                fontSize={actionParams.watermarkFontSize || 48}
                onFontSizeChange={sz => updateActionParams({ watermarkFontSize: sz })}
                opacity={actionParams.watermarkOpacity !== undefined ? actionParams.watermarkOpacity : 0.35}
                onOpacityChange={op => updateActionParams({ watermarkOpacity: op })}
                rotation={actionParams.watermarkRotation !== undefined ? actionParams.watermarkRotation : 45}
                onRotationChange={rot => updateActionParams({ watermarkRotation: rot })}
                color={actionParams.watermarkColor || '#DC2626'}
                onColorChange={col => updateActionParams({ watermarkColor: col })}
                pageCount={activeDocPagesCount || 1}
              />
            )}

            {/* Rotate PDF Configuration */}
            {!isMergeTool && !isSplitTool && isRotateTool && (
              <RotateConfig
                pages={activePages}
                onRotateAll={deg => rotateAllPages(deg)}
                onResetAll={resetAllRotations}
              />
            )}

            {/* Organize PDF Configuration */}
            {!isMergeTool && !isSplitTool && isOrganizeTool && (
              <OrganizeConfig
                pages={organizePages}
                sourcePageCount={activeFile?.pageCount || 1}
                onResetOriginal={resetOrganizePages}
              />
            )}

            {/* Page Numbers Configuration */}
            {!isMergeTool && !isSplitTool && isPageNumbersTool && (
              <PageNumbersConfig
                position={actionParams.pageNumberPosition || 'bottom-center'}
                onPositionChange={pos => updateActionParams({ pageNumberPosition: pos })}
                format={(actionParams.pageNumberFormat as any) || 'page_x_of_y'}
                onFormatChange={fmt => updateActionParams({ pageNumberFormat: fmt })}
                fontSize={actionParams.pageNumberFontSize || 11}
                onFontSizeChange={sz => updateActionParams({ pageNumberFontSize: sz })}
                margin={actionParams.pageNumberMargin || 32}
                onMarginChange={m => updateActionParams({ pageNumberMargin: m })}
                startNumber={actionParams.pageNumberStart || 1}
                onStartNumberChange={n => updateActionParams({ pageNumberStart: n })}
                excludeFirstPage={actionParams.pageNumberExcludeFirstPage || false}
                onExcludeFirstPageChange={ex => updateActionParams({ pageNumberExcludeFirstPage: ex })}
                pageCount={activeDocPagesCount || 1}
              />
            )}

            {/* Crop PDF Configuration */}
            {!isMergeTool && !isSplitTool && isCropTool && (
              <CropConfig
                cropBox={actionParams.cropRegion || { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 }}
                onCropBoxChange={box => updateActionParams({ cropRegion: box })}
                applyToAllPages={actionParams.cropApplyToAllPages !== undefined ? actionParams.cropApplyToAllPages : true}
                onApplyToAllPagesChange={val => updateActionParams({ cropApplyToAllPages: val })}
                activePageIndex={cropActivePageIndex}
                totalPages={activeDocPagesCount || 1}
              />
            )}

            {/* Protect PDF Configuration */}
            {!isMergeTool && !isSplitTool && isProtectTool && (
              <ProtectConfig
                userPassword={actionParams.protectPassword || actionParams.password || ''}
                onUserPasswordChange={pwd => updateActionParams({ protectPassword: pwd, password: pwd })}
                confirmPassword={actionParams.protectConfirmPassword || ''}
                onConfirmPasswordChange={pwd => updateActionParams({ protectConfirmPassword: pwd })}
                allowPrinting={Boolean(actionParams.protectAllowPrinting)}
                onAllowPrintingChange={val => updateActionParams({ protectAllowPrinting: val })}
                allowCopying={Boolean(actionParams.protectAllowCopying)}
                onAllowCopyingChange={val => updateActionParams({ protectAllowCopying: val })}
                totalPages={activeDocPagesCount || 1}
              />
            )}

            {/* Unlock PDF Configuration */}
            {!isMergeTool && !isSplitTool && isUnlockTool && (
              <UnlockConfig
                encryptionType="open_password"
                passwordValue={actionParams.password || ''}
                onPasswordChange={pwd => updateActionParams({ password: pwd })}
                onSubmitUnlock={executeAction}
                pageCount={activeDocPagesCount || 1}
                filename={activeFile?.name || ''}
              />
            )}

            {/* HTML to PDF Configuration */}
            {!isMergeTool && !isSplitTool && isHtmlToPdfTool && (
              <HtmlToPdfConfig
                mode={actionParams.htmlMode || 'url'}
                onModeChange={m => updateActionParams({ htmlMode: m })}
                url={actionParams.htmlUrl || ''}
                onUrlChange={u => updateActionParams({ htmlUrl: u })}
                htmlContent={actionParams.htmlContent || ''}
                onHtmlContentChange={c => updateActionParams({ htmlContent: c })}
                pageSize={actionParams.htmlPageSize || 'a4'}
                onPageSizeChange={sz => updateActionParams({ htmlPageSize: sz })}
                orientation={actionParams.htmlOrientation || 'portrait'}
                onOrientationChange={o => updateActionParams({ htmlOrientation: o })}
                printBackground={actionParams.htmlPrintBackground !== undefined ? actionParams.htmlPrintBackground : true}
                onPrintBackgroundChange={b => updateActionParams({ htmlPrintBackground: b })}
              />
            )}

            {/* PDF to HTML Configuration */}
            {!isMergeTool && !isSplitTool && isPdfToHtmlTool && (
              <PdfToHtmlConfig
                pageCount={activeDocPagesCount || validPagesCount || 1}
                filename={activeFile?.name || ''}
              />
            )}

            {/* PDF Forms Configuration */}
            {!isMergeTool && !isSplitTool && isFormsTool && (
              <PdfFormsConfig
                fields={formFields}
                fieldValues={formFieldValues}
                onFieldValueChange={updateFormFieldValue}
                flattenForm={formFlattenEnabled}
                onFlattenFormChange={setFormFlattenEnabled}
                onResetValues={resetFormFieldValues}
              />
            )}

            {/* Scan to PDF Configuration */}
            {!isMergeTool && !isSplitTool && isScanToPdfTool && (
              <ScanToPdfConfig
                scannedPages={scannedPages}
                filterMode={scanFilterMode}
                onFilterModeChange={setScanFilterMode}
                threshold={scanThreshold}
                onThresholdChange={setScanThreshold}
                pageSize={scanPageSize}
                onPageSizeChange={setScanPageSize}
              />
            )}

            {/* PDF to PDF/A Configuration */}
            {!isMergeTool && !isSplitTool && isPdfaTool && (
              <PdfaConfig
                pdfaLevel={actionParams.pdfaLevel || '1b'}
                onPdfaLevelChange={lvl => updateActionParams({ pdfaLevel: lvl })}
                pageCount={activeDocPagesCount || validPagesCount || 1}
                filename={activeFile?.name || ''}
              />
            )}

            {/* Execution CTA Button */}
            <div className="pt-4 border-t border-[#C7C9CC]/40 dark:border-[#262626] space-y-3">
              <button
                type="button"
                disabled={
                  isProcessing ||
                  (isMergeTool ? mergeFiles.length < 2 :
                   isSplitTool ? (computedSplitRanges.length === 0 || !!splitValidationError) :
                   isHtmlToPdfTool ? ((actionParams.htmlMode === 'code' ? !(actionParams.htmlContent || '').trim() : !(actionParams.htmlUrl || '').trim()) && validPagesCount === 0) :
                   validPagesCount === 0)
                }
                onClick={executeAction}
                className="kanto-shine-cta w-full py-4 px-4 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                    <span>{progressStatusText || `${t.processing_file} (${processProgress}%)`}</span>
                  </>
                ) : (
                  <>
                    {isMergeTool ? <Layers size={16} /> :
                     isSplitTool ? <Scissors size={16} /> :
                     isCompressTool ? <Minimize2 size={16} /> :
                     isWordTool ? <FileType2 size={16} /> :
                     isPptTool ? <Presentation size={16} /> :
                     isExcelTool ? <FileSpreadsheet size={16} /> :
                     isWordToPdfTool ? <FileDown size={16} /> :
                     isPptToPdfTool ? <Presentation size={16} /> :
                     isExcelToPdfTool ? <FileSpreadsheet size={16} /> :
                     isPdfToJpgTool ? <ImageIcon size={16} /> :
                     isJpgToPdfTool ? <ImageIcon size={16} /> :
                     isEditTool ? <PenTool size={16} /> :
                     isSignTool ? <Feather size={16} /> :
                     isWatermarkTool ? <Stamp size={16} /> :
                     isRotateTool ? <RotateCw size={16} /> :
                     isOrganizeTool ? <Grid size={16} /> :
                     isPageNumbersTool ? <Binary size={16} /> :
                     isCropTool ? <Crop size={16} /> :
                     isProtectTool ? <LockIcon size={16} /> :
                     isUnlockTool ? <Unlock size={16} /> :
                     isHtmlToPdfTool ? <Globe size={16} /> :
                     isPdfToHtmlTool ? <Code2 size={16} /> :
                     isFormsTool ? <CheckSquare size={16} /> :
                     isRepairTool ? <Wrench size={16} /> :
                     isRedactTool ? <ShieldAlert size={16} /> :
                     isScanToPdfTool ? <Scan size={16} /> :
                     isPdfaTool ? <Archive size={16} /> :
                     <Sparkles size={16} />}
                    <span>
                      {isMergeTool
                        ? (mergeFiles.length < 2
                            ? (isAr ? 'أضف ملفاً آخر للدمج' : 'Add 1 More PDF to Merge')
                            : (isAr ? `دمج ${mergeFiles.length} ملفات الآن` : `Merge ${mergeFiles.length} PDFs Now`))
                        : isSplitTool
                        ? (isAr ? `تقسيم واستخراج ${computedSplitRanges.length} ملفات` : `Split & Export ${computedSplitRanges.length} Document(s)`)
                        : isCompressTool
                        ? (isAr ? 'ضغط وتقليص حجم المستند الآن' : 'Compress PDF Now')
                        : isWordTool
                        ? (isAr ? 'تحويل إلى مستند Word (.docx) الآن' : 'Convert to Word (.docx) Now')
                        : isPptTool
                        ? (isAr ? 'تحويل إلى شرائح PowerPoint (.pptx) الآن' : 'Convert to PowerPoint (.pptx) Now')
                        : isExcelTool
                        ? (isAr ? 'استخراج وتحويل إلى ملف Excel (.xlsx) الآن' : 'Extract & Convert to Excel (.xlsx) Now')
                        : isWordToPdfTool
                        ? (isAr ? 'تحويل مستند Word إلى PDF الآن' : 'Convert Word to PDF Now')
                        : isPptToPdfTool
                        ? (isAr ? 'تحويل العرض التقديمي إلى PDF الآن' : 'Convert Presentation to PDF Now')
                        : isExcelToPdfTool
                        ? (isAr ? 'تحويل جدول البيانات إلى PDF الآن' : 'Convert Spreadsheet to PDF Now')
                        : isPdfToJpgTool
                        ? (isAr
                            ? (activeDocPagesCount > 1
                                ? `تحويل وحزم ${activeDocPagesCount} صور في ملف ZIP الآن`
                                : 'تحويل إلى صورة JPEG عالية الدقة الآن')
                            : (activeDocPagesCount > 1
                                ? `Convert & Bundle ${activeDocPagesCount} JPEGs into ZIP Now`
                                : 'Convert to High-Res JPEG Now'))
                        : isJpgToPdfTool
                        ? (isAr
                            ? (jpgToPdfImages.length > 1
                                ? `تجميع وتحويل ${jpgToPdfImages.length} صور إلى مستند PDF الآن`
                                : 'تحويل الصورة إلى مستند PDF بأبعادها الأصلية الآن')
                            : (jpgToPdfImages.length > 1
                                ? `Bundle ${jpgToPdfImages.length} Images into Single PDF Now`
                                : 'Convert Image to PDF with Dynamic Sizing Now'))
                        : isScanToPdfTool
                        ? (isAr
                            ? `حزم وحفظ ${scannedPages.length} صفحات ممسوحة ضوئياً إلى PDF الآن`
                            : `Compile & Export ${scannedPages.length} Scanned Page(s) to PDF Now`)
                        : isEditTool
                        ? (isAr ? 'حفظ وتطبيق التعديلات الآن' : 'Save & Apply Annotations Now')
                        : isSignTool
                        ? (isAr ? 'ختم وتوقيع مستند PDF الآن' : 'Sign & Seal PDF Document Now')
                        : isWatermarkTool
                        ? (isAr
                            ? `تطبيق العلامة المائية على كافة الصفحات (${activeDocPagesCount} صفحة)`
                            : `Stamp Watermark on All ${activeDocPagesCount} Pages Now`)
                        : isRotateTool
                        ? (isAr
                            ? `تدوير وحفظ ${validPagesCount} صفحات بالبيانات الوصفية الآن`
                            : `Save & Apply Structural Rotation to ${validPagesCount} Page(s) Now`)
                        : isOrganizeTool
                        ? (isAr
                            ? `تجميع وحفظ المستند المنظم (${organizePages.length} صفحات)`
                            : `Save & Export ${organizePages.length} Organized Pages Now`)
                        : isPageNumbersTool
                        ? (isAr
                            ? `إضافة وترقيم ${validPagesCount} صفحات ديناميكياً الآن`
                            : `Stamp Dynamic Numbers on ${validPagesCount} Page(s) Now`)
                        : isCropTool
                        ? (isAr
                            ? `تطبيق واقتصاص الهوامش (${validPagesCount} صفحات) الآن`
                            : `Crop & Save ${validPagesCount} Page(s) Metadata Now`)
                        : isProtectTool
                        ? (isAr
                            ? `قفل وتشفير المستند (${validPagesCount} صفحات) الآن`
                            : `Encrypt & Lock ${validPagesCount} Page(s) Now`)
                        : isUnlockTool
                        ? (isAr ? 'فك القفل وإزالة القيود الآن' : 'Unlock & Strip Restrictions Now')
                        : isHtmlToPdfTool
                        ? (isAr ? 'تحويل صفحة الويب إلى PDF الآن' : 'Convert Webpage to Vector PDF Now')
                        : isPdfToHtmlTool
                        ? (isAr
                            ? `استخراج وتحويل ${validPagesCount} صفحات إلى HTML الآن`
                            : `Extract & Convert ${validPagesCount} Page(s) to HTML Now`)
                        : isFormsTool
                        ? (isAr
                            ? `تعبئة وتجميد نموذج PDF (${formFields.length} حقول) الآن`
                            : `Fill & Flatten PDF Form (${formFields.length} Fields) Now`)
                        : isPdfaTool
                        ? (isAr
                            ? `تحويل المستند إلى معيار PDF/A (${(actionParams.pdfaLevel || '1b').toUpperCase()}) الأرشيفي الآن`
                            : `Convert to ISO PDF/A (${(actionParams.pdfaLevel || '1b').toUpperCase()}) Archival Standard Now`)
                        : isRepairTool
                        ? (isAr ? 'إصلاح واسترداد مستند PDF الآن' : 'Repair & Reconstruct PDF Now')
                        : isRedactTool
                        ? (isAr ? 'حجب وإتلاف البيانات نهائياً الآن' : 'Permanently Redact PDF Now')
                        : t.execute_action}
                    </span>
                  </>
                )}
              </button>

              {/* Real-time Execution Output and Download Hub */}
              {processResult && (
                <div className="p-4 rounded-lg border border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#141414] space-y-3 animate-in fade-in slide-in-from-top-2 duration-250 ease-apple">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                    <CheckCircle2 size={16} />
                    <span>{t.download_ready}</span>
                  </div>

                  <div className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] space-y-0.5">
                    <div>Output: <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{processResult.downloadFilename}</span></div>
                    <div>Format: <span className="font-bold">{
                      processResult.mimeType === 'application/zip' ? 'ZIP Archive' :
                      isWordTool ? 'Microsoft Word (.docx)' :
                      isPptTool ? 'Microsoft PowerPoint (.pptx)' :
                      isExcelTool ? 'Microsoft Excel (.xlsx)' :
                      isWordToPdfTool ? 'Adobe PDF Document (.pdf)' :
                      isPptToPdfTool ? 'Adobe Presentation PDF (.pdf)' :
                      isExcelToPdfTool ? 'Adobe Table PDF (.pdf)' :
                      isPdfToJpgTool ? (processResult.isZipBundle ? 'High-Res ZIP Bundle (.zip)' : 'High-Res JPEG Image (.jpg)') :
                      isJpgToPdfTool ? 'Adobe Dynamic Sized PDF (.pdf)' :
                      isWatermarkTool ? 'Adobe Watermarked PDF (.pdf)' :
                      isRotateTool ? 'Adobe Rotated PDF Document (.pdf)' :
                      isOrganizeTool ? 'Adobe Organized PDF Document (.pdf)' :
                      isPageNumbersTool ? 'Adobe Numbered PDF Document (.pdf)' :
                      isCropTool ? 'Adobe Cropped PDF Document (.pdf)' :
                      isProtectTool ? 'Adobe Protected PDF Document (.pdf)' :
                      isEditTool ? 'Adobe Edited PDF (.pdf)' : 'PDF Document'
                    }</span></div>
                    {!isCompressTool && <div>Size: <span className="font-bold">{(processResult.fileSize / 1024).toFixed(1)} KB</span></div>}
                  </div>

                  {/* Compress PDF Specific Before/After Visual Comparison */}
                  {isCompressTool && processResult.originalSize && processResult.compressedSize && (
                    <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#383B3F] dark:text-[#B8BAC0]">
                          {isAr ? 'الحجم الأصلي:' : 'Original Size:'}
                        </span>
                        <span className="font-mono font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                          {(processResult.originalSize / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#383B3F] dark:text-[#B8BAC0]">
                          {isAr ? 'الحجم بعد الضغط:' : 'Compressed Size:'}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white">
                          {(processResult.compressedSize / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626] flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                          {processResult.isOptimizedAlready
                            ? (isAr ? 'المستند محسّن مسبقاً' : 'Already Fully Optimized')
                            : (isAr ? 'نسبة التقليص الإجمالية:' : 'Total Reduction:')}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          processResult.savingsPercent && processResult.savingsPercent > 0
                            ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                            : 'bg-[#F5F0E6] text-[#0D0D0D] dark:bg-[#222222] dark:text-[#F5F0E6] border-[#C7C9CC]'
                        }`}>
                          {processResult.savingsPercent && processResult.savingsPercent > 0
                            ? `⚡ -${processResult.savingsPercent}%`
                            : (isAr ? 'أمثل حجم' : 'Optimal')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Primary Master Download Button */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="kanto-shine-cta w-full py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>
                        {processResult.mimeType === 'application/zip'
                          ? (isAr ? 'تنزيل الحزمة الكاملة (.zip)' : 'Download Complete ZIP Bundle')
                          : isWordTool
                          ? (isAr ? 'تنزيل مستند Word (.docx)' : 'Download Word Document (.docx)')
                          : isPptTool
                          ? (isAr ? 'تنزيل عرض PowerPoint (.pptx)' : 'Download PowerPoint Presentation (.pptx)')
                          : isExcelTool
                          ? (isAr ? 'تنزيل مصنف Excel (.xlsx)' : 'Download Excel Spreadsheet (.xlsx)')
                          : isWordToPdfTool
                          ? (isAr ? 'تنزيل مستند PDF النهائي' : 'Download Final PDF Document')
                          : isPptToPdfTool
                          ? (isAr ? 'تنزيل مستند PDF النهائي' : 'Download Final PDF Document')
                          : isExcelToPdfTool
                          ? (isAr ? 'تنزيل مستند PDF النهائي' : 'Download Final PDF Document')
                          : isPdfToJpgTool
                          ? (processResult.isZipBundle
                              ? (isAr ? 'تنزيل حزمة الصور المضغوطة (.zip)' : 'Download Images ZIP Bundle (.zip)')
                              : (isAr ? 'تنزيل صورة JPEG' : 'Download JPEG Image (.jpg)'))
                          : isJpgToPdfTool
                          ? (isAr ? 'تنزيل مستند PDF المجمع' : 'Download Bundled PDF Document (.pdf)')
                          : isWatermarkTool
                          ? (isAr ? 'تنزيل مستند PDF الموسوم' : 'Download Watermarked PDF Document (.pdf)')
                          : isRotateTool
                          ? (isAr ? 'تنزيل مستند PDF بعد التدوير' : 'Download Rotated PDF Document (.pdf)')
                          : isOrganizeTool
                          ? (isAr ? 'تنزيل مستند PDF المنظم' : 'Download Organized PDF Document (.pdf)')
                          : isPageNumbersTool
                          ? (isAr ? 'تنزيل مستند PDF المرقم' : 'Download Numbered PDF Document (.pdf)')
                          : isCropTool
                          ? (isAr ? 'تنزيل مستند PDF المقصوص' : 'Download Cropped PDF Document (.pdf)')
                          : isProtectTool
                          ? (isAr ? 'تنزيل مستند PDF المشفر والمحمي' : 'Download Protected PDF Document (.pdf)')
                          : isEditTool
                          ? (isAr ? 'تنزيل مستند PDF المعدل' : 'Download Edited PDF Document')
                          : isSignTool
                          ? (isAr ? 'تنزيل مستند PDF الموقع' : 'Download Signed PDF Document')
                          : isUnlockTool
                          ? (isAr ? 'تنزيل مستند PDF المفكوك' : 'Download Unlocked PDF Document')
                          : isRepairTool
                          ? (isAr ? 'تنزيل مستند PDF المسترد' : 'Download Repaired PDF Document')
                          : isRedactTool
                          ? (isAr ? 'تنزيل مستند PDF المحجوب نهائياً' : 'Download Permanently Redacted PDF')
                          : t.download_now}
                      </span>
                    </button>

                    {/* Split PDF: Individual File Download List */}
                    {isSplitTool && processResult.outputSummary && processResult.outputSummary.length > 1 && (
                      <div className="space-y-1.5 pt-2 border-t border-[#C7C9CC]/60 dark:border-[#333333]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6] block">
                          {isAr ? 'أو تنزيل أجزاء محددة فردياً:' : 'Or download individual parts:'}
                        </span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {processResult.outputSummary.map((part, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#262626] flex items-center justify-between text-[11px]"
                            >
                              <div className="truncate font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] max-w-[140px]" title={part.filename}>
                                {part.rangeText} ({part.pageCount} pgs)
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDownloadSinglePart(part.blob, part.filename)}
                                className="px-2 py-1 rounded bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] dark:border-[#333333] hover:bg-[#0D0D0D] hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1 shrink-0"
                              >
                                <FileDown size={11} />
                                <span>{isAr ? 'تنزيل PDF' : 'Download PDF'}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="w-full py-2 px-3 rounded-lg border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#F5F0E6] text-xs font-semibold hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] transition-colors duration-250 ease-apple flex items-center justify-center gap-1.5"
                    >
                      <Smartphone size={14} />
                      <span>{t.mobile_handoff}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Memory Purge & Reset */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetWorkspace}
                  className="w-full py-2 px-3 rounded-lg border border-[#C7C9CC]/50 dark:border-[#262626] bg-transparent text-[#5A5D61] dark:text-[#A0A2A6] text-xs hover:text-[#0D0D0D] hover:border-[#0D0D0D] dark:hover:text-white transition-colors duration-250 ease-apple flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert size={13} />
                  <span>{t.purge_memory}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Internal SEO Cross-Links to Related Tools */}
      <RelatedTools currentToolId={selectedTool.id} />

      {/* Mobile QR Transfer Modal */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />

      {/* On-Demand High-Res Preview Modal */}
      <PageDetailModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        initialPageNumber={previewPageNumber}
        totalPages={activePages.length}
        fileKey={`${uploadedFiles[0]?.name || 'file'}_0`}
        arrayBuffer={uploadedFiles[0]?.arrayBuffer}
        rotations={activePages.reduce<Record<number, number>>((acc, p) => {
          acc[p.pageNumber] = p.rotation || 0;
          return acc;
        }, {})}
        onRotatePage={(pageNum, deg) => {
          rotatePage(pageNum, deg);
        }}
        isArabic={isAr}
      />
    </main>
  );
};
