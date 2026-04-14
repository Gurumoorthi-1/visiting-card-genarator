import React, { useState } from 'react';
import BusinessCard from './BusinessCard';
import { Monitor, Layers, RefreshCw, Box, Smartphone, X as CloseIcon } from 'lucide-react';
import { TEMPLATES } from '../App';
import ARPreview from './ARPreview';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  { icon: '🪄', title: 'AI Assistant', desc: 'Auto-generate professional taglines instantly.' },
  { icon: '📱', title: 'Smart QR Code', desc: 'Scan the back of the card to save contact info.' },
  { icon: '📐', title: 'Print Ready', desc: 'Export at 4× resolution — crisp at any size.' },
];

const LivePreview = ({ formData, logoUrl, designParams, onGenerateAR }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [arImage, setArImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleAR = async () => {
    if (showAR) {
      setShowAR(false);
      return;
    }

    setIsCapturing(true);
    const imgData = await onGenerateAR();
    if (imgData) {
      setArImage(imgData);
      setShowAR(true);
    }
    setIsCapturing(false);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start dot-grid overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="w-full max-w-3xl flex flex-col items-center gap-4 sm:gap-10 p-4 sm:p-0 pb-20 sm:pb-10">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-3 py-2 sm:py-2 bg-white rounded-2xl shadow-sm border border-slate-100 self-stretch justify-between">
          <div className="flex flex-wrap items-center justify-center gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm" style={{ background: designParams.accentColor }}>
              <Monitor className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Preview</span>
            </div>
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isFlipped ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFlipped ? 'animate-spin-slow' : ''}`} strokeWidth={2.5} />
              <span>Flip Card</span>
            </button>
            <button 
              onClick={toggleAR}
              disabled={isCapturing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showAR ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
            >
              <Box className={`w-3.5 h-3.5 ${isCapturing ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
              <span>{isCapturing ? 'Generating 3D...' : 'Interactive 3D'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide whitespace-nowrap">540 × 300 px</span>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border max-w-[120px] truncate" style={{ background: `${designParams.accentColor}1A`, color: designParams.accentColor, borderColor: `${designParams.accentColor}40` }}>
              {TEMPLATES[designParams.template]?.name || 'Template'}
            </span>
          </div>
        </div>

        {/* ── Card canvas ── */}
        <div className="relative flex flex-col items-center w-full my-4 sm:my-8">
          {/* Glow behind card */}
          <div className="absolute inset-x-8 top-4 h-40 blur-3xl opacity-30 rounded-full -z-10" style={{ background: designParams.accentColor }} />

          {/* Floating card with responsive scaling */}
          <div 
            id="capture-area" 
            data-flipped={isFlipped}
            className="card-float w-full flex justify-center perspective-[1500px] transform-gpu transition-transform duration-500 origin-center scale-[0.6] sm:scale-[0.8] lg:scale-100"
          >
             <div className="shrink-0">
                <BusinessCard formData={formData} logoUrl={logoUrl} designParams={designParams} isFlipped={isFlipped} />
             </div>
          </div>

          {/* Shadow below card */}
          <div className="mt-4 sm:mt-8 w-1/2 sm:w-3/4 h-2 sm:h-3 bg-slate-900/10 blur-xl rounded-full" />
        </div>

        {/* ── Tips grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {TIPS.map((tip, i) => (
            <div
              key={i}
              className="group p-5 bg-white/90 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="text-2xl mb-3">{tip.icon}</div>
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">{tip.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* ── AR Modal / View ── */}
        <AnimatePresence>
            {showAR && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full flex flex-col items-center gap-4 py-8 border-t border-slate-200"
                >
                    <div className="flex items-center justify-between w-full mb-2">
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Augmented Reality Preview</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Interact with the 3D model or scan the QR code</p>
                        </div>
                        <button onClick={() => setShowAR(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <CloseIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    
                    <ARPreview cardImage={arImage} />
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LivePreview;
