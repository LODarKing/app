// Cenas 1–3 (abertura): a mensagem, o contador de 48 horas, a saída da Terra e a revelação da Voyager 1.
// Cada função recebe t (s) e desenha o quadro — sem estado entre quadros.
import * as THREE from 'three';
import { W, H, M, COR, RGB, rgba, F, seg, lerp, clamp, eOut3, eOut5, eIn3, eInExpo, eInOut3, eInOutSine, mola, texto, textoFenda, largura, Ctx, palavra } from './core';
import type { Espaco } from './espaco3d';

const MSG = 'Olá. Você está aí?';
const CY = 930;                                  // centro óptico da abertura (o "48" e o ponto luminoso)

// ------------------------------------------------------------------ CENA 1 — a mensagem e as 48 horas
export function cena1(c: Ctx, e: Espaco, t: number) {
  // fundo: estrelas muito discretas atrás da interface (o espaço já está lá)
  e.camera.position.set(0, 0, 0); e.camera.fov = 30; e.camera.updateProjectionMatrix(); e.centro(CY);
  e.camera.lookAt(new THREE.Vector3(0.25, 0.12, 1).normalize());
  e.camera.rotateZ(0.02 * t);
  const fundoEstrelas = 0.22 + 0.5 * seg(t, M.colapso, M.ponto + 0.2);
  e.render({ estrelas: fundoEstrelas, via: 0.35 + 0.4 * seg(t, M.colapso, M.ponto + 0.3) });
  c.drawImage(e.canvas, 0, 0);

  // empurrão da câmera para dentro do número (a partir de "dias") e colapso em ponto
  const push = eInOutSine(seg(t, M.push48 - 0.1, M.colapso)) * 0.32;
  const kc = eInExpo(seg(t, M.colapso, M.ponto));
  const esc = (1 + push) * (1 - kc * 0.999);
  c.save(); c.translate(540, CY); c.scale(esc, esc); c.translate(-540, -CY);

  // interface: linha de digitação + botão de envio
  const kUi = eOut5(seg(t, 0.0, 0.3));
  // gancho: a câmera já começa em movimento, bem perto da linha de digitação, e recua até enquadrar a conversa
  const abre = 1 + 0.75 * (1 - eOut3(seg(t, 0, 2.0)));
  c.save(); c.translate(320, 700); c.scale(abre, abre); c.rotate(-0.03 * (1 - eOut3(seg(t, 0, 1.9)))); c.translate(-320, -700);
  const yLinha = 700 + (1 - kUi) * 30;
  const n = Math.min(MSG.length, Math.floor(Math.max(0, t - M.digitar) / 0.074 * 1.6) + (t >= M.digitar ? 1 : 0));
  const enviado = t >= M.enviar, kEnv = eOut5(seg(t, M.enviar, M.enviar + 0.45));
  const sobe = eIn3(seg(t, M.h48 - 0.02, M.h48 + 0.34)) * 900;
  c.save(); c.translate(0, -sobe);
  // linha
  c.strokeStyle = rgba(RGB.branco, 0.28); c.lineWidth = 2; c.beginPath(); c.moveTo(130, yLinha + 28); c.lineTo(130 + 820 * kUi, yLinha + 28); c.stroke();
  const digitado = enviado ? '' : MSG.slice(0, n);
  texto(c, digitado, 140, yLinha, F.ui(58, 500), COR.branco, { alinhar: 'left' });
  const xc = 140 + largura(c, digitado, F.ui(58, 500)) + 8;
  if (Math.floor(t * 2.4) % 2 === 0 || (!enviado && n < MSG.length)) { c.fillStyle = COR.ciano; c.fillRect(xc, yLinha - 44, 4, 54); }
  // botão de envio (aperta no envio)
  const kb = t < M.enviar ? 1 : 1 - 0.18 * Math.sin(Math.PI * seg(t, M.enviar, M.enviar + 0.18));
  c.save(); c.translate(905, yLinha - 16); c.scale(kb * kUi, kb * kUi);
  c.fillStyle = n >= MSG.length || enviado ? COR.ciano : rgba(RGB.branco, 0.18); c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill();
  c.strokeStyle = COR.fundo; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, 16); c.lineTo(0, -16); c.moveTo(-13, -3); c.lineTo(0, -16); c.lineTo(13, -3); c.stroke(); c.restore();
  // balão enviado: sobe da linha e assenta à direita
  if (enviado) {
    const fs = F.ui(50, 500), tw = largura(c, MSG, fs), bw = tw + 72, bh = 102;
    const bx = lerp(140 - 36, 950 - bw, kEnv), by = lerp(yLinha - 66, 470, kEnv);
    c.fillStyle = rgba(RGB.ciano, 0.16); c.strokeStyle = COR.ciano; c.lineWidth = 2.5;
    c.beginPath(); (c as any).roundRect(bx, by, bw, bh, [34, 34, 8, 34]); c.fill(); c.stroke();
    texto(c, MSG, bx + 36, by + 67, fs, COR.branco, { alinhar: 'left' });
    // a mensagem parte: um traço de sinal sobe do balão e sai do quadro
    const kv = seg(t, M.enviar + 0.12, M.enviar + 0.75);
    if (kv > 0 && kv < 1) {
      const x = bx + bw - 40, y0 = by, yc = lerp(y0, -80, eIn3(kv)), yr = lerp(y0, -80, eIn3(Math.max(0, kv - 0.25) / 0.75));
      const gr = c.createLinearGradient(0, yr, 0, yc); gr.addColorStop(0, rgba(RGB.ciano, 0)); gr.addColorStop(1, rgba(RGB.ciano, 0.95));
      c.strokeStyle = gr; c.lineWidth = 4; c.beginPath(); c.moveTo(x, yr); c.lineTo(x, yc); c.stroke();
      c.fillStyle = COR.branco; c.beginPath(); c.arc(x, yc, 6, 0, Math.PI * 2); c.fill();
    }
    const ks = seg(t, M.enviar + 0.25, M.enviar + 0.5);
    if (ks > 0) texto(c, 'ENVIADA  ✓', bx + bw, by + bh + 48, F.ui(34, 500), rgba(RGB.ciano, 0.9 * ks), { alinhar: 'right', esp: 4 });
  }
  c.restore(); c.restore();

  // relógio: rótulo + contador + régua 0–48 h
  if (t >= M.relogio) {
    const kr = seg(t, M.relogio, M.relogio + 0.35);
    const sai = seg(t, M.h48 + 0.03, M.h48 + 0.15);            // o contador desce pela fenda quando vira "48 HORAS"
    const hrs = 48 * Math.pow(seg(t, M.conta_ini, M.h48), 2.3);
    const hh = Math.floor(hrs), mm = Math.floor((hrs * 60) % 60), ss = Math.floor((hrs * 3600) % 60);
    const s = t >= M.h48 ? '48:00:00' : `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    c.save(); c.translate(0, -sobe);
    textoFenda(c, 'AGUARDANDO RESPOSTA', 540, 838, F.ui(40, 500), rgba(RGB.branco, 0.78), kr, { esp: 7, alt: 60 });
    c.restore();
    if (sai < 1) {
      c.save(); c.beginPath(); c.rect(0, 860, W, 200); c.clip();
      const punch = 1 + 0.06 * Math.sin(Math.PI * seg(t, M.h48, M.h48 + 0.12));
      c.translate(540, 1010 + eIn3(sai) * 190); c.scale(punch, punch);
      textoFenda(c, s, 0, 0, F.ui(150, 600), t >= M.h48 ? COR.amarelo : COR.branco, kr, { alt: 150 });
      c.restore();
    }
    // régua de 0 a 48 h que se preenche com o contador
    const kRe = eOut3(seg(t, M.relogio + 0.1, M.relogio + 0.5)) * (1 - seg(t, M.h48 + 0.1, M.h48 + 0.4));
    if (kRe > 0) {
      const x0 = 150, x1 = 930, y = 1130 + eIn3(seg(t, M.h48 + 0.1, M.h48 + 0.4)) * 260, fr = Math.min(1, hrs / 48);
      c.strokeStyle = rgba(RGB.branco, 0.25 * kRe); c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, kRe), y); c.stroke();
      c.strokeStyle = rgba(RGB.amarelo, kRe); c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, fr), y); c.stroke();
      for (let h = 0; h <= 48; h += 6) { const x = lerp(x0, x1, h / 48), big = h % 24 === 0; c.fillStyle = rgba(RGB.branco, (big ? 0.8 : 0.35) * kRe); c.fillRect(x - 1.5, y - (big ? 22 : 12), 3, big ? 44 : 24); }
      for (const [h, lab] of [[0, '0 h'], [24, '24 h'], [48, '48 h']] as [number, string][]) texto(c, lab, lerp(x0, x1, h / 48), y + 68, F.ui(34, 500), rgba(RGB.branco, 0.6 * kRe), { esp: 2 });
    }
    // 48 HORAS
    if (t >= M.h48) {
      const k48 = seg(t, M.h48 + 0.12, M.h48 + 0.36);
      const comp = 1 - 0.35 * eInExpo(seg(t, M.colapso, M.ponto));
      c.save(); c.translate(540, CY + 70); c.scale(1, comp);
      textoFenda(c, '48', 0, 0, F.tituloX(400, 900), COR.amarelo, k48, { alt: 330 });
      textoFenda(c, 'HORAS', 0, 150, F.tituloX(104, 800), COR.branco, seg(t, M.push48 - 0.05, M.push48 + 0.25), { esp: 24, alt: 110 });
      c.restore();
    }
  }
  c.restore();
  // o número vira um ponto de luz (no espaço, não na interface)
  if (t >= M.colapso + 0.2) pontoLuz(c, 540, CY, seg(t, M.colapso + 0.2, M.ponto) * (1 - seg(t, M.terra + 0.15, M.terra + 0.4)), t);
}

function pontoLuz(c: Ctx, x: number, y: number, k: number, t: number) {
  if (k <= 0) return;
  const r = 7 + 2 * Math.sin(t * 9);
  const g = c.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(235,245,255,${k})`); g.addColorStop(0.22, `rgba(160,210,255,${0.6 * k})`); g.addColorStop(1, 'rgba(120,180,255,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 4, 0, Math.PI * 2); c.fill();
}

