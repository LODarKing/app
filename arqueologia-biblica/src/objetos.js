// Objetos do piloto: estela (basalto, escrita ilustrativa), lupa e pincel articulados, areia, nuvem de areia,
// mapa em papiro, carimbo em cartucho, rolo de papiro e estratos do solo. Tudo é função pura dos parâmetros.

// ================================================================ ESTELA (ilustração da estela de Tel Dan)
const PTS_ESTELA = VET.estela.match(/-?\d+(\.\d+)?/g).map(Number).reduce((o, v, i, a) => (i % 2 ? o : o.concat([[v, a[i + 1]]])), []);
function extensaoX(y) {                               // interseção da linha horizontal y com o contorno da pedra
  const xs = []; for (let i = 0; i < PTS_ESTELA.length; i++) { const [x1, y1] = PTS_ESTELA[i], [x2, y2] = PTS_ESTELA[(i + 1) % PTS_ESTELA.length]; if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) / (y2 - y1) * (x2 - x1)); }
  return [Math.min(...xs), Math.max(...xs)];
}
let _insc = null;
const LIN_ALVO = 6;                                   // linha onde fica "bytdwd" (posição ilustrativa)
function inscricao() {                                // diagramação da escrita: da direita para a esquerda, palavras separadas por pontos
  if (_insc) return _insc;
  const px = 38, lines = [];
  for (let i = 0; i < 10; i++) {
    const y = -236 + i * 51, [a, b] = [extensaoX(y - 14), extensaoX(y + 14)], xL = Math.max(a[0], b[0]) + 30, xR = Math.min(a[1], b[1]) - 30;
    const L = { y, xL, xR, g: [], dots: [], alvo: null }; let x = xR, w = 0, n = 0;
    while (x > xL + 30) {
      const alvo = i === LIN_ALVO && !L.alvo && x < (xL + xR) / 2 + 110;
      const letras = alvo ? BYTDWD : Array.from({ length: 2 + Math.floor(rnd(31 + i, n) * 4) }, (_, k) => FEN[Math.floor(rnd(57 + i * 13, n * 7 + k) * 22)]);
      const ws = letras.map((ch) => largura(ch, px, 'fen', 400) + 2), tot = ws.reduce((p, q) => p + q, 0);
      if (x - tot < xL) break;
      const x0 = x; letras.forEach((ch, k) => { L.g.push({ ch, x, alvo }); x -= ws[k]; });
      if (alvo) L.alvo = { x0: x - 4, x1: x0 + 4, y };
      x -= 9; L.dots.push(x); x -= 9; n++;
    }
    L.dots.pop(); lines.push(L);
  }
  _insc = { px, lines }; return _insc;
}
// limpo[i] (0..1): quanto da linha i já foi limpo pelo pincel (da direita para a esquerda). destaque 0..1.
function estela(limpo = null, destaque = 0, { poeira = true, letrasClaras = false } = {}) {
  const I = inscricao(), path = P2(VET.estela);
  peca(path, C.basalto, { lw: 5, tex: 0.75, pedra: true });
  ctx.save(); ctx.clip(path);
  // luz rasante: lado de cima mais claro, base mais escura
  const g = ctx.createLinearGradient(-200, -330, 160, 330); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = g; ctx.fillRect(-300, -340, 600, 680);
  for (const f of VET.estelaFraturas) { ctx.fillStyle = 'rgba(15,15,18,0.45)'; ctx.fill(P2(f)); }
  // escrita incisa: realce claro deslocado + sulco escuro
  ctx.font = fonte(I.px, 'fen', 400); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const L of I.lines) {
    for (const q of L.g) { ctx.fillStyle = letrasClaras ? 'rgba(205,210,214,0.9)' : 'rgba(150,156,162,0.55)'; ctx.fillText(q.ch, q.x + (letrasClaras ? 2.4 : 1.6), L.y + (letrasClaras ? 2.4 : 1.6)); ctx.fillStyle = '#121315'; ctx.fillText(q.ch, q.x, L.y); }
    for (const d of L.dots) { ctx.fillStyle = 'rgba(150,156,162,0.55)'; ctx.beginPath(); ctx.arc(d + 1.2, L.y + 1.2, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = '#121315'; ctx.beginPath(); ctx.arc(d, L.y, 3.4, 0, 7); ctx.fill(); }
  }
  // camada de areia/poeira por cima; as faixas já limpas ficam abertas (preenchimento par-ímpar)
  if (poeira) {                                       // véu de areia sobre a face; as faixas já limpas pelo pincel ficam nítidas (par-ímpar)
    const pz = new Path2D(); pz.rect(-320, -340, 640, 680);
    I.lines.forEach((L, i) => { const k = limpo ? clamp(limpo[i]) : 0; if (k <= 0) return; const xe = lerp(L.xR + 34, L.xL - 34, k); pz.rect(xe, L.y - 25, L.xR + 60 - xe, 50); });
    ctx.fillStyle = rgba(C.areia, 0.32); ctx.fill(pz, 'evenodd');
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6; ctx.fillStyle = texPeca(); ctx.fill(pz, 'evenodd'); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // montinhos de areia presos no topo e na base (não somem com o pincel)
    for (let i = 0; i < 9; i++) { const x = -230 + i * 58, y = i % 2 ? -292 : 296; ctx.fillStyle = rgba(C.areia, 0.9); ctx.beginPath(); ctx.ellipse(x, y, 34 + rnd(322, i) * 26, 14 + rnd(323, i) * 8, 0, 0, 7); ctx.fill(); }
  }
  ctx.restore();
  ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(path);
  // destaque editorial: moldura ocre arredondada em torno de "bytdwd" + sublinhado que se desenha
  const A = I.lines[LIN_ALVO].alvo;
  if (destaque > 0 && A) {
    const k = ease.o(clamp(destaque * 1.6)), w = A.x1 - A.x0;
    ctx.save(); ctx.strokeStyle = C.ocre; ctx.lineWidth = 6; ctx.lineCap = 'round';
    rr(A.x0 - 8, A.y - 30, (w + 16), 60, 14); ctx.setLineDash([(w + 16) * 2 + 120, 2000]); ctx.lineDashOffset = ((w + 16) * 2 + 120) * (1 - k); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }
  return A;
}
function alvoEstela() { const A = inscricao().lines[LIN_ALVO].alvo; return [(A.x0 + A.x1) / 2, A.y]; }

