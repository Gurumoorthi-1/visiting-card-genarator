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
  
  if (isElegant) {
    bgPrimary = '#fafafa';
    bgSecondary = '#f0f0f0';
    textPrimary = '#1f223a';
    textSecondary = '#5a5b65';
    accentColor = '#cf9e38';
  }

  const initials = formData.name
    ? formData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : company ? company[0].toUpperCase() : 'C';

  const hasSocial = linkedin || twitter || facebook;

  const smartLayout = getSmartLayout(name);

  const qrFgColor = isElegant ? textPrimary : bgSecondary;


  const commonProps = {
    formData, initials, hasSocial, logoUrl, smartLayout,
    bgPrimary, bgSecondary, textPrimary, textSecondary, accentColor,
    name, title
  };

  const getTemplate = () => {
    switch (template) {
      case 'classic': return <ClassicTemplate {...commonProps} />;
      case 'creative': return <CreativeTemplate {...commonProps} />;
      case 'minimal': return <MinimalTemplate {...commonProps} />;
      case 'corporate': return <CorporateTemplate {...commonProps} />;
      case 'golden': return <GoldenTemplate {...commonProps} />;
      case 'vanguard': return <VanguardTemplate {...commonProps} />;
      case 'wave': return <WaveTemplate {...commonProps} />;
      case 'elegant': return <ElegantTemplate {...commonProps} />;
      case 'modern':
      default: return <ModernTemplate {...commonProps} />;
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
          
          {/* Inject QR Code firmly on the Front Face Bottom Right only during Batch Export */}
          {isBatchExport && (
            <div className="absolute bottom-5 right-5 p-1.5 bg-white rounded-[8px] shadow-lg border border-slate-100 z-50 flex flex-col items-center gap-1">
              <QRCodeSVG 
                value={vCardData || "No Data"} 
                size={46} 
                bgColor={"#ffffff"} 
                fgColor={qrFgColor}
                level={"H"}
              />
              <span className="text-[5px] font-black uppercase tracking-widest text-slate-400">Scan</span>
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


/* ── 1. MODERN (Existing) ── */
const ModernTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor, bgPrimary }) => (
  <>
    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-3xl mix-blend-overlay pointer-events-none" />
    <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5 blur-2xl mix-blend-overlay pointer-events-none" />
    <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500" style={{ background: accentColor }} />

    <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10 w-[200px]">
      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden bg-white/10 ring-2 ring-white/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.15)] shrink-0 ml-auto transition-all duration-500 hover:scale-105 ${smartLayout.logoScaleClass}`}>
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                 : <span className="text-2xl font-black" style={{ color: textPrimary }}>{initials}</span>}
      </div>
      {formData.company && (
        <div className="w-full flex justify-end">
          <SmartTextField 
            text={formData.company} 
            maxWidth={240} 
            defaultFontSize={9} 
            minFontSize={7} 
            maxLines={2} 
            className="font-black uppercase tracking-[0.2em] text-right leading-[1.1]" 
            style={{ color: textSecondary }} 
          />
        </div>
      )}
    </div>

    <div className="absolute inset-0 flex flex-col justify-between p-8 pl-10 z-10 pointer-events-none">
      <div className="pr-16 space-y-2 mt-1 w-full relative">
        <SmartTextField text={name || 'Your Name'} maxWidth={220} defaultFontSize={30} minFontSize={12} maxLines={1} className={`font-black leading-none transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 shrink-0 rounded-full" style={{ background: accentColor }} />
          <SmartTextField text={title || 'Job Title'} maxWidth={280} defaultFontSize={12} minFontSize={7} maxLines={2} className="font-bold uppercase tracking-widest mt-0.5" style={{ color: accentColor }} />
        </div>
        {formData.tagline && (
          <div className="flex items-start gap-2 pt-1.5 pointer-events-auto">
            <div className="w-[3px] h-3.5 mt-0.5 rounded-full" style={{ background: accentColor }} />
            <SmartTextField text={formData.tagline} maxWidth={240} defaultFontSize={10} minFontSize={7} maxLines={2} className="font-black tracking-wide italic leading-tight" style={{ color: textPrimary }} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 pointer-events-auto">
        <div className="grid grid-cols-1 gap-1.5 flex-1">
          {formData.phone && <ContactRow icon={Phone} text={formData.phone} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
          {formData.email && <ContactRow icon={Mail} text={formData.email} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
          {formData.website && <ContactRow icon={Globe} text={formData.website} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
          {formData.location && <ContactRow icon={MapPin} text={formData.location} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        </div>
        {hasSocial && (
          <div className="flex items-center gap-2.5 shrink-0">
            {formData.linkedin && <SocialDot icon={Link2} aC={accentColor} tP={textPrimary} href={formData.linkedin} />}
            {formData.twitter && <SocialDot icon={MessageCircle} aC={accentColor} tP={textPrimary} href={formData.twitter} />}
            {formData.facebook && <SocialDot icon={Share2} aC={accentColor} tP={textPrimary} href={formData.facebook} />}
          </div>
        )}
      </div>
    </div>
  </>
);

/* ── 2. CLASSIC (Centered Layout) ── */
const ClassicTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-center ring-4 ring-white/5 m-2 rounded-xl z-10 w-full overflow-hidden">
    <div className="flex flex-col items-center gap-3 w-full max-w-[440px]">
      <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-[3px] shadow-2xl mx-auto shrink-0 transition-all duration-500 hover:rotate-6 ${smartLayout.logoScaleClass}`} style={{ borderColor: accentColor, background: `${accentColor}1A` }}>
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2.5" />
                 : <span className="text-2xl font-black" style={{ color: textPrimary }}>{initials}</span>}
      </div>
      {formData.company && (
        <div className="w-full flex justify-center mt-1">
          <SmartTextField 
            text={formData.company} 
            maxWidth={320} 
            defaultFontSize={10} 
            minFontSize={8} 
            maxLines={2}
            className="font-black uppercase tracking-[0.3em] opacity-80 text-center leading-tight" 
            style={{ color: textPrimary, textAlign: 'center' }} 
          />
        </div>
      )}
    </div>

    <div className="space-y-2 w-full max-w-[400px] flex flex-col items-center">
      <SmartTextField text={name || 'Your Name'} maxWidth={400} defaultFontSize={28} minFontSize={12} maxLines={1} className={`mx-auto transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary, textAlign: 'center' }} />
      <SmartTextField text={title || 'Job Title'} maxWidth={400} defaultFontSize={11} minFontSize={6} maxLines={2} className="font-medium uppercase tracking-[0.2em] mx-auto opacity-90" style={{ color: accentColor, textAlign: 'center' }} />
      {formData.tagline && (
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <div className="w-6 h-[1.5px]" style={{ background: accentColor }} />
          <SmartTextField text={formData.tagline} maxWidth={340} defaultFontSize={10} minFontSize={7} maxLines={2} className="italic font-black text-center" style={{ color: accentColor }} />
        </div>
      )}
    </div>

    <div className="w-8 h-px opacity-50 shrink-0" style={{ background: accentColor }} />

    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] max-w-[460px]">
      {formData.phone && <span style={{ color: textSecondary }}>{formData.phone}</span>}
      {formData.email && <span style={{ color: textSecondary }}>{formData.email}</span>}
      {formData.website && (
        <a href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: textSecondary }} onClick={e => e.stopPropagation()}>
          {formData.website}
        </a>
      )}
    </div>
  </div>
);


