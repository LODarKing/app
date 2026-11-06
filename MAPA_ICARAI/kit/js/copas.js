// Copas de árvore vistas de cima, desenhadas uma vez (sprites com semente fixa) e reutilizadas em todo quadro.
// Tipos: folhosa (aglomerado de tufos com textura de folhas), palmeira (folhas radiais com folíolos) e araucária (galhos em verticilo com tufos nas pontas).
// Luz sempre de cima à esquerda; por isso os sprites não são girados nem espelhados.
'use strict';
const COPAS = (() => {
  const TONS = [
    ['#132A1C', '#1F3F2A', '#2C5638', '#3F7148', '#6C9A62', '#9DBE86'],  // verde mata
    ['#1D2F18', '#2E4A26', '#3E6232', '#567E42', '#86A866', '#B6CB92'],  // oliva
    ['#10291F', '#1A3D2E', '#265440', '#386F55', '#5E9479', '#8DB8A0'],  // verde-azulado
    ['#1E3A20', '#2B5130', '#3A6A3D', '#52864F', '#7FAA6C', '#AECB92'],  // verde vivo
  ];
  const S = 256, C = 128, R = 100;

  // contorno de tufo: círculo com lóbulos de folhagem (determinístico pela semente do tufo)
  function lobo(g, x, y, r, sd) {
    const q = mulberry32(sd), k1 = 9 + Math.floor(q() * 5), k2 = 17 + Math.floor(q() * 7), f1 = q() * 6, f2 = q() * 6, n = 48;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r * (1 + 0.075 * Math.abs(Math.sin(k1 * a / 2 + f1)) + 0.035 * Math.sin(k2 * a + f2) - 0.05);
      i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
  }
  function novo(sz) { const c = document.createElement('canvas'); c.width = c.height = sz; return c; }

  // ---- folhosa ----
  function folhosa(seed, tons, sz = S, det = 1) {
    const k = sz / S, cv = novo(sz), g = cv.getContext('2d'), sh = novo(sz), gs = sh.getContext('2d'), rnd = mulberry32(seed);
    const [escuro, base, medio, claro, luz, brilho] = tons;
    const n = 7 + Math.floor(rnd() * 6), tufos = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.6, d = R * (0.36 + rnd() * 0.26), rc = R * (0.3 + rnd() * 0.18);
      tufos.push([Math.cos(a) * d, Math.sin(a) * d, rc]);
    }
    for (let i = 0; i < 3; i++) tufos.push([(rnd() - 0.5) * R * 0.35, (rnd() - 0.5) * R * 0.35, R * (0.38 + rnd() * 0.12)]);
    // de fora para dentro e de baixo-direita para cima-esquerda: o centro (mais alto) fica por cima
    tufos.sort((p, q) => Math.hypot(q[0], q[1]) - Math.hypot(p[0], p[1]) || (q[0] + q[1]) - (p[0] + p[1]));
    g.translate(sz / 2, sz / 2); g.scale(k, k); gs.translate(sz / 2, sz / 2); gs.scale(k, k);
    // silhueta (sombra projetada)
    gs.fillStyle = '#000'; gs.beginPath(); tufos.forEach(([x, y, r], i) => lobo(gs, x, y, r, seed + i)); gs.fill();
    // contorno escuro que separa as copas vizinhas
    g.fillStyle = escuro; g.beginPath(); tufos.forEach(([x, y, r], i) => lobo(g, x, y, r * 1.04, seed + i)); g.fill();
    tufos.forEach(([x, y, r], ti) => {
      g.fillStyle = base; g.beginPath(); lobo(g, x + r * 0.05, y + r * 0.07, r * 0.94, seed + ti); g.fill();
      g.fillStyle = medio; g.beginPath(); lobo(g, x - r * 0.1, y - r * 0.12, r * 0.78, seed + ti + 50); g.fill();
      g.fillStyle = claro; g.beginPath(); lobo(g, x - r * 0.26, y - r * 0.3, r * 0.46, seed + ti + 90); g.fill();
      // folhas: manchas pequenas, claras do lado da luz e escuras do lado da sombra
      const nf = Math.floor(r * 1.1 * det), fs = 1 / Math.sqrt(det);
      for (let j = 0; j < nf; j++) {
        const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * 0.92, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d;
        const lado = ((fx - x) + (fy - y)) / (r * 1.4); // <0 lado iluminado
        const cor = lado < -0.25 ? (rnd() < 0.55 ? luz : claro) : lado > 0.3 ? (rnd() < 0.6 ? escuro : base) : (rnd() < 0.5 ? medio : claro);
        g.fillStyle = cor; g.globalAlpha = 0.55 + rnd() * 0.4;
        g.beginPath(); g.ellipse(fx, fy, (2.2 + rnd() * 3.2) * fs, (1.4 + rnd() * 1.8) * fs, rnd() * Math.PI, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      // brilho pontual no topo do tufo
      g.fillStyle = brilho; g.globalAlpha = 0.55;
      for (let j = 0; j < 5 * det; j++) { g.beginPath(); g.ellipse(x - r * (0.3 + rnd() * 0.2), y - r * (0.34 + rnd() * 0.2), (2 + rnd() * 2.5) * fs, (1.4 + rnd() * 1.2) * fs, rnd() * 3, 0, 7); g.fill(); }
      g.globalAlpha = 1;
      // sombra interna entre tufos (lado de baixo-direita)
      g.strokeStyle = escuro; g.globalAlpha = 0.5; g.lineWidth = 2.2 / Math.sqrt(det);
      g.beginPath(); g.arc(x, y, r * 0.95, -0.2, Math.PI * 0.75); g.stroke(); g.globalAlpha = 1;
    });
    return { img: cv, sombra: sh, raio: R * k, tam: sz };
  }

  // ---- palmeira ----
  function palmeira(seed, tons) {
    const cv = novo(S), g = cv.getContext('2d'), sh = novo(S), gs = sh.getContext('2d'), rnd = mulberry32(seed);
    const [escuro, base, medio, claro, luz] = tons;
    g.translate(C, C); gs.translate(C, C);
    const nfr = 8 + Math.floor(rnd() * 3), fr = [];
    for (let i = 0; i < nfr; i++) fr.push([(i / nfr) * Math.PI * 2 + rnd() * 0.35, R * (0.82 + rnd() * 0.2), (rnd() - 0.5) * 0.5]);
    // folhas de baixo (sombra) primeiro
    fr.sort((p, q) => Math.sin(q[0] + 0.78) - Math.sin(p[0] + 0.78));
    const frond = (ctx, a, L, curva, cores, sombra) => {
      const pts = []; for (let s = 0; s <= 1.0001; s += 0.08) { const aa = a + curva * s * s; pts.push([Math.cos(aa) * L * s, Math.sin(aa) * L * s, aa]); }
      ctx.lineCap = 'round';
      ctx.strokeStyle = sombra ? '#000' : cores[0]; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
      for (let i = 2; i < pts.length; i++) {
        const [x, y, aa] = pts[i], s = i / pts.length, len = (1 - s * 0.6) * R * 0.3;
        for (const lado of [-1, 1]) {
          const b = aa + lado * 1.05 + 0.25, ex = x + Math.cos(b) * len, ey = y + Math.sin(b) * len;
          ctx.strokeStyle = sombra ? '#000' : lado < 0 ? cores[2] : cores[1]; ctx.lineWidth = 4.5 - s * 2.5;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(b - 0.3) * len * 0.6, y + Math.sin(b - 0.3) * len * 0.6, ex, ey); ctx.stroke();
        }
      }
    };
    for (const [a, L, cu] of fr) frond(gs, a, L, cu, null, true);
    for (const [a, L, cu] of fr) {
      const lit = -Math.cos(a - Math.PI * 1.25) < 0; // folhas voltadas para cima-esquerda recebem mais luz
      frond(g, a, L, cu, lit ? [medio, claro, luz] : [escuro, base, medio], false);
    }
    g.fillStyle = escuro; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = base; g.beginPath(); g.arc(-2, -2, 5, 0, 7); g.fill();
    return { img: cv, sombra: sh, raio: R, tam: S };
  }

  // ---- araucária ----
  function araucaria(seed, tons) {
    const cv = novo(S), g = cv.getContext('2d'), sh = novo(S), gs = sh.getContext('2d'), rnd = mulberry32(seed);
    const [escuro, base, medio, claro, luz] = tons;
    g.translate(C, C); gs.translate(C, C);
    const nb = 7 + Math.floor(rnd() * 3), br = [];
    for (let i = 0; i < nb; i++) br.push([(i / nb) * Math.PI * 2 + rnd() * 0.3, R * (0.62 + rnd() * 0.2)]);
    // galhos
    for (const ctx of [gs, g]) {
      ctx.strokeStyle = ctx === gs ? '#000' : '#2E3A22'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); for (const [a, L] of br) { ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); } ctx.stroke();
    }
    // tufos em forma de taça nas pontas
    br.sort((p, q) => Math.sin(q[0] + 0.78) - Math.sin(p[0] + 0.78));
    for (const [a, L] of br) {
      const x = Math.cos(a) * L, y = Math.sin(a) * L, r = R * 0.37;
      gs.fillStyle = '#000'; gs.beginPath(); gs.arc(x, y, r, 0, 7); gs.fill();
      g.fillStyle = base; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = escuro; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, -0.2, Math.PI * 0.8); g.stroke();
      // agulhas em leque
      for (let j = 0; j < 40; j++) {
        const b = rnd() * Math.PI * 2, d = r * (0.3 + rnd() * 0.65), lit = Math.cos(b - Math.PI * 1.25) > 0.2;
        g.strokeStyle = lit ? (rnd() < 0.5 ? luz : claro) : (rnd() < 0.5 ? base : medio); g.lineWidth = 2;
        g.beginPath(); g.moveTo(x + Math.cos(b) * d * 0.3, y + Math.sin(b) * d * 0.3); g.lineTo(x + Math.cos(b) * d, y + Math.sin(b) * d); g.stroke();
      }
      g.fillStyle = claro; g.beginPath(); g.arc(x - r * 0.18, y - r * 0.2, r * 0.3, 0, 7); g.fill();
    }
    g.fillStyle = escuro; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill(); g.fillStyle = medio; g.beginPath(); g.arc(-3, -3, 7, 0, 7); g.fill();
    return { img: cv, sombra: sh, raio: R, tam: S };
  }

  const folhosas = [], palmeiras = [], araucarias = [];
  for (let c = 0; c < TONS.length; c++) for (let v = 0; v < 6; v++) folhosas.push(folhosa(1000 + c * 37 + v * 101, TONS[c]));
  for (let v = 0; v < 6; v++) palmeiras.push(palmeira(5000 + v * 13, TONS[v % 2 ? 3 : 1]));
  for (let v = 0; v < 4; v++) araucarias.push(araucaria(7000 + v * 17, TONS[v % 2 ? 0 : 3]));
  // copas grandes, em alta resolução, para o primeiro plano do mergulho
  const grandes = [0, 1, 2, 3].map((c) => folhosa(9000 + c * 7, TONS[c], 768, 14));

  // escolhe um sprite para a árvore (determinístico)
  function escolhe(a) {
    const u = hash2(Math.round(a.x), Math.round(a.y), 77);
    if (u < 0.07) return araucarias[Math.floor(u * 1000) % araucarias.length];
    if (u < 0.17) return palmeiras[Math.floor(u * 1000) % palmeiras.length];
    return folhosas[Math.floor(hash2(Math.round(a.x), Math.round(a.y), 78) * folhosas.length)];
  }
  // desenha a copa com centro (x, y) e raio rr em pixels de tela
  function desenha(ctx, sp, x, y, rr) { const s = ((rr * 1.24) / sp.raio) * sp.tam; ctx.drawImage(sp.img, x - s / 2, y - s / 2, s, s); }
  function sombra(ctx, sp, x, y, rr) { const s = ((rr * 1.24) / sp.raio) * sp.tam; ctx.drawImage(sp.sombra, x - s / 2, y - s / 2, s, s); }
  return { escolhe, desenha, sombra, grandes, folhosas, palmeiras, araucarias, folhosa };
})();
