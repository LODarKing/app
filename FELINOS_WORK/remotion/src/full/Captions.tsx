// Legendas dinâmicas para o vídeo inteiro: frases curtas, palavra por palavra no ritmo da narração,
// palavra falada em destaque e palavras-chave com tratamento especial.
import React from 'react';
import { outBack, ss, sm } from '../lib/anim';
import { clamp, f } from '../lib/paths';
import WORDS from '../words_all.json';

type W = { w: string; s: number; e: number; sc: number };
const words = WORDS as W[];
const DEEP = '#190C3C', YELLOW = '#FFEB00';
export type KeyStyle = { color: string; bg?: string; size?: number; spark?: string; shake?: boolean };
const C = { green: '#3FA34D', red: '#E5484D', royal: '#2851D8', turq: '#0FA3B1', orange: '#F28C28', navy: '#211C55', purple: '#7B4FD0' };
const chip = (bg: string, spark?: string): KeyStyle => ({ color: '#FFFFFF', bg, spark });
const big = (color = YELLOW, size = 1.3, spark?: string): KeyStyle => ({ color, size, spark });

/** palavras-chave por cena: texto exato da palavra -> estilo */
const KEYS: Record<number, Record<string, KeyStyle>> = {
  1: { gatinho: big(YELLOW, 1.1), 'fofinho,': chip('#F06AA0', '#FFFFFF'), família: big(YELLOW, 1.15), segredos: chip(C.purple, YELLOW), 'incríveis!': big(YELLOW, 1.35, YELLOW) },
};

// ---- frases: quebra em pontuação ou a cada ~5 palavras; duas linhas equilibradas
type Phrase = { idx: number[]; lines: number[][] };
const phrases: Phrase[] = [];
{
  let cur: number[] = [];
  const flush = () => {
    if (!cur.length) return;
    const total = cur.reduce((a, i) => a + words[i].w.length + 1, 0);
    let acc = 0, cut = cur.length;
    for (let k = 0; k < cur.length; k++) { acc += words[cur[k]].w.length + 1; if (acc >= total / 2) { cut = k + 1; break; } }
    const lines = total <= 16 || cur.length === 1 ? [cur] : [cur.slice(0, cut), cur.slice(cut)].filter((l) => l.length);
    phrases.push({ idx: cur, lines }); cur = [];
  };
  words.forEach((w, i) => {
    if (cur.length && (words[cur[0]].sc !== w.sc || w.s - words[cur[cur.length - 1]].e > 0.45)) flush();
    cur.push(i);
    const len = cur.reduce((a, j) => a + words[j].w.length + 1, 0);
    if (/[.?!]$/.test(w.w) || (/,$/.test(w.w) && len > 14) || cur.length >= 7 || len > 46) flush();
  });
  flush();
}
export const PHRASES = phrases;

const Sparkles: React.FC<{ k: number; color: string }> = ({ k, color }) => {
  if (k <= 0 || k >= 1) return null;
  const s = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3, r = 40 + 110 * sm(k), sz = 22 * (1 - k);
    s.push(<path key={i} d={`M0 ${-sz} L${sz * 0.3} ${-sz * 0.3} L${sz} 0 L${sz * 0.3} ${sz * 0.3} L0 ${sz} L${-sz * 0.3} ${sz * 0.3} L${-sz} 0 L${-sz * 0.3} ${-sz * 0.3} Z`} fill={i % 2 ? color : '#FFFFFF'} transform={`translate(${f(Math.cos(a) * r * 1.6)} ${f(Math.sin(a) * r)})`} />);
  }
  return <svg width={10} height={10} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible' }}>{s}</svg>;
};

export const GlobalCaptions: React.FC<{ t: number; hide?: (t: number) => boolean; top?: (t: number) => number }> = ({ t, hide, top }) => {
  if (hide && hide(t)) return null;
  let pi = -1;
  for (let i = 0; i < phrases.length; i++) if (t >= words[phrases[i].idx[0]].s - 0.08) pi = i;
  if (pi < 0) return null;
  const ph = phrases[pi], last = words[ph.idx[ph.idx.length - 1]];
  const nextStart = pi + 1 < phrases.length ? words[phrases[pi + 1].idx[0]].s - 0.08 : 1e9;
  const end = Math.min(nextStart, last.e + 0.7);
  if (t > end + 0.01) return null;
  const outK = ss((t - end + 0.12) / 0.12);
  const sc = words[ph.idx[0]].sc, keys = KEYS[sc] || {};
  return (
    <div style={{ position: 'absolute', left: 24, right: 24, top: top ? top(t) : 1370, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: 1 - outK }}>
      {ph.lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', gap: 30, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>
          {line.map((wi) => {
            const w = words[wi], k = outBack((t - w.s + 0.04) / 0.3), active = t >= w.s && t < w.e + 0.05, key = keys[w.w];
            const size = 62 * (key?.size || 1);
            if (k <= 0) return <span key={wi} style={{ opacity: 0, fontFamily: 'Poppins', fontWeight: 800, fontSize: size }}>{w.w}</span>;
            const shake = key?.shake && t - w.s < 0.5 ? Math.sin((t - w.s) * 70) * 9 * (1 - (t - w.s) / 0.5) : 0;
            const base: React.CSSProperties = { position: 'relative', display: 'inline-block', fontFamily: 'Poppins', fontWeight: 800, fontSize: size, lineHeight: 1.15, whiteSpace: 'nowrap',
              color: key ? key.color : active ? YELLOW : '#FFFFFF', WebkitTextStroke: `12px ${DEEP}`, paintOrder: 'stroke fill', textShadow: `0 6px 0 ${DEEP}, 0 10px 18px rgba(0,0,0,.35)`,
              transform: `translate(${f(shake)}px, ${f((1 - k) * 40)}px) scale(${f(Math.max(0.01, k) * (active ? 1.08 : 1))}) rotate(${f((1 - clamp(k)) * -8)}deg)`, transformOrigin: '50% 70%' };
            const spark = key?.spark ? <Sparkles k={(t - w.s) / 0.7} color={key.spark} /> : null;
            if (key?.bg) return <span key={wi} style={{ ...base, WebkitTextStroke: '0px', textShadow: 'none', color: key.color, background: key.bg, padding: '2px 18px 0', borderRadius: 18, boxShadow: `0 7px 0 ${DEEP}, 0 12px 22px rgba(0,0,0,.3)`, border: `5px solid ${DEEP}` }}>{w.w}{spark}</span>;
            return <span key={wi} style={base}>{w.w}{spark}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** legendas em SRT a partir das mesmas frases */
export function toSRT(): string {
  const ts = (x: number) => { const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };
  return phrases.map((p, i) => {
    const s = words[p.idx[0]].s, e = Math.min(words[p.idx[p.idx.length - 1]].e + 0.5, i + 1 < phrases.length ? words[phrases[i + 1].idx[0]].s - 0.02 : 1e9);
    return `${i + 1}\n${ts(s)} --> ${ts(e)}\n${p.lines.map((l) => l.map((j) => words[j].w).join(' ')).join('\n')}\n`;
  }).join('\n');
}
