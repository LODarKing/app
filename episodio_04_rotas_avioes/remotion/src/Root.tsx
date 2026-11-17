import React from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { Episode } from './Episode';
import { FPS, W, H } from './theme';
import { PILOTO_S } from './constants';

// fontes locais (OFL): Barlow Condensed (título) e Inter (interface/legendas)
const fontes: [string, string, number][] = [
  ['Barlow Condensed', 'fonts/BarlowCondensed-ExtraBold.ttf', 800],
  ['Barlow Condensed', 'fonts/BarlowCondensed-Bold.ttf', 700],
  ['Inter', 'fonts/Inter-Medium.otf', 500],
  ['Inter', 'fonts/Inter-SemiBold.otf', 600],
  ['Inter', 'fonts/Inter-Bold.otf', 700],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fontes');
  Promise.all(fontes.map(([fam, src, w]) => new FontFace(fam, `url(${staticFile(src)})`, { weight: String(w) }).load().then((f) => (document.fonts as any).add(f))))
    .then(() => continueRender(h));
}

export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Episode} defaultProps={{ ate: 13.1 }} durationInFrames={Math.round(PILOTO_S * FPS)} fps={FPS} width={W} height={H} />
  </>
);
