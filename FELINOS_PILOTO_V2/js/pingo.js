// Pingo: gato doméstico laranja, listras discretas, peito branco, olhos verdes.
// Desenho com volume: luz principal do alto à esquerda, oclusão, pelo nas bordas, luz de contorno.
'use strict';
const PG = {
  fur: '#EE8E37', furLight: '#FFC27A', furDark: '#B8581A', stripe: 'rgba(170,70,12,0.55)',
  white: '#FFF7EC', whiteShade: '#E2CDB6', pinkIn: '#F3A7A2', nose: '#EF8796', irisIn: '#E4F77A', iris: '#86C843', irisOut: '#2E7B2E',
};
const HEAD = [[-135, -20], [-118, -80], [-72, -116], [0, -127], [72, -116], [118, -80], [135, -20], [150, 30], [168, 54, 1], [128, 72], [70, 100], [0, 110], [-70, 100], [-128, 72], [-168, 54, 1], [-150, 30]];
const BODY = [[-100, -20], [-120, -122], [-104, -232], [-70, -312], [0, -338], [70, -312], [104, -232], [120, -122], [100, -20], [0, -6]];
const BIB = [[-74, -326], [0, -352], [74, -326], [70, -240], [40, -196], [0, -170], [-40, -196], [-70, -240]];

