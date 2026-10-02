import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageInputItem } from '../../services/jpgToPdfEngine';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

interface JpgToPdfWorkspaceProps {
  images: ImageInputItem[];
  onImagesChange: (images: ImageInputItem[]) => void;
  onAddMoreFiles: (files: File[]) => Promise<void>;
}

export const JpgToPdfWorkspace: React.FC<JpgToPdfWorkspaceProps> = ({
  images,
  onImagesChange,
  onAddMoreFiles,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onImagesChange(updated);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onAddMoreFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((item, idx) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-[#141414] rounded-xl border border-[#C7C9CC] dark:border-[#262626] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
          >
            {/* Top Page Number & Action Bar */}
            <div className="p-2.5 flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] bg-[#F5F0E6]/30 dark:bg-[#181818]">
              <span className="font-mono text-[11px] font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span>{isAr ? `صفحة ${idx + 1}` : `Page ${idx + 1}`}</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, idx - 1)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25"
                  title="Move Left"
                >
                  <ArrowLeft size={12} />
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, idx + 1)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-25"
                  title="Move Right"
                >
                  <ArrowRight size={12} />
                </button>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Remove Image"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="p-3 flex items-center justify-center bg-[#F5F0E6]/20 dark:bg-[#0D0D0D] min-h-[160px] max-h-[220px] overflow-hidden">
              <img
                src={item.previewUrl}
                alt={item.name}
                className="max-h-[180px] max-w-full object-contain rounded shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
              />
            </div>

            {/* Bottom Meta Info */}
            <div className="p-2.5 bg-white dark:bg-[#141414] border-t border-[#C7C9CC]/30 dark:border-[#262626] text-[11px] flex justify-between items-center text-[#5A5D61] dark:text-[#A0A2A6]">
              <span className="truncate max-w-[140px] font-medium text-[#0D0D0D] dark:text-white" title={item.name}>
                {item.name}
              </span>
              <span className="font-mono text-[10px] shrink-0">
                {item.width} × {item.height}
              </span>
            </div>
          </div>
        ))}

        {/* Add More Images Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D] dark:hover:border-white bg-white/40 dark:bg-[#1A1A1A]/40 min-h-[220px] transition-colors group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#F5F0E6] dark:bg-[#262626] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-white mb-2 group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'إضافة المزيد من الصور' : 'Add More Images'}
          </span>
          <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] mt-0.5">
            {isAr ? 'JPG, PNG, WebP إلى التسلسل' : 'Append JPG, PNG, WebP to PDF'}
          </span>
        </button>
      </div>
    </div>
  );
};
