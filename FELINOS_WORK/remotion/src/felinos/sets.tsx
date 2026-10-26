// Cenários do piloto em camadas (paralaxe): mesa de estudos, floresta tropical, floresta asiática, savana.
// Cada cenário recebe a câmera (deslocamento horizontal) e o tempo; tudo é função pura do tempo.
import React from 'react';
import { shape, curve, ellipse, scallop, f, lerp, clamp, rrect, poly } from '../lib/paths';

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const Canopy: React.FC<{ cx: number; cy: number; r: number; base: string; shade: string; hi?: string; seed: number; line?: string }> = ({ cx, cy, r, base, shade, hi, seed, line }) => {
  const pts: number[][] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pts.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 0.85]); }
  const d = scallop(pts, 13, r * 0.16, seed), id = `cn${seed}`;
  return <g>
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <path d={d} fill={base} stroke={line || 'none'} strokeWidth={line ? 4 : 0} />
    <g clipPath={`url(#${id})`}>
      <path d={scallop(pts.map(([x, y]) => [x + r * 0.18, y + r * 0.26]), 13, r * 0.14, seed + 3)} fill={shade} />
      {hi ? <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.4} ry={r * 0.24} fill={hi} opacity={0.7} transform={`rotate(-17 ${cx - r * 0.35} ${cy - r * 0.4})`} /> : null}
    </g>
  </g>;
};

/** folha grande (costela central + nervuras) */
export const Leaf: React.FC<{ x: number; y: number; len: number; w: number; rot: number; c: string; c2: string; line?: string; split?: boolean }> = ({ x, y, len, w, rot, c, c2, line = '#183D22', split }) => {
  const d = shape([[0, 0, 1], [len * 0.25, -w * 0.9], [len * 0.65, -w * 0.8], [len, 0, 1], [len * 0.65, w * 0.8], [len * 0.25, w * 0.9]]);
  return <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
    <path d={d} fill={c} stroke={line} strokeWidth={5} strokeLinejoin="round" />
    <path d={shape([[0, 0, 1], [len * 0.3, w * 0.1], [len * 0.7, w * 0.1], [len, 0, 1], [len * 0.65, w * 0.78], [len * 0.25, w * 0.88]])} fill={c2} />
    <path d={`M0 0 L${len} 0`} stroke={line} strokeWidth={4} opacity={0.6} />
    {[0.2, 0.35, 0.5, 0.65, 0.8].map((k, i) => <path key={i} d={`M${f(len * k)} 0 L${f(len * (k + 0.1))} ${f(-w * 0.7 * (1 - Math.abs(k - 0.45)))} M${f(len * k)} 0 L${f(len * (k + 0.1))} ${f(w * 0.7 * (1 - Math.abs(k - 0.45)))}`} stroke={line} strokeWidth={2.5} opacity={0.4} />)}
    {split ? [0.3, 0.5, 0.7].map((k, i) => <path key={`s${i}`} d={poly([[len * k, -w * 0.95], [len * (k + 0.06), -w * 0.3], [len * (k + 0.1), -w * 0.95]])} fill="#000" opacity={0} />) : null}
  </g>;
};

