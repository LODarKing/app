// Batom (bala chanfrada, anel metálico rosado, estojo vinho). Origem = centro da face chanfrada,
// que é o ponto que toca os lábios/papel. O corpo sai no sentido +x local; `angle` gira em graus.
import React from 'react';

export const Lipstick: React.FC<{ x: number; y: number; scale: number; angle: number; id?: string }> = ({ x, y, scale, angle, id = 'bt' }) => (
  <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(4)})`}>
    <defs>
      <linearGradient id={`${id}-bala`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FF5C79" /><stop offset="0.28" stopColor="#E3123A" /><stop offset="0.75" stopColor="#B4031F" /><stop offset="1" stopColor="#6E0518" />
      </linearGradient>
      <linearGradient id={`${id}-anel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.22" stopColor="#F7CBD3" /><stop offset="0.5" stopColor="#E59AA8" /><stop offset="0.7" stopColor="#FCE3E8" /><stop offset="1" stopColor="#B86A79" />
      </linearGradient>
      <linearGradient id={`${id}-caixa`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B42A45" /><stop offset="0.2" stopColor="#8F1229" /><stop offset="0.65" stopColor="#6A0A1A" /><stop offset="1" stopColor="#3E0510" />
      </linearGradient>
    </defs>
    <g transform="translate(-30 0)">
      {/* estojo */}
      <rect x={178} y={-46} width={420} height={92} rx={8} fill={`url(#${id}-caixa)`} />
      <rect x={196} y={-36} width={390} height={7} rx={3.5} fill="#FFF1F2" opacity={0.28} />
      {/* anel metálico */}
      <rect x={118} y={-39} width={64} height={78} rx={5} fill={`url(#${id}-anel)`} />
      <rect x={176} y={-46} width={6} height={92} fill="#FFF1F2" opacity={0.9} />
      {/* bala chanfrada */}
      <path d="M 120 -32 L 14 -32 Q 2 -32 4 -22 Q 22 18 52 32 L 120 32 Z" fill={`url(#${id}-bala)`} />
      <path d="M 14 -32 Q 2 -32 4 -22 Q 22 18 52 32 Q 40 4 30 -12 Q 22 -26 14 -32 Z" fill="#8E0320" opacity={0.55} />
      <path d="M 24 -27 L 112 -27" stroke="#FFF1F2" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
    </g>
  </g>
);
