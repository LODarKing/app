// Cenas 6–7: a linha do tempo (1977 -> 2026) e a imensidão, com a assinatura do canal.
import * as THREE from 'three';
import { W, H, M, COR, RGB, rgba, F, seg, lerp, eOut3, eOut5, eIn3, eInOut3, eInOutSine, mola, texto, textoFenda, Ctx } from './core';
import type { Espaco } from './espaco3d';
import { SPR, cena5 } from './cenas_meio';
import { getVoyager } from './cenas_abertura';

const img = (c: Ctx, s: HTMLCanvasElement, x: number, y: number, larg: number, a = 1, rot = 0) => {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.drawImage(s, -larg / 2, -larg / 2, larg, larg); c.restore();
};

// ------------------------------------------------------------------ CENA 6 — linha do tempo vertical; a sonda sobe pelo eixo
type No = { y: number; ano: string; nome: string; t: number };
const XA = 150;                                                   // eixo do tempo
const NOS: No[] = [
  { y: 1170, ano: '1977', nome: 'LANÇAMENTO', t: M.ano_1977 },
  { y: 975, ano: '1979', nome: 'JÚPITER', t: M.jupiter },
  { y: 780, ano: '1980', nome: 'SATURNO', t: M.saturno },
  { y: 560, ano: '2012', nome: 'ESPAÇO INTERESTELAR', t: M.ano_2012 },
  { y: 340, ano: '2026', nome: '1 DIA-LUZ DA TERRA', t: M.interestelar - 0.15 },
];
// a sonda chega a cada ano: 1977 na fala, Júpiter e Saturno nas falas, 2012 em "interestelar", 2026 logo depois
const PASSA = [M.ano_1977, M.jupiter, M.saturno, M.ano_2012 + 0.45, M.interestelar - 0.15];
function yDe(t: number) {
  if (t <= PASSA[0]) return NOS[0].y;
  for (let i = 0; i < 4; i++) if (t < PASSA[i + 1]) return lerp(NOS[i].y, NOS[i + 1].y, eInOutSine(seg(t, PASSA[i], PASSA[i + 1])));
  return NOS[4].y;
}
export function cena6(c: Ctx, e: Espaco, t: number) {
  const T0 = M.ano_1977 - 0.71, T7 = M.cinquenta - 0.44;          // início desta cena e corte para a cena 7
  const tr = eInOut3(seg(t, T0, T0 + 0.6));                      // panorâmica para cima: a cena 5 sai pelo alto, a 6 entra por baixo
  if (tr < 1) cena5(c, e, Math.min(t, T0 - 0.001), -tr * H);
  else {
    e.camera.position.set(0, 0, 0); e.camera.fov = 34; e.camera.updateProjectionMatrix(); e.centro(960);
    e.camera.lookAt(new THREE.Vector3(-0.3, 0.2, 1).normalize()); e.camera.rotateZ(0.05 + 0.01 * t); e.camera.rotateX(0.6 + 0.02 * (t - T0));
    e.render({ estrelas: 1, via: 1.15 }); c.drawImage(e.canvas, 0, 0);
  }
  const mergulho = eInOut3(seg(t, T7 - 0.45, T7));                // no fim, só a sonda fica e cresce até o enquadramento da cena 7
  const aOut = 1 - eOut3(seg(t, T7 - 0.45, T7 - 0.15));
  c.save(); c.translate(0, (1 - tr) * H);
  const yv = yDe(t);
  c.save(); c.globalAlpha = aOut;
  // eixo: futuro pontilhado, percorrido em ciano
  c.setLineDash([3, 12]); c.strokeStyle = rgba(RGB.branco, 0.3); c.lineWidth = 3; c.beginPath(); c.moveTo(XA, NOS[0].y); c.lineTo(XA, NOS[4].y); c.stroke(); c.setLineDash([]);
  c.strokeStyle = COR.ciano; c.lineWidth = 5; c.beginPath(); c.moveTo(XA, NOS[0].y); c.lineTo(XA, yv); c.stroke();
  // anos ainda não alcançados: já aparecem apagados (a estrutura da jornada fica visível desde o início)
  const kF = eOut3(seg(t, T0 + 0.5, T0 + 1.1));
  NOS.forEach((n, i) => { if (t >= n.t - 0.05 || kF <= 0) return;
    c.fillStyle = rgba(RGB.branco, 0.3 * kF); c.beginPath(); c.arc(XA, n.y, 5, 0, Math.PI * 2); c.fill();
    texto(c, n.ano, XA + 60, n.y + 18, F.tituloX(104, 900), rgba(RGB.branco, 0.13 * kF), { alinhar: 'left' }); });
  NOS.forEach((n, i) => {
    const k = seg(t, n.t - 0.05, n.t + 0.2); if (k <= 0) return;
    const atual = i === 4 || t < (NOS[i + 1]?.t ?? 1e9) - 0.1, a = atual ? 1 : 0.5;
    c.fillStyle = i === 4 ? COR.amarelo : COR.branco; c.beginPath(); c.arc(XA, n.y, 9 * eOut3(k), 0, Math.PI * 2); c.fill();
    c.save(); c.globalAlpha = aOut * a;
    textoFenda(c, n.ano, XA + 60, n.y + 18, F.tituloX(104, 900), i === 4 ? COR.amarelo : COR.branco, k, { alinhar: 'left', alt: 110 });
    textoFenda(c, n.nome, XA + 64, n.y + 66, F.ui(38, 600), i === 3 ? COR.ciano : rgba(RGB.branco, 0.85), seg(t, n.t + 0.1, n.t + 0.35), { alinhar: 'left', esp: 3, alt: 44 });
    c.restore();
  });
  // corpos visitados, à direita de cada ano (entram com mola quando a sonda chega)
  const corpo = (spr: HTMLCanvasElement, y: number, larg: number, t0: number, rot = 0) => { const k = mola(seg(t, t0 - 0.35, t0 + 0.25)); img(c, spr, 880, y + (1 - k) * 40, larg * (0.7 + 0.3 * k), seg(t, t0 - 0.35, t0 - 0.1), rot); };
  corpo(SPR.terra, NOS[0].y - 10, 120, T0 + 0.7); corpo(SPR.jupiter, NOS[1].y - 10, 210, M.jupiter); corpo(SPR.saturno, NOS[2].y - 10, 300, M.saturno, -0.12);
  // heliopausa: fronteira tracejada atravessando a linha de 2012
  const kH = eOut3(seg(t, M.ano_2012 - 0.1, M.ano_2012 + 0.6));
  if (kH > 0) { c.setLineDash([14, 10]); c.strokeStyle = rgba(RGB.ciano, 0.55); c.lineWidth = 2; c.beginPath(); c.moveTo(60, NOS[3].y - 70); c.lineTo(60 + 960 * kH, NOS[3].y - 70); c.stroke(); c.setLineDash([]);
    texto(c, 'HELIOPAUSA', 1020, NOS[3].y - 88, F.ui(28, 500), rgba(RGB.ciano, 0.75 * kH), { alinhar: 'right', esp: 4 }); }
  c.restore();
  // a sonda sobe pelo eixo; no mergulho, cresce até o centro
  const kS = eOut3(seg(t, T0 + 0.35, T0 + 0.8));
  img(c, SPR.voyager, lerp(XA, 540, mergulho), lerp(yv, 1000, mergulho), lerp(170, 1500, eIn3(mergulho)), kS);
  c.restore();
}

