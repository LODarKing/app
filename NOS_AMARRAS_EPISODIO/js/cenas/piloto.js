// PILOTO (10 s) — gancho + amostra da cena de construção.
// 0,0–2,4  a ponta desenha um nó oito (4 cruzamentos alternados, sombra em cada passagem por cima)
// 2,4–4,2  a ponta corre por baixo das linhas e revela "NÓS E / AMARRAS"; segura até 4,8
// 4,8–6,0  câmera mergulha no chicote: aparecem os três cordões da torção
// 6,0–7,2  a ponta se abre: 3 cordões (cores fixas), "3 fios = 3 cordões"; câmera acompanha
// 7,2–8,4  o cordão amarelo se abre em fios, e os fios em fibras; setas de torção alternada; segura até 10,0
window.CENAS = window.CENAS || {};
(() => {
  const P = CFG.piloto, T = P.t, Y1 = 1150, Y2 = 1300, XCH = 330, YCH = 1422;     // linhas do título e x do chicote
  let geo = null;
  function prep() {
    if (geo) return geo;
    const r = NOS.gancho();
    const sMais = (fx, fy) => { let best = 0, bd = 1e9; for (let i = 0; i < r.n; i++) { const d = Math.hypot(r.X[i] - fx, r.Y[i] - fy); if (d < bd) { bd = d; best = i; } } return best * r.st; };
    const sNo = sMais(676, 836);
    // posição (s) de cada letra no trecho da corda logo abaixo dela
    ctx.font = font(150, 'titulo', 700);
    const letras = (str, x0, y, al) => { const tot = ctx.measureText(str).width, xa = al === 'right' ? x0 - tot : x0, out = []; let x = xa;
      for (const ch of str) { const cw = ctx.measureText(ch).width; out.push({ ch, x, cx: x + cw / 2, y, s: sMais(x + cw / 2, y === 1124 ? Y1 : Y2) }); x += cw; } return out; };
    geo = { r, sNo, l1: letras(P.titulo[0], 176, 1124, 'left'), l2: letras(P.titulo[1], 906, 1276, 'right') };
    return geo;
  }
  // posição da cabeça (chicote) ao longo do caminho
  function cabeca(t, g) {
    const sIn = 980;                                   // já entra em movimento (quadro 0 não é vazio)
    if (t < T.noFim) return lerp(sIn, g.sNo, ease.o(prog(t, 0, T.noFim)) * 0.7 + prog(t, 0, T.noFim) * 0.3);
    return lerp(g.sNo, g.r.L, ease.io(prog(t, T.noFim, T.tituloFim)));
  }
  // câmera: mergulho no chicote e, depois, panorâmica para abrir espaço aos cordões
  const Z = 7, alvo = [298.6, 1462];
  function cam(t) {
    if (t < T.zoom0) {   // abertura: câmera perto da ponta, recua enquanto o nó se forma
      const g = prep(), h = em(g.r, cabeca(t, g)), e0 = ease.io(prog(t, 0.0, 2.7)), z0 = lerp(1.65, 1, e0);
      const hx = clamp(h.x, 420, 680), hy = clamp(h.y, 560, 700);
      return { z: z0, fx: lerp(hx, W / 2, e0), fy: lerp(hy, H / 2, e0) };
    }
    const e = ease.io(prog(t, T.zoom0, T.zoom1)), z = Math.exp(Math.log(Z) * e);
    const sx = lerp(alvo[0], W / 2, e), sy = lerp(alvo[1], H / 2, e);   // onde o alvo aparece na tela
    const pan = 0;
    return { z, fx: alvo[0] - (sx - W / 2) / z - pan, fy: alvo[1] - (sy - H / 2) / z };
  }
  const tela = (c, x, y) => [W / 2 + (x - c.fx) * c.z, H / 2 + (y - c.fy) * c.z];

  function letrasTitulo(t, g, s1) {
    const linha = (ls, cor, yCorda) => {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yCorda); ctx.clip();
      for (const L of ls) {
        const k = ease.back(clamp((s1 - L.s) / 160)); if (k <= 0) continue;
        texto(L.ch, L.x, L.y + (1 - k) * 120, { px: 150, fam: 'titulo', peso: 700, cor });
      }
      ctx.restore();
    };
    linha(g.l1, C.destaque, Y1); linha(g.l2, C.creme, Y2);
  }

  // cordões soltos (mundo): saem da corda em xs e terminam no chicote (XCH), apontando para a direita
  function cordoes(t, xs, spread, corK, aberturaFios) {
    const out = [], u = XCH - xs;
    for (let k = 0; k < 3; k++) {
      const pts = [], dir = k - 1;
      for (let x = xs - 8; x <= XCH + 0.01; x += Math.max(2, u / 14)) {
        const xi = clamp((x - xs) / Math.max(u, 1)), onda = 2.2 * Math.sin((x - xs) / 8.4 + k * 2.1) * (1 - xi) * clamp(u / 20);
        pts.push([x, YCH + dir * spread * ease.io(xi) + onda + dir * 5 * (1 - xi) * clamp(u / 20)]);
      }
      if (pts.length < 3) continue;
      const cor = CFG.cordoes[k], cr = corda(pts, { w: 20, passo: 0.6 });
      out.push({ k, cr, fimFios: k === 1 ? aberturaFios : 0, cor: (s, j) => shade(mix(C.creme, cor, corK), [0, -0.07, 0.06][j]) });
    }
    return out;
  }
  function fios(cr, abre) {
    // 4 fios saem do cordão amarelo; cada fio termina em fibras
    const base = em(cr, cr.L - abre), tip = em(cr, cr.L), n = 4, fim = [];
    for (let j = 0; j < n; j++) {
      const dj = j - (n - 1) / 2, pts = [];
      for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([lerp(base.x - 3, tip.x + 2, k), lerp(base.y, tip.y, k) + dj * 6.4 * ease.io(k) + dj * 1.2]); }
      desenhaCorda(corda(pts, { w: 5.2, passo: 0.4 }), { cor: (s, q) => shade(CFG.cordoes[1], [-0.02, -0.1, 0.04][q] - 0.06 * (j % 2)), sentido: 1, passoTorcao: 1.3, cruz: false });
      fim.push({ x: pts[10][0], y: pts[10][1], dj });
    }
    return fim;
  }

  CENAS.piloto = (t) => {
    const g = prep(), r = g.r, s1 = cabeca(t, g), c = cam(t);
    const corK = ease.io(prog(t, T.zoom1 - 0.2, T.zoom1 + 0.7));          // cordões ganham as cores fixas
    const u = ease.io(prog(t, T.zoom1, T.abre1)) * 70;                    // quanto a ponta se abriu (mundo)
    const spread = 24 + ease.io(prog(t, T.abre1, T.fios1)) * 10;
    const abre = ease.io(prog(t, T.abre1 + 0.1, T.fios1)) * 44;
    const corBand = (s, k) => corK > 0 ? mix(C.creme, CFG.cordoes[k], corK * clamp((s - (r.L - 190)) / 50)) : C.creme;

    camera(c.z, c.fx, c.fy);
    letrasTitulo(t, g, s1);
    // cordões soltos por baixo da corda (a corda cobre a raiz deles)
    let cds = [];
    if (u > 0.5) {
      cds = cordoes(t, XCH - u, spread, corK, abre);
      for (const d of [cds[0], cds[2], cds[1]]) {
        if (!d) continue;
        const ate = d.fimFios > 0.5 ? d.cr.L - d.fimFios : d.cr.L;
        desenhaCorda(d.cr, { s1: ate, cor: d.cor, sentido: -1, passoTorcao: 1.05, cruz: false, pelos: true, pontaFim: d.fimFios > 0.5 ? null : 'corte' });
        if (d.fimFios > 0.5) {
          const fb = fios(d.cr, d.fimFios), kf = ease.o(prog(t, T.abre1 + 0.5, T.fios1 + 0.3));
          // fibras: fios de cabelo que se soltam na ponta de cada fio
          ctx.strokeStyle = shade(CFG.cordoes[1], 0.25); ctx.lineWidth = 0.55; ctx.lineCap = 'round';
          fb.forEach((f, j) => { for (let q = 0; q < 9; q++) { const a = (q - 4) * 0.13 + f.dj * 0.12 + (rnd(5, j * 9 + q) - 0.5) * 0.08, l = (10 + rnd(6, j * 9 + q) * 8) * kf; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(f.x + l * 0.5, f.y + Math.sin(a) * l * 0.4, f.x + Math.cos(a) * l, f.y + Math.sin(a) * l); ctx.stroke(); } });
        }
      }
    }
    desenhaCorda(r, { s0: 0, s1: Math.min(s1, r.L - u), cor: corBand, pontaCabeca: u > 0.5 ? null : 'corte', pelos: c.z > 2 });

    // ---------------- interface (tela): nome perto do objeto, fio-guia curto, seta de torção ao lado do nome
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const kr = ease.o(prog(t, T.zoom1, T.zoom1 + 0.4)), kc = ease.o(prog(t, T.zoom1 + 0.6, T.zoom1 + 1.0)), kfi = ease.o(prog(t, T.abre1 + 0.6, T.abre1 + 1.0)), kfb = ease.o(prog(t, T.fios1, T.fios1 + 0.4));
    const topoCorda = tela(c, 0, YCH - 22)[1], topoCd = tela(c, 0, YCH - spread - 10)[1], baseCd = tela(c, 0, YCH + spread + 10)[1];
    if (kr > 0) { const [x] = tela(c, XCH - u - 34, 0); rotulo('CORDA', CFG.safe.side + 10, topoCorda - 46, kr, true, C.texto); }
    if (kc > 0) { const [x] = tela(c, XCH - 8, 0); rotulo(P.rotulos.cordoes, Math.min(x - 330, 560), topoCd - 108, kc, false, C.texto);
      ctx.save(); ctx.beginPath(); ctx.rect(0, topoCd - 84, W, 52); ctx.clip(); texto(P.rotulos.nota3, Math.min(x - 330, 560), topoCd - 44 + (1 - kc) * 50, { px: 42, peso: 700, cor: C.textoSuave }); ctx.restore(); }
    if (kfi > 0) { const [x] = tela(c, XCH - 40, 0); rotulo(P.rotulos.fios, x - 80, baseCd + 96, kfi, true, C.destaque); }
    if (kfb > 0) { rotulo(P.rotulos.fibras, W - CFG.safe.side - 250, baseCd + 96, kfb, null, C.destaque); }
    legenda(P.legendas, t);
  };
  // rótulo: nome em Zilla + seta de torção (sentido alterna camada a camada); sem moldura nem etiqueta de canto
  function rotulo(str, x, y, k, horario, cor) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 70, W, 84); ctx.clip();
    texto(str, x, y + (1 - k) * 74, { px: 62, fam: 'titulo', peso: 700, cor, al: 'left' });
    ctx.restore();
    ctx.font = font(62, 'titulo', 700); const wv = ctx.measureText(str).width;
    if (k > 0.3 && horario !== null) setaGiro(x + wv + 44, y - 23, 22, horario, cor, 5, ease.io(clamp((k - 0.3) / 0.7)), 1);
  }
})();
