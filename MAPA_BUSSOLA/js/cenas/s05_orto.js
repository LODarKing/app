// Cena 5 — ORTOFOTO. Uma foto aérea oblíqua (perspectiva + prédios "deitando", deslocamento pelo relevo) é corrigida
// geometricamente: vira uma imagem vista de cima em todos os pontos, com a geometria do mapa (grade de 100 m) e medidas confiáveis.
'use strict';
const A5 = (() => {
  const id = 's05', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    titulo: h(F(id, 'ortofoto'), 'marca'), aerea: h(F(id, 'aérea'), 'deslize'), corr: h(F(id, 'corrigida'), 'subida_fim'),
    pos: h(F(id, 'posições'), 'pop'), dist: h(F(id, 'distâncias'), 'traco'), prec: h(F(id, 'precisão'), 'risco'),
    estr: h(F(id, 'estradas'), 'pop'), rios: h(F(id, 'rios'), 'pop'), constr: h(F(id, 'construções'), 'pop'), fim: CENAS[id].dur,
  };
})();
const ORTO = (() => {
  const S = 1000, M_PX = 0.5; // 1 px da textura = 0,5 m -> a área tem 500 m x 500 m
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d'), R = mulberry32(5005);
  // lavouras e pastos (colcha de retalhos)
  const cores = ['#7E8F55', '#93A060', '#6E8048', '#A9A577', '#8B9A5B', '#B7AF84', '#768A4E'];
  g.fillStyle = '#7F8F58'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 46; i++) { g.save(); g.translate(R() * S, R() * S); g.rotate(-0.25 + R() * 0.2); g.fillStyle = cores[Math.floor(R() * cores.length)]; g.fillRect(-90 - R() * 80, -60 - R() * 60, 180 + R() * 160, 120 + R() * 120); g.restore(); }
  // sulcos de plantio
  g.globalAlpha = 0.12; g.strokeStyle = '#2E3A20'; g.lineWidth = 2; for (let y = -200; y < S + 200; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(S, y - 240); g.stroke(); } g.globalAlpha = 1;
  // rio
  const rio = []; for (let i = 0; i <= 60; i++) { const v = i / 60; rio.push([140 + 220 * v + 70 * Math.sin(v * 7), v * S]); }
  const tracar = (pts, w, cor) => { g.strokeStyle = cor; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); };
  tracar(rio, 74, '#5E6E48'); tracar(rio, 54, '#3C524E'); tracar(rio, 30, '#466460');
  // mata ciliar
  for (let i = 0; i < 220; i++) { const p = rio[Math.floor(R() * rio.length)], s = R() < 0.5 ? -1 : 1, d = 36 + R() * 40; const x = p[0] + s * d, y = p[1] + (R() - 0.5) * 30, r = 9 + R() * 9; g.fillStyle = '#2E4A2C'; g.beginPath(); g.arc(x + 3, y + 4, r, 0, 7); g.fill(); g.fillStyle = ['#3C5E36', '#46683A', '#355431'][Math.floor(R() * 3)]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(160,190,120,0.25)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, 7); g.fill(); }
  // estrada
  const estrada = []; for (let i = 0; i <= 60; i++) { const u = i / 60; estrada.push([u * S, 640 - 260 * u + 40 * Math.sin(u * 5)]); }
  tracar(estrada, 34, '#8E8270'); tracar(estrada, 26, '#C9BEA4'); g.setLineDash([14, 16]); tracar(estrada, 2, 'rgba(255,255,255,0.5)'); g.setLineDash([]);
  // ponte
  // grão de fotografia
  const id = g.getImageData(0, 0, S, S), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (hash2(i >> 2, 7, 3) - 0.5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  // construções ao longo da estrada (pegada em px da textura + altura em m)
  const casas = [];
  for (let i = 0; i < 15; i++) {
    const u = 0.38 + R() * 0.58, k = Math.floor(u * 60), p = estrada[k], lado = R() < 0.5 ? -1 : 1;
    const w = 26 + R() * 30, h = 20 + R() * 22, x = p[0] - w / 2, y = p[1] + lado * (32 + R() * 26) - h / 2;
    if (casas.some((c) => Math.abs(c.x - x) < 46 && Math.abs(c.y - y) < 40)) continue;
    casas.push({ x, y, w, h, alt: i === 3 ? 14 : 4 + R() * 5, cor: ['#B9B2A3', '#9C6B52', '#D6D1C4', '#8A7F70'][Math.floor(R() * 4)] });
  }
  return { cv, S, M_PX, rio, estrada, casas };
})();

