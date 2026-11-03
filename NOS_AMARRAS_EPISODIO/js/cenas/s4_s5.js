// CENA 4 — COMPORTAMENTO E MATERIAIS · CENA 5 — CORDAS SINTÉTICAS
(() => {
  // ---------- ícones simples (traço de contorno escuro, cores chapadas)
  const OL = (w = 5) => { ctx.strokeStyle = C.contorno; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
  const IC = {
    sol(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.destaque; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); OL(4); ctx.stroke(); ctx.strokeStyle = C.destaque; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); ctx.stroke(); } ctx.restore(); },
    varal(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); OL(6); ctx.beginPath(); ctx.moveTo(-80, 40); ctx.lineTo(-80, -40); ctx.moveTo(80, 40); ctx.lineTo(80, -40); ctx.stroke(); ctx.strokeStyle = C.creme; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-80, -34); ctx.quadraticCurveTo(0, -20, 80, -34); ctx.stroke(); ctx.fillStyle = C.ceu; ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(30, -26); ctx.lineTo(24, 22); ctx.lineTo(-36, 18); ctx.closePath(); ctx.fill(); OL(4); ctx.stroke(); ctx.restore(); },
    amarra(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); mastroLinha(-60, 50, 60, -50, 12, 4); mastroLinha(-60, -50, 60, 50, 12, 5); ctx.strokeStyle = '#D8C08A'; ctx.lineWidth = 7; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 6, -22); ctx.lineTo(14 + i * 6, 22); ctx.stroke(); } ctx.restore(); },
    ancora(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); OL(14); const p = () => { ctx.beginPath(); ctx.arc(0, -42, 12, 0, 7); ctx.moveTo(0, -30); ctx.lineTo(0, 44); ctx.moveTo(-26, -14); ctx.lineTo(26, -14); ctx.moveTo(-40, 18); ctx.quadraticCurveTo(-30, 50, 0, 46); ctx.quadraticCurveTo(30, 50, 40, 18); }; p(); ctx.stroke(); ctx.strokeStyle = '#B9C6CF'; ctx.lineWidth = 7; p(); ctx.stroke(); ctx.restore(); },
    boia(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#E7765D'; ctx.beginPath(); ctx.arc(0, 0, 36, 0, 7); ctx.fill(); ctx.fillStyle = C.texto; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 36, i * Math.PI / 2, i * Math.PI / 2 + 0.6); ctx.arc(0, 0, 16, i * Math.PI / 2 + 0.6, i * Math.PI / 2, true); ctx.fill(); } ctx.fillStyle = C.fundo; ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.fill(); OL(4); ctx.beginPath(); ctx.arc(0, 0, 36, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.stroke(); ctx.strokeStyle = C.ceu; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, 26); for (let i = 0; i <= 14; i++) ctx.lineTo(-70 + i * 10, 26 + Math.sin(i) * 4); ctx.stroke(); ctx.restore(); },
    fungo(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const [dx, dy, r] of [[-14, 6, 16], [10, 0, 20], [24, 14, 12]]) { ctx.fillStyle = '#9C8B5A'; ctx.beginPath(); ctx.arc(dx, dy, r, Math.PI, 0); ctx.fill(); OL(4); ctx.stroke(); } ctx.strokeStyle = C.coral; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-40, 34); ctx.lineTo(44, -34); ctx.stroke(); ctx.restore(); },
    pena(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.6); ctx.fillStyle = C.texto; ctx.beginPath(); ctx.moveTo(0, -46); ctx.quadraticCurveTo(24, -10, 4, 40); ctx.quadraticCurveTo(-22, -6, 0, -46); ctx.fill(); OL(4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(2, 52); ctx.stroke(); ctx.restore(); },
    gota(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.ceu; ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(30, 6, 0, 32); ctx.quadraticCurveTo(-30, 6, 0, -40); ctx.fill(); OL(4); ctx.stroke(); ctx.restore(); },
    chama(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(0, -46); ctx.bezierCurveTo(34, -10, 30, 36, 0, 38); ctx.bezierCurveTo(-30, 36, -30, 0, -8, -18); ctx.bezierCurveTo(-6, -4, 0, -2, 0, -46); ctx.fill(); OL(4); ctx.stroke(); ctx.fillStyle = C.destaque; ctx.beginPath(); ctx.moveTo(2, -6); ctx.bezierCurveTo(16, 8, 14, 30, 0, 30); ctx.bezierCurveTo(-14, 30, -12, 12, 2, -6); ctx.fill(); ctx.restore(); },
    escorrega(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.creme; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(-6, -4, 22, 0.3, 5.6); ctx.stroke(); OL(4); ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(50, 24); ctx.stroke(); ctx.fillStyle = C.contorno; ctx.beginPath(); ctx.moveTo(56, 28); ctx.lineTo(40, 26); ctx.lineTo(48, 14); ctx.closePath(); ctx.fill(); ctx.restore(); },
    lixo(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#B9C6CF'; ctx.beginPath(); ctx.moveTo(-26, -20); ctx.lineTo(26, -20); ctx.lineTo(20, 38); ctx.lineTo(-20, 38); ctx.closePath(); ctx.fill(); OL(4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-34, -28); ctx.lineTo(34, -28); ctx.moveTo(-8, -36); ctx.lineTo(8, -36); ctx.stroke(); for (const dx of [-9, 0, 9]) { ctx.beginPath(); ctx.moveTo(dx, -10); ctx.lineTo(dx * 0.8, 28); ctx.stroke(); } ctx.restore(); },
  };
  window.IC = IC;
  // amostra de corda ampliada para cada material (aparência própria; a cor sozinha não identifica)
  const AMOSTRA = {
    poliester: { cor: ['#F2F2EC', '#E3E4DC', '#F7F7F2'], passo: 0.55, pelos: false },
    sisal: { cor: ['#D9C08A', '#C9AE74', '#E2CC9A'], passo: 0.95, pelos: true },
    nylon: { cor: ['#FAFAF7', '#EDEDEA', '#FFFFFF'], passo: 0.7, pelos: false },
    polipropileno: { cor: ['#F3C230', '#E2B021', '#F8D04E'], passo: 0.8, pelos: false },
  };
  function amostra(x, y, larg, tipo, w = 54, cache = '') {
    const r = corda([[x - larg / 2, y], [x, y], [x + larg / 2, y]], { w, cache: 'am' + tipo + x + y + cache }), A = AMOSTRA[tipo];
    desenhaCorda(r, { cor: (s, k) => A.cor[k], passoTorcao: A.passo, pelos: A.pelos, pontaFim: 'corte', pontaInicio: 'corte' });
  }

  // ---------------------------------------------------------- CENA 4
  CENAS.s4 = (t, sc) => {
    const T = (p, n = 0) => G(sc, tp(sc, p, n));
    const tDin = T('dinamica'), tTr = T('tranco'), tEst = T('estatica'), tZero = T('zero'), tCon = T('construcao'), tEsp = T('especificacao'), tMat = T('material');
    const tMats = [T('poliester'), T('sisal'), T('nylon'), T('polipropileno')], tEng = T('engana'), tEtq = T('etiqueta');
    if (t < tMats[0] - 0.3) {
      // esquema de carga abstrato: duas cordas penduradas numa trave, pesos iguais
      const yb = 330, L0 = 430;
      mastroLinha(140, yb, 940, yb, 26, 7);
      const estica = (t0, amp, fr) => { const u = t - t0; if (u < 0) return 0; return amp * (1 - Math.exp(-2.6 * u) * Math.cos(fr * u)); };
      const lD = L0 * (1 + estica(tDin + 0.3, 0.32, 7)), lE = L0 * (1 + estica(tEst + 0.2, 0.035, 11));
      [[330, lD, 'DINÂMICA', tDin, C.destaque], [750, lE, 'ESTÁTICA', tEst, C.ceu]].forEach(([x, l, nome, t0, cor], i) => {
        const r = corda([[x, yb + 20], [x, yb + 20 + l / 2], [x, yb + 20 + l]], { w: 40 });
        desenhaCorda(r, { passoTorcao: 0.92 * l / L0, cor: (s, k) => [C.creme, shade(C.creme, -0.05), shade(C.creme, 0.04)][k] });
        // peso (carga abstrata)
        const yw = yb + 20 + l, kw = ease.o(prog(t, t0 - 0.4, t0));
        ctx.fillStyle = '#9FB0BA'; rr(x - 70, yw, 140, 110, 14); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 5; ctx.stroke();
        texto('carga', x, yw + 68, { px: 34, peso: 800, cor: C.contorno, al: 'center' });
        // régua: comprimento sem carga (tracejado) e o alongamento
        ctx.setLineDash([10, 10]); ctx.strokeStyle = rgba(C.texto, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 110, yb + 20 + L0); ctx.lineTo(x + 110, yb + 20 + L0); ctx.stroke(); ctx.setLineDash([]);
        if (l - L0 > 2) { ctx.strokeStyle = cor; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 125, yb + 20 + L0); ctx.lineTo(x + 125, yw); ctx.stroke(); }
        termo(nome, x, 250, prog(t, t0 - 0.2, t0 + 0.3), { al: 'center', cor, px: 58 });
      });
      selo('estica bastante', 330, 1110, prog(t, tDin + 0.6, tDin + 1.0), { px: 34 });
      selo('absorve o tranco', 330, 1180, prog(t, tTr - 0.2, tTr + 0.2), { px: 34, cor: C.texto });
      selo('estica pouco', 750, 1110, prog(t, tEst + 0.4, tEst + 0.8), { px: 34, cor: C.ceu });
      selo('pouco ≠ zero', 750, 1180, prog(t, tZero - 0.2, tZero + 0.2), { px: 34, cor: C.texto });
      // o comportamento depende da construção e da especificação
      const kc = prog(t, tCon - 0.2, tCon + 0.3), ke = prog(t, tEsp - 0.2, tEsp + 0.3), km = prog(t, tMat - 0.3, tMat + 0.2);
      if (kc > 0) {
        ctx.fillStyle = rgba(C.fundoEsc, 0.78 * ease.o(kc)); rr(90, 1250, 900, 170, 30); ctx.fill();
        selo('construção', 300, 1300, kc, { px: 36, cor: C.texto }); selo('especificação', 640, 1300, ke, { px: 36, cor: C.texto });
        texto('não só o material', 540, 1385, { px: 40 * ease.o(km), peso: 800, cor: C.destaque, al: 'center' });
      }
      return;
    }
    // materiais: um cartão por vez (2 × 2), com amostra ampliada e um uso verificado
    const M = [['poliester', 'POLIÉSTER', 'estica pouco, aguenta sol', IC.varal, IC.sol], ['sisal', 'SISAL', 'áspero, firma amarras', IC.amarra], ['nylon', 'NYLON', 'elástico, amortece trancos', IC.ancora], ['polipropileno', 'POLIPROPILENO', 'leve, flutua', IC.boia]];
    const kEng = ease.io(prog(t, tEng - 0.3, tEng + 0.3));
    M.forEach(([id, nome, linha, ic, ic2], i) => {
      const k = ease.back(prog(t, tMats[i] - 0.25, tMats[i] + 0.3)); if (k <= 0) return;
      const cx = i % 2 ? 790 : 290, cy = i < 2 ? 470 : 990, w = 460, h = 470;
      ctx.setTransform(k, 0, 0, k, cx * (1 - k), cy * (1 - k));
      ctx.globalAlpha = 1 - 0.75 * kEng;
      ctx.fillStyle = rgba(C.fundoEsc, 0.6); rr(cx - w / 2, cy - h / 2, w, h, 30); ctx.fill();
      texto(nome, cx, cy - 165, { px: nome.length > 10 ? 44 : 52, fam: 'titulo', peso: 700, cor: C.texto, al: 'center' });
      amostra(cx, cy - 70, 360, id, 62);
      ic(cx - (ic2 ? 40 : 0), cy + 70, 0.9); if (ic2) ic2(cx + 120, cy + 40, 0.6);
      texto(linha, cx, cy + 180, { px: 32, peso: 700, cor: C.textoSuave, al: 'center' });
      ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    // "a cor engana": duas amostras da mesma cor, materiais diferentes — só a etiqueta diz
    if (kEng > 0) {
      ctx.fillStyle = rgba(C.fundoEsc, 0.92 * kEng); rr(90, 560, 900, 400, 34); ctx.fill();
      ctx.globalAlpha = kEng;
      const desenhaAm = (x, tipoVisual) => { const r = corda([[x - 150, 700], [x, 700], [x + 150, 700]], { w: 60, cache: 'eng' + x }); desenhaCorda(r, { cor: (s, k) => AMOSTRA.polipropileno.cor[k], passoTorcao: tipoVisual, pontaFim: 'corte', pontaInicio: 'corte' }); };
      desenhaAm(320, 0.8); desenhaAm(760, 0.62);
      texto('?', 540, 725, { px: 90, fam: 'titulo', peso: 700, cor: C.destaque, al: 'center' });
      const ke = ease.back(prog(t, tEtq - 0.3, tEtq + 0.3));
      if (ke > 0) {
        [[320, 'polipropileno'], [760, 'nylon']].forEach(([x, nome], i) => {
          ctx.save(); ctx.translate(x, 760); ctx.rotate(Math.sin((t - tEtq) * 5 + i) * 0.08 * (1 - prog(t, tEtq, tEtq + 1.5))); ctx.scale(ke, ke);
          ctx.strokeStyle = C.texto; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 20); ctx.stroke();
          ctx.fillStyle = C.texto; rr(-120, 20, 240, 110, 14); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 4; ctx.stroke();
          texto('ETIQUETA', 0, 60, { px: 26, peso: 800, cor: rgba(C.contorno, 0.6), al: 'center' }); texto(nome, 0, 105, { px: 34, peso: 800, cor: C.contorno, al: 'center' });
          ctx.restore();
        });
      }
      texto('aparência e cor não identificam o material', 540, 620, { px: 34, peso: 700, cor: C.textoSuave, al: 'center' });
      ctx.globalAlpha = 1;
    }
  };

  // ---------------------------------------------------------- CENA 5
  CENAS.s5 = (t, sc) => {
    const T = (p, n = 0) => G(sc, tp(sc, p, n));
    const itens = [
      [0, 'não apodrecem', IC.fungo, T('apodrecem')], [0, 'leves', IC.pena, T('leves')], [0, 'aguentam umidade', IC.gota, T('umidade')],
      [1, 'derretem com calor e atrito', IC.chama, T('derretem')], [1, 'algumas escorregam', IC.escorrega, T('escorregam')], [1, 'o sol afeta umas mais', IC.sol, T('sol')],
      [1, 'não biodegradáveis', IC.lixo, T('biodegradavel')],
    ];
    termo('SINTÉTICAS', W / 2, 230, prog(t, 0, 0.4), { al: 'center', px: 66 });
    termo('VANTAGENS', 290, 360, prog(t, T('apodrecem') - 0.3, T('apodrecem')), { al: 'center', px: 48, cor: C.ceu });
    termo('LIMITES', 790, 360, prog(t, T('derretem') - 0.3, T('derretem')), { al: 'center', px: 48, cor: C.coral });
    ctx.strokeStyle = rgba(C.texto, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(540, 320); ctx.lineTo(540, 320 + 1000 * ease.io(prog(t, T('derretem') - 0.4, T('derretem') + 0.3))); ctx.stroke();
    const conta = [0, 0];
    for (const [col, txt, ic, t0] of itens) {
      const k = ease.back(prog(t, t0 - 0.2, t0 + 0.3)), i = conta[col]++; if (k <= 0) continue;
      const cx = col ? 790 : 290, cy = 480 + i * 215;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.fillStyle = rgba(C.fundoEsc, 0.6); rr(-215, -85, 430, 170, 26); ctx.fill(); ctx.restore();
      ic(cx - 140, cy, 0.95 * k);
      ctx.save(); ctx.globalAlpha = clamp(k); const ls = quebra(txt, 250, 36, 'ui', 800); ls.forEach((l, j) => texto(l, cx - 75, cy + 12 - (ls.length - 1) * 22 + j * 44, { px: 36, peso: 800, cor: C.texto })); ctx.restore();
    }
    selo('varia de material para material', 790, 1380, prog(t, T('outras') - 0.2, T('outras') + 0.3), { px: 32, cor: C.destaque });
    selo('descarte com cuidado', 290, 1380, prog(t, T('descarte') - 0.2, T('descarte') + 0.3), { px: 32, cor: C.texto });
  };
})();
