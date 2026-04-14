import React, { useState, useEffect } from 'react';

import {
  User, Briefcase, Building2, Phone, Mail, Globe,
  MapPin, Link2, MessageCircle, Share2, Upload, X, Palette, LayoutTemplate, Sparkles, Wand2, Cloud, Trash2
} from 'lucide-react';
import { PRESETS, TEMPLATES, FONTS } from '../App';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import SmartImport from './SmartImport';

// Custom Hook for Debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Global Gemini Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Helper function to provide smart offline taglines if API fails or quota exceeds
const fallbackMockGenerator = (titleStr) => {
  const titleLower = titleStr.toLowerCase();
  if (titleLower.includes('java')) {
    return ["Architecting Scalable Solutions", "Backend Excellence", "Mastering Java Ecosystem"];
  } else if (titleLower.includes('react') || titleLower.includes('frontend')) {
    return ["Crafting Interactive UI", "React Ecosystem Expert", "Pixel-Perfect Experiences"];
  } else if (titleLower.includes('design') || titleLower.includes('creative')) {
    return ["Designing Digital Empathy", "Where Creativity Meets Logic", "Crafting Visual Excellence"];
  } else {
    return ["Leading Digital Growth", "Transforming Ideas to Reality", "Innovate and Elevate"];
  }
};

// Real API Fetch Logic using Gemini
const fetchTaglines = async (jobTitle) => {
  const t = (jobTitle || '').trim();
  if (t.length < 2) return [];

  if (!genAI) {
    console.warn("No VITE_GEMINI_API_KEY provided in .env. Using mock data.");
    return new Promise((resolve) => setTimeout(() => resolve(fallbackMockGenerator(t)), 800));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Act as an expert brand strategist. Generate exactly 3 short, punchy, and highly professional personal taglines or catchphrases (maximum 5 words each) for someone whose job title is "${t}". Return ONLY the three taglines separated by a pipe character (|) without numbering or quotation marks.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the output
    const suggestions = text.split('|').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    return suggestions.length >= 3 ? suggestions.slice(0, 3) : fallbackMockGenerator(t);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    
    // Check if Rate Limit / Quota Exceeded (429)
    if (error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('quota')))) {
       const mockTags = fallbackMockGenerator(t);
       return [`⚠️ Rate Limited (${mockTags[0]})`, mockTags[1], mockTags[2]];
    }
    
    return fallbackMockGenerator(t);
  }
};

const InputField = ({ label, icon: Icon, name, value, onChange, placeholder, type = 'text', focusColor, rightElement, bottomElement }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="space-y-1.5 relative">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        <Icon className="w-3 h-3 shrink-0" strokeWidth={2.5} />
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`input-field w-full ${rightElement ? 'pr-[100px]' : ''}`}
          style={{ 
            borderColor: isFocused ? focusColor : '', 
            boxShadow: isFocused ? `0 0 0 3px ${focusColor}33` : '' 
          }}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {bottomElement && (
        <div className="mt-1">
          {bottomElement}
        </div>
      )}
    </div>
  );
};

const ColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-slate-200">
    <span className="text-xs font-bold text-slate-600 pl-1 uppercase tracking-wider">{label}</span>
    <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-200">
      <input 
        type="color" 
        value={value} 
        onChange={onChange} 
        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
      />
    </div>
  </div>
);

const Section = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-3 mt-4 mb-2">
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{title}</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

