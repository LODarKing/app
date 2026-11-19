// Desenha uma composição de lettering (lockup) a partir dos esqueletos. `reveal(palavra, traço)` devolve o
// progresso 0–1 de cada traço (revelação por caminho); sem ele, tudo aparece completo.
import React from 'react';
// @ts-ignore — módulos JS puros, compartilhados com a exportação de SVG
import { buildLockup, PALETTE } from '../lettering/lockups.js';
// @ts-ignore
import { monoD, nibOutline, swellOutline } from '../lettering/engine.js';
import { mulberry32 } from '../lib/anim';

export type Reveal = (wi: number, st: any) => number;
const ALL: Reveal = () => 1;

export const PigmentDefs: React.FC<{ id: string; color: string }> = ({ id, color }) => {
  const r = mulberry32(31);
  const lines = Array.from({ length: 22 }, () => ({ y: r() * 80, h: 0.5 + r() * 1.4, o: 0.03 + r() * 0.07, c: r() > 0.5 ? '#FFF6EE' : '#5A0012' }));
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={80} height={80} patternTransform="rotate(-35)">
      <rect width={80} height={80} fill={color} />
      {lines.map((l, i) => <rect key={i} x={0} y={l.y} width={80} height={l.h} fill={l.c} opacity={l.o} />)}
    </pattern>
  );
};

export function strokeShape(w: any, st: any, p: number, key: string | number, fill: string) {
  if (!st.pts || p <= 0) return null;
  if (w.tool === 'mono') return <path key={key} d={monoD(st.pts, p)} fill="none" stroke={fill} strokeWidth={w.opts.width} strokeLinecap="round" strokeLinejoin="round" />;
  const d = w.tool === 'nib' ? nibOutline(st.pts, { ...w.opts, seed: w.word * 100 + st.li * 10 + st.si + 1, capStart: st.hidden ? 'round' : 'bevel', capEnd: st.hiddenEnd ? 'round' : 'bevel', ...(st.hidden ? { pIn: 0.3 } : {}), ...(st.hiddenEnd ? { pOut: 0.55 } : {}), ...(st.loop ? { pIn: 1, pOut: 0 } : {}) }, p) : swellOutline(st.pts, w.opts, p);
  return d ? <path key={key} d={d} fill={fill} /> : null;
}

export const Lettering: React.FC<{ v: number; reveal?: Reveal; id?: string; only?: number[] }> = ({ v, reveal = ALL, id = 'lt', only }) => {
  const L = buildLockup(v);
  return (
    <g>
      <defs><PigmentDefs id={`${id}-pig`} color={PALETTE.cherry} /></defs>
      {L.words.map((w: any, wi: number) => (only && !only.includes(wi) ? null : (
        <g key={wi}>
          {w.strokes.map((st: any, k: number) => strokeShape(w, st, reveal(wi, st), k, w.pigment ? `url(#${id}-pig)` : w.color))}
        </g>
      )))}
    </g>
  );
};
