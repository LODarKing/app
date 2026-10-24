// Clubhouse set (scene 1) as layered SVG. Set coordinates: px, y down, sidewalk top = 0.
// Porch is 4 steps high (61 px risers, 100 px treads). There is NO ramp: the stairs are the barrier.
import React from 'react';
import { shape, curve, rrect, poly, scallop, f, lerp } from '../lib/paths';

export const STEP = { rise: 61, tread: 100, x0: 210, top: 610, n: 4 };
export const PORCH_Y = -STEP.rise * STEP.n;
export function groundAt(x: number) {
  if (x >= STEP.top) return PORCH_Y;
  if (x < STEP.x0) return 0;
  return -STEP.rise * Math.min(STEP.n, Math.floor((x - STEP.x0) / STEP.tread) + 1);
}
export const stairsProfile = () => poly([[210, 0], [210, -61], [310, -61], [310, -122], [410, -122], [410, -183], [510, -183], [510, -244], [610, -244], [610, 0]], true);

const K = {
  skyTop: '#4FAEE6', skyBot: '#D4F1FB', cloud: '#FFFFFF', cloudShade: '#DCEEF8',
  hillFar: '#A9DD93', hillFarShade: '#97D07F', hillMid: '#7DC566',
  treeFar: '#62B055', treeFarShade: '#4F9C47',
  tree: '#4FA24A', treeShade: '#3D8A3C', treeHi: '#74C35F', trunk: '#7A4B2C', trunkShade: '#5E381F', lineTree: '#2F6B30',
  grass: '#7CC85B', grass2: '#5EAE46', grassLine: '#4E973B',
  walk: '#EEE6D5', walkEdge: '#CFC4AE', walkLine: '#BBAF97',
  stone: '#DACEB7', stoneShade: '#C4B69C', stoneLine: '#A99A7F',
  wall: '#F0D5A4', wallShade: '#DDBA84', plank: '#D8B27C', trim: '#8B5A34', trimShade: '#6E4425', lineWood: '#5A3920',
  door: '#2F7050', doorShade: '#245A40', doorLine: '#183D2B', glass: '#C4E8F6', glass2: '#86C9E8',
  roof: '#C9573D', roofShade: '#A8452F', roofHi: '#DE7051', roofLine: '#7E2F1F',
  concrete: '#DAD6CD', concreteSide: '#C5C0B5', concreteDark: '#A9A398', nosing: '#EFECE6', lineConcrete: '#8E887C',
  rail: '#5F6B78', railHi: '#9AA5B1', pot: '#C46A3E', potShade: '#A55530', leaf: '#4FA24A', leafShade: '#3D8A3C',
  flowers: ['#FFD43B', '#F27BA8', '#FFFFFF'], bunting: ['#211C55', '#13B9C5', '#FFEB00', '#70C94A', '#2851D8', '#F28C28'],
  board: '#C99A5E', paper: ['#FFF4C2', '#FFFFFF', '#CDEBFF', '#FFD9C9'], sign: '#7A4A2A', signFace: '#F7E8C8',
};

const Canopy: React.FC<{ cx: number; cy: number; r: number; c: { base: string; shade: string; hi?: string; line?: string }; seed: number; detail?: boolean }> = ({ cx, cy, r, c, seed, detail }) => {
  const pts: number[][] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 0.85]); }
  const d = scallop(pts, 13, r * 0.16, seed);
  const id = `cp${seed}`;
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={c.base} stroke={c.line || 'none'} strokeWidth={c.line ? 3.5 : 0} />
      <g clipPath={`url(#${id})`}>
        <path d={scallop(pts.map(([x, y]) => [x + r * 0.18, y + r * 0.24]), 13, r * 0.14, seed + 3)} fill={c.shade} />
        <ellipse cx={cx - r * 0.35} cy={cy - r * 0.38} rx={r * 0.42} ry={r * 0.26} fill={c.hi || c.base} opacity={0.75} transform={`rotate(-17 ${cx - r * 0.35} ${cy - r * 0.38})`} />
        {detail ? <>
          <path d={curve([[cx - r * 0.5, cy + r * 0.1], [cx - r * 0.3, cy + r * 0.2], [cx - r * 0.1, cy + r * 0.12]])} stroke={c.shade} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={curve([[cx + r * 0.1, cy - r * 0.3], [cx + r * 0.3, cy - r * 0.2], [cx + r * 0.45, cy - r * 0.28]])} stroke={c.shade} strokeWidth={4} fill="none" strokeLinecap="round" />
        </> : null}
      </g>
    </g>
  );
};

