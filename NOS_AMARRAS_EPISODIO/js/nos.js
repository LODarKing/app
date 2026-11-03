// Desenhos de nós (pontos de controle). Cada desenho foi conferido no laboratório (node render.mjs --lab):
// número de cruzamentos, sequência por cima/por baixo e ausência de cruzamento desnecessário.
const NOS = {};
const tf = (pts, s, dx, dy, cx = 540, cy = 600) => pts.map(([x, y]) => [cx + (x - cx) * s + dx, cy + (y - cy) * s + dy]);

// Nó oito (Ashley nº 520), solto. Topologia: parte fixa desce; a volta inferior sobe pela direita e cruza POR CIMA
// da parte fixa (c1); a ponta contorna a parte fixa POR TRÁS (c2), entra na volta por cima (c3) e sai por baixo (c4).
// Diagrama alternado reduzido com 4 cruzamentos = nó oito.
NOS.oitoPontos = () => [
  [540, -80], [540, 120], [540, 300], [540, 450], [545, 580], [585, 700], [690, 762], [800, 705], [832, 565], [788, 450], [684, 412],
  [560, 455], [440, 532], [366, 498], [348, 410], [398, 330], [480, 298], [600, 292], [705, 302], [782, 352], [742, 452], [698, 548], [668, 660], [660, 860],
];
// gancho: nó oito + a ponta que segue para o título (sublinha "NÓS E", vira e sublinha "AMARRAS")
NOS.ganchoPontos = () => {
  const k = tf(NOS.oitoPontos(), 1.05, 0, -30).slice(0, -1);
  return [...k, [676, 836], [640, 912], [520, 932], [250, 932], [150, 968], [118, 1050], [140, 1126], [220, 1150], [560, 1150], [905, 1150], [962, 1184], [966, 1262], [905, 1300], [520, 1300], [206, 1300], [132, 1328], [124, 1394], [182, 1422], [236, 1422], [284, 1422], [330, 1422]];
};
NOS.gancho = () => corda(NOS.ganchoPontos(), { w: 44, cache: 'gancho' });
NOS.oito = () => corda(tf(NOS.oitoPontos(), 1.05, 0, -30), { w: 44, cache: 'oito' });

