// CENA 02 — Os dados escondidos (10,3–19,75 s): TEXTO → DADOS CODIFICADOS → QR CODE, com os bits REAIS do código.
// Os 44 primeiros bits mostrados (modo byte, comprimento 51, "O", "l", "á") vêm de qr_dados.json (fluxoInicio), conferidos
// contra a matriz (gerar_qr.mjs desfaz máscara e intercalação). Os 8 primeiros formam a palavra de código 0, que fica no
// canto inferior direito: é para lá que eles voam.
import React from 'react';
import TL from './timeline.json';
import { COR, FONTE_TITULO, FONTE_UI, clamp, inOut, lin, mola } from './lib';
import { COD, Cam, Cartao, Ficha, Modulos, Rotulo, W, H, camLerp, camVB, degraus, enquadra, naTela, posOrdem } from './ui';
import { Circuitos } from './Circuitos';

const E = TL.episodio; const P = TL.piloto;
const Q = COD.abertura; const N = Q.size; const POS = posOrdem(Q);
export const C1_FIM: Cam = { cx: 28.5, cy: 24, w: 14.8 };          // onde a cena 1 termina
export const C2_CAM: Cam = enquadra(N / 2, N + 8, 638, 600);       // código inteiro no alto

const BITS = Q.fluxoInicio.slice(0, 44).split('').map(Number);
const GRUPOS = [{ n: 4, leg: 'modo' }, { n: 8, leg: '51 bytes' }, { n: 8, leg: '"O"' }, { n: 8, leg: '"l"' }, { n: 16, leg: '"á"' }];
const CEL = 17, VAO = 2, GVAO = 14, X0 = 94, Y_BITS = 1272;
const CELULAS = (() => {
  const out: { x: number; g: number }[] = []; let x = X0, g = 0, k = 0;
  for (const gr of GRUPOS) { for (let i = 0; i < gr.n; i++) { out.push({ x, g }); x += CEL + VAO; k++; } x += GVAO - VAO; g++; }
  return out;
})();
const TEXTO = Q.texto;

export function camCena2(t: number): Cam {
  return camLerp(C1_FIM, C2_CAM, lin(t, E.c2Recua, E.c2Recua + 1.0, 0, 1, inOut));
}