const Cloud: React.FC<{ x: number; y: number; s: number; seed: number }> = ({ x, y, s, seed }) => {
  const pts = [[-120, 20], [-90, -20], [-40, -45], [10, -60], [60, -40], [110, -25], [130, 15], [70, 30], [-20, 34]].map(([a, b]) => [x + a * s, y + b * s]);
  const d = scallop(pts, 9, 26 * s, seed), id = `cl${seed}`;
  return <g><defs><clipPath id={id}><path d={d} /></clipPath></defs><path d={d} fill={K.cloud} /><g clipPath={`url(#${id})`}><rect x={x - 160 * s} y={y + 8 * s} width={320 * s} height={60 * s} fill={K.cloudShade} /></g></g>;
};

const Tree: React.FC<{ x: number; base: number; s: number; seed: number; sway: number }> = ({ x, base, s, seed, sway }) => {
  const c = { base: K.tree, shade: K.treeShade, hi: K.treeHi, line: K.lineTree };
  return (
    <g>
      <path d={shape([[x - 34 * s, base], [x - 22 * s, base - 260 * s], [x - 60 * s, base - 420 * s], [x - 10 * s, base - 380 * s], [x + 10 * s, base - 460 * s], [x + 26 * s, base - 300 * s], [x + 34 * s, base]])} fill={K.trunk} stroke={K.lineWood} strokeWidth={3} />
      <path d={shape([[x + 4 * s, base], [x + 10 * s, base - 300 * s], [x + 26 * s, base - 300 * s], [x + 34 * s, base]])} fill={K.trunkShade} />
      <g transform={`rotate(${f(sway)} ${x} ${base - 420 * s})`}>
        <Canopy cx={x - 120 * s} cy={base - 560 * s} r={190 * s} c={c} seed={seed} detail />
        <Canopy cx={x + 130 * s} cy={base - 600 * s} r={200 * s} c={c} seed={seed + 1} detail />
        <Canopy cx={x} cy={base - 760 * s} r={230 * s} c={c} seed={seed + 2} detail />
      </g>
    </g>
  );
};

export type Cam = { x: number; y: number; zoom: number };
const layerT = (cam: Cam, p: number) => `translate(540 960) scale(${f(cam.zoom)}) translate(${f(-cam.x * p)} ${f(-cam.y * p)})`;

