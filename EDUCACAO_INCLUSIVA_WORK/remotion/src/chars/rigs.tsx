// Rig descriptions for the front-view kids (coordinates = pixels of the vectorized sheets).
import React from 'react';
import { KidRig } from './FrontKid';
import { shape } from '../lib/paths';
import gabData from './data/gabriel.json';
import girlData from './data/girl.json';

/** open palm (fingers along +y = down the forearm at rest), in the wrist's frame */
function palm(ox: number, oy: number, s: number, mirror: boolean, skin: string, shade: string, line: string) {
  const m = mirror ? -1 : 1;
  const Q = (x: number, y: number, c = 0) => [ox + x * s * m, oy + y * s, c];
  const d = shape([Q(-24, -6), Q(24, -6), Q(28, 30), Q(32, 44), Q(44, 52), Q(52, 62, 1), Q(46, 66), Q(30, 60), Q(26, 92, 1), Q(16, 96, 1), Q(12, 64), Q(8, 104, 1), Q(-4, 104, 1), Q(-6, 64), Q(-12, 100, 1), Q(-24, 98, 1), Q(-22, 60), Q(-30, 86, 1), Q(-40, 82, 1), Q(-30, 36)]);
  return (
    <g>
      <path d={d} fill={skin} stroke={line} strokeWidth={2.4 * s} strokeLinejoin="round" />
      <path d={shape([Q(-22, 10), Q(16, 14), Q(10, 44), Q(-18, 46)])} fill={shade} opacity={0.35} />
    </g>
  );
}

export const GABRIEL: KidRig = {
  data: gabData as any, root: [620, 1160], hip: [620, 745],
  skin: '#fbd19e', skinShade: '#f3bd89', pupil: '#5a3220', brow: '#2f2622', lid: '#c4865a',
  eyes: [
    { cx: 537.5, cy: 305, rx: 17.5, ry: 25, px: 539, py: 312, prx: 12.7, pry: 18.5, hl: [532, 297, 5.5] },
    { cx: 702, cy: 297.5, rx: 18, ry: 25.5, px: 702, py: 305, prx: 13.5, pry: 18.5, hl: [696, 290, 5.5] },
  ],
  brows: [
    { a: [510, 262], m: [529, 244], b: [554, 250], w: 9, inner: 'b' },
    { a: [686, 245], m: [706, 237], b: [728, 254], w: 9, inner: 'a' },
  ],
  mouth: { cx: 621, cy: 363, w: 96, depth: 36, dark: '#772928', tongue: '#e38274', line: '#5a1f1e' },
  openHand: (side) => side === 'L' ? palm(455, 778, 1.05, true, '#fbd19e', '#f3bd89', '#e39a60') : palm(785, 778, 1.05, false, '#fbd19e', '#f3bd89', '#e39a60'),
  jointR: 30, hipsPart: 'hips',
};

export const GIRL: KidRig = {
  data: girlData as any, root: [420, 1720], hip: [420, 1000],
  skin: '#fdcd9b', skinShade: '#f4b67c', pupil: '#3f2416', brow: '#5a2414', lid: '#c4865a',
  eyes: [
    { cx: 309, cy: 431, rx: 29, ry: 39, px: 312, py: 441, prx: 21, pry: 29, hl: [304, 423, 7.5] },
    { cx: 527.5, cy: 420, rx: 27.5, ry: 38, px: 526, py: 429, prx: 22, pry: 29, hl: [518, 413, 7.5] },
  ],
  brows: [
    { a: [271, 376], m: [298, 349], b: [330, 352], w: 13, inner: 'b' },
    { a: [505, 334], m: [533, 327], b: [563, 355], w: 13, inner: 'a' },
  ],
  mouth: { cx: 420, cy: 497, w: 140, depth: 58, dark: '#8a2422', tongue: '#ec7a72', line: '#5e1a18', tilt: 5 },
  openHand: (side) => side === 'L' ? palm(160, 1056, 1.5, true, '#fdcd9b', '#f4b67c', '#e39a60') : palm(680, 1056, 1.5, false, '#fdcd9b', '#f4b67c', '#e39a60'),
  jointR: 38, hipsPart: 'skirt',
};
