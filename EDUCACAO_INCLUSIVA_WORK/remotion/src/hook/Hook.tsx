// Abertura chamativa (gancho dos primeiros segundos) + legendas dinâmicas palavra a palavra.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { ss, sm, outBack, keys } from '../lib/anim';
import { clamp, lerp, f } from '../lib/paths';
import WORDS from '../words.json';

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

/** emblema + título da série: entra girando, depois encolhe para o canto */
export const SeriesBadge: React.FC<{ t: number }> = ({ t }) => {
  const inK = outBack((t - 0.35) / 0.55);
  if (inK <= 0) return null;
  const toCorner = sm((t - 3.3) / 0.6);
  const x = lerp(540, 112, toCorner), y = lerp(250, 128, toCorner), sc = lerp(1, 0.42, toCorner);
  const spin = (1 - clamp(inK)) * -540;
  const title = outBack((t - 0.75) / 0.45) * (1 - ss((t - 3.15) / 0.3));
  const sub = outBack((t - 0.95) / 0.45) * (1 - ss((t - 3.1) / 0.3));
  const shine = ((t - 1.1) % 2.4) / 0.6;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 600, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x - 110 * sc, top: y - 110 * sc, width: 220 * sc, height: 220 * sc, transform: `rotate(${f(spin)}deg) scale(${f(Math.max(0, inK))})`, filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.35))', opacity: lerp(1, 0.92, toCorner) }}>
        <Img src={staticFile('emblema_recortado.png')} style={{ position: 'absolute', left: -20 * sc, top: 0, width: 260 * sc, height: 220 * sc, objectFit: 'contain' }} />
      </div>
      {title > 0.001 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 388, textAlign: 'center', transform: `scale(${f(title)})` }}>
        <span style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', fontFamily: 'Poppins', fontWeight: 900, fontSize: 66, color: '#fff', background: NAVY, padding: '14px 34px 10px', borderRadius: 26, boxShadow: `0 9px 0 ${DEEP}, 0 18px 40px rgba(0,0,0,.35)`, letterSpacing: 1 }}>
          EDUCAÇÃO <span style={{ color: YELLOW }}>INCLUSIVA</span>
          <span style={{ position: 'absolute', top: 0, bottom: 0, width: 90, left: `${f(-20 + 120 * clamp(shine))}%`, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent)' }} />
        </span>
      </div> : null}
      {sub > 0.001 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 506, textAlign: 'center', transform: `scale(${f(sub)})` }}>
        <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 30, color: NAVY, background: YELLOW, padding: '8px 22px 6px', borderRadius: 999, boxShadow: `0 5px 0 ${DEEP}` }}>SÉRIE ESPECIALIDADES DOS DESBRAVADORES</span>
      </div> : null}
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

/** brilhos em volta de uma palavra-chave */
const Sparkles: React.FC<{ k: number; color: string }> = ({ k, color }) => {
  if (k <= 0 || k >= 1) return null;
  const s = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3, r = 40 + 110 * sm(k);
    const sz = 22 * (1 - k);
    s.push(<path key={i} d={`M0 ${-sz} L${sz * 0.3} ${-sz * 0.3} L${sz} 0 L${sz * 0.3} ${sz * 0.3} L0 ${sz} L${-sz * 0.3} ${sz * 0.3} L${-sz} 0 L${-sz * 0.3} ${-sz * 0.3} Z`} fill={i % 2 ? color : '#FFFFFF'} transform={`translate(${f(Math.cos(a) * r * 1.6)} ${f(Math.sin(a) * r)})`} />);
  }
  return <svg width={10} height={10} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible' }}>{s}</svg>;
};

type W = { w: string; s: number; e: number };
const words = WORDS as W[];
const PHRASES: number[][] = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13], [14, 15, 16, 17, 18], [19, 20, 21, 22, 23], [24, 25, 26]];
const LINES: number[][][] = [[[0, 1], [2, 3, 4]], [[5, 6, 7], [8, 9]], [[10, 11], [12, 13]], [[14, 15], [16, 17, 18]], [[19, 20, 21, 22], [23]], [[24, 25], [26]]];
const KEY: Record<number, { color: string; bg?: string; size?: number; spark?: string; shake?: boolean }> = {
  9: { color: '#FFFFFF', bg: GREEN, spark: YELLOW }, 13: { color: '#FFFFFF', bg: RED, shake: true }, 23: { color: YELLOW, size: 1.35, spark: YELLOW }, 26: { color: YELLOW },
};

/** legendas dinâmicas: cada palavra entra no ritmo da fala; a palavra falada fica em destaque */
export const KineticCaptions: React.FC<{ t: number; endT: number; hideBefore?: number }> = ({ t, endT, hideBefore = 0 }) => {
  let pi = -1;
  for (let i = 0; i < PHRASES.length; i++) { const first = words[PHRASES[i][0]]; if (t >= first.s - 0.08) pi = i; }
  if (pi < 0 || t < hideBefore) return null;
  const ph = PHRASES[pi], last = words[ph[ph.length - 1]];
  const nextStart = pi + 1 < PHRASES.length ? words[PHRASES[pi + 1][0]].s - 0.08 : endT + 1;
  const outK = ss((t - Math.min(nextStart, last.e + 0.9) + 0.12) / 0.12);
  return (
    <div style={{ position: 'absolute', left: 30, right: 30, top: 1370, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: 1 - outK }}>
      {LINES[pi].map((line, li) => (
        <div key={li} style={{ display: 'flex', gap: 34, alignItems: 'center', justifyContent: 'center' }}>
          {line.map((wi) => {
            const w = words[wi], k = outBack((t - w.s + 0.04) / 0.3), active = t >= w.s && t < w.e + 0.05, key = KEY[wi];
            if (k <= 0) return <span key={wi} style={{ opacity: 0, fontFamily: 'Poppins', fontWeight: 800, fontSize: 64 }}>{w.w}</span>;
            const size = 64 * (key?.size || 1);
            const shake = key?.shake && t - w.s < 0.5 ? Math.sin((t - w.s) * 70) * 9 * (1 - (t - w.s) / 0.5) : 0;
            const base: React.CSSProperties = { position: 'relative', display: 'inline-block', fontFamily: 'Poppins', fontWeight: 800, fontSize: size, lineHeight: 1.15,
              color: key ? key.color : active ? YELLOW : '#FFFFFF', WebkitTextStroke: `12px ${DEEP}`, paintOrder: 'stroke fill', textShadow: `0 6px 0 ${DEEP}, 0 10px 18px rgba(0,0,0,.35)`,
              transform: `translate(${f(shake)}px, ${f((1 - k) * 40)}px) scale(${f(Math.max(0.01, k) * (active ? 1.1 : 1))}) rotate(${f((1 - clamp(k)) * -8)}deg)`, transformOrigin: '50% 70%' };
            if (key?.bg) {
              return <span key={wi} style={{ ...base, WebkitTextStroke: '0px', textShadow: 'none', color: key.color, background: key.bg, padding: '2px 18px 0', borderRadius: 18, boxShadow: `0 7px 0 ${DEEP}, 0 12px 22px rgba(0,0,0,.3)`, border: `5px solid ${DEEP}` }}>
                {w.w}{key.spark ? <Sparkles k={(t - w.s) / 0.7} color={key.spark} /> : null}
              </span>;
            }
            return <span key={wi} style={base}>{w.w === 'descobrir' ? 'descobrir…' : w.w}{key?.spark ? <Sparkles k={(t - w.s) / 0.7} color={key.spark} /> : null}</span>;
          })}
        </div>
      ))}
    </div>
  );
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
