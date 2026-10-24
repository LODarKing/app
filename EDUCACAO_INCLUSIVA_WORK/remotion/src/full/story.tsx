// Kit de "livro ilustrado" para as cenas bíblicas e históricas: silhuetas articuladas, moldura de página,
// céus em degradê, paisagens em camadas e objetos de cena. Tudo em vetor.
import React from 'react';
import { f, lerp, clamp, shape, curve } from '../lib/paths';
import { sm, ss, outBack } from '../lib/anim';
import { PAL, FONT, rnd } from './fx';

export const INK = '#2B1630', INK2 = '#3D2242', RIM = '#FFC98A';

export type SilPose = {
  x: number; y: number; s?: number; face?: 1 | -1;
  kneel?: number;           // 0 em pé … 1 ajoelhado
  bow?: number;             // 0 … 1 prostrado (curvado até o chão)
  lean?: number;            // graus
  walk?: number;            // fase de caminhada (rad) — balanço da barra da túnica
  armF?: [number, number];  // alvo da mão da frente (relativo ao ombro, px, y para baixo)
  armB?: [number, number];
  head?: number;            // inclinação da cabeça (graus)
  wear?: 'hair' | 'veil' | 'crown' | 'turban' | 'plain' | 'bow' | 'hat' | 'cap';
  dress?: 'robe' | 'gown' | 'tunic';
  color?: string; rim?: string; scale?: number; child?: boolean; beard?: boolean; noRim?: boolean;
};
/** braço em dois segmentos (cotovelo resolvido) */
function armPath(sx: number, sy: number, tx: number, ty: number, L: number) {
  const dx = tx - sx, dy = ty - sy, d = Math.min(Math.hypot(dx, dy), L * 1.98);
  const a = Math.atan2(dy, dx), b = Math.acos(clamp(d / (2 * L), -1, 1));
  const ex = sx + Math.cos(a + b) * L, ey = sy + Math.sin(a + b) * L;
  const hx = sx + Math.cos(a) * d, hy = sy + Math.sin(a) * d;
  return { d: `M${f(sx)} ${f(sy)} L${f(ex)} ${f(ey)} L${f(hx)} ${f(hy)}`, hx, hy };
}
/** silhueta humana estilizada (pés em 0,0; altura ~ 420 * s) */
export const Sil: React.FC<SilPose> = (p) => {
  if (!p.noRim) return <g><g opacity={0.85} transform="translate(5 -3)"><Sil {...p} noRim color={p.rim ?? RIM} /></g><Sil {...p} noRim /></g>;
  const s = (p.s ?? 1) * (p.child ? 0.68 : 1), face = p.face ?? 1, kn = p.kneel ?? 0, bow = p.bow ?? 0;
  const col = p.color ?? INK, rim = p.rim ?? RIM;
  const H = lerp(330, 210, kn) * (1 - 0.45 * bow);
  const sway = p.walk !== undefined ? Math.sin(p.walk) * 10 : 0;
  const hemW = lerp(62, 92, kn), shW = p.child ? 30 : 36;
  const bodyRot = (p.lean ?? 0) + bow * 62;
  const sh = [0, -H], neck = [0, -H - 10];
  const headR = p.child ? 30 : 28;
  const hc = [0, -H - 14 - headR];
  const L = p.child ? 62 : 82;
  const fArm = armPath(sh[0] + 10, sh[1] + 16, sh[0] + (p.armF?.[0] ?? 14), sh[1] + (p.armF?.[1] ?? 150), L);
  const bArm = armPath(sh[0] - 10, sh[1] + 16, sh[0] + (p.armB?.[0] ?? -10), sh[1] + (p.armB?.[1] ?? 150), L);
  const robe = p.dress === 'gown'
    ? shape([[-shW, -H + 6], [shW, -H + 6], [shW + 6, -H * 0.55], [hemW + 18 + sway, -4, 1], [-hemW - 18 + sway, -4, 1], [-shW - 6, -H * 0.55]])
    : p.dress === 'tunic'
      ? shape([[-shW, -H + 6], [shW, -H + 6], [shW + 8, -H * 0.42], [hemW * 0.7 + sway, -H * 0.18, 1], [-hemW * 0.7 + sway, -H * 0.18, 1], [-shW - 8, -H * 0.42]])
      : shape([[-shW, -H + 6], [shW, -H + 6], [shW + 10, -H * 0.5], [hemW + sway, -2, 1], [-hemW + sway, -2, 1], [-shW - 10, -H * 0.5]]);
  const legs = p.dress === 'tunic' ? <path d={`M-14 ${f(-H * 0.2)} L${f(-18 + sway * 0.6)} -2 M14 ${f(-H * 0.2)} L${f(18 - sway * 0.6)} -2`} stroke={col} strokeWidth={22} strokeLinecap="round" /> : null;
  const wear = (() => {
    const [cx, cy] = hc, r = headR;
    switch (p.wear) {
      case 'hair': return <path d={shape([[cx - r - 4, cy + 4], [cx - r + 2, cy - r * 0.9], [cx, cy - r - 6], [cx + r - 2, cy - r * 0.9], [cx + r + 4, cy + 4], [cx + r + 2, cy + r + 30], [cx + r - 10, cy + r + 34, 1], [cx - r + 6, cy + r + 34, 1], [cx - r - 6, cy + r + 30]])} fill={col} />;
      case 'veil': return <path d={shape([[cx - r - 8, cy + 6], [cx - r, cy - r * 0.9], [cx, cy - r - 8], [cx + r, cy - r * 0.9], [cx + r + 10, cy + 8], [cx + r + 22, cy + r + 50, 1], [cx - r - 14, cy + r + 50, 1]])} fill={col} />;
      case 'crown': return <path d={`M${cx - r * 0.9} ${cy - r * 0.55} L${cx - r * 0.9} ${cy - r - 22} L${cx - r * 0.45} ${cy - r - 4} L${cx} ${cy - r - 26} L${cx + r * 0.45} ${cy - r - 4} L${cx + r * 0.9} ${cy - r - 22} L${cx + r * 0.9} ${cy - r * 0.55} Z`} fill="#F2C14E" stroke={col} strokeWidth={3} />;
      case 'turban': return <path d={shape([[cx - r - 6, cy - 4], [cx - r, cy - r - 10], [cx, cy - r - 22], [cx + r, cy - r - 10], [cx + r + 6, cy - 4]])} fill={col} />;
      case 'bow': return <g><circle cx={cx - r * 0.75} cy={cy - r * 0.7} r={r * 0.55} fill={col} /><path d={shape([[cx - r - 2, cy + 4], [cx - r + 4, cy - r * 0.9], [cx, cy - r - 4], [cx + r - 4, cy - r * 0.9], [cx + r + 2, cy + 4], [cx + r + 8, cy + r + 26], [cx - r - 8, cy + r + 26]])} fill={col} /></g>;
      case 'cap': return <g><path d={`M${cx - r - 26} ${cy - r + 2} L${cx} ${cy - r - 14} L${cx + r + 26} ${cy - r + 2} L${cx} ${cy - r + 18} Z`} fill={col} /><path d={`M${cx + r + 16} ${cy - r + 4} l0 34`} stroke="#F2C14E" strokeWidth={5} /></g>;
      case 'hat': return <path d={`M${cx - r - 22} ${cy - r * 0.4} L${cx + r + 22} ${cy - r * 0.4} L${cx + r * 0.7} ${cy - r - 26} L${cx - r * 0.7} ${cy - r - 26} Z`} fill={col} />;
      default: return null;
    }
  })();
  return (
    <g transform={`translate(${f(p.x)} ${f(p.y)}) scale(${f(face * s)} ${f(s)})`}>
      <g transform={`rotate(${f(bodyRot)} 0 ${f(-H * 0.12)})`}>
        <path d={bArm.d} stroke={col} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {legs}
        <path d={robe} fill={col} />
        <path d={`M${-shW - 4} ${f(-H * 0.52)} L${shW + 4} ${f(-H * 0.52)}`} stroke={p.noRim && col !== (p.rim ?? RIM) ? '#000000' : 'none'} strokeOpacity={0.2} strokeWidth={10} />
        <rect x={-9} y={neck[1] - 6} width={18} height={16} fill={col} />
        <g transform={`rotate(${f(p.head ?? 0)} ${neck[0]} ${neck[1]})`}>
          <circle cx={hc[0]} cy={hc[1]} r={headR} fill={col} />
          <path d={`M${hc[0] + headR - 4} ${hc[1] - 4} l12 9 l-11 5 Z`} fill={col} />
          {p.beard ? <path d={`M${hc[0] - headR * 0.6} ${hc[1] + 6} Q${hc[0] + headR * 0.2} ${hc[1] + headR + 22} ${hc[0] + headR - 2} ${hc[1] + 10} Z`} fill={col} /> : null}
          {wear}
        </g>
        <path d={fArm.d} stroke={col} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={fArm.hx} cy={fArm.hy} r={13} fill={col} />
      </g>
    </g>
  );
};

