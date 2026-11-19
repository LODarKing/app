// Saída: duas passadas gigantes com a ponta chanfrada do batom (vinho, depois vermelho), terminando em
// vermelho chapado — corte limpo para o vídeo da notícia.
import React from 'react';
import T from '../timeline.json';
import { mulberry32, prog } from '../lib/anim';
import { COLORS } from '../lib/layout';

const streaks = (() => { const r = mulberry32(9); return Array.from({ length: 14 }, () => ({ y: -1400 + 2800 * r(), w: 2 + 6 * r(), o: 0.08 + 0.12 * r(), l: 200 + 700 * r() })); })();

const Band: React.FC<{ head: number; color: string; sheen: string }> = ({ head, color, sheen }) => (
  <g>
    {/* ponta chanfrada: a borda de ataque é inclinada como a bala do batom */}
    <path d={`M -4000 -2000 L ${head + 260} -2000 L ${head - 260} 2000 L -4000 2000 Z`} fill={color} />
    <path d={`M ${head + 260 - 70} -2000 L ${head - 260 - 70} 2000`} stroke={sheen} strokeWidth={22} opacity={0.35} />
    {streaks.map((s, i) => <rect key={i} x={head - s.l - 120 - (s.y / 2000) * 260} y={s.y} width={s.l} height={s.w} fill={sheen} opacity={s.o} />)}
  </g>
);

export const ExitSwipe: React.FC<{ t: number }> = ({ t }) => {
  const [s0, s1] = T.saida;
  if (t < s0) return null;
  const ease = (x: number) => (1 - Math.cos(Math.PI * x)) / 2;
  const a = ease(prog(t, s0, s1 - 0.12)), b = ease(prog(t, s0 + 0.1, s1));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g transform="translate(540 960) rotate(-62)">
        <Band head={-1450 + 2950 * a} color={COLORS.wine} sheen="#FF4D6D" />
        <Band head={-1450 + 2950 * b} color={COLORS.red} sheen="#FFF1F2" />
      </g>
    </svg>
  );
};
