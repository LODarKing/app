// Piloto — FELINOS: uma aventura selvagem! (cena 1, 0–10 s). Linha do tempo, câmeras, legendas, título.
'use strict';
const T = {
  DUR: 10, HEART: [0.1, 0.4, 0.98, 1.3], EYES_OPEN: 0.15, MEOW: 0.55, LIGHT: 0.95, PUSH: 1.2, CUT1: 2.0,
  REVEAL: 2.7, TILT: 2.85, SLOWBLINK: 3.35, BOING: 3.75, HEARTS: 3.6, CROUCH: 4.25, LEAP: 4.65, COVER: 5.1,
  WHIP: 6.18, CUT4: 7.25, RAISE: 7.4, ROAR: 7.78, ROAR_END: 8.25, CUT5: 8.32,
  PAWS: [8.38, 8.5, 8.62, 8.74], LETTERS: 8.9, SUB: 9.15, EN: 9.3, SERIES: 9.4, DIVE: 9.72,
};
// narração (tempos planejados: serão substituídos pela transcrição da voz do usuário)
const WORDS = [
  ['Parece', 2.30, 2.58], ['apenas', 2.61, 2.95], ['um', 2.98, 3.08], ['gatinho', 3.11, 3.52], ['fofinho,', 3.55, 4.05], ['não', 4.15, 4.29], ['é?', 4.32, 4.6],
  ['Mas', 5.38, 5.52], ['a', 5.54, 5.6], ['família', 5.63, 6.08], ['dele', 6.11, 6.34], ['guarda', 6.38, 6.72], ['segredos', 6.77, 7.28], ['incríveis!', 7.33, 7.92],
];
const PHRASES = [[[0, 1, 2], [3, 4]], [[5, 6]], [[7, 8, 9, 10], [11, 12, 13]]];
const KEYW = { 4: 'pink', 12: 'gold', 13: 'gold', 3: 'warm' };

