// Felinos selvagens em perfil (olhando para a direita): onça-pintada, tigre e leão.
// Cada espécie tem proporções, cabeça e pelagem próprias; o rig (pernas com IK, cauda, mandíbula) é comum.
// Coordenadas locais: chão em y = 0, centro do corpo em x = 0, y para baixo.
import React from 'react';
import { shape, curve, ellipse, f, lerp, clamp } from '../lib/paths';
import { limbD, capsuleD } from '../lib/limb';
import { solve2 } from '../lib/anim';

type Pt = number[];
type Species = 'jaguar' | 'tiger' | 'lion';
type Spec = {
  S: Pt; H: Pt;                       // ombro e quadril (articulações)
  fl: [number, number]; hl: [number, number];   // comprimentos: braço/antebraço; coxa/canela
  fr: [number, number, number]; hr: [number, number, number];   // raios nas articulações
  pastern: Pt; meta: Pt;              // vetor pulso->pata (dianteira) e jarrete->pata (traseira) em apoio
  pawR: [number, number];
  homeF: number; homeH: number; stride: number; lift: number;
  torso: Pt[];
  neck: [Pt, Pt, number];             // base, ponta, raio
  headAt: Pt; headS: number;
  tail: { root: Pt; len: number; w: number; droop: number };
  c: { base: string; light: string; shade: string; belly: string; line: string; mark: string; far: string; nose: string; iris: string };
};

const SPECS: Record<Species, Spec> = {
  // onça-pintada: robusta, pernas curtas e grossas, cabeça grande, cauda curta, rosetas com pintas no centro
  jaguar: {
    S: [118, -176], H: [-150, -186], fl: [74, 78], hl: [80, 76], fr: [36, 24, 19], hr: [46, 27, 17],
    pastern: [8, 26], meta: [24, 58], pawR: [27, 13], homeF: 128, homeH: -128, stride: 120, lift: 34,
    torso: [[96, -272], [20, -262], [-70, -258], [-150, -268], [-200, -240], [-216, -190], [-200, -132], [-160, -106], [-118, -118], [-60, -122], [20, -112], [92, -100], [150, -112], [188, -160], [188, -214], [150, -252]],
    neck: [[150, -214], [214, -236], 58], headAt: [222, -248], headS: 1.14,
    tail: { root: [-204, -236], len: 220, w: 30, droop: 0.9 },
    c: { base: '#E8A43C', light: '#F6CC7E', shade: '#C9832A', belly: '#FBEBCB', line: '#3B2312', mark: '#2A1A0E', far: '#B87428', nose: '#8E4A3C', iris: '#E7B53C' },
  },
  // tigre: o maior, corpo longo, laranja com listras escuras, peito e barriga brancos
  tiger: {
    S: [150, -200], H: [-178, -208], fl: [86, 92], hl: [92, 90], fr: [38, 25, 20], hr: [48, 28, 18],
    pastern: [8, 28], meta: [26, 64], pawR: [30, 14], homeF: 160, homeH: -150, stride: 140, lift: 38,
    torso: [[124, -302], [30, -292], [-80, -288], [-178, -298], [-234, -268], [-248, -212], [-232, -150], [-190, -118], [-140, -134], [-70, -140], [30, -130], [118, -116], [180, -128], [220, -180], [220, -240], [182, -284]],
    neck: [[180, -236], [250, -262], 62], headAt: [258, -272], headS: 1.12,
    tail: { root: [-236, -266], len: 300, w: 30, droop: 1.0 },
    c: { base: '#F08A26', light: '#FFB25A', shade: '#CF6C14', belly: '#FFF6EA', line: '#2E1A0C', mark: '#1E140C', far: '#C46612', nose: '#C77A70', iris: '#F2C341' },
  },
  // leão: pernas mais longas, pelagem lisa cor de areia, juba, tufo escuro na ponta da cauda
  lion: {
    S: [140, -214], H: [-166, -220], fl: [92, 98], hl: [96, 94], fr: [36, 23, 18], hr: [46, 26, 17],
    pastern: [8, 28], meta: [26, 64], pawR: [30, 14], homeF: 150, homeH: -138, stride: 140, lift: 38,
    torso: [[110, -314], [20, -300], [-80, -298], [-166, -308], [-220, -282], [-234, -226], [-218, -162], [-176, -132], [-130, -150], [-60, -158], [30, -148], [112, -134], [176, -146], [210, -200], [208, -256], [172, -298]],
    neck: [[170, -250], [236, -282], 64], headAt: [246, -292], headS: 1.08,
    tail: { root: [-222, -280], len: 290, w: 22, droop: 1.15 },
    c: { base: '#D9A75E', light: '#EECB8E', shade: '#B9853F', belly: '#F2DDB2', line: '#3A2414', mark: '#5A3416', far: '#A87535', nose: '#7C4434', iris: '#D9A53A' },
  },
};

