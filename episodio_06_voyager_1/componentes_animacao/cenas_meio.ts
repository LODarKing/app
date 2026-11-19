// Cenas 3b–5: a escala (régua logarítmica), 25,9 bilhões de km -> 1 dia-luz, o sinal de 24 h + 24 h e o problema de dados.
import * as THREE from 'three';
import { W, H, M, COR, RGB, rgba, F, seg, lerp, clamp, eOut3, eOut5, eIn3, eInOut3, eInOutSine, mola, texto, textoFenda, largura, Ctx, palavra, mulberry32, ruido1 } from './core';
import type { Espaco } from './espaco3d';
import { cameraVoyager, getVoyager } from './cenas_abertura';

export const SPR: Record<string, HTMLCanvasElement> = {};
const img = (c: Ctx, s: HTMLCanvasElement, x: number, y: number, larg: number, a = 1) => { if (a <= 0) return; c.globalAlpha = a; c.drawImage(s, x - larg / 2, y - larg / 2, larg, larg); c.globalAlpha = 1; };

// ------------------------------------------------------------------ régua logarítmica (Terra embaixo, Voyager em cima)
const XL = 420, YT = 330, YB = 1180, LOG0 = 5, LOG1 = Math.log10(2.59e10);
const yKm = (km: number) => YB - (Math.log10(km) - LOG0) / (LOG1 - LOG0) * (YB - YT);
const MARCAS: { km: number; nome: string; info: string; lado: 1 | -1; cor: readonly number[]; r: number }[] = [
  { km: 2.59e10, nome: 'VOYAGER 1', info: '≈ 173 UA', lado: 1, cor: RGB.ciano, r: 9 },
  { km: 1.81e10, nome: 'HELIOPAUSA', info: '', lado: -1, cor: RGB.branco, r: 0 },
  { km: 4.5e9, nome: 'NETUNO', info: '30 UA', lado: 1, cor: [120, 160, 255], r: 8 },
  { km: 1.43e9, nome: 'SATURNO', info: '9,5 UA', lado: -1, cor: [222, 200, 150], r: 9 },
  { km: 7.78e8, nome: 'JÚPITER', info: '5,2 UA', lado: 1, cor: [214, 180, 140], r: 10 },
  { km: 1.496e8, nome: 'SOL', info: '1 UA', lado: -1, cor: RGB.amarelo, r: 12 },
  { km: 3.844e5, nome: 'LUA', info: '384 mil km', lado: 1, cor: [200, 200, 200], r: 6 },
];

