// Cena 09 — Quatro estrelas do mundo doméstico (requisito 7: quatro raças e temperamentos).
// O livro vira um palquinho: persa (calmo, não quer brincar), siamês (comunicativo, segue a Lara), maine coon (enorme, Miguel se espanta),
// angorá turco (ativo, salta entre plataformas; o Pingo tenta seguir) -> os quatro juntos numa foto (flash).
'use strict';
(() => {
  const stage = () => cachedPainted('s09stage', 1080, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#4A3A5E'], [0.55, '#8A5E7A'], [0.62, '#A8705E'], [1, '#7A4E40']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#B07A5E' : '#A46E54'; g.fillRect(0, 1190 + i * 82, w, 78); }
    g.fillStyle = 'rgba(255,230,190,0.18)'; g.beginPath(); g.ellipse(540, 1330, 470, 110, 0, 0, 6.283); g.fill();
  }, 26, 0.5);
  function curtains(ctx, t, open = 1) {
    [-1, 1].forEach((sd) => {
      const x0 = sd < 0 ? 0 : W, w = lerp(560, 150, open);
      ctx.save(); const P0 = [[x0, -20], [x0 - sd * w, -20]]; ctx.fillStyle = '#7A2E44';
      ctx.beginPath(); ctx.moveTo(x0, -20); ctx.lineTo(x0 - sd * w, -20); for (let y = 0; y <= 1900; y += 60) ctx.lineTo(x0 - sd * (w + 18 * Math.sin(y * 0.01 + t * 0.8)) + sd * (y > 1100 ? (y - 1100) * 0.08 * open : 0), y); ctx.lineTo(x0, 1900); ctx.fill();
      ctx.fillStyle = 'rgba(40,10,25,0.35)'; for (let k = 1; k < 4; k++) { const xx = x0 - sd * w * k / 4; ctx.fillRect(xx - 8, -20, 16, 1920); }
      ctx.restore();
    });
    ctx.fillStyle = '#6A2438'; ctx.beginPath(); for (let x = 0; x <= W; x += 90) { ctx.moveTo(x, 0); ctx.arc(x + 45, 40, 45, Math.PI, 0, true); } ctx.fillRect(0, 0, W, 40); ctx.fill();
  }
  function spot(ctx, x, a = 0.5) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = linear(ctx, x, 0, x, 1400, [[0, `rgba(255,236,200,${a})`], [1, 'rgba(255,236,200,0)']]); ctx.beginPath(); ctx.moveTo(x - 60, 0); ctx.lineTo(x + 60, 0); ctx.lineTo(x + 360, 1400); ctx.lineTo(x - 360, 1400); ctx.fill(); ctx.restore(); }
  function cushion(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = 'rgba(40,20,30,0.3)'; ctx.beginPath(); ctx.ellipse(0, 40, 300, 40, 0, 0, 6.283); ctx.fill(); flat(ctx, [[-290, 20], [-240, -50], [0, -70], [240, -50], [290, 20], [250, 60], [0, 70], [-250, 60]], '#5E7EB0', 6); ctx.fillStyle = '#4E6E9E'; ctx.beginPath(); ctx.ellipse(0, 10, 220, 30, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = ACCENT; [-290, 290].forEach((tx) => { ctx.beginPath(); ctx.arc(tx, 20, 16, 0, 6.283); ctx.fill(); }); ctx.restore(); }
  /** letreiro: placa com lâmpadas alternando na batida (luz no mundo, sem brilho de interface) */
  function marquee(ctx, t, k) {
    if (k <= 0) return; const s = outBack(clamp(k), 1.8);
    ctx.save(); ctx.translate(540, 300); ctx.scale(s, s);
    ctx.fillStyle = '#3B2A45'; ctx.beginPath(); ctx.roundRect(-460, -150, 920, 300, 30); ctx.fill(); ctx.fillStyle = '#F2B451'; ctx.beginPath(); ctx.roundRect(-440, -130, 880, 260, 22); ctx.fill(); ctx.fillStyle = '#7A2E44'; ctx.beginPath(); ctx.roundRect(-418, -108, 836, 216, 16); ctx.fill();
    const beat = Math.floor(t * 4); for (let i = 0; i < 28; i++) { const ang = i / 28; const x = ang < 0.5 ? lerp(-430, 430, ang * 2) : lerp(430, -430, (ang - 0.5) * 2), y = ang < 0.5 ? -120 : 120; ctx.fillStyle = (i + beat) % 2 ? '#FFF2C8' : '#C98A3A'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }
  function shotPersa(ctx, t) {
    const td = on2s(t), k = t - P.persa;
    ctx.drawImage(stage(), 0, 0); spot(ctx, 540, 0.45);
    cushion(ctx, 540, 1330, 1.0);
    drawHouseCat(ctx, 'persa', { x: 540, y: 1310, s: 0.78, crouch: 0.55, blink: keys(td, [[P.persa, 0.55], [P.persa + 4, 0.55], [P.persa + 4.4, 1], [P.persa + 5.2, 1], [P.persa + 5.6, 0.55]]), dilate: 0.3, tail: td * 0.4, tilt: 4 * Math.sin(td * 0.5), meow: bell(td, P.persa + 8.2, 0.5) * 0.6 });
    // Pingo chega convidando para brincar (agacha e balança o traseiro), o persa nem liga
    const pin = clamp((td - P.persa - 2.0) / 1.0), play = ss((td - P.persa - 3.0) / 0.3) * (1 - ss((td - P.persa - 9.5) / 0.4));
    drawPingo(ctx, { x: lerp(1300, 860, sm(pin)), y: 1420, s: 0.5, crouch: 0.8 * play, wiggle: play * Math.sin(td * 14) * 0.8, dilate: 0.9 * play + 0.3, earL: -10 * play, earR: -10 * play, tilt: lerp(0, -18, play), tail: td * 2, look: [-8, 0] });
    curtains(ctx, t, ss((t - P.sign) / 1.2));
  }
  function shotSiames(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(stage(), 0, 0);
    // janela com cortininha (o siamês fica no parapeito)
    ctx.fillStyle = '#6A4A5E'; ctx.fillRect(250, 360, 580, 760); ctx.fillStyle = '#BCD6E8'; ctx.fillRect(280, 390, 520, 700); ctx.fillStyle = '#9AB0C8'; ctx.fillRect(280, 860, 520, 230);
    cloudsDrift(ctx, t, { y0: 420, y1: 620, n: 2, speed: 20, wrap: 900, x0: 120, alpha: 0.9 });
    ctx.fillStyle = '#6A4A5E'; ctx.fillRect(532, 390, 16, 700); ctx.fillRect(280, 730, 520, 14); ctx.fillStyle = '#8A6A6E'; ctx.fillRect(220, 1100, 640, 40);
    spot(ctx, 540, 0.3);
    // Lara atravessa o palco; o siamês acompanha com a cabeça, falando
    const lx = lerp(-200, 330, sm((td - P.siames) / 1.4)) + 300 * sm((td - P.siames - 6.5) / 4);
    const look = clamp((lx - 540) / 40, -9, 9), talk = Math.abs(Math.sin(td * 9)) * (Math.floor(td * 2) % 3 !== 2 ? 1 : 0);
    drawHouseCat(ctx, 'siames', { x: 540, y: 1100, s: 0.62, look: [look, 2], tilt: look * 1.2, meow: talk * 0.8, tail: td * 1.6, dilate: 0.35, earL: -6 * talk, earR: -6 * talk, blink: blinkAt(td, [P.siames + 3.1, P.siames + 8.4]) });
    drawPerson(ctx, 'lara', { x: lx, y: 1300, s: 0.78, t: td, mouth: voiceL('lara', t), smile: 1, look: [8, -3], turn: 0.4, tilt: 4, legs: false, blink: blinkAt(td, [P.siames + 2.0]), happy: bell(td, P.siames + 3.3, 0.3) > 0.5 ? 1 : 0, armR: { a1: 60, a2: 0, open: 1 } });
    curtains(ctx, t, 1);
  }
  function shotMaine(ctx, t) {
    const td = on2s(t), up = sm((td - P.maine - 1.2) / 0.8), pull = sm((t - P.maine - 1.0) / 1.6), z = lerp(1.7, 1.0, pull);
    ctx.drawImage(stage(), 0, 0); spot(ctx, 540, 0.4);
    ctx.save(); ctx.translate(540, 1400); ctx.scale(z, z); ctx.translate(-540, -1400);
    // a caixinha pequena (ele se escondia atrás dela)
    drawHouseCat(ctx, 'mainecoon', tp(ctx, { x: 540, y: 1420, s: lerp(0.5, 1.15, up), crouch: 1 - up, tail: td, dilate: 0.35, look: [0, 0], blink: blinkAt(td, [P.maine + 4.0]), tilt: 3 * Math.sin(td * 0.8) }));
    ctx.fillStyle = '#C8955E'; ctx.fillRect(400, 1300, 280, 160); ctx.fillStyle = '#B07E4A'; ctx.fillRect(400, 1300, 60, 160); ctx.fillStyle = '#D9A86E'; ctx.beginPath(); ctx.moveTo(400, 1300); ctx.lineTo(680, 1300); ctx.lineTo(660, 1260); ctx.lineTo(420, 1260); ctx.fill();
    drawPingo(ctx, tp(ctx, { x: 860, y: 1440, s: 0.42, tail: td, look: [-7, -6], tilt: -12, dilate: 0.9 * up, earL: -8 * up, earR: -8 * up }));
    ctx.restore();
    curtains(ctx, t, 1);
    const sur = ss((td - P.maine - 1.5) / 0.2) * (1 - ss((td - P.maine - 5) / 0.6));
    if (t > P.maine + 1.4) drawPerson(ctx, 'miguel', { x: 230, y: 1250, s: 0.72, t: td, mouth: voiceL('miguel', t), surprise: sur, brow: Math.max(sur, 0.3), smile: 0.6, look: [9, -4], turn: 0.4, armL: { a1: 150, a2: -120, open: sur }, armR: { a1: 40, a2: -60, open: sur }, blink: blinkAt(td, [P.maine + 6.2]) });
  }
  // plataformas do angorá: ele corre e salta de uma para outra; o Pingo tenta acompanhar
  const PLAT = [[150, 700, 260], [560, 900, 280], [880, 1150, 240], [500, 1380, 1000]];
  function runPath(u) {   // u: 0..1 ao longo do percurso (x, y no topo das plataformas, com arcos de salto)
    const seg = Math.min(3, Math.floor(u * 4)), k = u * 4 - seg;
    if (seg >= 3) { const [x, y] = PLAT[3]; return [lerp(PLAT[2][0], 160, k), y - 300 * Math.sin(Math.PI * Math.min(1, k * 2.2)) * (k < 0.45 ? 1 : 0), k < 0.45 ? 'gallop' : 'walk', -1]; }
    const a = PLAT[seg], b = PLAT[seg + 1], run = k < 0.55, x = run ? lerp(a[0] - a[2] / 2, a[0] + a[2] / 2, k / 0.55) : lerp(a[0] + a[2] / 2, b[0] - b[2] / 2, (k - 0.55) / 0.45), y = run ? a[1] : lerp(a[1], b[1], (k - 0.55) / 0.45) - 200 * Math.sin(Math.PI * (k - 0.55) / 0.45);
    return [x, y, run ? 'gallop' : 'gallop', b[0] > a[0] ? 1 : -1];
  }
  function shotAngora(ctx, t) {
    const td = on2s(t);
    ctx.drawImage(stage(), 0, 0); spot(ctx, 540, 0.3);
    PLAT.slice(0, 3).forEach(([x, y, w]) => { ctx.fillStyle = 'rgba(40,20,30,0.3)'; ctx.fillRect(x - w / 2 + 14, y + 14, w, 40); ctx.fillStyle = '#C89A78'; ctx.fillRect(x - w / 2, y, w, 34); ctx.fillStyle = '#A87A5A'; ctx.fillRect(x - w / 2, y + 34, w, 16); ctx.fillStyle = '#8A6A5A'; ctx.fillRect(x - 10, y + 50, 20, 1380 - y - 50); });
    const u = clamp((td - P.angora - 0.3) / 5.2), [ax, ay, gait, dir] = runPath(u);
    drawBigCat(ctx, 'angora', { x: ax, y: ay, s: 0.62, flip: dir < 0, walk: td * 2.6, moving: u < 1 ? 1 : 0, gait: u < 1 ? gait : 'walk', tail: td * 2 }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,240,220,1)', rimW: 4, rimA: 0.6 } });
    const pu = clamp((td - P.angora - 1.4) / 6.5), [px, py, , pdir] = runPath(pu * 0.92), fall = bell(td, P.angora + 4.6, 0.25);
    drawBigCat(ctx, 'pingo', { x: px, y: py + 40 * fall, s: 0.55, flip: pdir < 0, walk: td * 1.6, moving: pu < 1 ? 1 : 0, tail: td, headRot: -20 * fall }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,240,220,1)', rimW: 4, rimA: 0.5 } });
    curtains(ctx, t, 1);
  }
  // os quatro juntos, como numa fotografia; flash; vira foto presa na parede
  function shotPhoto(ctx, t) {
    const td = on2s(t), fl = clamp((t - P.flash) / 0.12), shrink = sm((t - P.flash - 0.15) / 0.9);
    const [pc, pg] = layer('s09photo');
    pg.drawImage(stage(), 0, 0); spot(pg, 540, 0.4);
    cushion(pg, 540, 1440, 1.25);
    drawHouseCat(pg, 'mainecoon', { x: 760, y: 1360, s: 0.7, tail: td, dilate: 0.3, look: [-3, 2], blink: blinkAt(td, [P.photo + 0.6]) });
    drawHouseCat(pg, 'persa', { x: 320, y: 1380, s: 0.6, crouch: 0.5, blink: 0.55, tail: td * 0.4 });
    drawHouseCat(pg, 'siames', { x: 560, y: 1440, s: 0.5, tail: td, look: [0, 2], meow: 0.3 });
    drawHouseCat(pg, 'angora', { x: 900, y: 1500, s: 0.48, tail: td, look: [-4, 0] });
    drawPingo(pg, { x: 180, y: 1540, s: 0.42, tail: td, look: [6, -2], tilt: 10 });
    curtains(pg, t, 1);
    ctx.fillStyle = '#C9A88A'; ctx.fillRect(0, 0, W, H);   // parede da casa
    const s = lerp(1, 0.62, shrink), x = 540 - W * s / 2, y = 900 - H * s / 2 + 60 * shrink, rot = lerp(0, -0.05, shrink);
    ctx.save(); ctx.translate(540, 900); ctx.rotate(rot); ctx.translate(-540, -900);
    if (shrink > 0) { ctx.fillStyle = 'rgba(40,20,30,0.3)'; ctx.fillRect(x + 16, y + 20, W * s, H * s * 0.86 + 120 * s); ctx.fillStyle = '#FBF6EE'; ctx.fillRect(x - 30 * s, y - 30 * s, W * s + 60 * s, H * s * 0.86 + 160 * s); }
    ctx.drawImage(pc, 0, H * 0.14 * shrink, W, H * (1 - 0.14 * shrink), x, y, W * s, H * s * (1 - 0.14 * shrink));
    if (shrink > 0.5) { ctx.fillStyle = '#C24E68'; ctx.beginPath(); ctx.arc(540, y - 10, 18, 0, 6.283); ctx.fill(); }
    ctx.restore();
    if (fl > 0 && fl < 1) { ctx.fillStyle = `rgba(255,255,250,${1 - fl})`; ctx.fillRect(0, 0, W, H); }
  }
  function draw(ctx, t) {
    if (t >= P.persa + 6.5 && t < P.persa + 11) {   // close no persa (o bocejo de perto), depois volta ao plano aberto
      const [c, g] = layer('s09close'), z = 1.75 + 0.04 * (t - P.persa - 6.5); shotPersa(g, t);
      ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-560, -1060); ctx.drawImage(c, 0, 0); ctx.restore();
    } else if (t < P.siames) shotPersa(ctx, t);
    else if (t < P.maine) shotSiames(ctx, t);
    else if (t < P.angora) shotMaine(ctx, t);
    else if (t < P.photo) shotAngora(ctx, t);
    else shotPhoto(ctx, t);
    vignette(ctx, '40,15,30', 0.3);
  }
  function ui(ctx, t) {
    if (t < P.persa + 2.5) { ctx.save(); marquee(ctx, t, (t - P.sign - 0.2) / 0.4); ctx.restore(); if (t > P.sign + 0.4) { ctx.save(); ctx.font = '900 60px InterUI'; ctx.textAlign = 'center'; ctx.fillStyle = CREAM; const s = 'CONHEÇA 4 RAÇAS'; ctx.fillText(s, 540, 290); ctx.font = '900 44px InterUI'; ctx.fillStyle = ACCENT; ctx.fillText('DE GATOS!', 540, 350); ctx.restore(); } }
    const tag = (t0, t1, a, b) => uiCard(ctx, t, t0, t1, a, 540, 330, { size: 62, accent: true, sub: b });
    tag(P.persa + 3.0, P.siames - 0.15, 'PERSA', 'calmo e dócil');
    tag(P.siames + 3.4, P.maine - 0.15, 'SIAMÊS', 'comunicativo e sociável');
    tag(P.maine + 4.6, P.angora - 0.15, 'MAINE COON', 'grande e sociável');
    tag(P.angora + 1.0, P.angora + 6.4, 'ANGORÁ TURCO', 'ativo e curioso');
    if (t >= P.angora + 6.5 && t < P.photo) uiCard(ctx, t, P.angora + 6.6, P.photo - 0.1, 'cada gato tem sua personalidade', 540, 330, { size: 42 });
  }
  const sfx = (E) => [['miau!', E.siames + 0.4, 0.4, 820, 820, 120, 0.12], ['miau!', E.siames + 1.2, 0.4, 260, 880, 110, -0.1], ['miau?', E.siames + 9.0, 0.5, 820, 820, 120, 0.12], ['TCHUM!', E.angora + 4.0, 0.4, 820, 980, 130, 0.1], ['CLIQUE!', E.flash, 0.5, 540, 600, 170, -0.05], ['bocejo...', E.persa + 8.0, 0.8, 300, 1000, 100, -0.08]];
  CENAS.s09 = { draw, ui, sfx };
})();
