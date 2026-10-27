// Elementos gráficos reutilizáveis: títulos cinéticos, selos, cartões, ícones, transições.
import React from 'react';
import { ss, sm, outBack } from '../lib/anim';
import { clamp, lerp, f, shape } from '../lib/paths';

export const PAL = { navy: '#211C55', deep: '#190C3C', royal: '#2851D8', turq: '#13B9C5', yellow: '#FFEB00', green: '#70C94A', red: '#E5484D', orange: '#F28C28', white: '#FFFFFF', cream: '#FFF7E6' };
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const FONT = 'Poppins';

/** título cinético: letras em cascata, linha de destaque em amarelo, saída com escala */
export const TitleBurst: React.FC<{ t: number; t0: number; t1: number; lines: string[]; accent?: number; y: number; size?: number; color?: string; accentColor?: string }> = ({ t, t0, t1, lines, accent = -1, y, size = 118, color = '#FFFFFF', accentColor = PAL.yellow }) => {
  if (t < t0 - 0.05 || t > t1 + 0.35) return null;
  const out = ss((t - t1) / 0.3);
  let n = 0;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${f(1 - 0.2 * out)})`, opacity: 1 - out }}>
      {lines.map((ln, li) => (
        <div key={li} style={{ lineHeight: 1.04 }}>
          {ln.split('').map((ch, i) => {
            const k = outBack((t - t0 - (n++) * 0.03) / 0.34);
            return <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', fontFamily: FONT, fontWeight: 900, fontSize: size, color: li === accent ? accentColor : color,
              WebkitTextStroke: `${size * 0.1}px ${PAL.deep}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.08}px 0 ${PAL.deep}, 0 ${size * 0.14}px ${size * 0.22}px rgba(0,0,0,.35)`,
              transform: `translateY(${f((1 - k) * 120)}px) rotate(${f((1 - k) * (i % 2 ? 14 : -14))}deg) scale(${f(Math.max(0, k))})`, opacity: clamp(k * 3) }}>{ch}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** selo/etiqueta que entra com mola */
export const Chip: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; text: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number; border?: string }> = ({ t, t0, t1, x, y, text, bg = PAL.navy, color = '#fff', size = 44, rot = 0, border = PAL.deep }) => {
  const k = outBack((t - t0) / 0.38) * (1 - ss((t - t1) / 0.25));
  if (k <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${f(k)}) rotate(${f(rot + (1 - clamp(k)) * -10)}deg)` }}>
      <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: size, color, background: bg, padding: `${size * 0.22}px ${size * 0.55}px ${size * 0.16}px`, borderRadius: size * 0.45, border: `${Math.max(4, size * 0.1)}px solid ${border}`, boxShadow: `0 ${size * 0.14}px 0 ${PAL.deep}, 0 ${size * 0.3}px ${size * 0.5}px rgba(0,0,0,.28)` }}>{text}</span>
    </div>
  );
};

/** cartão branco arredondado (infográficos) com entrada em mola */
export const Card: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w: number; h: number; children?: React.ReactNode; bg?: string; rot?: number; from?: 'up' | 'down' | 'left' | 'right' | 'pop' }> = ({ t, t0, t1, x, y, w, h, children, bg = '#FFFFFF', rot = 0, from = 'pop' }) => {
  const k = outBack((t - t0) / 0.45), o = ss((t - t1) / 0.3);
  if (k <= 0.001 || o >= 0.999) return null;
  const off = (1 - clamp(k)) * 500;
  const tr = from === 'up' ? `translateY(${f(-off)}px)` : from === 'down' ? `translateY(${f(off)}px)` : from === 'left' ? `translateX(${f(-off)}px)` : from === 'right' ? `translateX(${f(off)}px)` : `scale(${f(Math.max(0, k))})`;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `${tr} rotate(${f(rot)}deg) scale(${f(1 - 0.15 * o)})`, opacity: 1 - o, background: bg, borderRadius: 34, border: `6px solid ${PAL.deep}`, boxShadow: `0 12px 0 ${PAL.deep}, 0 24px 50px rgba(0,0,0,.28)`, overflow: 'hidden' }}>
      {children}
    </div>
  );
};

