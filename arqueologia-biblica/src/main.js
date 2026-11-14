// Contrato de render: window.seek(t) desenha o quadro do instante t (função pura do tempo).
const SEM_LEGENDA = /[?&]legenda=0/.test(location.search);
window.seek = (t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = C.papiro; ctx.fillRect(0, 0, W, H);
  const sc = TL.cenas.find((s) => t >= s.t0 && t < s.t0 + s.dur) || TL.cenas[TL.cenas.length - 1];
  CENAS[sc.id](t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  nuvemAreia(prog(t, T.s3 - 0.34, T.s3 + 0.44));      // transição motivada: a nuvem de areia cobre e revela o mapa
  if (!SEM_LEGENDA) legenda(t);
};
window.png = () => cv.toDataURL('image/png');
window.info = () => ({ dur: CFG.dur, fonteTempos: T.fonte, cenas: TL.cenas });
window.ready = Promise.all(['900 40px Cinzel', '700 40px InterUI', '800 40px InterUI', '900 40px InterUI', '40px Fen', '40px Hier'].map((f) => document.fonts.load(f, f.includes('Fen') ? '\u{10901}' : f.includes('Hier') ? '\u{13080}' : 'A')));
