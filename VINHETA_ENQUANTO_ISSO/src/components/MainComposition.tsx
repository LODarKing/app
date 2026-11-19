import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { mulberry32 } from '../lib/anim';
import { camera } from '../lib/choreo';
import { CITY } from '../mapa/geo';
import { Background } from './Background';
import { ExitSwipe } from './ExitSwipe';
import { LipsInWorld, LipstickOverlay } from './LipstickAnimation';
import { MapDrawAnimation, RibbonToTitle } from './MapDrawAnimation';
import { SoundDesign } from './SoundDesign';
import { TitleLettering } from './TitleLettering';


export const Grain: React.FC<{ frame: number }> = ({ frame }) => {
  const r = mulberry32(1000 + frame);
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grain.png')})`, backgroundPosition: `${Math.floor(r() * 512)}px ${Math.floor(r() * 512)}px`, mixBlendMode: 'overlay', opacity: 0.16, pointerEvents: 'none' }} />;
};

export const World: React.FC<{ t: number; cam: ReturnType<typeof camera>; id?: string }> = ({ t, cam, id = 'w' }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(${cam.anchor[0].toFixed(2)} ${cam.anchor[1].toFixed(2)}) scale(${cam.s.toFixed(5)}) translate(${-CITY[0]} ${-CITY[1]})`}>
      <MapDrawAnimation t={t} id={`${id}m`} />
      <LipsInWorld t={t} id={`${id}l`} />
    </g>
  </svg>
);

export const MainComposition: React.FC<{ audio: boolean }> = ({ audio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFF1F2', overflow: 'hidden' }}>
      <Background t={t} zoom={cam.s} />
      <World t={t} cam={cam} />
      <RibbonToTitle t={t} />
      <TitleLettering t={t} />
      <LipstickOverlay t={t} />
      <ExitSwipe t={t} />
      <Grain frame={frame} />
      <SoundDesign on={audio} />
    </AbsoluteFill>
  );
};
