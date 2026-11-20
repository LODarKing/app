import React from 'react';
import { Composition } from 'remotion';
import { Piloto, PILOTO_QUADROS } from './Piloto';
import { Episodio, EPISODIO_QUADROS } from './Episodio';
import { FPS, W, H } from './tema';
import { Capa } from './Capa';

export const Root: React.FC = () => (
  <>
    <Composition id="Episodio" component={Episodio} durationInFrames={EPISODIO_QUADROS} fps={FPS} width={W} height={H} defaultProps={{ legenda: true }} />
    <Composition id="EpisodioSemLegenda" component={Episodio} durationInFrames={EPISODIO_QUADROS} fps={FPS} width={W} height={H} defaultProps={{ legenda: false }} />
    <Composition id="Capa" component={Capa} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="Piloto" component={Piloto} durationInFrames={PILOTO_QUADROS} fps={FPS} width={W} height={H} />
  </>
);
