// Lara e Miguel: bonecos de recorte feitos das folhas de referência do usuário (assets/ref_*.png, 941x1672).
// Cabeça e tronco são as próprias imagens (rosto e uniforme fiéis); boca, olhos, sobrancelhas e braços são redesenhados
// por cima, animáveis, nas cores amostradas da referência. Coordenadas abaixo = pixels da imagem de referência.
'use strict';
const KID = {
  miguel: {
    img: 'refMiguel',
    head: [[345, 330], [352, 240], [385, 170], [450, 126], [530, 126], [602, 158], [630, 230], [624, 300], [614, 345], [614, 402], [588, 418], [556, 442], [497, 457], [440, 444], [398, 406], [350, 396]],
    pivot: [495, 452],
    eyes: [[445, 335], [547, 347]], eyeR: [15, 18], eyeStyle: 'oval', faceRot: 0.12,
    brows: [[[423, 301], [447, 291], [472, 298]], [[533, 317], [557, 310], [580, 322]]], browW: 9,
    mouth: [490, 401], mouthW: 62,
    patches: [[490, 402, 40, 22], [445, 300, 30, 12], [557, 316, 30, 12]],     // boca e sobrancelhas originais cobertas com a pele
    armCut: [[[226, 742], [342, 746], [342, 1100], [226, 1100]], [[614, 732], [720, 716], [720, 1100], [614, 1100]]],
    hems: [[296, 748], [636, 740]], skinSample: [418, 382], sleeveSample: [300, 700],
  },
  lara: {
    img: 'refLara',
    head: [[305, 330], [318, 250], [352, 188], [420, 146], [500, 140], [572, 166], [620, 230], [642, 300], [630, 372], [610, 420], [572, 446], [566, 520], [564, 610], [560, 700], [550, 742], [522, 742], [512, 650], [510, 560], [504, 494], [452, 490], [420, 482], [374, 456], [356, 520], [353, 620], [350, 700], [334, 738], [308, 738], [300, 680], [302, 580], [312, 480], [318, 420], [306, 382]],
    pivot: [452, 488],
    eyes: [[415, 356], [515, 386]], eyeR: [15, 19], eyeStyle: 'arc', faceRot: 0.29, lashes: true,
    brows: null,
    mouth: [450, 426], mouthW: 76,
    patches: [[450, 427, 46, 26]],
    armCut: [[[240, 748], [346, 750], [346, 1100], [240, 1100]], [[556, 744], [680, 740], [680, 1100], [556, 1100]]],
    hems: [[300, 752], [602, 748]], skinSample: [380, 405], sleeveSample: [290, 700],
  },
};
function refImg(id) { return document.getElementById(id); }
function sampleColor(img, x, y) {
  const c = cached('smp_' + img.id, img.naturalWidth, img.naturalHeight, (g) => g.drawImage(img, 0, 0));
  const d = c.getContext('2d').getImageData(x - 3, y - 3, 7, 7).data; let r = 0, gg = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
  return `rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`;
}
/** peças recortadas (em cache): tronco sem cabeça e sem antebraços; cabeça com boca/sobrancelhas cobertas */
function kidParts(name) {
  const k = KID[name], img = refImg(k.img), w = img.naturalWidth, h = img.naturalHeight;
  const skin = sampleColor(img, ...k.skinSample);
  const body = cached('kidBody_' + name, w, h, (g) => {
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); trace(g, smooth(k.head, true, 6)); g.fill();
    k.armCut.forEach((p) => { g.beginPath(); trace(g, p); g.fill(); });
    g.fillRect(0, 900, w, h);   // abaixo da cintura (fica atrás da mesa)
  });
  const mkHead = (key, coverEyes) => cached(key, w, h, (g) => {
    g.save(); g.beginPath(); trace(g, smooth(k.head, true, 6)); g.clip(); g.drawImage(img, 0, 0); g.restore();
    g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = 'blur(2px)'; g.fillStyle = skin;
    k.patches.forEach(([x, y, rx, ry]) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.fill(); });
    if (coverEyes) k.eyes.forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y - 2, k.eyeR[0] + 16, k.eyeR[1] + 9, k.faceRot, 0, 6.283); g.fill(); });
    g.restore();
  });
  const head = mkHead('kidHead_' + name, true), headArc = mkHead('kidHeadArc_' + name, false);
  return { body, head, headArc, skin, sleeve: sampleColor(img, ...k.sleeveSample), w, h };
}
/** braço: da barra da manga (H) ao cotovelo, antebraço e mão; ângulos em graus (0 = direita, 90 = para baixo) */
function kidArm(g, H, a1, a2, skin, open = 0, side = 1) {
  const r = (d) => d * Math.PI / 180, L1 = 36, L2 = 150;
  const E = [H[0] + Math.cos(r(a1)) * L1, H[1] + Math.sin(r(a1)) * L1], Wr = [E[0] + Math.cos(r(a2)) * L2, E[1] + Math.sin(r(a2)) * L2];
  const shade = 'rgba(150,70,50,0.35)';
  const arm = smooth(limb([H, E, Wr], [34, 31, 25]), true, 4);
  g.beginPath(); trace(g, arm); g.fillStyle = skin; g.fill();
  clipTo(g, arm, () => { g.beginPath(); trace(g, smooth(limb([H, E, Wr], [16, 14, 11]).map((p) => [p[0] + 14 * side, p[1] + 4]), true, 3)); g.fillStyle = shade; g.fill(); });
  // mão: palma, polegar e quatro dedos (abertos = afastados; fechados = dobrados sobre a palma)
  const hx = Wr[0] + Math.cos(r(a2)) * 26, hy = Wr[1] + Math.sin(r(a2)) * 26;
  g.save(); g.translate(hx, hy); g.rotate(r(a2) - Math.PI / 2);
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, 0, 28, 30, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-27 * side, -6 + 6 * open, 10, 19, (-0.5 - 0.5 * open) * side, 0, 6.283); g.fill();
  for (let i = 0; i < 4; i++) { const fx = -15 + i * 10, len = lerp(10, 26, open) - (i === 3 ? 4 : 0), ang = (i - 1.5) * 0.14 * open; g.save(); g.translate(fx, 22); g.rotate(ang); g.beginPath(); g.roundRect(-5.5, -4, 11, len + 6, 5.5); g.fill(); g.restore(); }
  g.fillStyle = shade; g.beginPath(); g.ellipse(8 * side, 4, 15, 20, 0, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(150,70,50,0.45)'; g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-20 + i * 10, 20); g.lineTo(-20 + i * 10, 20 + lerp(6, 18, open)); g.stroke(); }
  g.restore();
  return [hx, hy];
}
/** olhos abertos: íris escura no estilo da referência, brilho duplo, cílio (Lara), piscada pela pálpebra, olhar dirigido */
function kidEyes(g, k, P, p) {
  const [lx, ly] = p.look || [0, 0], blink = clamp(p.blink || 0), sur = p.surprise || 0;
  k.eyes.forEach(([x, y], i) => {
    const side = i === 0 ? -1 : 1, rx = k.eyeR[0] * (1 + 0.08 * sur), ry = k.eyeR[1] * (1 + 0.18 * sur);
    g.save(); g.translate(x, y); g.rotate(k.faceRot);
    const open = 1 - blink;
    if (open > 0.12) {
      g.save(); g.beginPath(); g.rect(-rx - 4, -ry - 4 + 2 * ry * blink, 2 * rx + 8, 2 * ry + 8); g.clip();   // pálpebra desce
      g.fillStyle = '#2E1E18'; g.beginPath(); g.ellipse(lx * 0.9, ly * 0.9, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(90,55,40,0.9)'; g.beginPath(); g.ellipse(lx * 0.9 + 2, ly * 0.9 + ry * 0.35, rx * 0.55, ry * 0.4, 0, 0, 6.283); g.fill();   // reflexo quente embaixo
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(lx * 0.9 - rx * 0.32, ly * 0.9 - ry * 0.36, rx * 0.3, 0, 6.283); g.fill();
      g.beginPath(); g.arc(lx * 0.9 + rx * 0.3, ly * 0.9 + ry * 0.3, rx * 0.12, 0, 6.283); g.fill();
      g.restore();
      // pálpebra superior (pele) e linha dos cílios
      if (blink > 0.02) { g.fillStyle = P.skin; g.beginPath(); g.ellipse(0, -ry - 2 + 2 * ry * blink - ry, rx + 5, ry + 1, 0, 0, 6.283); g.fill(); }
      const ty = -ry + 2 * ry * blink - 2;
      g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-rx * 0.85, ty + 4); g.quadraticCurveTo(0, ty - 4, rx * 0.85, ty + 4); g.stroke();
      if (k.lashes) { g.lineWidth = 4; g.beginPath(); g.moveTo(side * (rx - 1), ty + 2); g.quadraticCurveTo(side * (rx + 7), ty - 2, side * (rx + 12), ty - 9); g.stroke(); }
    } else {
      g.strokeStyle = '#2A1A16'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(-rx - 2, 2); g.quadraticCurveTo(0, 9, rx + 2, 2); g.stroke();
      if (k.lashes) { g.lineWidth = 4; g.beginPath(); g.moveTo(side * (rx + 1), 3); g.lineTo(side * (rx + 10), 0); g.stroke(); }
    }
    g.restore();
  });
}
/** luz da cena num personagem já desenhado (camada com alfa): lado da sombra, luz quente do lado da fonte e luz de recorte na borda.
 *  L = {dir: [dx, dy] de onde vem a luz, key, shade, rim, rimW, rimA}; rect = [x, y, w, h] na tela */
