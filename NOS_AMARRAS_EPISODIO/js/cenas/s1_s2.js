// CENA 1 — GANCHO e CENA 2 — CONSTRUÇÃO (a partir do piloto aprovado), sincronizadas às palavras da narração.
(() => {
  const Y1 = 1150, Y2 = 1300, XCH = 330, YCH = 1422, Z = 7, ALVO = [298.6, 1462];
  let geo = null;
  function prep() {
    if (geo) return geo;
    const r = NOS.gancho();
    const sMais = (fx, fy) => { let best = 0, bd = 1e9; for (let i = 0; i < r.n; i++) { const d = Math.hypot(r.X[i] - fx, r.Y[i] - fy); if (d < bd) { bd = d; best = i; } } return best * r.st; };
    ctx.font = font(150, 'titulo', 700);
    const letras = (str, x0, y, al, yc) => { const tot = ctx.measureText(str).width, xa = al === 'right' ? x0 - tot : x0, out = []; let x = xa;
      for (const ch of str) { const cw = ctx.measureText(ch).width; out.push({ ch, x, y, s: sMais(x + cw / 2, yc) }); x += cw; } return out; };
    geo = { r, sNo: sMais(676, 836), sL1: sMais(176, Y1), l1: letras(CFG.piloto.titulo[0], 176, 1124, 'left', Y1), l2: letras(CFG.piloto.titulo[1], 906, 1276, 'right', Y2) };
    return geo;
  }
  function letrasTitulo(g, s1) {
    const linha = (ls, cor, yCorda) => {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yCorda); ctx.clip();
      for (const L of ls) { const k = ease.back(clamp((s1 - L.s) / 160)); if (k > 0) texto(L.ch, L.x, L.y + (1 - k) * 120, { px: 150, fam: 'titulo', peso: 700, cor }); }
      ctx.restore();
    };
    linha(g.l1, C.destaque, Y1); linha(g.l2, C.creme, Y2);
  }

  // ---------------------------------------------------------------- CENA 1
  CENAS.s1 = (t, sc) => {
    const g = prep(), r = g.r, tNo = G(sc, 2.6), tEu = tp(sc, 'eu'), tEsp = tp(sc, 'especialidade') - 0.2, tFim = tp(sc, 'amarras', 0, true);
    let s1;
    if (t < tNo) s1 = lerp(980, g.sNo, ease.o(prog(t, 0, tNo)) * 0.7 + prog(t, 0, tNo) * 0.3);
    else if (t < tEsp) s1 = lerp(g.sNo, g.sL1, ease.io(prog(t, tEu, tEsp)));
    else s1 = lerp(g.sL1, r.L, ease.io(prog(t, tEsp, tFim)));
    // câmera: começa perto da ponta e recua enquanto o nó se forma; respira levemente em "entender a corda"
    const h = em(r, s1), e0 = ease.io(prog(t, 0, 2.9)), z0 = lerp(1.65, 1, e0) * (1 + 0.06 * Math.sin(Math.PI * prog(t, 2.9, tEu + 0.6)));
    const fx = lerp(clamp(h.x, 420, 680), W / 2, e0), fy = lerp(clamp(h.y, 560, 700), H / 2, e0);
    camera(z0, fx, fy);
    letrasTitulo(g, s1);
    desenhaCorda(r, { s1, pontaCabeca: 'corte' });
  };

  // ---------------------------------------------------------------- CENA 2
  function cordoes(xs, spread, corK, aberturaFios) {
    const out = [], u = XCH - xs;
    for (let k = 0; k < 3; k++) {
      const pts = [], dir = k - 1;
      for (let x = xs - 8; x <= XCH + 0.01; x += Math.max(2, u / 14)) {
        const xi = clamp((x - xs) / Math.max(u, 1)), onda = 2.2 * Math.sin((x - xs) / 8.4 + k * 2.1) * (1 - xi) * clamp(u / 20);
        pts.push([x, YCH + dir * spread * ease.io(xi) + onda + dir * 5 * (1 - xi) * clamp(u / 20)]);
      }
      if (pts.length < 3) continue;
      const cor = CFG.cordoes[k];
      out.push({ k, cr: corda(pts, { w: 20, passo: 0.6 }), fimFios: k === 1 ? aberturaFios : 0, cor: (s, j) => shade(mix(C.creme, cor, corK), [0, -0.07, 0.06][j]) });
    }
    return out;
  }
  function fios(cr, abre) {
    const base = em(cr, cr.L - abre), tip = em(cr, cr.L), n = 4, fim = [];
    for (let j = 0; j < n; j++) {
      const dj = j - (n - 1) / 2, pts = [];
      for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([lerp(base.x - 3, tip.x + 2, k), lerp(base.y, tip.y, k) + dj * 6.4 * ease.io(k) + dj * 1.2]); }
      desenhaCorda(corda(pts, { w: 5.2, passo: 0.4 }), { cor: (s, q) => shade(CFG.cordoes[1], [-0.02, -0.1, 0.04][q] - 0.06 * (j % 2)), sentido: 1, passoTorcao: 1.3, cruz: false });
      fim.push({ x: pts[10][0], y: pts[10][1], dj });
    }
    return fim;
  }
  function rotulo(str, x, y, k, horario, cor, kSeta = k) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - 70, W, 84); ctx.clip();
    texto(str, x, y + (1 - ease.o(k)) * 74, { px: 62, fam: 'titulo', peso: 700, cor, al: 'left' });
    ctx.restore();
    ctx.font = font(62, 'titulo', 700); const wv = ctx.measureText(str).width;
    if (kSeta > 0.05 && horario !== null) setaGiro(x + wv + 44, y - 23, 22, horario, cor, 5, ease.io(clamp(kSeta)), 1);
  }
  // trança de 3 cordões (cada um alterna por cima/por baixo — conferido numericamente) e corda torcida, lado a lado
  let tr = null;
  function tranca() {
    if (tr) return tr;
    const cx = 780, y0 = 300, y1 = 1080, A = 66, ph = [0, 2 * Math.PI / 3, 4 * Math.PI / 3], pts = [], faixas = [];
    const voltas = 2.3;
    for (let k = 0; k < 3; k++) {
      const seg = [];
      for (let i = 0; i <= 120; i++) { const u = i / 120, th = u * voltas * 2 * Math.PI; seg.push([cx + A * Math.sin(th + ph[k]), y0 + (y1 - y0) * u, Math.sin(2 * (th + ph[k]))]); }
      if (k > 0) { const a = pts[pts.length - 1]; pts.push([a[0] + 400, 2400, 0], [seg[0][0] + 500, -500, 0]); }
      faixas.push(seg); pts.push(...seg);
    }
    const r = corda(pts, { w: 48, padrao: 'z', amostras: 3, cache: 'tranca' });
    // limites de cada cordão (pelos trechos fora da tela)
    const fx = []; let a = 0, dentro = true;
    for (let i = 0; i < r.n; i++) { const ok = r.Y[i] >= y0 - 2 && r.Y[i] <= y1 + 2 && r.X[i] < 1100; if (ok && !dentro) { a = i; dentro = true; } if (!ok && dentro) { if (i - a > 5) fx.push([a * r.st, (i - 1) * r.st]); dentro = false; } }
    if (dentro) fx.push([a * r.st, r.L]);
    tr = { r, faixas: fx, y0, y1 }; return tr;
  }
  const torcida = () => corda([[300, 300], [300, 690], [300, 1080]], { w: 124, cache: 'torcida' });

  // ícones das fontes naturais de fibra (desenhados do zero, simples)
  function icone(nome, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const ol = (w = 5) => { ctx.strokeStyle = C.contorno; ctx.lineWidth = w; };
    if (nome === 'sisal') {             // agave: roseta de folhas longas e pontudas
      for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.32, L = 120 - Math.abs(i) * 10; ctx.fillStyle = i % 2 ? '#6F9A78' : '#8DB394'; ctx.beginPath(); ctx.moveTo(-9, 40); ctx.quadraticCurveTo(Math.cos(a) * L * 0.5 - 16, 40 + Math.sin(a) * L * 0.5, Math.cos(a) * L, 40 + Math.sin(a) * L); ctx.quadraticCurveTo(Math.cos(a) * L * 0.5 + 16, 40 + Math.sin(a) * L * 0.5, 9, 40); ctx.closePath(); ctx.fill(); ol(4); ctx.stroke(); }
    } else if (nome === 'algodao') {   // capulho: cálice marrom e flocos brancos
      ctx.fillStyle = '#7A5230'; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; ctx.lineTo(Math.cos(a) * 70, 20 + Math.sin(a) * 70); ctx.lineTo(Math.cos(a + 0.63) * 30, 20 + Math.sin(a + 0.63) * 30); } ctx.closePath(); ctx.fill(); ol(); ctx.stroke();
      for (const [px, py, pr] of [[-30, -5, 36], [30, -5, 36], [0, -38, 38], [-16, 26, 30], [18, 26, 30]]) { ctx.fillStyle = '#FBFAF4'; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill(); ol(4); ctx.stroke(); }
    } else if (nome === 'juta') {      // caules altos com folhas e um feixe de fibra dourada
      for (const dx of [-26, 0, 26]) { ol(16); ctx.beginPath(); ctx.moveTo(dx, 70); ctx.lineTo(dx * 1.2, -80); ctx.stroke(); ctx.strokeStyle = '#7FA86F'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(dx, 70); ctx.lineTo(dx * 1.2, -80); ctx.stroke();
        for (const yy of [-50, -10]) { ctx.fillStyle = '#9BC08A'; ctx.beginPath(); ctx.ellipse(dx * 1.2 + 18, yy, 22, 9, -0.5, 0, 7); ctx.fill(); ol(3); ctx.stroke(); } }
      ctx.strokeStyle = '#D9B45E'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-50 + i * 2, 80); ctx.quadraticCurveTo(-10, 60 + i, 60, 84 + i * 1.5); ctx.stroke(); }
    } else if (nome === 'coco') {      // coco partido: casca fibrosa e polpa branca
      ctx.fillStyle = '#7B4E2A'; ctx.beginPath(); ctx.arc(0, 10, 70, Math.PI, 0); ctx.closePath(); ctx.fill(); ol(); ctx.stroke();
      ctx.fillStyle = '#FBFAF4'; ctx.beginPath(); ctx.arc(0, 10, 50, Math.PI, 0); ctx.closePath(); ctx.fill(); ol(4); ctx.stroke();
      ctx.strokeStyle = '#B9875A'; ctx.lineWidth = 3; for (let i = 0; i < 14; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 14; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 58, 10 + Math.sin(a) * 58); ctx.lineTo(Math.cos(a) * 92, 10 + Math.sin(a) * 92 + 6); ctx.stroke(); }
    }
    ctx.restore();
  }

  CENAS.s2 = (t, sc) => {
    const g = prep(), r = g.r;
    // tempos (local) ancorados nas palavras
    const tz1 = 1.0, tAbre = G(sc, tp(sc, 'cordoes') - 0.6), tFios = G(sc, tp(sc, 'fios', 1) - 0.3), tFibras = G(sc, tp(sc, 'fibras'));
    const tTor = G(sc, tp(sc, 'torcao')), tCon = G(sc, tp(sc, 'contrario')), tAnt = G(sc, tp(sc, 'anterior')), tTrava = G(sc, tp(sc, 'trava')), tTudo = tp(sc, 'tudo', 0, true);
    const tSai = G(sc, tp(sc, 'trancado') - 0.45), tTr = tp(sc, 'trancado'), tCima = tp(sc, 'cima'), tBaixo = tp(sc, 'baixo'), tNat = G(sc, tp(sc, 'fibras', 1) - 0.3);
    const tIc = ['sisal', 'algodao', 'juta', 'coco'].map((p) => G(sc, tp(sc, p) - 0.1));
    if (t < tSai + 0.5) {
      // mergulho na ponta e abertura em camadas (mundo, câmera em zoom)
      const e = ease.io(prog(t, 0, tz1)), z = Math.exp(Math.log(Z) * e), sx = lerp(ALVO[0], W / 2, e), sy = lerp(ALVO[1], H / 2, e);
      const saida = ease.i(prog(t, tSai, tSai + 0.5));                                // a corda é puxada para fora (esquerda)
      const c = { z, fx: ALVO[0] - (sx - W / 2) / z + saida * 230, fy: ALVO[1] - (sy - H / 2) / z };
      const fecha = ease.io(prog(t, tTrava, tTudo));                                     // "isso trava tudo": os cordões voltam a torcer
      const corK = ease.io(prog(t, tz1 - 0.2, tz1 + 0.7)) * (1 - 0.35 * fecha);
      const u = ease.io(prog(t, tz1, tAbre + 0.9)) * 70 * (1 - fecha);
      const spread = (24 + ease.io(prog(t, tFios, tFibras)) * 10 * (1 - fecha));
      const abre = ease.io(prog(t, tFios, tFibras)) * 44 * (1 - ease.io(prog(t, tTrava - 0.3, tTrava + 0.4)));
      const corBand = (s, k) => corK > 0 ? mix(C.creme, CFG.cordoes[k], corK * clamp((s - (r.L - 190)) / 50)) : C.creme;
      camera(c.z, c.fx, c.fy);
      letrasTitulo(g, r.L);
      if (u > 0.5) {
        const cds = cordoes(XCH - u, spread, corK, abre);
        for (const d of [cds[0], cds[2], cds[1]]) {
          if (!d) continue;
          const ate = d.fimFios > 0.5 ? d.cr.L - d.fimFios : d.cr.L;
          desenhaCorda(d.cr, { s1: ate, cor: d.cor, sentido: -1, passoTorcao: 1.05, cruz: false, pelos: true, pontaFim: d.fimFios > 0.5 ? null : 'corte' });
          if (d.fimFios > 0.5) {
            const fb = fios(d.cr, d.fimFios), kf = ease.o(prog(t, tFibras - 0.4, tFibras + 0.3));
            ctx.strokeStyle = shade(CFG.cordoes[1], 0.25); ctx.lineWidth = 0.55; ctx.lineCap = 'round';
            fb.forEach((f, j) => { for (let q = 0; q < 9; q++) { const a = (q - 4) * 0.13 + f.dj * 0.12 + (rnd(5, j * 9 + q) - 0.5) * 0.08, l = (10 + rnd(6, j * 9 + q) * 8) * kf; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(f.x + l * 0.5, f.y + Math.sin(a) * l * 0.4, f.x + Math.cos(a) * l, f.y + Math.sin(a) * l); ctx.stroke(); } });
          }
        }
      }
      desenhaCorda(r, { s0: 0, s1: r.L - u, cor: corBand, pontaCabeca: u > 0.5 ? null : 'corte', pelos: c.z > 2 });
      // interface: nomes e setas de torção (a seta acende quando a narração fala da torção daquela camada)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const tela = (x, y) => [W / 2 + (x - c.fx) * c.z, H / 2 + (y - c.fy) * c.z];
      const some = 1 - ease.o(prog(t, tTrava, tTrava + 0.5)), sai = 1 - saida;
      const topoCorda = tela(0, YCH - 22)[1], topoCd = tela(0, YCH - spread - 10)[1], baseCd = tela(0, YCH + spread + 10)[1];
      const seta = (ta) => ease.io(prog(t, ta, ta + 0.6));
      ctx.globalAlpha = sai;
      if (t > tz1 - 0.1) rotulo('CORDA', CFG.safe.side + 10, topoCorda - 46, prog(t, tz1, tz1 + 0.4), true, C.texto, seta(tTor));
      if (t > tAbre) { const [x] = tela(XCH - 8, 0), xl = Math.min(x - 330, 560), k = prog(t, tAbre + 0.3, tAbre + 0.7) * some;
        rotulo(CFG.piloto.rotulos.cordoes, xl, topoCd - 108, k, false, C.texto, seta(tCon) * some);
        ctx.save(); ctx.beginPath(); ctx.rect(0, topoCd - 84, W, 52); ctx.clip(); texto(CFG.piloto.rotulos.nota3, xl, topoCd - 44 + (1 - ease.o(k)) * 50, { px: 42, peso: 700, cor: C.textoSuave }); ctx.restore(); }
      if (t > tFios) { const [x] = tela(XCH - 40, 0); rotulo(CFG.piloto.rotulos.fios, x - 80, baseCd + 96, prog(t, tFios + 0.2, tFios + 0.6) * some, true, C.destaque, seta(tAnt) * some); }
      if (t > tFibras) rotulo(CFG.piloto.rotulos.fibras, W - CFG.safe.side - 250, baseCd + 96, prog(t, tFibras, tFibras + 0.4) * some, null, C.destaque);
      // "torções alternadas": a frase aparece quando as três setas estão acesas
      selo('torções alternadas', W / 2, baseCd + 230, prog(t, tAnt + 0.4, tAnt + 0.8) * sai, { px: 40 });
      ctx.globalAlpha = 1;
      return;
    }
    // ---------- comparação: TORCIDA × TRANÇA (mesmas três cores), depois as fontes naturais de fibra
    const T = tranca(), rT = torcida(), kRev = ease.io(prog(t, tSai + 0.45, tSai + 1.5)), kBr = ease.io(prog(t, tTr - 0.1, tTr + 1.7));
    const sobe = ease.io(prog(t, tNat, tNat + 0.7)), esc = lerp(1, 0.56, sobe), oy = lerp(0, -80, sobe);
    ctx.setTransform(esc, 0, 0, esc, W / 2 * (1 - esc), 160 * (1 - esc) + oy);
    desenhaCorda(rT, { s1: rT.L * kRev, cor: (s, k) => CFG.cordoes[k], pontaCabeca: 'corte', pontaInicio: 'corte' });
    const s1s = T.faixas.map(([a, b]) => lerp(a, b, kBr));
    desenhaCordaZ(T.r, { faixas: T.faixas, s1s, cor: (s) => CFG.cordoes[T.faixas.findIndex(([a, b]) => s >= a - 1 && s <= b + 1)] || C.creme });
    // destaque de um cruzamento: por cima / por baixo
    const cz = T.r.cruz.filter((c) => c.y > 560 && c.y < 760 && c.x > 700)[0];
    if (cz) { const kc = prog(t, tCima - 0.2, tCima + 0.4) * (1 - prog(t, tNat - 0.3, tNat)); anel(cz.x, cz.y, 56, kc); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const yT = 1170 * esc + 160 * (1 - esc) + oy;
    termo('TORCIDA', W / 2 + (300 - W / 2) * esc, yT, prog(t, tSai + 0.6, tSai + 1.1), { sub: sobe < 0.5 ? 'giram juntos' : null, al: 'center', px: lerp(58, 44, sobe) });
    termo('TRANÇA', W / 2 + (780 - W / 2) * esc, yT, prog(t, tTr, tTr + 0.5), { sub: sobe < 0.5 ? 'se cruzam' : null, al: 'center', px: lerp(58, 44, sobe) });
    if (cz && sobe < 0.5) { const k = prog(t, tCima, tCima + 0.4) * (1 - prog(t, tNat - 0.3, tNat)); selo('por cima', 780, 470, k, { px: 34 }); selo('por baixo', 780, 900, prog(t, tBaixo, tBaixo + 0.4) * (1 - prog(t, tNat - 0.3, tNat)), { px: 34, cor: C.texto }); }
    // fontes naturais: quatro cartões, um por palavra
    const nomes = [['sisal', 'SISAL', 'folha do agave'], ['algodao', 'ALGODÃO', 'pluma do capulho'], ['juta', 'JUTA', 'caule da planta'], ['coco', 'COCO', 'casca fibrosa']];
    if (t > tNat) termo('FIBRAS NATURAIS', W / 2, 800, prog(t, tNat + 0.2, tNat + 0.7), { al: 'center', px: 54, cor: C.destaque });
    nomes.forEach(([id, nome, sub], i) => {
      const k = ease.back(prog(t, tIc[i], tIc[i] + 0.45)); if (k <= 0) return;
      const cx = i % 2 ? 790 : 290, cy = i < 2 ? 1000 : 1280, w = 430, h = 260;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
      ctx.fillStyle = rgba(C.fundoEsc, 0.55); rr(-w / 2, -h / 2, w, h, 26); ctx.fill();
      ctx.restore();
      icone(id, cx - 120, cy + 8, 0.85 * k);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      texto(nome, cx - 25, cy - 4, { px: 48 * k, fam: 'titulo', peso: 700, cor: C.texto });
      texto(sub, cx - 25, cy + 40, { px: 28 * k, peso: 700, cor: C.textoSuave });
    });
  };
})();
