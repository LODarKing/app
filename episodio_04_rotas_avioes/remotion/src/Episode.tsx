import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GlobeGL, GLView } from './GlobeGL';
import { project, pathOf, View, I3, P, CAM_D, CAM_F } from './morph';
import { viewAt, splitViews, LATC_FLAT } from './camera';
import { Later, RouteLayer } from './Later';
import { D2R, NY, TK, gcLL, rhLL, rel, invMercY, LON0, R_KM, toVec, toLL, V3 } from './geo';
import { C, FONT_TITLE, FONT_UI, W, H, FPS } from './theme';
import { EV, E, b, lin, seg, mix, easeOut, easeOutBack, easeInOut, clamp01 } from './timeline';
import { Captions } from './Captions';

import { N_ROUTE, GC, RH, TISSOT, TISSOT_LATS, PLANE, partial, Graticule, Marker } from './shared';

export const Episode: React.FC<{ ate?: number }> = ({ ate = 1e9 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const main = viewAt(t);
  const sp = splitViews(t, main);
  const v = sp.k > 0 ? sp.bottom : main;
  const glViews: GLView[] = sp.k > 0 ? [{ v: sp.top, clip: [0, 0, W, sp.divide] }, { v: sp.bottom, clip: [0, sp.divide, W, H - sp.divide] }] : [{ v }];

  const gcP = GC.map((q) => project(q.lam, q.lat, v));
  const rhP = RH.map((q) => project(q.lam, q.lat, v));

  // traçado progressivo
  const kR = seg(t, EV.retaIni, EV.retaFim, easeOut);
  const kG = seg(t, EV.curvaIni, EV.curvaFim, easeInOut);
  // ênfase: as rotas recuam quando os círculos de Tissot entram, voltam no recuo da câmera
  // "essa curva": a amarela recua e a ciano engrossa; nos círculos de Tissot as duas recuam; voltam com a esfera
  const destK = seg(t, EV.destaque, EV.destaque + 0.35, easeOut) * (1 - seg(t, EV.recua, EV.recua + 0.4));
  const dimT = mix(1, 0.38, seg(t, EV.tissot[0], EV.tissot[0] + 0.4)) + 0.62 * seg(t, EV.uFim - 1.2, EV.uFim);
  // depois do piloto: amarela recua na cena 3, volta no mapa ("a rota"), some na cena 5
  const yLater = (1 - 0.65 * seg(t, E.cena3, E.cena3 + 0.5)) + 0.65 * seg(t, E.rotaVolta, E.rotaVolta + 0.5);
  const yGone = 1 - seg(t, E.cena5, E.cena5 + 0.8);
  const dimY = Math.min(1, dimT) * (1 - 0.6 * destK) * Math.min(1, yLater) * yGone;
  const dim = dimT;
  const gcW = 8 + 5 * destK + 4 * seg(t, E.menor, E.menor + 0.4) * (1 - seg(t, E.desenrola, E.desenrola + 0.5)) + 4 * seg(t, E.desenrola2, E.desenrola2 + 0.6);
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
  const mercOp = 1 - seg(t, EV.titulo1 - 0.3, EV.titulo1) + seg(t, E.plano2 - 0.3, E.plano2 + 0.3) * (1 - seg(t, E.globo2, E.globo2 + 0.5));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GlobeGL views={glViews} width={W} height={H} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="18" stroke={C.yellow} strokeOpacity={0.35} strokeWidth={4} />
          </pattern>
          <clipPath id="desvioClip"><rect x={mix(nyx + 60, tkx - 60, kD)} y={0} width={W * 2} height={H} /></clipPath>
          <clipPath id="t1clip"><rect x={0} y={0} width={80 + 1000 * t1} height={H} /></clipPath>
          <clipPath id="t2clip"><rect x={0} y={0} width={80 + 1000 * t2} height={H} /></clipPath>
          <path id="bendPath" d={bendPath} />
          <clipPath id="topClip"><rect x={0} y={0} width={W} height={sp.divide} /></clipPath>
          <clipPath id="botClip"><rect x={0} y={sp.divide} width={W} height={H} /></clipPath>
        </defs>

        {sp.k > 0 && (
          <g clipPath="url(#topClip)"><RouteLayer v={sp.top} t={t} /></g>
        )}
        <g clipPath={sp.k > 0 ? 'url(#botClip)' : undefined}>
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
        <path d={pathOf(partial(gcP, kG))} fill="none" stroke={C.cyan} strokeWidth={gcW} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, dim)} />

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
          const out = seg(t, E.cena3, E.cena3 + 0.6);
          if (out >= 1) return null;
          return (
            <g key={i} opacity={1 - out}>
              <path d={pathOf(scaled) + 'Z'} fill={C.white} fillOpacity={0.13} stroke={C.white} strokeWidth={3} />
              {labOp > 0 && <text x={c.x + rx + 18} y={c.y + 11} fill={C.white} fillOpacity={labOp} fontFamily={FONT_UI} fontWeight={700} fontSize={32} style={{ fontVariantNumeric: 'tabular-nums' }}>{'×' + fac.toFixed(1).replace('.', ',')}</text>}
              {i === 0 && labOp > 0 && <text x={c.x - rx - 18} y={c.y + 10} textAnchor="end" fill={C.white} fillOpacity={labOp * 0.75} fontFamily={FONT_UI} fontWeight={600} fontSize={25} letterSpacing={1.5}>TODOS COM 1.000 KM NA TERRA</text>}
            </g>
          );
        })}

        <Marker v={v} lat={NY.lat} lon={NY.lon} t0={EV.ny} t={t} nome="NOVA YORK" side="left" pulsos={[E.nyPulse]} />
        <Marker v={v} lat={TK.lat} lon={TK.lon} t0={EV.tk} t={t} nome="TÓQUIO" side="right" pulsos={[E.tkPulse]} />
        </g>
        <Later t={t} v={v} sp={sp} gcP={gcP} rhP={rhP} />

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
      <Captions t={t} ate={Math.min(ate, E.assinatura - 0.5)} />
    </AbsoluteFill>
  );
};
