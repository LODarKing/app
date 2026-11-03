// Motor da corda: geometria por pontos de controle (Catmull-Rom centrípeta), reamostragem por comprimento de arco,
// detecção automática de cruzamentos e regra explícita de "por cima / por baixo".
// Desenho: contorno, cordões torcidos (faixas inclinadas), sombreado de cilindro, sulcos, acabamento das pontas
// e, em cada cruzamento, o trecho de cima é redesenhado sobre uma sombra curta — nunca há corda atravessando corda.

// ---------------------------------------------------------------- geometria
function catmull(pts, amostras = 20) {
  const P = [pts[0], ...pts, pts[pts.length - 1]], out = [];
  const tj = (ti, a, b) => ti + Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6, 0.5);
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const t0 = 0, t1 = tj(t0, p0, p1), t2 = tj(t1, p1, p2), t3 = tj(t2, p2, p3);
    for (let k = 0; k < amostras; k++) {
      const t = t1 + (t2 - t1) * k / amostras;
      const A1 = [0, 1].map((d) => (t1 - t) / (t1 - t0) * p0[d] + (t - t0) / (t1 - t0) * p1[d]);
      const A2 = [0, 1].map((d) => (t2 - t) / (t2 - t1) * p1[d] + (t - t1) / (t2 - t1) * p2[d]);
      const A3 = [0, 1].map((d) => (t3 - t) / (t3 - t2) * p2[d] + (t - t2) / (t3 - t2) * p3[d]);
      const B1 = [0, 1].map((d) => (t2 - t) / (t2 - t0) * A1[d] + (t - t0) / (t2 - t0) * A2[d]);
      const B2 = [0, 1].map((d) => (t3 - t) / (t3 - t1) * A2[d] + (t - t1) / (t3 - t1) * A3[d]);
      out.push([0, 1].map((d) => (t2 - t) / (t2 - t1) * B1[d] + (t - t1) / (t2 - t1) * B2[d]));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function reamostra(poly, passo) {
  const cum = [0]; for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const L = cum[cum.length - 1], n = Math.max(2, Math.round(L / passo) + 1), st = L / (n - 1), X = new Float32Array(n), Y = new Float32Array(n);
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = i * st; while (j < poly.length - 2 && cum[j + 1] < s) j++;
    const k = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1); X[i] = lerp(poly[j][0], poly[j + 1][0], k); Y[i] = lerp(poly[j][1], poly[j + 1][1], k);
  }
  const TX = new Float32Array(n), TY = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1), dx = X[b] - X[a], dy = Y[b] - Y[a], m = Math.hypot(dx, dy) || 1; TX[i] = dx / m; TY[i] = dy / m; }
  return { X, Y, TX, TY, n, st, L };
}
function segInter(ax, ay, bx, by, cx, cy, dx, dy) {
  const r1x = bx - ax, r1y = by - ay, r2x = dx - cx, r2y = dy - cy, den = r1x * r2y - r1y * r2x; if (Math.abs(den) < 1e-9) return null;
  const u = ((cx - ax) * r2y - (cy - ay) * r2x) / den, v = ((cx - ax) * r1y - (cy - ay) * r1x) / den;
  return u >= 0 && u < 1 && v >= 0 && v < 1 ? [u, v] : null;
}
// pontos: [[x,y],…]; opções: w (largura), passo, padrao ('alt' alternado começando por cima, 'altU' começando por baixo,
// ou string com 'O'/'U' para cada passagem na ordem do caminho), amostras
const _cacheCorda = new Map();
function corda(pontos, o = {}) {
  const key = o.cache ? o.cache : null; if (key && _cacheCorda.has(key)) return _cacheCorda.get(key);
  const w = o.w || 40, g = reamostra(catmull(pontos, o.amostras || 22), o.passo || 2.5), { X, Y, n, st } = g;
  // cruzamentos (hash espacial para não testar todos os pares)
  const cel = Math.max(24, w), grid = new Map(), cruz = [], gap = Math.ceil(1.6 * w / st) + 2;
  for (let i = 0; i < n - 1; i++) {
    const x0 = Math.floor(Math.min(X[i], X[i + 1]) / cel), x1 = Math.floor(Math.max(X[i], X[i + 1]) / cel), y0 = Math.floor(Math.min(Y[i], Y[i + 1]) / cel), y1 = Math.floor(Math.max(Y[i], Y[i + 1]) / cel);
    for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const k = gx + ',' + gy; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
  }
  const visto = new Set();
  for (const lista of grid.values()) for (let a = 0; a < lista.length; a++) for (let b = a + 1; b < lista.length; b++) {
    let i = lista[a], j = lista[b]; if (i > j) [i, j] = [j, i]; if (j - i < gap) continue; const kk = i + ':' + j; if (visto.has(kk)) continue; visto.add(kk);
    const r = segInter(X[i], Y[i], X[i + 1], Y[i + 1], X[j], Y[j], X[j + 1], Y[j + 1]);
    if (r) cruz.push({ sA: (i + r[0]) * st, sB: (j + r[1]) * st, x: X[i] + (X[i + 1] - X[i]) * r[0], y: Y[i] + (Y[i + 1] - Y[i]) * r[0] });
  }
  // funde duplicatas (mesmo cruzamento detectado em segmentos vizinhos)
  cruz.sort((p, q) => p.sA - q.sA); const cz = [];
  for (const c of cruz) if (!cz.some((d) => Math.abs(d.sA - c.sA) < w * 0.5 && Math.abs(d.sB - c.sB) < w * 0.5)) cz.push(c);
  // passagens na ordem do caminho → por cima / por baixo
  const vis = []; cz.forEach((c, k) => { vis.push({ s: c.sA, k }); vis.push({ s: c.sB, k }); }); vis.sort((p, q) => p.s - q.s);
  const pad = o.padrao || 'alt';
  vis.forEach((v, i) => { v.cima = pad === 'alt' ? i % 2 === 0 : pad === 'altU' ? i % 2 === 1 : pad[i] === 'O'; });
  cz.forEach((c, k) => {
    const vv = vis.filter((v) => v.k === k); c.sCima = vv.find((v) => v.cima)?.s; c.sBaixo = vv.find((v) => !v.cima)?.s;
    if (c.sCima === undefined || c.sBaixo === undefined) console.error('cruzamento inconsistente', k, JSON.stringify(c));
  });
  const r = { ...g, w, cruz: cz, pontos };
  if (key) _cacheCorda.set(key, r);
  return r;
}
function em(r, s) {
  const f = clamp(s / r.st, 0, r.n - 1.001), i = Math.floor(f), k = f - i;
  return { x: lerp(r.X[i], r.X[i + 1], k), y: lerp(r.Y[i], r.Y[i + 1], k), tx: lerp(r.TX[i], r.TX[i + 1], k), ty: lerp(r.TY[i], r.TY[i + 1], k) };
}
function bordas(r, s, w) { const p = em(r, s), m = Math.hypot(p.tx, p.ty) || 1, nx = -p.ty / m, ny = p.tx / m; return { l: [p.x + nx * w / 2, p.y + ny * w / 2], d: [p.x - nx * w / 2, p.y - ny * w / 2], p }; }
function trilha(r, a, b) { // caminho (centro) de a até b
  ctx.beginPath(); const p0 = em(r, a); ctx.moveTo(p0.x, p0.y); let lx = p0.x, ly = p0.y;
  const ponto = (x, y) => { if (Math.hypot(x - lx, y - ly) > 0.05) { ctx.lineTo(x, y); lx = x; ly = y; } };
  for (let i = Math.ceil(a / r.st + 1e-6); i * r.st < b - 1e-6; i++) ponto(r.X[i], r.Y[i]);
  const p1 = em(r, b); ponto(p1.x, p1.y);
}
function corpo(r, a, b, w) { // polígono do corpo da corda entre a e b
  ctx.beginPath(); const st = r.st, L = [], R = [];
  const pega = (s) => { const q = bordas(r, s, w); L.push(q.l); R.push(q.d); };
  pega(a); for (let i = Math.ceil(a / st); i * st < b; i++) pega(i * st); pega(b);
  ctx.moveTo(L[0][0], L[0][1]); for (const q of L) ctx.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath();
}
const escala = () => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b); };

