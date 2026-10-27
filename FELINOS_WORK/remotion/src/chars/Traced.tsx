import React from 'react';
export type PartData = { layers: [string, string][]; pivot?: number[] | null };
/** one vectorized rig part: stacked colour layers traced from the model sheet */
export const Traced: React.FC<{ part: PartData }> = ({ part }) => (
  <g>{part.layers.map(([c, d], i) => <path key={i} d={d} fill={c} fillRule="evenodd" />)}</g>
);
