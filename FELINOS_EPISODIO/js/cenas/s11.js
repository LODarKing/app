// Cena 11 — Expedição pelo planeta (requisito 9: sete felinos selvagens e suas regiões).
// Mapa-múndi ilustrado; sete pontos acendem; a câmera mergulha em cada região e o mapa vira o habitat de cada espécie
// (com proporções, pelagem e movimento próprios); um mapinha indica a região. No fim tudo se recolhe para dentro do mapa.
'use strict';
(() => {
  const SPC = [
    ['tiger', 'TIGRE', 'ÁSIA', 'Panthera tigris'], ['lion', 'LEÃO', 'ÁFRICA E ÍNDIA', 'Panthera leo'], ['jaguar', 'ONÇA-PINTADA', 'AMÉRICAS', 'Panthera onca'],
    ['cheetah', 'GUEPARDO', 'ÁFRICA E IRÃ', 'Acinonyx jubatus'], ['leopard', 'LEOPARDO', 'ÁFRICA E ÁSIA', 'Panthera pardus'], ['puma', 'SUÇUARANA', 'AMÉRICAS', 'Puma concolor'], ['ocelot', 'JAGUATIRICA', 'AMÉRICAS', 'Leopardus pardalis'],
  ];
  const FOTOK = { tiger: 'tigre', lion: 'leao', jaguar: 'onca', cheetah: 'guepardo', leopard: 'leopardo', puma: 'sucuarana', ocelot: 'jaguatirica' };
  const segOf = (t) => { let i = -1; P.sp.forEach((s, k) => { if (t >= s) i = k; }); return i; };
  const DIVE = 0.9;
  // ---------- habitats
  const plain = () => cachedPainted('s11plain', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#F2C9A0'], [0.42, '#F8E0B8'], [0.5, '#D8B67E'], [1, '#A8844E']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFF2D6'; g.beginPath(); g.arc(1100, 700, 80, 0, 6.283); g.fill();
    for (let i = 0; i < 5; i++) { const x = 100 + i * 320 + rnd(161, i) * 80, y = 930 + rnd(162, i) * 30; g.fillStyle = '#7A5A4E'; g.fillRect(x - 7, y - 120, 14, 120); g.beginPath(); trace(g, smooth([[x - 160, y - 120], [x - 90, y - 156], [x + 90, y - 160], [x + 160, y - 124], [x, y - 104]], true, 4)); g.fill(); }
    for (let i = 0; i < 70; i++) { g.strokeStyle = i % 2 ? '#C9A46E' : '#B08A56'; g.lineWidth = 5; const x = rnd(163, i) * w, y = 1000 + rnd(164, i) * 900; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y - 40 - rnd(165, i) * 40); g.stroke(); }
    g.fillStyle = '#B88A5E'; g.beginPath(); trace(g, smooth([[420, 1330], [500, 1180], [640, 1160], [760, 1200], [820, 1330]], true, 4)); g.fill();   // cupinzeiro
  }, 31, 0.55);
  const mountains = () => cachedPainted('s11mount', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#9EB8D8'], [0.45, '#E8D8E0'], [1, '#B8A890']]); g.fillRect(0, 0, w, h);
    [[0, 900, '#8E8AA8', 0.7], [0, 1050, '#7A7890', 0.9]].forEach(([, y0, c], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 150) g.lineTo(x, y0 - 260 * Math.abs(Math.sin(x * 0.004 + k * 2)) - 120 * rnd(171 + k, x)); g.lineTo(w, h); g.fill(); });
    g.fillStyle = '#F6F2F2'; for (let x = 0; x < w; x += 300) { g.beginPath(); g.moveTo(x + 120, 700); g.lineTo(x + 170, 640 + 30 * rnd(172, x)); g.lineTo(x + 220, 700); g.fill(); }
    for (let i = 0; i < 16; i++) { const x = rnd(173, i) * w, y = 1150 + rnd(174, i) * 200; g.fillStyle = '#4E6A5A'; g.beginPath(); g.moveTo(x, y - 160); g.lineTo(x + 50, y); g.lineTo(x - 50, y); g.fill(); }
    g.fillStyle = '#8A7A6E'; g.beginPath(); trace(g, smooth([[200, 1920], [260, 1450], [480, 1320], [800, 1300], [1000, 1380], [1100, 1920]], true, 4)); g.fill();
    g.fillStyle = '#A8988A'; g.beginPath(); trace(g, smooth([[300, 1500], [500, 1360], [800, 1340], [900, 1420], [600, 1460]], true, 4)); g.fill();
  }, 32, 0.6);
  const leopardTree = () => cachedPainted('s11tree', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#E8B890'], [0.5, '#F2CCA0'], [0.7, '#C8A070'], [1, '#9A7650']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { const x = 200 + i * 380, y = 1060; g.fillStyle = '#8A6A5A'; g.fillRect(x - 6, y - 90, 12, 90); g.beginPath(); g.ellipse(x, y - 100, 120, 26, 0, 0, 6.283); g.fill(); }
    g.fillStyle = '#5E4038'; g.beginPath(); trace(g, smooth([[1250, 1920], [1200, 1300], [1180, 900], [1250, 500], [1350, 500], [1340, 900], [1360, 1300], [1420, 1920]], true, 4)); g.fill();
    g.fillStyle = '#6A4A40'; g.beginPath(); trace(g, smooth([[-50, 1160], [400, 1120], [800, 1110], [1220, 1000], [1260, 1060], [800, 1180], [400, 1196], [-50, 1220]], true, 4)); g.fill();
    g.fillStyle = '#7A5A4A'; g.fillRect(-50, 1112, 1300, 14);
    canopy(g, 1300, 420, 340, '#6E8A5A', '#56704A', 1500, 0.01); canopy(g, 900, 330, 260, '#7E9A66', '#5E7A50', 1501, 0.01);
  }, 33, 0.55);
  const floor = () => cachedPainted('s11floor', 1500, 1920, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#3E5A44'], [0.5, '#5E7A50'], [1, '#4A3E30']]); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { const x = i * 130 + rnd(181, i) * 50; g.fillStyle = '#2E4A38'; g.fillRect(x, 0, 40, 1300); }
    for (let i = 0; i < 40; i++) leafShape(g, rnd(182, i) * w, 900 + rnd(183, i) * 1000, 160 + rnd(184, i) * 100, 44, rnd(185, i) * 6.28, i % 2 ? '#6E9A5E' : '#5A8650', '#467044', 0.01, 1600 + i);
    g.fillStyle = '#6A5440'; g.fillRect(0, 1360, w, 560); for (let i = 0; i < 30; i++) leafShape(g, rnd(186, i) * w, 1380 + rnd(187, i) * 500, 90, 30, rnd(188, i) * 6, i % 2 ? '#C9965A' : '#A8744A', '#8A5E3A', 0.01, 1700 + i);
  }, 34, 0.55);
  function habitat(ctx, i, lt, t) {
    const td = on2s(t);
    if (i === 0) { const cam = { x: 120 * lt, y: 0, zoom: 1 }, wx = 300 + 170 * lt; drawBamboo(ctx, t, cam, () => { camSet(ctx, cam, 1); drawBigCat(ctx, 'tiger', tp(ctx, { x: wx, y: 1330, s: 1.2, walk: (wx - 300) / catStep('tiger', 1.2), moving: 1, tail: td, headRot: 2 * Math.sin(td * 2) }), td, { tint: '#B8C8B0', tintA: 0.1 }); }); }
    if (i === 1) { const cam = { x: 0, y: 0, zoom: 1.04 + 0.02 * lt, fx: 540, fy: 990 }; drawSavanna(ctx, t, cam, () => { camSet(ctx, cam, 1);
      drawBigCat(ctx, 'lioness', tp(ctx, { x: 820, y: 1290, s: 0.55, flip: true, walk: 0, moving: 0, tail: td }), td, { dark: 'rgba(70,30,60,0.3)' });
      drawBigCat(ctx, 'cub', tp(ctx, { x: 640 + 60 * Math.sin(lt * 1.6), y: 1310, s: 0.55, flip: Math.cos(lt * 1.6) < 0, walk: paceDist(60, 1.6, lt) / catStep('cub', 0.55), moving: 1, tail: td * 2 }), td, { dark: 'rgba(70,30,60,0.25)' });
      drawBigCat(ctx, 'cub', tp(ctx, { x: 900 + 40 * Math.sin(lt * 2 + 1), y: 1320, s: 0.5, walk: paceDist(40, 2, lt + 0.5) / catStep('cub', 0.5), moving: 1, tail: td * 2 }), td, { dark: 'rgba(70,30,60,0.25)' });
      drawBigCat(ctx, 'lion', tp(ctx, { x: 260, y: 1356, s: 1.1, headRot: lerp(10, -12, sm(lt / 2.5)), tail: td }), td, { dark: 'rgba(70,30,60,0.38)', rim: '#FFD7A6', rimDx: -8, rimDy: -6 }); }); }
    if (i === 2) { const cam = { x: 90 * lt, y: 0, zoom: 1 }; drawJungle(ctx, t, cam, () => { camSet(ctx, cam, 0.9); ctx.fillStyle = '#6E9EAE'; ctx.fillRect(-900, 1420, 3200, 400); ctx.fillStyle = 'rgba(235,248,255,0.5)'; for (let k = 0; k < 14; k++) ctx.fillRect(-800 + ((k * 230 + lt * 60) % 3000), 1450 + (k % 4) * 60, 90, 6); camSet(ctx, cam, 1); drawBigCat(ctx, 'jaguar', tp(ctx, { x: 260 + 150 * lt, y: 1330, s: 1.15, walk: 150 * lt / catStep('jaguar', 1.15), moving: 1, tail: td }), td, { tint: '#3E6A5A', tintA: 0.12 }); });
      const lw = 1 - sm(lt / 1.0); if (lw > 0) leafShape(ctx, lerp(-200, 1400, 1 - lw), 960, 1500, 640, 0.2, '#3E6A4C', '#2E5440', 0.01, 1777); }
    if (i === 3) { ctx.save(); ctx.translate(-200 - 20 * lt, 0); ctx.drawImage(plain(), 0, 0); ctx.restore(); drawBigCat(ctx, 'cheetah', { x: 470 - 20 * lt, y: 1220, s: 1.15, walk: 0, moving: 0, headRot: 10 * Math.sin(lt * 0.9), tail: td * 0.6, blink: blinkAt(td, [P.sp[3] + 4]) }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,240,200,1)', rimW: 5, rimA: 0.6 } }); }
    if (i === 4) { const wx = 120 + 130 * lt; ctx.save(); ctx.translate(-260 - 30 * lt, 0); ctx.drawImage(leopardTree(), 0, 0); ctx.restore(); drawBigCat(ctx, 'leopard', { x: wx, y: 1108 + 0.08 * (wx - 120) * -0.6, s: 0.95, walk: 160 * lt / catStep('leopard', 0.95), moving: 1, tail: td }, td, { light: { dir: [-1, -0.7], rim: 'rgba(255,236,190,1)', rimW: 5, rimA: 0.6 } }); }
    if (i === 5) { ctx.save(); ctx.translate(-200 - 15 * lt, -40); ctx.drawImage(mountains(), 0, 0); ctx.restore(); cloudsDrift(ctx, t, { y0: 200, y1: 500, n: 3, speed: 18, wrap: 1900, x0: -500 }); drawBigCat(ctx, 'puma', { x: 380, y: 1300, s: 1.05, headRot: lerp(-6, 8, sm(lt / 3)), tail: td * 0.7, blink: blinkAt(td, [P.sp[5] + 3.4]) }, td, { light: { dir: [-1, -0.6], rim: 'rgba(255,245,230,1)', rimW: 5, rimA: 0.6 } }); }
    if (i === 6) { ctx.save(); ctx.translate(-200, 0); ctx.drawImage(floor(), 0, 0); ctx.restore(); const out = clamp(lt / 2.6); drawBigCat(ctx, 'ocelot', { x: lerp(-200, 430, sm(out)), y: 1380, s: 1.0, walk: (lerp(-200, 430, sm(out)) + 200) / catStep('ocelot', 1.0), moving: out < 1 ? 1 : 0, tail: td, headRot: 6 * Math.sin(td) }, td, { light: { dir: [-1, -0.6], rim: 'rgba(230,255,210,1)', rimW: 5, rimA: 0.5 } });
      for (let k = 0; k < 6; k++) leafShape(ctx, 60 + k * 70, 1560, 360, 100, -1.3 + k * 0.18 + 0.06 * Math.sin(t * 1.4 + k), '#3E6A4C', '#2E5440', 0.01, 1800 + k); }
    leafShadows(ctx, t, [0, 900, W, 1020], { alpha: 0.1, seed: 40 + i });
  }
  // close no meio de cada habitat: a cabeça do felino (posição medida nos quadros, acompanha o andar) vai para o ponto (560, 1020)
  const PUNCH = 4.75, HEAD = [(l) => [870 + 50 * (l - PUNCH), 890], () => [527, 1093], (l) => [855 + 60 * (l - PUNCH), 960], (l) => [600 - 20 * (l - PUNCH), 760], null, () => [700, 993], () => [720, 1140]];
  function mapView(ctx, t, cx, cy, z, dots) {
    drawMap(ctx, cx, cy, z, 540, 960, (g) => {
      if (dots) SPC.forEach(([kind], i) => { const k = clamp((t - P.dots[i]) / 0.25); if (k <= 0) return; const [x, y] = rangeCenter(kind); g.fillStyle = '#3B2A45'; g.beginPath(); g.arc(x, y, 92 * outBack(k), 0, 6.283); g.fill(); g.fillStyle = ACCENT; g.beginPath(); g.arc(x, y, 70 * outBack(k), 0, 6.283); g.fill(); });
    });
  }
  function draw(ctx, t) {
    const td = on2s(t), i = segOf(t);
    ctx.fillStyle = '#5E8EA6'; ctx.fillRect(0, 0, W, H);
    if (i < 0) {   // mapa inteiro, sete pontos acendem
      const z = lerp(1.7, 1.25, sm(t / 3)); mapView(ctx, t, MAPW * 0.5, MAPH * 0.47, z, true);
      motes(ctx, t, [0, 0, W, H], { n: 14, seed: 41 });
    } else if (t < P.fold) {
      const lt = t - P.sp[i], kind = SPC[i][0], c = rangeCenter(kind);
      if (lt < DIVE) {   // mergulho no mapa até a região (íris abre para o habitat)
        const k = sm(lt / DIVE), z = lerp(1.25, 7, k * k);
        mapView(ctx, t, lerp(MAPW * 0.5, c[0], sm(Math.min(1, lt / 0.5))), lerp(MAPH * 0.47, c[1], sm(Math.min(1, lt / 0.5))), z, false);
        drawMap(ctx, c[0], c[1], z, 540, 960, (g) => rangeBlob(g, kind, t, clamp(lt / 0.3)));
        const ir = clamp((lt - 0.45) / 0.45); if (ir > 0) { const [hc, hg] = layer('s11hab'); habitat(hg, i, lt + 0.0, t); ctx.save(); ctx.beginPath(); ctx.arc(540, 960, 1150 * easeIn(ir), 0, 6.283); ctx.clip(); ctx.drawImage(hc, 0, 0); ctx.restore(); }
      } else if (HEAD[i] && lt > PUNCH && lt < (P.sp[i + 1] ?? P.fold) - P.sp[i]) {   // segundo plano do habitat: close no felino (algo novo no meio do trecho)
        const [hc, hg] = layer('s11hab'), [hx, hy] = HEAD[i](lt), z = 1.5 + 0.025 * (lt - PUNCH); habitat(hg, i, lt, t);
        const cx = clamp(hx, 560 / z, W - 520 / z), cy = clamp(hy, 1020 / z, H - 900 / z);   // sem mostrar a borda da camada
        ctx.save(); ctx.translate(560, 1020); ctx.scale(z, z); ctx.translate(-cx, -cy); ctx.drawImage(hc, 0, 0); ctx.restore();
      } else habitat(ctx, i, lt, t);
    } else {   // os ambientes se recolhem para dentro do mapa; pontos de interrogação
      const k = sm((t - P.fold) / 1.2);
      mapView(ctx, t, MAPW * 0.5, MAPH * 0.47, lerp(4, 1.25, k), true);
      if (k < 1) { const [hc, hg] = layer('s11hab'); habitat(hg, 6, t - P.sp[6], t); ctx.save(); ctx.beginPath(); ctx.arc(540, 960, 1150 * (1 - k), 0, 6.283); ctx.clip(); ctx.drawImage(hc, 0, 0); ctx.restore(); }
    }
    vignette(ctx, '30,30,60', 0.28);
  }
  function ui(ctx, t) {
    const i = segOf(t);
    if (i < 0) { uiCard(ctx, t, 0.6, P.sp[0], '7 felinos selvagens', 540, 330, { size: 60, accent: true }); return; }
    if (t >= P.fold) { [[300, 600, -0.2], [780, 640, 0.2], [380, 1240, 0.15], [720, 1200, -0.15]].forEach(([x, y, r], k) => { const kk = (t - P.fold - 0.6 - k * 0.15) / 0.2; if (kk <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(outBack(clamp(kk), 2.4), outBack(clamp(kk), 2.4)); ctx.font = '700 230px Caveat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.fillStyle = ACCENT; ctx.fillText('?', 8, 8); ctx.strokeStyle = PLUM; ctx.lineWidth = 22; ctx.strokeText('?', 0, 0); ctx.fillStyle = CREAM; ctx.fillText('?', 0, 0); ctx.restore(); }); return; }
    const lt = t - P.sp[i], [kind, name, region, sci] = SPC[i], end = (P.sp[i + 1] ?? P.fold) - P.sp[i];
    if (lt > DIVE) {
      photoPip(ctx, t, P.sp[i] + DIVE + 0.4, P.sp[i] + end - 0.25, FOTOK[kind], { x: 30, y: 128, w: 420, h: 300, name, sub: region, ly: 196, rot: -0.03 });   // foto real + nome científico
      // mapinha da região (canto superior direito, fora dos botões do Reels)
      const k = clamp((lt - DIVE - 0.3) / 0.3) * (1 - clamp((lt - end + 0.4) / 0.25)); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = PLUM; ctx.beginPath(); ctx.roundRect(704, 124, 340, 182, 18); ctx.fill(); ctx.beginPath(); ctx.roundRect(714, 134, 320, 162, 12); ctx.clip(); ctx.drawImage(mapPainted(), 0, MAPH * 0.06, MAPW, MAPH * 0.78, 714, 134, 320, 162); ctx.translate(714, 134 - 162 * 0.06 / 0.78); ctx.scale(320 / MAPW, 162 / (MAPH * 0.78)); rangeBlob(ctx, kind, t, 1); ctx.restore(); }
    }
  }
  const sfx = (E) => [['VUUUM', E.sp[0], 0.4, 540, 1500 - 300, 120, 0.05]];
  CENAS.s11 = { draw, ui, sfx: () => [], capY: (t) => { const i = segOf(t); return i >= 0 && t < P.fold && t - P.sp[i] > DIVE ? 760 : 1390; } };
})();
