// Linha do tempo do piloto a partir da locução REAL (alinhamento por palavra da ElevenLabs).
// Entrada: audio/piloto/alinhamento.json (real) — se não existir, usa alinhamento_estimado.json e marca como ESTIMADO.
// Saída:   src/tempos.js (para o render) e audio/piloto/ancoras.json (para a trilha e os efeitos).
// Os cortes seguem o storyboard (0–1,2 · 1,2–3,8 · 3,8–6,5 · 6,5–8,5 · 8,5–10), ajustados às palavras ditas.
import fs from 'node:fs';
const real = fs.existsSync('audio/piloto/alinhamento.json');
const A = JSON.parse(fs.readFileSync(real ? 'audio/piloto/alinhamento.json' : 'audio/piloto/alinhamento_estimado.json', 'utf8'));
const P = A.palavras.map(([w, a, b]) => ({ w, a, b }));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const acha = (w, depois = 0) => { const i = P.findIndex((p, k) => k >= depois && norm(p.w) === w); if (i < 0) throw new Error('palavra não encontrada na locução: ' + w); return i; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const iCasa = acha('casa'), iDavi = acha('davi', iCasa), iE = acha('e', iDavi), iArq = acha('arqueologia'), iBib = acha('biblica', iArq);
const casa = P[iCasa].a, daviFim = P[iDavi].b, arq = P[iArq].a, bibFim = P[iBib].b, vozFim = P[P.length - 1].b;
// grade musical: 120 bpm, semicolcheia = 0,125 s. Eventos visuais que não são palavras caem na grade
// (o som também cai nela: desvio zero); os ligados a palavras ficam a no máximo ~62 ms da palavra.
const BPM = 120, SEMI = 60 / BPM / 4, g = (x) => Math.round(x / SEMI) * SEMI;
const s2 = g(1.2);
const s3 = g(clamp(Math.max(3.8, daviFim + 0.12), 3.6, 4.6));
const s4 = g(clamp(arq - 0.6, s3 + 1.6, 7.2));
const trava = g(Math.max(s4 + 0.375, arq - 0.2));
const carimbo = g(Math.max(arq, trava + 0.125));
const s5 = g(clamp(bibFim + 0.2, s4 + 1.6, 8.7));
const R0 = s2, R1 = g(clamp(casa - 0.32, R0 + 0.75, s2 + 1.4)), pouso = g(Math.max(casa, R1 + 0.5)), L0 = R1 - SEMI;
const a0 = s3 + 3 * SEMI;                                     // o egípcio começa a apontar
const T = { fonte: real ? 'real' : 'ESTIMADO', bpm: BPM, semi: SEMI, casa, daviFim, frase2: P[iE].a, lenda: P[acha('lenda')].a, arq, bibFim, vozFim,
  s2, s3, s4, trava, carimbo, s5, fim: 10,
  gancho: [0, 0, SEMI, 3 * SEMI], R0, R1, pouso, L0, a0, setaA: a0 + 5 * SEMI, setaB: a0 + 8 * SEMI, dan: a0 + 8 * SEMI,
  rolo0: s5 + 2 * SEMI, rolo1: s5 + 8 * SEMI, sub0: s5 + 7 * SEMI, sub1: s5 + 10 * SEMI, desce: Math.max(s5 + 10 * SEMI, 9.25) };
// cortes (cenas) e checagens do storyboard
const cenas = [['gancho', 0, s2], ['estela', s2, s3], ['mapa', s3, s4], ['mecanismo', s4, s5], ['titulo', s5, 10]].map(([id, a, b]) => ({ id, t0: +a.toFixed(3), dur: +(b - a).toFixed(3) }));
if (vozFim > 9.6) console.warn('AVISO: a locução termina em', vozFim.toFixed(2), 's (o piloto tem 10 s)');
for (const c of cenas) if (c.dur < 1.2) console.warn('AVISO: cena curta', c.id, c.dur);
const out = { T, cenas, palavras: P.map((p) => [p.w, +p.a.toFixed(3), +p.b.toFixed(3)]) };
fs.writeFileSync('src/tempos.js', `// GERADO por ferramentas/montar_tempos.mjs — não editar à mão. Fonte dos tempos: ${T.fonte}\nwindow.TL = ${JSON.stringify(out, null, 1)};\n`);
fs.writeFileSync('audio/piloto/ancoras.json', JSON.stringify(out, null, 1));
console.log(`tempos (${T.fonte}):`, cenas.map((c) => `${c.id} ${c.t0.toFixed(2)}–${(c.t0 + c.dur).toFixed(2)}`).join(' | '), `| casa ${casa.toFixed(2)} | carimbo ${carimbo.toFixed(2)} | voz até ${vozFim.toFixed(2)}`);
