// CENA 8 — APLICAÇÃO ESPIRITUAL · CENA 9 — PRÓXIMO PASSO E ENCERRAMENTO
(() => {
  // ---------------------------------------------------------- CENA 8: três cordões se torcem num só
  const VERSO = ['“O cordão de três dobras', 'não se rebenta com facilidade.”'];
  CENAS.s8 = (t, sc) => {
    const T = (p, n = 0, f = false) => G(sc, tp(sc, p, n, f));
    const tEc = T('eclesiastes'), tCd = T('cordao'), tFac = T('facilidade', 0, true), tMat = T('materiais'), tUni = T('uniao'), tDeus = T('deus'), tSus = T('sustenta');
    const kJ = ease.io(prog(t, 0.1, tCd - 0.2)), kT = ease.io(prog(t, tCd - 0.6, tCd + 1.6));
    const top = 430, y1 = 960, cx = 540;
    // três cordões chegam de lados diferentes até o ponto de encontro
    const vindas = [[[-120, 300], [200, 360], [cx - 30, top]], [[cx, -120], [cx, 200], [cx, top - 40]], [[1200, 300], [880, 360], [cx + 30, top]]];
    vindas.forEach((pts, k) => {
      const r = corda([...pts.slice(0, 2), [lerp(pts[1][0], pts[2][0], 0.5), lerp(pts[1][1], pts[2][1], 0.5)], pts[2]], { w: 42, cache: 'vinda' + k });
      desenhaCorda(r, { s1: r.L * kJ, cor: (s, j) => shade(CFG.cordoes[k], [0, -0.07, 0.05][j] + (k === 1 ? 0.04 * ease.io(prog(t, tDeus - 0.2, tDeus + 0.4)) : 0)), sentido: -1, passoTorcao: 1.1, pontaCabeca: 'corte' });
    });
    // o cordão de três dobras: torcido para baixo a partir do encontro
    const R = corda([[cx, top - 20], [cx, (top + y1) / 2], [cx, y1]], { w: 118, cache: 'tres' });
    if (kT > 0) desenhaCorda(R, { s1: R.L * kT, cor: (s, k) => CFG.cordoes[k], pontaCabeca: 'corte' });
    ctx.strokeStyle = C.contorno; ctx.lineWidth = 6; ctx.fillStyle = mix(C.creme, C.contorno, 0.5); rr(cx - 66, top - 44, 132, 40, 12); if (kJ > 0.95) { ctx.fill(); ctx.stroke(); }
    // referência e citação (ARA, literal)
    termo('Eclesiastes 4:12', W / 2, 1100, prog(t, tEc - 0.1, tEc + 0.4), { al: 'center', px: 66, cor: C.destaque });
    const kv = prog(t, tCd - 0.2, tCd + 0.4);
    if (kv > 0) {
      ctx.globalAlpha = 1; VERSO.forEach((l, i) => termo(l, W / 2, 1185 + i * 64, prog(t, tCd - 0.2 + i * 0.5, tCd + 0.3 + i * 0.5), { al: 'center', px: 50, cor: C.texto }));
      texto('Almeida Revista e Atualizada (ARA)', W / 2, 1345, { px: 30, peso: 700, cor: C.textoSuave, al: 'center' });
    }
    selo('metáfora de união', 800, 560, prog(t, tMat - 0.2, tMat + 0.3), { px: 32, cor: C.texto });
    selo('com Deus no centro', 280, 700, prog(t, tDeus - 0.2, tDeus + 0.3), { px: 32 });
    selo('um sustenta o outro', 800, 840, prog(t, tSus - 0.2, tSus + 0.3), { px: 32, cor: C.texto });
  };
  // durante a citação a legenda some: o texto bíblico já está na tela, literal
  CENAS.s8.semLegenda = (t, sc) => t > tp(sc, 'cordao') - 0.3 && t < tp(sc, 'facilidade', 0, true) + 0.3;

  // ---------------------------------------------------------- CENA 9
  let quadro = null;
  function noMini(cx, cy, k) { const r = corda(NOS.centroSuperior(cx, cy, 11, 0.62, 2.6), { w: 6.5, padrao: 'z', amostras: 5, cache: `mini${cx},${cy}` }); desenhaCorda(r, { s1: r.L * k, pontaFim: 'corte' }); }
  CENAS.s9 = (t, sc) => {
    const T = (p, n = 0, f = false) => G(sc, tp(sc, p, n, f));
    const tTeo = T('teoria'), tPra = T('pratica'), tIns = T('instrutor'), tMem = T('memoria'), tDem = T('demonstrar'), tQua = T('quadro'), tEnt = T('entenda'), tPrq = T('pratique'), tFor = T('fortaleca'), tFim = T('uniao', 0, true);
    const lim = ease.io(prog(t, tEnt - 0.4, tEnt));
    if (lim < 1) {
      ctx.globalAlpha = 1 - lim;
      // bancada de trabalho
      ctx.fillStyle = MADEIRA.medio; rr(70, 1180, 940, 60, 14); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 5; ctx.stroke();
      for (const [x, cor] of [[220, C.creme], [370, '#D9C08A']]) { for (let i = 0; i < 4; i++) { ctx.strokeStyle = C.contorno; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(x + i * 3, 1150, 60 - i * 3, 22, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = shade(cor, -0.04 * i); ctx.lineWidth = 10; ctx.stroke(); } }
      // lista: teoria feita, prática com o instrutor
      const linha = (y, txt, k, marca) => { if (k <= 0) return; ctx.fillStyle = rgba(C.fundoEsc, 0.6 * ease.o(k)); rr(90, y - 60, 900, 100, 24); ctx.fill(); texto(txt, 190, y + 12, { px: 44, peso: 800, cor: C.texto }); marca(140, y - 8, k); };
      linha(260, 'Teoria: este vídeo', prog(t, tTeo - 0.2, tTeo + 0.3), (x, y, k) => { ctx.strokeStyle = C.destaque; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x - 6, y + 16 * k); if (k > 0.5) ctx.lineTo(x + 22, y - 22 * (k - 0.5) * 2); ctx.stroke(); });
      linha(390, 'Prática: com o seu instrutor', prog(t, tPra - 0.2, tPra + 0.3), (x, y, k) => { ctx.fillStyle = C.destaque; ctx.beginPath(); ctx.moveTo(x - 20, y - 18); ctx.lineTo(x + 20, y); ctx.lineTo(x - 20, y + 18); ctx.closePath(); ctx.fill(); });
      // 20 nós de memória
      const k20 = prog(t, tMem - 0.2, tMem + 0.6);
      if (k20 > 0) { texto(String(Math.round(20 * ease.o(k20))), 120, 560, { px: 96, fam: 'titulo', peso: 700, cor: C.destaque }); texto('nós de memória', 260, 548, { px: 44, peso: 800, cor: C.texto }); texto('nome, uso e limitações', 260, 594, { px: 32, peso: 700, cor: C.textoSuave }); }
      // 4 amarras
      const k4 = prog(t, tDem - 0.2, tDem + 0.5);
      if (k4 > 0) { texto('4', 120, 720, { px: 96, fam: 'titulo', peso: 700, cor: C.destaque }); texto('amarras', 260, 708, { px: 44, peso: 800, cor: C.texto }); for (let i = 0; i < 4; i++) if (k4 > i / 4) window.IC.amarra(500 + i * 120, 690, 0.5); }
      // quadro com 25 nós (5 × 5)
      const kq = prog(t, tQua - 0.3, tQua + 1.6);
      if (kq > 0) {
        texto('25', 120, 900, { px: 96, fam: 'titulo', peso: 700, cor: C.destaque }); texto('nós num quadro', 260, 888, { px: 44, peso: 800, cor: C.texto });
        const bx = 650, by = 790, bw = 350, bh = 360; ctx.fillStyle = MADEIRA.claro; rr(bx, by, bw, bh, 16); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 5; ctx.stroke();
        for (let i = 0; i < 25; i++) { const k = clamp(kq * 25 - i); if (k <= 0) break; noMini(bx + 38 + (i % 5) * 68, by + 26 + Math.floor(i / 5) * 68, k); }
      }
      ctx.globalAlpha = 1;
    }
    // encerramento: três frases, cada uma sublinhada pela corda
    const frases = [['Entenda a corda.', tEnt], ['Pratique os nós.', tPrq], ['Fortaleça a união.', tFor]];
    frases.forEach(([f, t0], i) => {
      const k = prog(t, t0 - 0.1, t0 + 0.4); if (k <= 0) return;
      const y = 330 + i * 190;
      termo(f, CFG.safe.side + 10, y, k, { px: 84, cor: i === 2 ? C.destaque : C.texto });
      const r = corda([[CFG.safe.side + 10, y + 34], [540, y + 30], [W - CFG.safe.side - 10, y + 34]], { w: 24, cache: 'sub' + i });
      desenhaCorda(r, { s1: r.L * ease.io(prog(t, t0, t0 + 0.9)), pontaCabeca: 'corte', pontaInicio: 'corte' });
    });
    // insígnia oficial (arquivo enviado) e créditos
    const ki = ease.back(prog(t, tFim - 0.2, tFim + 0.4));
    if (ki > 0) {
      const im = document.getElementById('insignia'), s = 360 * ki;
      ctx.drawImage(im, W / 2 - s / 2, 900 - s / 2 + 30, s, s);
      texto('ESPECIALIDADE DE NÓS E AMARRAS', W / 2, 1180, { px: 44 * clamp(ki), fam: 'titulo', peso: 700, cor: C.texto, al: 'center' });
      texto('Narração: Ítalo · Distrital de Amontada', W / 2, 1240, { px: 32 * clamp(ki), peso: 700, cor: C.textoSuave, al: 'center' });
    }
  };
  CENAS.s9.semLegenda = (t, sc) => t > tp(sc, 'entenda') - 0.2;   // as frases finais já estão na tela
})();