/* ── 3. CREATIVE (Split Layout) ── */
const CreativeTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor, bgPrimary }) => (
  <div className="absolute inset-0 flex z-10 w-full overflow-hidden">
    <div className="w-[35%] flex flex-col items-center justify-center p-6 text-center shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 shrink-0" style={{ background: accentColor }}>
      <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white/20 ring-4 ring-white/10 backdrop-blur-md mb-4 shadow-2xl transition-all duration-500 hover:scale-110 ${smartLayout.logoScaleClass}`}>
        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2.5" />
                 : <span className="text-3xl font-black text-white drop-shadow-md">{initials}</span>}
      </div>
      {formData.company && (
        <SmartTextField text={formData.company} maxWidth={160} defaultFontSize={10} minFontSize={7} maxLines={2} className="font-black uppercase tracking-widest text-white/90" />
      )}
    </div>
    <div className="w-[65%] flex flex-col justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none" style={{ background: accentColor }} />
      
      <div className="w-full max-w-[240px] space-y-1 mb-5">
        <SmartTextField text={name || 'Your Name'} maxWidth={240} defaultFontSize={30} minFontSize={12} maxLines={1} className={`font-black transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
        <SmartTextField text={title || 'Job Title'} maxWidth={260} defaultFontSize={12} minFontSize={6} maxLines={2} className="font-bold uppercase tracking-widest mt-1 mb-1" style={{ color: accentColor }} />
        {formData.tagline && (
          <div className="flex items-center gap-2.5 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-200/40 w-fit">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
            <SmartTextField text={formData.tagline} maxWidth={220} defaultFontSize={10} minFontSize={7} maxLines={1} className="font-black tracking-wide italic" style={{ color: textPrimary }} />
          </div>
        )}
      </div>
      
      <div className="space-y-2.5 max-w-[280px]">
        {formData.phone && <ContactRow icon={Phone} text={formData.phone} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        {formData.email && <ContactRow icon={Mail} text={formData.email} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        {formData.website && <ContactRow icon={Globe} text={formData.website} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
      </div>
    </div>
  </div>
);

/* ── 4. MINIMAL (Clean Layout) ── */
const MinimalTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor }) => (
  <div className="absolute inset-0 p-10 flex flex-col justify-between z-10 w-full overflow-hidden">
    <div className="flex justify-between items-start w-full gap-4">
      <div className="flex-1 w-[280px]">
        <SmartTextField text={name || 'Your Name'} maxWidth={280} defaultFontSize={28} minFontSize={12} maxLines={1} className={`font-light mb-1 transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
        <SmartTextField text={title || 'Job Title'} maxWidth={300} defaultFontSize={11} minFontSize={7} maxLines={2} className="font-medium tracking-wide mt-1" style={{ color: textSecondary }} />
        {formData.tagline && (
          <div className="mt-2.5 inline-block">
            <SmartTextField text={formData.tagline} maxWidth={260} defaultFontSize={10} minFontSize={7} maxLines={1} className="font-bold tracking-tight" style={{ color: textPrimary }} />
            <div className="h-[2px] w-6 mt-1 rounded-full" style={{ background: accentColor }} />
          </div>
        )}
      </div>
      <div className="w-[140px] flex justify-end shrink-0 py-1">
        {logoUrl ? <img src={logoUrl} alt="Logo" className={`h-12 w-auto max-w-full object-contain filter saturate-150 brightness-110 transition-all duration-500 hover:scale-110 ${smartLayout.logoScaleClass}`} />
                 : <SmartTextField text={formData.company || 'Company'} maxWidth={140} defaultFontSize={18} minFontSize={12} maxLines={2} className={`font-black text-right leading-tight transition-transform duration-500 ${smartLayout.logoScaleClass}`} style={{ color: textPrimary }} />}
      </div>
    </div>
    
    <div className="flex justify-between items-end w-full gap-4">
      <div className="space-y-1 w-[260px]">
        {formData.email && <SmartTextField text={formData.email} maxWidth={260} defaultFontSize={10} minFontSize={7} className="font-medium lowercase tracking-wide" style={{ color: textSecondary }} />}
        {formData.website && <SmartTextField text={formData.website} maxWidth={260} defaultFontSize={10} minFontSize={7} className="font-medium lowercase tracking-wide" style={{ color: textSecondary }} href={formData.website} />}
        {formData.phone && <SmartTextField text={formData.phone} maxWidth={260} defaultFontSize={10} minFontSize={7} className="font-medium lowercase tracking-wide" style={{ color: textSecondary }} />}
      </div>
      {(formData.linkedin || formData.twitter) && (
        <div className="text-[9px] font-medium text-right lowercase tracking-wide opacity-50 max-w-[150px]" style={{ color: textPrimary }}>
          {formData.linkedin && (
             <a href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 truncate block pointer-events-auto" onClick={e => e.stopPropagation()}>
               {formData.linkedin}
             </a>
          )}
          {formData.twitter && <p className="truncate">{formData.twitter}</p>}
        </div>
      )}
    </div>
  </div>
);

/* ── 5. CORPORATE (Horizontal Split) ── */
const CorporateTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor }) => (
  <div className="absolute inset-0 flex flex-col z-10 w-full overflow-hidden">
    <div className="h-2 w-full shrink-0" style={{ background: accentColor }} />
    <div className="flex-1 p-8 flex justify-between items-center relative gap-8">
      <div className="absolute h-[80%] w-[1px] opacity-20 left-1/2 top-[10%]" style={{ background: textPrimary }} />
      
      <div className="w-[45%] pr-4 space-y-2 max-w-[240px]">
         {logoUrl ? <div className="p-2 inline-block bg-white/50 backdrop-blur-sm rounded-xl shadow-sm mb-4"><img src={logoUrl} alt="Logo" className={`h-12 w-auto max-w-[160px] object-contain transition-transform duration-500 hover:scale-105 ${smartLayout.logoScaleClass}`} /></div>
                  : <div className={`mb-5 transition-transform duration-500 ${smartLayout.logoScaleClass}`}>
                      <SmartTextField text={formData.company || 'Company'} maxWidth={220} defaultFontSize={22} minFontSize={12} maxLines={2} className="font-black uppercase tracking-widest leading-tight" style={{ color: accentColor }} />
                    </div>}
          <SmartTextField text={name || 'Your Name'} maxWidth={210} defaultFontSize={22} minFontSize={10} maxLines={1} className={`font-bold leading-tight transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
          <SmartTextField text={title || 'Job Title'} maxWidth={210} defaultFontSize={10} minFontSize={6} maxLines={2} className="uppercase tracking-wider font-semibold" style={{ color: textSecondary }} />
         {formData.tagline && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t-2" style={{ borderColor: `${accentColor}40` }}>
            <SmartTextField text={formData.tagline} maxWidth={180} defaultFontSize={10} minFontSize={7} maxLines={1} className="font-black italic tracking-wide" style={{ color: textPrimary }} />
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor }} />
          </div>
         )}
      </div>
      
      <div className="w-[45%] pl-4 space-y-3 max-w-[240px]">
        {formData.phone && <ContactRow icon={Phone} text={formData.phone} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        {formData.email && <ContactRow icon={Mail} text={formData.email} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        {formData.website && <ContactRow icon={Globe} text={formData.website} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
        {formData.location && <ContactRow icon={MapPin} text={formData.location} tP={textPrimary} tS={textSecondary} aC={accentColor} />}
      </div>
    </div>
  </div>
);

/* ── Helpers ── */
const ContactRow = ({ icon: Icon, text, tP, tS, aC, maxW = 200 }) => {
  const isUrl = Icon === Globe;
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" strokeWidth={2} style={{ color: aC }} />
      <SmartTextField 
        text={text} 
        maxWidth={maxW} 
        defaultFontSize={10} 
        minFontSize={7} 
        maxLines={1} 
        className="font-semibold tracking-wide" 
        style={{ color: tS || tP }} 
        href={isUrl ? text : null}
      />
    </div>
  );
};

const SocialDot = ({ icon: Icon, aC, tP, href }) => (
  <a 
    href={href ? (href.startsWith('http') ? href : `https://${href}`) : '#'} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 hover:-translate-y-1 hover:scale-110 shrink-0 shadow-sm pointer-events-auto" 
    style={{ background: `${aC}20` }}
    onClick={e => e.stopPropagation()}
  >
    <Icon className="w-3 h-3" strokeWidth={2.5} style={{ color: tP }} />
  </a>
);

/* ── 6. GOLDEN RATIO (Dynamic Format Engine) ── */
const GoldenTemplate = ({ name, title, formData, initials, hasSocial, logoUrl, smartLayout, textPrimary, textSecondary, accentColor }) => {
  const [logoFormat, setLogoFormat] = React.useState('square');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (logoUrl) {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setLogoFormat(ratio > 1.2 ? 'landscape' : 'square');
        setIsLoaded(true);
      };
      img.src = logoUrl;
    } else {
      setLogoFormat('square');
      setIsLoaded(true);
    }
  }, [logoUrl]);

  if (!isLoaded) return null;

  if (logoFormat === 'square') {
    return (
      <div className="absolute inset-0 flex z-10 w-full overflow-hidden transition-all duration-500">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center shrink-0 border-r" style={{ width: '38.2%', borderColor: `${textPrimary}20`, background: `${accentColor}10` }}>
          <div className={`w-full max-w-[120px] aspect-square rounded-2xl overflow-hidden flex items-center justify-center mb-4 transition-transform duration-500 ${smartLayout.logoScaleClass}`} style={{ background: 'transparent' }}>
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                     : <span className="text-4xl font-black" style={{ color: textPrimary }}>{initials}</span>}
          </div>
          {formData.company && (
            <SmartTextField text={formData.company} maxWidth={140} defaultFontSize={12} minFontSize={8} maxLines={2} className="font-black uppercase tracking-widest leading-tight" style={{ color: textPrimary }} />
          )}
        </div>
        
        <div className="flex flex-col justify-center h-full p-8 relative overflow-hidden" style={{ width: '61.8%' }}>
          <div className="space-y-1 mb-5">
            <SmartTextField text={name || 'Your Name'} maxWidth={240} defaultFontSize={28} minFontSize={11} maxLines={1} className={`font-black tracking-tight leading-none transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
            <SmartTextField text={title || 'Job Title'} maxWidth={250} defaultFontSize={12} minFontSize={6} maxLines={2} className="font-bold uppercase tracking-widest mt-1 mb-1" style={{ color: accentColor }} />
            {formData.tagline && (
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[1.5px] w-6" style={{ background: accentColor }} />
                <p className="text-[11px] font-black italic tracking-wide" style={{ color: textPrimary }}>{formData.tagline}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2.5 w-full">
            {formData.phone && <ContactRow icon={Phone} text={formData.phone} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={240} />}
            {formData.email && <ContactRow icon={Mail} text={formData.email} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={240} />}
            {formData.website && <ContactRow icon={Globe} text={formData.website} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={240} />}
            {formData.location && <ContactRow icon={MapPin} text={formData.location} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={240} />}
          </div>
        </div>
      </div>
    );
  }

  // Landscape Mode
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10 w-full overflow-hidden text-center transition-all duration-500">
      <div className="w-full max-w-[280px] h-16 flex items-center justify-center shrink-0 mb-4 transition-transform duration-500">
         {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                  : <SmartTextField text={formData.company || 'Company'} maxWidth={280} defaultFontSize={24} minFontSize={14} className="font-black uppercase tracking-widest" style={{ color: textPrimary }} />}
      </div>
      
      <div className="space-y-1 w-full max-w-[400px]">
        <SmartTextField text={name || 'Your Name'} maxWidth={400} defaultFontSize={32} minFontSize={12} maxLines={1} className={`font-black tracking-tight mx-auto transition-all duration-300 ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
        <SmartTextField text={title || 'Job Title'} maxWidth={360} defaultFontSize={12} minFontSize={7} maxLines={2} className="font-bold uppercase tracking-widest mt-1 mx-auto" style={{ color: accentColor }} />
        {formData.tagline && (
          <div className="flex flex-col items-center mt-2 scale-95 origin-top">
            <p className="text-[11px] font-black italic tracking-wider" style={{ color: textPrimary }}>{formData.tagline}</p>
            <div className="w-10 h-[2px] mt-1" style={{ background: accentColor }} />
          </div>
        )}
      </div>
      
      <div className="w-full flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t" style={{ borderColor: `${textPrimary}20` }}>
        {formData.phone && <div className="flex items-center gap-1.5"><Phone strokeWidth={2} className="w-3 h-3 shrink-0" style={{ color: accentColor }} /><span className="text-[10px] font-semibold tracking-wide" style={{ color: textSecondary }}>{formData.phone}</span></div>}
        {formData.email && <div className="flex items-center gap-1.5"><Mail strokeWidth={2} className="w-3 h-3 shrink-0" style={{ color: accentColor }} /><span className="text-[10px] font-semibold tracking-wide" style={{ color: textSecondary }}>{formData.email}</span></div>}
        {formData.website && (
           <a href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 group pointer-events-auto" onClick={e => e.stopPropagation()}>
             <Globe strokeWidth={2} className="w-3 h-3 shrink-0 group-hover:scale-110 transition-transform" style={{ color: accentColor }} />
             <span className="text-[10px] font-semibold tracking-wide pointer-events-none" style={{ color: textSecondary }}>{formData.website}</span>
           </a>
        )}
      </div>
    </div>
  );
};




