import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { makeSignatureBackgroundTransparent } from '../../services/signEngine';
import { Feather, Type, Upload, RotateCcw } from 'lucide-react';

interface SignatureCaptureBoxProps {
  onSignatureChange: (dataUrl: string | null) => void;
  initialSignatureUrl?: string | null;
}

export const SignatureCaptureBox: React.FC<SignatureCaptureBoxProps> = ({
  onSignatureChange,
}) => {
  const { lang, isDarkMode } = useApp();
  const isAr = lang === 'ar';

  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState<string>('John Doe');
  const [fontStyleIndex, setFontStyleIndex] = useState<number>(0);
  const [inkColor, setInkColor] = useState<string>('#0D0D0D');
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scriptFonts = [
    { name: 'Classic Script', font: 'italic 36px "Brush Script MT", "Segoe Script", cursive' },
    { name: 'Executive Flow', font: 'italic 34px "Lucida Handwriting", cursive' },
    { name: 'Modern Signature', font: '32px "Caveat", "Dancing Script", cursive' },
  ];

  // Initialize Canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = isDarkMode && inkColor === '#0D0D0D' ? '#FFFFFF' : inkColor;
        ctx.lineWidth = 2.5;
      }
    }
  }, [mode, inkColor, isDarkMode]);

  // Handle Typed Signature generation
  useEffect(() => {
    if (mode === 'type') {
      const canvas = document.createElement('canvas');
      canvas.width = 450;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = scriptFonts[fontStyleIndex].font;
        ctx.fillStyle = inkColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName || 'Your Signature', canvas.width / 2, canvas.height / 2);
        const dataUrl = canvas.toDataURL('image/png');
        onSignatureChange(dataUrl);
      }
    }
  }, [mode, typedName, fontStyleIndex, inkColor]);

  // Handle Drawing events (Mouse & Touch)
  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isDarkMode && inkColor === '#0D0D0D' ? '#FFFFFF' : inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
    setHasDrawn(true);
  };

  const endDrawing = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onSignatureChange(null);
  };

  // Upload handler with white background removal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const rawUrl = reader.result as string;
        const transparentUrl = await makeSignatureBackgroundTransparent(rawUrl);
        setUploadPreview(transparentUrl);
        onSignatureChange(transparentUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F5F0E6] dark:bg-[#1A1A1A] border border-[#C7C9CC]/80 dark:border-[#333333]">
        <button
          type="button"
          onClick={() => {
            setMode('draw');
            if (canvasRef.current && hasDrawn) {
              onSignatureChange(canvasRef.current.toDataURL('image/png'));
            } else {
              onSignatureChange(null);
            }
          }}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mode === 'draw'
              ? 'bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-white shadow-xs border border-[#C7C9CC]/60 dark:border-[#333333]'
              : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white'
          }`}
        >
          <Feather size={13} />
          <span>{isAr ? 'رسم حر' : 'Draw'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('type')}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mode === 'type'
              ? 'bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-white shadow-xs border border-[#C7C9CC]/60 dark:border-[#333333]'
              : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white'
          }`}
        >
          <Type size={13} />
          <span>{isAr ? 'كتابة نص' : 'Type'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('upload');
            if (uploadPreview) onSignatureChange(uploadPreview);
          }}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            mode === 'upload'
              ? 'bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-white shadow-xs border border-[#C7C9CC]/60 dark:border-[#333333]'
              : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white'
          }`}
        >
          <Upload size={13} />
          <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
        </button>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-[11px] font-semibold text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'لون الحبر:' : 'Ink Color:'}
        </span>
        <div className="flex items-center gap-2">
          {[
            { color: '#0D0D0D', label: 'Black' },
            { color: '#1E3A8A', label: 'Navy' },
            { color: '#2563EB', label: 'Blue' },
          ].map(swatch => (
            <button
              key={swatch.color}
              type="button"
              onClick={() => setInkColor(swatch.color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                inkColor === swatch.color ? 'scale-110 border-[#0D0D0D] dark:border-white shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: swatch.color }}
              title={swatch.label}
            />
          ))}
        </div>
      </div>

      {/* MODE 1: DRAW CANVAS */}
      {mode === 'draw' && (
        <div className="space-y-2">
          <div className="relative rounded-[16px] border-2 border-dashed border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] overflow-hidden shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              width={340}
              height={140}
              className="w-full h-[140px] cursor-crosshair block"
              onMouseDown={e => startDrawing(e.clientX, e.clientY)}
              onMouseMove={e => drawMove(e.clientX, e.clientY)}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={e => {
                if (e.touches.length > 0) {
                  startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={e => {
                if (e.touches.length > 0) {
                  drawMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={endDrawing}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
                <span>{isAr ? 'ارسم توقيعك هنا باللمس أو الفأرة' : 'Draw your signature here with touch or mouse'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-2.5 py-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] text-[#5A5D61] dark:text-[#A0A2A6] text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>{isAr ? 'مسح وإعادة' : 'Clear'}</span>
            </button>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'تشفير موضعي 100%' : '100% Vector Quality'}
            </span>
          </div>
        </div>
      )}

      {/* MODE 2: TYPE SIGNATURE */}
      {mode === 'type' && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-1">
              {isAr ? 'الاسم أو الأحرف الأولى:' : 'Type Full Name or Initials:'}
            </label>
            <input
              type="text"
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full kanto-input text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#5A5D61] dark:text-[#A0A2A6] block">
              {isAr ? 'اختر نمط الخط التوقيعي:' : 'Select Signature Style:'}
            </label>
            <div className="space-y-1.5">
              {scriptFonts.map((sf, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFontStyleIndex(idx)}
                  className={`w-full p-2.5 rounded-xl border text-center transition-all ${
                    fontStyleIndex === idx
                      ? 'bg-white dark:bg-[#141414] border-[#0D0D0D] dark:border-white shadow-xs ring-1 ring-[#0D0D0D]/10'
                      : 'bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border-[#C7C9CC]/80 dark:border-[#2C2F33] hover:border-[#0D0D0D]'
                  }`}
                >
                  <span
                    style={{ font: sf.font, color: inkColor }}
                    className="block text-xl truncate py-0.5"
                  >
                    {typedName || 'Your Signature'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: UPLOAD SIGNATURE IMAGE */}
      {mode === 'upload' && (
        <div className="space-y-3 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-[16px] border-2 border-dashed border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D] dark:hover:border-white bg-white dark:bg-[#141414] cursor-pointer text-center space-y-2 transition-colors"
          >
            {uploadPreview ? (
              <div className="space-y-2">
                <img
                  src={uploadPreview}
                  alt="Uploaded Signature"
                  className="max-h-20 mx-auto object-contain"
                />
                <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block">
                  {isAr ? '✓ تمت إزالة الخلفية البيضاء تلقائياً (شفاف)' : '✓ White background automatically filtered to transparent'}
                </span>
              </div>
            ) : (
              <div>
                <Upload size={22} className="mx-auto text-[#0D0D0D] dark:text-[#F5F0E6] mb-1.5" />
                <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
                  {isAr ? 'انقر لاختيار صورة التوقيع' : 'Click to select signature photo'}
                </span>
                <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
                  PNG, JPG, WebP • Auto Transparency
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