// ---------------------------------------------------------------- mesa de estudos (área externa)
export const StudySet: React.FC<{ t: number; zoom: number; cx: number; cy: number; children?: React.ReactNode }> = ({ t, zoom, cx, cy, children }) => {
  const sway = (k: number) => Math.sin(t * 1.1 + k) * 4;
  // câmera: zoom em torno de (cx, cy) levado ao centro da tela
  const cam = (depth: number) => { const z = 1 + (zoom - 1) * depth; return `translate(540 960) scale(${f(z)}) translate(${f(-lerp(540, cx, depth))} ${f(-lerp(960, cy, depth))})`; };
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5DB7EA" /><stop offset="0.55" stopColor="#CDEFF8" /><stop offset="1" stopColor="#E9F7E4" /></linearGradient>
        <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C98C52" /><stop offset="1" stopColor="#A86C38" /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#ssky)" />
      <g transform={cam(0.25)} filter="url(#blur6)">
        <path d="M-200 900 C100 760 360 820 600 760 C820 700 1040 760 1300 720 L1300 1300 L-200 1300 Z" fill="#9FD58A" />
        {[[-40, 620, 230], [260, 560, 260], [620, 600, 240], [960, 560, 280], [1180, 640, 220]].map(([x, y, r], i) => <g key={i}>
          <rect x={x - 18} y={y + r * 0.5} width={36} height={420} fill="#7A5232" />
          <Canopy cx={x + sway(i) * 0.5} cy={y} r={r} base="#5FAE52" shade="#4C9645" hi="#7DC567" seed={i + 11} />
        </g>)}
      </g>
      <g transform={cam(0.6)} filter="url(#blur3)">
        {[[80, 1000, 120], [300, 1030, 100], [820, 1010, 130], [1040, 1040, 110]].map(([x, y, r], i) => <Canopy key={i} cx={x} cy={y + sway(i + 4) * 0.3} r={r} base="#4F9F46" shade="#3D873B" hi="#6CBB58" seed={i + 31} />)}
        {/* banco de madeira e mochila ao fundo */}
        <path d={rrect(640, 1060, 300, 28, 10)} fill="#9C6B3E" stroke="#5A3920" strokeWidth={5} />
        <path d="M670 1088 L660 1170 M910 1088 L920 1170" stroke="#5A3920" strokeWidth={14} strokeLinecap="round" />
        <path d={shape([[700, 1060], [705, 990], [740, 965], [790, 970], [815, 1000], [812, 1060]])} fill="#2F7050" stroke="#183D2B" strokeWidth={5} />
        <path d={rrect(722, 1010, 72, 34, 10)} fill="#245A40" stroke="#183D2B" strokeWidth={4} />
      </g>
      <g transform={cam(1)}>
        {/* tampo da mesa em perspectiva */}
        <path d="M-120 1130 L1200 1130 L1320 1980 L-240 1980 Z" fill="url(#wood)" stroke="#5A3920" strokeWidth={6} />
        {[1, 2, 3, 4].map((i) => <path key={i} d={`M${-120 + i * 330} 1130 L${-240 + i * 390} 1980`} stroke="#8E5A2E" strokeWidth={4} opacity={0.7} />)}
        {[1170, 1240, 1330, 1450, 1610, 1810].map((y, i) => <path key={`g${i}`} d={curve([[-200, y], [200, y + 6], [600, y - 4], [1000, y + 5], [1300, y]])} stroke="#B87A42" strokeWidth={3} fill="none" opacity={0.6} />)}
        <path d="M-120 1130 L1200 1130" stroke="#E2A869" strokeWidth={8} />
        {/* objetos de estudo: lupa, caderno, folhas, cantil, Diário da Criação */}
        <g transform="translate(860 1300) rotate(-12)">
          <path d={rrect(-120, -80, 240, 170, 16)} fill="#7A3B2A" stroke="#3E1D14" strokeWidth={6} />
          <path d={rrect(-108, -70, 216, 150, 10)} fill="#94503A" />
          <path d="M-108 -54 L108 -54 M-108 66 L108 66" stroke="#E7B65A" strokeWidth={4} />
          <g transform="translate(0 6) scale(0.9)" fill="#F3C25A" stroke="#7A4A16" strokeWidth={3}>
            <path d={ellipse(0, 14, 24, 20)} />{[[-30, -12], [-11, -26], [11, -26], [30, -12]].map(([x, y], i) => <path key={i} d={ellipse(x, y, 10, 13)} />)}
          </g>
          <path d={rrect(-120, 74, 240, 16, 6)} fill="#F2E6CC" stroke="#3E1D14" strokeWidth={4} />
        </g>
        <g transform="translate(170 1290) rotate(10)">
          <path d={rrect(-110, -70, 200, 140, 10)} fill="#FFF7E2" stroke="#5A3920" strokeWidth={5} />
          {[-40, -15, 10, 35].map((y, i) => <path key={i} d={`M-90 ${y} L70 ${y}`} stroke="#9CC4E0" strokeWidth={3} />)}
          <path d="M-100 -70 L-100 70" stroke="#E5484D" strokeWidth={3} />
          <path d="M40 90 L130 -40" stroke="#5A3920" strokeWidth={18} strokeLinecap="round" /><path d="M40 90 L130 -40" stroke="#FFD43B" strokeWidth={11} strokeLinecap="round" />
        </g>
        <g transform="translate(300 1560) rotate(-20)">
          <circle r={70} fill="#CFEFFF" opacity={0.55} stroke="#3B3B3B" strokeWidth={14} />
          <circle r={70} fill="none" stroke="#9AA5B1" strokeWidth={6} />
          <path d="M50 50 L130 130" stroke="#6E4425" strokeWidth={26} strokeLinecap="round" />
          <path d="M-30 -36 Q-10 -48 14 -44" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
        <Leaf x={700} y={1580} len={150} w={48} rot={-30} c="#70C94A" c2="#5BB13C" />
        <Leaf x={780} y={1640} len={120} w={40} rot={10} c="#E2A13A" c2="#C9842A" line="#6E4425" />
        <g transform="translate(70 1180)">
          <path d={rrect(-46, -120, 92, 150, 40)} fill="#3F7F5A" stroke="#1E3F2C" strokeWidth={5} />
          <path d={rrect(-22, -150, 44, 36, 8)} fill="#9AA5B1" stroke="#1E3F2C" strokeWidth={5} />
          <path d="M-40 -60 L40 -60" stroke="#2A5A40" strokeWidth={8} />
        </g>
        {children}
      </g>
    </svg>
  );
};