export type CatPose = {
  x: number; y: number; s: number; flip?: boolean;
  walk?: number;        // fase do passo (ciclos)
  moving?: number;      // 0 parado, 1 caminhando
  headRot?: number;     // graus (positivo = abaixa)
  jaw?: number;         // 0 fechada, 1 rugido
  blink?: number;
  tail?: number;        // tempo para o balanço da cauda
  look?: number;
};

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const add = (a: Pt, b: Pt) => [a[0] + b[0], a[1] + b[1]];
const rot = (v: Pt, deg: number) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

/** posição da pata no ciclo: apoio (60%) desliza para trás, balanço (40%) sobe e volta */
function foot(home: number, ph: number, sp: Spec, moving: number, rest = 0) {
  const q = ((ph % 1) + 1) % 1;
  let x: number, y: number, fold = 0;
  if (q < 0.6) { x = lerp(sp.stride / 2, -sp.stride / 2, q / 0.6); y = 0; }
  else { const k = (q - 0.6) / 0.4, e = k * k * (3 - 2 * k); x = lerp(-sp.stride / 2, sp.stride / 2, e); y = -sp.lift * Math.sin(k * Math.PI); fold = Math.sin(k * Math.PI); }
  return { x: home + x * moving + rest * (1 - moving), y: y * moving, fold: fold * moving, stance: q < 0.6 ? Math.sin((q / 0.6) * Math.PI) : 0 };
}

function legs(sp: Spec, walk: number, moving: number, bob: Pt) {
  const out: { front: boolean; near: boolean; d: string; pawD: string; bones: Pt[]; stance: number }[] = [];
  // sequência lateral: traseira esq., dianteira esq., traseira dir., dianteira dir.
  const L = [{ front: false, near: true, o: 0, rest: -12 }, { front: true, near: true, o: 0.25, rest: 14 }, { front: false, near: false, o: 0.5, rest: 18 }, { front: true, near: false, o: 0.75, rest: -22 }];
  for (const l of L) {
    const ft = foot(l.front ? sp.homeF : sp.homeH, walk + l.o, sp, moving, l.rest);
    const dx = l.near ? 0 : 14;
    const root = add(l.front ? sp.S : sp.H, [dx, l.front ? bob[0] : bob[1]]);
    const P = [ft.x + dx, ft.y];
    if (l.front) {
      const pv = rot(sp.pastern, ft.fold * 75);            // o pulso dobra para trás no balanço
      const W = [P[0] - sp.pastern[0], P[1] - sp.pastern[1]];
      const ik = solve2(root[0], root[1], W[0], W[1], sp.fl[0], sp.fl[1], 1);
      const E = [ik.ex, ik.ey], Pp = add(W, pv);
      out.push({ front: true, near: l.near, d: limbD(root, E, W, sp.fr[0], sp.fr[1], sp.fr[2]), pawD: capsuleD(W, [Pp[0], Pp[1] - sp.pawR[1]], sp.fr[2], sp.pawR[1] * 1.1), bones: [root, E, W, Pp], stance: ft.stance });
    } else {
      const mv = rot(sp.meta, -ft.fold * 30);
      const Hk = [P[0] - sp.meta[0], P[1] - sp.meta[1]];
      const ik = solve2(root[0], root[1], Hk[0], Hk[1], sp.hl[0], sp.hl[1], -1);
      const K = [ik.ex, ik.ey], Pp = add(Hk, mv);
      out.push({ front: false, near: l.near, d: limbD(root, K, Hk, sp.hr[0], sp.hr[1], sp.hr[2]), pawD: capsuleD(Hk, [Pp[0], Pp[1] - sp.pawR[1]], sp.hr[2], sp.pawR[1] * 1.1), bones: [root, K, Hk, Pp], stance: ft.stance });
    }
  }
  return out;
}