// ================================================================ LUPA articulada (aro + virola + cabo com atraso)
// (cx, cy) centro do vidro; aCabo ângulo do cabo; conteudo(): desenha o que está sob a lupa (coordenadas do mundo)
function lupa(cx, cy, aCabo, conteudo, aumento = 1.6, r = 100) {
  // cabo (atrás do aro)
  pivo(cx, cy, aCabo, 1, 1, () => { ctx.translate(0, r - 4); peca(VET.lupaCabo, C.terracota, { lw: 4 }); ctx.strokeStyle = rgba(C.tinta, 0.45); ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-14, 40 + k * 26); ctx.lineTo(14, 46 + k * 26); ctx.stroke(); } peca(VET.lupaVirola, C.bronze, { lw: 3.4, sombra: 0 }); });
  // vidro: o conteúdo ampliado
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 10, 0, 7); ctx.clip();
  ctx.translate(cx, cy); ctx.scale(aumento, aumento); ctx.translate(-cx, -cy); conteudo(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 10, 0, 7); ctx.fillStyle = 'rgba(70,170,160,0.10)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,250,0.55)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r - 30, -2.6, -1.9); ctx.stroke(); ctx.restore();
  pivo(cx, cy, 0, 1, 1, () => peca(VET.lupaAro, C.bronze, { lw: 4 }));
}
// ================================================================ PINCEL articulado (cerdas que dobram com a velocidade)
function pincel(x, y, ang, dobra) {
  pivo(x, y, ang, 1, 1, () => {
    // cerdas: leque de fios que dobram para trás do movimento
    for (let i = -6; i <= 6; i++) { const bx = i * 3.2, by = 46 + Math.abs(i) * -1.2; ctx.strokeStyle = i % 2 ? '#6B4A26' : '#8A6434'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx * 0.6, 0); ctx.quadraticCurveTo(bx, by * 0.5, bx + dobra * 26, by); ctx.stroke(); }
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-20 + dobra * 26, 40); ctx.quadraticCurveTo(-14, 10, -11, 0); ctx.moveTo(20 + dobra * 26, 40); ctx.quadraticCurveTo(14, 10, 11, 0); ctx.stroke();
    ctx.scale(1, -1); peca(VET.pincelVirola, C.bronze, { lw: 3, sombra: 0 }); ctx.translate(0, 22); peca(VET.pincelCabo, C.ocre, { lw: 3.4 });
  });
}

