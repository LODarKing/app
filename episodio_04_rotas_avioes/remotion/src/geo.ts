// Geometria do episódio 04 — tudo derivado de coordenadas; nada desenhado à mão.
// Modelo: esfera de raio médio R = 6371,0 km (raio médio IUGG/WGS84 ≈ 6371,009 km).
export const R_KM = 6371.0;
export const D2R = Math.PI / 180, R2D = 180 / Math.PI;
export type V3 = [number, number, number];

// Coordenadas (Wikipédia, infobox, consultado em 17/11/2026)
export const NY = { nome: 'NOVA YORK', lat: 40.7128, lon: -74.0061 };
export const TK = { nome: 'TÓQUIO', lat: 35.68972, lon: 139.69222 };

export const wrap = (l: number) => { let x = ((l + Math.PI) % (2 * Math.PI)); if (x < 0) x += 2 * Math.PI; return x - Math.PI; };
export const toVec = (lat: number, lon: number): V3 => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
export const toLL = (v: V3) => { const n = Math.hypot(v[0], v[1], v[2]); return { lat: Math.asin(v[1] / n), lon: Math.atan2(v[0], v[2]) }; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const A = toVec(NY.lat * D2R, NY.lon * D2R), B = toVec(TK.lat * D2R, TK.lon * D2R);
export const OMEGA = Math.acos(Math.min(1, dot(A, B)));         // ângulo central
export const slerp = (t: number): V3 => {
  const s = Math.sin(OMEGA), k0 = Math.sin((1 - t) * OMEGA) / s, k1 = Math.sin(t * OMEGA) / s;
  return [k0 * A[0] + k1 * B[0], k0 * A[1] + k1 * B[1], k0 * A[2] + k1 * B[2]];
};
// ponto médio do círculo máximo: centro de todo o enquadramento
export const MID = toLL(slerp(0.5));
export const LON0 = MID.lon;                                     // meridiano central do mapa
export const rel = (lonRad: number) => wrap(lonRad - LON0);      // longitude relativa contínua (trata o antimeridiano)

// Mercator (esfera): y = ln tan(π/4 + φ/2); recorte em ±85,0511° (y = ±π)
export const MERC_MAX = Math.PI;
export const mercY = (lat: number) => Math.max(-MERC_MAX, Math.min(MERC_MAX, Math.log(Math.tan(Math.PI / 4 + lat / 2))));
export const invMercY = (y: number) => 2 * Math.atan(Math.exp(y)) - Math.PI / 2;

// Rota 1 (ciano): círculo máximo por SLERP, em lat/lon
export const gcLL = (t: number) => toLL(slerp(t));
// Rota 2 (amarela): linha reta no Mercator = loxodromia (rumo constante), pelo lado do Pacífico
const xA = rel(NY.lon * D2R), xB = rel(TK.lon * D2R), yA = mercY(NY.lat * D2R), yB = mercY(TK.lat * D2R);
export const rhLL = (t: number) => ({ lat: invMercY(yA + (yB - yA) * t), lon: LON0 + xA + (xB - xA) * t });

// Distâncias geográficas na esfera
export const GC_KM = OMEGA * R_KM;
// loxodromia: d = R · Δφ / cos(β); se Δφ ~ 0, d = R · Δλ · cos φ
const dphi = TK.lat * D2R - NY.lat * D2R, dpsi = yB - yA, dlam = xB - xA;
const q = Math.abs(dpsi) > 1e-12 ? dphi / dpsi : Math.cos(NY.lat * D2R);
export const RH_KM = Math.sqrt(dphi * dphi + q * q * dlam * dlam) * R_KM;
export const GC_MAX_LAT = (() => { let m = -9; for (let i = 0; i <= 1000; i++) m = Math.max(m, gcLL(i / 1000).lat); return m; })();
export const ROTA = { xA, xB, yA, yB };
