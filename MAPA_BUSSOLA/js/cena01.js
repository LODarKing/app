// Cena 1 — HOOK (piloto de 10 s).
// Batidas (96 BPM, 0,625 s): A 0–4 floresta e "você"; B 4–8 o celular perde o sinal; C 8–12 os caminhos e a dúvida; D 12–16 floresta vira mapa + bússola.
'use strict';
const BT = (i) => (typeof BEATS !== 'undefined' && BEATS[i] !== undefined ? BEATS[i] : i * 0.625);

function camS01(t) {
  // A: a câmera mergulha de muito perto para a vista aérea (impacto no quadro 0)
  const kA = eo5(prog(t, 0, 0.95));
  let z = lerp(2.6, 1.06, kA), cx = lerp(-26, 8, kA), cy = lerp(-30, -110, kA), r = lerp(0.2, 0.0, kA);
  z += 0.08 * prog(t, 1.15, 5.0); // deriva lenta
  // C: sobe e recua para revelar a bifurcação
  const kC = eio(prog(t, BT(8) - 0.1, BT(8) + 1.5));
  z = lerp(z, 0.74, kC); cy = lerp(cy, -470, kC); cx = lerp(cx, 10, kC); r = lerp(r, -0.035, kC);
  // D: leve aproximação sobre o mapa
  const kD = eio(prog(t, BT(12), 10));
  z = lerp(z, 0.8, kD); cy = lerp(cy, -430, kD); r = lerp(r, 0, kD);
  return { cx, cy, z, r };
}

