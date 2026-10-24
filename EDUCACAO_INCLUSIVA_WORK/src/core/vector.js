// Vector-cartoon primitives built as flat geometry for an orthographic camera.
// Every drawable is a filled polygon with an optional uniform-thickness outline
// (an offset polygon drawn just behind the fill) and optional cel shading
// computed in the fragment shader from local coordinates (no textures).
import * as THREE from 'three';
import { P } from './palette.js';

export const OUTLINE = 0.032;      // default outline width in world units
export const OUTLINE_DZ = 0.012;   // outline sits this far behind its fill

// ---------------------------------------------------------------- points
export function circlePts(r, n = 48, cx = 0, cy = 0) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
export function ellipsePts(rx, ry, n = 48, cx = 0, cy = 0, rot = 0) {
  const p = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    p.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return p;
}
export function arcPts(cx, cy, r, a0, a1, n = 16) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
export function rrectPts(w, h, r, cx = 0, cy = 0, n = 8) {
  r = Math.min(r, w / 2, h / 2);
  const x0 = cx - w / 2 + r, x1 = cx + w / 2 - r, y0 = cy - h / 2 + r, y1 = cy + h / 2 - r;
  return [
    ...arcPts(x1, y0, r, -Math.PI / 2, 0, n), ...arcPts(x1, y1, r, 0, Math.PI / 2, n),
    ...arcPts(x0, y1, r, Math.PI / 2, Math.PI, n), ...arcPts(x0, y0, r, Math.PI, Math.PI * 1.5, n),
  ];
}
/** Tapered capsule from (0,0) radius r0 down to (0,-len) radius r1 */
export function capsulePts(len, r0, r1 = r0, n = 14) {
  const b = -Math.asin(Math.max(-0.99, Math.min(0.99, (r0 - r1) / len)));
  const right = [Math.cos(b), Math.sin(b)];
  const pts = [];
  pts.push([r1 * right[0], -len + r1 * right[1]]);
  pts.push(...arcPts(0, 0, r0, b, Math.PI - b, n * 2));
  pts.push(...arcPts(0, -len, r1, Math.PI - b, Math.PI * 2 + b, n * 2));
  return pts;
}
/** Trapezoid with rounded corners: top width wt, bottom width wb, height h; top edge at y=0 */
export function trapPts(wt, wb, h, r = 0.08, n = 6) {
  const pts = [[-wt / 2, 0], [wt / 2, 0], [wb / 2, -h], [-wb / 2, -h]];
  return roundPoly(pts, r, n);
}
/** Round the corners of a polygon by radius r */
export function roundPoly(pts, r, n = 6) {
  const out = [];
  const N = pts.length;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N];
    const v0 = norm2([p0[0] - p1[0], p0[1] - p1[1]]), v2 = norm2([p2[0] - p1[0], p2[1] - p1[1]]);
    const l0 = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]), l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rr = Math.min(r, l0 * 0.45, l2 * 0.45);
    const a = [p1[0] + v0[0] * rr, p1[1] + v0[1] * rr], b = [p1[0] + v2[0] * rr, p1[1] + v2[1] * rr];
    for (let k = 0; k <= n; k++) {           // quadratic bezier a -> p1 -> b
      const t = k / n, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * p1[0] + t * t * b[0], u * u * a[1] + 2 * u * t * p1[1] + t * t * b[1]]);
    }
  }
  return out;
}
/** Smooth closed blob through control points (centripetal Catmull-Rom) */
export function blobPts(ctrl, n = 80) {
  const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, 'centripetal');
  return curve.getPoints(n).slice(0, n).map((v) => [v.x, v.y]);
}
/** Open smooth curve (for strokes) */
export function curvePts(ctrl, n = 40) {
  const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  return curve.getPoints(n).map((v) => [v.x, v.y]);
}
/** Thick stroke polygon along a polyline with round caps */
export function strokePts(line, w, caps = true) {
  const L = [], R = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[i], a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const d = norm2([b[0] - a[0], b[1] - a[1]]), nrm = [-d[1], d[0]];
    L.push([p[0] + nrm[0] * w / 2, p[1] + nrm[1] * w / 2]); R.push([p[0] - nrm[0] * w / 2, p[1] - nrm[1] * w / 2]);
  }
  const pts = [...R];
  if (caps) {
    const e = line[line.length - 1], d = norm2([e[0] - line[line.length - 2][0], e[1] - line[line.length - 2][1]]);
    const a0 = Math.atan2(-d[0], d[1]) - Math.PI;
    pts.push(...arcPts(e[0], e[1], w / 2, a0, a0 + Math.PI, 8).slice(1, -1));
  }
  pts.push(...L.reverse());
  if (caps) {
    const s = line[0], d = norm2([line[1][0] - s[0], line[1][1] - s[1]]);
    const a0 = Math.atan2(d[0], -d[1]) - Math.PI;
    pts.push(...arcPts(s[0], s[1], w / 2, a0, a0 + Math.PI, 8).slice(1, -1));
  }
  return pts;
}
function norm2(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
export function area(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a / 2;
}
export function dedupe(pts, eps = 1e-5) {
  const out = [];
  for (const p of pts) { const q = out[out.length - 1]; if (!q || Math.abs(p[0] - q[0]) > eps || Math.abs(p[1] - q[1]) > eps) out.push(p); }
  while (out.length > 2 && Math.abs(out[0][0] - out[out.length - 1][0]) < eps && Math.abs(out[0][1] - out[out.length - 1][1]) < eps) out.pop();
  return out;
}
export function ccw(pts) { pts = dedupe(pts); return area(pts) < 0 ? pts.slice().reverse() : pts; }
/** Outward offset of a closed CCW polygon (miter, clamped) */
export function offsetPts(pts, d) {
  pts = ccw(pts);
  const N = pts.length, out = [];
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N];
    const e0 = norm2([p1[0] - p0[0], p1[1] - p0[1]]), e1 = norm2([p2[0] - p1[0], p2[1] - p1[1]]);
    const n0 = [e0[1], -e0[0]], n1 = [e1[1], -e1[0]];
    let m = norm2([n0[0] + n1[0], n0[1] + n1[1]]);
    const cosh = Math.max(0.35, m[0] * n1[0] + m[1] * n1[1]);
    const L = d / cosh;
    out.push([p1[0] + m[0] * L, p1[1] + m[1] * L]);
  }
  return out;
}
export function transformPts(pts, { x = 0, y = 0, sx = 1, sy = 1, rot = 0 } = {}) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return pts.map(([px, py]) => { const X = px * sx, Y = py * sy; return [x + X * c - Y * s, y + X * s + Y * c]; });
}

