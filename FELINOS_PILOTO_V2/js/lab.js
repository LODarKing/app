'use strict';
// vistas de laboratório para conferir personagens isolados
function renderLab(ctx, v, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#9DD3EC'], [1, '#E8D2B0']]); ctx.fillRect(0, 0, W, H);
  if (v === 'pingo') {
    drawPingo(ctx, { x: 290, y: 900, s: 0.78, dilate: 0.3, breath: 0 });
    drawPingo(ctx, { x: 790, y: 900, s: 0.78, tilt: 15, blink: 0.55, dilate: 0.8, look: [6, 4], earR: -14, breath: 1 });
    drawPingo(ctx, { x: 290, y: 1700, s: 0.78, crouch: 1, dilate: 1, earL: 8, earR: 8 });
    drawPingoLeap(ctx, { x: 790, y: 1560, s: 0.62, dilate: 0.9, blink: 0 });
  }
  if (v === 'pingoBig') drawPingo(ctx, { x: 540, y: 1500, s: 1.7, dilate: 0.3, tail: t, breath: t });
  if (typeof labCats === 'function' && v.startsWith('cats')) labCats(ctx, v, t);
}
function labCats(ctx, v, t) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#A8C9A0'], [1, '#6E8A5A']]); ctx.fillRect(0, 0, W, H);
  drawBigCat(ctx, 'jaguar', { x: 500, y: 560, s: 1.05, walk: t, moving: 1 }, t, {});
  drawBigCat(ctx, 'tiger', { x: 520, y: 1130, s: 0.95, walk: t + 0.4, moving: 1 }, t, {});
  drawBigCat(ctx, 'lion', { x: 470, y: 1760, s: 0.95, walk: 0, moving: 0, jaw: 1, headRot: -14 }, t, {});
}