// ============================================================ plano A: olhos no escuro
function shotEyes(ctx, t) {
  ctx.fillStyle = '#030304'; ctx.fillRect(0, 0, W, H);
  const k = clamp((t - T.PUSH) / (T.CUT1 - T.PUSH)), z = 1 + 15 * Math.pow(k, 2.6), m = sm(k);
  const ex = 698, ey = 880, cx = lerp(ex, 540, m), cy = lerp(ey, 960, m);
  const S = 2.8, M = [S * z, 0, 0, S * z, cx + (540 - ex) * z, cy + (940 - ey) * z];   // cabeça centrada em (540, 940)
  const open = sm((t - T.EYES_OPEN) / 0.35) * (1 - 0.92 * Math.sin(clamp((t - 0.72) / 0.16) * Math.PI));
  const light = 0.62 * ss((t - T.LIGHT) / 0.6);
  const dil = lerp(lerp(0.75, 1, ss((t - 0.2) / 0.5)), 0.02, ss((t - T.LIGHT) / 0.45));
  const glow = 1 - ss((t - T.LIGHT) / 0.5);
  const p = { blink: 1 - open, dilate: dil, look: [0, 0] };
  if (light > 0.01) {
    drawPingoHead(ctx, M, p, 'E');
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = radial(ctx, 540, 900, 100 * z, 900, [[0, `rgba(3,3,4,${1 - light})`], [1, `rgba(3,3,4,${1 - light * 0.4})`]]); ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // olhos sempre visíveis, com brilho do tapetum lucidum
  [-1, 1].forEach((sd) => {
    ctx.save(); ctx.setTransform(M[0], 0, 0, M[3], M[4], M[5]); ctx.translate(sd * 57, -20);
    if (glow > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softEllipse(ctx, 0, 0, 110, 90, `rgba(150,255,90,${0.3 * glow * open})`, 1); ctx.restore(); }
    ctx.scale(1, Math.max(0.02, open));
    drawCatEye(ctx, 45, 42, { blink: 0, dilate: dil, glow: glow, seed: sd + 5, lid: '#2A1406' });
    ctx.restore();
  });
  // poeira e batimento (pulso escuro nas bordas)
  dust(ctx, t, 28, [0, 0, W, H], 'rgba(220,240,200,A)', 3);
  let beat = 0; for (const h of T.HEART) beat = Math.max(beat, bell(t, h + 0.05, 0.09));
  vignette(ctx, 0.75 + 0.2 * beat, 0.46);
}

// ============================================================ plano B: Pingo na mesa
const PINGO = { x: 540, y: 1335, s: 1.42 };
function pingoPose(t) {
  const crouch = ss((t - T.CROUCH) / 0.32), twitch = bell(t, T.BOING, 0.07);
  return {
    ...PINGO, breath: t, tail: t * (1 + crouch * 2.5),
    tilt: keys(t, [[2.0, -3], [T.TILT, 0], [T.TILT + 0.3, 15], [3.95, 15], [4.2, 2], [4.6, 0]], outBack) + 1.5 * Math.sin(t * 2.1),
    blink: Math.max(blinkAt(t, [2.4]), keys(t, [[T.SLOWBLINK, 0], [T.SLOWBLINK + 0.26, 1], [T.SLOWBLINK + 0.42, 1], [T.SLOWBLINK + 0.68, 0]])),
    dilate: keys(t, [[2.0, 0.25], [T.CROUCH, 0.3], [T.CROUCH + 0.25, 1]]),
    look: keys(t, [[2.0, [0, 0]], [T.CROUCH, [0, 0]], [T.CROUCH + 0.2, [0, -5]]]),
    earL: -16 * twitch + 8 * crouch, earR: -26 * twitch + 8 * crouch,
    crouch, wiggle: crouch * Math.sin((t - T.CROUCH) * 30) * ss((t - T.CROUCH - 0.18) / 0.1), headDy: 5 * Math.sin(t * 2.1) * (1 - crouch),
  };
}
function shotTable(ctx, t) {
  const rev = sm((t - T.CUT1) / (T.REVEAL - T.CUT1)), lk = ss((t - T.LEAP) / 0.4);
  const zoom = lerp(2.6, 1.0, rev) + 0.05 * ss((t - T.TILT) / 1.4) + 0.14 * lk;
  const fy = lerp(PINGO.y - 440 * PINGO.s, 980, rev);
  const cam = { x: 3 * Math.sin(t * 0.8), y: 2 * Math.sin(t), zoom, fx: 540, fy };
  drawStudySet(ctx, t, cam);
  camSet(ctx, cam, 1);
  if (t < T.LEAP + 0.01) { const M = ctx.getTransform(); ctx.save(); drawPingoInCam(ctx, M, pingoPose(t)); ctx.restore(); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  godRays(ctx, -200, -300, 0.95, 0.5, 2400, 6, 'rgba(255,240,200,A)', t, 5);
  dust(ctx, t, 30, [0, 0, W, 1400], 'rgba(255,245,215,A)', 11);
  hearts(ctx, t, T.HEARTS, 540, PINGO.y - 470 * PINGO.s);
}
/** desenha o Pingo dentro da câmera (aplica a matriz da câmera às coordenadas do mundo) */
function drawPingoInCam(ctx, M, p) {
  const s = p.s * M.a, x = M.a * p.x + M.e, y = M.d * p.y + M.f;
  drawPingo(ctx, { ...p, x, y, s });
}
function hearts(ctx, t, t0, x, y) {
  const k = (t - t0) / 1.0; if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.42, r = 190 + 230 * sm(k), sc = (0.8 + hash(i) * 0.6) * outBack(k * 3) * (1 - ss((k - 0.65) / 0.35));
    ctx.save(); ctx.translate(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 0.75 - 50 * k); ctx.rotate((i - 2.5) * 0.15); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(255,120,170,0.6)'; ctx.shadowBlur = 20;
    ctx.fillStyle = linear(ctx, 0, -30, 0, 30, [[0, '#FFB3CF'], [1, '#F0508A']]);
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-36, 6, -46, -14, -34, -28); ctx.bezierCurveTo(-22, -42, -4, -36, 0, -20); ctx.bezierCurveTo(4, -36, 22, -42, 34, -28); ctx.bezierCurveTo(46, -14, 36, 6, 0, 30); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-16, -16, 8, 5, -0.6, 0, 6.28); ctx.fill();
    ctx.restore();
  }
}
/** salto em direção à lente: cresce em câmera lenta, escurece até virar silhueta e passa por cima */
function leapLayer(ctx, t) {
  const k = clamp((t - T.LEAP) / (T.COVER + 0.18 - T.LEAP)); if (t < T.LEAP || k >= 1) return;
  const s = PINGO.s * (1 + 10 * Math.pow(k, 2.7)), up = -3000 * ss((k - 0.7) / 0.3);
  const [c, g] = layer('leapL');
  drawPingoLeap(g, { x: 540, y: lerp(PINGO.y - 140, 1500, sm(k)) + up, s, dilate: 1 });
  const dark = 0.9 * ss((k - 0.35) / 0.35);
  if (dark > 0) tintLayer(g, `rgba(12,6,2,${dark})`);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore();
}
function zoomLines(ctx, t, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) { const ang = hash(i) * 6.28, r0 = 360 + ((t * (1800 + hash(i + 3) * 1400) + hash(i + 5) * 900) % 900), len = 140 + hash(i + 7) * 280; ctx.lineWidth = 3 + hash(i + 2) * 5; ctx.beginPath(); ctx.moveTo(540 + Math.cos(ang) * r0, 900 + Math.sin(ang) * r0); ctx.lineTo(540 + Math.cos(ang) * (r0 + len), 900 + Math.sin(ang) * (r0 + len)); ctx.stroke(); }
  ctx.restore();
}

