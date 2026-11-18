// Legendas: grupos curtos do roteiro, tempos por palavra da narração. A palavra ainda não dita fica apagada.
import React from 'react';
import { useVideoConfig } from 'remotion';
import L from './legendas.json';
import { COR, FONTE_TITULO, mola } from './lib';

type G = { texto: string; ini: number; fim: number; palavras: number[] };
const GR = L as G[];

function pedacos(txt: string) {
  // *ciano*  _amarelo_  -> lista de palavras com cor
  const out: { w: string; cor: string }[] = []; let cor = COR.branco;
  for (const raw of txt.split(' ')) {
    let w = raw; let c = cor;
    if (w.startsWith('*')) { c = COR.ciano; w = w.slice(1); cor = COR.ciano; }
    if (w.startsWith('_')) { c = COR.amarelo; w = w.slice(1); cor = COR.amarelo; }
    let fecha = false;
    if (w.includes('*')) { w = w.replace('*', ''); fecha = true; }
    if (w.includes('_')) { w = w.replace('_', ''); fecha = true; }
    out.push({ w, cor: c }); if (fecha) cor = COR.branco;
  }
  return out;
}

export const Legendas: React.FC<{ t: number; top?: number; ate?: number }> = ({ t, top = 1456, ate = 1e9 }) => {
  const { fps } = useVideoConfig();
  const g = GR.find((x) => t >= x.ini - 0.05 && t < x.fim);
  if (!g || t >= ate) return null;
  const p = mola(t, g.ini - 0.05, fps, { damping: 18, stiffness: 260 });
  const ws = pedacos(g.texto);
  return (
    <div style={{ position: 'absolute', left: 70, width: 860, top, display: 'flex', justifyContent: 'center' }}>
      <div style={{
        background: 'rgba(9,14,26,0.9)', borderRadius: 16, padding: '14px 30px 18px', transform: `translateY(${(1 - p) * 16}px)`,
        fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 62, lineHeight: 1.12, textAlign: 'center', letterSpacing: -0.5,
      }}>
        {ws.map((w, k) => (
          <span key={k} style={{ color: w.cor, opacity: t >= (g.palavras[k] ?? g.ini) - 0.04 ? 1 : 0.38 }}>{w.w}{k < ws.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </div>
  );
};