/** olho detalhado (coordenadas locais, centro 0,0) */
function drawCatEye(g, rx, ry, o) {
  const { blink = 0, dilate = 0.3, look = [0, 0], glow = 0, seed = 1, lid = PG.fur, slitMin = 0.12 } = o;
  g.save();
  // cavidade (sombra ao redor)
  g.fillStyle = 'rgba(90,35,5,0.35)'; g.beginPath(); g.ellipse(0, 1, rx + 5, ry + 5, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = radial(g, look[0] * 0.5, look[1] * 0.5 + ry * 0.15, 0, rx * 1.05, [[0, PG.irisIn], [0.45, PG.iris], [0.85, PG.irisOut], [1, '#14401A']]);
  g.fillRect(-rx, -ry, rx * 2, ry * 2);
  // fibras da íris
  g.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2 + hash(seed * 31 + i) * 0.06, r0 = 0.28 + hash(i + seed) * 0.12, r1 = 0.78 + hash(i * 3 + seed) * 0.2;
    g.strokeStyle = i % 3 ? 'rgba(30,90,30,0.28)' : 'rgba(240,255,170,0.32)'; g.lineWidth = rx * (i % 3 ? 0.018 : 0.012);
    g.beginPath(); g.moveTo(look[0] + Math.cos(a) * rx * r0, look[1] + Math.sin(a) * ry * r0); g.lineTo(look[0] + Math.cos(a) * rx * r1, look[1] + Math.sin(a) * ry * r1); g.stroke();
  }
  // pupila: fenda vertical que dilata
  const pw = rx * lerp(slitMin, 0.62, dilate), ph = ry * lerp(0.88, 0.7, dilate);
  g.fillStyle = 'rgba(10,30,10,0.35)'; g.beginPath(); g.ellipse(look[0], look[1], pw * 1.25 + rx * 0.03, ph * 1.03, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#060807'; g.beginPath(); g.ellipse(look[0], look[1], pw, ph, 0, 0, Math.PI * 2); g.fill();
  if (glow > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = radial(g, look[0], look[1] + ph * 0.15, 0, ph, [[0, `rgba(210,255,120,${0.75 * glow})`], [1, 'rgba(60,160,40,0)']]); g.beginPath(); g.ellipse(look[0], look[1], pw, ph, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over'; }
  // sombra da pálpebra superior (dá profundidade)
  g.fillStyle = linear(g, 0, -ry, 0, -ry * 0.2, [[0, 'rgba(40,15,0,0.55)'], [1, 'rgba(40,15,0,0)']]); g.fillRect(-rx, -ry, rx * 2, ry);
  // reflexos: janela + brilho pequeno
  g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.ellipse(-rx * 0.34 + look[0] * 0.3, -ry * 0.36 + look[1] * 0.3, rx * 0.2, ry * 0.15, -0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(rx * 0.3 + look[0] * 0.3, ry * 0.34 + look[1] * 0.3, rx * 0.07, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.ellipse(rx * 0.1, ry * 0.45, rx * 0.6, ry * 0.25, 0, 0, Math.PI * 2); g.fill();
  // pálpebra
  if (blink > 0.01) {
    const y = -ry - 2 + (ry * 2 + 4) * blink;
    g.fillStyle = lid; g.fillRect(-rx - 2, -ry - 4, rx * 2 + 4, y + ry + 4);
    g.fillStyle = linear(g, 0, y - 14, 0, y, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(90,35,5,0.45)']]); g.fillRect(-rx - 2, y - 14, rx * 2 + 4, 14);
    g.strokeStyle = '#3A1A08'; g.lineWidth = rx * 0.07; g.beginPath(); g.moveTo(-rx, y); g.quadraticCurveTo(0, y + ry * 0.12 * blink, rx, y); g.stroke();
  }
  g.restore();
  // contorno da pálpebra
  g.save(); g.strokeStyle = '#3A1A08'; g.lineWidth = rx * 0.075; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
  g.lineWidth = rx * 0.04; g.globalAlpha = 0.6; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0.1, Math.PI - 0.1); g.stroke(); g.restore();
}

/** cabeça do Pingo (coordenadas locais com centro em 0,0) desenhada numa camada com sombreamento próprio */
function drawPingoHead(dst, M, p, id = 'h') {
  const [c, g] = layer('pgHead' + id);
  g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  const earL = (p.earL || 0) * Math.PI / 180, earR = (p.earR || 0) * Math.PI / 180;
  const ear = (sd, rot) => {
    g.save(); g.translate(sd * 82, -92); g.rotate(sd * rot); g.translate(-sd * 82, 92);
    const outer = smooth([[sd * 132, -54], [sd * 128, -150], [sd * 116, -212, 1], [sd * 70, -150], [sd * 30, -112]], true, 8);
    tracePoly(g, outer); g.fillStyle = PG.fur; g.fill();
    fur(g, outer, { color: PG.fur, len: 4, step: 4, seed: 3 + sd, width: 2.2 });
    const inner = smooth([[sd * 116, -70], [sd * 114, -150], [sd * 108, -186, 1], [sd * 70, -132], [sd * 48, -110]], true, 8);
    tracePoly(g, inner); g.fillStyle = linear(g, sd * 100, -190, sd * 90, -80, [[0, '#E98C8A'], [1, PG.pinkIn]]); g.fill();
    g.strokeStyle = 'rgba(255,245,230,0.85)'; g.lineWidth = 2.2; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const y = -84 - i * 10, x = sd * (62 + i * 3); g.globalAlpha = 0.6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sd * 14, y - 18, x + sd * (22 + hash(i) * 10), y - 34); g.stroke(); }
    g.restore();
  };
  ear(-1, earL); ear(1, earR);
  const head = smooth(HEAD, true, 10);
  tracePoly(g, head); g.fillStyle = PG.fur; g.fill();
  fur(g, head, { color: PG.fur, len: 8, step: 3.2, seed: 11, width: 2.6, skip: (x, y, nx, ny) => ny < -0.7 });
  // listras "M" na testa e bochechas (macias)
  g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = 'blur(2.5px)'; g.strokeStyle = PG.stripe; g.lineCap = 'round';
  [[-30, 13], [0, 16], [30, 13]].forEach(([x, w], i) => { g.lineWidth = w; g.beginPath(); g.moveTo(x * 1.15, -128); g.quadraticCurveTo(x * 1.05, -100, x * 0.85, -72 + (i === 1 ? 6 : 0)); g.stroke(); });
  [-1, 1].forEach((sd) => { g.lineWidth = 11; [[0, 0], [1, 22]].forEach(([k, dy]) => { g.beginPath(); g.moveTo(sd * 170, 12 + dy); g.quadraticCurveTo(sd * 140, 14 + dy, sd * 112, 24 + dy); g.stroke(); }); g.lineWidth = 9; g.beginPath(); g.moveTo(sd * 92, -18); g.quadraticCurveTo(sd * 118, -24, sd * 136, -44); g.stroke(); });
  g.restore();
  // focinho branco e queixo
  g.save(); g.globalCompositeOperation = 'source-atop';
  const muz = smooth([[-70, 44], [-46, 14], [0, 22], [46, 14], [70, 44], [50, 80], [0, 96], [-50, 80]], true, 10);
  tracePoly(g, muz); g.fillStyle = PG.white; g.filter = 'blur(1.5px)'; g.fill(); g.filter = 'none';
  fur(g, muz, { color: PG.white, len: 5, step: 3.5, seed: 21, width: 2 });
  // sombreamento: luz do alto à esquerda
  g.fillStyle = linear(g, -120, -130, 120, 110, [[0, 'rgba(255,225,170,0.38)'], [0.5, 'rgba(255,200,140,0)'], [1, 'rgba(110,35,0,0.38)']]); g.fillRect(-220, -240, 440, 380);
  g.fillStyle = radial(g, -50, -78, 0, 90, [[0, 'rgba(255,236,200,0.45)'], [1, 'rgba(255,236,200,0)']]); g.fillRect(-220, -240, 440, 380);
  g.fillStyle = radial(g, 0, 118, 0, 150, [[0, 'rgba(90,30,0,0.35)'], [1, 'rgba(90,30,0,0)']]); g.fillRect(-220, -240, 440, 380);
  g.restore();
  // olhos, nariz, boca
  const look = p.look || [0, 0];
  [-1, 1].forEach((sd) => { g.save(); g.translate(sd * 57, -20); drawCatEye(g, 45, 42, { blink: p.blink || 0, dilate: p.dilate ?? 0.3, look, seed: sd + 5 }); g.restore(); });
  g.save();
  const nose = smooth([[-17, 22, 1], [17, 22, 1], [3, 38], [0, 40, 1], [-3, 38]], true, 6);
  tracePoly(g, nose); g.fillStyle = linear(g, 0, 20, 0, 40, [[0, '#F7A3AE'], [1, '#D8667A']]); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-5, 26, 5, 2.5, 0, 0, Math.PI * 2); g.fill();
  const m = clamp(p.meow || 0);
  g.strokeStyle = '#5A2410'; g.lineWidth = 3.4; g.lineCap = 'round';
  if (m > 0.02) {
    const mo = smooth([[-20, 50], [0, 46], [20, 50], [14, 52 + 34 * m], [0, 58 + 38 * m], [-14, 52 + 34 * m]], true, 8);
    tracePoly(g, mo); g.fillStyle = '#7A1E26'; g.fill(); g.fillStyle = '#E97A8A'; g.beginPath(); g.ellipse(0, 54 + 30 * m, 11, 7 * m + 2, 0, 0, Math.PI * 2); g.fill();
  }
  g.beginPath(); g.moveTo(0, 40); g.lineTo(0, 50); g.moveTo(0, 50); g.quadraticCurveTo(-12, 61, -27, 52); g.moveTo(0, 50); g.quadraticCurveTo(12, 61, 27, 52); g.stroke();
  // pontinhos dos bigodes
  g.fillStyle = 'rgba(150,80,40,0.55)'; [-1, 1].forEach((sd) => [0, 1, 2, 3].forEach((k) => { g.beginPath(); g.arc(sd * (24 + k * 9), 60 + (k % 2) * 7, 2.3, 0, Math.PI * 2); g.fill(); }));
  g.restore();
  // luz de contorno da cabeça (sol atrás, à esquerda)
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(c, 0, 0); dst.restore();
  rimLight(dst, c, -5, -3, 'rgba(255,236,190,0.9)', 2, 0.6);
  // bigodes por cima de tudo
  dst.save(); dst.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); dst.lineCap = 'round';
  [-1, 1].forEach((sd) => [0, 1, 2].forEach((k) => {
    dst.strokeStyle = 'rgba(255,255,255,0.88)'; dst.lineWidth = 2.6 - k * 0.3;
    dst.beginPath(); dst.moveTo(sd * 46, 58 + k * 8); dst.bezierCurveTo(sd * 110, 40 + k * 14, sd * 170, 40 + k * 26, sd * 215, 44 + k * 40); dst.stroke();
  }));
  dst.restore();
}

/** Pingo sentado, vista frontal. p: {x, y, s, tilt, blink, dilate, look, earL, earR, crouch, wiggle, meow, tail, breath} */
function drawPingo(dst, p) {
  const [c, g] = layer('pgBody');
  const cr = clamp(p.crouch || 0), sy = lerp(1, 0.8, cr), sx = lerp(1, 1.1, cr), wig = p.wiggle || 0, br = Math.sin((p.breath ?? 0) * 2.2) * 0.012;
  const base = [p.x, p.y];
  g.setTransform(p.s * sx, 0, 0, p.s * sy * (1 + br), base[0] + wig * 10 * p.s, base[1]);
  // ancas
  [-1, 1].forEach((sd) => { const e = ellipsePts(sd * 98, -80, 74, 90, 14); const sp = smooth(e); tracePoly(g, sp); g.fillStyle = PG.fur; g.fill(); fur(g, sp, { color: PG.fur, len: 6, step: 3.5, seed: 40 + sd, width: 2.4 }); });
  const body = smooth(BODY, true, 10);
  tracePoly(g, body); g.fillStyle = PG.fur; g.fill();
  fur(g, body, { color: PG.fur, len: 6, step: 3.5, seed: 51, width: 2.4, skip: (x, y) => y > -40 });
  // listras do corpo
  g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = 'blur(3px)'; g.strokeStyle = PG.stripe; g.lineCap = 'round';
  [-1, 1].forEach((sd) => { for (let k = 0; k < 4; k++) { g.lineWidth = 13 - k; g.beginPath(); g.moveTo(sd * 136, -270 + k * 56); g.quadraticCurveTo(sd * 100, -256 + k * 56, sd * 78, -236 + k * 56); g.stroke(); } g.lineWidth = 12; g.beginPath(); g.moveTo(sd * 160, -110); g.quadraticCurveTo(sd * 120, -96, sd * 100, -70); g.stroke(); });
  g.restore();
  // peito branco fofo
  const bib = smooth(BIB, true, 10);
  g.save(); tracePoly(g, bib); g.fillStyle = PG.white; g.fill();
  fur(g, bib, { color: PG.white, len: 8, step: 3.2, seed: 61, width: 2.4 }); g.restore();
  // patas dianteiras
  [-1, 1].forEach((sd) => {
    const leg = smooth(limbPts([[sd * 48, -214], [sd * 47, -130], [sd * 46, -40]], [31, 29, 27]), true, 6);
    tracePoly(g, leg); g.fillStyle = PG.fur; g.fill();
    g.save(); tracePoly(g, leg); g.clip(); g.filter = 'blur(2.5px)'; g.strokeStyle = PG.stripe; g.lineCap = 'round'; g.lineWidth = 10;
    [[-140, 0], [-104, 4]].forEach(([y]) => { g.beginPath(); g.moveTo(sd * 20, y); g.lineTo(sd * 80, y + 8); g.stroke(); }); g.restore();
    const paw = smooth(ellipsePts(sd * 47, -22, 40, 25, 12)); tracePoly(g, paw); g.fillStyle = PG.white; g.fill(); fur(g, paw, { color: PG.white, len: 6, step: 5, seed: 70 + sd, width: 2, skip: (x, y, nx, ny) => ny > 0.3 });
    g.strokeStyle = 'rgba(160,120,90,0.55)'; g.lineWidth = 3; [-14, 2, 18].forEach((dx) => { g.beginPath(); g.moveTo(sd * 47 + dx, -30); g.lineTo(sd * 47 + dx * 1.05, -6); g.stroke(); });
  });
  // sombreamento do corpo
  g.save(); g.globalCompositeOperation = 'source-atop'; g.setTransform(p.s * sx, 0, 0, p.s * sy, base[0] + wig * 10 * p.s, base[1]);
  g.fillStyle = linear(g, -150, -360, 150, 0, [[0, 'rgba(255,225,170,0.4)'], [0.45, 'rgba(255,200,140,0)'], [1, 'rgba(100,30,0,0.42)']]); g.fillRect(-260, -420, 520, 440);
  g.fillStyle = radial(g, 0, -330, 0, 150, [[0, 'rgba(70,20,0,0.55)'], [1, 'rgba(70,20,0,0)']]); g.fillRect(-260, -420, 520, 440);   // sombra da cabeça no peito
  g.fillStyle = radial(g, 0, -60, 0, 80, [[0, 'rgba(80,25,0,0.4)'], [1, 'rgba(80,25,0,0)']]); g.fillRect(-260, -420, 520, 440);       // entre as patas
  g.restore();
  // cauda (enrolada pela frente, ponta balança)
  const tt = p.tail || 0, sw = Math.sin(tt * 2.4) * 18, sw2 = Math.sin(tt * 2.4 - 0.9) * 28;
  const tp = smooth([[104, -46], [162, -24], [150, 8], [70, 20], [-30, 18], [-112 + sw, -4 + sw2 * 0.3], [-140 + sw2, -52 + sw2 * 0.2]], false, 6);
  const tail = smooth(limbPts(tp, tp.map((_, i) => lerp(25, 17, i / (tp.length - 1)))), true, 2);
  g.save(); tracePoly(g, tail); g.fillStyle = PG.fur; g.fill(); fur(g, tail, { color: PG.fur, len: 5, step: 3.5, seed: 81, width: 2.2 });
  tracePoly(g, tail); g.clip(); g.filter = 'blur(2px)'; g.fillStyle = 'rgba(170,70,12,0.6)';
  for (let i = 3; i < tp.length - 2; i += 6) { const a = tp[i], b = tp[i + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; g.save(); g.translate(a[0], a[1]); g.rotate(ang); g.fillRect(-30, -6, 60, 12); g.restore(); }
  g.filter = 'none'; g.fillStyle = linear(g, 0, -60, 0, 30, [[0, 'rgba(255,220,160,0.3)'], [1, 'rgba(100,30,0,0.4)']]); g.fillRect(-200, -80, 400, 120);
  g.restore();
  // sombra de contato na mesa
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  softEllipse(dst, p.x, p.y + 4 * p.s, 190 * p.s * sx, 34 * p.s, 'rgba(60,25,5,0.6)', 1);
  dst.drawImage(c, 0, 0); dst.restore();
  rimLight(dst, c, -5, -3, 'rgba(255,238,200,0.9)', 2, 0.55);
  // cabeça
  const hy = lerp(-436, -350, cr) + (p.headDy || 0), tl = (p.tilt || 0) * Math.PI / 180;
  const ca = Math.cos(tl), sa = Math.sin(tl), S = p.s;
  const hx = p.x + wig * 10 * p.s * 0.6, hyW = p.y + hy * S * sy;
  drawPingoHead(dst, [S * ca, S * sa, -S * sa, S * ca, hx, hyW], p, '');
}

/** Pingo saltando em direção à câmera (patas abertas, coxins à mostra) */
function drawPingoLeap(dst, p) {
  const [c, g] = layer('pgLeap');
  g.setTransform(p.s, 0, 0, p.s, p.x, p.y);
  [-1, 1].forEach((sd) => {
    const leg = smooth(limbPts([[sd * 60, -30], [sd * 92, 40], [sd * 104, 96]], [44, 34, 28]), true, 6); tracePoly(g, leg); g.fillStyle = PG.fur; g.fill(); fur(g, leg, { color: PG.fur, len: 6, step: 3.5, seed: 30 + sd, width: 2.4 });
    const ft = smooth(ellipsePts(sd * 108, 112, 34, 26, 12)); tracePoly(g, ft); g.fillStyle = PG.white; g.fill(); fur(g, ft, { color: PG.white, len: 5, step: 3.5, seed: 33 + sd, width: 2 });
  });
  const body = smooth(ellipsePts(0, -60, 135, 125, 14)); tracePoly(g, body); g.fillStyle = PG.fur; g.fill(); fur(g, body, { color: PG.fur, len: 12, step: 5, seed: 5, width: 3 });
  const bib = smooth([[-64, -150], [0, -175], [64, -150], [44, -40], [0, 0], [-44, -40]]); tracePoly(g, bib); g.fillStyle = PG.white; g.fill(); fur(g, bib, { color: PG.white, len: 10, step: 5, seed: 6, width: 2.5 });
  g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = linear(g, -150, -200, 150, 100, [[0, 'rgba(255,225,170,0.35)'], [1, 'rgba(100,30,0,0.45)']]); g.fillRect(-300, -300, 600, 500); g.restore();
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(c, 0, 0); dst.restore();
  drawPingoHead(dst, [p.s, 0, 0, p.s, p.x, p.y - 240 * p.s], { ...p, earL: -14, earR: -14 }, 'L');
  // patas da frente estendidas, coxins rosados
  const [c2, g2] = layer('pgPaws');
  g2.setTransform(p.s, 0, 0, p.s, p.x, p.y);
  [-1, 1].forEach((sd) => {
    const x = sd * 160, y = -30;
    const arm = smooth(limbPts([[sd * 70, -150], [sd * 120, -90], [x, y]], [40, 40, 44]), true, 6); tracePoly(g2, arm); g2.fillStyle = PG.fur; g2.fill(); fur(g2, arm, { color: PG.fur, len: 9, step: 5, seed: 90 + sd, width: 2.6 });
    const pw = smooth(ellipsePts(x, y + 10, 70, 60, 14)); tracePoly(g2, pw); g2.fillStyle = PG.white; g2.fill(); fur(g2, pw, { color: PG.white, len: 8, step: 5, seed: 95 + sd, width: 2.4 });
    g2.fillStyle = linear(g2, 0, y - 30, 0, y + 60, [[0, '#F7A9B4'], [1, '#E17C8E']]);
    tracePoly(g2, smooth([[x - 30, y + 24], [x, y + 4], [x + 30, y + 24], [x + 22, y + 50], [x, y + 56], [x - 22, y + 50]])); g2.fill();
    [-40, -14, 14, 40].forEach((dx, i) => { g2.beginPath(); g2.ellipse(x + dx, y - 18 - (i === 1 || i === 2 ? 12 : 0), 12, 15, 0, 0, Math.PI * 2); g2.fill(); });
  });
  g2.save(); g2.globalCompositeOperation = 'source-atop'; g2.fillStyle = linear(g2, -200, -150, 200, 80, [[0, 'rgba(255,230,180,0.3)'], [1, 'rgba(100,30,0,0.35)']]); g2.fillRect(-300, -300, 600, 500); g2.restore();
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(c2, 0, 0); dst.restore();
}
