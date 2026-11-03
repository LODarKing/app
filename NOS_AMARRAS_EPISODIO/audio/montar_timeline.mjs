// Monta timeline.js a partir dos tempos das palavras da narração tratada (falas/tempos.json) e de config.js.
// Cada cena dura: vo + duração da fala + extra. Legendas: blocos por frase (até 2 linhas), com a grafia corrigida.
// Uso: node audio/montar_timeline.mjs
import fs from 'node:fs';
const CFG = new Function(fs.readFileSync('config.js', 'utf8') + '; return CFG;')();
const T = JSON.parse(fs.readFileSync('falas/tempos.json', 'utf8'));
const r3 = (x) => Math.round(x * 1000) / 1000;
let t0 = 0; const cenas = [], legendas = [];
const MAXC = 54;                                    // ~2 linhas de Inter ExtraBold 54 px em 880 px
for (const c of CFG.cenas) {
  const f = T[c.fala], vo = CFG.vo, dur = r3(vo + f.dur_tratada + c.extra);
  const pal = f.palavras.map(([w, a, b]) => [w, r3(vo + a), r3(vo + b)]);
  // blocos: quebra em ponto/interrogação; se ficar longo, quebra na vírgula mais perto do meio
  const blocos = []; let cur = [];
  const qb = (CFG.quebras || {})[c.id] || [];
  for (const p of pal) { cur.push(p); if (/[.?!]$/.test(p[0]) || qb.includes(p[0])) { blocos.push(cur); cur = []; } }
  if (cur.length) blocos.push(cur);
  const divide = (b) => {
    const txt = b.map((p) => p[0]).join(' '); if (txt.length <= MAXC) return [b];
    let best = -1, bd = 1e9, acc = 0;
    b.forEach((p, i) => { acc += p[0].length + 1; if (i < b.length - 1 && /[,:;]$/.test(p[0])) { const d = Math.abs(acc - txt.length / 2); if (d < bd) { bd = d; best = i; } } });
    if (best < 0) { acc = 0; b.forEach((p, i) => { acc += p[0].length + 1; const d = Math.abs(acc - txt.length / 2); if (d < bd && i < b.length - 1) { bd = d; best = i; } }); }
    return [...divide(b.slice(0, best + 1)), ...divide(b.slice(best + 1))];
  };
  const fixa = (s) => { for (const [a, b] of CFG.grafia) s = s.split(a).join(b); return s.replace(/\s+([,.:;?!])/g, '$1'); };
  const lista = blocos.flatMap(divide);
  // corrige a grafia no texto da frase inteira e reparte de volta pelos blocos (palavra a palavra)
  lista.forEach((b, i) => {
    const prox = lista[i + 1], a = t0 + b[0][1] - 0.05, fim = prox ? t0 + prox[0][1] - 0.05 : t0 + b[b.length - 1][2] + 0.45;
    legendas.push([r3(a), r3(Math.min(fim, t0 + dur)), fixa(b.map((p) => p[0]).join(' ')), c.id]);
  });
  cenas.push({ id: c.id, fala: `falas/${c.fala}.flac`, t0: r3(t0), dur, vo, durFala: f.dur_tratada, palavras: pal });
  t0 += dur;
}
const tl = { fps: CFG.fps, bpm: CFG.bpm, dur: r3(t0), cenas, legendas };
fs.writeFileSync('timeline.js', 'const TL = ' + JSON.stringify(tl) + ';\n');
// SRT
const ts = (x) => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync('NOS_E_AMARRAS.srt', legendas.map(([a, b, s], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${s}\n`).join('\n'));
console.log(`timeline.js: ${cenas.length} cenas, ${t0.toFixed(1)} s, ${legendas.length} legendas`);
for (const l of legendas) console.log(l[0].toFixed(2), l[1].toFixed(2), l[3], '|', l[2]);
