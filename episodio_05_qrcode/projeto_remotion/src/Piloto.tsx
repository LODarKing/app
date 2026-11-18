// PILOTO — Cena 01 "O mistério" (0–10,3 s), sobre a narração fornecida pelo usuário.
// Toda a imagem é função pura do tempo t. O QR desenhado é a matriz REAL da node-qrcode (src/qr_dados.json).
// (A versão 1 do piloto, sobre o roteiro do briefing, está no histórico do git.)
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import QR from './qr_dados.json';
import TL from './timeline.json';
import { COR, FONTE_TITULO, FONTE_UI, clamp, inOut, lin, mola, mulberry32, out, passos } from './lib';
import { Fontes } from './Fontes';
import { Legendas } from './Legendas';
import { Circuitos } from './Circuitos';

const E = TL.piloto;
const Q = QR.abertura;
const N = Q.size;            // 33 módulos (versão 4)
const MARGEM = 4;            // zona de silêncio padrão
const W = 1080, H = 1920;
const CARD_Y = 985;          // centro do código na tela (px): abaixo do título, acima da legenda

// ---------- câmera: viewBox em unidades de módulo
function camera(t: number, fps: number) {
  const c0 = N / 2;
  const s = mola(t, E.gancho, fps, { damping: 17, stiffness: 70, mass: 1 });      // gancho: inclinado -> chapado
  let w = lin(s, 0, 1, 66, 60);
  if (t >= E.assentou) w = lin(t, E.assentou, E.mergulho, 60, 56, inOut);
  if (t >= E.quadradinhos && t < E.titulo + 0.5) w -= 1.2 * Math.sin(Math.PI * clamp((t - E.quadradinhos) / 1.5)); // respiro na onda
  let cx = c0;
  let cy = c0 + (H / 2 - CARD_Y) * w / W;
  const d = lin(t, E.mergulho, E.zigzag + 0.35, 0, 1, inOut);                        // mergulho até o canto inferior direito
  if (d > 0) {
    const wM = lin(t, E.zigzag, E.duracao, 16, 14.8);
    w = w + (wM - w) * d;
    cx = cx + (28.5 - cx) * d;
    cy = cy + (lin(t, E.zigzag, E.duracao, 26, 24) - cy) * d;
  }
  return { cx, cy, w, rx: lin(s, 0, 1, 30, 0), rz: lin(s, 0, 1, -10, 0) };
}

// ---------- dados por módulo (pré-calculados, imutáveis)
const rnd = mulberry32(2026);
const MODS = Q.data.map((v, i) => ({
  i, r: Math.floor(i / N), c: i % N, dark: v === 1, tipo: Q.tipos[i] as string,
  dx: (rnd() - 0.5) * 2, dy: (rnd() - 0.5) * 2, rot: (rnd() - 0.5) * 70,
}));
const ORDEM = Q.ordemDados as number[];
const POS_ORDEM = new Map<number, number>(); ORDEM.forEach((m, k) => POS_ORDEM.set(m, k));
const FIXO = (tipo: string) => tipo === 'localizador' || tipo === 'separador';

export const Cena1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t, fps);
  const h = cam.w * H / W;
  const vb = `${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`;

  // embaralhamento ("desenho sem sentido"): os 3 localizadores não se mexem — pista para a cena 3
  const bagunca = t < E.ordem ? lin(t, E.baguncaIni, E.baguncaIni + 0.4, 0, 1, out) : 1 - mola(t, E.ordem, fps, { damping: 11, stiffness: 190 });
  const deriva = t >= E.baguncaIni && t < E.ordem ? (t - E.baguncaIni) / (E.ordem - E.baguncaIni) : 0; // a bagunça continua viva
  const scan1 = lin(t, 0.12, 1.05, -MARGEM, N + MARGEM, inOut);
  const scan2 = lin(t, E.leitura, E.leitura + 0.6, -MARGEM, N + MARGEM, inOut);
  const gradeVis = t > 0.1 && t < E.baguncaIni;
  // onda diagonal "quadradinhos": cada módulo encolhe e volta quando a frente da onda passa por ele
  const onda = t >= E.quadradinhos && t < E.quadradinhos + 1.4 ? (t - E.quadradinhos) / 1.0 * (2 * N + 6) - 3 : -99;
  const nZig = t < E.zigzag ? 0 : (Math.floor((t - E.zigzag) / 0.125) + 1) * 8; // uma palavra de código por semicolcheia

  const rects: React.ReactNode[] = [];
  for (const m of MODS) {
    const k = POS_ORDEM.get(m.i);
    let fill: string | null = m.dark ? COR.fundo : null;
    const ds1 = scan1 - (m.r + 0.5);
    if (m.dark && ds1 > 0 && ds1 < 2.2 && t < 1.3) fill = COR.ciano;
    const ds2 = scan2 - (m.r + 0.5);
    if (m.dark && ds2 > 0 && ds2 < 1.6 && t > E.leitura && t < E.leitura + 0.9) fill = COR.ciano;
    let sc = 1;
    const dOnda = onda - (m.r + m.c);
    if (dOnda > 0 && dOnda < 6) { const p = dOnda / 6; sc = 1 - 0.45 * Math.sin(Math.PI * p); if (m.dark && p < 0.5) fill = COR.ciano; }
    if (k !== undefined && k < nZig) {
      const cw = Math.floor(k / 8);
      fill = m.dark ? (cw % 2 ? COR.cianoEsc : COR.ciano) : (cw % 2 ? '#D6F8FC' : COR.cianoClaro);
    }
    if (!fill) continue;
    const move = FIXO(m.tipo) ? 0 : bagunca;
    sc *= 1 - 0.25 * move;
    const x = m.c + (m.dx * 0.9 + m.dy * 0.35 * deriva) * move, y = m.r + (m.dy * 0.9 - m.dx * 0.35 * deriva) * move;
    rects.push(
      <rect key={m.i} x={x + (1 - sc) / 2} y={y + (1 - sc) / 2} width={sc + 0.012} height={sc + 0.012} fill={fill}
        transform={move > 0.001 ? `rotate(${m.rot * move * (1 + 0.5 * deriva)} ${x + 0.5} ${y + 0.5})` : undefined} />,
    );
  }

  let zig = '';
  for (let k = 0; k < Math.min(nZig, ORDEM.length); k++) {
    const m = ORDEM[k]; zig += `${k ? 'L' : 'M'}${(m % N) + 0.5} ${Math.floor(m / N) + 0.5}`;
  }
  const cabeca = nZig > 0 ? ORDEM[Math.min(nZig, ORDEM.length) - 1] : -1;
  // entra com a pergunta e se desmonta em degraus quando a ordem volta ("Mas existe…"): ~4 s na tela, não mais
