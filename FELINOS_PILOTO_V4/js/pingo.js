// Pingo no estilo de referência: traço fino, cor chapada + uma sombra de célula, listras como formas planas.
'use strict';
const PG = { fur: '#E8975A', shade: '#BC6A50', stripe: '#C2703F', white: '#F5ECE4', whiteShade: '#CDB8C6', earIn: '#E9A3A3', nose: '#E88B98', iris: '#8CC152', irisShade: '#5E9A3A' };
const SH = [12, 10];   // direção da sombra (luz vindo do alto à esquerda)

function catEye(ctx, rx, ry, o) {
  const { blink = 0, dilate = 0.3, look = [0, 0], lw = 3, glow = 0, seed = 1 } = o;
  const open = 1 - clamp(blink);
  ctx.save();
  if (open > 0.04) {
    ctx.save(); ctx.scale(1, open);
    const eye = ell(0, 0, rx, ry, 16);
    inkShape(ctx, eye, { fill: PG.iris, shade: PG.irisShade, shadeOff: [-rx * 0.25, -ry * 0.35], lw, seed, wob: 0.5, noLine: true });
    clipTo(ctx, smooth(eye), () => {
      const pw = rx * lerp(0.14, 0.6, dilate), ph = ry * lerp(0.86, 0.72, dilate);
      ctx.fillStyle = '#1C1420'; ctx.beginPath(); ctx.ellipse(look[0], look[1], pw, ph, 0, 0, Math.PI * 2); ctx.fill();
      if (glow > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(190,255,120,${0.65 * glow})`; ctx.beginPath(); ctx.ellipse(look[0], look[1] + ph * 0.1, pw * 0.85, ph * 0.85, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(look[0] - rx * 0.32, look[1] - ry * 0.34, rx * 0.17, ry * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    });
    inkShape(ctx, eye, { lw, seed, wob: 0.5, feature: true });
    ctx.restore();
  }
  // pálpebra fechando: linha curva
  if (blink > 0.04) { const y = lerp(-ry, ry * 0.15, clamp(blink)); inkLine(ctx, [[-rx * 1.05, y], [0, y + ry * 0.25 * blink], [rx * 1.05, y]], { lw: lw * 1.1, seed: seed + 3, wob: 0.4 }); }
  ctx.restore();
}

function pingoHead(ctx, p, lw) {
  const earR = (p.earR || 0) * Math.PI / 180, earL = (p.earL || 0) * Math.PI / 180;
  [[-1, earL], [1, earR]].forEach(([sd, rot]) => {
    ctx.save(); ctx.translate(sd * 82, -92); ctx.rotate(sd * rot); ctx.translate(-sd * 82, 92);
    inkShape(ctx, [[sd * 132, -50], [sd * 126, -150], [sd * 114, -210, 1], [sd * 70, -150], [sd * 28, -110]], { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 20 + sd });
    inkShape(ctx, [[sd * 112, -74], [sd * 110, -150], [sd * 104, -180, 1], [sd * 72, -134], [sd * 52, -110]], { fill: PG.earIn, lw: lw * 0.6, seed: 22 + sd, noLine: true });
    ctx.restore();
  });
  const head = [[-134, -18], [-118, -80], [-72, -116], [0, -126], [72, -116], [118, -80], [134, -18], [150, 28], [166, 52, 1], [126, 70], [70, 98], [0, 108], [-70, 98], [-126, 70], [-166, 52, 1], [-150, 28]];
  const hp = inkShape(ctx, head, { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 30, noLine: true });
  clipTo(ctx, hp, () => {
    // listras do "M" na testa e das bochechas como formas planas
    ctx.fillStyle = PG.stripe;
    [[-30, 0.9], [0, 1.1], [30, 0.9]].forEach(([x, w], i) => { ctx.beginPath(); trace(ctx, smooth([[x * 1.15 - 8 * w, -130], [x * 1.15 + 8 * w, -130], [x * 0.9 + 3, -74 + (i === 1 ? 6 : 0), 1], [x * 0.9 - 3, -74 + (i === 1 ? 6 : 0), 1]], true, 4)); ctx.fill(); });
    [-1, 1].forEach((sd) => [[14, 9], [38, 8]].forEach(([y, w]) => { ctx.beginPath(); trace(ctx, smooth([[sd * 176, y - w], [sd * 120, y + 2, 1], [sd * 176, y + w]], true, 4)); ctx.fill(); }));
    // focinho e queixo brancos
    inkShape(ctx, [[-70, 46], [-44, 16], [0, 24], [44, 16], [70, 46], [48, 82], [0, 98], [-48, 82]], { fill: PG.white, shade: PG.whiteShade, shadeOff: [10, 14], lw: lw * 0.7, seed: 31, noLine: true });
  });
  inkShape(ctx, head, { lw, seed: 30 });
  brushStrokes(ctx, [-170, -130, 170, 110], { seed: 31, n: 90, len: 18, w: 4, ang: -0.3 });
  [-1, 1].forEach((sd) => { ctx.save(); ctx.translate(sd * 57, -20); catEye(ctx, 44, 41, { blink: p.blink || 0, dilate: p.dilate ?? 0.3, look: p.look || [0, 0], lw, glow: p.glow || 0, seed: 40 + sd }); ctx.restore(); });
  inkShape(ctx, [[-16, 22, 1], [16, 22, 1], [0, 38, 1]], { fill: PG.nose, lw: lw * 0.6, seed: 50, n: 4, feature: true, line: '#7A3A40' });
  const m = clamp(p.meow || 0);
  if (m > 0.03) inkShape(ctx, [[-18, 50], [0, 46], [18, 50], [12, 52 + 30 * m], [0, 56 + 34 * m], [-12, 52 + 30 * m]], { fill: '#8E3A48', lw: lw * 0.8, seed: 51 });
  inkLine(ctx, [[0, 38], [0, 48]], { lw: lw * 0.8, seed: 52 });
  inkLine(ctx, [[0, 48], [-12, 57], [-27, 50]], { lw: lw * 0.8, seed: 53 });
  inkLine(ctx, [[0, 48], [12, 57], [27, 50]], { lw: lw * 0.8, seed: 54 });
  [-1, 1].forEach((sd) => [0, 1, 2].forEach((k) => inkLine(ctx, [[sd * 48, 58 + k * 8], [sd * 120, 46 + k * 16], [sd * 200, 46 + k * 34]], { lw: lw * 0.55, seed: 60 + k + sd * 5, line: '#3A2C36' })));
}

/** Pingo sentado de frente. p: {x, y, s, tilt, blink, dilate, look, earL, earR, crouch, wiggle, meow, tail, glow} */
function drawPingo(dst, p) {
  const [lc, ctx] = layer('pingo');
  const s = p.s, lw = 3.2 / s, cr = clamp(p.crouch || 0), sx = lerp(1, 1.1, cr), sy = lerp(1, 0.8, cr), wig = p.wiggle || 0;
  ctx.save(); ctx.translate(p.x + wig * 10 * s, p.y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(40,20,40,0.28)'; ctx.beginPath(); ctx.ellipse(0, 4, 180 * sx, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.scale(sx, sy);
  [-1, 1].forEach((sd) => inkShape(ctx, ell(sd * 98, -80, 74, 90, 12), { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 70 + sd }));
  const body = inkShape(ctx, [[-100, -20], [-118, -122], [-102, -232], [-70, -312], [0, -338], [70, -312], [102, -232], [118, -122], [100, -20], [0, -6]], { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 72 });
  clipTo(ctx, body, () => { ctx.fillStyle = PG.stripe; [-1, 1].forEach((sd) => { for (let k = 0; k < 3; k++) { ctx.beginPath(); trace(ctx, smooth([[sd * 140, -276 + k * 58], [sd * 84, -246 + k * 58, 1], [sd * 140, -256 + k * 58]], true, 4)); ctx.fill(); } }); });
  inkShape(ctx, [[-74, -326], [0, -352], [74, -326], [70, -240], [40, -196], [0, -170], [-40, -196], [-70, -240]], { fill: PG.white, shade: PG.whiteShade, shadeOff: [10, 14], lw, seed: 74 });
  [-1, 1].forEach((sd) => {
    const leg = inkShape(ctx, limb([[sd * 48, -214], [sd * 47, -130], [sd * 46, -40]], [31, 29, 27]), { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 76 + sd });
    clipTo(ctx, leg, () => { ctx.fillStyle = PG.stripe; [-140, -104].forEach((y) => { ctx.beginPath(); trace(ctx, smooth([[sd * 14, y - 6], [sd * 86, y], [sd * 14, y + 6]], true, 3)); ctx.fill(); }); });
    inkShape(ctx, ell(sd * 47, -22, 40, 25, 12), { fill: PG.white, shade: PG.whiteShade, shadeOff: [8, 8], lw, seed: 78 + sd });
    [-14, 2, 18].forEach((dx, k) => inkLine(ctx, [[sd * 47 + dx, -30], [sd * 47 + dx * 1.05, -10]], { lw: lw * 0.7, seed: 80 + k }));
  });
  const tt = p.tail || 0, sw = Math.sin(tt * 2.4) * 18, sw2 = Math.sin(tt * 2.4 - 0.9) * 28;
  const tc = smooth([[104, -46], [162, -24], [150, 8], [70, 20], [-30, 18], [-112 + sw, -4 + sw2 * 0.3], [-140 + sw2, -52 + sw2 * 0.2]], false, 5);
  const tail = inkShape(ctx, limb(tc, tc.map((_, i) => lerp(24, 16, i / (tc.length - 1)))), { fill: PG.fur, shade: PG.shade, shadeOff: [6, 8], lw, seed: 84, n: 2 });
  clipTo(ctx, tail, () => { ctx.fillStyle = PG.stripe; for (let i = 4; i < tc.length - 2; i += 6) { const a = tc[i], b = tc[i + 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(an); ctx.fillRect(-30, -6, 60, 12); ctx.restore(); } });
  ctx.restore();
  brushStrokes(ctx, [-200, -360, 200, 30], { seed: 77, n: 170, len: 26, w: 5, ang: 1.45 });
  ctx.translate(0, lerp(-436, -350, cr) + (p.headDy || 0)); ctx.rotate((p.tilt || 0) * Math.PI / 180);
  pingoHead(ctx, p, lw);
  ctx.restore();
  painterize(lc, [s, 0, 0, s, p.x, p.y], [-240, -660, 240, 40], { seed: 11, tex: 0.9, edge: 0.6, edgeBlur: 2.5 * s });
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, 0, 0); dst.restore();
}

/** Pingo saltando em direção à câmera */
function drawPingoLeap(dst, p) {
  const [lc, ctx] = layer('pingoLeap');
  const s = p.s, lw = 3.2 / s;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s);
  [-1, 1].forEach((sd) => { inkShape(ctx, limb([[sd * 60, -30], [sd * 92, 40], [sd * 104, 96]], [44, 34, 28]), { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 90 + sd }); inkShape(ctx, ell(sd * 108, 112, 34, 26, 10), { fill: PG.white, shade: PG.whiteShade, lw, seed: 92 + sd }); });
  inkShape(ctx, ell(0, -60, 135, 125, 14), { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 94 });
  inkShape(ctx, [[-64, -150], [0, -175], [64, -150], [44, -40], [0, 0], [-44, -40]], { fill: PG.white, shade: PG.whiteShade, lw, seed: 95 });
  ctx.save(); ctx.translate(0, -240); pingoHead(ctx, { ...p, earL: -14, earR: -14 }, lw); ctx.restore();
  [-1, 1].forEach((sd) => {
    const x = sd * 160, y = -30;
    inkShape(ctx, limb([[sd * 70, -150], [sd * 120, -90], [x, y]], [40, 40, 44]), { fill: PG.fur, shade: PG.shade, shadeOff: SH, lw, seed: 96 + sd });
    inkShape(ctx, ell(x, y + 10, 70, 60, 14), { fill: PG.white, shade: PG.whiteShade, lw, seed: 98 + sd });
    inkShape(ctx, [[x - 30, y + 24], [x, y + 4], [x + 30, y + 24], [x + 22, y + 50], [x, y + 56], [x - 22, y + 50]], { fill: '#E58C9C', lw: lw * 0.8, seed: 99 });
    [-40, -14, 14, 40].forEach((dx, i) => inkShape(ctx, ell(x + dx, y - 18 - (i === 1 || i === 2 ? 12 : 0), 12, 15, 8), { fill: '#E58C9C', lw: lw * 0.8, seed: 100 + i }));
  });
  ctx.restore();
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, 0, 0); dst.restore();
}
