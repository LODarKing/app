import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GlobeGL } from './GlobeGL';
import { project, pathOf, View, I3, P } from './morph';
import { D2R, NY, TK, gcLL, rhLL, rel, invMercY, LON0, R_KM, toVec, toLL, V3 } from './geo';
import { C, FONT_TITLE, FONT_UI, W, H, FPS } from './theme';
import { EV, b, lin, seg, mix, easeOut, easeOutBack, easeInOut, clamp01 } from './timeline';
import { Captions } from './Captions';

const N_ROUTE = 260;
const GC = Array.from({ length: N_ROUTE + 1 }, (_, i) => { const p = gcLL(i / N_ROUTE); return { lam: rel(p.lon), lat: p.lat }; });
const RH = Array.from({ length: N_ROUTE + 1 }, (_, i) => { const p = rhLL(i / N_ROUTE); return { lam: rel(p.lon), lat: p.lat }; });

// latitude do centro de enquadramento no mapa plano: meio vertical da rota no Mercator
const LATC_FLAT = invMercY(1.18);
const PANX_FLAT = 6.5 * D2R;

// ---- câmera / transformação em função do tempo (função pura)
export function viewAt(t: number): View {
  const push = seg(t, 0, EV.recua, easeInOut);                 // aproximação suave
  const back = seg(t, EV.recua, EV.recua + 2.6, easeInOut);   // recuo
  const u = seg(t, EV.uIni, EV.uFim, easeInOut);
  const s = seg(t, EV.sIni, EV.sFim, easeInOut);
  // aproximação no gancho, recuo curto quando o mapa "engana", depois a câmera acompanha a folha virando esfera
  let zoom = mix(1.06, 1.14, push);
  zoom = mix(zoom, 0.98, back);
  zoom = mix(zoom, 1.32, seg(t, EV.sIni + 1.0, EV.sFim, easeInOut));
  return {
    s, u,
    latC: LATC_FLAT,
    G: I3,
    zoom,
    panX: PANX_FLAT * (1 - s),
    panY: 0,
    roll: 0,
    cx: W / 2,
    cy: mix(770, 800, back),
  };
}

// ---- círculos de Tissot: círculos geográficos de 500 km de raio (1.000 km de diâmetro)
const TISSOT_LATS = [0, 30, 50, 62, 72];
const TISSOT_R = 500 / R_KM;
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
const TISSOT = TISSOT_LATS.map((l) => smallCircle(l * D2R, 0, TISSOT_R));

const PLANE = 'M50 4 C54 4 56 10 56 17 L56 38 L93 59 L93 67 L56 57 L56 79 L67 88 L67 94 L50 90 L33 94 L33 88 L44 79 L44 57 L7 67 L7 59 L44 38 L44 17 C44 10 46 4 50 4 Z';

const fmtCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2).replace('.', ',')}° ${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(2).replace('.', ',')}° ${lon >= 0 ? 'L' : 'O'}`;

function partial(pts: P[], k: number) {
  const n = Math.max(0, Math.min(pts.length, Math.round(k * (pts.length - 1)) + 1));
  return pts.slice(0, n);
}

const Graticule: React.FC<{ v: View }> = ({ v }) => {
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

const Marker: React.FC<{ v: View; lat: number; lon: number; t0: number; t: number; nome: string; side: 'left' | 'right' }> = ({ v, lat, lon, t0, t, nome, side }) => {
  const p = project(rel(lon * D2R), lat * D2R, v);
  if (t < t0 - 0.12 || !p.vis) return null;
  const k = lin(t, t0 - 0.12, t0 + 0.3);   // já meio aberto no próprio acerto (quadro 0 nunca vazio)
  const ring = lin(t, t0, t0 + 0.9);
  const sc = easeOutBack(k);
  const lab = seg(t, t0 + 0.12, t0 + 0.5, easeOut);
  const dx = side === 'left' ? 20 : -20;
  return (
    <g>
      {ring < 1 && <circle cx={p.x} cy={p.y} r={14 + 46 * easeOut(ring)} fill="none" stroke={C.white} strokeOpacity={0.7 * (1 - ring)} strokeWidth={3} />}
      <circle cx={p.x} cy={p.y} r={13 * sc} fill={C.bg} stroke={C.white} strokeWidth={4} />
      <circle cx={p.x} cy={p.y} r={5 * sc} fill={C.white} />
      <g transform={`translate(${p.x + dx} ${p.y + 62 - 14 * (1 - lab)})`} opacity={lab}>
        <text textAnchor={side === 'left' ? 'end' : 'start'} x={side === 'left' ? 38 : -38} y={0} fill={C.white} fontFamily={FONT_UI} fontWeight={700} fontSize={36} letterSpacing={2.5}>{nome}</text>
        <text textAnchor={side === 'left' ? 'end' : 'start'} x={side === 'left' ? 38 : -38} y={38} fill={C.white} fillOpacity={0.62} fontFamily={FONT_UI} fontWeight={500} fontSize={25} letterSpacing={0.5} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtCoord(lat, lon)}</text>
      </g>
    </g>
  );
};

export const Episode: React.FC<{ ate?: number }> = ({ ate = 1e9 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const v = viewAt(t);

  const gcP = GC.map((q) => project(q.lam, q.lat, v));
  const rhP = RH.map((q) => project(q.lam, q.lat, v));

  // traçado progressivo
  const kR = seg(t, EV.retaIni, EV.retaFim, easeOut);
  const kG = seg(t, EV.curvaIni, EV.curvaFim, easeInOut);
  // ênfase: as rotas recuam quando os círculos de Tissot entram, voltam no recuo da câmera
  // "essa curva": a amarela recua e a ciano engrossa; nos círculos de Tissot as duas recuam; voltam com a esfera
  const destK = seg(t, EV.destaque, EV.destaque + 0.35, easeOut) * (1 - seg(t, EV.recua, EV.recua + 0.4));
  const dimT = mix(1, 0.38, seg(t, EV.tissot[0], EV.tissot[0] + 0.4)) + 0.62 * seg(t, EV.uFim - 1.2, EV.uFim);
  const dimY = Math.min(1, dimT) * (1 - 0.6 * destK);
  const dim = dimT;
  const curtoK = seg(t, EV.curtoTxt, EV.curtoTxt + 0.4, easeOut) * (1 - seg(t, EV.recua - 0.1, EV.recua + 0.3));

  // avião sobre o círculo máximo
  const kA = seg(t, EV.aviaoIni, EV.aviaoFim, (x) => easeInOut(x) * 0.3 + x * 0.7);
  const ai = Math.min(N_ROUTE - 1, Math.max(1, Math.round(kA * N_ROUTE)));
  const pa = gcP[ai], pb = gcP[Math.min(N_ROUTE, ai + 2)], pz = gcP[Math.max(0, ai - 2)];
  const head = Math.atan2(pb.x - pz.x, -(pb.y - pz.y)) * 180 / Math.PI;
  const aviaoVis = t >= EV.aviaoIni && t < EV.aviaoFim + 0.5 && pa.vis;
  const pouso = lin(t, EV.aviaoFim - 0.25, EV.aviaoFim + 0.4);
  const aviaoEsc = (0.62 + 0.38 * easeOutBack(lin(t, EV.aviaoIni, EV.aviaoIni + 0.4))) * (1 - 0.55 * pouso);

  // região do "desvio" entre as duas linhas
  const kD = seg(t, EV.desvio, EV.desvio + 0.9, easeInOut);
  const desvioOut = seg(t, EV.olha, EV.olha + 0.5);
  const regiao = 'M' + gcP.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L') + 'L' + [...rhP].reverse().map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L') + 'Z';
  const nyx = gcP[0].x, tkx = gcP[N_ROUTE].x;
  const mid = Math.round(N_ROUTE * 0.5);
  const dCx = (gcP[mid].x + rhP[mid].x) / 2, dCy = (gcP[mid].y + rhP[mid].y) / 2;

  // título cinético
  const t1 = seg(t, EV.titulo1, EV.titulo1 + 0.35, easeOut);
  const t2 = seg(t, EV.titulo2, EV.titulo2 + 0.35, easeOut);
  const bend = seg(t, EV.tituloCurva, EV.tituloCurva + 0.7, easeOutBack);
  const tOut = seg(t, EV.olha - 0.05, EV.olha + 0.45, (x) => x * x);
  const bendPath = `M40 ${480 + 70 * bend} Q 540 ${480 - 150 * bend} 1040 ${480 + 70 * bend}`;

  // rótulos das linhas
  const labK = seg(t, EV.desvio, EV.desvio + 0.5, easeOut) * (1 - desvioOut);
  const iLabR = Math.round(N_ROUTE * 0.62), iLabG = Math.round(N_ROUTE * 0.3);

  // rótulo "PROJEÇÃO DE MERCATOR" preso à borda superior do próprio mapa
  const topEdge = project(-62 * D2R, 80 * D2R, v), topEdge2 = project(-52 * D2R, 80 * D2R, v);
  const topAng = Math.atan2(topEdge2.y - topEdge.y, topEdge2.x - topEdge.x) * 180 / Math.PI;
  const mercOp = 1 - seg(t, EV.titulo1 - 0.3, EV.titulo1);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GlobeGL view={v} width={W} height={H} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="18" stroke={C.yellow} strokeOpacity={0.35} strokeWidth={4} />
          </pattern>
          <clipPath id="desvioClip"><rect x={mix(nyx + 60, tkx - 60, kD)} y={0} width={W * 2} height={H} /></clipPath>
          <clipPath id="t1clip"><rect x={0} y={0} width={80 + 1000 * t1} height={H} /></clipPath>
          <clipPath id="t2clip"><rect x={0} y={0} width={80 + 1000 * t2} height={H} /></clipPath>
          <path id="bendPath" d={bendPath} />
        </defs>

        <Graticule v={v} />

        {topEdge.vis && mercOp > 0 && (
          <text x={topEdge.x} y={topEdge.y + 40} transform={`rotate(${topAng} ${topEdge.x} ${topEdge.y})`} fill={C.white} fillOpacity={0.62 * mercOp} fontFamily={FONT_UI} fontWeight={600} fontSize={30} letterSpacing={5}>MAPA DE MERCATOR</text>
        )}

        {/* região do desvio */}
        {kD > 0 && desvioOut < 1 && (
          <g clipPath="url(#desvioClip)" opacity={1 - desvioOut}>
            <path d={regiao} fill="url(#hatch)" />
          </g>
        )}

        {/* rotas */}
        <path d={pathOf(partial(rhP, kR))} fill="none" stroke={C.yellow} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={dimY} />
        <path d={pathOf(partial(gcP, kG))} fill="none" stroke={C.cyan} strokeWidth={8 + 5 * destK} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, dim)} />

        {/* rótulos das linhas */}
        {labK > 0 && (
          <g opacity={labK} fontFamily={FONT_UI} fontWeight={700} fontSize={31} letterSpacing={3}>
            <text x={rhP[iLabR].x} y={rhP[iLabR].y + 48 - 10 * (1 - labK)} fill={C.yellow} textAnchor="middle">LINHA RETA</text>
            <text x={gcP[iLabG].x + 30} y={gcP[iLabG].y - 26 + 10 * (1 - labK)} fill={C.cyan} textAnchor="start">ROTA CURVA</text>
          </g>
        )}
        {t >= EV.desvioTxt && desvioOut < 1 && (
          <g opacity={1 - desvioOut} transform={`translate(${dCx} ${dCy + 14}) scale(${easeOutBack(lin(t, EV.desvioTxt, EV.desvioTxt + 0.35))})`}>
            <text textAnchor="middle" fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={64} letterSpacing={2}>DESVIO?</text>
          </g>
        )}

        {curtoK > 0 && (
          <g transform={`translate(${gcP[mid].x} ${gcP[mid].y - 34 - 16 * (1 - curtoK)})`} opacity={curtoK}>
            <text textAnchor="middle" fill={C.cyan} fontFamily={FONT_UI} fontWeight={700} fontSize={38} letterSpacing={2.5}
              stroke={C.bg} strokeWidth={10} paintOrder="stroke">O CAMINHO MAIS CURTO?</text>
          </g>
        )}

        {/* círculos de Tissot */}
        {TISSOT.map((ring, i) => {
          const t0 = EV.tissot[i];
          if (t < t0) return null;
          const k = easeOutBack(lin(t, t0, t0 + 0.3));
          const pts = ring.map((q) => project(q.lam, q.lat, v));
          const c = project(0, TISSOT_LATS[i] * D2R, v);
          if (!c.vis) return null;
          const scaled = pts.map((p) => ({ ...p, x: c.x + (p.x - c.x) * k, y: c.y + (p.y - c.y) * k }));
          const rx = Math.max(...pts.map((p) => p.x)) - c.x;
          const fac = 1 / Math.cos(TISSOT_LATS[i] * D2R);
          const labOp = lin(t, t0 + 0.1, t0 + 0.35) * (1 - seg(t, EV.uIni, EV.uIni + 0.6));
          return (
            <g key={i}>
              <path d={pathOf(scaled) + 'Z'} fill={C.white} fillOpacity={0.13} stroke={C.white} strokeWidth={3} />
              {labOp > 0 && <text x={c.x + rx + 18} y={c.y + 11} fill={C.white} fillOpacity={labOp} fontFamily={FONT_UI} fontWeight={700} fontSize={32} style={{ fontVariantNumeric: 'tabular-nums' }}>{'×' + fac.toFixed(1).replace('.', ',')}</text>}
              {i === 0 && labOp > 0 && <text x={c.x - rx - 18} y={c.y + 10} textAnchor="end" fill={C.white} fillOpacity={labOp * 0.75} fontFamily={FONT_UI} fontWeight={600} fontSize={25} letterSpacing={1.5}>TODOS COM 1.000 KM NA TERRA</text>}
            </g>
          );
        })}

        <Marker v={v} lat={NY.lat} lon={NY.lon} t0={EV.ny} t={t} nome="NOVA YORK" side="left" />
        <Marker v={v} lat={TK.lat} lon={TK.lon} t0={EV.tk} t={t} nome="TÓQUIO" side="right" />

        {aviaoVis && (
          <g transform={`translate(${pa.x} ${pa.y}) rotate(${head}) scale(${0.8 * aviaoEsc}) translate(-50 -50)`}>
            <path d={PLANE} fill={C.white} stroke={C.bg} strokeWidth={5} strokeLinejoin="round" />
          </g>
        )}

        {/* título cinético: "POR QUE ESSA" reto; "CURVA?" nasce reto e se arqueia como a rota */}
        {tOut < 1 && t >= EV.titulo1 && (
          <g transform={`translate(0 ${-60 * tOut})`} opacity={1 - tOut}>
            <g clipPath="url(#t1clip)">
              <text x={72} y={262} fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={128} letterSpacing={1.5}>POR QUE ESSA</text>
            </g>
            {t >= EV.titulo2 && (
              <g clipPath="url(#t2clip)">
                <text fill={C.cyan} fontFamily={FONT_TITLE} fontWeight={800} fontSize={232} letterSpacing={4} textAnchor="middle">
                  <textPath href="#bendPath" startOffset="50%">CURVA?</textPath>
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
      <Captions t={t} ate={ate} />
    </AbsoluteFill>
  );
};
