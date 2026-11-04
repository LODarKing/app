// Mundo: um único terreno fictício (relevo + floresta + trilhas) usado tanto na vista aérea quanto no mapa.
// O mapa é o MESMO terreno da floresta, então a passagem floresta -> mapa é motivada (corte de correspondência).
'use strict';
const MUNDO = (() => {
  const X0 = -1300, X1 = 1300, Y0 = -1900, Y1 = 1700;

  // relevo: colinas + ruído; altitude em metros
  const hills = [[-560, -760, 420, 0.55], [640, -420, 330, 0.42], [-380, 640, 380, 0.3], [520, 860, 300, 0.28], [80, -1500, 360, 0.36]];
  function h01(x, y) {
    let v = 0.32 * fbm(x / 520 + 9.3, y / 520 + 2.1, 41, 4);
    for (const [hx, hy, r, a] of hills) { const d2 = ((x - hx) ** 2 + (y - hy) ** 2) / (r * r); v += a * Math.exp(-d2); }
    // vale da trilha principal (mais baixo perto de x≈0)
    v -= 0.12 * Math.exp(-(x * x) / (260 * 260));
    return v;
  }
  const alt = (x, y) => 560 + h01(x, y) * 300;

  // trilhas (curvas de Catmull-Rom em coordenadas do mundo)
  function cr(pts, step = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let k = 0; k < n; k++) {
        const s = k / n, s2 = s * s, s3 = s2 * s;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * s + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * s + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const FORK = [0, -150];
  const trilhas = {
    tronco: cr([[90, 1800], [110, 1300], [80, 900], [30, 500], [-20, 220], [0, 0], FORK]),
    esq: cr([FORK, [-110, -300], [-320, -420], [-470, -620], [-560, -900], [-700, -1250], [-760, -1800]]),
    meio: cr([FORK, [30, -390], [-40, -640], [50, -900], [10, -1250], [60, -1800]]),
    dir: cr([FORK, [150, -280], [360, -360], [480, -580], [650, -820], [790, -1200], [900, -1800]]),
  };
  const todasTrilhas = [].concat(trilhas.tronco, trilhas.esq, trilhas.meio, trilhas.dir);
  // comprimento acumulado (para desenhar a trilha "se escrevendo")
  function acum(pl) { const a = [0]; for (let i = 1; i < pl.length; i++) a.push(a[i - 1] + Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1])); return a; }
  const comp = Object.fromEntries(Object.entries(trilhas).map(([k, v]) => [k, acum(v)]));

  // árvores: grade com jitter, sem árvores sobre a trilha; ordenadas por altura (as mais altas por cima)
  const arvores = [];
  {
    const R = mulberry32(20210421), S = 33;
    for (let y = Y0; y < Y1; y += S) for (let x = X0; x < X1; x += S) {
      const px = x + (R() - 0.5) * S * 0.9, py = y + (R() - 0.5) * S * 0.9;
      const r = 15 + R() * 12 + 6 * fbm(px / 300, py / 300, 7, 2);
      let d = 1e9; for (const p of todasTrilhas) { const dd = (p[0] - px) ** 2 + (p[1] - py) ** 2; if (dd < d) d = dd; }
      d = Math.sqrt(d);
      if (d < r * 0.85 + 14) continue;                       // a trilha fica à vista
      if (Math.hypot(px, py) < 58) continue;                  // clareira onde você está
      const clar = fbm(px / 260 + 3, py / 260 - 8, 99, 3);
      if (clar > 0.7 && R() < 0.8) continue;                  // pequenas clareiras naturais
      const hh = 0.55 + 0.6 * fbm(px / 180, py / 180, 13, 3) + R() * 0.35;
      const a = { x: px, y: py, r, h: hh, c: Math.floor(R() * 5), sh: R() };
      a.sp = COPAS.escolhe(a);
      if (a.sp.raio === 100 && hash2(Math.round(px), Math.round(py), 77) < 0.07) a.h += 0.35; // araucárias são emergentes
      arvores.push(a);
    }
    arvores.sort((a, b) => a.h - b.h);
  }

  // curvas de nível por marching squares, encadeadas em polilinhas
  const CELL = 14, NX = Math.ceil((X1 - X0) / CELL), NY = Math.ceil((Y1 - Y0) / CELL);
  const grid = new Float32Array((NX + 1) * (NY + 1));
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) grid[j * (NX + 1) + i] = alt(X0 + i * CELL, Y0 + j * CELL);
  let amin = 1e9, amax = -1e9; for (const v of grid) { amin = Math.min(amin, v); amax = Math.max(amax, v); }
  const PASSO = 10, curvas = [];
  for (let lv = Math.ceil(amin / PASSO) * PASSO; lv <= amax; lv += PASSO) {
    const seg = new Map(); // chave da aresta -> [chaves vizinhas]
    const pos = new Map();
    const G = (i, j) => grid[j * (NX + 1) + i];
    const edge = (i, j, dir) => {
      const key = dir + i + ',' + j;
      if (!pos.has(key)) {
        let a, b, ax, ay, bx, by;
        if (dir === 'h') { a = G(i, j); b = G(i + 1, j); ax = i; ay = j; bx = i + 1; by = j; } else { a = G(i, j); b = G(i, j + 1); ax = i; ay = j; bx = i; by = j + 1; }
        const k = (lv - a) / (b - a);
        pos.set(key, [X0 + (ax + (bx - ax) * k) * CELL, Y0 + (ay + (by - ay) * k) * CELL]);
      }
      return key;
    };
    const link = (k1, k2) => { (seg.get(k1) || seg.set(k1, []).get(k1)).push(k2); (seg.get(k2) || seg.set(k2, []).get(k2)).push(k1); };
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = G(i, j) > lv, b = G(i + 1, j) > lv, c = G(i + 1, j + 1) > lv, d = G(i, j + 1) > lv;
      const idx = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = () => edge(i, j, 'h'), R_ = () => edge(i + 1, j, 'v'), B = () => edge(i, j + 1, 'h'), L = () => edge(i, j, 'v');
      switch (idx) {
        case 1: case 14: link(L(), B()); break;
        case 2: case 13: link(B(), R_()); break;
        case 3: case 12: link(L(), R_()); break;
        case 4: case 11: link(T(), R_()); break;
        case 6: case 9: link(T(), B()); break;
        case 7: case 8: link(L(), T()); break;
        case 5: link(L(), T()); link(B(), R_()); break;
        case 10: link(L(), B()); link(T(), R_()); break;
      }
    }
    const vis = new Set();
    for (const start of seg.keys()) {
      if (vis.has(start)) continue;
      // anda até uma ponta (ou dá a volta)
      let s = start, prev = null;
      for (;;) { const nb = seg.get(s).filter((n) => n !== prev); if (seg.get(s).length < 2 || !nb.length) break; const nx = nb[0]; prev = s; s = nx; if (s === start) break; }
      const line = []; prev = null; let cur = s;
      for (;;) { vis.add(cur); line.push(pos.get(cur)); const nb = seg.get(cur).filter((n) => n !== prev && !vis.has(n)); if (!nb.length) { const back = seg.get(cur).find((n) => n === s && line.length > 2); if (back) line.push(pos.get(s)); break; } prev = cur; cur = nb[0]; }
      if (line.length > 3) curvas.push({ lv, mestra: lv % 50 === 0, pts: line });
    }
  }

  // câmera: tela = C + Rot(r) * z * (p - c)
  const CX = 540, CY = 900;
  function proj(cam, x, y) {
    const dx = (x - cam.cx) * cam.z, dy = (y - cam.cy) * cam.z, cs = Math.cos(cam.r), sn = Math.sin(cam.r);
    return [CX + dx * cs - dy * sn, CY + dx * sn + dy * cs];
  }
  function applyCam(ctx, cam) { ctx.translate(CX, CY); ctx.rotate(cam.r); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy); }

  // trilha (faixa de terra) no chão da floresta
  function drawTrilhaChao(ctx, cam) {
    ctx.save(); applyCam(ctx, cam); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [w, col] of [[34, '#5E5236'], [24, PAL.areia3], [14, '#CDBB8E']]) {
      ctx.lineWidth = w; ctx.strokeStyle = col;
      for (const pl of Object.values(trilhas)) { ctx.beginPath(); pl.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
    }
    ctx.restore();
  }

  // floresta vista de cima em 2,5D: copas mais altas ficam mais perto da câmera (deslocadas para fora do centro)
  // opts.encolhe(x,y) -> 0..1 encolhe a copa (passagem para o mapa)
  function drawFloresta(ctx, cam, opts = {}) {
    const par = (opts.paralaxe ?? 0.075) * cam.z, enc = opts.encolhe;
    ctx.fillStyle = PAL.mata; ctx.fillRect(0, 0, W, H);
    // manchas de chão
    ctx.save(); applyCam(ctx, cam);
    ctx.fillStyle = PAL.mata2;
    for (let i = 0; i < 26; i++) { const x = X0 + hash2(i, 1, 5) * (X1 - X0), y = Y0 + hash2(i, 2, 5) * (Y1 - Y0); ctx.beginPath(); ctx.ellipse(x, y, 140 + 160 * hash2(i, 3, 5), 90 + 120 * hash2(i, 4, 5), hash2(i, 6, 5) * 3, 0, 7); ctx.fill(); }
    ctx.restore();
    drawTrilhaChao(ctx, cam);
    const vis = [];
    for (const a of arvores) {
      const [sx, sy] = proj(cam, a.x, a.y), rr = a.r * cam.z;
      if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;
      let k = 1; if (enc) { k = 1 - enc(a.x, a.y); if (k <= 0.01) continue; }
      const f = 1 + a.h * par;
      vis.push([CX + (sx - CX) * f, CY + (sy - CY) * f, rr * (1 + a.h * par * 0.8) * k, a]);
    }
    // sombras (luz vinda de cima à esquerda): silhueta da própria copa, deslocada
    ctx.globalAlpha = 0.5;
    for (const [x, y, r, a] of vis) { const o = (5 + 7 * a.h) * cam.z; COPAS.sombra(ctx, a.sp, x + o, y + o * 1.25, r * 1.02); }
    ctx.globalAlpha = 1;
    for (const [x, y, r, a] of vis) COPAS.desenha(ctx, a.sp, x, y, r);
  }

  // mapa topográfico do mesmo terreno
  function drawMapa(ctx, cam, opts = {}) {
    const k = opts.revela ?? 1; // 0..1: curvas se escrevendo
    ctx.fillStyle = PAL.areia; ctx.fillRect(0, 0, W, H);
    ctx.save(); applyCam(ctx, cam);
    // vegetação (verde claro de carta topográfica) com clareiras
    ctx.fillStyle = 'rgba(122,160,104,0.20)'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    // grade de 250 m (uma quadrícula = 250 unidades do mundo)
    ctx.strokeStyle = 'rgba(23,48,34,0.22)'; ctx.lineWidth = 2 / cam.z;
    ctx.beginPath();
    for (let x = -1250; x <= 1250; x += 250) { ctx.moveTo(x, Y0); ctx.lineTo(x, Y1); }
    for (let y = -1750; y <= 1500; y += 250) { ctx.moveTo(X0, y); ctx.lineTo(X1, y); }
    ctx.stroke();
    // curvas de nível
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const c of curvas) {
      ctx.strokeStyle = c.mestra ? 'rgba(63,106,74,0.95)' : 'rgba(63,106,74,0.62)';
      ctx.lineWidth = (c.mestra ? 3.4 : 1.7) / Math.max(0.6, cam.z);
      const n = Math.max(2, Math.floor(c.pts.length * k));
      ctx.beginPath(); for (let i = 0; i < n; i++) { const p = c.pts[i]; i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
    }
    // trilhas: tracejado preto de carta
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5 / Math.max(0.7, cam.z); ctx.setLineDash([18 / cam.z, 11 / cam.z]);
    for (const pl of Object.values(trilhas)) { ctx.beginPath(); pl.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.restore();
    // cotas das curvas mestras
    if (opts.cotas !== false && k > 0.6) {
      font(ctx, 700, 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const c of curvas) {
        if (!c.mestra || c.pts.length < 60) continue;
        const p = c.pts[Math.floor(c.pts.length * 0.37)], q = c.pts[Math.floor(c.pts.length * 0.37) + 3];
        const [sx, sy] = proj(cam, p[0], p[1]), [qx, qy] = proj(cam, q[0], q[1]);
        if (sx < 60 || sx > W - 60 || sy < 60 || sy > H - 60) continue;
        let a = Math.atan2(qy - sy, qx - sx); if (a > Math.PI / 2) a -= Math.PI; if (a < -Math.PI / 2) a += Math.PI;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(a);
        ctx.fillStyle = PAL.areia; ctx.fillRect(-26, -13, 52, 26);
        ctx.fillStyle = PAL.curva; ctx.fillText(String(c.lv), 0, 1); ctx.restore();
      }
    }
  }

  return { trilhas, comp, arvores, curvas, alt, proj, applyCam, drawFloresta, drawMapa, drawTrilhaChao, FORK, CX, CY };
})();
