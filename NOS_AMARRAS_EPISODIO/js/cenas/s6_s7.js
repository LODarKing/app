// CENA 6 — CONSERVAÇÃO · CENA 7 — INÍCIO DAS AMARRAS
(() => {
  const OL = (w = 5) => { ctx.strokeStyle = C.contorno; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
  function lupa(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.contorno; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(38, 38); ctx.lineTo(80, 80); ctx.stroke(); ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 11; ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,0.18)'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.fill(); OL(10); ctx.stroke(); ctx.strokeStyle = '#C9D2D8'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
  function balde(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#B9C6CF'; ctx.beginPath(); ctx.moveTo(-44, -30); ctx.lineTo(44, -30); ctx.lineTo(34, 44); ctx.lineTo(-34, 44); ctx.closePath(); ctx.fill(); OL(5); ctx.stroke(); ctx.fillStyle = C.ceu; ctx.beginPath(); ctx.ellipse(0, -30, 44, 10, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -30, 44, Math.PI, 0); ctx.stroke(); ctx.restore(); }
  function manual(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.texto; rr(-40, -50, 80, 100, 8); ctx.fill(); OL(5); ctx.stroke(); ctx.strokeStyle = rgba(C.contorno, 0.6); ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-24, -26 + i * 18); ctx.lineTo(24, -26 + i * 18); ctx.stroke(); } ctx.restore(); }
  function lona(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#4E7F5F'; ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(0, -70); ctx.lineTo(110, -20); ctx.closePath(); ctx.fill(); OL(5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-90, -12); ctx.lineTo(-90, 60); ctx.moveTo(90, -12); ctx.lineTo(90, 60); ctx.stroke(); ctx.strokeStyle = C.creme; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-90, 2); ctx.quadraticCurveTo(0, 14, 90, 2); ctx.stroke(); ctx.strokeStyle = C.creme; ctx.lineWidth = 10; for (const dx of [-40, 0, 40]) { ctx.beginPath(); ctx.moveTo(dx - 6, 8); ctx.quadraticCurveTo(dx, 52, dx + 6, 8); ctx.stroke(); } ctx.restore(); }
  function meada(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 5; i++) { ctx.strokeStyle = C.contorno; ctx.lineWidth = 17; ctx.beginPath(); ctx.ellipse(i * 3 - 6, 0, 52 - i * 2, 34 - i, 0.15, 0, 7); ctx.stroke(); ctx.strokeStyle = shade(C.creme, -0.04 * i); ctx.lineWidth = 11; ctx.stroke(); } ctx.strokeStyle = C.coral; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-8, -44); ctx.lineTo(-2, 44); ctx.stroke(); ctx.restore(); }
  function proibe(x, y, r, desenho) { desenho(x, y, 0.55); ctx.strokeStyle = C.coral; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.moveTo(x - r * 0.7, y + r * 0.7); ctx.lineTo(x + r * 0.7, y - r * 0.7); ctx.stroke(); }
  function frasco(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#C9D2D8'; ctx.beginPath(); ctx.moveTo(-14, -46); ctx.lineTo(14, -46); ctx.lineTo(14, -20); ctx.lineTo(34, 30); ctx.lineTo(-34, 30); ctx.lineTo(-14, -20); ctx.closePath(); ctx.fill(); OL(5); ctx.stroke(); ctx.fillStyle = C.destaque; ctx.beginPath(); ctx.moveTo(-24, 6); ctx.lineTo(24, 6); ctx.lineTo(34, 30); ctx.lineTo(-34, 30); ctx.closePath(); ctx.fill(); ctx.restore(); }

  // ---------------------------------------------------------- CENA 6
  CENAS.s6 = (t, sc) => {
    const T = (p, n = 0) => G(sc, tp(sc, p, n));
    const tIns = T('inspecione'), tCor = T('cortes'), tDur = T('duras'), tDes = T('desgarte'), tLim = T('limpe'), tFab = T('fabricante'), tSeq = T('seque'), tSom = T('sombra'), tGua = T('guarde'), tSol = T('sol'), tQui = T('quimicos'), tDan = T('danificada'), tCri = T('critico'), tApo = T('aposenta');
    const fim = ease.io(prog(t, tDan - 0.3, tDan + 0.3));
    ctx.globalAlpha = 1 - 0.8 * fim;
    // 1) inspecionar: a lupa percorre a corda e cada defeito aparece quando é nomeado
    const k1 = prog(t, tIns - 0.2, tIns + 0.3);
    termo('INSPECIONAR', CFG.safe.side, 230, k1, { sub: 'antes e depois do uso', cor: C.destaque, px: 54 });
    if (k1 > 0) {
      const r = corda([[150, 420], [570, 420], [990, 420]], { w: 58, cache: 'insp' }); desenhaCorda(r, { pontaFim: 'corte', pontaInicio: 'corte' });
      const def = [[330, tCor, 'corte'], [580, tDur, 'dura/brilhante'], [830, tDes, 'desgaste']];
      def.forEach(([x, t0, nome], i) => {
        const k = prog(t, t0 - 0.1, t0 + 0.3); if (k <= 0) return;
        if (i === 0) { ctx.fillStyle = C.fundo; ctx.beginPath(); ctx.moveTo(x - 16, 392); ctx.lineTo(x + 4, 436); ctx.lineTo(x + 18, 392); ctx.closePath(); ctx.fill(); }
        if (i === 1) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(x - 40, 396, 80, 48, 12); ctx.fill(); ctx.strokeStyle = rgba(C.contorno, 0.4); ctx.lineWidth = 2; ctx.stroke(); }
        if (i === 2) { ctx.strokeStyle = shade(C.creme, -0.2); ctx.lineWidth = 2; for (let q = 0; q < 22; q++) { const a = rnd(71, q) * 6.28, l = 10 + rnd(72, q) * 16, xx = x - 40 + rnd(73, q) * 80; ctx.beginPath(); ctx.moveTo(xx, 395); ctx.lineTo(xx + Math.cos(a) * l, 395 - Math.abs(Math.sin(a)) * l); ctx.stroke(); } }
        selo(nome, x, 510, k, { px: 30, cor: C.texto });
      });
      const xl = lerp(250, 830, ease.io(prog(t, tCor - 0.4, tDes + 0.2))); lupa(xl, 410, 0.95);
    }
    // 2) limpar conforme o fabricante · 3) secar à sombra · 4) guardar enrolada, longe do sol e de químicos
    const linha = (y, nome, sub, t0, desenha) => { const k = prog(t, t0 - 0.2, t0 + 0.3); if (k <= 0) return; ctx.fillStyle = rgba(C.fundoEsc, 0.55 * k); rr(90, y - 110, 900, 220, 28); ctx.fill(); desenha(k); termo(nome, 400, y - 10, k, { sub, px: 50 }); };
    linha(700, 'LIMPAR', 'como o fabricante orienta', tLim, (k) => { balde(210, 700, 0.9 * k); if (t > tFab - 0.2) manual(320, 700, 0.85 * ease.back(prog(t, tFab - 0.2, tFab + 0.2))); });
    linha(960, 'SECAR', 'à sombra, sem calor', tSeq, (k) => { lona(245, 975, 0.85 * k); if (t > tSom - 0.2) proibe(355, 900, 30, (x, y, s) => window.IC.sol(x, y, s)); });
    linha(1220, 'GUARDAR', 'enrolada, longe do sol e de químicos', tGua, (k) => { meada(215, 1220, 0.95 * k); if (t > tSol - 0.2) proibe(330, 1170, 30, (x, y, s) => window.IC.sol(x, y, s)); if (t > tQui - 0.2) proibe(330, 1270, 30, frasco); });
    ctx.globalAlpha = 1;
    // corda danificada: aposentada para uso crítico
    if (fim > 0) {
      const r = corda([[160, 760], [540, 760], [920, 760]], { w: 72, cache: 'danif' });
      ctx.globalAlpha = fim; desenhaCorda(r, { cor: (s, k) => shade(C.creme, -0.12 - 0.05 * k), pontaFim: 'corte', pontaInicio: 'corte' });
      ctx.fillStyle = C.fundo; ctx.beginPath(); ctx.moveTo(500, 722); ctx.lineTo(530, 790); ctx.lineTo(560, 722); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(660, 728, 110, 64, 14); ctx.fill();
      ctx.globalAlpha = 1;
      const ke = ease.back(prog(t, tCri - 0.2, tApo + 0.2));
      if (ke > 0) { ctx.save(); ctx.translate(540, 950); ctx.rotate(-0.05); ctx.scale(ke, ke); ctx.fillStyle = C.coral; rr(-300, -70, 600, 140, 22); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 5; ctx.stroke(); texto('APOSENTADA', 0, 2, { px: 64, fam: 'titulo', peso: 700, cor: C.texto, al: 'center' }); texto('para uso crítico', 0, 48, { px: 32, peso: 800, cor: C.texto, al: 'center' }); ctx.restore(); }
      termo('CORDA DANIFICADA', W / 2, 600, prog(t, tDan, tDan + 0.4), { al: 'center', sub: 'não volta a ser segura', px: 56 });
    }
  };

  // ---------------------------------------------------------- CENA 7
  // volta da ribeira em volta dos dois paus cruzados (frente: a passada vertical; trás: escondida pelos paus);
  // o chicote dá uma volta na parte fixa e depois se torce 3 vezes na própria passada (alternando por cima/por baixo)
  function ribeiraPontos(cx, cy) {
    const P = [[cx + 470, cy - 470, 1], [cx + 200, cy - 250, 1], [cx + 30, cy - 205, 1], [cx - 10, cy - 190, 0],
      [cx - 30, cy - 120, -1], [cx - 40, cy, -1], [cx - 30, cy + 120, -1], [cx - 10, cy + 200, 0], [cx + 14, cy + 200, 1.2],   // por trás dos dois paus
      [cx + 24, cy + 100, 1.2], [cx + 26, cy - 60, 1.2], [cx + 40, cy - 150, 1.2], [cx + 120, cy - 238, 0.6], [cx + 175, cy - 268, 0.6],   // passada da frente sobe; passa por baixo da parte fixa
      [cx + 200, cy - 200, 2], [cx + 120, cy - 160, 2]];                                                                  // volta por cima da parte fixa
    // torções do chicote em volta da passada da frente (x ≈ cx+24), descendo
    for (let i = 0; i <= 18; i++) { const u = i / 18, ph = u * 3 * 2 * Math.PI; P.push([cx + 24 + 52 * Math.sin(ph + Math.PI / 2) * (0.6 + 0.4 * Math.cos(u * 3)), cy - 110 + u * 250, 1.2 + 0.9 * Math.cos(ph + Math.PI / 2 + Math.PI / 2)]); }
    return P;
  }
  CENAS.s7 = (t, sc) => {
    const T = (p, n = 0) => G(sc, tp(sc, p, n));
    const tQua = T('quadrada'), tFiel = T('fiel'), tMas = T('mastro'), tTra = T('travessa'), tDia = T('diagonal'), tRib = T('ribeira'), tAbr = T('abraca'), tApr = T('aproxima'), tIni = T('inicial');
    if (t < tDia - 0.2) {
      // amarra quadrada: mastro vertical, travessa na frente; volta do fiel no mastro, logo abaixo da travessa
      const r = NOS.fiel(540, 720, 1.15), s1 = r.L * ease.io(prog(t, tFiel - 0.2, tMas + 0.4)), sai = ease.io(prog(t, tDia - 0.7, tDia - 0.2));
      ctx.setTransform(1, 0, 0, 1, -sai * 1100, 0);
      mastroLinha(540, 300, 540, 1170, 52, 8);
      // travessa na frente do mastro; a ponta da corda sobe por cima dela (rumo à primeira volta da amarra)
      desenhaCordaZ(r, { s1: Math.max(1, s1), entre: () => mastroLinha(130, 560, 950, 560, 48, 9), pontaCabeca: 'corte', pontaInicio: 'corte' });
      // ponto inicial e sentido das voltas
      const ki = prog(t, tMas - 0.1, tMas + 0.3);
      if (ki > 0) { ctx.fillStyle = C.destaque; ctx.beginPath(); ctx.arc(540, 720, 16 * ease.back(ki), 0, 7); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 4; ctx.stroke(); }
      const ka = ease.io(prog(t, tTra - 0.2, tTra + 0.6));
      if (ka > 0) { ctx.strokeStyle = C.destaque; ctx.lineWidth = 8; ctx.setLineDash([18, 14]); ctx.beginPath(); ctx.moveTo(470, 690); ctx.quadraticCurveTo(360, 560 - 60 * ka, 470 + 160 * ka, 470 + 20 * (1 - ka)); ctx.stroke(); ctx.setLineDash([]); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      termo('AMARRA QUADRADA', CFG.safe.side, 1250, prog(t, tQua - 0.1, tQua + 0.3) * (1 - sai), { sub: 'começa com a volta do fiel', cor: C.destaque });
      selo('logo abaixo da travessa', 790, 720, prog(t, tTra, tTra + 0.4) * (1 - sai), { px: 32 });
      termoTitulo(); return;
    }
    // amarra diagonal: dois paus em X; a volta da ribeira abraça os dois no cruzamento e os aproxima
    const ent = ease.o(prog(t, tDia - 0.2, tDia + 0.4)), apr = ease.io(prog(t, tApr - 0.1, tApr + 0.8)), cx = 540, cy = 800;
    const ang = lerp(0.62, 0.55, apr), L = 470, gap = lerp(14, 0, apr);
    ctx.setTransform(1, 0, 0, 1, (1 - ent) * 1100, 0);
    const pau = (sgn, sem) => mastroLinha(cx - Math.cos(ang) * L * sgn - gap * sgn, cy - Math.sin(ang) * L, cx + Math.cos(ang) * L * sgn - gap * sgn, cy + Math.sin(ang) * L, 44, sem);
    const R = corda(ribeiraPontos(cx, cy), { w: 30, padrao: 'z', amostras: 8, cache: 'ribeira' });
    const s1 = R.L * ease.io(prog(t, tRib - 0.3, tAbr + 0.5));
    desenhaCordaZ(R, { s1: Math.max(1, s1), entre: () => { pau(1, 11); pau(-1, 12); }, pontaCabeca: 'corte', pontaInicio: 'corte' });
    if (apr > 0) { ctx.strokeStyle = C.destaque; ctx.lineWidth = 8; for (const sg of [-1, 1]) { const x0 = cx + sg * 200; ctx.beginPath(); ctx.moveTo(x0, cy + 330); ctx.lineTo(x0 - sg * 70 * apr, cy + 330); ctx.stroke(); ctx.fillStyle = C.destaque; ctx.beginPath(); const xe = x0 - sg * 70 * apr - sg * 6; ctx.moveTo(xe - sg * 20, cy + 330); ctx.lineTo(xe + sg * 4, cy + 314); ctx.lineTo(xe + sg * 4, cy + 346); ctx.closePath(); ctx.fill(); } }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    termo('AMARRA DIAGONAL', CFG.safe.side, 1250, prog(t, tDia - 0.1, tDia + 0.3), { sub: 'começa com a volta da ribeira', cor: C.destaque });
    selo('abraça os dois paus', 780, 380, prog(t, tAbr - 0.1, tAbr + 0.3), { px: 32, cor: C.texto });
    selo('cada amarra tem seu nó inicial', W / 2, 1380, prog(t, tIni - 0.5, tIni), { px: 34 });
    termoTitulo();
    function termoTitulo() { termo('COMO COMEÇAR UMA AMARRA?', W / 2, 215, prog(t, 0, 0.4) * (1 - prog(t, tQua - 0.2, tQua + 0.1)), { al: 'center', px: 56, cor: C.destaque }); }
  };
})();
