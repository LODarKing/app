// Mesa de estudos (onde a aventura começa e termina): fundo vivo, tampo de tábuas em perspectiva, Diário, Lara, Miguel e Pingo.
// o: { cam: {z, fx, fy}, book: {open, gold, riffle}, lara, miguel (poses de drawPerson em coordenadas do mundo), pingo (drawPingo, mundo), cushion, warm }
'use strict';
const MESA_TOP = 1180, MESA_BOOK = { x: 470, y: 1420, s: 0.62, sq: 0.45 };
function mesaShot(ctx, t, o = {}) {
  const c = o.cam || { z: 1.22, fx: 548, fy: 1075 }, z = c.z, sx = 540 - c.fx * z, sy = 960 - c.fy * z, toS = (x, y) => [sx + x * z, sy + y * z];
  const bz = 1 + (z - 1) * 0.3; ctx.save(); ctx.setTransform(bz, 0, 0, bz, 540 + (-210 - c.fx) * bz, 960 + (-40 - c.fy) * bz); drawStudyBack(ctx, t); ctx.restore();
  const kid = (name, q) => { if (!q) return; const [x, y] = toS(q.x, q.y + 40 * q.s); drawPerson(ctx, name, { ...q, x, y, s: q.s * z, cutY: toS(0, MESA_TOP + 6)[1] }); };
  ctx.save(); ctx.setTransform(z, 0, 0, z, sx, sy);
  const bot = 2050, wd = wood(); ctx.fillStyle = '#B98A7C'; ctx.fillRect(-600, MESA_TOP, 2300, 1400);
  for (let i = 0; i < 60; i++) { const v0 = i / 60, v1 = (i + 1) / 60, y0 = lerp(MESA_TOP, bot, v0 * v0 * 0.4 + v0 * 0.6), y1 = lerp(MESA_TOP, bot, v1 * v1 * 0.4 + v1 * 0.6), scl = lerp(0.7, 1.4, v0), wp = 1600 * scl; ctx.drawImage(wd, 0, v0 * 1000, 1600, 1000 / 60 + 1, W / 2 - wp / 2, y0, wp, y1 - y0 + 1); }
  ctx.fillStyle = 'rgba(70,40,60,0.28)'; ctx.fillRect(-600, MESA_TOP, 2300, 26);
  if (o.cushion) { ctx.fillStyle = 'rgba(40,20,30,0.25)'; ctx.beginPath(); ctx.ellipse(868, 1500, 190, 40, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#5E7EB0'; ctx.beginPath(); ctx.ellipse(860, 1480, 180, 60, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#7E9ED0'; ctx.beginPath(); ctx.ellipse(860, 1466, 150, 40, 0, 0, 6.283); ctx.fill(); }
  ctx.restore();
  kid('lara', o.lara); kid('miguel', o.miguel);
  // o Diário (aberto/fechado; luz dourada nas páginas)
  const B = o.book || { open: 1 }; const bm = [MESA_BOOK.s * z, 0, 0, MESA_BOOK.s * MESA_BOOK.sq * z, sx + MESA_BOOK.x * z, sy + MESA_BOOK.y * z];
  ctx.save(); ctx.setTransform(...bm); BOOK.bookSpread(ctx, t, { open: B.open ?? 1, riffle: B.riffle || 0, ignite: 0, right: B.right }); ctx.restore();
  if (B.gold) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const [gx, gy] = toS(MESA_BOOK.x, MESA_BOOK.y - 40); ctx.fillStyle = radial(ctx, gx, gy, 20, 520 * z, [[0, `rgba(255,214,140,${0.55 * B.gold})`], [1, 'rgba(255,214,140,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore(); motes(ctx, t, [gx - 300 * z, gy - 600 * z, 600 * z, 600 * z], { n: 16, seed: 77, color: '255,226,160', alpha: 0.8 * B.gold, drift: [4, -30] }); }
  if (o.pingo) { const q = o.pingo, [x, y] = toS(q.x, q.y); drawPingo(ctx, { ...q, x, y, s: q.s * z }); }
  leafShadows(ctx, t, [0, Math.max(0, toS(0, MESA_TOP)[1] - 520 * z), W, H], { alpha: 0.13, scale: z, seed: 3 });
  motes(ctx, t, [0, 200, W, 1300], { n: 18, seed: 9 });
  if (o.warm) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,190,110,${0.5 * o.warm})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = linear(ctx, 0, 0, W, H, [[0, 'rgba(255,214,170,0.5)'], [1, 'rgba(120,80,140,0.3)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
}
