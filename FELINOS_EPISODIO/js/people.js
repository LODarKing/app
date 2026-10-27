// Lara e Miguel desenhados do zero (boneco articulado em código), a partir das folhas de referência do usuário.
// Unidades locais = pixels da referência; origem na base do pescoço; y para baixo. Vista de frente com meia-volta (turn).
// Uniforme: camisa cáqui com bolsos, lenço amarelo com arganel, cinto verde com fivela, saia (Lara) / calça (Miguel) verdes.
// Insígnias: o triângulo oficial dos Desbravadores vem da imagem oficial (assets/emblema_desbravadores_recortado.png).
'use strict';
const PEOPLE = {
  lara: {
    skin: '#EFA070', skinS: '#D9845C', skinL: '#F8BC8E', hair: '#3A2520', hairS: '#271712', hairL: '#5E3C2E',
    head: { cy: -150, rx: 126, ry: 122, chin: 0.9, scale: 1.22 }, eyes: { y: -150, dx: 50, rx: 15, ry: 19, lashes: true }, mouth: { y: -82, w: 74 }, ears: { y: -138, dx: 124 },
    brows: null, nose: { y: -112 },
    torso: { sh: 160, shY: 52, waist: 150, waistY: 318 }, belt: [318, 356], lower: 'skirt', hem: 760, legTop: 760, foot: 1040,
    arm: { sx: 150, sy: 80, L1: 190, L2: 175, sleeve: 0.62 }, height: 1390,
  },
  miguel: {
    skin: '#EDA06E', skinS: '#D48058', skinL: '#F6BA8A', hair: '#3E2A22', hairS: '#2A1A14', hairL: '#5F4032',
    head: { cy: -160, rx: 114, ry: 120, chin: 0.92, scale: 1.16 }, eyes: { y: -165, dx: 50, rx: 15, ry: 18, lashes: false }, mouth: { y: -98, w: 66 }, ears: { y: -150, dx: 114 },
    brows: { y: -207, dx: 50, w: 40, color: '#3A2418' }, nose: { y: -128 },
    torso: { sh: 168, shY: 46, waist: 152, waistY: 336 }, belt: [336, 376], lower: 'pants', hem: 1060, legTop: 376, foot: 1070,
    arm: { sx: 158, sy: 74, L1: 200, L2: 185, sleeve: 0.6 }, height: 1420,
  },
};
const UNI = { shirt: '#DDBE8E', shirtS: '#C3A070', shirtL: '#EDD4A8', seam: '#B48E5E', scarf: '#FFD414', scarfS: '#E6B400', green: '#2F4C3D', greenS: '#223A2E', greenL: '#3D6050', belt: '#20352B', shoe: '#1E1A1D', shoeL: '#3A3438' };
const emblemImg = () => document.getElementById('emblema');
function emblemAt(g, x, y, w, rot = 0) { const im = emblemImg(); g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(im, -w / 2, -w * 344 / 337 / 2, w, w * 344 / 337); g.restore(); }
function poly(g, pts, fill, n = 6, closed = true) { const P = smooth(pts, closed, n); g.beginPath(); trace(g, P, closed); g.fillStyle = fill; g.fill(); return P; }

