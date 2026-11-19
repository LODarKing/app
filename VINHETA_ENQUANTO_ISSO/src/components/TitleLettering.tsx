// Lettering autoral em movimento: cada traço se revela pelo próprio caminho, com pequenas defasagens.
//  "Enquanto" nasce do traço que desce do mapa (2,10 s), "Isso" no Mi♭ do motivo (2,375), "em" no respiro (2,5),
//  "Amontada" é escrita pelo batom entre o Lá♭ sincopado (2,75) e o impacto (3,0); as reticências caem uma por nota.
import React from 'react';
import T from '../timeline.json';
import { easeInOutCubic, easeOutCubic, prog } from '../lib/anim';
import { FM, amontadaTipX } from '../lib/choreo';
import { Lettering } from './Lettering';
// @ts-ignore
import { buildLockup } from '../lettering/lockups.js';
// @ts-ignore
import { FINAL_V } from '../lettering/final.js';

const L = buildLockup(FINAL_V);
const nStrokes = (wi: number, li: number) => L.words[wi].strokes.filter((s: any) => s.li === li).length;

function seq(t: number, start: number, dur: number, si: number, n: number) {
  const span = dur / Math.max(1, n), a = start + si * span * 0.75;
  return easeInOutCubic(prog(t, a, a + span * 1.25));
}

export function revealAt(t: number) {
  return (wi: number, st: any) => {
    const n = nStrokes(wi, st.li);
    if (wi === 0) return seq(t, T.enquantoIsso[0] - 0.015 + st.li * 0.034, st.li === 0 ? 0.2 : 0.16, st.si, n);
    if (wi === 1) return seq(t, T.isso + st.li * 0.045, 0.15, st.si, n);
    if (wi === 2) return seq(t, T.em + st.li * 0.06, 0.16, st.si, n);
    // Amontada…
    if (st.li >= 8) { const p = T.pontos[st.li - 8]; return easeOutCubic(prog(t, p, p + 0.07)); }
    const [x0, x1] = FM.letters[st.li], tip = amontadaTipX(t);
    if (t >= T.amontada[1]) return 1;
    const u = (tip - x0) / Math.max(30, x1 - x0);                       // a letra nasce enquanto a ponta passa
    return easeOutCubic(Math.min(1, Math.max(0, (u * n - st.si * 0.7) / 1.3)));
  };
}

export const TitleLettering: React.FC<{ t: number; still?: boolean }> = ({ t, still }) => {
  const tt = still ? 99 : t;
  const d = tt - T.amontada[1];
  const s = d > 0 ? 1 + 0.045 * Math.exp(-d * 9) * Math.cos(d * 26) : 1;      // carimbo no impacto
  const [cx, cy] = FM.amCenter;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <Lettering v={FINAL_V} reveal={revealAt(tt)} id="tl" only={[0, 1, 2]} />
      <g transform={`translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})`}>
        <Lettering v={FINAL_V} reveal={revealAt(tt)} id="ta" only={[3]} />
      </g>
    </svg>
  );
};
