// Linha do tempo (timeline.js, gerado por audio/montar_timeline.mjs) e contrato de render.
// Cada cena é uma função pura do tempo local: CENAS[id](t, cena). Legendas desenhadas por cima (desligáveis).
const CENAS = window.CENAS || {};
const SEM_LEGENDA = /[?&]legenda=0/.test(location.search);
const DUR = TL.dur;
window.seek = (t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  const sc = TL.cenas.find((s) => t >= s.t0 && t < s.t0 + s.dur) || TL.cenas[TL.cenas.length - 1];
  fundo(); CENAS[sc.id](t - sc.t0, sc);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  if (!SEM_LEGENDA && !(CENAS[sc.id].semLegenda && CENAS[sc.id].semLegenda(t - sc.t0, sc))) legenda(TL.legendas, t);
};
window.png = () => cv.toDataURL('image/png');
window.info = () => ({ dur: DUR, cenas: TL.cenas.map(({ id, t0, dur }) => ({ id, t0, dur })) });
// vistas de laboratório: conferência de nós (cruzamentos numerados, por cima/por baixo)
window.lab = (nome) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); fundo();
  const r = NOS[nome]();
  if (nome === 'fiel') desenhaCordaZ(r, { entre: () => mastro(540, 260, 1300, 44, true), pontaFim: 'corte' });
  else if (r.faixasAB) desenhaCordaZ(r, { faixas: r.faixasAB, cor: (s) => s > r.faixasAB[1][0] ? C.ceu : C.creme, pontas: [[r.faixasAB[0][1], 'corte'], [r.L, 'corte']] });
  else if (r.faixas) desenhaCordaZ(r, { faixas: r.faixas, cor: r.cor });
  else desenhaCorda(r, { pontaFim: 'falcaca', pontaInicio: 'corte' });
  r.cruz.forEach((c, i) => { ctx.fillStyle = '#ff2d55'; ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, 7); ctx.fill(); texto(String(i + 1), c.x + 12, c.y - 10, { px: 30, cor: '#ff2d55' }); });
  texto(`${nome}: ${r.cruz.length} cruzamentos · L=${r.L.toFixed(0)}`, 90, 200, { px: 40 });
  const vis = []; r.cruz.forEach((c, i) => { vis.push([c.sCima, 'C' + (i + 1)]); vis.push([c.sBaixo, 'B' + (i + 1)]); }); vis.sort((a, b) => a[0] - b[0]);
  texto(vis.map((v) => v[1]).join(' '), 90, 250, { px: 34, cor: C.destaque });
};
window.ready = Promise.all(['700 40px Zilla', '600 40px InterUI', '700 40px InterUI', '800 40px InterUI', '900 40px InterUI'].map((f) => document.fonts.load(f))).then(() => Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
