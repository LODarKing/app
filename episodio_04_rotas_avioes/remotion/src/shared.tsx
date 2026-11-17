import React from 'react';
import { project, pathOf, View, P } from './morph';
import { D2R, gcLL, rhLL, rel, R_KM, toVec, toLL, V3 } from './geo';
import { C, FONT_UI } from './theme';
import { lin, seg, easeOut, easeOutBack } from './timeline';

export const N_ROUTE = 260;
export const GC = Array.from({ length: N_ROUTE + 1 }, (_, i) => { const p = gcLL(i / N_ROUTE); return { lam: rel(p.lon), lat: p.lat }; });
export const RH = Array.from({ length: N_ROUTE + 1 }, (_, i) => { const p = rhLL(i / N_ROUTE); return { lam: rel(p.lon), lat: p.lat }; });

// ---- círculos de Tissot: círculos geográficos de 500 km de raio (1.000 km de diâmetro)
export const TISSOT_LATS = [0, 30, 50, 62, 72];
export const TISSOT_R = 500 / R_KM;
function smallCircle(lat0: number, lam0: number, r: number, n = 72) {
  // pontos a distância angular r do centro, por rotação do vetor
  const c = toVec(lat0, 0);
  const e: V3 = [1, 0, 0];                                   // leste
  const nn: V3 = [-Math.sin(lat0) * 0, Math.cos(lat0), -Math.sin(lat0)]; // norte local (λ=0)
  const out: { lam: number; lat: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * 2 * Math.PI;
    const v: V3 = [0, 0, 0];
    for (let k = 0; k < 3; k++) v[k] = Math.cos(r) * c[k] + Math.sin(r) * (Math.cos(a) * e[k] + Math.sin(a) * nn[k]);
    const ll = toLL(v);
    out.push({ lam: lam0 + ll.lon, lat: ll.lat });
  }
  return out;
}
export const TISSOT = TISSOT_LATS.map((l) => smallCircle(l * D2R, 0, TISSOT_R));

export const PLANE = 'M50 4 C54 4 56 10 56 17 L56 38 L93 59 L93 67 L56 57 L56 79 L67 88 L67 94 L50 90 L33 94 L33 88 L44 79 L44 57 L7 67 L7 59 L44 38 L44 17 C44 10 46 4 50 4 Z';

const fmtCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2).replace('.', ',')}° ${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(2).replace('.', ',')}° ${lon >= 0 ? 'L' : 'O'}`;

export function partial(pts: P[], k: number) {
  const n = Math.max(0, Math.min(pts.length, Math.round(k * (pts.length - 1)) + 1));
  return pts.slice(0, n);
}

export const Graticule: React.FC<{ v: View }> = ({ v }) => {
  const lines: { d: string; strong: boolean }[] = [];
  for (let lon = -180; lon < 180; lon += 15) {
    const lam = rel(lon * D2R);
    const pts: P[] = [];
    for (let la = -85; la <= 85; la += 2.5) pts.push(project(lam, la * D2R, v));
    lines.push({ d: pathOf(pts), strong: false });
  }
  for (let la = -75; la <= 75; la += 15) {
    const pts: P[] = [];
    for (let i = 0; i <= 240; i++) pts.push(project(-Math.PI + (2 * Math.PI * i) / 240, la * D2R, v));
    lines.push({ d: pathOf(pts), strong: la === 0 });
  }
  return <g fill="none">{lines.map((l, i) => <path key={i} d={l.d} stroke={l.strong ? C.gridStrong : C.grid} strokeWidth={l.strong ? 2 : 1.4} />)}</g>;
};

export const Marker: React.FC<{ v: View; lat: number; lon: number; t0: number; t: number; nome: string; side: 'left' | 'right'; pulsos?: number[]; mini?: boolean }> = ({ v, lat, lon, t0, t, nome, side, pulsos = [], mini = false }) => {
  const p = project(rel(lon * D2R), lat * D2R, v);
  if (t < t0 - 0.12 || !p.vis) return null;
  const k = lin(t, t0 - 0.12, t0 + 0.3);   // já meio aberto no próprio acerto (quadro 0 nunca vazio)
  const tp = [t0, ...pulsos].filter((x) => x <= t).pop() ?? t0;
  const ring = lin(t, tp, tp + 0.9);
  const sc = easeOutBack(k) * (mini ? 0.75 : 1);
  const lab = seg(t, t0 + 0.12, t0 + 0.5, easeOut);
  const dx = side === 'left' ? 20 : -20;
  return (
    <g>
      {ring < 1 && <circle cx={p.x} cy={p.y} r={14 + 46 * easeOut(ring)} fill="none" stroke={C.white} strokeOpacity={0.7 * (1 - ring)} strokeWidth={3} />}
      <circle cx={p.x} cy={p.y} r={13 * sc} fill={C.bg} stroke={C.white} strokeWidth={4} />
      <circle cx={p.x} cy={p.y} r={5 * sc} fill={C.white} />
      <g transform={`translate(${p.x + dx} ${p.y + 62 - 14 * (1 - lab)})`} opacity={lab}>
        <text textAnchor={side === 'left' ? 'end' : 'start'} x={side === 'left' ? 38 : -38} y={0} fill={C.white} fontFamily={FONT_UI} fontWeight={700} fontSize={mini ? 28 : 36} letterSpacing={2.5}>{nome}</text>
        {!mini && <text textAnchor={side === 'left' ? 'end' : 'start'} x={side === 'left' ? 38 : -38} y={38} fill={C.white} fillOpacity={0.62} fontFamily={FONT_UI} fontWeight={500} fontSize={25} letterSpacing={0.5} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtCoord(lat, lon)}</text>}
      </g>
    </g>
  );
};

