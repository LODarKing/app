// Lara e Miguel: bonecos de recorte feitos das folhas de referência do usuário (assets/ref_*.png, 941x1672).
// Cabeça e tronco são as próprias imagens (rosto e uniforme fiéis); boca, olhos, sobrancelhas e braços são redesenhados
// por cima, animáveis, nas cores amostradas da referência. Coordenadas abaixo = pixels da imagem de referência.
'use strict';
const KID = {
  miguel: {
    img: 'refMiguel',
    head: [[345, 330], [352, 240], [385, 170], [450, 126], [530, 126], [602, 158], [630, 230], [624, 300], [614, 345], [614, 402], [588, 418], [556, 442], [497, 457], [440, 444], [398, 406], [350, 396]],
    pivot: [495, 452],
    eyes: [[445, 335], [547, 347]], eyeR: [15, 18], eyeStyle: 'oval',
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
    eyes: [[415, 352], [515, 382]], eyeR: [17, 19], eyeStyle: 'arc',
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
  const head = cached('kidHead_' + name, w, h, (g) => {
    g.save(); g.beginPath(); trace(g, smooth(k.head, true, 6)); g.clip(); g.drawImage(img, 0, 0); g.restore();
    g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = 'blur(2px)'; g.fillStyle = skin;
    k.patches.forEach(([x, y, rx, ry]) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.fill(); });
    if (k.eyeStyle === 'oval') k.eyes.forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, k.eyeR[0] + 5, k.eyeR[1] + 5, 0, 0, 6.283); g.fill(); });
    g.restore();
  });
  return { body, head, skin, sleeve: sampleColor(img, ...k.sleeveSample), w, h };
}
/** braço: da barra da manga (H) ao cotovelo, antebraço e mão; ângulos em graus (0 = direita, 90 = para baixo) */
function kidArm(g, H, a1, a2, skin, open = 0, side = 1) {
  const r = (d) => d * Math.PI / 180, L1 = 36, L2 = 150;
  const E = [H[0] + Math.cos(r(a1)) * L1, H[1] + Math.sin(r(a1)) * L1], Wr = [E[0] + Math.cos(r(a2)) * L2, E[1] + Math.sin(r(a2)) * L2];
  const shade = 'rgba(150,70,50,0.35)';
  const arm = smooth(limb([H, E, Wr], [34, 31, 25]), true, 4);
  g.beginPath(); trace(g, arm); g.fillStyle = skin; g.fill();
  clipTo(g, arm, () => { g.beginPath(); trace(g, smooth(limb([H, E, Wr], [16, 14, 11]).map((p) => [p[0] + 14 * side, p[1] + 4]), true, 3)); g.fillStyle = shade; g.fill(); });
  // mão: palma + polegar; aberta = dedos separados
  const hx = Wr[0] + Math.cos(r(a2)) * 26, hy = Wr[1] + Math.sin(r(a2)) * 26;
  g.save(); g.translate(hx, hy); g.rotate(r(a2) - Math.PI / 2);
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, 0, 30, 34, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-26 * side, -8, 11, 20, -0.5 * side, 0, 6.283); g.fill();
  if (open > 0.05) for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(-15 + i * 10, 30 + 10 * open, 6, 16 + 8 * open, (i - 1.5) * 0.12 * open, 0, 6.283); g.fill(); }
  g.fillStyle = shade; g.beginPath(); g.ellipse(8 * side, 6, 16, 22, 0, 0, 6.283); g.fill();
  g.restore();
  return [hx, hy];
}
/** p: {x, y (pescoço na tela), s, cutY (tampo da mesa na tela: o tronco some atrás dele), tilt (graus), look [dx,dy], blink, brow (0..1), mouth (0..1), smile, surprise, armL/armR {a1, a2, open}} */
function drawKid(dst, name, p) {
  const k = KID[name], P = kidParts(name), s = p.s;
  const [lc, g] = layer('kid_' + name);
  g.translate(p.x, p.y); g.scale(s, s); g.translate(-k.pivot[0], -k.pivot[1]);
  // respiração leve
  const br = 1 + 0.008 * Math.sin((p.t || 0) * 2.2 + (name === 'lara' ? 1 : 0));
  g.save(); if (p.cutY != null) { g.beginPath(); g.rect(0, 0, P.w, k.pivot[1] + (p.cutY - p.y) / s); g.clip(); } g.translate(k.pivot[0], 900); g.scale(1, br); g.translate(-k.pivot[0], -900); g.drawImage(P.body, 0, 0); g.restore();
  // cabeça (gira no pescoço)
  g.save(); g.translate(k.pivot[0], k.pivot[1]); g.rotate((p.tilt || 0) * Math.PI / 180); g.translate(p.headDx || 0, p.headDy || 0); g.translate(-k.pivot[0], -k.pivot[1]);
  g.drawImage(P.head, 0, 0);
  const [lx, ly] = p.look || [0, 0];
  // olhos
  k.eyes.forEach(([x, y], i) => {
    const blink = clamp(p.blink || 0);
    if (k.eyeStyle === 'oval' || p.surprise > 0.3) {
      if (k.eyeStyle === 'arc') { g.fillStyle = P.skin; g.beginPath(); g.ellipse(x, y, 30, 24, 0, 0, 6.283); g.fill(); }
      const ry = k.eyeR[1] * (1 - blink) * (1 + 0.2 * (p.surprise || 0));
      if (ry > 1) { g.fillStyle = '#2E1E18'; g.beginPath(); g.ellipse(x + lx, y + ly, k.eyeR[0] * (1 + 0.1 * (p.surprise || 0)), ry, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(x + lx - 5, y + ly - 6, 4, 0, 6.283); g.fill(); }
      if (blink > 0.1) inkLine(g, [[x - 16, y + 2], [x, y + 6], [x + 16, y + 2]], { line: '#2E1E18', lw: 5, wob: 0 });
    }
  });
  // sobrancelhas
  if (k.brows) k.brows.forEach((b, i) => { const up = -(p.brow || 0) * 12; inkLine(g, b.map(([x, y], j) => [x, y + up - (j === 1 ? (p.brow || 0) * 4 : 0)]), { line: '#3A2418', lw: k.browW, wob: 0 }); });
  // boca: sorriso fechado <-> aberta (dentes em cima), no formato da referência
  const [mx, my] = k.mouth, mw = k.mouthW, op = clamp(p.mouth || 0), sm_ = p.smile ?? 1;
  if (op < 0.08) inkLine(g, [[mx - mw * 0.42, my - 6 * sm_], [mx, my + 6 * sm_], [mx + mw * 0.42, my - 6 * sm_]], { line: '#5A2A22', lw: 6, wob: 0 });
  else {
    const hgt = 8 + 30 * op, ww = mw * (0.5 + 0.35 * sm_) * (1 - 0.25 * (p.surprise || 0) * op);
    g.fillStyle = '#6A2A2E'; g.beginPath(); g.moveTo(mx - ww / 2, my - 8); g.quadraticCurveTo(mx, my - 12, mx + ww / 2, my - 8); g.quadraticCurveTo(mx + ww * 0.45, my - 8 + hgt, mx, my - 6 + hgt * 1.05); g.quadraticCurveTo(mx - ww * 0.45, my - 8 + hgt, mx - ww / 2, my - 8); g.fill();
    g.save(); g.clip(); g.fillStyle = '#FFFFFF'; g.fillRect(mx - ww / 2, my - 14, ww, 11); g.fillStyle = '#D9707A'; g.beginPath(); g.ellipse(mx, my - 6 + hgt, ww * 0.3, 9, 0, 0, 6.283); g.fill(); g.restore();
  }
  g.restore();
  // braços (na frente do tronco)
  const hands = [];
  [[p.armL, k.hems[0], 1], [p.armR, k.hems[1], -1]].forEach(([a, H, side]) => { if (a) hands.push(kidArm(g, H, a.a1, a.a2, P.skin, a.open || 0, side)); });
  // acabamento pintado (mesmo da série)
  painterize(lc, [s, 0, 0, s, p.x - k.pivot[0] * s, p.y - k.pivot[1] * s], [150, 100, 800, 1100], { seed: name.length * 5, tex: 0.45, edge: 0.5, edgeBlur: 2 });
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, 0, 0); dst.restore();
  return hands.map(([x, y]) => [p.x + (x - k.pivot[0]) * s, p.y + (y - k.pivot[1]) * s]);
}
