// Mapa de Amontada desenhado pelo batom: o traço sai do canto da boca, sobe pela estrada até Icaraí/Moitas
// e contorna o município (oeste com o batom, leste sozinho). No beijo, o rosa preenche a partir da sede.
import React from 'react';
import T from '../timeline.json';
import { easeOutCubic, mulberry32, prog, springish } from '../lib/anim';
import { trailQ } from '../lib/choreo';
import { CITY, EAST, OUTLINE_D, PLACES, SECONDARY, TRAIL } from '../mapa/geo';
import { COLORS } from '../lib/layout';

const order = (() => { const r = mulberry32(42); return PLACES.map((_, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.i); })();
const dash = (len: number, p: number) => ({ strokeDasharray: `${len.toFixed(1)} ${(len + 20).toFixed(1)}`, strokeDashoffset: (len * (1 - p)).toFixed(2) });

export const MapDrawAnimation: React.FC<{ t: number; id?: string }> = ({ t, id = 'mp' }) => {
  const q = trailQ(t);
  const fillR = 900 * easeOutCubic(prog(t, T.preenchimento[0], T.preenchimento[1]));
  const ring = prog(t, T.beijoMapa, T.beijoMapa + 0.5);
  const [d0, d1] = T.detalhesMapa;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-fill`}><circle cx={CITY[0]} cy={CITY[1]} r={fillR} /></clipPath>
      </defs>
      {fillR > 0 && (
        <g clipPath={`url(#${id}-fill)`}>
          <path d={OUTLINE_D} fill={COLORS.pink} transform="translate(16 18)" opacity={0.9} />
          <path d={OUTLINE_D} fill={COLORS.fill} />
        </g>
      )}
      {SECONDARY.map((s, i) => {
        const p = easeOutCubic(prog(t, d0 + i * 0.05, d0 + i * 0.05 + 0.26));
        return p > 0 ? <path key={i} d={s.d} fill="none" stroke="#FFF7F8" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={dash(s.len, p)} /> : null;
      })}
      {q > 0.0005 && <path d={EAST.d} fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={dash(EAST.len, q)} />}
      {q > 0.0005 && <path d={TRAIL.d} fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={dash(TRAIL.len, q)} />}
      {ring > 0 && ring < 1 && (
        <circle cx={CITY[0]} cy={CITY[1]} r={30 + 190 * easeOutCubic(ring)} fill="none" stroke={COLORS.red} strokeWidth={10 * (1 - ring)} />
      )}
      {order.map((i, k) => {
        const s = springish(prog(t, d0 + 0.06 + k * 0.03, d0 + 0.06 + k * 0.03 + 0.45));
        const p = PLACES[i];
        return s > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={8 * s} fill="#FFF7F8" stroke={COLORS.red} strokeWidth={3.5 * Math.min(1, s)} /> : null;
      })}
    </g>
  );
};