/** everything behind the characters */
export const SetBack: React.FC<{ cam: Cam; t: number }> = ({ cam, t }) => {
  const planks = []; for (let y = -1150; y < -280; y += 38) planks.push(<line key={y} x1={566} y1={y} x2={2400} y2={y} stroke={K.plank} strokeWidth={3} />);
  const stones = [];
  for (let r = 0; r < 4; r++) for (let x = 600 + (r % 2) * 60; x < 2460; x += 120) stones.push(<path key={`${r}-${x}`} d={rrect(x + 4, -240 + r * 60 + 4, 112, 52, 10)} fill={K.stoneShade} opacity={0.55} />);
  const pickets = []; for (let x = -2600; x < 2600; x += 46) pickets.push(<path key={x} d={shape([[x, -6, 1], [x, -118], [x + 15, -134, 1], [x + 30, -118], [x + 30, -6, 1]])} fill="#F8F2E6" stroke="#B9AC92" strokeWidth={2.5} />);
  const sag = (a: number, b: number, k: number) => [lerp(a, b, k), -1150 + 90 * 4 * k * (1 - k)];
  const bunting = [];
  for (const [a, b] of [[612, 1560], [1560, 2420]]) {
    const n = 11;
    bunting.push(<path key={`s${a}`} d={curve(Array.from({ length: 12 }, (_, i) => sag(a, b, i / 11)))} stroke="#5A3920" strokeWidth={3} fill="none" />);
    for (let i = 0; i < n; i++) {
      const p0 = sag(a, b, (i + 0.15) / n), p1 = sag(a, b, (i + 0.85) / n), pm = sag(a, b, (i + 0.5) / n);
      const sw = 3 * Math.sin(t * 3 + i * 0.9 + a);
      bunting.push(<path key={`f${a}-${i}`} d={shape([[p0[0], p0[1], 1], [p1[0], p1[1], 1], [pm[0] + sw, pm[1] + 74, 1]])} fill={K.bunting[i % K.bunting.length]} />);
    }
  }
  const nos = [], risers = [];
  for (let i = 1; i <= 4; i++) {
    const x = STEP.x0 + (i - 1) * STEP.tread, y = -STEP.rise * i;
    nos.push(<path key={`n${i}`} d={rrect(x - 4, y - 2, STEP.top - x + 4, 12, 3)} fill={K.nosing} />);
    risers.push(<path key={`r${i}`} d={poly([[x, y + 10], [x + 26, y + 10], [x + 26, y + STEP.rise], [x, y + STEP.rise]], true)} fill={K.concreteSide} opacity={0.9} />);
  }
  const flowers = [];
  for (let i = 0; i < 40; i++) {
    const x = -2500 + i * 131 + ((i * 41) % 70), y = 90 + ((i * 97) % 380), c = K.flowers[i % 3];
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; flowers.push(<circle key={`${i}-${k}`} cx={x + Math.cos(a) * 8} cy={y + Math.sin(a) * 8} r={6.5} fill={c} />); }
    flowers.push(<circle key={`${i}c`} cx={x} cy={y} r={5} fill="#F28C28" />);
  }
  const tufts = []; for (let i = 0; i < 70; i++) { const x = -2600 + i * 77 + ((i * 37) % 30), y = 62 + ((i * 53) % 260); tufts.push(<path key={i} d={poly([[x - 8, y], [x, y - 18], [x + 4, y], [x + 10, y - 14], [x + 14, y]])} stroke={K.grassLine} strokeWidth={3} fill="none" strokeLinejoin="round" />); }
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.skyTop} /><stop offset="1" stopColor={K.skyBot} /></linearGradient>
        <radialGradient id="sun"><stop offset="0" stopColor="#FFFFFF" stopOpacity={1} /><stop offset="0.25" stopColor="#FFF6C9" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF6C9" stopOpacity={0} /></radialGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.roofHi} /><stop offset="1" stopColor={K.roof} /></linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.wallShade} /><stop offset="0.3" stopColor={K.wall} /><stop offset="1" stopColor={K.wall} /></linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.glass} /><stop offset="1" stopColor={K.glass2} /></linearGradient>
        <linearGradient id="stairs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.concrete} /><stop offset="1" stopColor={K.concreteSide} /></linearGradient>
        <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.grass} /><stop offset="1" stopColor={K.grass2} /></linearGradient>
        <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>
      {/* sky (fixed) */}
      <g transform={layerT(cam, 0)}>
        <rect x={-1600} y={-2600} width={3200} height={5200} fill="url(#sky)" />
        <circle cx={560} cy={-900} r={700} fill="url(#sun)" />
      </g>
      <g transform={layerT(cam, 0.12)}>
        <g transform={`translate(${f(t * 9)} 0)`}>
          {[[-700, -1500, 1.2, 3], [-120, -1720, 0.8, 5], [520, -1380, 1.0, 9], [1150, -1620, 1.3, 13], [1800, -1450, 0.9, 17], [-1300, -1300, 0.9, 21]].map(([x, y, s, sd]) => <Cloud key={sd} x={x} y={y} s={s} seed={sd} />)}
        </g>
      </g>
      <g transform={layerT(cam, 0.3)}>
        <path d={curve([[-2600, -380], [-1800, -720], [-1100, -560], [-300, -800], [500, -600], [1200, -820], [2000, -620], [2900, -760]]) + ' L2900 900 L-2600 900 Z'} fill={K.hillFar} />
        <path d={curve([[-2600, -300], [-1600, -420], [-600, -380], [400, -460], [1400, -400], [2900, -480]]) + ' L2900 900 L-2600 900 Z'} fill={K.hillFarShade} opacity={0.8} />
      </g>
      <g transform={layerT(cam, 0.45)}>
        {Array.from({ length: 26 }, (_, i) => <Canopy key={i} cx={-2400 + i * 200 + ((i * 73) % 60)} cy={-420 - ((i * 53) % 70)} r={70 + ((i * 37) % 50)} c={{ base: K.treeFar, shade: K.treeFarShade }} seed={i * 7 + 1} />)}
        <rect x={-2600} y={-430} width={5600} height={1500} fill={K.hillMid} />
      </g>
      <g transform={layerT(cam, 0.8)}>
        <Tree x={-640} base={-60} s={1.15} seed={31} sway={0.7 * Math.sin(t * 1.3)} />
        <Tree x={-1500} base={-60} s={0.95} seed={41} sway={0.7 * Math.sin(t * 1.3 + 2)} />
        <Tree x={2350} base={-60} s={1.1} seed={51} sway={0.7 * Math.sin(t * 1.3 + 4)} />
        <Tree x={60} base={-90} s={0.8} seed={61} sway={0.7 * Math.sin(t * 1.3 + 6)} />
      </g>
      <g transform={layerT(cam, 0.92)}>
        <path d={rrect(-2600, -96, 5200, 16, 3)} fill="#E6DCC6" stroke="#B9AC92" strokeWidth={2.5} />
        <path d={rrect(-2600, -46, 5200, 16, 3)} fill="#E6DCC6" stroke="#B9AC92" strokeWidth={2.5} />
        {pickets}
        {Array.from({ length: 18 }, (_, i) => <Canopy key={i} cx={-2400 + i * 290 + ((i * 59) % 80)} cy={-60} r={70 + (i % 3) * 18} c={{ base: '#5DAE4F', shade: '#4C9844', hi: '#73C25E', line: '#3B7A36' }} seed={300 + i} />)}
      </g>
      {/* the clubhouse */}
      <g transform={layerT(cam, 1)}>
        <rect x={-3000} y={-40} width={6000} height={60} fill={K.grass2} />
        <path d={shape([[450, -1236, 1], [2400, -1236, 1], [2160, -1540, 1], [700, -1540, 1]])} fill="url(#roof)" stroke={K.roofLine} strokeWidth={3.5} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={480 + i * 26} y={-1290 - i * 52} width={1880 - i * 52} height={6} fill={K.roofShade} opacity={0.8} />)}
        <path d={rrect(430, -1240, 2000, 52, 6)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
        <rect x={560} y={-1190} width={1900} height={930} fill="url(#wall)" stroke={K.lineWood} strokeWidth={3} />
        {planks}
        <rect x={560} y={-1190} width={1900} height={70} fill="#000000" opacity={0.08} />
        <path d={rrect(548, -1190, 40, 930, 4)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
        {/* notice board */}
        <path d={rrect(640, -700, 150, 210, 8)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
        <path d={rrect(652, -688, 126, 186, 4)} fill={K.board} />
        <path d={shape([[662, -676, 1], [714, -680, 1], [716, -612, 1], [664, -608, 1]])} fill={K.paper[0]} />
        <path d={shape([[722, -672, 1], [768, -668, 1], [764, -616, 1], [720, -620, 1]])} fill={K.paper[2]} />
        <path d={shape([[668, -596, 1], [736, -598, 1], [734, -520, 1], [670, -518, 1]])} fill={K.paper[1]} />
        {[[688, -676, '#D6382B'], [744, -668, '#2E5FB8'], [700, -594, '#E9B23A']].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={5} fill={c as string} />)}
        {/* door */}
        <path d={rrect(842, -722, 236, 466, 6)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
        <path d={rrect(866, -700, 188, 440, 4)} fill={K.door} stroke={K.doorLine} strokeWidth={3} />
        <rect x={1010} y={-700} width={44} height={440} fill={K.doorShade} />
        <path d={rrect(892, -540, 136, 120, 6)} fill="none" stroke={K.doorLine} strokeWidth={4} />
        <path d={rrect(892, -396, 136, 110, 6)} fill="none" stroke={K.doorLine} strokeWidth={4} />
        <path d={rrect(892, -676, 136, 112, 10)} fill="url(#glass)" stroke={K.doorLine} strokeWidth={3} />
        <path d={shape([[900, -600], [960, -676], [990, -676], [920, -580]])} fill="#FFFFFF" opacity={0.45} />
        <circle cx={1030} cy={-470} r={10} fill="#E9B23A" stroke="#9C6B10" strokeWidth={2} />
        {/* welcome sign */}
        <path d={rrect(640, -960, 244, 112, 14)} fill={K.sign} stroke={K.lineWood} strokeWidth={3} />
        <path d={rrect(652, -948, 220, 88, 8)} fill={K.signFace} />
        <text x={762} y={-890} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={34} textLength={190} lengthAdjust="spacingAndGlyphs" fill="#5A3920">BEM-VINDOS!</text>
        {/* windows */}
        {[1250, 1700].map((wx) => (
          <g key={wx}>
            <path d={rrect(wx - 20, -780, 330, 360, 8)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
            <path d={rrect(wx, -760, 290, 320, 4)} fill="url(#glass)" stroke={K.lineWood} strokeWidth={3} />
            <path d={shape([[wx + 20, -500], [wx + 150, -760], [wx + 200, -760], [wx + 60, -470]])} fill="#FFFFFF" opacity={0.4} />
            <line x1={wx + 145} y1={-760} x2={wx + 145} y2={-440} stroke={K.trim} strokeWidth={10} />
            <line x1={wx} y1={-600} x2={wx + 290} y2={-600} stroke={K.trim} strokeWidth={10} />
            <path d={rrect(wx - 34, -430, 358, 26, 6)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
            <path d={scallop([[wx, -404], [wx + 290, -404], [wx + 280, -440], [wx + 10, -440]], 12, 12, wx)} fill={K.leaf} />
            {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={wx + 14 + i * 34} cy={-420 - (i % 3) * 10} r={13} fill={K.flowers[i % 3]} />)}
            <path d={rrect(wx - 10, -404, 310, 56, 8)} fill={K.pot} stroke={K.lineWood} strokeWidth={3} />
          </g>
        ))}
        <path d={rrect(1102, -820, 40, 70, 10)} fill="#3B3F45" stroke="#1E2024" strokeWidth={2.5} />
        <path d={rrect(1108, -812, 28, 50, 6)} fill="#FFE8A3" />
        {/* porch plinth + floor lip */}
        <rect x={600} y={-262} width={1860} height={262} fill={K.stone} stroke={K.stoneLine} strokeWidth={3} />
        {stones}
        <path d={rrect(590, -276, 1870, 26, 4)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} />
        <ellipse cx={1500} cy={-250} rx={950} ry={30} fill="#3A2A10" opacity={0.25} filter="url(#blur8)" />
        {[612, 1560, 2420].map((px) => <g key={px}><path d={rrect(px - 18, -1190, 36, 930, 4)} fill={K.trim} stroke={K.lineWood} strokeWidth={3} /><rect x={px + 2} y={-1190} width={16} height={930} fill={K.trimShade} /></g>)}
        <g transform={`translate(0 ${f(2 * Math.sin(t * 2.1))})`}>{bunting}</g>
        <path d={shape([[1170, -376], [1270, -376], [1258, -276, 1], [1182, -276, 1]])} fill={K.pot} stroke={K.lineWood} strokeWidth={3} />
        <Canopy cx={1220} cy={-440} r={90} c={{ base: K.leaf, shade: K.leafShade, hi: K.treeHi, line: K.lineTree }} seed={77} />
        {/* handrail on the wall side of the stairs */}
        <line x1={262} y1={-60} x2={262} y2={-152} stroke={K.rail} strokeWidth={12} strokeLinecap="round" />
        <line x1={440} y1={-170} x2={440} y2={-256} stroke={K.rail} strokeWidth={12} strokeLinecap="round" />
        <line x1={250} y1={-150} x2={612} y2={-360} stroke={K.rail} strokeWidth={14} strokeLinecap="round" />
        <line x1={252} y1={-154} x2={614} y2={-364} stroke={K.railHi} strokeWidth={4} strokeLinecap="round" />
        {/* stairs */}
        <path d={stairsProfile()} fill="url(#stairs)" stroke={K.lineConcrete} strokeWidth={3.5} strokeLinejoin="round" />
        {risers}{nos}
        <rect x={210} y={-14} width={400} height={14} fill={K.concreteDark} opacity={0.5} />
        <ellipse cx={400} cy={-2} rx={260} ry={18} fill="#3A2A10" opacity={0.22} filter="url(#blur8)" />
        {/* sidewalk + lawn */}
        <rect x={-3000} y={0} width={6000} height={46} fill={K.walk} />
        <rect x={-3000} y={30} width={6000} height={16} fill={K.walkEdge} />
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-3000 + i * 160} y1={2} x2={-3000 + i * 160} y2={30} stroke={K.walkLine} strokeWidth={3} />)}
        <rect x={-3000} y={46} width={6000} height={2400} fill="url(#lawn)" />
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={shape([[-3000 + i * 280, 46, 1], [-2860 + i * 280, 46, 1], [-2660 + i * 280, 1400, 1], [-2800 + i * 280, 1400, 1]])} fill="#FFFFFF" opacity={0.05} />)}
        {tufts}
        {[[700, 70, 101], [1420, 84, 103], [2000, 76, 105]].map(([x, r, sd]) => <Canopy key={sd} cx={x} cy={-46} r={r} c={{ base: K.leaf, shade: K.leafShade, hi: K.treeHi, line: K.lineTree }} seed={sd} />)}
        {flowers}
      </g>
    </g>
  );
};

