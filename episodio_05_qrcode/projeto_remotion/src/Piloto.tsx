// PILOTO — Cena 01 "O mistério" (0–12,3 s). Toda a imagem é função pura do tempo t.
// O QR Code desenhado é a matriz REAL gerada pela node-qrcode (src/qr_dados.json), legível por decodificadores.
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
const CARD_Y = 860;          // centro do código na tela (px) no plano geral

// ---------- câmera: viewBox em unidades de módulo
type Cam = { cx: number; cy: number; w: number; rx: number; rz: number; sx: number; sy: number };
function camera(t: number, fps: number): Cam {
  const c0 = N / 2;
  const s = mola(t, E.gancho, fps, { damping: 17, stiffness: 70, mass: 1 });           // gancho: plano inclinado -> chapado
  let w = lin(s, 0, 1, 64, 58);
  if (t >= E.assentou) w = lin(t, E.assentou, E.leitura, 58, 55, inOut);
  if (t >= E.leitura) w = lin(t, E.leitura, E.dano, 55, 47, inOut);
  let cx = c0, cyOff = (H / 2 - CARD_Y);
  let cy = c0 + cyOff * w / W;
  const d = lin(t, E.mergulho, E.zigzag + 0.1, 0, 1, inOut);                             // mergulho até o canto inferior direito
  if (d > 0) {
    const wM = lin(t, E.zigzag, E.duracao, 16, 14.5);
    w = w + (wM - w) * d;
    cx = cx + (28.5 - cx) * d;
    const cyM = lin(t, E.zigzag, E.duracao, 26, 23);
    cy = cy + (cyM - cy) * d;
  }
  // tremor curto no dano (semente fixa, decai em 0,35 s)
  const k = clamp(1 - (t - E.dano) / 0.35) * (t >= E.dano ? 1 : 0);
  const r = mulberry32(Math.floor(t * fps) + 11);
  const sx = (r() - 0.5) * 0.5 * k, sy = (r() - 0.5) * 0.5 * k;
  return { cx, cy, w, rx: lin(s, 0, 1, 30, 0), rz: lin(s, 0, 1, -10, 0), sx, sy };
}

// ---------- dados por módulo (pré-calculados uma vez, imutáveis)
const rnd = mulberry32(2026);
const MODS = Q.data.map((v, i) => ({
  i, r: Math.floor(i / N), c: i % N, dark: v === 1, tipo: Q.tipos[i] as string,
  dx: (rnd() - 0.5) * 2, dy: (rnd() - 0.5) * 2, rot: (rnd() - 0.5) * 70, atraso: rnd(),
}));
const ORDEM = Q.ordemDados as number[];
const POS_ORDEM = new Map<number, number>(); ORDEM.forEach((m, k) => POS_ORDEM.set(m, k));

// área do dano: polígono irregular "em degraus" de meio módulo, longe dos padrões de função
const DANO_C = { x: 22.5, y: 14.5 };
const DANO = (() => {
  const r = mulberry32(905); const pts: [number, number][] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2; const R = 3.1 + r() * 1.5;
    pts.push([Math.round((DANO_C.x + Math.cos(a) * R * 1.15) * 2) / 2, Math.round((DANO_C.y + Math.sin(a) * R) * 2) / 2]);
  }
  return pts;
})();
function dentro(x: number, y: number, pts: [number, number][]) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
const NO_DANO = new Set(MODS.filter((m) => dentro(m.c + 0.5, m.r + 0.5, DANO)).map((m) => m.i));


