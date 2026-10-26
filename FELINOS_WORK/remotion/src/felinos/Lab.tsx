// Bancada de testes: poses isoladas para conferência (npx remotion still src/index.ts Lab --props='{"view":"pingo"}').
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PingoSit, PingoLeap } from './Pingo';
import { BigCat } from './BigCat';
export const Lab: React.FC<{ view?: string }> = ({ view = 'pingo' }) => (
  <AbsoluteFill style={{ background: '#CFE8F2' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {view === 'pingo' ? <>
        <PingoSit p={{ x: 290, y: 820, s: 0.9, tilt: 0, dilate: 0.3 }} id="a" />
        <PingoSit p={{ x: 800, y: 820, s: 0.9, tilt: 14, dilate: 0.8, look: [6, 4], blink: 0.5, earR: -12 }} id="b" />
        <PingoSit p={{ x: 290, y: 1500, s: 0.9, crouch: 1, dilate: 1, earL: -25, earR: -25 }} id="c" />
        <PingoLeap p={{ x: 800, y: 1500, s: 0.8, meow: 0, dilate: 0.9 }} id="d" />
        <g transform="translate(540 1780) scale(0.5)"><PingoSit p={{ x: 0, y: 0, s: 1, meow: 0.8, blink: 1 }} id="e" /></g>
      </> : null}
      {view === 'cats' ? <>
        <BigCat kind="jaguar" pose={{ x: 520, y: 520, s: 1.1, walk: 0.1, moving: 1 }} t={0} id="j" />
        <BigCat kind="tiger" pose={{ x: 500, y: 1080, s: 1.0, walk: 0.4, moving: 1 }} t={0} id="ti" />
        <BigCat kind="lion" pose={{ x: 480, y: 1700, s: 1.0, walk: 0, moving: 0, jaw: 1, headRot: -12 }} t={0} id="l" />
      </> : null}
    </svg>
  </AbsoluteFill>
);
