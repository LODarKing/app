// Bússola de placa base (transparente), desenhada em vetor.
// Partes distintas: placa com régua, seta de direção de marcha (impressa na placa), limbo giratório (graus + N L S O),
// seta de orientação e linhas meridianas (giram com o limbo) e agulha magnética (ponta Norte amarela, ponta Sul branca).
'use strict';
// o = { x, y, s, rot (placa, rad), limbo (rad, quanto o limbo foi girado), agulha (rad, direção absoluta da ponta Norte; 0 = para cima) }
function drawBussola(ctx, o) {
  const { x, y, s = 1, rot = 0, limbo = 0, agulha = 0, sombra = 1 } = o;
  const PW = 300, PH = 520, HX = 0, HY = 70, RB = 132, RI = 106;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // sombra projetada (2,5D: a bússola está acima do mapa)
  if (sombra > 0) {
    ctx.save(); ctx.translate(18, 26); ctx.rotate(rot); rrect(ctx, -PW / 2, -PH / 2, PW, PH, 26); ctx.fillStyle = `rgba(20,30,20,${0.22 * sombra})`; ctx.fill(); ctx.restore();
  }
  ctx.rotate(rot);
  // placa transparente
  rrect(ctx, -PW / 2, -PH / 2, PW, PH, 26);
  ctx.fillStyle = 'rgba(245,250,246,0.30)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(17,19,18,0.55)'; ctx.stroke();
  rrect(ctx, -PW / 2 + 7, -PH / 2 + 7, PW - 14, PH - 14, 20); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
  // régua (mm) na borda esquerda
  ctx.strokeStyle = 'rgba(17,19,18,0.8)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const yy = -PH / 2 + 40 + i * 11; const L = i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9; ctx.moveTo(-PW / 2 + 12, yy); ctx.lineTo(-PW / 2 + 12 + L, yy); }
  ctx.stroke();
  // seta de direção de marcha (impressa na placa) + linha central
  ctx.fillStyle = PAL.preto;
  ctx.beginPath(); ctx.moveTo(0, -PH / 2 + 22); ctx.lineTo(26, -PH / 2 + 78); ctx.lineTo(9, -PH / 2 + 72); ctx.lineTo(9, -PH / 2 + 120); ctx.lineTo(-9, -PH / 2 + 120); ctx.lineTo(-9, -PH / 2 + 72); ctx.lineTo(-26, -PH / 2 + 78); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(17,19,18,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.moveTo(0, -PH / 2 + 126); ctx.lineTo(0, HY - RB - 4); ctx.moveTo(0, HY + RB + 4); ctx.lineTo(0, PH / 2 - 16); ctx.stroke(); ctx.setLineDash([]);

  // limbo (anel graduado), gira com `limbo`
  ctx.save(); ctx.translate(HX, HY); ctx.rotate(limbo);
  ctx.beginPath(); ctx.arc(0, 0, RB, 0, 7); ctx.arc(0, 0, RI, 0, 7, true); ctx.fillStyle = PAL.preto; ctx.fill('evenodd');
  ctx.strokeStyle = PAL.branco;
  for (let g = 0; g < 360; g += 2) {
    const a = (g * Math.PI) / 180, L = g % 10 === 0 ? 11 : 6; ctx.lineWidth = g % 10 === 0 ? 2.2 : 1.2;
    ctx.beginPath(); ctx.moveTo(Math.sin(a) * RB * 0.985, -Math.cos(a) * RB * 0.985); ctx.lineTo(Math.sin(a) * (RB - L), -Math.cos(a) * (RB - L)); ctx.stroke();
  }
  font(ctx, 800, 19); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [g, lab] of [[0, 'N'], [90, 'L'], [180, 'S'], [270, 'O']]) {
    const a = (g * Math.PI) / 180; ctx.save(); ctx.translate(Math.sin(a) * (RB - 21), -Math.cos(a) * (RB - 21)); ctx.rotate(a);
    ctx.fillStyle = g === 0 ? PAL.amarelo : PAL.branco; ctx.fillText(lab, 0, 1); ctx.restore();
  }
  font(ctx, 700, 11);
  for (let g = 30; g < 360; g += 30) { if (g % 90 === 0) continue; const a = (g * Math.PI) / 180; ctx.save(); ctx.translate(Math.sin(a) * (RB - 22), -Math.cos(a) * (RB - 22)); ctx.rotate(a); ctx.fillStyle = PAL.branco; ctx.fillText(String(g), 0, 1); ctx.restore(); }
  // cápsula (líquido) com linhas meridianas e seta de orientação
  ctx.beginPath(); ctx.arc(0, 0, RI, 0, 7); ctx.fillStyle = 'rgba(250,252,248,0.42)'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, RI - 2, 0, 7); ctx.clip();
  ctx.strokeStyle = 'rgba(17,19,18,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); for (const xx of [-66, -33, 33, 66]) { ctx.moveTo(xx, -RI); ctx.lineTo(xx, RI); } ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = PAL.preto; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, -RI + 8); ctx.lineTo(20, -RI + 44); ctx.lineTo(9, -RI + 44); ctx.lineTo(9, 52); ctx.lineTo(-9, 52); ctx.lineTo(-9, -RI + 44); ctx.lineTo(-20, -RI + 44); ctx.closePath(); ctx.stroke();
  ctx.restore();

  // agulha magnética: direção absoluta (desfaz a rotação da placa)
  ctx.save(); ctx.translate(HX, HY); ctx.rotate(agulha - rot);
  ctx.lineJoin = 'round'; ctx.lineWidth = 2.5; ctx.strokeStyle = PAL.preto;
  ctx.beginPath(); ctx.moveTo(0, -92); ctx.lineTo(11, 0); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(11, 0); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill();
  ctx.restore();
  ctx.restore();
}