function regua(c: Ctx, t: number, alfa: number) {
  if (alfa <= 0) return;
  c.save(); c.globalAlpha = alfa;
  const yh = lerp(YT, YB, eInOut3(seg(t, M.regua, M.terra_fala)));
  const kAm = eOut3(seg(t, M.terra_fala + 0.1, M.terra_fala + 0.7));          // a linha inteira acende em amarelo, da Terra para cima
  c.strokeStyle = rgba(RGB.branco, 0.55); c.lineWidth = 3; c.beginPath(); c.moveTo(XL, YT); c.lineTo(XL, yh); c.stroke();
  if (kAm > 0) { c.strokeStyle = COR.amarelo; c.lineWidth = 6; c.beginPath(); c.moveTo(XL, YB); c.lineTo(XL, lerp(YB, YT, kAm)); c.stroke(); }
  // divisões por década (escala logarítmica)
  for (let d = 6; d <= 10; d++) { const y = yKm(10 ** d); if (y < yh) { c.fillStyle = rgba(RGB.branco, 0.35); c.fillRect(XL - 9, y - 1, 18, 2); } }
  for (const mk of MARCAS) {
    const y = yKm(mk.km), k = eOut5(seg(yh, y - 4, y + 60)) * (mk.nome === 'VOYAGER 1' ? seg(t, M.recuo + 0.6, M.recuo + 0.95) : 1);
    if (k <= 0) continue;
    if (mk.r > 0) { c.fillStyle = rgba(mk.cor, 1); c.beginPath(); c.arc(XL, y, mk.r * (0.4 + 0.6 * k), 0, Math.PI * 2); c.fill(); }
    else { c.setLineDash([10, 8]); c.strokeStyle = rgba(RGB.branco, 0.5 * k); c.lineWidth = 2; c.beginPath(); c.moveTo(XL - 200 * k, y); c.lineTo(XL + 200 * k, y); c.stroke(); c.setLineDash([]); }
    const x = XL + mk.lado * (36 + (1 - k) * 40);
    c.save(); c.globalAlpha = alfa * k;
    texto(c, mk.nome, x, y + 8, F.ui(42, 600), rgba(mk.nome === 'VOYAGER 1' ? RGB.ciano : RGB.branco, 0.95), { alinhar: mk.lado > 0 ? 'left' : 'right', esp: 3 });
    if (mk.info) texto(c, mk.info, x, y + 48, F.ui(34, 400), rgba(RGB.branco, 0.6), { alinhar: mk.lado > 0 ? 'left' : 'right', esp: 1 });
    c.restore();
  }
  // Terra (chega com a fala "Terra")
  const kT = mola(seg(t, M.terra_fala - 0.15, M.terra_fala + 0.5));
  if (kT > 0) { img(c, SPR.terra, XL, YB, 70 * kT); texto(c, 'TERRA', XL + 50, YB + 14, F.ui(42, 600), COR.branco, { alinhar: 'left', esp: 3 }); }
  const kE = seg(t, M.regua + 0.3, M.regua + 0.8);
  if (kE > 0) texto(c, 'ESCALA LOGARÍTMICA', 540, 1262, F.ui(28, 500), rgba(RGB.branco, 0.5 * kE), { esp: 6 });
  c.restore();
}

