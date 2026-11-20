import React from 'react';
import { AbsoluteFill } from 'remotion';
import { W, H } from '../tema';

/** Textura discreta de papel (feTurbulence com semente fixa: determinística) + vinheta suave de lente.
 *  `quente` (0→1) aquece a textura para o registro documental (cenas históricas). */
export const Papel: React.FC<{ forca: number; quente?: number; semente?: number }> = ({ forca, quente = 0, semente = 7 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: forca }}>
      <filter id={`grao${semente}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={semente} result="n" />
        <feColorMatrix type="matrix" values={`0 0 0 0 ${0.75 + 0.15 * quente}  0 0 0 0 ${0.75 + 0.08 * quente}  0 0 0 0 ${0.78 - 0.1 * quente}  0 0 0 1.6 -0.55`} />
      </filter>
      <rect width={W} height={H} filter={`url(#grao${semente})`} />
    </svg>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="vinheta" cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#vinheta)" />
    </svg>
  </AbsoluteFill>
);