/* ── 9. VANGUARD (Geometric Pro) ── */
const VanguardTemplate = ({ name, title, formData, logoUrl, smartLayout, textPrimary, textSecondary, accentColor, bgPrimary }) => (
  <div className="absolute inset-0 z-10 w-full overflow-hidden flex">
    {/* Geometric Background */}
    <div className="absolute top-0 right-0 w-[45%] h-full transform skew-x-[-12deg] translate-x-12 z-0 shadow-2xl" style={{ borderLeft: `8px solid ${accentColor}`, backgroundColor: bgPrimary }} />
    
    <div className="relative z-10 w-full h-full flex items-center p-10">
      <div className="w-full flex justify-between items-center gap-8">
        <div className="space-y-6 flex-1">
          <div className="space-y-1">
            <SmartTextField text={name || 'Your Name'} maxWidth={240} defaultFontSize={36} minFontSize={16} maxLines={1} className={`font-black tracking-tighter leading-none uppercase ${smartLayout.nameTracking}`} style={{ color: textPrimary }} />
            <div className="h-1.5 w-20 rounded-full" style={{ background: accentColor }} />
            <SmartTextField text={title || 'Job Title'} maxWidth={300} defaultFontSize={12} minFontSize={8} maxLines={1} className="font-bold uppercase tracking-[0.25em] mt-2" style={{ color: textSecondary }} />
          </div>
          
          <div className="space-y-3 pt-4">
            {formData.phone && <ContactRow icon={Phone} text={formData.phone} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={220} />}
            {formData.email && <ContactRow icon={Mail} text={formData.email} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={220} />}
            {formData.location && <ContactRow icon={MapPin} text={formData.location} tP={textPrimary} tS={textSecondary} aC={accentColor} maxW={220} />}
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6 shrink-0 w-[150px]">
          <div className={`w-28 h-28 rounded-[2rem] overflow-hidden flex items-center justify-center bg-white shadow-2xl ring-8 ring-white/10 ${smartLayout.logoScaleClass}`}>
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" /> : <div className="text-4xl font-black text-slate-800">V</div>}
          </div>
          <div className="text-center">
            <SmartTextField text={formData.company || 'Enterprise'} maxWidth={150} defaultFontSize={14} minFontSize={9} maxLines={2} className="font-black uppercase tracking-wider text-center" style={{ color: textPrimary, textAlign: 'center' }} />
            <SmartTextField 
              text={formData.tagline || 'Innovation First'} 
              maxWidth={140} 
              defaultFontSize={9} 
              minFontSize={6} 
              maxLines={2} 
              className="font-bold opacity-70 mt-1 uppercase text-center leading-tight" 
              style={{ color: textSecondary, textAlign: 'center' }} 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
              maxWidth={230} 
              defaultFontSize={34} 
              minFontSize={18} 
              maxLines={1} 
              className={`font-black tracking-tight leading-none uppercase ${smartLayout.nameTracking}`} 
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
              { icon: Globe, text: formData.website || 'website goes here' },
              { icon: MapPin, text: formData.location || 'address goes here, your city' }
            ].map((item, idx) => {
              const itemUrl = item.icon === Globe ? item.text : null;
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
                    href={itemUrl}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION (White Area) */}
        <div className="w-[48%] flex flex-col items-center justify-center pl-16 text-center relative transition-all duration-300">
          {/* Logo & Company */}
          <div className="flex flex-col items-center gap-2 mb-4 mr-0">
             <div className="w-36 h-36 flex items-center justify-center mb-0 drop-shadow-xl">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" style={{ imageRendering: 'high-quality' }} /> 
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
                 defaultFontSize={30} 
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
             { icon: Globe, text: formData.website || "www.reallygreatsite.com" },
             { icon: MapPin, text: formData.location || "123 Anywhere St., Any City" }
           ].map((contact, i) => {
              if(!contact.text) return null;
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
                   />
                </div>
              );
           })}
         </div>

      </div>
    </div>
  );
};


export default BusinessCard;
