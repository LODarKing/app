// Cena 05 — Olhos preparados para a penumbra (requisito 3: semelhanças dos olhos).
// Da pupila para o Pingo de tocaia ao entardecer -> Miguel pergunta -> olhos para a frente -> visão binocular -> pupilas ->
// tapetum lucidum (camada refletora) -> visão humana x ilustração da visão do gato (sem prometer visão no escuro total) -> Lara -> bote.
'use strict';
(() => {
  const DUSK = (t) => clamp((t - P.dusk) / 4);   // 0 = fim de tarde, 1 = penumbra
  const garden = () => cachedPainted('s05garden', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, 1100, [[0, '#6E5A8E'], [0.45, '#C9789A'], [0.8, '#F2A57E'], [1, '#F8C98E']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFE2B0'; g.beginPath(); g.arc(760, 900, 90, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,235,220,0.45)'; [[200, 300, 200], [700, 220, 260]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r * 0.18, 0, 0, 6.283); g.fill(); });
    for (let i = 0; i < 8; i++) { const x = i * 150 + rnd(91, i) * 60, y = 800 + rnd(92, i) * 120; g.fillStyle = '#4E3E5E'; g.fillRect(x - 12, y, 24, 300); canopy(g, x, y, 130 + rnd(97, i) * 60, '#5A4A6A', '#4A3A5A', 900 + i, 0.01); }
    // casa com janela acesa e cerca
    g.fillStyle = '#5E4A5A'; g.fillRect(-20, 760, 330, 420); g.fillStyle = '#4A3A4E'; g.beginPath(); g.moveTo(-40, 780); g.lineTo(150, 620); g.lineTo(340, 780); g.fill();
    g.fillStyle = '#FFD58A'; g.fillRect(60, 860, 150, 130); g.fillStyle = '#5E4A5A'; g.fillRect(130, 860, 10, 130); g.fillRect(60, 920, 150, 8);
    g.fillStyle = '#8A6A6E'; g.fillRect(0, 1040, w, 18); for (let x = 10; x < w; x += 54) { g.fillStyle = '#9A7A7A'; g.beginPath(); g.moveTo(x, 1150); g.lineTo(x, 1000); g.lineTo(x + 18, 980); g.lineTo(x + 36, 1000); g.lineTo(x + 36, 1150); g.fill(); }
    g.fillStyle = linear(g, 0, 1120, 0, h, [[0, '#7A8A62'], [1, '#4E5E46']]); g.fillRect(0, 1120, w, h);
    for (let i = 0; i < 30; i++) leafShape(g, rnd(93, i) * w, 1150 + rnd(94, i) * 760, 130 + rnd(95, i) * 80, 36, -Math.PI / 2 + (rnd(96, i) - 0.5) * 1.6, i % 2 ? '#7E9A6A' : '#6A8A5E', '#56724E', 0.01, 950 + i);
    for (let i = 0; i < 16; i++) { const x = rnd(98, i) * w, y = 1180 + rnd(99, i) * 700; g.fillStyle = i % 3 ? '#F2C2D0' : '#F7E1A0'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + Math.cos(k * 1.26) * 12, y + Math.sin(k * 1.26) * 12, 10, 7, k * 1.26, 0, 6.283); g.fill(); } g.fillStyle = '#E2A23A'; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill(); }
  }, 20, 0.55);
  /** ratinho de feltro (brinquedo), com rabo de barbante */
  function toyMouse(ctx, x, y, s, t, wig = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#C8A06E'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, 10); ctx.bezierCurveTo(-120, 0 + wig * 10, -140, 40, -190, 30 + Math.sin(t * 3) * 10); ctx.stroke();
    flat(ctx, [[-80, 20], [-60, -26], [0, -40], [60, -20], [90, 6], [60, 24], [-40, 30]], '#9A8E9E', 5);
    flat(ctx, ell(28, -36, 18, 16, 8), '#B8A9BA', 5); ctx.fillStyle = '#E8A0A8'; ctx.beginPath(); ctx.ellipse(28, -36, 9, 8, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2A2028'; ctx.beginPath(); ctx.arc(62, -8, 5, 0, 6.283); ctx.fill(); ctx.fillStyle = '#E8A0A8'; ctx.beginPath(); ctx.arc(92, 4, 6, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function dimmer(ctx, d) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(${lerp(255, 70, d) | 0},${lerp(240, 64, d) | 0},${lerp(250, 120, d) | 0},1)`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  function shotStalk(ctx, t) {
    const td = on2s(t), d = DUSK(t), zk = 1 - sm(t / 1.2), z = lerp(1, 7, zk * zk);
    const vx = lerp(540, 330 - 0.74 * 57, zk), vy = lerp(960, 1460 - 0.74 * 456, zk); ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-vx, -vy);
    ctx.drawImage(garden(), 0, 0);
    toyMouse(ctx, 800, 1420, 0.9, t, Math.sin(t * 6));
    for (let i = 0; i < 5; i++) leafShape(ctx, 700 + i * 70, 1540, 130, 40, -Math.PI / 2 - 0.5 + i * 0.25 + 0.05 * Math.sin(t * 1.6 + i), '#5E7E5A', '#4A6A4A', 0.01, 980 + i);
    drawPingo(ctx, tp(ctx, { x: 330, y: 1460, s: 0.74, crouch: 0.75, dilate: lerp(0.35, 0.95, d), look: [9, 4], tail: td * 1.6, earL: -6, earR: -6, wiggle: 0.2 * Math.sin(td * 9) * ss((td - 1.2) / 0.5), blink: blinkAt(td, [1.8]) }));
    ctx.restore();
    dimmer(ctx, d * 0.8);
    sunRays(ctx, t, { x: 900, y: -60, ang: 0.35, len: 1700, n: 3, width: 120, color: '255,200,150', alpha: 0.18 * (1 - d) });
    motes(ctx, t, [0, 300, W, 1200], { n: 14, seed: 23, alpha: 0.5 * (1 - d) });
  }
  function shotMiguel(ctx, t) {
    const td = on2s(t), d = DUSK(t), tb = talkBeats('miguel', t + SCENE_T0);
    ctx.save(); ctx.translate(-200, -280); ctx.scale(1.3, 1.3); ctx.drawImage(garden(), 0, 0); ctx.restore();
    drawPerson(ctx, 'miguel', { x: 560, y: 1080, s: 1.0, t: td, lean: -5, tilt: -8 + 2 * tb.nod, look: [-8, 6], turn: -0.3, mouth: voiceL('miguel', t) * 0.8, smile: 0.4, brow: 0.5 + 0.4 * tb.brow, blink: blinkAt(td, [P.miguel + 1.6]), armL: { a1: 140, a2: 210, open: 0.3 }, armR: { a1: 60, a2: 100, open: 0.5 },
      light: { dir: [1, -0.2], key: 'rgba(255,200,150,0.35)', shade: 'rgba(40,30,90,0.5)', rim: 'rgba(255,210,170,1)', rimW: 8, rimA: 0.9 } });
    for (let i = 0; i < 7; i++) leafShape(ctx, -40 + i * 40, 1700 - i * 30, 420, 100, -0.9 + i * 0.12 + 0.04 * Math.sin(t * 1.3 + i), '#4A6650', '#3A5440', 0.01, 1000 + i);
    dimmer(ctx, d * 0.7);
  }
  // close no rosto do Pingo: olhos voltados para a frente
  function shotFace(ctx, t) {
    const td = on2s(t), k = sm((t - P.face) / 0.5);
    ctx.fillStyle = '#3A3450'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(garden(), 0, -300); ctx.restore(); dimmer(ctx, 0.75);
    const [lc, g] = layer('pface'); g.translate(540, 1080); g.scale(2.4, 2.4); pingoHead(g, { dilate: 0.85, blink: blinkAt(td, [P.face + 2.4]), look: [0, 0] }, 1.4); g.setTransform(1, 0, 0, 1, 0, 0);
    painterize(lc, [2.4, 0, 0, 2.4, 540, 1080], [-240, -260, 240, 140], { seed: 31, tex: 0.7, edge: 0.4, edgeBlur: 4 });
    ctx.drawImage(lc, 0, 0);
    // setas: os dois olhos apontam para a frente
    [-1, 1].forEach((sd) => { const x = 540 + sd * 137, y = 1032, L = 420 * k; ctx.save(); ctx.strokeStyle = ACCENT; ctx.fillStyle = ACCENT; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 130); ctx.lineTo(x + sd * 30, y - 130 - L); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + sd * 30 - 26, y - 120 - L); ctx.lineTo(x + sd * 30, y - 160 - L); ctx.lineTo(x + sd * 30 + 26, y - 120 - L); ctx.fill(); ctx.restore(); });
  }
  // visão binocular vista de cima
  function shotBinoc(ctx, t) {
    const k = sm((t - P.binoc) / 0.6), pk = clamp((t - P.binoc - 1.6) / 0.8);
    ctx.fillStyle = '#EFE4D4'; ctx.fillRect(0, 0, W, H);
    const cx = 540, cy = 1150;
    [-1, 1].forEach((sd) => { ctx.save(); ctx.fillStyle = sd < 0 ? 'rgba(90,167,224,0.28)' : 'rgba(232,151,90,0.28)'; ctx.beginPath(); ctx.moveTo(cx + sd * 50, cy - 80); const a0 = -Math.PI / 2 + sd * 0.15 - 0.62 * k, a1 = -Math.PI / 2 + sd * 0.15 + 0.62 * k; ctx.arc(cx + sd * 50, cy - 80, 900, a0, a1); ctx.closePath(); ctx.fill(); ctx.restore(); });
    ctx.save(); ctx.beginPath(); ctx.moveTo(cx - 50, cy - 80); ctx.arc(cx - 50, cy - 80, 900, -Math.PI / 2 - 0.15 - 0.62 * k, -Math.PI / 2 - 0.15 + 0.62 * k); ctx.closePath(); ctx.clip(); ctx.fillStyle = `rgba(242,180,81,${0.55 * k})`; ctx.beginPath(); ctx.moveTo(cx + 50, cy - 80); ctx.arc(cx + 50, cy - 80, 900, -Math.PI / 2 + 0.15 - 0.62 * k, -Math.PI / 2 + 0.15 + 0.62 * k); ctx.closePath(); ctx.fill(); ctx.restore();
    // cabeça do Pingo vista de cima (orelhas, focinho)
    flat(ctx, [[cx - 120, cy + 60], [cx - 140, cy - 40], [cx - 90, cy - 120], [cx, cy - 150], [cx + 90, cy - 120], [cx + 140, cy - 40], [cx + 120, cy + 60], [cx, cy + 110]], PG.fur, 6);
    [-1, 1].forEach((sd) => { flat(ctx, [[cx + sd * 70, cy - 60], [cx + sd * 150, cy - 10], [cx + sd * 110, cy - 110]], PG.shade, 3); ctx.fillStyle = PG.iris; ctx.beginPath(); ctx.ellipse(cx + sd * 50, cy - 95, 24, 14, sd * 0.2, 0, 6.283); ctx.fill(); });
    flat(ctx, ell(cx, cy - 160, 40, 28, 10), PG.white, 4);
    // o brinquedo à distância e a régua de distância
    toyMouse(ctx, cx + 30, 560, 0.7, t);
    if (pk > 0) { ctx.save(); ctx.strokeStyle = PLUM; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(cx + 250, cy - 120); ctx.lineTo(cx + 250, cy - 120 - 660 * pk); ctx.stroke(); ctx.restore(); }
  }
  // pupilas: fenda na luz forte, redonda na penumbra
  function shotPupils(ctx, t) {
    const td = on2s(t), dk = keys(td, [[P.pupils, 0], [P.pupils + 0.6, 0], [P.pupils + 1.2, 1]]), dil = lerp(0.04, 1, dk);
    ctx.fillStyle = `rgb(${lerp(244, 40, dk) | 0},${lerp(214, 36, dk) | 0},${lerp(170, 70, dk) | 0})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 900); ctx.scale(6.2, 6.2); catEye(ctx, 60, 56, { dilate: dil, lw: 0.6, seed: 41 }); ctx.restore();
    // sol -> lua
    ctx.save(); ctx.translate(540, 260); ctx.fillStyle = ACCENT; ctx.globalAlpha = 1 - dk; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 6.283); ctx.fill(); for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * 0.785); ctx.fillRect(76, -6, 30, 12); ctx.restore(); }
    ctx.globalAlpha = dk; ctx.fillStyle = '#F2EAD8'; ctx.beginPath(); ctx.arc(0, 0, 56, 0, 6.283); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(26, -16, 50, 0, 6.283); ctx.fill(); ctx.restore();
  }
  // tapetum lucidum: corte do olho, a luz atravessa a retina, bate na camada refletora e volta
  function shotTapetum(ctx, t) {
    const td = on2s(t), k = clamp((t - P.tapetum - 0.3) / 1.6);
    ctx.fillStyle = '#2E2A44'; ctx.fillRect(0, 0, W, H);
    const cx = 560, cy = 880, R = 330;
    ctx.fillStyle = '#F2ECE4'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();                                   // globo
    ctx.fillStyle = '#C9D9E4'; ctx.beginPath(); ctx.ellipse(cx - R + 20, cy, 60, 170, 0, 0, 6.283); ctx.fill();          // córnea
    ctx.fillStyle = PG.iris; ctx.fillRect(cx - R + 36, cy - 190, 26, 120); ctx.fillRect(cx - R + 36, cy + 70, 26, 120);  // íris
    ctx.fillStyle = '#E8D9A8'; ctx.beginPath(); ctx.ellipse(cx - R + 110, cy, 60, 110, 0, 0, 6.283); ctx.fill();         // cristalino
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, -1.05, 1.05); ctx.arc(cx, cy, R - 70, 1.05, -1.05, true); ctx.closePath(); ctx.fillStyle = '#C66A86'; ctx.fill(); ctx.restore();   // retina
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R + 4, -0.95, 0.95); ctx.arc(cx, cy, R - 28, 0.95, -0.95, true); ctx.closePath(); ctx.fillStyle = linear(ctx, cx + R - 30, cy - 200, cx + R, cy + 200, [[0, '#F7D774'], [0.5, '#BEE38A'], [1, '#F2B451']]); ctx.fill(); ctx.restore();   // tapetum
    // raio de luz: entra, atravessa, reflete e volta pela retina (segunda chance)
    const ray = (x0, y0, x1, y1, kk, col) => { if (kk <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, kk), lerp(y0, y1, kk)); ctx.stroke(); ctx.restore(); };
    ray(-40, cy - 120, cx + R - 30, cy + 40, clamp(k * 2), 'rgba(255,240,180,0.95)');
    ray(cx + R - 30, cy + 40, cx - 60, cy + 210, clamp(k * 2 - 1), 'rgba(190,230,140,0.95)');
    if (k > 0.5) { const f = Math.floor(t * 12); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(200,240,150,${0.35 + 0.2 * rnd(f, 3)})`; ctx.beginPath(); ctx.arc(cx + R - 20, cy + 40, 50, 0, 6.283); ctx.fill(); ctx.restore(); }
  }
  // tela dividida: visão humana x ilustração da visão do gato na penumbra
  function shotSplit(ctx, t) {
    const k = sm((t - P.split) / 0.5);
    const [sc, sg] = layer('scene5'); sg.drawImage(garden(), -60, -420); toyMouse(sg, 640, 1060, 1.3, t);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 960); ctx.clip(); ctx.drawImage(sc, 0, -240); ctx.fillStyle = 'rgba(8,8,24,0.9)'; ctx.fillRect(0, 0, W, 960); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 960, W, 960); ctx.clip(); ctx.filter = 'blur(2.5px) saturate(0.4) brightness(1.3)'; ctx.drawImage(sc, 0, 720); ctx.filter = 'none'; ctx.fillStyle = 'rgba(40,50,80,0.12)'; ctx.fillRect(0, 960, W, 960); ctx.restore();
    ctx.fillStyle = CREAM; ctx.fillRect(0, 952, W * k, 16);
  }
  function shotLara(ctx, t) {
    const td = on2s(t), tb = talkBeats('lara', t + SCENE_T0);
    ctx.save(); ctx.translate(-240, -300); ctx.scale(1.35, 1.35); ctx.drawImage(garden(), 0, 0); ctx.restore();
    dimmer(ctx, 0.55);
    // olhos do Pingo brilhando ao fundo (reflexo do tapetum), entre as folhas
    [-1, 1].forEach((sd) => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(190,240,120,0.85)'; ctx.beginPath(); ctx.ellipse(860 + sd * 28, 760, 14, 10, 0, 0, 6.283); ctx.fill(); ctx.restore(); });
    drawPerson(ctx, 'lara', { x: 430, y: 1080, s: 1.0, t: td, mouth: voiceL('lara', t), smile: 1, look: [7, -3], turn: 0.3, tilt: 3 + 3 * tb.nod, brow: tb.brow, happy: bell(td, P.lara + 3.2, 0.3) > 0.5 ? 1 : 0, blink: blinkAt(td, [P.lara + 1.2]), armR: { a1: lerp(84, 40, ss((td - P.lara - 1.6) / 0.4)), a2: lerp(100, -30, ss((td - P.lara - 1.6) / 0.4)), open: 1 },
      light: { dir: [1, -0.3], key: 'rgba(255,200,150,0.3)', shade: 'rgba(40,30,90,0.45)', rim: 'rgba(255,210,170,1)', rimW: 8, rimA: 0.85 } });
  }
  function shotPounce(ctx, t) {
    const td = on2s(t), k = clamp((td - P.pounce) / 0.6), z = lerp(1, 2.4, sm((t - P.pounce - 0.6) / 0.9));
    const fz = sm((t - P.pounce - 0.6) / 0.9); ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-lerp(540, 760, fz), -lerp(960, 1300, fz));
    ctx.drawImage(garden(), 0, 0); dimmer(ctx, 0.5);
    if (k < 1) toyMouse(ctx, 800, 1420, 0.9, t);
    if (k < 1) drawPingoLeap(ctx, tp(ctx, { x: lerp(330, 780, k), y: lerp(1300, 1300, k) - 300 * Math.sin(Math.PI * k), s: 0.6, dilate: 1 }));
    else { drawPingo(ctx, tp(ctx, { x: 760, y: 1460, s: 0.78, crouch: 0.4, dilate: 1, look: [0, 8], tail: td, meow: 0.2 })); ctx.save(); ctx.translate(770, 1185); ctx.rotate(0.5); toyMouse(ctx, 0, 0, 0.42, t); ctx.restore(); }
    ctx.restore();
  }
  function draw(ctx, t) {
    if (t < P.miguel) shotStalk(ctx, t);
    else if (t < P.face) shotMiguel(ctx, t);
    else if (t < P.binoc) shotFace(ctx, t);
    else if (t < P.pupils) shotBinoc(ctx, t);
    else if (t < P.tapetum) shotPupils(ctx, t);
    else if (t < P.split) shotTapetum(ctx, t);
    else if (t < P.lara) shotSplit(ctx, t);
    else if (t < P.pounce) shotLara(ctx, t);
    else shotPounce(ctx, t);
    vignette(ctx, '20,15,40', 0.35);
  }
  function ui(ctx, t) {
    if (t >= P.face && t < P.binoc) uiCard(ctx, t, P.face + 0.8, P.binoc - 0.1, 'olhos voltados para a frente', 540, 300, { size: 46, accent: true });
    if (t >= P.binoc && t < P.pupils) { uiCard(ctx, t, P.binoc + 0.7, P.pupils - 0.1, 'visão binocular', 540, 300, { size: 54, accent: true }); uiCard(ctx, t, P.binoc + 1.8, P.pupils - 0.1, 'profundidade e distância', 750, 940, { size: 38 }); }
    if (t >= P.pupils && t < P.tapetum) { const dk = clamp((t - P.pupils - 0.6) / 0.6); uiCard(ctx, t, P.pupils + 0.2, P.tapetum - 0.1, dk > 0.5 ? 'pouca luz: pupila redonda' : 'muita luz: pupila em fenda', 540, 1260, { size: 44, accent: dk > 0.5 }); }
    if (t >= P.tapetum && t < P.split) { uiCard(ctx, t, P.tapetum + 0.4, P.split - 0.1, 'tapetum lucidum', 540, 300, { size: 58, accent: true }); uiCard(ctx, t, P.tapetum + 1.2, P.split - 0.1, 'camada refletora', 540, 420, { size: 40 }); }
    if (t >= P.split && t < P.lara) { uiCard(ctx, t, P.split + 0.4, P.lara - 0.1, 'pessoa', 200, 140 + 60, { size: 40 }); uiCard(ctx, t, P.split + 0.7, P.lara - 0.1, 'gato (ilustração)', 300, 1060, { size: 40, accent: true }); uiCard(ctx, t, P.split + 1.2, P.lara - 0.1, 'enxerga melhor com pouca luz — não no escuro total', 540, 1520 - 100, { size: 30 }); }
  }
  const sfx = (E) => [['NHAC!', E.pounce + 0.55, 0.5, 560, 600, 170, 0.1]];
  CENAS.s05 = { draw, ui, sfx, capY: (t) => (t >= P.pupils && t < P.tapetum ? 1450 : t >= P.split && t < P.lara ? 760 : 1390) };
})();
