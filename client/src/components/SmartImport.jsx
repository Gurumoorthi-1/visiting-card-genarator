import React, { useState } from 'react';
import { UploadCloud, FileJson, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize PDF.js worker securely with correct unpkg CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const SmartImport = ({ setFormData, showToast }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processJSON = (data) => {
    try {
      let name = '';
      let title = '';
      let company = '';
      let email = data.emailAddress || data.email || '';
      let phone = data.phoneNumber || data.phone || '';

      if (data.firstName && data.lastName) {
        name = `${data.firstName} ${data.lastName}`;
      } else if (data.name) {
        name = data.name;
      }

      if (data.headline) {
        title = data.headline;
      } else if (data.experience && data.experience.length > 0) {
        title = data.experience[0].title;
      }

      if (data.experience && data.experience.length > 0) {
        company = data.experience[0].companyName || data.experience[0].company;
      }

      // Generate a simple tagline if applicable
      let tagline = '';
      if (title && company) {
        tagline = `${title} at ${company}`;
      } else if (title) {
        tagline = `Professional ${title}`;
      }

      setFormData(prev => ({
        ...prev,
        name: name || prev.name,
        title: title || prev.title,
        company: company || prev.company,
        email: email || prev.email,
        phone: phone || prev.phone,
        tagline: tagline || prev.tagline
      }));
      
      showToast('Magic Fill Complete (100% Free)!', 'success');
    } catch (e) {
      showToast('Error parsing JSON file natively.', 'error');
    }
  };

  const PDF_SYSTEM_PROMPT = `You are a LinkedIn PDF profile parser agent.

The user will paste raw text extracted from a LinkedIn PDF export or generic resume.
Text may be messy, unstructured, or have formatting artifacts.

Your job:
1. Parse the messy text intelligently 
2. Identify and extract ONLY the requested fields
3. Return ONLY valid JSON — no explanation

Output schema (always return all fields, use empty string if not found):
{
  "name": "Full name",
  "title": "Current job title or designation",
  "company": "Current company name",
  "email": "Primary email",
  "phone": "Phone number with country code",
  "location": "City, Country",
  "website": "Personal or company website"
}

Important:
- PDF text often has line-break artifacts — reconstruct sentences intelligently
- If multiple emails exist, pick the most professional-looking one
- Map the extracted 'role' to the 'title' field directly
`;

  const extractWithAI = async (textPayload, systemInstruction) => {
    if (!genAI) {
      showToast('No Gemini API Key found.', 'error');
      return;
    }
    
    try {
      const model = genAI.getGenerativeModel({ 
         model: "gemini-2.5-flash",
         systemInstruction: systemInstruction
      });
      
      // Limit payload to 3500 characters (approx 1 full page) to save massive tokens
      const promptText = textPayload.substring(0, 3500);
      const prompt = `Extract the profile data from the following text and return ONLY valid JSON.\n\nPayload:\n${promptText}`;
      
      const result = await model.generateContent(prompt);
      const output = result.response.text();
      
      // Extract JSON from output
      const jsonStr = output.replace(/```json|```/g, '').trim();
      const data = JSON.parse(jsonStr);

      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== ""))
      }));
      
      showToast('Magic Fill Complete!', 'success');
    } catch (e) {
      console.error("AI Parse Error:", e);
      showToast('Error analyzing file with AI.', 'error');
    }
  };

  const processPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= Math.min(pdf.numPages, 2); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }
      await extractWithAI(fullText, PDF_SYSTEM_PROMPT);
    } catch (e) {
      console.error(e);
      showToast('Error reading PDF file.', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    showToast('Processing Profile...', 'info');

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        processJSON(JSON.parse(text));
      } else if (file.name.endsWith('.pdf')) {
        await processPDF(file);
      } else {
        showToast('Only .json or .pdf formats supported.', 'error');
      }
    } catch (e) {
      showToast('Error handling the file.', 'error');
    } finally {
      setIsProcessing(false);
      e.target.value = null; 
    }
  };

  return (
    <div className="mt-4 mb-2 p-3 bg-white/60 border border-slate-200 rounded-xl relative overflow-hidden transition-all shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-700">
          <UploadCloud className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-wider">Smart Import Profile</span>
        </div>
      </div>
      
      <label className={`flex flex-col items-center justify-center w-full ${isProcessing ? 'h-12' : 'h-16'} border border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-all`}>
        {isProcessing ? (
          <div className="flex items-center gap-2">
             <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
             <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Extracting details...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] text-slate-600 font-bold">Upload LinkedIn Export or Resume</span>
             <div className="flex gap-4 mt-0.5">
               <div className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors">
                 <FileJson className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold tracking-widest">.JSON</span>
               </div>
               <div className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors">
                 <FileText className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold tracking-widest">.PDF</span>
               </div>
             </div>
          </div>
        )}
        <input type="file" className="hidden" accept=".json,.pdf" onChange={handleFileUpload} disabled={isProcessing} />
      </label>
    </div>
  );
};

export default SmartImport;
