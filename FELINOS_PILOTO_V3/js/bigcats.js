// Grandes felinos em perfil (olhando para +x) no estilo do exemplo do usuário: vetor chapado SEM contorno,
// 2–3 tons (pernas do lado oposto mais escuras, ventre claro, sombra plana na anca e atrás do ombro),
// cabeça pequena, peito fundo, cintura fina, pernas longas e esguias, cauda longa. Rosto mínimo.
'use strict';
const SPEC = {
  jaguar: { // a mais robusta das três: pernas um pouco mais curtas, cabeça larga, cauda mais curta
    S: [118, -236], H: [-150, -244], fl: [104, 108], hl: [108, 106], fr: [30, 19, 14], hr: [40, 22, 14],
    pastern: [8, 24], meta: [20, 60], paw: [22, 11], homeF: 128, homeH: -128, stride: 140, lift: 34,
    torso: [[96, -322], [20, -312], [-70, -306], [-150, -318], [-196, -296], [-212, -248], [-196, -196], [-160, -170], [-118, -178], [-60, -184], [20, -176], [92, -164], [146, -174], [184, -214], [184, -266], [150, -304]],
    neck: [[136, -268], [214, -298], 54, 44], headAt: [220, -306], headS: 1.04, tail: { root: [-200, -296], len: 230, r: 11, droop: 0.9 }, mz: -4,
    c: { base: '#E7B44E', dark: '#C99236', far: '#C3923C', belly: '#F4DDA6', mark: '#7A4E22', ring: '#9A6A2C', nose: '#5A3424' },
  },
  tiger: { // o maior: corpo longo e alto, laranja, listras laranja-escuras finas e curvas, ventre claro
    S: [150, -262], H: [-182, -270], fl: [116, 120], hl: [120, 118], fr: [33, 21, 15], hr: [44, 24, 15],
    pastern: [8, 26], meta: [22, 66], paw: [24, 12], homeF: 160, homeH: -150, stride: 160, lift: 38,
    torso: [[124, -360], [30, -350], [-80, -346], [-180, -356], [-234, -330], [-248, -276], [-232, -218], [-194, -188], [-146, -200], [-72, -206], [30, -196], [116, -182], [176, -194], [214, -240], [214, -298], [182, -340]],
    neck: [[172, -294], [250, -330], 54, 44], headAt: [258, -338], headS: 0.95, tail: { root: [-238, -330], len: 330, r: 11, droop: 0.95 }, mz: 4,
    c: { base: '#E8743A', dark: '#C85A2A', far: '#C25A2C', belly: '#F6D8B8', mark: '#A8401E', ring: '#000', nose: '#7A3428' },
  },
  lion: { // pernas longas, pelagem lisa, juba volumosa caindo sobre o peito, tufo escuro na cauda
    S: [140, -270], H: [-170, -276], fl: [120, 124], hl: [124, 120], fr: [33, 20, 15], hr: [44, 23, 15],
    pastern: [8, 26], meta: [22, 66], paw: [24, 12], homeF: 150, homeH: -140, stride: 160, lift: 38,
    torso: [[110, -366], [20, -352], [-80, -350], [-170, -360], [-222, -336], [-236, -282], [-220, -222], [-180, -194], [-134, -210], [-60, -216], [30, -206], [112, -192], [172, -204], [206, -250], [204, -306], [170, -348]],
    neck: [[164, -300], [238, -338], 56, 46], headAt: [246, -346], headS: 1.0, tail: { root: [-226, -334], len: 320, r: 9, droop: 1.05 }, mz: 10,
    c: { base: '#E0912E', dark: '#BF7322', far: '#B86E22', belly: '#F1C987', mark: '#6A3B1C', ring: '#000', nose: '#4A2A18', mane: '#6E3E1E', maneLight: '#8A5226' },
  },
};
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
const rot2 = (v, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
/** forma chapada sem contorno */
function flat(g, pts, fill, n = 8) { const p = smooth(pts, true, n); g.beginPath(); trace(g, p); g.fillStyle = fill; g.fill(); return p; }
function footAt(home, ph, sp, mv, rest) {
  const q = ((ph % 1) + 1) % 1; let x, y, fold = 0;
  if (q < 0.6) { x = lerp(sp.stride / 2, -sp.stride / 2, q / 0.6); y = 0; }
  else { const k = (q - 0.6) / 0.4, e = k * k * (3 - 2 * k); x = lerp(-sp.stride / 2, sp.stride / 2, e); y = -sp.lift * Math.sin(k * Math.PI); fold = Math.sin(k * Math.PI); }
  return { x: home + x * mv + rest * (1 - mv), y: y * mv, fold: fold * mv, stance: q < 0.6 ? Math.sin((q / 0.6) * Math.PI) : 0 };
}
function catLegs(sp, walk, mv, bob) {
  const L = [{ front: false, near: true, o: 0, rest: -14 }, { front: true, near: true, o: 0.25, rest: 16 }, { front: false, near: false, o: 0.5, rest: 20 }, { front: true, near: false, o: 0.75, rest: -24 }];
  return L.map((l) => {
    const ft = footAt(l.front ? sp.homeF : sp.homeH, walk + l.o, sp, mv, l.rest), dx = l.near ? 0 : 14;
    const root = add2(l.front ? sp.S : sp.H, [dx, l.front ? bob[0] : bob[1]]), P = [ft.x + dx, ft.y];
    if (l.front) { const W2 = [P[0] - sp.pastern[0], P[1] - sp.pastern[1]], E = ik2(root, W2, sp.fl[0], sp.fl[1], 1); return { ...l, b: [root, E, W2, add2(W2, rot2(sp.pastern, ft.fold * 75))], R: sp.fr, stance: ft.stance }; }
    const Hk = [P[0] - sp.meta[0], P[1] - sp.meta[1]], K = ik2(root, Hk, sp.hl[0], sp.hl[1], -1);
    return { ...l, b: [root, K, Hk, add2(Hk, rot2(sp.meta, -ft.fold * 30))], R: sp.hr, stance: ft.stance };
  });
}
function legPoly(l, sp) { const b = l.b, pawC = [b[3][0] + sp.paw[0] * 0.3, b[3][1] - sp.paw[1]]; return { leg: limb([b[0], b[1], b[2], pawC], [...l.R, sp.paw[1] * 1.0]), paw: ell(pawC[0] + 5, pawC[1] + 1, sp.paw[0], sp.paw[1], 10) }; }
function blobAt(g, x, y, r, seed, n = 7, sq = 0.85) { const p = []; for (let j = 0; j < n; j++) { const a = (j / n) * 6.283; p.push([x + Math.cos(a) * r * (0.8 + 0.3 * rnd(seed, j)), y + Math.sin(a) * r * sq * (0.8 + 0.3 * rnd(seed, j + 50))]); } g.beginPath(); trace(g, smooth(p, true, 5)); g.fill(); }
function curveStripe(g, pts, w) { const P = smooth(pts, false, 5), R = P.map((_, i) => w * Math.sin(Math.PI * (0.06 + 0.88 * i / (P.length - 1))) + 0.3); g.beginPath(); trace(g, smooth(limb(P, R), true, 1)); g.fill(); }
/** roseta da onça: anel pequeno (aberto em 1 ou 2 pontos) com ponto no centro */
function ringRosette(g, x, y, r, seed, c) {
  g.strokeStyle = c.ring; g.lineWidth = r * 0.42; g.lineCap = 'round';
  const gap = rnd(seed, 1) * 6.28; g.beginPath(); g.ellipse(x, y, r, r * 0.86, rnd(seed, 2), gap + 0.5, gap + 6.283 - 0.3 - rnd(seed, 3) * 0.6); g.stroke();
  g.fillStyle = c.mark; g.beginPath(); g.arc(x + (rnd(seed, 4) - 0.5) * r * 0.3, y, r * 0.22, 0, 6.283); g.fill();
}

/** look: { tint, tintA, dark (contraluz), rim, rimDx, rimDy } */
function drawBigCat(ctx, kind, pose, t, look = {}) {
  const sp = SPEC[kind], c = sp.c, walk = pose.walk || 0, mv = pose.moving ?? 0, fl = pose.flip ? -1 : 1, S = pose.s;
  const bob = [mv * 4 * Math.sin((walk + 0.1) * Math.PI * 4), mv * 3.5 * Math.sin((walk + 0.35) * Math.PI * 4)];
  const legs = catLegs(sp, walk, mv, bob), nf = legs.find((l) => l.front && l.near);
  const [lc, g] = layer('cat');
  g.translate(pose.x, pose.y); g.scale(S * fl, S);
  g.fillStyle = 'rgba(40,20,40,0.22)'; g.beginPath(); g.ellipse(-10, 4, sp.stride + 160, 14, 0, 0, 6.283); g.fill();
  // cauda (longa e fina; tufo no leão; anéis na ponta da onça; listras no tigre)
  const tr = sp.tail, sw = Math.sin((pose.tail ?? t) * 2.0), sw2 = Math.sin((pose.tail ?? t) * 2.0 - 1.1), r0 = add2(tr.root, [0, bob[1]]), L = tr.len, d = tr.droop;
  const tc = smooth([r0, [r0[0] - L * 0.14, r0[1] + L * 0.38 * d + sw * 4], [r0[0] - L * 0.26, r0[1] + L * 0.72 * d + sw * 10], [r0[0] - L * 0.46, r0[1] + L * 0.86 * d + sw2 * 16], [r0[0] - L * 0.66, r0[1] + L * 0.74 * d + sw2 * 26], [r0[0] - L * 0.78, r0[1] + L * 0.58 * d + sw2 * 34]], false, 4);
  const tailP = flat(g, limb(tc, tc.map((_, i) => lerp(tr.r * 1.25, tr.r * 0.7, i / (tc.length - 1)))), c.base, 2);
  clipTo(g, tailP, () => {
    g.fillStyle = c.dark; g.beginPath(); trace(g, smooth(limb(tc, tc.map(() => tr.r * 0.5)).map((p) => [p[0] + 3, p[1] + 5]), true, 2)); g.fill();
    if (kind === 'jaguar') { g.fillStyle = c.mark; for (let i = Math.floor(tc.length * 0.55); i < tc.length; i += 3) { const a = tc[i], b = tc[Math.min(tc.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; g.save(); g.translate(a[0], a[1]); g.rotate(an); g.fillRect(-20, -3.5, 40, 7); g.restore(); } for (let i = 2; i < tc.length * 0.5; i += 3) ringRosette(g, tc[i][0], tc[i][1], 6, 900 + i, c); }
    if (kind === 'tiger') { g.fillStyle = c.mark; for (let i = 3; i < tc.length; i += 3) { const a = tc[i], b = tc[Math.min(tc.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; curveStripe(g, [[a[0] - Math.cos(an) * 20, a[1] - Math.sin(an) * 20], [a[0] + 3, a[1]], [a[0] + Math.cos(an) * 20, a[1] + Math.sin(an) * 20]], 4); } }
  });
  if (kind === 'lion') { const e = tc[tc.length - 1], e2 = tc[tc.length - 3]; g.fillStyle = c.mane; g.beginPath(); trace(g, smooth([[e2[0], e2[1] - 6], [e[0] - 4, e[1] - 16], [e[0] - 22, e[1] + 4], [e[0] - 8, e[1] + 24], [e2[0] + 4, e2[1] + 8]], true, 5)); g.fill(); }
  // pernas do lado oposto: tom escuro
  legs.filter((l) => !l.near).forEach((l) => { const P = legPoly(l, sp); flat(g, P.leg, c.far, 3); flat(g, P.paw, c.far); });
  // pescoço + tronco
  flat(g, limb([sp.neck[0], add2(sp.neck[1], [0, bob[0]])], [sp.neck[2], sp.neck[3]]), c.base);
  const torsoPts = sp.torso.map((p, i) => [p[0], p[1] + bob[0] * (p[0] > 40 ? 1 : 0) + bob[1] * (p[0] < -100 ? 1 : 0) - (i === 0 ? 8 * nf.stance * mv : 0)]);
  const torso = flat(g, torsoPts, c.base);
  // pernas do lado próximo (mesma cor do corpo: emendam sem costura)
  const nearP = legs.filter((l) => l.near).map((l) => ({ l, ...legPoly(l, sp) }));
  nearP.forEach((P) => { flat(g, P.leg, c.base, 3); flat(g, P.paw, c.base); });
  // tons: ventre claro, sombra plana na anca e atrás do ombro, perna próxima com sombra na parte de trás
  clipTo(g, torso, () => {
    g.fillStyle = c.belly; g.beginPath(); trace(g, smooth([[-200, sp.H[1] + 70], [-120, sp.H[1] + 62], [0, sp.S[1] + 58], [120, sp.S[1] + 64], [200, sp.S[1] + 30], [220, 0], [-220, 0]], true, 6)); g.fill();
    g.fillStyle = c.dark;
    g.beginPath(); trace(g, smooth([[sp.H[0] - 70, sp.H[1] - 20], [sp.H[0] - 30, sp.H[1] + 10], [sp.H[0] + 10, sp.H[1] + 70], [sp.H[0] - 80, sp.H[1] + 90]], true, 6)); g.fill();
    g.beginPath(); trace(g, smooth([[sp.S[0] - 46, sp.S[1] - 40], [sp.S[0] - 30, sp.S[1] + 10], [sp.S[0] - 20, sp.S[1] + 70], [sp.S[0] - 64, sp.S[1] + 60]], true, 6)); g.fill();
  });
  nearP.forEach((P) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.fillStyle = c.dark; g.beginPath(); trace(g, smooth(limb([b[0], b[1], b[2]], P.l.R.map((r) => r * 0.55)).map((p) => [p[0] + (P.l.front ? -14 : -18), p[1] + 6]), true, 3)); g.fill(); }));
  // pelagem
  const marks = (fn) => { clipTo(g, torso, fn); nearP.forEach((P) => clipTo(g, smooth(P.leg, true, 3), () => fn(P))); };
  if (kind === 'jaguar') {
    clipTo(g, torso, () => { let k = 0; for (let gy = sp.S[1] - 74, row = 0; gy <= sp.S[1] + 64; gy += 26, row++) for (let gx = -236 + (row % 2) * 15; gx <= 200; gx += 30) { k++; const x = gx + (rnd(k, 1) - 0.5) * 10, y = gy + (rnd(k, 2) - 0.5) * 8; if (gy > sp.S[1] + 40) { g.fillStyle = c.mark; blobAt(g, x, y, 4 + rnd(k, 3) * 2, k); } else ringRosette(g, x, y, 8 + rnd(k, 4) * 2.5, k, c); } });
    nearP.forEach((P, i) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.fillStyle = c.mark; for (let n = 0; n < 12; n++) { const s = n / 12, seg = s < 0.5 ? [b[0], b[1], s / 0.5] : [b[1], b[2], (s - 0.5) / 0.5]; blobAt(g, lerp(seg[0][0], seg[1][0], seg[2]) + (rnd(i * 13, n) - 0.5) * 22 * (1 - s * 0.6), lerp(seg[0][1], seg[1][1], seg[2]), 3.5 + rnd(n, i) * 1.5, i * 50 + n); } }));
  }
  if (kind === 'tiger') {
    clipTo(g, torso, () => { g.fillStyle = c.mark; for (let i = 0; i < 17; i++) { const x = -236 + i * 27 + (rnd(i, 1) - 0.5) * 8, top = sp.S[1] - 100, len = 70 + rnd(i, 4) * 60, w = 3 + rnd(i, 2) * 2.5, lean = -10 - rnd(i, 8) * 16; curveStripe(g, [[x, top], [x + lean * 0.3 + 4, top + len * 0.5], [x + lean, top + len]], w); if (rnd(i, 30) > 0.55) curveStripe(g, [[x + 6, top + len * 0.45], [x + 14, top + len * 0.7], [x + 18 + lean * 0.2, top + len * 0.9]], w * 0.7); } });
    nearP.forEach((P, i) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.fillStyle = c.mark; [[0, 1, [0.35, 0.6, 0.85]], [1, 2, [0.3]]].forEach(([u, v, ks]) => ks.forEach((kk, n) => { const x = lerp(b[u][0], b[v][0], kk), y = lerp(b[u][1], b[v][1], kk), a = Math.atan2(b[v][1] - b[u][1], b[v][0] - b[u][0]) + Math.PI / 2, Lh = (u === 0 ? 40 : 22), dx = Math.cos(a) * Lh, dy = Math.sin(a) * Lh; curveStripe(g, [[x - dx, y - dy], [x + 3, y + 3], [x + dx * 0.5, y + dy * 0.5]], 3); })); }));
  }
  // pinceladas (textura pintada à mão, presa ao corpo)
  brushStrokes(g, [-260, sp.S[1] - 110, 230, 10], { seed: kind.length * 17, n: 260, len: 30, w: 5, ang: 0.12 });
  // cabeça
  const ha = add2(sp.headAt, [0, bob[0]]), hr = (pose.headRot || 0) * Math.PI / 180;
  g.save(); g.translate(ha[0], ha[1]); g.rotate(hr); g.scale(sp.headS, sp.headS);
  catHead(g, kind, sp, pose, t);
  brushStrokes(g, [-120, -90, 150, 70], { seed: kind.length * 23, n: 70, len: 16, w: 3.5, ang: -0.2 });
  g.restore();
  // luz da cena
  if (look.dark) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = look.dark; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  if (look.tint) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = look.tintA ?? 0.15; g.fillStyle = look.tint; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lc, 0, 0);
  if (look.rim) { const [rc, rg] = layer('catRim'); rg.drawImage(lc, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(lc, -(look.rimDx ?? -7), -(look.rimDy ?? -6)); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = look.rim; rg.fillRect(0, 0, W, H); ctx.drawImage(rc, 0, 0); }
  ctx.restore();
}

