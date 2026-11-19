import React from 'react';
import { COLORS } from '../config/brand';
import { DURATION, HEIGHT, WIDTH } from '../config/timeline';
import { EASE, mulberry32, prog } from '../lib/motion';

/**
 * Fundo: petróleo chapado, três camadas de linhas finas e formas geométricas
 * que derivam devagar em velocidades diferentes (profundidade), e grão editorial.
 * Nada aqui disputa atenção com o título: opacidades entre 5 % e 11 %.
 */
export const Fundo: React.FC<{ frame: number; x0: number }> = ({ frame, x0 }) => {
  const t = frame / DURATION; // 0→1 ao longo da vinheta
  const desenho = prog(frame, -9, 24, EASE.expoOut); // traçado inicial do círculo grande

  // camada distante: círculos concêntricos no alto à direita
  const cx = 905;
  const cy = 455 - 26 * t;
  const r1 = 560;
  const c1 = 2 * Math.PI * r1;
  const r2 = 405 + 18 * prog(frame, 0, 30, EASE.expoOut);

  // camada do meio: arco grande embaixo à esquerda
  const ay = 1715 - 44 * t;

  // camada próxima: grade de pontinhos (eco da reticência) acima do título
  const gy = 438 - 70 * t;
  const pontos: React.ReactNode[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
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
      <rect width={WIDTH} height={HEIGHT} fill={COLORS.petroleo} />
      <g transform={`rotate(${-40 + 5 * t} ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r1}
          fill="none"
          stroke={COLORS.branco}
          strokeOpacity={0.11}
          strokeWidth={2}
          strokeDasharray={c1}
          strokeDashoffset={c1 * (1 - desenho)}
        />
      </g>
      <g transform={`rotate(${-12 * t} ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r2}
          fill="none"
          stroke={COLORS.branco}
          strokeOpacity={0.15}
          strokeWidth={2}
          strokeDasharray="2 14"
        />
      </g>
      <circle cx={70} cy={ay} r={430} fill="none" stroke={COLORS.branco} strokeOpacity={0.08} strokeWidth={2} />
      {/* régua vertical fina, quase invisível, que dá o eixo editorial à esquerda do bloco */}
      <line
        x1={x0 - 46}
        x2={x0 - 46}
        y1={1260 - 40 * t}
        y2={1260 - 40 * t + 300 * prog(frame, -6, 26, EASE.expoOut)}
        stroke={COLORS.branco}
        strokeOpacity={0.08}
        strokeWidth={2}
      />
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