function lightRig(lc, rect, L) {
  if (!L || !rect || rect[2] <= 0) return;
  const g = lc.getContext('2d'), [x, y, w, h] = rect, [dx, dy] = norm(L.dir || [-1, -0.5]), cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = linear(g, cx + dx * R, cy + dy * R, cx - dx * R, cy - dy * R, [[0, L.key || 'rgba(255,226,180,0.22)'], [0.45, 'rgba(0,0,0,0)'], [0.62, 'rgba(0,0,0,0)'], [1, L.shade || 'rgba(60,30,90,0.34)']]);
  g.fillRect(x, y, w, h); g.restore();
  if (L.rim) {
    const rw = L.rimW || 5, [rc, rg] = layer('rimLight');
    rg.drawImage(lc, x, y, w, h, x, y, w, h); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(lc, x, y, w, h, x - dx * rw, y - dy * rw, w, h);
    rg.globalCompositeOperation = 'source-in'; rg.fillStyle = L.rim; rg.fillRect(x, y, w, h);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = L.rimA ?? 0.75; g.drawImage(rc, x, y, w, h, x, y, w, h); g.restore();
  }
}
/** p: {x, y (pescoço na tela), s, t, cutY (tampo da mesa: o tronco some atrás dele), tilt (graus), turn (-1..1: meia-volta da cabeça),
 *  look [dx,dy], blink, happy (olhos fechados de alegria), brow (0..1), mouth (0..1), smile, surprise, lean (graus), armL/armR {a1, a2, open}, light} */