/** foreground bushes + light, drawn over the characters */
export const SetFront: React.FC<{ cam: Cam; t: number }> = ({ cam, t }) => (
  <g>
    <g transform={layerT(cam, 1.25)}>
      <Canopy cx={-760} cy={760} r={230} c={{ base: '#3F8E3E', shade: '#2F7432', hi: '#5DAA4F', line: '#245A28' }} seed={201} detail />
      <Canopy cx={1350} cy={820} r={260} c={{ base: '#3F8E3E', shade: '#2F7432', hi: '#5DAA4F', line: '#245A28' }} seed={203} detail />
    </g>
    <g transform={layerT(cam, 1)} style={{ mixBlendMode: 'screen' }}>
      {[[200, 260, 0.1], [700, 180, 0.08], [1100, 320, 0.07]].map(([x, w, o], i) => (
        <rect key={i} x={x - w / 2} y={-2100} width={w} height={2400} fill="#FFF3C4" opacity={o * (0.75 + 0.25 * Math.sin(t * 0.8 + i * 2))} transform={`rotate(24 ${x} -900)`} filter="url(#blur20)" />
      ))}
      {Array.from({ length: 22 }, (_, i) => {
        const x0 = -400 + ((i * 197) % 1300), y0 = -1200 + ((i * 331) % 1300), ph = i * 1.7, s = 4 + (i % 4) * 1.5;
        return <circle key={i} cx={x0 + 30 * Math.sin(t * 0.5 + ph) + t * 6} cy={y0 + 24 * Math.sin(t * 0.37 + ph * 1.3) - t * 4} r={s} fill="#FFF8D8" opacity={0.35 + 0.3 * Math.sin(t * 1.5 + ph)} filter="url(#blur8)" />;
      })}
    </g>
  </g>
);
export const camT = layerT;
