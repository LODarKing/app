// v2 vector pipeline: SVG path data -> Three.js meshes, drawn in strict painter's order.
// Each Part writes its own stencil value so its shading/inner lines are clipped to its silhouette,
// like a clipping mask in Illustrator. Outlines are drawn centred on the silhouette, unclipped.
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const loader = new SVGLoader();
const pathCache = new Map(), fillCache = new Map(), strokeCache = new Map();
const CURVE_SEG = 18;
export const OL_SCALE = 0.8;   // global outline weight (sheets use fine, soft lines)

function parse(d) {
  let p = pathCache.get(d);
  if (!p) {
    const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
    p = data.paths[0]; pathCache.set(d, p);
  }
  return p;
}
function parseNoCache(d) {
  return loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths[0];
}
export function fillGeo(d, dyn = false) {
  let g = dyn ? null : fillCache.get(d);
  if (!g) {
    const shapes = SVGLoader.createShapes(dyn ? parseNoCache(d) : parse(d));
    g = new THREE.ShapeGeometry(shapes, CURVE_SEG);
    if (!dyn) fillCache.set(d, g); else g.userData.dyn = true;
  }
  return g;
}
export function strokeGeo(d, w, closedHint = true, dyn = false) {
  const key = d + '|' + w;
  let g = dyn ? null : strokeCache.get(key);
  if (!g) {
    const style = SVGLoader.getStrokeStyle(w, '#000', 'round', 'round', 4);
    const geos = [];
    for (const sp of (dyn ? parseNoCache(d) : parse(d)).subPaths) {
      const pts = sp.getPoints(CURVE_SEG);
      if (pts.length < 2) continue;
      const clean = [pts[0]];
      for (const q of pts) if (q.distanceTo(clean[clean.length - 1]) > 0.05) clean.push(q);
      if ((sp.autoClose && closedHint) && clean[0].distanceTo(clean[clean.length - 1]) > 0.05) clean.push(clean[0].clone());
      const sg = SVGLoader.pointsToStroke(clean, style, 12, 0.001);
      if (sg) geos.push(sg);
    }
    g = geos.length ? (geos.length > 1 ? mergeGeometries(geos) : geos[0]) : new THREE.BufferGeometry();
    if (!dyn) strokeCache.set(key, g); else g.userData.dyn = true;
  }
  return g;
}

