// CENA 06 — Internet ou não? (40,25–48,5 s). Esquerda: o código de abertura é lido no aparelho, sem rede.
// Direita: um celular com um QR real de link (https://example.com, domínio reservado para exemplos) que só abre o site com conexão.
import React from 'react';
import TL from './timeline.json';
import { COR, FONTE_UI, lin, passos } from './lib';
import { COD, Codigo, IconeRede, Modulos, Rotulo, Titulo, degraus } from './ui';
import { Circuitos } from './Circuitos';

const E = TL.episodio;
const FIM = E.c7Ini - 0.1;

// QR pequeno em espaço de tela (cartão com 4 módulos de margem)
const QrMini: React.FC<{ q: Codigo; cx: number; cy: number; lado: number; p: number; scan?: number }> = ({ q, cx, cy, lado, p, scan = -99 }) => {
  if (p <= 0) return null; const n = q.size, L = n + 8;
  return (
    <svg width={lado} height={lado} viewBox={`-4 -4 ${L} ${L}`} style={{ position: 'absolute', left: cx - lado / 2, top: cy - lado / 2, transform: `scale(${p})` }}>
      <rect x={-4} y={-4} width={L} height={L} rx={0.6} fill={COR.branco} />
      <Modulos q={q} estilo={(_i, r, _c, dark) => (dark ? { fill: scan - (r + 0.5) > 0 && scan - (r + 0.5) < 1.6 ? COR.ciano : COR.fundo } : null)} />
      {scan > -4 && scan < n + 4 && <rect x={-4.5} y={scan - 0.12} width={L + 1} height={0.24} fill={COR.ciano} />}
    </svg>
  );
};

export const Cena6: React.FC<{ t: number; fps: number }> = ({ t }) => {
  const pEsq = degraus(t, E.c6Ini + 0.2, FIM, 6, 0.3);
  const pCel = degraus(t, E.c6Ini + 0.45, FIM, 8, 0.35);
  const scanEsq = t >= E.c6Ler && t < E.c6Ler + 0.6 ? lin(t, E.c6Ler, E.c6Ler + 0.6, -4, COD.abertura.size + 4) : -99;
  const pLink = degraus(t, E.c6Link, E.c6Site - 0.05, 6, 0.3);
  const pBotao = degraus(t, E.c6Botao, E.c6Site - 0.05, 8, 0.25);
  const carga = t < E.c6Conexao ? 0 : passos(lin(t, E.c6Conexao + 0.2, E.c6Site - 0.15, 0, 1), 16);
  const pSite = degraus(t, E.c6Site, FIM, 10, 0.4);
  const rede = t >= E.c6Conexao;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Circuitos t={t} camX={16.5} camW={60} />
      <Titulo t={t} ini={E.c6Titulo} fim={E.c6Site - 0.6} linhas={[{ txt: 'LER O CÓDIGO', tam: 76 }, { txt: '≠ ACESSAR A INTERNET', cor: COR.ciano, tam: 76 }]} />

      {/* esquerda: leitura local */}
      <QrMini q={COD.abertura} cx={282} cy={860} lado={470} p={pEsq} scan={scanEsq} />
      {degraus(t, E.c6SemNet, FIM) > 0 && <div style={{ clipPath: `inset(0 ${(1 - degraus(t, E.c6SemNet, FIM)) * 100}% 0 0)` }}><IconeRede x={56} y={1128} on={false} /></div>}
      <Rotulo t={t} ini={E.c6SemNet} fim={FIM} x={136} y={1128} tam={34} cor={COR.amarelo}>SEM INTERNET</Rotulo>
      <Rotulo t={t} ini={E.c6Ler + 0.5} fim={FIM} x={44} y={1214} tam={34} cor={COR.ciano}>TEXTO LIDO ✓</Rotulo>

      {/* direita: celular com link */}
      {pCel > 0 && (
        <div style={{ position: 'absolute', left: 560, top: 500, width: 390, height: 780, borderRadius: 52, border: `5px solid ${COR.branco}88`, background: COR.painel,
          boxSizing: 'border-box', clipPath: `inset(0 0 ${(1 - pCel) * 100}% 0 round 48px)`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 155, top: 14, width: 70, height: 12, borderRadius: 6, background: `${COR.branco}33` }} />
          <div style={{ position: 'absolute', right: 20, top: 34, transform: 'scale(0.42)', transformOrigin: 'right top' }}><IconeRede x={-80} y={0} on={rede} /></div>
          {/* página do site (só com conexão) */}
          {pSite > 0 && (
            <div style={{ position: 'absolute', left: 20, top: 84, width: 340, height: 650, clipPath: `inset(0 0 ${(1 - pSite) * 100}% 0)` }}>
              <div style={{ height: 70, background: COR.ciano, borderRadius: 10 }} />
              <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 30, color: COR.branco, margin: '18px 4px 14px' }}>example.com</div>
              {[1, 0.85, 0.95, 0.7, 0.9, 0.6].map((w, k) => <div key={k} style={{ height: 18, width: `${w * 100}%`, background: `${COR.branco}30`, borderRadius: 6, marginBottom: 14 }} />)}
              <div style={{ height: 150, background: `${COR.ciano}30`, borderRadius: 10, marginTop: 10 }} />
            </div>
          )}
        </div>
      )}
      {pCel > 0 && t < E.c6Site + 0.05 && <QrMini q={COD.link} cx={755} cy={740} lado={290} p={pLink} />}
      {pBotao > 0 && t < E.c6Site + 0.05 && (
        <div style={{ position: 'absolute', left: 590, top: 905, width: 330, clipPath: `inset(0 ${(1 - pBotao) * 100}% 0 0)` }}>
          <div style={{ fontFamily: FONTE_UI, fontSize: 26, color: '#C9D1E0', textAlign: 'center', marginBottom: 12 }}>example.com</div>
          <div style={{ background: COR.ciano, borderRadius: 12, padding: '14px 0', textAlign: 'center', fontFamily: FONTE_UI, fontWeight: 700, fontSize: 34, color: COR.fundo }}>ABRIR SITE?</div>
          <div style={{ height: 14, background: '#1A2338', borderRadius: 7, marginTop: 26 }}>
            <div style={{ height: 14, width: `${carga * 100}%`, background: COR.ciano, borderRadius: 5 }} />
          </div>
        </div>
      )}
      <Rotulo t={t} ini={E.c6Conexao} fim={FIM} x={755} y={1300} tam={32} cor={COR.ciano} centro>PRECISA DE CONEXÃO</Rotulo>
    </div>
  );
};
