// CENA 05 — A correção de erros (28,5–40,25 s). Coordenadas do código demoH (versão 6, nível H, 41×41).
// Danos A e B, erros por bloco e resultado da leitura vêm de danos.json, gerado por ferramentas/testar_correcao.py,
// que desenha cada dano como aparece aqui e o testa com ZXing-C++ e OpenCV:
//   A -> lido pelos dois (texto idêntico).  B -> nenhum dos dois consegue ler.
import React from 'react';
import TL from './timeline.json';
import DANOS from './danos.json';
import { COR, FONTE_TITULO, FONTE_UI, clamp, inOut, lin, mulberry32 } from './lib';
import { COD, Cam, Modulos, Rotulo, Titulo, W, H, camLerp, camVB, degraus, enquadra } from './ui';
import { C3_CAM } from './Cena3';
import { Circuitos } from './Circuitos';

const E = TL.episodio;
const QA = COD.abertura, QH = COD.demoH; const NA = QA.size, NH = QH.size; // 33 e 41
const DESL = (NH - NA) / 2;                                                  // 4: centra o código antigo no novo
const CAM0: Cam = { cx: C3_CAM.cx + DESL, cy: C3_CAM.cy + DESL, w: C3_CAM.w };
export const C5_CAM: Cam = enquadra(NH / 2, NH + 8, 853, 860);
type Dano = { celulas: number[][]; erros_por_bloco: number[]; limite_por_bloco: number; lido: boolean };
const DA = (DANOS as unknown as { A: Dano; B: Dano }).A, DB = (DANOS as unknown as { A: Dano; B: Dano }).B;
const chave = (r: number, c: number) => `${r},${c}`;
const r1 = mulberry32(55); const ATRASO = new Map<string, number>(); for (const [r, c] of DB.celulas) ATRASO.set(chave(r, c), r1());
const SET_A = new Set(DA.celulas.map(([r, c]) => chave(r, c))), SET_B = new Set(DB.celulas.map(([r, c]) => chave(r, c)));
const rA = mulberry32(8); const SAI = Array.from({ length: NA * NA }, () => rA()); const ENTRA = Array.from({ length: NH * NH }, () => rA());

// estado do buraco em t: quais células estão abertas
function aberto(t: number, r: number, c: number) {
  const k = chave(r, c); const a = ATRASO.get(k) ?? 0;
  if (t >= E.c5DanoB + a * 0.35 && SET_B.has(k)) return true;
  if (SET_A.has(k) && t >= E.c5DanoA + a * 0.3 && t < E.c5Recupera + a * 0.8) return true;
  return false;
}
const voltando = (t: number, r: number, c: number) => { const a = ATRASO.get(chave(r, c)) ?? 0; const t0 = E.c5Recupera + a * 0.8; return SET_A.has(chave(r, c)) && t >= t0 && t < t0 + 0.4; };

