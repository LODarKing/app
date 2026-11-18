// CENAS 03 e 04 — Os três quadrados + a leitura (19,75–28,5 s), código de abertura (versão 4-M).
// Localizadores (proporção 1:1:3:1:1 numa linha que os cruza), orientação, sincronismo e alinhamento,
// amostragem dos módulos e o CONTEÚDO IDENTIFICADO, que é o texto real do código.
import React from 'react';
import TL from './timeline.json';
import { COR, FONTE_TITULO, FONTE_UI, clamp, inOut, lin } from './lib';
import { COD, Cam, Cartao, Modulos, Rotulo, Titulo, W, H, camLerp, camVB, degraus, enquadra } from './ui';
import { C2_CAM } from './Cena2';
import { Circuitos } from './Circuitos';

const E = TL.episodio;
const Q = COD.abertura; const N = Q.size;
export const C3_CAM: Cam = enquadra(N / 2, N + 8, 738, 930);
const CENTROS = [[3.5, 3.5], [N - 3.5, 3.5], [3.5, N - 3.5]];
const FINDER_T = [E.c3F1, E.c3F2, E.c3F3];
const finderDe = (r: number, c: number) => (r < 7 && c < 7 ? 0 : r < 7 && c >= N - 7 ? 1 : r >= N - 7 && c < 7 ? 2 : -1);
const ANG = -18;

export function anguloCena3(t: number) {
  return lin(t, E.c3Celular, E.c3Celular + 0.75, 0, ANG, inOut) - lin(t, E.c3Orientar, E.c3Orientar + 0.75, 0, ANG, inOut);
}

