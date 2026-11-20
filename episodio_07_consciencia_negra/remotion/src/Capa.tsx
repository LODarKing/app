import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { COR, FONTE } from './tema';
import { Fontes } from './comp/Fontes';
import { Papel } from './comp/Papel';
import { caminho, BR10, CamMapa } from './geo';

/* CAPA 9:16 (1080×1920) — o essencial fica na faixa 4:5 (y 285–1635), que é o recorte do perfil.
 * Mesmos elementos do episódio: o "20" dourado cuja base vira a linha do tempo 1695 · 1971 · 2024,
 * o contorno do Brasil com o fio Serra da Barriga → Porto Alegre, e a marca AV original. */
const CAM: CamMapa = { lon: -50.5, lat: -15.5, K: 27, cx: 640, cy: 900 };
const NOS = [
  { x: 112, ano: '1695', txt: ['ZUMBI DOS', 'PALMARES'], anc: 'start' as const },
  { x: 540, ano: '1971', txt: ['GRUPO', 'PALMARES'], anc: 'middle' as const },
  { x: 968, ano: '2024', txt: ['FERIADO', 'NACIONAL'], anc: 'end' as const },
];
export const Capa: React.FC = () => {
  const LY = 1392;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <AbsoluteFill style={{ backgroundColor: '#17120C', opacity: 0.22 }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* fundo: contorno do Brasil, discreto (textura) */}
        <path d={caminho(CAM, BR10)} fill="none" stroke={COR.bege} strokeOpacity={0.2} strokeWidth={3} />
        {/* cabeçalho da marca */}
        <text x={238} y={372} fontFamily={FONTE.titulo} fontWeight={900} fontSize={54} fill={COR.branco}>ALÉM DO VISÍVEL</text>
        <text x={240} y={418} fontFamily={FONTE.ui} fontWeight={600} fontSize={28} letterSpacing={3} fill={COR.ciano}>EPISÓDIO 07 · 20 DE NOVEMBRO</text>
        {/* título */}
        <text x={70} y={612} fontFamily={FONTE.titulo} fontWeight={900} fontSize={150} letterSpacing={-2} fill={COR.branco} stroke={COR.fundo} strokeWidth={14} paintOrder="stroke">POR QUE</text>
        <text x={40} y={1130} fontFamily={FONTE.titulo} fontWeight={900} fontSize={640} letterSpacing={-10} fill={COR.dourado} stroke={COR.fundo} strokeWidth={18} paintOrder="stroke">20</text>
        <text x={72} y={1262} fontFamily={FONTE.titulo} fontWeight={900} fontSize={112} letterSpacing={-1} fill={COR.branco} stroke={COR.fundo} strokeWidth={12} paintOrder="stroke">DE NOVEMBRO?</text>
        {/* linha do tempo: 1695 // 1971 — 2024 */}
        <line x1={112} x2={968} y1={LY} y2={LY} stroke={COR.dourado} strokeWidth={7} />
        {[318, 340].map((x) => <line key={x} x1={x - 11} x2={x + 11} y1={LY + 16} y2={LY - 16} stroke={COR.fundo} strokeWidth={12} />)}
        {[318, 340].map((x) => <line key={'b' + x} x1={x - 10} x2={x + 10} y1={LY + 14} y2={LY - 14} stroke={COR.bege} strokeWidth={3} />)}
        {NOS.map((n) => (
          <g key={n.ano}>
            <circle cx={n.x} cy={LY} r={19} fill={COR.dourado} stroke={COR.fundo} strokeWidth={5} />
            <text x={n.x} y={LY - 38} textAnchor={n.anc} fontFamily={FONTE.titulo} fontWeight={900} fontSize={62} fill={COR.dourado}>{n.ano}</text>
            {n.txt.map((l, i) => <text key={i} x={n.x} y={LY + 56 + i * 34} textAnchor={n.anc} fontFamily={FONTE.ui} fontWeight={600} fontSize={29} fill={COR.branco}>{l}</text>)}
          </g>
        ))}
        {/* frase-conceito do episódio */}
        <rect x={72} y={1524} width={936} height={86} fill={COR.dourado} />
        <text x={540} y={1582} textAnchor="middle" fontFamily={FONTE.ui} fontWeight={700} fontSize={36} letterSpacing={1} fill={COR.fundo}>A DATA QUE NASCEU DA RESISTÊNCIA</text>
      </svg>
      <Img src={staticFile('logo_av.png')} style={{ position: 'absolute', left: 64, top: 282, width: 170, height: 170 }} />
      <Papel forca={0.07} quente={0.4} />
    </AbsoluteFill>
  );
};
