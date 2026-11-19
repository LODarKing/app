// CAPA do EP. 05 (1080×1920), gerada pelo motor do episódio. O essencial fica na faixa 4:5 do meio (y 285–1635).
// Conceito: "além do visível". Uma lupa sobre o QR real (código de abertura, versão 4-M) revela a estrutura:
// localizadores em ciano, a ordem real dos bits (zigue-zague) e os bits reais da 1ª palavra de código (0100 0011).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COR, FONTE_TITULO, FONTE_UI } from './lib';
import { Fontes } from './Fontes';
import { Circuitos } from './Circuitos';
import { COD, Cartao, Modulos, posOrdem } from './ui';

const Q = COD.abertura; const N = Q.size; const POS = posOrdem(Q);
const NZ = 12 * 8;                                       // 12 palavras de código acesas na lupa
const PRIMEIRA = Q.fluxoInicio.slice(0, 8);             // bits reais da palavra 0 (modo byte + início do comprimento)

const estilo = (destacarBits: boolean) => (i: number, _r: number, _c: number, dark: boolean, tipo: string) => {
  const k = POS.get(i);
  if (destacarBits && k !== undefined && k < NZ) {
    const cw = Math.floor(k / 8);
    return { fill: dark ? (cw % 2 ? COR.cianoEsc : COR.ciano) : (cw % 2 ? '#D6F8FC' : COR.cianoClaro) };
  }
  if (tipo === 'localizador' && dark) return { fill: COR.ciano };
  return dark ? { fill: COR.fundo } : null;
};

// cartão: 41 unidades em 620 px, centro em (455, 1045)
const CARD = { cx: 455, cy: 1045, px: 620 };
const U = CARD.px / (N + 8);
// lupa: mostra a região do canto inferior direito (centro no módulo 28,27) ampliada 3,4×
const LUPA = { cx: 800, cy: 1245, r: 215, foco: { x: 29.6, y: 26.0 }, zoom: 3.4 };

export const Capa: React.FC = () => {
  const ladoFoco = (2 * LUPA.r) / (U * LUPA.zoom);       // módulos visíveis na lupa
  let zig = '';
  for (let k = 0; k < NZ; k++) { const m = Q.ordemDados[k]; zig += `${k ? 'L' : 'M'}${(m % N) + 0.5} ${Math.floor(m / N) + 0.5}`; }
  const cab = Q.ordemDados[NZ - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <Circuitos t={10} camX={16.5} camW={60} />

      {/* título */}
      <div style={{ position: 'absolute', left: 64, top: 300 }}>
        <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 38, letterSpacing: 5, color: COR.amarelo, marginBottom: 16 }}>ALÉM DO VISÍVEL · EP. 05</div>
        {[['COMO UM QR CODE', COR.branco], ['GUARDA', COR.branco], ['INFORMAÇÕES?', COR.ciano]].map(([txt, cor], k) => (
          <div key={k} style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 104, lineHeight: 1.0, letterSpacing: -2, color: cor, whiteSpace: 'nowrap' }}>{txt}</div>
        ))}
      </div>

      {/* código real, levemente inclinado */}
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <g transform={`rotate(-4 ${CARD.cx} ${CARD.cy})`}>
          <g transform={`translate(${CARD.cx - (N / 2) * U} ${CARD.cy - (N / 2) * U}) scale(${U})`}>
            <Cartao n={N} />
            <Modulos q={Q} estilo={estilo(false)} />
          </g>
        </g>
        {/* lupa */}
        <defs><clipPath id="lupa"><circle cx={LUPA.cx} cy={LUPA.cy} r={LUPA.r} /></clipPath></defs>
        <g clipPath="url(#lupa)">
          <rect x={LUPA.cx - LUPA.r} y={LUPA.cy - LUPA.r} width={2 * LUPA.r} height={2 * LUPA.r} fill={COR.branco} />
          <svg x={LUPA.cx - LUPA.r} y={LUPA.cy - LUPA.r} width={2 * LUPA.r} height={2 * LUPA.r}
            viewBox={`${LUPA.foco.x - ladoFoco / 2} ${LUPA.foco.y - ladoFoco / 2} ${ladoFoco} ${ladoFoco}`}>
            <rect x={-4} y={-4} width={N + 8} height={N + 8} fill={COR.branco} />
            <Modulos q={Q} estilo={estilo(true)} />
            <path d={zig} fill="none" stroke={COR.fundo} strokeWidth={0.06} strokeLinejoin="round" opacity={0.6} />
            <rect x={(cab % N) + 0.28} y={Math.floor(cab / N) + 0.28} width={0.44} height={0.44} fill={COR.amarelo} stroke={COR.fundo} strokeWidth={0.07} />
          </svg>
        </g>
        <circle cx={LUPA.cx} cy={LUPA.cy} r={LUPA.r} fill="none" stroke={COR.ciano} strokeWidth={12} />
        <line x1={LUPA.cx + LUPA.r * 0.7} y1={LUPA.cy + LUPA.r * 0.7} x2={LUPA.cx + LUPA.r * 0.7 + 70} y2={LUPA.cy + LUPA.r * 0.7 + 70} stroke={COR.ciano} strokeWidth={26} strokeLinecap="round" />
      </svg>

      {/* bits reais da primeira palavra de código */}
      <div style={{ position: 'absolute', left: 64, top: 1395, background: COR.fundo, padding: '8px 0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {PRIMEIRA.split('').map((b, k) => (
            <div key={k} style={{ width: 34, height: 34, boxSizing: 'border-box', border: `4px solid ${COR.ciano}`, background: b === '1' ? COR.ciano : 'transparent', marginRight: k === 3 ? 12 : 0 }} />
          ))}
        </div>
        <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 34, color: COR.ciano, letterSpacing: 3, marginTop: 10 }}>{PRIMEIRA.slice(0, 4)} {PRIMEIRA.slice(4)}</div>
      </div>

      {/* chamada */}
      <div style={{ position: 'absolute', left: 64, top: 1530, display: 'flex', alignItems: 'center', gap: 18, border: `4px solid ${COR.amarelo}`, borderRadius: 14, padding: '14px 26px', background: COR.fundo }}>
        <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 13, height: 44, background: COR.amarelo }} /><div style={{ width: 13, height: 44, background: COR.amarelo }} /></div>
        <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 40, color: COR.amarelo, letterSpacing: 2 }}>MENSAGEM SECRETA NO FINAL</div>
      </div>
    </AbsoluteFill>
  );
};