/** braço: ombro S, ângulos (graus; 90 = para baixo), manga cáqui até "sleeve" do braço; mão com dedos (open 0..1, point = indicador) */
function personArm(g, C, S, a, side) {
  const r = (d) => d * Math.PI / 180, A = C.arm, a1 = r(a.a1), a2 = r(a.a2);
  const E = [S[0] + Math.cos(a1) * A.L1, S[1] + Math.sin(a1) * A.L1], Wr = [E[0] + Math.cos(a2) * A.L2, E[1] + Math.sin(a2) * A.L2];
  // antebraço e braço (pele) por baixo da manga
  const armP = smooth(limb([S, E, Wr], [34, 30, 25]), true, 4);
  g.beginPath(); trace(g, armP); g.fillStyle = C.skin; g.fill();
  clipTo(g, armP, () => { g.beginPath(); trace(g, smooth(limb([S, E, Wr], [20, 17, 13]).map((p) => [p[0] - 16 * side, p[1] + 6]), true, 3)); g.fillStyle = C.skinS; g.fill(); });
  // manga curta (acompanha o braço)
  const d = [Math.cos(a1), Math.sin(a1)], n = [-d[1], d[0]], Ls = A.L1 * A.sleeve, SE = [S[0] + d[0] * Ls, S[1] + d[1] * Ls];
  const sl = [[S[0] - d[0] * 40 + n[0] * 50, S[1] - d[1] * 40 + n[1] * 50], [SE[0] + n[0] * 45, SE[1] + n[1] * 45], [SE[0] - n[0] * 45, SE[1] - n[1] * 45], [S[0] - d[0] * 40 - n[0] * 50, S[1] - d[1] * 40 - n[1] * 50]];
  g.beginPath(); trace(g, sl); g.fillStyle = UNI.shirt; g.fill();
  clipTo(g, sl, () => { g.fillStyle = UNI.shirtS; g.beginPath(); trace(g, [[S[0] - d[0] * 40 - n[0] * 50 * side, S[1] - d[1] * 40 - n[1] * 50 * side], [SE[0] - n[0] * 45 * side, SE[1] - n[1] * 45 * side], [SE[0] - n[0] * 10 * side, SE[1] - n[1] * 10 * side], [S[0] - n[0] * 14 * side, S[1] - n[1] * 14 * side]]); g.fill();
    g.strokeStyle = UNI.seam; g.lineWidth = 5; g.beginPath(); g.moveTo(SE[0] - d[0] * 12 + n[0] * 46, SE[1] - d[1] * 12 + n[1] * 46); g.lineTo(SE[0] - d[0] * 12 - n[0] * 46, SE[1] - d[1] * 12 - n[1] * 46); g.stroke(); });
  // mão
  const hx = Wr[0] + Math.cos(a2) * 30, hy = Wr[1] + Math.sin(a2) * 30, open = clamp(a.open || 0), point = clamp(a.point || 0);
  g.save(); g.translate(hx, hy); g.rotate(a2 - Math.PI / 2);
  g.fillStyle = C.skin; g.beginPath(); g.ellipse(0, 0, 30, 33, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-29 * side, -4 + 8 * open, 11, 21, (-0.5 - 0.6 * open) * side, 0, 6.283); g.fill();
  for (let i = 0; i < 4; i++) {
    const ext = i === 0 ? Math.max(open, point) : open * (1 - point), len = lerp(12, 34, ext) - (i === 3 ? 6 : 0), fx = (-15 + i * 10.5) * side;
    g.save(); g.translate(fx, 24); g.rotate((i - 1.5) * 0.13 * open * side); g.fillStyle = C.skin; g.beginPath(); g.roundRect(-6, -6, 12, len + 8, 6); g.fill(); g.restore();
  }
  g.fillStyle = 'rgba(160,70,50,0.28)'; g.beginPath(); g.ellipse(-8 * side, 6, 16, 22, 0, 0, 6.283); g.fill();
  if (a.watch) { g.fillStyle = '#1C1A1C'; g.fillRect(-26, -46, 52, 18); g.fillStyle = '#3E3A40'; g.fillRect(-14, -50, 28, 26); }
  g.restore();
  return [hx, hy];
}

/** p: {x, y (base do pescoço na tela), s, t, tilt, turn (-1..1), look [dx,dy], blink, happy, brow, mouth, smile, surprise, lean,
 *  armL / armR {a1, a2, open, point}, legs (corpo inteiro), walk (fase do passo), cutY, light} */
