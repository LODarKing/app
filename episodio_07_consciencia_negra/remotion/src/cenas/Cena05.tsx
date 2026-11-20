import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeIn, easeBack, mulberry32 } from '../tema';
import { typed, typedIO } from '../comp/util';
import { xy, MALHA, POA_LL, SSA_LL } from '../geo';
import { MapaBR } from './Cena02';
import { CAM_BR2 } from './Cena04';

/* CENA 05 — A IDEIA SE ESPALHA (39,1 → 49,8 s)
 *  b60.75 "A proposta se espalhou" → malha de pontos acende a partir de Porto Alegre (símbolo; não marca cidades)
 *  b64.25 "Movimento Negro"        → 1978 · MNU — assembleia em Salvador (BA) (fato do Senado)
 *  42,25 → 42,9                    → os pontos convergem e viram a linha do tempo vertical
 *  b66 "2011" · b68.25 "oficializada" → 2011 · DATA OFICIALIZADA · LEI Nº 12.519
 *  45,7 → b74.25 "2024"            → a linha desce devagar até 2024: SÓ EM 2024 VIROU FERIADO NACIONAL (Lei nº 14.759/2023)
 */
const LX = 150;
// marcos com espaçamento uniforme (legibilidade no celular); o eixo é partido entre 1695 e 1971
const YS: Record<number, number> = { 1695: 340, 1971: 510, 1978: 660, 2011: 810, 2024: 960 };
const Y = (ano: number) => YS[ano];
const NOS: { ano: number; txt: string; sub?: string; ouro: boolean; t0: number }[] = [
  { ano: 1695, txt: 'ZUMBI DOS PALMARES', ouro: true, t0: 42.5 },
  { ano: 1971, txt: 'GRUPO PALMARES', ouro: true, t0: 42.62 },
  { ano: 1978, txt: 'MOVIMENTO NEGRO UNIFICADO', ouro: false, t0: 42.74 },
  { ano: 2011, txt: 'DATA OFICIALIZADA', sub: 'LEI Nº 12.519', ouro: false, t0: b(66) },
  { ano: 2024, txt: 'FERIADO NACIONAL', sub: 'LEI Nº 14.759/2023', ouro: true, t0: b(74.25) },
];
const T_SUB: Record<number, number> = { 2011: b(68.25), 2024: b(74.25) + 0.35 };
const DMAX = 1300;
const PONTOS = MALHA.map((p, i) => {
  const [x, y] = xy(CAM_BR2, p[0], p[1]); const [ox, oy] = xy(CAM_BR2, ...POA_LL);
  const r = mulberry32(5000 + i);
  return { x, y, t0: 39.2 + 2.3 * (Math.hypot(x - ox, y - oy) / DMAX) + r() * 0.25, alvoY: lerp(340, 960, i / MALHA.length), atraso: r() * 0.2 };
});