// camadas de um trecho [a, b]
function camadas(r, a, b, o) {
  if (b - a < 0.5) return;
  const w = r.w, ow = Math.max(2.2 / escala(), w * 0.075), cor = o.cor || (() => C.creme), torcida = o.torcida !== false;
  // contorno
  ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.strokeStyle = o.contorno || C.contorno; ctx.lineWidth = w + 2 * ow; trilha(r, a, b); ctx.stroke();
  ctx.save(); corpo(r, a, b, w); ctx.clip();
  // cordões (faixas inclinadas: torção à direita) ou corpo liso
  const p = w * (o.passoTorcao || 0.92), sk = w * (o.inclinacao || 0.62) * (o.sentido || 1);
  if (torcida) {
    const k0 = Math.floor((a - Math.abs(sk)) / p) - 1, k1 = Math.ceil((b + Math.abs(sk)) / p) + 1;
    for (let k = k0; k <= k1; k++) {
      const e0 = k * p, e1 = (k + 1) * p, cl = (s) => clamp(s, a - Math.abs(sk) - 2, b + Math.abs(sk) + 2);
      const sm = (e0 + e1) / 2 + sk / 2, base = cor(clamp(sm, a, b), ((k % 3) + 3) % 3), g0 = em(r, e0 + sk / 2), g1 = em(r, e1 + sk / 2);
      // cada cordão é um "gomo": escuro junto aos sulcos, claro no meio
      const gr = ctx.createLinearGradient(g0.x, g0.y, g1.x, g1.y);
      gr.addColorStop(0, shade(base, -0.2)); gr.addColorStop(0.38, shade(base, 0.12)); gr.addColorStop(0.72, base); gr.addColorStop(1, shade(base, -0.24));
      ctx.fillStyle = gr;
      ctx.beginPath(); const L = [], R = [];
      for (let s = cl(e0); s <= cl(e1) + 0.01; s += Math.max(r.st * 2, (e1 - e0) / 8)) L.push(bordas(r, s, w * 1.04).l);
      for (let s = cl(e1 + sk); s >= cl(e0 + sk) - 0.01; s -= Math.max(r.st * 2, (e1 - e0) / 8)) R.push(bordas(r, s, w * 1.04).d);
      if (sk < 0) { /* inclinação contrária: espelha a ordem */ }
      ctx.moveTo(L[0][0], L[0][1]); for (const q of L) ctx.lineTo(q[0], q[1]); for (const q of R) ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.fill();
    }
  } else { ctx.fillStyle = cor((a + b) / 2, 0); corpo(r, a, b, w * 1.04); ctx.fill(); }
  // sombreado de cilindro (deslocamentos fixos: ficam sempre dentro do corpo)
  ctx.lineCap = 'round';
  for (const [d, lw, al] of [[0.24, 0.62, 0.08], [0.26, 0.46, 0.08], [0.28, 0.3, 0.08]]) { ctx.save(); ctx.translate(w * d, w * d); ctx.strokeStyle = rgba(C.contorno, al); ctx.lineWidth = w * lw; trilha(r, a, b); ctx.stroke(); ctx.restore(); }
  for (const [d, lw, al] of [[-0.15, 0.34, 0.07], [-0.16, 0.22, 0.08], [-0.17, 0.11, 0.1]]) { ctx.save(); ctx.translate(w * d, w * d); ctx.strokeStyle = `rgba(255,255,255,${al})`; ctx.lineWidth = w * lw; trilha(r, a, b); ctx.stroke(); ctx.restore(); }
  // sulcos entre cordões (levemente curvos, como a hélice vista de lado)
  if (torcida) {
    const k0 = Math.floor((a - Math.abs(sk)) / p) - 1, k1 = Math.ceil((b + Math.abs(sk)) / p) + 1, lw = Math.max(1.3 / escala(), w * 0.05);
    // três passadas: penumbra larga, brilho do cordão seguinte, sulco fino — dá volume a cada cordão
    for (const [cor2, lwk, off] of [[rgba(C.contorno, 0.16), 3.6, 0.03], ['rgba(255,255,255,0.22)', 1.3, 0.2], [rgba(C.contorno, 0.66), 1, 0]]) {
      ctx.strokeStyle = cor2; ctx.lineWidth = lw * lwk; ctx.lineCap = 'round';
      for (let k = k0; k <= k1; k++) {
        const s = k * p + off * w; if (s + sk < a - w && s < a - w) continue; if (s > b + w && s + sk > b + w) continue;
        const l = bordas(r, s, w * 1.04).l, d = bordas(r, s + sk, w * 1.04).d, m = em(r, s + sk / 2);
        ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.quadraticCurveTo(m.x + m.tx * w * 0.16, m.y + m.ty * w * 0.16, d[0], d[1]); ctx.stroke();
      }
    }
  }
  // pelos de fibra (só quando a corda aparece grande)
  if (o.pelos && w * escala() > 70) {
    const R = mulberry32(o.semente || 3); ctx.strokeStyle = rgba(C.contorno, 0.16); ctx.lineWidth = 1 / escala();
    for (let s = a; s < b; s += w * 0.09) { const q = em(r, s), m = Math.hypot(q.tx, q.ty) || 1, nx = -q.ty / m, ny = q.tx / m, off = (R() - 0.5) * w * 0.9, l = w * (0.12 + R() * 0.18), an = (R() - 0.5) * 0.8;
      const x = q.x + nx * off, y = q.y + ny * off; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (q.tx * Math.cos(an) - q.ty * Math.sin(an)) * l, y + (q.ty * Math.cos(an) + q.tx * Math.sin(an)) * l); ctx.stroke(); }
  }
  ctx.restore();
}
// acabamento de uma ponta (s = 0 ou s = L): 'corte', 'falcaca'
function ponta(r, s, tipo, o) {
  const w = r.w, ow = Math.max(2.2 / escala(), w * 0.075), dir = s <= 0.01 ? 1 : -1, q = bordas(r, s, w + ow * 2);
  if (tipo === 'falcaca') {
    const a = s + dir * w * 0.2, b = s + dir * w * 1.05, lo = Math.min(a, b), hi = Math.max(a, b);
    ctx.save(); corpo(r, lo, hi, w * 1.08); ctx.fillStyle = o.corFalcaca || mix(C.creme, C.contorno, 0.62); ctx.fill();
    ctx.strokeStyle = rgba(C.contorno, 0.55); ctx.lineWidth = Math.max(1, w * 0.035);
    for (let k = 0; k <= 6; k++) { const qq = bordas(r, lerp(lo, hi, k / 6), w * 1.08); ctx.beginPath(); ctx.moveTo(qq.l[0], qq.l[1]); ctx.lineTo(qq.d[0], qq.d[1]); ctx.stroke(); }
    ctx.restore();
  }
  // face do corte
  ctx.strokeStyle = o.contorno || C.contorno; ctx.lineWidth = ow * 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(q.l[0], q.l[1]); ctx.lineTo(q.d[0], q.d[1]); ctx.stroke();
}
// desenha a corda entre s0 e s1 (revelação pela ponta), com todos os cruzamentos resolvidos
function desenhaCorda(r, o = {}) {
  const s0 = o.s0 ?? 0, s1 = o.s1 ?? r.L; if (s1 - s0 < 1) return;
  camadas(r, s0, s1, o);
  if (o.cruz !== false) for (const c of r.cruz) {
    // inclui o cruzamento assim que a cabeça se aproxima (a ponta nunca passa por cima de quem deveria cobri-la)
    if (Math.max(c.sA, c.sB) - 1.6 * r.w > s1 || Math.min(c.sA, c.sB) < s0) continue;
    const w = r.w, a = Math.max(s0, c.sCima - 1.8 * w), b = Math.min(s1, c.sCima + 1.8 * w), z = escala();
    ctx.save(); ctx.beginPath(); ctx.arc(c.x, c.y, w * 1.5, 0, Math.PI * 2); ctx.clip();
    // sombra curta do trecho de cima, recortada ao corpo do trecho de baixo (não suja o fundo)
    ctx.save(); corpo(r, Math.max(s0, c.sBaixo - 2 * w), Math.min(s1, c.sBaixo + 2 * w), w * 1.12); ctx.clip();
    ctx.shadowColor = rgba(C.contorno, 0.6); ctx.shadowBlur = w * 0.32 * z; ctx.shadowOffsetX = w * 0.07 * z; ctx.shadowOffsetY = w * 0.13 * z;
    ctx.strokeStyle = C.contorno; ctx.lineWidth = w * 1.1; ctx.lineCap = 'butt'; trilha(r, a, b); ctx.stroke();
    ctx.restore();
    camadas(r, a, b, o);
    ctx.restore();
  }
  if (o.pontaFim && s1 >= r.L - 0.5) ponta(r, r.L, o.pontaFim, o);
  else if (o.pontaCabeca) ponta(r, s1, o.pontaCabeca, o);
  if (o.pontaInicio && s0 <= 0.5) ponta(r, 0, o.pontaInicio, o);
}