// ------------------------------------------------------------------ CENA 2 — o ponto é a Terra; a câmera se afasta
const DIR_CAM = new THREE.Vector3(0.22, 0.16, 1).normalize();
const rotCam = (t: number) => 0.18 * seg(t, M.ponto, M.voyager);
// a Lua fica quase na linha de recuo da câmera (no instante da passagem), a 60,3 raios terrestres (384 400 km)
const LUA_POS = DIR_CAM.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotCam(M.lua + 0.8)).add(new THREE.Vector3(-0.026, 0.024, 0)).normalize().multiplyScalar(60.3);   // 384 400 km = 60,3 raios terrestres
export function distCena2(t: number) {
  // aproximação exponencial até a Terra (ponto -> disco), pausa curta, afastamento cada vez mais rápido
  const a = Math.log(60000), b = Math.log(4.4), z = Math.log(14000);
  if (t < M.terra + 0.42) return Math.exp(lerp(a, b, eOut5(seg(t, M.ponto - 0.05, M.terra + 0.42))));
  const t1 = M.afasta + 0.3, t2 = M.lua + 0.3, t3 = M.lua + 1.3, t4 = M.voyager - 0.04;
  const l1 = Math.log(48), l2 = Math.log(140);
  if (t < t2) return Math.exp(lerp(b, l1, eIn3(seg(t, t1, t2)) * 0.6 + seg(t, t1, t2) * 0.4));
  if (t < t3) return Math.exp(lerp(l1, l2, seg(t, t2, t3)));
  return Math.exp(lerp(l2, z, Math.pow(seg(t, t3, t4), 1.6)));
}
export function cena2(c: Ctx, e: Espaco, t: number) {
  const d = distCena2(t);
  const rot = rotCam(t);
  const dir = DIR_CAM.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
  e.camera.position.copy(dir).multiplyScalar(d); e.camera.fov = 30; e.camera.updateProjectionMatrix(); e.centro(CY);
  e.camera.up.set(0, 1, 0); e.camera.lookAt(0, 0, 0); e.camera.rotateZ(-0.05 - 0.04 * seg(t, M.afasta, M.voyager));
  e.solDir.set(1.0, 0.25, 0.75).normalize();
  e.terra.rotation.set(0.35, 6.1 + t * 0.03, 0);       // América do Sul voltada para a câmera e.terraMat.uniforms.uNuvem.value = t * 0.03;
  e.lua.position.copy(LUA_POS); e.lua.rotation.y = 1.0;
  const vel = seg(t, M.afasta + 0.4, M.afasta + 1.0);
  e.render({ estrelas: 0.72 + 0.28 * seg(t, M.terra, M.voyager), via: 0.75 + 0.25 * seg(t, M.terra, M.voyager), poeira: vel * 1.0, poeiraCaixa: Math.max(8, d * 0.9), terra: true, lua: true });
  c.drawImage(e.canvas, 0, 0);
  pontoLuz(c, 540, CY, (1 - seg(t, M.terra - 0.05, M.terra + 0.3)), t);
  // rótulos ancorados nos objetos (somente quando ficam pequenos) e hodômetro em km reais
  const pT = e.proj(new THREE.Vector3(0, 0, 0)), pL = e.proj(LUA_POS);
  const kRot = seg(t, M.lua + 0.2, M.lua + 0.5) * (1 - seg(t, M.voyager - 0.35, M.voyager - 0.1));
  rotulo(c, pT.x, pT.y, 'TERRA', kRot, 1);
  if (pL.frente && d > 66) rotulo(c, pL.x, pL.y, 'LUA', kRot * seg(d, 66, 80), -1);
  const kOd = (t > M.afasta ? seg(d, 18, 28) : 0) * (1 - seg(t, M.voyager - 0.2, M.voyager - 0.05));
  if (kOd > 0) {
    const km = Math.max(0, (d - 1) * 6371);
    const s = km < 1e6 ? Math.round(km / 100) * 100 : Math.round(km / 1e4) * 1e4;
    textoFenda(c, 'DISTÂNCIA DA TERRA', 540, 1135, F.ui(38, 500), rgba(RGB.branco, 0.7), kOd, { esp: 6, alt: 44 });
    textoFenda(c, s.toLocaleString('pt-BR') + ' km', 540, 1215, F.ui(72, 600), COR.branco, kOd, { alt: 84 });
  }
}
function rotulo(c: Ctx, x: number, y: number, s: string, k: number, lado: number) {
  if (k <= 0) return;
  const L = 70 * eOut3(k), x2 = x + lado * (26 + L), y2 = y - 26 - L * 0.5;
  c.strokeStyle = rgba(RGB.branco, 0.6 * k); c.lineWidth = 2; c.beginPath(); c.moveTo(x + lado * 12, y - 10); c.lineTo(x2, y2); c.lineTo(x2 + lado * 24, y2); c.stroke();
  texto(c, s, x2 + lado * 34, y2 + 12, F.ui(38, 500), rgba(RGB.branco, 0.85 * k), { alinhar: lado > 0 ? 'left' : 'right', esp: 5 });
}