// ============================================================ planos D, E, F: os grandes felinos
const CAT_S = 1.42, GROUND = 1330;
const walkX = (t, t0, x0, Tc, stride, dir = 1) => x0 + dir * (stride / (0.6 * Tc)) * CAT_S * (t - t0);
function shotJaguar(ctx, t) {
  const t0 = T.COVER - 0.15, Tc = 0.95, wx = walkX(t, t0, 400, Tc, 120), pan = 0.55 * (wx - 400);
  const cam = { x: pan, y: 0, zoom: 1.0 + 0.04 * (t - T.COVER) };
  drawRainforest(ctx, t, cam, () => {
    camSet(ctx, cam, 1);
    const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // mancha de sol sobre a onça (luz salpicada)
    drawBigCat(ctx, 'jaguar', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, walk: (t - t0) / Tc, moving: 1, headRot: 4 + 3 * Math.sin(t * 3), blink: blinkAt(t, [5.9]) }, t, { rim: 'rgba(255,248,210,0.95)', rimDx: -5, rimDy: -5, rimAlpha: 0.6 });
  });
}
function shotTiger(ctx, t) {
  const t0 = T.WHIP - 0.25, Tc = 1.0, wx = walkX(t, t0, 700, Tc, 140, -1), pan = 0.5 * (wx - 700);
  const cam = { x: pan, y: 0, zoom: 1.0 };
  drawBamboo(ctx, t, cam, () => {
    camSet(ctx, cam, 1);
    const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawBigCat(ctx, 'tiger', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, flip: true, walk: (t - t0) / Tc, moving: 1, headRot: 2 + 2 * Math.sin(t * 2.6), blink: blinkAt(t, [6.9]) }, t, { rim: 'rgba(255,250,225,0.95)', rimDx: -6, rimDy: -5, rimAlpha: 0.7 });
  });
}
function shotLion(ctx, t) {
  const k = clamp((t - T.CUT4) / (T.CUT5 - T.CUT4)), zoom = 1 + 0.3 * sm(k) + 0.08 * ss((t - T.ROAR) / 0.3);
  const raise = sm((t - T.RAISE) / 0.38), jaw = sm((t - T.ROAR) / 0.12) * (1 - sm((t - T.ROAR_END) / 0.12));
  let shake = 0; { const d = t - T.ROAR; if (d > 0 && d < 0.55) shake = Math.sin(d * 75) * 13 * (1 - d / 0.55); }
  const cam = { x: -shake, y: shake * 0.4, zoom, fx: 640, fy: 980 };
  drawSavanna(ctx, t, cam, () => {
    camSet(ctx, cam, 1); drawRock(ctx);
    const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawBigCat(ctx, 'lion', { x: M.a * 300 + M.e, y: M.d * 1356 + M.f, s: 1.42 * M.a, walk: 0, moving: 0, headRot: lerp(22, -16, raise) + 2 * Math.sin(t * 1.6), jaw, blink: blinkAt(t, [7.32]) }, t,
      { shade: 0.5, shadeColor: 'rgba(120,40,10,0.12)', rim: 'rgba(255,200,120,1)', rimDx: -11, rimDy: -8, rimBlur: 3, rimAlpha: 1, rimOp: 'lighter', shadow: 0.4, eyeGlow: 0.5 });
  });
  // a juba brilha na contraluz e o rugido empurra o ar
  if (jaw > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softEllipse(ctx, 760, 930, 300 * jaw, 220 * jaw, `rgba(255,190,110,${0.18 * jaw})`, 1); ctx.restore(); }
}

