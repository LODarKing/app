// Cena 9 — SIMULAÇÃO PRÁTICA: percurso fictício com partida e 10 pontos de controle ligados em ordem, no mesmo mapa.
// Primeira etapa ampliada: ler o mapa, rumo (azimute medido no mapa a partir do Norte da quadrícula) e distância (1 unidade = 1 m).
// Os pontos recebem ✓ de SIMULAÇÃO; no fim tudo volta a ficar em aberto: a prática de verdade é com o clube.
'use strict';
const A9 = (() => {
  const id = 's09', h = (t, tipo, g) => hit(id, t, tipo, g);
  const a = {
    desafio: h(F(id, 'desafio'), 'marca'), instrutor: h(F(id, 'instrutor'), 'pop'), pista: h(F(id, 'pista'), 'traco'), dez: h(F(id, '10'), null),
    etapa: h(F(id, 'etapa') - 0.3, 'mergulho'), leia: h(F(id, 'leia'), 'pop'), rumo: h(F(id, 'rumo'), 'pop'), dist: h(F(id, 'distância'), 'pop'),
    encontre: h(F(id, 'encontre'), 'passo'), simples: h(F(id, 'animação'), null), vez: h(F(id, 'vez') - 0.3, 'marca'), fim: CENAS[id].dur,
  };
  for (let i = 0; i < 10; i++) hit(id, a.dez + i * COLCHEIA * 0.5, i % 2 ? 'tiquinho' : 'tique', 0.7);
  a.chegada1 = h(a.encontre + 0.9, 'confirma');
  a.corre = h(a.encontre + 1.4, null);
  for (let i = 1; i < 10; i++) hit(id, a.corre + i * COLCHEIA, 'tiquinho', 0.8);
  return a;
})();
const PISTA = (() => {
  const P = [[60, 760], [380, 520], [640, 150], [420, -190], [720, -540], [380, -840], [-60, -1080], [-480, -1180], [-820, -840], [-640, -400], [-260, 30]].map(([x, y]) => [-50 + (x + 50) * 0.8, -210 + (y + 210) * 0.8]);
  const legs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const dx = P[i + 1][0] - P[i][0], dy = P[i + 1][1] - P[i][1];
    legs.push({ az: (Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360, d: Math.round(Math.hypot(dx, dy) / 10) * 10 });
  }
  return { P, legs };
})();
function renderS09(ctx, t) {
  const a = A9, { P, legs } = PISTA;
  // câmera: visão geral -> etapa 1 ampliada -> visão geral
  const kz = eio(prog(t, a.etapa, a.etapa + 0.8)) * (1 - eio(prog(t, a.encontre + 1.0, a.encontre + 1.5)));
  const m1 = [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2];
  const cam = { cx: lerp(-50, m1[0] - 40, kz), cy: lerp(-114, m1[1] + 180, kz), z: lerp(0.55, 1.25, kz), r: 0 };
  MUNDO.drawMapa(ctx, cam, { cotas: false });
  const pr = (p) => MUNDO.proj(cam, p[0], p[1]);
  // linhas do percurso (desenhadas na ordem)
  const kp = prog(t, a.pista - 0.2, a.dez + 0.4) * legs.length;
  ctx.lineCap = 'round';
  for (let i = 0; i < legs.length; i++) {
    const k = clamp(kp - i); if (k <= 0) break;
    const [x0, y0] = pr(P[i]), [x1, y1] = pr(P[i + 1]), d = Math.hypot(x1 - x0, y1 - y0), g = 40 * cam.z / 0.6;
    const ux = (x1 - x0) / d, uy = (y1 - y0) / d, sx = x0 + ux * g, sy = y0 + uy * g, ex = x1 - ux * g, ey = y1 - uy * g;
    const lido = t > a.leia && i === 0;
    ctx.strokeStyle = lido ? PAL.preto : PAL.preto; ctx.lineWidth = lido ? 14 : 5; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, ex, k), lerp(sy, ey, k)); ctx.stroke();
    if (lido) { ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 7; ctx.stroke(); }
  }
  // partida (triângulo) e controles (círculos numerados)
  const vez = t > a.vez;
  for (let i = 0; i < P.length; i++) {
    const tp = i === 0 ? a.pista - 0.2 : a.dez + (i - 1) * COLCHEIA * 0.5, k = pop(t, tp); if (k <= 0) continue;
    const [x, y] = pr(P[i]), r = 34;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    if (i === 0) { ctx.strokeStyle = PAL.preto; ctx.lineWidth = 6; ctx.beginPath(); for (let j = 0; j < 3; j++) { const an = -Math.PI / 2 + (j * 2 * Math.PI) / 3; ctx.lineTo(Math.cos(an) * r * 1.2, Math.sin(an) * r * 1.2); } ctx.closePath(); ctx.stroke(); }
    else {
      // ✓ de simulação quando o marcador passa (some em "sua vez")
      const tc = i === 1 ? a.chegada1 : a.corre + (i - 1) * COLCHEIA, feito = t >= tc && !vez;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = feito ? PAL.amarelo : vez ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke();
      if (feito) { const kc = pop(t, tc); ctx.save(); ctx.scale(kc, kc); ctx.strokeStyle = PAL.preto; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.32); ctx.lineTo(r * 0.45, -r * 0.35); ctx.stroke(); ctx.restore(); }
    }
    ctx.restore();
    if (i > 0) { const [lx, ly] = [x + 40, y - 30]; sobe(ctx, t, tp, String(i), lx, ly, 44, { fam: FONT_T, peso: 800, cor: PAL.preto, contorno: PAL.areia }); }
  }
  // marcador do caminhante (simulação)
  let pos = null;
  if (t > a.encontre && !vez) {
    const k1 = eio(prog(t, a.encontre, a.encontre + 0.9));
    if (t < a.corre) pos = [lerp(P[0][0], P[1][0], k1), lerp(P[0][1], P[1][1], k1)];
    else { const f = clamp((t - a.corre) / COLCHEIA, 0, 9), i = Math.min(8, Math.floor(f)) + 1, kk = eio(f - (i - 1)); pos = [lerp(P[i][0], P[i + 1][0], clamp(kk)), lerp(P[i][1], P[i + 1][1], clamp(kk))]; }
    const [x, y] = pr(pos); ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke();
  }
  // etapa 1 ampliada: rumo (arco a partir do Norte) e distância (cota ao lado da perna)
  const L1 = legs[0], [x0, y0] = pr(P[0]), [x1, y1] = pr(P[1]);
  if (kz > 0.5 && t > a.rumo - 0.1 && t < a.encontre + 1.0) {
    const k = eo3(prog(t, a.rumo, a.rumo + 0.6));
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 - 230); ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, 'N', x0, y0 - 250, 46, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center' });
    ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(x0, y0, 190, -Math.PI / 2, -Math.PI / 2 + (L1.az * Math.PI / 180) * k); ctx.stroke();
  }
  if (kz > 0.5 && t > a.dist - 0.1 && t < a.encontre + 1.0) {
    const k = eo3(prog(t, a.dist, a.dist + 0.5)), ang = Math.atan2(y1 - y0, x1 - x0), nx = Math.sin(ang) * 60, ny = -Math.cos(ang) * 60;
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0 + nx, y0 + ny); ctx.lineTo(lerp(x0, x1, k) + nx, lerp(y0, y1, k) + ny); ctx.stroke();
    for (const [xx, yy] of [[x0, y0], [lerp(x0, x1, k), lerp(y0, y1, k)]]) { ctx.beginPath(); ctx.moveTo(xx + nx * 0.6, yy + ny * 0.6); ctx.lineTo(xx + nx * 1.4, yy + ny * 1.4); ctx.stroke(); }
  }
  // cartões de etapa
  const cartao = (i, t0, titulo, valor) => {
    const k = eo5(prog(t, t0, t0 + 0.4)), ko = ei3(prog(t, a.encontre + 1.0, a.encontre + 1.3)); if (k <= 0 || ko >= 1) return;
    const x = 40 + i * 305, y = 1090 + (1 - k) * 400 + ko * 400;
    rrect(ctx, x, y, 290, 230, 20); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.preto; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 44, y + 46, 26, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); txt(ctx, String(i + 1), x + 44, y + 48, 32, { fam: FONT_T, peso: 800, cor: PAL.amarelo, align: 'center', base: 'middle' });
    txt(ctx, titulo, x + 82, y + 58, 30, { peso: 800, cor: PAL.preto });
    txt(ctx, valor, x + 24, y + 170, 76, { fam: FONT_T, peso: 800, cor: PAL.preto });
  };
  cartao(0, a.leia, 'LEIA O MAPA', 'P → 1');
  cartao(1, a.rumo, 'RUMO', String(L1.az).padStart(3, '0') + '°');
  cartao(2, a.dist, 'DISTÂNCIA', L1.d + ' m');
  // títulos
  marca(ctx, t, 'DESAFIO', 64, 250, 96, a.desafio, { out: a.etapa - 0.2 });
  if (t > a.instrutor && t < a.etapa - 0.2) sobe(ctx, t, a.instrutor, 'com seu instrutor', 70, 420, 44, { peso: 800, cor: PAL.preto, contorno: PAL.areia, out: a.etapa - 0.4 });
  if (t > a.dez) sobe(ctx, t, a.dez, '10 PONTOS DE CONTROLE', 70, 1250, 52, { fam: FONT_T, peso: 800, cor: PAL.preto, contorno: PAL.areia, out: a.etapa - 0.2 });
  marca(ctx, t, 'EM CADA ETAPA', 64, 250, 96, a.etapa, { out: a.encontre + 1.0 });
  // contagem da simulação
  if (t > a.corre && !vez) { const n = Math.min(10, 1 + Math.floor((t - a.corre) / COLCHEIA)); txt(ctx, `SIMULAÇÃO ✓ ${n}/10`, 70, 1250, 52, { fam: FONT_T, peso: 800, cor: PAL.preto, contorno: PAL.areia }); }
  // selo fixo de simulação (centralizado no alto, fora dos cantos)
  if (t > 0.3) { const k = eo5(prog(t, 0.3, 0.7)); ctx.save(); ctx.translate(240 - (1 - k) * 600, 330); rrect(ctx, -170, -30, 340, 60, 30); ctx.fillStyle = PAL.preto; ctx.fill(); txt(ctx, 'SIMULAÇÃO', 0, 2, 34, { peso: 800, cor: PAL.amarelo, align: 'center', base: 'middle' }); ctx.restore(); }
  if (vez) {
    marca(ctx, t, 'AGORA É SUA VEZ', 64, 250, 96, a.vez);
    sobe(ctx, t, a.vez + 0.3, 'pratique em campo com seu clube', 70, 1250, 44, { peso: 800, cor: PAL.preto, contorno: PAL.areia });
  }
}
RENDER.s09 = renderS09;