function drawPerson(dst, who, p) {
  const C = PEOPLE[who], s = p.s, t = p.t || 0, ph = who === 'lara' ? 1.3 : 0, T = C.torso;
  const [lc, g] = layer('person_' + who);
  g.translate(p.x, p.y); g.scale(s, s);
  const sway = (p.lean || 0) + 1.0 * Math.sin(t * 1.25 + ph) + 0.4 * Math.sin(t * 2.9 + ph * 2), breath = Math.sin(t * 2.2 + ph);
  const turn = clamp(p.turn || 0, -1, 1), tx = turn * 22;
  // ---------- pernas e saia/calça (corpo inteiro)
  if (p.legs) {
    const wk = p.walk ?? null, step = (sd) => wk == null ? 0 : Math.sin((wk + (sd > 0 ? 0.5 : 0)) * Math.PI * 2);
    [-1, 1].forEach((sd) => {
      const lift = Math.max(0, step(sd)) * 30, fx = sd * (who === 'lara' ? 48 : 62) + (wk == null ? 0 : step(sd) * 6);
      if (who === 'lara') { poly(g, [[fx - 26, C.legTop - 20], [fx + 26, C.legTop - 20], [fx + 22, C.foot - 30 - lift], [fx - 22, C.foot - 30 - lift]], C.skin, 3); g.fillStyle = C.skinS; g.fillRect(fx + (sd > 0 ? 6 : -22), C.legTop, 16, C.foot - C.legTop - 40 - lift); }
      else { poly(g, [[-T.waist, C.legTop - 10], [T.waist, C.legTop - 10], [T.waist - 4, C.legTop + 170], [-T.waist + 4, C.legTop + 170]], UNI.green, 1); poly(g, [[fx - 56, C.legTop + 20], [fx + 56, C.legTop + 20], [fx + 48, C.foot - 26 - lift], [fx - 48, C.foot - 26 - lift]], UNI.green, 1); g.fillStyle = UNI.greenS; g.fillRect(fx + (sd > 0 ? 8 : -42), C.legTop + 60, 30, C.foot - C.legTop - 100 - lift); }
      g.fillStyle = UNI.shoe; g.beginPath(); g.ellipse(fx + 12 * sd, C.foot - 14 - lift, who === 'lara' ? 46 : 58, 26, 0, 0, 6.283); g.fill(); g.fillRect(fx - (who === 'lara' ? 30 : 46), C.foot - 40 - lift, who === 'lara' ? 60 : 92, 26);
      g.fillStyle = UNI.shoeL; g.beginPath(); g.ellipse(fx + 10 * sd, C.foot - 22 - lift, 18, 7, 0, 0, 6.283); g.fill();
    });
    if (who === 'lara') {   // saia com prega central
      const sk = poly(g, [[-T.waist, C.belt[1] - 6], [0, C.belt[1] - 8], [T.waist, C.belt[1] - 6], [T.waist + 26, (C.belt[1] + C.hem) / 2], [T.waist + 48, C.hem], [0, C.hem + 6], [-T.waist - 48, C.hem], [-T.waist - 26, (C.belt[1] + C.hem) / 2]], UNI.green, 1);
      clipTo(g, sk, () => { g.fillStyle = UNI.greenS; g.beginPath(); trace(g, [[-8, C.belt[1]], [8, C.belt[1]], [40, C.hem], [-40, C.hem]]); g.fill(); g.fillStyle = UNI.greenL; g.fillRect(-T.waist - 44, C.belt[1], 40, C.hem); });
    }
  }
  // ---------- tronco (gira levemente pela cintura; respira)
  g.save(); g.translate(0, T.waistY); g.rotate(sway * Math.PI / 180); g.translate(0, -T.waistY);
  if (p.cutY != null) { g.save(); g.beginPath(); g.rect(-900, -900, 1800, 900 + (p.cutY - p.y) / s); g.clip(); }
  // tranças atrás (Lara: base atrás dos ombros)
  // camisa
  const by = -2 * breath;
  const shirt = poly(g, [[-T.sh + 10, T.shY - 14 + by], [-60, 4 + by], [60, 4 + by], [T.sh - 10, T.shY - 14 + by], [T.sh + 8, T.shY + 40 + by], [T.waist + 6, T.waistY], [-T.waist - 6, T.waistY], [-T.sh - 8, T.shY + 40 + by]], UNI.shirt, 4);
  clipTo(g, shirt, () => {
    g.fillStyle = UNI.shirtS; g.beginPath(); trace(g, smooth([[T.sh * 0.35, 40], [T.sh + 20, 60], [T.waist + 20, T.waistY + 10], [T.waist * 0.4, T.waistY + 10]], true, 4)); g.fill();
    g.fillStyle = UNI.shirtL; g.beginPath(); trace(g, smooth([[-T.sh * 0.9, 70], [-T.sh * 0.45, 60], [-T.waist * 0.6, T.waistY - 40], [-T.waist * 0.95, T.waistY - 30]], true, 4)); g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1;
    // bolsos com lapela, botões, costura frontal
    [-1, 1].forEach((sd) => { const px = sd * 78 + tx * 0.3, py = 150;
      g.fillStyle = UNI.shirtS; g.globalAlpha = 0.55; g.fillRect(px - 44, py, 88, 92); g.globalAlpha = 1;
      g.fillStyle = UNI.shirt; g.beginPath(); g.moveTo(px - 48, py - 6); g.lineTo(px + 48, py - 6); g.lineTo(px + 46, py + 22); g.lineTo(px, py + 30); g.lineTo(px - 46, py + 22); g.closePath(); g.fill();
      g.strokeStyle = UNI.seam; g.lineWidth = 4; g.stroke(); g.fillStyle = UNI.seam; g.beginPath(); g.arc(px, py + 18, 5, 0, 6.283); g.fill(); });
    g.strokeStyle = UNI.seam; g.lineWidth = 4; g.beginPath(); g.moveTo(tx * 0.3, 20); g.lineTo(tx * 0.3, T.waistY); g.stroke();
    if (who === 'miguel') {
      g.fillStyle = '#9C7B55'; g.fillRect(-120 + tx * 0.3, 104, 76, 22);                                            // tarja de nome
      [['#C0392B', 70, 102], ['#C0392B', 80, 118], ['#B8862E', 62, 120], ['#5A3328', 98, 120]].forEach(([c, x, y]) => { g.fillStyle = c; g.beginPath(); g.arc(x + tx * 0.3, y, 7, 0, 6.283); g.fill(); });   // pins
    }
  });
  // gola
  [-1, 1].forEach((sd) => poly(g, [[sd * 20, 6 + by], [sd * 76, 0 + by], [sd * 92, 40 + by], [sd * 34, 54 + by]], UNI.shirtL, 3));
  // cinto e fivela (emblema oficial)
  g.fillStyle = UNI.belt; g.fillRect(-T.waist - 8, C.belt[0], 2 * T.waist + 16, C.belt[1] - C.belt[0]);
  g.fillStyle = '#D9D9D6'; g.beginPath(); g.roundRect(-30 + tx * 0.3, C.belt[0] - 2, 60, C.belt[1] - C.belt[0] + 4, 6); g.fill(); emblemAt(g, tx * 0.3, (C.belt[0] + C.belt[1]) / 2, 30);
  if (!p.legs && who === 'miguel') { g.fillStyle = UNI.green; g.fillRect(-T.waist - 6, C.belt[1], 2 * T.waist + 12, 1400); g.fillStyle = UNI.greenS; g.fillRect(T.waist * 0.3, C.belt[1] + 30, T.waist * 0.7, 1400); }
  if (!p.legs && who === 'lara') { g.fillStyle = UNI.green; g.beginPath(); trace(g, [[-T.waist, C.belt[1]], [T.waist, C.belt[1]], [T.waist + 110, C.belt[1] + 1400], [-T.waist - 110, C.belt[1] + 1400]]); g.fill(); g.fillStyle = UNI.greenS; g.beginPath(); trace(g, [[-8, C.belt[1]], [8, C.belt[1]], [60, C.belt[1] + 1400], [-60, C.belt[1] + 1400]]); g.fill(); }
  // insígnias nas mangas ficam no braço (desenhadas depois)
  // pescoço
  poly(g, [[-34, -60], [34, -60], [38, 14], [0, 26], [-38, 14]], C.skin, 3);
  g.fillStyle = C.skinS; g.beginPath(); g.ellipse(0, -20, 40, 30, 0, 0, 6.283); g.fill();
  // lenço amarelo: gola em volta do pescoço + pontas em V até o arganel + pontas caindo
  const sc = UNI.scarf, wy = 112;
  poly(g, [[-96, 4 + by], [-40, -12 + by], [0, 8], [40, -12 + by], [96, 4 + by], [70, 42 + by], [10, wy - 10], [-10, wy - 10], [-70, 42 + by]], sc, 4);
  g.fillStyle = UNI.scarfS; g.beginPath(); trace(g, smooth([[-70, 40], [-12, wy - 14], [-30, 60]], true, 3)); g.fill();
  const sw = Math.sin(t * 1.7 + ph) * 4;
  poly(g, [[-22, wy], [-4, wy], [-14 + sw, 300], [-44 + sw, 250]], sc, 3); poly(g, [[4, wy], [22, wy], [40 + sw, 262], [12 + sw, 306]], UNI.scarfS, 3);
  g.fillStyle = '#2E4A3C'; g.fillRect(-26 + tx * 0.2, wy - 30, 52, 44);                                               // arganel (fundo verde) + emblema
  emblemAt(g, tx * 0.2, wy - 8, 50);
  if (p.cutY != null) g.restore();
  // ---------- cabeça (com atraso em relação ao tronco)
  const H = C.head, lag = 0.6 * Math.sin((t - 0.18) * 1.25 + ph);
  g.save(); g.translate(0, -30); g.rotate(((p.tilt || 0) + lag - sway * 0.4) * Math.PI / 180); g.translate(p.headDx || 0, p.headDy || 0); g.scale(H.scale, H.scale); g.translate(0, 30 - 4 / H.scale);
  drawHead(g, who, C, p, turn, t);
  g.restore();
  // ---------- braços (na frente), com insígnias oficiais nas mangas
  const hands = [];
  [[p.armL, -1], [p.armR, 1]].forEach(([a, sd]) => {
    const arm = a || { a1: 90 + sd * -6, a2: 90 + sd * -4 };
    const S = [sd * C.arm.sx + tx * 0.15, C.arm.sy + by];
    hands.push(personArm(g, C, S, { ...arm, watch: who === 'miguel' && sd < 0 }, -sd));
    const a1r = arm.a1 * Math.PI / 180, ex = S[0] + Math.cos(a1r) * 70, ey = S[1] + Math.sin(a1r) * 70;
    if ((who === 'lara' && sd > 0)) { g.save(); g.translate(ex + 6, ey - 26); g.rotate(a1r - Math.PI / 2 + 0.15); g.fillStyle = '#21406A'; g.beginPath(); g.roundRect(-30, -26, 60, 52, 10); g.fill(); g.fillStyle = '#4AA3DF'; g.beginPath(); g.roundRect(-24, -20, 48, 40, 7); g.fill();
      g.fillStyle = '#F2C230'; g.beginPath(); g.arc(10, -8, 7, 0, 6.283); g.fill(); g.fillStyle = '#F6F2EA'; g.beginPath(); trace(g, smooth([[-24, 12], [-12, -2], [0, 4], [10, -4], [24, 6], [24, 20], [-24, 20]], true, 3)); g.fill(); g.fillStyle = '#3A8A5A'; g.fillRect(-24, 12, 48, 8); g.restore();
      emblemAt(g, ex + 14, ey + 38, 48, a1r - Math.PI / 2 + 0.1); }
    if (who === 'miguel' && sd < 0) emblemAt(g, ex - 4, ey + 4, 52, a1r - Math.PI / 2 - 0.1);
  });
  g.restore();
  // ---------- acabamento pintado + luz da cena
  const M = [s, 0, 0, s, p.x, p.y], toS = ([x, y]) => [p.x + x * s, p.y + y * s];
  const rr = painterize(lc, M, [-460, -480, 460, p.legs ? C.foot + 40 : 1500], { seed: who.length * 5, tex: 0.32, edge: 0.55, edgeBlur: 2 });
  lightRig(lc, rr, p.light || { dir: [-1, -0.45], key: 'rgba(255,222,170,0.3)', shade: 'rgba(70,35,95,0.4)', rim: 'rgba(255,236,196,1)', rimW: 6 * s + 2, rimA: 0.8 });
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, rr[0], rr[1], rr[2], rr[3], rr[0], rr[1], rr[2], rr[3]); dst.restore();
  return hands.map(([x, y]) => toS([x, y]));
}

