// A boca passando batom (no mundo, sob a câmera) e o batom em primeiro plano (na tela).
import React from 'react';
import { CITY, LIP_SCALE } from '../mapa/geo';
import { lips, lipstick } from '../lib/choreo';
import { Lips } from './Lips';
import { Lipstick } from './Lipstick';

export const LipsInWorld: React.FC<{ t: number; id?: string }> = ({ t, id = 'lb' }) => {
  const l = lips(t);
  return (
    <g transform={`translate(${CITY[0]} ${CITY[1]}) scale(${LIP_SCALE}) rotate(${l.rot.toFixed(2)}) scale(${l.sx.toFixed(4)} ${l.sy.toFixed(4)}) translate(0 -10)`}>
      <Lips id={id} lower={l.lower} upper={l.upper} />
    </g>
  );
};

export const LipstickOverlay: React.FC<{ t: number }> = ({ t }) => {
  const b = lipstick(t);
  if (!b.on) return null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <Lipstick x={b.x} y={b.y} scale={b.scale} angle={b.angle} />
    </svg>
  );
};
