// SR. EDGAR — vinheta 9:16. Contrato: window.seek(t) desenha o quadro do instante t (função pura do tempo).
// Sem estado entre quadros, sem Math.random (ruído com semente mulberry32), sem timers.
// Todas as formas da marca são as camadas recortadas da logo original (assets/camadas), nunca redesenhadas.
(function () {
  'use strict';
  const W = 1080, H = 1920, FPS = 60;
  const Q = new URLSearchParams(location.search);
  const ALPHA = Q.get('alpha') === '1';            // versão com fundo transparente (sem fundo, névoa, partículas, grão)
  const TL = window.TIMELINE, BT = window.BEATS, DUR = TL.dur;
  const B = (k) => BT.fase + k * BT.periodo;      // batida (grade medida) → segundos
  const EV = {};
  for (const [k, v] of Object.entries(TL.eventos)) EV[k] = Array.isArray(v) ? v.map(B) : B(v);

  // ------------------------------------------------------------------ utilitários
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eio5 = (x) => (x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2);
  const eo3 = (x) => 1 - Math.pow(1 - x, 3);
  const eo5 = (x) => 1 - Math.pow(1 - x, 5);
  const ei2 = (x) => x * x;
  const ss = (x) => x * x * (3 - 2 * x);
  const eoBack = (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
  const rad = (d) => (d * Math.PI) / 180;
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

  const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
  const frameC = mk(), fctx = frameC.getContext('2d', { willReadFrequently: true });
  const logoC = mk(), lctx = logoC.getContext('2d');
  const tmpC = mk(), tctx = tmpC.getContext('2d');
  const tmp2C = mk(), t2ctx = tmp2C.getContext('2d');
  for (const g of [ctx, fctx, lctx, tctx, t2ctx]) { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; }

  // ------------------------------------------------------------------ marca: camadas e geometria (coordenadas da logo original)
  const M = window.CAMADAS, IMG = {};
  const [RCX, RCY] = M.centro_aneis;
  const BGc = M.fundo_rgb.map(Math.round);
  const BGs = `rgb(${BGc[0]},${BGc[1]},${BGc[2]})`;
  const PIVO = [401, 463];                    // pino da tesoura
  const NAV_C = [707, 404];                   // centro da navalha
  const NAV_U = [0.588, -0.809];              // eixo da navalha (cabo → ponta)
  const CENTRO = [551, 562];                  // centro do emblema
  const LETRAS = ['letra_226', 'letra_327', 'letra_397', 'letra_464', 'letra_568', 'letra_672', 'letra_775', 'letra_876'];
  const ESTCH = ['est_466', 'est_489', 'est_511', 'est_527', 'est_561', 'est_585', 'est_607', 'est_627'];
  const ESTRELAS = ['estrela_374', 'estrela_419', 'estrela_673', 'estrela_719'];
  const ANEIS = ['anel_cobre_2', 'anel_branco_3', 'anel_branco_2', 'anel_cobre_1', 'anel_branco_1'];

  // ------------------------------------------------------------------ câmera
  function camera(t) {
    let c;
    if (t < EV.corte_navalha) {           // plano A: detalhe da tesoura — a câmera desliza pela lâmina até o pino
      const u = seg(t, 0, EV.corte_navalha), tp = tesouraPose(0);
      const P = rotp(lerpP([318, 352], [392, 452], eio(u)), PIVO, tp.r, tp.dx, tp.dy);
      c = { x: P[0], y: P[1], s: lerp(4.5, 4.15, u), r: lerp(-19, -14, u) };
    } else {                               // plano B: navalha → recuo para a composição
      const u = seg(t, EV.corte_navalha, EV.cena2), npB = navalhaPose(Math.min(t, EV.cena2));
      const P = rotp(lerpP([716, 380], [690, 420], u), NAV_C, npB.r, npB.dx * 0.8, npB.dy * 0.8);
      c = { x: P[0], y: P[1], s: lerp(3.7, 3.3, u), r: lerp(17, 13, u) };
      const p = eio(seg(t, EV.cena2 - 0.08, EV.cena2 + 0.85));
      c = mixc(c, { x: 551, y: 418, s: 1.5, r: 0 }, p);
      const q = eio(seg(t, B(4) - 0.1, B(4) + 1.35));
      c = mixc(c, { x: CENTRO[0], y: CENTRO[1], s: 1.24, r: 0 }, q);
      const z = seg(t, B(8.67), DUR);       // aproximação quase imperceptível no final
      c.s *= 1 + 0.024 * (1 - Math.cos(z * Math.PI * 0.5));
    }
    return c;
  }
  const lerpP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  function rotp(p, piv, r, dx = 0, dy = 0) { const c = Math.cos(rad(r)), s = Math.sin(rad(r)); return [piv[0] + dx + c * (p[0] - piv[0]) - s * (p[1] - piv[1]), piv[1] + dy + s * (p[0] - piv[0]) + c * (p[1] - piv[1])]; }
  function mixc(a, b, u) { return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), u)), r: lerp(a.r, b.r, u) }; }
  let CAM = null, CM = null;               // câmera e matriz do quadro em desenho
  function setCam(g) { g.setTransform(CM[0], CM[1], CM[2], CM[3], CM[4], CM[5]); }
  function camMatrix(c) {
    const a = c.s * Math.cos(rad(c.r)), b = c.s * Math.sin(rad(c.r));
    return [a, b, -b, a, W / 2 - (a * c.x - b * c.y), H / 2 - (b * c.x + a * c.y)];
  }
  const toScr = (x, y) => [CM[0] * x + CM[2] * y + CM[4], CM[1] * x + CM[3] * y + CM[5]];

  // ------------------------------------------------------------------ estado das ferramentas
  function tesouraPose(t) {
    const p = eio5(seg(t, EV.cena2 + 0.05, EV.encaixe));
    return { dx: lerp(-40, 0, p), dy: lerp(34, 0, p), r: lerp(-8, 0, p) };
  }
  function laminaRot(t) {                  // + fecha a lâmina sobre a outra (graus, no pino)
    let r = 0;
    if (t < EV.corte_navalha) {
      r = lerp(7, 0, eo3(seg(t, EV.tesoura_abre[0], EV.tesoura_abre[1])));
      r = lerp(r, 12.5, ei2(seg(t, EV.tesoura_corte - 0.085, EV.tesoura_corte)));
      r = lerp(r, 0, eio(seg(t, EV.tesoura_reabre[0], EV.tesoura_reabre[1])));
    } else {
      r = lerp(0, 12.5, ei2(seg(t, EV.corte_final - 0.11, EV.corte_final)));
      r = lerp(r, 0, eo3(seg(t, EV.corte_final + 0.05, EV.corte_final + 0.36)));
    }
    return r;
  }
  function navalhaPose(t) {
    const a = eo5(seg(t, EV.navalha_desliza[0], EV.navalha_desliza[1]));
    const slide = lerp(-64, 0, a);
    const p = eio5(seg(t, EV.cena2 + 0.05, EV.encaixe));
    return { dx: lerp(48, 0, p) + NAV_U[0] * slide, dy: lerp(28, 0, p) + NAV_U[1] * slide, r: lerp(6, 0, p) };
  }

  // ------------------------------------------------------------------ desenho de camada (com máscara e tinta opcionais)
  function local(g, o) {
    if (!o) return;
    if (o.piv) { g.translate(o.piv[0] + (o.dx || 0), o.piv[1] + (o.dy || 0)); g.rotate(rad(o.r || 0)); if (o.s) g.scale(o.s, o.s); g.translate(-o.piv[0], -o.piv[1]); }
    else g.translate(o.dx || 0, o.dy || 0);
  }
  function blit(g, nome, o) { const L = IMG[nome]; setCam(g); local(g, o); g.drawImage(L.img, L.x, L.y, L.w, L.h); }
  function chain(g, os) { for (const o of os) local(g, o); }
  // desenha em tmp → máscara (destination-in) → tinta (source-atop) → destino
  function layer(dst, nome, o = {}) {
    const L = IMG[nome];
    if (!o.mask && !o.tint) { setCam(dst); chain(dst, o.xf || []); dst.drawImage(L.img, L.x, L.y, L.w, L.h); return; }
    tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
    setCam(tctx); chain(tctx, o.xf || []); tctx.drawImage(L.img, L.x, L.y, L.w, L.h);
    if (o.mask) { tctx.globalCompositeOperation = 'destination-in'; setCam(tctx); if (o.maskLocal) chain(tctx, o.xf || []); o.mask(tctx); }
    if (o.tint) { tctx.globalCompositeOperation = 'source-atop'; setCam(tctx); if (o.tintLocal) chain(tctx, o.xf || []); o.tint(tctx); }
    tctx.globalCompositeOperation = 'source-over';
    dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(tmpC, 0, 0);
  }
  const BIG = (g) => g.fillRect(-3000, -3000, 7000, 7000);
  // faixa de luz gaussiana: ponto P, ângulo da faixa (graus), sigma, intensidade, ambiente
  function beamGrad(g, P, ang, sig, I, amb, rgb = '255,255,255') {
    const n = [-Math.sin(rad(ang)), Math.cos(rad(ang))];
    const gr = g.createLinearGradient(P[0] - n[0] * 3 * sig, P[1] - n[1] * 3 * sig, P[0] + n[0] * 3 * sig, P[1] + n[1] * 3 * sig);
    for (let i = 0; i <= 16; i++) { const u = i / 16, z = (u - 0.5) * 6; gr.addColorStop(u, `rgba(${rgb},${cl(amb + (1 - amb) * I * Math.exp(-z * z / 2))})`); }
    return gr;
  }
  function beamMask(P, ang, sig, I, amb) { return (g) => { g.fillStyle = beamGrad(g, P, ang, sig, I, amb); BIG(g); }; }
  function beamTint(P, ang, sig, I, rgb) { return (g) => { g.fillStyle = beamGrad(g, P, ang, sig, I, 0, rgb); BIG(g); }; }
  // máscara angular (anéis): faixas visíveis em graus, borda macia e
  function conicMask(segs, e = 1.2) {
    return (g) => {
      const gr = g.createConicGradient(-Math.PI, RCX, RCY), st = [];
      for (const [a0, a1] of segs) { if (a1 - a0 <= 0.01) continue; st.push([a0 - e, 0], [a0, 1], [a1, 1], [a1 + e, 0]); }
      if (!st.length) { g.fillStyle = 'rgba(0,0,0,0)'; BIG(g); return; }
      st.sort((p, q) => p[0] - q[0]);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      for (const [a, v] of st) gr.addColorStop(cl((a + 180) / 360), `rgba(0,0,0,${v})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; BIG(g);
    };
  }
  // calor dourado logo atrás da frente de desenho (decai em ~graus)
  function conicHeat(fronts, len, I) {
    return (g) => {
      const gr = g.createConicGradient(-Math.PI, RCX, RCY), st = [];
      for (const [a, dir] of fronts) { for (let k = 0; k <= 6; k++) { const d = (k / 6) * len; st.push([a - dir * d, I * Math.pow(1 - k / 6, 2)]); } st.push([a + dir * 0.8, 0]); }
      st.sort((p, q) => p[0] - q[0]);
      gr.addColorStop(0, 'rgba(255,214,150,0)');
      for (const [a, v] of st) gr.addColorStop(cl((a + 180) / 360), `rgba(255,214,150,${cl(v)})`);
      gr.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = gr; BIG(g);
    };
  }
  function linMask(x0, y0, x1, y1, stops) { return (g) => { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [u, a] of stops) gr.addColorStop(cl(u), `rgba(0,0,0,${a})`); g.fillStyle = gr; BIG(g); }; }

  // ------------------------------------------------------------------ fundo: textura e grão (semente fixa)
  const texC = document.createElement('canvas'); texC.width = 270; texC.height = 480;
  { const g = texC.getContext('2d'), d = g.createImageData(270, 480), R = mulberry32(2016); for (let i = 0; i < 270 * 480; i++) { const v = 128 + (R() + R() + R() - 1.5) * 70; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; } g.putImageData(d, 0, 0); }
  const GR = []; for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256), R = mulberry32(77 + k); for (let i = 0; i < 65536; i++) { const w = R() < 0.5; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = w ? 255 : 0; d.data[i * 4 + 3] = Math.floor(R() * 7); } g.putImageData(d, 0, 0); GR.push(c); }
  // poeira iluminada: posição de tela + profundidade (parallax), deriva lenta; acende só onde a luz bate
  const PO = []; { const R = mulberry32(1955); for (let i = 0; i < 150; i++) PO.push({ x: R() * W, y: R() * H, z: 0.35 + R() * 1.35, vx: (R() - 0.5) * 14, vy: -6 - R() * 16, f: R() * 6.28, w: 0.6 + R() * 1.6 }); }
  const dot = document.createElement('canvas'); dot.width = dot.height = 64;
  { const g = dot.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,226,170,1)'); gr.addColorStop(0.35, 'rgba(255,196,120,0.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  const pen = document.createElement('canvas'); pen.width = pen.height = 96;
  { const g = pen.getContext('2d'), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.12, 'rgba(255,226,170,0.9)'); gr.addColorStop(0.4, 'rgba(240,170,90,0.18)'); gr.addColorStop(1, 'rgba(220,140,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); }

  // ------------------------------------------------------------------ luz principal (feixe) — mundo
  function feixe(t) {
    if (t < EV.corte_navalha) {              // plano A: atravessa a tesoura na diagonal
      const u = seg(t, 0, EV.corte_navalha + 0.1);
      const P = [lerp(190, 430, u), lerp(330, 525, u)];
      return { P, ang: -62, sig: 36, I: ss(seg(t, 0, 0.12)), amb: 0.04, spec: 0.6 };
    }
    // plano B e recuo: percorre a navalha da ponta ao cabo e depois se abre em luz de cena
    const u = seg(t, EV.corte_navalha, EV.cena2 + 0.2);
    const base = [NAV_C[0] + 48, NAV_C[1] + 28];
    const P = [base[0] + NAV_U[0] * lerp(95, -170, u), base[1] + NAV_U[1] * lerp(95, -170, u)];
    const o = ss(seg(t, EV.cena2 - 0.1, EV.cena2 + 0.55));
    return { P: [lerp(P[0], 560, o), lerp(P[1], 380, o)], ang: lerp(36, 20, o), sig: lerp(30, 700, ei2(o)), I: 1, amb: lerp(0.035, 1, o * o), spec: lerp(0.6, 0, o) };
  }

  // ------------------------------------------------------------------ composição de um instante
  function render(t, g) {
    CAM = camera(t); CM = camMatrix(CAM);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    const FX = feixe(t);
    const fim = t > EV.corte_final + 0.5;
    if (!ALPHA) fundo(t, g, FX);

    // ---- emblema em logoC
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'source-over'; lctx.globalAlpha = 1; lctx.clearRect(0, 0, W, H);
    const lit = t >= EV.encaixe + 0.5;      // luz de cena plena: ferramentas sem máscara de feixe

    // anéis — metade de cima (cena 2) e de baixo (cena 4), desenhados por linhas de luz
    const [a0, a1] = EV.aneis, [b0, b1] = EV.arcos_baixo;
    ANEIS.forEach((nm, i) => {
      const d = i * 0.045;
      const pu = eio(seg(t, a0 + d, a1 + d * 0.5)), pl = eio(seg(t, b0 + d, b1 + d * 0.5));
      if (pu <= 0) return;
      const upL = lerp(-169, -90, pu), upR = lerp(-11, -90, pu);
      const loR = lerp(0, 90, pl), loL = lerp(180, 90, pl);
      const segs = [[-180, upL], [upR, 0]];
      if (pl > 0) segs.push([0, loR], [loL, 180]);
      const done = pu >= 1 && pl >= 1;
      const fronts = [];
      if (pu > 0 && pu < 1) fronts.push([upL, 1], [upR, -1]);
      if (pl > 0 && pl < 1) fronts.push([loR, 1], [loL, -1]);
      layer(lctx, nm, done ? {} : { mask: conicMask(segs), tint: fronts.length ? conicHeat(fronts, 40, 0.8) : null });
      for (const [a] of fronts) penHead(nm, a, t);
    });

    // barra superior: linha de luz do centro para as pontas
    {
      const p = eo3(seg(t, EV.barra[0], EV.barra[1])), hw = lerp(0, 410, p);
      if (p > 0) layer(lctx, 'barra', p < 1 ? { mask: linMask(CENTRO[0] - hw - 8, 0, CENTRO[0] + hw + 8, 0, [[0, 0], [8 / (2 * hw + 16), 1], [1 - 8 / (2 * hw + 16), 1], [1, 0]]), tint: beamTint([CENTRO[0] + hw, 0], 90, 26, 0.9, '255,220,160') } : (t < EV.barra[1] + 0.5 ? { tint: tintLateral(t, EV.barra[1], 0.5) } : {}));
      if (p > 0 && p < 1) { penAt(CENTRO[0] - hw, 527, 0.8); penAt(CENTRO[0] + hw, 527, 0.8); }
    }

    // cabeça do barbeiro: iluminação lateral (a luz vem da nuca para o rosto)
    {
      const p = seg(t, EV.cabeca[0], EV.cabeca[1]);
      if (p > 0) {
        const e = lerp(690, 410, eio(p));
        if (p < 1) layer(lctx, 'cabeca', { mask: linMask(e - 110, 0, e + 10, 0, [[0, 0], [0.6, 0.55], [1, 1]]), tint: beamTint([e + 10, 0], 90, 40, 0.6 * (1 - p * 0.6), '255,205,140') });
        else layer(lctx, 'cabeca');
      }
    }

    // tesoura e navalha
    {
      const tp = tesouraPose(t), lr = laminaRot(t), np_ = navalhaPose(t);
      const xT = [{ piv: PIVO, dx: tp.dx, dy: tp.dy, r: tp.r }], xL = [...xT, { piv: PIVO, r: lr }], xN = [{ piv: NAV_C, dx: np_.dx, dy: np_.dy, r: np_.r }];
      const glint = seg(t, EV.encaixe - 0.02, EV.encaixe + 0.45);
      const visT = t < EV.corte_navalha || t >= EV.cena2 - 0.05, visN = t >= EV.corte_navalha;
      for (const [nm, xf, vis] of [['tesoura_lamina', xL, visT], ['tesoura', xT, visT], ['navalha', xN, visN || t >= EV.cena2 - 0.05]]) {
        if (!vis && !(t >= EV.cena2)) continue;
        if (lit) {
          const gl = glint < 1 ? beamTint([lerp(250, 860, glint), 400], 60, 22, 0.55 * Math.sin(glint * Math.PI), '255,236,200') : null;
          layer(lctx, nm, gl ? { xf, tint: gl } : { xf });
        } else {
          const gl = glint > 0 && glint < 1 ? Math.sin(glint * Math.PI) : 0;
          layer(lctx, nm, { xf, mask: beamMask(FX.P, FX.ang, FX.sig, FX.I, FX.amb), tint: (g) => {
            beamTint(FX.P, FX.ang, FX.sig * 0.35, FX.spec * FX.I, '255,240,215')(g);
            if (gl > 0) beamTint([lerp(250, 860, glint), 400], 60, 22, 0.5 * gl, '255,236,200')(g);
            const sn = corteBrilho(t);
            if (sn && nm !== 'navalha') beamTint(sn.P, sn.ang, 14, sn.I, '255,248,232')(g);
          } });
        }
      }
    }

    // SR.EDGAR — revelado pela luz que atravessa o centro, na batida grave
    {
      const t0 = EV.nome - 0.02, lx = lerp(150, 1010, eo3(seg(t, t0, t0 + NOME_D)));
      if (t >= t0) LETRAS.forEach((nm) => {
        const L = IMG[nm]; const ti = t0 + NOME_D * invEo3(cl((L.x - 150) / 860));
        const p = seg(t, ti, ti + 0.6), up = 16 * (1 - eo3(p));
        const xf = [{ piv: [L.x + L.w / 2, L.y + L.h], dy: up, s: lerp(1.05, 1, eo3(p)) }];
        const heat = 0.65 * Math.pow(1 - seg(t, ti, ti + 0.7), 2);
        if (lx < L.x + L.w + 12) layer(lctx, nm, { xf, mask: linMask(lx - 14, 0, lx + 4, 0, [[0, 1], [1, 0]]), tint: tintSolid(255, 214, 150, 0.7 * heat), tintLocal: true });
        else layer(lctx, nm, heat > 0 ? { xf, tint: tintSolid(255, 214, 150, 0.7 * heat) } : { xf });
      });
    }

    // faixa curva (assinatura): desenha do centro para as pontas
    {
      const p = eo3(seg(t, EV.faixa[0], EV.faixa[1])), hw = lerp(0, 400, p);
      if (p > 0) layer(lctx, 'faixa', p < 1 ? { mask: linMask(CENTRO[0] - hw - 10, 0, CENTRO[0] + hw + 10, 0, [[0, 0], [10 / (2 * hw + 20), 1], [1 - 10 / (2 * hw + 20), 1], [1, 0]]) } : {});
      if (p > 0 && p < 1) { penAt(CENTRO[0] - hw, faixaY(CENTRO[0] - hw), 0.75); penAt(CENTRO[0] + hw, faixaY(CENTRO[0] + hw), 0.75); }
    }

    // raios + escudo escuro atrás de "Barbearia": abrem do centro
    {
      const p = eo3(seg(t, EV.barbearia - 0.2, EV.barbearia + 0.45));
      if (p > 0) layer(lctx, 'raios', p < 1 ? { mask: (g) => { const R = lerp(10, 240, p), gr = g.createRadialGradient(551, 742, 0, 551, 742, R + 30); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(R / (R + 30), 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; BIG(g); } } : {});
    }
    // "Barbearia": escrita da esquerda para a direita (frente inclinada como a pena)
    {
      const p = seg(t, EV.barbearia - 0.05, EV.barbearia + 0.5);
      if (p > 0) {
        const x = lerp(430, 672, eio(p));
        layer(lctx, 'barbearia', p < 1 ? { mask: linMask(x - 22, 760, x + 8, 720, [[0, 1], [1, 0]]), tint: beamTint([x - 6, 740], 105, 9, 0.8, '255,226,170') } : {});
      }
    }
    // EST. 2016 — cada caractere sai de trás do anel de cobre interno, um a um
    ESTCH.forEach((nm, i) => {
      const ti = EV.est + i * 0.045, p = seg(t, ti, ti + 0.42);
      if (p <= 0) return;
      const L = IMG[nm], cx = L.x + L.w / 2, cy = L.y + L.h / 2, dx = cx - RCX, dy = cy - RCY, dd = Math.hypot(dx, dy);
      const k = -24 * (1 - eo3(p));
      const xf = [{ dx: (dx / dd) * k, dy: (dy / dd) * k }];
      layer(lctx, nm, p < 1 ? { xf, mask: (g) => { g.beginPath(); g.arc(RCX, RCY, 291, 0, Math.PI * 2); g.arc(RCX, RCY, 245, 0, Math.PI * 2, true); g.fillStyle = '#000'; g.fill('evenodd'); } } : { xf });
    });
    // estrelas: giram para o lugar e recebem um reflexo dourado
    ESTRELAS.forEach((nm, i) => {
      const ord = [0, 1, 3, 2][i];
      const ti = EV.estrelas[0] + ord * 0.07, p = seg(t, ti, ti + 0.4);
      if (p <= 0) return;
      const L = IMG[nm], c = [L.x + L.w / 2, L.y + L.h / 2 + 1];
      const e = eoBack(p, 1.2);
      const gl = seg(t, EV.estrelas[0] + 0.32 + ord * 0.09, EV.estrelas[0] + 0.62 + ord * 0.09);
      layer(lctx, nm, { xf: [{ piv: c, r: lerp(-120, 0, eo3(p)), s: Math.max(0.001, e) }], tint: gl > 0 && gl < 1 ? tintSolid(255, 222, 150, 0.85 * Math.sin(gl * Math.PI)) : null });
      if (gl > 0 && gl < 1) glintAt(c[0], c[1], Math.sin(gl * Math.PI), i);
    });

    // brilho metálico que percorre o emblema (cena 4)
    {
      const p = seg(t, EV.brilho[0], EV.brilho[1]);
      if (p > 0 && p < 1) sheen(p);
    }

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(logoC, 0, 0);
    if (!ALPHA) { particulas(t, g, FX); grao(t, g); }
    void fim;
  }

  // reflexo do corte: uma lâmina de luz corre da ponta ao pino quando as lâminas se fecham
  function corteBrilho(t) {
    const tc = EV.tesoura_corte, p = seg(t, tc - 0.04, tc + 0.16);
    if (p <= 0 || p >= 1) return null;
    const tp = tesouraPose(0), A = rotp([290, 300], PIVO, tp.r, tp.dx, tp.dy), Bp = rotp([400, 462], PIVO, tp.r, tp.dx, tp.dy);
    return { P: lerpP(A, Bp, eo3(p)), ang: -40, I: 0.95 * Math.sin(p * Math.PI) };
  }
  // ------------------------------------------------------------------ auxiliares de desenho
  const NOME_D = 0.42;
  const invEo3 = (u) => 1 - Math.cbrt(1 - u);    // quando a luz (eo3) passa pela letra
  function tintSolid(r, g_, b, a) { return (g) => { if (a <= 0.001) return; g.fillStyle = `rgba(${r},${g_},${b},${cl(a)})`; BIG(g); }; }
  function tintLateral(t, t0, d) { const a = 0.55 * (1 - seg(t, t0, t0 + d)); return tintSolid(255, 214, 150, a); }
  function faixaY(x) { const u = (x - CENTRO[0]) / 390; return 706 + 60 * u * u; }
  function penAt(wx, wy, a) {
    const [sx, sy] = toScr(wx, wy), r = 30 * Math.sqrt(CAM.s / 1.4);
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = ALPHA ? 'source-over' : 'lighter'; lctx.globalAlpha = cl(a);
    lctx.drawImage(pen, sx - r, sy - r, 2 * r, 2 * r); lctx.globalAlpha = 1; lctx.globalCompositeOperation = 'source-over';
  }
  function penHead(nm, ang, t) {
    const r = { anel_cobre_2: 299.5, anel_branco_3: 277.6, anel_branco_2: 262.5, anel_cobre_1: 238.6, anel_branco_1: 224.6 }[nm];
    const x = RCX + r * Math.cos(rad(ang)), y = RCY + r * Math.sin(rad(ang));
    if (y > 522 && y < 534) return; if (y > 534 && y < 700 && Math.abs(x - 551) > 200) return;
    if (ang > -124 && ang < -58) return;           // a frente passa por trás da cabeça
    penAt(x, y, 0.85);
  }
  function glintAt(wx, wy, a, i) {
    const [sx, sy] = toScr(wx, wy), L = 34 * CAM.s * a;
    lctx.setTransform(1, 0, 0, 1, sx, sy); lctx.rotate(rad(12 + i * 9)); lctx.globalCompositeOperation = ALPHA ? 'source-over' : 'lighter';
    for (const [w, h] of [[L, 1.6], [1.6, L * 0.8]]) {
      const gr = w > h ? lctx.createLinearGradient(-w, 0, w, 0) : lctx.createLinearGradient(0, -h, 0, h);
      gr.addColorStop(0, 'rgba(255,220,160,0)'); gr.addColorStop(0.5, `rgba(255,244,220,${0.9 * a})`); gr.addColorStop(1, 'rgba(255,220,160,0)');
      lctx.fillStyle = gr; lctx.fillRect(-w, -h, 2 * w, 2 * h);
    }
    lctx.drawImage(pen, -14 * a, -14 * a, 28 * a, 28 * a);
    lctx.globalCompositeOperation = 'source-over'; lctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function sheen(p) {
    // cópia do emblema → só a faixa (source-in) → soma por cima (lighter): reflexo metálico nos contornos
    t2ctx.setTransform(1, 0, 0, 1, 0, 0); t2ctx.globalCompositeOperation = 'source-over'; t2ctx.clearRect(0, 0, W, H); t2ctx.drawImage(logoC, 0, 0);
    t2ctx.globalCompositeOperation = 'source-in'; setCam(t2ctx);
    const P = [lerp(60, 1060, eio(p)), lerp(260, 880, eio(p))];
    const gr = beamGrad(t2ctx, P, -58, 26, 0.55, 0, '255,238,205'); t2ctx.fillStyle = gr; BIG(t2ctx);
    t2ctx.globalCompositeOperation = 'source-over';
    lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.globalCompositeOperation = 'lighter'; lctx.drawImage(tmp2C, 0, 0); lctx.globalCompositeOperation = 'source-over';
  }

  function fundo(t, g, FX) {
    g.fillStyle = BGs; g.fillRect(0, 0, W, H);
    // textura muito discreta (couro/papel), fixa na tela
    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = 0.10; g.drawImage(texC, 0, 0, W, H); g.globalAlpha = 1;
    // poça de luz quente atrás do emblema (cresce a partir da revelação)
    const pool = 0.35 * ss(seg(t, EV.cena2, EV.encaixe)) + 0.65 * ss(seg(t, EV.nome - 0.2, EV.nome + 1.2)) + 0.25 * seg(t, EV.corte_final - 0.2, DUR);
    if (pool > 0) {
      const [sx, sy] = toScr(CENTRO[0], CENTRO[1] - 40);
      g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 980);
      gr.addColorStop(0, `rgba(150,82,30,${0.16 * pool})`); gr.addColorStop(0.45, `rgba(120,62,22,${0.07 * pool})`); gr.addColorStop(1, 'rgba(90,45,15,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    // feixe volumétrico (planos A/B e recuo)
    const haze = (1 - ss(seg(t, EV.cena2 - 0.15, EV.cena2 + 0.45))) * FX.I;
    if (haze > 0.002) {
      const [sx, sy] = toScr(FX.P[0], FX.P[1]); const ang = FX.ang + CAM.r, sig = Math.min(FX.sig, 200) * CAM.s;
      g.setTransform(1, 0, 0, 1, sx, sy); g.rotate(rad(ang)); g.globalCompositeOperation = 'lighter';
      for (const [k, a] of [[0.55, 0.10], [1.4, 0.05], [3.2, 0.025]]) {
        const s2 = sig * k, gr = g.createLinearGradient(0, -3 * s2, 0, 3 * s2);
        for (let i = 0; i <= 12; i++) { const u = i / 12, z = (u - 0.5) * 6; gr.addColorStop(u, `rgba(255,170,85,${a * haze * Math.exp(-z * z / 2)})`); }
        g.fillStyle = gr; g.fillRect(-3000, -3 * s2, 6000, 6 * s2);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    // coluna de luz que atravessa o centro na revelação do nome
    { const t0 = EV.nome - 0.02, p = seg(t, t0 - 0.05, t0 + NOME_D + 0.25);
      if (p > 0 && p < 1) {
        const lx = lerp(150, 1010, eo3(seg(t, t0, t0 + NOME_D))), a = Math.sin(p * Math.PI);
        const [sx, sy] = toScr(lx, 622); g.globalCompositeOperation = 'lighter';
        for (const [w, al] of [[60, 0.16], [190, 0.07]]) { const gr = g.createLinearGradient(sx - w, 0, sx + w, 0); gr.addColorStop(0, 'rgba(255,170,85,0)'); gr.addColorStop(0.5, `rgba(255,186,105,${al * a})`); gr.addColorStop(1, 'rgba(255,170,85,0)'); g.fillStyle = gr; g.fillRect(sx - w, 0, 2 * w, H); }
        const hg = g.createLinearGradient(0, sy - 260, 0, sy + 260); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(0.5, `rgba(255,200,130,${0.10 * a})`); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(0, sy - 260, W, 520);
      } }
    // vinheta escura nas bordas
    g.globalCompositeOperation = 'source-over';
    const vg = g.createRadialGradient(W / 2, H * 0.49, 380, W / 2, H * 0.49, 1150);
    vg.addColorStop(0, 'rgba(6,3,1,0)'); vg.addColorStop(1, 'rgba(6,3,1,0.62)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }

  function particulas(t, g, FX) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const nb = [-Math.sin(rad(FX.ang + CAM.r)), Math.cos(rad(FX.ang + CAM.r))], [bx, by] = toScr(FX.P[0], FX.P[1]);
    const beamOn = 1 - ss(seg(t, EV.cena2 - 0.15, EV.cena2 + 0.45)), sigS = Math.min(FX.sig, 200) * CAM.s * 1.3;
    const late = ss(seg(t, EV.encaixe, EV.nome));
    const [px, py] = toScr(CENTRO[0], CENTRO[1] - 40);
    for (let i = 0; i < PO.length; i++) {
      const q = PO[i];
      let x = q.x + q.vx * t * q.z, y = q.y + q.vy * t * q.z;
      x = ((x % (W + 200)) + W + 200) % (W + 200) - 100; y = ((y % (H + 200)) + H + 200) % (H + 200) - 100;
      const dn = (x - bx) * nb[0] + (y - by) * nb[1];
      let a = beamOn * FX.I * Math.exp(-(dn * dn) / (2 * sigS * sigS)) * 0.85;
      const dp = Math.hypot(x - px, (y - py) * 0.8);
      a = Math.max(a, late * 0.22 * Math.exp(-(dp * dp) / (2 * 520 * 520)) * (i % 3 === 0 ? 1 : 0));
      a *= 0.6 + 0.4 * Math.sin(q.f + t * q.w * 2.2);
      if (a < 0.01) continue;
      const near = q.z > 1.45, r = near ? 7 + (q.z - 1.45) * 30 : 1.4 + q.z * 2.2;
      g.globalAlpha = cl(a * (near ? 0.22 : 1));
      g.drawImage(dot, x - r, y - r, 2 * r, 2 * r);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  function grao(t, g) {
    const f = Math.round(t * FPS), R = mulberry32(9000 + f), k = Math.floor(R() * GR.length), ox = Math.floor(R() * 256), oy = Math.floor(R() * 256);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
    g.fillStyle = g.createPattern(GR[k], 'repeat'); g.translate(-ox, -oy); g.fillRect(ox, oy, W, H); g.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ------------------------------------------------------------------ desfoque de movimento: subquadros (obturador 180°)
  function sondas(t) {
    CAM = camera(t); CM = camMatrix(CAM);
    const tp = tesouraPose(t), lr = laminaRot(t), np_ = navalhaPose(t);
    const tipL = rotp(rotp([282, 305], PIVO, lr), PIVO, tp.r, tp.dx, tp.dy), tipR = rotp([328, 282], PIVO, tp.r, tp.dx, tp.dy), nav = rotp([790, 296], NAV_C, np_.r, np_.dx, np_.dy);
    return [tipL, tipR, nav, [551, 562], [200, 300], [900, 850]].map((p) => toScr(p[0], p[1]));
  }
  function nSub(t) {
    const h = 0.5 / FPS, a = sondas(cut(t - h / 2, t)), b = sondas(cut(t + h / 2, t));
    let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]));
    return Math.max(1, Math.min(16, Math.ceil(m / 2.5)));
  }
  function cut(tt, t) { // subquadros não atravessam o corte seco do plano A para o B
    const c = EV.corte_navalha;
    if (t < c && tt >= c) return c - 1e-4;
    if (t >= c && tt < c) return c;
    return Math.min(Math.max(tt, 0), DUR);
  }
  let ACC = null;
  function seek(t) {
    const K = nSub(t);
    if (K === 1) { render(t, ctx); return K; }
    const h = 0.5 / FPS;
    if (!ACC) ACC = new Float32Array(W * H * 4);
    ACC.fill(0);
    for (let i = 0; i < K; i++) {
      const tt = cut(t - h / 2 + (h * (i + 0.5)) / K, t);
      render(tt, fctx);
      const d = fctx.getImageData(0, 0, W, H).data;
      for (let j = 0; j < d.length; j++) ACC[j] += d[j];
    }
    const out = fctx.createImageData(W, H);
    for (let j = 0; j < ACC.length; j++) out.data[j] = Math.round(ACC[j] / K);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H); ctx.putImageData(out, 0, 0);
    return K;
  }

  // ------------------------------------------------------------------ carga
  window.ready = (async () => {
    await Promise.all(M.camadas.map((c) => new Promise((res, rej) => {
      const im = new Image(); im.onload = () => { IMG[c.nome] = { img: im, x: c.x, y: c.y, w: c.w, h: c.h }; res(); }; im.onerror = () => rej(new Error('camada ' + c.nome)); im.src = `assets/camadas/${c.nome}.png`;
    })));
    for (const k of Object.keys(IMG)) await IMG[k].img.decode();
    return true;
  })();
  window.seek = seek;
  window.png = () => cv.toDataURL('image/png');
  window.info = () => ({ dur: DUR, fps: FPS, eventos: EV, cenas: [
    { id: 'c1_inicio', t0: 0, dur: 1.5 }, { id: 'c2_construcao', t0: 1.5, dur: 1.5 }, { id: 'c3_revelacao', t0: 3, dur: 2 },
    { id: 'c4_assinatura', t0: 5, dur: 1.5 }, { id: 'c5_final', t0: 6.5, dur: 1.5 }] });
})();
