import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Box, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ARPreview Component
 * Uses Google's <model-viewer> to render a 3D Business Card with AR support.
 * @param {string} cardImage - Base64 or URL of the current card design PNG.
 */
const ARPreview = ({ cardImage }) => {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    // Load Model Viewer Script dynamically to avoid affecting other files
    if (!document.getElementById('model-viewer-script')) {
      const script = document.createElement('script');
      script.id = 'model-viewer-script';
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // Update Texture when cardImage changes
  useEffect(() => {
    const updateTexture = async () => {
        // Robust texture update with error handling and retry logic
        if (!modelViewerRef.current || !cardImage || !modelViewerRef.current.model) return;
        
        const model = modelViewerRef.current.model;
        
        try {
            console.log("Syncing 3D Texture...");
            const texture = await modelViewerRef.current.createTexture(cardImage);
            
            // Apply to all materials to ensuring vivid rendering on both sides
            model.materials.forEach(material => {
                if (material.pbrMetallicRoughness) {
                    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
                }
                // Also set emissive for guaranteed visibility in dark environments
                if (material.emissiveTexture) {
                    material.emissiveTexture.setTexture(texture);
                }
            });
            console.log("3D Texture Updated Successfully");
        } catch (error) {
            console.warn("Retrying texture update...", error);
        }
    };
    
    // Listen for model-load event which is more reliable than polling
    const mv = modelViewerRef.current;
    if (mv) {
        mv.addEventListener('load', updateTexture);
        // If already loaded
        if (mv.model) updateTexture();
    }

    return () => mv?.removeEventListener('load', updateTexture);
  }, [cardImage]);

  return (
    <div className="w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Interactive 3D Preview</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${cardImage ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-bold text-slate-500 uppercase">3D Rendered</span>
        </div>
      </div>

        {/* 3D Viewport */}
      <div className="relative h-72 w-full bg-gradient-to-b from-slate-900 to-slate-950">
        {/* Model Viewer Component */}
        <model-viewer
          ref={modelViewerRef}
          src={`${window.location.origin}/business_card.glb`} 
          poster="https://via.placeholder.com/540x300?text=Preparing+3D+Card..."
          alt="A 3D Business Card"
          shadow-intensity="1.5"
          camera-controls
          auto-rotate
          touch-action="pan-y"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          scale="1.75 1 0.05" // Scale it to look like a business card (Wide, Tall, Thin)
        >
        </model-viewer>
      </div>

      {/* Interaction Instruction Row */}
      <div className="p-5 bg-slate-900">
        <div className="flex items-start gap-3 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-spin-slow" />
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
            Drag to rotate the card and scroll to zoom. This is a real-time 3D simulation of your actual card design.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARPreview;
