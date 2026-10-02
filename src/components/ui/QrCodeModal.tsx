import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { X, Smartphone, ShieldCheck } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, downloadUrl = window.location.href }) => {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0D0D]/60 backdrop-blur-none"
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#141414] rounded-lg border border-[#C7C9CC] dark:border-[#333333] p-8 shadow-none flex flex-col items-center animate-in fade-in zoom-in-95 duration-250 ease-apple">
        <div className="w-full flex items-center justify-between pb-4 border-b border-[#C7C9CC]/40 dark:border-[#262626] mb-5">
          <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <Smartphone size={18} />
            <h3 id="qr-modal-title" className="text-base font-serif italic">{t.mobile_handoff}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg border border-[#C7C9CC]/40 hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 bg-[#F5F0E6] dark:bg-[#0D0D0D] rounded-lg border border-[#C7C9CC] dark:border-[#262626] my-2">
          <div className="p-3 bg-white rounded-lg border border-[#C7C9CC]/50">
            <QRCodeSVG
              value={downloadUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        <p className="text-xs text-center text-[#5A5D61] dark:text-[#A0A2A6] mt-4 leading-relaxed">
          {t.scan_qr_to_download}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#0D0D0D] dark:text-[#C7C9CC] font-semibold">
          <ShieldCheck size={14} />
          <span>Encrypted Local WebRTC Handoff</span>
        </div>

        <button
          onClick={onClose}
          className="kanto-shine-cta mt-6 w-full py-3 font-semibold text-xs flex items-center justify-center"
        >
          Done
        </button>
      </div>
    </div>
  );
};
