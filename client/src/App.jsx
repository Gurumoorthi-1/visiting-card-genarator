import React, { useState, useCallback, useEffect } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LivePreview from './components/LivePreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toPng, toJpeg } from 'html-to-image';
import { Layers, Smartphone, CheckCircle, AlertCircle, X, Info, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import BatchUploader from './components/BatchUploader';
import { extractColorsFromLogo } from './utils/colorUtils';
import { useBranding } from './hooks/useBranding';
import PublicCard from './components/PublicCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialData = {
  name: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  location: '',
  linkedin: '',
  twitter: '',
  facebook: '',
  tagline: ''
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
      type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : 
      'bg-slate-800/90 border-slate-700 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
     type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
     <Info className="w-5 h-5" />}
    <span className="text-sm font-bold tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const Modal = ({ isOpen, onClose, title, children, footer }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="text-sm text-slate-500 font-medium leading-relaxed">
              {children}
            </div>
          </div>
          {footer && (
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const FONTS = {
  inter: { name: 'Inter', family: "'Inter', sans-serif" },
  outfit: { name: 'Outfit', family: "'Outfit', sans-serif" },
  roboto: { name: 'Roboto', family: "'Roboto', sans-serif" },
  opensans: { name: 'Open Sans', family: "'Open Sans', sans-serif" },
  montserrat: { name: 'Montserrat', family: "'Montserrat', sans-serif" },
};

// Base themes used as presets
export const PRESETS = {
  wavePro: {
    name: 'Wave Pro', emoji: '🌊',
    bgPrimary: '#073a6e', bgSecondary: '#1c60a3',
    textPrimary: '#ffffff', textSecondary: '#e0f2fe',
    accentColor: '#5ba5e0',
    fontFamily: FONTS.montserrat.family
  },
  midnight: {
    name: 'Midnight', emoji: '🌌',
    bgPrimary: '#0f172a', bgSecondary: '#1e1b4b',
    textPrimary: '#ffffff', textSecondary: '#7dd3fc',
    accentColor: '#38bdf8',
    fontFamily: FONTS.outfit.family
  },
  violet: {
    name: 'Violet', emoji: '💜',
    bgPrimary: '#2e1065', bgSecondary: '#17062e',
    textPrimary: '#ffffff', textSecondary: '#c4b5fd',
    accentColor: '#a78bfa',
    fontFamily: FONTS.inter.family
  },
  rose: {
    name: 'Rose', emoji: '🌹',
    bgPrimary: '#4c0519', bgSecondary: '#2a0210',
    textPrimary: '#ffffff', textSecondary: '#fda4af',
    accentColor: '#fb7185',
    fontFamily: FONTS.montserrat.family
  },
  gold: {
    name: 'Gold', emoji: '✨',
    bgPrimary: '#451a03', bgSecondary: '#1c0a00',
    textPrimary: '#ffffff', textSecondary: '#fde68a',
    accentColor: '#fbbf24',
    fontFamily: FONTS.opensans.family
  },
  emerald: {
    name: 'Emerald', emoji: '🌿',
    bgPrimary: '#022c22', bgSecondary: '#01120e',
    textPrimary: '#ffffff', textSecondary: '#6ee7b7',
    accentColor: '#34d399',
    fontFamily: FONTS.roboto.family
  },
  arctic: {
    name: 'Arctic', emoji: '🏔️',
    bgPrimary: '#f8fafc', bgSecondary: '#e2e8f0',
    textPrimary: '#0f172a', textSecondary: '#334155',
    accentColor: '#475569',
    fontFamily: FONTS.inter.family
  },
};

export const TEMPLATES = {
  modern: { name: 'Modern', id: 'modern' },
  classic: { name: 'Classic', id: 'classic' },
  creative: { name: 'Creative', id: 'creative' },
  minimal: { name: 'Minimal', id: 'minimal' },
  corporate: { name: 'Corporate', id: 'corporate' },
  golden: { name: 'Golden Smart', id: 'golden' },
  vanguard: { name: ' Vanguard Pro', id: 'vanguard' },
  wave: { name: 'Wave Pro', id: 'wave' },
  elegant: { name: 'Elegant Pro', id: 'elegant' },
  studio: { name: 'Studio Pro', id: 'studio' },
  skyline: { name: 'Skyline Pro', id: 'skyline' },
  swift: { name: 'Swift Pro', id: 'swift' },
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/card/:id" element={<PublicCard />} />
      </Routes>
    </Router>
  );
}

function Editor() {

  // ── INITIAL LOAD FROM LOCALSTORAGE ──
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('card_form_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('card_logo_url') || null;
  });

  const [designParams, setDesignParams] = useState(() => {
    const saved = localStorage.getItem('card_design_params');
    return saved ? JSON.parse(saved) : {
      template: 'modern',
      ...PRESETS.wavePro,
      fontFamily: FONTS.montserrat.family
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'batch'
  const [mobileTab, setMobileTab] = useState('preview'); // 'edit' | 'preview'
  const [savedCards, setSavedCards] = useState([]);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', content: '', footer: null });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const showModal = (title, content, footer) => {
    setModal({ isOpen: true, title, content, footer });
  };

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // AI BRANDING HOOK
  const { isSynced, toggleSync } = useBranding(logoUrl, designParams, setDesignParams, showToast);

  // Fetch saved designs from cloud
  const fetchSavedCards = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards`);
      const data = await res.json();
      if (data.success) setSavedCards(data.cards.slice(0, 5));
    } catch (err) {
      console.error("Fetch saved cards error:", err);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);
  
  // ── PERSISTENCE EFFECTS ──
  useEffect(() => {
    localStorage.setItem('card_form_data', JSON.stringify(formData));
  }, [formData]);

  // Force update to Wave Pro if user has the old midnight default
  useEffect(() => {
    if (designParams.bgPrimary === '#0f172a') {
      setDesignParams(prev => ({
        ...prev,
        ...PRESETS.wavePro,
        fontFamily: FONTS.montserrat.family
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('card_design_params', JSON.stringify(designParams));
  }, [designParams]);

  useEffect(() => {
    if (logoUrl) {
      try {
        localStorage.setItem('card_logo_url', logoUrl);
      } catch (e) {
        console.warn("Logo too large for localStorage, clearing cache.");
        localStorage.removeItem('card_logo_url');
      }
    } else {
      localStorage.removeItem('card_logo_url');
    }
  }, [logoUrl]);



  const handleReset = () => {
    showModal(
      'Reset Design',
      'Are you sure you want to clear all fields? This will delete your current unsaved design from local cache.',
      <>
        <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
        <button onClick={() => {
           setFormData({ name: '', title: '', company: '', phone: '', email: '', website: '', location: '', tagline: '', linkedin: '', twitter: '', facebook: '' });
           setLogoUrl(null);
           localStorage.clear();
           closeModal();
           showToast('Design reset successfully', 'info');
        }} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all">Reset All</button>
      </>
    );
  };

  const generateCanvas = async () => {
    const captureArea = document.getElementById('capture-area');
    const isFlipped = captureArea?.dataset.flipped === 'true';
    const targetId = isFlipped ? 'card-back' : 'card-front';
    const el = document.getElementById(targetId);
    
    if (!el) return null;

    // Save original styles to restore after capture
    const originalTransform = el.style.transform;
    const originalBackface = el.style.backfaceVisibility;
    const originalOpacity = el.style.opacity;

    // Force visibility and reset transforms for capture
    el.style.transform = 'none';
    el.style.backfaceVisibility = 'visible';
    el.style.opacity = '1';

    try {
      // Switched to JPEG at 1.5x for maximum compatibility with desktop share intents (like Outlook)
      const dataUrl = await toJpeg(el, {
        pixelRatio: 1.5,
        cacheBust: true,
        width: 540,
        height: 300,
        backgroundColor: '#ffffff', // JPEG needs solid background
        style: {
          transform: 'none',
          backfaceVisibility: 'visible',
          opacity: '1',
          left: '0',
          top: '0',
          margin: '0'
        }
      });
      
      // Restore original state
      el.style.transform = originalTransform;
      el.style.backfaceVisibility = originalBackface;
      el.style.opacity = originalOpacity;
      
      return dataUrl;
    } catch (err) {
      console.error('Capture failed', err);
      el.style.transform = originalTransform;
      el.style.backfaceVisibility = originalBackface;
      el.style.opacity = originalOpacity;
      return null;
    }
  };
 
  const handleShare = async (cardData = null) => {
    setIsGenerating(true);
    try {
      // 1. TRY to save to cloud (don't block share if this fails)
      let micrositeUrl = null;
      try {
        const saveRes = await fetch(`${API_BASE_URL}/api/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            formData: cardData?.formData || formData, 
            designParams: cardData?.designParams || designParams, 
            logoUrl: cardData?.logoUrl || logoUrl 
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.success) {
          micrositeUrl = `${window.location.origin}/card/${saveData.card._id}`;
          if (!cardData) fetchSavedCards();
        }
      } catch (saveErr) {
        console.warn('Cloud save skipped:', saveErr.message);
      }

      // 2. GENERATE THE IMAGE
      const dataUrl = await generateCanvas();
      if (!dataUrl) {
        showToast('Could not capture card image', 'error');
        return;
      }

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'BusinessCard.jpg', { type: 'image/jpeg' });

      const shareTitle = `Digital Card: ${formData.name || 'Professional Profile'}`;
      const shareText = micrositeUrl 
        ? `Check out my Digital Business Card: ${micrositeUrl}` 
        : 'Check out my Business Card!';

      const shareData = {
        title: shareTitle,
        text: shareText,
        url: micrositeUrl || window.location.origin
      };

      // 3. SHARE - Robust implementation for Mobile
      if (navigator.share) {
        try {
          // Attempt 1: Try sharing as a file (if supported)
          const canShareFile = navigator.canShare && navigator.canShare({ files: [file] });
          if (canShareFile) {
            try {
              await navigator.share({ ...shareData, files: [file] });
              showToast('Shared successfully!', 'success');
              return;
            } catch (fErr) {
              console.warn('File share failed, trying text...', fErr);
            }
          }

          // Attempt 2: Try sharing text/link only (more widely supported)
          await navigator.share(shareData);
          showToast('Shared successfully!', 'success');
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
          
          // Attempt 3: WhatsApp direct fallback
          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
          window.open(whatsappUrl, '_blank');
          showToast('Opening WhatsApp share...', 'success');
        }
      } else {
        // Desktop / No Share API - WhatsApp Fallback + Download
        try {
          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
          window.open(whatsappUrl, '_blank');
          showToast('Opening WhatsApp share...', 'success');
        } catch {
          // Final fallback: copy link
          try {
            await navigator.clipboard.writeText(shareText);
            showToast('Link copied to clipboard!', 'success');
          } catch {
            showToast('Ready to share!', 'success');
          }
        }
        
        // Also download image as it's the primary export
        const a = document.createElement('a');
        a.download = 'BusinessCard.jpg';
        a.href = dataUrl;
        a.click();
      }
    } catch (err) {
      console.error('Share failed:', err);
      showToast('Share failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateCanvas();
      if (!dataUrl) return;
      const a = document.createElement('a');
      a.download = `BusinessCard-${formData.name || 'Export'}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const imgData = await generateCanvas();
      if (!imgData) return;
      
      // Standard business card dimensions: 3.5 x 2 inches
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [3.5, 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 3.5, 2);
      pdf.save(`BusinessCard-${formData.name || 'Export'}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const onLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (presetKey) => {
    setDesignParams(prev => ({
      ...prev,
      ...PRESETS[presetKey]
    }));
  };

  const updateDesignColor = (key, value) => {
    setDesignParams(prev => ({ ...prev, [key]: value }));
  };

  const setTemplate = (tplId) => {
    setDesignParams(prev => ({ ...prev, template: tplId }));
  };

  const handleSaveToDB = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          designParams,
          logoUrl,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast('Card saved to Cloud!', 'success');
        fetchSavedCards(); // Instant refresh after save
      } else {
        showToast('Save failed: ' + data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Connection error. Is server running?', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden gradient-bg relative" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#0f172a' }}>
      <Header 
        onReset={handleReset} 
        onDownloadPNG={handleDownloadPNG} 
        onDownloadPDF={handleDownloadPDF} 
        onSave={handleSaveToDB}
        accentColor={designParams.accentColor} 
        isGenerating={isGenerating} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* VIEW MODE TOGGLE */}
        <div className="flex justify-center shrink-0 border-b border-white/20 bg-white/10 backdrop-blur-md z-20 shadow-sm relative">
          <div className="flex p-1.5 gap-1">
            <button 
              onClick={() => setViewMode('single')} 
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${viewMode === 'single' ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:bg-white/50'}`}
            >
              Single Card Maker
            </button>
            <button 
              onClick={() => setViewMode('batch')} 
              className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${viewMode === 'batch' ? 'bg-indigo-500 shadow-md text-white' : 'text-slate-500 hover:bg-white/50'}`}
            >
              Batch Generate (CSV)
            </button>
          </div>
        </div>

        {/* SINGLE CARD VIEW - always mounted to preserve state */}
        <div className={`flex-1 flex flex-col relative overflow-hidden bg-slate-50/50 ${viewMode === 'single' ? 'flex' : 'hidden'}`}>
            {/* MOBILE TAB NAVIGATION (Visible only on mobile) */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 shadow-sm z-30">
               <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                  <button 
                    onClick={() => setMobileTab('edit')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${mobileTab === 'edit' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Edit Design
                  </button>
                  <button 
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${mobileTab === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Preview Card
                  </button>
               </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative custom-scrollbar">
              {/* LIVE PREVIEW CONTAINER */}
              <div className={`lg:order-2 flex-1 lg:h-full overflow-y-auto custom-scrollbar ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
                 <div className="px-2 py-4 sm:p-6 lg:p-10">
                    <LivePreview 
                      formData={formData} 
                      logoUrl={logoUrl} 
                      designParams={designParams} 
                      onGenerateAR={generateCanvas}
                    />
                 </div>
              </div>

              {/* SIDEBAR CONTAINER */}
              <div className={`lg:order-1 lg:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-r border-slate-200 bg-white lg:bg-transparent ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
                 <Sidebar 
          formData={formData} 
          setFormData={setFormData}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          onLogoUpload={onLogoUpload}
          designParams={designParams}
          applyPreset={applyPreset}
          updateDesignColor={updateDesignColor}
          setTemplate={setTemplate}
          savedCards={savedCards}
          onDeleteCard={(id) => setSavedCards(prev => prev.filter(c => c._id !== id))}
          showModal={showModal}
          closeModal={closeModal}
          showToast={showToast}
          isSynced={isSynced}
          toggleSync={toggleSync}
          onShare={handleShare}
        />
              </div>
            </div>
          </div>

        {/* BATCH GENERATE VIEW - always mounted to preserve CSV state */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar ${viewMode === 'batch' ? 'block' : 'hidden'}`}>
          <BatchUploader logoUrl={logoUrl} setLogoUrl={setLogoUrl} designParams={designParams} />
        </div>

      </main>

      {/* Toast Notification */}
      {isGenerating && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="font-semibold text-sm tracking-wide">Generating High-Quality Print File...</span>
        </div>
      )}
      {/* PREMIUM FEEDBACK UI */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title}
        footer={modal.footer}
      >
        {modal.content}
      </Modal>
    </div>
  );
}

export default App;
