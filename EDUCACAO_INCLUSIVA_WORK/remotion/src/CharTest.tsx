import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { FrontKid, KidPose } from './chars/FrontKid';
import { GABRIEL, GIRL } from './chars/rigs';
import { Theo, AXLE, GRIP_R } from './chars/Theo';
import { EXPR0 } from './chars/Face';

const rest = { sh: 0, el: 0, wr: 0, open: 0 };
export const CharTest: React.FC = () => {
  const fr = useCurrentFrame(), { fps } = useVideoConfig(); const t = fr / fps;
  const k = Math.floor(t);            // second 0: rest; 1: wave; 2: worried+blink
  const wave = k === 1, worry = k === 2;
  const ex = { ...EXPR0, smile: worry ? -0.4 : 0.8, open: worry ? 0.02 : 0.7, worry: worry ? 0.9 : 0, browUp: worry ? 6 : 0, blink: worry ? 0.5 : 0, look: [worry ? -6 : 0, 0] as [number, number] };
  const armL = wave ? { sh: 150, el: 25 + 20 * Math.sin(t * 10), wr: 0, open: 1 } : rest;
  const pose = (x: number, y: number, s: number): KidPose => ({ x, y, scale: s, bob: 0, lean: 0, head: worry ? 5 : 0, armL, armR: rest, legL: { dx: 0, dy: 0, rot: 0 }, legR: { dx: 0, dy: 0, rot: 0 }, expr: ex });
  const a = -1.6 + (k === 1 ? 0.8 : 0);
  return (
    <AbsoluteFill style={{ background: '#EAF6FB' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <FrontKid rig={GABRIEL} pose={pose(260, 900, 0.62)} id="g" />
        <FrontKid rig={GIRL} pose={pose(800, 900, 0.42)} id="d" />
        <Theo pose={{ x: 420, y: 1800, scale: 0.68, wheel: t, lean: k === 1 ? 4 : 0, head: worry ? -8 : 0, grip: [AXLE[0] + Math.cos(a) * GRIP_R, AXLE[1] + Math.sin(a) * GRIP_R], expr: ex }} id="t" />
      </svg>
    </AbsoluteFill>
  );
};
