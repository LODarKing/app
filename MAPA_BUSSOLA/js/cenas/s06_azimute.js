// Cena 6 — AZIMUTE: ângulo em graus a partir do Norte, sempre no sentido horário. N 0°/360°, L 90°, S 180°, O 270°; exemplo: 60° (entre N e L).
'use strict';
const A6 = (() => {
  const id = 's06', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    titulo: h(F(id, 'azimute'), 'marca'), angulo: h(F(id, 'ângulo'), 'risco'), graus: h(F(id, 'graus'), 'tique'), norte: h(F(id, 'Norte'), 'pop'),
    horario: h(F(id, 'sentido'), 'giro'), n0: h(F(id, 'Norte', 1), 'pop'), l90: h(F(id, 'Leste'), 'giro'), s180: h(F(id, 'Sul'), 'giro'), o270: h(F(id, 'Oeste'), 'giro'),
    az60: h(F(id, 'azimute', 1), 'giro'), v60: h(F(id, '60'), 'marca'), entre: h(F(id, 'entre'), 'pop'), fim: CENAS[id].dur,
  };
})();
function renderS06(ctx, t) {
  const a = A6, cx = 540, cy = 840, R = 330;
  fundo(ctx, true, { cx: 300, cy: -300, z: 0.7, r: 0 }, t * 6);
  const rad = (g) => ((g - 90) * Math.PI) / 180;
  // mostrador
  const kd = eo3(prog(t, a.angulo - 0.3, a.angulo + 0.8));
  if (kd > 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, rad(0), rad(360 * kd)); ctx.stroke();
    for (let g = 0; g < 360 * kd; g += 5) { const [x0, y0] = azPt(cx, cy, R, g), [x1, y1] = azPt(cx, cy, R - (g % 30 === 0 ? 30 : g % 10 === 0 ? 18 : 9), g); ctx.lineWidth = g % 30 === 0 ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    for (let g = 30; g < 360 * kd; g += 30) { if (g % 90 === 0) continue; const [x, y] = azPt(cx, cy, R - 58, g); txt(ctx, g + '°', x, y, 26, { cor: 'rgba(255,255,255,0.75)', align: 'center', base: 'middle', peso: 700 }); }
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, 7); ctx.fillStyle = PAL.branco; ctx.fill();
  }
  // quadrante entre N e L
  const ke = eo3(prog(t, a.entre, a.entre + 0.5));
  if (ke > 0) { ctx.fillStyle = 'rgba(242,194,48,0.16)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 4, rad(0), rad(90 * ke)); ctx.closePath(); ctx.fill(); }
  // linha do Norte (referência)
  const kn = eo3(prog(t, a.norte, a.norte + 0.4));
  if (kn > 0) { ctx.strokeStyle = PAL.branco; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - R * kn); ctx.stroke(); }
  // varredura horária: 0 -> 90 -> 180 -> 270 (cada uma quando é falada); depois o exemplo 0 -> 60
  const segs = [[a.l90, 0, 90], [a.s180, 90, 180], [a.o270, 180, 270]];
  let ang = null;
  if (t >= a.n0 && t < a.az60 - 0.2) { ang = 0; for (const [t0, g0, g1] of segs) if (t >= t0) ang = lerp(g0, g1, eio(prog(t, t0, t0 + 0.55))); }
  if (ang !== null && ang > 0) { ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 16; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.72, rad(0), rad(ang)); ctx.stroke(); const [x, y] = azPt(cx, cy, R * 0.98, ang); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); }
  // exemplo: azimute de 60°
  const k60 = eio(prog(t, a.az60, a.v60 + 0.3));
  if (t >= a.az60 - 0.2) {
    const g = 60 * k60;
    if (g > 0.5) { ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, rad(0), rad(g)); ctx.stroke(); }
    const [x, y] = azPt(cx, cy, R + 40, g); seta(ctx, cx, cy, x, y, { cor: PAL.amarelo, larg: 10, ponta: 40 });
    if (k60 >= 1) { const [lx, ly] = azPt(cx, cy, R * 0.5 + 66, 30); txt(ctx, '60°', lx, ly, 64, { fam: FONT_T, peso: 800, cor: PAL.amarelo, align: 'center', base: 'middle', contorno: PAL.mata }); }
  }
  // seta do sentido horário, por fora do mostrador
  const kh = eo3(prog(t, a.horario - 0.2, a.horario + 0.9)), kho = ei3(prog(t, a.n0 - 0.3, a.n0));
  if (kh > 0 && kho < 1) {
    const g1 = lerp(-30, 120, kh); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 9 * (1 - kho); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R + 70, rad(-30), rad(g1)); ctx.stroke();
    const [x1, y1] = azPt(cx, cy, R + 70, g1), [x0, y0] = azPt(cx, cy, R + 70, g1 - 6); seta(ctx, x0, y0, x1, y1, { cor: PAL.amarelo, larg: 9 * (1 - kho), ponta: 34 });
    sobe(ctx, t, a.horario, '↻ SENTIDO HORÁRIO', cx, cy + R + 150, 56, { fam: FONT_T, peso: 800, cor: PAL.amarelo, align: 'center', out: a.n0 - 0.3 });
  }
  // rótulos dos cardeais com o valor em graus
  const card = [['N', 0, a.norte, a.n0, '0° = 360°'], ['L', 90, a.l90, a.l90, '90°'], ['S', 180, a.s180, a.s180, '180°'], ['O', 270, a.o270, a.o270, '270°']];
  for (const [sg, g, tl, tv, val] of card) {
    const k = pop(t, tl); if (k <= 0) continue;
    const [x, y] = azPt(cx, cy, R + 64, g), on = t >= tv && t < tv + 1.2 || (t > a.entre && (sg === 'N' || sg === 'L'));
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = on ? PAL.amarelo : PAL.branco; ctx.fill();
    txt(ctx, sg, 0, 3, 58, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center', base: 'middle' }); ctx.restore();
    if (t >= tv) { const [vx, vy] = azPt(cx, cy, R + (g === 0 ? 132 : g === 180 ? 128 : 92), g); sobe(ctx, t, tv, val, vx + (g === 90 ? -10 : g === 270 ? 10 : 0), vy + (g === 90 || g === 270 ? 84 : 16), g === 0 ? 46 : 42, { fam: FONT_T, peso: 800, cor: on ? PAL.amarelo : PAL.branco, align: 'center' }); }
  }
  marca(ctx, t, 'AZIMUTE', 64, 250, 96, a.titulo, { out: a.v60 - 0.4 });
  marca(ctx, t, 'AZIMUTE 60°', 64, 250, 96, a.v60);
  if (t > a.entre) sobe(ctx, t, a.entre + 0.2, 'entre Norte e Leste', 70, 320, 40, { peso: 800, cor: PAL.branco });
}
RENDER.s06 = renderS06;
