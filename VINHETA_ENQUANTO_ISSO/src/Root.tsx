import React from 'react';
import { Composition, Still } from 'remotion';
import T from './timeline.json';
import { MainComposition } from './components/MainComposition';
import { Capa } from './components/Capa';

export const Root: React.FC = () => (
  <>
    <Composition id="Vinheta" component={MainComposition} width={1080} height={1920} fps={T.fps} durationInFrames={Math.round(T.duracao * T.fps)} defaultProps={{ audio: true }} />
    <Still id="Capa" component={Capa} width={1080} height={1920} />
  </>
);
