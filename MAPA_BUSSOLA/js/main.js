// Despacha o quadro do instante t para a cena certa (tempo local) e desenha a legenda por cima.
'use strict';
const RENDER = { s01: (ctx, t) => renderS01(ctx, t) };
function cenaEm(t) { let sc = TL.scenes[0]; for (const s of TL.scenes) if (t >= s.t0 - 1e-6) sc = s; return sc; }
function renderFrame(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.setLineDash([]); ctx.lineDashOffset = 0;
  const sc = cenaEm(t), f = RENDER[sc.id];
  if (f) f(ctx, t - sc.t0, CENAS[sc.id]);
  else { ctx.fillStyle = '#333'; ctx.fillRect(0, 0, W, H); txt(ctx, sc.id + ' (a fazer)', 540, 900, 60, { align: 'center' }); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.setLineDash([]);
  LEG.draw(ctx, t);
}
// acertos sonoros (para a mixagem): cada cena registra os seus ao carregar
window.acertos = () => ACERTOS.slice().sort((a, b) => a.t - b.t);
