// Capa do Instagram — especialidade de MORDOMIA ("Muito além das moedas"), no mesmo estilo da capa
// de Felinos / Educação Inclusiva: céu de entardecer pintado, retícula, título manuscrito, faixa amarela,
// selo da especialidade, silhuetas gigantes ao fundo e o essencial dentro da faixa 4:5 (y 285–1635).
import React from 'react';
import { AbsoluteFill, Img, staticFile, continueRender, delayRender } from 'remotion';
import { FrontKid } from '../chars/FrontKid';
import { GABRIEL, GIRL } from '../chars/rigs';
import { kidPose, expr, GAB_S, GIRL_S } from './acting';
import { Icon } from './fx';
import { f } from '../lib/paths';

const h = typeof document !== 'undefined' ? delayRender('fonts-mord') : 0;
if (typeof document !== 'undefined') {
  const faces = [
    new FontFace('Poppins', `url(${staticFile('Poppins-Black.ttf')})`, { weight: '900' }),
    new FontFace('Poppins', `url(${staticFile('Poppins-ExtraBold.ttf')})`, { weight: '800' }),
    new FontFace('Script', `url(${staticFile('fonts/Pacifico-Regular.ttf')})`),
    new FontFace('Hand', `url(${staticFile('fonts/Kalam-Bold.ttf')})`),
  ];
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(h); }).catch(() => continueRender(h));
}

const INK = '#35213F', CREAM = '#F6EFE2', GOLD = '#F2B347', COIN = '#F6C445', COIN2 = '#D9952A';
const outline = (w: number, c = INK) => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' } as React.CSSProperties);

