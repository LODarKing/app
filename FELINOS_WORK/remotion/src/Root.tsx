import React from 'react';
import { Composition } from 'remotion';
import { Lab } from './felinos/Lab';
import { Pilot, PILOT_DUR } from './felinos/Pilot';
export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: true, audio: true }} />
    <Composition id="PilotoSemLegendas" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: false, audio: true }} />
    <Composition id="Lab" component={Lab} durationInFrames={60} fps={60} width={1080} height={1920} defaultProps={{ view: 'pingo' }} />
  </>
);
