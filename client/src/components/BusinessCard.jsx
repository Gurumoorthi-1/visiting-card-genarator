import React from 'react';

import { Phone, Mail, Globe, MapPin, Link2, MessageCircle, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SmartTextField from './SmartTextField';

const escapeVCardText = (text) => {
  if (!text) return '';
  // Escape special characters to ensure robust scanning and vCard 3.0 compliance
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/&/g, 'and');
};

const generateOptimizedVCard = (data) => {
  return `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCardText(data.name)}
ORG:${escapeVCardText(data.company)}
TITLE:${escapeVCardText(data.title)}
TEL;TYPE=WORK,VOICE:${escapeVCardText(data.phone)}
EMAIL;TYPE=WORK,INTERNET:${escapeVCardText(data.email)}
URL:${escapeVCardText(data.website)}
NOTE:${escapeVCardText(data.tagline)}
END:VCARD`;
};

const getSmartLayout = (nameStr) => {
  const len = nameStr ? nameStr.trim().length : 0;
  // Smart Layout Refiner Logic
  if (len === 0) {
    return { nameTracking: 'tracking-normal', logoScaleClass: 'scale-100' };
  } else if (len <= 12) {
    // Short names: Expand letter spacing to fill horizontal space, scale up logo for balance
    return { nameTracking: 'tracking-widest', logoScaleClass: 'scale-110' };
  } else if (len > 22) {
    // Long names: Compress letter spacing, scale down logo slightly so the card isn't 'crowded'
    return { nameTracking: 'tracking-tighter', logoScaleClass: 'scale-90 opacity-90' };
  } else {
    // Medium names: Standard spacing and standard logo
    return { nameTracking: 'tracking-tight', logoScaleClass: 'scale-100' };
  }
};