export const Cena05: React.FC<{ t: number }> = ({ t }) => {
  if (t < 39.05 || t > 49.9) return null;
  const opMapa = (1 - easeIn(prog(t, 41.9, 42.4))) * lerp(1, 0.5, prog(t, 39.2, 40.2));
  const [ox, oy] = xy(CAM_BR2, ...POA_LL), [bx, by] = xy(CAM_BR2, ...SSA_LL);
  const pingS = prog(t, b(64.25), b(64.25) + 0.8);
  const fundoLinha = t < 42.25 ? 0 : t < b(66) ? lerp(340, Y(1978), easeOut(prog(t, 42.4, 42.9))) : t < 45.7 ? lerp(Y(1978), Y(2011), easeOut(prog(t, b(66) - 0.1, b(66) + 0.3))) : lerp(Y(2011), Y(2024), easeInOut(prog(t, 45.7, b(74.25))));
  const ouro = easeInOut(prog(t, b(74.25), b(74.25) + 0.7));
  const saiTudo = easeIn(prog(t, b(76.5), b(76.5) + 0.45));         // "Hoje": a cena 06 assume (a linha vira a moldura)
  const sobeRev = (i: number) => 360 * easeIn(prog(t, b(76.5) + i * 0.05, b(76.5) + 0.4 + i * 0.05));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><clipPath id="revclip"><rect x={0} y={1030} width={1080} height={200} /></clipPath></defs>
      {opMapa > 0 && <MapaBR c={CAM_BR2} t={t} op={opMapa} estadosOp={0.15} />}
      {/* malha de pontos: acende e depois converge para a linha do tempo */}
      {t < 43.1 && PONTOS.map((p, i) => {
        const a = prog(t, p.t0, p.t0 + 0.25);
        if (a <= 0) return null;
        const quente = 1 - prog(t, p.t0 + 0.25, p.t0 + 0.9);
        const u = easeInOut(prog(t, 42.25 + p.atraso, 42.75 + p.atraso));
        return <circle key={i} cx={lerp(p.x, LX, u)} cy={lerp(p.y, p.alvoY, u)} r={lerp(4.6 * easeOut(a), 3, u)} fill={quente > 0.01 ? COR.ciano : COR.bege} opacity={(0.55 + 0.45 * quente) * (1 - prog(t, 42.85, 43.1))} />;
      })}
      {t < 42.4 && (
        <g opacity={1 - prog(t, 42.0, 42.4)}>
          <circle cx={ox} cy={oy} r={10} fill={COR.ciano} />
          <text x={ox + 20} y={oy + 10} fontFamily={FONTE.ui} fontWeight={700} fontSize={30} fill={COR.ciano} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">1971</text>
          <text x={540} y={392} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={21} letterSpacing={2} fill={COR.bege} opacity={0.7}>{typed('REPRESENTAÇÃO SIMBÓLICA · OS PONTOS NÃO SÃO CIDADES', t, 39.6, 60)}</text>
          {t > b(64.25) && (
            <g>
              <circle cx={bx} cy={by} r={10} fill={COR.dourado} />
              {pingS < 1 && <circle cx={bx} cy={by} r={12 + 70 * easeOut(pingS)} fill="none" stroke={COR.dourado} strokeWidth={3} opacity={1 - pingS} />}
              <text x={bx - 22} y={by + 10} textAnchor="end" fontFamily={FONTE.ui} fontWeight={700} fontSize={28} fill={COR.branco} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typed('SALVADOR (BA)', t, b(64.5), 30)}</text>
            </g>
          )}
          <text x={540} y={260} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={110} fill={COR.dourado}>{typed('1978', t, b(64.25), 24)}</text>
          <text x={540} y={322} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={34} letterSpacing={1} fill={COR.branco}>{typed('MOVIMENTO NEGRO UNIFICADO', t, b(64.5), 40)}</text>
        </g>
      )}
      {/* linha do tempo vertical */}
      {t >= 42.25 && (
        <g transform={`translate(${-900 * saiTudo},0)`}>
          <line x1={LX} x2={LX} y1={340} y2={fundoLinha} stroke={COR.ciano} strokeWidth={5} />
          {ouro > 0 && <line x1={LX} x2={LX} y1={340} y2={lerp(340, Y(2024), ouro)} stroke={COR.dourado} strokeWidth={7} />}
          {/* eixo partido entre 1695 e 1971 */}
          {fundoLinha > 460 && [415, 435].map((y) => <line key={y} x1={LX - 18} x2={LX + 18} y1={y + 8} y2={y - 8} stroke={COR.fundo} strokeWidth={10} />)}
          {fundoLinha > 460 && [415, 435].map((y) => <line key={'b' + y} x1={LX - 16} x2={LX + 16} y1={y + 7} y2={y - 7} stroke={COR.bege} strokeWidth={2.5} />)}
          {NOS.map((n) => {
            const y = Y(n.ano), on = easeBack(prog(t, n.t0, n.t0 + 0.3));
            if (t < n.t0 || fundoLinha < y - 2) return null;
            const big = n.ouro && ouro > 0 ? lerp(1, 1.3, ouro) : 1;
            const cor = n.ouro && (ouro > 0 || n.ano !== 2024) ? COR.dourado : COR.ciano;
            return (
              <g key={n.ano}>
                <circle cx={LX} cy={y} r={17 * on * big} fill={cor} stroke={COR.fundo} strokeWidth={4} />
                <text x={200} y={y + 21} fontFamily={FONTE.titulo} fontWeight={900} fontSize={60} fill={cor}>{typed(String(n.ano), t, n.t0, 30)}</text>
                <text x={384} y={y + 12} fontFamily={FONTE.ui} fontWeight={600} fontSize={34} fill={COR.branco}>{typed(n.txt, t, n.t0 + 0.08, 50)}</text>
                {n.sub && <text x={384} y={y + 54} fontFamily={FONTE.ui} fontWeight={500} fontSize={29} letterSpacing={1} fill={COR.bege}>{typed(n.sub, t, T_SUB[n.ano], 40)}</text>}
              </g>
            );
          })}
          {/* espera por 2024: contorno tracejado do nó que ainda não chegou */}
          {t > b(71.5) && t < b(74.25) && <circle cx={LX} cy={Y(2024)} r={17} fill="none" stroke={COR.dourado} strokeWidth={3} strokeDasharray="5 5" />}
          {(() => { const p = prog(t, b(74.25), b(74.25) + 0.9); return p > 0 && p < 1 ? <circle cx={LX} cy={Y(2024)} r={16 + 90 * easeOut(p)} fill="none" stroke={COR.dourado} strokeWidth={3} opacity={1 - p} /> : null; })()}
        </g>
      )}
      {/* a revelação */}
      {t >= b(74.25) && (
        <g clipPath="url(#revclip)">
          <text x={78} y={1142 - sobeRev(0)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={124} fill={COR.dourado}>{typed('SÓ EM 2024', t, b(74.25), 40)}</text>
          <text x={82} y={1214 - sobeRev(1)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={60} fill={COR.branco}>{typed('VIROU FERIADO NACIONAL', t, b(74.75), 44)}</text>
        </g>
      )}
    </svg>
  );
};
