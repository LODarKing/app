// Capa (PNG): a assinatura completa — mapa com o beijo na sede e o lettering, como no quadro final.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from './Background';
import { Grain, World } from './MainComposition';
import { TitleLettering } from './TitleLettering';
import { camera } from '../lib/choreo';

export const Capa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#FFF1F2', overflow: 'hidden' }}>
    <Background t={3.7} zoom={1} />
    <World t={3.7} cam={camera(3.7)} id="cp" />
    <TitleLettering t={99} still />
    <Grain frame={0} />
  </AbsoluteFill>
);