function catHead(g, kind, sp, pose, t) {
  const c = sp.c, mz = sp.mz, jaw = pose.jaw || 0, lion = kind === 'lion', tiger = kind === 'tiger';
  if (lion) { // juba volumosa: massa escura que desce sobre o peito, mechas mais claras por cima
    const sw = Math.sin(t * 1.4) * 3;
    flat(g, [[30, -78], [-30, -86], [-84, -60], [-112, 0], [-108, 70], [-82, 140 + sw], [-40, 196 + sw], [6, 176], [40, 120], [62, 60], [40, 20], [56, -30]], c.mane, 8);
    g.fillStyle = c.maneLight;
    [[[-10, -70], [-70, -30], [-86, 60], [-60, 130 + sw]], [[10, -60], [-40, -10], [-40, 80], [-16, 160 + sw]], [[30, -40], [-6, 10], [10, 70], [20, 120]]].forEach((pts, i) => curveStripe(g, pts, 9 - i * 2));
  }
  // orelha pequena e arredondada
  flat(g, [[-46, -40], [-42, -62], [-30, -72, 1], [-16, -64], [-12, -46]], tiger ? c.dark : c.base, 5);
  g.fillStyle = tiger ? '#F6E6D6' : c.dark; g.beginPath(); g.ellipse(-30, -56, 6, 9, -0.3, 0, 6.283); g.fill();
  const ja = jaw * 30 * Math.PI / 180;
  if (jaw > 0.03) flat(g, [[14, 26], [112 + mz, 16], [106 + mz, 30 + 38 * jaw], [66, 48 + 32 * jaw], [24, 42]], '#6A2630', 6);
  flat(g, tf(smooth([[6, 26], [112 + mz, 18], [118 + mz, 28], [98 + mz, 42], [56, 50], [14, 50]], true, 6).map((p) => [p[0] - 10, p[1] - 26]), 10, 26, ja), c.belly, 1);
  if (jaw > 0.03) { g.fillStyle = '#C9566A'; g.beginPath(); g.ellipse(62, 36 + 22 * jaw, 28, 7, 0.35 * jaw, 0, 6.283); g.fill(); g.fillStyle = '#FBF5EA'; g.beginPath(); g.moveTo(98 + mz, 16); g.lineTo(104 + mz, 38); g.lineTo(110 + mz, 17); g.fill(); }
  // crânio + focinho: perfil esguio
  const head = flat(g, [[-60, 26], [-62, -10], [-46, -44], [-10, -60], [30, -56], [64, -42], [98 + mz * 0.6, -30], [124 + mz, -20], [134 + mz, -7, 1], [130 + mz, 7], [116 + mz, 18], [90 + mz * 0.6, 26], [48, 34], [0, 42]], c.base, 8);
  clipTo(g, head, () => {
    g.fillStyle = c.dark; g.beginPath(); trace(g, smooth([[-60, 0], [-20, -10], [10, 20], [-10, 60], [-70, 50]], true, 6)); g.fill();       // bochecha na sombra
    g.fillStyle = c.belly; g.beginPath(); trace(g, smooth([[60, 4], [96 + mz, -6], [140 + mz, 4], [124 + mz, 30], [56, 40], [30, 30]], true, 6)); g.fill();
    if (tiger) { g.fillStyle = c.mark; [[-40, -50, -30, -10], [-18, -58, -8, -28], [4, -60, 12, -38], [24, -56, 30, -42]].forEach(([x0, y0, x1, y1]) => curveStripe(g, [[x0, y0], [(x0 + x1) / 2 - 2, (y0 + y1) / 2], [x1, y1]], 3.5)); [[-60, 6, -14, 0], [-58, 22, -12, 16]].forEach(([x0, y0, x1, y1]) => curveStripe(g, [[x0, y0], [(x0 + x1) / 2, y0 - 3], [x1, y1]], 3.5)); }
    if (kind === 'jaguar') { g.fillStyle = c.mark; [[-30, -30], [-12, -44], [8, -48], [26, -40], [-36, -6], [-16, -14], [40, -22]].forEach(([x, y], i) => blobAt(g, x, y, 3.5 + rnd(i, 1) * 1.5, 70 + i)); }
  });
  // olho: traço curto (sereno), aberto no rugido
  g.strokeStyle = '#3A2418'; g.lineCap = 'round'; g.lineWidth = 3.4;
  if (jaw > 0.3) { g.fillStyle = '#3A2418'; g.beginPath(); g.ellipse(66, -26, 7, 4, -0.15, 0, 6.283); g.fill(); }
  else { const bl = pose.blink || 0; g.beginPath(); g.moveTo(56, -26 + bl * 2); g.quadraticCurveTo(66, -22 + bl * 4, 76, -27); g.stroke(); }
  // nariz e boca
  g.fillStyle = c.nose; g.beginPath(); trace(g, smooth([[120 + mz, -18], [136 + mz, -12, 1], [134 + mz, -1, 1], [122 + mz, -4]], true, 4)); g.fill();
  if (jaw < 0.03) { g.lineWidth = 2.4; g.beginPath(); g.moveTo(132 + mz, 3); g.quadraticCurveTo(122 + mz, 18, 98 + mz * 0.6, 20); g.stroke(); }
}
