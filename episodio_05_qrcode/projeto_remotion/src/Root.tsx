import React from 'react';
import { Composition, Still } from 'remotion';
import { Piloto } from './Piloto';
import { Episodio } from './Episodio';
import { Capa } from './Capa';
import TL from './timeline.json';

export const FPS = 30;
export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Piloto} width={1080} height={1920} fps={FPS}
      durationInFrames={Math.round(TL.piloto.duracao * FPS)} />
    <Composition id="Episodio" component={Episodio} width={1080} height={1920} fps={FPS}
      durationInFrames={Math.round(TL.episodio.duracao * FPS)} />
    <Still id="Capa" component={Capa} width={1080} height={1920} />
  </>
);
