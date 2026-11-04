// Cena 7 — DESVIO (DECLINAÇÃO MAGNÉTICA) E CORREÇÃO. Conceito, sem valor local inventado.
// Convenção: δ positiva a Leste, negativa a Oeste. Uma mesma direção tem rumo verdadeiro Rv (a partir do NV) e magnético Rm (a partir do NM):
//   Rv = Rm + δ.   No desenho o NM está a Oeste do NV (δ negativa), então Rm > Rv.
'use strict';
const A7 = (() => {
  const id = 's07', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    detalhe: h(F(id, 'detalhe'), 'pop'), mag: h(F(id, 'magnético'), 'traco'), verd: h(F(id, 'verdadeiro'), 'traco'), dif: h(F(id, 'diferença'), 'giro'),
    decl: h(F(id, 'declinação'), 'marca'), corr: h(F(id, 'corrigir'), 'deslize'), consulte: h(F(id, 'consulte'), 'pop'), local: h(F(id, 'local'), 'pop'),
    data: h(F(id, 'data'), 'pop'), aplique: h(F(id, 'aplique'), 'giro'), bussola: h(F(id, 'bússola'), 'tique'), mapa: h(F(id, 'mapa'), 'tique'), fim: CENAS[id].dur,
  };
})();
function renderS07(ctx, t) {
  const a = A7, ox = 560, oy = 880, L = 440, DELTA = -15, DIR = 52; // δ simbólica (a Oeste) só para o desenho; DIR = direção de exemplo
  fundo(ctx, false, { cx: -200, cy: -300, z: 0.7, r: 0 }, t * 5);
  const rad = (g) => ((g - 90) * Math.PI) / 180;
  // a figura sobe um pouco quando entram os cartões de consulta
  // eixo do Norte verdadeiro (geográfico)
  const kv = eo3(prog(t, a.verd - 0.1, a.verd + 0.5));
  if (kv > 0) {
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - L * kv); ctx.stroke();
    if (kv >= 1) { // estrela do polo
      const k = pop(t, a.verd + 0.45); ctx.save(); ctx.translate(ox, oy - L - 40); ctx.scale(k, k); ctx.fillStyle = PAL.preto; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 13 : 32, an = (i * Math.PI) / 5 - Math.PI / 2; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      sobe(ctx, t, a.verd + 0.3, 'NORTE VERDADEIRO', ox + 54, oy - L - 22, 38, { peso: 800, cor: PAL.preto });
      sobe(ctx, t, a.verd + 0.45, '(geográfico) · NV', ox + 54, oy - L + 22, 30, { peso: 700, cor: PAL.preto });
    }
  }
  // eixo do Norte magnético: agulha amarela
  const km = eo3(prog(t, a.mag - 0.1, a.mag + 0.5));
  if (km > 0) {
    const [x, y] = azPt(ox, oy, L * km, DELTA);
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x, y); ctx.stroke();
    ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 8; ctx.stroke();
    if (km >= 1) {
      const [nx, ny] = azPt(ox, oy, L + 30, DELTA); ctx.save(); ctx.translate(nx, ny); ctx.rotate((DELTA * Math.PI) / 180);
      ctx.fillStyle = PAL.amarelo; ctx.strokeStyle = PAL.preto; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(16, 6); ctx.lineTo(-16, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      sobe(ctx, t, a.mag + 0.3, 'NORTE MAGNÉTICO', 60, ny + 70, 38, { peso: 800, cor: PAL.preto });
      sobe(ctx, t, a.mag + 0.45, 'para onde a agulha aponta · NM', 60, ny + 108, 26, { peso: 700, cor: PAL.preto });
    }
  }
  // ângulo δ entre os dois nortes
  const kd = eo3(prog(t, a.dif, a.dif + 0.7));
  if (kd > 0) {
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(ox, oy, 260, rad(0), rad(DELTA * kd), true); ctx.stroke();
    ctx.fillStyle = 'rgba(242,194,48,0.35)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, 260, rad(0), rad(DELTA * kd), true); ctx.closePath(); ctx.fill();
    if (kd >= 1) { const [x, y] = azPt(ox, oy, 305, DELTA / 2); const k = pop(t, a.dif + 0.6); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); txt(ctx, 'δ', 0, 0, 84, { fam: FONT_I, peso: 800, cor: PAL.preto, align: 'center', base: 'middle', contorno: PAL.areia }); ctx.restore(); }
  }
  // exemplo de direção: o mesmo rumo medido a partir de cada norte
  const ka = eo3(prog(t, a.aplique - 0.1, a.aplique + 0.6));
  if (ka > 0) {
    const [x, y] = azPt(ox, oy, 400, DIR); seta(ctx, ox, oy, lerp(ox, x, ka), lerp(oy, y, ka), { cor: PAL.preto, larg: 7, ponta: 30 });
    const kr = eio(prog(t, a.aplique + 0.3, a.bussola));
    ctx.lineWidth = 8; ctx.strokeStyle = PAL.amarelo; ctx.beginPath(); ctx.arc(ox, oy, 180, rad(DELTA), rad(lerp(DELTA, DIR, kr))); ctx.stroke();
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(ox, oy, 120, rad(0), rad(DIR * eio(prog(t, a.bussola - 0.2, a.mapa)))); ctx.stroke();
    if (kr > 0.9) { const [lx, ly] = azPt(ox, oy, 230, (DELTA + DIR) / 2 + 6); txt(ctx, 'Rm', lx, ly, 40, { peso: 800, cor: PAL.preto, align: 'center', base: 'middle', contorno: PAL.amarelo }); }
    if (t > a.mapa - 0.1) { const [lx, ly] = azPt(ox, oy, 80, DIR / 2); txt(ctx, 'Rv', lx, ly, 34, { peso: 800, cor: PAL.preto, align: 'center', base: 'middle', contorno: PAL.areia }); }
  }
  ctx.beginPath(); ctx.arc(ox, oy, 14, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill();
  // títulos
  marca(ctx, t, 'UM DETALHE', 64, 250, 96, a.detalhe, { out: a.decl - 0.4 });
  marca(ctx, t, 'DECLINAÇÃO MAGNÉTICA', 64, 250, 86, a.decl);
  // cartões: regra de correção e onde consultar
  const card = (y0, hh, t0, desenha) => { const k = eo5(prog(t, t0, t0 + 0.45)); if (k <= 0) return; ctx.save(); ctx.translate((1 - k) * -1100, 0); rrect(ctx, 50, y0, 980, hh, 22); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.preto; ctx.stroke(); desenha(y0); ctx.restore(); };
  card(950, 180, a.corr, (y0) => {
    txt(ctx, 'PARA CORRIGIR', 84, y0 + 44, 30, { peso: 800, cor: PAL.preto });
    txt(ctx, 'Rv = Rm + δ', 84, y0 + 118, 72, { fam: FONT_T, peso: 800, cor: PAL.preto });
    txt(ctx, 'Rv: rumo verdadeiro', 520, y0 + 86, 26, { peso: 700, cor: PAL.preto }); txt(ctx, 'Rm: rumo magnético', 520, y0 + 118, 26, { peso: 700, cor: PAL.preto });
    txt(ctx, 'δ a Leste: soma (+)  ·  δ a Oeste: subtrai (−)', 84, y0 + 160, 28, { peso: 800, cor: PAL.preto });
  });
  card(1150, 185, a.consulte, (y0) => {
    txt(ctx, 'CONSULTE O VALOR DE δ PARA O', 84, y0 + 44, 30, { peso: 800, cor: PAL.preto });
    const kl = pop(t, a.local), kdt = pop(t, a.data);
    if (kl > 0) { ctx.save(); ctx.translate(120, y0 + 104); ctx.scale(kl, kl); ctx.fillStyle = PAL.amarelo; ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 24, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(0, 32); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -8, 8, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.restore(); txt(ctx, 'LOCAL', 162, y0 + 122, 50, { fam: FONT_T, peso: 800, cor: PAL.preto }); }
    if (kdt > 0) { ctx.save(); ctx.translate(470, y0 + 104); ctx.scale(kdt, kdt); rrect(ctx, -28, -26, 56, 54, 7); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = PAL.amarelo; ctx.fillRect(-26, -24, 52, 15); ctx.fillStyle = PAL.preto; for (let i = 0; i < 6; i++) ctx.fillRect(-18 + (i % 3) * 14, 0 + Math.floor(i / 3) * 13, 8, 8); ctx.restore(); txt(ctx, 'DATA', 516, y0 + 122, 50, { fam: FONT_T, peso: 800, cor: PAL.preto }); }
    sobe(ctx, t, a.data + 0.3, 'margem da carta ou modelo geomagnético · muda com o tempo', 84, y0 + 166, 25, { peso: 700, cor: PAL.preto });
  });
}
RENDER.s07 = renderS07;
