// Peças compartilhadas pelas cenas 2–7. Tudo é função pura do tempo absoluto t (segundos).
import React from 'react';
import QR from './qr_dados.json';
import { COR, FONTE_TITULO, FONTE_UI, clamp, inOut, lin, mulberry32, out, passos } from './lib';

export const W = 1080, H = 1920;
export type Codigo = { size: number; data: number[]; tipos: string[]; ordemDados: number[]; texto: string };
export const COD = QR as unknown as Record<'abertura' | 'mensagem' | 'demoH' | 'link', Codigo & { fluxoInicio: string; version: number; ec: string; palavras: number }>;

// ---------- câmera (viewBox em unidades de módulo)
export type Cam = { cx: number; cy: number; w: number };
export const camVB = (c: Cam) => { const h = c.w * H / W; return `${c.cx - c.w / 2} ${c.cy - h / 2} ${c.w} ${h}`; };
export const naTela = (c: Cam, x: number, y: number) => { const px = W / c.w, h = c.w * H / W; return { x: (x - (c.cx - c.w / 2)) * px, y: (y - (c.cy - h / 2)) * px }; };
export const camLerp = (a: Cam, b: Cam, p: number): Cam => ({ cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p, w: a.w + (b.w - a.w) * p });
// enquadramento: código de lado `lado` (módulos, com margem) ocupando `px` pixels, centro na tela em yTela
export const enquadra = (centro: number, lado: number, px: number, yTela: number): Cam => {
  const w = lado * W / px; return { cx: centro, cy: centro + (H / 2 - yTela) * w / W, w };
};

// ---------- módulos
export type EstiloModulo = { fill: string; sc?: number; dx?: number; dy?: number; rot?: number } | null;
export const Modulos: React.FC<{ q: Codigo; estilo: (i: number, r: number, c: number, dark: boolean, tipo: string) => EstiloModulo }> = ({ q, estilo }) => {
  const N = q.size; const out: React.ReactNode[] = [];
  for (let i = 0; i < N * N; i++) {
    const r = Math.floor(i / N), c = i % N; const e = estilo(i, r, c, q.data[i] === 1, q.tipos[i]);
    if (!e) continue;
    const sc = e.sc ?? 1; const x = c + (e.dx ?? 0), y = r + (e.dy ?? 0);
    out.push(<rect key={i} x={x + (1 - sc) / 2} y={y + (1 - sc) / 2} width={sc + 0.012} height={sc + 0.012} fill={e.fill}
      transform={e.rot ? `rotate(${e.rot} ${x + 0.5} ${y + 0.5})` : undefined} />);
  }
  return <>{out}</>;
};
export const posOrdem = (q: Codigo) => { const m = new Map<number, number>(); q.ordemDados.forEach((v, k) => m.set(v, k)); return m; };
export const Cartao: React.FC<{ n: number; margem?: number; escala?: number; cor?: string }> = ({ n, margem = 4, escala = 1, cor = COR.branco }) => {
  const L = n + 2 * margem, c = n / 2;
  return <rect x={c - L * escala / 2} y={c - L * escala / 2} width={L * escala} height={L * escala} rx={0.5} fill={cor} />;
};
// atraso com semente por módulo (0..1)
export const atrasos = (n: number, seed: number) => { const r = mulberry32(seed); return Array.from({ length: n }, () => r()); };

// ---------- textos
type Linha = { txt: string; cor?: string; mono?: boolean; tam?: number };
// título que se monta e se desmonta em degraus de módulo (sem fade)
export const Titulo: React.FC<{ t: number; ini: number; fim?: number; linhas: Linha[]; top?: number; left?: number }> = ({ t, ini, fim = 1e9, linhas, top = 228, left = 60 }) => {
  if (t < ini || t > fim + 0.7) return null;
  return (
    <div style={{ position: 'absolute', left, top, width: W - 2 * left }}>
      {linhas.map((l, k) => {
        const d = k * 0.08;
        const p = passos(lin(t, ini + d, ini + d + 0.4, 0, 1, out), 14) - passos(lin(t, fim + 0.18 - d, fim + 0.48 - d, 0, 1, inOut), 14);
        return (
          <div key={k} style={{ clipPath: `inset(0 ${(1 - clamp(p)) * 100}% 0 0)`, marginBottom: l.mono ? 10 : 6 }}>
            <span style={{
              display: 'inline-block', background: COR.fundo, whiteSpace: 'nowrap', padding: l.mono ? '8px 18px' : '4px 20px 10px',
              fontFamily: l.mono ? FONTE_UI : FONTE_TITULO, fontWeight: l.mono ? 700 : 800, fontSize: l.tam ?? (l.mono ? 34 : 90),
              letterSpacing: l.mono ? 4 : -1, lineHeight: 1.05, color: l.cor ?? (l.mono ? COR.amarelo : COR.branco),
            }}>{l.txt}</span>
          </div>
        );
      })}
    </div>
  );
};
// revelação lateral em degraus para qualquer bloco (entra em ini, sai em fim)
export const degraus = (t: number, ini: number, fim = 1e9, n = 12, dur = 0.3) =>
  clamp(passos(lin(t, ini, ini + dur, 0, 1, out), n) - passos(lin(t, fim, fim + dur, 0, 1, inOut), n));
export const Rotulo: React.FC<{ t: number; ini: number; fim?: number; x: number; y: number; children: React.ReactNode; tam?: number; cor?: string; fundo?: string; centro?: boolean }> =
  ({ t, ini, fim, x, y, children, tam = 28, cor = COR.branco, fundo = COR.fundo, centro }) => {
    const p = degraus(t, ini, fim); if (p <= 0) return null;
    return (
      <div style={{ position: 'absolute', left: x, top: y, transform: centro ? 'translateX(-50%)' : undefined, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        background: fundo, padding: '10px 18px', fontFamily: FONTE_UI, fontWeight: 500, fontSize: tam, color: cor, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
        {children}
      </div>
    );
  };
export const Ficha: React.FC<{ p: number; x: number; y: number; icone: string; rotulo: string; w?: number }> = ({ p, x, y, icone, rotulo, w = 440 }) => {
  if (p <= 0.001) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: 100, transform: `translateY(${(1 - p) * -30}px)`, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
      background: COR.painel, border: `3px solid ${COR.ciano}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', boxSizing: 'border-box',
    }}>
      <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 34, color: COR.fundo, background: COR.ciano, borderRadius: 8, padding: '6px 12px' }}>{icone}</div>
      <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 44, color: COR.branco, letterSpacing: 2 }}>{rotulo}</div>
    </div>
  );
};
// ícone de rede: três arcos + ponto; cortado = traço diagonal amarelo
export const IconeRede: React.FC<{ x: number; y: number; s?: number; on: boolean }> = ({ x, y, s = 1, on }) => {
  const cor = on ? COR.ciano : COR.amarelo;
  return (
    <svg width={80 * s} height={70 * s} viewBox="0 0 80 70" style={{ position: 'absolute', left: x, top: y }}>
      {[30, 20, 10].map((r, k) => <path key={k} d={`M${40 - r * 1.2} ${58 - r * 0.85} A ${r * 1.45} ${r * 1.45} 0 0 1 ${40 + r * 1.2} ${58 - r * 0.85}`} fill="none" stroke={cor} strokeWidth={6} strokeLinecap="round" opacity={on ? 1 : 0.55} />)}
      <rect x={35} y={54} width={10} height={10} fill={cor} />
      {!on && <line x1={10} y1={66} x2={70} y2={4} stroke={COR.amarelo} strokeWidth={7} strokeLinecap="round" />}
    </svg>
  );
};
