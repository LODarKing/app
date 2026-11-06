// Mapa ilustrado da Trilha da Bússola (Icaraí, Amontada-CE). Coordenadas locais em metros: x = leste, y = norte,
// origem na coordenada da largada (-3.0321153, -39.6609647). Norte verdadeiro para cima.
// Rua, pontos e rumos: dados/percurso.json (rua do OpenStreetMap). Casas, quintais e muros: traçados sobre imagem aérea (aprox. ±2 m).
'use strict';
const CENA = {
  // casas: [x, y, largura, profundidade, ângulo em graus (anti-horário a partir do leste), cor do telhado]
  casas: [
    [-29.5, -3.2, 14, 12, 32, 0], [-14.4, 7.6, 12, 11, 32, 1], [-4.3, 16.2, 11, 13, 32, 0], [3.4, 24.6, 11, 16, 32, 2], [13.6, 25.9, 8, 14, 32, 1],
    [21.1, 39.6, 20, 11, 32, 0], [-23.3, 37.7, 8, 12, 32, 2], [-25.2, 63.8, 11, 13, -32, 1], [-39.6, 74, 11, 6, -20, 0],
    [61.2, 68.1, 15, 11, -25, 2], [76.7, 81.9, 13, 11, -30, 0], [119.6, 99.8, 10, 14, 0, 1],
    [-6.5, -17.5, 12, 11, 32, 1], [5.5, -17, 8, 11, 32, 0], [37.3, -6.2, 15, 11, 5, 2], [-73.7, -28.9, 14, 10, 30, 0], [-87.7, -42, 15, 10, 30, 1],
  ],
  piscina: [22.4, 51.7, 4.5, 8, 32],
  // quintais de areia: [x, y, rx, ry, ângulo]
  quintais: [[9, -9, 9, 11, 32], [48, -1, 7, 10, 10], [58, 70, 12, 10, -25], [-12, 45, 7, 6, 0], [-12, -10, 14, 6, 32], [45, 18, 6, 7, 32], [80, 76, 9, 7, -30], [-30, 66, 9, 9, -30], [-80, -36, 14, 9, 30]],
  // muros e cercas (polilinhas)
  muros: [[[-21.8, 49.8], [41.6, 30.2]], [[-16, 81.5], [51, 51.7]]],
  cercadinho: [39.2, 16.2, 5, 10, 32],
  // pomar de cajueiros (árvores em fileiras, mais espaçadas)
  pomar: { x0: 58, x1: 150, y0: -60, y1: 28 },
};

