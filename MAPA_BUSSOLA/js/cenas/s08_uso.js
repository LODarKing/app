// Cena 8 — USO DA BÚSSOLA, vista de cima no referencial de quem segura: a bússola fica parada na tela e o terreno gira quando o corpo gira.
// Física: a agulha aponta sempre para o Norte do terreno (ângulo de tela = −H, H = para onde a pessoa está virada).
// O limbo ajustado no rumo B deixa a seta de orientação em −B; orientar = girar o corpo até a agulha entrar na seta (H = B).
// A seta de direção de marcha (impressa na placa) aponta para a frente: depois de orientada, aponta o rumo B no terreno.
'use strict';
const A8 = (() => {
  const id = 's08', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    entra: h(0.05, 'deslize'), horiz: h(F(id, 'horizontal'), 'confirma'), metais: h(F(id, 'longe') - 0.2, 'deslize'), metais2: h(F(id, 'metais') + 0.3, 'erro'),
    gire: h(F(id, 'Gire'), 'giro'), agulha: h(F(id, 'agulha'), 'pop'), marca: h(F(id, 'marca'), 'pop'), ok: h(F(id, 'Norte') + 0.05, 'confirma'),
    orient: h(F(id, 'orientada'), 'pop'), N: h(F(id, 'Norte', 1), 'pop'), S: h(F(id, 'Sul'), 'pop'), L: h(F(id, 'Leste'), 'pop'), O: h(F(id, 'Oeste'), 'pop'),
    siga: h(F(id, 'siga') - 0.35, 'giro'), rumo: h(F(id, 'rumo'), 'giro'), passos: h(F(id, 'planejado'), 'passo'), fim: CENAS[id].dur,
  };
})();
function renderS08(ctx, t) {
  const a = A8, CXc = 540, CYc = 730, S = 1.5, HX = CXc, HY = CYc + 70 * S;
  // rumo ajustado no limbo (B) e direção do corpo (H), em graus
  const B = 60 * eio(prog(t, a.siga, a.siga + 0.5));
  let H = lerp(75, 0, eio(prog(t, a.gire, a.ok)));
  H = lerp(H, 60, eio(prog(t, a.rumo - 0.1, a.passos + 0.1)));
  // caminhar: o terreno corre para trás na direção da marcha
  const anda = 180 * ei3(prog(t, a.passos, a.fim));
  const hr = (H * Math.PI) / 180;
  const cam = { cx: -60 + Math.sin(hr) * anda, cy: -300 - Math.cos(hr) * anda, z: 0.95, r: -hr };
  MUNDO.drawMapa(ctx, cam, { cotas: false });
  ctx.fillStyle = 'rgba(233,223,198,0.35)'; ctx.fillRect(0, 0, W, H === H ? 1920 : 0);
  // objeto de metal (canivete) se aproxima e desvia a agulha
  const km = eo5(prog(t, a.metais, a.metais + 0.45)) * (1 - ei3(prog(t, a.metais2 + 0.5, a.metais2 + 0.9)));
  const mx = lerp(1250, 800, km), my = HY + 60;
  const desvio = km * 0.75 * Math.exp(-Math.max(0, mx - 760) / 300);
  // tremor quando inclinada (agulha presa) e oscilação ao parar
  const kt = eo3(prog(t, a.horiz - 0.9, a.horiz));
  const osc = 0.25 * Math.exp(-4 * Math.max(0, t - a.ok)) * Math.sin(10 * Math.max(0, t - a.ok)) * (t > a.ok ? 1 : 0);
  const agulha = -hr + desvio + osc + (1 - kt) * 0.4;
  // entrada e inclinação (perspectiva): fora do nível a bússola aparece achatada
  const kin = eo5(prog(t, 0, 0.6));
  ctx.save(); ctx.translate(HX, HY + (1 - kin) * 1200); ctx.scale(1, lerp(0.55, 1, kt)); ctx.translate(-HX, -HY);
  drawBussola(ctx, { x: CXc, y: CYc, s: S, rot: 0, limbo: (-B * Math.PI) / 180, agulha, sombra: 1 });
  ctx.restore();
  if (km > 0.01) {
    ctx.save(); ctx.translate(mx, my); ctx.rotate(-0.5);
    ctx.scale(1.5, 1.5); rrect(ctx, -90, -18, 180, 36, 16); ctx.fillStyle = '#9AA0A6'; ctx.fill(); ctx.strokeStyle = PAL.preto; ctx.lineWidth = 4; ctx.stroke();
    rrect(ctx, -90, -18, 70, 36, 14); ctx.fillStyle = '#3B3F44'; ctx.fill(); ctx.restore();
    if (t > a.metais2) { const k = pop(t, a.metais2); ctx.save(); ctx.translate(mx, my - 80); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(13, 13); ctx.moveTo(13, -13); ctx.lineTo(-13, 13); ctx.stroke(); ctx.restore(); }
  }
  // rótulos
  marca(ctx, t, 'NA HORIZONTAL', 64, 250, 86, a.horiz - 0.3, { out: a.metais - 0.1 });
  marca(ctx, t, 'LONGE DE METAIS', 64, 250, 86, a.metais, { out: a.gire - 0.2 });
  marca(ctx, t, 'GIRE O CORPO', 64, 250, 86, a.gire, { out: a.ok - 0.1 });
  marca(ctx, t, 'ORIENTADA ✓', 64, 250, 86, a.ok, { out: a.N - 0.3 });
  marca(ctx, t, `RUMO ${Math.round(B)}°`, 64, 250, 86, a.siga + 0.1);
  // setas curvas de giro em volta do limbo enquanto gira
  if (t > a.gire && t < a.ok) {
    const k = eo3(prog(t, a.gire, a.gire + 0.4)), r = 132 * S + 46;
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (const g0 of [200, 20]) { ctx.beginPath(); ctx.arc(HX, HY, r, ((g0 - 90) * Math.PI) / 180, ((g0 - 90 - 50 * k) * Math.PI) / 180, true); ctx.stroke(); const [x1, y1] = azPt(HX, HY, r, g0 - 50 * k), [x0, y0] = azPt(HX, HY, r, g0 - 50 * k + 8); seta(ctx, x0, y0, x1, y1, { cor: PAL.preto, larg: 8, ponta: 30 }); }
  }
  // chamadas das partes (agulha x seta de orientação x seta de direção de marcha)
  const [ax, ay] = azPt(HX, HY, 70 * S, (agulha * 180) / Math.PI);
  chamada(ctx, t, a.agulha, ax, ay, 70, 1240, 'AGULHA (ponta Norte)', { px: 40, out: a.orient - 0.2, contorno: PAL.areia });
  const [ox, oy] = azPt(HX, HY, 96 * S, -B);
  chamada(ctx, t, a.marca, ox + 8, oy + 6, 1010, 1240, 'MARCA DO NORTE', { px: 40, align: 'right', out: a.orient - 0.2, contorno: PAL.areia });
  chamada(ctx, t, a.orient, CXc + 30, CYc - 205 * S, 1010, 380, 'DIREÇÃO DE MARCHA', { px: 40, align: 'right', out: a.N - 0.2, contorno: PAL.areia });
  // pontos cardeais no terreno (com a bússola orientada, N fica para cima)
  for (const [sg, az, tt] of [['N', 0, a.N], ['S', 180, a.S], ['L', 90, a.L], ['O', 270, a.O]]) {
    const k = pop(t, tt) * (1 - ei3(prog(t, a.siga - 0.1, a.siga + 0.2))); if (k <= 0) continue;
    const rr = sg === 'N' ? 560 : sg === 'S' ? 470 : 380, [x, y] = azPt(HX, HY, rr, az - H);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 56, 0, 7); ctx.fillStyle = t < tt + 0.8 ? PAL.amarelo : PAL.preto; ctx.fill();
    txt(ctx, sg, 0, 4, 76, { fam: FONT_T, peso: 800, cor: t < tt + 0.8 ? PAL.preto : PAL.branco, align: 'center', base: 'middle' }); ctx.restore();
  }
  // pegadas à frente quando segue o rumo
  if (t > a.passos) for (let i = 0; i < 4; i++) {
    const k = pop(t, a.passos + i * 0.12, 0.25); if (k <= 0) continue;
    const y = CYc - 330 * S + 20 - i * 0 - 0, x = CXc + (i % 2 ? 26 : -26), yy = CYc - 270 * S - i * 70;
    ctx.save(); ctx.translate(x, yy); ctx.scale(k, k); ctx.fillStyle = PAL.preto; ctx.beginPath(); ctx.ellipse(0, 0, 14, 24, 0, 0, 7); ctx.fill(); ctx.restore();
  }
}
RENDER.s08 = renderS08;
