// Linha do tempo e contrato de render. Cada cena é uma função pura do tempo local.
const CENAS = window.CENAS || {};
const TL = (() => { let t = 0; return (CFG.cenas || [{ id: 'piloto', dur: CFG.piloto.dur }]).map((c) => { const s = { ...c, t0: t }; t += c.dur; return s; }); })();
const DUR = TL.reduce((a, c) => a + c.dur, 0);
window.seek = (t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  const sc = TL.find((s) => t >= s.t0 && t < s.t0 + s.dur) || TL[TL.length - 1];
  fundo(); CENAS[sc.id](t - sc.t0, sc);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};
window.png = () => cv.toDataURL('image/png');
window.info = () => ({ dur: DUR, cenas: TL.map(({ id, t0, dur }) => ({ id, t0, dur })) });
// vistas de laboratório: conferência de nós (cruzamentos numerados, por cima/por baixo)
window.lab = (nome, t = 1) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); fundo();
  const r = NOS[nome](); desenhaCorda(r, { pontaFim: 'falcaca', pontaInicio: 'corte' });
  r.cruz.forEach((c, i) => { ctx.fillStyle = '#ff2d55'; ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, 7); ctx.fill(); texto(String(i + 1), c.x + 12, c.y - 10, { px: 30, cor: '#ff2d55' }); });
  texto(`${nome}: ${r.cruz.length} cruzamentos · L=${r.L.toFixed(0)}`, 90, 200, { px: 40 });
  // ordem ao longo do caminho: C = por cima, B = por baixo
  const vis = []; r.cruz.forEach((c, i) => { vis.push([c.sCima, 'C' + (i + 1)]); vis.push([c.sBaixo, 'B' + (i + 1)]); }); vis.sort((a, b) => a[0] - b[0]);
  texto(vis.map((v) => v[1]).join(' '), 90, 250, { px: 34, cor: C.destaque });
};
window.ready = Promise.all(['700 40px Zilla', '600 40px InterUI', '700 40px InterUI', '800 40px InterUI', '900 40px InterUI'].map((f) => document.fonts.load(f))).then(() => Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
window.labZoom = (nome, z, fx, fy, cruz = true) => { ctx.setTransform(1, 0, 0, 1, 0, 0); fundo(); camera(z, fx, fy); desenhaCorda(NOS[nome](), { pontaFim: 'falcaca', cruz }); ctx.setTransform(1, 0, 0, 1, 0, 0); };
