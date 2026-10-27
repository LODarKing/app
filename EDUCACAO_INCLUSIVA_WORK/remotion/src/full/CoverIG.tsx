// Capa para o Instagram do distrito (1080x1920), no estilo da capa de referência "Felinos":
// céu de entardecer pintado, faixas de nuvem, retícula (halftone) e granulação, título manuscrito com contorno,
// faixa amarela, selo da especialidade, logo do clube, personagem em destaque diante de uma silhueta gigante.
import React from 'react';
import { AbsoluteFill, Img, staticFile, continueRender, delayRender } from 'remotion';
import { FrontKid } from '../chars/FrontKid';
import { GABRIEL, GIRL } from '../chars/rigs';
import { Theo } from '../chars/Theo';
import { kidPose, theoRoll, expr, THEO_S, GAB_S, GIRL_S } from './acting';
import { f } from '../lib/paths';

const h = typeof document !== 'undefined' ? delayRender('fonts-ig') : 0;
if (typeof document !== 'undefined') {
  const faces = [
    new FontFace('Poppins', `url(${staticFile('Poppins-Black.ttf')})`, { weight: '900' }),
    new FontFace('Poppins', `url(${staticFile('Poppins-ExtraBold.ttf')})`, { weight: '800' }),
    new FontFace('Poppins', `url(${staticFile('Poppins-Bold.ttf')})`, { weight: '700' }),
    new FontFace('Script', `url(${staticFile('fonts/Pacifico-Regular.ttf')})`),
    new FontFace('Brush', `url(${staticFile('fonts/CaveatBrush-Regular.ttf')})`),
    new FontFace('Hand', `url(${staticFile('fonts/Kalam-Bold.ttf')})`),
  ];
  Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => (document as any).fonts.add(ff)); continueRender(h); }).catch(() => continueRender(h));
}

const INK = '#35213F', CREAM = '#F6EFE2', GOLD = '#F2B347', PLUM = '#4A2B55';
const outline = (w: number, c = INK) => ({ WebkitTextStroke: `${w}px ${c}`, paintOrder: 'stroke fill' } as React.CSSProperties);

const Star: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 -40 L11 -12 L40 -10 L17 8 L25 38 L0 21 L-25 38 L-17 8 L-40 -10 L-11 -12 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  </svg>
);