const BusinessCard = ({ formData, logoUrl, designParams, isFlipped, isBatchExport = false }) => {

  const { name, title, company, phone, email, website, location, linkedin, twitter, facebook, tagline } = formData;

  let { template, bgPrimary, bgSecondary, textPrimary, textSecondary, accentColor, fontFamily } = designParams;

  const isElegant = template === 'elegant';
  const isStudio = template === 'studio';
  const isVanguard = template === 'vanguard';
  
  if (isElegant) {
    bgPrimary = '#fafafa';
    bgSecondary = '#f0f0f0';
    textPrimary = '#1f223a';
    textSecondary = '#5a5b65';
    accentColor = '#cf9e38';
  } else if (isStudio) {
    bgPrimary = '#161618'; 
    bgSecondary = '#1f1f22';
    textPrimary = '#ffffff';
    textSecondary = '#a0a0a5';
    accentColor = '#ffffff';
  } else if (isVanguard) {
    bgPrimary = '#f2f2f2'; 
    bgSecondary = '#e8e8e8';
    textPrimary = '#2b2d42';
    textSecondary = '#4a4e69';
    accentColor = '#1d2d50';
  } else if (template === 'abstract') {
    bgPrimary = '#0f172a';
    bgSecondary = '#1e293b';
    textPrimary = '#ffffff';
    textSecondary = '#94a3b8';
    accentColor = '#3b82f6';
  }

  const initials = formData.name
    ? formData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : company ? company[0].toUpperCase() : 'C';

  const hasSocial = linkedin || twitter || facebook;

  const smartLayout = getSmartLayout(name);

  const qrFgColor = (isElegant || isVanguard) ? textPrimary : (isStudio ? bgPrimary : bgSecondary);


  const commonProps = {
    formData, initials, hasSocial, logoUrl, smartLayout,
    bgPrimary, bgSecondary, textPrimary, textSecondary, accentColor,
    name, title
  };

  const getTemplate = () => {
    switch (template) {
      case 'vanguard': return <VanguardTemplate {...commonProps} />;
      case 'wave': return <WaveTemplate {...commonProps} />;
      case 'elegant': return <ElegantTemplate {...commonProps} />;
      case 'studio': return <StudioTemplate {...commonProps} />;
      case 'skyline': return <SkylineTemplate {...commonProps} />;
      case 'ocean': return <OceanTemplate {...commonProps} />;
      case 'abstract': return <AbstractTemplate {...commonProps} />;
      default: return <VanguardTemplate {...commonProps} />;
    }
  };

  const vCardData = generateOptimizedVCard({
    ...formData,
    name: name || formData.name,
    title: title || formData.title
  });
  const borderRadius = template === 'minimal' ? '4px' : '24px';
  const backgroundStyle = `linear-gradient(135deg, ${bgPrimary}, ${bgSecondary})`;
  const borderStyle = `1px solid ${accentColor}40`;

  return (
    <div id="business-card" className={`relative w-[540px] h-[300px] select-none ${!isBatchExport ? 'group [perspective:1500px]' : ''}`}>
      <div 
        id="card-inner"
        className={`w-full h-full relative shadow-card ${!isBatchExport ? 'transition-transform duration-700 [transform-style:preserve-3d]' : ''}`}
        style={{ transform: !isFlipped && isBatchExport ? 'none' : (!isBatchExport && isFlipped ? 'rotateY(180deg)' : 'none'), borderRadius, fontFamily: fontFamily || "'Outfit', 'Inter', sans-serif" }}
      >
        
        {/* ── FRONT FACE ── */}
        <div 
          id="card-front"
          className={`absolute inset-0 ${!isBatchExport ? '[backface-visibility:hidden]' : ''} overflow-hidden transition-all duration-300`}
          style={{ borderRadius, background: backgroundStyle, border: borderStyle, zIndex: 10 }}
        >
          {getTemplate()}
          
          {/* Inject QR Code firmly on the Front Face - Position varies by template for safety */}
          {isBatchExport && (
            <div className={`absolute ${['wave', 'skyline', 'ocean'].includes(template) ? 'top-3 right-3' : 'bottom-3 right-3'} p-1 bg-white rounded-[6px] shadow-lg border border-slate-100 z-50 flex flex-col items-center gap-0.5`}>
              <QRCodeSVG 
                value={vCardData || "No Data"} 
                size={42} 
                bgColor={"#ffffff"} 
                fgColor={qrFgColor}
                level={"H"}
              />
              <span className="text-[4px] font-black uppercase tracking-widest text-slate-400">Scan</span>
            </div>
          )}
        </div>

        {/* ── BACK FACE (QR CODE) ── */}
        {!isBatchExport && (
          <div 
            id="card-back"
            className="absolute inset-0 [backface-visibility:hidden] overflow-hidden flex items-center justify-center pointer-events-none"
            style={{ transform: 'rotateY(180deg)', borderRadius, background: backgroundStyle, border: borderStyle }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              {logoUrl ? (
                <img src={logoUrl} alt="" className={`w-64 h-64 object-contain grayscale transition-transform duration-500 ${smartLayout.logoScaleClass}`} />
              ) : (
                <span className="text-[200px] font-black leading-none" style={{ color: textPrimary }}>{initials}</span>
              )}
            </div>

            <div className="flex items-center gap-10 z-10 p-10 w-full max-w-[460px]">
              <div className="p-4 bg-white rounded-2xl shadow-xl shrink-0 pointer-events-auto">
                <QRCodeSVG 
                  value={vCardData || "No Data"} 
                  size={140} 
                  bgColor={"#ffffff"} 
                  fgColor={qrFgColor} 
                  level={"H"}
                />
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight" style={{ color: textPrimary }}>
                    Scan to Connect
                  </h3>
                  <div className="h-0.5 w-12 rounded-full" style={{ background: accentColor }} />
                </div>
                <p className="text-xs font-medium leading-relaxed" style={{ color: textSecondary }}>
                  Open your smartphone camera and point it at this QR code to instantly save my contact details to your phone.
                </p>
                
                {tagline && (
                  <div className="pt-2 mt-2 border-t" style={{ borderColor: `${textSecondary}30` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                      {tagline}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};



/* ── PREMIUM PRO TEMPLATES ── */





const VanguardTemplate = ({ name, title, formData, logoUrl, initials, smartLayout }) => {
  const textDark = "#2b2d42";
  const textSecondary = "#4a4e69";
  const bgLight = "#f4f4f4";
  const iconBg = "#2b2d42";
  const outline = "#1d2d50"; 
  const darkDiamond = "#1d2d50";
  const lightDiamond = "#1a80b6";

  const D = ({ cx, cy, type, r = 48 }) => {
    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
    if (type === 'dark') return <polygon points={pts} fill={darkDiamond} />;
    if (type === 'light') return <polygon points={pts} fill={lightDiamond} />;
    if (type === 'outline') return <polygon points={pts} fill="none" stroke={outline} strokeWidth="2.5" opacity="0.8" />;
    return null;
  };

  const contactItems = [
    { icon: Phone, text: formData.phone || "+123-456-7890" },
    { icon: Mail, text: formData.email || "hello@reallygreatsite.com" },
    { icon: Globe, text: formData.website, href: formData.website },
    { icon: MapPin, text: formData.location },
  ];

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden flex shadow-2xl" style={{ backgroundColor: bgLight }}>
      
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-[5]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Geometric Right Pattern (Shifted right to reduce width) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 540 300">
         <g transform="translate(60, 0)">
           {/* FILLS */}
           {/* Col 2 */}
           <D cx={405} cy={105} type="light" />
           <D cx={405} cy={195} type="light" />
           
           {/* Col 3 */}
           <D cx={450} cy={60} type="dark" />
           <D cx={450} cy={240} type="dark" />
           
           {/* Col 4 */}
           <D cx={495} cy={15} type="light" />
           <D cx={495} cy={105} type="dark" />
           <D cx={495} cy={195} type="light" />
           <D cx={495} cy={285} type="dark" />

           {/* Col 5 */}
           <D cx={540} cy={-30} type="dark" />
           <D cx={540} cy={60} type="light" />
           <D cx={540} cy={150} type="dark" />
           <D cx={540} cy={240} type="light" />
           <D cx={540} cy={330} type="dark" />

           {/* Col 6 */}
           <D cx={585} cy={15} type="dark" />
           <D cx={585} cy={105} type="light" />
           <D cx={585} cy={195} type="dark" />
           <D cx={585} cy={285} type="light" />

           {/* OUTLINES */}
           <D cx={360} cy={150} type="outline" />
           <D cx={450} cy={150} type="outline" />
           <D cx={495} cy={285} type="outline" />
           <D cx={540} cy={60} type="outline" />
         </g>
      </svg>

      {/* Content (Reduced padding to ensure all 4 contacts fit in 300px height) */}
      <div className="relative z-10 w-[70%] h-full flex flex-col justify-center px-10 pt-4 pb-2">
         <div className="mb-5 mt-2 relative">
            
            {/* Company Info row */}
            {(logoUrl || formData.company) && (
              <div className="flex items-center gap-4 mb-4">
                {logoUrl && (
                  <div className={`w-[180px] h-auto max-h-[100px] shrink-0 ${smartLayout.logoScaleClass}`}>
                     <img src={logoUrl} className="w-full h-full object-contain object-left drop-shadow-sm origin-left" />
                  </div>
                )}
                {formData.company && (
                  <SmartTextField 
                    text={formData.company} 
                    maxWidth={160} 
                    defaultFontSize={10} 
                    minFontSize={7}
                    maxLines={2}
                    className="font-black tracking-widest uppercase"
                    style={{ color: textDark, fontFamily: "'Inter', sans-serif" }}
                  />
                )}
              </div>
            )}

            <SmartTextField 
              text={name || "Cahaya Dewi"} 
              maxWidth={300} 
              defaultFontSize={32} 
              minFontSize={14}
              maxLines={1}
              className={`font-black tracking-wide leading-tight ${smartLayout.nameTracking}`}
              style={{ color: textDark, fontFamily: "'Inter', sans-serif" }}
            />
            <SmartTextField 
              text={title || "DESIGNER"} 
              maxWidth={300} 
              defaultFontSize={14} 
              minFontSize={8}
              className="font-bold tracking-widest uppercase mt-0.5"
              style={{ color: textDark, opacity: 0.9, fontFamily: "'Inter', sans-serif" }}
            />
         </div>

          <div className="flex flex-col gap-2 -mt-1">
           {contactItems.map((contact, i) => {
              if(!contact.text) return null;
              return (
                <div key={i} className="flex items-center gap-2.5">
                   <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: iconBg }}>
                      <contact.icon strokeWidth={2.5} size={11} color="#f4f4f4" />
                   </div>
                   <SmartTextField 
                     text={contact.text} 
                     maxWidth={260} 
                     defaultFontSize={10} 
                     minFontSize={7}
                     maxLines={1}
                     className="font-semibold tracking-wide"
                     style={{ color: textSecondary }}
                     href={contact.href}
                   />
                </div>
              );
           })}
         </div>
      </div>

    </div>
  );
};

/* ── 10. WAVE (Premium Curve) ── */
const WaveTemplate = ({ name, title, formData, logoUrl, initials, textPrimary, textSecondary, accentColor, bgPrimary, bgSecondary, smartLayout }) => {
  // Corporate Palette
  const waveMainBlue = "#073a6e";
  const waveMedBlue = "#1c60a3";
  const waveLightBlue = "#5ba5e0";
  const waveIconPill = "#0d2645";

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-white shadow-2xl" 
         style={{ borderRadius: '0px' }}> {/* Sharp Edges per request */}
      
      {/* Realistic Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[100]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Background Layer */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Multi-Layered Curve Bands */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none" viewBox="0 0 540 300">
        {/* Layer 1: Dark Blue Base */}
        <path 
          d="M 0 0 L 295 0 C 315 50 345 100 285 150 C 225 200 285 250 285 305 L 0 305 Z" 
          fill={waveMainBlue} 
        />
        {/* Layer 2: Medium Blue Band */}
        <path 
          d="M 295 0 C 315 50 345 100 285 150 C 225 200 285 250 285 305 L 295 305 C 295 250 235 200 295 150 C 355 100 325 50 305 0 Z" 
          fill={waveMedBlue} 
        />
        {/* Layer 3: Light Blue Band */}
        <path 
          d="M 305 0 C 325 50 355 100 295 150 C 235 200 295 250 295 305 L 315 305 C 315 250 255 200 315 150 C 375 100 345 50 325 0 Z" 
          fill={waveLightBlue} 
        />
        {/* Layer 4: White Highlight Band */}
        <path 
          d="M 325 0 C 345 50 375 100 315 150 C 255 200 315 250 315 305 L 325 305 C 325 250 265 200 325 150 C 385 100 355 50 335 0 Z" 
          fill="white" 
          opacity="1"
        />
      </svg>

      <div className="relative z-10 w-full h-full flex px-10 py-10">
        {/* LEFT SECTION (Dark Blue Area) */}
        <div className="w-[52%] flex flex-col justify-between">
          <div className="space-y-0.5">
            <SmartTextField 
              text={name || 'YOUR NAME'} 
              maxWidth={240} 
              defaultFontSize={32} 
              minFontSize={16} 
              maxLines={1} 
              className={`font-black tracking-tighter leading-none uppercase ${smartLayout.nameTracking}`} 
              style={{ color: 'white', fontFamily: "'Montserrat', sans-serif" }} 
            />
            <SmartTextField 
              text={title || 'Job Position'} 
              maxWidth={230} 
              defaultFontSize={16} 
              minFontSize={11} 
              maxLines={1} 
              className="font-normal tracking-[0.2em] opacity-90" 
              style={{ color: 'white' }} 
            />
          </div>

          <div className="space-y-3 mt-4">
            {[
              { icon: Phone, text: formData.phone || '+00 123 456 789' },
              { icon: Mail, text: formData.email || 'email address goes here' },
              { icon: Globe, text: formData.website || 'website goes here', href: formData.website },
              { icon: MapPin, text: formData.location || 'address goes here' }
            ].filter(Boolean).map((item, idx) => {
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] flex items-center justify-center rounded-[10px] shadow-lg" style={{ background: waveIconPill }}>
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <SmartTextField 
                    text={item.text} 
                    maxWidth={200} 
                    defaultFontSize={11} 
                    className="font-medium text-white tracking-wide" 
                    href={item.href}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION (White Area - Repositioned Top-Center) */}
        <div className="w-[48%] flex flex-col items-center justify-start pt-10 pl-16 text-center relative transition-all duration-300">
          {/* Logo & Company - Tightly Coupled */}
          <div className="flex flex-col items-center gap-1 mb-2 mr-0">
             <div className="w-40 h-40 flex items-center justify-center mb-0 drop-shadow-xl">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain animate-fade-in" style={{ imageRendering: 'high-quality' }} /> 
                         : (
                            <div className="relative w-32 h-32 flex items-center justify-center bg-white shadow-2xl rounded-full border border-slate-100 p-5">
                               <svg viewBox="0 0 100 100" className="w-full h-full">
                                  <polygon points="50 1, 93 25, 93 75, 50 99, 7 75, 7 25" fill="none" stroke={waveMainBlue} strokeWidth="8" />
                                  <polygon points="50 15, 80 33, 80 67, 50 85, 20 67, 20 33" fill={waveLightBlue} />
                                  <circle cx="50" cy="50" r="10" fill="white" />
                               </svg>
                            </div>
                         )}
             </div>
             <div className="mt-0 text-center">
                <SmartTextField 
                  text={formData.company || 'COMPANY NAME'} 
                  maxWidth={170} 
                  defaultFontSize={15} 
                  minFontSize={9} 
                  maxLines={2} 
                  className="font-black uppercase tracking-[0.05em] text-slate-900 leading-[1.1]"
                  style={{ textAlign: 'center', fontFamily: "'Montserrat', sans-serif" }}
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── 11. ELEGANT (Mimics User Card) ── */
const ElegantTemplate = ({ name, title, formData, logoUrl, initials, smartLayout }) => {
  const navy = "#1f223a";
  const gold = "#d4af37";
  const textDark = "#353443";
  const textLight = "#5a5b65";
  const iconGold = "#cf9e38";

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-[#fafafa]">
      
      {/* Subtle grey wave texture */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 540 300" preserveAspectRatio="none">
        {/* Curved shadows/waves for realism */}
        <path d="M -50 150 Q 250 220 590 -20 L 590 -50 L -50 -50 Z" fill="rgba(0,0,0,0.015)" />
        <path d="M -50 350 Q 250 140 590 320 L 590 350 L -50 350 Z" fill="rgba(0,0,0,0.02)" />

         {/* Top Left Gold Background */}
         <path d="M 0 0 L 160 0 Q 30 15 0 90 Z" fill={gold} />
         {/* Top Left Navy Foreground */}
         <path d="M 0 0 L 135 0 Q 20 10 0 70 Z" fill={navy} />
         
         {/* Bottom Right Gold Background */}
         <path d="M 250 300 Q 420 270 540 100 L 540 300 Z" fill={gold} />
         {/* Bottom Right Navy Foreground */}
         <path d="M 290 300 Q 440 280 540 130 L 540 300 Z" fill={navy} />
      </svg>

      <div className="relative z-10 w-full h-full flex flex-col justify-between px-10 py-10">
         {/* Top Section */}
         <div className="flex justify-between items-start w-full gap-4">
            
            <div className="flex flex-col mt-2 flex-1 min-w-0">
               <SmartTextField 
                 text={name || "Daniel Gallego"} 
                 maxWidth={260} 
                 defaultFontSize={38} 
                 minFontSize={22}
                 maxLines={1}
                 className={`font-semibold tracking-wide ${smartLayout.nameTracking}`}
                 style={{ color: textDark, fontFamily: "'Inter', sans-serif" }}
               />
               <SmartTextField 
                 text={title || "Marketing Manager"} 
                 maxWidth={260} 
                 defaultFontSize={13} 
                 className="font-bold tracking-wide mt-0.5"
                 style={{ color: gold, fontFamily: "'Inter', sans-serif" }}
               />
            </div>

            <div className="flex flex-col items-end justify-start -mt-2 relative z-20 shrink-0">
               <div className={`flex justify-end items-start mb-1.5 ${smartLayout.logoScaleClass}`} style={{ transformOrigin: "top right" }}>
                  {logoUrl ? <img src={logoUrl} className="w-[160px] h-auto max-h-[85px] object-contain drop-shadow-md" /> : 
                     (
                       <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center bg-white shadow-sm">
                          <span className="text-3xl font-black text-slate-400">{initials}</span>
                       </div>
                     )
                  }
               </div>
               <SmartTextField 
                 text={formData.company || "XYZON INNOVATIONS PRIVATE LIMITED"} 
                 maxWidth={200} 
                 defaultFontSize={10} 
                 minFontSize={7}
                 maxLines={2}
                 className="font-black font-sans tracking-wide uppercase leading-snug"
                 style={{ color: textDark, textAlign: 'right' }}
               />
            </div>
         </div>

         {/* Contact Section */}
         <div className="flex flex-col gap-3 mb-1 ml-1 relative z-20">
            {[
              { icon: Phone, text: formData.phone || "+123-456-7890" },
              { icon: Mail, text: formData.email }, 
              { icon: Globe, text: formData.website || "www.reallygreatsite.com", href: formData.website },
              { icon: MapPin, text: formData.location || "123 Anywhere St., Any City" }
            ].filter(Boolean).map((contact, i) => {
               return (
                 <div key={i} className="flex items-center gap-3.5">
                    <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: iconGold }}>
                       <contact.icon strokeWidth={2.5} size={11} color="white" />
                    </div>
                    <SmartTextField 
                      text={contact.text} 
                      maxWidth={260} 
                      defaultFontSize={11} 
                      className="font-medium tracking-wide"
                      style={{ color: textLight }}
                      href={contact.href}
                    />
                 </div>
               );
            })}
         </div>

      </div>
    </div>
  );
};

/* ── 12. STUDIO (Dark/Light Split) ── */
const StudioTemplate = ({ name, title, formData, logoUrl, initials, smartLayout }) => {
  const darkBg = "#161618";
  const lightBg = "#f0f0f0";
  const textDark = "#1a1a1a";
  const textLight = "#ffffff";
  const textGrey = "#8c8c8c";

  // Contacts mapped exactly to match user's screenshot layout Order: Phone, MapPin, Globe, Mail
  const contactItems = [
    { icon: Phone, text: formData.phone || "+123-456-7890" },
    { icon: MapPin, text: formData.location || "123 Anywhere St., Any City" },
    { icon: Globe, text: formData.website || "www.reallygreatsite.com", href: formData.website },
    { icon: Mail, text: formData.email || "hello@reallygreatsite.com" },
  ].filter(item => item.text);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden flex bg-white shadow-2xl">
      
      {/* Subtle screen pixel/noise overlay spanning entire background to mimic photo */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-[50]" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* LEFT DARK SECTION ~40% */}
      <div className="relative w-[40%] flex flex-col justify-center items-center px-6 text-center border-r-[3px] border-[#2a2a2a]" style={{ backgroundColor: darkBg }}>
         <div className={`mb-3 flex justify-center items-center ${smartLayout.logoScaleClass}`}>
            {logoUrl ? <img src={logoUrl} className="w-auto h-auto max-w-[180px] max-h-[130px] object-contain drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)] brightness-110" /> : 
               (
                 <div className="w-24 h-24 flex items-center justify-center">
                    <span className="text-7xl font-black text-white">{initials}</span>
                 </div>
               )
            }
         </div>
         
         <div className="flex flex-col items-center">
           <SmartTextField 
             text={formData.company || "STUDIO SHODWE"} 
             maxWidth={180} 
             defaultFontSize={16} 
             minFontSize={10}
             maxLines={2}
             className="font-black font-sans tracking-widest uppercase leading-snug drop-shadow-sm"
             style={{ color: textLight, textAlign: 'center' }}
           />
           <SmartTextField 
             text={formData.tagline || "computer service expert"} 
             maxWidth={160} 
             defaultFontSize={10} 
             minFontSize={7}
             maxLines={2}
             className="font-medium tracking-wide leading-tight lowercase"
             style={{ color: textGrey, textAlign: 'center' }}
           />
         </div>
      </div>

      {/* RIGHT LIGHT SECTION ~60% */}
      <div className="relative w-[60%] flex flex-col justify-center pl-10 pr-6" style={{ backgroundColor: lightBg }}>
         
         <div className="mb-8 mt-4">
            <SmartTextField 
              text={name || "MORGAN MAXWELL"} 
              maxWidth={250} 
              defaultFontSize={22} 
              minFontSize={10}
              maxLines={2}
              className={`font-black tracking-widest uppercase leading-tight ${smartLayout.nameTracking}`}
              style={{ color: textDark, fontFamily: "'Inter', sans-serif" }}
            />
            <SmartTextField 
              text={title || "COMPUTER MECHANIC"} 
              maxWidth={250} 
              defaultFontSize={11} 
              minFontSize={7}
              className="font-bold tracking-[0.2em] uppercase mt-0.5"
              style={{ color: "#4a4a4a", fontFamily: "'Inter', sans-serif" }}
            />
         </div>

         <div className="flex flex-col gap-2.5">
           {contactItems.map((contact, i) => {
              return (
                <div key={i} className="flex items-center gap-3">
                   <contact.icon strokeWidth={2.5} size={14} color="#1a1a1a" className="shrink-0" />
                   <SmartTextField 
                     text={contact.text} 
                     maxWidth={250} 
                     defaultFontSize={10} 
                     className="font-bold tracking-wide uppercase"
                     style={{ color: "#333" }}
                     href={contact.href}
                   />
                </div>
              );
           })}
         </div>

      </div>

    </div>
  );
};

/* ── 13. SKYLINE PRO (Mortgage/Real-Estate Style) ── */
const SkylineTemplate = ({ name, title, formData, logoUrl, initials, smartLayout }) => {
  const skyBlue = "#47a1e0";
  const darkBlue = "#1e40af";
  const textDark = "#374151";
  const textAccent = "#2563eb";

  const contactItems = [
    { icon: Phone, text: formData.phone || "+123 456 7890" },
    { icon: Mail, text: formData.email || "hello@reallygreatsite.com" },
    { icon: Globe, text: formData.website || "ww.reallygreatsite.com", href: formData.website },
    { icon: MapPin, text: formData.location || "123 Anywhere St., Any City, ST 12345" },
  ].filter(item => item.text);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden bg-white flex flex-col justify-between">
      
      {/* Top Header Patterns */}
      <div className="relative w-full h-[45px] shrink-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 45" preserveAspectRatio="none">
          <path d="M 0 0 L 270 0 Q 230 45 180 45 L 0 45 Z" fill={skyBlue} />
          <path d="M 180 0 L 540 0 L 540 12 Q 350 12 280 45 L 200 45 Q 240 0 180 0" fill={darkBlue} />
        </svg>
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: skyBlue, opacity: 0.5 }} />
      </div>

      <div className="flex-1 flex px-10 items-center justify-between">
        
        {/* Left Side: Name and Contacts */}
        <div className="flex flex-col justify-center max-w-[55%]">
           <div className="mb-6">
              <SmartTextField 
                text={name || "ALEXANDER ARONOWITZ"} 
                maxWidth={300} 
                defaultFontSize={28} 
                className="font-black text-slate-700 tracking-tight uppercase"
              />
              <SmartTextField 
                text={title || "HEAD MANAGER"} 
                maxWidth={300} 
                defaultFontSize={16} 
                className="font-bold tracking-widest uppercase mt-0.5"
                style={{ color: textAccent }}
              />
           </div>

           <div className="flex flex-col gap-2.5">
             {contactItems.map((contact, i) => (
               <div key={i} className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: textAccent }}>
                   <contact.icon size={11} color="white" />
                 </div>
                 <SmartTextField 
                   text={contact.text} 
                   maxWidth={220} 
                   defaultFontSize={10} 
                   className="font-bold tracking-tight text-slate-600"
                   href={contact.href}
                 />
               </div>
             ))}
           </div>
        </div>

        {/* Right Side: Logo and Company */}
        <div className="flex flex-col items-center justify-center text-center">
           <div className={`mb-4 w-36 h-36 rounded-full border-[6px] flex items-center justify-center bg-white shadow-xl`} style={{ borderColor: skyBlue }}>
              {logoUrl ? <img src={logoUrl} className="w-24 h-24 object-contain" /> : 
                <div className="flex flex-col items-center">
                   <div className="w-16 h-10 border-4 rounded-t-lg mb-1" style={{ borderColor: skyBlue }} />
                   <div className="w-20 h-10 border-4" style={{ borderColor: darkBlue }} />
                </div>
              }
           </div>
           
           <SmartTextField 
             text={formData.company || "RIMBERIO"} 
             maxWidth={180} 
             defaultFontSize={30} 
             className="font-black tracking-tight text-slate-800 uppercase"
           />
           <SmartTextField 
             text={formData.tagline || "REAL ESTATE"} 
             maxWidth={180} 
             defaultFontSize={10} 
             className="font-bold tracking-[0.2em] uppercase mt-0.5"
             style={{ color: textAccent }}
           />
        </div>
      </div>

      {/* Bottom Footer Patterns */}
      <div className="relative w-full h-[45px] shrink-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 45" preserveAspectRatio="none">
           <path d="M 0 0 L 120 0 Q 180 45 320 45 L 0 45 Z" fill={darkBlue} />
           <path d="M 280 45 L 540 45 L 540 0 Q 400 0 240 45" fill={skyBlue} />
        </svg>
        <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ background: darkBlue, opacity: 0.5 }} />
      </div>

    </div>
  );
};

