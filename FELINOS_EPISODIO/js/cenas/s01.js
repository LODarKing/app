// Cena 01 — O segredo do gatinho (piloto v3 aprovado, com os tempos da narração gravada e fundos vivos).
'use strict';
(() => {
// Piloto v3 — FELINOS: uma aventura selvagem! (cena 1 do roteiro, 0–12 s, 120 bpm).
// Contrato: renderFrame(ctx, t) depende só de t. Personagens animados "em dois" (12 desenhos/s); câmera a 60 fps.


// ============================================================ A. olhos no escuro (0–2,5 s)
function shotEyes(ctx, t) {
  const td = on2s(t);
  ctx.fillStyle = '#120C17'; ctx.fillRect(0, 0, W, H);
  const k = clamp((t - P.push) / (P.cut1 - P.push)), z = 1 + 15 * Math.pow(k, 2.6), m = sm(k);
  const S = 3.4, ex = 734, ey = 872, cx = lerp(ex, 540, m), cy = lerp(ey, 960, m);
  const ox = cx + (540 - ex) * z, oy = cy + (940 - ey) * z, sc = S * z;          // cabeça centrada em (540, 940) quando z = 1
  const open = keys(td, [[0, 0.22], [0.42, 0.22], [0.5, 1]], easeOut) * (1 - 0.9 * Math.sin(clamp((td - 1.0) / 0.17) * Math.PI));
  // contraluz lilás atrás da cabeça: a silhueta (orelhas) já se lê no primeiro quadro
  { const [c, g] = layer('sil'); g.translate(ox, oy); g.scale(sc, sc); pingoHead(g, { blink: 1 }, 3.2 / sc); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#05030A'; g.fillRect(0, 0, W, H);
    ctx.fillStyle = radial(ctx, 540, 520, 40, 900, [[0, 'rgba(150,110,190,0.75)'], [1, 'rgba(18,12,23,0)']]); ctx.fillRect(0, 0, W, H); ctx.drawImage(c, 0, 0); }
  const light = 0.7 * ss((t - P.light) / 0.5);
  const dil = lerp(1, 0.02, ss((td - P.light) / 0.4)), glow = 1 - ss((t - P.light) / 0.45);
  const pp = { blink: 1 - open, dilate: dil, look: [0, 0], meow: bell(td, P.meow + 0.15, 0.12) * 0.7, earR: -20 * bell(td, P.meow + 0.1, 0.1) };
  if (light > 0.01) {
    const [c, g] = layer('eyesHead'); g.translate(ox, oy); g.scale(sc, sc); pingoHead(g, pp, 3.2 / sc);
    ctx.drawImage(c, 0, 0);
    ctx.fillStyle = radial(ctx, 540, 900, 80 * z, 1000, [[0, `rgba(18,12,23,${1 - light})`], [1, `rgba(18,12,23,${1 - light * 0.45})`]]); ctx.fillRect(0, 0, W, H);
  }
  [-1, 1].forEach((sd) => {
    ctx.save(); ctx.translate(ox + sd * 57 * sc, oy - 20 * sc); ctx.scale(sc, sc);
    if (glow > 0.02) glowSpot(ctx, 0, 0, 120, `rgba(170,240,110,${(0.32 + 0.5 * bell(t, 0.52, 0.06)) * glow * open})`);
    catEye(ctx, 44, 41, { blink: 1 - open, dilate: dil, lw: 3.2 / sc, glow, seed: 40 + sd });
    ctx.restore();
  });
  let beat = 0; for (const h of P.heart) beat = Math.max(beat, bell(t, h + 0.04, 0.08));
  ctx.fillStyle = radial(ctx, 540, 900, 300, 1250, [[0, 'rgba(0,0,0,0)'], [1, `rgba(60,10,40,${0.35 + 0.35 * beat})`]]); ctx.fillRect(0, 0, W, H);
}

// ============================================================ B. Pingo na mesa (2,5–6,0 s)
const PINGO = { x: 540, y: 1335, s: 1.42 };
function pingoPose(t) {
  const crouch = ss((t - P.crouch) / 0.3), twitch = bell(t, P.boing, 0.07);
  return {
    ...PINGO, tail: t * (1 + crouch * 2.5),
    tilt: keys(t, [[P.cut1, -3], [P.tilt, 0], [P.tilt + 0.25, 16], [P.boing, 16], [P.boing + 0.25, 2], [P.leap, 0]], outBack),
    blink: Math.max(blinkAt(t, [2.9]), keys(t, [[P.slowBlink, 0], [P.slowBlink + 0.22, 1], [P.slowBlink + 0.38, 1], [P.slowBlink + 0.6, 0]])),
    dilate: keys(t, [[P.cut1, 0.25], [P.crouch, 0.3], [P.crouch + 0.2, 1]]), look: keys(t, [[P.cut1, [0, 0]], [P.crouch, [0, 0]], [P.crouch + 0.2, [0, -5]]]),
    earL: -14 * twitch + 8 * crouch, earR: -28 * twitch + 8 * crouch, crouch,
    wiggle: crouch * Math.sin((t - P.crouch) * 30) * ss((t - P.crouch - 0.15) / 0.1), headDy: -14 * twitch,
  };
}
function shotTable(ctx, t) {
  const td = on2s(t), rev = easeOut((t - P.cut1) / 0.5), lk = ss((t - P.leap) / 0.4);
  const cam = { x: 2 * Math.sin(t * 0.8), y: 0, zoom: lerp(2.6, 1.0, rev) + 0.05 * ss((t - P.tilt) / 1.5) + 0.12 * lk, fx: 540, fy: lerp(PINGO.y - 440 * PINGO.s, 980, rev) };
  drawStudySet(ctx, t, cam);
  camSet(ctx, cam, 1);
  if (t < P.leap + 0.02) { const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); const pp = pingoPose(td); drawPingo(ctx, { ...pp, x: M.a * pp.x + M.e, y: M.d * pp.y + M.f, s: pp.s * M.a }); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  leafShadows(ctx, t, [0, 700, W, H - 700], { alpha: 0.14, seed: 3 }); motes(ctx, t, [0, 300, W, 1200], { n: 18, seed: 5 });
  // luz da tarde entrando pela esquerda
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = linear(ctx, 0, 0, W, H, [[0, 'rgba(255,214,170,0.55)'], [1, 'rgba(120,80,140,0.35)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function leapLayer(ctx, t) {
  const td = on2s(t), k = clamp((td - P.leap) / (P.cover + 0.17 - P.leap)); if (t < P.leap || k >= 1) return;
  const s = PINGO.s * (1 + 10 * Math.pow(k, 2.6)), up = -3000 * ss((k - 0.72) / 0.28);
  const [c, g] = layer('leap'); drawPingoLeap(g, { x: 540, y: lerp(PINGO.y - 140, 1500, sm(k)) + up, s, dilate: 1 });
  const dark = 0.62 * ss((k - 0.35) / 0.3); if (dark > 0) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(48,26,56,${dark})`; g.fillRect(0, 0, W, H); }
  ctx.drawImage(c, 0, 0);
}

// ============================================================ C–E. os grandes felinos
const CAT_S = 1.3, GROUND = 1330;
const walkX = (t, t0, x0, Tc, stride, dir = 1) => x0 + dir * (stride / (0.6 * Tc)) * CAT_S * (t - t0);
function shotJaguar(ctx, t) {
  const td = on2s(t), t0 = P.cover - 0.2, Tc = 0.92, wx = walkX(td, t0, 380, Tc, 140), pan = 0.55 * (walkX(t, t0, 380, Tc, 140) - 380);
  const cam = { x: pan, y: 0, zoom: 1 + 0.03 * (t - P.cover) };
  drawJungle(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'jaguar', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, walk: (td - t0) / Tc, moving: 1, headRot: 3 + 3 * Math.sin(td * 3), tail: td }, td, { tint: '#3E6A5A', tintA: 0.14 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function shotTiger(ctx, t) {
  const td = on2s(t), t0 = P.whip - 0.25, Tc = 0.96, wx = walkX(td, t0, 720, Tc, 160, -1), pan = 0.5 * (walkX(t, t0, 720, Tc, 160, -1) - 720);
  const cam = { x: pan, y: 0, zoom: 1 };
  drawBamboo(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'tiger', { x: M.a * wx + M.e, y: M.d * GROUND + M.f, s: CAT_S * M.a, flip: true, walk: (td - t0) / Tc, moving: 1, headRot: 2 + 2 * Math.sin(td * 2.6), tail: td }, td, { tint: '#B8C8B0', tintA: 0.12 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function shotLion(ctx, t) {
  const td = on2s(t), k = clamp((t - P.cut4) / (P.cut5 - P.cut4)), zoom = 1.04 + 0.26 * sm(k) + 0.08 * ss((t - P.roar) / 0.25);
  const raise = sm((td - P.raise) / 0.25), jaw = sm((td - P.roar) / 0.1) * (1 - sm((td - P.roarEnd + 0.08) / 0.08));
  let shake = 0; { const d = t - P.roar; if (d > 0 && d < 0.45) shake = Math.sin(d * 75) * 14 * (1 - d / 0.45); }
  const cam = { x: -shake, y: shake * 0.4, zoom, fx: 640, fy: 990 };
  drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1); const M = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0); drawBigCat(ctx, 'lion', { x: M.a * 300 + M.e, y: M.d * 1356 + M.f, s: 1.3 * M.a, headRot: lerp(24, -14, raise), jaw, tail: td }, td, { dark: 'rgba(70,30,60,0.45)', rim: '#FFD7A6', rimDx: -9, rimDy: -7 }); });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // ondas do rugido desenhadas (arcos a pincel)
  if (jaw > 0.2) { const f = Math.floor(t * 12); ctx.save(); ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const r = 80 + ((f * 40 + i * 90) % 270); ctx.globalAlpha = 0.8 * (1 - r / 350); ctx.lineWidth = 9 - i * 2; ctx.beginPath(); ctx.arc(820, 850, r, -0.6, 0.6); ctx.stroke(); } ctx.restore(); }
  // quadro de impacto (2 desenhos em alto contraste no início do rugido)
  if (t >= P.roar && t < P.roar + 2 / 12) {
    const [c, g] = layer('impact'); g.drawImage(LAYERS.cat, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#1A0F1E'; g.fillRect(0, 0, W, H);
    ctx.fillStyle = '#E0306A'; ctx.fillRect(0, 0, W, H); ctx.drawImage(c, 0, 0);
    if (LAYERS.catRim) ctx.drawImage(LAYERS.catRim, 0, 0);
    ctx.save(); ctx.strokeStyle = CREAM; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.lineWidth = 12 - i * 2; ctx.beginPath(); ctx.arc(820, 850, 120 + i * 80, -0.7, 0.7); ctx.stroke(); } ctx.restore();
  }
}

// ============================================================ F. pegadas e título nas páginas do Diário (9–12 s)
const PAWS = [[190, 1730, 0.25], [400, 1590, 0.4], [620, 1720, 0.25], [840, 1560, 0.45]];
function shotTitle(ctx, t) {
  const dk = clamp((t - P.dive) / (P.dur - P.dive)), dz = 1 + 24 * Math.pow(dk, 2.4), O = [PAWS[3][0], PAWS[3][1] + 16];
  ctx.save(); ctx.translate(O[0], O[1]); ctx.scale(dz, dz); ctx.translate(-O[0], -O[1]);
  const push = 1 + 0.03 * (t - P.cut5);
  ctx.save(); ctx.translate(540, 960); ctx.scale(push, push); ctx.translate(-540, -960); ctx.drawImage(diaryPages(), -110, -90); ctx.restore();
  // pegadas carimbando a página, de baixo para cima
  PAWS.forEach(([x, y, r], i) => {
    const t0 = P.paws[i], k = (t - t0) / 0.12; if (k <= 0) return;
    const s = k < 1 ? lerp(1.9, 1, easeIn(k)) : 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s * 1.05, s * 1.05); ctx.globalAlpha = clamp(k * 2);
    pawPrint(ctx, ACCENT, 0, 90 + i); ctx.restore();
    inkBurst(ctx, x, y, t, t0 + 0.1, PLUM);
  });
  // "Felinos" escrito à mão (revelado da esquerda para a direita, com a ponta da pena)
  const wk = clamp((t - P.write) / 0.7), fadeOut = 1 - ss(dk / 0.25);
  ctx.save(); ctx.globalAlpha = fadeOut; ctx.translate(120, 700); ctx.rotate(-0.06);
  ctx.font = '700 300px Caveat'; ctx.textBaseline = 'alphabetic';
  const tw = ctx.measureText('Felinos').width;
  ctx.save(); ctx.beginPath(); ctx.rect(-20, -320, (tw + 40) * wk, 420); ctx.clip();
  ctx.fillStyle = PLUM; ctx.fillText('Felinos', 0, 0); ctx.restore();
  if (wk > 0 && wk < 1) { ctx.fillStyle = PLUM; ctx.beginPath(); ctx.arc(-10 + (tw + 20) * wk, -90 + Math.sin(wk * 30) * 50, 8, 0, 6.283); ctx.fill(); }
  // sublinhado em âmbar e estrelinha desenhada (como no título de "Brilhante")
  const uk = clamp((t - P.write - 0.7) / 0.2);
  if (uk > 0) { ctx.strokeStyle = ACCENT; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); const u = smooth([[10, 50], [tw * 0.45, 66], [tw * 0.95, 40]], false, 12); trace(ctx, u.slice(0, Math.max(2, Math.floor(u.length * uk))), false); ctx.stroke(); }
  const sk = clamp((t - P.write - 0.85) / 0.15);
  if (sk > 0) { ctx.save(); ctx.translate(tw + 30, -230); ctx.rotate(0.2); ctx.scale(sk, sk); ctx.strokeStyle = PLUM; ctx.lineWidth = 7; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI * 2 / 5; ctx.lineTo(Math.cos(a) * 34, Math.sin(a) * 34); } ctx.closePath(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  ctx.restore();
  ctx.restore();
  // a câmera atravessa a pegada: o coxim vira janela para a próxima cena (área de estudos)
  if (dk > 0) {
    const sc = 1.05 * dz * 0.86, pad = [[-52, 40], [-40, 0], [0, -14], [40, 0], [52, 40], [30, 66], [0, 58], [-30, 66]].map(([x, y]) => { const c = Math.cos(PAWS[3][2]), s = Math.sin(PAWS[3][2]), xx = x * c - (y - 16) * s, yy = x * s + (y - 16) * c; return [O[0] + xx * sc, O[1] + yy * sc]; });
    ctx.save(); ctx.beginPath(); trace(ctx, smooth(pad)); ctx.clip(); const [nc, ng] = layer('next'); const pe = P; P = SCENE_EV('s02'); CENAS.s02.draw(ng, 0.0, P); P = pe; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(nc, 0, 0); ctx.restore();
  }
}

function titleUI(ctx, t) {
  if (t < P.cut5) return;
  const dk = clamp((t - P.dive) / (P.dur - P.dive)), dz = 1 + 24 * Math.pow(dk, 2.4), O = [PAWS[3][0], PAWS[3][1] + 16], fadeOut = 1 - ss(dk / 0.25);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(O[0], O[1]); ctx.scale(dz, dz); ctx.translate(-O[0], -O[1]);
  // subtítulo datilografado no ritmo; especialidade com a insígnia oficial carimbada
  ctx.save(); ctx.globalAlpha = fadeOut;
  const sub = 'UMA AVENTURA SELVAGEM!', nk = Math.floor(clamp((t - P.sub) / 0.45) * sub.length);
  ctx.font = '900 58px InterUI'; ctx.fillStyle = PLUM; ctx.textAlign = 'left'; ctx.fillText(sub.slice(0, nk), 130, 880);
  const ek = (t - P.en) / 0.12;
  if (ek > 0) {
    const s = ek < 1 ? lerp(1.8, 1, easeIn(ek)) : 1, img = document.getElementById('insignia');
    ctx.save(); ctx.translate(215, 1040); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.clip(); ctx.drawImage(img, -85, -85, 170, 170); ctx.restore();
    const en = 'Especialidade EN-024', nn = Math.floor(clamp((t - P.en - 0.1) / 0.35) * en.length);
    ctx.font = '800 56px InterUI'; ctx.fillStyle = PLUM; ctx.fillText(en.slice(0, nn), 320, 1060);
  }
  const bk = (t - P.cut5 - 0.2) / 0.12;
  if (bk > 0) {
    const s = bk < 1 ? lerp(1.8, 1, easeIn(bk)) : 1, img = document.getElementById('emblema');
    ctx.save(); ctx.translate(200, 300); ctx.rotate(-0.08); ctx.scale(s, s); ctx.drawImage(img, -75, -76, 150, 153); ctx.restore();
    const sr = 'SÉRIE ESPECIALIDADES', sr2 = 'DOS DESBRAVADORES', n1 = Math.ceil(clamp((t - P.cut5 - 0.3) / 0.3) * sr.length), n2 = Math.ceil(clamp((t - P.cut5 - 0.6) / 0.3) * sr2.length);
    ctx.font = '800 48px InterUI'; ctx.fillStyle = PLUM; ctx.textAlign = 'left'; ctx.fillText(sr.slice(0, n1), 300, 288); ctx.fillText(sr2.slice(0, n2), 300, 346);
  }
  ctx.restore();
}
/** textos de interface desenhados depois do filtro (nítidos no celular) */
function uiLayer(ctx, t) {
  speciesTag(ctx, t, P.cover + 0.25, P.whip, 'ONÇA-PINTADA', 'Panthera onca', 600, 640, 240);
  speciesTag(ctx, t, P.whip + 0.2, P.cut4, 'TIGRE', 'Panthera tigris', 520, 620, 230);
  speciesTag(ctx, t, P.cut4 + 0.12, P.cut5, 'LEÃO', 'Panthera leo', 330, 560, 300);
  titleUI(ctx, t);
}


  const sfx = (E) => [
    ['TUM', E.heart[0], 0.42, 300, 1250, 190, -0.12], ['TUM!', E.heart[1], 0.45, 760, 1380, 230, 0.1],
    ['miau...', E.meow, 0.6, 740, 470, 120, 0.12], ['BOING!', E.boing, 0.5, 780, 560, 150, 0.16],
    ['FIUUU!', E.leap, 0.5, 280, 620, 170, -0.14], ['ROOAAR!', E.roar, 0.4, 600, 300, 210, -0.06],
  ];

  function draw(ctx, t) {
    if (t < P.cut1) shotEyes(ctx, t);
    else if (t < P.cover) shotTable(ctx, t);
    else if (t < P.cut4) {
      const wk = clamp((t - P.whip) / 0.16), e = sm(wk);
      if (t < P.whip + 0.16) { const [c, g] = layer('jag'); shotJaguar(g, t); ctx.save(); ctx.setTransform(1, 0, 0, 1, -1080 * e, 0); ctx.drawImage(c, 0, 0); ctx.restore(); }
      if (t >= P.whip) { const [c, g] = layer('tig'); g.fillStyle = '#8FA068'; g.fillRect(0, 0, W, H); shotTiger(g, t); ctx.save(); ctx.setTransform(1, 0, 0, 1, 1080 * (1 - e), 0); ctx.drawImage(c, 0, 0); ctx.restore(); }
      speedLines(ctx, t, bell(t, P.whip + 0.06, 0.08), 540, 900, false);
    } else if (t < P.cut5) shotLion(ctx, t);
    else shotTitle(ctx, t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    speedLines(ctx, t, ss((t - P.leap - 0.05) / 0.1) * (1 - ss((t - P.cover) / 0.08)));
    leapLayer(ctx, t);
  }
  CENAS.s01 = { draw, ui: (ctx, t) => uiLayer(ctx, t), sfx, capY: (t) => (t < P.cut1 ? 1390 : 1400), blur: (t) => (t > P.whip - 0.04 && t < P.whip + 0.2) || t > P.dive };
})();
