// Cenas 2–6 (depois do trecho aprovado no piloto). Tudo calculado a partir de lat/lon e do tempo.
import React from 'react';
import { project, pathOf, View, P, CAM_D, CAM_F } from './morph';
import { D2R, NY, TK, gcLL, rhLL, rel, R_KM, toVec, toLL, V3, slerp, GC_KM, RH_KM, OMEGA } from './geo';
import { C, FONT_TITLE, FONT_UI, W } from './theme';
import { E, lin, seg, mix, easeOut, easeOutBack, easeInOut } from './timeline';
import { GC, RH, N_ROUTE, PLANE, partial, Graticule, Marker } from './shared';

const fmtKm = (x: number) => Math.round(x).toLocaleString('pt-BR');
const LOGO_SRC: string | null = null; // símbolo AV original: colocar o arquivo em public/ e o caminho aqui (não redesenhar)

// ---------- geometria auxiliar
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const A = slerp(0), Bv = slerp(1);
const Bp = (() => { const d = dot(A, Bv); const v: V3 = [Bv[0] - d * A[0], Bv[1] - d * A[1], Bv[2] - d * A[2]]; const n = Math.hypot(...v); return v.map((x) => x / n) as V3; })();
// círculo máximo completo (anel em volta da Terra)
const RING = Array.from({ length: 361 }, (_, i) => {
  const th = (i / 360) * 2 * Math.PI;
  const ll = toLL([Math.cos(th) * A[0] + Math.sin(th) * Bp[0], Math.cos(th) * A[1] + Math.sin(th) * Bp[1], Math.cos(th) * A[2] + Math.sin(th) * Bp[2]]);
  return { lam: rel(ll.lon), lat: ll.lat };
});
// rota operacional SIMULADA: o círculo máximo deslocado para o sul (até 7,5°) — ilustrativa, não é um voo real
const SIM = Array.from({ length: N_ROUTE + 1 }, (_, i) => {
  const tt = i / N_ROUTE, p = slerp(tt), ll = toLL(p);
  const d = 7.5 * D2R * Math.pow(Math.sin(Math.PI * tt), 1.3);
  const nrt: V3 = [-Math.sin(ll.lat) * Math.sin(ll.lon), Math.cos(ll.lat), -Math.sin(ll.lat) * Math.cos(ll.lon)];
  const q: V3 = [0, 1, 2].map((k) => Math.cos(d) * p[k] - Math.sin(d) * nrt[k]) as V3;
  const r = toLL(q); return { lam: rel(r.lon), lat: r.lat };
});
function smallCircle(c0: { lat: number; lon: number }, r: number, n = 64) {
  const c = toVec(c0.lat, c0.lon);
  const e: V3 = [Math.cos(c0.lon), 0, -Math.sin(c0.lon)];
  const nn: V3 = [-Math.sin(c0.lat) * Math.sin(c0.lon), Math.cos(c0.lat), -Math.sin(c0.lat) * Math.cos(c0.lon)];
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI;
    const ll = toLL([0, 1, 2].map((k) => Math.cos(r) * c[k] + Math.sin(r) * (Math.cos(a) * e[k] + Math.sin(a) * nn[k])) as V3);
    return { lam: rel(ll.lon), lat: ll.lat };
  });
}
const STORM_C = gcLL(0.30);
const STORM = [520, 330, 150].map((km) => smallCircle(STORM_C, km / R_KM));
const RESTR_C = gcLL(0.68);
const RESTR = (() => {
  const la = RESTR_C.lat, lo = RESTR_C.lon, dla = 4 * D2R, dlo = 10 * D2R, pts: { lam: number; lat: number }[] = [];
  for (let i = 0; i <= 20; i++) pts.push({ lam: rel(lo - dlo + (2 * dlo * i) / 20), lat: la + dla });
  for (let i = 0; i <= 20; i++) pts.push({ lam: rel(lo + dlo - (2 * dlo * i) / 20), lat: la - dla });
  pts.push(pts[0]); return pts;
})();
const WIND_ROWS = [47, 50, 53];
const SECTORS = [-158, -178, 162].map((lon) => Array.from({ length: 21 }, (_, i) => ({ lam: rel(lon * D2R), lat: (50 + i * 0.85) * D2R })));

