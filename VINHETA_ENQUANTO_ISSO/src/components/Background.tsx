// Fundo: papel rosa-claro com três formas orgânicas que respiram devagar (sem gradiente de "título em cima").
import React from 'react';
import { P } from '../lib/anim';

function blob(cx: number, cy: number, R: number, t: number, ph: number, n = 48) {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = R * (1 + 0.075 * Math.sin(3 * a + 0.9 * t + ph) + 0.045 * Math.sin(5 * a - 1.3 * t + 2 * ph) + 0.02 * Math.sin(8 * a + 1.7 * t));
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  // Catmull-Rom fechado → cúbicas
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

export const Background: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  // paralaxe discreta: o fundo acompanha a câmera bem menos que o primeiro plano
  const k = Math.pow(zoom, 0.14);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill="#FFF1F2" />
      <g transform={`translate(540 900) scale(${k.toFixed(4)}) translate(-540 -900)`}>
        <path d={blob(930, 250, 430, t, 0.0)} fill="#FFDCE3" />
        <path d={blob(90, 1580, 560, t, 1.7)} fill="#FFE3E8" />
        <path d={blob(860, 1760, 300, t, 3.1)} fill="#FFD3DC" />
      </g>
    </svg>
  );
};