// ================================================================= nós do vocabulário e das amarras
// Trevo (nó simples / nó superior), na forma paramétrica clássica: x = sen t + 2 sen 2t, y = cos t − 2 cos 2t,
// z = −sen 3t. Três cruzamentos alternados. Abrimos o laço inferior (t = π) e penduramos as duas pontas.
NOS.trevo = (t) => [Math.sin(t) + 2 * Math.sin(2 * t), -(Math.cos(t) - 2 * Math.cos(2 * t)), -Math.sin(3 * t)];
NOS.centroSuperior = (cx, cy, esc, delta = 0.62, cauda = 4.2) => {
  const pts = [], T = (t) => { const [x, y, z] = NOS.trevo(t); return [cx + x * esc, cy + y * esc, z]; };
  const a = Math.PI + delta, b = 3 * Math.PI - delta, ia = T(a), ib = T(b);
  pts.push([ia[0] + 0.12 * esc, cy + cauda * esc, 0], [ia[0] + 0.06 * esc, ia[1] + 0.9 * esc, 0]);
  for (let k = 0; k <= 60; k++) pts.push(T(a + (b - a) * k / 60));
  pts.push([ib[0] - 0.06 * esc, ib[1] + 0.9 * esc, 0], [ib[0] - 0.12 * esc, cy + cauda * esc, 0]);
  return pts;
};
// nó simples numa corda só (parte fixa à direita, chicote à esquerda)
NOS.superior = (cx = 540, cy = 640, esc = 92, w = 40) => corda(NOS.centroSuperior(cx, cy, esc), { w, padrao: 'z', amostras: 6 });
// caminho dobrado: segue o centro com deslocamento ±d (as duas pernas paralelas não se cruzam),
// e os cruzamentos herdam o z do centro (as duas pernas de cima passam juntas por cima)
function dobra(centro, d, volta) {
  const dense = catmull(centro, 10), ida = [], vol = [];
  for (let i = 0; i < dense.length; i++) {
    const a = dense[Math.max(0, i - 1)], b = dense[Math.min(dense.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1, nx = -ty / m, ny = tx / m;
    ida.push([dense[i][0] + nx * d, dense[i][1] + ny * d, dense[i][2]]); vol.push([dense[i][0] - nx * d, dense[i][1] - ny * d, dense[i][2]]);
  }
  return { ida, vol: vol.reverse(), volta };
}
// alça de azelha: o mesmo nó simples feito com o seio. A ponta do seio vira a alça (fixa).
NOS.azelhaPontos = (cx = 540, cy = 560, esc = 104, w = 34) => {
  const c = NOS.centroSuperior(cx, cy, esc, 0.62, 3.2);
  const fimC = c[c.length - 1]; c.pop();
  const { ida, vol } = dobra(c, w * 0.62);
  const p = ida[ida.length - 1], q = vol[0];
  // a alça: um laço redondo que continua a direção da perna do seio (para baixo), sem cruzar nada
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, R = 0.95 * esc, ccx = mx - 0.15 * esc, ccy = my + 0.25 * esc + R;
  const aP = Math.atan2(p[1] - ccy, p[0] - ccx), aQ = Math.atan2(q[1] - ccy, q[0] - ccx);
  let a0 = aP, a1 = aQ; if (a1 > a0) a1 -= 2 * Math.PI;                 // percorre pelo lado de baixo
  const alca = []; for (let i = 1; i < 14; i++) { const an = lerp(a0, a1, i / 14), rr_ = R * (1 + 0.12 * Math.sin(Math.PI * i / 14)); alca.push([ccx + Math.cos(an) * rr_, ccy + Math.sin(an) * rr_, 0]); }
  return [...ida.filter((_, i) => i % 2 === 0), ...alca, ...vol.filter((_, i) => i % 2 === 0)];
};
NOS.azelha = () => corda(NOS.azelhaPontos(), { w: 34, padrao: 'z', amostras: 4, cache: 'azelha' });
// nó de fita (curva = nó de união): nó simples na corda A; a corda B refaz o mesmo caminho ao contrário.
// Uma corda só no motor, com um "conector" invisível fora da tela entre o fim de A e o começo de B.
NOS.fitaPontos = (cx = 540, cy = 640, esc = 88, w = 30) => {
  const c = NOS.centroSuperior(cx, cy, esc, 0.62, 2.8);          // caudas curtas (mas abaixo do laço): os chicotes ficam curtos
  const { ida, vol } = dobra(c, w * 0.62);
  const A = ida.filter((_, i) => i % 2 === 0), B = vol.filter((_, i) => i % 2 === 0);
  // partes fixas longas: A começa lá embaixo (direita); B começa lá embaixo (esquerda)
  // prolonga cada parte fixa na mesma direção da cauda (paralela ao chicote vizinho: não cruza)
  const ext = (p0, p1) => { const dx = p0[0] - p1[0], dy = p0[1] - p1[1], m = Math.hypot(dx, dy); return [[p0[0] + dx / m * 3.2 * esc, p0[1] + dy / m * 3.2 * esc, 0], [p0[0] + dx / m * 1.4 * esc, p0[1] + dy / m * 1.4 * esc, 0]]; };
  const Aext = ext(A[0], A[3]), Bext = ext(B[0], B[3]);
  const fimA = A[A.length - 1];
  const con = [[fimA[0] - 0.05 * esc, fimA[1] + 0.25 * esc, 0], [fimA[0] - 2 * esc, 2700, 0], [Bext[0][0] - 2 * esc, 2700, 0]];
  return { pts: [...Aext, ...A, ...con, ...Bext, ...B], fimA, iniB: Bext[0] };
};
NOS.fita = (cx = 540, cy = 640, esc = 88) => {
  const key = `fita${cx},${cy},${esc}`, { pts, fimA, iniB } = NOS.fitaPontos(cx, cy, esc); const r = corda(pts, { w: 30, padrao: 'z', amostras: 4, cache: key });
  if (!r.faixasAB) {
    const perto = (p, de = 0) => { let bi = de, bd = 1e9; for (let i = de; i < r.n; i++) { const d = Math.hypot(r.X[i] - p[0], r.Y[i] - p[1]); if (d < bd) { bd = d; bi = i; } } return bi; };
    const ia = perto(fimA), ib = perto(iniB, ia + 10); r.faixasAB = [[0, ia * r.st], [ib * r.st, r.L]];
  }
  return r;
};
// seio, volta: formas simples com a mesma corda horizontal
NOS.reta = (y = 700, x0 = -120, x1 = 990) => [[x0, y, 0], [(x0 + x1) / 2, y, 0], [x1, y, 0]];
// volta do fiel em mastro VERTICAL (rotação do desenho em travessa horizontal):
// A (parte fixa) e C (chicote) passam por baixo da volta montada B, que cruza a frente do mastro em diagonal.
NOS.fielPontos = (cx = 540, cy = 760, R = 70, esc = 1) => {
  // desenho em travessa horizontal (eixo x), depois girado 90°: (x, y) -> (cy + (x - cx), cx - (y - cy)) ... feito abaixo
  const H = [
    [330, 1150, 1], [430, 1000, 1], [520, 860, 1], [552, 800, 1], [580, 740, 1],      // A: sobe pela frente
    [598, 716, 0], [612, 760, -1], [628, 840, -1], [640, 884, 0],                       // por trás (passa por cima e por baixo)
    [652, 860, 2], [585, 800, 2], [520, 740, 2],                                         // B: volta montada, diagonal por cima
    [502, 716, 0], [492, 790, -1], [500, 860, -1], [560, 890, -1], [596, 884, 0],        // por trás de novo, até o lado direito
    [604, 860, 1], [630, 800, 1], [660, 740, 1], [700, 660, 1], [790, 500, 1], [880, 340, 1],   // C: chicote sobe por baixo de B
  ];
  return H.map(([x, y, z]) => [cx + (y - 800) * esc, cy - (x - 590) * esc, z]);
};
NOS.fiel = (cx, cy, esc = 1) => corda(NOS.fielPontos(cx, cy, 70, esc), { w: 34 * esc, padrao: 'z', amostras: 10, cache: `fiel${cx},${cy},${esc}` });