/** marcas da pelagem ao longo de um osso (pintas, listras) */
function boneMarks(kind: Species, a: Pt, b: Pt, r: number, seed: number, color: string) {
  const els: React.ReactNode[] = [];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  if (kind === 'jaguar') {
    for (let i = 0; i < 4; i++) {
      const k = 0.15 + i * 0.22, o = (rnd(seed + i) - 0.5) * r * 1.1, x = a[0] + dx * k + nx * o, y = a[1] + dy * k + ny * o;
      els.push(<path key={`${seed}${i}`} d={ellipse(x, y, 5 + rnd(seed + i + 9) * 4, 4 + rnd(seed + i + 3) * 3)} fill={color} />);
    }
  } else if (kind === 'tiger') {
    for (let i = 0; i < 3; i++) {
      const k = 0.18 + i * 0.26, x = a[0] + dx * k, y = a[1] + dy * k, w = r * 1.4;
      els.push(<path key={`${seed}${i}`} d={shape([[x - nx * w - ux * 4, y - ny * w - uy * 4], [x + nx * w * 0.2 - ux * 6, y + ny * w * 0.2 - uy * 6], [x + nx * w * 0.3 + ux * 2, y + ny * w * 0.3 + uy * 2], [x - nx * w + ux * 5, y - ny * w + uy * 5]])} fill={color} />);
    }
  }
  return els;
}