// moita de samambaia (primeiro plano do chão)
const Fern: React.FC<{ x: number; y: number; s: number; t: number; c: string; c2: string; seed: number }> = ({ x, y, s, t, c, c2, seed }) => (
  <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
    {[-70, -45, -20, 5, 30, 55, 80].map((a, k) => {
      const r = ((a + 3 * Math.sin(t * 1.3 + seed + k)) * Math.PI) / 180, L = 150 + rnd(seed + k) * 60;
      const tip = [Math.sin(r) * L, -Math.cos(r) * L * 0.8];
      const fr = [];
      for (let j = 1; j < 8; j++) { const q = j / 8, px = tip[0] * q, py = tip[1] * q + 18 * q * q * Math.abs(Math.sin(r)), w = 26 * (1 - q * 0.7); fr.push(<path key={j} d={`M${f(px)} ${f(py)} l${f(-w * Math.cos(r) - 6)} ${f(-w * Math.sin(r) - 10)} M${f(px)} ${f(py)} l${f(w * Math.cos(r) - 6)} ${f(w * Math.sin(r) - 10)}`} stroke={k % 2 ? c : c2} strokeWidth={9} strokeLinecap="round" />); }
      return <g key={k}><path d={`M0 0 Q${f(tip[0] * 0.5)} ${f(tip[1] * 0.6)} ${f(tip[0])} ${f(tip[1])}`} stroke={c2} strokeWidth={6} fill="none" />{fr}</g>;
    })}
  </g>
);