// ------------------------------------------------------------------ CENA 3b + 4 (contínuas): escala -> 25,9 bi km -> 1 dia-luz -> sinal
const X4 = 300, YE = 1160, YV = 540;                         // eixo do diagrama do sinal: Terra (baixo) e Voyager (cima)
export function cenaEscalaSinal(c: Ctx, e: Espaco, t: number) {
  // fundo: recuo da câmera a partir da sonda — ela vira um ponto que sobe até o topo da régua
  const kr = seg(t, M.recuo, M.recuo + 1.0);
  cameraVoyager(e, M.recuo - 0.001);
  const dir = e.camera.position.clone().sub(new THREE.Vector3(0.15, 0.35, -0.6)).normalize();
  e.camera.position.copy(new THREE.Vector3(0.15, 0.35, -0.6)).addScaledVector(dir, 30 * Math.exp(Math.log(140) * eIn3(kr)));
  e.camera.fov = 34; e.camera.updateProjectionMatrix();
  const yAlvo = lerp(1020, YT, eInOut3(seg(t, M.recuo, M.recuo + 0.95))), xDesl = lerp(0, XL - 540, eInOut3(seg(t, M.recuo + 0.2, M.recuo + 0.95)));
  e.centro(yAlvo); e.camera.lookAt(0.15, 0.35, -0.6);
  e.camera.setViewOffset(W + Math.abs(2 * xDesl), e.camera.view!.fullHeight, xDesl < 0 ? -2 * xDesl : 0, e.camera.view!.offsetY, W, H);
  // (o deslocamento horizontal leva o ponto da sonda até o eixo da régua)
  e.sol.intensity = 3.4; e.apoio.intensity = 0.6;
  e.render({ estrelas: 1, via: 1.1, extra: kr < 1 ? [getVoyager()] : [] });
  c.drawImage(e.canvas, 0, 0);
  if (kr > 0.55 && t < 20.7) { const k = seg(kr, 0.55, 0.9) * (1 - seg(t, 20.3, 20.6)); c.fillStyle = rgba(RGB.ciano, k); c.beginPath(); c.arc(XL, YT, 9, 0, Math.PI * 2); c.fill(); }

  // régua (escurece na revelação da distância e sai na cena do sinal)
  const aR = (1 - 0.8 * eInOut3(seg(t, M.km - 0.55, M.km - 0.1))) * (1 - seg(t, 20.3, 20.65));
  c.save(); c.translate(-90 * eInOut3(seg(t, M.km - 0.55, M.km - 0.1)), 0); regua(c, t, aR); c.restore();

  // 25,9 BILHÕES DE KM (contador) -> 1 DIA-LUZ
  if (t >= M.km - 0.3 && t < M.dialuz + 0.3) {
    const sai = eIn3(seg(t, M.dialuz - 0.05, M.dialuz + 0.2));
    const v = 25.9 * eOut3(seg(t, M.km, M.km + 0.95));
    c.save(); c.globalAlpha = 1 - seg(t, M.dialuz - 0.05, M.dialuz + 0.08); c.beginPath(); c.rect(0, 420, W, 640); c.clip(); c.translate(0, sai * 640);
    textoFenda(c, 'DISTÂNCIA DA TERRA', 540, 600, F.ui(38, 500), rgba(RGB.branco, 0.8), seg(t, M.km - 0.3, M.km), { esp: 8, alt: 50 });
    textoFenda(c, v.toFixed(1).replace('.', ','), 540, 850, F.tituloX(250, 900), COR.amarelo, seg(t, M.km - 0.05, M.km + 0.2), { alt: 230 });
    textoFenda(c, 'BILHÕES DE KM', 540, 960, F.tituloX(78, 800), COR.branco, seg(t, M.km + 0.35, M.km + 0.6), { esp: 6, alt: 90 });
    c.restore();
  }
  // 1 DIA-LUZ: nasce no centro e vira o título do diagrama do sinal
  if (t >= M.dialuz) {
    const kv = eInOut3(seg(t, 20.75, 21.5)), esc = lerp(1, 0.5, kv), cy = lerp(840, 235, kv);
    const f1 = F.tituloX(280, 900), f2 = F.tituloX(116, 900), w1 = largura(c, '1', f1), w2 = largura(c, 'DIA-LUZ', f2, 2), x1 = -(w1 + 36 + w2) / 2 + w1;
    c.save(); c.translate(540, cy); c.scale(esc, esc);
    textoFenda(c, '1', x1, 40, f1, COR.amarelo, seg(t, M.dialuz, M.dialuz + 0.25), { alinhar: 'right', alt: 260 });
    textoFenda(c, 'DIA-LUZ', x1 + 36, 40, f2, COR.branco, seg(t, M.dialuz + 0.08, M.dialuz + 0.33), { alinhar: 'left', alt: 140, esp: 2 });
    c.restore();
    const ks = seg(t, M.dialuz + 0.35, M.dialuz + 0.6) * (1 - seg(t, 20.6, 20.8));
    if (ks > 0) { textoFenda(c, 'a distância que a luz', 540, 1000, F.ui(40, 500), rgba(RGB.branco, 0.85), ks, { alt: 50 }); textoFenda(c, 'percorre em 24 horas', 540, 1056, F.ui(40, 500), rgba(RGB.branco, 0.85), ks, { alt: 50 }); }
  }
  if (t >= 20.5) diagramaSinal(c, t, 1);
}