/** pessoa deitada sobre uma esteira (homem do tanque de Betesda) */
export const LyingSil: React.FC<{ x: number; y: number; s?: number; lift?: number; color?: string }> = ({ x, y, s = 1, lift = 0, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-14} width={340} height={20} rx={8} fill="#7A4E3A" />
    <g transform={`rotate(${f(-lift * 28)} -120 -20)`}>
      <path d={shape([[-120, -24], [100, -36], [130, -28], [126, -8, 1], [-126, -8, 1]])} fill={color} />
      <circle cx={-136} cy={-48 - lift * 6} r={27} fill={color} />
      <path d="M-20 -40 L40 -70 L70 -60" stroke={color} strokeWidth={20} strokeLinecap="round" fill="none" />
    </g>
  </g>
);

/** página de livro: moldura de pergaminho, cantos, sombra interna, título da passagem */
export const PageFrame: React.FC<{ title?: string; t: number; children?: React.ReactNode; tone?: string }> = ({ title, t, children, tone = '#F3E3C3' }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', inset: 0, background: tone }} />
    <div style={{ position: 'absolute', left: 36, right: 36, top: 200, bottom: 560, borderRadius: 30, overflow: 'hidden', boxShadow: 'inset 0 0 0 8px #6B3E2A, inset 0 0 0 14px #E7CC97, 0 18px 40px rgba(60,30,10,.35)' }}>
      {children}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(80,40,10,.45)', pointerEvents: 'none' }} />
    </div>
    {title ? <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', transform: `scale(${f(clamp(outBack((t - 0.3) / 0.45), 0, 1.2))})` }}>
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: '#FFF3D6', background: '#6B3E2A', padding: '10px 34px 6px', borderRadius: 18, boxShadow: '0 7px 0 #3B2015', letterSpacing: 2 }}>{title}</span>
    </div> : null}
    {/* textura de papel */}
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.25, mixBlendMode: 'multiply', pointerEvents: 'none' }}>
      {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 99) * 1920} r={2 + rnd(i + 7) * 5} fill="#B08A55" opacity={0.35} />)}
    </svg>
  </div>
);