/* ── 14. OCEAN PRO (Marble & Swish Style) ── */
const OceanTemplate = ({ name, title, formData, logoUrl, initials, smartLayout, fontFamily }) => {
  const navy = "#1b3a6d";
  const royal = "#2563eb";
  const lightBlue = "#60a5fa";

  const contactItems = [
    { icon: Phone, text: formData.phone || "+123-456-7890" },
    { icon: MapPin, text: formData.location || "123 Anywhere St., Any City" },
    { icon: Mail, text: formData.email || "hello@reallygreatsite.com" },
    { icon: Globe, text: formData.website || "www.reallygreatsite.com", href: formData.website },
  ].filter(item => item.text);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden flex bg-[#fdfdfd]">
      
      {/* Marble Texture Overlay (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ 
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")',
        backgroundSize: '400px'
      }} />

      {/* Abstract Swishes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-1" viewBox="0 0 540 300" preserveAspectRatio="none">
         {/* Top Left Swishes */}
         <path d="M -20 120 Q 80 80 140 -20 L -20 -20 Z" fill={lightBlue} opacity="0.4" />
         <path d="M -20 100 Q 60 40 100 -20 L -20 -20 Z" fill={royal} opacity="0.6" />
         <path d="M -20 80 Q 40 20 80 -20 L -20 -20 Z" fill={navy} />

         {/* Bottom Right Swishes */}
         <path d="M 400 320 Q 460 220 560 180 L 560 320 Z" fill={lightBlue} opacity="0.4" />
         <path d="M 440 320 Q 500 240 560 220 L 560 320 Z" fill={royal} opacity="0.6" />
         <path d="M 480 320 Q 520 260 560 250 L 560 320 Z" fill={navy} />
      </svg>

      <div className="relative z-10 w-full h-full flex items-center justify-between px-12 py-10">
         
         {/* Details Section */}
         <div className="flex flex-col justify-center flex-1 max-w-[55%]">
            <div className="mb-6">
               <SmartTextField 
                 text={name || "Alexander Aronowitz"} 
                 maxWidth={280} 
                 defaultFontSize={30} 
                 className="font-bold tracking-tight"
                 style={{ color: navy, fontFamily: fontFamily || "'PT Serif', serif" }}
               />
               <SmartTextField 
                 text={title || "Graphic Designer"} 
                 maxWidth={280} 
                 defaultFontSize={16} 
                 className="font-medium mt-1"
                 style={{ color: royal, fontFamily: fontFamily || "'Inter', sans-serif" }}
               />
               
               {/* Design Divider Line with Sparkle/Star at the end */}
               <div className="flex items-center gap-0 mt-2.5 mb-2.5">
                  <div className="h-[1px] w-[180px]" style={{ backgroundColor: navy }} />
                  <div className="shrink-0 -ml-0.5">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill={navy}>
                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                     </svg>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2.5">
               {contactItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: navy }}>
                        <item.icon size={12} color="white" />
                     </div>
                     <SmartTextField 
                       text={item.text} 
                       maxWidth={240} 
                       defaultFontSize={11} 
                       className="font-medium tracking-wide"
                       style={{ color: '#444' }}
                       href={item.href}
                     />
                  </div>
               ))}
            </div>
         </div>

         {/* Logo Section */}
         <div className="flex flex-col items-center justify-center text-center pr-4">
            <div className={`mb-4 w-32 h-32 flex items-center justify-center relative`}>
               {/* Hexagon Border */}
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <polygon points="50 5, 93 25, 93 75, 50 95, 7 75, 7 25" fill="none" stroke={navy} strokeWidth="4" />
               </svg>
               {logoUrl ? <img src={logoUrl} className="w-24 h-24 object-contain relative z-10" /> : 
                  <div className="relative z-10 flex flex-col items-center">
                     <span className="text-4xl font-black" style={{ color: navy }}>{initials}</span>
                  </div>
               }
            </div>
            <SmartTextField 
              text={formData.company || "Wardiere Inc."} 
              maxWidth={180} 
              defaultFontSize={20} 
              className="font-bold tracking-tight"
              style={{ color: navy, fontFamily: fontFamily || "'PT Serif', serif" }}
            />
         </div>

      </div>

    </div>
  );
};