const tit = (d: number) => passos(lin(t, E.titulo + d, E.titulo + d + 0.4, 0, 1, out), 14) - passos(lin(t, E.ordem + 0.18 - d, E.ordem + 0.48 - d, 0, 1, inOut), 14);
  const cwAtual = Math.min(Math.floor(nZig / 8), 100);

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo, fontFamily: FONTE_TITULO }}>
      <Circuitos t={t} camX={cam.cx} camW={cam.w} />

      <AbsoluteFill style={{ transform: `perspective(1700px) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg)`, transformOrigin: `540px ${CARD_Y}px` }}>
        <svg width={W} height={H} viewBox={vb} style={{ position: 'absolute' }}>
          <rect x={-MARGEM} y={-MARGEM} width={N + 2 * MARGEM} height={N + 2 * MARGEM} rx={0.5} fill={COR.branco} />
          {rects}
          {gradeVis && (
            <g stroke={COR.ciano} strokeWidth={0.045} opacity={0.55}>
              <clipPath id="gradeClip"><rect x={-MARGEM} y={-MARGEM} width={N + 2 * MARGEM} height={Math.max(0, scan1 + MARGEM)} /></clipPath>
              <g clipPath="url(#gradeClip)">
                {Array.from({ length: N + 1 }, (_, k) => (
                  <React.Fragment key={k}><line x1={k} y1={0} x2={k} y2={N} /><line x1={0} y1={k} x2={N} y2={k} /></React.Fragment>
                ))}
              </g>
            </g>
          )}
          {t > 0.1 && t < 1.15 && <rect x={-MARGEM - 0.5} y={scan1 - 0.09} width={N + 2 * MARGEM + 1} height={0.18} fill={COR.ciano} />}
          {t > E.leitura && t < E.leitura + 0.65 && <rect x={-MARGEM - 0.5} y={scan2 - 0.09} width={N + 2 * MARGEM + 1} height={0.18} fill={COR.ciano} />}
          {nZig > 0 && <path d={zig} fill="none" stroke={COR.fundo} strokeWidth={0.05} strokeLinejoin="round" opacity={0.55} />}
          {cabeca >= 0 && <rect x={(cabeca % N) + 0.3} y={Math.floor(cabeca / N) + 0.3} width={0.4} height={0.4} fill={COR.amarelo} stroke={COR.fundo} strokeWidth={0.06} />}
        </svg>
      </AbsoluteFill>

      {/* pergunta-título: placa escura que se monta em passos de módulo */}
      {t >= E.titulo && t < E.ordem + 0.6 && (
        <div style={{ position: 'absolute', left: 60, top: 228, width: 960 }}>
          {[{ txt: 'ALÉM DO VISÍVEL · EP. 05', d: 0, kind: 'k' }, { txt: 'COMO ISSO GUARDA', d: 0.08, kind: 't' }, { txt: 'INFORMAÇÕES?', d: 0.18, kind: 'c' }].map((l, k) => (
            <div key={k} style={{ clipPath: `inset(0 ${(1 - tit(l.d)) * 100}% 0 0)`, marginBottom: k === 0 ? 10 : 6 }}>
              <span style={{
                display: 'inline-block', background: COR.fundo, padding: l.kind === 'k' ? '8px 18px' : '4px 20px 10px', whiteSpace: 'nowrap',
                fontFamily: l.kind === 'k' ? FONTE_UI : FONTE_TITULO, fontWeight: l.kind === 'k' ? 700 : 800,
                fontSize: l.kind === 'k' ? 34 : 90, letterSpacing: l.kind === 'k' ? 4 : -1, lineHeight: 1.05,
                color: l.kind === 'k' ? COR.amarelo : l.kind === 'c' ? COR.ciano : COR.branco,
              }}>{l.txt}</span>
            </div>
          ))}
        </div>
      )}

      {t >= E.zigzag && (
        <div style={{
          position: 'absolute', left: 60, top: 1300, clipPath: `inset(0 ${(1 - passos(lin(t, E.zigzag, E.zigzag + 0.3, 0, 1), 10)) * 100}% 0 0)`,
          background: COR.fundo, padding: '12px 20px', fontFamily: FONTE_UI, fontWeight: 500, fontSize: 27, color: COR.branco, letterSpacing: 0.5,
        }}>
          ORDEM REAL DOS BITS · <span style={{ color: COR.ciano, fontWeight: 700 }}>PALAVRA {String(cwAtual).padStart(2, '0')}/100</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// composição do piloto aprovado = cena 1 + mixagem do piloto + legendas
export const Piloto: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <Fontes />
      <Audio src={staticFile('piloto_mix.wav')} />
      <Cena1 />
      <Legendas t={t} />
    </AbsoluteFill>
  );
};