const Barras: React.FC<{ t: number; ini: number; fim: number; erros: number[]; lim: number }> = ({ t, ini, fim, erros, lim }) => {
  const p = degraus(t, ini, fim, 10, 0.25); if (p <= 0) return null;
  const enche = clamp(lin(t, ini + 0.15, ini + 0.75, 0, 1, inOut)); const ESC = 22;
  return (
    <div style={{ position: 'absolute', left: 60, top: 1300, width: 960, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, background: COR.fundo, padding: '8px 0' }}>
      <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 29, color: COR.branco, letterSpacing: 1, marginBottom: 10 }}>
        ERROS POR BLOCO · <span style={{ color: COR.ciano }}>LIMITE {lim}</span>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        {erros.map((e, b) => {
          const v = Math.round(e * enche); const passou = v > lim;
          return (
            <div key={b} style={{ width: 225 }}>
              <div style={{ fontFamily: FONTE_UI, fontSize: 27, color: passou ? COR.amarelo : '#C9D1E0', marginBottom: 4 }}>BLOCO {b + 1} · <b style={{ color: passou ? COR.amarelo : COR.branco }}>{v}</b></div>
              <div style={{ position: 'relative', height: 30, background: '#1A2338' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: 30, width: `${(v / ESC) * 100}%`, background: passou ? COR.amarelo : COR.ciano }} />
                <div style={{ position: 'absolute', left: `${(lim / ESC) * 100}%`, top: -6, width: 5, height: 42, background: COR.branco }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Cena5: React.FC<{ t: number; fps: number }> = ({ t }) => {
  let cam = camLerp(CAM0, { ...CAM0, w: CAM0.w - 3 }, lin(t, E.c5Suspense, E.c5Morph, 0, 1, inOut));
  cam = camLerp(cam, C5_CAM, lin(t, E.c5Morph, E.c5Morph + 1.0, 0, 1, inOut));
  const fimCena = E.c6Ini;
  const sumir = clamp(lin(t, fimCena - 0.05, fimCena + 0.2, 0, 1));                       // saída para a cena 6
  const ladoCartao = (NA + 8) + 8 * clamp(Math.floor(lin(t, E.c5Morph + 0.1, E.c5Morph + 0.5, 0, 1) * 6) / 6);
  const L = ladoCartao * (1 - Math.floor(sumir * 6) / 6);

  // módulos do código antigo saindo / novos entrando
  const antigos = t < E.c5Morph + 0.6 ? (
    <g transform={`translate(${DESL} ${DESL})`}>
      <Modulos q={QA} estilo={(i, _r, _c, dark) => {
        if (!dark) return null; const t0 = E.c5Morph + SAI[i] * 0.35; const s = 1 - clamp((t - t0) / 0.15);
        return s > 0 ? { fill: COR.fundo, sc: s } : null;
      }} />
    </g>
  ) : null;
  const scan = lin(t, E.c5Leitura, E.c5Leitura + 0.6, -4, NH + 4, inOut);
  const novos = t >= E.c5Morph + 0.25 ? (
    <Modulos q={QH} estilo={(i, r, c, dark) => {
      const t0 = E.c5Morph + 0.25 + ENTRA[i] * 0.45; let s = clamp((t - t0) / 0.15);
      if (s <= 0 || aberto(t, r, c)) return null;
      s *= 1 - Math.floor(sumir * 6) / 6; if (s <= 0) return null;
      let fill: string | null = dark ? COR.fundo : null;
      if (voltando(t, r, c)) fill = dark ? COR.ciano : COR.cianoClaro;
      const ds = scan - (r + 0.5); if (dark && ds > 0 && ds < 1.6 && t > E.c5Leitura && t < E.c5Leitura + 0.9) fill = COR.ciano;
      return fill ? { fill, sc: s } : null;
    }} />
  ) : null;

  // buraco: células abertas (inclui zona de silêncio) + contorno amarelo nas arestas com células intactas
  const abertas: number[][] = []; const setAb = new Set<string>();
  for (const [r, c] of DB.celulas) if (aberto(t, r, c)) { abertas.push([r, c]); setAb.add(chave(r, c)); }
  let borda = '';
  for (const [r, c] of abertas) {
    if (!setAb.has(chave(r - 1, c)) && r > -4) borda += `M${c} ${r}h1`;
    if (!setAb.has(chave(r + 1, c)) && r < NH + 3) borda += `M${c} ${r + 1}h1`;
    if (!setAb.has(chave(r, c - 1)) && c > -4) borda += `M${c} ${r}v1`;
    if (!setAb.has(chave(r, c + 1)) && c < NH + 3) borda += `M${c + 1} ${r}v1`;
  }
  const falha = t >= E.c5Falha;
  const recuperada = t >= E.c5Recupera + 0.5 && t < E.c5DanoB;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Circuitos t={t} camX={16.5} camW={cam.w} />
      <svg width={W} height={H} viewBox={camVB(cam)} style={{ position: 'absolute' }}>
        {L > 0.01 && <rect x={NH / 2 - L / 2} y={NH / 2 - L / 2} width={L} height={L} rx={0.5} fill={COR.branco} />}
        {antigos}
        {abertas.map(([r, c]) => <rect key={'h' + r + ',' + c} x={c - 0.01} y={r - 0.01} width={1.02} height={1.02} fill={COR.fundo} />)}
        {novos}
        {borda && sumir === 0 && <path d={borda} stroke={COR.amarelo} strokeWidth={0.14} fill="none" strokeLinecap="square" />}
        {t > E.c5Leitura && t < E.c5Leitura + 0.65 && <rect x={-4.5} y={scan - 0.1} width={NH + 9} height={0.2} fill={COR.ciano} />}
      </svg>

      <Titulo t={t} ini={E.c5Rotulo} fim={E.c5Blocos - 0.5} linhas={[{ txt: 'MESMA MENSAGEM · NÍVEL H', mono: true }, { txt: '33×33 → 41×41', tam: 84 }, { txt: 'MAIS MÓDULOS PARA CORREÇÃO', mono: true, cor: COR.ciano, tam: 30 }]} />
      <Rotulo t={t} ini={E.c5Leitura + 0.4} fim={E.c5DanoA - 0.1} x={W / 2} y={1310} tam={38} centro cor={COR.ciano}>LEITURA OK ✓</Rotulo>

      <Barras t={t} ini={E.c5Blocos} fim={E.c5Recupera + 0.3} erros={DA.erros_por_bloco} lim={DA.limite_por_bloco} />
      {recuperada && degraus(t, E.c5Recupera + 0.5, E.c5DanoB - 0.3) > 0 && (
        <div style={{ position: 'absolute', left: 60, top: 1296, width: 960, clipPath: `inset(0 ${(1 - degraus(t, E.c5Recupera + 0.5, E.c5DanoB - 0.3)) * 100}% 0 0)`,
          background: COR.painel, borderRadius: 12, padding: '12px 22px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 30, color: COR.ciano, letterSpacing: 2 }}>MENSAGEM RECUPERADA ✓</div>
          <div style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 33, color: COR.branco, lineHeight: 1.18 }}>{QH.texto}</div>
          <div style={{ fontFamily: FONTE_UI, fontSize: 25, color: '#C9D1E0', marginTop: 4 }}>o leitor corrige os dados (imagem ilustrativa)</div>
        </div>
      )}
      <Barras t={t} ini={E.c5DanoB + 0.25} fim={falha ? E.c5Falha - 0.05 : 99} erros={DB.erros_por_bloco} lim={DB.limite_por_bloco} />
      {falha && degraus(t, E.c5Falha, fimCena - 0.15) > 0 && (
        <div style={{ position: 'absolute', left: 60, top: 1300, width: 960, clipPath: `inset(0 ${(1 - degraus(t, E.c5Falha, fimCena - 0.15)) * 100}% 0 0)`,
          background: COR.fundo, border: `3px solid ${COR.amarelo}`, borderRadius: 12, padding: '14px 22px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 40, color: COR.amarelo, letterSpacing: 2 }}>✕ NÃO FOI POSSÍVEL LER</div>
          <div style={{ fontFamily: FONTE_UI, fontSize: 28, color: COR.branco, marginTop: 6 }}>erros demais: além do limite</div>
        </div>
      )}
    </div>
  );
};
