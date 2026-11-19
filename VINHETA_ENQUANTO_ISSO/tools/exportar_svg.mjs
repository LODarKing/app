// Exporta o lettering e a assinatura em SVG editável (contornos vetoriais limpos, sem fontes).
// Uso: node tools/exportar_svg.mjs   → entregaveis/lettering/svg/
import fs from 'node:fs';
import { buildLockup, PALETTE } from '../src/lettering/lockups.js';
import { monoD, nibOutline, swellOutline, strokePoints, resample } from '../src/lettering/engine.js';
import { UPPER, LOWER, MOUTH, HIGHLIGHTS } from '../src/lettering/lipsPaths.js';
import { MAP_SHIFT } from '../src/lettering/final.js';

const OUT = 'entregaveis/lettering/svg'; fs.mkdirSync(OUT, { recursive: true });
const NAMES = ['enquanto', 'isso', 'em', 'amontada'];

function wordPaths(w, wi, fill) {
  const parts = w.strokes.filter((s) => s.pts).map((st) => {
    if (w.tool === 'mono') return `<path d="${monoD(st.pts, 1)}" fill="none" stroke="${fill ?? w.color}" stroke-width="${w.opts.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const d = w.tool === 'nib' ? nibOutline(st.pts, { ...w.opts, seed: w.word * 100 + st.li * 10 + st.si + 1, capStart: st.hidden ? 'round' : 'bevel', capEnd: st.hiddenEnd ? 'round' : 'bevel', ...(st.hidden ? { pIn: 0.3 } : {}), ...(st.hiddenEnd ? { pOut: 0.55 } : {}), ...(st.loop ? { pIn: 1, pOut: 0 } : {}) }, 1) : swellOutline(st.pts, w.opts, 1);
    return `<path d="${d}"/>`;
  });
  return `<g id="${NAMES[wi] ?? 'palavra' + wi}" fill="${fill ?? w.color}">${parts.join('')}</g>`;
}
function bbox(L) {
  const xs = [], ys = []; L.words.forEach((w) => w.strokes.forEach((s) => s.pts && s.pts.forEach((p) => { xs.push(p[0]); ys.push(p[1]); })));
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
function svg(vb, body, bg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map((v) => v.toFixed(1)).join(' ')}" width="${vb[2].toFixed(0)}" height="${vb[3].toFixed(0)}">\n<title>Enquanto Isso em Amontada… — lettering autoral</title>\n${bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : ''}${body}\n</svg>\n`;
}
const pad = 40;
// 1) lettering da final em três versões + as três propostas
for (const v of [1, 2, 3]) {
  const L = buildLockup(v), [x0, y0, x1, y1] = bbox(L), vb = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
  if (v === 1) {
    fs.writeFileSync(`${OUT}/lettering-cor.svg`, svg(vb, L.words.map((w, i) => wordPaths(w, i)).join('\n')));
    fs.writeFileSync(`${OUT}/lettering-monocromatico.svg`, svg(vb, L.words.map((w, i) => wordPaths(w, i, PALETTE.cherry)).join('\n')));
    fs.writeFileSync(`${OUT}/lettering-negativo.svg`, svg(vb, L.words.map((w, i) => wordPaths(w, i, PALETTE.cream)).join('\n'), PALETTE.cherry));
  }
  fs.writeFileSync(`${OUT}/proposta-${v}-lettering.svg`, svg(vb, L.words.map((w, i) => wordPaths(w, i)).join('\n')));
}
// 2) assinatura completa (mapa + beijo + lettering), no enquadramento do vídeo e recortada
const C = JSON.parse(fs.readFileSync('src/mapa/contorno.json', 'utf8')), K = 2.6, [bx0, by0, bx1] = C.bbox_ref;
const MX = 540 - ((bx1 - bx0) * K) / 2 + MAP_SHIFT[0], MY = 330 + MAP_SHIFT[1];
const W = ([x, y]) => [MX + (x - bx0) * K, MY + (y - by0) * K];
const loop = C.pontos.map(W); loop.push(loop[0]);
const od = 'M' + loop.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
const outline = nibOutline(resample(loop, 1.4), { angle: -35, wmin: 3.6, wmax: 12.5, k: 1.5, pIn: 1, pOut: 0, wobble: 0.07, seed: 4 }, 1);
const city = W([191.7, 378.3]);
const lips = `<g id="beijo" transform="translate(${city[0].toFixed(1)} ${city[1].toFixed(1)}) scale(0.42) translate(0 -10)"><path d="${UPPER}" fill="#B0021F"/><path d="${LOWER}" fill="#D90429"/><path d="${UPPER}" fill="none" stroke="#7B0D1E" stroke-width="2.2"/><path d="${LOWER}" fill="none" stroke="#7B0D1E" stroke-width="2.2"/><path d="${MOUTH}" fill="none" stroke="#4A0414" stroke-width="4.5" stroke-linecap="round"/>${HIGHLIGHTS.map(([d, o]) => `<path d="${d}" fill="#FFF6EE" opacity="${(0.8 * o).toFixed(2)}"/>`).join('')}</g>`;
const map = `<g id="mapa-amontada"><path d="${od}" fill="${PALETTE.pink}" opacity="0.85" transform="translate(14 16)"/><path d="${od}" fill="#FFC9D3"/><path d="${outline}" fill="${PALETTE.cherry}"/></g>`;
const L1 = buildLockup(1), letters = `<g id="lettering">${L1.words.map((w, i) => wordPaths(w, i)).join('')}</g>`;
fs.writeFileSync(`${OUT}/assinatura-completa-1080x1920.svg`, svg([0, 0, 1080, 1920], `${map}\n${lips}\n${letters}`, PALETTE.blush));
const ys = loop.map((p) => p[1]), xs = loop.map((p) => p[0]), [lx0, ly0, lx1, ly1] = bbox(L1);
const vb = [Math.min(...xs, lx0) - pad, Math.min(...ys) - pad, Math.max(...xs, lx1) - Math.min(...xs, lx0) + 2 * pad, ly1 - Math.min(...ys) + 2 * pad];
fs.writeFileSync(`${OUT}/assinatura-logotipo.svg`, svg(vb, `${map}\n${lips}\n${letters}`));
console.log(fs.readdirSync(OUT).join('\n'));
