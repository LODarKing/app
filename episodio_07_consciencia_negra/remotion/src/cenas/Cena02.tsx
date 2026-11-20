import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeIn } from '../tema';
import { typed, typedIO } from '../comp/util';
import { Contador } from '../comp/Contador';
import { CAM_BR, CamMapa, camLerp, caminho, xy, BR10, ESTADOS, POA_LL } from '../geo';

/* CENA 02 — PORTO ALEGRE, 1971 (11,87 → 22,7 s)
 *  b19.25 "ditadura"   → contexto "DITADURA MILITAR · 1964–1985"
 *  12,9 → 14,9         → câmera desce até o Rio Grande do Sul
 *  b23   "Porto Alegre"→ PORTO ALEGRE — 1971
 *  b24   "decidiu"     → entra a FICHA DE PESQUISA do canal (nossa, não é documento de época)
 *  b30.5 "Entre eles"  → integrantes citados pela Agência Senado; b32.75 "Oliveira" → marca-texto + POETA (1941–2009)
 */
export const T2 = { ini: 11.87, fim: 22.5 };
const TINTA = '#22252D';
const CAM_RS: CamMapa = { lon: -53.3, lat: -30.0, K: 92, cx: 540, cy: 900 };

export function camCena02(t: number): CamMapa {
  const a = camLerp(CAM_BR, CAM_RS, easeInOut(prog(t, 12.9, 14.9)));
  return { ...a, K: a.K * (1 + 0.12 * prog(t, 14.9, 22.7)) };
}

export const MapaBR: React.FC<{ c: CamMapa; t: number; destaque?: string; tDestaque?: number; corDestaque?: string; op?: number; estadosOp?: number }> = ({ c, t, destaque, tDestaque = 0, corDestaque = COR.bege, op = 1, estadosOp = 0.22 }) => {
  const uD = easeOut(prog(t, tDestaque, tDestaque + 0.8));
  return (
    <g opacity={op}>
      {estadosOp > 0 && ESTADOS.map((e) => e.aneis.map((r, k) => (
        <path key={e.uf + k} d={caminho(c, r)} fill="none" stroke={COR.bege} strokeOpacity={estadosOp} strokeWidth={1.4} strokeDasharray="5 6" />
      )))}
      {destaque && ESTADOS.filter((e) => e.uf === destaque).map((e) => e.aneis.map((r, k) => (
        <path key={'d' + k} d={caminho(c, r)} fill={corDestaque} fillOpacity={0.1 * uD} stroke={corDestaque} strokeWidth={2.6} pathLength={1} strokeDasharray={`${uD} 1`} />
      )))}
      <path d={caminho(c, BR10)} fill="none" stroke={COR.bege} strokeWidth={3.2} strokeLinejoin="round" />
    </g>
  );
};

const NOMES = ['ANTÔNIO CARLOS CÔRTES', 'OLIVEIRA SILVEIRA', 'ILMO DA SILVA', 'VILMAR NUNES', 'JORGE ANTÔNIO DOS SANTOS', 'LUIZ PAULO ASSIS SANTOS'];

