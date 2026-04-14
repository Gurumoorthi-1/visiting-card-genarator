import React from 'react';

import { CreditCard, Download, Image as ImageIcon, FileText, RotateCcw, Cloud } from 'lucide-react';

const Header = ({ onReset, onDownloadPNG, onDownloadPDF, onSave, accentColor, isGenerating }) => {

  return (
    <header className="sticky top-0 z-50 glass border-b shadow-sm" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl shadow-lg" style={{ background: accentColor }}>
            <CreditCard className="w-4 h-4 sm:w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-1">
              <h1 className="text-sm sm:text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>GenCard</h1>
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded-full border text-slate-700 bg-slate-100 border-slate-200">
                PRO
              </span>
            </div>
            <p className="hidden xs:block text-[8px] sm:text-[10px] font-medium mt-0.5 text-slate-400">Visiting Card Generator</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden md:inline">Reset Design</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 ml-0.5">
            <button
               onClick={onSave}
               disabled={isGenerating}
               title="Save Cloud"
               className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-indigo-600 bg-indigo-50 border border-indigo-100 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
               <Cloud className="w-4 h-4" strokeWidth={2.5} />
               <span className="hidden sm:inline">Save to Cloud</span>
            </button>

            <button
              onClick={onDownloadPDF}
              disabled={isGenerating}
              title="Download PDF"
              className="group flex items-center gap-1.5 px-2 sm:px-4 py-2 text-slate-700 bg-white border border-slate-200 text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
              <span className="hidden xs:inline">{isGenerating ? '...' : 'PDF'}</span>
            </button>
            <button
              onClick={onDownloadPNG}
              disabled={isGenerating}
              title="Download PNG"
              className="flex items-center gap-1.5 px-2.5 sm:px-5 py-2 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: accentColor }}
            >
              <ImageIcon className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden xs:inline">{isGenerating ? '...' : 'PNG'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