function renderS05(ctx, t) {
  const a = A5, O = ORTO;
  ctx.fillStyle = PAL.mata; ctx.fillRect(0, 0, W, H);
  // p: 1 = oblíqua, 0 = ortorretificada
  const kin = eo5(prog(t, 0.0, 0.7));
  const p = 1 - eio(prog(t, a.corr, a.corr + 1.4));
  const CX = 540, OT = 352, OS = 880;              // ortofoto na tela: quadrado de 900 px a partir de y = 330
  const ZF = 1.75, Hn = 800 / (1 - 1 / ZF), hor = 1190 - Hn; // oblíqua: perto em y 1190, longe em y 370
  const mapPt = (u, v, alt = 0) => {
    const zo = lerp(ZF, 1, v), xo = CX + (u - 0.5) * 1080 / zo, yo = hor + Hn / zo - alt * 1.8 / zo;
    const xr = CX + (u - 0.5) * OS, yr = OT + v * OS;
    return [lerp(xr, xo, p) + (1 - kin) * 1200, lerp(yr, yo, p)];
  };
  // a foto: faixas horizontais, cada uma levada ao trapézio por uma transformação afim
  const N = 80;
  for (let i = 0; i < N; i++) {
    const v0 = i / N, v1 = (i + 1) / N, [x00, y00] = mapPt(0, v0), [x10] = mapPt(1, v0), [x01, y01] = mapPt(0, v1);
    const sh = O.S / N;
    ctx.setTransform((x10 - x00) / O.S, 0, (x01 - x00) / sh, (y01 - y00 + 0.8) / sh, x00, y00);
    ctx.drawImage(O.cv, 0, v0 * O.S, O.S, sh + 1, 0, 0, O.S, sh + 1);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // moldura de foto
  const cs = [mapPt(0, 0), mapPt(1, 0), mapPt(1, 1), mapPt(0, 1)];
  ctx.strokeStyle = PAL.branco; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); cs.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.stroke();
  // construções: na oblíqua o telhado se desloca e as paredes aparecem; na ortofoto o telhado cai sobre a pegada
  const casas = O.casas.slice().sort((c1, c2) => c1.y - c2.y);
  for (const c of casas) {
    const u0 = c.x / O.S, v0 = c.y / O.S, u1 = (c.x + c.w) / O.S, v1 = (c.y + c.h) / O.S;
    const base = [mapPt(u0, v0), mapPt(u1, v0), mapPt(u1, v1), mapPt(u0, v1)];
    const hh = c.alt * 4.2 * p, top = base.map(([x, y], k) => [x + ((x - CX) / 900) * hh * 0.35, y - hh]);
    // sombra
    ctx.fillStyle = 'rgba(20,24,18,0.35)'; ctx.beginPath(); base.forEach(([x, y], k) => (k ? ctx.lineTo(x + 8, y + 10) : ctx.moveTo(x + 8, y + 10))); ctx.closePath(); ctx.fill();
    if (hh > 0.5) { // paredes visíveis (frente)
      ctx.fillStyle = '#6E665A'; ctx.beginPath(); ctx.moveTo(base[3][0], base[3][1]); ctx.lineTo(base[2][0], base[2][1]); ctx.lineTo(top[2][0], top[2][1]); ctx.lineTo(top[3][0], top[3][1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5A5348'; ctx.beginPath(); ctx.moveTo(base[1][0], base[1][1]); ctx.lineTo(base[2][0], base[2][1]); ctx.lineTo(top[2][0], top[2][1]); ctx.lineTo(top[1][0], top[1][1]); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = c.cor; ctx.beginPath(); top.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo((top[0][0] + top[3][0]) / 2, (top[0][1] + top[3][1]) / 2); ctx.lineTo((top[1][0] + top[2][0]) / 2, (top[1][1] + top[2][1]) / 2); ctx.stroke();
    // destaque das construções
    if (t > a.constr && t < a.fim) { const k = eo3(prog(t, a.constr, a.constr + 0.3)); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 5 * k; ctx.beginPath(); top.forEach(([x, y], kk) => (kk ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); }
  }
  // grade de 100 m (mapa) depois da correção
  const kg = eo3(prog(t, a.corr + 1.0, a.corr + 1.8));
  if (kg > 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    for (let m = 0; m <= 500; m += 100) {
      const f = m / 500; let [x0, y0] = mapPt(f, 0), [x1, y1] = mapPt(f, kg); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      [x0, y0] = mapPt(0, f); [x1, y1] = mapPt(kg, f); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    if (kg >= 1) for (let m = 100; m < 500; m += 100) { const [x] = mapPt(m / 500, 1); txt(ctx, m + ' m', x, OT + OS + 34, 24, { align: 'center', cor: PAL.branco, peso: 700 }); }
  }
  // posição (coordenadas na grade) e distância medida entre duas construções
  const c1 = O.casas[0], c2 = O.casas[O.casas.length - 1];
  const cen = (c) => [(c.x + c.w / 2) / O.S, (c.y + c.h / 2) / O.S];
  if (t > a.pos && p < 0.05) {
    const [u, v] = cen(c1), [x, y] = mapPt(u, v), k = pop(t, a.pos);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.moveTo(-48, 0); ctx.lineTo(48, 0); ctx.moveTo(0, -48); ctx.lineTo(0, 48); ctx.stroke(); ctx.restore();
    const E = Math.round(u * 500), Nn = Math.round((1 - v) * 500);
    sobe(ctx, t, a.pos + 0.15, `E ${E} m · N ${Nn} m`, x - 40, y - 50, 34, { peso: 800, cor: PAL.preto, contorno: PAL.branco, align: 'right', out: a.estr - 0.3 });
  }
  if (t > a.dist && p < 0.05) {
    const [u1, v1] = cen(c1), [u2, v2] = cen(c2), [x1, y1] = mapPt(u1, v1), [x2, y2] = mapPt(u2, v2), k = eo3(prog(t, a.dist, a.dist + 0.5));
    const ko = ei3(prog(t, a.estr - 0.3, a.estr));
    if (ko < 1) {
      ctx.strokeStyle = PAL.preto; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, k), lerp(y1, y2, k)); ctx.stroke();
      ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 6; ctx.stroke();
      const dm = Math.round(Math.hypot((u2 - u1) * 500, (v2 - v1) * 500) / 5) * 5;
      if (k >= 1) sobe(ctx, t, a.dist + 0.5, `${dm} m`, (x1 + x2) / 2, (y1 + y2) / 2 - 24, 46, { peso: 800, cor: PAL.preto, contorno: PAL.amarelo, align: 'center', out: a.estr - 0.3 });
    }
  }
  // geometria do mapa sobre a foto: estrada e rio coincidem com os vetores
  const kv = eo3(prog(t, a.prec, a.prec + 0.8));
  const vetor = (pts, k, cor, larg, dash) => { const n = Math.floor(pts.length * k); if (n < 2) return; ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = mapPt(pts[i][0] / O.S, pts[i][1] / O.S); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
  if (kv > 0 && p < 0.05) { vetor(O.estrada, kv, PAL.preto, 4, [16, 10]); vetor(O.rio, kv, PAL.branco, 4, [16, 10]); }
  if (t > a.estr) vetor(O.estrada, eo3(prog(t, a.estr, a.estr + 0.5)), PAL.amarelo, 10);
  if (t > a.rios) vetor(O.rio, eo3(prog(t, a.rios, a.rios + 0.5)), PAL.amarelo, 10);
  // rótulos
  const [ex, ey] = mapPt(0.8, O.estrada[48][1] / O.S), [rx, ry] = mapPt(O.rio[16][0] / O.S, 16 / 60), hc = O.casas[3], [hx, hy] = mapPt((hc.x + hc.w / 2) / O.S, (hc.y + hc.h / 2) / O.S);
  chamada(ctx, t, a.estr, ex, ey, ex - 40, ey - 150, 'ESTRADA', { px: 46, cor: PAL.branco, linha: PAL.branco, align: 'right', contorno: PAL.preto });
  chamada(ctx, t, a.rios, rx, ry, rx + 70, ry - 120, 'RIO', { px: 46, cor: PAL.branco, linha: PAL.branco, contorno: PAL.preto });
  chamada(ctx, t, a.constr, hx, hy, hx - 40, hy + 170, 'CONSTRUÇÕES', { px: 46, cor: PAL.branco, linha: PAL.branco, align: 'right', contorno: PAL.preto });
  // títulos e estado da foto
  marca(ctx, t, 'ORTOFOTO', 64, 240, 90, a.titulo);
  if (p > 0.5 && kin > 0.5) sobe(ctx, t, a.aerea - 0.3, 'FOTO AÉREA OBLÍQUA: escala varia', 70, 322, 38, { peso: 800, cor: PAL.branco, out: a.corr + 0.3 });
  if (p < 0.05) sobe(ctx, t, a.corr + 1.4, 'CORRIGIDA: vista de cima em todo ponto', 70, 322, 38, { peso: 800, cor: PAL.amarelo, out: a.pos - 0.2 });
  if (t > a.prec && t < a.estr) sobe(ctx, t, a.prec + 0.3, 'mesma geometria do mapa', 70, 322, 38, { peso: 800, cor: PAL.amarelo, out: a.estr - 0.3 });
}
RENDER.s05 = renderS05;
