import React from 'react';
import { Composition } from 'remotion';
import { CharTest } from './CharTest';
import { Pilot, PILOT_DUR } from './Pilot';
export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="PilotoSemLegendas" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: false }} />
    <Composition id="CharTest" component={CharTest} durationInFrames={180} fps={60} width={1080} height={1920} />
  </>
);