export const Cena3: React.FC<{ t: number; fps: number }> = ({ t }) => {
  const cam = camLerp(C2_CAM, C3_CAM, lin(t, E.c3Ini, E.c3Ini + 0.75, 0, 1, inOut));
  const ang = anguloCena3(t);
  const esc = 1 - 0.2 * clamp(lin(t, E.c3Celular, E.c3Celular + 0.75, 0, 1, inOut) - lin(t, E.c3Orientar, E.c3Orientar + 0.75, 0, 1, inOut));
  const sinc = t >= E.c3Sinc && t < E.c4Conteudo + 0.25;
  const fimLeitura = E.c5Suspense - 0.25;

  const estilo = (_i: number, r: number, c: number, dark: boolean, tipo: string) => {
    let fill: string | null = dark ? COR.fundo : null;
    const f = finderDe(r, c);
    if (f >= 0 && tipo === 'localizador' && dark && t >= FINDER_T[f] && t < E.c4Conteudo) fill = COR.ciano;
    if (sinc && dark && (tipo === 'sincronismo' || tipo === 'alinhamento')) fill = COR.amarelo;
    return fill ? { fill } : null;
  };
  // amostragem: um ponto no centro de cada módulo, linha a linha
  const linhasAmostra = t < E.c3Amostra ? 0 : Math.floor(lin(t, E.c3Amostra, E.c3Amostra + 0.45, 0, N));
  const amostraVis = linhasAmostra > 0 && t < fimLeitura + 0.1;
  const tri = clamp(lin(t, E.c3Localizar, E.c3Localizar + 0.5, 0, 1, inOut));
  const miras = t >= E.c3Localizar && t < E.c3Sinc + 0.25;
  const pCel = degraus(t, E.c3Celular - 0.1, fimLeitura, 10, 0.35);
  const nChars = t < E.c4Conteudo ? 0 : Math.floor(lin(t, E.c4Conteudo + 0.2, E.c4Conteudo + 0.9, 0, Q.texto.length));
  const angTxt = Math.round(ang);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Circuitos t={t} camX={cam.cx} camW={cam.w} />
      {/* celular estilizado: moldura vetorial em volta do código (é o objeto "câmera", não uma moldura do quadro) */}
      {pCel > 0 && (
        <div style={{ position: 'absolute', left: 150, top: 430, width: 780, height: 1000, borderRadius: 64, border: `5px solid ${COR.branco}66`,
          background: '#0C1322', clipPath: `inset(0 0 ${(1 - pCel) * 100}% 0 round 64px)` }}>
          <div style={{ position: 'absolute', left: 330, top: 18, width: 120, height: 14, borderRadius: 7, background: `${COR.branco}33` }} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(${ang}deg) scale(${esc})`, transformOrigin: '540px 930px' }}>
        <svg width={W} height={H} viewBox={camVB(cam)} style={{ position: 'absolute' }}>
          <Cartao n={N} />
          <Modulos q={Q} estilo={estilo} />
          {/* proporção 1:1:3:1:1 numa linha que cruza o localizador */}
          {t >= E.c3Razao && t < E.c3Localizar && (
            <g>
              <line x1={-1.6} y1={3.5} x2={lin(t, E.c3Razao, E.c3Razao + 0.3, -1.6, 8.6)} y2={3.5} stroke={COR.amarelo} strokeWidth={0.16} />
              {[0, 1, 2, 5, 6, 7].map((x) => <line key={x} x1={x} y1={2.9} x2={x} y2={4.1} stroke={COR.amarelo} strokeWidth={0.12} />)}
              {[[0.5, '1'], [1.5, '1'], [3.5, '3'], [5.5, '1'], [6.5, '1']].map(([x, s], k) => (
                <g key={k}>
                  <rect x={(x as number) - 0.6} y={-3.0} width={1.2} height={2.0} fill={COR.amarelo} />
                  <text x={x as number} y={-1.45} fontSize={1.7} fontFamily={FONTE_UI} fontWeight={700} textAnchor="middle" fill={COR.fundo}>{s}</text>
                </g>
              ))}
            </g>
          )}
          {/* localizar: miras nos três localizadores e o triângulo que dá a orientação */}
          {miras && (
            <g fill="none" stroke={COR.ciano} strokeWidth={0.22}>
              <path d={`M${CENTROS[2][0]} ${CENTROS[2][1]} L${CENTROS[0][0]} ${CENTROS[0][1]} L${CENTROS[1][0]} ${CENTROS[1][1]}`} strokeDasharray={`${tri * 60} 60`} />
              {CENTROS.map(([x, y], k) => (
                <g key={k}>
                  <rect x={x - 4.6} y={y - 4.6} width={9.2} height={9.2} />
                  <line x1={x - 6} y1={y} x2={x - 4.6} y2={y} /><line x1={x + 4.6} y1={y} x2={x + 6} y2={y} />
                  <line x1={x} y1={y - 6} x2={x} y2={y - 4.6} /><line x1={x} y1={y + 4.6} x2={x} y2={y + 6} />
                </g>
              ))}
            </g>
          )}
          {sinc && (
            <g fontFamily={FONTE_UI} fontWeight={700} fontSize={1.45}>
              <rect x={8.2} y={7.2} width={12.2} height={2.0} fill={COR.fundo} /><text x={8.7} y={8.72} fill={COR.amarelo}>SINCRONISMO</text>
              <rect x={13.6} y={29.2} width={12.2} height={2.0} fill={COR.fundo} /><text x={14.1} y={30.72} fill={COR.amarelo}>ALINHAMENTO</text>
            </g>
          )}
          {amostraVis && Array.from({ length: linhasAmostra * N }, (_, i) => (
            <rect key={'a' + i} x={(i % N) + 0.41} y={Math.floor(i / N) + 0.41} width={0.18} height={0.18} fill={COR.ciano} />
          ))}
        </svg>
      </div>

      <Titulo t={t} ini={E.c3Titulo} fim={E.c3Celular - 0.4} linhas={[{ txt: 'COMO A CÂMERA', tam: 84 }, { txt: 'ENCONTRA O CÓDIGO?', cor: COR.ciano, tam: 84 }]} />
      <Rotulo t={t} ini={E.c3Orientar} fim={E.c3Sinc} x={W / 2} y={466} tam={34} centro fundo="#0C1322">
        ORIENTAÇÃO <span style={{ color: COR.ciano, fontWeight: 700 }}>{angTxt === 0 ? '0' : `${angTxt}`}°</span>
      </Rotulo>
      <Rotulo t={t} ini={E.c3Localizar + 0.2} fim={E.c3Orientar - 0.05} x={W / 2} y={466} tam={34} centro fundo="#0C1322">
        LOCALIZADORES: <span style={{ color: COR.ciano, fontWeight: 700 }}>3/3</span>
      </Rotulo>

      {/* CENA 04: conteúdo identificado (texto real decodificado) */}
      {degraus(t, E.c4Conteudo, fimLeitura) > 0 && (
        <div style={{ position: 'absolute', left: 150, top: 1290, width: 780, clipPath: `inset(0 ${(1 - degraus(t, E.c4Conteudo, fimLeitura)) * 100}% 0 0)`,
          background: COR.painel, borderRadius: 12, padding: '12px 20px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 28, color: COR.ciano, letterSpacing: 3 }}>CONTEÚDO IDENTIFICADO</div>
          <div style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 34, color: COR.branco, lineHeight: 1.18, minHeight: 80 }}>{Q.texto.slice(0, nChars)}</div>
        </div>
      )}
    </div>
  );
};