const Head: React.FC<{ kind: Species; sp: Spec; jaw: number; blink: number; id: string; t: number }> = ({ kind, sp, jaw, blink, id, t }) => {
  const c = sp.c, st = { stroke: c.line, strokeWidth: 5.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const lion = kind === 'lion', tiger = kind === 'tiger';
  const mz = lion ? 14 : tiger ? 8 : 0;      // focinho mais longo
  const upper = shape([[-54, 20], [-52, -24], [-32, -58], [6, -74], [50, -64], [80, -44], [104 + mz, -30], [124 + mz, -22], [133 + mz, -8, 1], [127 + mz, 10], [108 + mz, 20], [62, 28], [10, 36]]);
  const ja = jaw * 32;
  const lower = shape([[0, 24], [94 + mz, 20], [98 + mz, 30], [74 + mz * 0.6, 44], [26, 48], [-18, 40]]);
  const earC = [-14, -58];
  const mane = lion ? scallopMane(t) : null;
  return (
    <g>
      {mane ? <g>
        <path d={mane.back} fill="#7A4318" stroke={c.line} strokeWidth={5.5} strokeLinejoin="round" />
        <path d={mane.mid} fill="#9A5A22" />
      </g> : null}
      {/* mandíbula (gira no rugido) */}
      <g transform={`rotate(${f(ja)} 14 26)`}>
        <path d={lower} fill={c.belly} {...st} />
        {jaw > 0.05 ? <path d={`M${78 + mz} 24 L${86 + mz} 6 L${92 + mz} 24 Z`} fill="#FFFDF5" stroke={c.line} strokeWidth={2.5} strokeLinejoin="round" /> : null}
      </g>
      {jaw > 0.05 ? <path d={shape([[10, 26], [100 + mz, 18], [92 + mz, 30 + ja * 0.8], [30, 40 + ja * 0.4]])} fill="#7E2630" /> : null}
      {jaw > 0.05 ? <path d={ellipse(50, 30 + ja * 0.3, 30, 8 * jaw)} fill="#D9606E" transform={`rotate(${f(ja * 0.5)} 14 26)`} /> : null}
      {/* orelha arredondada */}
      <g>
        <path d={ellipse(earC[0], earC[1], 22, 24)} fill={tiger ? '#24160C' : c.base} {...st} />
        {tiger ? <path d={ellipse(earC[0] - 2, earC[1] - 2, 9, 9)} fill="#FFFFFF" /> : <path d={ellipse(earC[0] + 4, earC[1] + 2, 11, 13)} fill={c.shade} />}
      </g>
      <path d={upper} fill={c.base} {...st} />
      <defs><clipPath id={`${id}hd`}><path d={upper} /></clipPath></defs>
      <g clipPath={`url(#${id}hd)`}>
        <path d={ellipse(10, -46, 50, 18)} fill={c.light} opacity={0.6} />
        {/* focinho e bochecha claros */}
        <path d={shape([[60, 0], [96 + mz, -10], [134 + mz, 4], [124 + mz, 30], [70, 34], [20, 34], [26, 14]])} fill={c.belly} />
        {kind === 'jaguar' ? [[-20, -30], [-2, -44], [18, -50], [30, -36], [8, -26], [-30, -6], [-12, -10], [40, -20], [-36, -40], [4, -8]].map(([x, y], i) => <path key={i} d={ellipse(x, y, 4.5 + rnd(i) * 2.5, 4 + rnd(i + 2) * 2)} fill={c.mark} />) : null}
        {tiger ? <>
          {[[-30, -56, -26, -4], [-12, -64, -4, -28], [6, -68, 16, -40], [26, -66, 32, -46]].map(([x0, y0, x1, y1], i) => <path key={i} d={`M${x0 - 5} ${y0} Q${(x0 + x1) / 2 - 2} ${(y0 + y1) / 2} ${x1} ${y1} Q${(x0 + x1) / 2 + 6} ${(y0 + y1) / 2} ${x0 + 6} ${y0} Z`} fill={c.mark} />)}
          {[[-50, 4, -8, 0], [-48, 20, -6, 14]].map(([x0, y0, x1, y1], i) => <path key={`c${i}`} d={`M${x0} ${y0 - 5} Q${(x0 + x1) / 2} ${y0 - 8} ${x1} ${y1} Q${(x0 + x1) / 2} ${y0 + 6} ${x0} ${y0 + 5} Z`} fill={c.mark} />)}
          <path d={ellipse(58, -48, 12, 6)} fill="#FFFFFF" opacity={0.95} />
        </> : null}
        {lion ? <path d={ellipse(64, -46, 12, 5)} fill={c.light} /> : null}
      </g>
      {/* olho (pupila redonda nos grandes felinos) */}
      <g transform={`rotate(-8 62 -30)`}>
        <path d={shape([[46, -30, 1], [62, -40], [78, -32, 1], [62, -22]])} fill={c.iris} stroke={c.line} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={66} cy={-31} r={4.6} fill="#120C08" />
        <circle cx={64} cy={-33} r={1.8} fill="#FFFFFF" />
        {blink > 0.05 ? <path d={shape([[44, -32, 1], [62, -42], [80, -33, 1], [62, -42 + 20 * blink]])} fill={c.base} stroke={c.line} strokeWidth={3} /> : null}
      </g>
      <path d={curve([[40, -44], [60, -50], [80, -42]])} stroke={c.line} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
      {/* nariz, boca, bigodes */}
      <path d={shape([[112 + mz, -20], [130 + mz, -14, 1], [128 + mz, -2, 1], [116 + mz, -6]])} fill={c.nose} stroke={c.line} strokeWidth={3.5} strokeLinejoin="round" />
      {jaw < 0.05 ? <path d={curve([[126 + mz, 4], [118 + mz, 16], [98 + mz, 20], [78 + mz, 18]])} stroke={c.line} strokeWidth={4} fill="none" strokeLinecap="round" /> : <path d={`M${80 + mz} 20 L${88 + mz} 34 L${96 + mz} 20 Z`} fill="#FFFDF5" stroke={c.line} strokeWidth={2.5} strokeLinejoin="round" />}
      {[0, 1, 2].map((k) => <circle key={k} cx={98 + mz + k * 7} cy={6 + (k % 2) * 5} r={2.2} fill={c.line} opacity={0.6} />)}
      {[0, 1, 2].map((k) => <path key={`w${k}`} d={curve([[100 + mz, 8 + k * 4], [140 + mz, 2 + k * 10], [176 + mz, -4 + k * 18]])} stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.95} />)}
      {mane ? <path d={mane.front} fill="#B06A2A" stroke={c.line} strokeWidth={5} strokeLinejoin="round" /> : null}
    </g>
  );
};

