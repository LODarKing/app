// Cena 3 — TOPOGRAFIA. As curvas de nível do mesmo terreno se escrevem no papel e sobem em camadas (2,5D);
// um corte A–B mostra no perfil que curvas próximas = subida íngreme e curvas afastadas = terreno suave;
// por fim: montanha, vale e uma rota mais segura (contorna a encosta) contra a rota direta (atravessa as curvas apertadas).
'use strict';
const A3 = (() => {
  const id = 's03', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    titulo: h(F(id, 'topográfico'), 'marca'), relevo: h(F(id, 'relevo'), null), curvas: h(F(id, 'curvas'), 'risco'),
    alt: h(F(id, 'altitudes') - 0.4, 'subida_fim'), prox: h(F(id, 'próximas'), 'pop'), ingreme: h(F(id, 'íngreme'), 'marca'),
    mont: h(F(id, 'montanhas'), 'pop'), vale: h(F(id, 'vales'), 'pop'), rota: h(F(id, 'rotas') - 0.3, 'traco'), segura: h(F(id, 'seguras'), 'confirma'),
    fim: CENAS[id].dur,
  };
})();
const TOPO = (() => {
  const C = [-560, -760];
  // corte A–B atravessando o morro
  const A = [-1010, -700], B = [-110, -700];
  const perfil = []; for (let i = 0; i <= 120; i++) { const k = i / 120, x = lerp(A[0], B[0], k), y = lerp(A[1], B[1], k); perfil.push([x, y, MUNDO.alt(x, y)]); }
  // rota direta (sobe e desce o morro) e rota segura (contorna a encosta pelo lado mais baixo)
  const S = [-90, -260], T = [-930, -1170];
  const direta = []; for (let i = 0; i <= 60; i++) { const k = i / 60; direta.push([lerp(S[0], T[0], k), lerp(S[1], T[1], k)]); }
  // rota segura: contorna o morro pelo sudoeste, onde as curvas são afastadas (Chaikin para suavizar)
  let segura = [S, [-420, -210], [-820, -300], [-1030, -560], [-1050, -880], T];
  for (let it = 0; it < 4; it++) { const nv = [segura[0]]; for (let i = 0; i < segura.length - 1; i++) { const [p, q] = [segura[i], segura[i + 1]]; nv.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]); } nv.push(segura[segura.length - 1]); segura = nv; }
  // pico (maior altitude perto do centro do morro)
  let pico = C, best = -1; for (let dy = -200; dy <= 200; dy += 10) for (let dx = -200; dx <= 200; dx += 10) { const v = MUNDO.alt(C[0] + dx, C[1] + dy); if (v > best) { best = v; pico = [C[0] + dx, C[1] + dy]; } }
  const curvasOrd = MUNDO.curvas.slice().sort((p, q) => p.lv - q.lv);
  const mestra = MUNDO.curvas.filter((c) => c.lv === 650).sort((p, q) => q.pts.length - p.pts.length)[0];
  return { A, B, perfil, direta, segura, pico, curvasOrd, mestra, vale: [60, -420] };
})();