// ================================================================ AREIA: duna recortada com estratos, grãos que escorrem
function dunaPts(y0, seed, amp = 26) { const o = []; for (let x = -60; x <= W + 60; x += 40) o.push([x, y0 + Math.sin(x * 0.006 + seed) * amp + rs(seed, x) * 6]); return o; }
function camada(pts, yBase, cor, { lw = 4.5, sombra = 1, tex = 0.6 } = {}) {
  const p = new Path2D(); p.moveTo(pts[0][0], yBase); pts.forEach(([x, y]) => p.lineTo(x, y)); p.lineTo(pts[pts.length - 1][0], yBase); p.closePath();
  peca(p, cor, { lw: 0, tex, sombra });
  ctx.strokeStyle = C.tinta; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
}
function soloFrente(y0, t) {                          // chão de areia com estratos (camadas = estratigrafia)
  camada(dunaPts(y0, 1.3), H + 400, C.areia);
  camada(dunaPts(y0 + 170, 2.1, 14), H + 400, shade(C.areia, -0.07), { lw: 3, sombra: 0 });
  camada(dunaPts(y0 + 330, 3.7, 12), H + 400, mix(C.areiaEsc, C.terra, 0.25), { lw: 3, sombra: 0 });
  camada(dunaPts(y0 + 520, 0.4, 10), H + 400, mix(C.terra, C.areiaEsc, 0.4), { lw: 3, sombra: 0 });
  // seixos e um caco de cerâmica nas camadas
  for (let i = 0; i < 18; i++) { const x = rnd(91, i) * W, y = y0 + 60 + rnd(92, i) * 600; ctx.fillStyle = i % 5 ? shade(C.areiaEsc, -0.15) : C.terracota; ctx.strokeStyle = C.tinta; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(x, y, 7 + rnd(93, i) * 10, 5 + rnd(94, i) * 6, rnd(95, i) * 3, 0, 7); ctx.fill(); ctx.stroke(); }
}
// grão de areia recortado (polígono de 4 a 6 lados)
function grao(x, y, r, rot, cor) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); const n = 5; for (let k = 0; k < n; k++) { const a = k / n * 6.283, rr2 = r * (0.7 + 0.3 * Math.sin(k * 2.3 + r)); k ? ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fillStyle = cor; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore(); }

// ================================================================ NUVEM DE AREIA (transição): tufos recortados
function nuvemAreia(k) {                              // k: 0 (fora, à esquerda) → 0,5 (cobre tudo) → 1 (fora, à direita)
  if (k <= 0 || k >= 1) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const off = lerp(-1700, 1700, k);
  for (let c = 0; c < 2; c++) {                       // duas passadas: contorno de todos, depois preenchimento (contorno da união)
    for (let i = 0; i < 64; i++) {
      const cx = off + (rnd(201, i) - 0.5) * 1500 + 540 + (i % 2 ? 80 : -80), cy = (i / 64) * (H + 300) - 150 + rs(202, i) * 80, r = 230 + rnd(203, i) * 170 + Math.sin(on2(k * 3) * 9 + i) * 10;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7);
      if (c === 0) { ctx.strokeStyle = C.tinta; ctx.lineWidth = 10; ctx.stroke(); }
      else { ctx.fillStyle = i % 3 === 0 ? shade(C.areia, -0.12) : i % 3 === 1 ? C.areia : shade(C.areia, 0.08); ctx.fill(); }
    }
  }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.fillStyle = texPeca(); ctx.fillRect(off - 1300, -100, 2600, H + 200); ctx.restore();
  // redemoinhos desenhados (traços de vento em tinta)
  ctx.strokeStyle = rgba(C.tinta, 0.6); ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const cx = off + 540 + (rnd(211, i) - 0.5) * 1100, cy = 160 + rnd(212, i) * 1600, r = 50 + rnd(213, i) * 40; ctx.beginPath(); ctx.arc(cx, cy, r, 3.6, 5.9); ctx.stroke(); }
}

