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
    marks: 'rosette', tailMark: 'jaguar',
    c: { base: '#E7B44E', dark: '#C99236', far: '#C3923C', belly: '#F4DDA6', mark: '#7A4E22', ring: '#9A6A2C', nose: '#5A3424' },
  },
  tiger: { // o maior: corpo longo e alto, laranja, listras laranja-escuras finas e curvas, ventre claro
    S: [150, -262], H: [-182, -270], fl: [116, 120], hl: [120, 118], fr: [33, 21, 15], hr: [44, 24, 15],
    pastern: [8, 26], meta: [22, 66], paw: [24, 12], homeF: 160, homeH: -150, stride: 160, lift: 38,
    torso: [[124, -360], [30, -350], [-80, -346], [-180, -356], [-234, -330], [-248, -276], [-232, -218], [-194, -188], [-146, -200], [-72, -206], [30, -196], [116, -182], [176, -194], [214, -240], [214, -298], [182, -340]],
    neck: [[172, -294], [250, -330], 54, 44], headAt: [258, -338], headS: 0.95, tail: { root: [-238, -330], len: 330, r: 11, droop: 0.95 }, mz: 4,
    marks: 'stripes', tailMark: 'stripes',
    c: { base: '#E8743A', dark: '#C85A2A', far: '#C25A2C', belly: '#F6D8B8', mark: '#A8401E', ring: '#000', nose: '#7A3428' },
  },
  lion: { // pernas longas, pelagem lisa, juba volumosa caindo sobre o peito, tufo escuro na cauda
    S: [140, -270], H: [-170, -276], fl: [120, 124], hl: [124, 120], fr: [33, 20, 15], hr: [44, 23, 15],
    pastern: [8, 26], meta: [22, 66], paw: [24, 12], homeF: 150, homeH: -140, stride: 160, lift: 38,
    torso: [[110, -366], [20, -352], [-80, -350], [-170, -360], [-222, -336], [-236, -282], [-220, -222], [-180, -194], [-134, -210], [-60, -216], [30, -206], [112, -192], [172, -204], [206, -250], [204, -306], [170, -348]],
    neck: [[164, -300], [238, -338], 56, 46], headAt: [246, -346], headS: 1.0, tail: { root: [-226, -334], len: 320, r: 9, droop: 1.05 }, mz: 10,
    marks: 'plain', tailMark: 'tuft', mane: true,
    c: { base: '#E0912E', dark: '#BF7322', far: '#B86E22', belly: '#F1C987', mark: '#6A3B1C', ring: '#000', nose: '#4A2A18', mane: '#6E3E1E', maneLight: '#8A5226' },
  },
  // ---------- episódio completo: espécies novas (proporções próprias, não só cor) ----------
  cheetah: { // guepardo: pernas muito longas, peito fundo, cintura finíssima, cabeça pequena e redonda, pintas sólidas, "lágrimas"
    S: [120, -290], H: [-140, -292], fl: [128, 130], hl: [132, 128], fr: [26, 16, 11], hr: [34, 18, 12],
    pastern: [7, 26], meta: [20, 70], paw: [20, 10], homeF: 130, homeH: -120, stride: 170, lift: 40,
    torso: [[100, -372], [20, -362], [-70, -354], [-150, -362], [-190, -344], [-204, -302], [-190, -258], [-156, -240], [-110, -262], [-50, -276], [20, -262], [90, -232], [140, -238], [170, -280], [168, -330], [140, -362]],
    neck: [[140, -330], [206, -370], 44, 36], headAt: [214, -380], headS: 0.8, tail: { root: [-196, -344], len: 330, r: 9, droop: 1.0 }, mz: -14,
    marks: 'spots', tailMark: 'cheetah', face: 'cheetah',
    c: { base: '#E6B864', dark: '#C8954A', far: '#BE8C44', belly: '#F7E7C4', mark: '#2A1E18', ring: '#2A1E18', nose: '#2E2220' },
  },
  leopard: { // leopardo: menor e mais leve que a onça, cauda longa, rosetas pequenas SEM ponto central
    S: [110, -222], H: [-140, -228], fl: [96, 100], hl: [100, 98], fr: [28, 18, 13], hr: [38, 20, 13],
    pastern: [8, 22], meta: [18, 56], paw: [20, 10], homeF: 120, homeH: -120, stride: 130, lift: 32,
    torso: [[90, -300], [18, -292], [-66, -286], [-142, -296], [-184, -276], [-198, -232], [-184, -184], [-150, -160], [-110, -168], [-56, -172], [18, -164], [86, -152], [136, -162], [172, -200], [172, -248], [140, -284]],
    neck: [[128, -252], [198, -280], 48, 40], headAt: [204, -288], headS: 0.94, tail: { root: [-188, -278], len: 300, r: 10, droop: 0.75 }, mz: -6,
    marks: 'leoRosette', tailMark: 'leopard',
    c: { base: '#EABF66', dark: '#CC9C46', far: '#C0903E', belly: '#F7E6BE', mark: '#33231A', ring: '#33231A', nose: '#5A3424' },
  },
  puma: { // suçuarana: lisa, cor de areia acinzentada, traseiro mais alto, cauda longa e grossa com ponta escura
    S: [116, -240], H: [-150, -262], fl: [104, 108], hl: [118, 114], fr: [30, 19, 14], hr: [42, 22, 14],
    pastern: [8, 24], meta: [20, 64], paw: [22, 11], homeF: 128, homeH: -128, stride: 140, lift: 34,
    torso: [[92, -320], [16, -312], [-70, -312], [-150, -330], [-196, -310], [-212, -262], [-196, -214], [-160, -190], [-118, -196], [-60, -196], [20, -184], [92, -168], [146, -178], [182, -216], [180, -268], [148, -304]],
    neck: [[134, -268], [206, -300], 50, 40], headAt: [212, -308], headS: 0.86, tail: { root: [-200, -310], len: 360, r: 13, droop: 0.95 }, mz: -6,
    marks: 'plain', tailMark: 'darkTip', face: 'puma',
    c: { base: '#C99A66', dark: '#A97B4E', far: '#A0744A', belly: '#EEDCC4', mark: '#4A3226', ring: '#000', nose: '#8A5A50' },
  },
  ocelot: { // jaguatirica: pequena (desenhar com escala menor), corpo longo, pernas curtas, cauda curta anelada, manchas em corrente
    S: [110, -200], H: [-150, -206], fl: [86, 90], hl: [92, 90], fr: [26, 16, 12], hr: [34, 18, 12],
    pastern: [7, 20], meta: [16, 50], paw: [21, 10], homeF: 118, homeH: -122, stride: 120, lift: 30,
    torso: [[94, -276], [14, -268], [-74, -264], [-152, -272], [-196, -254], [-210, -212], [-196, -168], [-160, -146], [-118, -152], [-60, -156], [18, -150], [90, -138], [142, -148], [176, -184], [176, -228], [144, -262]],
    neck: [[132, -226], [196, -254], 46, 38], headAt: [204, -262], headS: 1.04, tail: { root: [-200, -252], len: 170, r: 10, droop: 0.9 }, mz: -8,
    marks: 'chain', tailMark: 'rings', face: 'ocelot',
    c: { base: '#DDAA62', dark: '#BC8C4A', far: '#B2843F', belly: '#F4E6CC', mark: '#2E2018', markIn: '#B47A3A', ring: '#2E2018', nose: '#7A4A40' },
  },
  lioness: { // leoa: sem juba, mais leve e baixa que o leão
    S: [130, -250], H: [-160, -256], fl: [112, 116], hl: [116, 112], fr: [30, 19, 14], hr: [42, 22, 14],
    pastern: [8, 24], meta: [20, 62], paw: [22, 11], homeF: 140, homeH: -134, stride: 150, lift: 36,
    torso: [[100, -334], [18, -322], [-76, -320], [-160, -330], [-208, -308], [-222, -260], [-206, -208], [-170, -182], [-126, -196], [-56, -200], [28, -190], [104, -178], [160, -190], [192, -232], [190, -284], [158, -320]],
    neck: [[150, -280], [222, -314], 50, 40], headAt: [230, -322], headS: 0.92, tail: { root: [-212, -310], len: 300, r: 8, droop: 1.05 }, mz: 8,
    marks: 'plain', tailMark: 'tuft',
    c: { base: '#DDA055', dark: '#BC8040', far: '#B47A3C', belly: '#F2D29E', mark: '#5A341C', ring: '#000', nose: '#5A3424', mane: '#5A341C', maneLight: '#7A4A26' },
  },
  cub: { // filhote de leão: cabeça grande, pernas curtas, pintinhas claras
    S: [80, -150], H: [-96, -152], fl: [68, 70], hl: [70, 68], fr: [22, 15, 12], hr: [28, 16, 12],
    pastern: [6, 16], meta: [12, 40], paw: [18, 10], homeF: 88, homeH: -80, stride: 80, lift: 22,
    torso: [[64, -206], [10, -200], [-50, -198], [-100, -204], [-128, -188], [-136, -156], [-126, -122], [-100, -104], [-72, -112], [-30, -116], [16, -110], [60, -100], [96, -110], [116, -138], [114, -172], [94, -198]],
    neck: [[92, -170], [138, -192], 40, 34], headAt: [144, -198], headS: 0.95, tail: { root: [-130, -192], len: 140, r: 7, droop: 1.0 }, mz: 0,
    marks: 'cubSpots', tailMark: 'tuft',
    c: { base: '#E2AC62', dark: '#C48C48', far: '#BA8442', belly: '#F4DCAE', mark: '#C9965A', ring: '#000', nose: '#5A3424', mane: '#7A4A26', maneLight: '#8A5A30' },
  },
  pingo: { // Pingo de perfil: gato doméstico laranja tigrado, peito e patas brancas, cabeça grande, cauda erguida
    S: [100, -200], H: [-120, -206], fl: [90, 92], hl: [96, 92], fr: [24, 16, 12], hr: [32, 17, 12],
    pastern: [7, 20], meta: [16, 52], paw: [19, 10], homeF: 104, homeH: -100, stride: 110, lift: 34,
    torso: [[84, -276], [10, -268], [-60, -262], [-130, -270], [-166, -250], [-176, -208], [-162, -168], [-130, -150], [-90, -162], [-40, -168], [20, -160], [80, -148], [124, -160], [150, -196], [150, -236], [124, -266]],
    neck: [[110, -226], [166, -262], 42, 36], headAt: [176, -276], headS: 1.22, tail: { root: [-170, -250], len: 250, r: 10, droop: -0.55 }, mz: -30,
    marks: 'tabby', tailMark: 'tabby', domestic: true, whitePaws: true, eye: '#8CC152',
    c: { base: '#E8975A', dark: '#BC6A50', far: '#B8644A', belly: '#F5ECE4', mark: '#C2703F', ring: '#000', nose: '#E88B98', ear: '#E9A3A3' },
  },
  angora: { // angorá turco de perfil: branco, pelo longo e sedoso, cauda em pluma, olhos de cores diferentes
    S: [100, -204], H: [-120, -210], fl: [92, 94], hl: [98, 94], fr: [22, 15, 11], hr: [30, 16, 11],
    pastern: [7, 20], meta: [16, 52], paw: [19, 10], homeF: 104, homeH: -100, stride: 116, lift: 38,
    torso: [[84, -282], [10, -274], [-60, -268], [-130, -276], [-166, -256], [-176, -214], [-162, -172], [-130, -154], [-90, -166], [-40, -172], [20, -164], [80, -152], [124, -164], [150, -200], [150, -240], [124, -272]],
    neck: [[110, -230], [166, -266], 44, 38], headAt: [176, -282], headS: 1.12, tail: { root: [-170, -256], len: 260, r: 20, droop: -0.65 }, mz: -30,
    marks: 'none', tailMark: 'plume', domestic: true, fluff: true, eye: '#5AA7E0', eye2: '#E2B23A',
    c: { base: '#F6F2EE', dark: '#DCD3DA', far: '#CFC5CE', belly: '#FFFFFF', mark: '#E6DEE4', ring: '#000', nose: '#E8A0A8', ear: '#F2B8C0' },
  },
};
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
const rot2 = (v, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
/** forma chapada sem contorno */
function flat(g, pts, fill, n = 8) { const p = smooth(pts, true, n); g.beginPath(); trace(g, p); g.fillStyle = fill; g.fill(); return p; }
function footAt(home, ph, sp, mv, rest, G) {
  const q = ((ph % 1) + 1) % 1, st = G ? G.stance : 0.6, stride = G ? G.stride : sp.stride, lift = G ? G.lift : sp.lift; let x, y, fold = 0;
  if (q < st) { x = lerp(stride / 2, -stride / 2, q / st); y = 0; }
  else { const k = (q - st) / (1 - st), e = k * k * (3 - 2 * k); x = lerp(-stride / 2, stride / 2, e); y = -lift * Math.sin(k * Math.PI); fold = Math.sin(k * Math.PI); }
  return { x: home + x * mv + rest * (1 - mv), y: y * mv, fold: fold * mv, stance: q < st ? Math.sin((q / st) * Math.PI) : 0 };
}
/** quanto o corpo avança (px na tela) a cada ciclo de passada, para a pata apoiada não patinar: fase = distância / catStep */
function catStep(kind, s, gait) { const sp = SPEC[kind]; return gait === 'gallop' ? sp.stride * 2.3 / 0.34 * s : sp.stride / 0.6 * s; }
/** distância acumulada de quem anda de um lado para o outro (x = A·sen(w·t)): a fase da passada avança com |velocidade| */
function paceDist(A, w, t) { const u = w * t, n = Math.floor(u / Math.PI); return Math.abs(A) * (2 * n + 1 - Math.cos(u - n * Math.PI)); }
/** função erro (Abramowitz–Stegun) para integrar velocidades que variam em sino */
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
function catLegs(sp, walk, mv, bob, gait, lie = 0, D = 0) {
  // passo lateral (andar) ou galope rotativo (corrida): pares traseiros e dianteiros quase juntos, fase de voo
  const G = gait === 'gallop' ? { stance: 0.34, stride: sp.stride * 2.3, lift: sp.lift * 1.8 } : null;
  const L = G ? [{ front: false, near: true, o: 0, rest: -14 }, { front: true, near: true, o: 0.52, rest: 16 }, { front: false, near: false, o: 0.1, rest: 20 }, { front: true, near: false, o: 0.62, rest: -24 }]
    : [{ front: false, near: true, o: 0, rest: -14 }, { front: true, near: true, o: 0.25, rest: 16 }, { front: false, near: false, o: 0.5, rest: 20 }, { front: true, near: false, o: 0.75, rest: -24 }];
  return L.map((l) => {
    const ft = footAt(l.front ? sp.homeF : sp.homeH, walk + l.o, sp, mv, l.rest, G), dx = l.near ? 0 : 14;
    // deitado (lie): o corpo desce D e as patas dobram — dianteiras esticadas à frente (pose de esfinge), traseiras sob a anca
    const tuck = lie * (l.front ? 70 + (l.near ? 20 : 0) : 46);
    const root = add2(l.front ? sp.S : sp.H, [dx, l.front ? bob[0] : bob[1]]), P = [ft.x + dx + tuck, ft.y * (1 - lie) - D];
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

/** pose: {x, y, s, flip, walk (fase), moving 0..1, gait ('walk' | 'gallop'), headRot, jaw, blink, tail, sit (0..1, só domésticos)}
 *  look: { tint, tintA, dark (contraluz), rim, rimDx, rimDy } */
function drawBigCat(ctx, kind, pose, t, look = {}) {
  const sp = SPEC[kind], c = sp.c, walk = pose.walk || 0, mv = pose.moving ?? 0, fl = pose.flip ? -1 : 1, S = pose.s, gal = pose.gait === 'gallop';
  const bob = gal ? [mv * 14 * Math.sin(walk * Math.PI * 2 + 0.6), mv * 14 * Math.sin(walk * Math.PI * 2 - 0.4)] : [mv * 4 * Math.sin((walk + 0.1) * Math.PI * 4), mv * 3.5 * Math.sin((walk + 0.35) * Math.PI * 4)];
  const flex = gal ? Math.sin(walk * Math.PI * 2) * 0.09 : 0;    // coluna estica e encolhe no galope
  const lie = pose.lie || 0, D = lie * Math.abs(sp.S[1]) * 0.62;
  const legs = catLegs(sp, walk, mv, bob, pose.gait, lie, D), nf = legs.find((l) => l.front && l.near);
  const [lc, g] = layer('cat');
  g.translate(pose.x, pose.y); g.scale(S * fl, S);
  g.fillStyle = 'rgba(40,20,40,0.22)'; g.beginPath(); g.ellipse(-10, 4, sp.stride + 160, 14, 0, 0, 6.283); g.fill();
  g.translate(0, D);
  if (gal) g.translate(0, -Math.max(0, Math.sin(walk * Math.PI * 2 - 1.2)) * 26);
  // cauda
  const tr = sp.tail, sw = Math.sin((pose.tail ?? t) * 2.0), sw2 = Math.sin((pose.tail ?? t) * 2.0 - 1.1), r0 = add2(tr.root, [0, bob[1]]), L = tr.len, d = tr.droop;
  const up = d < 0 ? 1 : 0;
  const tc = up ? smooth([r0, [r0[0] - L * 0.2, r0[1] + L * 0.1], [r0[0] - L * 0.32 + sw * 6, r0[1] - L * 0.3], [r0[0] - L * 0.3 + sw * 14, r0[1] - L * 0.62], [r0[0] - L * 0.16 + sw2 * 22, r0[1] - L * 0.8]], false, 4)
    : smooth([r0, [r0[0] - L * 0.14, r0[1] + L * 0.38 * d + sw * 4], [r0[0] - L * 0.26, r0[1] + L * 0.72 * d + sw * 10], [r0[0] - L * 0.46, r0[1] + L * 0.86 * d + sw2 * 16], [r0[0] - L * 0.66, r0[1] + L * 0.74 * d + sw2 * 26], [r0[0] - L * 0.78, r0[1] + L * 0.58 * d + sw2 * 34 - (sp.tailMark === 'leopard' || sp.tailMark === 'cheetah' ? 30 : 0)]], false, 4);
  if (lie > 0) tc.forEach((q) => { if (q[1] > -D - 6) q[1] = lerp(q[1], -D - 6, lie); });   // deitado: a cauda descansa no chão
  const tw = sp.tailMark === 'plume' ? (i, n) => tr.r * (0.7 + 0.8 * Math.sin(Math.PI * i / n)) : (i, n) => lerp(tr.r * 1.25, tr.r * 0.7, i / n);
  const tailP = flat(g, limb(tc, tc.map((_, i) => tw(i, tc.length - 1))), c.base, 2);
  clipTo(g, tailP, () => {
    g.fillStyle = c.dark; g.beginPath(); trace(g, smooth(limb(tc, tc.map(() => tr.r * 0.5)).map((p) => [p[0] + 3, p[1] + 5]), true, 2)); g.fill();
    const across = (i, w, len, col) => { const a = tc[i], b = tc[Math.min(tc.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; g.fillStyle = col; g.save(); g.translate(a[0], a[1]); g.rotate(an); g.fillRect(-len, -w / 2, 2 * len, w); g.restore(); };
    const tm = sp.tailMark;
    if (tm === 'jaguar') { for (let i = Math.floor(tc.length * 0.55); i < tc.length; i += 3) across(i, 7, 20, c.mark); for (let i = 2; i < tc.length * 0.5; i += 3) ringRosette(g, tc[i][0], tc[i][1], 6, 900 + i, c); }
    if (tm === 'stripes') { g.fillStyle = c.mark; for (let i = 3; i < tc.length; i += 3) { const a = tc[i], b = tc[Math.min(tc.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; curveStripe(g, [[a[0] - Math.cos(an) * 20, a[1] - Math.sin(an) * 20], [a[0] + 3, a[1]], [a[0] + Math.cos(an) * 20, a[1] + Math.sin(an) * 20]], 4); } }
    if (tm === 'cheetah') { g.fillStyle = c.mark; for (let i = 2; i < tc.length * 0.6; i += 2) blobAt(g, tc[i][0], tc[i][1] + (i % 2 ? 4 : -4), 4.5, 300 + i); for (let i = Math.floor(tc.length * 0.62); i < tc.length - 3; i += 3) across(i, 8, 20, c.mark); const e = tc[tc.length - 1]; g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(e[0], e[1], tr.r * 0.9, 0, 6.283); g.fill(); }
    if (tm === 'leopard') { for (let i = 2; i < tc.length - 2; i += 3) ringRosette(g, tc[i][0], tc[i][1], 6.5, 700 + i, { ...c, mark: c.base }); }
    if (tm === 'rings') { for (let i = 2; i < tc.length; i += 3) across(i, 7, 22, c.mark); }
    if (tm === 'darkTip' || tm === 'tuft') { for (let i = Math.floor(tc.length * 0.84); i < tc.length; i++) across(i, 10, 24, c.mark); }
    if (tm === 'tabby') { for (let i = 3; i < tc.length; i += 4) across(i, 9, 24, c.mark); }
  });
  if (sp.tailMark === 'tuft') { const e = tc[tc.length - 1], e2 = tc[tc.length - 3]; g.fillStyle = c.mane || c.mark; g.beginPath(); trace(g, smooth([[e2[0], e2[1] - 6], [e[0] - 4, e[1] - 16], [e[0] - 22, e[1] + 4], [e[0] - 8, e[1] + 24], [e2[0] + 4, e2[1] + 8]], true, 5)); g.fill(); }
  // pernas do lado oposto: tom escuro
  legs.filter((l) => !l.near).forEach((l) => { const P = legPoly(l, sp); flat(g, P.leg, c.far, 3); flat(g, P.paw, sp.whitePaws ? '#D9CFD6' : c.far); });
  // pescoço + tronco (o galope estica e encolhe a coluna)
  flat(g, limb([sp.neck[0], add2(sp.neck[1], [0, bob[0]])], [sp.neck[2], sp.neck[3]]), c.base);
  const torsoPts = sp.torso.map((p, i) => [p[0] * (1 + flex), p[1] + bob[0] * (p[0] > 40 ? 1 : 0) + bob[1] * (p[0] < -100 ? 1 : 0) - (i === 0 ? 8 * nf.stance * mv : 0)]);
  // pelo longo: franja macia em volta do corpo (angorá)
  if (sp.fluff) { const fp = smooth(torsoPts, true, 6).map((q, i) => { const dx = q[0] + 10, dy = q[1] + 220, l = Math.hypot(dx, dy) || 1; const k = 1 + (i % 2 ? 0.07 : 0.02) + 0.02 * Math.sin(t * 3 + i); return [q[0] + dx / l * 14 * k * 1.4, q[1] + dy / l * 14 * k * 1.4]; }); g.beginPath(); trace(g, fp); g.fillStyle = c.base; g.fill(); }
  const torso = flat(g, torsoPts, c.base);
  // pernas do lado próximo (mesma cor do corpo: emendam sem costura)
  const nearP = legs.filter((l) => l.near).map((l) => ({ l, ...legPoly(l, sp) }));
  nearP.forEach((P) => { flat(g, P.leg, c.base, 3); flat(g, P.paw, sp.whitePaws ? c.belly : c.base); });
  // tons: ventre claro, sombra plana na anca e atrás do ombro, perna próxima com sombra na parte de trás
  clipTo(g, torso, () => {
    g.filter = `blur(${(9 * S).toFixed(2)}px)`;
    g.fillStyle = c.belly; g.beginPath(); trace(g, smooth([[-200, sp.H[1] + 70], [-120, sp.H[1] + 62], [0, sp.S[1] + 58], [120, sp.S[1] + 64], [200, sp.S[1] + 30], [220, 0], [-220, 0]], true, 6)); g.fill();
    if (sp.whitePaws) { g.fillStyle = c.belly; g.beginPath(); g.ellipse(sp.S[0] + 30, sp.S[1] - 10, 60, 70, 0, 0, 6.283); g.fill(); }
    g.fillStyle = c.dark;
    g.beginPath(); trace(g, smooth([[sp.H[0] - 70, sp.H[1] - 20], [sp.H[0] - 30, sp.H[1] + 10], [sp.H[0] + 10, sp.H[1] + 70], [sp.H[0] - 80, sp.H[1] + 90]], true, 6)); g.fill();
    g.beginPath(); trace(g, smooth([[sp.S[0] - 46, sp.S[1] - 40], [sp.S[0] - 30, sp.S[1] + 10], [sp.S[0] - 20, sp.S[1] + 70], [sp.S[0] - 64, sp.S[1] + 60]], true, 6)); g.fill();
    g.fillStyle = 'rgba(60,25,40,0.35)'; g.beginPath(); g.ellipse(0, sp.S[1] + 80, 230, 40, 0, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,240,210,0.3)'; g.beginPath(); g.ellipse(-20, sp.S[1] - 92, 220, 24, 0, 0, 6.283); g.fill();
    g.filter = 'none';
  });
  nearP.forEach((P) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.filter = `blur(${(6 * S).toFixed(2)}px)`; g.fillStyle = c.dark; g.beginPath(); trace(g, smooth(limb([b[0], b[1], b[2]], P.l.R.map((r) => r * 0.55)).map((p) => [p[0] + (P.l.front ? -14 : -18), p[1] + 6]), true, 3)); g.fill(); }));
  g.filter = 'none';
  // marcas da pelagem (bordas macias)
  g.filter = `blur(${(1.1 * S).toFixed(2)}px)`;
  const top = Math.min(...sp.torso.map((p) => p[1])), bot = Math.max(...sp.torso.map((p) => p[1])), x0 = Math.min(...sp.torso.map((p) => p[0])), x1 = Math.max(...sp.torso.map((p) => p[0]));
  const legSpots = (fn) => nearP.forEach((P, i) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; for (let n = 0; n < 12; n++) { const q = n / 12, seg = q < 0.5 ? [b[0], b[1], q / 0.5] : [b[1], b[2], (q - 0.5) / 0.5]; fn(lerp(seg[0][0], seg[1][0], seg[2]) + (rnd(i * 13, n) - 0.5) * 22 * (1 - q * 0.6), lerp(seg[0][1], seg[1][1], seg[2]), q, i * 50 + n); } }));
  const M = sp.marks;
  if (M === 'rosette') {
    clipTo(g, torso, () => { let k = 0; for (let gy = sp.S[1] - 74, row = 0; gy <= sp.S[1] + 64; gy += 26, row++) for (let gx = -236 + (row % 2) * 15; gx <= 200; gx += 30) { k++; const x = gx + (rnd(k, 1) - 0.5) * 10, y = gy + (rnd(k, 2) - 0.5) * 8; if (gy > sp.S[1] + 40) { g.fillStyle = c.mark; blobAt(g, x, y, 4 + rnd(k, 3) * 2, k); } else ringRosette(g, x, y, 8 + rnd(k, 4) * 2.5, k, c); } });
    legSpots((x, y, q, k) => { g.fillStyle = c.mark; blobAt(g, x, y, 3.5 + rnd(k, 1) * 1.5, k); });
  }
  if (M === 'leoRosette') {   // rosetas pequenas e densas, formadas por 3 a 5 manchinhas, centro com a cor do corpo
    clipTo(g, torso, () => { let k = 0; g.fillStyle = c.mark; for (let gy = top + 22, row = 0; gy <= bot - 10; gy += 28, row++) for (let gx = x0 + 12 + (row % 2) * 15; gx <= x1 - 10; gx += 31) { k++; const x = gx + (rnd(k, 1) - 0.5) * 8, y = gy + (rnd(k, 2) - 0.5) * 6; if (gy > bot - 40) { blobAt(g, x, y, 3.2, k); continue; } const n = 3 + Math.floor(rnd(k, 3) * 3); for (let j = 0; j < n; j++) { const a = j / n * 6.283 + rnd(k, 4) * 6; blobAt(g, x + Math.cos(a) * 9, y + Math.sin(a) * 7.5, 3.4, k * 7 + j, 5); } } });
    legSpots((x, y, q, k) => { g.fillStyle = c.mark; blobAt(g, x, y, 3 + rnd(k, 1), k); });
  }
  if (M === 'spots') {   // guepardo: pintas sólidas, redondas, bem distribuídas
    clipTo(g, torso, () => { let k = 0; g.fillStyle = c.mark; for (let gy = top + 12, row = 0; gy <= bot - 6; gy += 17, row++) for (let gx = x0 + 6 + (row % 2) * 9; gx <= x1 - 6; gx += 18) { k++; blobAt(g, gx + (rnd(k, 1) - 0.5) * 7, gy + (rnd(k, 2) - 0.5) * 5, 3.6 + rnd(k, 3) * 1.4, k, 6, 0.95); } });
    legSpots((x, y, q, k) => { g.fillStyle = c.mark; blobAt(g, x, y, 3.2, k, 6, 0.95); });
  }
  if (M === 'chain') {   // jaguatirica: manchas alongadas em faixas horizontais, borda escura e miolo mais escuro que o corpo
    clipTo(g, torso, () => { let k = 0; for (let gy = top + 22, row = 0; gy <= bot - 14; gy += 24, row++) for (let gx = x0 + (row % 2) * 20; gx <= x1; gx += 44) { k++; const x = gx + (rnd(k, 1) - 0.5) * 10, y = gy + (rnd(k, 2) - 0.5) * 6, w = 15 + rnd(k, 3) * 8, h = 7 + rnd(k, 4) * 3; g.fillStyle = c.mark; g.beginPath(); trace(g, smooth(ell(x, y, w, h, 9).map((q, j) => [q[0] + (rnd(k, j) - 0.5) * 4, q[1] + (rnd(k + 5, j) - 0.5) * 3]), true, 4)); g.fill(); g.fillStyle = c.markIn; g.beginPath(); g.ellipse(x, y, w - 5, Math.max(1, h - 4), 0, 0, 6.283); g.fill(); } });
    legSpots((x, y, q, k) => { g.fillStyle = c.mark; blobAt(g, x, y, 3.4, k); });
  }
  if (M === 'stripes') {
    clipTo(g, torso, () => { g.fillStyle = c.mark; for (let i = 0; i < 17; i++) { const x = -236 + i * 27 + (rnd(i, 1) - 0.5) * 8, tp = sp.S[1] - 100, len = 70 + rnd(i, 4) * 60, w = 3 + rnd(i, 2) * 2.5, lean = -10 - rnd(i, 8) * 16; curveStripe(g, [[x, tp], [x + lean * 0.3 + 4, tp + len * 0.5], [x + lean, tp + len]], w); if (rnd(i, 30) > 0.55) curveStripe(g, [[x + 6, tp + len * 0.45], [x + 14, tp + len * 0.7], [x + 18 + lean * 0.2, tp + len * 0.9]], w * 0.7); } });
    nearP.forEach((P, i) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.fillStyle = c.mark; [[0, 1, [0.35, 0.6, 0.85]], [1, 2, [0.3]]].forEach(([u, v, ks]) => ks.forEach((kk) => { const x = lerp(b[u][0], b[v][0], kk), y = lerp(b[u][1], b[v][1], kk), a = Math.atan2(b[v][1] - b[u][1], b[v][0] - b[u][0]) + Math.PI / 2, Lh = (u === 0 ? 40 : 22), dx = Math.cos(a) * Lh, dy = Math.sin(a) * Lh; curveStripe(g, [[x - dx, y - dy], [x + 3, y + 3], [x + dx * 0.5, y + dy * 0.5]], 3); })); }));
  }
  if (M === 'tabby') {   // gato tigrado: faixas largas e suaves no dorso e nas pernas
    clipTo(g, torso, () => { g.fillStyle = c.mark; for (let i = 0; i < 8; i++) { const x = x0 + 26 + i * (x1 - x0 - 50) / 7, tp = top - 4, len = 46 + rnd(i, 3) * 22; curveStripe(g, [[x + 4, tp], [x - 2, tp + len * 0.55], [x - 10, tp + len]], 7); } });
    nearP.forEach((P) => clipTo(g, smooth(P.leg, true, 3), () => { const b = P.l.b; g.fillStyle = c.mark; [0.3, 0.6].forEach((kk) => { const x = lerp(b[0][0], b[1][0], kk), y = lerp(b[0][1], b[1][1], kk); curveStripe(g, [[x - 22, y - 3], [x, y + 3], [x + 16, y - 2]], 5); }); }));
  }
  if (M === 'cubSpots') clipTo(g, torso, () => { g.fillStyle = c.mark; let k = 0; for (let gy = top + 20; gy < bot - 20; gy += 22) for (let gx = x0 + 20; gx < x1 - 20; gx += 26) { k++; g.globalAlpha = 0.5; blobAt(g, gx + rnd(k, 1) * 8, gy + rnd(k, 2) * 6, 4, k); } g.globalAlpha = 1; });
  g.filter = 'none';
  // pinceladas (textura pintada à mão, presa ao corpo)
  brushStrokes(g, [x0 - 30, top - 20, x1 + 40, 10], { seed: kind.length * 17, n: sp.fluff ? 700 : 520, len: sp.fluff ? 40 : 30, w: 6, ang: 0.12, light: sp.fluff ? 'rgba(255,255,255,0.4)' : undefined, dark: sp.fluff ? 'rgba(170,160,180,0.14)' : undefined });
  // cabeça
  const ha = add2(sp.headAt, [0, bob[0]]), hr = (pose.headRot || 0) * Math.PI / 180;
  g.save(); g.translate(ha[0] * (1 + flex), ha[1]); g.rotate(hr); g.scale(sp.headS, sp.headS);
  if (sp.domestic) domHead(g, kind, sp, pose, t); else catHead(g, kind, sp, pose, t);
  brushStrokes(g, [-120, -90, 150, 70], { seed: kind.length * 23, n: 70, len: 16, w: 3.5, ang: -0.2 });
  g.restore();
  // acabamento pintado: textura de pincel presa ao corpo + bordas mescladas
  const rr = painterize(lc, [S * fl, 0, 0, S, pose.x, pose.y], [x0 - 120, top - 230, x1 + 260, 40], { seed: kind.length * 7, tex: 0.9, edge: 0.7, edgeBlur: 3 * S });
  // luz da cena
  if (look.dark) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = look.dark; g.fillRect(rr[0], rr[1], rr[2], rr[3]); g.globalCompositeOperation = 'source-over'; }
  if (look.tint) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = look.tintA ?? 0.15; g.fillStyle = look.tint; g.fillRect(rr[0], rr[1], rr[2], rr[3]); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  if (look.light) lightRig(lc, rr, look.light);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lc, rr[0], rr[1], rr[2], rr[3], rr[0], rr[1], rr[2], rr[3]);
  if (look.rim) { const [rc, rg] = layer('catRim'); rg.drawImage(lc, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(lc, -(look.rimDx ?? -7), -(look.rimDy ?? -6)); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = look.rim; rg.fillRect(0, 0, W, H); ctx.drawImage(rc, 0, 0); }
  ctx.restore();
  LAYERS.catLast = lc; return rr;
}

/** cabeça de gato doméstico de perfil (Pingo, angorá): orelha grande, olho grande com íris colorida, focinho curto */
function domHead(g, kind, sp, pose, t) {
  const c = sp.c, bl = clamp(pose.blink || 0), mw = clamp(pose.meow || 0);
  // orelha (grande, pontuda) com interior rosado; tufinho no angorá
  flat(g, [[-40, -36], [-34, -96], [-26, -118, 1], [-6, -84], [4, -50]], c.base, 4);
  flat(g, [[-30, -48], [-28, -90], [-22, -104, 1], [-10, -80], [-6, -56]], c.ear, 4);
  if (sp.fluff) { flat(g, [[-60, -10], [-74, 30], [-50, 66], [-20, 50], [-40, 20]], c.base, 4); }   // colar de pelo
  const head = flat(g, [[-60, 30], [-66, -10], [-50, -50], [-14, -66], [30, -60], [62, -44], [84, -22], [98, 0], [96, 14], [80, 28], [50, 40], [0, 46]], c.base, 8);
  clipTo(g, head, () => {
    g.fillStyle = c.dark; g.beginPath(); trace(g, smooth([[-66, 0], [-30, -6], [-10, 30], [-30, 60], [-70, 50]], true, 6)); g.globalAlpha = 0.7; g.fill(); g.globalAlpha = 1;
    g.fillStyle = c.belly; g.beginPath(); trace(g, smooth([[40, 6], [76, -2], [104, 8], [92, 34], [44, 44], [24, 30]], true, 6)); g.fill();
    if (sp.marks === 'tabby') { g.fillStyle = c.mark; [[-30, -60, -24, -34], [-8, -66, -4, -40], [14, -64, 16, -44]].forEach(([a, b, x, y]) => curveStripe(g, [[a, b], [(a + x) / 2, (b + y) / 2], [x, y]], 5)); curveStripe(g, [[-62, 8], [-36, 4], [-14, 10]], 5); }
  });
  // olho grande (amêndoa) com íris colorida e pupila; pisca
  const eyeC = sp.eye || '#8CC152', open = 1 - bl;
  if (open > 0.1) {
    g.save(); g.translate(46, -18); g.scale(1, open);
    g.fillStyle = eyeC; g.beginPath(); g.ellipse(0, 0, 16, 14, -0.15, 0, 6.283); g.fill();
    g.fillStyle = '#1C1420'; g.beginPath(); g.ellipse(3, 0, 4.5 + 6 * (pose.dilate ?? 0.3), 12, 0, 0, 6.283); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-4, -5, 4, 0, 6.283); g.fill();
    g.restore();
  }
  g.strokeStyle = '#3A2418'; g.lineCap = 'round'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, -18 - 14 * open + 2); g.quadraticCurveTo(46, -32 * open - 4 + 18 * bl, 62, -22 + 8 * bl); g.stroke();
  // nariz rosado, boca (miado) e bigodes
  g.fillStyle = c.nose; g.beginPath(); trace(g, smooth([[92, -6], [102, -2, 1], [100, 8, 1], [90, 4]], true, 4)); g.fill();
  if (mw > 0.05) { g.fillStyle = '#8E3A48'; g.beginPath(); g.moveTo(96, 14); g.quadraticCurveTo(84, 22 + 22 * mw, 66, 22 + 8 * mw); g.quadraticCurveTo(80, 18, 96, 14); g.fill(); }
  else { g.strokeStyle = '#5A3A30'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(98, 12); g.quadraticCurveTo(88, 24, 72, 22); g.stroke(); }
  g.strokeStyle = 'rgba(250,245,240,0.9)'; g.lineWidth = 1.8; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(82, 10 + k * 5); g.quadraticCurveTo(120, 2 + k * 9, 150 + 6 * Math.sin(t * 2 + k), -2 + k * 16); g.stroke(); }
}

