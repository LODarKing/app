// Motor de lettering autoral (JS puro: usado pelo Remotion e pela exportação de SVG em Node).
// Cada letra é um esqueleto de traços (linha central). Três "ferramentas" transformam o esqueleto em contorno:
//   nib   — bisel de batom: espessura depende da direção do traço (pena larga) e as pontas saem cortadas
//           no ângulo do bisel; pressão e micro-variação orgânica com semente
//   swell — gota: espessura segue um perfil de pressão (fino → cheio → fio), pontas arredondadas
//   mono  — linha contínua de espessura única (traço SVG nativo, pontas redondas)
// Tudo é função pura: a mesma entrada dá o mesmo contorno; a revelação parcial usa o comprimento do traço.

export function parsePath(d) {
  const tk = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi); const segs = []; let i = 0, cmd = null, cur = [0, 0], start = [0, 0];
  const num = () => parseFloat(tk[i++]);
  while (i < tk.length) {
    if (/[MLCQZ]/i.test(tk[i])) cmd = tk[i++].toUpperCase();
    if (cmd === 'M') { cur = [num(), num()]; start = cur; cmd = 'L'; continue; }
    if (cmd === 'L') { const p = [num(), num()]; segs.push(['L', cur, p]); cur = p; }
    else if (cmd === 'C') { const a = [num(), num()], b = [num(), num()], p = [num(), num()]; segs.push(['C', cur, a, b, p]); cur = p; }
    else if (cmd === 'Q') { const a = [num(), num()], p = [num(), num()]; segs.push(['C', cur, [cur[0] + (2 / 3) * (a[0] - cur[0]), cur[1] + (2 / 3) * (a[1] - cur[1])], [p[0] + (2 / 3) * (a[0] - p[0]), p[1] + (2 / 3) * (a[1] - p[1])], p]); cur = p; }
    else if (cmd === 'Z') { segs.push(['L', cur, start]); cur = start; }
  }
  return segs;
}
function sampleSegs(segs, n = 40) {
  const pts = [];
  for (const s of segs) {
    if (s[0] === 'L') { if (!pts.length) pts.push(s[1]); for (let k = 1; k <= 8; k++) pts.push([s[1][0] + (s[2][0] - s[1][0]) * k / 8, s[1][1] + (s[2][1] - s[1][1]) * k / 8]); }
    else {
      const [, p0, p1, p2, p3] = s; if (!pts.length) pts.push(p0);
      for (let k = 1; k <= n; k++) { const t = k / n, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
    }
  }
  return pts;
}
export function resample(pts, step) {
  const out = [pts[0]]; let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1e-9) continue;
    let d = step - carry;
    while (d <= L) { out.push([a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L]); d += step; }
    carry = L - (d - step);
  }
  const last = pts[pts.length - 1], pl = out[out.length - 1]; if (Math.hypot(last[0] - pl[0], last[1] - pl[1]) > step * 0.25) out.push(last);
  return out;
}
// esqueleto (unidades da letra) → pontos na tela
export function strokePoints(d, tf, step = 1.6) {
  const raw = sampleSegs(parsePath(d)).map(([x, y]) => tf(x, y));
  return resample(raw, step);
}
const smooth = (a, r) => a.map((_, i) => { let s = 0, c = 0; for (let k = -r; k <= r; k++) { const j = i + k; if (j >= 0 && j < a.length) { s += a[j]; c++; } } return s / c; });
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function hash(n) { let a = (n * 2654435761) >>> 0; a ^= a >>> 15; a = Math.imul(a, 2246822519) >>> 0; a ^= a >>> 13; return (a >>> 0) / 4294967296; }

function tangents(p) {
  return p.map((_, i) => { const a = p[Math.max(0, i - 2)], b = p[Math.min(p.length - 1, i + 2)]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; });
}
const f1 = (v) => (Math.round(v * 10) / 10).toString();
function polyD(left, right) {
  const all = [...left, ...right.slice().reverse()]; if (all.length < 3) return '';
  return 'M' + all.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
function cut(pts, prog) {
  if (prog >= 1) return pts; if (prog <= 0) return [];
  let L = 0; const acc = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(L); }
  const target = L * prog; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (acc[i] <= target) out.push(pts[i]);
    else { const u = (target - acc[i - 1]) / (acc[i] - acc[i - 1] || 1); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]); break; }
  }
  return out;
}
export function lengthOf(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }

