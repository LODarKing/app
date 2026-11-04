// Cena 2 — ROSA DOS VENTOS. A câmera entra no limbo da bússola da cena 1 e a rosa ocupa a tela.
// Posições geográficas: N em cima, S embaixo, L à direita, O à esquerda; colaterais a 45° (NE, SE, SO, NO).
'use strict';
const A2 = (() => {
  const id = 's02', h = (t, tipo, g) => hit(id, t, tipo, g);
  const a = { zoom: h(0, 'mergulho', 0.7), rosa: h(F(id, 'rosa'), 'risco'), card: h(F(id, 'cardeais'), 'marca'), col: h(F(id, 'colaterais'), 'marca'), oito: h(F(id, 'oito'), 'marca'), fim: CENAS[id].dur };
  a.N = h(F(id, 'Norte'), 'pop'); a.S = h(F(id, 'Sul'), 'pop'); a.L = h(F(id, 'Leste'), 'pop'); a.O = h(F(id, 'Oeste'), 'pop');
  a.NE = h(F(id, 'Nordeste'), 'pop'); a.SE = h(F(id, 'Sudeste'), 'pop'); a.SO = h(F(id, 'Sudoeste'), 'pop'); a.NO = h(F(id, 'Noroeste'), 'pop');
  a.volta = h(F(id, 'direções') - 0.1, null);
  for (let i = 0; i < 8; i++) hit(id, a.volta + i * COLCHEIA * 0.5 + 0.0001, i % 2 ? 'tiquinho' : 'tique', 0.6);
  a.sai = h(F(id, 'orientação') + 0.15, 'deslize');
  return a;
})();
const ROSA = { cx: 540, cy: 830, R: 330 };
const DIRS = [ // [sigla, nome, azimute, cardeal?, âncora]
  ['N', 'NORTE', 0, true, 'N'], ['NE', 'NORDESTE', 45, false, 'NE'], ['L', 'LESTE', 90, true, 'L'], ['SE', 'SUDESTE', 135, false, 'SE'],
  ['S', 'SUL', 180, true, 'S'], ['SO', 'SUDOESTE', 225, false, 'SO'], ['O', 'OESTE', 270, true, 'O'], ['NO', 'NOROESTE', 315, false, 'NO'],
];

function drawRosa(ctx, t, cx, cy, R, k, destaque) {
  // anéis graduados
  const kr = eo3(clamp(k * 1.3));
  ctx.strokeStyle = PAL.preto; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kr); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * kr); ctx.stroke();
  for (let g = 0; g < 360 * kr; g += 5) { const [x0, y0] = azPt(cx, cy, R * 0.93, g), [x1, y1] = azPt(cx, cy, R * (g % 45 === 0 ? 1.02 : g % 15 === 0 ? 0.985 : 0.96), g); ctx.lineWidth = g % 45 === 0 ? 3 : 1.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  // pontas: colaterais (mais curtas) por baixo, cardeais por cima; cada ponta em duas metades (luz e sombra)
  const ponta = (az, L, larg, c1, c2, kk) => {
    if (kk <= 0) return;
    const [tx, ty] = azPt(cx, cy, L * kk, az), [ax, ay] = azPt(cx, cy, larg, az - 45), [bx, by] = azPt(cx, cy, larg, az + 45);
    ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.lineTo(bx, by); ctx.stroke();
  };
  for (const [sg, , az, card] of DIRS) if (!card) { const kk = eo3(prog(k, 0.25, 0.9)); const on = destaque(sg); ponta(az, R * 0.66, R * 0.13, on ? PAL.amarelo : '#7FA36F', on ? '#C99A12' : PAL.curva, kk); }
  for (const [sg, , az, card] of DIRS) if (card) { const kk = eo3(prog(k, 0.1, 0.75)); const on = destaque(sg); ponta(az, R * 0.9, R * 0.17, on ? PAL.amarelo : PAL.areia, on ? '#C99A12' : PAL.preto, kk); }
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill();
}

