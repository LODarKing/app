// PILOTO (10 s) — cinco planos do storyboard, todos funções puras do tempo global t.
// Âncoras (TL.T) vêm da locução: casa = "casa"; carimbo = "arqueologia"; s2..s5 = cortes.
const T = TL.T;
const ESTELA_C = [540, 850];                         // centro da estela no mundo (planos 1 e 2)

// ---------------------------------------------------------------- plano 1: a pedra sobe da areia
function posEstela(t) { const k = prog(t, -0.35, 1.0); return [ESTELA_C[0], lerp(1330, ESTELA_C[1], ease.back(k)), lerp(-0.06, 0, ease.o(k))]; }
const SOLO1 = 1150;
function graosEscorrendo(t) {                         // areia que estava sobre a pedra escorre pelos ombros do bloco
  const tc = on2(t);
  for (let i = 0; i < 74; i++) {
    const ts = -0.5 + rnd(401, i) * 1.45; if (tc < ts) continue;
    const lado = rnd(402, i) < 0.5 ? -1 : 1, u = rnd(403, i), [sx, sy, sr] = posEstela(ts);
    const lx = lado * (40 + u * 220), ly = -300 + Math.abs(lx) * 0.05, x0 = sx + lx, y0 = sy + ly - 4;
    const dt = tc - ts, vx = lado * (60 + rnd(404, i) * 220), vy = -120 - rnd(405, i) * 260, x = x0 + vx * dt, y = y0 + vy * dt + 0.5 * 2600 * dt * dt;
    if (y > SOLO1 + 20) continue;
    grao(x, y, 4 + rnd(406, i) * 8, dt * 9 * lado, i % 4 ? C.areia : C.areiaEsc);
  }
  for (let i = 0; i < 18; i++) {                      // torrões lançados pelo empurrão da pedra (início)
    const ts = -0.3 + rnd(411, i) * 0.4, dt = tc - ts; if (dt < 0) continue;
    const lado = i % 2 ? 1 : -1, x = 540 + lado * (250 + rnd(412, i) * 60) + lado * (160 + rnd(413, i) * 320) * dt, y = SOLO1 - 10 - (520 + rnd(414, i) * 420) * dt + 0.5 * 2600 * dt * dt;
    if (y > SOLO1 + 30) continue; grao(x, y, 9 + rnd(415, i) * 9, dt * 6, i % 3 ? C.areiaEsc : C.terra);
  }
}
function gancho(t, saida = 0) {                       // texto do gancho em Cinzel; palavras batem em sequência (stepped)
  const tc = on3(t), [l1, l2] = CFG.textos.gancho, ws = l1.split(' ');
  ctx.save(); ctx.translate(0, -620 * ease.i(saida));
  const x0 = 84; let x = x0; const quando = [-1, -1, T.gancho[2]];
  ws.forEach((w, i) => { if (tc >= quando[i]) { const s = tc - quando[i] < 0.13 ? 1.18 : 1; ctx.save(); ctx.translate(x, 292); ctx.scale(s, s); texto(w, 0, 0, { fam: 'titulo', px: 138, peso: 900, cor: C.tinta, ls: 2 }); ctx.restore(); } x += largura(w, 138, 'titulo', 900, 2) + 34; });
  if (tc >= T.gancho[3]) { const s = tc - T.gancho[3] < 0.13 ? 1.3 : 1; ctx.save(); ctx.translate(x0, 492); ctx.scale(s, s); texto(l2, 0, 0, { fam: 'titulo', px: 190, peso: 900, cor: C.ocre, ls: 3, contorno: 10, corContorno: C.tinta }); ctx.restore(); }
  ctx.restore();
}
function plano1(t) {
  const tremor = Math.max(0, 1 - t / 1.1), sx = rs(421, Math.floor(t * 15)) * 4 * tremor, sy = rs(422, Math.floor(t * 15)) * 4 * tremor;
  fundoPapiro(0, 0, 1);
  const zz = 1 + 0.05 * ease.o(prog(t, 0, 1.25)); ctx.setTransform(zz, 0, 0, zz, W / 2 - 540 * zz + sx, H / 2 - 960 * zz + sy);
  const [x, y, r] = posEstela(t);
  pivo(x, y, r, 1, 1, () => estela(null, 0));
  graosEscorrendo(t);
  soloFrente(SOLO1, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  gancho(t);
}

// ---------------------------------------------------------------- plano 2: câmera se aproxima; pincel limpa a escrita; lupa
const R0 = T.R0, R1 = T.R1, DUR_L = 0.26, POUSO = T.pouso, L0 = T.L0;
const aLinha = (i) => R0 + i * (R1 - R0 - DUR_L) / 9;
const limpoEm = (t) => Array.from({ length: 10 }, (_, i) => ease.io(prog(t, aLinha(i), aLinha(i) + DUR_L)));
function cam2(t) { const k = ease.io(prog(t, T.s2, T.s2 + 1.3)), k2 = prog(t, T.s2 + 1.3, T.s3); const [ax, ay] = alvoEstela(); return { z: lerp(1, 1.42, k) + 0.07 * k2, fx: lerp(ESTELA_C[0], ESTELA_C[0] + ax * 0.45, k), fy: lerp(ESTELA_C[1], ESTELA_C[1] + ay * 0.6, k) }; }
function posLupa(t) {
  const [ax, ay] = alvoEstela(), tx = ESTELA_C[0] + ax, ty = ESTELA_C[1] + ay, u = ease.io(prog(t, L0, POUSO));
  const th = 0.5 + u * Math.PI * 1.6, r = 360 * (1 - u) + 6 * Math.sin(t * 5) * (u >= 1 ? 1 : 0);
  return [tx + Math.cos(th) * r, ty + Math.sin(th) * r * 0.72];
}
function plano2(t) {
  const c = cam2(t), tc = on2(t);
  fundoPapiro(-(c.z - 1) * 120, -(c.z - 1) * 60, 1 + (c.z - 1) * 0.25);
  camera(c.z, c.fx, c.fy);
  const limpo = limpoEm(t), dest = prog(t, POUSO, POUSO + 0.35);
  const conteudo = () => pivo(ESTELA_C[0], ESTELA_C[1], 0, 1, 1, () => estela(limpo, dest));
  conteudo();
  soloFrente(SOLO1, t);
  // pincel: acompanha a borda da limpeza, da direita para a esquerda, linha por linha
  const I = inscricao();
  if (tc < R1 + 0.3) {
    let i = 0; for (let k = 0; k < 10; k++) if (tc >= aLinha(k)) i = k;
    const L = I.lines[i], kk = ease.io(prog(tc, aLinha(i), aLinha(i) + DUR_L)), xe = lerp(L.xR + 34, L.xL - 34, kk);
    const sai = ease.i(prog(tc, R1, R1 + 0.3)), entra = 1 - ease.o(prog(tc, T.s2 - 0.05, R0 + 0.12));
    const bx = ESTELA_C[0] + xe + sai * 700 + entra * 500, by = ESTELA_C[1] + L.y - sai * 500 + entra * 300;
    const mov = kk > 0 && kk < 1 ? 1 : 0.2;
    pincel(bx, by, Math.PI - 0.55 + Math.sin(tc * 30) * 0.06 * mov, -0.6 * mov);
    for (let q = 0; q < 6 && mov > 0.5; q++) { const f = Math.floor(tc * 12), dx = rnd(431, f * 7 + q) * 70, dy = -rnd(432, f * 7 + q) * 60; grao(ESTELA_C[0] + xe + 30 + dx, ESTELA_C[1] + L.y + dy, 3 + rnd(433, f + q) * 3, q, C.areia); }
  }
  // lupa: entra girando, circula e pousa em "bytdwd"
  if (t >= L0) {
    const [lx, ly] = posLupa(tc), [px, py] = posLupa(tc - 1 / 12), vx = (lx - px) * 12;
    lupa(lx, ly, -0.55 - clamp(vx / 2500, -0.5, 0.5), conteudo, 1.55, 104);
  }
  // rótulos de tela (fora do zoom): aviso de ilustração e destaque editorial
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  gancho(t, prog(t, T.s2, T.s2 + 0.3));
  aviso(t, T.s2 + 0.2);
  if (t >= POUSO + 0.08) {
    const [ax, ay] = alvoEstela(), [sx, sy] = mundoTela(ESTELA_C[0] + ax, ESTELA_C[1] + ay, c.z, c.fx, c.fy);
    rotuloDestaque(sx, sy - 190, t - POUSO - 0.08, sy - 150);
  }
}
function aviso(t, t0) {                               // faixa de linho: "Estela de Tel Dan · séc. IX a.C. — ilustração"
  const k = ease.o5(prog(t, t0, t0 + 0.3)); if (k <= 0) return;
  const s = CFG.textos.aviso, w = largura(s, 32, 'ui', 700) + 44, x = lerp(-w - 40, 70, k), y = 1318;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.012);
  peca(`M 0 -34 L ${w} -30 L ${w - 6} 22 L 4 26 Z`, C.linho, { lw: 3.4 });
  texto(s, 22, 6, { px: 32, peso: 700, cor: C.tinta });
  ctx.restore();
}
function rotuloDestaque(x, y, dt, yLupa) {
  const k = ease.back(clamp(dt / 0.22)), s = CFG.textos.destaque, w = largura(s, 66, 'ui', 900, 2) + 56;
  ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, lerp(y + 40, yLupa, ease.o(clamp(dt / 0.25)))); ctx.stroke();
  ctx.save(); ctx.translate(clamp(x, w / 2 + 40, W - w / 2 - 40), y); ctx.scale(k, k);
  rr(-w / 2, -54, w, 96, 16); ctx.fillStyle = C.lapis; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 6; ctx.stroke();
  texto(s, 0, 20, { px: 66, peso: 900, al: 'center', cor: C.linho, ls: 2 });
  const sub = CFG.textos.destaqueSub, w2 = largura(sub, 30, 'ui', 700) + 30;
  peca(`M ${-w2 / 2} 48 L ${w2 / 2} 50 L ${w2 / 2 - 4} 92 L ${-w2 / 2 + 3} 90 Z`, C.linho, { lw: 3, sombra: 0.6 });
  texto(sub, 0, 80, { px: 30, peso: 700, al: 'center', cor: C.tinta });
  ctx.restore();
}

