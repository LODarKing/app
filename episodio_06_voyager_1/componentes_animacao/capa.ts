// Capa 9:16 (1080×1920) com o essencial na faixa 4:5 (y 285–1635), que é o que aparece no feed/grade.
// A Voyager 1 em 3D, iluminada de frente, emite um sinal em direção à Terra (canto inferior esquerdo);
// título assimétrico à esquerda: 48 HORAS / PARA UMA RESPOSTA. Sem moldura, sem etiquetas de canto.
import * as THREE from 'three';
import { W, H, COR, RGB, rgba, F, texto, largura, Ctx } from './core';
import type { Espaco } from './espaco3d';
import { getVoyager } from './cenas_abertura';
import { SPR } from './cenas_meio';

export function capa(c: Ctx, e: Espaco) {
  c.fillStyle = COR.fundo; c.fillRect(0, 0, W, H);
  // sonda inteira, em 3/4 de frente, no centro-alto
  const az = 146 * Math.PI / 180, el = 14 * Math.PI / 180, R = 27, alvo = new THREE.Vector3(0.9, 0.9, -0.6);
  e.camera.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R, -Math.cos(az) * Math.cos(el) * R).add(alvo);
  e.camera.fov = 38; e.camera.updateProjectionMatrix(); e.camera.up.set(0, 1, 0);
  const ox = 2 * (W / 2 - 610), oy = 2 * (H / 2 - 700);
  e.camera.setViewOffset(W + Math.abs(ox), H + Math.abs(oy), ox > 0 ? ox : 0, oy > 0 ? oy : 0, W, H);
  e.camera.lookAt(alvo); e.camera.rotateZ(-0.12);
  e.solDir.set(0, 0, 1); e.sol.intensity = 3.4; e.apoio.intensity = 0.55; e.preenche.intensity = 0.1;
  e.render({ estrelas: 1.15, via: 1.5, extra: [getVoyager()] });
  c.drawImage(e.canvas, 0, 0);
  // a Terra, pequena, no alto à esquerda: o sinal sobe da antena até ela (1 dia-luz)
  const xt = 150, yt = 400;
  c.drawImage(SPR.terra, xt - 40, yt - 40, 80, 80);
  texto(c, 'TERRA', xt, yt + 82, F.ui(30, 600), rgba(RGB.branco, 0.8), { esp: 4 });
  const p = e.proj(new THREE.Vector3(0, 0, 0.6)), ang = Math.atan2(yt - p.y, xt - p.x), dist = Math.hypot(yt - p.y, xt - p.x);
  c.setLineDash([3, 14]); c.strokeStyle = rgba(RGB.ciano, 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(xt + Math.cos(ang + Math.PI) * 50, yt + Math.sin(ang + Math.PI) * 50); c.stroke(); c.setLineDash([]);
  for (let i = 0; i < 9; i++) {
    const r = 230 + i * 34; if (r > dist - 70) break;
    c.strokeStyle = rgba(RGB.ciano, 0.9 * (1 - i / 9)); c.lineWidth = 6 - i * 0.5;
    c.beginPath(); c.arc(p.x, p.y, r, ang - 0.13, ang + 0.13); c.stroke();
  }
  // escurece só a área do título
  const g = c.createLinearGradient(0, 900, 0, 1660); g.addColorStop(0, 'rgba(9,14,26,0)'); g.addColorStop(0.35, 'rgba(9,14,26,0.6)'); g.addColorStop(1, 'rgba(9,14,26,0.8)');
  c.fillStyle = g; c.fillRect(0, 900, W, 760);
  // título
  const X = 78, f48 = F.tituloX(250, 900), w48 = largura(c, '48', f48);
  c.shadowColor = 'rgba(5,8,16,0.85)'; c.shadowBlur = 24;
  texto(c, '48', X - 6, 1200, f48, COR.amarelo, { alinhar: 'left' });
  texto(c, 'HORAS', X + w48 + 20, 1200, F.tituloX(104, 900), COR.branco, { alinhar: 'left', esp: 1 });
  texto(c, 'PARA UMA RESPOSTA', X, 1290, F.titulo(70, 800), COR.branco, { alinhar: 'left', esp: 1 });
  c.shadowBlur = 0;
  c.fillStyle = COR.ciano; c.fillRect(X, 1340, 120, 6);
  texto(c, 'VOYAGER 1', X, 1418, F.ui(44, 600), COR.ciano, { alinhar: 'left', esp: 3 });
  const wv = largura(c, 'VOYAGER 1', F.ui(44, 600), 3);
  texto(c, ' · 1 DIA-LUZ DA TERRA', X + wv, 1418, F.ui(44, 600), COR.branco, { alinhar: 'left', esp: 3 });
  texto(c, 'ALÉM DO VISÍVEL · EP. 06', X, 1560, F.ui(30, 500), rgba(RGB.branco, 0.6), { alinhar: 'left', esp: 6 });
}