// ---------------------------------------------------------------- floresta tropical (onça-pintada)
export const RainforestBack: React.FC<{ t: number; cam: number }> = ({ t, cam }) => {
  const L = (depth: number) => `translate(${f(-cam * depth)} 0)`;
  return (
    <g>
      <defs>
        <linearGradient id="rfsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE6A8" /><stop offset="0.5" stopColor="#5FA65A" /><stop offset="1" stopColor="#2E6B3A" /></linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6C8" stopOpacity={0.55} /><stop offset="1" stopColor="#FFF6C8" stopOpacity={0} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#rfsky)" />
      <g transform={L(0.15)}>
        {Array.from({ length: 9 }, (_, i) => { const x = -100 + i * 190, w = 40 + rnd(i) * 40; return <g key={i}><rect x={x} y={0} width={w} height={1500} fill="#3E7E46" opacity={0.6} /><Canopy cx={x + w / 2} cy={260 + rnd(i + 3) * 200} r={180 + rnd(i + 5) * 60} base="#3F8A49" shade="#33753D" seed={i + 51} /></g>; })}
      </g>
      {/* feixes de luz */}
      {[0, 1, 2].map((i) => <path key={i} d={`M${200 + i * 300 - cam * 0.1} 0 L${300 + i * 300 - cam * 0.1} 0 L${520 + i * 300 - cam * 0.1} 1500 L${360 + i * 300 - cam * 0.1} 1500 Z`} fill="url(#ray)" opacity={0.5 + 0.2 * Math.sin(t * 1.5 + i)} />)}
      <g transform={L(0.45)}>
        {Array.from({ length: 7 }, (_, i) => { const x = -60 + i * 300 + rnd(i + 9) * 80, w = 70 + rnd(i + 2) * 40; return <g key={i}>
          <path d={`M${x} 0 L${x + w} 0 L${x + w + 20} 1420 L${x - 20} 1420 Z`} fill="#5A3B25" stroke="#2C1B10" strokeWidth={6} />
          <path d={`M${x + w * 0.6} 0 L${x + w} 0 L${x + w + 20} 1420 L${x + w * 0.6 + 10} 1420 Z`} fill="#4A2F1C" />
          <path d={curve([[x + w * 0.5, 0], [x + w * 0.5 + 40 * Math.sin(t + i), 400], [x + w * 0.5 - 20, 800]])} stroke="#3D8A3C" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>; })}
        {Array.from({ length: 8 }, (_, i) => <Canopy key={i} cx={-40 + i * 230} cy={120 + rnd(i) * 140} r={200} base="#2F7A3A" shade="#24632E" hi="#3F9449" seed={i + 71} />)}
      </g>
      {/* chão da floresta */}
      <g transform={L(1)}>
        <path d={`M-400 1380 C0 1350 400 1400 800 1370 C1200 1345 1600 1395 2400 1370 L2400 2200 L-400 2200 Z`} fill="#3E6B2E" />
        <path d={`M-400 1410 C0 1395 400 1430 800 1405 C1200 1390 1600 1425 2400 1405 L2400 2200 L-400 2200 Z`} fill="#4E7F36" />
        <path d={`M-400 1520 C0 1500 400 1540 800 1515 C1200 1495 1600 1530 2400 1510 L2400 2200 L-400 2200 Z`} fill="#3B6A2C" />
        {Array.from({ length: 40 }, (_, i) => <ellipse key={`lf${i}`} cx={-300 + i * 70 + rnd(i + 3) * 40} cy={1440 + rnd(i + 8) * 300} rx={14} ry={6} fill={i % 3 ? '#8A6A2E' : '#A8823A'} opacity={0.7} transform={`rotate(${f(rnd(i) * 180)} ${f(-300 + i * 70 + rnd(i + 3) * 40)} ${f(1440 + rnd(i + 8) * 300)})`} />)}
        {Array.from({ length: 9 }, (_, i) => <Fern key={`fn${i}`} x={-260 + i * 300 + rnd(i + 2) * 80} y={1560 + rnd(i + 5) * 120} s={1.1 + rnd(i) * 0.5} t={t} c="#3E8E3A" c2="#2C6E2C" seed={i} />)}
        {Array.from({ length: 22 }, (_, i) => { const x = -300 + i * 120 + rnd(i) * 60; return <g key={i} transform={`translate(${f(x)} ${f(1385 + rnd(i + 4) * 30)})`}>
          {[-50, -25, 0, 25, 50].map((a, k) => <path key={k} d={`M0 0 Q${f(Math.sin((a * Math.PI) / 180) * 60)} -60 ${f(Math.sin((a * Math.PI) / 180) * 110)} ${f(-70 + Math.abs(a) * 0.6)}`} stroke="#2F6B30" strokeWidth={9} fill="none" strokeLinecap="round" />)}
        </g>; })}
      </g>
    </g>
  );
};
export const RainforestFront: React.FC<{ t: number; cam: number }> = ({ t, cam }) => (
  <g transform={`translate(${f(-cam * 1.7)} 0)`}>
    {Array.from({ length: 8 }, (_, i) => {
      const x = -200 + i * 420, top = i % 2 === 0;
      return <g key={i}>
        <Leaf x={x} y={top ? -40 : 1980} len={420} w={130} rot={top ? 60 + 10 * Math.sin(t * 1.4 + i) : -70 + 8 * Math.sin(t * 1.2 + i)} c="#2E8B3E" c2="#257434" />
        <Leaf x={x + 160} y={top ? -60 : 2000} len={360} w={110} rot={top ? 100 + 8 * Math.sin(t * 1.1 + i) : -110 + 8 * Math.sin(t * 1.3 + i)} c="#3A9C47" c2="#2E8B3E" />
      </g>;
    })}
  </g>
);

