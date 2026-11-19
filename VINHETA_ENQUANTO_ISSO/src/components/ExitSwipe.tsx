// Saída: uma pincelada gigante de batom (o mesmo bisel das letras, em escala de tela) cobre a composição em
// ziguezague e termina em cereja chapado — corte limpo para a notícia, no mesmo tempo da assinatura sonora.
import React from 'react';
import T from '../timeline.json';
import { prog } from '../lib/anim';
import { COLORS } from '../lib/layout';
import { PigmentDefs } from './Lettering';
// @ts-ignore
import { nibOutline, strokePoints } from '../lettering/engine.js';

// quatro passadas retas (vai e volta), cada uma com o bisel na ponta — sem dobras que se cruzem
const PASSES = ['M -760 2420 L 1840 1560', 'M 1840 1600 L -760 1000', 'M -760 1060 L 1840 260', 'M 1840 320 L -760 -340'].map((d) => strokePoints(d, (x: number, y: number) => [x, y], 6));

export const ExitSwipe: React.FC<{ t: number }> = ({ t }) => {
  const [s0, s1] = T.saida;
  if (t < s0) return null;
  const u = prog(t, s0, s1), e = (1 - Math.cos(Math.PI * u)) / 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <defs><PigmentDefs id="ex-pig" color={COLORS.cherry} /></defs>
      {u >= 1 ? <rect width={1080} height={1920} fill={COLORS.cherry} /> : PASSES.map((pts, k) => {
        const p = Math.min(1, Math.max(0, e * 4.3 - k * 1.05));
        return p > 0 ? <path key={k} d={nibOutline(pts, { angle: -35, wmin: 1060, wmax: 1120, k: 1, pIn: 0.9, pOut: 0, wobble: 0.03, seed: 2 + k }, p)} fill="url(#ex-pig)" /> : null;
      })}
    </svg>
  );
};
