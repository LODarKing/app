// Mapa-múndi ilustrado (projeção equirretangular) a partir de LAND (mundo.js) e as regiões de cada espécie (ilustrativas).
'use strict';
const MAPW = 4320, MAPH = 2160;
const proj = (lon, lat) => [(lon + 180) / 360 * MAPW, (90 - lat) / 180 * MAPH];
/** áreas de ocorrência (aproximadas, para indicar a região no mapa): manchas em [lon, lat, raio em graus] */
const RANGES = {
  tiger: [[78, 22, 9], [88, 25, 6], [100, 15, 6], [102, 2, 5], [134, 47, 6], [95, 27, 5]],
  lion: [[20, 2, 12], [32, -8, 12], [24, -20, 10], [10, 12, 8], [36, -2, 8], [70.8, 21.2, 3]],
  jaguar: [[-62, -6, 12], [-57, -17, 7], [-90, 17, 6], [-84, 11, 5], [-72, 3, 8]],
  cheetah: [[36, 0, 7], [24, -22, 8], [18, -20, 6], [2, 22, 5], [56, 33, 3]],
  leopard: [[20, 0, 12], [30, -16, 10], [78, 20, 8], [100, 15, 7], [45, 38, 4], [120, 40, 4]],
  puma: [[-112, 42, 10], [-122, 52, 6], [-100, 25, 7], [-70, -32, 7], [-62, -12, 10], [-80, 2, 6]],
  ocelot: [[-60, -10, 11], [-95, 19, 5], [-75, 5, 8], [-52, -22, 6], [-86, 13, 5]],
};
function mapPainted() {
  return cachedPainted('mapa', MAPW, MAPH, (g, w, h) => {
    g.fillStyle = linear(g, 0, 0, 0, h, [[0, '#5E8EA6'], [0.5, '#6E9EB2'], [1, '#5A86A0']]); g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(230,240,245,0.18)'; g.lineWidth = 4; g.setLineDash([18, 22]);
    for (let lat = -60; lat <= 80; lat += 20) { const y = proj(0, lat)[1]; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let lon = -180; lon <= 180; lon += 30) { const x = proj(lon, 0)[0]; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.setLineDash([]);
    const path = (dx, dy) => { g.beginPath(); LAND.forEach((r) => { r.forEach(([lo, la], i) => { const [x, y] = proj(lo, la); if (i) g.lineTo(x + dx, y + dy); else g.moveTo(x + dx, y + dy); }); g.closePath(); }); };
    path(10, 14); g.fillStyle = 'rgba(40,50,70,0.35)'; g.fill();
    path(0, 0); g.fillStyle = '#DCCB9C'; g.fill(); g.strokeStyle = '#8A7A5A'; g.lineWidth = 6; g.stroke();
    // relevo e vegetação pintados (manchas verdes nas faixas tropicais, areia nos desertos)
    g.save(); path(0, 0); g.clip();
    [[-62, -6, 20, '#8DAA78'], [20, 0, 18, '#8DAA78'], [105, 5, 14, '#8DAA78'], [80, 22, 10, '#A8B884'], [15, 22, 18, '#E8D29A'], [130, -25, 16, '#E2C88E'], [-100, 40, 16, '#B8BC88'], [90, 55, 30, '#A8B890'], [10, 50, 14, '#A8B890']].forEach(([lo, la, r, c]) => { const [x, y] = proj(lo, la); g.globalAlpha = 0.35; g.fillStyle = radial(g, x, y, 0, r * 12, [[0, c], [1, 'rgba(220,203,156,0)']]); g.beginPath(); g.arc(x, y, r * 12, 0, 6.283); g.fill(); g.globalAlpha = 1; });
    g.restore();
  }, 30, 0.35);
}
/** desenha a mancha da área de ocorrência de uma espécie (coordenadas do mapa), pulsando */
function rangeBlob(g, kind, t, a = 1) {
  g.save(); g.globalAlpha = a; (RANGES[kind] || []).forEach(([lo, la, r], i) => { const [x, y] = proj(lo, la), R = r * 12 * (1 + 0.06 * Math.sin(t * 3 + i)); g.fillStyle = 'rgba(242,180,81,0.55)'; g.beginPath(); g.ellipse(x, y, R, R * 0.85, 0, 0, 6.283); g.fill(); g.strokeStyle = '#B5651D'; g.lineWidth = 6; g.setLineDash([16, 10]); g.stroke(); g.setLineDash([]); });
  g.restore();
}
/** centro aproximado da área (para a câmera mergulhar) */
function rangeCenter(kind) { const R = RANGES[kind]; let x = 0, y = 0; R.forEach(([lo, la]) => { const p = proj(lo, la); x += p[0]; y += p[1]; }); return [x / R.length, y / R.length]; }
/** mapa na tela: centro (cx, cy) do mapa no ponto (sx, sy) da tela, com zoom z (1 = mapa inteiro com 1080 px de largura) */
function drawMap(ctx, cx, cy, z, sx = 540, sy = 960, extra) {
  const sc = z * W / MAPW; ctx.save(); ctx.translate(sx, sy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  ctx.drawImage(mapPainted(), 0, 0); if (extra) extra(ctx, sc); ctx.restore();
}