function catHead(g, kind, sp, pose, t) {
  const c = sp.c, mz = sp.mz, jaw = pose.jaw || 0, lion = !!sp.mane, tiger = sp.marks === 'stripes', face = sp.face || '';
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
    if (['rosette', 'leoRosette', 'spots', 'chain'].includes(sp.marks)) { g.fillStyle = c.mark; [[-30, -30], [-12, -44], [8, -48], [26, -40], [-36, -6], [-16, -14], [40, -22]].forEach(([x, y], i) => blobAt(g, x, y, (sp.marks === 'spots' ? 2.8 : 3.5) + rnd(i, 1) * 1.5, 70 + i)); }
    if (face === 'puma') { g.fillStyle = '#F6EDE2'; g.beginPath(); trace(g, smooth([[70, 8], [110 + mz, 0], [128 + mz, 16], [92, 36], [60, 30]], true, 5)); g.fill(); g.fillStyle = '#4A3226'; g.beginPath(); g.ellipse(100 + mz, 10, 9, 6, 0.3, 0, 6.283); g.fill(); }
    if (face === 'ocelot') { g.fillStyle = c.mark; curveStripe(g, [[30, -14], [0, 0], [-40, 6]], 4); curveStripe(g, [[30, 4], [0, 16], [-34, 26]], 4); curveStripe(g, [[56, -34], [30, -54], [0, -62]], 3.5); }
  });
  // olho: traço curto (sereno), aberto no rugido
  g.strokeStyle = '#3A2418'; g.lineCap = 'round'; g.lineWidth = 3.4;
  if (jaw > 0.3) { g.fillStyle = '#3A2418'; g.beginPath(); g.ellipse(66, -26, 7, 4, -0.15, 0, 6.283); g.fill(); }
  else { const bl = pose.blink || 0; g.beginPath(); g.moveTo(56, -26 + bl * 2); g.quadraticCurveTo(66, -22 + bl * 4, 76, -27); g.stroke(); }
  if (face === 'cheetah') { g.strokeStyle = '#1E1612'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(70, -20); g.quadraticCurveTo(84, 0, 104 + mz, 20); g.stroke(); }
  // nariz e boca
  g.fillStyle = c.nose; g.beginPath(); trace(g, smooth([[120 + mz, -18], [136 + mz, -12, 1], [134 + mz, -1, 1], [122 + mz, -4]], true, 4)); g.fill();
  if (jaw < 0.03) { g.lineWidth = 2.4; g.beginPath(); g.moveTo(132 + mz, 3); g.quadraticCurveTo(122 + mz, 18, 98 + mz * 0.6, 20); g.stroke(); }
}
