import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeIn, mulberry32 } from '../tema';
import { typed, typedIO } from '../comp/util';
import { Contador } from '../comp/Contador';
import { CamMapa, xy, SERRA_LL } from '../geo';

/* CENA 03 — O CONTRAPONTO (22,2 → 31,0 s) e o CONTADOR HISTÓRICO (22,2 → 39,3 s)
 *  b34.5 "O grupo"       → divisória: 13 DE MAIO (Lei Áurea, 1888) × 20 DE NOVEMBRO (1971)
 *  b39.5 "Lei Áurea"     → selo carimba a representação gráfica da Lei nº 3.353
 *  b41.5 "protagonismo"  → as linhas do documento viram curvas de nível: Serra da Barriga (AL)
 *  b43   "resistiu"      → LIBERDADE TAMBÉM É RESISTÊNCIA (síntese editorial, sem autoria)
 *  26,9 → b49.75         → o contador recua 1971 → 1695 (pousa em "1695", 32,09 s)
 */
export const T3 = { ini: 22.2, fim: 30.8 };
const TINTA = '#22252D';
export const CAM_SERRA: CamMapa = { lon: SERRA_LL[0], lat: SERRA_LL[1], K: 1400, cx: 540, cy: 700 };

// curvas de nível SIMPLIFICADAS (representação): anéis irregulares com semente, em graus em torno da Serra da Barriga
const NA = 8, NP = 72;
export const ANEIS: number[][][] = Array.from({ length: NA }, (_, i) => {
  const r = mulberry32(300 + i), f = [r() * 6.28, r() * 6.28, r() * 6.28], R = (34 + 26 * i) / 1400;
  return Array.from({ length: NP + 1 }, (_, k) => {
    const a = (k / NP) * Math.PI * 2;
    const rr = R * (1 + 0.16 * Math.sin(2 * a + f[0]) + 0.08 * Math.sin(3 * a + f[1]) + 0.05 * Math.sin(5 * a + f[2]) + 0.04 * i * Math.cos(a - 0.7));
    return [SERRA_LL[0] + (rr * Math.cos(a) * 1.25) / Math.cos((15 * Math.PI) / 180), SERRA_LL[1] + rr * Math.sin(a) * 0.85];
  });
});
// linhas do "documento" (posições na tela) — viram os anéis
const BARRAS = Array.from({ length: NA }, (_, i) => { const r = mulberry32(700 + i); return { y: 650 + i * 38, x0: 140, x1: 140 + 240 + r() * 90 }; });

/** valor do contador (ano) e sua posição/escala/cor para 22,2 → 39,3 s */
export function contadorHist(t: number) {
  const v = 1971 - 276 * (1 - Math.pow(1 - prog(t, 26.9, b(49.75)), 2.4));
  // posições-chave
  const P = [
    { t: 22.5, cx: 790, base: 720, s: 0.5 },   // painel da direita
    { t: 26.9, cx: 790, base: 720, s: 0.5 },
    { t: 27.5, cx: 540, base: 330, s: 0.62 },  // topo, sobre o relevo
    { t: b(48), cx: 540, base: 330, s: 0.62 },
    { t: b(48) + 0.6, cx: 540, base: 500, s: 0.85 }, // a data em destaque (cena 04)
    { t: 36.0, cx: 540, base: 500, s: 0.85 },
    { t: 36.8, cx: 540, base: 360, s: 0.6 },
  ];
  let k = 0; while (k < P.length - 1 && t > P[k + 1].t) k++;
  const A = P[k], B = P[Math.min(k + 1, P.length - 1)], u = easeInOut(prog(t, A.t, B.t));
  const entra = easeOut(prog(t, 22.3, 22.8)), sai = easeIn(prog(t, 39.05, 39.5));
  return { v, cx: lerp(A.cx, B.cx, u), base: lerp(A.base, B.base, u) - 700 * (1 - entra) - 700 * sai, s: lerp(A.s, B.s, u), ouro: prog(t, b(49.75) - 0.05, b(49.75) + 0.25) };
}