/** confete genérico em coordenadas de tela */
export const Confetti: React.FC<{ t: number; t0: number; ox: number; oy: number; n?: number; spread?: number }> = ({ t, t0, ox, oy, n = 90, spread = 2.4 }) => {
  const dt = t - t0;
  if (dt < 0 || dt > 3.2) return null;
  const cols = [PAL.yellow, PAL.turq, PAL.green, PAL.royal, PAL.orange, PAL.red, '#FFFFFF'];
  const ps = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (rnd(i) - 0.5) * spread, v = 900 + rnd(i + 1) * 900;
    const x = ox + Math.cos(ang) * v * dt * 0.9 + Math.sin(dt * 6 + i) * 18;
    const y = oy + Math.sin(ang) * v * dt + 0.5 * 1500 * dt * dt * 0.9;
    const rot = (rnd(i + 2) - 0.5) * 1400 * dt, w = 12 + rnd(i + 3) * 14, h = 7 + rnd(i + 4) * 8;
    ps.push(<rect key={i} x={-w / 2} y={-h / 2} width={w} height={h * Math.abs(Math.cos(dt * 9 + i))} rx={2} fill={cols[i % cols.length]} opacity={1 - ss((dt - 2.4) / 0.8)} transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>{ps}</svg>;
};

/** fundo em movimento para cenas de infográfico: gradiente + formas flutuantes + padrão de pontos */
export const MotionBG: React.FC<{ t: number; c1: string; c2: string; accent?: string }> = ({ t, c1, c2, accent = 'rgba(255,255,255,0.08)' }) => {
  const blobs = [];
  for (let i = 0; i < 9; i++) {
    const x = 540 + Math.sin(t * 0.3 + i * 1.7) * 420 + (rnd(i) - 0.5) * 300, y = 960 + Math.cos(t * 0.25 + i * 2.3) * 760, r = 120 + rnd(i + 4) * 220;
    blobs.push(<circle key={i} cx={f(x)} cy={f(y)} r={f(r)} fill={accent} />);
  }
  const dots = [];
  for (let gx = 0; gx < 13; gx++) for (let gy = 0; gy < 22; gy++) dots.push(<circle key={`${gx}-${gy}`} cx={gx * 90 + 45 + ((t * 20) % 90)} cy={gy * 90 + 45} r={3.5} fill="rgba(255,255,255,0.10)" />);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><linearGradient id="mbg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect width={1080} height={1920} fill="url(#mbg)" />
      {dots}{blobs}
    </svg>
  );
};

/** ícones (pictogramas no estilo do emblema) desenhados em 100x100 */
export const Icon: React.FC<{ name: string; color?: string; size?: number }> = ({ name, color = '#FFFFFF', size = 100 }) => {
  const g = (children: React.ReactNode) => <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>{children}</svg>;
  const sw = { stroke: color, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (name) {
    case 'wheelchair': return g(<><circle cx={46} cy={14} r={9} fill={color} /><path d="M44 28 L44 56 L70 56 L80 80" {...sw} /><path d="M44 40 L64 40" {...sw} /><path d="M32 44 A26 26 0 1 0 70 74" {...sw} /></>);
    case 'cane': return g(<><circle cx={46} cy={12} r={9} fill={color} /><path d="M44 26 L40 56 L28 90 M40 56 L54 90 M44 32 L60 50 L84 92 M44 32 L28 50" {...sw} /></>);
    case 'ear': return g(<><path d="M30 40 C30 18 70 14 72 40 C74 58 56 58 56 72 C56 86 40 88 36 78" {...sw} /><path d="M44 42 C44 32 58 32 58 42" {...sw} /><path d="M80 26 L90 18 M84 44 L96 44" {...sw} /></>);
    case 'book': return g(<><path d="M10 22 C30 16 44 20 50 28 C56 20 70 16 90 22 L90 82 C70 76 56 80 50 86 C44 80 30 76 10 82 Z" {...sw} /><path d="M50 28 L50 86" {...sw} /></>);
    case 'idea': return g(<><path d="M50 10 C28 10 20 32 30 48 C36 58 38 62 38 72 L62 72 C62 62 64 58 70 48 C80 32 72 10 50 10 Z" {...sw} /><path d="M40 84 L60 84 M44 94 L56 94" {...sw} /></>);
    case 'hands': return g(<><path d="M14 62 C14 46 26 40 34 44 L52 52 M30 46 L46 30 C50 26 56 30 52 36 L44 46" {...sw} /><path d="M86 38 C86 54 74 60 66 56 L48 48 M70 54 L54 70 C50 74 44 70 48 64 L56 54" {...sw} /></>);
    case 'heart': return g(<path d="M50 86 C20 62 8 46 12 30 C16 14 38 10 50 26 C62 10 84 14 88 30 C92 46 80 62 50 86 Z" fill={color} />);
    case 'star': return g(<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill={color} />);
    case 'check': return g(<path d="M16 52 L40 76 L86 24" {...sw} strokeWidth={13} />);
    case 'cross': return g(<path d="M22 22 L78 78 M78 22 L22 78" {...sw} strokeWidth={13} />);
    case 'doc': return g(<><path d="M22 6 L62 6 L80 24 L80 94 L22 94 Z" {...sw} /><path d="M62 6 L62 24 L80 24 M34 44 L68 44 M34 58 L68 58 M34 72 L56 72" {...sw} /></>);
    case 'scale': return g(<><path d="M50 12 L50 88 M30 88 L70 88 M18 26 L82 26 M18 26 L6 56 L30 56 Z M82 26 L70 56 L94 56 Z" {...sw} /></>);
    case 'people': return g(<><circle cx={30} cy={30} r={11} fill={color} /><circle cx={70} cy={30} r={11} fill={color} /><circle cx={50} cy={24} r={12} fill={color} /><path d="M12 82 C12 56 48 56 48 82 M52 82 C52 56 88 56 88 82 M28 80 C28 50 72 50 72 80" {...sw} /></>);
    case 'school': return g(<><path d="M8 40 L50 14 L92 40 M18 44 L18 86 L82 86 L82 44 M42 86 L42 62 L58 62 L58 86" {...sw} /></>);
    case 'ramp': return g(<><path d="M8 84 L92 84 L92 40 Z" {...sw} /><circle cx={34} cy={64} r={6} fill={color} /></>);
    case 'phone': return g(<><rect x={26} y={6} width={48} height={88} rx={10} {...sw} /><path d="M44 80 L56 80" {...sw} /></>);
    case 'sunflower': return g(<>{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <ellipse key={i} cx={f(50 + Math.cos(a) * 26)} cy={f(50 + Math.sin(a) * 26)} rx={14} ry={8} fill="#FFC21A" transform={`rotate(${f((a * 180) / Math.PI)} ${f(50 + Math.cos(a) * 26)} ${f(50 + Math.sin(a) * 26)})`} />; })}<circle cx={50} cy={50} r={18} fill="#6B3E1E" /></>);
    case 'multi': return g(<>
      <g transform="translate(2 2) scale(0.5)"><circle cx={46} cy={14} r={9} fill={color} /><path d="M44 28 L44 56 L70 56 L80 80 M44 40 L64 40 M32 44 A26 26 0 1 0 70 74" {...sw} strokeWidth={12} /></g>
      <g transform="translate(50 2) scale(0.5)"><circle cx={46} cy={12} r={9} fill={color} /><path d="M44 26 L40 56 L28 90 M40 56 L54 90 M44 32 L60 50 L84 92" {...sw} strokeWidth={12} /></g>
      <g transform="translate(2 50) scale(0.5)"><path d="M30 40 C30 18 70 14 72 40 C74 58 56 58 56 72 C56 86 40 88 36 78 M44 42 C44 32 58 32 58 42" {...sw} strokeWidth={12} /></g>
      <g transform="translate(50 50) scale(0.5)"><path d="M10 22 C30 16 44 20 50 28 C56 20 70 16 90 22 L90 82 C70 76 56 80 50 86 C44 80 30 76 10 82 Z M50 28 L50 86" {...sw} strokeWidth={12} /></g>
    </>);
    case 'tree': return g(<><path d="M50 92 L50 56" {...sw} /><path d="M50 8 C22 10 14 34 24 48 C14 62 30 74 50 66 C70 74 86 62 76 48 C86 34 78 10 50 8 Z" fill={color} /></>);
    case 'globe': return g(<><circle cx={50} cy={50} r={40} {...sw} /><path d="M10 50 L90 50 M50 10 C30 30 30 70 50 90 M50 10 C70 30 70 70 50 90" {...sw} /></>);
    case 'chat': return g(<><path d="M10 18 L90 18 L90 66 L46 66 L24 86 L28 66 L10 66 Z" {...sw} /></>);
    default: return g(<circle cx={50} cy={50} r={40} fill={color} />);
  }
};

