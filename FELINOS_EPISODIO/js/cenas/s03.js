// Cena 03 — Uma família extraordinária (requisito 1: classificação e características).
// Árvore ilustrada com silhuetas -> diagrama da família Felidae -> desfile em escala -> características no Pingo -> Lara e a borboleta.
'use strict';
(() => {
  const SIL = { dark: 'rgba(59,42,69,0.92)', rim: '#FFD9A6', rimDx: -5, rimDy: -5 };
  /** fundo de página ilustrada (pergaminho dourado-lilás), em cache */
  const paperBg = () => cachedPainted('s03paper', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#B9A3C9'], [0.45, '#EBC9A8'], [1, '#D9B48E']]); g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,245,225,0.35)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(rnd(3, i) * w, rnd(4, i) * h, 160 + rnd(5, i) * 200, 60 + rnd(6, i) * 80, rnd(7, i), 0, 6.283); g.fill(); }
  }, 13, 0.45);
  /** a grande árvore (tronco + galhos + copas), pintada em cache */
  const BR = [[-1, 1180, 300], [1, 1180, 310], [-1, 930, 260], [1, 930, 250], [-1, 690, 190], [1, 690, 200], [1, 1330, 170]];
  const tree = () => cachedPainted('s03tree', 1080, 1920, (g) => {
    const bark = '#6E4A4E', barkS = '#553840', barkL = '#8A6260';
    g.fillStyle = bark; g.beginPath(); trace(g, smooth([[470, 1920], [490, 1500], [500, 1100], [515, 700], [540, 520], [565, 700], [580, 1100], [590, 1500], [620, 1920]], true, 6)); g.fill();
    g.fillStyle = barkS; g.beginPath(); trace(g, smooth([[560, 1920], [570, 1400], [560, 900], [548, 600], [575, 900], [590, 1400], [620, 1920]], true, 4)); g.fill();
    BR.forEach(([sd, y, L], i) => { const x0 = 540 + sd * 30, x1 = 540 + sd * L * 1.25; g.fillStyle = i % 2 ? barkS : bark; g.beginPath(); trace(g, smooth([[x0, y - 34], [lerp(x0, x1, 0.5), y - 30 - 10], [x1, y - 14], [x1 + sd * 20, y - 4], [x1, y + 6], [lerp(x0, x1, 0.5), y + 6], [x0, y + 20]], true, 4)); g.fill(); g.fillStyle = barkL; g.fillRect(Math.min(x0, x1), y - 30, Math.abs(x1 - x0), 6); });
    const crowns = [[540, 420, 330], [250, 560, 220], [830, 560, 230], [160, 820, 170], [920, 800, 170], [380, 300, 200], [700, 290, 210]];
    crowns.forEach(([x, y, r], i) => canopy(g, x, y, r, i % 2 ? '#7E9C82' : '#8DAA86', '#5F7A6E', 300 + i, 0.01));
  }, 14, 0.7);
  // silhuetas nos galhos -> anel do diagrama
  const FAM = [['cheetah', 0.3, 0, false], ['tiger', 0.3, 1, true], ['lion', 0.28, 2, false], ['jaguar', 0.29, 3, true], ['ocelot', 0.3, 4, false], ['leopard', 0.3, 5, true]];
  const treeSpot = (i) => { const [sd, y, L] = BR[i]; return [540 + sd * L * 0.85 - sd * 80, y - 14]; };
  const ringSpot = (i) => { const a = -Math.PI / 2 + (i + 0.5) / 6 * Math.PI * 2; return [540 + Math.cos(a) * 330 - 30, 900 + Math.sin(a) * 300 + 80]; };
  function shotTree(ctx, t) {
    const td = on2s(t), k = sm((t - P.reorg) / 1.2), z = 1 + 0.06 * clamp(t / 4.5), fy = lerp(1400, 980, sm(t / 4)), cx = 540, cy = 960;
    ctx.drawImage(paperBg(), 0, 0);
    sunRays(ctx, t, { x: 700, y: -100, ang: -0.25, len: 1900, n: 4, width: 120, alpha: 0.14 });
    ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-540, -fy);
    ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(540, 1920); ctx.rotate(0.006 * Math.sin(t * 0.9)); ctx.translate(-540, -1920); ctx.drawImage(tree(), 0, 0); ctx.restore(); ctx.globalAlpha = 1;
    const M = ctx.getTransform(), toS = ([x, y]) => [M.a * x + M.e, M.d * y + M.f];
    // ramos do diagrama (aparecem com a reorganização)
    if (k > 0.02) { ctx.save(); ctx.strokeStyle = '#7A3E52'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.globalAlpha = k; FAM.forEach((_, i) => { const [x, y] = ringSpot(i); ctx.beginPath(); ctx.moveTo(540, 900); ctx.quadraticCurveTo(lerp(540, x, 0.5), lerp(900, y, 0.2), lerp(540, x + 30, 0.86 * k), lerp(900, y - 60, 0.86 * k)); ctx.stroke(); }); ctx.beginPath(); ctx.arc(540, 900, 200 * k, 0, 6.283); ctx.fillStyle = 'rgba(246,238,228,0.85)'; ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    FAM.forEach(([kind, s, i, fl]) => { const a = treeSpot(i), b = ringSpot(i), w = [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - 120 * Math.sin(Math.PI * k)], [x, y] = toS(w); drawBigCat(ctx, kind, { x, y, s: s * M.a * (1 + 0.25 * k), flip: fl, walk: 0, moving: 0, tail: td + i, headRot: 3 * Math.sin(td + i) }, td, SIL); });
    // Pingo num galho baixo (em cores) e as crianças na base olhando para cima
    if (k < 0.99) {
      ctx.save(); ctx.globalAlpha = 1 - k;
      const [px, py] = toS([700, 1312]); drawPingo(ctx, { x: px, y: py, s: 0.3 * M.a, tail: td, tilt: 8 * Math.sin(td * 1.3), blink: blinkAt(td, [1.6, 3.9]), dilate: 0.5, look: [3, -2] });
      const lp = toS([250, 1600]), mp = toS([840, 1590]), sur = bell(td, 1.2, 0.5);
      drawPerson(ctx, 'lara', { x: lp[0], y: lp[1], s: 0.46 * M.a, t: td, legs: true, look: [3, -6], tilt: -6, smile: 1, blink: blinkAt(td, [2.2]) });
      drawPerson(ctx, 'miguel', { x: mp[0], y: mp[1], s: 0.47 * M.a, t: td, legs: true, look: [-3, -7], tilt: 5, mouth: voiceL('miguel', t), surprise: sur, brow: Math.max(sur, 0.3), armL: { a1: lerp(100, 200, ss((td - 0.8) / 0.25)), a2: lerp(80, 235, ss((td - 0.8) / 0.25)), open: 0, point: 1 }, blink: blinkAt(td, [3.4]) });
      ctx.restore();
    }
    leafShadows(ctx, t, [0, 1200, W, 720], { alpha: 0.12 * (1 - k), seed: 8 });
    motes(ctx, t, [0, 200, W, 1300], { n: 20, seed: 13 });
  }
  // desfile em escala (do menor ao maior)
  const PAR = [['pingo', 0.62, 'gato doméstico'], ['ocelot', 0.66, 'jaguatirica'], ['leopard', 0.8, 'leopardo'], ['jaguar', 0.88, 'onça-pintada'], ['lion', 0.98, 'leão'], ['tiger', 1.04, 'tigre']];
  const PARW = [0]; PAR.forEach(([, s], i) => { if (i) PARW.push(PARW[i - 1] + 330 + 330 * s); });
  const parCam = (t) => -260 + sm((t - P.parade) / (P.traits[0] - 0.5 - P.parade)) * (PARW[5] + 120);   // travelling ao longo da fila
  const parX = (i, t) => 300 + PARW[i] - (t - P.parade) * 110 - parCam(t);
  function shotParade(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(paperBg(), 0, 0);
    cloudsDrift(ctx, t, { y0: 200, y1: 600, n: 3, speed: 22, wrap: 1900, x0: -500, alpha: 0.8 });
    const gnd = cachedPainted('s03ground', 1080, 760, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#B8A07A'], [0.2, '#9DAA78'], [1, '#6E8A5E']]); g.fillRect(0, 0, w, h); for (let i = 0; i < 18; i++) canopy(g, rnd(31, i) * w, 40 + rnd(32, i) * 30, 50 + rnd(33, i) * 40, '#8FA070', '#748A5C', 800 + i, 0.01); }, 15, 0.5);
    ctx.drawImage(gnd, 0, 1220);
    for (let i = 0; i < 34; i++) { const x = ((i * 67 + 40 - (t - P.parade) * 80) % 1240 + 1240) % 1240 - 80; inkLine(ctx, [[x, 1330 + (i % 3) * 30], [x + 6, 1296 + (i % 3) * 30], [x + 3 + Math.sin(t * 2 + i) * 6, 1262 + (i % 3) * 30]], { line: i % 2 ? '#5E7A4A' : '#6E8A56', lw: 6, wob: 0 }); }
    PAR.forEach(([kind, s, , ], i) => { const x = parX(i, t); if (x < -400 || x > 1500) return; drawBigCat(ctx, kind, { x, y: 1420, s, flip: true, walk: (td - P.parade) * 1.1 + i * 0.3, moving: 1, tail: td + i }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,236,196,1)', rimW: 3, rimA: 0.6 } }); });
    sunRays(ctx, t, { x: 300, y: -100, ang: -0.3, len: 1600, n: 4, width: 120, alpha: 0.12 });
  }
  // características compartilhadas, apontadas no corpo do Pingo
  const TZ = 1.3, tz = ([x, y, r]) => [540 + (x - 540) * TZ, 1150 + (y - 1150) * TZ, r * TZ];   // close no Pingo (anéis acompanham)
  const TR = [['corpo ágil', [270, 440], tz([540, 1110, 95])], ['sentidos aguçados', [810, 440], tz([580, 930, 55])], ['dentes de carnívoro', [270, 590], tz([540, 990, 45])], ['patas silenciosas', [810, 590], tz([575, 1236, 42])], ['garras, geralmente retráteis', [540, 290], tz([505, 1236, 42])]];
  function shotTraits(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(paperBg(), 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = radial(ctx, 540, 1100, 80, 700, [[0, 'rgba(255,230,180,0.9)'], [1, 'rgba(120,80,140,0.3)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
    drawPingo(ctx, { x: 540, y: 1150 + 100 * TZ, s: 0.7 * TZ, tail: td, dilate: 0.4, blink: blinkAt(td, [P.traits[1] + 0.6, P.traits[4] + 0.4]), look: [0, 0], tilt: 4 * Math.sin(td * 0.8) });
    // anéis âmbar nas partes do corpo
    TR.forEach(([, , part], i) => { const k = clamp((t - P.traits[i]) / 0.25); if (k <= 0) return; ctx.save(); ctx.strokeStyle = PLUM; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(part[0], part[1], part[2] * outBack(k), 0, 6.283); ctx.stroke(); ctx.strokeStyle = ACCENT; ctx.lineWidth = 9; ctx.setLineDash([26, 12]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.arc(part[0], part[1], part[2] * outBack(k), 0, 6.283); ctx.stroke(); ctx.restore(); });
    motes(ctx, t, [0, 300, W, 1300], { n: 16, seed: 21 });
  }
  // Lara, o tigre enorme (ilustração ao fundo) e a borboleta
  function butterfly(ctx, x, y, s, t, rot = 0) {
    const f = Math.floor(t * 12), flap = 0.25 + 0.75 * Math.abs(Math.sin(f * 1.3));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    [-1, 1].forEach((sd) => { ctx.save(); ctx.scale(sd * flap, 1); ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.ellipse(28, -16, 30, 22, -0.4, 0, 6.283); ctx.fill(); ctx.fillStyle = '#E28A3A'; ctx.beginPath(); ctx.ellipse(22, 16, 20, 15, 0.5, 0, 6.283); ctx.fill(); ctx.fillStyle = PLUM; ctx.beginPath(); ctx.arc(34, -20, 6, 0, 6.283); ctx.fill(); ctx.restore(); });
    ctx.fillStyle = PLUM; ctx.beginPath(); ctx.ellipse(0, 0, 5, 24, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = PLUM; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(-10, -40); ctx.moveTo(0, -22); ctx.lineTo(10, -40); ctx.stroke();
    ctx.restore();
  }
  function butterflyPos(t) {
    const k = clamp((t - P.butterfly) / (P.land - P.butterfly));
    if (k < 1) { const e = sm(k); return [lerp(-60, 860, e) + 70 * Math.sin(t * 5), lerp(820, 1430, e) - 160 * Math.sin(Math.PI * e) + 40 * Math.sin(t * 7.3), 0.3 * Math.sin(t * 4)]; }
    return [860, 1430, 0.15];
  }
  function shotLara(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(paperBg(), 0, 0);
    // a "ilustração" do tigre ao fundo, em moldura de papel
    ctx.save(); ctx.fillStyle = 'rgba(59,42,69,0.18)'; ctx.fillRect(70, 260, 960, 760); ctx.fillStyle = '#F3E8D8'; ctx.fillRect(56, 240, 960, 760); ctx.beginPath(); ctx.rect(80, 264, 912, 712); ctx.clip();
    ctx.drawImage(bambooBg(), 600, 300, 1500, 1170, 80, 264, 912, 712);
    drawBigCat(ctx, 'tiger', { x: 640, y: 1060, s: 1.05, flip: true, walk: 0, moving: 0, headRot: -4 + 3 * Math.sin(td * 0.7), tail: td }, td, { tint: '#F3E8D8', tintA: 0.12 });
    ctx.restore();
    // Lara (meio corpo) e o Pingo no toco
    const talk = voiceL('lara', t), tb = talkBeats('lara', t + SCENE_T0), proud = ss((td - P.proud) / 0.3) * (1 - ss((td - P.butterfly - 0.2) / 0.3));
    drawPerson(ctx, 'lara', tp(ctx, { x: 320, y: 1180, s: 0.95, t: td, mouth: talk, smile: 1, look: [7, 4], turn: 0.35, tilt: 4 + 3 * tb.nod, happy: bell(td, P.proud + 0.4, 0.35) > 0.5 ? 1 : 0, blink: blinkAt(td, [P.lara + 1.6]), armR: { a1: lerp(84, 40, ss((td - P.lara - 0.4) / 0.4)), a2: lerp(110, -10, ss((td - P.lara - 0.4) / 0.4)), open: 1 } }));
    ctx.fillStyle = '#7A5A4E'; ctx.beginPath(); ctx.ellipse(800, 1560, 150, 40, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#6A4A42'; ctx.fillRect(650, 1560, 300, 400); ctx.fillStyle = '#9A7A66'; ctx.beginPath(); ctx.ellipse(800, 1560, 140, 32, 0, 0, 6.283); ctx.fill();
    const [bx, by, br] = butterflyPos(t), bk = t > P.butterfly - 0.1 ? 1 : 0;
    const lookB = bk ? [clamp((bx - 800) / 60, -8, 8), clamp((by - 1240) / 60, -8, 8)] : [0, 0];
    drawPingo(ctx, tp(ctx, { x: 800, y: 1556, s: 0.55, tail: td * (1 + bk), tilt: -14 * proud + bk * clamp((bx - 800) / 20, -14, 14), headDy: -18 * proud, blink: proud > 0.5 ? 0.55 : blinkAt(td, [P.lara + 0.8]), dilate: bk ? 0.95 : 0.4, look: proud > 0.3 ? [0, -6] : lookB, earL: -10 * bk, earR: -10 * bk, crouch: bk * ss((td - P.land + 0.4) / 0.3) * 0.7, wiggle: bk * ss((td - P.land) / 0.2) * Math.sin(td * 26) * 0.6 }));
    leafShape(ctx, 880, 1452, 150, 40, -0.3, '#7E9C6E', '#5F7A56');
    if (t > P.butterfly - 0.2) butterfly(ctx, bx, by, 0.9, t, br);
    leafShadows(ctx, t, [0, 1000, W, 920], { alpha: 0.12, seed: 9 });
  }
  /** close nas patas (passa para a cena 4) */
  function shotPaws(ctx, t) {
    const k = sm((t - P.land - 0.6) / 0.6), z = lerp(1, 2.8, k);
    ctx.save(); ctx.translate(lerp(800, 540, k), lerp(1530, 960, k)); ctx.scale(z, z); ctx.translate(-800, -1530); shotLara(ctx, t); ctx.restore();
  }
  function draw(ctx, t) {
    if (t < P.parade) shotTree(ctx, t);
    else if (t < P.traits[0] - 0.5) shotParade(ctx, t);
    else if (t < P.lara) shotTraits(ctx, t);
    else if (t < P.land + 0.6) shotLara(ctx, t);
    else shotPaws(ctx, t);
    vignette(ctx, '50,25,60', 0.28);
  }
  function ui(ctx, t) {
    // título do diagrama e a ordem (fonte de título); nomes no desfile; características
    if (t >= P.reorg && t < P.parade) {
      handTitle(ctx, t, P.title, 'Família', 540, 880, { size: 84, color: CREAM, align: 'center', rot: -0.03, t1: P.parade - 0.3 });
      handTitle(ctx, t, P.title + 0.35, 'Felidae', 540, 975, { size: 96, color: ACCENT, align: 'center', rot: -0.03, t1: P.parade - 0.3 });
      uiCard(ctx, t, P.title + 3.4, P.parade - 0.2, 'ordem Carnivora', 540, 330, { size: 50 });
    }
    if (t >= P.parade && t < P.traits[0] - 0.5) PAR.forEach(([, s, name], i) => { const x = parX(i, t); if (x > 40 && x < 1040) uiCard(ctx, t, P.parade, P.traits[0] - 0.6, name, clamp(x - 120 * s, 170, 880), 1420 - s * 470, { size: 44 }); });
    if (t >= P.traits[0] - 0.5 && t < P.lara) TR.forEach(([txt, pos], i) => uiCard(ctx, t, P.traits[i], P.lara - 0.15, txt, pos[0], pos[1], { size: 48, accent: i % 2 === 1, rot: (i % 2 ? 0.03 : -0.03) }));
    if (t >= P.lara && t < P.land) uiCard(ctx, t, P.lara + 0.3, P.butterfly, 'Felidae = família dos felinos', 540, 230, { size: 38 });
  }
  const sfx = (E) => [['FLAP', E.butterfly + 0.4, 0.4, 300, 760, 110, -0.1]];
  CENAS.s03 = { draw, ui, sfx, capY: (t) => (t >= P.parade && t < P.traits[0] - 0.5 ? 560 : t >= P.traits[0] - 0.5 && t < P.lara ? 1420 : 1390) };
})();