// ---------- celular (B) ----------
function drawCelular(ctx, t) {
  const tin = BT(4) - 0.15, tout = BT(8) - 0.05;
  if (t < tin || t > tout + 0.6) return;
  const kin = eback(prog(t, tin, tin + 0.5), 1.1), kout = ei3(prog(t, tout, tout + 0.5));
  const x = lerp(-420, 410, kin) - kout * 900, y = 800 - kout * 120, rot = lerp(-0.22, -0.06, kin) - kout * 0.3;
  const PW = 440, PH = 860;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  // sombra e corpo
  rrect(ctx, -PW / 2 + 22, -PH / 2 + 30, PW, PH, 58); ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fill();
  rrect(ctx, -PW / 2, -PH / 2, PW, PH, 58); ctx.fillStyle = PAL.preto; ctx.fill();
  const SX = -PW / 2 + 16, SY = -PH / 2 + 16, SW = PW - 32, SH = PH - 32;
  ctx.save(); rrect(ctx, SX, SY, SW, SH, 44); ctx.clip();
  // mapa do app (ruas); perde as peças quando o sinal cai
  const semSinal = prog(t, BT(7), BT(7) + 0.25);
  ctx.fillStyle = '#EDEBE4'; ctx.fillRect(SX, SY, SW, SH);
  ctx.save(); ctx.translate(0, 40);
  for (let j = -4; j <= 4; j++) for (let i = -3; i <= 3; i++) {
    const tx = i * 120 - 60, ty = j * 120 - 60, some = hash2(i, j, 3) * 0.6;
    const k = clamp((semSinal * 1.6 - some) * 2.5);
    ctx.fillStyle = k > 0.5 ? '#D9D6CC' : '#F7F5EF'; ctx.fillRect(tx + 6, ty + 6, 108, 108);
    if (k <= 0.5) { ctx.fillStyle = '#E3E8D5'; if (hash2(i, j, 9) > 0.6) ctx.fillRect(tx + 18, ty + 18, 70, 60); }
    else { ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 3; ctx.beginPath(); for (let d = -100; d < 120; d += 24) { ctx.moveTo(tx + 6 + Math.max(0, d), ty + 6 + Math.max(0, -d)); ctx.lineTo(tx + 6 + Math.min(108, 108 + d), ty + 6 + Math.min(108, 108 - d)); } ctx.stroke(); }
  }
  ctx.restore();
  // ponto de localização: a incerteza cresce conforme o sinal cai
  const inc = 26 + 150 * eo3(prog(t, BT(5), BT(7) + 0.3));
  const jx = 18 * (vnoise(t * 3.1, 0.5, 11) - 0.5) * prog(t, BT(5), BT(7)), jy = 18 * (vnoise(t * 2.7, 4.5, 12) - 0.5) * prog(t, BT(5), BT(7));
  ctx.beginPath(); ctx.arc(jx, 60 + jy, inc, 0, 7); ctx.fillStyle = 'rgba(242,194,48,0.18)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,120,10,0.5)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(jx, 60 + jy, 17, 0, 7); ctx.fillStyle = PAL.branco; ctx.fill();
  ctx.beginPath(); ctx.arc(jx, 60 + jy, 11, 0, 7); ctx.fillStyle = semSinal > 0.5 ? '#9A9A92' : PAL.amarelo; ctx.fill();
  // barra de status
  ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fillRect(SX, SY, SW, 86);
  ctx.fillStyle = PAL.preto; font(ctx, 700, 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('9:41', SX + 40, SY + 46);
  // barras de sinal: caem uma a uma nas batidas 5, 6, 7
  const nb = t < BT(5) ? 4 : t < BT(6) ? 3 : t < BT(7) ? 1 : 0;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i < nb ? PAL.preto : 'rgba(0,0,0,0.18)'; ctx.fillRect(SX + SW - 170 + i * 14, SY + 58 - (i + 1) * 7, 9, (i + 1) * 7); }
  // ícone de rede (wi-fi) e de GPS, cortados quando caem
  const icon = (cx, cy, tipo, cortado) => {
    ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = cortado > 0 ? 'rgba(0,0,0,0.35)' : PAL.preto; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 4; ctx.lineCap = 'round';
    if (tipo === 'wifi') { for (const r of [8, 16, 24]) { ctx.beginPath(); ctx.arc(0, 10, r, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 10, 3, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(12, -12); ctx.lineTo(4, 12); ctx.lineTo(1, 1); ctx.closePath(); ctx.fill(); }
    if (cortado > 0) { ctx.strokeStyle = PAL.preto; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-15, -15); ctx.lineTo(-15 + 30 * cortado, -15 + 30 * cortado); ctx.stroke(); }
    ctx.restore();
  };
  icon(SX + SW - 92, SY + 44, 'wifi', eo3(prog(t, BT(5), BT(5) + 0.18)));
  icon(SX + SW - 46, SY + 44, 'gps', eo3(prog(t, BT(6), BT(6) + 0.18)));
  // barra de busca
  rrect(ctx, SX + 26, SY + 108, SW - 52, 74, 37); ctx.fillStyle = PAL.branco; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; ctx.stroke();
  font(ctx, 600, 27); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.textAlign = 'left'; ctx.fillText(t < BT(6) ? 'Calculando rota…' : 'Procurando sinal…', SX + 64, SY + 146);
  // cartão "sem sinal" que sobe de baixo na batida 7
  const kc = eback(prog(t, BT(7), BT(7) + 0.4), 1.2);
  if (kc > 0) {
    const cy0 = lerp(SY + SH + 10, SY + SH - 250, kc);
    rrect(ctx, SX + 22, cy0, SW - 44, 220, 30); ctx.fillStyle = PAL.preto; ctx.fill();
    font(ctx, 800, 44); ctx.fillStyle = PAL.branco; ctx.textAlign = 'left'; ctx.fillText('Sem sinal', SX + 60, cy0 + 72);
    font(ctx, 600, 26); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('GPS indisponível', SX + 60, cy0 + 118); ctx.fillText('Sem internet', SX + 60, cy0 + 154);
    // satélite cortado
    ctx.save(); ctx.translate(SX + SW - 100, cy0 + 100); ctx.rotate(-0.6); ctx.fillStyle = PAL.branco; ctx.fillRect(-10, -14, 20, 28); ctx.fillRect(-46, -9, 30, 18); ctx.fillRect(16, -9, 30, 18); ctx.restore();
    ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(SX + SW - 140, cy0 + 60); ctx.lineTo(SX + SW - 140 + 80 * eo3(prog(t, BT(7) + 0.2, BT(7) + 0.4)), cy0 + 60 + 80 * eo3(prog(t, BT(7) + 0.2, BT(7) + 0.4))); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

// ---------- marcador "você" ----------
function drawVoce(ctx, cam, t, mapa) {
  const [x, y] = MUNDO.proj(cam, 0, 0);
  const k = eback(prog(t, 0, BT(1)), 1.6); // já está caindo no quadro 0 e assenta na batida 1
  const s = lerp(2.6, 1, clamp(k)) * (k > 1 ? k : 1);
  // anel de impacto na batida 1
  const kr = prog(t, BT(1), BT(1) + 0.55);
  if (kr > 0 && kr < 1) { ctx.beginPath(); ctx.arc(x, y, 22 + 90 * eo3(kr), 0, 7); ctx.lineWidth = 5 * (1 - kr); ctx.strokeStyle = mapa ? PAL.preto : PAL.amarelo; ctx.stroke(); }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fillStyle = PAL.preto; ctx.fill();
  ctx.restore();
  // chamada "VOCÊ ESTÁ AQUI" com linha de chamada (some quando o celular entra)
  const kl = eo5(prog(t, BT(2), BT(2) + 0.45)), ko = ei3(prog(t, BT(4) - 0.4, BT(4) - 0.1));
  if (kl > 0 && ko < 1) {
    const L = 110 * kl * (1 - ko);
    ctx.strokeStyle = PAL.branco; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 28, y - 10); ctx.lineTo(x - 28 - L * 0.45, y - 70); ctx.lineTo(x - 28 - L, y - 70); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x - 520, y - 124, 380, 70); ctx.clip();
    font(ctx, 800, 40); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    const dy = (1 - kl) * 70 + ko * 70;
    ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(10,12,11,0.85)'; ctx.strokeText('VOCÊ ESTÁ AQUI', x - 150, y - 70 + 14 + dy);
    ctx.fillStyle = PAL.branco; ctx.fillText('VOCÊ ESTÁ AQUI', x - 150, y - 70 + 14 + dy); ctx.restore();
  }
}

// ---------- caminhos destacados e "?" (C) ----------
const RAMOS = [['esq', 8], ['meio', 9], ['dir', 10]];
function drawCaminhos(ctx, cam, t, mapa) {
  ctx.save(); MUNDO.applyCam(ctx, cam);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [nm, b] of RAMOS) {
    const k = eo3(prog(t, BT(b), BT(b + 1) - 0.04)); if (k <= 0) continue;
    const pl = MUNDO.trilhas[nm], ac = MUNDO.comp[nm], Lmax = 720 * k;
    ctx.beginPath(); ctx.moveTo(pl[0][0], pl[0][1]);
    for (let i = 1; i < pl.length && ac[i] <= Lmax; i++) ctx.lineTo(pl[i][0], pl[i][1]);
    ctx.setLineDash([26, 16]); ctx.lineDashOffset = -t * 60;
    ctx.lineWidth = 17; ctx.strokeStyle = 'rgba(10,12,11,0.75)'; ctx.stroke();
    ctx.lineWidth = 9; ctx.strokeStyle = PAL.amarelo; ctx.stroke();
  }
  ctx.setLineDash([]);
  // tronco até a bifurcação
  const kt = eo3(prog(t, BT(8) - 0.3, BT(8) + 0.2));
  if (kt > 0) { const pl = MUNDO.trilhas.tronco; ctx.lineWidth = 9; ctx.strokeStyle = PAL.amarelo; ctx.beginPath(); let st = false; for (const p of pl) { if (p[1] > 30 || p[1] < -150 * kt) continue; st ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); st = true; } ctx.stroke(); }
  ctx.restore();
  // etiquetas "?" na ponta de cada ramo
  const kOut = ei3(prog(t, BT(12) + 0.1, BT(12) + 0.4));
  for (const [nm, b] of RAMOS) {
    const kp = eback(prog(t, BT(b + 1) - 0.1, BT(b + 1) + 0.22), 2.0) * (1 - kOut); if (kp <= 0.01) continue;
    const pl = MUNDO.trilhas[nm], ac = MUNDO.comp[nm]; let i = ac.findIndex((a) => a > 720); if (i < 0) i = pl.length - 1;
    const [x, y] = MUNDO.proj(cam, pl[i][0], pl[i][1]);
    ctx.save(); ctx.translate(x, y - 6); ctx.scale(kp, kp);
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke();
    font(ctx, 800, 60, FONT_T); ctx.fillStyle = PAL.preto; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 1, 3);
    ctx.restore();
  }
}

