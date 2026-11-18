// CENA 07 — O desafio final (48,5–62 s). O QR da mensagem secreta (versão 5-M, gerado pela node-qrcode)
// se monta entre 50,25 e 50,85 s e depois fica ESTÁTICO e inteiro até o fim (> 11 s): escuro sobre claro,
// 4 módulos de zona de silêncio, sem nada sobreposto. A assinatura fica abaixo, fora do código.
import React from 'react';
import TL from './timeline.json';
import { COR, FONTE_TITULO, FONTE_UI, lin, passos, out } from './lib';
import { COD, Modulos, Rotulo, Titulo, W, H, camVB, degraus, enquadra } from './ui';
import { Circuitos } from './Circuitos';

const E = TL.episodio;
const Q = COD.mensagem; const N = Q.size;
export const C7_CAM = enquadra(N / 2, N + 8, 810, 950);   // 45 módulos × 18 px exatos: bordas nítidas, alinhadas à grade de pixels
export const QR_ESTATICO_DESDE = E.c7Qr + 0.5;   // 50,75 s, na grade

export const Cena7: React.FC<{ t: number; fps: number }> = ({ t }) => {
  const pCartao = passos(lin(t, E.c7Qr, E.c7Qr + 0.2, 0, 1, out), 6);
  const linhas = t < E.c7Qr + 0.25 ? 0 : Math.floor(lin(t, E.c7Qr + 0.25, QR_ESTATICO_DESDE, 0, N + 0.99));
  const estatico = t >= QR_ESTATICO_DESDE;
  const L = (N + 8) * pCartao;
  const pulso = t >= E.c7Icone && t < E.c7Icone + 0.5 ? (Math.floor((t - E.c7Icone) / 0.125) % 2 ? 1.25 : 1) : 1;
  const sub = passos(lin(t, E.c7Sublinha, E.c7Sublinha + 0.4, 0, 1, out), 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Circuitos t={t} camX={16.5} camW={60} />
      <Titulo t={t} ini={E.c7Titulo} top={196} linhas={[{ txt: 'CONSEGUE DESCOBRIR', tam: 80 }, { txt: 'A MENSAGEM?', cor: COR.ciano, tam: 80 }]} />
      {sub > 0 && <div style={{ position: 'absolute', left: 80, top: 398, width: 470 * sub, height: 8, background: COR.amarelo }} />}
      {degraus(t, E.c7Pause, 99) > 0 && (
        <div style={{ position: 'absolute', left: 64, top: 436, display: 'flex', gap: 8, transform: `scale(${pulso})`, transformOrigin: '20px 24px' }}>
          <div style={{ width: 13, height: 44, background: COR.amarelo }} /><div style={{ width: 13, height: 44, background: COR.amarelo }} />
        </div>
      )}
      <Rotulo t={t} ini={E.c7Pause} x={100} y={426} tam={36} cor={COR.amarelo}>PAUSE E ESCANEIE COM OUTRO CELULAR</Rotulo>

      {pCartao > 0 && (
        <svg width={W} height={H} viewBox={camVB(C7_CAM)} style={{ position: 'absolute' }}>
          <rect x={N / 2 - L / 2} y={N / 2 - L / 2} width={L} height={L} rx={estatico ? 0.4 : 0.4} fill={COR.branco} />
          {/* depois de montado, o código é desenhado sem nenhum efeito: só módulos escuros sobre o cartão claro */}
          <Modulos q={Q} estilo={(_i, r, _c, dark, tipo) => {
            if (!dark) return null;
            if (estatico) return { fill: COR.fundo };
            if (tipo === 'localizador' || tipo === 'separador') return t >= E.c7Qr + 0.2 ? { fill: COR.fundo } : null;
            return r < linhas ? { fill: r === linhas - 1 ? COR.ciano : COR.fundo } : null;
          }} />
        </svg>
      )}

      {/* assinatura, abaixo do código */}
      {degraus(t, E.c7Assinatura, 99, 12, 0.4) > 0 && (
        <div style={{ position: 'absolute', left: 0, width: W, top: 1430, textAlign: 'center', clipPath: `inset(0 ${(1 - degraus(t, E.c7Assinatura, 99, 12, 0.4)) * 100}% 0 0)` }}>
          <span style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 64, color: COR.branco, letterSpacing: 1 }}>ALÉM DO VISÍVEL</span>
        </div>
      )}
      {degraus(t, E.c7Frase, 99, 14, 0.45) > 0 && (
        <div style={{ position: 'absolute', left: 0, width: W, top: 1516, textAlign: 'center', clipPath: `inset(0 ${(1 - degraus(t, E.c7Frase, 99, 14, 0.45)) * 100}% 0 0)` }}>
          <span style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 34, color: COR.ciano, letterSpacing: 1 }}>O EXTRAORDINÁRIO ESTÁ NOS DETALHES.</span>
        </div>
      )}
    </div>
  );
};