function renderS02(ctx, t) {
  const a = A2;
  // 0–0,75 s: mergulho no limbo da bússola (continua o último quadro da cena 1)
  const kz = eio(prog(t, 0, 0.75));
  if (kz < 1) { MUNDO.drawMapa(ctx, { cx: 10, cy: -430, z: lerp(0.8, 2.4, ei3(kz)), r: 0 }, { cotas: false }); ctx.fillStyle = hexA(PAL.areia, eo3(kz) * 0.85); ctx.fillRect(0, 0, W, H); }
  else fundo(ctx, false, { cx: 0, cy: -430, z: 2.4, r: 0 });
  if (kz < 1) {
    const s = lerp(1.22, 7.5, ei3(kz)), hx = lerp(720 + 70 * 1.22 * Math.sin(0.16), ROSA.cx, eo3(kz)), hy = lerp(850 + 70 * 1.22 * Math.cos(0.16), ROSA.cy, eo3(kz));
    const rot = lerp(-0.16, 0, kz);
    drawBussola(ctx, { x: hx - 70 * s * Math.sin(-rot), y: hy - 70 * s * Math.cos(rot), rot, limbo: lerp(0.35, 0, kz), agulha: 0, s, sombra: 1 - kz });
  }
  // a rosa nasce no centro do limbo
  const kRosa = prog(t, 0.6, a.rosa + 0.9);
  // saída: a rosa encolhe e sobe (a cena 3 continua no mesmo papel)
  const ks = eio(prog(t, a.sai, a.fim));
  const cx = ROSA.cx, cy = lerp(ROSA.cy, 300, ks), R = ROSA.R * lerp(1, 0.18, ks);
  // giro de destaque nas 8 direções (horário a partir do N) em "oito direções"
  const iv = Math.floor((t - a.volta) / (COLCHEIA * 0.5));
  const destaque = (sg) => {
    if (t >= a.volta && iv < 8) return DIRS[iv][0] === sg;
    return false;
  };
  if (kRosa > 0) drawRosa(ctx, t, cx, cy, R, kRosa, destaque);
  // siglas e nomes nas posições geográficas
  if (ks < 0.5) for (const [sg, nome, az, card, an] of DIRS) {
    const t0 = a[an], kp = pop(t, t0);
    if (kp <= 0) continue;
    const rr = card ? R + 92 : R + 52, [x, y] = azPt(cx, cy, rr, az);
    ctx.save(); ctx.translate(x, y); ctx.scale(kp, kp);
    const on = t >= t0 && t < t0 + 0.9 || destaque(sg);
    if (card) {
      ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fillStyle = on ? PAL.amarelo : PAL.preto; ctx.fill();
      txt(ctx, sg, 0, 4, 76, { fam: FONT_T, peso: 800, cor: on ? PAL.preto : PAL.branco, align: 'center', base: 'middle' });
    } else {
      rrect(ctx, -46, -30, 92, 60, 30); ctx.fillStyle = on ? PAL.amarelo : PAL.areia; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.preto; ctx.stroke();
      txt(ctx, sg, 0, 3, 44, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center', base: 'middle' });
    }
    ctx.restore();
    // nome por extenso enquanto é falado
    if (t >= t0 && t < t0 + 1.6 && ks <= 0) {
      const [nx, ny] = azPt(cx, cy, card ? R + 165 : R * 0.86 + 110, az);
      const lado = az === 0 || az === 180 ? 'center' : az < 180 ? 'right' : 'left';
      const ox = az === 0 || az === 180 ? 0 : az < 180 ? -60 : 60;
      if (card && (az === 0 || az === 180)) sobe(ctx, t, t0 + 0.05, nome, nx, az === 0 ? ny + 6 : ny + 40, 40, { peso: 800, cor: PAL.preto, align: 'center', out: t0 + 1.35 });
      else if (card) sobe(ctx, t, t0 + 0.05, nome, x, y + 100, 34, { peso: 800, cor: PAL.preto, align: 'center', out: t0 + 1.35 });
      else sobe(ctx, t, t0 + 0.05, nome, x, az < 90 || az > 270 ? y - 46 : y + 72, 32, { peso: 800, cor: PAL.preto, align: 'center', out: t0 + 1.35 });
    }
  }
  // títulos de seção (marca-texto)
  if (ks < 0.3) {
    marca(ctx, t, 'ROSA DOS VENTOS', 64, 250, 96, a.rosa, { out: a.card - 0.35 });
    marca(ctx, t, '4 CARDEAIS', 64, 250, 96, a.card, { out: a.col - 0.35 });
    marca(ctx, t, '+ 4 COLATERAIS', 64, 250, 96, a.col, { out: a.oito - 0.35 });
    marca(ctx, t, '= 8 DIREÇÕES', 64, 250, 96, a.oito, { out: a.sai });
  }
}
RENDER.s02 = renderS02;
