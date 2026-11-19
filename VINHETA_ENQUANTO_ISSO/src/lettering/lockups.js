// As três composições do título. Cada uma define: conjunto de letras, ferramenta de traço, disposição das palavras
// e como o traço de batom se integra. buildLockup(v) devolve os traços já posicionados na tela (1080×1920).
import { BASE, GEO, CUPIDO } from './glyphs.js';
import { strokePoints, lengthOf } from './engine.js';

export const PALETTE = { cherry: '#D90429', pink: '#FF4D6D', pale: '#FFE4E8', wine: '#7B0D1E', cream: '#FFF6EE', blush: '#FFF1F2' };

function layoutWord(text, set, o) {
  const k = o.xh / 100, sl = Math.tan(((o.slant || 0) * Math.PI) / 180), out = []; let cx = 0;
  const chars = [...text];
  chars.forEach((ch, li) => {
    let key = ch === '…' ? '.' : ch;
    if (o.endA && li === chars.findLastIndex((c) => c === 'a')) key = 'aEnd';
    const g = set[key]; if (!g) { cx += 40; return; }
    const reps = ch === '…' ? 3 : 1;
    for (let r = 0; r < reps; r++) {
      const ox = cx;
      const tf = (x, y) => [o.x + (ox + x - y * sl) * k, o.y + y * k];
      if (!g.s.length) out.push({ mark: tf(g.adv / 2, -14), word: o.word, li: li + r, si: 0, key });
      g.s.forEach((d0, si) => {
        const pre = d0.match(/^[~!=]*/)[0], loop = pre.includes('='), hidden = loop || pre.includes('~'), hiddenEnd = loop || pre.includes('!'), d = d0.slice(pre.length);
        const pts = strokePoints(d, tf, 1.5);
        out.push({ pts, len: lengthOf(pts), word: o.word, li: li + r, si, key, hidden, hiddenEnd, loop, x0: o.x + ox * k });
      });
      cx += g.adv + (o.track || 0) + (o.kern?.[li] || 0);
    }
  });
  return { strokes: out, width: cx * k };
}

const LOCKUPS = {
  // 1 — BALA DE BATOM: pena larga com o bisel do batom; composição assimétrica em degraus; o traço do mapa
  //     desce e vira o E; o travessão do A nasce como um risco de batom; o último "a" se alonga até as reticências
  1: () => {
    const nib = (xh, wmax, wmin) => ({ angle: -35, wmax: wmax * xh / 100, wmin: wmin * xh / 100, k: 2.2 });
    const words = [
      { text: 'Enquanto', set: BASE, x: 92, y: 1178, xh: 70, track: 2, tool: 'nib', opts: nib(70, 31, 4.2), color: PALETTE.wine },
      { text: 'Isso', set: BASE, x: 392, y: 1292, xh: 70, track: 4, tool: 'nib', opts: nib(70, 31, 4.2), color: PALETTE.wine },
      { text: 'em', set: BASE, x: 652, y: 1292, xh: 38, track: 6, slant: 10, tool: 'nib', opts: { angle: -35, wmax: 9, wmin: 2.4, k: 1.6 }, color: '#EF476F' },
      { text: 'Amontada…', set: BASE, x: 96, y: 1496, xh: 88, track: 3, endA: true, tool: 'nib', opts: nib(88, 34, 4), color: PALETTE.cherry, pigment: true },
    ];
    return { words, map: { shift: [40, 0], scale: 1 } };
  },
  // 2 — LINHA CONTÍNUA: geometria pura (círculos e retas) em linha única; composição centrada e simétrica;
  //     o contorno do mapa desce em linha reta e vira a régua sob "Amontada"
  2: () => ({
    words: [
      { text: 'Enquanto Isso', set: GEO, x: 0, y: 1160, xh: 50, track: 6, tool: 'mono', opts: { width: 6 }, color: PALETTE.wine, center: true },
      { text: 'em', set: GEO, x: 0, y: 1250, xh: 30, track: 8, tool: 'mono', opts: { width: 4 }, color: PALETTE.pink, center: true },
      { text: 'Amontada…', set: GEO, x: 0, y: 1452, xh: 84, track: 4, tool: 'mono', opts: { width: 10 }, color: PALETTE.cherry, center: true },
    ],
    rule: { y: 1490, x0: 100, x1: 980 },
    map: { shift: [0, -30], scale: 0.92 },
  }),
  // 3 — ARCO DO CUPIDO: o arco do lábio vira letra (m, n e A pontudos, E em épsilon), traço em gota, cascata
  //     diagonal inclinada; as reticências são três beijos
  3: () => {
    const sw = (xh) => ({ wmin: 2.5 * xh / 100, wmax: 24 * xh / 100, profile: [0.12, 1, 0.55, 0.15] });
    return {
      words: [
        { text: 'Enquanto', set: CUPIDO, x: 70, y: 1150, xh: 66, track: 4, slant: 9, tool: 'swell', opts: sw(66), color: PALETTE.wine },
        { text: 'Isso', set: CUPIDO, x: 300, y: 1262, xh: 66, track: 2, slant: 9, tool: 'swell', opts: sw(66), color: PALETTE.wine },
        { text: 'em', set: CUPIDO, x: 616, y: 1262, xh: 40, track: 2, slant: 9, tool: 'swell', opts: sw(40), color: PALETTE.pink },
        { text: 'Amontada…', set: CUPIDO, x: 110, y: 1470, xh: 90, track: -2, slant: 9, endA: true, tool: 'swell', opts: sw(90), color: PALETTE.cherry },
      ],
      kisses: true,
      map: { shift: [150, -60], scale: 0.78 },
    };
  },
};

const cache = {};
export function buildLockup(v) {
  if (cache[v]) return cache[v];
  const def = LOCKUPS[v]();
  const words = def.words.map((w, wi) => {
    let lay = layoutWord(w.text, w.set, { ...w, word: wi });
    if (w.center) lay = layoutWord(w.text, w.set, { ...w, x: 540 - lay.width / 2 + ((w.track || 0) * w.xh) / 200, word: wi });
    return { ...w, strokes: lay.strokes, width: lay.width };
  });
  cache[v] = { ...def, words };
  return cache[v];
}