// ---------------------------------------------------------------- plano 3: nuvem de areia revela o mapa; o egípcio aponta o norte
const FIG = [168, 1408, 0.9];
function cam3(t) { const k = prog(t, T.s3, T.s4); return { z: lerp(1.05, 1.0, ease.o(k)), fx: lerp(560, 590, k), fy: 860 }; }
function poseFig(t) {
  const tc = on2(t), a0 = T.a0;
  return {
    apontar: ease.back(prog(tc, a0, a0 + 0.5)), apontarAnte: ease.back(prog(tc, a0 + 0.1, a0 + 0.62)), apontarMao: ease.o(prog(tc, a0 + 0.25, a0 + 0.7)),
    alvo: LUGAR.dan, olhar: [lerp(0.2, 0.9, prog(tc, a0, a0 + 0.4)), lerp(0.3, -0.8, prog(tc, a0, a0 + 0.4))],
    piscar: (tc > T.s3 + 1.75 && tc < T.s3 + 1.86) ? 1 : 0, resp: tc * 2.6, cabeca: -0.07 * ease.o(prog(tc, a0 + 0.1, a0 + 0.6)), peso: Math.sin(tc * 1.3) * 0.4,
  };
}
function plano3(t, saida = 0, soFigura = false) {
  const c = cam3(t), a0 = T.a0;
  fundoPapiro(-(c.fx - 560) * 0.4, 0, 1);
  camera(c.z, c.fx, c.fy);
  if (!soFigura) mapa({ costa: prog(t, T.s3 - 0.1, T.s3 + 0.75), rio: prog(t, T.s3 + 0.3, T.s3 + 1.0), rotulos: prog(t, T.s3 + 0.85, T.s3 + 1.3) }, on2(t) * 3);
  if (!soFigura) marcaDan(prog(t, T.dan, T.dan + 0.45), t);
  // chão e personagem (saem juntos para baixo quando o mecanismo entra)
  ctx.save(); ctx.translate(-260 * ease.i(saida), 950 * ease.i(saida));
  soloFrente(1400, t);
  const r = egipcio(FIG[0], FIG[1], FIG[2], poseFig(t));
  // seta de tinta do dedo até Tel Dan
  const ks = ease.io(prog(t, T.setaA, T.setaB));
  if (ks > 0 && saida < 0.05) {
    const [dx, dy] = r.dedo, [tx, ty] = LUGAR.dan, ux = tx - dx, uy = ty - dy, L = Math.hypot(ux, uy), ex = tx - ux / L * 44, ey = ty - uy / L * 44;
    const pts = bezierPts([dx + 10, dy - 6], [(dx + ex) / 2 - 40, (dy + ey) / 2 - 70], [ex, ey]);
    tracoTinta(pts, ks, C.tinta, 6, [18, 12]);
    if (ks >= 1) { const a = Math.atan2(ey - pts[pts.length - 3][1], ex - pts[pts.length - 3][0]); ctx.fillStyle = C.tinta; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 20, ey + Math.sin(a) * 20); ctx.lineTo(ex + Math.cos(a + 2.5) * 22, ey + Math.sin(a + 2.5) * 22); ctx.lineTo(ex + Math.cos(a - 2.5) * 22, ey + Math.sin(a - 2.5) * 22); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------------------------------------------------------------- plano 4: pedra + mapa = mecanismo de descoberta; carimbo sela a junta
// Composição vertical (celular): estela em cima, mapa embaixo; o pino de bronze da pedra entra na argola do mapa e a trava gira.
function plano3Figura(t, saida) { const c = cam3(t); camera(c.z, c.fx, c.fy); ctx.translate(-260 * ease.i(saida), 950 * ease.i(saida)); soloFrente(1400, t); egipcio(FIG[0], FIG[1], FIG[2], poseFig(t)); }
const PLACA_MAPA = [540, 1080, 0.55], PLACA_PEDRA = [540, 468, 0.7];
const noMapa = (x, y, kM = 1) => { const [mx, my, ms] = PLACA_MAPA, cx = lerp(590, mx, kM), cy = lerp(811, my, kM), s = lerp(1, ms, kM); return [cx + (x - 590) * s, cy + (y - 811) * s]; };
function plano4(t, sobe = 0) {
  const kM = ease.io(prog(t, T.s4, T.s4 + 0.45)), kP = ease.o5(prog(t, T.s4 + 0.08, T.trava)), kTr = ease.back(prog(t, T.trava, T.trava + 0.14));
  const imp = (a, d, amp) => { const u = t - a; return u > 0 && u < d ? rs(441, Math.floor(t * 30)) * amp * (1 - u / d) : 0; };
  const sh = imp(T.trava, 0.16, 7) + imp(T.carimbo, 0.18, 10), z = lerp(1, 1.04, ease.io(prog(t, T.s4, T.s5)));
  fundoPapiro(0, -sobe * 100, 1);
  ctx.setTransform(z, 0, 0, z, W / 2 - 540 * z + sh, H / 2 - 900 * z - sobe * 1600 + sh * 0.6);
  // mapa encolhe e desce até virar a peça de baixo
  const [mx, my, ms] = PLACA_MAPA, cx = lerp(590, mx, kM), cy = lerp(811, my, kM), s = lerp(1, ms, kM);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-590, -811);
  mapa({}, on2(t) * 3); marcaDan(1, t);
  // argola de bronze na borda de cima do mapa + trava articulada (gira e prende o pino)
  pivo(590, 262, 0, 1, 1, () => {
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.stroke(); ctx.strokeStyle = C.bronze; ctx.lineWidth = 19; ctx.stroke();
    pivo(-92, 0, lerp(-1.3, 0, kTr) - Math.PI / 2, 1, 1, () => peca('M -15 0 L 15 0 L 13 170 C 13 184 -13 184 -13 170 Z', C.bronze, { lw: 5 }));
    ctx.fillStyle = C.tinta; ctx.beginPath(); ctx.arc(-92, 0, 10, 0, 7); ctx.fill();
  });
  ctx.restore();
  if (t < T.s4 + 0.4) { ctx.save(); plano3Figura(t, prog(t, T.s4, T.s4 + 0.4)); ctx.restore(); ctx.setTransform(z, 0, 0, z, W / 2 - 540 * z + sh, H / 2 - 900 * z - sobe * 1600 + sh * 0.6); }
  // estela desce de cima e encaixa o pino na argola
  const [px, py, ps] = PLACA_PEDRA, sy = lerp(-520, py, kP), rot = lerp(0.12, 0, kP);
  ctx.save(); ctx.translate(px, sy); ctx.rotate(rot); ctx.scale(ps, ps);
  peca('M -26 250 L 26 250 L 26 446 L -26 446 Z', C.bronze, { lw: 7 });
  estela(null, 1, { poeira: false, letrasClaras: true });
  ctx.restore();
  if (kP > 0.9) texto('ilustração', 192, 488, { px: 28, peso: 700, al: 'center', cor: C.tinta });
  // fio de tinta ocre: da expressão na pedra até o lugar do achado
  const kf = ease.io(prog(t, T.trava + 0.04, T.carimbo + 0.32));
  if (kf > 0) {
    const [ax, ay] = alvoEstela(), p0 = [px + ax * ps + 60, py + ay * ps], d = noMapa(LUGAR.dan[0], LUGAR.dan[1]);
    tracoTinta(bezierPts(p0, [Math.max(p0[0], d[0]) + 300, (p0[1] + d[1]) / 2], [d[0] + 24, d[1] - 10]), kf, C.ocre, 8, [22, 12]);
    const ka = ease.o(prog(t, T.carimbo + 0.3, T.carimbo + 0.6));
    if (ka > 0) {
      const tx = 772, ty = 300, w = 250;
      ctx.save(); ctx.beginPath(); ctx.rect(tx, ty - 60, w * ka + 10, 140); ctx.clip();
      peca(`M ${tx} ${ty - 44} L ${tx + w} ${ty - 40} L ${tx + w - 5} ${ty + 62} L ${tx + 3} ${ty + 66} Z`, C.linho, { lw: 3.4 });
      texto('achada em', tx + 18, ty - 2, { px: 32, peso: 700, cor: C.tinta }); texto('Tel Dan, 1993', tx + 18, ty + 42, { px: 34, peso: 900, cor: C.tinta });
      ctx.restore();
    }
  }
  carimbo(562, 744, -0.08, t - T.carimbo);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------------------------------------------------------------- plano 5: o título sai do papiro que se desenrola; câmera desce ao solo
function plano5(t) {
  const kSobe = ease.i(prog(t, T.s5, T.s5 + 0.22)), tilt0 = T.desce, desce = 820 * ease.i(prog(t, tilt0, 10.15));
  if (kSobe < 1) plano4(t, kSobe); else fundoPapiro(0, -100 - desce * 0.15, 1);
  const cy = lerp(2400, 880, ease.o(prog(t, T.s5, T.s5 + 0.34))) - desce, k = prog(t, T.rolo0, T.rolo1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (kSobe >= 1) { ctx.save(); ctx.translate(0, -desce * 0.6 + lerp(-400, 0, ease.o(prog(t, T.s5, T.s5 + 0.4)))); friso(330, on2(t) * 20, 50); ctx.restore(); }
  // estratos sob o rolo (a história "sob nossos pés")
  ctx.save(); ctx.translate(0, -desce); soloFrente(1500, t); achadosNoSolo(); ctx.restore();
  rolo(540, cy, k, () => {
    faixaHieroglifos(110, 970, cy - 262, 34, 21, C.tinta, 0.5); registro(100, 980, cy - 228);
    let px = 112; while (largura(CFG.textos.titulo[0], px, 'titulo', 900, 4) > 820) px -= 2;
    texto(CFG.textos.titulo[0], 540, cy - 74, { fam: 'titulo', px, peso: 900, al: 'center', cor: C.tinta, ls: 4 });
    texto(CFG.textos.titulo[1], 540, cy + 86, { fam: 'titulo', px: 156, peso: 900, al: 'center', cor: C.ocre, ls: 6, contorno: 10, corContorno: C.tinta });
    const ks = ease.io(prog(t, T.sub0, T.sub1)), sub = CFG.textos.subtitulo, w = largura(sub, 46, 'ui', 800);
    ctx.save(); ctx.beginPath(); ctx.rect(540 - w / 2 - 10, cy + 120, (w + 20) * ks, 80); ctx.clip(); texto(sub, 540, cy + 172, { px: 46, peso: 800, al: 'center', cor: C.tinta }); ctx.restore();
    registro(100, 980, cy + 222); faixaHieroglifos(110, 970, cy + 258, 34, 22, C.tinta, 0.5);
  });
}
function achadosNoSolo() {                            // vestígios enterrados que aparecem quando a câmera desce
  pivo(300, 1980, 0.3, 1, 1, () => peca('M -80 -20 C -40 -50 50 -50 86 -18 L 70 22 C 30 6 -30 6 -66 24 Z', C.terracota, { lw: 4 }));
  pivo(760, 2150, -0.2, 1, 1, () => { peca('M -70 -40 L 40 -56 L 86 -10 L 60 46 L -50 50 L -86 6 Z', C.basalto, { lw: 4.5, pedra: true, tex: 0.7 }); ctx.font = fonte(30, 'fen', 400); ctx.fillStyle = '#121315'; ctx.textAlign = 'center'; ctx.fillText(FEN[3] + FEN[11] + FEN[9], 0, 8); });
  pivo(520, 2330, 0.1, 1, 1, () => peca('M -60 0 C -60 -30 40 -34 60 -6 L 96 -14 L 80 6 C 60 30 -50 30 -60 0 Z', C.areiaEsc, { lw: 4 }));
}

const CENAS = {
  gancho: plano1, estela: plano2, mapa: plano3, mecanismo: plano4, titulo: plano5,
};
