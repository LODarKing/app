// Grandes felinos em perfil (olhando para +x): onça-pintada, tigre, leão.
// Cada espécie tem proporções, cabeça e pelagem próprias; o rig (IK das pernas, caminhada em
// sequência lateral, escápula que rola, cauda, mandíbula) é comum. Sem contornos: forma por luz.
'use strict';
const SPEC = {
  jaguar: { // robusta, pernas curtas e grossas, cabeça grande e larga, cauda curta
    S: [118, -176], H: [-150, -186], fl: [74, 80], hl: [80, 78], fr: [38, 25, 19], hr: [50, 28, 18],
    pastern: [10, 26], meta: [24, 58], paw: [30, 15], homeF: 128, homeH: -128, stride: 120, lift: 34,
    torso: [[96, -274], [20, -264], [-70, -260], [-150, -270], [-200, -242], [-218, -190], [-202, -132], [-162, -106], [-118, -118], [-60, -122], [20, -112], [92, -100], [150, -112], [190, -160], [190, -216], [152, -254]],
    neck: [[140, -212], [222, -238], 64, 52], headAt: [228, -246], headS: 1.12, tail: { root: [-206, -238], len: 220, r: 17, droop: 0.95 },
    c: { base: '#D99A3A', light: '#F2C77C', dark: '#9A5E1C', belly: '#F7E9CF', mark: '#1C1208', rosette: '#B27426', nose: '#7E3F33', iris: '#D9A21C' },
  },
  tiger: { // o maior: corpo longo, laranja vivo, listras finas e irregulares, ventre e peito brancos
    S: [150, -200], H: [-178, -208], fl: [88, 94], hl: [94, 92], fr: [40, 26, 20], hr: [52, 29, 19],
    pastern: [10, 28], meta: [26, 64], paw: [32, 16], homeF: 160, homeH: -150, stride: 140, lift: 38,
    torso: [[124, -304], [30, -294], [-80, -290], [-178, -300], [-236, -270], [-250, -212], [-234, -150], [-192, -118], [-140, -134], [-70, -140], [30, -130], [118, -116], [180, -128], [222, -182], [222, -242], [184, -286]],
    neck: [[176, -236], [258, -270], 68, 56], headAt: [264, -278], headS: 1.16, tail: { root: [-238, -268], len: 300, r: 17, droop: 1.0 },
    c: { base: '#E7781F', light: '#FFAE55', dark: '#A84C0C', belly: '#FFF6EA', mark: '#140C06', rosette: '#000', nose: '#C9786E', iris: '#E9B932' },
  },
  lion: { // pernas mais longas, pelagem lisa cor de areia, juba, tufo escuro na cauda
    S: [140, -216], H: [-166, -222], fl: [94, 100], hl: [98, 96], fr: [38, 24, 18], hr: [48, 27, 18],
    pastern: [10, 28], meta: [26, 64], paw: [32, 16], homeF: 150, homeH: -138, stride: 140, lift: 38,
    torso: [[110, -316], [20, -302], [-80, -300], [-166, -310], [-222, -284], [-236, -226], [-220, -162], [-178, -132], [-130, -150], [-60, -158], [30, -148], [112, -134], [176, -146], [212, -200], [210, -258], [172, -300]],
    neck: [[166, -250], [242, -288], 70, 58], headAt: [250, -296], headS: 1.2, tail: { root: [-224, -282], len: 290, r: 15, droop: 1.15 },
    c: { base: '#C9934E', light: '#E9C287', dark: '#8A5A26', belly: '#EFD9AE', mark: '#3A2210', rosette: '#000', nose: '#6E3A2C', iris: '#C9921F' },
  },
};
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
const rot2 = (v, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

function footAt(home, ph, sp, mv, rest) {
  const q = ((ph % 1) + 1) % 1; let x, y, fold = 0;
  if (q < 0.6) { x = lerp(sp.stride / 2, -sp.stride / 2, q / 0.6); y = 0; }
  else { const k = (q - 0.6) / 0.4, e = k * k * (3 - 2 * k); x = lerp(-sp.stride / 2, sp.stride / 2, e); y = -sp.lift * Math.sin(k * Math.PI); fold = Math.sin(k * Math.PI); }
  return { x: home + x * mv + rest * (1 - mv), y: y * mv, fold: fold * mv, stance: q < 0.6 ? Math.sin((q / 0.6) * Math.PI) : 0 };
}
function catLegs(sp, walk, mv, bob) {
  const L = [{ front: false, near: true, o: 0, rest: -12 }, { front: true, near: true, o: 0.25, rest: 14 }, { front: false, near: false, o: 0.5, rest: 18 }, { front: true, near: false, o: 0.75, rest: -22 }];
  return L.map((l) => {
    const ft = footAt(l.front ? sp.homeF : sp.homeH, walk + l.o, sp, mv, l.rest), dx = l.near ? 0 : 16;
    const root = add2(l.front ? sp.S : sp.H, [dx, l.front ? bob[0] : bob[1]]), P = [ft.x + dx, ft.y];
    if (l.front) {
      const W2 = [P[0] - sp.pastern[0], P[1] - sp.pastern[1]], E = ik2(root, W2, sp.fl[0], sp.fl[1], 1);
      const Pp = add2(W2, rot2(sp.pastern, ft.fold * 75));
      return { ...l, bones: [root, E, W2, Pp], R: [sp.fr[0], sp.fr[1], sp.fr[2], sp.paw[1] * 1.05], stance: ft.stance, fold: ft.fold };
    }
    const Hk = [P[0] - sp.meta[0], P[1] - sp.meta[1]], K = ik2(root, Hk, sp.hl[0], sp.hl[1], -1);
    const Pp = add2(Hk, rot2(sp.meta, -ft.fold * 30));
    return { ...l, bones: [root, K, Hk, Pp], R: [sp.hr[0], sp.hr[1], sp.hr[2], sp.paw[1] * 1.05], stance: ft.stance, fold: ft.fold };
  });
}
function legPoly(l, sp) {
  const b = l.bones, pawC = [b[3][0] + sp.paw[0] * 0.25, b[3][1] - sp.paw[1]];
  return { leg: smooth(limbPts([b[0], b[1], b[2], pawC], l.R), true, 4), paw: smooth(ellipsePts(pawC[0] + 4, pawC[1] + 2, sp.paw[0], sp.paw[1] * 1.05, 12)), pawC };
}

/** cabeça em perfil (coordenadas locais) */
function catHead(g, kind, sp, o) {
  const c = sp.c, jaw = o.jaw || 0, lion = kind === 'lion', tiger = kind === 'tiger', jag = kind === 'jaguar';
  const mz = lion ? 6 : tiger ? 8 : 0;
  const upper = smooth([[-64, 30], [-68, -12], [-50, -50], [-12, -68], [34, -64], [70, -48], [104 + mz * 0.6, -34], [132 + mz, -24], [143 + mz, -9, 1], [139 + mz, 8], [124 + mz, 22], [96 + mz * 0.6, 30], [50, 40], [0, 48]], true, 8);
  const ja = jaw * 30 * Math.PI / 180;
  const lower = xform(smooth([[6, 30], [118 + mz, 22], [124 + mz, 33], [104 + mz, 48], [60, 56], [14, 56]], true, 8).map((p) => [p[0] - 10, p[1] - 30]), 10, 30, ja);
  return { upper, lower, ja, mz };
}

/** desenha um grande felino. pose: {x, y, s, flip, walk, moving, headRot, jaw, blink, tail}
 *  light: {key: cor de luz, rim: cor do contorno, rimDx, rimDy, shade: 0..1 (contraluz escurece), ambient} */
function drawBigCat(dst, kind, pose, t, light = {}) {
  const sp = SPEC[kind], c = sp.c;
  const walk = pose.walk || 0, mv = pose.moving ?? 0;
  const bob = [mv * 5 * Math.sin((walk + 0.1) * Math.PI * 4), mv * 4 * Math.sin((walk + 0.35) * Math.PI * 4)];
  const legs = catLegs(sp, walk, mv, bob);
  const fl = pose.flip ? -1 : 1, S = pose.s;
  const M = [S * fl, 0, 0, S, pose.x, pose.y];
  const setM = (g) => g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  const nf = legs.find((l) => l.front && l.near);
  const torso = smooth(sp.torso.map((p, i) => [p[0], p[1] + bob[0] * (p[0] > 40 ? 1 : 0) + bob[1] * (p[0] < -100 ? 1 : 0) - (i === 0 ? 10 * nf.stance * mv : 0)]), true, 8);
  const ha = add2(sp.headAt, [0, bob[0]]), hr = (pose.headRot || 0) * Math.PI / 180;
  const head = catHead(null, kind, sp, pose);
  const HM = (p) => { const x = p[0] * sp.headS, y = p[1] * sp.headS, cs = Math.cos(hr), sn = Math.sin(hr); return [ha[0] + x * cs - y * sn, ha[1] + x * sn + y * cs]; };
  const upperW = head.upper.map(HM), lowerW = head.lower.map(HM);
  // cauda
  const tr = sp.tail, sw = Math.sin((pose.tail ?? t) * 2.2), sw2 = Math.sin((pose.tail ?? t) * 2.2 - 1.1), r0 = add2(tr.root, [0, bob[1]]), L = tr.len, d = tr.droop;
  const tailC = smooth([r0, [r0[0] - L * 0.16, r0[1] + L * 0.36 * d + sw * 5], [r0[0] - L * 0.3, r0[1] + L * 0.66 * d + sw * 12], [r0[0] - L * 0.5, r0[1] + L * 0.8 * d + sw2 * 18], [r0[0] - L * 0.7, r0[1] + L * 0.7 * d + sw2 * 30]], false, 5);
  const tailP = smooth(limbPts(tailC, tailC.map((_, i) => lerp(tr.r * 1.25, tr.r * 0.75, i / (tailC.length - 1)))), true, 2);
  const neck = smooth(limbPts([sp.neck[0], add2(sp.neck[1], [0, bob[0]])], [sp.neck[2], sp.neck[3]]), true, 6);

  // ---------- pernas do lado oposto (camada própria, mais escura)
  const [cf, gf] = layer('catFar'); setM(gf);
  legs.filter((l) => !l.near).forEach((l) => { const P = legPoly(l, sp); tracePoly(gf, P.leg); gf.fillStyle = c.base; gf.fill(); tracePoly(gf, P.paw); gf.fill(); });
  if (kind === 'tiger') legs.filter((l) => !l.near).forEach((l, i) => legStripes(gf, l, c.mark, i + 9));
  tintLayer(gf, 'rgba(40,18,4,0.42)');
  // ---------- corpo (silhueta única)
  const [cb, g] = layer('catBody'); setM(g);
  g.fillStyle = c.base;
  tracePoly(g, tailP); g.fill();
  tracePoly(g, neck); g.fill();
  tracePoly(g, torso); g.fill();
  const nearP = legs.filter((l) => l.near).map((l) => ({ l, ...legPoly(l, sp) }));
  nearP.forEach((P) => { tracePoly(g, P.leg); g.fill(); tracePoly(g, P.paw); g.fill(); });
  // pelo da barriga (franja) e da garganta
  fur(g, torso, { color: c.base, len: kind === 'lion' ? 9 : 7, step: 4, seed: 7, width: 2.6, skip: (x, y, nx, ny) => ny < 0.55 });
  // ---------- pelagem (presa à silhueta)
  g.save(); g.globalCompositeOperation = 'source-atop';
  // ventre claro
  g.save(); tracePoly(g, torso); tracePoly(g, neck); g.clip();
  g.fillStyle = c.belly; g.filter = 'blur(12px)';
  g.beginPath(); g.ellipse(-10, -92, 190, 40, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(sp.S[0] + 70, -150, 48, 60, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  if (kind === 'tiger') { g.save(); g.fillStyle = c.belly; g.filter = 'blur(8px)'; nearP.forEach((P) => { const b = P.l.bones; g.beginPath(); g.ellipse(lerp(b[1][0], b[2][0], 0.6) + (P.l.front ? -14 : 12), lerp(b[1][1], b[2][1], 0.6), 12, 30, 0, 0, Math.PI * 2); g.fill(); }); g.restore(); }
  if (kind === 'jaguar') jaguarCoat(g, sp, nearP, tailC);
  if (kind === 'tiger') tigerCoat(g, sp, nearP, tailC);
  if (kind === 'lion') { g.fillStyle = c.dark; g.filter = 'blur(6px)'; g.beginPath(); g.ellipse(tailC[tailC.length - 1][0], tailC[tailC.length - 1][1], 30, 20, 0, 0, Math.PI * 2); g.fill(); g.filter = 'none'; }
  // separação suave entre pernas próximas e tronco
  g.filter = 'blur(4px)'; g.strokeStyle = 'rgba(50,22,4,0.35)'; g.lineWidth = 6;
  nearP.forEach((P) => { const b = P.l.bones; g.beginPath(); g.moveTo(b[0][0] + (P.l.front ? -30 : 40), b[0][1] - 40); g.quadraticCurveTo(b[0][0] + (P.l.front ? -44 : 64), b[0][1] + 10, b[1][0] + (P.l.front ? -24 : 28), b[1][1]); g.stroke(); });
  g.filter = 'none';
  // volume: luz de cima, ventre e patas na sombra
  g.fillStyle = linear(g, 0, -330, 0, 0, [[0, 'rgba(255,235,190,0.32)'], [0.35, 'rgba(255,220,170,0.05)'], [0.62, 'rgba(60,25,5,0.12)'], [1, 'rgba(40,15,0,0.5)']]); g.fillRect(-400, -420, 900, 460);
  g.fillStyle = radial(g, sp.H[0] + 10, sp.H[1] + 20, 0, 90, [[0, 'rgba(255,230,180,0.18)'], [1, 'rgba(255,230,180,0)']]); g.fillRect(-400, -420, 900, 460);
  g.fillStyle = radial(g, sp.S[0] - 10, sp.S[1] - 30, 0, 80, [[0, 'rgba(255,230,180,0.2)'], [1, 'rgba(255,230,180,0)']]); g.fillRect(-400, -420, 900, 460);
  g.restore();
  // ---------- cabeça (juba atrás, cabeça, mandíbula)
  const [ch, gh] = layer('catHead'); gh.setTransform(1, 0, 0, 1, 0, 0);
  setM(gh);
  if (kind === 'lion') drawMane(gh, ha, hr, sp.headS, t, c);
  if ((pose.jaw || 0) > 0.03) { const mz = head.mz, jw = pose.jaw; gh.save(); gh.translate(ha[0], ha[1]); gh.rotate(hr); gh.scale(sp.headS, sp.headS); gh.fillStyle = '#5E1A22'; tracePoly(gh, smooth([[14, 30], [118 + mz, 20], [112 + mz, 34 + 40 * jw], [70, 52 + 34 * jw], [24, 46]], true, 6)); gh.fill(); gh.restore(); }
  gh.fillStyle = c.base;
  tracePoly(gh, lowerW); gh.fill();
  tracePoly(gh, upperW); gh.fill();
  fur(gh, upperW, { color: c.base, len: 7, step: 4, seed: 13, width: 2.4, skip: (x, y, nx, ny) => nx > 0.3 });
  gh.save(); gh.globalCompositeOperation = 'source-atop';
  gh.translate(ha[0], ha[1]); gh.rotate(hr); gh.scale(sp.headS, sp.headS);
  headDetails(gh, kind, sp, pose, head);
  gh.restore();
  // ---------- composição: sombra no chão, pernas de trás, corpo, cabeça, contorno de luz
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  softEllipse(dst, pose.x - 10 * S * fl, pose.y + 6 * S, (sp.stride + 170) * S, 22 * S, 'rgba(20,10,0,0.55)', light.shadow ?? 0.8);
  dst.drawImage(cf, 0, 0);
  dst.drawImage(cb, 0, 0);
  dst.drawImage(ch, 0, 0);
  dst.restore();
  if (light.shade) { const [ca, ga] = layer('catAll'); ga.drawImage(cf, 0, 0); ga.drawImage(cb, 0, 0); ga.drawImage(ch, 0, 0); tintLayer(ga, `rgba(25,10,2,${light.shade})`); tintLayer(ga, light.shadeColor || 'rgba(0,0,0,0)'); dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(ca, 0, 0); dst.restore(); }
  const [cu, gu] = layer('catUnion'); gu.drawImage(cb, 0, 0); gu.drawImage(ch, 0, 0);
  rimLight(dst, cu, (light.rimDx ?? -5), light.rimDy ?? -4, light.rim || 'rgba(255,240,200,0.9)', light.rimBlur ?? 2, light.rimAlpha ?? 0.7, light.rimOp || 'source-over');
  // olho e bigodes por cima (sem sombreamento)
  dst.save(); setM(dst); dst.translate(ha[0], ha[1]); dst.rotate(hr); dst.scale(sp.headS, sp.headS);
  catEye(dst, sp, pose, kind, light);
  dst.lineCap = 'round';
  [0, 1, 2, 3].forEach((k) => { dst.strokeStyle = `rgba(255,255,255,${0.8 - k * 0.1})`; dst.lineWidth = 1.8; dst.beginPath(); dst.moveTo(118 + head.mz, 10 + k * 4); dst.bezierCurveTo(150 + head.mz, 4 + k * 8, 180 + head.mz, 6 + k * 16, 205 + head.mz, 12 + k * 26); dst.stroke(); });
  dst.restore();
}

function legStripes(g, l, color, seed) {
  g.save(); g.fillStyle = color;
  const b = l.bones;
  [[0, 1, [0.35, 0.6, 0.85]], [1, 2, [0.25, 0.55]]].forEach(([i, j, ks]) => ks.forEach((k, n) => {
    const x = lerp(b[i][0], b[j][0], k), y = lerp(b[i][1], b[j][1], k), a = Math.atan2(b[j][1] - b[i][1], b[j][0] - b[i][0]);
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2 + (hash(seed + n) - 0.5) * 0.4);
    g.beginPath(); g.moveTo(-40, -3); g.quadraticCurveTo(0, -7, 30, -1); g.quadraticCurveTo(0, 5, -40, 3); g.fill(); g.restore();
  }));
  g.restore();
}
function blob(g, pts) { tracePoly(g, smooth(pts, true, 6)); g.fill(); }
function jaguarCoat(g, sp, nearP, tailC) {
  const c = sp.c; let k = 0;
  // roseta: 3 a 5 manchas irregulares formando um anel quebrado, centro mais escuro com pintas
  const rosette = (x, y, r, seed) => {
    g.fillStyle = 'rgba(150,85,20,0.55)';
    const inner = []; for (let j = 0; j < 9; j++) { const a = (j / 9) * Math.PI * 2, rr = r * (0.62 + 0.18 * hash(seed * 3 + j)); inner.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.82]); } blob(g, inner);
    g.fillStyle = c.mark;
    const m = 3 + Math.floor(hash(seed) * 3), a0 = hash(seed + 1) * 6.28;
    for (let j = 0; j < m; j++) {
      const s0 = a0 + (j / m) * Math.PI * 2, s1 = s0 + (Math.PI * 2 / m) * (0.55 + 0.25 * hash(seed * 5 + j)), pts = [], N = 5;
      for (let q = 0; q <= N; q++) { const a = lerp(s0, s1, q / N), th = Math.sin((q / N) * Math.PI); pts.push([x + Math.cos(a) * r * (1 + 0.12 * th + 0.08 * hash(seed + q)), y + Math.sin(a) * r * 0.84 * (1 + 0.12 * th)]); }
      for (let q = N; q >= 0; q--) { const a = lerp(s0, s1, q / N), th = Math.sin((q / N) * Math.PI); pts.push([x + Math.cos(a) * r * (1 - 0.3 * th), y + Math.sin(a) * r * 0.84 * (1 - 0.3 * th)]); }
      blob(g, pts);
    }
    const nd = Math.floor(hash(seed + 3) * 3);
    for (let j = 0; j < nd; j++) { const a = hash(seed * 11 + j) * 6.28, rr = r * 0.25 * hash(seed + j); g.beginPath(); g.ellipse(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * 0.13, r * 0.11, 0, 0, Math.PI * 2); g.fill(); }
  };
  const spot = (x, y, r, seed) => { g.fillStyle = c.mark; const p = []; for (let j = 0; j < 7; j++) { const a = (j / 7) * 6.28; p.push([x + Math.cos(a) * r * (0.75 + 0.4 * hash(seed * 7 + j)), y + Math.sin(a) * r * 0.8 * (0.75 + 0.4 * hash(seed * 3 + j))]); } blob(g, p); };
  for (let gy = -292, row = 0; gy <= -92; gy += 40, row++) for (let gx = -244 + (row % 2) * 24; gx <= 224; gx += 48) {
    k++; const x = gx + (hash(k) - 0.5) * 22, y = gy + (hash(k + 50) - 0.5) * 14;
    if (gy > -130) { spot(x, y, 8 + hash(k + 2) * 5, k); continue; }
    const r = (gy < -260 ? 13 : 17) + hash(k + 9) * 7;
    rosette(x, y, r, k);
  }
  nearP.forEach((P, i) => { const b = P.l.bones; for (let n = 0; n < 12; n++) { const s = n / 12, seg = s < 0.45 ? [b[0], b[1], s / 0.45] : [b[1], b[2], (s - 0.45) / 0.55]; const x = lerp(seg[0][0], seg[1][0], seg[2]) + (hash(i * 13 + n) - 0.5) * 34 * (1 - s * 0.6), y = lerp(seg[0][1], seg[1][1], seg[2]) + (hash(i * 7 + n) - 0.5) * 10; spot(x, y, 5.5 + hash(n + i) * 3 * (1 - s * 0.5), i * 50 + n); } });
  for (let i = 1; i < tailC.length; i += 2) { const p = tailC[i]; i < tailC.length * 0.6 ? rosette(p[0], p[1], 11, 300 + i) : spot(p[0], p[1], 10, 400 + i); }
}
function taper(g, pts, w) { const P = smooth(pts, false, 6); const R = P.map((_, i) => w * Math.sin(Math.PI * (0.08 + 0.84 * i / (P.length - 1))) + 0.4); tracePoly(g, smooth(limbPts(P, R), true, 1)); g.fill(); }
function tigerCoat(g, sp, nearP, tailC) {
  const c = sp.c; g.fillStyle = c.mark;
  for (let i = 0; i < 30; i++) {
    const x = -248 + i * 16.5 + (hash(i) - 0.5) * 10, len = 50 + hash(i + 4) * 95, w = 3.5 + hash(i + 2) * 4, lean = 8 + (hash(i + 8) - 0.5) * 22, top = -322;
    if (hash(i + 70) < 0.25) continue;
    const mid = [x + lean * 0.5 + (hash(i + 9) - 0.5) * 10, top + len * 0.5], end = [x + lean, top + len];
    taper(g, [[x, top], mid, end], w);
    if (hash(i + 30) > 0.6) taper(g, [mid, [mid[0] + 10, mid[1] + len * 0.25], [mid[0] + 22 + lean * 0.3, mid[1] + len * 0.42]], w * 0.7);
    if (hash(i + 20) > 0.5) { const yb = -100; taper(g, [[x + 14, yb], [x + 18 - lean * 0.3, yb - 22], [x + 20 - lean * 0.5, yb - 34 - hash(i + 40) * 26]], w * 0.8); }
  }
  // listras das pernas: finas, ao redor da perna, mais na coxa
  nearP.forEach((P, i) => {
    const b = P.l.bones;
    [[0, 1, [0.3, 0.5, 0.7, 0.9]], [1, 2, [0.2, 0.45]]].forEach(([u, v, ks]) => ks.forEach((kk, n) => {
      const x = lerp(b[u][0], b[v][0], kk), y = lerp(b[u][1], b[v][1], kk), a = Math.atan2(b[v][1] - b[u][1], b[v][0] - b[u][0]) + Math.PI / 2, L = (u === 0 ? (P.l.front ? 34 : 46) : 24) * (0.8 + 0.4 * hash(i * 9 + n));
      const dx = Math.cos(a) * L, dy = Math.sin(a) * L;
      taper(g, [[x - dx, y - dy], [x - dx * 0.1, y - dy * 0.1 + 4], [x + dx * 0.6, y + dy * 0.6 + 2]], 3.6);
    }));
  });
  for (let i = 2; i < tailC.length; i += 2) { const a = tailC[i], b = tailC[Math.min(tailC.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; taper(g, [[a[0] - Math.cos(an) * 26, a[1] - Math.sin(an) * 26], a, [a[0] + Math.cos(an) * 26, a[1] + Math.sin(an) * 26]], 5); }
  const e = tailC[tailC.length - 1]; g.beginPath(); g.arc(e[0], e[1], 20, 0, Math.PI * 2); g.fill();
}
function drawMane(g, ha, hr, hs, t, c) {
  g.save(); g.translate(ha[0], ha[1]); g.rotate(hr); g.scale(hs, hs);
  // tufos em três anéis: escuro atrás, dourado perto do rosto
  const rings = [[150, 70, 34, '#3A200E', '#7A4A1C', 30], [128, 60, 32, '#5E3414', '#9C6628', 28], [104, 48, 28, '#8A5620', '#C99858', 26], [84, 36, 22, '#A87030', '#DDB070', 22]];
  rings.forEach(([R, len, wd, c0, c1, n], ri) => {
    for (let i = 0; i < n; i++) {
      const a = -1.35 - (3.75 * (i + 0.5 * (ri % 2))) / n, sway = 0.05 * Math.sin(t * 1.6 + i * 0.7 + ri);
      const cx = -16 + Math.cos(a) * R * 0.55, cy = 16 + Math.sin(a) * R * 0.62, dir = a + sway + (hash(i + ri * 40) - 0.5) * 0.3;
      const L = len * (0.8 + 0.45 * hash(i * 3 + ri)), tip = [cx + Math.cos(dir) * L, cy + Math.sin(dir) * L + L * 0.45];
      const nx = -Math.sin(dir) * wd, ny = Math.cos(dir) * wd;
      const pts = [[cx + nx, cy + ny], [lerp(cx, tip[0], 0.6) + nx * 0.85, lerp(cy, tip[1], 0.6) + ny * 0.85], [tip[0] + nx * 0.25, tip[1] + ny * 0.25], [tip[0] - nx * 0.25, tip[1] - ny * 0.25], [lerp(cx, tip[0], 0.6) - nx * 0.85, lerp(cy, tip[1], 0.6) - ny * 0.85], [cx - nx, cy - ny]];
      g.fillStyle = linear(g, cx, cy, tip[0], tip[1], [[0, c0], [1, c1]]); blob(g, pts);
      g.strokeStyle = 'rgba(30,15,5,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(lerp(cx, tip[0], 0.2), lerp(cy, tip[1], 0.2)); g.quadraticCurveTo(lerp(cx, tip[0], 0.6) + nx * 0.2, lerp(cy, tip[1], 0.6) + ny * 0.2, tip[0], tip[1]); g.stroke();
    }
  });
  g.restore();
}
function headDetails(g, kind, sp, pose, h) {
  const c = sp.c, mz = h.mz, lion = kind === 'lion', tiger = kind === 'tiger', jaw = pose.jaw || 0;
  // boca aberta (rugido)
  if (jaw > 0.03) {
    g.save();
    g.fillStyle = '#C2566A'; g.beginPath(); g.ellipse(64, 40 + 24 * jaw, 34, 9, 0.35 * jaw, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFF8EA';
    g.beginPath(); g.moveTo(104 + mz, 20); g.lineTo(110 + mz, 46); g.lineTo(116 + mz, 21); g.fill();       // canino de cima
    const lj = (p) => { const x = p[0] - 10, y = p[1] - 30, cs = Math.cos(h.ja), sn = Math.sin(h.ja); return [10 + x * cs - y * sn, 30 + x * sn + y * cs]; };
    const a = lj([104 + mz, 26]), b = lj([108 + mz, 6]), d = lj([113 + mz, 26]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(d[0], d[1]); g.fill();   // canino de baixo
    g.restore();
  }
  // focinho, queixo e bochecha claros
  g.save(); g.filter = 'blur(5px)'; g.fillStyle = c.belly;
  g.beginPath(); g.ellipse(106 + mz, 14, 36 + mz * 0.5, 18, -0.1, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(60, 46, 50, 14, 0.1, 0, Math.PI * 2); g.fill();
  if (tiger) { g.beginPath(); g.ellipse(-10, 24, 44, 34, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(58, -50, 16, 7, -0.2, 0, Math.PI * 2); g.fill(); }
  if (lion) { g.beginPath(); g.ellipse(70, -44, 14, 6, -0.2, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // marcas
  g.fillStyle = c.mark;
  if (kind === 'jaguar') [[-30, -34], [-12, -48], [8, -54], [28, -46], [-2, -30], [-40, -6], [-20, -12], [44, -26], [-46, -36], [6, -10], [-26, 14], [20, 8]].forEach(([x, y], i) => { g.beginPath(); g.ellipse(x, y, 5 + hash(i) * 3, 4.5 + hash(i + 2) * 2, 0, 0, Math.PI * 2); g.fill(); });
  if (tiger) {
    [[-34, -60, -28, -10], [-14, -68, -6, -30], [6, -70, 16, -42], [28, -66, 34, -48]].forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0 - 5, y0); g.quadraticCurveTo((x0 + x1) / 2 - 2, (y0 + y1) / 2, x1, y1); g.quadraticCurveTo((x0 + x1) / 2 + 6, (y0 + y1) / 2, x0 + 6, y0); g.fill(); });
    [[-56, 4, -6, -2], [-54, 22, -4, 14], [-50, 40, 0, 32]].forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0, y0 - 5); g.quadraticCurveTo((x0 + x1) / 2, y0 - 8, x1, y1); g.quadraticCurveTo((x0 + x1) / 2, y0 + 6, x0, y0 + 5); g.fill(); });
  }
  // orelha arredondada
  g.save(); g.globalCompositeOperation = 'source-over';
  const ear = smooth([[-50, -50], [-46, -70], [-34, -80, 1], [-20, -72], [-14, -54]], true, 6);
  g.fillStyle = c.base; tracePoly(g, ear); g.fill();
  g.fillStyle = tiger ? '#1A0F08' : 'rgba(40,18,5,0.55)'; tracePoly(g, smooth([[-48, -54], [-44, -70], [-34, -78, 1], [-30, -62]], true, 6)); g.fill();
  if (tiger) { g.fillStyle = '#FFF6E6'; g.beginPath(); g.ellipse(-40, -66, 4.5, 5.5, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // volume da cabeça
  g.fillStyle = linear(g, 0, -70, 0, 60, [[0, 'rgba(255,235,190,0.3)'], [0.5, 'rgba(255,220,170,0)'], [1, 'rgba(50,20,0,0.35)']]); g.fillRect(-120, -120, 320, 220);
  g.fillStyle = radial(g, 70, -10, 0, 50, [[0, 'rgba(255,235,190,0.22)'], [1, 'rgba(255,235,190,0)']]); g.fillRect(-120, -120, 320, 220);
  // sombra do arco da sobrancelha e linha da boca
  g.fillStyle = 'rgba(50,20,0,0.35)'; g.filter = 'blur(3px)'; g.beginPath(); g.ellipse(64, -40, 24, 7, -0.15, 0, Math.PI * 2); g.fill(); g.filter = 'none';
  // nariz
  g.fillStyle = c.nose; tracePoly(g, smooth([[124 + mz, -22], [144 + mz, -14, 1], [143 + mz, 0, 1], [128 + mz, -4]], true, 6)); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(134 + mz, -16, 5, 2, 0, 0, Math.PI * 2); g.fill();
  if (jaw < 0.03) { g.strokeStyle = 'rgba(40,15,5,0.8)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(141 + mz, 4); g.quadraticCurveTo(132 + mz, 22, 100 + mz * 0.6, 26); g.quadraticCurveTo(80, 28, 64, 26); g.stroke(); }
  g.fillStyle = 'rgba(40,15,5,0.55)'; [0, 1, 2, 3].forEach((k) => [0, 1].forEach((r) => { g.beginPath(); g.arc(104 + mz + k * 7, 8 + r * 7 + (k % 2) * 2, 2, 0, Math.PI * 2); g.fill(); }));
}
function catEye(g, sp, pose, kind, light) {
  const blink = pose.blink || 0;
  g.save(); g.translate(64, -30); g.rotate(-0.12);
  g.fillStyle = 'rgba(30,12,2,0.85)'; g.beginPath(); g.ellipse(0, 0, 16, 8.5, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(1, 0, 13.5, 7, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = radial(g, 2, 1, 0, 14, [[0, '#FFE58A'], [0.6, sp.c.iris], [1, '#7A4A08']]); g.fillRect(-16, -9, 32, 18);
  g.fillStyle = '#0A0604'; g.beginPath(); g.arc(4, 0, 4.6, 0, Math.PI * 2); g.fill();   // pupila redonda nos grandes felinos
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(1.5, -2.5, 1.8, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(40,15,0,0.5)'; g.fillRect(-16, -9, 32, 4);
  if (blink > 0.02) { g.fillStyle = sp.c.base; g.fillRect(-16, -9, 32, 18 * blink); }
  g.restore();
  if (light.eyeGlow) { g.save(); g.globalCompositeOperation = 'lighter'; softEllipse(g, 66, -30, 22, 12, `rgba(255,210,90,${light.eyeGlow})`, 1); g.restore(); }
}