function renderS03(ctx, t) {
  const a = A3;
  const cam = { cx: -540, cy: -700, z: 0.9, r: 0 };
  // 2,5D: inclina o plano e levanta cada curva pela altitude; volta a ficar plano no fim (a cena 4 é o mapa plano)
  const k3 = eio(prog(t, a.alt - 0.2, a.alt + 1.6)) * (1 - eio(prog(t, a.fim - 0.9, a.fim - 0.1)));
  const P = (x, y, alt) => { const [sx, sy] = MUNDO.proj(cam, x, y); return [sx, MUNDO.CY + 40 * k3 + (sy - MUNDO.CY) * lerp(1, 0.52, k3) - (alt - 560) * 2.3 * k3]; };
  fundo(ctx, false, { cx: 0, cy: -430, z: 2.4, r: 0 });
  // curvas se escrevendo (da mais baixa para a mais alta) e camadas com tinta hipsométrica
  const rev = eo3(prog(t, 0.2, a.curvas + 0.6));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const c of TOPO.curvasOrd) {
    const n = Math.max(2, Math.floor(c.pts.length * rev)); if (rev <= 0) break;
    const fech = Math.hypot(c.pts[0][0] - c.pts[c.pts.length - 1][0], c.pts[0][1] - c.pts[c.pts.length - 1][1]) < 30;
    ctx.beginPath();
    for (let i = 0; i < n; i += 2) { const p = c.pts[i], [x, y] = P(p[0], p[1], c.lv); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    if (fech && k3 > 0.02 && rev >= 1) { ctx.closePath(); ctx.fillStyle = mixHex('#C9D3A8', '#EFE6CF', clamp((c.lv - 560) / 260)); ctx.globalAlpha = k3; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = c.mestra ? 'rgba(40,74,52,0.95)' : 'rgba(63,106,74,0.6)'; ctx.lineWidth = c.mestra ? 3.2 : 1.6; ctx.stroke();
  }
  // uma curva de nível destacada
  const kc = eo3(prog(t, a.curvas, a.curvas + 0.8)), kco = ei3(prog(t, a.prox - 0.3, a.prox));
  if (kc > 0 && kco < 1 && TOPO.mestra) {
    const pts = TOPO.mestra.pts, n = Math.floor(pts.length * kc);
    ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 9 * (1 - kco); ctx.beginPath();
    for (let i = 0; i < n; i += 2) { const p = pts[i], [x, y] = P(p[0], p[1], TOPO.mestra.lv); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    const p = pts[Math.floor(pts.length * 0.12)], [x, y] = P(p[0], p[1], TOPO.mestra.lv);
    chamada(ctx, t, a.curvas + 0.3, x, y, 560, 1130, 'CURVA DE NÍVEL', { px: 40, out: a.prox - 0.4 });
    sobe(ctx, t, a.curvas + 0.6, 'liga pontos de mesma altitude', 572, 1190, 30, { cor: PAL.preto, peso: 700, out: a.prox - 0.4 });
  }
  // cotas (altitudes) das curvas mestras
  if (t > a.alt - 0.3 && t < a.mont) {
    for (const c of MUNDO.curvas) {
      if (!c.mestra || c.pts.length < 80) continue;
      const p = c.pts[Math.floor(c.pts.length * 0.3)], [x, y] = P(p[0], p[1], c.lv);
      if (x < 60 || x > 900 || y < 380 || y > 1250) continue;
      const kp = pop(t, a.alt - 0.3 + (c.lv - 600) / 400); if (kp <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.scale(kp, kp); rrect(ctx, -44, -20, 88, 40, 8); ctx.fillStyle = PAL.preto; ctx.fill();
      txt(ctx, c.lv + ' m', 0, 1, 24, { cor: PAL.branco, align: 'center', base: 'middle', peso: 800 }); ctx.restore();
    }
  }
  // corte A–B e perfil
  const kp = eo3(prog(t, a.prox - 0.1, a.prox + 0.8)), kpo = ei3(prog(t, a.mont - 0.4, a.mont));
  if (kp > 0 && kpo < 1) {
    const pf = TOPO.perfil, n = Math.floor(pf.length * kp);
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 5; ctx.setLineDash([16, 10]); ctx.beginPath();
    for (let i = 0; i < n; i++) { const [x, y] = P(pf[i][0], pf[i][1], pf[i][2]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]);
    for (const [nm, q] of [['A', pf[0]], ['B', pf[pf.length - 1]]]) { const [x, y] = P(q[0], q[1], q[2]); ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); txt(ctx, nm, x, y + 2, 28, { cor: PAL.branco, align: 'center', base: 'middle', peso: 800 }); }
    // cartão do perfil
    const cy0 = lerp(1400, 1010, eo5(prog(t, a.prox + 0.2, a.prox + 0.7))) + kpo * 500, X0 = 70, X1 = 1010, Y0 = cy0 + 70, Y1 = cy0 + 270;
    rrect(ctx, X0 - 20, cy0, X1 - X0 + 40, 320, 22); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.preto; ctx.stroke();
    txt(ctx, 'PERFIL DO CORTE A–B', X0 + 6, cy0 + 46, 30, { cor: PAL.preto, peso: 800 });
    const amin = 560, amax = 850, px = (i) => lerp(X0 + 10, X1 - 10, i / (pf.length - 1)), py = (al) => lerp(Y1 + 20, Y0, (al - amin) / (amax - amin));
    const kd = eo3(prog(t, a.prox + 0.4, a.ingreme + 0.2)), nd = Math.floor(pf.length * kd);
    ctx.beginPath(); ctx.moveTo(px(0), Y1 + 26); for (let i = 0; i < nd; i++) ctx.lineTo(px(i), py(pf[i][2])); ctx.lineTo(px(Math.max(0, nd - 1)), Y1 + 26); ctx.closePath(); ctx.fillStyle = '#DCE3C2'; ctx.fill();
    // inclinação: trechos íngremes em amarelo
    for (let i = 1; i < nd; i++) {
      const sl = Math.abs(pf[i][2] - pf[i - 1][2]) / (Math.hypot(pf[i][0] - pf[i - 1][0], pf[i][1] - pf[i - 1][1]));
      ctx.strokeStyle = sl > 0.32 && t > a.ingreme - 0.1 ? PAL.amarelo : PAL.curva; ctx.lineWidth = sl > 0.32 && t > a.ingreme - 0.1 ? 10 : 5;
      ctx.beginPath(); ctx.moveTo(px(i - 1), py(pf[i - 1][2])); ctx.lineTo(px(i), py(pf[i][2])); ctx.stroke();
    }
    // marcas onde o corte cruza as curvas (espaçamento = inclinação)
    ctx.strokeStyle = PAL.preto; ctx.lineWidth = 2;
    for (let i = 1; i < nd; i++) { const l0 = Math.floor(pf[i - 1][2] / 10), l1 = Math.floor(pf[i][2] / 10); if (l0 !== l1) { ctx.beginPath(); ctx.moveTo(px(i), Y1 + 26); ctx.lineTo(px(i), Y1 + 8); ctx.stroke(); } }
    if (t > a.ingreme - 0.1) {
      let iMax = 1, sMax = 0; for (let i = 1; i < 60; i++) { const sl = Math.abs(pf[i][2] - pf[i - 1][2]); if (sl > sMax) { sMax = sl; iMax = i; } }
      sobe(ctx, t, a.ingreme, 'CURVAS PRÓXIMAS = ÍNGREME', px(iMax) - 30, py(pf[iMax][2]) - 26, 26, { cor: PAL.preto, peso: 800 });
      sobe(ctx, t, a.ingreme + 0.5, 'AFASTADAS = SUAVE', X1 - 10, Y1 + 4, 26, { cor: PAL.preto, peso: 800, align: 'right' });
    }
  }
  // montanha e vale
  const [mx, my] = P(TOPO.pico[0], TOPO.pico[1], MUNDO.alt(TOPO.pico[0], TOPO.pico[1]));
  const kSai = ei3(prog(t, a.fim - 0.9, a.fim - 0.6));
  if (kSai < 1) {
    if (t > a.mont) { const k = pop(t, a.mont); ctx.save(); ctx.translate(mx, my); ctx.scale(k * (1 - kSai), k * (1 - kSai)); ctx.fillStyle = PAL.preto; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(16, 20); ctx.lineTo(-16, 20); ctx.closePath(); ctx.fill(); ctx.restore(); chamada(ctx, t, a.mont, mx, my - 8, mx + 190, my - 70, 'MONTANHA', { px: 46, out: a.fim - 0.9 }); }
    const [vx, vy] = P(TOPO.vale[0], TOPO.vale[1], MUNDO.alt(TOPO.vale[0], TOPO.vale[1]));
    if (t > a.vale) chamada(ctx, t, a.vale, vx, vy, vx - 30, vy + 220, 'VALE', { px: 46, align: 'right', out: a.fim - 0.9 });
  }
  // rotas: direta (cruza curvas apertadas) x segura (contorna a encosta)
  const kr = eo3(prog(t, a.rota, a.rota + 0.9)), krs = eo3(prog(t, a.rota + 0.5, a.segura + 0.3));
  const linha = (pts, k, cor, larg, dash) => { const n = Math.floor(pts.length * k); if (n < 2) return; ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = P(pts[i][0], pts[i][1], MUNDO.alt(pts[i][0], pts[i][1])); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
  if (kr > 0 && kSai < 1) {
    linha(TOPO.direta, kr, 'rgba(17,19,18,0.85)', 6, [14, 12]);
    if (kr >= 1) { const q = TOPO.direta[34], [x, y] = P(q[0], q[1], MUNDO.alt(q[0], q[1])), k = pop(t, a.rota + 0.9); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.strokeStyle = PAL.branco; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); ctx.stroke(); ctx.restore(); }
    linha(TOPO.segura, krs, PAL.preto, 16); linha(TOPO.segura, krs, PAL.amarelo, 9);
    if (krs > 0.95) { const q = TOPO.segura[Math.floor(TOPO.segura.length * 0.3)], [x, y] = P(q[0], q[1], MUNDO.alt(q[0], q[1])); chamada(ctx, t, a.segura, x, y, 90, 1250, 'ROTA MAIS SEGURA', { px: 40, out: a.fim - 0.9 }); }
  }
  marca(ctx, t, 'MAPA TOPOGRÁFICO', 64, 250, 96, a.titulo - 0.1, { out: a.fim - 0.6 });
}
RENDER.s03 = renderS03;