/** céu do entardecer + sol + camadas de colinas (coordenadas da janela da página: 1008 x 1160) */
export const StorySky: React.FC<{ t: number; top?: string; mid?: string; bot?: string; sun?: [number, number]; hills?: string[] }> = ({ t, top = '#F6A25A', mid = '#F7C77A', bot = '#FBE3A8', sun = [700, 360], hills = ['#D9864E', '#B8643E', '#8E4A34'] }) => (
  <g>
    <defs>
      <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.55" stopColor={mid} /><stop offset="1" stopColor={bot} /></linearGradient>
      <radialGradient id="ssun"><stop offset="0" stopColor="#FFF8DD" /><stop offset="0.35" stopColor="#FFE9A8" stopOpacity={0.9} /><stop offset="1" stopColor="#FFE9A8" stopOpacity={0} /></radialGradient>
    </defs>
    <rect width={1008} height={1160} fill="url(#ssky)" />
    <circle cx={sun[0]} cy={sun[1]} r={300} fill="url(#ssun)" />
    <circle cx={sun[0]} cy={sun[1]} r={86} fill="#FFF4D0" />
    {[0, 1, 2].map((i) => <path key={i} d={curve(Array.from({ length: 8 }, (_, k) => [k * 160 - 80 + ((t * (6 + i * 4)) % 0) , 700 + i * 90 - 60 * Math.sin(k * 1.3 + i * 2) - (rnd(k + i * 9) * 40)])) + ' L1100 1200 L-100 1200 Z'} fill={hills[i]} />)}
    {/* pássaros */}
    {[0, 1, 2].map((i) => { const x = ((t * 40 + i * 140) % 1200) - 100, y = 220 + i * 40 + Math.sin(t * 2 + i) * 8, w = Math.sin(t * 9 + i) * 8; return <path key={i} d={`M${f(x - 14)} ${f(y)} q7 ${f(-8 - w)} 14 0 q7 ${f(-8 - w)} 14 0`} stroke={INK2} strokeWidth={3} fill="none" />; })}
  </g>
);

