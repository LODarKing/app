// Cena 12 — O grande desafio dos felinos (requisito 10: recordes e curiosidades).
// Arena de perguntas (Lara e Miguel nos púlpitos, Pingo na cadeirinha de apresentador) -> maior felino (tigre, escala comparativa)
// -> maior da América do Sul (onça no mapa) -> mais veloz (guepardo, cronômetro, câmera lenta) -> "rei dos animais" (coroa = apelido popular)
// -> a vida real do leão: grupo familiar, território, leoas caçando em cooperação (sem violência), machos também participam -> rugido.
'use strict';
(() => {
  const arena = () => cachedPainted('s12arena', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#2E2448'], [0.6, '#4E3A6E'], [0.61, '#3A2E50'], [1, '#2A2240']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(242,180,81,${0.05 + 0.04 * (i % 2)})`; g.beginPath(); g.moveTo(540, 1160); g.lineTo(-200 + i * 190, -40); g.lineTo(-110 + i * 190, -40); g.fill(); }
    g.fillStyle = '#5E4A7E'; g.beginPath(); g.ellipse(540, 1240, 640, 140, 0, 0, 6.283); g.fill(); g.fillStyle = '#6E5A8E'; g.beginPath(); g.ellipse(540, 1230, 560, 110, 0, 0, 6.283); g.fill();
  }, 35, 0.4);
  function panels(ctx, t, content) {
    [[90, 260], [570, 260]].forEach(([x, y], i) => { ctx.fillStyle = '#1E1830'; ctx.beginPath(); ctx.roundRect(x - 10, y - 10, 440, 340, 20); ctx.fill(); ctx.fillStyle = '#3E3460'; ctx.beginPath(); ctx.roundRect(x, y, 420, 320, 14); ctx.fill(); if (content) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, 420, 320, 14); ctx.clip(); content(ctx, i, x, y); ctx.restore(); } });
  }
  function podiums(ctx, t, o = {}) {
    const td = on2s(t), tm = talkBeats('miguel', t + SCENE_T0), tl = talkBeats('lara', t + SCENE_T0);
    drawPerson(ctx, 'lara', { x: 230, y: 1030, s: 0.7, t: td, mouth: voiceL('lara', t), smile: 1, look: o.lookL || [6, -2], turn: 0.3, tilt: 2 + 3 * tl.nod, brow: tl.brow, blink: blinkAt(td, [P.q1 + 2.4, P.q2 + 3.1]), surprise: o.surL || 0, armR: o.armL || { a1: 70, a2: 30, open: 0.3 } });
    drawPerson(ctx, 'miguel', { x: 850, y: 1020, s: 0.7, t: td, mouth: voiceL('miguel', t), smile: 0.8, look: o.lookM || [-6, -2], turn: -0.3, tilt: -2 + 3 * tm.nod, brow: 0.3 + 0.5 * tm.brow, blink: blinkAt(td, [P.q1 + 5.6, P.q3 + 2.0]), surprise: o.surM || 0, armL: o.armM || { a1: 110, a2: 150, open: 0.3 } });
    [[230, '#C9566A'], [850, '#5AA7E0']].forEach(([x, c]) => { ctx.fillStyle = '#1E1830'; ctx.beginPath(); ctx.moveTo(x - 190, 1240); ctx.lineTo(x + 190, 1240); ctx.lineTo(x + 160, 1700); ctx.lineTo(x - 160, 1700); ctx.fill(); ctx.fillStyle = c; ctx.fillRect(x - 190, 1240, 380, 44); ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(x, 1420, 40, 0, 6.283); ctx.fill(); });
    // Pingo na cadeirinha de apresentador
    ctx.fillStyle = '#7A2E44'; ctx.beginPath(); ctx.roundRect(470, 1500, 140, 200, 20); ctx.fill(); ctx.fillStyle = '#9A3E58'; ctx.fillRect(450, 1660, 180, 34); ctx.fillStyle = '#1E1830'; ctx.fillRect(470, 1694, 14, 160); ctx.fillRect(596, 1694, 14, 160);
    drawPingo(ctx, { x: 540, y: 1660, s: 0.36, tail: td, look: o.lookP || [0, 0], tilt: 6 * Math.sin(td * 0.9), dilate: 0.5, blink: blinkAt(td, [P.q1 + 3.5, P.q2 + 1.8]), earL: -6 * (o.alert || 0), earR: -6 * (o.alert || 0) });
  }
  function silhouetteCat(g, kind, x, y, s, t, dark = '#120E1E') { const [c, cg] = layer('s12sil'); drawBigCat(cg, kind, { x, y, s, tail: t, headRot: 0 }, t, { dark: dark.length === 7 ? 'rgba(18,14,30,1)' : dark }); g.drawImage(c, 0, 0); }
  function shotQ1(ctx, t) {
    const td = on2s(t), rev = t >= P.reveal1, susp = !rev && t > P.q1 + 4.4;
    ctx.drawImage(arena(), 0, 0);
    panels(ctx, t, (g, i, x, y) => { g.fillStyle = rev && i === 0 ? '#6A5A2E' : '#3E3460'; g.fillRect(x, y, 420, 320); const kind = i === 0 ? 'tiger' : 'lion'; const [c, cg] = layer('s12p'); drawBigCat(cg, kind, { x: x + 170, y: y + 290, s: 0.48, tail: td, headRot: 0 }, td, rev && i === 0 ? {} : { dark: 'rgba(18,14,30,1)' }); g.drawImage(c, 0, 0); if (rev && i === 1) { g.fillStyle = 'rgba(20,16,36,0.6)'; g.fillRect(x, y, 420, 320); } if (susp) { g.fillStyle = `rgba(242,180,81,${0.25 * (Math.floor(td * 8) % 2 === i ? 1 : 0)})`; g.fillRect(x, y, 420, 320); } });
    podiums(ctx, t, { lookM: [-4, -8], lookL: [4, -8], surL: rev ? bell(td, P.reveal1 + 0.3, 0.4) : 0, alert: susp ? 1 : 0, armM: t < P.reveal1 ? { a1: 60, a2: -40, open: 0, point: 1 } : undefined });
  }
  /** escala comparativa: tigre x leão x pessoa (silhuetas com régua) */
  function shotScale(ctx, t) {
    const td = on2s(t), k = sm((t - P.reveal1 - 1.6) / 0.6);
    ctx.fillStyle = '#EFE4D4'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(150,120,160,0.25)'; ctx.lineWidth = 2; for (let y = 400; y < 1500; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = PLUM; ctx.fillRect(40, 1300, W - 80, 8);
    drawBigCat(ctx, 'tiger', { x: 290, y: 1300, s: 0.8 * k + 0.01, walk: 0, moving: 0, tail: td }, td, {});
    silhouetteCat(ctx, 'lion', 690, 1300, 0.6 * k + 0.01, td);
    // pessoa adulta (silhueta) para escala
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(59,42,69,0.5)'; ctx.translate(1000, 1300); ctx.scale(0.8, 0.8); ctx.beginPath(); ctx.arc(0, -520, 40, 0, 6.283); ctx.fill(); ctx.fillRect(-40, -470, 80, 250); ctx.fillRect(-36, -230, 30, 230); ctx.fillRect(6, -230, 30, 230); ctx.restore();
  }
  function shotQ2(ctx, t) {
    const td = on2s(t), rev = sm((t - P.reveal2) / 1.2);
    ctx.drawImage(arena(), 0, 0);
    if (t < P.reveal2 - 0.2) { podiums(ctx, t, { lookL: [-4, -8], lookM: [-8, -2], armL: { a1: 40, a2: -50, open: 0, point: 1 } }); return; }
    // América do Sul (recorte do mapa) e a onça crescendo no centro
    ctx.fillStyle = '#5E8EA6'; ctx.fillRect(0, 0, W, H);
    const [cx, cy] = proj(-60, -18); drawMap(ctx, cx, cy, 6.2, 540, 1000, (g, sc) => rangeBlob(g, 'jaguar', t, rev));
    const s = 0.2 + 0.75 * outBack(rev, 1.3); drawBigCat(ctx, 'jaguar', { x: 470, y: 1180, s, walk: td * 0.6, moving: 0.3, tail: td }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,240,200,1)', rimW: 4, rimA: 0.6 } });
  }
  function shotRace(ctx, t) {
    const td = on2s(t), slow = bell(t, P.run + 6.0, 1.4), speed = 1 - 0.7 * slow;
    const track = cachedPainted('s12track', 2400, 1920, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#8EB8D6'], [0.42, '#E8EEE0'], [0.47, '#9A8A5E'], [1, '#6E5E3E']]); g.fillRect(0, 0, w, h); g.fillStyle = '#8A6A44'; g.fillRect(0, 1250, w, 160); g.fillStyle = '#F6EEE4'; for (let x = 0; x < w; x += 200) { g.fillRect(x, 1240, 120, 10); g.fillRect(x, 1410, 120, 10); } for (let x = 0; x < w; x += 300) { g.fillStyle = '#4E4038'; g.fillRect(x + 140, 790, 10, 110); g.beginPath(); g.ellipse(x + 145, 790, 90, 22, 0, 0, 6.283); g.fill(); } }, 36, 0.5);
    if (t < P.run) { ctx.drawImage(track, 0, 0); drawBigCat(ctx, 'cheetah', { x: 380, y: 1330, s: 1.0, walk: 0, moving: 0, tail: td, headRot: 4 }, td, {}); ctx.fillStyle = '#F6EEE4'; ctx.fillRect(560, 1180, 12, 260); return; }
    const dist = (t - P.run) * 1100 - 900 * Math.max(0, (t - P.run) - 4.6) * 0 ;
    const off = ((t - P.run) * 1150 * (1 - 0.6 * slow)) % 1200;
    ctx.save(); ctx.translate(-off, 0); ctx.drawImage(track, 0, 0); ctx.drawImage(track, 2400, 0); ctx.restore();
    drawBigCat(ctx, 'cheetah', { x: 470, y: 1330, s: 1.05, walk: (td - P.run) * 2.6 * speed + 0.3 * slow * (td - P.run), moving: 1, gait: 'gallop', tail: td * 3 }, td, { light: { dir: [-1, -0.7], rim: 'rgba(255,240,200,1)', rimW: 5, rimA: 0.7 } });
    speedLines(ctx, t, 0.18 * (1 - slow), 540, 900, false);
  }
  function shotKing(ctx, t) {
    const td = on2s(t), rise = sm((t - P.q4) / 1.8), cam = { x: 0, y: lerp(-500, 0, rise), zoom: 1.06, fx: 640, fy: 990 };
    drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1); drawBigCat(ctx, 'lion', tp(ctx, { x: 300, y: 1356, s: 1.3, headRot: lerp(20, -8, rise), tail: td, jaw: 0 }), td, { dark: 'rgba(70,30,60,0.4)', rim: '#FFD7A6', rimDx: -9, rimDy: -7 }); });
    const shadow = 1 - ss((t - P.q4 - 0.3) / 1.2); if (shadow > 0) { ctx.fillStyle = `rgba(20,12,24,${0.85 * shadow})`; ctx.fillRect(0, 0, W, H); }
  }
  function shotPride(ctx, t) {
    const td = on2s(t), terr = t >= P.territory && t < P.hunt, males = t >= P.males;
    const cam = { x: 0, y: 0, zoom: 1.0 + 0.02 * (t - P.pride), fx: 540, fy: 1100 };
    drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1);
      if (t < P.hunt) {
        drawBigCat(ctx, 'lioness', tp(ctx, { x: 700, y: 1390, s: 0.62, flip: true, walk: td * 0.5, moving: 0.2, tail: td }), td, { dark: 'rgba(70,30,60,0.3)' });
        drawBigCat(ctx, 'cub', tp(ctx, { x: 520 + 40 * Math.sin(td * 1.6), y: 1420, s: 0.62, walk: td * 1.4, moving: 1, flip: Math.cos(td * 1.6) < 0, tail: td * 2 }), td, { dark: 'rgba(70,30,60,0.25)' });
        drawBigCat(ctx, 'lion', tp(ctx, { x: 200, y: 1356, s: 0.95, headRot: terr ? -18 : -4, jaw: terr ? 0.8 * bell(td, P.territory + 0.6, 0.5) : 0, tail: td }), td, { dark: 'rgba(70,30,60,0.35)', rim: '#FFD7A6', rimDx: -8, rimDy: -6 });
        drawBigCat(ctx, 'lioness', tp(ctx, { x: 860, y: 1440, s: 0.66, flip: true, walk: 0, moving: 0, tail: td, headRot: 6 }), td, { dark: 'rgba(70,30,60,0.3)' });
      } else {   // leoas avançam juntas, abaixadas, pelo capim alto (sem presa na tela)
        [0, 1, 2].forEach((i) => drawBigCat(ctx, 'lioness', tp(ctx, { x: 140 + i * 280 + 60 * (td - P.hunt), y: 1400 + (i % 2) * 50, s: 0.68, walk: (td - P.hunt) * 0.7 + i * 0.3, moving: 1, tail: td, headRot: 10 }), td, { dark: 'rgba(70,30,60,0.32)' }));
        if (males) drawBigCat(ctx, 'lion', tp(ctx, { x: -200 + 260 * sm((td - P.males) / 2.4), y: 1360, s: 0.85, walk: (td - P.males) * 0.8, moving: 1, tail: td }), td, { dark: 'rgba(70,30,60,0.35)', rim: '#FFD7A6', rimDx: -8, rimDy: -6 });
        camSet(ctx, cam, 1.3); for (let i = 0; i < 60; i++) { const x = -200 + i * 24, hh = 160 + rnd(i, 7) * 180, sw = 14 * Math.sin(t * 1.6 + i * 0.4); inkLine(ctx, [[x, 1700], [x + sw * 0.4, 1700 - hh * 0.55], [x + sw, 1700 - hh]], { line: i % 3 ? '#C9A46E' : '#B08A56', lw: 8, wob: 0 }); }
      }
    });
  }
  function shotRoar(ctx, t) {
    const td = on2s(t), jaw = sm((td - P.roar) / 0.12) * (1 - sm((td - P.roar - 0.9) / 0.2)), turn = clamp((t - P.roar - 0.9) / 0.5);
    const cam = { x: 0, y: 0, zoom: 1.2 + 0.1 * jaw, fx: 640, fy: 990 };
    drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1); drawBigCat(ctx, 'lion', tp(ctx, { x: 300, y: 1356, s: 1.3, headRot: -14, jaw, tail: td }), td, { dark: 'rgba(70,30,60,0.42)', rim: '#FFD7A6', rimDx: -9, rimDy: -7 }); });
    if (jaw > 0.2) { const f = Math.floor(t * 12); ctx.save(); ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const r = 80 + ((f * 40 + i * 90) % 270); ctx.globalAlpha = 0.8 * (1 - r / 350); ctx.lineWidth = 9 - i * 2; ctx.beginPath(); ctx.arc(860, 840, r, -0.6, 0.6); ctx.stroke(); } ctx.restore(); }
    if (turn > 0) { ctx.save(); ctx.globalAlpha = turn; ctx.fillStyle = '#F3E8D8'; ctx.fillRect(0, 0, W * turn, H); ctx.restore(); }
  }
  function draw(ctx, t) {
    if (t < P.q1) { ctx.drawImage(arena(), 0, 0); panels(ctx, t); podiums(ctx, t, {}); }
    else if (t < P.reveal1 + 1.6) shotQ1(ctx, t);
    else if (t < P.q2) shotScale(ctx, t);
    else if (t < P.q3) shotQ2(ctx, t);
    else if (t < P.q4) shotRace(ctx, t);
    else if (t < P.pride) shotKing(ctx, t);
    else if (t < P.roar) shotPride(ctx, t);
    else shotRoar(ctx, t);
    vignette(ctx, '20,10,30', 0.32);
  }
  /** cronômetro e velocímetro (interface) */
  function stopwatch(ctx, t, t0, x, y, s) { const e = Math.max(0, t - t0); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = CREAM; ctx.strokeStyle = PLUM; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 100, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = PLUM; ctx.fillRect(-18, -136, 36, 30); ctx.save(); ctx.rotate(e * 2 * Math.PI / 3); ctx.strokeStyle = '#C24E68'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke(); ctx.restore(); ctx.font = '900 34px InterUI'; ctx.textAlign = 'center'; ctx.fillStyle = PLUM; ctx.fillText(e.toFixed(1) + ' s', 0, 52); ctx.restore(); }
  function speedo(ctx, v, x, y) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = PLUM; ctx.beginPath(); ctx.arc(0, 0, 150, Math.PI, 0); ctx.fill(); ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(0, 0, 136, Math.PI, 0); ctx.fill(); ctx.strokeStyle = ACCENT; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, 0, 112, Math.PI, Math.PI + Math.PI * v / 120); ctx.stroke(); ctx.save(); ctx.rotate(Math.PI + Math.PI * v / 120); ctx.strokeStyle = PLUM; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(118, 0); ctx.stroke(); ctx.restore(); ctx.font = '900 46px InterUI'; ctx.textAlign = 'center'; ctx.fillStyle = PLUM; ctx.fillText(Math.round(v) + ' km/h', 0, -26); ctx.restore(); }
  function crown(ctx, x, y, s, k) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * outBack(clamp(k), 2), s * outBack(clamp(k), 2)); ctx.fillStyle = ACCENT; ctx.strokeStyle = PLUM; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(-100, -40); ctx.lineTo(-50, 0); ctx.lineTo(0, -60); ctx.lineTo(50, 0); ctx.lineTo(100, -40); ctx.lineTo(90, 40); ctx.closePath(); ctx.fill(); ctx.stroke(); [-100, 0, 100].forEach((cx, i) => { ctx.fillStyle = i === 1 ? '#C24E68' : '#5AA7E0'; ctx.beginPath(); ctx.arc(cx, i === 1 ? -66 : -46, 13, 0, 6.283); ctx.fill(); }); ctx.restore(); }
  function ui(ctx, t) {
    if (t < P.q1 + 0.4) { const k = (t - P.jingle - 0.2) / 0.3; if (k > 0) { ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.05); const s = outBack(clamp(k), 2.2) * (1 - clamp((t - P.q1) / 0.3)); ctx.scale(s, s); ctx.font = '700 170px Caveat'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.fillStyle = ACCENT; ctx.fillText('Desafio', 8, 8); ctx.strokeStyle = PLUM; ctx.lineWidth = 20; ctx.strokeText('Desafio', 0, 0); ctx.fillStyle = CREAM; ctx.fillText('Desafio', 0, 0); ctx.font = '900 92px InterUI'; ctx.lineWidth = 16; ctx.strokeText('FELINO!', 0, 120); ctx.fillStyle = ACCENT; ctx.fillText('FELINO!', 0, 120); ctx.restore(); } }
    if (t >= P.q1 && t < P.reveal1) uiCard(ctx, t, P.q1 + 0.6, P.reveal1 - 0.1, 'Qual é o maior felino vivo?', 540, 180 + 30, { size: 46 });
    if (t >= P.reveal1 && t < P.q2) uiCard(ctx, t, P.reveal1 + 0.3, P.q2 - 0.1, 'MAIOR FELINO', 540, 300, { size: 60, accent: true, sub: 'TIGRE' });
    if (t >= P.q2 && t < P.q3) { uiCard(ctx, t, P.q2 + 0.4, P.reveal2 - 0.1, 'E o maior da América do Sul?', 540, 210, { size: 44 }); uiCard(ctx, t, P.reveal2 + 1.0, P.q3 - 0.1, 'MAIOR DA AMÉRICA DO SUL', 540, 300, { size: 48, accent: true, sub: 'ONÇA-PINTADA' }); }
    if (t >= P.q3 && t < P.q4) { uiCard(ctx, t, P.q3 + 0.2, P.q4 - 0.1, 'MAIS VELOZ', 540, 300, { size: 56, accent: true, sub: 'GUEPARDO' }); if (t >= P.run) { stopwatch(ctx, t, P.run, 190, 620, 0.9); const v = 100 * sm((t - P.run) / 3) - 2 * (1 + Math.sin(on2s(t) * 3)) * ss((t - P.run - 3) / 0.5); speedo(ctx, v, 790, 680); } }
    if (t >= P.q4 && t < P.pride) { const k = (t - P.crown) / 0.3, out = clamp((t - P.crownOff) / 0.3); if (out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; crown(ctx, 770, 560, 1.1, k); ctx.restore(); } uiCard(ctx, t, P.crown + 0.6, P.crownOff, '"rei dos animais" = apelido popular', 540, 230, { size: 36 }); }
    if (t >= P.pride && t < P.roar) { uiCard(ctx, t, P.pride + 0.4, P.territory - 0.1, 'vive em grupos familiares', 540, 300, { size: 46, accent: true }); uiCard(ctx, t, P.territory + 0.3, P.hunt - 0.05, 'defende seu território', 540, 300, { size: 46 }); uiCard(ctx, t, P.hunt + 0.4, P.males - 0.1, 'leoas caçam em cooperação', 540, 300, { size: 46, accent: true }); uiCard(ctx, t, P.males + 0.3, P.roar - 0.1, 'machos também participam', 540, 300, { size: 46 }); }
  }
  const sfx = (E) => [['TAN-TAN!', E.reveal1, 0.5, 540, 1100, 140, -0.05], ['TCHAN!', E.reveal2, 0.5, 820, 640, 130, 0.08], ['VRUUUM!', E.run + 0.3, 0.6, 330, 1000, 160, -0.1], ['ROOAAR!', E.roar, 0.7, 560, 380, 200, -0.06]];
  CENAS.s12 = { draw, ui, sfx, capY: (t) => (t >= P.q3 && t < P.q4 && t >= P.run ? 1560 - 120 : t >= P.q4 ? 1390 : 1390) };
})();
