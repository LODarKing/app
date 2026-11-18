import React, { useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const FONTES: [string, string, string][] = [
  ['InterDisplay', 'fonts/InterDisplay-ExtraBold.otf', '800'],
  ['InterDisplay', 'fonts/InterDisplay-Bold.otf', '700'],
  ['JetBrainsMono', 'fonts/jetbrains-mono-latin-500-normal.woff2', '500'],
  ['JetBrainsMono', 'fonts/jetbrains-mono-latin-700-normal.woff2', '700'],
];
export const Fontes: React.FC = () => {
  const [h] = useState(() => {
    const id = delayRender('fontes');
    Promise.all(FONTES.map(([f, src, w]) => new FontFace(f, `url(${staticFile(src)})`, { weight: w }).load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(id));
    return id;
  });
  void h; return null;
};
