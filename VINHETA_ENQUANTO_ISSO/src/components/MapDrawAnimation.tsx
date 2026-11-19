// Mapa de Amontada desenhado pelo batom: só o contorno do município, traçado a partir do ponto da borda
// mais perto da boca nos dois sentidos (litoral com o batom, sul sozinho). No beijo, o rosa preenche a partir da sede.
import React from 'react';
import T from '../timeline.json';
import { easeOutCubic, prog } from '../lib/anim';
import { trailQ } from '../lib/choreo';
import { CITY, OTHER, OUTLINE_D, TRAIL } from '../mapa/geo';
import { COLORS } from '../lib/layout';

const dash = (len: number, p: number) => ({ strokeDasharray: `${len.toFixed(1)} ${(len + 20).toFixed(1)}`, strokeDashoffset: (len * (1 - p)).toFixed(2) });

export const MapDrawAnimation: React.FC<{ t: number; id?: string }> = ({ t, id = 'mp' }) => {
  const q = trailQ(t);
  const fillR = 900 * easeOutCubic(prog(t, T.preenchimento[0], T.preenchimento[1]));
  const ring = prog(t, T.beijoMapa, T.beijoMapa + 0.5);
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
      {q > 0.0005 && <path d={OTHER.d} fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={dash(OTHER.len, q)} />}
      {q > 0.0005 && <path d={TRAIL.d} fill="none" stroke={COLORS.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" style={dash(TRAIL.len, q)} />}
      {ring > 0 && ring < 1 && (
        <circle cx={CITY[0]} cy={CITY[1]} r={30 + 190 * easeOutCubic(ring)} fill="none" stroke={COLORS.red} strokeWidth={10 * (1 - ring)} />
      )}
    </g>
  );
};