/** diagrama Terra–Voyager com o sinal de ida e a resposta hipotética de volta (também usado, escurecido, na cena 5) */
export function diagramaSinal(c: Ctx, t: number, alfa: number) {
  c.save(); c.globalAlpha = alfa;
  const kIn = eOut5(seg(t, 20.6, 21.3));
  const yE = YE + (1 - kIn) * 300, yV = YV - (1 - kIn) * 300;
  // eixo de 1 dia-luz
  c.strokeStyle = rgba(RGB.branco, 0.3 * kIn); c.lineWidth = 3; c.setLineDash([4, 10]); c.beginPath(); c.moveTo(X4, yE - 50); c.lineTo(X4, yV + 70); c.stroke(); c.setLineDash([]);
  img(c, SPR.terra, X4, yE, 100, kIn); img(c, SPR.voyager, X4, yV, 420, kIn);
  c.globalAlpha = alfa * kIn;
  texto(c, 'TERRA', X4 + 70, yE + 14, F.ui(40, 600), COR.branco, { alinhar: 'left', esp: 3 });
  texto(c, 'VOYAGER 1', X4 + 110, yV - 90, F.ui(40, 600), COR.ciano, { alinhar: 'left', esp: 3 });
  c.globalAlpha = alfa;
  const ida = seg(t, M.sinal_sai, M.chega), volta = seg(t, M.resposta_sai, M.volta);
  const y0 = yE - 55, y1 = yV + 80;
  // frentes de onda (ida: ciano, a partir da Terra; volta: amarelo, a partir da Voyager) — velocidade constante, como a da luz
  const ondas = (cx: number, cy: number, dirY: number, prog: number, cor: readonly number[], L: number) => {
    const R = prog * L;
    for (let i = 0; i < 7; i++) {
      const r = R - i * 38; if (r <= 4) continue;
      const a = (1 - i / 7) * (prog < 1 ? 1 : 1 - seg(t, (dirY < 0 ? M.chega : M.volta), (dirY < 0 ? M.chega : M.volta) + 0.5));
      c.strokeStyle = rgba(cor, 0.85 * a); c.lineWidth = 4 - i * 0.4;
      const ang = Math.min(0.2, 70 / r); c.beginPath(); c.arc(cx, cy, r, dirY < 0 ? -Math.PI / 2 - ang : Math.PI / 2 - ang, dirY < 0 ? -Math.PI / 2 + ang : Math.PI / 2 + ang); c.stroke();
    }
    // traço já percorrido
    c.strokeStyle = rgba(cor, 0.9); c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy + dirY * R); c.stroke();
  };
  if (t >= M.sinal_sai && t < M.clima) ondas(X4, y0, -1, ida, RGB.ciano, y0 - y1);
  if (t >= M.resposta_sai && t < M.clima) ondas(X4, y1, 1, volta, RGB.amarelo, y0 - y1);
  // chegada: anel na Voyager / na Terra
  const anel = (x: number, y: number, t0: number, cor: readonly number[]) => { const k = seg(t, t0, t0 + 0.6); if (k <= 0 || k >= 1) return; c.strokeStyle = rgba(cor, 1 - k); c.lineWidth = 4; c.beginPath(); c.arc(x, y, 30 + 110 * eOut3(k), 0, Math.PI * 2); c.stroke(); };
  anel(X4, yV, M.chega, RGB.ciano); anel(X4, yE, M.volta, RGB.amarelo);
  // coluna da direita: velocidade, contador e resultados
  const XC = 735;
  const kLuz = seg(t, M.luz - 0.1, M.luz + 0.2);
  textoFenda(c, 'VELOCIDADE DA LUZ', XC, 710, F.ui(34, 500), rgba(RGB.branco, 0.7), kLuz, { esp: 4, alt: 40 });
  textoFenda(c, '≈ 300 mil km/s', XC, 762, F.ui(44, 600), COR.branco, kLuz, { alt: 50 });
  const kC = seg(t, M.sinal_sai - 0.3, M.sinal_sai);
  const hrs = t < M.resposta_sai ? 24 * ida : 24 + 24 * volta;
  const hh = Math.floor(hrs + 1e-6), mm = Math.floor((hrs * 60) % 60), ss = Math.floor((hrs * 3600) % 60);
  const s = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  textoFenda(c, 'TEMPO DO SINAL', XC, 860, F.ui(34, 500), rgba(RGB.branco, 0.7), kC, { esp: 4, alt: 40 });
  textoFenda(c, s, XC, 950, F.ui(88, 600), t >= M.resposta_sai ? COR.amarelo : COR.ciano, kC, { alt: 95 });
  textoFenda(c, '24 h PARA IR', XC, 1045, F.titulo(52, 800), COR.ciano, seg(t, M.chega, M.chega + 0.25), { alt: 60 });
  textoFenda(c, '24 h PARA VOLTAR', XC, 1110, F.titulo(52, 800), COR.amarelo, seg(t, M.volta, M.volta + 0.25), { alt: 60 });
  const k48 = seg(t, M.volta + 0.3, M.volta + 0.55);
  if (k48 > 0) { c.fillStyle = rgba(RGB.branco, 0.5 * k48); c.fillRect(XC - 190, 1140, 380 * eOut3(k48), 2); }
  textoFenda(c, '48 h IDA E VOLTA', XC, 1205, F.titulo(52, 800), COR.branco, k48, { alt: 60 });
  // resposta hipotética
  const kR = seg(t, M.resposta - 0.1, M.resposta + 0.2) * (1 - seg(t, M.volta + 0.2, M.volta + 0.6));
  if (kR > 0) {
    textoFenda(c, 'RESPOSTA HIPOTÉTICA', X4 + 110, yV - 20, F.ui(34, 600), COR.amarelo, kR, { alinhar: 'left', esp: 2, alt: 40 });
    textoFenda(c, 'supondo resposta imediata', X4 + 110, yV + 22, F.ui(30, 400), rgba(RGB.branco, 0.75), kR, { alinhar: 'left', alt: 40 });
  }
  c.restore();
}