/** insígnia da especialidade de Mordomia, reproduzida das medidas da arte oficial do episódio */
const Insignia: React.FC<{ cx: number; cy: number; R: number }> = ({ cx, cy, R }) => {
  const a1 = (-67.7 * Math.PI) / 180, a2 = (-14.4 * Math.PI) / 180, r = R * 0.5, off = R * 0.035, mid = (a1 + a2) / 2;
  const ox = cx + Math.cos(mid) * off, oy = cy + Math.sin(mid) * off;
  const P = (a: number, rr: number, x = cx, y = cy) => `${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="#0AC8DE" />
      <circle cx={cx} cy={cy} r={R * 0.81} fill="none" stroke="#FCCD01" strokeWidth={R * 0.083} />
      <path d={`M${f(cx)} ${f(cy)} L${P(a2, r)} A${r} ${r} 0 1 1 ${P(a1, r)} Z`} fill="#022EA7" />
      <path d={`M${f(ox)} ${f(oy)} L${P(a1, r, ox, oy)} A${r} ${r} 0 0 1 ${P(a2, r, ox, oy)} Z`} fill="#022EA7" />
      <path d={`M${P(a1, r)} L${f(cx)} ${f(cy)} L${P(a2, r)}`} fill="none" stroke="#3FB8E6" strokeWidth={R * 0.03} strokeLinejoin="round" />
    </g>
  );
};

const Star: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 -40 L11 -12 L40 -10 L17 8 L25 38 L0 21 L-25 38 L-17 8 L-40 -10 L-11 -12 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

/** moeda dourada com brilho */
const Coin: React.FC<{ x: number; y: number; r: number; rot?: number }> = ({ x, y, r, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse rx={r} ry={r} fill={COIN2} transform={`translate(${r * 0.08} ${r * 0.1})`} />
    <circle r={r} fill={COIN} stroke={INK} strokeWidth={r * 0.12} />
    <circle r={r * 0.72} fill="none" stroke={COIN2} strokeWidth={r * 0.08} />
    <text y={r * 0.34} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={r * 0.95} fill={COIN2}>$</text>
    <path d={`M${-r * 0.55} ${-r * 0.35} A${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.1} ${-r * 0.68}`} stroke="#FFF3B8" strokeWidth={r * 0.12} strokeLinecap="round" fill="none" />
  </g>
);

export const CoverMordomia: React.FC = () => {
  const t = 2.0;
  const exK = expr(t, { smile: [[0, 1]], open: [[0, 0.8]], look: [[0, [0, -4]]] });
  const exG = expr(t, { smile: [[0, 1]], open: [[0, 0.75]], look: [[0, [-6, -2]]] });
  const bands: [number, number, number, number, string, number][] = [
    [160, 80, 900, 46, '#E9B7C8', 0.7], [-60, 250, 700, 40, '#EFC2CF', 0.6], [560, 330, 760, 36, '#F2CBD3', 0.5], [-100, 610, 1300, 58, '#F6CFCB', 0.5],
    [420, 700, 900, 44, '#FAD9CB', 0.45], [-80, 1010, 760, 34, '#F7C9B6', 0.4],
  ];
  // ícones da mordomia (tempo, corpo, talentos, natureza, recursos, Bíblia) em volta do herói
  const ring = (deg: number) => [540 + Math.cos((deg * Math.PI) / 180) * 290, 1195 + Math.sin((deg * Math.PI) / 180) * 225];
  const icons: [string, number, number, string][] = ([
    ['clock', 198, '#2851D8'], ['bible', 158, '#8E4A2E'], ['dumbbell', 122, '#3FA34D'],
    ['star', -18, '#E9A21E'], ['globe', 22, '#13A3B8'], ['coins', 58, '#C98A1E'],
  ] as [string, number, string][]).map(([n, d, c]) => { const [x, y] = ring(d); return [n, x, y, c]; });
  return (
    <AbsoluteFill style={{ background: '#6E4280', overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5E3A7E" /><stop offset="0.22" stopColor="#93528E" /><stop offset="0.42" stopColor="#D97C9C" /><stop offset="0.56" stopColor="#F3A48F" /><stop offset="0.66" stopColor="#FAC79C" /><stop offset="1" stopColor="#FAC79C" />
          </linearGradient>
          <radialGradient id="msun"><stop offset="0" stopColor="#FFF4DA" /><stop offset="0.55" stopColor="#FFE8C4" /><stop offset="0.75" stopColor="#FFD9B4" stopOpacity={0.6} /><stop offset="1" stopColor="#FFD9B4" stopOpacity={0} /></radialGradient>
          <radialGradient id="mglow"><stop offset="0" stopColor="#FFF3B0" stopOpacity={0.95} /><stop offset="1" stopColor="#FFF3B0" stopOpacity={0} /></radialGradient>
          <filter id="msoft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="mpaint" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={3} seed={11} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={28} /></filter>
          <pattern id="mdots" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="2.6" fill="#2A1238" /></pattern>
          <filter id="mgrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={5} /><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.25  0 0 0 0.55 0" /></filter>
          <linearGradient id="mground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A2F5E" /><stop offset="1" stopColor="#2E1631" /></linearGradient>
          <radialGradient id="mvig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#1E0D22" stopOpacity={0} /><stop offset="1" stopColor="#1E0D22" stopOpacity={0.45} /></radialGradient>
          <clipPath id="globeclip"><circle cx={540} cy={1195} r={220} /></clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#msky)" />
        <g filter="url(#mpaint)">{bands.map(([x, y, w, hh, c, o], i) => <ellipse key={i} cx={x + w / 2} cy={y} rx={w / 2} ry={hh} fill={c} opacity={o} filter="url(#msoft)" />)}</g>
        {/* morros e chão */}
        <path d="M0 1180 Q220 1110 440 1160 T860 1130 T1080 1150 L1080 1920 L0 1920 Z" fill="#8C4C78" opacity={0.75} />
        <path d="M0 1395 Q300 1365 560 1405 T1080 1412 L1080 1920 L0 1920 Z" fill="url(#mground)" />
        {/* "Do Senhor é a terra e tudo o que nela existe" — o mundo inteiro, iluminado como um sol atrás dos personagens */}
        <circle cx={540} cy={1195} r={400} fill="url(#msun)" />
        <circle cx={540} cy={1195} r={220} fill="#FFF1D6" />
        <g clipPath="url(#globeclip)">
          <circle cx={540} cy={1195} r={220} fill="#3DB7D0" />
          <g fill="#74C062" transform="translate(540 1245) scale(0.88) translate(-540 -1160)">
            <path d="M380 950 C430 900 500 915 520 960 C540 1000 500 1040 470 1050 C440 1065 460 1120 430 1150 C400 1180 360 1140 350 1100 C340 1050 330 1000 380 950 Z" />
            <path d="M590 930 C650 905 720 935 735 980 C750 1025 715 1045 690 1060 C660 1080 690 1140 650 1180 C615 1210 580 1180 585 1130 C590 1090 555 1065 560 1020 C562 980 560 950 590 930 Z" />
            <path d="M470 1250 C510 1225 570 1235 600 1270 L600 1370 L440 1370 C430 1310 440 1270 470 1250 Z" />
            <path d="M720 1180 C750 1170 780 1190 775 1220 C770 1245 740 1250 725 1235 C710 1220 705 1190 720 1180 Z" />
          </g>
          {[-160, -80, 0, 80, 160].map((dx) => <ellipse key={dx} cx={540} cy={1195} rx={Math.abs(dx) + 1} ry={220} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.25} />)}
          {[-160, -80, 0, 80, 160].map((dy) => <line key={dy} x1={310} x2={770} y1={1195 + dy} y2={1195 + dy} stroke="#FFFFFF" strokeWidth={3} opacity={0.25} />)}
        </g>
        <circle cx={540} cy={1195} r={220} fill="none" stroke={INK} strokeWidth={9} />
        <path d="M395 1085 A185 185 0 0 1 535 990" stroke="#FFFFFF" strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.55} />
        <path d={`M${540 - 220} 1195 A220 220 0 0 0 ${540 + 220} 1195 A220 105 0 0 1 ${540 - 220} 1195 Z`} fill="#1E0D22" opacity={0.18} />
        {/* moedinhas no chão */}
        {[[330, 1424, 16], [760, 1418, 12]].map(([x, y, r], i) => <Coin key={i} x={x} y={y} r={r} rot={i * 20} />)}
        <ellipse cx={540} cy={1195} rx={290} ry={225} fill="none" stroke={CREAM} strokeWidth={5} strokeDasharray="14 14" opacity={0.6} />
        {/* ícones em órbita: tempo, corpo, Bíblia, talentos, natureza, recursos */}
        {icons.map(([n, x, y, c], i) => (
          <g key={n} transform={`translate(${x} ${y}) rotate(${i % 2 ? 8 : -8})`}>
            <circle r={54} fill={CREAM} stroke={INK} strokeWidth={7} />
            <circle r={54} fill="none" stroke={c} strokeWidth={6} transform="scale(0.86)" />
            <g transform="translate(-31 -31)"><Icon name={n} color={c} size={62} /></g>
          </g>
        ))}
        {/* personagens */}
        <ellipse cx={540} cy={1422} rx={330} ry={24} fill="#1E0D22" opacity={0.5} filter="url(#msoft)" />
        <FrontKid rig={GIRL} id="mg" pose={kidPose(t, { x: 925, y: 1420, scale: GIRL_S * 0.74, phase: 1, skirt: true, actions: [{ kind: 'present', side: 'L', t0: 0, t1: 99, angle: 112 }], ex: exG })} />
        <FrontKid rig={GABRIEL} id="mk" pose={kidPose(t, { x: 150, y: 1420, scale: GAB_S * 0.74, actions: [{ kind: 'wave', side: 'L', t0: 0, t1: 99 }], ex: exK })} />
        {/* pilha de moedas no chão: pequena diante do mundo */}
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><ellipse cx={540} cy={1418 - i * 13} rx={40} ry={13} fill={COIN2} stroke={INK} strokeWidth={5} /><ellipse cx={540} cy={1412 - i * 13} rx={40} ry={13} fill={COIN} stroke={INK} strokeWidth={5} /></g>)}
        <Coin x={600} y={1395} r={28} rot={-15} />
        <circle cx={555} cy={1360} r={80} fill="url(#mglow)" opacity={0.7} />
        {/* retícula, granulação, vinheta */}
        <rect width={1080} height={1920} fill="url(#mdots)" opacity={0.12} style={{ mixBlendMode: 'multiply' }} />
        <rect width={1080} height={1920} filter="url(#mgrain)" opacity={0.5} />
        <g fill="#24102A">{Array.from({ length: 70 }, (_, i) => { const x = i * 16 + (i % 3) * 4, hgt = 40 + ((i * 37) % 70); return <path key={i} d={`M${x} 1920 L${x + 5} ${1920 - hgt} L${x + 10} 1920 Z`} />; })}</g>
        <rect width={1080} height={1920} fill="url(#mvig)" />
        <rect y={1440} width={1080} height={480} fill="#2A1430" opacity={0.5} />
        <Star x={812} y={505} s={0.9} r={-12} />
        <Star x={95} y={700} s={0.6} r={14} />
      </svg>

      {/* cabeçalho */}
      <Img src={staticFile('logo_desbravadores.png')} style={{ position: 'absolute', left: 64, top: 300, width: 128, height: 132 }} />
      <div style={{ position: 'absolute', left: 212, top: 308, fontFamily: 'Poppins', fontWeight: 900, fontSize: 38, lineHeight: 1.08, color: CREAM, ...outline(9), letterSpacing: -0.5 }}>
        SÉRIE ESPECIALIDADES<br />DOS DESBRAVADORES<br /><span style={{ color: GOLD }}>ESPECIALIDADE DE MORDOMIA</span>
      </div>
      <div style={{ position: 'absolute', left: 848, top: 296, width: 186, height: 186, borderRadius: 93, background: CREAM, border: `7px solid ${INK}`, boxShadow: `6px 9px 0 ${INK}` }}>
        <svg width={172} height={172} style={{ position: 'absolute', left: 0, top: 0 }}><Insignia cx={86} cy={86} R={72} /></svg>
      </div>

      {/* título */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', transform: 'rotate(-4deg)' }}>
        <div style={{ fontFamily: 'Script', fontSize: 196, lineHeight: 1.12, color: CREAM, ...outline(24), textShadow: `11px 13px 0 ${INK}` }}>Mordomia</div>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d="M130 800 C380 768 600 758 880 740" stroke={GOLD} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M190 816 C420 790 600 784 800 772" stroke={GOLD} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8} />
      </svg>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 830, transform: 'rotate(-2.5deg)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 64, color: INK, background: GOLD, padding: '8px 30px 2px', border: `7px solid ${INK}`, borderRadius: 16, boxShadow: `9px 11px 0 ${INK}`,
          backgroundImage: 'radial-gradient(rgba(53,33,63,.18) 2px, transparent 2.5px)', backgroundSize: '12px 12px', whiteSpace: 'nowrap' }}>MUITO ALÉM DAS MOEDAS!</div>
      </div>
      <div style={{ position: 'absolute', right: 30, top: 958, transform: 'rotate(6deg)', fontFamily: 'Hand', fontSize: 54, color: CREAM, ...outline(12), textShadow: `6px 7px 0 ${INK}` }}>Tudo é de Deus!</div>

      {/* chamada + rodapé */}
      <div style={{ position: 'absolute', left: 30, right: 30, top: 1450, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 43, lineHeight: 1.22, color: CREAM, textShadow: `0 4px 0 ${INK}, 0 0 18px rgba(30,13,34,.6)` }}>
        Parece só sobre dinheiro…<br /><span style={{ color: GOLD }}>mas é sobre tudo o que Deus nos confiou!</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 31, letterSpacing: 1, color: CREAM, textShadow: `0 3px 0 ${INK}` }}>DISTRITO DE DESBRAVADORES DE AMONTADA</div>
    </AbsoluteFill>
  );
};