// ------------------------------------------------------------------ CENA 7 — a imensidão; assinatura do canal
const CV7 = 600;
export function cena7(c: Ctx, e: Espaco, t: number) {
  const T0 = M.cinquenta - 0.44, k = seg(t, T0, M.marca + 0.6);
  // vista de frente (3/4), com o Sol atrás da câmera iluminando o prato; recuo lento até a sonda virar um ponto
  const az = lerp(150, 165, k) * Math.PI / 180, el = lerp(14, 8, k) * Math.PI / 180;
  const R = 22 * Math.exp(Math.log(95) * (eInOut3(k) * 0.85 + 0.15 * k));
  const alvo = new THREE.Vector3(0.15, 0.35, -0.6);
  e.camera.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R, -Math.cos(az) * Math.cos(el) * R).add(alvo);
  e.camera.fov = 34; e.camera.updateProjectionMatrix(); e.centro(lerp(1000, CV7, eInOut3(k))); e.camera.up.set(0, 1, 0); e.camera.lookAt(alvo); e.camera.rotateZ(-0.12 + 0.08 * k);
  e.solDir.set(0, 0, 1); e.sol.intensity = 3.2; e.apoio.intensity = 0.35; e.preenche.intensity = 0.08;
  e.render({ estrelas: 1, via: 1.2, extra: [getVoyager()] });
  c.drawImage(e.canvas, 0, 0);
  // quando vira um ponto, ganha um marcador discreto para não se perder entre as estrelas
  const kp = seg(k, 0.62, 0.8);
  if (kp > 0) { const p = e.proj(alvo); c.strokeStyle = rgba(RGB.ciano, 0.7 * kp); c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 18, 0, Math.PI * 2); c.stroke(); }
  // frases
  const s1 = 1 - seg(t, M.dia_inteiro - 0.6, M.dia_inteiro - 0.25), s2 = 1 - seg(t, M.marca - 0.45, M.marca - 0.1);
  c.save(); c.globalAlpha = s1;
  textoFenda(c, 'UMA NAVE', 540, 330, F.tituloX(78, 900), COR.branco, seg(t, M.maquina - 0.05, M.maquina + 0.2), { alt: 90, esp: 2 });
  textoFenda(c, 'LANÇADA EM 1977.', 540, 420, F.tituloX(78, 900), COR.branco, seg(t, M.maquina + 0.1, M.maquina + 0.35), { alt: 90, esp: 2 });
  c.restore();
  c.save(); c.globalAlpha = s2;
  textoFenda(c, 'UM DIA-LUZ', 540, 330, F.tituloX(78, 900), COR.amarelo, seg(t, M.dia_inteiro - 0.1, M.dia_inteiro + 0.15), { alt: 90, esp: 2 });
  textoFenda(c, 'DA TERRA.', 540, 420, F.tituloX(78, 900), COR.branco, seg(t, M.dia_inteiro + 0.05, M.dia_inteiro + 0.3), { alt: 90, esp: 2 });
  c.restore();
  // assinatura do canal: ALÉM DO VISÍVEL / O EXTRAORDINÁRIO ESTÁ NOS DETALHES.
  if (t >= M.marca - 0.1) {
    const p = e.proj(alvo), kl = eOut3(seg(t, M.marca + 0.1, M.marca + 0.7));
    c.strokeStyle = rgba(RGB.ciano, 0.8); c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y + 30); c.lineTo(p.x, p.y + 30 + 150 * kl); c.stroke();
    const [vis] = [M.marca + 0.36];
    textoFenda(c, 'ALÉM DO', 540, 930, F.tituloX(112, 900), COR.branco, seg(t, M.marca - 0.05, M.marca + 0.22), { alt: 120, esp: 10 });
    textoFenda(c, 'VISÍVEL', 540, 1050, F.tituloX(112, 900), COR.branco, seg(t, vis - 0.05, vis + 0.22), { alt: 120, esp: 10 });
    textoFenda(c, 'O EXTRAORDINÁRIO ESTÁ NOS DETALHES.', 540, 1140, F.titulo(44, 700), rgba(RGB.branco, 0.92), seg(t, M.slogan - 0.05, M.slogan + 0.3), { alt: 50, esp: 1 });
  }
}
