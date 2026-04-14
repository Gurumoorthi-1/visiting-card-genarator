import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SmartLayoutEngine - Intelligent Business Card Renderer
 * Automatically scales font and adjusts vertical alignment based on content density.
 */
const SmartLayoutEngine = ({ userData }) => {
  const { name, title, email, website } = userData;

  // 1. Font Size Calculation Logic
  // If Name > 15 characters, reduce from 24px to 18px
  const getNameStyles = () => {
    const isLongName = (name || '').length > 15;
    return {
      fontSize: isLongName ? '18px' : '24px',
      transition: 'font-size 0.3s ease-in-out'
    };
  };

  // 2. Conditional Alignment Logic
  // If website is missing, justify-center to fill vertical space
  const containerClasses = `relative w-full h-full p-8 flex flex-col transition-all duration-500 ease-out ${
    !website ? 'justify-center' : 'justify-between'
  }`;

  return (
    <div 
      className="bg-white shadow-2xl overflow-hidden border border-slate-200 relative group"
      style={{
        width: '3.5in',
        height: '2in',
        maxWidth: '100%',
        margin: '0 auto',
        // Standard business card aspect ratio 3.5 / 2 = 1.75
        borderRadius: '8px'
      }}
    >
      {/* Constraint Box logic to ensure no overflow */}
      <div className={containerClasses}>
        
        {/* Name and Title Block */}
        <div className="space-y-1">
          <motion.h1 
            layout
            style={getNameStyles()}
            className="font-black text-slate-900 leading-tight tracking-tight uppercase"
          >
            {name || 'Your Full Name'}
          </motion.h1>
          <motion.p 
            layout
            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest"
          >
            {title || 'Professional Title'}
          </motion.p>
        </div>

        {/* Contact info Block (Auto centers if website is empty) */}
        <div className={`flex flex-col gap-1.5 ${!website ? 'mt-6' : ''}`}>
          {email && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-medium text-slate-500 lowercase">
                {email}
              </span>
            </motion.div>
          )}

          <AnimatePresence>
            {website && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-medium text-slate-500 lowercase">
                  {website}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Stylistic Element */}
        <motion.div 
          layout
          className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500" 
          animate={{ scaleY: website ? 1 : 0.6 }}
        />
      </div>

      {/* Constraints Indicator for Visual Feedback (can be removed) */}
      <div className="absolute inset-2 border border-dashed border-slate-100 rounded pointer-events-none opacity-40" />
    </div>
  );
};

export default SmartLayoutEngine;