export const Cena2: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const cam = camCena2(t);
  // destaque herdado da cena 1 (zigue-zague): continua até 10,5 s e recua em degraus até a palavra 0
  const nzCena1 = (Math.floor((t - P.zigzag) / 0.125) + 1) * 8;
  const nz = t < E.c2Recua ? nzCena1 : Math.round(lin(t, E.c2Recua, E.c2Recua + 0.4, 80, 8));
  const onda = t >= E.c2Onda ? Math.floor(lin(t, E.c2Onda, E.c2Onda + 0.75, 0, Q.ordemDados.length)) : 0;
  const ondaFora = t >= 19.25;
  const voo = lin(t, E.c2Voo, E.c2Voo + 0.5, 0, 1, inOut);
  const pousou = t >= E.c2Voo + 0.5;

  const estilo = (i: number, _r: number, _c: number, dark: boolean) => {
    const k = POS.get(i);
    let fill: string | null = dark ? COR.fundo : null;
    if (k !== undefined) {
      if (k < 8) {
        if (t >= E.c2Voo && !pousou) return null;                               // a palavra 0 está "no ar"
        if (pousou && t < E.c2Voo + 0.85) fill = dark ? COR.ciano : COR.cianoClaro; // pouso
        else if (t < E.c2Voo && t >= E.c2Recua + 0.4) fill = dark ? COR.amarelo : '#FBE9BD';
      }
      if (k < nz && t < E.c2Recua + 0.4) { const cw = Math.floor(k / 8); fill = dark ? (cw % 2 ? COR.cianoEsc : COR.ciano) : (cw % 2 ? '#D6F8FC' : COR.cianoClaro); }
      if (k < onda && !ondaFora) fill = dark ? COR.ciano : COR.cianoClaro;
    }
    return fill ? { fill } : null;
  };

  // linha A: texto digitado
  const nChars = t < E.c2Texto ? 0 : Math.floor(lin(t, E.c2Texto, E.c2Texto + 0.7, 0, TEXTO.length));
  const fitaFim = E.c2Onda - 0.3;
  const pA = degraus(t, E.c2Texto, fitaFim), pB = degraus(t, E.c2Bits, fitaFim);
  const nBits = t < E.c2Bits ? 0 : Math.floor(lin(t, E.c2Bits, E.c2Bits + 1.25, 0, BITS.length + 0.99));

  // pontos de destino da palavra 0 (centros dos módulos, na tela)
  const destinos = Q.ordemDados.slice(0, 8).map((i) => naTela(C2_CAM, (i % N) + 0.5, Math.floor(i / N) + 0.5));
  const modPx = W / C2_CAM.w;
  const cardBaixo = naTela(cam, N / 2, N + 4).y;
  const chip = (t0: number) => clamp(mola(t, t0, fps, { damping: 15, stiffness: 170 }) - (t >= 19.4 ? mola(t, 19.4, fps, { damping: 18, stiffness: 220 }) : 0));

  return (
    <div style={{ position: 'absolute', inset: 0, background: COR.fundo }}>
      <Circuitos t={t} camX={cam.cx} camW={cam.w} />
      <svg width={W} height={H} viewBox={camVB(cam)} style={{ position: 'absolute' }}>
        <Cartao n={N} />
        <Modulos q={Q} estilo={estilo} />
      </svg>

      {/* TEXTO */}
      {pA > 0 && (
        <div style={{ position: 'absolute', left: 60, top: 980, width: 960, clipPath: `inset(0 ${(1 - pA) * 100}% 0 0)` }}>
          <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 30, color: COR.ciano, letterSpacing: 4, marginBottom: 6 }}>TEXTO</div>
          <div style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 42, color: COR.branco, lineHeight: 1.15, minHeight: 96 }}>
            {TEXTO.slice(0, nChars)}<span style={{ color: COR.ciano }}>{nChars < TEXTO.length && t >= E.c2Texto ? '▌' : ''}</span>
          </div>
        </div>
      )}
      <Rotulo t={t} ini={E.c2Cripto} fim={fitaFim} x={44} y={1142} tam={29} cor={COR.amarelo}>não é criptografia: qualquer leitor lê</Rotulo>

      {/* DADOS CODIFICADOS */}
      {pB > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, clipPath: `inset(0 ${(1 - pB) * 100}% 0 0)` }}>
          <div style={{ position: 'absolute', left: 60, top: Y_BITS - 54, fontFamily: FONTE_UI, fontWeight: 700, fontSize: 30, color: COR.ciano, letterSpacing: 4 }}>DADOS CODIFICADOS</div>
          {CELULAS.map((c, k) => k < nBits && !(k < 8 && t >= E.c2Voo) && (
            <div key={k} style={{ position: 'absolute', left: c.x, top: Y_BITS, width: CEL, height: CEL, boxSizing: 'border-box',
              background: BITS[k] ? COR.ciano : 'transparent', border: `2px solid ${COR.ciano}` }} />
          ))}
          {GRUPOS.map((g, k) => {
            const ini = CELULAS.findIndex((c) => c.g === k); const x0 = CELULAS[ini].x, x1 = CELULAS[ini + g.n - 1].x + CEL;
            return nBits > ini && (
              <div key={k} style={{ position: 'absolute', left: x0, top: Y_BITS + 26, width: x1 - x0, borderTop: `2px solid ${COR.branco}55`,
                fontFamily: FONTE_UI, fontSize: 25, color: '#C9D1E0', textAlign: 'center', paddingTop: 4, whiteSpace: 'nowrap' }}>{g.leg}</div>
            );
          })}
        </div>
      )}
      <Rotulo t={t} ini={E.c2Nota} fim={fitaFim} x={44} y={Y_BITS + 70} tam={28} cor="#C9D1E0">ilustração: no código os bits são intercalados</Rotulo>

      {/* voo da palavra 0 até o canto inferior direito */}
      {t >= E.c2Voo && !pousou && CELULAS.slice(0, 8).map((c, k) => {
        const p = clamp(voo * 1.15 - k * 0.02);
        const x = c.x + CEL / 2 + (destinos[k].x - c.x - CEL / 2) * p, y = Y_BITS + CEL / 2 + (destinos[k].y - Y_BITS - CEL / 2) * p - Math.sin(Math.PI * p) * 120;
        const s = CEL + (modPx - CEL) * p;
        return <div key={k} style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, boxSizing: 'border-box',
          background: BITS[k] ? COR.ciano : 'transparent', border: `2px solid ${COR.ciano}` }} />;
      })}
      <Rotulo t={t} ini={E.c2Voo + 0.5} fim={E.c2Onda - 0.1} x={500} y={940} tam={32} cor={COR.amarelo}>+ MÁSCARA → MÓDULOS</Rotulo>

      {/* depois: o que é dado e o que é estrutura; exemplos de conteúdo */}
      <Rotulo t={t} ini={E.c2Onda} fim={19.35} x={W / 2} y={cardBaixo + 22} tam={31} centro>
        <span style={{ color: COR.ciano, fontWeight: 700 }}>64</span> PALAVRAS DE DADOS + <span style={{ color: COR.ciano, fontWeight: 700 }}>36</span> DE CORREÇÃO
      </Rotulo>
      <Ficha p={chip(E.c2ChipTexto)} x={80} y={cardBaixo + 130} icone="Aa" rotulo="TEXTO" />
      <Ficha p={chip(E.c2ChipSite)} x={560} y={cardBaixo + 130} icone="www" rotulo="SITE" />
    </div>
  );
};
