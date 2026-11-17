// Legendas dinâmicas: blocos curtos (até 4 palavras, quebra em pontuação), tempo por palavra vindo do Whisper.
import React from 'react';
import { NARR, lin, easeOut } from './timeline';
import { C, FONT_UI, W } from './theme';

const KEY: Record<string, string> = {
  curva: C.cyan, 'redonda.': C.cyan, círculo: C.cyan, 'máximo.': C.cyan, globo: C.cyan, 'curto': C.cyan,
  'distância!': C.cyan, menor: C.cyan, 'curva?': C.cyan, 'curto?': C.cyan, 'esférica.': C.cyan, 'mapa.': C.yellow,
  'enorme?': C.cyan, 'desvio,': C.yellow, 'segredo': C.yellow, 'gigantesca': C.yellow, 'sentido.': C.cyan, 'tempestades': C.yellow, 'rápido.': C.yellow,
  'desvio.': C.yellow, 'enganando!': C.yellow, 'distorcidas.': C.yellow, 'Surpresa:': C.yellow, 'enorme!': C.yellow,
  'Ventos,': C.yellow, 'tempestades,': C.yellow, 'restritos': C.yellow, 'tráfego': C.yellow,
};
const MAXW = 4;
// nunca terminar um bloco em palavra funcional (lê melhor: "de um avião no mapa")
const FUNC = new Set(['a','o','as','os','um','uma','de','do','da','dos','das','no','na','nos','nas','em','e','que','por','para','se','te','ao','à','com','sua','seu','mais','é','esse','esta','está','entre','chamado']);

type Word = { p: string; i: number; f: number };
type Chunk = { words: Word[]; t0: number; t1: number };

const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const fr of NARR.frases) {
    let cur: Word[] = [];
    const ws = fr.palavras;
    ws.forEach((w, idx) => {
      cur.push(w);
      const pont = /[,:.!?…]$/.test(w.p) || w.p.endsWith('...');
      const restantes = ws.length - idx - 1;
      if (pont || (cur.length >= MAXW && restantes > 1 && !FUNC.has(w.p.toLowerCase())) || cur.length >= MAXW + 2) { out.push({ words: cur, t0: 0, t1: 0 }); cur = []; }
    });
    if (cur.length) out.push({ words: cur, t0: 0, t1: 0 });
  }
  out.forEach((c, i) => {
    c.t0 = c.words[0].i - 0.08;
    const next = out[i + 1];
    c.t1 = Math.min(c.words[c.words.length - 1].f + 0.45, next ? next.words[0].i - 0.1 : 1e9);
  });
  return out;
})();
export const CAPTION_CHUNKS = CHUNKS;

export const Captions: React.FC<{ t: number; y?: number; ate?: number }> = ({ t, y = 1400, ate = 1e9 }) => {
  const c = CHUNKS.find((k) => t >= k.t0 && t < k.t1 && k.words[0].i < ate);
  if (!c) return null;
  const kin = easeOut(lin(t, c.t0, c.t0 + 0.18));
  const kout = lin(t, c.t1 - 0.12, c.t1);
  return (
    <div style={{
      position: 'absolute', left: 90, width: W - 220, top: y, textAlign: 'center',
      transform: `translateY(${(1 - kin) * 22}px)`, opacity: kin * (1 - kout),
      fontFamily: FONT_UI, fontWeight: 700, fontSize: 60, lineHeight: 1.18, letterSpacing: -0.5,
      color: C.white, paintOrder: 'stroke fill', WebkitTextStroke: `12px ${C.bg}`,
    }}>
      {c.words.map((w, i) => {
        const dito = t >= w.i - 0.04;
        const col = KEY[w.p] || C.white;
        return (
          <span key={i} style={{ color: col, opacity: dito ? 1 : 0.42 }}>
            {w.p.replace('...', '…')}{i < c.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};