function scallopMane(t: number) {
  const sway = Math.sin(t * 1.3) * 3;
  const ring = (rx: number, ry: number, cx: number, cy: number, n: number, amp: number, a0: number, a1: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, r = 1 + (i % 2 ? amp : 0);
      pts.push([cx + Math.cos(a) * rx * r + (i % 2 ? sway : 0), cy + Math.sin(a) * ry * r]);
    }
    return pts;
  };
  const back = shape([...ring(104, 116, -10, 14, 18, 0.15, -1.2, -4.75), [40, 118], [74, 70], [40, 40]]);
  const mid = shape([...ring(84, 96, -6, 14, 16, 0.12, -1.25, -4.6), [44, 92], [50, 50]]);
  const front = shape([[-2, -70], [16, -66], [2, -52], [16, -44], [-2, -34], [-22, -48]]);
  return { back, mid, front };
}

export const BigCat: React.FC<{ kind: Species; pose: CatPose; t: number; id: string }> = ({ kind, pose, t, id }) => {
  const sp = SPECS[kind], c = sp.c;
  const walk = pose.walk ?? 0, mv = pose.moving ?? 0;
  const st = { stroke: c.line, strokeWidth: 5.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const bob: Pt = [mv * 5 * Math.sin((walk + 0.1) * Math.PI * 4), mv * 4 * Math.sin((walk + 0.35) * Math.PI * 4)];
  const L = legs(sp, walk, mv, bob);
  // escápula rola: o topo do ombro sobe quando a pata dianteira próxima está apoiada
  const nf = L.find((l) => l.front && l.near)!;
  const torsoPts = sp.torso.map((p, i) => {
    const front = p[0] > 40 ? 1 : 0, rear = p[0] < -100 ? 1 : 0;
    let y = p[1] + bob[0] * front + bob[1] * rear;
    if (i === 0) y -= 10 * nf.stance * mv;
    return [p[0], y];
  });
  const torso = shape(torsoPts);
  // cauda
  const tr = sp.tail, sw = Math.sin((pose.tail ?? t) * 2.2), sw2 = Math.sin((pose.tail ?? t) * 2.2 - 1.1);
  const r0 = add(tr.root, [0, bob[1]]);
  const tailPts: Pt[] = [r0, [r0[0] - tr.len * 0.16, r0[1] + tr.len * 0.36 * tr.droop + sw * 5], [r0[0] - tr.len * 0.3, r0[1] + tr.len * 0.66 * tr.droop + sw * 12], [r0[0] - tr.len * 0.5, r0[1] + tr.len * 0.8 * tr.droop + sw2 * 18], [r0[0] - tr.len * 0.7, r0[1] + tr.len * 0.7 * tr.droop + sw2 * 30]];
  const tailD = curve(tailPts);
  const headRot = pose.headRot ?? 0;
  const ha = add(sp.headAt, [0, bob[0]]);
  const legEl = (l: typeof L[number], i: number, near = false) => {
    const fill = l.near ? c.base : c.far;
    const [W, Pp] = [l.bones[2], l.bones[3]];
    const pw = sp.pawR[0], ph = sp.pawR[1];
    const lid = `${id}l${i}`;
    // pata arredondada, dedos para a frente
    const paw = shape([[Pp[0] - pw * 0.7, Pp[1]], [Pp[0] - pw * 0.78, Pp[1] - ph * 1.4], [Pp[0] - pw * 0.1, Pp[1] - ph * 2.1], [Pp[0] + pw * 0.75, Pp[1] - ph * 1.5], [Pp[0] + pw * 1.0, Pp[1] - ph * 0.3], [Pp[0] + pw * 0.8, Pp[1] + 1]]);
    const toes = `M${f(Pp[0] + pw * 0.42)} ${f(Pp[1] - ph * 0.85)} L${f(Pp[0] + pw * 0.5)} ${f(Pp[1])} M${f(Pp[0] + pw * 0.02)} ${f(Pp[1] - ph * 1.0)} L${f(Pp[0] + pw * 0.08)} ${f(Pp[1])}`;
    // contorno único da silhueta: traço duplo por baixo, preenchimentos por cima (sem anéis nas juntas)
    const outline = { stroke: c.line, strokeWidth: 11, strokeLinejoin: 'round' as const, fill: c.line };
    return <g key={i}>
      <g mask={near ? `url(#${id}out)` : undefined}><path d={l.d} {...outline} /><path d={l.pawD} {...outline} /></g>
      <path d={paw} {...outline} />
      <path d={l.d} fill={fill} /><path d={l.pawD} fill={fill} /><path d={paw} fill={fill} />
      <path d={toes} stroke={c.line} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      {l.near ? <g><defs><clipPath id={lid}><path d={l.d} /></clipPath></defs><g clipPath={`url(#${lid})`}>{boneMarks(kind, l.bones[0], l.bones[1], l.front ? sp.fr[0] * 0.5 : sp.hr[0] * 0.5, i * 31 + 7, c.mark)}{boneMarks(kind, l.bones[1], l.bones[2], l.front ? sp.fr[1] * 0.7 : sp.hr[1] * 0.7, i * 31 + 17, c.mark)}</g></g> : null}
    </g>;
  };
  // marcas do tronco (em coordenadas do corpo)
  const marks: React.ReactNode[] = [];
  if (kind === 'jaguar') {
    let k = 0;
    for (let gy = -282, row = 0; gy <= -100; gy += 50, row++) for (let gx = -236 + (row % 2) * 28; gx <= 210; gx += 56) {
      k++; const x = gx + (rnd(k) - 0.5) * 16, y = gy + (rnd(k + 50) - 0.5) * 12, r = 18 + rnd(k + 9) * 6, small = gy > -140;
      if (small) { marks.push(<path key={`p${k}`} d={ellipse(x, y, 8, 6.5)} fill={c.mark} />); continue; }
      marks.push(<path key={`c${k}`} d={ellipse(x, y, r * 0.8, r * 0.7)} fill={c.shade} opacity={0.7} />);
      const n = 5;
      for (let j = 0; j < n; j++) { if (rnd(k * 7 + j) < 0.15) continue; const a = (j / n) * Math.PI * 2 + rnd(k) * 2, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.85; marks.push(<path key={`r${k}${j}`} d={ellipse(px, py, 9, 5.2)} transform={`rotate(${f(a * 57.3 + 90)} ${f(px)} ${f(py)})`} fill={c.mark} />); }
      if (rnd(k + 3) > 0.3) marks.push(<circle key={`d${k}`} cx={x + 2} cy={y} r={3.8} fill={c.mark} />);
    }
  } else if (kind === 'tiger') {
    // listras finas, irregulares, algumas bifurcadas, acompanhando a curvatura do corpo
    const stripe = (key: string, x: number, top: number, len: number, w: number, lean: number) => <path key={key} d={`M${f(x - w)} ${f(top)} C${f(x - w * 0.8 + lean * 0.3)} ${f(top + len * 0.35)} ${f(x + lean * 0.7 - 2)} ${f(top + len * 0.75)} ${f(x + lean)} ${f(top + len)} C${f(x + lean * 0.6 + w * 0.5)} ${f(top + len * 0.7)} ${f(x + w * 0.6 + lean * 0.2)} ${f(top + len * 0.35)} ${f(x + w)} ${f(top)} Z`} fill={c.mark} />;
    for (let i = 0; i < 16; i++) {
      const x = -236 + i * 29 + (rnd(i) - 0.5) * 12, len = 54 + rnd(i + 4) * 80, w = 5 + rnd(i + 2) * 4, lean = 10 + (rnd(i + 8) - 0.5) * 26;
      marks.push(stripe(`s${i}`, x, -312, len, w, lean));
      if (rnd(i + 30) > 0.55) marks.push(stripe(`f${i}`, x + lean * 0.5 + 6, -312 + len * 0.45, len * 0.5, w * 0.7, lean * 0.8 + 8));
      if (rnd(i + 20) > 0.45) marks.push(stripe(`b${i}`, x + 12, -118, -(36 + rnd(i + 40) * 40), w * 0.8, -lean * 0.6));
    }
  }
  return (
    <g transform={`translate(${f(pose.x)} ${f(pose.y)}) scale(${f(pose.s * (pose.flip ? -1 : 1))} ${f(pose.s)})`}>
      <ellipse cx={-10} cy={6} rx={sp.stride + 130} ry={16} fill="#000" opacity={0.2} />
      {/* cauda (atrás) */}
      <path d={tailD} stroke={c.line} strokeWidth={tr.w + 11} fill="none" strokeLinecap="round" />
      <path d={tailD} stroke={c.base} strokeWidth={tr.w} fill="none" strokeLinecap="round" />
      {kind !== 'lion' ? <path d={tailD} stroke={c.mark} strokeWidth={tr.w} fill="none" strokeDasharray={kind === 'tiger' ? '12 22' : '9 26'} strokeDashoffset={-30} opacity={0.9} /> : null}
      {kind === 'lion' ? <path d={ellipse(tailPts[4][0] - 6, tailPts[4][1] + 6, 20, 26)} fill="#4A2A12" stroke={c.line} strokeWidth={5} /> : null}
      {/* pernas do lado oposto */}
      {L.filter((l) => !l.near).map((l, i) => legEl(l, i))}
      {/* pescoço + tronco */}
      <path d={capsuleD(sp.neck[0], add(sp.neck[1], [0, bob[0]]), sp.neck[2], sp.neck[2] * 0.8)} fill={c.base} {...st} />
      <path d={torso} fill={c.base} {...st} />
      <defs>
        <clipPath id={`${id}tc`}><path d={torso} /></clipPath>
        <mask id={`${id}out`} maskUnits="userSpaceOnUse" x={-900} y={-900} width={1800} height={1800}><rect x={-900} y={-900} width={1800} height={1800} fill="#fff" /><path d={torso} fill="#000" /></mask>
      </defs>
      <g clipPath={`url(#${id}tc)`}>
        <path d={ellipse(10, -96, 175, 42)} fill={c.belly} opacity={kind === 'jaguar' ? 0.9 : 1} />
        <path d={ellipse(sp.S[0] + 50, -120, 60, 50)} fill={c.belly} opacity={kind === 'jaguar' ? 0.9 : 1} />
        <path d={ellipse(-20, -300, 220, 40)} fill={c.light} opacity={0.45} />
        {marks}
      </g>
      {/* pernas do lado próximo: saem do corpo sem costura (contorno só fora do tronco) */}
      {L.filter((l) => l.near).map((l, i) => legEl(l, i + 4, true))}
      {/* linhas de músculo: escápula e coxa */}
      {L.filter((l) => l.near).map((l, i) => {
        const R = l.bones[0];
        const d = l.front ? curve([[R[0] - 26, R[1] - 50], [R[0] - 40, R[1] - 8], [R[0] - 30, R[1] + 30]]) : curve([[R[0] + 26, R[1] - 46], [R[0] + 50, R[1] - 4], [R[0] + 44, R[1] + 36]]);
        return <path key={`m${i}`} d={d} stroke={c.line} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.45} />;
      })}
      {/* cabeça */}
      <g transform={`translate(${f(ha[0])} ${f(ha[1])}) rotate(${f(headRot)}) scale(${sp.headS})`}>
        <Head kind={kind} sp={sp} jaw={pose.jaw ?? 0} blink={pose.blink ?? 0} id={id} t={t} />
      </g>
    </g>
  );
};
