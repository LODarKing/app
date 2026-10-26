'use strict';
// vistas de laboratório (personagens isolados) para conferir o desenho
function renderLab(ctx, v, t) {
  BOIL = Math.floor(t * 12);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = v === 'cats' ? '#F4F0EC' : '#D9CBD6'; ctx.fillRect(0, 0, W, H);
  if (v === 'pingo') {
    drawPingo(ctx, { x: 290, y: 900, s: 0.78, dilate: 0.3 });
    drawPingo(ctx, { x: 790, y: 900, s: 0.78, tilt: 15, blink: 0.55, dilate: 0.8, look: [6, 4], earR: -14 });
    drawPingo(ctx, { x: 290, y: 1700, s: 0.78, crouch: 1, dilate: 1, earL: 8, earR: 8 });
    drawPingoLeap(ctx, { x: 790, y: 1560, s: 0.62, dilate: 0.9 });
  }
  if (v === 'kids') {
    ctx.fillStyle = '#C9A3BE'; ctx.fillRect(0, 0, W, H);
    drawKid(ctx, 'lara', { x: 300, y: 700, s: 1.0, t, mouth: 0 });
    drawKid(ctx, 'miguel', { x: 790, y: 700, s: 1.0, t, mouth: 0.6, brow: 0.5, armL: { a1: 95, a2: 40, open: 1 }, armR: { a1: 85, a2: 140 } });
    drawKid(ctx, 'lara', { x: 300, y: 1500, s: 1.0, t, mouth: 0.8, surprise: 1, tilt: 6, armL: { a1: 100, a2: 30, open: 1 }, armR: { a1: 80, a2: 150, open: 0.5 } });
    drawKid(ctx, 'miguel', { x: 790, y: 1500, s: 1.0, t, mouth: 0, blink: 1, tilt: -6 });
  }
  if (v === 'people') {
    ctx.fillStyle = '#C9B8C8'; ctx.fillRect(0, 0, W, H);
    drawPerson(ctx, 'lara', { x: 270, y: 470, s: 0.62, t, legs: true, armL: { a1: 100, a2: 60 }, armR: { a1: 80, a2: 120 } });
    drawPerson(ctx, 'miguel', { x: 800, y: 470, s: 0.62, t, legs: true, mouth: 0.5, brow: 0.6 });
    drawPerson(ctx, 'lara', { x: 270, y: 1500, s: 0.85, t, mouth: 0.7, look: [6, 2], turn: 0.4, armR: { a1: 30, a2: -40, open: 1 } });
    drawPerson(ctx, 'miguel', { x: 800, y: 1500, s: 0.85, t, surprise: 1, mouth: 0.8, turn: -0.4, armL: { a1: 150, a2: -120, open: 1 }, armR: { a1: 30, a2: -60, open: 1 } });
  }
  if (v === 'pingoBig') drawPingo(ctx, { x: 540, y: 1500, s: 1.7, dilate: 0.3, tail: t });
  if (v === 'cats' && typeof drawBigCat === 'function') {
    drawBigCat(ctx, 'jaguar', { x: 500, y: 600, s: 1.05, walk: t, moving: 1 }, t);
    drawBigCat(ctx, 'tiger', { x: 520, y: 1200, s: 0.95, walk: t + 0.4, moving: 1 }, t);
    drawBigCat(ctx, 'lion', { x: 470, y: 1820, s: 0.95, walk: 0, moving: 0, jaw: 1, headRot: -14 }, t);
  }
}
// pinceladas também no Pingo (aplicadas na camada inteira)
