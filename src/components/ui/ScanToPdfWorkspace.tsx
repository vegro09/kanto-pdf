import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ScannedPageItem, ScanFilterMode } from '../../types/tools';
import { renderProcessedScan, processFileToScannedItem, createSampleScannedItem } from '../../services/scanToPdfEngine';
import { Camera, RefreshCw, Trash2, Plus, Upload, X, Eye } from 'lucide-react';

interface ScanToPdfWorkspaceProps {
  scannedPages: ScannedPageItem[];
  onPagesChange: (pages: ScannedPageItem[]) => void;
  filterMode: ScanFilterMode;
  threshold: number;
}

export const ScanToPdfWorkspace: React.FC<ScanToPdfWorkspaceProps> = ({
  scannedPages,
  onPagesChange,
  filterMode,
  threshold,
}) => {
  const { lang, setErrorMessage } = useApp();
  const isAr = lang === 'ar';

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewZoomItem, setPreviewZoomItem] = useState<ScannedPageItem | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(isAr ? 'الكاميرا غير مدعومة في هذا المتصفح.' : 'Camera API is not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      setCameraError(
        isAr
          ? 'تعذر الوصول إلى الكاميرا. يرجى السماح بالوصول أو رفع صور من جهازك.'
          : 'Could not access camera. Please allow camera permissions or upload image files.'
      );
    }
  };

  // Toggle Camera View
  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCameraStream();
      setIsCameraActive(false);
    } else {
      startCamera();
    }
  };

  // Switch between front and back camera
  const handleSwitchFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture Frame from Video
  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const originalDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const { processedDataUrl, width, height } = await renderProcessedScan(
      originalDataUrl,
      filterMode,
      threshold,
      0
    );

    const newItem: ScannedPageItem = {
      id: `scanned-page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      originalDataUrl,
      processedDataUrl,
      width,
      height,
      filterMode,
      threshold,
      rotation: 0,
    };

    onPagesChange([...scannedPages, newItem]);
  };

  // Re-apply filter whenever filterMode or threshold changes across existing pages
  useEffect(() => {
    if (scannedPages.length === 0) return;

    let isMounted = true;
    const updatePages = async () => {
      const updated = await Promise.all(
        scannedPages.map(async page => {
          if (page.filterMode === filterMode && page.threshold === threshold) {
            return page;
          }
          const { processedDataUrl, width, height } = await renderProcessedScan(
            page.originalDataUrl,
            filterMode,
            threshold,
            page.rotation
          );
          return {
            ...page,
            processedDataUrl,
            width,
            height,
            filterMode,
            threshold,
          };
        })
      );

      if (isMounted) {
        onPagesChange(updated);
      }
    };

    updatePages();

    return () => {
      isMounted = false;
    };
  }, [filterMode, threshold]);

  // Rotate a specific page
  const handleRotatePage = async (idx: number) => {
    const page = scannedPages[idx];
    if (!page) return;
    const nextRot = (page.rotation + 90) % 360;

    const { processedDataUrl, width, height } = await renderProcessedScan(
      page.originalDataUrl,
      page.filterMode,
      page.threshold,
      nextRot
    );

    const nextPages = [...scannedPages];
    nextPages[idx] = {
      ...page,
      rotation: nextRot,
      processedDataUrl,
      width,
      height,
    };
    onPagesChange(nextPages);
  };

  // Delete a specific page
  const handleDeletePage = (idx: number) => {
    const nextPages = scannedPages.filter((_, i) => i !== idx);
    onPagesChange(nextPages);
  };

  // Upload Photo File
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const newItems: ScannedPageItem[] = [];
      for (const file of files) {
        const item = await processFileToScannedItem(file, filterMode, threshold);
        newItems.push(item);
      }
      onPagesChange([...scannedPages, newItems[0] ? newItems[0] : newItems[0]]);
      onPagesChange([...scannedPages, ...newItems]);
    } catch {
      setErrorMessage(isAr ? 'فشل تحميل ملف الصورة.' : 'Failed to load photo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Sample Scan
  const handleAddSample = async () => {
    const sample = await createSampleScannedItem(isAr);
    onPagesChange([...scannedPages, sample]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-[#F5F0E6]">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'المسح الضوئي بالكاميرا (Scan to PDF)' : 'Camera Document Scanner'}
            </h3>
            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
              {scannedPages.length}{' '}
              {isAr ? 'صفحات تم التقاطها وتنظيفها' : 'page(s) captured & filtered'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera Shutter Trigger Toggle */}
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              isCameraActive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                : 'bg-[#0D0D0D] hover:bg-[#262626] text-white dark:bg-white dark:hover:bg-[#E5E1D8] dark:text-[#0D0D0D] shadow-xs'
            }`}
          >
            <Camera size={14} />
            <span>
              {isCameraActive
                ? isAr
                  ? 'إغلاق الكاميرا'
                  : 'Close Camera'
                : isAr
                ? 'تشغيل الكاميرا'
                : 'Open Camera'}
            </span>
          </button>

          {/* Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] hover:bg-[#F5F0E6] text-xs font-semibold text-[#0D0D0D] dark:text-white transition-colors"
          >
            <Upload size={14} />
            <span>{isAr ? 'رفع صورة' : 'Upload Photo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleUploadPhoto}
          />

          {/* Add Sample */}
          <button
            type="button"
            onClick={handleAddSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#C7C9CC] dark:border-[#333333] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] text-xs text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white transition-colors"
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة عينة' : 'Add Sample'}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Camera Viewfinder Overlay (When Active) */}
      {isCameraActive && (
        <div className="bg-[#0D0D0D] border-2 border-emerald-500 rounded-2xl p-4 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between text-white text-xs px-2">
            <span className="font-bold flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? 'الكاميرا نشطة - وجه المستند داخل الإطار' : 'Camera Active — Align Document Inside Frame'}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwitchFacingMode}
                className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white transition-colors"
                title={isAr ? 'تبديل الكاميرا (أمامية/خلفية)' : 'Switch Camera (Front/Back)'}
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setIsCameraActive(false);
                }}
                className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-red-600 text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {cameraError ? (
            <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-xl text-center text-red-300 text-xs space-y-2">
              <p>{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-red-800 text-white font-semibold text-xs hover:bg-red-700"
              >
                {isAr ? 'رفع ملفات صور بدلاً من ذلك' : 'Upload Photos Instead'}
              </button>
            </div>
          ) : (
            <div className="relative aspect-4/3 max-w-xl mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Framing Overlay */}
              <div className="absolute inset-4 border-2 border-white/60 border-dashed rounded-lg pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>
            </div>
          )}

          {/* Shutter Capture Button */}
          {!cameraError && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                <Camera size={18} className="group-hover:rotate-12 transition-transform" />
                <span>{isAr ? 'التقاط وحفظ الصفحة' : 'Capture Page'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Scanned Pages Grid */}
      {scannedPages.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-[#C7C9CC] dark:border-[#333333] rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F5F0E6] dark:bg-[#1A1A1A] border border-[#C7C9CC] flex items-center justify-center text-[#5A5D61] dark:text-[#A0A2A6]">
            <Camera size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#0D0D0D] dark:text-white">
              {isAr ? 'لا توجد صفحات ممسوحة ضوئياً بعد' : 'No Scanned Pages Yet'}
            </h4>
            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] max-w-sm mx-auto">
              {isAr
                ? 'انقر على "تشغيل الكاميرا" لالتقاط المستند، أو ارفع صوراً لتنظيفها وتجميعها في PDF.'
                : 'Click "Open Camera" to capture document pages, or upload image files to clean and bundle.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startCamera()}
              className="px-4 py-2 rounded-xl bg-[#0D0D0D] hover:bg-[#262626] text-white dark:bg-white dark:hover:bg-[#E5E1D8] dark:text-[#0D0D0D] text-xs font-bold"
            >
              {isAr ? 'تشغيل الكاميرا الآن' : 'Start Camera Now'}
            </button>
            <button
              type="button"
              onClick={handleAddSample}
              className="px-4 py-2 rounded-xl border border-[#C7C9CC] dark:border-[#333333] hover:bg-[#F5F0E6] text-xs font-semibold text-[#0D0D0D] dark:text-white"
            >
              {isAr ? 'تجربة عينة ماسح ضوئي' : 'Try Sample Page'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {scannedPages.map((page, idx) => (
            <div
              key={page.id}
              className="group relative bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-xl overflow-hidden shadow-xs hover:border-[#0D0D0D] dark:hover:border-white transition-all"
            >
              {/* Page Number Badge */}
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#0D0D0D]/80 text-white text-[10px] font-bold backdrop-blur-xs">
                #{idx + 1}
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setPreviewZoomItem(page)}
                  className="p-1 rounded-md bg-white/90 dark:bg-[#1F1F1F]/90 text-[#0D0D0D] dark:text-white hover:scale-105 shadow-xs transition-transform"
                  title={isAr ? 'تكبير ومعاينة' : 'Zoom Preview'}
                >
                  <Eye size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotatePage(idx)}
                  className="p-1 rounded-md bg-white/90 dark:bg-[#1F1F1F]/90 text-[#0D0D0D] dark:text-white hover:scale-105 shadow-xs transition-transform"
                  title={isAr ? 'تدوير 90 درجة' : 'Rotate 90°'}
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePage(idx)}
                  className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-xs transition-transform"
                  title={isAr ? 'حذف الصفحة' : 'Delete Page'}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Scanned Image Preview */}
              <div className="aspect-3/4 bg-[#F5F0E6] dark:bg-[#1A1A1A] flex items-center justify-center p-2">
                <img
                  src={page.processedDataUrl}
                  alt={`Scanned page ${idx + 1}`}
                  className="max-h-full max-w-full object-contain rounded shadow-xs"
                />
              </div>

              {/* Footer details */}
              <div className="p-2.5 bg-[#F5F0E6]/50 dark:bg-[#1F1F1F]/50 border-t border-[#C7C9CC]/40 dark:border-[#262626] flex items-center justify-between text-[10px]">
                <span className="font-mono text-[#5A5D61] dark:text-[#A0A2A6]">
                  {page.width} × {page.height}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {page.rotation !== 0 ? `${page.rotation}°` : 'Clean'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Zoom Modal */}
      {previewZoomItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl max-w-3xl w-full p-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#0D0D0D] dark:text-white">
                {isAr ? 'معاينة الصفحة الممسوحة ضوئياً' : 'Scanned Document Full View'}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewZoomItem(null)}
                className="p-1 rounded-lg hover:bg-[#F5F0E6] dark:hover:bg-[#262626] text-[#0D0D0D] dark:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex justify-center bg-[#1A1A1A] rounded-xl p-3 max-h-[65vh] overflow-auto">
              <img
                src={previewZoomItem.processedDataUrl}
                alt="Full scan preview"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewZoomItem(null)}
                className="px-4 py-2 rounded-xl bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] text-xs font-bold"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
