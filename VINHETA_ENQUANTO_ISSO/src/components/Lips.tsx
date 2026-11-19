// Boca estilizada (coordenadas locais ~400 × 160, centro em 0,10). O vermelho é revelado por máscaras
// que seguem o caminho do batom (inferior: direita→esquerda; superior: esquerda→direita).
import React from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { mulberry32 } from '../lib/anim';

export const UPPER = 'M -200 5 C -150 -20 -96 -64 -50 -63 C -26 -63 -12 -46 0 -43 C 12 -46 26 -63 50 -63 C 96 -64 150 -20 200 5 C 150 7 112 3 62 7 C 32 10 13 17 0 17 C -13 17 -32 10 -62 7 C -112 3 -150 7 -200 5 Z';
export const LOWER = 'M -200 5 C -150 9 -110 14 -62 12 C -32 11 -13 20 0 20 C 13 20 32 11 62 12 C 110 14 150 9 200 5 C 172 52 104 92 0 92 C -104 92 -172 52 -200 5 Z';
const MOUTH = 'M -200 5 C -150 8 -110 9 -62 10 C -32 11 -13 18.5 0 18.5 C 13 18.5 32 11 62 10 C 110 9 150 8 200 5';
export const LOWER_SWIPE = 'M 196 16 C 120 70 -120 70 -196 16';
export const UPPER_SWIPE = 'M -196 12 C -140 -18 -72 -46 -34 -36 C -14 -31 -4 -22 0 -17 C 4 -22 14 -31 34 -36 C 72 -46 140 -18 196 12';
export const LOWER_LEN = getLength(LOWER_SWIPE);
export const UPPER_LEN = getLength(UPPER_SWIPE);
export const swipePoint = (which: 'lower' | 'upper', p: number): [number, number] => {
  const d = which === 'lower' ? LOWER_SWIPE : UPPER_SWIPE, L = which === 'lower' ? LOWER_LEN : UPPER_LEN;
  const q = getPointAtLength(d, Math.max(0, Math.min(1, p)) * L);
  return [q.x, q.y];
};

// linhas verticais finas dos lábios (textura), posições com semente
const r = mulberry32(7);
const LINES = Array.from({ length: 46 }, (_, i) => {
  const up = i < 20, x = -185 + 370 * ((i % (up ? 20 : 26)) + 0.2 + 0.6 * r()) / (up ? 20 : 26);
  const bend = (r() - 0.5) * 10, y0 = up ? -70 : 14, y1 = up ? 12 : 96;
  return { d: `M ${x.toFixed(1)} ${y0} Q ${(x + bend).toFixed(1)} ${(y0 + y1) / 2} ${(x + bend * 0.4).toFixed(1)} ${y1}`, w: 0.9 + r() * 1.2, o: 0.10 + r() * 0.12, up };
});

export const Lips: React.FC<{ id: string; lower: number; upper: number; shine?: number }> = ({ id, lower, upper, shine = 1 }) => {
  const dash = (L: number, p: number) => ({ strokeDasharray: `${L} ${L + 10}`, strokeDashoffset: L * (1 - Math.max(0, Math.min(1, p))) });
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-nu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B4636C" /><stop offset="1" stopColor="#C98A8F" />
        </linearGradient>
        <radialGradient id={`${id}-nl`} cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#D79CA0" /><stop offset="0.7" stopColor="#C4808A" /><stop offset="1" stopColor="#A9606A" />
        </radialGradient>
        <linearGradient id={`${id}-ru`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B0031F" /><stop offset="0.75" stopColor="#D90429" /><stop offset="1" stopColor="#8E0320" />
        </linearGradient>
        <radialGradient id={`${id}-rl`} cx="0.5" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#F01D43" /><stop offset="0.55" stopColor="#D90429" /><stop offset="1" stopColor="#8A0320" />
        </radialGradient>
        <clipPath id={`${id}-cu`}><path d={UPPER} /></clipPath>
        <clipPath id={`${id}-cl`}><path d={LOWER} /></clipPath>
        <mask id={`${id}-mu`} maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="260">
          {upper > 0.001 && <path d={UPPER_SWIPE} fill="none" stroke="#fff" strokeWidth={104} strokeLinecap="round" style={dash(UPPER_LEN, upper)} />}
        </mask>
        <mask id={`${id}-ml`} maskUnits="userSpaceOnUse" x="-260" y="-120" width="520" height="260">
          {lower > 0.001 && <path d={LOWER_SWIPE} fill="none" stroke="#fff" strokeWidth={96} strokeLinecap="round" style={dash(LOWER_LEN, lower)} />}
        </mask>
      </defs>
      {/* base nude */}
      <path d={UPPER} fill={`url(#${id}-nu)`} />
      <path d={LOWER} fill={`url(#${id}-nl)`} />
      {/* batom vermelho revelado pelo gesto */}
      <g mask={`url(#${id}-mu)`}><path d={UPPER} fill={`url(#${id}-ru)`} /></g>
      <g mask={`url(#${id}-ml)`}><path d={LOWER} fill={`url(#${id}-rl)`} /></g>
      {/* textura de linhas */}
      <g clipPath={`url(#${id}-cu)`}>{LINES.filter((l) => l.up).map((l, i) => <path key={i} d={l.d} stroke="#4A0010" strokeWidth={l.w} opacity={l.o} fill="none" />)}</g>
      <g clipPath={`url(#${id}-cl)`}>{LINES.filter((l) => !l.up).map((l, i) => <path key={i} d={l.d} stroke="#4A0010" strokeWidth={l.w} opacity={l.o} fill="none" />)}</g>
      {/* sombra interna junto à linha da boca e borda inferior */}
      <g clipPath={`url(#${id}-cl)`}><path d={MOUTH} stroke="#3B0010" strokeWidth={14} opacity={0.25} fill="none" transform="translate(0 4)" /></g>
      <path d={MOUTH} stroke="#4A0414" strokeWidth={4} strokeLinecap="round" fill="none" />
      {/* brilho especular (formas recortadas, sem desfoque) */}
      <g opacity={0.55 * shine} fill="#FFF1F2">
        <path d="M -78 50 C -60 40 -22 38 -4 44 C -24 50 -58 56 -78 50 Z" />
        <path d="M 30 47 C 44 42 66 42 74 46 C 62 51 42 52 30 47 Z" opacity={0.7} />
        <path d="M -66 -48 C -54 -56 -38 -57 -30 -53 C -40 -49 -56 -46 -66 -48 Z" opacity={0.65} />
        <path d="M 40 -52 C 50 -56 62 -55 68 -50 C 58 -48 48 -48 40 -52 Z" opacity={0.5} />
      </g>
    </g>
  );
};
