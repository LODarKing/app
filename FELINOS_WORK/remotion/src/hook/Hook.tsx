// Abertura chamativa (gancho dos primeiros segundos): raios, palavra gigante, linhas de velocidade, confete, flash.
import React from 'react';
import { ss, sm, outBack, keys } from '../lib/anim';
import { clamp, lerp, f } from '../lib/paths';

const NAVY = '#211C55', DEEP = '#190C3C', ROYAL = '#2851D8', TURQ = '#13B9C5', YELLOW = '#FFEB00', GREEN = '#70C94A', RED = '#E5484D', ORANGE = '#F28C28';
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** raios girando atrás do "IMAGINE" */
export const Sunburst: React.FC<{ t: number }> = ({ t }) => {
  const a = 1 - ss((t - 0.95) / 0.35);
  if (a <= 0) return null;
  const n = 18, rays = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + t * 0.9, a1 = a0 + Math.PI / n;
    rays.push(<path key={i} d={`M540 760 L${f(540 + Math.cos(a0) * 1600)} ${f(760 + Math.sin(a0) * 1600)} L${f(540 + Math.cos(a1) * 1600)} ${f(760 + Math.sin(a1) * 1600)} Z`} fill={i % 2 ? ROYAL : NAVY} />);
  }
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <rect width={1080} height={1920} fill={DEEP} />
      <defs><radialGradient id="sbv"><stop offset="0" stopColor={TURQ} stopOpacity={0.9} /><stop offset="0.5" stopColor={ROYAL} stopOpacity={0.2} /><stop offset="1" stopColor={DEEP} stopOpacity={0} /></radialGradient></defs>
      <g transform={`translate(540 760) scale(${f(0.6 + 0.5 * sm(t / 1.2))}) translate(-540 -760)`}>{rays}</g>
      <circle cx={540} cy={760} r={700} fill="url(#sbv)" />
    </svg>
  );
};

/** "IMAGINE" gigante, letras em cascata */
export const BigWord: React.FC<{ t: number; word: string; t0: number; t1: number; y: number; size: number; color: string }> = ({ t, word, t0, t1, y, size, color }) => {
  if (t < t0 - 0.05 || t > t1 + 0.4) return null;
  const out = ss((t - t1) / 0.3);
  const letters = word.split('');
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${f(1 + 0.5 * out)})`, opacity: 1 - out, filter: `blur(${f(out * 8)}px)` }}>
      {letters.map((ch, i) => {
        const k = outBack((t - t0 - i * 0.045) / 0.32);
        return <span key={i} style={{ display: 'inline-block', fontFamily: 'Poppins', fontWeight: 900, fontSize: size, lineHeight: 1, color,
          WebkitTextStroke: `${size * 0.09}px ${DEEP}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.08}px 0 ${DEEP}, 0 ${size * 0.16}px ${size * 0.25}px rgba(0,0,0,.35)`,
          transform: `translateY(${f((1 - k) * 160)}px) rotate(${f((1 - k) * (i % 2 ? 18 : -18))}deg) scale(${f(Math.max(0, k))})`, opacity: clamp(k * 3) }}>{ch}</span>;
      })}
    </div>
  );
};

/** linhas de velocidade enquanto a câmera acompanha o Theo */
export const SpeedLines: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  if (a <= 0.01) return null;
  const lines = [];
  for (let i = 0; i < 26; i++) {
    const y = 300 + rnd(i) * 1300, len = 180 + rnd(i + 9) * 380, sp = 2600 + rnd(i + 3) * 1800;
    const x = 1300 - ((t * sp + rnd(i + 5) * 2400) % 2400);
    lines.push(<rect key={i} x={x} y={y} width={len} height={3 + rnd(i + 7) * 6} rx={4} fill="#FFFFFF" opacity={0.35 + 0.4 * rnd(i + 2)} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>{lines}</svg>;
};

/** confete de boas-vindas */
export const Confetti: React.FC<{ t: number; t0: number; ox: number; oy: number }> = ({ t, t0, ox, oy }) => {
  const dt = t - t0;
  if (dt < 0 || dt > 3.2) return null;
  const cols = [YELLOW, TURQ, GREEN, ROYAL, ORANGE, RED, '#FFFFFF'];
  const ps = [];
  for (let i = 0; i < 90; i++) {
    const ang = -Math.PI / 2 + (rnd(i) - 0.5) * 2.4, v = 900 + rnd(i + 1) * 900;
    const x = ox + Math.cos(ang) * v * dt * 0.9 + Math.sin(dt * 6 + i) * 18;
    const y = oy + Math.sin(ang) * v * dt + 0.5 * 1500 * dt * dt * 0.9;
    const rot = (rnd(i + 2) - 0.5) * 1400 * dt, w = 12 + rnd(i + 3) * 14, h = 7 + rnd(i + 4) * 8;
    const fade = 1 - ss((dt - 2.4) / 0.8);
    ps.push(<rect key={i} x={-w / 2} y={-h / 2} width={w} height={h * Math.abs(Math.cos(dt * 9 + i))} rx={2} fill={cols[i % cols.length]} opacity={fade} transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`} />);
  }
  return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>{ps}</svg>;
};

/** vinheta vermelha pulsando na barreira */
export const RedPulse: React.FC<{ t: number; times: number[] }> = ({ t, times }) => {
  let a = 0; for (const t0 of times) a = Math.max(a, Math.exp(-Math.pow((t - t0 - 0.12) / 0.22, 2)));
  if (a < 0.01) return null;
  return <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(229,72,77,0) 45%, rgba(229,72,77,0.55) 100%)', opacity: a }} />;
};

/** flash branco curto (corte/revelação) */
export const Flash: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const a = Math.exp(-Math.pow((t - t0) / 0.07, 2)) * 0.7;
  return a > 0.01 ? <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: a }} /> : null;
};
export { keys };