// --- bisel de batom
export function nibOutline(full, o, prog = 1) {
  const pts = cut(full, prog); if (pts.length < 2) return '';
  const N = full.length, n = pts.length, T = tangents(pts), al = (o.angle * Math.PI) / 180, u = [Math.cos(al), Math.sin(al)];
  const seed = o.seed || 1, fq = 1.3 + hash(seed) * 1.6, ph = hash(seed + 7) * 6.28;
  let w = T.map((t, i) => {
    const th = Math.atan2(t[1], t[0]), s = i / Math.max(1, N - 1);
    const dir = Math.pow(Math.abs(Math.sin(th - al)), o.k ?? 2.2);
    const press = (o.pIn ?? 0.7) + (1 - (o.pIn ?? 0.7)) * smoothstep(0, 0.14, s) - (o.pOut ?? 0.15) * smoothstep(0.82, 1, s);
    const org = 1 + (o.wobble ?? 0.05) * Math.sin(6.283 * fq * s + ph);
    return (o.wmin + (o.wmax - o.wmin) * dir) * press * org;
  });
  w = smooth(w, 3);
  const L = [], R = [];
  for (let i = 0; i < n; i++) { const t = T[i], nn = [-t[1], t[0]], h = w[i] / 2; L.push([pts[i][0] + nn[0] * h, pts[i][1] + nn[1] * h]); R.push([pts[i][0] - nn[0] * h, pts[i][1] - nn[1] * h]); }
  // pontas cortadas no ângulo do bisel
  const bevel = (i) => { const t = T[i], nn = [-t[1], t[0]]; let un = u[0] * nn[0] + u[1] * nn[1]; if (Math.abs(un) < 0.62) un = 0.62 * (un < 0 ? -1 : 1); const a = (w[i] / 2) / un; return [[pts[i][0] + u[0] * a, pts[i][1] + u[1] * a], [pts[i][0] - u[0] * a, pts[i][1] - u[1] * a]]; };
  if (o.capStart !== 'round') { const [a, b] = bevel(0); L[0] = a; R[0] = b; }
  if (!(o.capEnd === 'round' && prog >= 1)) { const [a2, b2] = bevel(n - 1); L[n - 1] = a2; R[n - 1] = b2; }
  return polyD(L, R);
}
// --- gota (perfil de pressão)
export function swellOutline(full, o, prog = 1) {
  const pts = cut(full, prog); if (pts.length < 2) return '';
  const N = full.length, n = pts.length, T = tangents(pts), prof = o.profile || [0.25, 1, 0.3];
  const at = (s) => { const x = s * (prof.length - 1), i = Math.min(prof.length - 2, Math.floor(x)), u = x - i; const e = u * u * (3 - 2 * u); return prof[i] + (prof[i + 1] - prof[i]) * e; };
  const w = T.map((_, i) => o.wmin + (o.wmax - o.wmin) * at(i / Math.max(1, N - 1)));
  const L = [], R = [];
  for (let i = 0; i < n; i++) { const t = T[i], nn = [-t[1], t[0]], h = w[i] / 2; L.push([pts[i][0] + nn[0] * h, pts[i][1] + nn[1] * h]); R.push([pts[i][0] - nn[0] * h, pts[i][1] - nn[1] * h]); }
  const cap = (i, dir) => { const t = T[i], h = w[i] / 2, c = pts[i], out = []; const base = Math.atan2(t[1], t[0]) + (dir > 0 ? -Math.PI / 2 : Math.PI / 2); for (let k = 1; k < 8; k++) { const a = base + dir * Math.PI * k / 8; out.push([c[0] + Math.cos(a) * h, c[1] + Math.sin(a) * h]); } return out; };
  const endCap = cap(n - 1, 1), startCap = cap(0, 1);
  const all = [...L, ...endCap, ...R.slice().reverse(), ...startCap];
  return 'M' + all.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// --- linha contínua
export function monoD(full, prog = 1) { const pts = cut(full, prog); if (pts.length < 2) return ''; return 'M' + pts.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L'); }
export function headOf(full, prog) { const pts = cut(full, Math.max(0.0001, prog)); return pts[pts.length - 1]; }
// trecho [a, b] (frações do comprimento) de um traço — para a "fita" que se desprende e viaja
export function windowPts(full, a, b) {
  a = Math.max(0, a); b = Math.min(1, b); if (b <= a) return [];
  let L = 0; const acc = [0]; for (let i = 1; i < full.length; i++) { L += Math.hypot(full[i][0] - full[i - 1][0], full[i][1] - full[i - 1][1]); acc.push(L); }
  const A = a * L, B = b * L, out = [];
  const lerpAt = (x) => { let i = 1; while (i < acc.length - 1 && acc[i] < x) i++; const u = (x - acc[i - 1]) / (acc[i] - acc[i - 1] || 1); return [full[i - 1][0] + (full[i][0] - full[i - 1][0]) * u, full[i - 1][1] + (full[i][1] - full[i - 1][1]) * u]; };
  out.push(lerpAt(A)); for (let i = 0; i < full.length; i++) if (acc[i] > A && acc[i] < B) out.push(full[i]); out.push(lerpAt(B));
  return out;
}
