import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const CSS = `
@font-face{font-family:'Playfair Display';font-weight:700;src:url(${staticFile('fonts/playfair-display-latin-700-normal.woff2')}) format('woff2');}
@font-face{font-family:'Playfair Display';font-weight:900;src:url(${staticFile('fonts/playfair-display-latin-900-normal.woff2')}) format('woff2');}
@font-face{font-family:'IBM Plex Mono';font-weight:400;src:url(${staticFile('fonts/ibm-plex-mono-latin-400-normal.woff2')}) format('woff2');}
@font-face{font-family:'IBM Plex Mono';font-weight:500;src:url(${staticFile('fonts/ibm-plex-mono-latin-500-normal.woff2')}) format('woff2');}
@font-face{font-family:'IBM Plex Mono';font-weight:600;src:url(${staticFile('fonts/ibm-plex-mono-latin-600-normal.woff2')}) format('woff2');}
@font-face{font-family:'IBM Plex Mono';font-weight:700;src:url(${staticFile('fonts/ibm-plex-mono-latin-700-normal.woff2')}) format('woff2');}
`;

/** Carrega as duas famílias antes do primeiro quadro (delayRender), para não haver troca de fonte no render. */
export const Fontes: React.FC = () => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    const pesos = ['700 40px "Playfair Display"', '900 40px "Playfair Display"', '400 40px "IBM Plex Mono"', '500 40px "IBM Plex Mono"', '600 40px "IBM Plex Mono"', '700 40px "IBM Plex Mono"'];
    Promise.all(pesos.map((p) => document.fonts.load(p, 'ÁÃÇÉÊÍÓÕÚ 0123456789'))).then(() => continueRender(h));
  }, [h]);
  return <style>{CSS}</style>;
};