export const Cena03: React.FC<{ t: number }> = ({ t }) => {
  if (t < T3.ini || t > 39.6) return null;
  const k = contadorHist(t);
  const cor = k.ouro > 0.5 ? COR.dourado : COR.bege;
  const contador = <Contador v={k.v} cx={k.cx} base={k.base} s={k.s} cor={cor} id="cont3" />;
  if (t > T3.fim) return <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>{contador}</svg>;

  const uDiv = easeOut(prog(t, b(34.5), b(34.5) + 0.45)) * (1 - easeIn(prog(t, b(41.5), b(41.5) + 0.35)));
  const uDoc = easeOut(prog(t, b(35), b(35) + 0.5));
  const uMorf = prog(t, b(41.5), b(41.5) + 1.0);
  const uFolha = easeIn(clamp(uMorf / 0.5));                   // a folha some primeiro; as linhas ficam e se curvam
  const selo = prog(t, b(39.5), b(39.5) + 0.16);
  const fora = b(41.5);                                         // cabeçalhos "desdatilografam" quando o documento vira relevo
  const sobeFrase = (i: number) => 420 * easeIn(prog(t, b(46.5) + i * 0.05, b(46.5) + 0.42 + i * 0.05));
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><clipPath id="fraseclip"><rect x={0} y={900} width={1080} height={350} /></clipPath></defs>
      {/* divisória */}
      <line x1={540} x2={540} y1={300} y2={300 + 900 * uDiv} stroke={COR.ciano} strokeWidth={2} opacity={uDiv > 0 ? 1 : 0} />
      {/* ESQUERDA — 13 de maio de 1888 */}
      <text x={290} y={410} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={70} fill={COR.branco}>{typedIO('13 DE', t, b(34.75), fora, 30)}</text>
      <text x={290} y={482} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={70} fill={COR.branco}>{typedIO('MAIO', t, b(35), fora, 30)}</text>
      <text x={290} y={530} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={32} letterSpacing={2} fill={COR.bege}>{typedIO('DE 1888', t, b(35.25), fora, 30)}</text>
      {uDoc > 0 && (
        <g>
          <g transform={`translate(${-500 * (1 - uDoc)},0) translate(290,800) scale(${1 - uFolha}) translate(-290,-800)`} opacity={1 - uFolha}>
            <rect x={108} y={574} width={380} height={480} rx={4} fill="#000" opacity={0.35} />
            <rect x={100} y={566} width={380} height={480} rx={4} fill={COR.bege} />
            <text x={290} y={620} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={700} fontSize={28} fill={TINTA}>LEI Nº 3.353</text>
            {selo > 0 && (
              <g transform={`translate(400,975) scale(${lerp(1.7, 1, easeOut(selo))})`} opacity={clamp(selo * 3)}>
                <circle r={46} fill="none" stroke={COR.terracota} strokeWidth={5} />
                <circle r={36} fill="none" stroke={COR.terracota} strokeWidth={2} />
                <text y={8} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={700} fontSize={22} fill={COR.terracota}>1888</text>
              </g>
            )}
          </g>
          {/* as linhas do documento (depois, curvas de nível) */}
          {BARRAS.map((ba, i) => {
            const u = easeInOut(clamp(uMorf * 1.6 - (i / NA) * 0.6));
            const anel = ANEIS[i];
            const pts = anel.map((p, j) => {
              const bx = lerp(ba.x0, ba.x1, j / NP) - 500 * (1 - uDoc), by = ba.y;
              const [ax, ay] = xy(CAM_SERRA, p[0], p[1]);
              return `${lerp(bx, ax, u).toFixed(1)},${lerp(by, ay, u).toFixed(1)}`;
            });
            return <polyline key={i} points={pts.join(' ')} fill="none" stroke={u > 0 ? COR.bege : TINTA} strokeOpacity={u > 0 ? lerp(0.9, 0.35 + 0.08 * (NA - i), u) : 0.75} strokeWidth={lerp(5, 2.4, u)} strokeLinecap="round" />;
          })}
          {uMorf > 0.6 && <circle cx={540} cy={700} r={9 * easeOut(prog(uMorf, 0.6, 1))} fill={COR.terracota} />}
        </g>
      )}
      <text x={290} y={1098} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={22} letterSpacing={2} fill={COR.bege} opacity={0.8}>{typedIO('REPRESENTAÇÃO GRÁFICA', t, b(36), fora, 40)}</text>
      <text x={290} y={1146} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={36} fill={COR.branco}>{typedIO('LEI ÁUREA', t, b(39.5), fora, 30)}</text>
      {/* DIREITA — 20 de novembro */}
      <text x={790} y={410} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={70} fill={COR.dourado}>{typedIO('20 DE', t, b(35.25), fora, 30)}</text>
      <text x={790} y={482} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={70} fill={COR.dourado}>{typedIO('NOVEMBRO', t, b(35.5), fora, 30)}</text>
      <text x={790} y={530} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={32} letterSpacing={2} fill={COR.bege}>{typedIO('GRUPO PALMARES', t, b(35.75), fora, 30)}</text>
      {/* régua vertical que recua (anos descem) */}
      {uDiv > 0 && Array.from({ length: 14 }, (_, i) => {
        const y = 800 + ((i * 34 + (t - 22.3) * 60) % (14 * 34));
        return <line key={i} x1={790 - (i % 5 === 0 ? 30 : 16)} x2={790 + (i % 5 === 0 ? 30 : 16)} y1={y} y2={y} stroke={COR.branco} strokeOpacity={0.35 * uDiv * (1 - Math.abs(y - 1040) / 260)} strokeWidth={2} />;
      })}
      <text x={790} y={1146} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={30} fill={COR.dourado}>{typedIO('QUEM RESISTIU', t, b(40.75), b(41.75), 30)}</text>
      {/* rótulos do relevo */}
      <text x={540} y={430} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={30} letterSpacing={2} fill={COR.bege}>{typedIO('SERRA DA BARRIGA · ALAGOAS', t, b(42.25), b(47.5), 40)}</text>
      <text x={540} y={474} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={30} fill={COR.dourado}>{typedIO('QUILOMBO DOS PALMARES · SÉC. XVII', t, b(42.75), b(47.5), 40)}</text>
      <text x={540} y={514} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={20} letterSpacing={2} fill={COR.bege} opacity={0.6}>{typedIO('RELEVO SIMPLIFICADO · REPRESENTAÇÃO', t, b(43.5), b(46.5), 50)}</text>
      {/* LIBERDADE TAMBÉM É RESISTÊNCIA */}
      <g clipPath="url(#fraseclip)">
        {([['LIBERDADE', b(43), 1040, COR.branco], ['TAMBÉM É', b(43.5), 1135, COR.branco], ['RESISTÊNCIA', b(44), 1230, COR.dourado]] as [string, number, number, string][]).map(([s, t0, y, c2], i) => (
          <text key={i} x={80} y={y - sobeFrase(i)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={96} letterSpacing={-1} fill={c2}>{typed(s, t, t0, 40)}</text>
        ))}
      </g>
      {contador}
    </svg>
  );
};