// ------------------------------------------------------------------ CENA 5 — o problema de comunicação (representação didática)
const PAC = (() => { const r = mulberry32(14); const a: { s: number; w: number; h: number }[] = []; let s = 34.0; while (s < 39) { a.push({ s, w: 10 + r() * 22, h: 16 + r() * 40 }); s += 0.06 + r() * 0.12; } return a; })();
export function cena5(c: Ctx, e: Espaco, t: number, dy = 0) {
  // fundo: mesmas estrelas, mais escuras e frias
  const frio = eInOut3(seg(t, M.clima - 0.1, M.clima + 0.9));
  e.camera.position.set(0, 0, 0); e.camera.fov = 34; e.camera.updateProjectionMatrix(); e.centro(960);
  e.camera.lookAt(new THREE.Vector3(-0.3, 0.2, 1).normalize()); e.camera.rotateZ(0.05 + 0.01 * t); e.camera.rotateX(-dy / H * 0.6);
  e.render({ estrelas: lerp(1, 0.55, frio), via: lerp(1.1, 0.4, frio) });
  c.drawImage(e.canvas, 0, 0);
  c.fillStyle = `rgba(6,10,22,${0.35 * frio})`; c.fillRect(0, 0, W, H);
  // o diagrama do sinal esfria e desce, apagando-se
  const kd = seg(t, M.clima, 34.4);
  if (kd < 1) { c.save(); c.translate(0, 120 * eIn3(kd)); diagramaSinal(c, Math.min(t, M.clima - 0.01), lerp(1, 0.3, Math.min(1, kd * 3)) * (1 - seg(t, 33.4, 34.4))); c.restore(); }
  c.save(); c.translate(0, dy);
  // data
  const [nov] = palavra('novembro', 1);
  textoFenda(c, '14', 360, 470, F.tituloX(210, 900), COR.branco, seg(t, M.data_14 - 0.03, M.data_14 + 0.22), { alinhar: 'right', alt: 190 });
  textoFenda(c, 'NOVEMBRO', 395, 395, F.tituloX(70, 800), COR.branco, seg(t, nov - 0.03, nov + 0.22), { alinhar: 'left', esp: 6, alt: 80 });
  textoFenda(c, '2026', 395, 470, F.tituloX(70, 800), COR.amarelo, seg(t, nov + 0.1, nov + 0.35), { alinhar: 'left', esp: 6, alt: 80 });
  const kDid = seg(t, M.transmitir - 0.6, M.transmitir - 0.3);
  textoFenda(c, 'REPRESENTAÇÃO DIDÁTICA', 540, 585, F.ui(30, 500), rgba(RGB.branco, 0.55), kDid, { esp: 8, alt: 36 });
  // linha 1 — dados científicos e de engenharia
  const k1 = seg(t, M.transmitir - 0.6, M.transmitir - 0.2), XA = 110, XB = 970;
  if (k1 > 0) {
    c.save(); c.globalAlpha = k1;
    texto(c, 'DADOS CIENTÍFICOS', XA, 676, F.ui(42, 600), COR.branco, { alinhar: 'left', esp: 2 });
    texto(c, 'E DE ENGENHARIA', XA, 726, F.ui(42, 600), COR.branco, { alinhar: 'left', esp: 2 });
    const parou = t >= M.dados + 0.25;
    texto(c, parou ? 'NÃO RECEBIDOS' : 'RECEBENDO', XB, 704, F.ui(38, 600), parou ? COR.amarelo : rgba(RGB.branco, 0.55), { alinhar: 'right', esp: 3 });
    c.strokeStyle = rgba(RGB.branco, 0.22); c.lineWidth = 2; c.beginPath(); c.moveTo(XA, 840); c.lineTo(XB, 840); c.stroke();
    c.save(); c.beginPath(); c.rect(XA, 750, XB - XA, 92); c.clip();
    for (const p of PAC) {                          // pacotes param de chegar no instante "dados"; os que já vinham escoam
      if (p.s > M.dados) break;
      const x = XB - (t - p.s) * 330; if (x < XA - 40 || x > XB) continue;
      c.fillStyle = rgba(RGB.ciano, 0.8); c.fillRect(x, 840 - p.h, p.w, p.h);
    }
    c.restore();
    const kv = seg(t, M.dados + 2.6, M.dados + 3.0);
    if (kv > 0) texto(c, '— sem dados —', 540, 812, F.ui(30, 500), rgba(RGB.branco, 0.5 * kv), { esp: 4 });
    c.restore();
  }
  // linha 2 — portadora (sinal de rádio) detectada
  const k2 = seg(t, M.sinal_ok - 0.35, M.sinal_ok + 0.05);
  if (k2 > 0) {
    c.save(); c.globalAlpha = k2;
    texto(c, 'SINAL DE RÁDIO', XA, 926, F.ui(42, 600), COR.branco, { alinhar: 'left', esp: 2 });
    texto(c, '(PORTADORA)', XA, 976, F.ui(42, 600), COR.branco, { alinhar: 'left', esp: 2 });
    texto(c, 'DETECTADO', XB, 954, F.ui(38, 600), COR.ciano, { alinhar: 'right', esp: 3 });
    c.strokeStyle = rgba(RGB.branco, 0.22); c.lineWidth = 2; c.beginPath(); c.moveTo(XA, 1110); c.lineTo(XB, 1110); c.stroke();
    c.strokeStyle = COR.ciano; c.lineWidth = 2.5; c.beginPath();
    const pico = 120 * (0.85 + 0.15 * Math.sin(t * 7)) * eOut3(seg(t, M.sinal_ok, M.sinal_ok + 0.4));
    for (let x = XA; x <= XB; x += 3) {
      const ru = 6 + 5 * ruido1(x * 0.09 + Math.floor(t * 30) * 0.7, 3), g = pico * Math.exp(-((x - 540) ** 2) / (2 * 7 ** 2));
      const y = 1108 - ru - g; x === XA ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke(); c.restore();
  }
  // investigação
  const k3 = seg(t, M.engenheiros - 0.1, M.engenheiros + 0.25);
  textoFenda(c, 'CAUSA EM INVESTIGAÇÃO', 540, 1200, F.ui(40, 600), COR.branco, k3, { esp: 4, alt: 46 });
  textoFenda(c, 'situação em 19/11/2026 · fonte: NASA/JPL', 540, 1252, F.ui(30, 400), rgba(RGB.branco, 0.6), seg(t, M.engenheiros + 0.2, M.engenheiros + 0.45), { alt: 36 });
  c.restore();
}