export const Piloto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t, fps);
  const h = cam.w * H / W;
  const vb = `${cam.cx - cam.w / 2 + cam.sx} ${cam.cy - h / 2 + cam.sy} ${cam.w} ${h}`;
  const px = W / cam.w; // px por módulo
  const toScreen = (mx: number, my: number) => ({ x: (mx - (cam.cx - cam.w / 2)) * px, y: (my - (cam.cy - h / 2)) * px });

  // embaralhamento: só os módulos fora dos 3 localizadores se mexem (eles ficam firmes: pista do que vem depois)
  const bagunca = t < E.ordem ? lin(t, E.baguncaIni, E.baguncaIni + 0.35, 0, 1, out) : 1 - mola(t, E.ordem, fps, { damping: 11, stiffness: 190 });
  // varredura de leitura (gancho) e segunda leitura
  const scan1 = lin(t, 0.12, 1.05, -MARGEM, N + MARGEM, inOut);
  const scan2 = lin(t, E.leitura, E.leitura + 0.6, -MARGEM, N + MARGEM, inOut);
  const gradeVis = t < E.ordem;
  // dano
  const removidos = new Set(t < E.dano ? [] : MODS.filter((m) => NO_DANO.has(m.i) && t >= E.dano + m.atraso * 0.25).map((m) => m.i));
  let bordaDano = '';  // contorno amarelo só nas arestas entre módulo arrancado e módulo intacto
  for (const i of removidos) {
    const r = Math.floor(i / N), c = i % N;
    if (!removidos.has(i - N)) bordaDano += `M${c} ${r}h1`;
    if (!removidos.has(i + N)) bordaDano += `M${c} ${r + 1}h1`;
    if (c === 0 || !removidos.has(i - 1)) bordaDano += `M${c} ${r}v1`;
    if (c === N - 1 || !removidos.has(i + 1)) bordaDano += `M${c + 1} ${r}v1`;
  }
  // zigue-zague real
  const nZig = t < E.zigzag ? 0 : (Math.floor((t - E.zigzag) / 0.125) + 1) * 8; // uma palavra de código (8 módulos) por semicolcheia, junto com o tique

  const rects: React.ReactNode[] = [];
  for (const m of MODS) {
    const k = POS_ORDEM.get(m.i);
    if (removidos.has(m.i)) continue;
    let fill: string | null = m.dark ? COR.fundo : null;
    // destaque da 1ª varredura: módulos escuros recém-varridos ficam ciano por um instante
    const ds1 = scan1 - (m.r + 0.5);
    if (m.dark && ds1 > 0 && ds1 < 2.2 && t < 1.3) fill = COR.ciano;
    const ds2 = scan2 - (m.r + 0.5);
    if (m.dark && ds2 > 0 && ds2 < 1.6 && t > E.leitura && t < E.leitura + 0.9) fill = COR.ciano;
    // ordem real dos bits
    if (k !== undefined && k < nZig) {
      const cw = Math.floor(k / 8);
      fill = m.dark ? (cw % 2 ? COR.cianoEsc : COR.ciano) : (cw % 2 ? '#D6F8FC' : COR.cianoClaro);
    }
    if (!fill) continue;
    const move = m.tipo !== 'localizador' && m.tipo !== 'separador' ? bagunca : 0;
    const sc = 1 - 0.25 * move;
    const x = m.c + m.dx * 0.9 * move, y = m.r + m.dy * 0.9 * move;
    rects.push(
      <rect key={m.i} x={x + (1 - sc) / 2} y={y + (1 - sc) / 2} width={sc + 0.012} height={sc + 0.012} fill={fill}
        transform={move > 0.001 ? `rotate(${m.rot * move} ${x + 0.5} ${y + 0.5})` : undefined} />,
    );
  }

  // fragmentos do dano: os próprios módulos escuros arrancados caem um pouco e somem encolhendo (poucos, não é explosão)
  const frags: React.ReactNode[] = [];
  if (t >= E.dano && t < E.dano + 0.9) {
    for (const m of MODS) {
      if (!NO_DANO.has(m.i) || !m.dark) continue;
      const tt = t - (E.dano + m.atraso * 0.25); if (tt < 0 || tt > 0.6) continue;
      const p = tt / 0.6; const sc = 1 - p;
      const x = m.c + (m.c + 0.5 - DANO_C.x) * 0.5 * p, y = m.r + p * p * 2.2;
      frags.push(<rect key={'f' + m.i} x={x + (1 - sc) / 2} y={y + (1 - sc) / 2} width={sc} height={sc} fill={COR.fundo}
        transform={`rotate(${m.rot * p * 2} ${x + 0.5} ${y + 0.5})`} />);
    }
  }

  // caminho do zigue-zague (centros dos módulos na ordem real)
  let zig = '';
  for (let k = 0; k < Math.min(nZig, ORDEM.length); k++) {
    const m = ORDEM[k]; zig += `${k ? 'L' : 'M'}${(m % N) + 0.5} ${Math.floor(m / N) + 0.5}`;
  }
  const cabeca = nZig > 0 ? ORDEM[Math.min(nZig, ORDEM.length) - 1] : -1;

  // fichas (espaço de tela)
  const cardBottom = toScreen(N / 2, N + MARGEM).y;
  const chip = (t0: number) => {
    const a = mola(t, t0, fps, { damping: 15, stiffness: 170 });
    const b = t >= E.leitura ? mola(t, E.leitura, fps, { damping: 18, stiffness: 200 }) : 0;
    return clamp(a - b);
  };
  const cT = chip(E.chipTexto), cS = chip(E.chipSite);

  // título (passos de módulo, sem fade)
  const tit = (d: number) => passos(lin(t, E.titulo + d, E.titulo + d + 0.4, 0, 1, out), 14);
  const zigLabel = t >= E.zigzag;
  const cwAtual = Math.min(Math.floor(nZig / 8), 100);

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo, fontFamily: FONTE_TITULO }}>
      <Fontes />
      <Audio src={staticFile('piloto_mix.wav')} />
      <Circuitos t={t} camX={cam.cx} camW={cam.w} />

      {/* plano do código: inclinação 3D só no gancho */}
      <AbsoluteFill style={{ transform: `perspective(1700px) rotateX(${cam.rx}deg) rotateZ(${cam.rz}deg)`, transformOrigin: `540px ${CARD_Y}px` }}>
        <svg width={W} height={H} viewBox={vb} style={{ position: 'absolute' }}>
          <rect x={-MARGEM} y={-MARGEM} width={N + 2 * MARGEM} height={N + 2 * MARGEM} rx={0.5} fill={COR.branco} />
          {/* buraco do dano: módulos inteiros arrancados, um a um */}
          {[...removidos].map((i) => <rect key={'h' + i} x={i % N - 0.01} y={Math.floor(i / N) - 0.01} width={1.02} height={1.02} fill={COR.fundo} />)}
          {rects}
          {frags}
          {bordaDano && <path d={bordaDano} stroke={COR.amarelo} strokeWidth={0.12} strokeLinecap="square" fill="none" />}
          {/* grade revelada pela varredura */}
          {gradeVis && t > 0.1 && (
            <g stroke={COR.ciano} strokeWidth={0.045} opacity={0.55}>
              <clipPath id="gradeClip"><rect x={-MARGEM} y={-MARGEM} width={N + 2 * MARGEM} height={Math.max(0, scan1 + MARGEM)} /></clipPath>
              <g clipPath="url(#gradeClip)">
                {Array.from({ length: N + 1 }, (_, k) => (
                  <React.Fragment key={k}>
                    <line x1={k} y1={0} x2={k} y2={N} /><line x1={0} y1={k} x2={N} y2={k} />
                  </React.Fragment>
                ))}
              </g>
            </g>
          )}
          {/* linhas de varredura */}
          {t > 0.1 && t < 1.15 && <rect x={-MARGEM - 0.5} y={scan1 - 0.09} width={N + 2 * MARGEM + 1} height={0.18} fill={COR.ciano} />}
          {t > E.leitura && t < E.leitura + 0.65 && <rect x={-MARGEM - 0.5} y={scan2 - 0.09} width={N + 2 * MARGEM + 1} height={0.18} fill={COR.ciano} />}
          {/* ordem real dos bits */}
          {nZig > 0 && <path d={zig} fill="none" stroke={COR.fundo} strokeWidth={0.05} strokeLinejoin="round" opacity={0.55} />}
          {cabeca >= 0 && <rect x={(cabeca % N) + 0.3} y={Math.floor(cabeca / N) + 0.3} width={0.4} height={0.4} fill={COR.amarelo} stroke={COR.fundo} strokeWidth={0.06} />}
        </svg>
      </AbsoluteFill>

      {/* fichas: o que um código pode guardar */}
      {[{ p: cT, x: 80, rotulo: 'MENSAGEM', icone: 'Aa' }, { p: cS, x: 560, rotulo: 'ENDEREÇO', icone: 'www' }].map((c, k) => c.p > 0.001 && (
        <React.Fragment key={k}>
          <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <line x1={c.x + 220} y1={cardBottom} x2={c.x + 220} y2={cardBottom + 36 * c.p} stroke={COR.ciano} strokeWidth={3} />
          </svg>
          <div style={{
            position: 'absolute', left: c.x, top: cardBottom + 36 * c.p, width: 440, height: 100,
            transform: `translateY(${(1 - c.p) * -30}px)`, clipPath: `inset(0 0 ${(1 - c.p) * 100}% 0)`,
            background: COR.painel, border: `3px solid ${COR.ciano}`, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', boxSizing: 'border-box',
          }}>
            <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 34, color: COR.fundo, background: COR.ciano, borderRadius: 8, padding: '6px 12px' }}>{c.icone}</div>
            <div style={{ fontFamily: FONTE_UI, fontWeight: 700, fontSize: 44, color: COR.branco, letterSpacing: 2 }}>{c.rotulo}</div>
          </div>
        </React.Fragment>
      ))}

      {/* pergunta-título: placa escura que se monta em passos de módulo */}
      {t >= E.titulo && (
        <div style={{ position: 'absolute', left: 60, top: 228, width: 960 }}>
          {[{ txt: 'ALÉM DO VISÍVEL · EP. 05', d: 0, kind: 'k' }, { txt: 'COMO ISSO GUARDA', d: 0.08, kind: 't' }, { txt: 'INFORMAÇÕES?', d: 0.18, kind: 'c' }].map((l, k) => (
            <div key={k} style={{ clipPath: `inset(0 ${(1 - tit(l.d)) * 100}% 0 0)`, marginBottom: k === 0 ? 10 : 6 }}>
              <span style={{
                display: 'inline-block', background: COR.fundo, padding: l.kind === 'k' ? '8px 18px' : '4px 20px 10px',
                fontFamily: l.kind === 'k' ? FONTE_UI : FONTE_TITULO, fontWeight: l.kind === 'k' ? 700 : 800,
                fontSize: l.kind === 'k' ? 34 : 90, letterSpacing: l.kind === 'k' ? 4 : -1, lineHeight: 1.05, whiteSpace: 'nowrap',
                color: l.kind === 'k' ? COR.amarelo : l.kind === 'c' ? COR.ciano : COR.branco,
              }}>{l.txt}</span>
            </div>
          ))}
        </div>
      )}

      {/* leitura da ordem real dos bits: interface discreta */}
      {zigLabel && (
        <div style={{
          position: 'absolute', left: 60, top: 1236, clipPath: `inset(0 ${(1 - passos(lin(t, E.zigzag, E.zigzag + 0.3, 0, 1), 10)) * 100}% 0 0)`,
          background: COR.fundo, padding: '12px 20px', fontFamily: FONTE_UI, fontWeight: 500, fontSize: 27, color: COR.branco, letterSpacing: 0.5,
        }}>
          ORDEM REAL DOS BITS · <span style={{ color: COR.ciano, fontWeight: 700 }}>PALAVRA {String(cwAtual).padStart(2, '0')}/100</span>
        </div>
      )}

      <Legendas t={t} />
    </AbsoluteFill>
  );
};