/* ── 15. ABSTRACT PRO (Corporate Deep Blue Style) ── */
const AbstractTemplate = ({ name, title, formData, logoUrl, initials, smartLayout, fontFamily, bgPrimary, bgSecondary }) => {
  const navy = "#0f172a";
  const blue600 = "#2563eb";
  const blue800 = "#1e40af";

  const contactItems = [
    { icon: Phone, text: formData.phone || "+123-456-7890" },
    { icon: Mail, text: formData.email || "hello@reallygreatsite.com" },
    { icon: Globe, text: formData.website || "www.reallygreatsite.com", href: formData.website },
    { icon: MapPin, text: formData.location || "123 Anywhere St., Any City, ST 12345" },
  ].filter(item => item.text);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden flex" style={{ backgroundColor: bgPrimary }}>
      
      {/* Background Abstract Shapes */}
      <div className="absolute inset-0 z-0">
         <svg className="w-full h-full" viewBox="0 0 540 300" preserveAspectRatio="none">
            <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: blue800, stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: blue600, stopOpacity: 0.4 }} />
               </linearGradient>
               <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: blue600, stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: navy, stopOpacity: 0 }} />
               </linearGradient>
            </defs>
            <circle cx="500" cy="150" r="220" fill="url(#grad1)" />
            <circle cx="460" cy="180" r="180" fill="url(#grad2)" />
            <path d="M 350 0 Q 500 150 350 300 L 540 300 L 540 0 Z" fill={navy} opacity="0.3" />
         </svg>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 py-14">
         
         {/* Top Section: Identity */}
         <div className="space-y-1">
            <SmartTextField 
              text={name || "ALFREDO TORRES"} 
              maxWidth={350} 
              defaultFontSize={34} 
              className="font-black tracking-tight text-white uppercase leading-none"
              style={{ fontFamily: fontFamily || "'Inter', sans-serif" }}
            />
            <SmartTextField 
              text={title || "General Manager"} 
              maxWidth={350} 
              defaultFontSize={18} 
              className="font-medium text-white/80"
              style={{ fontFamily: fontFamily || "'Inter', sans-serif" }}
            />
         </div>

         {/* Bottom Section: Contacts */}
         <div className="flex flex-col gap-3">
            {contactItems.map((item, idx) => (
               <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                     <item.icon size={16} strokeWidth={2.5} style={{ color: navy }} />
                  </div>
                  <SmartTextField 
                    text={item.text} 
                    maxWidth={300} 
                    defaultFontSize={13} 
                    className="font-semibold tracking-wide text-white/90"
                    style={{ fontFamily: fontFamily || "'Inter', sans-serif" }}
                    href={item.href}
                  />
               </div>
            ))}
         </div>

         {/* Optional Logo overlay (if user adds a logo) */}
         {logoUrl && (
            <div className="absolute top-10 right-10 w-24 h-24 flex items-center justify-center opacity-80 mix-blend-screen">
               <img src={logoUrl} className="w-full h-full object-contain" />
            </div>
         )}
      </div>

    </div>
  );
};

export default BusinessCard;