function drawKid(dst, name, p) {
  const k = KID[name], P = kidParts(name), s = p.s, t = p.t || 0, ph = name === 'lara' ? 1.3 : 0;
  const [lc, g] = layer('kid_' + name);
  g.translate(p.x, p.y); g.scale(s, s); g.translate(-k.pivot[0], -k.pivot[1]);
  // corpo inteiro balança pela cintura (peso trocando de lado) e respira (ombros sobem)
  const sway = (p.lean || 0) + 1.1 * Math.sin(t * 1.25 + ph) + 0.5 * Math.sin(t * 2.9 + ph * 2), breath = Math.sin(t * 2.2 + ph);
  g.translate(k.pivot[0], 900); g.rotate(sway * Math.PI / 180); g.translate(-k.pivot[0], -900);
  g.save(); if (p.cutY != null) { g.beginPath(); g.rect(-400, -400, P.w + 800, k.pivot[1] + (p.cutY - p.y) / s + 400); g.clip(); }
  g.translate(k.pivot[0], 900); g.scale(1, 1 + 0.008 * breath); g.translate(-k.pivot[0], -900); g.drawImage(P.body, 0, 0); g.restore();
  // sombra da cabeça no colarinho e no peito
  g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = radial(g, k.pivot[0] + 20, k.pivot[1] + 40, 10, 170, [[0, 'rgba(80,35,45,0.42)'], [1, 'rgba(80,35,45,0)']]); g.beginPath(); g.ellipse(k.pivot[0] + 20, k.pivot[1] + 40, 190, 90, 0, 0, 6.283); g.fill(); g.restore();
  // cabeça: gira no pescoço com atraso em relação ao corpo; "turn" desloca o rosto para dar a ideia de meia-volta
  const turn = clamp(p.turn || 0, -1, 1), lag = 0.6 * (1.1 * Math.sin((t - 0.18) * 1.25 + ph));
  g.save(); g.translate(k.pivot[0], k.pivot[1] - 6 * breath * 0.3); g.rotate(((p.tilt || 0) + lag - sway * 0.4) * Math.PI / 180); g.translate(p.headDx || 0, p.headDy || 0);
  g.scale(1 - 0.05 * Math.abs(turn), 1); g.translate(-k.pivot[0], -k.pivot[1]);
  const happy = clamp(p.happy || 0), useArc = k.eyeStyle === 'arc' && happy > 0.5;
  g.drawImage(useArc ? P.headArc : P.head, 0, 0);
  g.translate(turn * 12, 0);
  if (!useArc) {
    if (k.eyeStyle === 'oval' && happy > 0.5) k.eyes.forEach(([x, y]) => inkLine(g, [[x - 18, y + 6], [x, y - 8], [x + 18, y + 6]], { line: '#2E1E18', lw: 7, wob: 0 }));
    else kidEyes(g, k, P, p);
  }
  // sobrancelhas
  if (k.brows) k.brows.forEach((b) => { const up = -(p.brow || 0) * 12; inkLine(g, b.map(([x, y], j) => [x, y + up - (j === 1 ? (p.brow || 0) * 4 : 0)]), { line: '#3A2418', lw: k.browW, wob: 0 }); });
  // boca: sorriso fechado <-> aberta (dentes em cima), no formato da referência
  const [mx, my] = k.mouth, mw = k.mouthW, op = clamp(p.mouth || 0), sm_ = p.smile ?? 1;
  if (op < 0.08) inkLine(g, [[mx - mw * 0.42, my - 6 * sm_], [mx, my + 6 * sm_], [mx + mw * 0.42, my - 6 * sm_]], { line: '#5A2A22', lw: 6, wob: 0 });
  else {
    const hgt = 8 + 30 * op, ww = mw * (0.5 + 0.35 * sm_) * (1 - 0.25 * (p.surprise || 0) * op);
    g.fillStyle = '#6A2A2E'; g.beginPath(); g.moveTo(mx - ww / 2, my - 8); g.quadraticCurveTo(mx, my - 12, mx + ww / 2, my - 8); g.quadraticCurveTo(mx + ww * 0.45, my - 8 + hgt, mx, my - 6 + hgt * 1.05); g.quadraticCurveTo(mx - ww * 0.45, my - 8 + hgt, mx - ww / 2, my - 8); g.fill();
    g.save(); g.clip(); g.fillStyle = '#FFFFFF'; g.fillRect(mx - ww / 2, my - 14, ww, 11); g.fillStyle = '#D9707A'; g.beginPath(); g.ellipse(mx, my - 6 + hgt, ww * 0.3, 9, 0, 0, 6.283); g.fill(); g.restore();
  }
  // bochechas coradas quando sorri
  if (sm_ > 0.6) { g.fillStyle = 'rgba(230,110,100,0.18)'; k.eyes.forEach(([x, y], i) => { g.beginPath(); g.ellipse(x + (i ? 18 : -18), y + 46, 26, 14, 0, 0, 6.283); g.fill(); }); }
  g.restore();
  // braços (na frente do tronco)
  const hands = [];
  [[p.armL, k.hems[0], 1], [p.armR, k.hems[1], -1]].forEach(([a, H, side]) => { if (a) hands.push(kidArm(g, H, a.a1, a.a2, P.skin, a.open || 0, side)); });
  const M = g.getTransform(); const toScreen = ([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  // acabamento pintado + luz da cena
  const r = painterize(lc, [s, 0, 0, s, p.x - k.pivot[0] * s, p.y - k.pivot[1] * s], [150, 100, 800, 1100], { seed: name.length * 5, tex: 0.45, edge: 0.5, edgeBlur: 2 });
  lightRig(lc, r, p.light || { dir: [-1, -0.45], key: 'rgba(255,222,170,0.3)', shade: 'rgba(70,35,95,0.42)', rim: 'rgba(255,236,196,1)', rimW: 6 * s + 2, rimA: 0.8 });
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]); dst.restore();
  return hands.map(toScreen);
}
