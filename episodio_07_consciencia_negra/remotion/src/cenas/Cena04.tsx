import React from 'react';
import { COR, FONTE, b, clamp, lerp, prog, easeInOut, easeOut, easeIn } from '../tema';
import { typed, typedIO } from '../comp/util';
import { CamMapa, camLerp, caminho, xy, SERRA_LL, POA_LL } from '../geo';
import { MapaBR } from './Cena02';
import { ANEIS, CAM_SERRA, contadorHist } from './Cena03';

/* CENA 04 — PALMARES, 1695 (30,8 → 39,6 s)
 *  30,8 → 33,6        → a câmera se afasta do relevo: Alagoas e a Serra da Barriga no mapa
 *  b48 / b49.75       → "20 DE NOVEMBRO DE" + o contador pousa em 1695 (dourado)
 *  b54 "Zumbi"        → ZUMBI DOS PALMARES (sem retrato, sem cena de morte)
 *  36,0 → 38,6        → mapa inteiro; um fio dourado liga 1695 (Serra da Barriga) a 1971 (Porto Alegre): 276 ANOS
 */
export const CAM_NE: CamMapa = { lon: -36.45, lat: -9.6, K: 170, cx: 540, cy: 760 };
export const CAM_BR2: CamMapa = { lon: -54.4, lat: -14.25, K: 19.6, cx: 540, cy: 820 };
export function camCena04(t: number): CamMapa {
  if (t < 36.0) return camLerp(CAM_SERRA, CAM_NE, easeInOut(prog(t, 30.8, 33.6)));
  return camLerp(CAM_NE, CAM_BR2, easeInOut(prog(t, 36.0, 38.6)));
}
/** fio 1695 → 1971 (curva para o interior) */
export function fio(c: CamMapa, u: number, n = 60) {
  const [ax, ay] = xy(c, ...SERRA_LL), [bx, by] = xy(c, ...POA_LL);
  const qx = (ax + bx) / 2 - (by - ay) * 0.32, qy = (ay + by) / 2 + (bx - ax) * 0.1;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n * u; i++) { const s = i / n; pts.push([(1 - s) * (1 - s) * ax + 2 * (1 - s) * s * qx + s * s * bx, (1 - s) * (1 - s) * ay + 2 * (1 - s) * s * qy + s * s * by]); }
  return { pts, meio: [0.25 * ax + 0.5 * qx + 0.25 * bx, 0.25 * ay + 0.5 * qy + 0.25 * by] };
}

export const Cena04: React.FC<{ t: number }> = ({ t }) => {
  if (t < 30.8 || t > 39.6) return null;
  const c = camCena04(t);
  const [sx, sy] = xy(c, ...SERRA_LL), [px, py] = xy(c, ...POA_LL);
  const k = contadorHist(t);
  const opMapa = easeOut(prog(t, 31.5, 32.3)) * (t < 36 ? lerp(1, 0.55, prog(t, b(54) - 0.2, b(54) + 0.3)) : lerp(0.55, 1, prog(t, 36, 36.8)));
  const opAneis = lerp(1, 0.45, prog(c.K, 1400, 100)) * (1 - prog(t, 37.5, 38.5));
  const sobeZ = (i: number) => 330 * easeIn(prog(t, 36.0 + i * 0.05, 36.4 + i * 0.05));
  const entraZ = (i: number) => 130 * (1 - easeOut(prog(t, b(54) + i * 0.12, b(54) + 0.35 + i * 0.12)));
  const uFio = easeInOut(prog(t, 36.9, 38.4)) * (1 - easeIn(prog(t, 39.1, 39.5)));
  const f = fio(c, uFio);
  const sai = b(60.5);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs><clipPath id="zclip"><rect x={0} y={930} width={1080} height={290} /></clipPath></defs>
      <MapaBR c={c} t={t} destaque="AL" tDestaque={31.6} corDestaque={COR.terracota} op={opMapa} estadosOp={0.2} />
      {ANEIS.map((r, i) => <path key={i} d={caminho(c, r)} fill="none" stroke={COR.bege} strokeOpacity={(0.35 + 0.08 * (8 - i)) * opAneis} strokeWidth={2.4} />)}
      <circle cx={sx} cy={sy} r={9} fill={COR.terracota} />
      <text x={sx - 26} y={sy - 8} textAnchor="end" fontFamily={FONTE.ui} fontWeight={600} fontSize={30} fill={COR.branco} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typedIO('SERRA DA BARRIGA', t, 32.4, 35.9, 34)}</text>
      <text x={sx - 26} y={sy + 32} textAnchor="end" fontFamily={FONTE.ui} fontWeight={500} fontSize={26} fill={COR.bege} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typedIO('UNIÃO DOS PALMARES · AL', t, 32.8, 35.9, 34)}</text>
      {/* data em destaque, presa ao contador (o contador é desenhado pela cena 03) */}
      <text x={540} y={k.base - 200 * k.s} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={44 * (k.s / 0.85)} letterSpacing={3} fill={COR.dourado}>{typedIO('20 DE NOVEMBRO DE', t, b(48), sai, 30)}</text>
      {/* Zumbi dos Palmares */}
      {t >= b(54) && t < 36.6 && <g clipPath="url(#zclip)">
        <text x={80} y={1040 - sobeZ(0) + entraZ(0)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={104} fill={COR.branco}>ZUMBI DOS</text>
        <text x={80} y={1142 - sobeZ(1) + entraZ(1)} fontFamily={FONTE.titulo} fontWeight={900} fontSize={104} fill={COR.dourado}>PALMARES</text>
        <text x={84} y={1198 - sobeZ(2) + entraZ(2)} fontFamily={FONTE.ui} fontWeight={600} fontSize={30} letterSpacing={1} fill={COR.bege}>LÍDER DO QUILOMBO DOS PALMARES</text>
      </g>}
      {/* 1695 → 1971 */}
      {uFio > 0 && (
        <g>
          <polyline points={f.pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={COR.dourado} strokeWidth={4} strokeLinecap="round" />
          <circle cx={px} cy={py} r={11 * easeOut(prog(t, 36.9, 37.2))} fill={COR.ciano} />
          <text x={sx + 22} y={sy + 10} fontFamily={FONTE.ui} fontWeight={700} fontSize={34} fill={COR.dourado} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typedIO('1695', t, 37.0, 39.1, 20)}</text>
          <text x={px + 22} y={py + 12} fontFamily={FONTE.ui} fontWeight={700} fontSize={34} fill={COR.ciano} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typedIO('1971', t, 38.3, 39.1, 20)}</text>
          <text x={f.meio[0] - 40} y={f.meio[1] - 6} textAnchor="end" fontFamily={FONTE.titulo} fontWeight={900} fontSize={84} fill={COR.dourado} stroke={COR.fundo} strokeWidth={10} paintOrder="stroke">{typedIO('276 ANOS', t, b(58.5), 39.1, 24)}</text>
          <text x={f.meio[0] - 44} y={f.meio[1] + 40} textAnchor="end" fontFamily={FONTE.ui} fontWeight={600} fontSize={28} fill={COR.bege} stroke={COR.fundo} strokeWidth={8} paintOrder="stroke">{typedIO('ENTRE 1695 E 1971', t, b(59), 39.1, 30)}</text>
        </g>
      )}
    </svg>
  );
};
