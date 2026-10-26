// Atmosfera viva dos cenários: sombras de folhas que passeiam, feixes de sol que respiram, poeira na luz,
// nuvens em deriva, árvores balançando ao vento e folhagem de primeiro plano. Tudo função pura de t, ruído com semente.
'use strict';
/** textura de sombra de folhagem (manchas suaves), em cache */
function leafShadowTex(seed = 1) {
  return cached('leafSh' + seed, 768, 768, (g, w, h) => {
    g.filter = 'blur(10px)'; g.fillStyle = 'rgba(40,20,60,0.85)';
    for (let i = 0; i < 70; i++) { const x = rnd(seed, i) * w, y = rnd(seed + 1, i) * h, r = 18 + rnd(seed + 2, i) * 46; for (let dx = -w; dx <= w; dx += w) for (let dy = -h; dy <= h; dy += h) { g.beginPath(); g.ellipse(x + dx, y + dy, r * 1.4, r, rnd(seed + 3, i) * 3, 0, 6.283); g.fill(); } }
  });
}
/** sombras de folhas sobre uma área (mesa, chão, personagens): duas camadas em velocidades diferentes, como galhos ao vento */
function leafShadows(ctx, t, rect, o = {}) {
  const { alpha = 0.22, scale = 1, seed = 1, wind = 1 } = o, [x, y, w, h] = rect;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalCompositeOperation = 'multiply';
  [[0, 1, 0.6], [1, 1.7, 0.4]].forEach(([k, sc, a]) => {
    const tex = leafShadowTex(seed + k), S = 768 * scale * sc, ox = (Math.sin(t * 0.35 * wind + k * 2) * 40 + t * 6 * wind) * sc, oy = Math.cos(t * 0.27 * wind + k) * 26 * sc;
    ctx.globalAlpha = alpha * a * 2;
    for (let yy = y - S + ((oy % S) + S) % S; yy < y + h; yy += S) for (let xx = x - S + ((ox % S) + S) % S; xx < x + w; xx += S) ctx.drawImage(tex, xx, yy, S, S);
  });
  ctx.restore();
}
/** feixes de sol (pinceladas largas e suaves), intensidade respirando */
function sunRays(ctx, t, o = {}) {
  const { x = 200, y = -100, ang = 0.35, len = 2200, n = 5, width = 140, color = '255,232,190', alpha = 0.22, seed = 4 } = o;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * width * 1.6 + Math.sin(t * 0.21 + i * 1.7) * 30, wv = width * (0.5 + rnd(seed, i)), a = alpha * (0.55 + 0.45 * Math.sin(t * 0.6 + i * 2.1 + rnd(seed, i) * 6));
    const dx = Math.sin(ang), dy = Math.cos(ang), px = x + off, py = y;
    ctx.fillStyle = linear(ctx, px, py, px + dx * len, py + dy * len, [[0, `rgba(${color},${a})`], [0.7, `rgba(${color},${a * 0.35})`], [1, `rgba(${color},0)`]]);
    ctx.beginPath(); ctx.moveTo(px - wv * 0.3, py); ctx.lineTo(px + wv * 0.3, py); ctx.lineTo(px + dx * len + wv, py + dy * len); ctx.lineTo(px + dx * len - wv, py + dy * len); ctx.fill();
  }
  ctx.restore();
}
/** poeira/pólen flutuando na luz: poucos pontos, deriva lenta, cintilando (não é explosão de partículas) */
function motes(ctx, t, rect, o = {}) {
  const { n = 26, seed = 7, color = '255,240,200', size = 3, alpha = 0.7, drift = [8, -14] } = o, [x, y, w, h] = rect;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const px = x + (((rnd(seed, i) * w + t * drift[0] * (0.5 + rnd(seed + 1, i)) + Math.sin(t * 0.8 + i) * 12) % w) + w) % w, py = y + (((rnd(seed + 2, i) * h + t * drift[1] * (0.5 + rnd(seed + 3, i))) % h) + h) % h;
    const tw = 0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.9), r = size * (0.6 + rnd(seed + 4, i));
    ctx.fillStyle = `rgba(${color},${alpha * tw})`; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill();
  }
  ctx.restore();
}
/** nuvens pintadas em deriva (cada uma com sua velocidade) */
function cloudSprite(i) {
  return cached('cloud' + i, 520, 170, (g, w, h) => {
    g.fillStyle = 'rgba(255,240,232,0.75)'; g.beginPath(); trace(g, smooth(ell(w / 2, h * 0.6, w * 0.44, h * 0.22, 10).map((p, k) => [p[0], p[1] - (k > 5 ? rnd(i, k) * 40 : 0)]))); g.fill();
    g.fillStyle = 'rgba(255,250,245,0.6)'; g.beginPath(); g.ellipse(w * 0.42, h * 0.5, w * 0.2, h * 0.18, 0, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(200,170,200,0.35)'; g.beginPath(); g.ellipse(w * 0.55, h * 0.72, w * 0.36, h * 0.08, 0, 0, 6.283); g.fill();
  });
}
function cloudsDrift(ctx, t, o = {}) {
  const { y0 = 120, y1 = 520, n = 4, speed = 14, seed = 2, wrap = 1700, x0 = -400, alpha = 1 } = o;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) { const sp = speed * (0.6 + rnd(seed, i) * 0.8), x = x0 + ((rnd(seed + 1, i) * wrap + t * sp) % wrap), y = lerp(y0, y1, rnd(seed + 2, i)), sc = 0.7 + rnd(seed + 3, i) * 0.7; ctx.drawImage(cloudSprite(i % 4), x, y, 520 * sc, 170 * sc); }
  ctx.restore();
}
/** árvore pintada em cache (copa + tronco), desenhada balançando pela base do tronco */
function treeSprite(key, r, fill, shade, trunk = '#6A5560') {
  return cached('tree' + key, Math.ceil(r * 2.6), Math.ceil(r * 3.4), (g, w, h) => {
    const cx = w / 2, cy = r * 1.15; g.fillStyle = trunk; g.beginPath(); trace(g, [[cx - 16, cy + r * 0.3], [cx + 16, cy + r * 0.3], [cx + 20, h], [cx - 20, h]]); g.fill();
    canopy(g, cx, cy, r, fill, shade, 900 + key.length * 7 + r | 0, 0.01);
    g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,236,200,0.28)'; g.beginPath(); g.ellipse(cx - r * 0.35, cy - r * 0.4, r * 0.55, r * 0.35, -0.4, 0, 6.283); g.fill(); g.restore();
  });
}
function swayTree(ctx, t, x, y, r, o = {}) {
  const { fill = '#7E9C82', shade = '#5F7A6E', seed = 1, amp = 1.6, key = `${r}_${fill}` } = o, spr = treeSprite(key, r, fill, shade);
  const a = (amp * Math.sin(t * 0.9 + seed * 1.7) + amp * 0.4 * Math.sin(t * 2.3 + seed)) * Math.PI / 180;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.drawImage(spr, -spr.width / 2, -spr.height); ctx.restore();
}
/** folhas de primeiro plano nas bordas do quadro, balançando (moldura natural; levemente desfocadas) */
function foliageFG(ctx, t, o = {}) {
  const { x = 0, y = 0, s = 1, side = 1, n = 6, fill = '#3E6A4C', shade = '#2E5440', seed = 600, blur = 4, alpha = 1 } = o;
  const [lc, lg] = layer('fg'); lg.translate(x, y); lg.scale(s * side, s);
  for (let i = 0; i < n; i++) { const a = -0.9 + i * 0.32 + 0.07 * Math.sin(t * 1.3 + i + seed) + 0.03 * Math.sin(t * 3.1 + i * 2); leafShape(lg, 0, 0, 260 + rnd(seed, i) * 160, 64 + rnd(seed + 1, i) * 26, a, fill, shade, 0.01, seed + i); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; if (blur) ctx.filter = `blur(${blur}px)`;
  const R = 700 * s; ctx.drawImage(lc, Math.max(0, x - R), Math.max(0, y - R), 2 * R, 2 * R, Math.max(0, x - R), Math.max(0, y - R), 2 * R, 2 * R); ctx.restore();
}
/** vinheta pintada (escurece as bordas na cor da cena) */
function vignette(ctx, color = '40,20,50', a = 0.35) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = radial(ctx, W / 2, H * 0.48, H * 0.3, H * 0.75, [[0, `rgba(${color},0)`], [1, `rgba(${color},${a})`]]); ctx.fillRect(0, 0, W, H); ctx.restore();
}
