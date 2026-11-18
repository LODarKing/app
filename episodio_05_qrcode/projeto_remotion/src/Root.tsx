import React from 'react';
import { Composition } from 'remotion';
import { Piloto } from './Piloto';
import TL from './timeline.json';

export const FPS = 30;
export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Piloto} width={1080} height={1920} fps={FPS}
      durationInFrames={Math.round(TL.piloto.duracao * FPS)} />
  </>
);