const Sidebar = ({ formData, setFormData, onLogoUpload, logoUrl, setLogoUrl, designParams, applyPreset, updateDesignColor, setTemplate, savedCards, onDeleteCard, showModal, closeModal, showToast, isSynced, toggleSync, onShare }) => {

  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  // Debounced job title
  const debouncedJobTitle = useDebounce(formData.title, 500);

  // Real-time AI Suggestions effect
  useEffect(() => {
    const trimmedTitle = (debouncedJobTitle || '').trim();
    if (trimmedTitle.length > 2) {
      setIsFetching(true);
      setShowSparkle(true);
      setLiveSuggestions([]); // Clear previous suggestions
      
      fetchTaglines(trimmedTitle).then((suggestions) => {
        setLiveSuggestions(suggestions);
        setIsFetching(false);
        // Pulse sparkle briefly on success
        setTimeout(() => setShowSparkle(false), 2000);
      });
    } else {
      // Hide completely if field is empty or almost empty
      setLiveSuggestions([]);
      setIsFetching(false);
      setShowSparkle(false);
    }
  }, [debouncedJobTitle]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectTagline = (tagline) => {
    setFormData(prev => ({ ...prev, tagline }));
  };

  const loadCard = (card) => {
    showModal(
      'Load Design',
      'Are you sure you want to load this design? Your current unsaved changes will be replaced.',
      <>
        <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
        <button onClick={() => {
          setFormData(card.formData);
          if (card.logoUrl) setLogoUrl(card.logoUrl);
          if (card.designParams) {
            applyPreset('midnight'); 
            Object.entries(card.designParams).forEach(([key, val]) => {
              if (key === 'template') setTemplate(val);
              else updateDesignColor(key, val);
            });
          }
          closeModal();
          showToast('Design loaded successfully', 'success');
        }} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Load Design</button>
      </>
    );
  };

  const deleteCard = (id, e) => {
    e.stopPropagation(); 
    showModal(
      'Delete Design',
      'Are you sure you want to delete this design permanently from the cloud? This action cannot be undone.',
      <>
        <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
        <button onClick={async () => {
          try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
              onDeleteCard(id); 
              closeModal();
              showToast('Design deleted permanently', 'success');
            }
          } catch (err) {
            console.error("Delete card error:", err);
            showToast('Failed to delete card', 'error');
          }
        }} className="px-4 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md transition-all font-sans">Delete Forever</button>
      </>
    );
  };

  const isValidTitlePresent = (formData.title || '').trim().length > 2;

  return (
    <aside className="w-full lg:w-[380px] h-auto lg:h-full flex flex-col glass border-r shadow-xl shrink-0 relative z-10" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100/80">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" strokeWidth={2.5} style={{ color: designParams.accentColor }} />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Customize Card</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-8 pt-2">

        {/* ── TEMPLATES ── */}
        <Section title="Layout Template" icon={LayoutTemplate} />
        <div className="grid grid-cols-2 gap-2">
          {Object.values(TEMPLATES).map(tpl => (
            <button
              key={tpl.id}
              onClick={() => setTemplate(tpl.id)}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 border flex items-center justify-center gap-1.5 ${
                designParams.template === tpl.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
              style={designParams.template === tpl.id ? { background: designParams.accentColor, borderColor: designParams.accentColor } : {}}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              {tpl.name}
            </button>
          ))}
        </div>


        {/* ── FONT SELECTION ── */}
        <Section title="Typography" />
        <div className="grid grid-cols-2 gap-2">
          {Object.values(FONTS).map(font => (
            <button
              key={font.family}
              onClick={() => updateDesignColor('fontFamily', font.family)}
              className={`py-2 px-3 text-[10px] font-bold rounded-xl transition-all duration-200 border text-center ${
                designParams.fontFamily === font.family
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
              style={{ 
                fontFamily: font.family,
                ...(designParams.fontFamily === font.family ? { background: designParams.accentColor, borderColor: designParams.accentColor } : {})
              }}
            >
              {font.name}
            </button>
          ))}
        </div>


        {/* ── LOGO ── */}
        <div className="flex items-center justify-between mb-0 mt-3 px-0.5">
          <Section title="Company Logo" icon={Upload} className="!mb-0" />
          <button 
            onClick={toggleSync}
            disabled={!logoUrl}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
              isSynced 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 pl-3 pr-4' 
                : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 opacity-60 hover:opacity-100 hover:shadow-sm'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Sparkles className={`w-3 h-3 ${isSynced ? 'animate-pulse' : ''}`} />
            <span className="leading-none mb-0.5">{isSynced ? 'AI Branding ON' : 'Sync Logo AI'}</span>
          </button>
        </div>
        {logoUrl ? (
          <div className="relative group rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 h-24 flex items-center justify-center mt-2">
            <img src={logoUrl} alt="Logo" className="max-h-20 max-w-full w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
            <button 
              onClick={() => setLogoUrl(null)} 
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-slate-500 shadow transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer group mt-2">
            <div className="p-2 rounded-xl transition-transform duration-200 group-hover:scale-110" style={{ background: `${designParams.accentColor}20`, color: designParams.accentColor }}>
              <Upload className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Click to upload logo</p>
            <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
          </label>
        )}

        <SmartImport setFormData={setFormData} showToast={showToast} />



        {/* ── PERSONAL INFO ── */}
        <Section title="Personal Info" />
        <div className="space-y-4">
          <InputField 
            label="Full Name"
            icon={User}
            name="name"
            value={formData.name}
            onChange={handleChange}
                        placeholder="John Doe"
            focusColor={designParams.accentColor} 
          />
          <InputField 
            label="Job Title"
            icon={Briefcase}
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Solutions Architect"
            focusColor={designParams.accentColor} 
          />
          <InputField label="Company" icon={Building2} name="company" value={formData.company} onChange={handleChange} placeholder="TechNova Inc." focusColor={designParams.accentColor} />
          

          
          {/* Smart AI Tagline Field with Framer Motion UI */}
          <InputField 
            label="Tagline / Bio"
            icon={Sparkles} 
            name="tagline" 
            value={formData.tagline} 
            onChange={handleChange} 
            placeholder="Innovating the future..." 
            focusColor={designParams.accentColor} 
            rightElement={
              isValidTitlePresent && (isFetching || liveSuggestions.length > 0) && (
                <div title="AI Active" className={`flex items-center gap-1.5 text-indigo-500 transition-all duration-500 ${showSparkle || isFetching ? 'opacity-100 scale-105' : 'opacity-60'}`}>
                  {isFetching && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 0.8, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden pr-0.5"
                    >
                      AI is thinking...
                    </motion.span>
                  )}
                  <Wand2 className={`w-4 h-4 shrink-0 ${isFetching ? 'animate-bounce' : ''}`} />
                </div>
              )
            }
            bottomElement={
              <AnimatePresence mode="wait">
                {isValidTitlePresent && isFetching && (
                  <motion.div
                    key="fetching"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-2 py-2"
                  >
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Generating AI Taglines...</span>
                  </motion.div>
                )}
                
                {isValidTitlePresent && !isFetching && liveSuggestions.length > 0 && (
                  <motion.div 
                    key="suggestions"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0, height: 0, transition: { duration: 0.2 } },
                      visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.1 } }
                    }}
                    className="flex flex-wrap gap-1.5 mt-2"
                  >
                    {liveSuggestions.map((sug, idx) => (
                      <motion.button
                        key={`${sug}-${idx}`}
                        variants={{
                          hidden: { opacity: 0, y: 10, scale: 0.95 },
                          visible: { opacity: 1, y: 0, scale: 1 }
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectTagline(sug)}
                        className="px-2.5 py-1.5 bg-indigo-50/90 border border-indigo-200/50 hover:bg-indigo-100/90 text-indigo-700 text-[10px] font-semibold tracking-wide rounded-lg shadow-sm"
                      >
                        {sug}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />
        </div>

        {/* ── CONTACT ── */}
        <Section title="Contact Details" />
        <div className="space-y-3">
          <InputField label="Phone" icon={Phone}  name="phone"    value={formData.phone}    onChange={handleChange} placeholder="+91 98765 43210"    type="tel" focusColor={designParams.accentColor} />
          <InputField label="Email" icon={Mail}   name="email"    value={formData.email}    onChange={handleChange} placeholder="john@example.com"   type="email" focusColor={designParams.accentColor} />
          <InputField label="Website" icon={Globe}  name="website"  value={formData.website}  onChange={handleChange} placeholder="www.example.com" focusColor={designParams.accentColor} />
          <InputField label="Location" icon={MapPin} name="location" value={formData.location} onChange={handleChange} placeholder="Chennai, India" focusColor={designParams.accentColor} />
        </div>

        {/* ── SOCIAL ── */}
        <Section title="Social Links" />
        <div className="space-y-3 pb-8">
          <InputField label="LinkedIn"    icon={Link2}          name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/username" focusColor={designParams.accentColor} />
          <InputField label="Twitter / X" icon={MessageCircle} name="twitter"  value={formData.twitter}  onChange={handleChange} placeholder="@username" focusColor={designParams.accentColor} />
          <InputField label="Facebook"    icon={Share2}         name="facebook" value={formData.facebook} onChange={handleChange} placeholder="fb.com/username" focusColor={designParams.accentColor} />
        </div>
        {/* ── SAVED DESIGNS ── */}
        {savedCards.length > 0 && (
          <>
            <Section title="Cloud Saved Designs" icon={Cloud} />
            <div className="grid grid-cols-1 gap-2 pb-8">
              {savedCards.map((card, idx) => (
                <div
                  key={card._id || idx}
                  onClick={() => loadCard(card)}
                  className="flex items-center justify-between p-3 bg-white/60 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex flex-col items-start overflow-hidden pr-2">
                    <span className="text-[11px] font-black text-slate-800 truncate w-full">
                      {card.formData.name || 'Unnamed Design'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate w-full">
                      {card.formData.company || 'Personal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onShare(card, 'WhatsApp')}
                      title="Share via WhatsApp"
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    <button 
                       onClick={(e) => deleteCard(card._id, e)}
                       title="Delete Forever"
                       className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all shadow-sm shrink-0 opacity-80"
                    >
                       <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