// ---------------------------------------------------------------- floresta asiática (tigre): bambus e névoa
export const AsiaBack: React.FC<{ t: number; cam: number }> = ({ t, cam }) => {
  const L = (d: number) => `translate(${f(-cam * d)} 0)`;
  const bamboo = (x: number, w: number, c: string, c2: string, k: number) => <g key={k}>
    <rect x={x} y={-20} width={w} height={1500} fill={c} />
    <rect x={x + w * 0.6} y={-20} width={w * 0.4} height={1500} fill={c2} />
    {Array.from({ length: 8 }, (_, j) => <rect key={j} x={x - 3} y={60 + j * 180 + rnd(k + j) * 40} width={w + 6} height={8} rx={4} fill={c2} />)}
    {Array.from({ length: 4 }, (_, j) => <Leaf key={`l${j}`} x={x + w / 2} y={150 + j * 300 + rnd(k * 3 + j) * 80} len={110} w={22} rot={(j % 2 ? -30 : 210) + 8 * Math.sin(t * 1.5 + k + j)} c={c} c2={c2} line="#1F4A2A" />)}
  </g>;
  return (
    <g>
      <defs><linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCEFE6" /><stop offset="0.6" stopColor="#9CC9A8" /><stop offset="1" stopColor="#5E9468" /></linearGradient></defs>
      <rect width={1080} height={1920} fill="url(#asky)" />
      <g transform={L(0.15)} opacity={0.5}>{Array.from({ length: 14 }, (_, i) => bamboo(-100 + i * 110, 26, '#7FB58A', '#6EA37A', i + 100))}</g>
      <rect width={1080} height={1920} fill="#E6F4EC" opacity={0.25} />
      <g transform={L(0.5)}>{Array.from({ length: 10 }, (_, i) => bamboo(-80 + i * 210 + rnd(i) * 60, 44, '#4E9A5A', '#3E8249', i + 200))}</g>
      <g transform={L(1)}>
        <path d="M-400 1390 C0 1370 500 1405 900 1380 C1300 1360 1800 1400 2400 1385 L2400 2200 L-400 2200 Z" fill="#6E8F4A" />
        <path d="M-400 1420 C0 1410 500 1440 900 1415 C1300 1400 1800 1435 2400 1420 L2400 2200 L-400 2200 Z" fill="#7FA055" />
        <path d="M-400 1530 C0 1515 500 1545 900 1520 C1300 1505 1800 1540 2400 1525 L2400 2200 L-400 2200 Z" fill="#6A8A44" />
        {Array.from({ length: 8 }, (_, i) => <Fern key={`fa${i}`} x={-220 + i * 320 + rnd(i + 12) * 80} y={1580 + rnd(i + 15) * 100} s={1.0 + rnd(i + 1) * 0.4} t={t} c="#5E8F3E" c2="#4A7A30" seed={i + 20} />)}
        {Array.from({ length: 30 }, (_, i) => { const x = -300 + i * 90 + rnd(i) * 40; return <path key={i} d={`M${f(x)} 1405 q-6 -50 -20 -80 M${f(x)} 1405 q4 -60 10 -95 M${f(x)} 1405 q14 -40 34 -66`} stroke="#4F7A35" strokeWidth={6} fill="none" strokeLinecap="round" />; })}
      </g>
    </g>
  );
};
export const AsiaFront: React.FC<{ t: number; cam: number }> = ({ t, cam }) => (
  <g transform={`translate(${f(-cam * 1.8)} 0)`}>
    {Array.from({ length: 6 }, (_, i) => { const x = -300 + i * 520; return <g key={i}>
      <rect x={x} y={-20} width={86} height={1960} fill="#2F6E3A" stroke="#173A20" strokeWidth={6} />
      {Array.from({ length: 6 }, (_, j) => <rect key={j} x={x - 6} y={j * 340 + 80} width={98} height={14} rx={7} fill="#245A2E" />)}
    </g>; })}
  </g>
);