const proj = (pts: { lam: number; lat: number }[], v: View) => pts.map((q) => project(q.lam, q.lat, v));
const polyAll = (ps: P[]) => 'M' + ps.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L') + 'Z';

// centro da esfera na tela (s = 1)
function centerOf(v: View) {
  const X = -v.panX, Y = -v.panY, Z = -1 / Math.max(v.s, 1e-6) + 0; // centro em (0,0,-ρ); só usado com s≈1
  const w = CAM_D - Z;
  const px = v.zoom * CAM_F * X / w, py = v.zoom * CAM_F * Y / w;
  const cr = Math.cos(v.roll), sr = Math.sin(v.roll);
  return { x: v.cx + px * cr - py * sr, y: v.cy - (px * sr + py * cr) };
}

const Plane: React.FC<{ pts: P[]; k: number; esc?: number }> = ({ pts, k, esc = 0.8 }) => {
  const i = Math.min(pts.length - 3, Math.max(2, Math.round(k * (pts.length - 1))));
  const a = pts[i], b = pts[i + 2], z = pts[i - 2];
  if (!a.vis) return null;
  const head = Math.atan2(b.x - z.x, -(b.y - z.y)) * 180 / Math.PI;
  return (
    <g transform={`translate(${a.x} ${a.y}) rotate(${head}) scale(${esc}) translate(-50 -50)`}>
      <path d={PLANE} fill={C.white} stroke={C.bg} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// manchete: revela da esquerda para a direita, sai subindo
const Headline: React.FC<{ t: number; t0: number; t1: number; y: number; parts: [string, string][]; size?: number; x?: number; id: string }> = ({ t, t0, t1, y, parts, size = 104, x = 72, id }) => {
  if (t < t0 || t > t1 + 0.5) return null;
  const k = seg(t, t0, t0 + 0.4, easeOut), out = seg(t, t1, t1 + 0.45, (q) => q * q);
  return (
    <g transform={`translate(0 ${-50 * out})`} opacity={1 - out}>
      <clipPath id={id}><rect x={0} y={0} width={x + 1000 * k} height={4000} /></clipPath>
      <text x={x} y={y} clipPath={`url(#${id})`} fontFamily={FONT_TITLE} fontWeight={800} fontSize={size} letterSpacing={1.5}>
        {parts.map(([txt, col], i) => <tspan key={i} fill={col}>{txt}</tspan>)}
      </text>
    </g>
  );
};

const Tag: React.FC<{ x: number; y: number; k: number; txt: string; col?: string; anchor?: 'start' | 'middle' | 'end'; size?: number }> = ({ x, y, k, txt, col = C.white, anchor = 'start', size = 30 }) =>
  k <= 0 ? null : (
    <text x={x} y={y + 12 * (1 - k)} opacity={k} textAnchor={anchor} fill={col} fontFamily={FONT_UI} fontWeight={700} fontSize={size} letterSpacing={2.5}
      stroke={C.bg} strokeWidth={9} paintOrder="stroke">{txt}</text>
  );

// camada simples de rotas para a vista de cima da cena 4
export const RouteLayer: React.FC<{ v: View; t: number }> = ({ v, t }) => {
  const g = proj(GC, v), r = proj(RH, v);
  return (
    <g>
      <Graticule v={v} />
      <path d={pathOf(r)} fill="none" stroke={C.yellow} strokeWidth={6} strokeLinecap="round" />
      <path d={pathOf(g)} fill="none" stroke={C.cyan} strokeWidth={8} strokeLinecap="round" />
      <Marker v={v} lat={NY.lat} lon={NY.lon} t0={-9} t={t} nome="NOVA YORK" side="left" mini />
      <Marker v={v} lat={TK.lat} lon={TK.lon} t0={-9} t={t} nome="TÓQUIO" side="right" mini />
      <Corresp v={v} t={t} />
    </g>
  );
};
const CORR_T = [0.25, 0.5, 0.75];
const Corresp: React.FC<{ v: View; t: number }> = ({ v, t }) => (
  <g>
    {CORR_T.map((tt, i) => {
      const k = easeOutBack(lin(t, E.corresp + i * 0.3125, E.corresp + i * 0.3125 + 0.3));
      if (k <= 0) return null;
      const q = gcLL(tt), p = project(rel(q.lon), q.lat, v);
      if (!p.vis) return null;
      return (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(${k})`}>
          <circle r={17} fill={C.white} stroke={C.bg} strokeWidth={4} />
          <text y={8} textAnchor="middle" fill={C.bg} fontFamily={FONT_UI} fontWeight={800} fontSize={22}>{i + 1}</text>
        </g>
      );
    })}
  </g>
);

export const Later: React.FC<{ t: number; v: View; sp: { k: number; top: View; bottom: View; divide: number }; gcP: P[]; rhP: P[] }> = ({ t, v, sp, gcP, rhP }) => {
  if (t < E.globoPronto - 2) return null;
  const els: React.ReactNode[] = [];

  // --- cena 2: na esfera, os círculos de Tissot ficam iguais
  const iguaisK = seg(t, E.iguais, E.iguais + 0.4, easeOut) * (1 - seg(t, E.cena3, E.cena3 + 0.4));
  if (iguaisK > 0) {
    const c = project(0, 72 * D2R, v);
    els.push(<Tag key="ig" x={c.x + 70} y={c.y - 40} k={iguaisK} txt="NA ESFERA: TODOS IGUAIS" />);
  }
  els.push(<Headline key="h1" id="h1" t={t} t0={E.titDistorce} t1={E.cena3} y={250} parts={[['O MAPA ', C.white], ['DISTORCE', C.yellow]]} />);
  els.push(<Headline key="h1b" id="h1b" t={t} t0={E.titDistorce + 0.3} t1={E.cena3} y={350} parts={[['DISTÂNCIAS', C.white]]} />);

  // --- cena 3: o círculo máximo é o corte da esfera por um plano que passa pelo centro
  const anelK = seg(t, E.anel, E.anel + 0.8, easeInOut) * (1 - seg(t, E.desenrola - 0.3, E.desenrola + 0.2));
  if (anelK > 0 && v.s > 0.97) {
    const ring = proj(RING, v);
    const n = Math.round(anelK * 360);
    const part = ring.slice(0, n + 1);
    const back = part.map((p) => ({ ...p, vis: !p.vis }));
    const cc = centerOf(v);
    const ny = gcP[0], tk = gcP[N_ROUTE];
    els.push(
      <g key="anel" opacity={Math.min(1, anelK * 1.5)}>
        <path d={polyAll(ring)} fill={C.cyan} fillOpacity={0.07 * anelK} />
        <path d={pathOf(back)} fill="none" stroke={C.cyan} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="10 12" />
        <path d={pathOf(part)} fill="none" stroke={C.cyan} strokeOpacity={0.85} strokeWidth={3.5} />
        <line x1={cc.x} y1={cc.y} x2={ny.x} y2={ny.y} stroke={C.white} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="6 8" />
        <line x1={cc.x} y1={cc.y} x2={tk.x} y2={tk.y} stroke={C.white} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="6 8" />
        <circle cx={cc.x} cy={cc.y} r={9} fill={C.white} />
        <Tag x={cc.x} y={cc.y + 46} k={anelK} txt="CENTRO DA TERRA" anchor="middle" size={26} />
      </g>,
    );
  }
  els.push(<Headline key="h2" id="h2" t={t} t0={E.titCirculo} t1={E.plano2 - 0.2} y={250} parts={[['CÍRCULO MÁXIMO', C.cyan]]} size={118} />);
  els.push(<Headline key="h2b" id="h2b" t={t} t0={E.titMenor} t1={E.plano2 - 0.2} y={325} parts={[['O MENOR CAMINHO SOBRE A ESFERA', C.white]]} size={58} />);

  // mapa de novo: segundo voo e o "desvio para o Norte"
  if (t >= E.voo2 && t < E.voo2Fim + 0.4) {
    const k = seg(t, E.voo2, E.voo2Fim, (x) => easeInOut(x) * 0.4 + x * 0.6);
    els.push(<Plane key="v2" pts={gcP} k={k} />);
  }
  const norteK = seg(t, E.norte, E.norte + 0.4, easeOut) * (1 - seg(t, E.globo2, E.globo2 + 0.4));
  if (norteK > 0) {
    const a = project(0, 71.5 * D2R, v), b = project(0, (71.5 + 9 * norteK) * D2R, v);
    els.push(
      <g key="norte" opacity={Math.min(1, norteK * 2)}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.white} strokeWidth={5} strokeLinecap="round" />
        <path d={`M${b.x - 14} ${b.y + 18} L${b.x} ${b.y - 4} L${b.x + 14} ${b.y + 18}`} fill="none" stroke={C.white} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        <Tag x={b.x + 26} y={b.y + 12} k={norteK} txt="NORTE" />
      </g>,
    );
  }

  // --- revelação: no globo centrado no meio da rota, o círculo máximo é uma reta na tela
  const retaK = seg(t, E.reta, E.reta + 0.6, easeOut) * (1 - seg(t, E.split, E.split + 0.4));
  if (retaK > 0) {
    const a = gcP[0], b = gcP[N_ROUTE];
    const ang = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI, L = Math.hypot(a.x - b.x, a.y - b.y);
    const ticks = Array.from({ length: Math.floor(L / 24) + 1 }, (_, i) => i * 24);
    els.push(
      <g key="regua" transform={`translate(${b.x} ${b.y}) rotate(${ang})`} opacity={retaK}>
        <clipPath id="reguaClip"><rect x={-10} y={-80} width={(L + 20) * retaK} height={160} /></clipPath>
        <g clipPath="url(#reguaClip)">
          <rect x={0} y={22} width={L} height={30} fill={C.white} fillOpacity={0.1} stroke={C.white} strokeOpacity={0.7} strokeWidth={2} />
          {ticks.map((x, i) => <line key={i} x1={x} y1={22} x2={x} y2={i % 5 === 0 ? 42 : 32} stroke={C.white} strokeOpacity={0.7} strokeWidth={2} />)}
        </g>
      </g>,
    );
  }
  const distK = seg(t, E.distancias, E.distancias + 0.4, easeOut) * (1 - seg(t, E.split, E.split + 0.35));
  if (distK > 0) {
    const y0 = 150 - 20 * (1 - distK);
    els.push(
      <g key="dist" opacity={distK}>
        <text x={72} y={y0 + 70} fill={C.cyan} fontFamily={FONT_TITLE} fontWeight={800} fontSize={92} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtKm(GC_KM)} km</text>
        <text x={74} y={y0 + 112} fill={C.cyan} fontFamily={FONT_UI} fontWeight={700} fontSize={26} letterSpacing={2.5}>CÍRCULO MÁXIMO</text>
        <text x={570} y={y0 + 70} fill={C.yellow} fontFamily={FONT_TITLE} fontWeight={800} fontSize={92} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtKm(RH_KM)} km</text>
        <text x={572} y={y0 + 112} fill={C.yellow} fontFamily={FONT_UI} fontWeight={700} fontSize={26} letterSpacing={2.5}>LINHA RETA DO MAPA</text>
        <text x={74} y={y0 + 156} fill={C.white} fillOpacity={0.6} fontFamily={FONT_UI} fontWeight={500} fontSize={24}>distâncias calculadas numa esfera de raio médio 6.371 km</text>
      </g>,
    );
  }

  // --- cena 4: mesma rota, outra perspectiva
  if (sp.k > 0) {
    const k2 = seg(t, E.splitTxt, E.splitTxt + 0.4, easeOut) * (1 - seg(t, E.splitFim - 0.5, E.splitFim - 0.1));
    // linhas de correspondência entre os mesmos pontos nas duas vistas
    const lines = CORR_T.map((tt, i) => {
      const kk = seg(t, E.corresp + 0.3125 + i * 0.3125, E.corresp + 0.7 + i * 0.3125, easeOut) * (1 - seg(t, E.splitFim - 0.6, E.splitFim - 0.2));
      const q = gcLL(tt), a = project(rel(q.lon), q.lat, sp.top), b = project(rel(q.lon), q.lat, sp.bottom);
      if (kk <= 0 || !b.vis) return null;
      return <line key={i} x1={a.x} y1={a.y} x2={mix(a.x, b.x, kk)} y2={mix(a.y, b.y, kk)} stroke={C.white} strokeOpacity={0.55} strokeWidth={2.5} strokeDasharray="8 8" />;
    });
    els.push(
      <g key="split">
        {lines}
        <g clipPath="url(#botClip)"><Corresp v={sp.bottom} t={t} /></g>
        <line x1={0} y1={sp.divide} x2={W} y2={sp.divide} stroke={C.bg} strokeWidth={6} />
        {k2 > 0 && (
          <text x={72} y={sp.divide + 92} opacity={k2} fontFamily={FONT_TITLE} fontWeight={800} fontSize={66} letterSpacing={1}
            stroke={C.bg} strokeWidth={10} paintOrder="stroke">
            <tspan fill={C.white}>MESMA ROTA. </tspan><tspan fill={C.cyan}>OUTRA PERSPECTIVA.</tspan>
          </text>
        )}
        <Tag x={72} y={sp.divide - 30} k={k2} txt="MAPA PLANO (MERCATOR)" size={26} />
        <Tag x={72} y={sp.divide + 150} k={k2} txt="GLOBO" size={26} />
      </g>,
    );
  }

  // --- cena 5: rota simulada e o que muda as rotas reais
  const fora5 = 1 - seg(t, E.cena6, E.cena6 + 0.5);
  if (t > E.simIni && fora5 > 0) {
    const kS = seg(t, E.simIni, E.simFim, easeInOut);
    const sp5 = proj(SIM, v);
    const mid = sp5[Math.round(N_ROUTE * 0.5)];
    els.push(
      <g key="sim" opacity={fora5}>
        <path d={pathOf(partial(sp5, kS))} fill="none" stroke={C.white} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" />
        <Tag x={mid.x} y={mid.y + 52} k={seg(t, E.simIni + 1.0, E.simIni + 1.4, easeOut)} txt="ROTA SIMULADA" anchor="middle" />
      </g>,
    );
    const top = seg(t, E.simIni + 0.3, E.simIni + 0.7, easeOut);
    els.push(<Tag key="simtag" x={72} y={E.maisCurto < t ? 410 : 250} k={top * fora5} txt="SIMULAÇÃO ILUSTRATIVA — NÃO É UM VOO REAL" size={26} col={C.white} />);
  }
  // ventos: linhas de corrente para leste (deslocamento contínuo em função do tempo)
  const ventoK = seg(t, E.ventos, E.ventos + 0.5, easeOut) * fora5;
  if (ventoK > 0) {
    const rows = WIND_ROWS.map((la, r) => {
      const pts = Array.from({ length: 80 }, (_, i) => project(rel((150 + i * 1.1) * D2R), la * D2R, v));
      return <path key={r} d={pathOf(pts)} fill="none" stroke={C.white} strokeOpacity={0.55 * ventoK} strokeWidth={3}
        strokeDasharray="28 22" strokeDashoffset={-(t - E.ventos) * 90 - r * 17} strokeLinecap="round" />;
    });
    const lab = project(rel(-150 * D2R), 46 * D2R, v);
    const head = WIND_ROWS.map((la, r) => {
      const a = project(rel(-124 * D2R), la * D2R, v), b = project(rel(-122 * D2R), la * D2R, v);
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      return a.vis ? <path key={r} transform={`translate(${b.x} ${b.y}) rotate(${ang})`} d="M-14 -10 L2 0 L-14 10" fill="none" stroke={C.white} strokeOpacity={0.7 * ventoK} strokeWidth={4} strokeLinejoin="round" /> : null;
    });
    els.push(<g key="vento">{rows}{head}{lab.vis && <Tag x={lab.x} y={lab.y + 44} k={ventoK} txt="VENTOS" anchor="middle" />}</g>);
  }
  const tempK = seg(t, E.tempestade, E.tempestade + 0.4, easeOutBack) * fora5;
  if (tempK > 0) {
    const rings = STORM.map((r) => proj(r, v));
    const c = project(rel(STORM_C.lon), STORM_C.lat, v);
    const pul = 1 + 0.04 * Math.sin((t - E.tempestade) * 5);
    els.push(
      <g key="temp" transform={`translate(${c.x} ${c.y}) scale(${tempK * pul}) translate(${-c.x} ${-c.y})`}>
        {rings.map((r, i) => <path key={i} d={pathOf(r) + 'Z'} fill={C.yellow} fillOpacity={[0.10, 0.16, 0.30][i]} stroke={C.yellow} strokeOpacity={0.8} strokeWidth={2.5} />)}
        <path transform={`translate(${c.x} ${c.y})`} d="M4 -26 L-10 2 L2 2 L-4 26 L12 -6 L0 -6 Z" fill={C.yellow} />
        <Tag x={c.x} y={c.y - 82} k={Math.min(1, tempK)} txt="TEMPESTADE" anchor="middle" col={C.yellow} />
      </g>,
    );
  }
  const restK = seg(t, E.restrito, E.restrito + 0.5, easeOut) * fora5;
  if (restK > 0) {
    const ps = proj(RESTR, v);
    const c = project(rel(RESTR_C.lon), RESTR_C.lat + 4 * D2R, v);
    els.push(
      <g key="rest" opacity={restK}>
        <defs><pattern id="hRest" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="14" stroke={C.white} strokeOpacity={0.35} strokeWidth={3} /></pattern></defs>
        <path d={polyAll(ps)} fill="url(#hRest)" stroke={C.white} strokeWidth={3} strokeDasharray="12 8" />
        <Tag x={c.x} y={c.y - 22} k={restK} txt="ESPAÇO AÉREO RESTRITO" anchor="middle" />
      </g>,
    );
  }
  const atcK = seg(t, E.atc, E.atc + 0.5, easeOut) * fora5;
  if (atcK > 0) {
    const segs = SECTORS.map((s) => proj(s, v));
    const lab = segs[1][0];
    els.push(
      <g key="atc" opacity={atcK}>
        {segs.map((s, i) => <path key={i} d={pathOf(partial(s, atcK))} fill="none" stroke={C.cyan} strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="4 10" strokeLinecap="round" />)}
        <Tag x={lab.x} y={lab.y + 44} k={atcK} txt="CONTROLE DE TRÁFEGO" anchor="middle" col={C.cyan} size={26} />
      </g>,
    );
  }
  els.push(<Headline key="h5" id="h5" t={t} t0={E.maisCurto} t1={E.cena6} y={230} parts={[['MAIS CURTO ', C.cyan], ['≠', C.white]]} size={112} />);
  els.push(<Headline key="h5b" id="h5b" t={t} t0={E.maisCurto + 0.35} t1={E.cena6} y={340} parts={[['SEMPRE MAIS RÁPIDO', C.yellow]]} size={112} />);

  // --- cena 6: de volta ao mapa, avião rápido, assinatura
  if (t >= E.aviaoFinal && t < E.aviaoFinalFim + 0.3) {
    els.push(<Plane key="v3" pts={gcP} k={seg(t, E.aviaoFinal, E.aviaoFinalFim, easeInOut)} esc={0.9} />);
  }
  const assK = seg(t, E.afasta, E.afasta + 1.2, easeInOut);
  if (assK > 0) {
    const a1 = seg(t, E.assinatura, E.assinatura + 0.45, easeOut), a2 = seg(t, E.assinatura + 0.25, E.assinatura + 0.7, easeOut);
    const und = seg(t, E.assinatura + 0.5, E.assinatura + 1.1, easeInOut), sl = seg(t, E.slogan, E.slogan + 0.5, easeOut);
    els.push(
      <g key="ass">
        <rect x={0} y={0} width={W} height={4000} fill={C.bg} opacity={0.5 * assK} />
        <path d={pathOf(gcP)} fill="none" stroke={C.cyan} strokeWidth={10} strokeLinecap="round" opacity={assK} />
        <clipPath id="ass1"><rect x={0} y={0} width={72 + 1000 * a1} height={4000} /></clipPath>
        <clipPath id="ass2"><rect x={0} y={0} width={72 + 1000 * a2} height={4000} /></clipPath>
        <clipPath id="ass3"><rect x={0} y={0} width={72 + 1000 * sl} height={4000} /></clipPath>
        <text x={66} y={1190} clipPath="url(#ass1)" fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={190} letterSpacing={2}>ALÉM DO</text>
        <text x={66} y={1360} clipPath="url(#ass2)" fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={190} letterSpacing={2}>VISÍVEL</text>
        <line x1={72} y1={1400} x2={72 + 520 * und} y2={1400} stroke={C.cyan} strokeWidth={10} strokeLinecap="round" />
        <text x={72} y={1475} clipPath="url(#ass3)" fill={C.white} fontFamily={FONT_UI} fontWeight={600} fontSize={40} letterSpacing={2.5}>O EXTRAORDINÁRIO ESTÁ NOS DETALHES.</text>
        {LOGO_SRC && <image href={LOGO_SRC} x={72} y={900} width={150} height={150} opacity={a1} />}
      </g>,
    );
  }
  return <g>{els}</g>;
};
