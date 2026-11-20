import React from 'react';
import { Composition } from 'remotion';
import { Piloto, PILOTO_QUADROS } from './Piloto';
import { FPS, W, H } from './tema';

export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Piloto} durationInFrames={PILOTO_QUADROS} fps={FPS} width={W} height={H} />
  </>
);
