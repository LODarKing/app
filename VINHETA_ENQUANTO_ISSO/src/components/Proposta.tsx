// Pranchas das três propostas de lettering (composição final de cada uma, para comparação).
import React from 'react';
import { AbsoluteFill } from 'remotion';
// @ts-ignore
import { buildLockup, PALETTE } from '../lettering/lockups.js';
import { CITY, OUTLINE_D } from '../mapa/geo';
import { Background } from './Background';
import { Grain, World } from './MainComposition';
import { Lettering } from './Lettering';
import { Lips } from './Lips';

export const Proposta: React.FC<{ v: number }> = ({ v }) => {
  const L = buildLockup(v);
  const cam = { s: L.map.scale, anchor: [CITY[0] + L.map.shift[0], CITY[1] + L.map.shift[1]] as [number, number], e: 1 };
  const marks = L.words.flatMap((w: any) => w.strokes.filter((s: any) => s.mark).map((s: any) => s.mark));
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.blush, overflow: 'hidden' }}>
      <Background t={3.9} zoom={1} />
      <World t={3.9} cam={cam} id={`p${v}`} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {L.rule && (
          <g stroke={PALETTE.cherry} strokeWidth={4} strokeLinecap="round" fill="none">
            <path d={`M ${L.rule.x0} ${L.rule.y} L ${L.rule.x1} ${L.rule.y}`} />
            <path d={`M ${L.rule.x0} ${L.rule.y} L ${L.rule.x0} 1010`} />
          </g>
        )}
        <Lettering v={v} id={`pl${v}`} />
        {L.kisses && marks.map((m: number[], i: number) => (
          <g key={i} transform={`translate(${m[0]} ${m[1]}) rotate(${-12 + i * 9}) scale(0.13)`}><Lips id={`k${v}${i}`} lower={1} upper={1} /></g>
        ))}
      </svg>
      <Grain frame={0} />
    </AbsoluteFill>
  );
};
