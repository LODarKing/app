// CENA 3 — VOCABULÁRIO. Uma corda só que se transforma: partes (restante, corrediça, chicote) → seio → volta → nó superior
// → alça de azelha → amarra (volta do fiel no mastro) → curva (nó de fita) → união de cordas (emenda).
// Regra: transformar → segurar → nomear. Formas novas nascem pela ponta guiando a corda; nada atravessa nada.
(() => {
  const YT = 1250, XT = CFG.safe.side + 6;                      // posição fixa do nome do termo (acima da legenda)
  const WR = 56, Y0 = 700, XFIM = 930, XDIV = 560;               // corda reta: chicote à direita; divisa restante/corrediça
  const dimc = (c, k) => mix(c, C.fundo, 0.55 * k);
  let G3 = null;
  function prep() {
    if (G3) return G3;
    const sup = NOS.superior(540, 560, 118, WR);
    // posições dos cruzamentos ao longo do caminho: o seio vai até antes da 1ª passagem que FECHA um cruzamento
    const fechos = sup.cruz.map((c) => Math.max(c.sA, c.sB)).sort((a, b) => a - b);
    const sSeio = fechos[0] - 2.4 * WR, sVolta = fechos[0] + 1.6 * WR;
    const supRes = reamostraPts(sup.pontos, 70);
    G3 = { sup, fechos, sSeio, sVolta };
    return G3;
  }
  // corda reta com a ponta corrediça podendo balançar (sem cruzar nada)
  function reta(bal) {
    const pts = []; for (let i = 0; i <= 24; i++) { const x = lerp(-140, XFIM, i / 24), u = clamp((x - XDIV) / (XFIM - XDIV)); pts.push([x, Y0 - bal * 120 * u * u * Math.sin(1.2 + u * 1.4)]); }
    return corda(pts, { w: WR });
  }
  // fibras soltas na ponta (desfiado)
  function desfiado(r, k) {
    if (k <= 0) return; const e = em(r, r.L), m = Math.hypot(e.tx, e.ty) || 1, tx = e.tx / m, ty = e.ty / m, nx = -ty, ny = tx;
    ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const o = (rnd(31, i) - 0.5) * WR * 0.9, a = (rnd(32, i) - 0.5) * 1.3 * k, l = WR * (0.5 + rnd(33, i) * 0.9) * k, x0 = e.x + nx * o - tx * 4, y0 = e.y + ny * o - ty * 4;
      ctx.strokeStyle = shade(C.creme, -0.1 - rnd(34, i) * 0.25); ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + tx * l * 0.5 + nx * o * 0.3 * k, y0 + ty * l * 0.5 + ny * o * 0.3 * k, x0 + (tx * Math.cos(a) - ty * Math.sin(a)) * l + nx * o * 0.6 * k, y0 + (ty * Math.cos(a) + tx * Math.sin(a)) * l + ny * o * 0.6 * k); ctx.stroke();
    }
  }
  function falcaca(r, k) {             // a falcaça se forma volta a volta
    if (k <= 0) return; const n = Math.round(7 * k), w = r.w;
    for (let i = 0; i < n; i++) { const s = r.L - w * 0.25 - i * w * 0.14, q = bordas(r, s, w * 1.1); ctx.strokeStyle = mix(C.creme, C.contorno, 0.55); ctx.lineWidth = w * 0.12; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(q.l[0], q.l[1]); ctx.lineTo(q.d[0], q.d[1]); ctx.stroke(); ctx.strokeStyle = rgba(C.contorno, 0.5); ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  // emenda: duas cordas que se encontram; na zona da emenda os cordões das duas se alternam
  function emenda(t, sc, kJunta, kZona) {
    const xm = 540, folga = lerp(260, 0, ease.io(kJunta)), L1 = xm - 40 - folga, R1 = xm + 40 + folga;
    const meia = 190 * ease.io(kZona);
    // corda branca (esquerda) e azul (direita): quando juntas, uma corda só com a zona trançada
    if (kZona <= 0) {
      const a = corda([[-140, Y0], [L1 / 2, Y0], [L1, Y0]], { w: WR }), b = corda([[1220, Y0], [(R1 + 1220) / 2, Y0], [R1, Y0]], { w: WR });
      desenhaCorda(a, { pontaFim: 'corte' }); desenhaCorda(b, { pontaFim: 'corte', cor: () => C.ceu });
      return;
    }
    const r = corda([[-140, Y0], [540, Y0], [1220, Y0]], { w: WR, cache: 'emenda' }), sm = (540 + 140);
    const p = WR * 0.92;
    desenhaCorda(r, { cor: (s, k) => {
      const d = s - sm; if (d < -meia) return C.creme; if (d > meia) return C.ceu;
      const per = Math.floor((s + 140) / (p * 3)); const outro = (k + per) % 3 === 0;   // um cordão em cada três é da outra corda
      return (d < 0) !== outro ? C.creme : C.ceu;
    } });
    // marcas da zona entrelaçada
    ctx.strokeStyle = rgba(C.destaque, 0.95); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const x of [540 - meia, 540 + meia]) { ctx.beginPath(); ctx.moveTo(x, Y0 - WR * 0.95); ctx.lineTo(x, Y0 - WR * 1.35); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(540 - meia, Y0 - WR * 1.15); ctx.lineTo(540 + meia, Y0 - WR * 1.15); ctx.stroke();
  }

  CENAS.s3 = (t, sc) => {
    const g = prep();
    const T = (p, n = 0, f = false) => G(sc, tp(sc, p, n, f));
    const tRest = T('restante'), tCor = T('corredica'), tMov = T('movimenta'), tChi = T('chicote'), tExt = T('extremidade'), tAca = T('acabamento'), tDes = T('desfiar');
    const tDob = T('dobrada'), tCruzar = T('cruzar'), tSeio = T('seio'), tCruzou = T('cruzou'), tVolta = T('volta'), tPasse = T('passe'), tSup = T('superior'), tSimp = T('simples');
    const tMesmo = T('mesmo'), tAz = T('azelha'), tFixa = T('fixa', 1), tCorre = T('corre', 1), tAm = T('amarra'), tObj = T('objeto'), tMastro = T('mastro');
    const tCurva = T('curva'), tTec = T('tecnico'), tUne = T('une'), tPontas = T('pontas'), tUniao = T('uniao'), tEm = T('emenda'), tEntre = T('entrelacados'), tSem = T('sem', 1);

    // ---------------------------------------------------------- A) partes da corda (corda reta)
    if (t < tDob) {
      const bal = Math.sin(Math.PI * prog(t, tMov - 0.3, tMov + 1.3)) * ease.io(prog(t, tMov - 0.3, tMov + 0.2));
      const r = reta(bal), sDiv = (XDIV + 140) / (XFIM + 140) * r.L;
      const kR = prog(t, tRest, tRest + 0.4) * (1 - prog(t, tCor - 0.2, tCor + 0.2)), kC = prog(t, tCor, tCor + 0.4) * (1 - prog(t, tChi - 0.2, tChi + 0.2));
      const kF = ease.o(prog(t, tExt, tExt + 0.6)) * (1 - ease.io(prog(t, tAca + 0.2, tDes + 0.3))), kFal = prog(t, tAca, tDes + 0.2);
      const zc = ease.io(prog(t, tChi - 0.2, tChi + 0.5)) * (1 - ease.io(prog(t, tDes + 0.6, tDob))), z = lerp(1, 2.3, zc);
      camera(z, lerp(W / 2, 800, zc), lerp(H / 2, Y0, zc));
      desenhaCorda(r, { cor: (s) => s < sDiv ? (kR > 0 ? mix(C.creme, C.ceu, kR) : dimc(C.creme, kC)) : (kC > 0 ? mix(C.creme, C.destaque, kC) : dimc(C.creme, kR)), pontaFim: kF > 0.05 ? null : 'corte', pelos: z > 1.5 });
      desfiado(r, kF); falcaca(r, kFal);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // marcadores: cadeado na parte fixa, seta de movimento na corrediça
      if (kR > 0) { selo('parada', 300, Y0 - 110, kR, { cor: C.ceu }); }
      if (kC > 0) { selo('se move', 800, Y0 - 150, kC); }
      termo('CORDA RESTANTE', XT, YT, prog(t, tRest, tRest + 0.5) * (1 - prog(t, tCor - 0.25, tCor)), { sub: 'ou ponta fixa', alvo: [300, Y0 + WR / 2 + 6], cor: C.ceu });
      termo('PONTA CORREDIÇA', XT, YT, prog(t, tCor, tCor + 0.5) * (1 - prog(t, tChi - 0.25, tChi)), { sub: 'o vivo', alvo: [780, Y0 + WR / 2 + 6], cor: C.destaque });
      termo('CHICOTE', XT, YT, prog(t, tChi + 0.3, tChi + 0.8) * (1 - prog(t, tDob - 0.3, tDob)), { sub: 'a extremidade', cor: C.texto });
      if (zc > 0.5) selo('falcaça', W / 2 + 230, H / 2 - 260, prog(t, tAca + 0.3, tAca + 0.7) * (1 - prog(t, tDob - 0.4, tDob)), { cor: C.texto });
      return;
    }
    // ---------------------------------------------------------- B) seio → volta → nó superior (a mesma corda)
    if (t < tMesmo + 0.9) {
      const S = g.sup;
      let s1;
      if (t < tCruzou) s1 = g.sSeio;
      else if (t < tPasse) s1 = lerp(g.sSeio, g.sVolta, ease.io(prog(t, tCruzou, tVolta)));
      else s1 = lerp(g.sVolta, S.L, ease.io(prog(t, tPasse, tSup)));
      const desfaz = ease.io(prog(t, tMesmo, tMesmo + 0.9));             // "o mesmo nó, feito no seio": desfaz pela ponta
      s1 = lerp(s1, 0, desfaz);
      // da corda reta para o seio: a corda reta é recolhida pela ponta e a mesma ponta volta guiando a corda em U
      const recolhe = ease.i(prog(t, tDob - 0.05, tDob + 0.35));
      if (recolhe < 1) { const r = reta(0); desenhaCorda(r, { s1: r.L * (1 - recolhe), pontaCabeca: 'falcaca' }); return termosB(); }
      const sSeio = g.sSeio * ease.o(prog(t, tDob + 0.35, tSeio));
      desenhaCorda(S, { s1: Math.max(1, t < tCruzou ? sSeio : s1), pontaCabeca: 'falcaca' });
      termosB(); return;
      function termosB() {
      // destaques
      const c0 = S.cruz.find((c) => Math.abs(Math.max(c.sA, c.sB) - g.fechos[0]) < 1);
      const kSem = prog(t, tCruzar, tCruzar + 0.4) * (1 - prog(t, tCruzou - 0.3, tCruzou));
      selo('sem cruzar', 540, 250, kSem, { cor: C.texto });
      if (c0) anel(c0.x, c0.y, WR * 1.5, prog(t, tVolta - 0.2, tVolta + 0.5) * (1 - prog(t, tPasse - 0.2, tPasse)));
      termo('SEIO', XT, YT, prog(t, tSeio - 0.15, tSeio + 0.35) * (1 - prog(t, tCruzou - 0.25, tCruzou)), { sub: 'dobra em U, sem cruzar' });
      termo('VOLTA', XT, YT, prog(t, tVolta - 0.1, tVolta + 0.4) * (1 - prog(t, tSup - 0.35, tSup - 0.1)), { sub: 'a corda cruza sobre si mesma', cor: C.destaque });
      termo('NÓ SUPERIOR', XT, YT, prog(t, tSup - 0.1, tSup + 0.4) * (1 - prog(t, tMesmo - 0.25, tMesmo)), { sub: 'o nó simples' });
      }
    }
    // ---------------------------------------------------------- C) alça de azelha (o mesmo nó feito com o seio)
    if (t < tAm - 0.2) {
      const A = NOS.azelha(), metade = A.L / 2, k = ease.io(prog(t, tMesmo + 0.9, tAz + 0.2)), a = metade * k;
      const sai = ease.io(prog(t, tAm - 0.7, tAm - 0.2));
      ctx.setTransform(1, 0, 0, 1, -sai * 900, 0);
      // as duas pernas crescem juntas a partir das partes fixas; o seio (a alça) fecha por último
      const puxa = Math.sin(Math.PI * prog(t, tCorre - 0.3, tCorre + 0.6));
      ctx.translate(0, puxa * 18);
      desenhaCordaZ(A, { faixas: [[0, Math.max(1, a)], [A.L - Math.max(1, a), A.L]], pontas: [[0, 'falcaca'], [A.L, 'corte']] });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      termo('ALÇA DE AZELHA', XT, YT, prog(t, tAz - 0.1, tAz + 0.4) * (1 - sai), { sub: 'o nó simples feito no seio', cor: C.destaque });
      selo('fixa', 300, 1110, prog(t, tFixa - 0.1, tFixa + 0.3) * (1 - sai));
      selo('não corre', 470, 1110, prog(t, tCorre - 0.1, tCorre + 0.3) * (1 - sai), { cor: C.texto });
      return;
    }
    // ---------------------------------------------------------- D) amarra: volta do fiel num mastro
    if (t < tCurva - 0.1) {
      const entra = ease.o(prog(t, tAm - 0.2, tAm + 0.4)), sai = ease.io(prog(t, tCurva - 0.6, tCurva - 0.1));
      const r = NOS.fiel(560, 690, 1.55), s1 = r.L * ease.io(prog(t, tAm + 0.1, tObj + 0.6));
      ctx.setTransform(1, 0, 0, 1, sai * 1000, (1 - entra) * -1300);
      desenhaCordaZ(r, { s1: Math.max(1, s1), entre: () => { mastro(560, 150, 1180, 68, true, 3); if (t > tMastro - 0.1) { const k = prog(t, tMastro - 0.1, tMastro + 0.3); ctx.strokeStyle = C.destaque; ctx.lineWidth = 7; ctx.setLineDash([]); rr(560 - 82, 138, 164, 1054 * ease.io(k), 40); ctx.stroke(); } }, pontaCabeca: 'falcaca', pontaInicio: 'corte' });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      termo('AMARRA', XT, YT, prog(t, tAm, tAm + 0.5) * (1 - sai), { sub: 'prende a corda a um objeto' });
      selo('mastro', 770, 200, prog(t, tMastro, tMastro + 0.4) * (1 - sai), { cor: C.texto });
      return;
    }
    // ---------------------------------------------------------- E) curva: nó que une duas cordas (ex.: nó de fita)
    if (t < tUniao - 0.1) {
      const F = NOS.fita(540, 560, 104), [fa, fb] = F.faixasAB, sai = ease.io(prog(t, tUniao - 0.6, tUniao - 0.1));
      const kA = ease.io(prog(t, tCurva - 0.1, tUne)), kB = ease.io(prog(t, tUne - 0.2, tPontas + 0.4));
      ctx.setTransform(1, 0, 0, 1, 0, sai * 1400);
      desenhaCordaZ(F, { faixas: [fa, fb], s1s: [lerp(fa[0] + 1, fa[1], kA), lerp(fb[0] + 1, fb[1], kB)], cor: (s) => s >= fb[0] ? C.ceu : C.creme, pontas: kB > 0.99 ? [[fa[1], 'corte'], [F.L, 'corte']] : [] });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      termo('CURVA', XT, YT, prog(t, tCurva, tCurva + 0.4) * (1 - sai), { sub: 'nó que une duas cordas', cor: C.destaque });
      selo('nome técnico', 640, YT - 22, prog(t, tTec, tTec + 0.4) * (1 - sai), { cor: C.texto, px: 32 });
      texto('ex.: nó de fita', W - CFG.safe.side, 230, { px: 36, peso: 700, cor: C.textoSuave, al: 'right' });
      return;
    }
    // ---------------------------------------------------------- F) união de cordas: a emenda (cordões entrelaçados, sem nó)
    const zE = lerp(1, 1.7, ease.io(prog(t, tUniao, tEm))); camera(zE, W / 2, Y0 + 40);
    emenda(t, sc, prog(t, tUniao, tEm), prog(t, tEm, tEntre + 0.4));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    termo('UNIÃO DE CORDAS', XT, YT, prog(t, tEm - 0.2, tEm + 0.3), { sub: 'a emenda: cordões entrelaçados' });
    selo('sem nó', 540, 560, prog(t, tSem - 0.1, tSem + 0.3));
  };
})();