// ---------------------------------------------------------------- savana (leão)
export const SavannaBack: React.FC<{ t: number; zoom: number }> = ({ t, zoom }) => {
  const Z = (d: number) => { const z = 1 + (zoom - 1) * d; return `translate(540 1100) scale(${f(z)}) translate(-540 -1100)`; };
  return (
    <g>
      <defs>
        <linearGradient id="svsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F27B35" /><stop offset="0.45" stopColor="#FDBB4C" /><stop offset="0.75" stopColor="#FFE39A" /><stop offset="1" stopColor="#F4C46A" /></linearGradient>
        <radialGradient id="sun"><stop offset="0" stopColor="#FFF8D8" /><stop offset="0.5" stopColor="#FFE58A" stopOpacity={0.9} /><stop offset="1" stopColor="#FFC24A" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#svsky)" />
      <g transform={Z(0.1)}>
        <circle cx={300} cy={760} r={330} fill="url(#sun)" />
        <circle cx={300} cy={760} r={130} fill="#FFF3C4" />
      </g>
      <g transform={Z(0.25)}>
        <path d="M-200 1060 C100 1000 300 1040 520 1010 C760 980 900 1030 1300 1000 L1300 1300 L-200 1300 Z" fill="#D9963F" />
        {/* acácias ao longe */}
        {[[120, 1010, 0.7], [860, 990, 0.9], [1010, 1000, 0.55]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0 L-6 -150 M-4 -110 L-60 -170 M-4 -120 L50 -175" stroke="#5A3418" strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d="M-170 -170 C-140 -230 140 -240 170 -180 C120 -150 -120 -145 -170 -170 Z" fill="#5E5A22" />
        </g>)}
      </g>
      <g transform={Z(0.6)}>
        <path d="M-200 1180 C200 1120 600 1170 1300 1130 L1300 1920 L-200 1920 Z" fill="#E2A64A" />
        {Array.from({ length: 40 }, (_, i) => { const x = -100 + i * 32 + rnd(i) * 20, h = 50 + rnd(i + 3) * 50, sw = 6 * Math.sin(t * 2 + i * 0.7); return <path key={i} d={`M${f(x)} 1200 q${f(sw * 0.5)} ${f(-h * 0.5)} ${f(sw)} ${f(-h)}`} stroke="#C98A32" strokeWidth={5} fill="none" strokeLinecap="round" />; })}
      </g>
    </g>
  );
};
export const SavannaRock: React.FC = () => (
  <g>
    <path d={shape([[60, 1500], [140, 1380], [300, 1330], [560, 1320], [820, 1340], [960, 1410], [1040, 1520], [1040, 1700], [60, 1700]])} fill="#9C7A5A" stroke="#4A3422" strokeWidth={7} />
    <path d={shape([[100, 1480], [200, 1400], [420, 1372], [700, 1376], [900, 1430], [980, 1520], [980, 1700], [100, 1700]])} fill="#B38E68" />
    <path d={curve([[260, 1430], [330, 1470], [300, 1540]])} stroke="#4A3422" strokeWidth={5} fill="none" opacity={0.6} />
    <path d={curve([[760, 1420], [700, 1480], [740, 1560]])} stroke="#4A3422" strokeWidth={5} fill="none" opacity={0.6} />
  </g>
);
export const SavannaFront: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 46 }, (_, i) => { const x = -40 + i * 26 + rnd(i + 7) * 14, h = 120 + rnd(i + 2) * 160, sw = 12 * Math.sin(t * 1.8 + i * 0.5); return <path key={i} d={`M${f(x)} 1940 q${f(sw * 0.4)} ${f(-h * 0.55)} ${f(sw + (rnd(i) - 0.5) * 30)} ${f(-h)}`} stroke={i % 3 ? '#D69A3A' : '#B87B26'} strokeWidth={10} fill="none" strokeLinecap="round" />; })}
  </g>
);