/** colunata (pórticos de Betesda / palácio) */
export const Colonnade: React.FC<{ x: number; y: number; n: number; gap: number; h: number; color?: string }> = ({ x, y, n, gap, h, color = INK2 }) => (
  <g>
    <rect x={x - 30} y={y - h - 40} width={(n - 1) * gap + 60} height={40} rx={6} fill={color} />
    {Array.from({ length: n }, (_, i) => <g key={i}><rect x={x + i * gap - 18} y={y - h} width={36} height={h} fill={color} /><rect x={x + i * gap - 26} y={y - 16} width={52} height={16} fill={color} /><rect x={x + i * gap - 26} y={y - h} width={52} height={14} fill={color} /></g>)}
  </g>
);

/** palmeira em silhueta */
export const Palm: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = INK2 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-8 0 C-4 -120 6 -220 -6 -320 L8 -320 C20 -220 10 -120 8 0 Z" fill={color} />
    <g transform={`translate(0 -320) rotate(${f(Math.sin(t * 1.4 + x) * 4)})`}>
      {[-150, -110, -60, -20, 20, 70, 120, 160].map((a, i) => <path key={i} d={`M0 0 Q${f(Math.cos((a * Math.PI) / 180) * 80)} ${f(Math.sin((a * Math.PI) / 180) * 80 - 40)} ${f(Math.cos((a * Math.PI) / 180) * 150)} ${f(Math.sin((a * Math.PI) / 180) * 150 + 20)}`} stroke={color} strokeWidth={16} strokeLinecap="round" fill="none" />)}
    </g>
  </g>
);

/** Bíblia que se abre (introdução das passagens) */
export const BibleOpen: React.FC<{ t: number; ref_: string }> = ({ t, ref_ }) => {
  const k = sm((t - 0.15) / 0.8), out = ss((t - 1.25) / 0.4);
  if (out >= 1) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: `rgba(25,12,60,${f(0.85 * (1 - out))})`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - out }}>
      <div style={{ position: 'relative', width: 760, height: 520, transform: `scale(${f(lerp(0.7, 1.4, sm(t / 1.6)))})`, perspective: 1600 }}>
        <div style={{ position: 'absolute', left: 380, top: 0, width: 380, height: 520, background: '#F7EBD0', borderRadius: '0 16px 16px 0', border: '6px solid #4A2A1A' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ height: 10, margin: `${i ? 22 : 80}px 40px 0`, borderRadius: 5, background: '#CDB78E' }} />)}
        </div>
        <div style={{ position: 'absolute', left: 380, top: 0, width: 380, height: 520, transformOrigin: '0 50%', transform: `rotateY(${f(-180 * k)}deg)`, backfaceVisibility: 'visible', background: k < 0.5 ? '#5B2E1E' : '#F7EBD0', borderRadius: '0 16px 16px 0', border: '6px solid #4A2A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {k < 0.5 ? <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#F2C14E', letterSpacing: 4 }}>BÍBLIA</div> : null}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -120, textAlign: 'center', opacity: clamp((t - 0.5) / 0.3) }}>
          <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 58, color: '#FFF3D6', background: '#6B3E2A', padding: '10px 34px 6px', borderRadius: 18 }}>{ref_}</span>
        </div>
        <div style={{ position: 'absolute', left: 280, top: 160, width: 200, height: 200, borderRadius: 100, background: 'radial-gradient(circle, rgba(255,240,180,.95), rgba(255,240,180,0))', opacity: clamp((k - 0.5) * 2), transform: `scale(${f(1 + 3 * sm((t - 0.9) / 0.6))})` }} />
      </div>
    </div>
  );
};

/** pequena fala/ícone em balão sobre a cena */
export const Bubble: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; children: React.ReactNode; tail?: 'l' | 'r' }> = ({ t, t0, t1, x, y, children, tail = 'l' }) => {
  const k = outBack((t - t0) / 0.35) * (1 - ss((t - t1) / 0.25));
  if (k <= 0.01) return null;
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${f(k)})`, transformOrigin: tail === 'l' ? '20% 100%' : '80% 100%' }}>
    <div style={{ position: 'relative', background: '#FFFDF5', border: '5px solid #4A2A1A', borderRadius: 28, padding: '14px 22px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 8px 0 #4A2A1A' }}>
      {children}
      <div style={{ position: 'absolute', bottom: -22, [tail === 'l' ? 'left' : 'right']: 30, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '22px solid #4A2A1A' } as React.CSSProperties} />
    </div>
  </div>;
};
