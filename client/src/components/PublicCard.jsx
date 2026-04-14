import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BusinessCard from './BusinessCard';
import { motion } from 'framer-motion';
import { Download, Phone, Mail, Globe, Share2, CornerUpRight, SmartphoneNfc } from 'lucide-react';

const PublicCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // 1. Fetch Card Data
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/cards/${id}`);
        const data = await response.json();
        if (data.success) {
          setCardData(data.card);
        } else {
          setError('Card not found');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [id]);

  // 2. Responsive Scaling Logic
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / 540);
        setScale(newScale);
      }
    };

    if (!loading && cardData) {
       updateScale();
       window.addEventListener('resize', updateScale);
       return () => window.removeEventListener('resize', updateScale);
    }
  }, [loading, cardData]);

  const handleSaveContact = () => {
    if (!cardData) return;
    const { formData } = cardData;
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${formData.name || ''}`,
      `ORG:${formData.company || ''}`,
      `TITLE:${formData.title || ''}`,
      `TEL;TYPE=WORK,VOICE:${formData.phone || ''}`,
      `EMAIL;TYPE=WORK,INTERNET:${formData.email || ''}`,
      `URL:${formData.website || ''}`,
      `ADR;TYPE=WORK:;;${formData.location || ''}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${formData.name || 'Contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Digital Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <Share2 className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Card Not Found</h1>
          <p className="text-slate-400 max-w-xs mx-auto">This digital business card might have expired or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  const { formData, designParams, logoUrl } = cardData;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <SmartphoneNfc className="w-3 h-3" />
            V-Card Microsite
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">{formData.name}</h1>
          <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">{formData.title}</p>
        </motion.div>

        <div className="text-center mb-6">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-bounce">Click card to Flip</p>
        </div>

        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full relative mb-12 perspective-3000 flex justify-center"
          style={{ height: `${300 * scale}px` }}
        >
           <div 
             className="cursor-pointer transition-all duration-300 relative"
             style={{ 
               width: '540px', 
               height: '300px', 
               transform: `scale(${scale})`,
               transformOrigin: 'top center'
             }}
             onClick={() => setIsFlipped(!isFlipped)}
           >
              <BusinessCard 
                formData={formData}
                designParams={designParams}
                logoUrl={logoUrl}
                isFlipped={isFlipped}
                isBatchExport={false}
              />
           </div>
        </motion.div>

        {/* Action Buttons - Using plain <a> tags for native mobile behavior */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
           <button 
             onClick={handleSaveContact}
             className="col-span-2 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all"
           >
             <Download className="w-5 h-5" />
             Save to Contacts
           </button>
           
           <a 
             href={`tel:${formData.phone}`}
             className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 rounded-2xl flex flex-col items-center gap-2 transition-all"
           >
             <Phone className="w-6 h-6 text-indigo-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">Call</span>
           </a>

           <a 
             href={`mailto:${formData.email}`}
             className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 rounded-2xl flex flex-col items-center gap-2 transition-all"
           >
             <Mail className="w-6 h-6 text-indigo-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
           </a>
        </div>

        <div className="w-full space-y-3">
           {[
             { icon: Globe, label: 'Website', value: formData.website, href: formData.website },
             { icon: Share2, label: 'LinkedIn', value: 'Professional Profile', href: formData.linkedin },
           ].filter(l => l.href).map((link, idx) => (
             <motion.a
               key={idx}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 + (idx * 0.1) }}
               href={link.href.startsWith('http') ? link.href : `https://${link.href}`}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full p-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center gap-4 group transition-all"
             >
               <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <link.icon className="w-5 h-5" />
               </div>
               <div className="flex-1 text-left min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{link.label}</p>
                  <p className="font-bold text-sm truncate mr-2">{link.value}</p>
               </div>
               <CornerUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all" />
             </motion.a>
           ))}
        </div>

        <div className="mt-20 text-center opacity-30 select-none">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Generated by GEC Designs</p>
        </div>
      </div>
    </div>
  );
};

export default PublicCard;