const ROLE_FILL = 0, ROLE_CLIP = 1, ROLE_FREE = 2;
const gradCache = new Map();
function gradGeo(base, g) {
  const key = base.uuid + JSON.stringify(g);
  let geo = gradCache.get(key);
  if (!geo) {
    geo = base.clone();
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    const c1 = new THREE.Color(g.g[0]), c2 = new THREE.Color(g.g[1]), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const v = g.x ? pos.getX(i) : pos.getY(i), r = g.x || g.y;
      const k = Math.min(1, Math.max(0, (v - r[0]) / (r[1] - r[0])));
      c.copy(c1).lerp(c2, k); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    gradCache.set(key, geo);
  }
  return geo;
}
function mat(color, opacity, role) {
  const grad = typeof color === 'object';
  const m = new THREE.MeshBasicMaterial({ color: grad ? '#ffffff' : color, vertexColors: grad, transparent: true, opacity, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
  m.stencilWrite = true;
  if (role === ROLE_FILL) { m.stencilFunc = THREE.AlwaysStencilFunc; m.stencilZPass = THREE.ReplaceStencilOp; }
  else if (role === ROLE_CLIP) { m.stencilFunc = THREE.EqualStencilFunc; m.stencilZPass = THREE.KeepStencilOp; }
  else { m.stencilFunc = THREE.AlwaysStencilFunc; m.stencilZPass = THREE.KeepStencilOp; }
  m.userData.role = role; m.userData.baseOpacity = opacity;
  return m;
}

/**
 * A drawable layer. spec = {
 *   fill:  [[d, color], ...]             base silhouette(s), write the stencil
 *   shade: [[d, color, opacity?], ...]   clipped to the silhouette (shadows, highlights)
 *   line:  [[d, color, width], ...]      clipped inner strokes (pockets, folds)
 *   ol:    [color, width] | null         outline of every fill path
 *   top:   [[d, color], ...]             unclipped fills drawn last
 *   olFree:[[d, color, width], ...]      unclipped strokes drawn last
 * }
 */
export class Part extends THREE.Group {
  constructor(spec = {}, dyn = false) { super(); this.userData.part = true; this.items = []; this.dyn = dyn; this.set(spec); }
  set(spec) {
    const list = [];
    for (const [d, c] of spec.fill || []) list.push(['f', d, c, 1, 0, ROLE_FILL]);
    for (const [d, c, o = 1] of spec.shade || []) list.push(['f', d, c, o, 0, ROLE_CLIP]);
    for (const [d, c, w] of spec.line || []) list.push(['s', d, c, 1, w, ROLE_CLIP]);
    if (spec.ol) for (const [d] of spec.fill || []) list.push(['s', d, spec.ol[0], spec.ol[2] ?? 1, spec.ol[1] * OL_SCALE, ROLE_FREE]);
    for (const [d, c, o = 1] of spec.top || []) list.push(['f', d, c, o, 0, ROLE_FREE]);
    for (const [d, c, w, o = 1] of spec.olFree || []) list.push(['s', d, c, o, w, ROLE_FREE]);
    while (this.items.length > list.length) { const m = this.items.pop(); this.remove(m); m.material.dispose(); }
    list.forEach((it, i) => {
      const [kind, d, c, o, w, role] = it;
      let m = this.items[i];
      const grad = typeof c === 'object';
      if (m && m.userData.d === d && m.userData.w === w && !grad && !m.material.vertexColors) { m.material.color.set(c); m.material.userData.baseOpacity = o; return; }
      let geo = kind === 'f' ? fillGeo(d, this.dyn) : strokeGeo(d, w, true, this.dyn);
      if (grad) geo = gradGeo(geo, c);
      if (!m) { m = new THREE.Mesh(geo, mat(c, o, role)); this.items.push(m); this.add(m); }
      else {
        if (m.geometry.userData.dyn) m.geometry.dispose();
        m.geometry = geo;
        if (m.material.userData.role !== role || m.material.vertexColors !== grad) { m.material.dispose(); m.material = mat(c, o, role); }
        if (!grad) m.material.color.set(c);
        m.material.userData.baseOpacity = o;
      }
      m.userData.d = d; m.userData.w = w;
    });
    this.spec = spec;
    return this;
  }
}

/** Bone: a pivot in its parent's frame; art is authored in absolute sheet coordinates. */
export class Bone extends THREE.Group {
  constructor(px, py, parentPivot = [0, 0]) {
    super();
    this.pivot = [px, py];
    this.position.set(px - parentPivot[0], py - parentPivot[1], 0);
    this.art = new THREE.Group(); this.art.position.set(-px, -py, 0); this.add(this.art);
  }
  /** add a Part (or group) whose coordinates are absolute sheet coordinates */
  draw(obj, z = 0) { obj.userData.z = z; this.art.add(obj); return obj; }
  bone(px, py, z = 0) { const b = new Bone(px, py, this.pivot); b.userData.z = z; this.add(b); return b; }
}

/** Painter's order: depth-first, siblings sorted by userData.z (stable). A node with userData.layer
 *  (inherited by its subtree) is drawn in that global layer, so e.g. a hand can pass in front of a wheel
 *  that belongs to another branch. Assigns renderOrder, stencil refs and inherited opacity (userData.alpha). */
export function assignOrder(root) {
  const list = [];
  const visit = (o, alphaMul, layer) => {
    if (!o.visible) return;
    const a = alphaMul * (o.userData.alpha ?? 1);
    const L = o.userData.layer ?? (layer + (o.userData.dl || 0));
    if (o.userData.part || o.isMesh) list.push([L, list.length, o, a]);
    const kids = o.children.filter((c) => !(o.userData.part && c.isMesh));
    if (kids.length > 1 && kids.some((c) => c.userData.z)) kids.sort((p, q) => (p.userData.z || 0) - (q.userData.z || 0));
    for (const c of kids) visit(c, a, L);
  };
  visit(root, 1, 0);
  list.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  let order = 1, ref = 0;
  for (const [, , o, a] of list) {
    if (o.userData.part) {
      ref = (ref % 254) + 1;
      for (const m of o.items) {
        m.renderOrder = order++;
        m.material.stencilRef = ref;
        m.material.opacity = m.material.userData.baseOpacity * a;
        m.visible = m.material.opacity > 0.002;
      }
    } else {
      o.renderOrder = order++;
      if (o.material.userData.baseOpacity !== undefined) { o.material.opacity = o.material.userData.baseOpacity * a; o.visible = o.material.opacity > 0.002; }
    }
  }
  return order;
}

// ---------- small path helpers ----------
export const f = (n) => (Math.round(n * 100) / 100).toString();
/** closed smooth blob through points (Catmull-Rom -> cubic Bézier) */
export function blob(pts, tension = 1) {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}
/** open smooth curve through points */
export function curve(pts, tension = 1) {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
/** polygon with sharp corners (for spiky hair tips) mixed with smooth runs: pts entries [x,y,sharp?] */
export function shape(pts) {
  // smooth closed curve, but a point flagged sharp gets zero-length tangents (a corner)
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const tan = (i) => {
    const p = pts[(i + n) % n]; if (p[2]) return [0, 0];
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
  };
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n], t1 = tan(i), t2 = tan(i + 1);
    d += ` C${f(p1[0] + t1[0])} ${f(p1[1] + t1[1])} ${f(p2[0] - t2[0])} ${f(p2[1] - t2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}
export const ellipse = (cx, cy, rx, ry, rot = 0) => {
  const k = 0.5523, c = Math.cos(rot), s = Math.sin(rot);
  const P = (x, y) => `${f(cx + x * c - y * s)} ${f(cy + x * s + y * c)}`;
  return `M${P(rx, 0)} C${P(rx, ry * k)} ${P(rx * k, ry)} ${P(0, ry)} C${P(-rx * k, ry)} ${P(-rx, ry * k)} ${P(-rx, 0)} C${P(-rx, -ry * k)} ${P(-rx * k, -ry)} ${P(0, -ry)} C${P(rx * k, -ry)} ${P(rx, -ry * k)} ${P(rx, 0)} Z`;
};
export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);
export const ring = (cx, cy, r1, r2) => circle(cx, cy, r2) + ' ' + reverseCircle(cx, cy, r1);
function reverseCircle(cx, cy, r) {
  const k = 0.5523;
  return `M${f(cx + r)} ${f(cy)} C${f(cx + r)} ${f(cy - r * k)} ${f(cx + r * k)} ${f(cy - r)} ${f(cx)} ${f(cy - r)} C${f(cx - r * k)} ${f(cy - r)} ${f(cx - r)} ${f(cy - r * k)} ${f(cx - r)} ${f(cy)} C${f(cx - r)} ${f(cy + r * k)} ${f(cx - r * k)} ${f(cy + r)} ${f(cx)} ${f(cy + r)} C${f(cx + r * k)} ${f(cy + r)} ${f(cx + r)} ${f(cy + r * k)} ${f(cx + r)} ${f(cy)} Z`;
}
export const rrect = (x, y, w, h, r) => `M${f(x + r)} ${f(y)} L${f(x + w - r)} ${f(y)} Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)} L${f(x + w)} ${f(y + h - r)} Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} L${f(x + r)} ${f(y + h)} Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - r)} L${f(x)} ${f(y + r)} Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)} Z`;
/** tapered limb between two points (capsule with radii r1 -> r2) */
export function capsule(x1, y1, x2, y2, r1, r2 = r1) {
  const a = Math.atan2(y2 - y1, x2 - x1), n = [-Math.sin(a), Math.cos(a)], t = [Math.cos(a), Math.sin(a)], k = 0.5523;
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const A1 = [x1 + n[0] * r1, y1 + n[1] * r1], B1 = [x2 + n[0] * r2, y2 + n[1] * r2], B2 = [x2 - n[0] * r2, y2 - n[1] * r2], A2 = [x1 - n[0] * r1, y1 - n[1] * r1];
  const E2 = [x2 + t[0] * r2, y2 + t[1] * r2], E1 = [x1 - t[0] * r1, y1 - t[1] * r1];
  return `M${P(...A1)} L${P(...B1)} C${P(B1[0] + t[0] * r2 * k, B1[1] + t[1] * r2 * k)} ${P(E2[0] + n[0] * r2 * k, E2[1] + n[1] * r2 * k)} ${P(...E2)} C${P(E2[0] - n[0] * r2 * k, E2[1] - n[1] * r2 * k)} ${P(B2[0] + t[0] * r2 * k, B2[1] + t[1] * r2 * k)} ${P(...B2)} L${P(...A2)} C${P(A2[0] - t[0] * r1 * k, A2[1] - t[1] * r1 * k)} ${P(E1[0] - n[0] * r1 * k, E1[1] - n[1] * r1 * k)} ${P(...E1)} C${P(E1[0] + n[0] * r1 * k, E1[1] + n[1] * r1 * k)} ${P(A1[0] - t[0] * r1 * k, A1[1] - t[1] * r1 * k)} ${P(...A1)} Z`;
}
/** thick open stroke rendered as a filled shape is done with Part line/olFree; this returns polyline d */
export const poly = (pts, close = false) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + (close ? ' Z' : '');
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** wavy/curly closed outline: base polygon resampled into n bumps of height amp (outward), with sharp valleys */
export function scallop(pts, n, amp, seed = 1) {
  // resample by arc length
  const segs = []; let L = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push([a, b, l]); L += l; }
  const at = (s) => { s = ((s % L) + L) % L; for (const [a, b, l] of segs) { if (s <= l) return [a[0] + (b[0] - a[0]) * s / l, a[1] + (b[1] - a[1]) * s / l]; s -= l; } return pts[0]; };
  let area = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sg = area > 0 ? 1 : -1;
  let r = seed; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  const v = []; for (let i = 0; i < n; i++) v.push(at(L * i / n));
  let d = `M${f(v[0][0])} ${f(v[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = v[i], b = v[(i + 1) % n];
    const t = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(t[0], t[1]) || 1;
    const nn = [t[1] / l * sg, -t[0] / l * sg];
    const h = amp * (0.7 + 0.6 * rnd());
    d += ` C${f(a[0] + nn[0] * h * 1.25 + t[0] * 0.05)} ${f(a[1] + nn[1] * h * 1.25 + t[1] * 0.05)} ${f(b[0] + nn[0] * h * 1.25 - t[0] * 0.05)} ${f(b[1] + nn[1] * h * 1.25 - t[1] * 0.05)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
}

// ---------- soft (blurred) sprites: contact shadows, glows, light shafts ----------
const softTexCache = new Map();
function softTex(kind = 'radial') {
  if (softTexCache.has(kind)) return softTexCache.get(kind);
  const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d');
  if (kind === 'radial') {
    const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  } else if (kind === 'beam') {
    const gr = g.createLinearGradient(0, 0, N, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
    const v = g.createLinearGradient(0, 0, 0, N); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.2, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = v; g.fillRect(0, 0, N, N);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  softTexCache.set(kind, t); return t;
}
/** soft blurred ellipse (or beam) centred at (x,y) in the parent's (y-down) space */
export function soft(x, y, w, h, color = '#000000', opacity = 0.25, kind = 'radial', blending = THREE.NormalBlending) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: softTex(kind), color, transparent: true, opacity, depthTest: false, depthWrite: false, blending }));
  m.material.userData.baseOpacity = opacity;
  m.position.set(x, y, 0); m.scale.set(w, h, 1);
  return m;
}
