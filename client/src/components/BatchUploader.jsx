import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Loader2, LayoutTemplate, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import existing components & configs
import BusinessCard from './BusinessCard';
import { PRESETS } from '../App';

const TEMPLATE_OPTIONS = [
  { id: 'vanguard', name: 'Vanguard Pro Template' },
  { id: 'wave', name: 'Wave Pro Template' },
  { id: 'elegant', name: 'Elegant Pro Template' },
  { id: 'studio', name: 'Studio Pro Template' },
  { id: 'skyline', name: 'Skyline Pro Template' },
  { id: 'ocean', name: 'Ocean Pro Template' }
];

const REQUIRED_FIELDS = [
  { key: 'fullName', label: 'Full Name', aliases: ['name', 'full name', 'employee'] },
  { key: 'jobTitle', label: 'Job Title', aliases: ['title', 'job title', 'role', 'designation'] },
  { key: 'email', label: 'Email', aliases: ['email', 'mail', 'e-mail'] },
  { key: 'phone', label: 'Phone', aliases: ['phone', 'contact', 'mobile', 'cell'] }
];

const BatchUploader = ({ onDataParsed, logoUrl: externalLogo, setLogoUrl, designParams: externalParams }) => {
  const [rawCsvData, setRawCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMap, setColumnMap] = useState({ fullName: '', jobTitle: '', email: '', phone: '' });
  
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [globalCompany, setGlobalCompany] = useState('CardPro Inc.');
  
  // Progress variables
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingData, setProcessingData] = useState(null);

  // Fallback design if not passed through App
  const baseDesign = externalParams || PRESETS['modern'];
  
  const activeDesign = {
    ...baseDesign,
    template: selectedTemplate
  };

  const handleBatchLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && setLogoUrl) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }

    setFileName(file.name);
    setError('');

    // Reset old mappings
    setColumnMap({ fullName: '', jobTitle: '', email: '', phone: '' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError('CSV file is empty or invalid.');
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);

        // Auto-guess columns based on aliases
        const guessedMap = { fullName: '', jobTitle: '', email: '', phone: '' };
        const headersLower = headers.map(h => h.toLowerCase());

        REQUIRED_FIELDS.forEach(field => {
          for (let i = 0; i < headers.length; i++) {
            if (field.aliases.some(alias => headersLower[i].includes(alias))) {
              guessedMap[field.key] = headers[i];
              break;
            }
          }
        });

        setColumnMap(guessedMap);
        
        // Add unique ID for React keys
        const dataWithIds = results.data.map((row, index) => ({ ...row, _id: index.toString() }));
        setRawCsvData(dataWithIds);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const activeMappedData = useMemo(() => {
    return rawCsvData.map(row => ({
      id: row._id,
      fullName: row[columnMap.fullName] || '',
      jobTitle: row[columnMap.jobTitle] || '',
      email: row[columnMap.email] || '',
      phone: row[columnMap.phone] || ''
    }));
  }, [rawCsvData, columnMap]);

  const removeRow = (idToRemove) => {
    const updatedRawData = rawCsvData.filter(row => row._id !== idToRemove);
    setRawCsvData(updatedRawData);
  };

  const clearData = () => {
    setRawCsvData([]);
    setCsvHeaders([]);
    setFileName('');
    setError('');
    setProgress(0);
  };

  const handleMapChange = (fieldKey, headerValue) => {
    setColumnMap(prev => ({ ...prev, [fieldKey]: headerValue }));
  };

  const handleGenerateAll = async () => {
    if (activeMappedData.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    setError('');

    const zip = new JSZip();
    const imgFolder = zip.folder(`Batch_Cards_${selectedTemplate.toUpperCase()}`);

    for (let i = 0; i < activeMappedData.length; i++) {
      const row = activeMappedData[i];
      setProcessingData(row);
      
      // Allow React to re-render the UI with the new processingData row
      await new Promise(resolve => setTimeout(resolve, 200));

      const cardElement = document.getElementById('batch-hidden-card-render');
      if (cardElement) {
        try {
          const dataUrl = await toPng(cardElement, {
            cacheBust: true,
            pixelRatio: 4, 
            style: { transform: 'scale(1)', margin: '0' }
          });
          
          const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
          const cleanName = row.fullName ? row.fullName.replace(/\s+/g, '_') : `Card_${i+1}`;
          const filename = `${cleanName}.png`;
          imgFolder.file(filename, base64Data, { base64: true });
        } catch (err) {
          console.error("Error capturing card for", row, err);
        }
      }
      
      setProgress(Math.round(((i + 1) / activeMappedData.length) * 100));
    }

    try {
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `Batch_Cards_${selectedTemplate}.zip`);
    } catch (err) {
      console.error("Error combining zip:", err);
      setError("Failed to create ZIP file.");
    } finally {
      setIsGenerating(false);
      setProcessingData(null);
    }
  };

  const getRenderData = (row) => ({
    name: row?.fullName || '',
    title: row?.jobTitle || '',
    email: row?.email || '',
    phone: row?.phone || '',
    company: globalCompany, 
    website: '',
    location: '',
    tagline: 'Team Member',
    linkedin: '', twitter: '', facebook: ''
  });

  const [previewId, setPreviewId] = useState(null);

  // Validate previewId against existing data or default to first row
  const validPreviewId = activeMappedData.some(row => row.id === previewId) ? previewId : activeMappedData[0]?.id;
  const previewRowData = activeMappedData.find(row => row.id === validPreviewId) || activeMappedData[0];

  // ... other code ...

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative font-sans">
      
      {/* ── HIDDEN RENDER CONTAINER FOR BATCH EXPORT ── */}
      <div className="fixed top-[-10000px] left-[-10000px] opacity-0 pointer-events-none" aria-hidden="true">
        {processingData && (
          <div id="batch-hidden-card-render" className="inline-block p-4 bg-white/0">
            <BusinessCard 
              formData={getRenderData(processingData)} 
              designParams={activeDesign} 
              logoUrl={externalLogo} 
              isFlipped={false} 
              isBatchExport={true}
            />
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50 border-b border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Batch Generate Cards</h2>
             <p className="text-xs text-slate-500 font-medium tracking-wide">Create print-ready digital cards for your entire team in seconds.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none custom-scrollbar">
            {TEMPLATE_OPTIONS.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`py-2 px-4 rounded-lg text-[10px] font-bold transition-all duration-300 border-2 uppercase tracking-widest whitespace-nowrap ${
                  selectedTemplate === tpl.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white/50 text-slate-500 hover:border-indigo-300 hover:bg-white'
                }`}
              >
                {tpl.name.replace(' Template', '')}
              </button>
            ))}
          </div>
        </div>

        {/* ── UPLOAD AREA ── */}
        {!rawCsvData.length && (
          <div className="relative group flex flex-col items-center justify-center p-8 lg:p-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 shadow-sm">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <UploadCloud className="w-8 h-8" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-slate-700">Click or drag CSV here to upload</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Compatible with any CSV Format</span>
          </div>
        )}

        {/* ── FIELD MAPPING SECTION ── */}
        {rawCsvData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm mb-2">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Map CSV Columns</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {REQUIRED_FIELDS.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                  <div className="relative">
                    <select
                      value={columnMap[field.key]}
                      onChange={(e) => handleMapChange(field.key, e.target.value)}
                      className="w-full p-2.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer outline-none"
                    >
                      <option value="">-- Ignore --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                    <div className={`absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 rounded-full ${columnMap[field.key] ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-slate-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Dynamic Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 flex flex-col gap-2 overflow-hidden"
            >
              <div className="flex justify-between text-xs font-bold text-indigo-700 uppercase tracking-widest">
                <span>Generating Zip File...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2 shadow-inner">
                <motion.div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              {processingData && (
                 <p className="text-[10px] text-slate-500 font-medium italic mt-1 text-right">
                   Processing: {processingData.fullName || 'Unknown'} ...
                 </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PREVIEW & TABLE SPLIT ── */}
      {activeMappedData.length > 0 && (
        <div className={`transition-opacity duration-300 ${isGenerating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* ── CARD PREVIEW SECTION ── */}
            <div className="col-span-12 lg:col-span-5 p-6 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1.5 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded shadow-sm border border-green-200">
                    Live Preview
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {setLogoUrl && (
                    <div className="relative group">
                      <input 
                        type="file" accept="image/*" onChange={handleBatchLogoUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        {externalLogo ? 'Change Logo' : '+ Add Logo'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Batch Global Inputs */}
              <div className="w-full mb-6">
                <input 
                   type="text" 
                   value={globalCompany} 
                   onChange={(e) => setGlobalCompany(e.target.value)} 
                   placeholder="Global Company Name"
                   className="w-full p-2.5 text-xs font-bold text-center text-slate-700 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm outline-none"
                />
              </div>
              
              <div 
                className="relative rounded-[15.6px] shadow-2xl shrink-0 mx-auto bg-transparent flex items-center justify-center transition-all duration-300" 
                style={{ width: '351px', height: '195px' }}
              >
                <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left' }} className="absolute top-0 left-0">
                  <BusinessCard 
                    formData={getRenderData(previewRowData)} 
                    designParams={activeDesign} 
                    logoUrl={externalLogo} 
                    isFlipped={false} 
                    isBatchExport={true}
                  />
                </div>
              </div>
            </div>

            {/* ── TABLE DATA SECTION ── */}
            <div className="col-span-7 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-800 truncate max-w-[200px]">{fileName}</h3>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded shadow-sm border border-indigo-100">
                    {activeMappedData.length} records
                  </span>
                </div>
                <button 
                  onClick={clearData}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-100 hover:bg-red-100 transition-colors shadow-sm"
                >
                  Upload New
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm flex-1 custom-scrollbar bg-white max-h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 text-[10px] uppercase tracking-wider font-black text-slate-500 bg-slate-50 border-y border-slate-200 z-10">
                    <tr>
                      <th className="px-5 py-3">Mapped Name</th>
                      <th className="px-5 py-3">Mapped Title</th>
                      <th className="px-5 py-3 text-right border-l border-slate-100">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {activeMappedData.map((row) => {
                        const isSelected = validPreviewId === row.id;
                        return (
                          <motion.tr 
                            key={row.id}
                            onClick={() => setPreviewId(row.id)}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, backgroundColor: '#fee2e2' }}
                            transition={{ duration: 0.2 }}
                            className={`border-b last:border-0 hover:bg-indigo-50/50 transition-colors cursor-pointer group select-none ${isSelected ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'bg-white border-l-4 border-l-transparent border-slate-100'}`}
                          >
                            <td className={`px-5 py-3 font-semibold truncate max-w-[120px] ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{row.fullName || <span className="text-slate-300 italic">- empty -</span>}</td>
                            <td className={`px-5 py-3 truncate max-w-[150px] ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{row.jobTitle || <span className="text-slate-300 italic">- empty -</span>}</td>
                            <td className="px-5 py-3 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeRow(row.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Exclude from batch"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleGenerateAll}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-8 py-3 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-95 w-full justify-center lg:w-auto ${
                    isGenerating ? 'bg-indigo-400 cursor-not-allowed scale-95 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-2xl'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Archive...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shadow-sm" />
                      Download {activeMappedData.length} Cards
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUploader;
