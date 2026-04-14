import React, { useState, useLayoutEffect, useRef } from 'react';

const SmartTextField = ({
  text,
  maxWidth = 200,
  defaultFontSize = 24,
  minFontSize = 10,
  maxLines = 1,
  className = '',
  style = {},
  href = null
}) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    if (!text || !containerRef.current || !textRef.current) return;

    const containerWidth = maxWidth;
    const textWidth = textRef.current.scrollWidth;

    if (textWidth > containerWidth && maxLines === 1) {
      const newScale = containerWidth / textWidth;
      setScale(Math.max(newScale, 0.3));
    } else {
      setScale(1);
    }
  }, [text, maxWidth, maxLines]);

  if (!text) return null;

  const content = (
    <div
      ref={textRef}
      style={{
        display: 'inline-block',
        fontSize: `${defaultFontSize}px`,
        transform: maxLines === 1 ? `scale(${scale})` : 'none',
        transformOrigin: style.textAlign === 'right' ? 'right center' : 
                         style.textAlign === 'center' ? 'center center' : 'left center',
        transition: 'transform 0.2s ease-out',
        width: 'max-content',
        maxWidth: maxLines === 1 ? 'none' : `${maxWidth}px`,
        wordBreak: maxLines > 1 ? 'break-word' : 'normal',
      }}
    >
      {text}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        ...style,
        maxWidth: `${maxWidth}px`,
        width: 'fit-content',
        overflow: 'visible',
        whiteSpace: maxLines === 1 ? 'nowrap' : 'normal',
      }}
    >
      {href ? (
        <a 
          href={href.startsWith('http') ? href : `https://${href}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-75 transition-opacity inline-block cursor-pointer pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      ) : content}
    </div>
  );
};

export default SmartTextField;
