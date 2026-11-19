// Capa (PNG): a boca já vermelha, grande, sentada sobre o mapa ampliado, com o título completo.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './Background';
import { Grain, World } from './MainComposition';
import { TitleAnimation } from './TitleAnimation';
import { Lipstick } from './Lipstick';

export const Capa: React.FC = () => {
  const t = 3.6; // estado final do mapa e da boca
  const cam = { s: 2.3, anchor: [560, 600] as [number, number], e: 1 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFF1F2', overflow: 'hidden' }}>
      <Background t={1.2} zoom={2.3} />
      <World t={t} cam={cam} id="cp" />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Lipstick x={780} y={640} scale={1.05} angle={34} id="cpb" />
      </svg>
      <TitleAnimation t={99} static />
      <Grain frame={0} />
    </AbsoluteFill>
  );
};
