import React from 'react';
import { COLORS } from '../config/brand';
import { DURATION, HEIGHT, WIDTH } from '../config/timeline';
import { EASE, mulberry32, prog } from '../lib/motion';

/**
 * Fundo: vinho chapado, grade de pontinhos (eco da reticência) que acende na abertura e
 * deriva devagar, e grão editorial. O desenho de linha da vinheta é o mapa de Amontada
 * (components/Mapa.tsx), que fica na camada dos elementos.
 */
export const Fundo: React.FC<{ frame: number; x0: number }> = ({ frame, x0 }) => {
  const t = frame / DURATION; // 0→1 ao longo da vinheta
  const gy = 438 - 70 * t;
  const pontos: React.ReactNode[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      // os pontos acendem da esquerda para a direita na abertura
      const k = prog(frame, -4 + col * 1.1 + row * 0.6, 3 + col * 1.1 + row * 0.6, EASE.expoOut);
      const s = 5 * k;
      pontos.push(
        <rect
          key={`${row}-${col}`}
          x={x0 + col * 30 - s / 2 + 2.5}
          y={gy + row * 30 - (6 * k) / 2 + 3}
          width={s}
          height={6 * k}
          fill={COLORS.branco}
          opacity={0.16}
        />,
      );
    }
  }
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0 }}>
      <rect width={WIDTH} height={HEIGHT} fill={COLORS.fundo} />
      {pontos}
    </svg>
  );
};

/**
 * Grão de filme determinístico: feTurbulence com semente tirada do mulberry32
 * (troca a cada 2 quadros). Mesmo quadro → mesmo grão, sempre.
 */
export const Grao: React.FC<{ frame: number }> = ({ frame }) => {
  const seed = 1 + Math.floor(mulberry32(0xa30 + Math.floor(frame / 2))() * 9999);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', inset: 0, mixBlendMode: 'soft-light' }}>
      <filter id={`grao-${seed}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={WIDTH} height={HEIGHT} filter={`url(#grao-${seed})`} opacity={0.22} />
    </svg>
  );
};
