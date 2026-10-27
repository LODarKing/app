import React from 'react';
import { Composition } from 'remotion';
import { CharTest } from './CharTest';
import { Pilot, PILOT_DUR } from './Pilot';
import { Full, FULL_DUR } from './full/Full';
import { Cover } from './full/Cover';
import { CoverIG } from './full/CoverIG';
export const Root: React.FC = () => (
  <>
    <Composition id="Piloto" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="PilotoSemLegendas" component={Pilot} durationInFrames={Math.round(PILOT_DUR * 60)} fps={60} width={1080} height={1920} defaultProps={{ subs: false }} />
    <Composition id="Completo" component={Full} durationInFrames={FULL_DUR * 60} fps={60} width={1080} height={1920} defaultProps={{ subs: true, audio: true, only: 0 }} />
    <Composition id="CompletoSemLegendas" component={Full} durationInFrames={FULL_DUR * 60} fps={60} width={1080} height={1920} defaultProps={{ subs: false, audio: true, only: 0 }} />
    <Composition id="Capa" component={Cover} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="CapaInstagram" component={CoverIG} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="CharTest" component={CharTest} durationInFrames={180} fps={60} width={1080} height={1920} />
  </>
);
