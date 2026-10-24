// Vídeo completo (180 s): encadeia as 10 cenas com transições, emblema no canto e legendas dinâmicas.
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender } from 'remotion';
import SCENES from '../scenes.json';
import { GlobalCaptions } from './Captions';
import { transitionStyle, TransitionBand } from './fx';
import { S01 } from './scenes/S01';
import { S02 } from './scenes/S02';
import { S03 } from './scenes/S03';
import { S04 } from './scenes/S04';
import { S05 } from './scenes/S05';
import { S06 } from './scenes/S06';
import { S07 } from './scenes/S07';
import { S08 } from './scenes/S08';
import { S09 } from './scenes/S09';
import { S10 } from './scenes/S10';

export const FULL_DUR = 180;
const COMPS: React.FC<{ t: number }>[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];
// transição usada na ENTRADA de cada cena (a cena 1 não tem)
const TRANS = ['', 'wipe', 'iris', 'wipe', 'iris', 'page', 'page', 'page', 'iris', 'wipe'];
const TD = 0.5;   // duração da transição (s), centrada na fronteira entre as cenas

const fontHandle = typeof document !== 'undefined' ? delayRender('fonts') : 0;
if (typeof document !== 'undefined') {
  const faces = [['Poppins-ExtraBold.ttf', '800'], ['Poppins-Bold.ttf', '700'], ['Poppins-Black.ttf', '900'], ['Poppins-SemiBold.ttf', '600']].map(([file, w]) => new FontFace('Poppins', `url(${staticFile(file)})`, { weight: w }));
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));
}

/** emblema discreto no canto (a partir do fim da abertura, some na tela final) */
const CornerBadge: React.FC<{ t: number }> = ({ t }) => {
  if (t < 3.9 || t > 176.2) return null;
  const a = t > 175.7 ? 1 - (t - 175.7) / 0.5 : 1;
  return <div style={{ position: 'absolute', left: 112 - 55, top: 128 - 46, width: 110, height: 92, opacity: 0.92 * a, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.3))' }}>
    <Img src={staticFile('emblema_recortado.png')} style={{ width: 110, height: 92, objectFit: 'contain' }} />
  </div>;
};

export const Full: React.FC<{ subs?: boolean; audio?: boolean; only?: number }> = ({ subs = true, audio = true, only = 0 }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const layers: React.ReactNode[] = [];
  SCENES.forEach((sc, i) => {
    if (only && only !== i + 1) return;
    const start = sc.start, end = i + 1 < SCENES.length ? SCENES[i + 1].start : FULL_DUR;
    const inStart = i === 0 ? -1 : start - TD / 2, outEnd = i + 1 < SCENES.length ? end + TD / 2 : FULL_DUR + 1;
    if (t < inStart || t > outEnd) return;
    const Comp = COMPS[i];
    const k = i === 0 ? 1 : (t - inStart) / TD;
    const style: React.CSSProperties = k < 1 ? transitionStyle(TRANS[i], k) : {};
    layers.push(<AbsoluteFill key={i} style={{ ...style, overflow: 'hidden' }}><Comp t={t - start} /></AbsoluteFill>);
    if (k > 0 && k < 1) layers.push(<TransitionBand key={`b${i}`} kind={TRANS[i]} k={k} />);
  });
  return (
    <AbsoluteFill style={{ background: '#190C3C' }}>
      {audio ? <Audio src={staticFile('completo_mix.wav')} /> : null}
      {layers}
      <CornerBadge t={t} />
      {subs ? <GlobalCaptions t={t} hide={(tt) => tt < 0.95 || tt > 175.55} /> : null}
    </AbsoluteFill>
  );
};
