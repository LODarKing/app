// Fundo: trilhas de circuito vetoriais (semente fixa), traçadas aos poucos, com paralaxe leve em relação à câmera.
import React from 'react';
import { COR, lin, mulberry32 } from './lib';

const r = mulberry32(77);
const TRILHAS = Array.from({ length: 18 }, (_, k) => {
  const lado = k % 2; let x = lado ? 1080 + 20 : -20; let y = 120 + r() * 1700;
  const pts: [number, number][] = [[x, y]];
  for (let s = 0; s < 4; s++) {
    x += (lado ? -1 : 1) * (60 + r() * 220); pts.push([x, y]);
    if (s < 3) { y += (r() - 0.5) * 260; pts.push([x, y]); }
  }
  const comp = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  return { pts, comp, ini: r() * 2.2 };
});

export const Circuitos: React.FC<{ t: number; camX: number; camW: number }> = ({ t, camX, camW }) => {
  const par = (camX - 16.5) * -8 + (58 - camW) * 0;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', transform: `translateX(${par}px)` }}>
      {TRILHAS.map((tr, k) => {
        const p = lin(t, tr.ini, tr.ini + 2.2, 0, 1);
        const fim = tr.pts[tr.pts.length - 1];
        return (
          <g key={k} opacity={0.16}>
            <polyline points={tr.pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={COR.ciano} strokeWidth={2.5}
              strokeDasharray={tr.comp} strokeDashoffset={tr.comp * (1 - p)} />
            {p > 0.98 && <rect x={fim[0] - 7} y={fim[1] - 7} width={14} height={14} fill="none" stroke={COR.ciano} strokeWidth={2.5} />}
          </g>
        );
      })}
    </svg>
  );
};
