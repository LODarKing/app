// O traço do batom: desprende-se do canto da boca como uma fita, pousa na borda e desenha só o contorno real de
// Amontada com o mesmo bisel das letras (espessura pela direção, textura de pigmento). No beijo, o rosa preenche a
// partir da sede. Depois, uma segunda fita sai do mapa e desce até o "E" (camada de tela, ver RibbonToTitle).
import React from 'react';
import T from '../timeline.json';
import { P, cubic, easeInOutCubic, easeOutCubic, prog } from '../lib/anim';
import { trailQ, worldToScreen, camera, FM } from '../lib/choreo';
import { CITY, CORNER, OTHER, OUTLINE_D, TRAIL, TRAIL_START } from '../mapa/geo';
import { COLORS } from '../lib/layout';
import { PigmentDefs } from './Lettering';
// @ts-ignore
import { nibOutline, resample, windowPts } from '../lettering/engine.js';

const NIB = { angle: -35, wmin: 3.6, wmax: 12.5, k: 1.5, pIn: 0.9, pOut: 0.1, wobble: 0.07 };
const TR = resample(TRAIL.pts, 1.4), OT = resample(OTHER.pts, 1.4);
const FLIGHT = resample(cubic(CORNER, [CORNER[0] + 70, CORNER[1] - 70], [TRAIL_START[0] - 10, TRAIL_START[1] + 70], TRAIL_START, 40), 0.8);

export const MapDrawAnimation: React.FC<{ t: number; id?: string }> = ({ t, id = 'mp' }) => {
  const q = trailQ(t);
  const fillR = 900 * easeOutCubic(prog(t, T.preenchimento[0], T.preenchimento[1]));
  const ring = prog(t, T.beijoMapa, T.beijoMapa + 0.5);
  const h = 1.45 * easeInOutCubic(prog(t, T.batomVoa[0], T.batomVoa[1] + 0.05));
  const fl = h > 0 && h < 1.45 ? windowPts(FLIGHT, h - 0.45, h) : [];
  return (
    <g>
      <defs>
        <clipPath id={`${id}-fill`}><circle cx={CITY[0]} cy={CITY[1]} r={fillR} /></clipPath>
        <PigmentDefs id={`${id}-pig`} color={COLORS.cherry} />
      </defs>
      {fillR > 0 && (
        <g clipPath={`url(#${id}-fill)`}>
          <path d={OUTLINE_D} fill={COLORS.pink} transform="translate(14 16)" opacity={0.85} />
          <path d={OUTLINE_D} fill={COLORS.fill} />
        </g>
      )}
      {fl.length > 2 && <path d={nibOutline(fl, { ...NIB, wmax: 16, seed: 5 }, 1)} fill={`url(#${id}-pig)`} />}
      {q > 0.0005 && <path d={nibOutline(OT, { ...NIB, seed: 3 }, q)} fill={`url(#${id}-pig)`} />}
      {q > 0.0005 && <path d={nibOutline(TR, { ...NIB, seed: 4 }, q)} fill={`url(#${id}-pig)`} />}
      {ring > 0 && ring < 1 && <circle cx={CITY[0]} cy={CITY[1]} r={30 + 190 * easeOutCubic(ring)} fill="none" stroke={COLORS.cherry} strokeWidth={9 * (1 - ring)} />}
    </g>
  );
};

// segunda fita: sai do encontro dos dois lados do contorno e desce, conduzindo o olhar até o "E"
const END_W = TRAIL.at(TRAIL.len).p as P;
export const RibbonToTitle: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, T.beijoMapa - 0.04, T.enquantoIsso[0] + 0.05);
  if (a <= 0 || a >= 1) return null;
  const s0 = worldToScreen(END_W, camera(T.beijoMapa)), e = FM.eStart as P;
  const path = resample(cubic(s0, [s0[0] - 30, s0[1] + 110], [e[0] + 60, e[1] - 140], e, 40), 1.2);
  const h = 1.5 * easeInOutCubic(a), w = windowPts(path, h - 0.5, h);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <defs><PigmentDefs id="rb-pig" color={COLORS.cherry} /></defs>
      {w.length > 2 && <path d={nibOutline(w, { ...NIB, wmin: 7, wmax: 24, seed: 9 }, 1)} fill="url(#rb-pig)" />}
    </svg>
  );
};