const MAPA = (() => {
  const MM = 300 / 25.4;          // pixels por milímetro (300 dpi)
  const ESC = 750;                // escala 1:750
  const K = (1000 / ESC) * MM;    // pixels por metro
  let J, X0, Y1, Wpx, Hpx;
  const P = (x, y) => [(x - X0) * K, (Y1 - y) * K];
  const ruaReal = () => J.rua.map(([x, y], i, a) => {   // o eixo real fica ~1 m a noroeste do traçado do OSM
    const j = Math.min(i + 1, a.length - 1), k = Math.max(i - 1, 0), dx = a[j][0] - a[k][0], dy = a[j][1] - a[k][1], L = Math.hypot(dx, dy) || 1;
    return [x - (dy / L) * 1.0, y + (dx / L) * 1.0];
  });
  function distSeg(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; const t = clamp(((px - ax) * dx + (py - ay) * dy) / L2); return Math.hypot(ax + t * dx - px, ay + t * dy - py); }
  function distPoli(px, py, pl) { let d = 1e9; for (let i = 0; i < pl.length - 1; i++) d = Math.min(d, distSeg(px, py, pl[i][0], pl[i][1], pl[i + 1][0], pl[i + 1][1])); return d; }
  function dentroRet(px, py, [cx, cy, w, h, a], m = 0) { const r = (-a * Math.PI) / 180, dx = px - cx, dy = py - cy, u = dx * Math.cos(r) - dy * Math.sin(r), v = dx * Math.sin(r) + dy * Math.cos(r); return Math.abs(u) < w / 2 + m && Math.abs(v) < h / 2 + m; }
  function dentroElip(px, py, [cx, cy, rx, ry, a]) { const r = (-a * Math.PI) / 180, dx = px - cx, dy = py - cy, u = dx * Math.cos(r) - dy * Math.sin(r), v = dx * Math.sin(r) + dy * Math.cos(r); return (u * u) / (rx * rx) + (v * v) / (ry * ry) < 1; }

  function retPath(ctx, [cx, cy, w, h, a], ex = 0) {
    const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), hw = w / 2 + ex, hh = h / 2 + ex;
    const q = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([u, v]) => P(cx + u * c - v * s, cy + u * s + v * c));
    ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); return q;
  }
  const TELHA = [['#E2683A', '#C24F27', '#F08A5D'], ['#D9573B', '#B4432C', '#EC7B5E'], ['#E8803F', '#C8652A', '#F5A166']];
  function casa(ctx, c) {
    const [cx, cy, w, h, a, tc] = c, [cl, ce, cc] = TELHA[tc];
    // sombra
    ctx.save(); ctx.translate(1.1 * K, 1.4 * K); retPath(ctx, c); ctx.fillStyle = 'rgba(30,50,25,0.35)'; ctx.fill(); ctx.restore();
    // paredes visíveis (base clara) e telhado de quatro águas
    retPath(ctx, c, 0.35); ctx.fillStyle = '#FFF4E2'; ctx.fill(); ctx.lineWidth = 0.18 * K; ctx.strokeStyle = '#5A3424'; ctx.stroke();
    const r = (a * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r), long = w >= h, hw = w / 2, hh = h / 2;
    const L = (u, v) => P(cx + u * co - v * si, cy + u * si + v * co);
    const cumeA = long ? [-(hw - hh * 0.9), 0] : [0, -(hh - hw * 0.9)], cumeB = long ? [hw - hh * 0.9, 0] : [0, hh - hw * 0.9];
    const cant = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    // 4 águas: cada face com tom de luz (luz de noroeste)
    const faces = long
      ? [[cant[0], cant[1], cumeB, cumeA, ce], [cant[1], cant[2], cumeB, null, ce], [cant[2], cant[3], cumeA, cumeB, cl], [cant[3], cant[0], cumeA, null, cl]]
      : [[cant[0], cant[1], cumeA, null, ce], [cant[1], cant[2], cumeB, cumeA, ce], [cant[2], cant[3], cumeB, null, cl], [cant[3], cant[0], cumeA, cumeB, cl]];
    for (const [p1, p2, p3, p4, cor] of faces) {
      ctx.beginPath(); const pts = [p1, p2, p3, p4].filter(Boolean).map(([u, v]) => L(u, v));
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = cor; ctx.fill();
    }
    // telhas (linhas finas paralelas ao beiral)
    ctx.save(); retPath(ctx, c); ctx.clip(); ctx.strokeStyle = 'rgba(90,40,20,0.22)'; ctx.lineWidth = 0.08 * K;
    for (let k = -Math.max(hw, hh); k < Math.max(hw, hh); k += 0.9) { const [ax, ay] = L(-hw, k), [bx, by] = L(hw, k); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
    ctx.restore();
    // cumeeira e arestas
    ctx.strokeStyle = cc; ctx.lineWidth = 0.28 * K; ctx.lineCap = 'round';
    const [ax, ay] = L(...cumeA), [bx, by] = L(...cumeB); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,40,20,0.55)'; ctx.lineWidth = 0.12 * K;
    for (const [u, v] of cant) { const [x, y] = L(u, v), [qx, qy] = L(...(long ? (u < 0 ? cumeA : cumeB) : (v < 0 ? cumeA : cumeB))); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(qx, qy); ctx.stroke(); }
    retPath(ctx, c); ctx.lineWidth = 0.22 * K; ctx.strokeStyle = '#5A3424'; ctx.stroke();
  }

  function render(canvas, dados, janela) {
    J = dados; [X0, Y1] = [janela.x0, janela.y1]; Wpx = canvas.width; Hpx = canvas.height;
    const ctx = canvas.getContext('2d'), rnd = mulberry32(777), RUA = ruaReal();
    // chão: grama com manchas e pontinhos
    ctx.fillStyle = '#B9D58C'; ctx.fillRect(0, 0, Wpx, Hpx);
    for (let i = 0; i < 260; i++) { const x = rnd() * Wpx, y = rnd() * Hpx, r = (4 + rnd() * 10) * K; ctx.fillStyle = rnd() < 0.5 ? 'rgba(160,196,110,0.45)' : 'rgba(205,224,150,0.45)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, 7); ctx.fill(); }
    for (let i = 0; i < 4500; i++) { const x = rnd() * Wpx, y = rnd() * Hpx; ctx.fillStyle = rnd() < 0.5 ? 'rgba(120,160,80,0.35)' : 'rgba(240,248,200,0.4)'; ctx.fillRect(x, y, 3, 3); }
    // quintais de areia
    for (const q of CENA.quintais) {
      const [cx, cy, rx, ry, a] = q, [X, Y] = P(cx, cy);
      ctx.save(); ctx.translate(X, Y); ctx.rotate((-a * Math.PI) / 180); ctx.fillStyle = '#F1E3BE'; ctx.beginPath(); ctx.ellipse(0, 0, rx * K, ry * K, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(200,170,110,0.5)'; for (let i = 0; i < 60; i++) { const t = rnd() * 7, rr = Math.sqrt(rnd()); ctx.fillRect(Math.cos(t) * rr * rx * K, Math.sin(t) * rr * ry * K, 3, 3); }
      ctx.restore();
    }
    // rua: borda, piso e faixa central tracejada
    const linha = (pl, w, cor, dash) => { ctx.beginPath(); pl.forEach(([x, y], i) => { const [X, Y] = P(x, y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.lineWidth = w * K; ctx.strokeStyle = cor; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash ? dash.map((d) => d * K) : []); ctx.stroke(); ctx.setLineDash([]); };
    linha(RUA, 8.2, '#CDBF9A'); linha(RUA, 6.6, '#EDE6D6'); linha(RUA, 0.35, '#F2C230', [2.2, 2.0]);
    // faixa de pedestres na travessia (entre os pontos 5 e 6)
    const p5 = J.pontos[5], p6 = J.pontos[6], mx = (p5.x + p6.x) / 2, my = (p5.y + p6.y) / 2;
    { const dx = p6.x - p5.x, dy = p6.y - p5.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; // ux,uy atravessa a rua
      for (let k = -3; k <= 3; k++) { const ox = -uy * k * 0.9, oy = ux * k * 0.9, [ax, ay] = P(mx + ox - ux * 3.2, my + oy - uy * 3.2), [bx, by] = P(mx + ox + ux * 3.2, my + oy + uy * 3.2); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineWidth = 0.55 * K; ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); } }
    // muros, cercadinho, piscina
    for (const m of CENA.muros) { linha(m, 0.9, '#8B6B4A'); linha(m, 0.45, '#D9C3A0'); }
    { const c = CENA.cercadinho; retPath(ctx, c); ctx.fillStyle = '#E9D6A8'; ctx.fill(); ctx.setLineDash([0.5 * K, 0.4 * K]); ctx.lineWidth = 0.35 * K; ctx.strokeStyle = '#7A5530'; ctx.stroke(); ctx.setLineDash([]); }
    { const c = CENA.piscina; retPath(ctx, c, 0.8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); retPath(ctx, c); ctx.fillStyle = '#4FC3E8'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.15 * K; ctx.stroke(); }
    for (const c of CENA.casas) casa(ctx, c);
    // árvores: mato denso, pomar em fileiras e coqueiros; nunca sobre a rua, casas, quintais ou o caminho da trilha
    const caminho = J.pontos.map((p) => [p.x, p.y]);
    const livre = (x, y, r) => distPoli(x, y, RUA) > 4.6 + r * 0.6 && !CENA.casas.some((c) => dentroRet(x, y, c, 0.6 + r * 0.4)) && !CENA.quintais.some((q) => dentroElip(x, y, q))
      && distPoli(x, y, caminho) > 2.5 + r * 0.7 && !dentroRet(x, y, CENA.piscina, 2) && !dentroRet(x, y, CENA.cercadinho, 1.5);
    const arv = []; const R = mulberry32(4242), w0 = X0 - 6, w1 = X0 + Wpx / K + 6, h0 = Y1 - Hpx / K - 6, h1 = Y1 + 6;
    const pm = CENA.pomar;
    for (let y = h0; y < h1; y += 4.2) for (let x = w0; x < w1; x += 4.2) {
      const noPomar = x > pm.x0 && x < pm.x1 && y > pm.y0 && y < pm.y1;
      let px = x + (R() - 0.5) * 3.2, py = y + (R() - 0.5) * 3.2, r = 2.1 + R() * 1.3;
      if (noPomar) { if ((Math.round(x / 4.2) % 2) || (Math.round(y / 4.2) % 2)) continue; px = x; py = y; r = 2.4 + R() * 0.6; }
      else if (R() < 0.12) continue;
      if (!livre(px, py, r)) continue;
      const tipo = noPomar ? 'f' : R() < 0.22 ? 'p' : 'f';
      arv.push([px, py, r, tipo, Math.floor(R() * 1000)]);
    }
    arv.sort((a, b) => b[1] - a[1]);
    for (const [x, y, r, tp, k] of arv) { const sp = tp === 'p' ? COPAS.palmeiras[k % COPAS.palmeiras.length] : COPAS.folhosas[k % COPAS.folhosas.length], [X, Y] = P(x, y); ctx.globalAlpha = 0.45; COPAS.sombra(ctx, sp, X + 0.9 * K, Y + 1.2 * K, r * K); ctx.globalAlpha = 1; COPAS.desenha(ctx, sp, X, Y, r * K); }
    // pegadas de um ponto ao outro
    const pe = (x, y, ang, esq) => {
      const [X, Y] = P(x, y); ctx.save(); ctx.translate(X, Y); ctx.rotate(-ang); ctx.scale(K / 6.5, K / 6.5); if (esq) ctx.scale(-1, 1);
      ctx.fillStyle = '#5B3A22';
      ctx.beginPath(); ctx.ellipse(0, 2.5, 2.3, 4.2, 0.12, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-0.2, 8.4, 1.8, 2.1, 0, 0, 7); ctx.fill();
      const dedos = [[-2.4, 12.2, 0.9], [-0.9, 13.1, 0.8], [0.6, 13.2, 0.75], [1.9, 12.6, 0.65], [2.9, 11.6, 0.55]];
      for (const [dx, dy, r] of dedos) { ctx.beginPath(); ctx.arc(dx * 0.85 + 0.6, dy * 0.95 - 1.2, r * 1.1, 0, 7); ctx.fill(); }
      ctx.restore();
    };
    for (let i = 0; i < J.pontos.length - 1; i++) {
      const a = J.pontos[i], b = J.pontos[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, ang = Math.atan2(dy, dx) - Math.PI / 2;
      const ini = 4.2, fim = L - 4.4, passo = 2.9, n = Math.max(1, Math.floor((fim - ini) / passo));
      for (let k = 0; k <= n; k++) { const t = ini + (k * (fim - ini)) / n, lado = k % 2 ? 1 : -1; pe(a.x + ux * t - uy * 0.55 * lado, a.y + uy * t + ux * 0.55 * lado, ang, lado > 0); }
    }
  }
  return { render, P: (x, y) => P(x, y), K, ESC, MM };
})();
