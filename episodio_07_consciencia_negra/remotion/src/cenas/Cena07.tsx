import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { COR, FONTE, b, lerp, prog, easeInOut, easeOut } from '../tema';
import { typed } from '../comp/util';
import { T_MASCARA } from './Cena06';
import fala from '../data/fala.json';

/* CENA 07 — ENCERRAMENTO (59,3 s → fim)
 *  o número 20 (que guardava as ilustrações) se enche de dourado · "presente" → NOVEMBRO
 *  a câmera se afasta: DIA NACIONAL DE ZUMBI E DA CONSCIÊNCIA NEGRA
 *  "Além do Visível" → marca AV original (arquivo do canal, sem alteração) + ALÉM DO VISÍVEL
 *  "extraordinário"  → O EXTRAORDINÁRIO ESTÁ NOS DETALHES.
 *  Tempos do fim vêm de data/fala.json (estimados enquanto o áudio completo não chega).
 */
export const Cena07: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_MASCARA + 0.6) return null;
  const ouro = easeInOut(prog(t, T_MASCARA + 0.75, T_MASCARA + 1.35));
  const afasta = easeInOut(prog(t, fala.alem - 0.75, fala.alem - 0.05));
  const s = lerp(1, 0.36, afasta), tx = lerp(0, 345.6, afasta), ty = lerp(0, 23.4, afasta);
  const iris = easeOut(prog(t, fala.alem, fala.alem + 0.65));
  const push = 1 + 0.03 * prog(t, fala.alem, fala.alem + 9);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><clipPath id="ouro20"><rect x={0} y={lerp(1060, 480, ouro)} width={1080} height={700} /></clipPath></defs>
        <g transform={`translate(${tx},${ty}) scale(${s})`}>
          <text x={540} y={1060} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={760} fill={COR.dourado} clipPath="url(#ouro20)">20</text>
          <text x={540} y={1200} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={104} letterSpacing={10} fill={COR.branco}>{typed('NOVEMBRO', t, T_MASCARA + 1.4, 22)}</text>
        </g>
        <text x={540} y={538} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={34} letterSpacing={1} fill={COR.branco}>{typed('DIA NACIONAL DE ZUMBI', t, fala.alem - 0.4, 40)}</text>
        <text x={540} y={582} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={34} letterSpacing={1} fill={COR.branco}>{typed('E DA CONSCIÊNCIA NEGRA', t, fala.alem - 0.05, 40)}</text>
        <text x={540} y={1192} textAnchor="middle" fontFamily={FONTE.titulo} fontWeight={900} fontSize={72} fill={COR.branco}>{typed('ALÉM DO VISÍVEL', t, fala.alem + 0.15, 26)}</text>
        <text x={540} y={1256} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={600} fontSize={30} letterSpacing={1} fill={COR.ciano}>{typed('O EXTRAORDINÁRIO ESTÁ NOS DETALHES.', t, fala.extra, 30)}</text>
        {/* créditos de apuração e transparência (fontes e voz sintética) */}
        <text x={540} y={1338} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={22} fill={COR.bege} opacity={0.85}>{typed('FONTES: AGÊNCIA SENADO · AGÊNCIA BRASIL · FUNDAÇÃO', t, fala.fimFala + 0.6, 50)}</text>
        <text x={540} y={1368} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={22} fill={COR.bege} opacity={0.85}>{typed('PALMARES · MDH · LEI Nº 14.759/2023 · UFRGS', t, fala.fimFala + 1.3, 50)}</text>
        <text x={540} y={1414} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={500} fontSize={22} fill={COR.bege} opacity={0.85}>{typed('ANIMAÇÃO ORIGINAL · NARRAÇÃO EM VOZ SINTÉTICA', t, fala.fimFala + 2.4, 50)}</text>
      </svg>
      {iris > 0 && (
        <Img src={staticFile('logo_av.png')} style={{ position: 'absolute', left: 320, top: 655, width: 440, height: 440, clipPath: `circle(${(iris * 72).toFixed(2)}% at 50% 50%)`, transform: `scale(${lerp(0.9, 1, iris)})` }} />
      )}
    </AbsoluteFill>
  );
};
