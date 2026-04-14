import React, { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Smartphone, X, Maximize2, Info } from 'lucide-react';

/**
 * ARCardViewer Component - Modern Standalone 3D Viewer
 * specifically designed to load a business_card.glb from the public folder.
 * 
 * @param {string} cardTexture - The base64/blob image of the business card.
 */
const ARCardViewer = ({ cardTexture }) => {
  const modelViewerRef = useRef(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Update Texture when cardTexture OR isFlipped changes
  useEffect(() => {
    const applyTexture = async () => {
      const mv = modelViewerRef.current;
      if (!mv || !cardTexture || !mv.model) return;

      try {
        let finalImage = cardTexture;

        // "Flip Correction": If the card is flipped, we mirror the image horizontally
        // so that the text appears correctly on the back of the 1-material model.
        if (isFlipped) {
            const img = new Image();
            img.src = cardTexture;
            await new Promise(resolve => img.onload = resolve);
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(img, 0, 0);
            finalImage = canvas.toDataURL();
        }

        const texture = await mv.createTexture(finalImage);
        
        mv.model.materials.forEach(material => {
            if (material.pbrMetallicRoughness) {
                material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
            if (material.emissiveTexture) {
                material.emissiveTexture.setTexture(texture);
            }
        });
      } catch (error) {
        console.error("Failed to sync flipped texture:", error);
      }
    };

    const mv = modelViewerRef.current;
    if (mv) {
      mv.addEventListener('load', applyTexture);
      if (mv.model) applyTexture();
    }

    return () => mv?.removeEventListener('load', applyTexture);
  }, [cardTexture]);

  return (
    <div className="w-[500px] h-[500px] mx-auto bg-[#0F172A] rounded-[3rem] p-1 shadow-2xl relative group overflow-hidden border border-white/10">
      {/* Main Container */}
      <div className="w-full h-full bg-[#020617] rounded-[2.8rem] overflow-hidden relative flex flex-col">
        {/* Header Bar */}
        <div className="h-16 flex items-center justify-between px-8 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
               <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">3D Preview</span>
             </div>
             <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Business Card Rendering</span>
             </div>
          </div>
          
          {/* Flip Toggle Button */}
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 group/flip"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isFlipped ? 'rotate-180' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Flip Card</span>
          </button>
        </div>

        {/* 3D Model Display Space */}
        <div className="flex-1 w-full relative group/viewer">
          <model-viewer
            ref={modelViewerRef}
            src={`${window.location.origin}/business_card.glb`}
            ios-src={`${window.location.origin}/business_card.glb`}
            alt="3D Immersive Business Card"
            ar={isMobile ? true : undefined}
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            shadow-intensity="1"
            touch-action="pan-y"
            auto-rotate={!isFlipped}
            camera-orbit={`${isFlipped ? '180deg' : '0deg'} 75deg 105%`}
            field-of-view="30deg"
            environment-image="neutral"
            exposure="1.2"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            {/* AR Button (Visible ONLY on Mobile) */}
            {isMobile && (
              <button 
                slot="ar-button" 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
              >
                <Smartphone className="w-5 h-5 text-indigo-600" />
                Experience AR Session
              </button>
            )}

            {/* Desktop Quick Scan Badge */}
            {!isMobile && (
                <div onClick={() => setShowQRModal(true)} className="absolute top-6 right-6 cursor-pointer opacity-0 group-hover/viewer:opacity-100 transition-opacity duration-300">
                    <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1">
                        <QRCodeSVG value={window.location.href.replace('localhost', '10.92.117.21')} size={50} />
                        <span className="text-[7px] font-black uppercase text-slate-500">Scan for AR</span>
                    </div>
                </div>
            )}
          </model-viewer>
        </div>

        {/* Bottom Action Footer */}
        {!isMobile && (
          <div className="p-8 bg-slate-950 border-t border-white/10 flex flex-col items-center gap-4">
             <button 
                onClick={() => setShowQRModal(true)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
             >
                <Smartphone className="w-4 h-4" />
                Launch Augmented Reality
             </button>
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center px-6 leading-relaxed">
                Aim your phone camera at the screen to start the AR session.
             </p>
          </div>
        )}
      </div>

      {/* Desktop QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[3rem] p-12 flex flex-col items-center relative shadow-[0_0_80px_rgba(79,70,229,0.3)] text-center"
            >
              <button onClick={() => setShowQRModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <div className="bg-slate-50 p-8 rounded-3xl mb-8 shadow-inner border border-slate-100 relative group/icon">
                 <div className="absolute -top-4 -right-4 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                 </div>
                <QRCodeSVG value={window.location.href.replace('localhost', '10.92.117.21')} size={180} level="H" />
              </div>
              
              <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">AR Card Experience</h4>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[1px] leading-relaxed mb-8">
                Project this high-fidelity business card directly into your world using Augmented Reality.
              </p>
              
              <div className="mt-2 flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-bold text-[10px] uppercase tracking-wider">
                 <Info className="w-4 h-4" />
                 Supports Safari & Chrome on Mobile
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARCardViewer;
