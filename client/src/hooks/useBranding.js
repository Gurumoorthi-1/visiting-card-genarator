import { useState, useEffect } from 'react';
import { extractColorsFromLogo } from '../utils/colorUtils';
import tinycolor from 'tinycolor2';

/**
 * Custom hook to manage AI-driven branding based on a logo.
 * @param {string} logoUrl - The logo image source.
 * @param {object} designParams - Current design parameters.
 * @param {function} setDesignParams - State setter for design parameters.
 * @param {function} showToast - Toast notification function.
 */
export const useBranding = (logoUrl, designParams, setDesignParams, showToast) => {
  const [isSynced, setIsSynced] = useState(false);
  const [lastLogo, setLastLogo] = useState(null);

  useEffect(() => {
    // If sync is enabled and logo changes (or sync was just turned on)
    if (isSynced && logoUrl && logoUrl !== lastLogo) {
      const syncBranding = async () => {
        try {
          const colors = await extractColorsFromLogo(logoUrl);
          
          // --- NEGATIVE SPACE & ACCESSIBILITY Logic ---
          // Apply Primary for the main stripe/sidebar and Secondary for ground
          setDesignParams(prev => ({
            ...prev,
            bgPrimary: colors.primary,
            bgSecondary: colors.secondary,
            accentColor: colors.accent,
            textPrimary: colors.text,
            textSecondary: tinycolor(colors.text).getLuminance() > 0.5 ? '#94a3b8' : '#64748b'
          }));
          setLastLogo(logoUrl);
          showToast('Design synced with Logo!', 'success');
        } catch (err) {
          console.warn('Branding sync failed', err);
          showToast('Could not sync colors', 'error');
        }
      };
      syncBranding();
    }
  }, [logoUrl, isSynced, setDesignParams, showToast, lastLogo]);

  const toggleSync = () => {
    const nextSync = !isSynced;
    setIsSynced(nextSync);
    // If turning on sync, reset lastLogo so it triggers immediately
    if (nextSync) setLastLogo(null);
    showToast(nextSync ? 'AI Branding Enabled' : 'Manual Mode Enabled', 'info');
  };

  return { isSynced, toggleSync };
};
