import { getColor, getPalette } from 'colorthief';
import tinycolor from 'tinycolor2';

/**
 * Extracts accessible and aesthetic colors from a logo.
 * ColorThief v3 returns Color objects with .hex(), .rgb(), .array() methods.
 * Implements WCAG contrast checks and 'Negative Space' logic for white logos.
 */
export const extractColorsFromLogo = async (logoUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;

    img.onload = async () => {
      try {
        // v3 API: returns Color objects directly — use .hex() to get the hex string
        const dominantColor = await getColor(img);
        const palette = await getPalette(img, 6);

        const primaryHex = dominantColor.hex();
        const paletteHex = palette.map(c => c.hex());

        // Find non-white colors in the palette for Negative Space logic
        const brandColors = paletteHex.filter(c => tinycolor(c).getLuminance() < 0.92);

        let finalPrimary = primaryHex;
        let finalSecondary = paletteHex[1] || primaryHex;
        const isWhiteLogo = tinycolor(primaryHex).getLuminance() > 0.95;

        // --- NEGATIVE SPACE LOGIC ---
        // If logo dominant color is white, use the real brand color from palette
        if (isWhiteLogo && brandColors.length > 0) {
          finalPrimary = brandColors[0];
          finalSecondary = '#ffffff';
        }

        // --- ACCESSIBILITY (WCAG) LOGIC ---
        // Sort palette from darkest to lightest for contrast matching
        const sortedByDarkness = [...paletteHex].sort(
          (a, b) => tinycolor(a).getLuminance() - tinycolor(b).getLuminance()
        );
        const darkestColor = sortedByDarkness[0];

        const bgObj = tinycolor(finalPrimary);
        let finalText = '#0f172a'; // Default dark

        if (bgObj.isDark()) {
          finalText = '#ffffff';
        } else {
          // WCAG 2.1 level AA: contrast ratio must be at least 4.5:1
          const contrast = tinycolor.readability(finalPrimary, darkestColor);
          finalText = contrast > 4.5 ? darkestColor : '#0f172a';
        }

        resolve({
          primary: finalPrimary,
          secondary: finalSecondary,
          accent: brandColors[1] || brandColors[0] || paletteHex[1] || primaryHex,
          text: finalText,
          isWhiteLogo
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
  });
};