/** cabeça: cabelo de trás, rosto, orelhas, olhos, sobrancelhas, nariz, boca, cabelo da frente (franja / cachos), tranças e presilha */
function drawHead(g, who, C, p, turn, t) {
  const H = C.head, cy = H.cy, ft = turn * 26;   // deslocamento das feições na meia-volta
  const face = [];
  for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283, c = Math.cos(a), sn = Math.sin(a); face.push([c * H.rx * (sn > 0 ? lerp(1, H.chin, sn) : 1) + (sn > 0.4 ? -turn * 10 * sn : 0), cy + sn * H.ry * (sn > 0 ? 1.04 : 1)]); }
  // cabelo de trás
  if (who === 'lara') poly(g, [[-150, cy - 40], [-140, cy - 150], [-60, cy - 196], [60, cy - 196], [140, cy - 150], [150, cy - 40], [140, cy + 60], [-140, cy + 60]], C.hairS, 6);
  // orelhas
  [-1, 1].forEach((sd) => { const ex = sd * C.ears.dx - turn * 14 * (sd === Math.sign(turn) ? 1.6 : 0.4); g.fillStyle = C.skin; g.beginPath(); g.ellipse(ex, C.ears.y, 24, 32, 0, 0, 6.283); g.fill(); g.fillStyle = C.skinS; g.beginPath(); g.ellipse(ex + sd * 4, C.ears.y + 2, 11, 18, 0, 0, 6.283); g.fill(); });
  // rosto
  const fp = poly(g, face, C.skin, 2);
  clipTo(g, fp, () => {
    g.fillStyle = C.skinS; g.beginPath(); g.ellipse(H.rx * 0.75 - ft * 0.4, cy + 40, H.rx * 0.55, H.ry * 0.95, 0.2, 0, 6.283); g.globalAlpha = 0.45; g.fill(); g.globalAlpha = 1;   // sombra no lado oposto à luz
    g.fillStyle = C.skinL; g.beginPath(); g.ellipse(-H.rx * 0.45 + ft * 0.3, cy - 40, H.rx * 0.45, H.ry * 0.5, -0.2, 0, 6.283); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1;
    g.fillStyle = 'rgba(80,40,40,0.28)'; g.beginPath(); g.ellipse(0, cy - H.ry * 0.95, H.rx * 1.1, 60, 0, 0, 6.283); g.fill();   // sombra do cabelo na testa
  });
  // bochechas
  const sm_ = p.smile ?? 1;
  g.fillStyle = `rgba(232,110,100,${0.14 + 0.12 * sm_})`; [-1, 1].forEach((sd) => { g.beginPath(); g.ellipse(sd * 72 + ft, C.eyes.y + 52, 28, 15, 0, 0, 6.283); g.fill(); });
  // olhos
  personEyes(g, C, p, ft);
  // sobrancelhas (sobem com surpresa; franzem com "brow" negativo)
  const B = C.brows, bu = -(p.brow || 0) * 14 - (p.surprise || 0) * 10;
  if (B) [-1, 1].forEach((sd) => { const x = sd * B.dx + ft, y = B.y + bu; g.strokeStyle = B.color; g.lineCap = 'round'; g.lineWidth = who === 'miguel' ? 10 : 6; const fr = (p.frown || 0) * 8; g.beginPath(); g.moveTo(x - B.w / 2, y + 4 + (sd > 0 ? fr : -fr) * 0.3); g.quadraticCurveTo(x, y - 6, x + B.w / 2, y + 4 + (sd > 0 ? -fr : fr)); g.stroke(); });
  // nariz
  g.fillStyle = C.skinS; g.beginPath(); g.ellipse(4 + ft * 1.1, C.nose.y, 9, 6, 0, 0, 6.283); g.fill();
  // boca
  personMouth(g, C, p, ft);
  // cabelo da frente
  if (who === 'lara') laraHair(g, C, p, t, turn); else miguelHair(g, C, p, t, turn);
}
function personEyes(g, C, p, ft) {
  const E = C.eyes, [lx, ly] = p.look || [0, 0], blink = clamp(p.blink || 0), sur = p.surprise || 0, happy = clamp(p.happy || 0);
  [-1, 1].forEach((sd) => {
    const x = sd * E.dx + ft, y = E.y, rx = E.rx * (1 + 0.08 * sur), ry = E.ry * (1 + 0.2 * sur);
    g.save(); g.translate(x, y);
    if (happy > 0.5) {   // olhos fechados de alegria (como na referência)
      g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 8; g.beginPath(); g.moveTo(-rx - 6, 6); g.quadraticCurveTo(0, -16, rx + 6, 6); g.stroke();
      if (E.lashes) { g.lineWidth = 5; g.beginPath(); g.moveTo(sd * (rx + 4), 2); g.lineTo(sd * (rx + 13), -4); g.stroke(); }
    } else if (blink < 0.88) {
      g.save(); g.beginPath(); g.rect(-rx - 6, -ry - 6 + 2 * ry * blink, 2 * rx + 12, 2 * ry + 12); g.clip();
      g.fillStyle = '#2B1C17'; g.beginPath(); g.ellipse(lx, ly, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(110,66,46,0.85)'; g.beginPath(); g.ellipse(lx + 2, ly + ry * 0.38, rx * 0.55, ry * 0.38, 0, 0, 6.283); g.fill();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(lx - rx * 0.32, ly - ry * 0.36, rx * 0.32, 0, 6.283); g.fill(); g.beginPath(); g.arc(lx + rx * 0.32, ly + ry * 0.3, rx * 0.12, 0, 6.283); g.fill();
      g.restore();
      const ty = -ry + 2 * ry * blink - 3;
      if (blink > 0.02) { g.fillStyle = C.skin; g.beginPath(); g.rect(-rx - 6, -ry - 30, 2 * rx + 12, 2 * ry * blink + 28); g.fill(); }
      if (blink > 0.15) { g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 4; g.beginPath(); g.moveTo(-rx * 0.9, ty + 5); g.quadraticCurveTo(0, ty - 2, rx * 0.9, ty + 5); g.stroke(); }
      if (E.lashes) { g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 4; g.beginPath(); g.moveTo(sd * rx * 0.7, ty + 6); g.quadraticCurveTo(sd * (rx + 3), ty + 4, sd * (rx + 7), ty); g.stroke(); }
    } else {
      g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(-rx - 2, 2); g.quadraticCurveTo(0, 10, rx + 2, 2); g.stroke();
      if (E.lashes) { g.lineWidth = 4; g.beginPath(); g.moveTo(sd * (rx + 1), 3); g.lineTo(sd * (rx + 10), -1); g.stroke(); }
    }
    g.restore();
  });
}
function personMouth(g, C, p, ft) {
  const { y, w } = C.mouth; let op = clamp(p.mouth || 0); const sm_ = p.smile ?? 1, sur = p.surprise || 0, mx = ft * 0.9;
  if (op < 0.06 && sm_ > 0.5 && (p.grin || 0) > 0.5) op = 0.5;
  if (op < 0.06) { g.strokeStyle = '#6A2A2A'; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(mx - w * 0.4, y - 6 * sm_); g.quadraticCurveTo(mx, y + 12 * sm_, mx + w * 0.4, y - 6 * sm_); g.stroke(); return; }
  const hgt = 10 + 34 * op, ww = w * (0.55 + 0.35 * sm_) * (1 - 0.3 * sur * op);
  g.fillStyle = '#6A2430'; g.beginPath(); g.moveTo(mx - ww / 2, y - 8); g.quadraticCurveTo(mx, y - 12 + 4 * sur, mx + ww / 2, y - 8);
  g.quadraticCurveTo(mx + ww * 0.48, y - 8 + hgt, mx, y - 6 + hgt * 1.05); g.quadraticCurveTo(mx - ww * 0.48, y - 8 + hgt, mx - ww / 2, y - 8); g.fill();
  g.save(); g.clip(); g.fillStyle = '#FFFFFF'; g.fillRect(mx - ww / 2, y - 16, ww, 13); g.fillStyle = '#E07F8A'; g.beginPath(); g.ellipse(mx, y - 4 + hgt, ww * 0.32, 10, 0, 0, 6.283); g.fill(); g.restore();
}
function laraHair(g, C, p, t, turn) {
  const cy = C.head.cy, sw = Math.sin(t * 1.6 + 1) * 3;
  // calota volumosa + mechas laterais emoldurando o rosto até a altura das bochechas
  const cap = poly(g, [[-158, cy + 50], [-166, cy - 60], [-130, cy - 150], [-50, cy - 196], [50, cy - 194], [130, cy - 150], [166, cy - 60], [158, cy + 50], [126, cy + 30], [118, cy - 60], [70, cy - 104], [0, cy - 112], [-70, cy - 104], [-118, cy - 60], [-126, cy + 30]], C.hair, 6);
  clipTo(g, cap, () => { g.fillStyle = C.hairL; g.globalAlpha = 0.7; [[-80, cy - 150, -0.6], [50, cy - 168, 0.25], [140, cy - 40, 1.3]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, 64, 13, r, 0, 6.283); g.fill(); }); g.globalAlpha = 1;
    g.fillStyle = C.hairS; g.beginPath(); g.ellipse(-150, cy, 30, 90, 0, 0, 6.283); g.fill(); });
  // franja: mechas longas e pontudas, abrindo da risca para os dois lados (como na referência)
  const locks = [[-20, cy - 186, -126, cy - 40], [-10, cy - 186, -70, cy - 52], [0, cy - 184, -10, cy - 58], [16, cy - 184, 52, cy - 50], [36, cy - 180, 104, cy - 36], [60, cy - 172, 132, cy - 6]];
  locks.forEach(([x0, y0, x1, y1], i) => { const b = sw * (i % 2 ? 1 : -1); poly(g, [[x0 - 38, y0], [x0 + 38, y0 + 4], [(x0 + x1) / 2 + 24, (y0 + y1) / 2], [x1 + b, y1], [(x0 + x1) / 2 - 24, (y0 + y1) / 2 + 8]], i % 2 ? C.hair : C.hairS, 3); });
  // presilha em X (lado direito do rosto, na referência)
  g.save(); g.translate(132 + turn * 10, cy - 128); g.strokeStyle = '#FFFFFF'; g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(-12, -14); g.lineTo(12, 14); g.moveTo(12, -14); g.lineTo(-12, 14); g.stroke(); g.restore();
  // tranças (gomos alternados), elástico branco e pontinha
  [-1, 1].forEach((sd) => {
    const x0 = sd * 134, y0 = cy + 70, swing = Math.sin(t * 1.9 + sd) * 6;
    for (let k = 0; k < 7; k++) { const y = y0 + k * 46, x = x0 + sd * 4 + swing * (k / 7) + (k % 2 ? 7 : -7); g.fillStyle = k % 2 ? C.hair : C.hairS; g.beginPath(); g.ellipse(x, y, 26 - k * 0.8, 30, (k % 2 ? 0.4 : -0.4), 0, 6.283); g.fill(); g.fillStyle = C.hairL; g.beginPath(); g.ellipse(x - 6, y - 8, 9, 6, 0.4, 0, 6.283); g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1; }
    const yb = y0 + 7 * 46 - 6, xb = x0 + sd * 4 + swing; g.fillStyle = '#F4F1EC'; g.fillRect(xb - 18, yb - 8, 36, 16);
    poly(g, [[xb - 16, yb + 6], [xb + 16, yb + 6], [xb + 10, yb + 50], [xb, yb + 64], [xb - 10, yb + 50]], C.hair, 3);
  });
}
function miguelHair(g, C, p, t, turn) {
  const cy = C.head.cy, R = C.head.rx;
  // massa de cachos: círculos em volta do topo e das laterais (acima das orelhas)
  const curls = []; for (let i = 0; i < 15; i++) { const a = Math.PI * (1.02 + i / 14 * 0.96); curls.push([Math.cos(a) * (R + 14), cy - 30 + Math.sin(a) * (R + 30)]); }
  g.fillStyle = C.hairS; curls.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, 36 + (i % 3) * 5, 0, 6.283); g.fill(); });
  const cap = poly(g, [[-R - 18, cy - 20], [-R, cy - 110], [-60, cy - 160], [0, cy - 170], [60, cy - 160], [R, cy - 110], [R + 18, cy - 20], [R - 10, cy - 60], [70, cy - 96], [0, cy - 104], [-70, cy - 92], [-R + 10, cy - 50]], C.hair, 6);
  g.fillStyle = C.hair; curls.forEach(([x, y], i) => { g.beginPath(); g.arc(x * 0.96, y + 6, 28 + (i % 2) * 6, 0, 6.283); g.fill(); });
  // franja de cachinhos pontudos sobre a testa
  for (let i = 0; i < 6; i++) { const x = -80 + i * 32 + turn * 12, y = cy - 96 + Math.abs(i - 2.5) * 6; poly(g, [[x - 26, y - 24], [x + 20, y - 26], [x + 6, y + 26 + (i % 2) * 8]], i % 2 ? C.hairS : C.hair, 3); }
  g.fillStyle = C.hairL; g.globalAlpha = 0.65; [[-50, cy - 150], [10, cy - 166], [70, cy - 140], [-96, cy - 110]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 14, 3.4, 5.9); g.lineWidth = 7; g.strokeStyle = C.hairL; g.stroke(); }); g.globalAlpha = 1;
}