// ================================================================ MAPA em papiro (projeção simples lon/lat; geografia aproximada)
const MAPA = { x0: 230, lon0: 34.15, kx: 350, y0: 290, lat0: 33.55, ky: 413 };
const pj = (lon, lat) => [MAPA.x0 + (lon - MAPA.lon0) * MAPA.kx, MAPA.y0 + (MAPA.lat0 - lat) * MAPA.ky];
const COSTA = [[35.44, 33.78], [35.37, 33.56], [35.30, 33.40], [35.19, 33.27], [35.12, 33.10], [35.10, 33.05], [35.07, 32.93], [35.03, 32.85], [34.96, 32.82], [34.95, 32.72], [34.92, 32.61], [34.89, 32.50], [34.84, 32.33], [34.80, 32.20], [34.75, 32.05], [34.70, 31.93], [34.64, 31.80], [34.55, 31.67], [34.43, 31.52], [34.30, 31.35], [34.22, 31.25], [34.12, 31.05], [34.02, 30.85]].map(([a, b]) => pj(a, b));
const JORDAO = [[35.64, 33.24], [35.62, 33.12], [35.61, 33.02], [35.60, 32.90], [35.57, 32.71], [35.58, 32.60], [35.55, 32.45], [35.57, 32.30], [35.52, 32.12], [35.55, 31.98], [35.54, 31.85], [35.55, 31.77]].map(([a, b]) => pj(a, b));
const LUGAR = { dan: pj(35.652, 33.249), galileia: pj(35.59, 32.82), jerusalem: pj(35.235, 31.778), mortoN: pj(35.53, 31.77), mortoS: pj(35.42, 31.08) };
let _folha = null;
function folhaPapiro() {                              // folha com borda rasgada (cache: textura fixa)
  if (_folha) return _folha;
  const x0 = 160, y0 = 236, w = 860, h = 1150, c = canvas(w + 40, h + 40), g = c.getContext('2d');
  const borda = [], m = 20;
  for (let x = 0; x <= w; x += 22) borda.push([m + x, m + rs(301, x) * 7]);
  for (let y = 22; y <= h; y += 22) borda.push([m + w + rs(302, y) * 7, m + y]);
  for (let x = w - 22; x >= 0; x -= 22) borda.push([m + x, m + h + rs(303, x) * 7]);
  for (let y = h - 22; y > 0; y -= 22) borda.push([m + rs(304, y) * 7, m + y]);
  const p = new Path2D(); borda.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath();
  const tex = canvas(w + 40, h + 40); pintaPapiro(tex.getContext('2d'), w + 40, h + 40, 8, C.papiroClaro);
  g.save(); g.clip(p); g.drawImage(tex, 0, 0); g.restore();
  _folha = { c, p, x0: x0 - 20, y0: y0 - 20, path: (() => { const q = new Path2D(); q.addPath(p, new DOMMatrix().translate(x0 - 20, y0 - 20)); return q; })() };
  return _folha;
}
function ondasEgipcias(fase, cor = C.tinta, passo = 28) {   // padrão de água egípcio: linhas em zigue-zague
  ctx.strokeStyle = rgba(cor, 0.5); ctx.lineWidth = 2.4; ctx.lineJoin = 'miter';
  for (let y = 200; y < 1420; y += passo) { ctx.beginPath(); for (let x = 100; x < 1100; x += 14) { const yy = y + ((Math.floor((x + fase * 28) / 14) % 2) ? -6 : 6); x === 100 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
}
function montanha(x, y, s = 1) { const p = new Path2D(`M ${x - 34 * s} ${y} C ${x - 34 * s} ${y - 34 * s} ${x - 4 * s} ${y - 34 * s} ${x} ${y - 14 * s} C ${x + 4 * s} ${y - 34 * s} ${x + 34 * s} ${y - 34 * s} ${x + 34 * s} ${y} Z`); peca(p, mix(C.terracota, C.areia, 0.45), { lw: 2.8, sombra: 0, tex: 0.4 }); }
// k = { costa, rio, rotulos, dan } (0..1 cada); fase: animação da água (stepped)
function mapa(k, fase = 0) {
  const F = folhaPapiro();
  ctx.save(); ctx.shadowColor = 'rgba(45,22,6,0.38)'; ctx.shadowBlur = 16; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 12; ctx.drawImage(F.c, F.x0, F.y0); ctx.restore();
  ctx.save(); ctx.clip(F.path);
  // mar (oeste da costa)
  const kc = clamp(k.costa ?? 1);
  const mar = new Path2D(); mar.moveTo(100, COSTA[0][1]); COSTA.forEach(([x, y]) => mar.lineTo(x, y)); mar.lineTo(100, COSTA[COSTA.length - 1][1]); mar.closePath();
  const rev = new Path2D(); rev.rect(0, 0, W, lerp(200, 1450, ease.io(kc)));
  ctx.save(); ctx.clip(rev); ctx.fillStyle = rgba(C.lapis, 0.85); ctx.fill(mar); ctx.clip(mar); ondasEgipcias(fase, '#0F1C3E'); ctx.restore();
  // terra: lavagem ocre leve
  const terra = new Path2D(); terra.moveTo(1100, COSTA[0][1]); COSTA.forEach(([x, y]) => terra.lineTo(x, y)); terra.lineTo(1100, COSTA[COSTA.length - 1][1]); terra.closePath();
  ctx.save(); ctx.clip(rev); ctx.fillStyle = rgba(C.ocre, 0.16); ctx.fill(terra); ctx.restore();
  // montanhas (Hermom ao norte, colinas da Judeia)
  if (kc > 0.3) { [[35.86, 33.42, 1], [35.98, 33.33, 0.8], [35.75, 33.52, 0.75], [35.18, 31.62, 0.7], [35.30, 31.95, 0.65], [35.08, 31.36, 0.6], [35.35, 32.35, 0.6]].forEach(([a, b, s], i) => { if (kc > 0.3 + i * 0.07) { const [x, y] = pj(a, b); montanha(x, y, s); } }); }
  // linha de costa em tinta, desenhada pela ponta
  tracoTinta(COSTA, kc, C.tinta, 5);
  // lagos e rio
  const kr = clamp(k.rio ?? 1);
  if (kr > 0) {
    const [gx, gy] = LUGAR.galileia;
    ctx.save(); ctx.translate(gx, gy); ctx.scale(ease.back(clamp(kr * 2)), ease.back(clamp(kr * 2)));
    const gal = new Path2D('M 0 -44 C 22 -42 30 -10 22 18 C 16 38 -6 46 -16 30 C -28 10 -26 -30 0 -44 Z'); peca(gal, C.lapis, { lw: 3.4, sombra: 0, tex: 0.3 }); ctx.restore();
    const [mx, my] = LUGAR.mortoN, [sx, sy] = LUGAR.mortoS;
    const mortoP = new Path2D(`M ${mx - 6} ${my - 4} C ${mx + 30} ${my} ${mx + 34} ${(my + sy) / 2 - 60} ${mx + 16} ${(my + sy) / 2} C ${mx + 8} ${sy - 60} ${sx + 24} ${sy - 20} ${sx + 4} ${sy} C ${sx - 18} ${sy - 30} ${mx - 30} ${(my + sy) / 2} ${mx - 6} ${my - 4} Z`);
    if (kr > 0.4) peca(mortoP, C.lapis, { lw: 3.4, sombra: 0, tex: 0.3 });
    tracoTinta(JORDAO, clamp((kr - 0.2) / 0.8), C.lapis, 6);
  }
  // Jerusalém (referência)
  const kl = clamp(k.rotulos ?? 1);
  if (kl > 0) {
    const [jx, jy] = LUGAR.jerusalem; ctx.fillStyle = C.tinta; ctx.beginPath(); ctx.arc(jx, jy, 8 * ease.back(clamp(kl * 2)), 0, 7); ctx.fill();
    const a = ease.o(clamp(kl * 1.5)); ctx.save(); ctx.beginPath(); ctx.rect(jx + 16, jy - 40, 260 * a, 60); ctx.clip();
    texto('Jerusalém', jx + 18, jy + 10, { px: 34, peso: 800, cor: C.tinta }); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(LUGAR.galileia[0] + 36, LUGAR.galileia[1] - 40, 300 * a, 80); ctx.clip();
    texto('Mar da', LUGAR.galileia[0] + 38, LUGAR.galileia[1] - 4, { px: 28, peso: 700, cor: C.lapis }); texto('Galileia', LUGAR.galileia[0] + 38, LUGAR.galileia[1] + 28, { px: 28, peso: 700, cor: C.lapis }); ctx.restore();
    ctx.save(); ctx.translate(404, 700); ctx.rotate(-Math.PI / 2); ctx.beginPath(); ctx.rect(-190, -40, 520 * a, 60); ctx.clip(); texto('MAR MEDITERRÂNEO', -180, 0, { px: 30, peso: 800, cor: C.linho, ls: 4 }); ctx.restore();
  }
  ctx.restore();
}
// marcador de Tel Dan: anel de tinta que se desenha, ponto ocre, rótulo
function marcaDan(k, t) {
  if (k <= 0) return; const [x, y] = LUGAR.dan;
  ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + 6.283 * ease.o(clamp(k * 2))); ctx.stroke();
  ctx.fillStyle = C.ocre; ctx.beginPath(); ctx.arc(x, y, 14 * ease.back(clamp(k * 2.5)), 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
  // pulso de anéis de tinta (desenhado, sem brilho)
  const ph = (on2(t) * 1.4) % 1; ctx.strokeStyle = rgba(C.tinta, 0.5 * (1 - ph)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 34 + ph * 40, 0, 7); ctx.stroke();
  const a = ease.o(clamp((k - 0.25) * 2));
  ctx.save(); ctx.beginPath(); ctx.rect(x + 40, y - 70, 300 * a, 140); ctx.clip();
  texto(CFG.textos.dan, x + 44, y + 8, { px: 52, peso: 900, cor: C.tinta });
  ctx.fillStyle = C.ocre; ctx.fillRect(x + 44, y + 18, 196, 7);
  texto('norte de Israel', x + 44, y + 54, { px: 28, peso: 700, cor: C.tinta });
  ctx.restore();
}

// ================================================================ CARIMBO em cartucho (tinta terracota com falhas)
let _carimbo = null;
function carimboImg() {
  if (_carimbo) return _carimbo;
  const c = canvas(800, 240), g = c.getContext('2d'); g.translate(400, 120);
  g.strokeStyle = C.terracota; g.fillStyle = C.terracota; g.lineWidth = 12; g.lineJoin = 'round';
  g.stroke(new Path2D(VET.cartucho)); g.fill(new Path2D(VET.cartuchoBarra));
  g.lineWidth = 3.5; g.stroke(new Path2D('M -290 -46 L 290 -46 C 326 -46 326 46 290 46 L -290 46 C -326 46 -326 -46 -290 -46 Z'));
  let px = 64; g.font = fonte(px, 'ui', 900); g.letterSpacing = '3px'; while (g.measureText(CFG.textos.carimbo).width > 570) { px -= 1; g.font = fonte(px, 'ui', 900); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(CFG.textos.carimbo, 0, 3);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-out'; const R = mulberry32(77);
  for (let i = 0; i < 1400; i++) { g.globalAlpha = 0.25 + R() * 0.6; g.beginPath(); g.arc(R() * 800, R() * 240, 0.5 + R() * R() * 3.5, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { g.globalAlpha = 0.5; g.fillRect(R() * 800, R() * 240, 30 + R() * 60, 1.5); }
  _carimbo = c; return c;
}
// k: −1..0 descendo; 0 = impacto; >0 assentado
function carimbo(x, y, rot, kImpacto) {
  if (kImpacto < -0.07) return;
  const s = kImpacto < 0 ? lerp(1.0, 1.25, -kImpacto / 0.07) : 1 + Math.exp(-kImpacto * 30) * 0.06 * Math.cos(kImpacto * 60);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = kImpacto < 0 ? 0.0 : 0.94; ctx.drawImage(carimboImg(), -400, -120); ctx.restore();
  if (kImpacto < 0) {                                 // o carimbo (bloco de madeira) descendo, antes de tocar o papel
    ctx.save(); ctx.translate(x, y - 60 * (-kImpacto / 0.07)); ctx.rotate(rot); ctx.scale(s * 0.92, s * 0.92);
    peca('M -350 -60 L 350 -60 L 350 40 L -350 40 Z', C.terra, { lw: 5, tex: 0.7 }); peca('M -60 -60 L 60 -60 L 44 -170 C 44 -196 -44 -196 -44 -170 Z', shade(C.terra, -0.15), { lw: 5 });
    ctx.restore();
  }
}

// ================================================================ ROLO DE PAPIRO que se desenrola
let _folhaTitulo = null;
function rolo(cx, cy, k, conteudo) {                 // k 0 (fechado) → 1 (aberto); conteudo() desenha o texto da folha
  const Wf = 940, Hf = 620, w = lerp(0, Wf, ease.io(k)), x0 = cx - w / 2;
  if (!_folhaTitulo) { _folhaTitulo = canvas(Wf, Hf); pintaPapiro(_folhaTitulo.getContext('2d'), Wf, Hf, 12, C.papiroClaro); }
  if (w > 2) {
    ctx.save(); ctx.shadowColor = 'rgba(45,22,6,0.36)'; ctx.shadowBlur = 16; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 12;
    ctx.fillStyle = C.papiroClaro; ctx.fillRect(x0, cy - Hf / 2, w, Hf); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, cy - Hf / 2, w, Hf); ctx.clip();
    ctx.drawImage(_folhaTitulo, cx - Wf / 2, cy - Hf / 2); conteudo();
    ctx.restore();
    ctx.strokeStyle = C.tinta; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, cy - Hf / 2); ctx.lineTo(x0 + w, cy - Hf / 2); ctx.moveTo(x0, cy + Hf / 2); ctx.lineTo(x0 + w, cy + Hf / 2); ctx.stroke();
  }
  // os dois rolos (cilindros) com listras que giram (stepped) e pomos de madeira
  const giro = on2(k * 2.2) * 40;
  for (const sx of [-1, 1]) {
    const rx = cx + sx * (w / 2) + sx * (6 + 30 * (1 - k)), rw = 92 - 52 * ease.o(k);
    ctx.save(); ctx.translate(rx, cy);
    peca(`M ${-rw / 2} -330 L ${rw / 2} -330 L ${rw / 2} 330 L ${-rw / 2} 330 Z`, C.papiro, { lw: 4 });
    ctx.save(); ctx.beginPath(); ctx.rect(-rw / 2, -330, rw, 660); ctx.clip(); ctx.strokeStyle = rgba(C.fibra, 0.55); ctx.lineWidth = 2;
    for (let i = -3; i < 4; i++) { const xx = ((i * 14 + giro * sx) % (rw + 14) + rw + 14) % (rw + 14) - rw / 2; ctx.beginPath(); ctx.moveTo(xx, -330); ctx.lineTo(xx, 330); ctx.stroke(); }
    ctx.restore();
    peca('M -11 -372 L 11 -372 L 9 -330 L -9 -330 Z', C.terracota, { lw: 3.4 }); peca('M -9 330 L 9 330 L 11 372 L -11 372 Z', C.terracota, { lw: 3.4 });
    ctx.restore();
  }
}
// faixa decorativa de hieróglifos (sem tradução) e linhas de registro
function faixaHieroglifos(x0, x1, y, px, seed, cor = C.tinta, alpha = 0.55) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = fonte(px, 'hier', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = cor;
  let i = 0; for (let x = x0 + px * 0.6; x < x1 - px * 0.4; x += px * 1.15) { ctx.fillText(HIER_DECOR[Math.floor(rnd(seed, i++) * HIER_DECOR.length)], x, y); }
  ctx.restore();
}
function registro(x0, x1, y) {                       // linhas de registro do mural (duas faixas finas de pigmento)
  ctx.fillStyle = C.lapis; ctx.fillRect(x0, y - 6, x1 - x0, 6); ctx.fillStyle = C.ocre; ctx.fillRect(x0, y + 2, x1 - x0, 5);
  ctx.fillStyle = C.tinta; ctx.fillRect(x0, y - 7, x1 - x0, 1.6); ctx.fillRect(x0, y + 7, x1 - x0, 1.6);
}

// friso do mural: linha de registro + faixa de sinais decorativos (abaixo da área de 180 px do topo)
function friso(y, dx = 0, seed = 40) {
  registro(-20, W + 20, y - 34); ctx.save(); ctx.translate(dx % 40, 0); faixaHieroglifos(-40, W + 40, y, 40, seed, C.tinta, 0.42); ctx.restore(); registro(-20, W + 20, y + 34);
}