// ---------- quadro ----------
function renderS01(ctx, t) {
  const cam = camS01(t);
  const tD = BT(12); // floresta -> mapa a partir do marcador "você"
  const kD = eio(prog(t, tD - 0.05, tD + 0.95));
  const Rw = kD * 2600; // raio no mundo
  if (kD < 1) MUNDO.drawFloresta(ctx, cam, kD > 0 ? { encolhe: (x, y) => 1 - smooth(Rw, Rw + 260, Math.hypot(x, y)) } : {});
  if (kD > 0) {
    const [px, py] = MUNDO.proj(cam, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, Rw * cam.z, 0, 7); ctx.clip();
    MUNDO.drawMapa(ctx, cam, { revela: clamp(kD * 1.3) });
    ctx.restore();
    if (kD < 1) { ctx.beginPath(); ctx.arc(px, py, Rw * cam.z, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke(); }
  }
  drawCaminhos(ctx, cam, t, kD >= 1);
  drawVoce(ctx, cam, t, kD > 0.3);
  drawCelular(ctx, t);

  // D: palavras-chave (marca-texto amarelo corre por trás) e bússola
  const marca = (txt, x, y, px, tw) => {
    const kw = eo5(prog(t, tw - 0.12, tw + 0.3)); if (kw <= 0) return;
    font(ctx, 800, px, FONT_T); const w = ctx.measureText(txt).width;
    ctx.fillStyle = PAL.amarelo; ctx.fillRect(x - 18, y - px * 0.74, (w + 36) * kw, px * 0.86);
    maskWord(ctx, txt, x, y, px, t, tw, { color: PAL.preto });
  };
  if (kD > 0.2) marca('MAPA', 70, 470, 180, BT(14) + 0.02);
  const tb = BT(14);
  const kb = eo5(prog(t, tb - 0.3, tb + 0.55));
  if (kb > 0) {
    const ag = 0.9 * Math.exp(-3.0 * Math.max(0, t - tb)) * Math.cos(9 * Math.max(0, t - tb)) + (t < tb ? 0.9 : 0);
    drawBussola(ctx, { x: lerp(1400, 720, kb), y: lerp(1800, 850, kb), rot: lerp(0.9, -0.16, kb), limbo: lerp(1.2, 0.35, kb), agulha: ag, s: 1.22 });
    marca('BÚSSOLA', 60, 1120, 150, BT(15) + 0.1);
  }
  drawPrimeiroPlano(ctx, t);
  LEG.draw(ctx, t);
}

// primeiro plano do mergulho: copas grandes passam pela câmera (2,5D) e saem do quadro até 0,7 s
function drawPrimeiroPlano(ctx, t) {
  const k = prog(t, 0, 0.7); if (k >= 1) return;
  const e = ei3(k) * 0.6 + k * 0.4;
  const copas = [[-0.78, -0.55, 420, 0], [0.8, -0.3, 400, 1], [-0.85, 0.45, 440, 2], [0.7, 0.72, 460, 3], [0.1, -1.0, 360, 1]];
  for (const [dx, dy, r, c] of copas) {
    const f = 1.05 + e * 2.6, x = 540 + dx * 620 * f, y = 900 + dy * 900 * f, rr = r * (1 + e * 1.4);
    ctx.fillStyle = 'rgba(5,14,9,0.45)'; ctx.beginPath(); ctx.arc(x + 40, y + 55, rr, 0, 7); ctx.fill();
    ctx.fillStyle = mixHex(PAL.folha[c], PAL.mata, 0.35); ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(160,200,140,0.14)'; ctx.beginPath(); ctx.arc(x - rr * 0.3, y - rr * 0.32, rr * 0.55, 0, 7); ctx.fill();
  }
}

function renderFrame(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.setLineDash([]);
  renderS01(ctx, t);
}