// ---------------------------------------------------------------- material
const VERT = `
varying vec2 vP;
void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const FRAG = `
precision highp float;
varying vec2 vP;
uniform vec3 uColor; uniform vec3 uShade; uniform vec3 uHi;
uniform int uMode; uniform vec4 uP; uniform vec4 uQ; uniform float uOpacity;
void main(){
  vec3 c = uColor;
  if (uMode == 1) {            // crescent: shade outside circle (uP.xy centre, uP.z radius)
    float d = length(vP - uP.xy) - uP.z; float w = fwidth(d) * 1.0;
    c = mix(uColor, uShade, smoothstep(-w, w, d));
  } else if (uMode == 2) {     // half plane: shade where dot(p, uP.xy) > uP.z
    float d = dot(vP, normalize(uP.xy)) - uP.z; float w = fwidth(d);
    c = mix(uColor, uShade, smoothstep(-w, w, d));
  } else if (uMode == 3) {     // vertical gradient uP.x (bottom y) -> uP.y (top y)
    float k = clamp((vP.y - uP.x) / (uP.y - uP.x), 0.0, 1.0);
    c = mix(uShade, uColor, k);
  }
  if (uQ.z > 0.0) {            // optional highlight disc (uQ.xy centre, uQ.z radius)
    float d = length(vP - uQ.xy) - uQ.z; float w = fwidth(d);
    c = mix(uHi, c, smoothstep(-w, w, d));
  }
  gl_FragColor = vec4(c, uOpacity);
  #include <colorspace_fragment>
}`;

export function toonMat({ color = '#ffffff', shade = null, mode = 0, p = [0, 0, 0, 0], hi = null, q = [0, 0, 0, 0], opacity = 1, side = THREE.DoubleSide } = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uShade: { value: new THREE.Color(shade || color) },
      uHi: { value: new THREE.Color(hi || '#ffffff') },
      uMode: { value: shade ? mode : 0 }, uP: { value: new THREE.Vector4(...p) }, uQ: { value: new THREE.Vector4(...(hi ? q : [0, 0, 0, 0])) },
      uOpacity: { value: opacity },
    },
    transparent: opacity < 1, side, depthWrite: opacity >= 1,
  });
  return m;
}
export function setOpacity(obj, o) {
  obj.traverse((n) => {
    if (n.material && n.material.uniforms && n.material.uniforms.uOpacity) {
      n.material.uniforms.uOpacity.value = o * (n.userData.baseOpacity ?? 1);
      n.material.transparent = o < 1 || (n.userData.baseOpacity ?? 1) < 1;
      n.material.depthWrite = !n.material.transparent;
    }
  });
}

const geoCache = new Map();
export function geo(pts) {
  return new THREE.ShapeGeometry(new THREE.Shape(ccw(pts).map(([x, y]) => new THREE.Vector2(x, y))), 1);
}

/**
 * Create a vector part: filled shape + outline behind it.
 * opts: pts, color, shade, mode, p, outline (width|0), oc (outline colour), z, hi, q, opacity
 */
export function vpart(opts) {
  const { pts, color = '#fff', shade = null, mode = 1, p = [0, 0, 0, 0], outline = OUTLINE, oc = P.ink, z = 0, hi = null, q, opacity = 1, name } = opts;
  const g = new THREE.Group(); if (name) g.name = name;
  const fill = new THREE.Mesh(geo(pts), toonMat({ color, shade, mode, p, hi, q, opacity }));
  fill.position.z = z; fill.userData.baseOpacity = opacity; g.add(fill);
  let ol = null;
  if (outline > 0) {
    ol = new THREE.Mesh(geo(offsetPts(pts, outline)), toonMat({ color: oc, opacity }));
    ol.position.z = z - OUTLINE_DZ; ol.userData.baseOpacity = opacity; g.add(ol);
  }
  g.userData.fill = fill; g.userData.outline = ol;
  return g;
}
/** Swap the geometry of an existing vpart (for shape morphs, e.g. mouths) */
export function vreshape(part, pts, outline = OUTLINE) {
  const f = part.userData.fill, o = part.userData.outline;
  f.geometry.dispose(); f.geometry = geo(pts);
  if (o) { o.geometry.dispose(); o.geometry = geo(offsetPts(pts, outline)); }
}
export function vcolor(part, color, shade) {
  const u = part.userData.fill.material.uniforms; u.uColor.value.set(color); if (shade) u.uShade.value.set(shade);
}

/** A joint: a pivot group positioned at (x,y) relative to its parent */
export function joint(parent, x = 0, y = 0, z = 0, name) {
  const g = new THREE.Group(); g.position.set(x, y, z); if (name) g.name = name; if (parent) parent.add(g); return g;
}

/** Thin straight line (e.g. lettering guides) as a stroke part */
export function line(pts, w, color, z = 0, outline = 0) {
  return vpart({ pts: strokePts(pts, w), color, outline, z });
}

/** Ring (shape with a hole): outer & inner closed polygons */
export function vring({ outer, inner, color = '#000', z = 0, outline = 0, oc = P.ink, opacity = 1, shade = null, mode = 1, p = [0, 0, 0, 0] }) {
  const g = new THREE.Group();
  const mk = (o, i) => {
    const s = new THREE.Shape(ccw(o).map(([x, y]) => new THREE.Vector2(x, y)));
    s.holes.push(new THREE.Path(ccw(i).reverse().map(([x, y]) => new THREE.Vector2(x, y))));
    return new THREE.ShapeGeometry(s, 1);
  };
  const fill = new THREE.Mesh(mk(outer, inner), toonMat({ color, opacity, shade, mode, p })); fill.position.z = z; fill.userData.baseOpacity = opacity; g.add(fill);
  if (outline > 0) {
    const ol = new THREE.Mesh(mk(offsetPts(outer, outline), offsetPts(inner, -outline)), toonMat({ color: oc, opacity }));
    ol.position.z = z - OUTLINE_DZ; ol.userData.baseOpacity = opacity; g.add(ol); g.userData.outline = ol;
  }
  g.userData.fill = fill;
  return g;
}
