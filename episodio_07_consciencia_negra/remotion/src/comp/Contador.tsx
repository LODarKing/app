import React from 'react';
import { FONTE, clamp } from '../tema';

const DW = 118, SIZE = 190;
/** Contador mecânico de 4 algarismos (o mesmo da cena 01). Cada algarismo rola quando o de baixo vira.
 *  (cx, base) = centro e linha de base na tela; s = escala (1 = 190 px). */
export const Contador: React.FC<{ v: number; cx: number; base: number; s: number; cor: string; id: string }> = ({ v, cx, base, s, cor, id }) => {
  const H = SIZE * 1.05;
  const dig = [3, 2, 1, 0].map((j) => {
    const p = Math.pow(10, j), b0 = Math.floor(v / p) % 10;
    const frac = j === 0 ? v - Math.floor(v) : clamp((v % p) - (p - 1));
    return b0 + frac;
  });
  return (
    <g transform={`translate(${cx},${base}) scale(${s})`}>
      <defs><clipPath id={id}><rect x={-DW / 2} y={-175} width={DW} height={215} /></clipPath></defs>
      {dig.map((d, i) => {
        const lo = Math.floor(d), fr = clamp((d - lo - 0.5) * 3.2 + 0.5);
        return (
          <g key={i} clipPath={`url(#${id})`} transform={`translate(${(i - 1.5) * DW},0)`}>
            {[lo, lo + 1].map((n, k) => (
              <text key={k} x={0} y={k === 0 ? fr * H : (fr - 1) * H} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={SIZE} fill={cor} stroke="#090E1A" strokeWidth={12} paintOrder="stroke">
                {((n % 10) + 10) % 10}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
};