export const Cena02: React.FC<{ t: number }> = ({ t }) => {
  if (t < T2.ini || t > T2.fim) return null;
  const c = camCena02(t);
  const [px, py] = xy(c, ...POA_LL);
  const sai = easeIn(prog(t, 15.25, 15.75));                  // contador e contexto saem por cima quando a ficha entra
  const uFicha = easeOut(prog(t, b(24), b(24) + 0.6));
  const uFora = easeIn(prog(t, 21.98, 22.45));                  // a ficha sai para a esquerda (entra a cena 03)
  const dimMapa = lerp(1, 0.35, uFicha);
  const ping = prog(t, b(23), b(23) + 0.8);
  const marca = easeOut(prog(t, b(32.75), b(32.75) + 0.28));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <MapaBR c={c} t={t} destaque="RS" tDestaque={13.1} op={dimMapa * (1 - uFora)} />
      <g opacity={dimMapa * (1 - uFora)}>
        <circle cx={px} cy={py} r={11} fill={COR.ciano} />
        {ping > 0 && ping < 1 && <circle cx={px} cy={py} r={12 + 80 * easeOut(ping)} fill="none" stroke={COR.ciano} strokeWidth={3} opacity={1 - ping} />}
        <text x={px - 34} y={py - 70} textAnchor="end" fontFamily={FONTE.titulo} fontWeight={900} fontSize={78} fill={COR.branco} stroke={COR.fundo} strokeWidth={12} paintOrder="stroke">{typed('PORTO ALEGRE', t, b(23), 30)}</text>
        <text x={px - 34} y={py - 16} textAnchor="end" fontFamily={FONTE.ui} fontWeight={600} fontSize={40} fill={COR.dourado} stroke={COR.fundo} strokeWidth={10} paintOrder="stroke">{typed('— 1971', t, b(23.5), 24)}</text>
        {(() => { const [rx, ry] = xy(c, -54.6, -31.1); return <text x={rx} y={ry} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={28} letterSpacing={3} fill={COR.bege} opacity={0.85}>{typed('RIO GRANDE DO SUL', t, 13.5, 30)}</text>; })()}
      </g>
      {/* contador herdado da cena 01 (1971) e o contexto histórico */}
      {sai < 1 && (
        <g transform={`translate(0,${-520 * sai})`}>
          <Contador v={1971} cx={540} base={370} s={0.62} cor={COR.bege} id="cont2" />
          <text x={540} y={448} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={32} letterSpacing={2} fill={COR.bege} stroke={COR.fundo} strokeWidth={10} paintOrder="stroke">{typed('DITADURA MILITAR · 1964–1985', t, b(19.25), 34)}</text>
        </g>
      )}
      {/* FICHA DE PESQUISA (recriação gráfica do canal) */}
      {uFicha > 0 && (
        <g transform={`translate(${-1400 * uFora},${(1 - uFicha) * 1500}) rotate(${-1.2 - 6 * uFora},540,780)`}>
          <rect x={126} y={322} width={860} height={950} rx={6} fill="#000" opacity={0.35} />
          <rect x={110} y={300} width={860} height={950} rx={6} fill={COR.bege} />
          <rect x={110} y={300} width={860} height={950} rx={6} fill="none" stroke={TINTA} strokeOpacity={0.15} strokeWidth={2} />
          <text x={160} y={364} fontFamily={FONTE.ui} fontWeight={500} fontSize={22} letterSpacing={2} fill={TINTA} opacity={0.65}>{typed('FICHA DE PESQUISA · ALÉM DO VISÍVEL', t, b(24) + 0.15, 40)}</text>
          <text x={160} y={470} fontFamily={FONTE.titulo} fontWeight={900} fontSize={100} fill={TINTA}>{t > b(24.75) ? 'GRUPO' : ''}</text>
          <text x={160} y={570} fontFamily={FONTE.titulo} fontWeight={900} fontSize={100} fill={COR.terracota}>{t > b(25.25) ? 'PALMARES' : ''}</text>
          <line x1={160} x2={160 + 760 * easeOut(prog(t, b(25.5), b(25.5) + 0.4))} y1={606} y2={606} stroke={TINTA} strokeWidth={3} />
          {([['PORTO ALEGRE — RS', b(25.75), 662, 34, 600], ['FORMADO EM JULHO DE 1971', b(26.5), 712, 31, 500], ['ESTUDOS SOBRE A HISTÓRIA NEGRA', b(27.75), 760, 31, 500],
            ['1º ATO: 20/11/1971 · CLUBE MARCÍLIO DIAS', b(29), 808, 27, 500]] as [string, number, number, number, number][]).map(([s, t0, y, fs, fw], i) => (
            <text key={i} x={160} y={y} fontFamily={FONTE.ui} fontWeight={fw} fontSize={fs} fill={TINTA}>{typed(s, t, t0, 40)}</text>
          ))}
          <line x1={160} x2={160 + 760 * easeOut(prog(t, b(30.25), b(30.25) + 0.4))} y1={842} y2={842} stroke={TINTA} strokeOpacity={0.4} strokeWidth={2} />
          <text x={160} y={892} fontFamily={FONTE.ui} fontWeight={500} fontSize={23} letterSpacing={1} fill={TINTA} opacity={0.7}>{typed('INTEGRANTES CITADOS PELA AGÊNCIA SENADO:', t, b(30.5), 50)}</text>
          {/* marca-texto em Oliveira Silveira */}
          <rect x={152} y={950 + 40 - 33} width={(17 * 0.6 * 30 + 16) * marca} height={42} fill={COR.ciano} opacity={0.55} />
          {NOMES.map((n, i) => (
            <text key={n} x={160} y={950 + i * 40} fontFamily={FONTE.ui} fontWeight={i === 1 ? 700 : 500} fontSize={30} fill={TINTA}>{typed(n, t, b(30.75) + i * 0.13, 48)}</text>
          ))}
          <text x={490} y={990} fontFamily={FONTE.ui} fontWeight={700} fontSize={28} fill={COR.terracota}>{typed('← POETA (1941–2009)', t, b(33.5), 30)}</text>
          <text x={160} y={1222} fontFamily={FONTE.ui} fontWeight={400} fontSize={20} fill={TINTA} opacity={0.65}>{typed('FONTES: AGÊNCIA SENADO (2021) · AGÊNCIA BRASIL (2025) · UFRGS', t, b(31), 60)}</text>
        </g>
      )}
    </svg>
  );
};