// ------------------------------------------------------------------ CENA 3 — a Voyager 1 e o marco
let VOY: THREE.Group | null = null;
export function setVoyager(v: THREE.Group) { VOY = v; }
export const getVoyager = () => VOY!;
const CV = 1020;                                  // centro óptico da sonda nesta cena
export function cameraVoyager(e: Espaco, t: number) {
  // começa quase atrás da sonda (contraluz: o Sol e a Terra estão no eixo da antena, +Z) e orbita para o lado
  const k = seg(t, M.voyager - 0.04, M.recuo);
  const az = lerp(1.2, 125, eInOut3(k) * 0.85 + k * 0.15) * Math.PI / 180, el = lerp(8, 17, k) * Math.PI / 180;
  const R = lerp(33, 30, eOut3(k));
  const alvo = new THREE.Vector3(0.15, 0.35, -0.6);
  e.camera.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R, -Math.cos(az) * Math.cos(el) * R).add(alvo);
  e.camera.fov = 34; e.camera.updateProjectionMatrix(); e.centro(CV); e.camera.up.set(0, 1, 0); e.camera.lookAt(alvo); e.camera.rotateZ(0.08 - 0.05 * k);
}
export function cena3(c: Ctx, e: Espaco, t: number) {
  cameraVoyager(e, t);
  e.solDir.set(0, 0, 1);
  const kLuz = seg(t, M.voyager - 0.04, M.voyager + 0.5);
  e.sol.intensity = lerp(0.6, 3.4, eOut3(kLuz)); e.preenche.intensity = 0.06 + 0.1 * seg(t, M.luz_sonda, M.marco);
  e.apoio.intensity = lerp(0.38, 0.6, seg(t, M.data_18, M.marco));
  e.render({ estrelas: 1, via: 1.15, extra: [VOY!] });
  c.drawImage(e.canvas, 0, 0);
  // o Sol, visto de 173 UA: uma estrela muito brilhante — aparece quando sai de trás do prato
  const ps = e.proj(e.camera.position.clone().add(new THREE.Vector3(0, 0, 1e5)));
  const cam = e.camera.position, ocl = Math.hypot(cam.x, cam.y) < 1.83 && cam.z < 0;
  const kSol = ocl ? 0 : seg(Math.hypot(cam.x, cam.y), 1.83, 2.6);
  if (kSol > 0 && ps.frente) estrelaSol(c, ps.x, ps.y, kSol);
  // data em tipografia cinética (cada parte no tempo da palavra)
  const sai = eIn3(seg(t, M.recuo - 0.25, M.recuo + 0.15));
  c.save(); c.translate(0, -sai * 520);
  textoFenda(c, '18', 540, 470, F.tituloX(320, 900), COR.branco, seg(t, M.data_18 - 0.03, M.data_18 + 0.22), { alt: 270 });
  textoFenda(c, 'NOVEMBRO', 540, 600, F.tituloX(88, 800), COR.branco, seg(t, M.data_nov - 0.03, M.data_nov + 0.22), { esp: 16, alt: 100 });
  textoFenda(c, '2026', 540, 790, F.tituloX(190, 900), COR.amarelo, seg(t, M.data_2026 - 0.03, M.data_2026 + 0.22), { alt: 170 });
  // régua do marco: traço com divisões que corre até um marcador
  const kR = eOut3(seg(t, M.luz_sonda, M.marco + 0.1));
  if (kR > 0) {
    const x0 = 170, x1 = 910, y = 862, xe = lerp(x0, x1, kR);
    c.strokeStyle = rgba(RGB.amarelo, 0.9); c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(xe, y); c.stroke();
    for (let i = 0; i <= 20; i++) { const x = lerp(x0, x1, i / 20); if (x > xe) break; c.fillStyle = rgba(RGB.amarelo, i % 5 === 0 ? 0.9 : 0.45); c.fillRect(x - 1.5, y - (i % 5 === 0 ? 16 : 9), 3, i % 5 === 0 ? 16 : 9); }
    const km = mola(seg(t, M.marco, M.marco + 0.6));
    if (km > 0) { c.fillStyle = COR.amarelo; c.beginPath(); c.moveTo(x1, y - 4); c.lineTo(x1 - 16 * km, y - 4 - 30 * km); c.lineTo(x1 + 16 * km, y - 4 - 30 * km); c.closePath(); c.fill(); }
  }
  c.restore();
}
function estrelaSol(c: Ctx, x: number, y: number, k: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, 70); g.addColorStop(0, `rgba(255,252,240,${k})`); g.addColorStop(0.08, `rgba(255,240,210,${0.85 * k})`); g.addColorStop(0.3, `rgba(255,220,170,${0.18 * k})`); g.addColorStop(1, 'rgba(255,220,170,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, 70, 0, Math.PI * 2); c.fill();
  c.strokeStyle = `rgba(255,245,225,${0.45 * k})`; c.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4 + 0.3, L = i % 2 ? 60 : 110; c.beginPath(); c.moveTo(x - Math.cos(a) * L, y - Math.sin(a) * L); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); }
}