export const CoverIG: React.FC = () => {
  const t = 2.2;
  const exT = expr(t, { smile: [[0, 0.95]], open: [[0, 0.75]], look: [[0, [3, -5]]] });
  const exK = expr(t, { smile: [[0, 1]], open: [[0, 0.85]], look: [[0, [0, 2]]] });
  // nuvens em faixas (estilo pintado)
  const bands: [number, number, number, number, string, number][] = [
    [180, 70, 900, 46, '#E9B7C8', 0.7], [-60, 250, 700, 40, '#EFC2CF', 0.65], [600, 330, 760, 36, '#F2CBD3', 0.55], [-100, 520, 1300, 58, '#F6CFCB', 0.55],
    [420, 610, 900, 44, '#FAD9CB', 0.5], [-80, 1040, 760, 34, '#F7C9B6', 0.45], [560, 1000, 700, 30, '#F9D3BE', 0.45],
  ];
  return (
    <AbsoluteFill style={{ background: '#6E4280', overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="igsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6B3F7E" /><stop offset="0.22" stopColor="#9C5590" /><stop offset="0.42" stopColor="#DC7E9E" /><stop offset="0.56" stopColor="#F3A48F" /><stop offset="0.66" stopColor="#FAC79C" /><stop offset="1" stopColor="#FAC79C" />
          </linearGradient>
          <radialGradient id="igsun"><stop offset="0" stopColor="#FFF4DA" /><stop offset="0.55" stopColor="#FFE8C4" /><stop offset="0.75" stopColor="#FFD9B4" stopOpacity={0.6} /><stop offset="1" stopColor="#FFD9B4" stopOpacity={0} /></radialGradient>
          <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="paint" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={28} />
          </filter>
          <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="2.6" fill="#2A1238" /></pattern>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.25  0 0 0 0.55 0" /></filter>
          <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#1E0D22" stopOpacity={0} /><stop offset="1" stopColor="#1E0D22" stopOpacity={0.45} /></radialGradient>
          <linearGradient id="igground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A2F5E" /><stop offset="1" stopColor="#2E1631" /></linearGradient>
          <linearGradient id="stairsil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5C3468" /><stop offset="1" stopColor="#3E2148" /></linearGradient>
        </defs>
        {/* céu pintado */}
        <rect width={1080} height={1920} fill="url(#igsky)" />
        <g filter="url(#paint)">
          {bands.map(([x, y, w, hh, c, o], i) => <ellipse key={i} cx={x + w / 2} cy={y} rx={w / 2} ry={hh} fill={c} opacity={o} filter="url(#soft)" />)}
        </g>
        {/* sol enorme atrás do herói */}
        <circle cx={560} cy={1230} r={470} fill="url(#igsun)" />
        <circle cx={560} cy={1230} r={260} fill="#FFF1D6" opacity={0.96} />
        {/* morros e a sede do clube ao longe */}
        <path d="M0 1240 Q200 1170 420 1215 T820 1190 T1080 1210 L1080 1920 L0 1920 Z" fill="#8C4C78" opacity={0.75} />
        <g fill="#6E3A6E" opacity={0.95}>
          <path d="M40 1260 L40 1120 L20 1120 L130 1040 L240 1120 L220 1120 L220 1260 Z" />
          <rect x={150} y={1150} width={40} height={60} fill="#FFD9A8" opacity={0.7} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={290 + i * 70} cy={1210 - (i % 2) * 14} rx={46} ry={36} />)}
        </g>
        {/* a barreira: escada gigante em silhueta, atrás do herói */}
        {(() => {
          const pts = Array.from({ length: 5 }, (_, i) => `L${690 + i * 78} ${1520 - (i + 1) * 136} L${690 + (i + 1) * 78} ${1520 - (i + 1) * 136}`).join(' ');
          return <g>
            <path d={`M690 1520 ${pts} L1080 840 L1080 1520 Z`} fill="url(#stairsil)" />
            <path d={`M690 1520 ${pts} L1080 840`} fill="none" stroke="#FFC6A0" strokeWidth={7} opacity={0.75} />
            <path d="M706 1380 L1070 920" stroke="#3A1E44" strokeWidth={16} strokeLinecap="round" /><path d="M760 1520 L760 1310 M900 1520 L900 1135" stroke="#3A1E44" strokeWidth={14} />
          </g>;
        })()}
        {/* chão */}
        <path d="M0 1490 Q300 1460 560 1500 T1080 1510 L1080 1920 L0 1920 Z" fill="url(#igground)" />
        {/* herói: Theo diante da barreira */}
        <ellipse cx={540} cy={1522} rx={210} ry={24} fill="#1E0D22" opacity={0.5} filter="url(#soft)" />
        <Theo pose={theoRoll(t, () => 470, { scale: 0.38, y: 1520, ex: exT, head: -9 })} id="igt" />
        {/* retícula e granulação por cima de tudo, como na referência */}
        <rect width={1080} height={1920} fill="url(#dots)" opacity={0.12} style={{ mixBlendMode: 'multiply' }} />
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.5} />
        {/* capim em silhueta no rodapé */}
        <g fill="#24102A">
          {Array.from({ length: 70 }, (_, i) => { const x = i * 16 + (i % 3) * 4, hgt = 40 + ((i * 37) % 70); return <path key={i} d={`M${x} 1920 L${x + 5} ${1920 - hgt} L${x + 10} 1920 Z`} />; })}
        </g>
        {/* vinheta */}
        <rect width={1080} height={1920} fill="url(#vig)" />
        <rect y={1530} width={1080} height={390} fill="#2A1430" opacity={0.5} />
      </svg>

      {/* cabeçalho: logo do clube + série + código; selo da especialidade */}
      <Img src={staticFile('logo_desbravadores.png')} style={{ position: 'absolute', left: 64, top: 330, width: 128, height: 132 }} />
      <div style={{ position: 'absolute', left: 212, top: 338, fontFamily: 'Poppins', fontWeight: 900, fontSize: 38, lineHeight: 1.08, color: CREAM, ...outline(9), letterSpacing: -0.5 }}>
        SÉRIE ESPECIALIDADES<br />DOS DESBRAVADORES<br /><span style={{ color: GOLD }}>ESPECIALIDADE AM-055</span>
      </div>
      <div style={{ position: 'absolute', left: 848, top: 326, width: 186, height: 186, borderRadius: 93, background: CREAM, border: `7px solid ${INK}`, boxShadow: `6px 9px 0 ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Img src={staticFile('emblema_recortado.png')} style={{ width: 150, height: 130, objectFit: 'contain' }} />
      </div>
      <Star x={812} y={545} s={0.95} r={-12} />
      <Star x={95} y={760} s={0.6} r={14} />
      <Star x={985} y={1150} s={0.55} r={-20} />

      {/* título manuscrito */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', transform: 'rotate(-4deg)' }}>
        <div style={{ fontFamily: 'Script', fontSize: 158, lineHeight: 1.12, color: CREAM, ...outline(22), textShadow: `10px 12px 0 ${INK}` }}>Educação</div>
        <div style={{ fontFamily: 'Script', fontSize: 158, lineHeight: 1.0, color: CREAM, ...outline(22), textShadow: `10px 12px 0 ${INK}`, marginTop: -26, marginLeft: 120 }}>Inclusiva</div>
      </div>
      {/* pincelada sob o título */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d="M150 940 C380 908 600 898 860 880" stroke={GOLD} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M200 956 C420 930 600 924 780 912" stroke={GOLD} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.8} />
      </svg>
      {/* faixa amarela */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 955, transform: 'rotate(-2.5deg)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', fontFamily: 'Poppins', fontWeight: 900, fontSize: 70, letterSpacing: 0.5, color: INK, background: GOLD, padding: '8px 34px 2px', border: `7px solid ${INK}`, borderRadius: 16, boxShadow: `9px 11px 0 ${INK}`,
          backgroundImage: 'radial-gradient(rgba(53,33,63,.18) 2px, transparent 2.5px)', backgroundSize: '12px 12px' }}>NINGUÉM FICA DE FORA!</div>
      </div>
      {/* exclamação manuscrita */}
      <div style={{ position: 'absolute', left: 36, top: 1070, transform: 'rotate(-11deg)', fontFamily: 'Hand', fontSize: 66, color: CREAM, ...outline(12), textShadow: `6px 7px 0 ${INK}` }}>E se fosse você?</div>

      {/* chamada */}
      <div style={{ position: 'absolute', left: 30, right: 30, top: 1580, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 47, lineHeight: 1.22, color: CREAM, textShadow: `0 4px 0 ${INK}, 0 0 18px rgba(30,13,34,.6)` }}>
        Parece só uma escada…<br /><span style={{ color: GOLD }}>mas pode deixar alguém de fora!</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1780, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 33, letterSpacing: 1, color: CREAM, textShadow: `0 3px 0 ${INK}` }}>DISTRITO DE DESBRAVADORES DE AMONTADA</div>
    </AbsoluteFill>
  );
};
