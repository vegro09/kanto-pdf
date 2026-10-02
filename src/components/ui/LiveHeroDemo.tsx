import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCw, ShieldCheck, Sparkles, FileText, ArrowRight, Check } from 'lucide-react';

export const LiveHeroDemo: React.FC = () => {
  const { t, loadSampleDoc } = useApp();
  const [rotation, setRotation] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'meta' | 'security'>('preview');

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="w-full bg-white dark:bg-kanto-charcoal rounded-lg border border-black dark:border-[#383838] p-4 sm:p-6 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-kanto-forest border border-black dark:border-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            {t.hero_demo_title}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-kanto-cream dark:bg-[#2A2A2A] border border-black/20 dark:border-white/20 text-black dark:text-white font-medium">
            Live WebAssembly
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-kanto-cream dark:hover:bg-[#2A2A2A]'
            }`}
          >
            Tactile Sheet
          </button>
          <button
            onClick={() => setActiveTab('meta')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              activeTab === 'meta'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-kanto-cream dark:hover:bg-[#2A2A2A]'
            }`}
          >
            Byte Matrix
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              activeTab === 'security'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-kanto-cream dark:hover:bg-[#2A2A2A]'
            }`}
          >
            Privacy Sandbox
          </button>
        </div>
      </div>

      {/* Main interactive demo canvas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        <div className="md:col-span-7 flex flex-col items-center justify-center p-6 bg-kanto-cream dark:bg-[#121212] rounded-lg border border-black/15 dark:border-[#383838] min-h-[260px] relative overflow-hidden">
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center">
              <div
                style={{ transform: `rotate(${rotation}deg)` }}
                className="w-48 h-64 bg-white dark:bg-[#1E1E1E] rounded-lg border-2 border-black dark:border-white p-3.5 flex flex-col justify-between transition-transform duration-300 shadow-none relative select-none"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/20 dark:border-white/20 pb-1.5 mb-2">
                    <span className="text-[10px] font-bold text-black dark:text-white">KANTO EMPIRE</span>
                    <span className="text-[9px] font-mono px-1 bg-black text-white dark:bg-white dark:text-black rounded">P.01</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-3/4 bg-black/80 dark:bg-white/80 rounded" />
                    <div className="h-1.5 w-full bg-black/30 dark:bg-white/30 rounded" />
                    <div className="h-1.5 w-5/6 bg-black/30 dark:bg-white/30 rounded" />
                    <div className="h-1.5 w-4/6 bg-black/30 dark:bg-white/30 rounded" />
                  </div>
                </div>

                <div className="p-2 bg-kanto-cream dark:bg-[#252525] rounded border border-black/20 dark:border-white/20 text-[9px] font-mono text-center">
                  AES-256 Verified Sandbox
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-black dark:border-white bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-kanto-cream dark:hover:bg-[#2A2A2A]"
                >
                  <RotateCw size={13} />
                  <span>Rotate 90° ({rotation}°)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="w-full space-y-2 text-xs font-mono text-black dark:text-white">
              <div className="p-2.5 bg-white dark:bg-[#1E1E1E] rounded-lg border border-black/20 dark:border-white/20 flex justify-between">
                <span className="text-kanto-muted">Format:</span>
                <span className="font-bold">PDF 1.7 / ISO 32000-1</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#1E1E1E] rounded-lg border border-black/20 dark:border-white/20 flex justify-between">
                <span className="text-kanto-muted">Memory Residency:</span>
                <span className="font-bold text-kanto-forest">Local RAM (0 Network Calls)</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-[#1E1E1E] rounded-lg border border-black/20 dark:border-white/20 flex justify-between">
                <span className="text-kanto-muted">Cryptographic Hash:</span>
                <span className="font-bold truncate max-w-[180px]">e3b0c44298fc1c149afbf4c8</span>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="w-full space-y-3 text-xs text-black dark:text-white">
              <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#1E1E1E] rounded-lg border border-kanto-forest text-kanto-forest font-semibold">
                <ShieldCheck size={16} />
                <span>Zero Server Uploads: Execution isolated to WebAssembly thread</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-[#1E1E1E] rounded-lg border border-black/20 dark:border-white/20">
                <Check size={14} className="text-kanto-forest" />
                <span>Immediate browser memory purge on tab close or session reset</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Prompt */}
        <div className="md:col-span-5 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              <span>Instant Test</span>
            </div>
            <h4 className="text-lg font-bold text-black dark:text-white">
              {t.hero_demo_instruction}
            </h4>
            <p className="text-xs text-kanto-muted dark:text-[#A0A0A0] mt-1 leading-relaxed">
              Experience the 3-screen workflow immediately with our pre-built multi-page demonstration document.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={loadSampleDoc}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:bg-[#222] dark:hover:bg-[#EEE] transition-colors"
            >
              <FileText size={16} />
              <span>{t.hero_demo_button}</span>
              <ArrowRight size={15} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
