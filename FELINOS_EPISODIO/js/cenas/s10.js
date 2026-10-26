// Cena 10 — Companheiros de verdade (requisito 8: benefícios dos gatos domésticos).
// Fachada de uma casa ao entardecer; a câmera passa pelas janelas acesas (cenas em silhueta): leitura com o gato, carinho de uma pessoa idosa,
// gato vigiando um rato no depósito de grãos, família organizando os cuidados, consulta veterinária -> Lara e os cuidados (ícones)
// -> gato protegido dentro de casa / área externa telada; aves livres lá fora -> Lara faz carinho no Pingo -> pegada no livro.
'use strict';
(() => {
  const SIL = '#3B2A45';
  const facade = () => cachedPainted('s10facade', 4000, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#4E3E6E'], [0.35, '#B0708E'], [0.55, '#E9A07E'], [0.56, '#7E5A66'], [1, '#5E4250']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#C08A76'; g.fillRect(0, 420, w, 1180); for (let y = 440; y < 1600; y += 60) { g.fillStyle = (y / 60) % 2 ? 'rgba(160,100,90,0.25)' : 'rgba(200,140,120,0.18)'; g.fillRect(0, y, w, 4); }
    g.fillStyle = '#6A3E4E'; g.beginPath(); g.moveTo(-40, 440); for (let x = 0; x <= w + 200; x += 400) { g.lineTo(x + 200, 260); g.lineTo(x + 400, 440); } g.fill();
    g.fillStyle = '#5E4A52'; g.fillRect(0, 1600, w, 320); for (let i = 0; i < 30; i++) canopy(g, i * 140 + rnd(141, i) * 60, 1610, 90, '#5E7A5E', '#4A664E', 1300 + i, 0.01);
  }, 27, 0.45);
  const WINX = [500, 1260, 2020, 2780, 3540];
  const room = () => cachedPainted('s10room', 1080, 1920, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#E9C8B0'], [0.6, '#F2D8C0'], [0.61, '#C89A7A'], [1, '#A87A5E']]); g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,240,220,0.5)'; g.fillRect(640, 200, 330, 460); g.fillStyle = '#9A7A6E'; g.fillRect(800, 200, 12, 460); }, 28, 0.5);
  /** pessoa em silhueta (sem rosto), poses simples */
  function silPerson(g, x, y, s, pose, t, o = {}) {
    g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s); g.fillStyle = SIL; g.strokeStyle = SIL; g.lineCap = 'round';
    const head = (hx, hy, r = 46) => { g.beginPath(); g.arc(hx, hy, r, 0, 6.283); g.fill(); if (o.hair === 'long') { g.beginPath(); g.ellipse(hx - 10, hy + 26, 52, 70, 0.2, 0, 6.283); g.fill(); } if (o.hair === 'bun') { g.beginPath(); g.arc(hx + 6, hy - 50, 24, 0, 6.283); g.fill(); } };
    const limbL = (pts, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(...pts[0]); pts.slice(1).forEach((p) => g.lineTo(...p)); g.stroke(); };
    const breath = Math.sin(t * 2) * 3;
    if (pose === 'sitRead') { head(0, -250 + breath); g.beginPath(); g.moveTo(-60, -200); g.lineTo(60, -200); g.lineTo(80, -40); g.lineTo(-80, -40); g.fill(); limbL([[-60, -40], [60, -20], [140, -30]], 46); limbL([[50, -170], [80, -110], [40, -120]], 30); g.fillRect(10, -170, 90, 66); }
    if (pose === 'armchair') { g.beginPath(); g.roundRect(-140, -260, 280, 260, 30); g.fill(); head(0, -310 + breath, 50); limbL([[-40, -230], [0, -140], [70, -130]], 34); }
    if (pose === 'stand') { head(0, -560 + breath); g.beginPath(); g.moveTo(-70, -500); g.lineTo(70, -500); g.lineTo(60, -230); g.lineTo(-60, -230); g.fill(); limbL([[-34, -240], [-40, 0]], 44); limbL([[34, -240], [40, 0]], 44); limbL([[-66, -480], [-110, -350], ...(o.reach ? [[-160, -330]] : [[-96, -260]])], 32); limbL([[66, -480], [110, -360], [o.reach2 ? 170 : 96, o.reach2 ? -380 : -260]], 32); }
    if (pose === 'kid') { head(0, -400 + breath, 40); g.beginPath(); g.moveTo(-50, -350); g.lineTo(50, -350); g.lineTo(44, -160); g.lineTo(-44, -160); g.fill(); limbL([[-24, -170], [-28, 0]], 34); limbL([[24, -170], [28, 0]], 34); limbL([[-48, -330], [-90, -240], [-120, -220]], 26); limbL([[48, -330], [80, -250], [90, -200]], 26); }
    g.restore();
  }
  /** gato sentado em silhueta (de frente) */
  function silCat(g, x, y, s, t, tail = 0) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = SIL; g.beginPath(); trace(g, smooth([[-60, 0], [-70, -90], [-40, -150], [-50, -220], [-62, -260], [-40, -240], [0, -236], [40, -240], [62, -260], [50, -220], [40, -150], [70, -90], [60, 0]], true, 4)); g.fill(); g.lineWidth = 16; g.strokeStyle = SIL; g.lineCap = 'round'; g.beginPath(); g.moveTo(50, -10); g.quadraticCurveTo(120, 0, 110 + 20 * Math.sin(t * 2 + tail), -60); g.stroke(); g.restore(); }
  /** interior de cada janela (luz quente + silhuetas) */
  function windowScene(g, i, t, w, h) {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#FFE2A8'], [1, '#F2B47A']]); g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(200,120,80,0.25)'; g.fillRect(0, h * 0.78, w, h * 0.22);
    if (i === 0) { silPerson(g, w * 0.38, h * 0.82, 0.62, 'sitRead', t, { hair: 'long' }); silCat(g, w * 0.74, h * 0.84, 0.55, t); }
    if (i === 1) { silPerson(g, w * 0.45, h * 0.86, 0.62, 'armchair', t, { hair: 'bun' }); g.save(); g.translate(w * 0.5, h * 0.86 - 0.62 * 150); g.fillStyle = SIL; g.beginPath(); g.ellipse(0, 0, 70, 34, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(60, -24, 26, 0, 6.283); g.fill(); g.restore(); const pet = Math.sin(t * 2.4) * 18; g.strokeStyle = SIL; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.42, h * 0.86 - 160); g.lineTo(w * 0.5 + pet, h * 0.86 - 110); g.stroke(); }
    if (i === 2) {   // depósito de grãos antigo, sacos, um gato vigia um ratinho
      g.fillStyle = '#C98A5A'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,70,40,0.3)'; for (let x = 0; x < w; x += 70) g.fillRect(x, 0, 6, h);
      [[0.18, 0.86], [0.32, 0.86], [0.25, 0.7]].forEach(([fx, fy]) => { g.fillStyle = SIL; g.beginPath(); g.ellipse(w * fx, h * fy, 70, 90, 0, 0, 6.283); g.fill(); });
      const [lc, lg] = layer('s10cat'); drawBigCat(lg, 'pingo', { x: w * 0.62, y: h * 0.88, s: 0.42, walk: 0, moving: 0, headRot: 8, tail: t }, t, { dark: 'rgba(59,42,69,1)' }); g.drawImage(lc, 0, 0);
      const mx = w * 0.9 - 20 * Math.sin(t * 3); g.fillStyle = SIL; g.beginPath(); g.ellipse(mx, h * 0.87, 26, 16, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(mx - 22, h * 0.85, 9, 0, 6.283); g.fill(); g.lineWidth = 4; g.strokeStyle = SIL; g.beginPath(); g.moveTo(mx + 24, h * 0.87); g.quadraticCurveTo(mx + 60, h * 0.84, mx + 70, h * 0.88); g.stroke();
    }
    if (i === 3) {   // família organizando: tigelas de comida e água, brinquedos, caixa de areia
      silPerson(g, w * 0.3, h * 0.88, 0.52, 'stand', t, { reach2: true }); silPerson(g, w * 0.66, h * 0.88, 0.5, 'stand', t, { hair: 'long', reach: true, flip: true }); silPerson(g, w * 0.5, h * 0.88, 0.48, 'kid', t);
      g.fillStyle = SIL; g.fillRect(w * 0.12, h * 0.84, 90, 34); g.beginPath(); g.ellipse(w * 0.84, h * 0.88, 50, 16, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(w * 0.92, h * 0.88, 40, 14, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(w * 0.46 + 30 * Math.sin(t * 3), h * 0.9, 16, 0, 6.283); g.fill();
    }
    if (i === 4) {   // consulta veterinária
      g.fillStyle = '#E8F0EE'; g.fillRect(0, 0, w, h * 0.78); g.fillStyle = SIL; g.fillRect(w * 0.3, h * 0.64, w * 0.44, 24); g.fillRect(w * 0.34, h * 0.64, 20, h * 0.3); g.fillRect(w * 0.66, h * 0.64, 20, h * 0.3);
      silPerson(g, w * 0.2, h * 0.9, 0.52, 'stand', t, { reach2: true }); silPerson(g, w * 0.82, h * 0.9, 0.52, 'stand', t, { reach: true, flip: true, hair: 'bun' }); silCat(g, w * 0.52, h * 0.64, 0.45, t, 1);
      g.strokeStyle = SIL; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.86, h * 0.9 - 0.52 * 480); g.quadraticCurveTo(w * 0.7, h * 0.56, w * 0.6, h * 0.58); g.stroke(); g.fillStyle = '#C24E68'; g.fillRect(w * 0.47, h * 0.18, 40, 120); g.fillRect(w * 0.47 - 40, h * 0.18 + 40, 120, 40);
    }
  }
  function shotHouse(ctx, t) {
    const td = on2s(t), W5 = P.win.concat([P.lara]);
    let idx = 0; for (let i = 0; i < 5; i++) if (t >= W5[i] - 0.6) idx = i;
    const k = sm((t - (W5[idx] - 0.6)) / 0.8), from = idx ? WINX[idx - 1] : WINX[0] - 120, camx = lerp(from, WINX[idx], k) - 540;
    const zin = 1 + 0.25 * sm((t - W5[idx] - 0.6) / (W5[idx + 1] - W5[idx] - 0.8));
    ctx.save(); ctx.translate(540, 1020); ctx.scale(zin, zin); ctx.translate(-540 - camx, -1020);
    ctx.drawImage(facade(), 0, 0);
    WINX.forEach((x, i) => {
      if (Math.abs(x - camx - 540) > 1300) return;
      const ww = 560, wh = 760, wx = x - ww / 2, wy = 640;
      ctx.fillStyle = '#5E3A46'; ctx.fillRect(wx - 30, wy - 30, ww + 60, wh + 60);
      const [vc, vg] = layer('s10win'); vg.save(); windowScene(vg, i, td, ww, wh); vg.restore(); ctx.drawImage(vc, 0, 0, ww, wh, wx, wy, ww, wh);
      ctx.fillStyle = '#5E3A46'; ctx.fillRect(x - 10, wy, 20, wh); ctx.fillRect(wx, wy + wh * 0.45, ww, 16);
      ctx.fillStyle = '#7A4E5A'; ctx.fillRect(wx - 50, wy + wh + 30, ww + 100, 30);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = linear(ctx, 0, wy + wh, 0, wy + wh + 260, [[0, 'rgba(255,200,140,0.35)'], [1, 'rgba(255,200,140,0)']]); ctx.fillRect(wx - 60, wy + wh + 60, ww + 120, 260); ctx.restore();
    });
    ctx.restore();
    cloudsDrift(ctx, t, { y0: 60, y1: 220, n: 3, speed: 10, wrap: 1900, x0: -500, alpha: 0.5 });
    motes(ctx, t, [0, 400, W, 1300], { n: 14, seed: 31, color: '255,220,170' });
  }
  /** Lara e os cuidados (ícones desenhados na interface) */
  function shotLara(ctx, t) {
    const td = on2s(t), tb = talkBeats('lara', t + SCENE_T0);
    ctx.drawImage(room(), 0, 0);
    sunRays(ctx, t, { x: 820, y: 220, ang: -0.6, len: 1400, n: 3, width: 100, alpha: 0.2 });
    drawPerson(ctx, 'lara', { x: 520, y: 1060, s: 1.0, t: td, mouth: voiceL('lara', t), smile: 1, look: [0, 4], tilt: 2 + 3 * tb.nod, brow: tb.brow, blink: blinkAt(td, [P.lara + 1.0, P.lara + 4.3]), armR: { a1: lerp(84, 36, ss((td - P.icons[0] + 0.3) / 0.3)), a2: lerp(100, -30, ss((td - P.icons[0] + 0.3) / 0.3)), open: 1 }, armL: { a1: lerp(96, 150, ss((td - P.icons[2] + 0.3) / 0.3)), a2: lerp(80, 210, ss((td - P.icons[2] + 0.3) / 0.3)), open: 1 } });
    leafShadows(ctx, t, [0, 0, W, H], { alpha: 0.07, seed: 33 });
  }
  function icon(ctx, kind, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = CREAM; ctx.strokeStyle = PLUM; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 92, 0, 6.283); ctx.fill(); ctx.stroke();
    if (kind === 0) { ctx.fillStyle = '#C9566A'; ctx.beginPath(); ctx.moveTo(-60, -6); ctx.lineTo(60, -6); ctx.lineTo(44, 40); ctx.lineTo(-44, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#B8824E'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-40 + i * 16, -12 - (i % 2) * 8, 10, 0, 6.283); ctx.fill(); } }
    if (kind === 1) { ctx.fillStyle = '#5AA7E0'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.bezierCurveTo(30, -20, 46, 10, 40, 30); ctx.arc(0, 30, 40, 0, Math.PI); ctx.bezierCurveTo(-46, 10, -30, -20, 0, -60); ctx.fill(); }
    if (kind === 2) { ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(52, -38); ctx.quadraticCurveTo(50, 30, 0, 62); ctx.quadraticCurveTo(-50, 30, -52, -38); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.save(); ctx.scale(0.3, 0.3); pawPrint(ctx, PLUM, 0, 9); ctx.restore(); }
    if (kind === 3) { ctx.fillStyle = '#C24E68'; ctx.fillRect(-20, -56, 40, 112); ctx.fillRect(-56, -20, 112, 40); }
    ctx.restore();
  }
  /** dentro de casa (janela) e área externa telada; aves livres lá fora */
  function shotSafe(ctx, t) {
    const td = on2s(t), out = sm((t - P.catio) / 1.4);
    const gardenOut = cachedPainted('s10garden', 1080, 1920, (g, w, h) => { g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#A9D0E8'], [0.55, '#DDEFD8'], [0.56, '#8DB07A'], [1, '#6E9064']]); g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) canopy(g, i * 260 + 60, 760 + rnd(151, i) * 60, 200, '#7EA672', '#5E8A5A', 1400 + i, 0.01); }, 29, 0.5);
    ctx.drawImage(gardenOut, 0, 0);
    // aves livres no jardim
    for (let i = 0; i < 4; i++) { const bx = ((i * 270 + td * (40 + i * 10)) % 1300) - 100, by = 1180 + (i % 2) * 120 - Math.abs(Math.sin(td * 6 + i)) * 20; ctx.save(); ctx.translate(bx, by); ctx.fillStyle = ['#C24E68', '#5AA7E0', ACCENT, '#7E9C82'][i]; ctx.beginPath(); ctx.ellipse(0, 0, 28, 20, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(24, -14, 14, 0, 6.283); ctx.fill(); ctx.fillStyle = '#E2A23A'; ctx.beginPath(); ctx.moveTo(36, -16); ctx.lineTo(50, -12); ctx.lineTo(36, -8); ctx.fill(); ctx.fillStyle = SIL; ctx.beginPath(); ctx.arc(28, -17, 3, 0, 6.283); ctx.fill(); ctx.restore(); }
    if (t >= P.birds) for (let i = 0; i < 3; i++) { const k = (td - P.birds) * 0.5 + i * 0.3; ctx.save(); ctx.translate(200 + i * 300 + k * 200, 500 - k * 160 + 30 * Math.sin(k * 8)); ctx.strokeStyle = SIL; ctx.lineWidth = 7; ctx.lineCap = 'round'; const f = Math.sin(td * 14 + i) * 18; ctx.beginPath(); ctx.moveTo(-34, f); ctx.quadraticCurveTo(-16, -10, 0, 0); ctx.quadraticCurveTo(16, -10, 34, f); ctx.stroke(); ctx.restore(); }
    // área externa telada (o Pingo dentro dela), que aparece na abertura da câmera
    ctx.save(); ctx.globalAlpha = out;
    ctx.fillStyle = 'rgba(80,60,60,0.9)'; ctx.fillRect(560, 1160, 460, 22); ctx.fillRect(560, 820, 18, 362); ctx.fillRect(1002, 820, 18, 362); ctx.fillRect(560, 820, 460, 18);
    ctx.strokeStyle = 'rgba(80,60,60,0.45)'; ctx.lineWidth = 3; for (let x = 580; x < 1000; x += 26) { ctx.beginPath(); ctx.moveTo(x, 838); ctx.lineTo(x, 1160); ctx.stroke(); } for (let y = 850; y < 1160; y += 26) { ctx.beginPath(); ctx.moveTo(578, y); ctx.lineTo(1002, y); ctx.stroke(); }
    ctx.restore();
    // dentro de casa: a janela com o Pingo (primeiro plano), some quando a câmera mostra a área telada
    const wall = 1 - out;
    if (wall > 0.01) { ctx.save(); ctx.globalAlpha = wall; ctx.fillStyle = '#E2C2A8'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(170, 330, 740, 900); ctx.fill('evenodd'); ctx.fillStyle = '#9A7A6E'; ctx.fillRect(150, 310, 780, 26); ctx.fillRect(150, 1230, 780, 60); ctx.fillRect(530, 330, 20, 900); ctx.restore(); }
    drawPingo(ctx, { x: lerp(540, 790, out), y: lerp(1300, 1160, out), s: lerp(0.95, 0.42, out), tail: td, look: [7, -3], dilate: 0.6, tilt: 6 * Math.sin(td), earL: -6, earR: -6, blink: blinkAt(td, [P.indoor + 2.4]) });
  }
  function shotPet(ctx, t) {
    const td = on2s(t), stroke = Math.sin((td - P.pet) * 4);
    ctx.drawImage(room(), 0, 0); sunRays(ctx, t, { x: 820, y: 220, ang: -0.6, len: 1400, n: 3, width: 100, alpha: 0.2 });
    ctx.fillStyle = '#8A5E5A'; ctx.beginPath(); ctx.roundRect(560, 1560, 520, 400, 30); ctx.fill(); ctx.fillStyle = '#A8706A'; ctx.beginPath(); ctx.roundRect(540, 1520, 560, 90, 40); ctx.fill();
    drawPerson(ctx, 'lara', { x: 420, y: 1050, s: 0.96, t: td, smile: 1, happy: 1, tilt: 6, look: [8, 8], armR: { a1: 30, a2: 5 + 10 * stroke, open: 1 } });
    drawPingo(ctx, { x: 820, y: 1560, s: 0.62, blink: 0.9, tail: td * 0.5, tilt: -8 + 4 * stroke, headDy: 6 * stroke, earL: 6, earR: 6 });
  }
  function shotPawBook(ctx, t) {
    const td = on2s(t), k = clamp((t - P.pawBook) / 1.3);
    ctx.fillStyle = '#5E4636'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(540, 960); ctx.scale(1.15 + 0.6 * k, 1.15 + 0.6 * k); ctx.translate(-BOOK.PW / 2 - BOOK.PW / 2 + BOOK.PW / 2, 0); ctx.translate(-BOOK.PW / 2 * 0, 0);
    ctx.translate(0, 0); BOOK.bookSpread(ctx, t, { open: 1, riffle: 0, ignite: 0, right: BOOK.pageNotes() }); ctx.restore();
    // a pegada da página acende quando o Pingo toca
    const tk = ss((t - P.pawBook - 0.5) / 0.2); ctx.save(); ctx.translate(540 + 0.5 * 470 * (1.15 + 0.6 * k) * 0, 960); ctx.scale(1 + k, 1 + k); pawPrint(ctx, tk > 0 ? ACCENT : '#C98A6A', 0, 6); ctx.restore();
    if (t < P.pawBook + 0.6) drawPingo(ctx, { x: 540, y: 1900, s: 0.9, look: [0, -8], tilt: 0, tail: td });
    inkBurst(ctx, 540, 960, t, P.pawBook + 0.5, ACCENT, 1.4);
    if (k > 0.6) { ctx.save(); ctx.globalAlpha = (k - 0.6) / 0.4; ctx.fillStyle = '#E9DCC4'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  function draw(ctx, t) {
    if (t < P.lara) shotHouse(ctx, t);
    else if (t < P.indoor) shotLara(ctx, t);
    else if (t < P.pet) shotSafe(ctx, t);
    else if (t < P.pawBook) shotPet(ctx, t);
    else shotPawBook(ctx, t);
    vignette(ctx, '50,25,50', 0.28);
  }
  function ui(ctx, t) {
    if (t >= P.lara && t < P.indoor) { const pos = [[200, 360], [880, 360], [170, 740], [900, 740]], names = ['alimento adequado', 'água limpa', 'segurança', 'veterinário'];
      P.icons.forEach((t0, i) => { const k = (t - t0) / 0.2; if (k <= 0) return; icon(ctx, i, pos[i][0], pos[i][1], outBack(clamp(k), 2) * (t > P.indoor - 0.2 ? 1 - clamp((t - P.indoor + 0.2) / 0.2) : 1)); uiCard(ctx, t, t0 + 0.1, P.indoor - 0.1, names[i], pos[i][0], pos[i][1] + 130, { size: 34, accent: i % 2 === 1 }); }); }
    if (t >= P.indoor && t < P.pet) { uiCard(ctx, t, P.indoor + 1.4, P.catio - 0.1, 'cuidar é amar', 540, 230, { size: 56, accent: true }); uiCard(ctx, t, P.catio + 0.4, P.pet - 0.1, 'dentro de casa ou em área externa segura', 540, 230, { size: 34 }); uiCard(ctx, t, P.birds + 0.4, P.pet - 0.1, 'preserva a fauna silvestre', 540, 330, { size: 42, accent: true }); }
  }
  const sfx = (E) => [['ronrom', E.pet + 0.4, 1.2, 860, 1000, 110, 0.08]];
  CENAS.s10 = { draw, ui, sfx };
})();