/** brilho/estrelas que explodem em volta de um ponto */
export const Burst: React.FC<{ t: number; t0: number; x: number; y: number; color?: string; r?: number }> = ({ t, t0, x, y, color = PAL.yellow, r = 160 }) => {
  const k = (t - t0) / 0.7;
  if (k <= 0 || k >= 1) return null;
  const s = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, rr = r * sm(k), sz = 26 * (1 - k);
    s.push(<path key={i} d={`M0 ${-sz} L${sz * 0.3} ${-sz * 0.3} L${sz} 0 L${sz * 0.3} ${sz * 0.3} L0 ${sz} L${-sz * 0.3} ${sz * 0.3} L${-sz} 0 L${-sz * 0.3} ${-sz * 0.3} Z`} fill={i % 2 ? color : '#FFFFFF'} transform={`translate(${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)})`} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{s}</svg>;
};

/** carimbo (stamp) com batida */
export const Stamp: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number }> = ({ t, t0, t1, x, y, text, color = PAL.green, rot = -8, size = 64 }) => {
  const k = (t - t0) / 0.25, o = ss((t - t1) / 0.25);
  if (k <= 0 || o >= 1) return null;
  const s = k < 1 ? lerp(2.4, 1, sm(k)) : 1 + 0.06 * Math.exp(-(t - t0 - 0.25) * 10) * Math.sin((t - t0) * 40);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${f(s)})`, opacity: clamp(k * 2) * (1 - o) }}>
      <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 900, fontSize: size, color, border: `${size * 0.12}px solid ${color}`, borderRadius: size * 0.25, padding: `${size * 0.12}px ${size * 0.4}px ${size * 0.04}px`, background: 'rgba(255,255,255,0.92)', letterSpacing: 2 }}>{text}</span>
    </div>
  );
};

/** transições entre cenas (máscara aplicada na cena que entra; k de 0 a 1) */
export function transitionStyle(kind: string, k: number): React.CSSProperties {
  const e = sm(k);
  switch (kind) {
    case 'iris': return { clipPath: `circle(${f(e * 120)}% at 50% 45%)` };
    case 'wipe': { const x = lerp(-40, 140, e); return { clipPath: `polygon(0 0, ${f(x)}% 0, ${f(x - 40)}% 100%, 0 100%)` }; }
    case 'push': return { transform: `translateY(${f((1 - e) * 1920)}px)` };
    case 'page': return { clipPath: `polygon(${f(100 - e * 100)}% 0, 100% 0, 100% 100%, ${f(100 - e * 100 - 25 * (1 - e))}% 100%)` };
    default: return { opacity: e };
  }
}
export const TransitionBand: React.FC<{ kind: string; k: number }> = ({ kind, k }) => {
  if (k <= 0 || k >= 1) return null;
  const e = sm(k);
  if (kind === 'wipe') { const x = lerp(-40, 140, e) / 100 * 1080; return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><path d={`M${f(x - 40)} 0 L${f(x + 30)} 0 L${f(x - 432 + 30)} 1920 L${f(x - 432 - 40)} 1920 Z`} fill={PAL.yellow} /><path d={`M${f(x - 80)} 0 L${f(x - 40)} 0 L${f(x - 432 - 40)} 1920 L${f(x - 432 - 80)} 1920 Z`} fill={PAL.navy} /></svg>; }
  if (kind === 'iris') { const r = e * 1.2 * Math.hypot(1080, 1920) / Math.sqrt(2) * 0.84; return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><circle cx={540} cy={864} r={r} fill="none" stroke={PAL.yellow} strokeWidth={26} /><circle cx={540} cy={864} r={r + 18} fill="none" stroke={PAL.navy} strokeWidth={12} /></svg>; }
  if (kind === 'page') { const x = (100 - e * 100) / 100 * 1080; return <div style={{ position: 'absolute', top: 0, bottom: 0, left: x - 60, width: 120, background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,.25), rgba(255,255,255,.35), rgba(0,0,0,0))' }} />; }
  return null;
};