// ============================================================ plano G: pegadas e título
const PAWPOS = [[200, 1180, -0.35], [430, 1010, 0.25], [640, 1170, -0.3], [870, 990, 0.3]];
const SETTLED = (i) => [330 + i * 140, 470 + (i % 2 ? -16 : 16), i === 2 ? 0 : (i % 2 ? 0.14 : -0.14)];
function titleBg(ctx, t) {
  ctx.fillStyle = radial(ctx, 540, 820, 50, 1300, [[0, '#5A3412'], [0.35, '#2A1608'], [1, '#080402']]); ctx.fillRect(0, 0, W, H);
  // silhuetas de folhas da selva nas bordas
  ctx.save(); ctx.filter = 'blur(6px)';
  for (let i = 0; i < 9; i++) { const top = i % 2, x = -100 + i * 150; bigLeaf(ctx, x, top ? -60 : 1990, 420, 120, top ? 1.15 + 0.05 * Math.sin(t + i) : -1.3 + 0.05 * Math.sin(t * 1.1 + i), '#0F2410', '#081608', 'rgba(0,0,0,0)'); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.28 + (t - T.CUT5) * 0.25, w = 0.07; ctx.fillStyle = linear(ctx, 540, 820, 540 + Math.cos(a) * 1300, 820 + Math.sin(a) * 1300, [[0, 'rgba(255,190,90,0.16)'], [1, 'rgba(255,190,90,0)']]); ctx.beginPath(); ctx.moveTo(540, 820); ctx.lineTo(540 + Math.cos(a - w) * 1500, 820 + Math.sin(a - w) * 1500); ctx.lineTo(540 + Math.cos(a + w) * 1500, 820 + Math.sin(a + w) * 1500); ctx.fill(); }
  ctx.restore();
  dust(ctx, t, 50, [0, 0, W, H], 'rgba(255,200,120,A)', 77);
}
function goldPaw(ctx, x, y, s, rot, glow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; softEllipse(ctx, 0, 10, 190, 190, `rgba(255,170,60,${0.55 * glow})`, 1); ctx.restore(); }
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  const grd = linear(ctx, -60, -80, 60, 70, [[0, '#FFE9A8'], [0.45, '#F2B744'], [1, '#B8701C']]);
  drawPawShape(ctx, grd, '#5A3008');
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-20, 12, 16, 8, -0.4, 0, 6.28); ctx.fill();
  ctx.restore();
}
function shotTitle(ctx, t) {
  const dk = clamp((t - T.DIVE) / (T.DUR - T.DIVE)), dz = 1 + 26 * Math.pow(dk, 2.3);
  const [px, py] = SETTLED(2), SC = 0.62, O = [px, py + 25 * SC];
  const settle = sm((t - T.PAWS[3] - 0.17) / 0.26), fade = 1 - ss(dk / 0.3);
  ctx.save(); ctx.translate(O[0], O[1]); ctx.scale(dz, dz); ctx.translate(-O[0], -O[1]);
  titleBg(ctx, t);
  PAWPOS.forEach(([x, y, r], i) => {
    const k = (t - T.PAWS[i]) / 0.2; if (k <= 0) return;
    const s = k < 1 ? lerp(2.2, 1.0, sm(k)) : 1 + 0.06 * Math.exp(-(t - T.PAWS[i] - 0.2) * 9) * Math.sin((t - T.PAWS[i]) * 40);
    const [sx, sy, sr] = SETTLED(i);
    if (k > 1 && k < 3.5) { ctx.save(); ctx.globalAlpha = 0.7 * (1 - (k - 1) / 2.5); ctx.strokeStyle = '#FFD27A'; ctx.lineWidth = 8 * (1 - (k - 1) / 2.5); ctx.beginPath(); ctx.ellipse(x, y, 110 + 140 * (k - 1) / 2.5, (110 + 140 * (k - 1) / 2.5) * 0.6, 0, 0, 6.28); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = clamp(k * 3); goldPaw(ctx, lerp(x, sx, settle), lerp(y, sy, settle), lerp(1.2, SC, settle) * s, lerp(r, sr, settle), bell(t, T.PAWS[i] + 0.2, 0.15) + 0.25); ctx.restore();
  });
  ctx.save(); ctx.globalAlpha = fade;
  // FELINOS: letra a letra, dourado com contorno escuro e brilho que passa
  const word = 'FELINOS'; ctx.font = '900 200px Poppins'; ctx.textBaseline = 'alphabetic';
  const total = ctx.measureText(word).width; let xx = 540 - total / 2;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i], w = ctx.measureText(ch).width, k = outBack((t - T.LETTERS - i * 0.045) / 0.32);
    if (k > 0) {
      ctx.save(); ctx.translate(xx + w / 2, 760 + (1 - k) * 160); ctx.rotate((1 - k) * (i % 2 ? 0.3 : -0.3)); ctx.scale(Math.max(0.01, k), Math.max(0.01, k)); ctx.globalAlpha = fade * clamp(k * 3);
      ctx.lineJoin = 'round'; ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 16;
      ctx.strokeStyle = '#2A1205'; ctx.lineWidth = 26; ctx.strokeText(ch, 0, 0); ctx.shadowColor = 'transparent';
      ctx.fillStyle = linear(ctx, 0, -150, 0, 10, [[0, '#FFF2C2'], [0.45, '#FFC83D'], [0.55, '#F29C1F'], [1, '#C46A10']]); ctx.fillText(ch, 0, 0);
      const sh = (t - T.LETTERS - 0.35) * 1.4 - i * 0.07;
      if (sh > 0 && sh < 1) { const bx = lerp(-160, 160, sh); ctx.fillStyle = linear(ctx, bx - 60, 0, bx + 60, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]); ctx.fillText(ch, 0, 0); }
      ctx.restore();
    }
    xx += w;
  }
  // subtítulos
  const sub = (txt, y, size, k, color, spacing, box) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = fade * clamp(k * 2); ctx.translate(540, y + (1 - clamp(k)) * 30); ctx.scale(lerp(0.85, 1, clamp(k)), lerp(0.85, 1, clamp(k)));
    ctx.font = `800 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.letterSpacing = spacing + 'px';
    if (box) { const w = ctx.measureText(txt).width + 60; ctx.strokeStyle = box; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.95, w, size * 1.45, size * 0.7); ctx.stroke(); }
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.fillStyle = color; ctx.fillText(txt, 0, 0); ctx.restore();
  };
  sub('UMA AVENTURA SELVAGEM!', 880, 58, outBack((t - T.SUB) / 0.35), '#FFFFFF', 2);
  sub('ESPECIALIDADE EN-024', 1000, 34, outBack((t - T.EN) / 0.35), '#FFD27A', 5, 'rgba(255,210,122,0.8)');
  sub('SÉRIE ESPECIALIDADES DOS DESBRAVADORES', 1090, 24, outBack((t - T.SERIES) / 0.35), 'rgba(255,255,255,0.85)', 3);
  ctx.restore();
  ctx.restore();
  // a pegada vira janela para a próxima cena (área de estudos)
  if (dk > 0) {
    ctx.save();
    const pad = [[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]].map(([x, y]) => [O[0] + x * SC * dz * 0.82, O[1] + (y - 25) * SC * dz * 0.82]);
    tracePoly(ctx, smooth(pad)); ctx.clip();
    drawStudySet(ctx, t, { x: 0, y: 0, zoom: lerp(1.6, 1.15, dk), fx: 540, fy: 1000 });
    ctx.restore();
  }
}

// ============================================================ legendas palavra por palavra
function captions(ctx, t) {
  let pi = -1; PHRASES.forEach((ph, i) => { if (t >= WORDS[ph[0][0]][1] - 0.1) pi = i; });
  if (pi < 0) return;
  const ph = PHRASES[pi], flat = ph.flat(), last = WORDS[flat[flat.length - 1]];
  const next = pi + 1 < PHRASES.length ? WORDS[PHRASES[pi + 1][0][0]][1] - 0.1 : 1e9, end = Math.min(next, last[2] + 0.75);
  if (t > end) return;
  const out = ss((t - end + 0.15) / 0.15);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  // faixa escura suave para leitura
  ctx.fillStyle = linear(ctx, 0, 1300, 0, 1800, [[0, 'rgba(0,0,0,0)'], [0.5, `rgba(0,0,0,${0.35 * (1 - out)})`], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 1300, W, 500);
  ctx.font = '800 66px Poppins'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0px';
  const space = 20, lineH = 92, y0 = 1530 - (ph.length - 1) * lineH / 2;
  ph.forEach((line, li) => {
    const widths = line.map((wi) => ctx.measureText(WORDS[wi][0]).width), tw = widths.reduce((a, b) => a + b, 0) + space * (line.length - 1);
    let x = 540 - tw / 2;
    line.forEach((wi, j) => {
      const [w, s, e] = WORDS[wi], k = outBack((t - s + 0.05) / 0.28), active = t >= s - 0.02 && t < e + 0.08, kw = KEYW[wi];
      if (k > 0) {
        ctx.save(); ctx.translate(x + widths[j] / 2, y0 + li * lineH + (1 - clamp(k)) * 26); const sc = Math.max(0.01, k) * (active ? 1.08 : 1); ctx.scale(sc, sc);
        ctx.globalAlpha = clamp(k * 2.5) * (1 - out); ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 5;
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(20,10,4,0.9)'; ctx.lineWidth = 10; ctx.strokeText(w, 0, 0); ctx.shadowColor = 'transparent';
        let fill = active ? '#FFD35A' : '#FFFFFF';
        if (kw === 'pink') fill = linear(ctx, 0, -30, 0, 30, [[0, '#FFC2DA'], [1, '#FF6FA8']]);
        if (kw === 'gold') fill = linear(ctx, 0, -32, 0, 30, [[0, '#FFF1B8'], [0.5, '#FFC83D'], [1, '#E58A12']]);
        if (kw === 'warm' && active) fill = '#FFB46B';
        ctx.fillStyle = fill; ctx.fillText(w, 0, 0);
        if (kw && t > s && t < s + 0.6) { const q = (t - s) / 0.6; ctx.globalCompositeOperation = 'lighter'; for (let n = 0; n < 6; n++) { const a = n * 1.047 + 0.4, r = 30 + 110 * sm(q), sz = 12 * (1 - q); ctx.fillStyle = kw === 'pink' ? 'rgba(255,160,200,0.9)' : 'rgba(255,220,120,0.9)'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.7 - sz); ctx.lineTo(Math.cos(a) * r * 1.5 + sz * 0.3, Math.sin(a) * r * 0.7); ctx.lineTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.7 + sz); ctx.lineTo(Math.cos(a) * r * 1.5 - sz * 0.3, Math.sin(a) * r * 0.7); ctx.fill(); } }
        ctx.restore();
      }
      x += widths[j] + space;
    });
  });
  ctx.restore();
}

// ============================================================ rótulo da espécie (nome popular + científico)
function speciesLabel(ctx, t, t0, t1, name, sci) {
  const k = easeOut((t - t0) / 0.4), o = ss((t - t1 + 0.2) / 0.2); if (k <= 0 || o >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - o;
  const x = 70, y = 300;
  ctx.fillStyle = '#FFC83D'; ctx.fillRect(x, y - 70, 8, 120 * k);
  ctx.beginPath(); ctx.rect(x + 20, y - 90, 900, 170); ctx.clip();
  ctx.translate(-60 * (1 - k), 0);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  ctx.font = '900 72px Poppins'; ctx.fillStyle = '#FFFFFF'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '1px'; ctx.fillText(name, x + 30, y);
  ctx.font = 'italic 600 36px Poppins'; ctx.fillStyle = '#FFE2A0'; ctx.letterSpacing = '0px'; ctx.fillText(sci, x + 32, y + 50);
  ctx.restore();
}

// ============================================================ quadro completo
function sceneAt(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (t < T.CUT1) shotEyes(ctx, t);
  else if (t < T.COVER) shotTable(ctx, t);
  else if (t < T.CUT4) {
    // chicote de câmera entre onça e tigre
    const wk = clamp((t - T.WHIP) / 0.16), e = sm(wk);
    if (t < T.WHIP + 0.16) { ctx.save(); ctx.translate(-1080 * e, 0); shotJaguar(ctx, t); ctx.restore(); }
    if (t >= T.WHIP) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 1080 * (1 - e), 0); shotTiger(ctx, t); ctx.restore(); }
  } else if (t < T.CUT5) shotLion(ctx, t);
  else shotTitle(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  zoomLines(ctx, t, ss((t - T.LEAP - 0.05) / 0.12) * (1 - ss((t - T.COVER) / 0.1)));
  leapLayer(ctx, t);
}
/** obturador: quanto motion blur cada momento pede */
function shutter(t) {
  return Math.max(ss((t - 1.55) / 0.2) * (t < T.CUT1 ? 1 : 0), (t > T.LEAP && t < T.COVER + 0.2) ? 1 : 0, (t > T.WHIP - 0.03 && t < T.WHIP + 0.2) ? 1 : 0, t > T.DIVE ? 1 : 0, (t > T.ROAR && t < T.ROAR + 0.4) ? 0.5 : 0);
}
function renderFrame(ctx, t) {
  const sh = shutter(t);
  if (sh > 0.05) {
    const n = 5, span = (1 / 60) * 0.9 * sh;
    const [ac, ag] = layer('accum');
    for (let i = 0; i < n; i++) {
      const [fc, fg] = layer('sub'); sceneAt(fg, t + (i / (n - 1) - 0.5) * span);
      ag.globalAlpha = 1 / (i + 1); ag.drawImage(fc, 0, 0);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(ac, 0, 0);
  } else sceneAt(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // camadas de interface e acabamento
  speciesLabel(ctx, t, T.COVER + 0.15, T.WHIP, 'ONÇA-PINTADA', 'Panthera onca');
  speciesLabel(ctx, t, T.WHIP + 0.2, T.CUT4, 'TIGRE', 'Panthera tigris');
  speciesLabel(ctx, t, T.CUT4 + 0.12, T.CUT5, 'LEÃO', 'Panthera leo');
  captions(ctx, t);
  // flashes nos cortes
  [T.CUT1, T.CUT4, T.CUT5].forEach((c) => { const a = bell(t, c, 0.06) * 0.75; if (a > 0.01) { ctx.fillStyle = `rgba(255,250,240,${a})`; ctx.fillRect(0, 0, W, H); } });
  if (t >= T.CUT1) vignette(ctx, 0.38, 0.45);
  grain(ctx, t, 0.07);
  // entrada e saída
  if (t > T.DUR - 0.05) { ctx.fillStyle = `rgba(0,0,0,${ss((t - T.DUR + 0.05) / 0.05)})`; ctx.fillRect(0, 0, W, H); }
}
