// Boca em estilo editorial: cores chapadas (nude → cereja), contorno fino vinho, brilhos recortados creme.
// O vermelho é revelado por máscaras que seguem o caminho do batom (inferior: dir.→esq.; superior: esq.→dir.).
import React from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { mulberry32 } from '../lib/anim';
// @ts-ignore
import { HIGHLIGHTS, LOWER, MOUTH, UPPER } from '../lettering/lipsPaths.js';

export { UPPER, LOWER };
export const LOWER_SWIPE = 'M 196 16 C 120 70 -120 70 -196 16';
export const UPPER_SWIPE = 'M -196 12 C -140 -18 -72 -46 -34 -36 C -14 -31 -4 -22 0 -17 C 4 -22 14 -31 34 -36 C 72 -46 140 -18 196 12';
export const LOWER_LEN = getLength(LOWER_SWIPE);
export const UPPER_LEN = getLength(UPPER_SWIPE);
export const swipePoint = (which: 'lower' | 'upper', p: number): [number, number] => {
  const d = which === 'lower' ? LOWER_SWIPE : UPPER_SWIPE, L = which === 'lower' ? LOWER_LEN : UPPER_LEN;
  const q = getPointAtLength(d, Math.max(0, Math.min(1, p)) * L);
  return [q.x, q.y];
};

// textura de pigmento: poucas linhas finas, só no vermelho
const r = mulberry32(7);
const LINES = Array.from({ length: 30 }, (_, i) => {
  const up = i < 13, x = -175 + 350 * ((i % (up ? 13 : 17)) + 0.2 + 0.6 * r()) / (up ? 13 : 17);
  const bend = (r() - 0.5) * 10, y0 = up ? -70 : 14, y1 = up ? 12 : 96;
  return { d: `M ${x.toFixed(1)} ${y0} Q ${(x + bend).toFixed(1)} ${(y0 + y1) / 2} ${(x + bend * 0.4).toFixed(1)} ${y1}`, w: 0.8 + r() * 0.9, o: 0.07 + r() * 0.08, up };
});

export const Lips: React.FC<{ id: string; lower: number; upper: number; shine?: number }> = ({ id, lower, upper, shine = 1 }) => {
  const dash = (L: number, p: number) => ({ strokeDasharray: `${L} ${L + 10}`, strokeDashoffset: L * (1 - Math.max(0, Math.min(1, p))) });
  return (
    <g>
      <defs>
        <clipPath id={`${id}-cu`}><path d={UPPER} /></clipPath>
        <clipPath id={`${id}-cl`}><path d={LOWER} /></clipPath>
        <mask id={`${id}-mu`} maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="260">
          {upper > 0.001 && <path d={UPPER_SWIPE} fill="none" stroke="#fff" strokeWidth={104} strokeLinecap="round" style={dash(UPPER_LEN, upper)} />}
        </mask>
        <mask id={`${id}-ml`} maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="260">
          {lower > 0.001 && <path d={LOWER_SWIPE} fill="none" stroke="#fff" strokeWidth={96} strokeLinecap="round" style={dash(LOWER_LEN, lower)} />}
        </mask>
      </defs>
      {/* nude chapado */}
      <path d={UPPER} fill="#C98A8E" />
      <path d={LOWER} fill="#D9A3A5" />
      {/* cereja revelado pelo gesto */}
      <g mask={`url(#${id}-mu)`}>
        <path d={UPPER} fill="#B0021F" />
        <g clipPath={`url(#${id}-cu)`}>{LINES.filter((l) => l.up).map((l, i) => <path key={i} d={l.d} stroke="#4A0010" strokeWidth={l.w} opacity={l.o} fill="none" />)}</g>
      </g>
      <g mask={`url(#${id}-ml)`}>
        <path d={LOWER} fill="#D90429" />
        <path d="M -150 64 C -80 96 80 96 150 64 C 120 92 60 100 0 100 C -60 100 -120 92 -150 64 Z" fill="#A8021F" clipPath={`url(#${id}-cl)`} />
        <g clipPath={`url(#${id}-cl)`}>{LINES.filter((l) => !l.up).map((l, i) => <path key={i} d={l.d} stroke="#4A0010" strokeWidth={l.w} opacity={l.o} fill="none" />)}</g>
      </g>
      {/* contorno fino e linha da boca (traço editorial) */}
      <path d={UPPER} fill="none" stroke="#7B0D1E" strokeWidth={2.2} strokeLinejoin="round" opacity={0.85} />
      <path d={LOWER} fill="none" stroke="#7B0D1E" strokeWidth={2.2} strokeLinejoin="round" opacity={0.85} />
      <path d={MOUTH} stroke="#4A0414" strokeWidth={4.5} strokeLinecap="round" fill="none" />
      {/* brilhos recortados, creme, sem desfoque */}
      <g fill="#FFF6EE" opacity={0.8 * shine}>
        {HIGHLIGHTS.map(([d, o]: [string, number], i: number) => <path key={i} d={d} opacity={o} />)}
      </g>
    </g>
  );
};
