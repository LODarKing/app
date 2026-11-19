import React from 'react';
import { Composition } from 'remotion';
import { DURATION, FPS, HEIGHT, WIDTH } from './config/timeline';
import { Vinheta } from './Vinheta';

export const Root: React.FC = () => (
  <>
    <Composition
      id="Vinheta"
      component={Vinheta}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ modo: 'completo', comAudio: true }}
    />
    <Composition
      id="VinhetaAlfaElementos"
      component={Vinheta}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ modo: 'alfaElementos', comAudio: false }}
    />
    <Composition
      id="VinhetaAlfaTransicao"
      component={Vinheta}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ modo: 'alfaTransicao', comAudio: false }}
    />
  </>
);
