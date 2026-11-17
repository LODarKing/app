// Capa 9:16 do episódio 04, gerada pelo motor do vídeo (mesmo mapa, mesmas rotas calculadas).
// Tudo o que importa fica na faixa 4:5 central (y 285–1635), como nas capas anteriores.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GlobeGL } from './GlobeGL';
import { project, pathOf, View, I3 } from './morph';
import { D2R, NY, TK, rel, GC_KM, RH_KM } from './geo';
import { C, FONT_TITLE, FONT_UI, W, H } from './theme';
import { GC, RH, N_ROUTE, PLANE, Graticule } from './shared';
import { LATC_FLAT, PANX_FLAT } from './camera';

const fmtKm = (x: number) => Math.round(x).toLocaleString('pt-BR');

export const Capa: React.FC<{ guia?: boolean }> = ({ guia = false }) => {
  const v: View = { s: 0, u: 0, latC: LATC_FLAT, G: I3, zoom: 1.22, panX: PANX_FLAT, panY: 0, roll: 0, cx: W / 2, cy: 1020 };
  const g = GC.map((q) => project(q.lam, q.lat, v)), r = RH.map((q) => project(q.lam, q.lat, v));
  const ny = project(rel(NY.lon * D2R), NY.lat * D2R, v), tk = project(rel(TK.lon * D2R), TK.lat * D2R, v);
  // avião um pouco depois do ápice, apontando ao longo da rota (Nova York -> Tóquio)
  const i = Math.round(N_ROUTE * 0.56), a = g[i], b = g[i + 2], z = g[i - 2];
  const head = Math.atan2(b.x - z.x, -(b.y - z.y)) * 180 / Math.PI;
  // trilha atrás do avião (mesma rota, mais forte no trecho já voado)
  const voado = g.slice(0, i + 1);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GlobeGL views={[{ v }]} width={W} height={H} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* fundo do mapa mais escuro onde fica o texto, sem gradiente: duas faixas sólidas translúcidas */}
        <Graticule v={v} />
        <rect x={0} y={0} width={W} height={660} fill={C.bg} opacity={0.55} />
        <rect x={0} y={1240} width={W} height={H - 1240} fill={C.bg} opacity={0.62} />

        {/* rotas */}
        <path d={pathOf(r)} fill="none" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" />
        <path d={pathOf(g)} fill="none" stroke={C.cyan} strokeWidth={12} strokeOpacity={0.45} strokeLinecap="round" />
        <path d={pathOf(voado)} fill="none" stroke={C.cyan} strokeWidth={18} strokeLinecap="round" />

        {/* rótulos nas próprias linhas */}
        <text x={r[Math.round(N_ROUTE * 0.5)].x} y={r[Math.round(N_ROUTE * 0.5)].y + 66} textAnchor="middle" fill={C.yellow}
          fontFamily={FONT_UI} fontWeight={800} fontSize={40} letterSpacing={4} stroke={C.bg} strokeWidth={10} paintOrder="stroke">LINHA RETA</text>

        {/* cidades */}
        {[{ p: ny, n: 'NOVA YORK', end: true }, { p: tk, n: 'TÓQUIO', end: false }].map(({ p, n, end }) => (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={20} fill={C.bg} stroke={C.white} strokeWidth={6} />
            <circle cx={p.x} cy={p.y} r={8} fill={C.white} />
            <text x={p.x + (end ? 22 : -22)} y={p.y + 70} textAnchor={end ? 'end' : 'start'} fill={C.white}
              fontFamily={FONT_UI} fontWeight={800} fontSize={40} letterSpacing={3} stroke={C.bg} strokeWidth={10} paintOrder="stroke">{n}</text>
          </g>
        ))}

        {/* avião grande */}
        <g transform={`translate(${a.x} ${a.y}) rotate(${head}) scale(1.55) translate(-50 -50)`}>
          <path d={PLANE} fill={C.white} stroke={C.bg} strokeWidth={6} strokeLinejoin="round" />
        </g>

        {/* título */}
        <text x={64} y={470} fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={124} letterSpacing={1.5}>POR QUE O AVIÃO</text>
        <text x={64} y={598} fontFamily={FONT_TITLE} fontWeight={800} fontSize={124} letterSpacing={1.5}>
          <tspan fill={C.white}>FAZ ESSA </tspan><tspan fill={C.cyan}>CURVA?</tspan>
        </text>
        <text x={68} y={340} fill={C.white} fillOpacity={0.8} fontFamily={FONT_UI} fontWeight={700} fontSize={32} letterSpacing={6}>ALÉM DO VISÍVEL · EP. 04</text>

        {/* o paradoxo em números (modelo esférico) */}
        <text x={64} y={1352} fill={C.cyan} fontFamily={FONT_UI} fontWeight={800} fontSize={36} letterSpacing={4}>CURVA</text>
        <text x={60} y={1462} fill={C.cyan} fontFamily={FONT_TITLE} fontWeight={800} fontSize={112} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtKm(GC_KM)} km</text>
        <text x={570} y={1352} fill={C.yellow} fontFamily={FONT_UI} fontWeight={800} fontSize={36} letterSpacing={4}>RETA</text>
        <text x={566} y={1462} fill={C.yellow} fontFamily={FONT_TITLE} fontWeight={800} fontSize={112} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtKm(RH_KM)} km</text>
        <text x={66} y={1556} fill={C.white} fontFamily={FONT_TITLE} fontWeight={800} fontSize={72} letterSpacing={1}>
          <tspan fill={C.white}>O MAPA ESTÁ TE </tspan><tspan fill={C.yellow}>ENGANANDO.</tspan>
        </text>
        <text x={68} y={1610} fill={C.white} fillOpacity={0.55} fontFamily={FONT_UI} fontWeight={500} fontSize={24}>Nova York → Tóquio · distâncias numa esfera de raio 6.371 km</text>

        {guia && (
          <g>
            <rect x={2} y={285} width={W - 4} height={1350} fill="none" stroke="#ff3b3b" strokeWidth={4} strokeDasharray="20 12" />
            <text x={20} y={275} fill="#ff3b3b" fontFamily={FONT_UI} fontWeight={700} fontSize={26}>faixa 4:5 (1080×1350)</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
