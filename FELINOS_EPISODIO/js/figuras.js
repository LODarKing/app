// Personagens das histórias bíblicas, desenhados do zero e pintados (sem contorno): Sansão, Davi, Benaia, Daniel,
// soldados e o anjo. Corpo proporcional (≈7,5 cabeças), pernas com joelho (IK), ciclos de andar e correr sem
// patinação, roupas com dobras que balançam, manto com atraso, cabelo e barba, luz principal + sombra + recorte.
// Rostos sempre de perfil e simples (sem feições inventadas além de nariz, olho fechado/sereno e barba).
'use strict';
const FIG = {
  sansao: { skin: '#C98A5E', skinS: '#9E6544', tunic: '#B8743A', tunicS: '#8E5428', tunicL: '#D69A5A', sash: '#6E3A24', hem: -250, hair: '#2A1A14', locks: 7, beard: 'short', build: 1.12, cloak: null },
  davi: { skin: '#D69A6A', skinS: '#AE7450', tunic: '#D9C49A', tunicS: '#B49E74', tunicL: '#EEDDB8', sash: '#4E6E9A', hem: -250, hair: '#6A3A22', headcloth: '#C9B48A', band: '#4E6E9A', beard: null, build: 0.92, young: true, cloak: null },
  benaia: { skin: '#C68A60', skinS: '#9C6646', tunic: '#7A2E2A', tunicS: '#5A1E1C', tunicL: '#9A443A', sash: '#C9A050', hem: -260, hair: '#2A1C16', helmet: '#B88A3A', beard: 'full', build: 1.06, cloak: '#9E2E26', armor: '#A88450' },
  daniel: { skin: '#C99068', skinS: '#A06A4A', tunic: '#3E4E8A', tunicS: '#2C3866', tunicL: '#56679E', sash: '#C9A050', hem: -70, hair: '#3A2A22', cap: '#E2D2AE', beard: 'full', build: 1.0, cloak: '#6E3A6A' },
  soldado: { skin: '#B98058', skinS: '#94603E', tunic: '#5E4A3A', tunicS: '#46362A', tunicL: '#7A6250', sash: '#A88450', hem: -260, hair: '#1E1612', helmet: '#8E7A5A', beard: 'short', build: 1.04, cloak: null, armor: '#8E7A5A' },
  anjo: { skin: '#F6E6CE', skinS: '#E2C8A6', tunic: '#FFF6E6', tunicS: '#EADCC2', tunicL: '#FFFFFF', sash: '#F2D48A', hem: -20, hair: '#F2DEB0', beard: null, build: 1.1, cloak: null, glow: true },
};
const r2d = Math.PI / 180;
/** passada: posição do pé relativa ao quadril para a fase ph (0..1) — apoio desliza para trás, balanço sobe e avança */
function gaitFoot(ph, stride, lift, stance) {
  ph = ((ph % 1) + 1) % 1;
  if (ph < stance) { const k = ph / stance; return [lerp(stride / 2, -stride / 2, k), 0]; }
  const k = (ph - stance) / (1 - stance); return [lerp(-stride / 2, stride / 2, sm(k)), -lift * Math.sin(Math.PI * k)];
}
/**
 * p: { x, y (pés no chão, tela), s, t, face (1 direita / -1 esquerda), pose: 'stand'|'walk'|'run'|'kneel'|'pray'|'raise'|'brace'|'lift'|'sit'|'float',
 *      ph (fase do passo), arms: [[a1,a2],[a1,a2]] opcional (graus, 0 = para frente), hold: 'staff'|'spear'|'lamb'|null,
 *      wind (vento no manto e cabelo), light: {...}, look (inclinação da cabeça, graus), breath }
 */
function bibFigure(dst, who, p) {
  const C = FIG[who], s = p.s, t = p.t || 0, face = p.face || 1, pose = p.pose || 'stand', B = C.build;
  const [lc, g] = layer('fig_' + who + (p.tag || ''));
  g.translate(p.x, p.y); g.scale(s * face, s);
  const run = pose === 'run', walk = pose === 'walk' || run, kneel = pose === 'kneel' || pose === 'pray', sit = pose === 'sit', float = pose === 'float';
  const ph = p.ph ?? t * (run ? 1.6 : 0.9), stance = run ? 0.38 : 0.6, stride = run ? 360 : 210, lift = run ? 120 : 46;
  const breath = Math.sin(t * 2.1 + who.length), wind = p.wind ?? 0.3;
  // quadril: sobe e desce com a passada; inclina na corrida
  const bob = walk ? (run ? 26 : 12) * (0.5 - 0.5 * Math.cos(ph * 4 * Math.PI)) : 0;
  const hipY = kneel ? -250 : sit ? -230 : float ? -490 : -470 + bob, lean = (run ? 13 : walk ? 3 : 0) + (p.lean || 0) + (pose === 'brace' ? -6 : 0) + (pose === 'lift' ? -10 : 0);
  // ---------- pernas (IK com joelho para a frente)
  const L1 = 228, L2 = 228, legs = [];
  [[0, -1], [0.5, 1]].forEach(([off, sd]) => {
    let foot, bend = -1;
    if (walk) { const [fx, fy] = gaitFoot(ph + off, stride, lift, stance); foot = [fx, fy]; }
    else if (kneel) foot = sd < 0 ? [-150, 0] : [120, 0];
    else if (sit) foot = sd < 0 ? [160, 0] : [210, 0];
    else if (float) foot = [sd * 14, 6];
    else if (pose === 'brace' || pose === 'lift') foot = sd < 0 ? [-150, 0] : [130, 0];
    else foot = [sd * 26, 0];
    legs.push({ sd, foot, hip: [sd * 22 * B, hipY], bend });
  });
  const drawLeg = (L) => {
    const { hip, foot, sd } = L; let knee;
    if (kneel && sd < 0) knee = [hip[0] + 40, 0 - 10];            // joelho de trás no chão
    else knee = ik2(hip, [foot[0], foot[1] - 20], L1, L2, -1);   // joelho para a frente
    const ankle = [foot[0], foot[1] - 22];
    g.beginPath(); trace(g, smooth(limb([hip, knee, ankle], [40 * B, 30, 21]), true, 4)); g.fillStyle = C.skin; g.fill();
    g.save(); g.beginPath(); trace(g, smooth(limb([hip, knee, ankle], [40 * B, 30, 21]), true, 4)); g.clip(); g.fillStyle = C.skinS; g.globalAlpha = 0.55; g.fillRect(hip[0] - 200, hip[1] + 40, 200, 600); g.restore();
    // sandália
    g.fillStyle = '#5A3A26'; g.beginPath(); g.ellipse(ankle[0] + 24, foot[1] - 7, 50, 13, 0, 0, 6.283); g.fill();
    g.fillStyle = C.skin; g.beginPath(); g.ellipse(ankle[0] + 18, foot[1] - 20, 40, 15, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#5A3A26'; g.lineWidth = 7; g.beginPath(); g.moveTo(ankle[0] - 12, foot[1] - 40); g.lineTo(ankle[0] + 40, foot[1] - 14); g.stroke();
    return knee;
  };
  // perna de trás primeiro (a do lado de lá), depois a da frente
  const order = walk ? [...legs].sort((a, b) => (a.foot[0] < b.foot[0] ? -1 : 1)) : legs;
  const knees = order.map(drawLeg);
  // ---------- tronco (gira em torno do quadril)
  g.save(); g.translate(0, hipY); g.rotate(lean * r2d); g.translate(0, -hipY);
  const shY = hipY - 300, sh = 92 * B, wa = 64 * B, by = -3 * breath;
  // manto atrás do corpo (atraso e vento)
  if (C.cloak) {
    const fl = Math.sin(t * 2.3) * 18 * (0.3 + wind) + (walk ? Math.sin(ph * 2 * Math.PI) * 26 : 0) + wind * 70 + (run ? 90 : 0);
    g.fillStyle = C.cloak; g.beginPath(); trace(g, smooth([[-sh * 0.4, shY + by], [sh * 0.3, shY + by], [-40 - fl * 0.3, hipY + 60], [-110 - fl, hipY + 260 + fl * 0.2], [-170 - fl * 1.4, hipY + 300 - fl * 0.4], [-sh - 20, shY + 140]], true, 5)); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); trace(g, smooth([[-sh * 0.2, shY + 40], [-60 - fl * 0.5, hipY + 150], [-140 - fl * 1.2, hipY + 290], [-sh, shY + 160]], true, 4)); g.fill();
  }
  // túnica: ombros → cintura → barra (abre conforme as pernas)
  const hemY = kneel ? -40 : sit ? hipY + 120 : C.hem + (walk ? bob * 0.5 : 0), fA = legs[0].foot[0], fB = legs[1].foot[0];
  const hemL = Math.min(fA, fB, 0) - 110 - (walk ? 20 : 0), hemR = Math.max(fA, fB, 0) + 110 + (kneel ? 120 : 0), sway = Math.sin(t * 1.9) * 8 * (0.4 + wind) + wind * 26;
  const tunic = [[-sh, shY + 20 + by], [sh, shY + 20 + by], [wa + 10, hipY - 30], [hemR + sway, hemY], [(hemL + hemR) / 2 + sway, hemY + 14], [hemL + sway * 0.6, hemY], [-wa - 10, hipY - 30]];
  const tP = smooth(tunic, true, 5); g.beginPath(); trace(g, tP); g.fillStyle = C.tunic; g.fill();
  g.save(); g.beginPath(); trace(g, tP); g.clip();
  g.fillStyle = C.tunicS; g.beginPath(); trace(g, smooth([[-sh - 10, shY], [-sh * 0.2, shY + 60], [-wa * 0.3, hipY], [hemL * 0.4, hemY + 20], [hemL - 40, hemY + 20]], true, 4)); g.fill();   // lado em sombra
  g.fillStyle = C.tunicL; g.globalAlpha = 0.7; g.beginPath(); trace(g, smooth([[sh * 0.2, shY + 40], [sh + 10, shY + 50], [wa + 6, hipY - 40], [wa * 0.4, hipY - 60]], true, 4)); g.fill(); g.globalAlpha = 1;
  // dobras (pregas que caem do cinto e balançam)
  g.strokeStyle = C.tunicS; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const x0 = lerp(-wa * 0.8, wa * 0.8, i / 4), x1 = lerp(hemL + 30, hemR - 30, i / 4) + sway * (0.6 + i * 0.1); g.lineWidth = 10 - Math.abs(i - 2) * 2; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x0, hipY - 10); g.quadraticCurveTo((x0 + x1) / 2 + 14 * Math.sin(t * 1.4 + i), (hipY + hemY) / 2, x1, hemY - 6); g.stroke(); }
  g.globalAlpha = 1;
  // couraça (Benaia, soldados)
  if (C.armor) { g.fillStyle = C.armor; g.beginPath(); g.roundRect(-sh * 0.86, shY + 30, sh * 1.72, hipY - shY - 40, 30); g.fill(); g.fillStyle = 'rgba(255,240,200,0.25)'; g.beginPath(); g.roundRect(sh * 0.1, shY + 50, sh * 0.6, hipY - shY - 90, 20); g.fill(); g.fillStyle = 'rgba(40,20,10,0.25)'; for (let i = 0; i < 4; i++) g.fillRect(-sh * 0.86, hipY - 30 + i * 34, sh * 1.72, 10); }
  g.restore();
  // faixa da cintura
  g.fillStyle = C.sash; g.beginPath(); g.roundRect(-wa - 14, hipY - 60, 2 * wa + 28, 40, 12); g.fill();
  g.beginPath(); trace(g, smooth([[-wa + 10, hipY - 30], [-wa - 30 - sway * 0.6, hipY + 90], [-wa - 4 - sway * 0.6, hipY + 100], [-wa + 30, hipY - 26]], true, 3)); g.fill();
  // pescoço
  g.fillStyle = C.skin; g.beginPath(); g.roundRect(-30, shY - 70, 60, 100, 20); g.fill(); g.fillStyle = C.skinS; g.globalAlpha = 0.6; g.fillRect(-30, shY - 30, 60, 40); g.globalAlpha = 1;
  // ---------- braços
  const armPose = (sd) => {
    const sw = walk ? Math.sin((ph + (sd < 0 ? 0 : 0.5)) * 2 * Math.PI) * (run ? 50 : 24) : 0;
    if (p.arms) return p.arms[sd < 0 ? 0 : 1];
    if (sd > 0 && (p.hold === 'staff' || p.hold === 'spear') && pose !== 'run' && pose !== 'raise') return [62 + sw * 0.2, -38];   // mão firme no cajado / lança
    switch (pose) {
      case 'pray': return sd < 0 ? [-40, -95] : [-30, -100];            // mãos juntas na frente do rosto
      case 'raise': return sd < 0 ? [-120, -110] : [-60, -70];           // braços erguidos (louvor / alívio)
      case 'brace': return sd < 0 ? [-10, -25] : [10, -10];              // braços à frente, firmes
      case 'lift': return sd < 0 ? [-70, -100] : [-50, -80];
      case 'kneel': return sd < 0 ? [-20, -80] : [-10, -85];
      case 'sit': return sd < 0 ? [60, 10] : [50, 0];
      case 'float': return sd < 0 ? [100, 80] : [-35, -60];              // anjo: uma mão erguida, serena
      default: return [90 - sw, 75 - sw * 1.3 + (run ? -60 : 0)];
    }
  };
  const drawArm = (sd) => {
    const [a1, a2] = armPose(sd), S = [sd < 0 ? -18 : 22, shY + 40 + by], U = 178, F = 166;
    const E = [S[0] + Math.cos(a1 * r2d) * U, S[1] + Math.sin(a1 * r2d) * U], Wr = [E[0] + Math.cos(a2 * r2d) * F, E[1] + Math.sin(a2 * r2d) * F];
    const col = sd < 0 ? C.tunicS : C.tunic, sk = sd < 0 ? C.skinS : C.skin;
    g.beginPath(); trace(g, smooth(limb([S, E, Wr], [31 * B, 25, 19]), true, 4)); g.fillStyle = sk; g.fill();
    // manga (cobre o braço até perto do cotovelo)
    const M2 = [lerp(S[0], E[0], 0.62), lerp(S[1], E[1], 0.62)]; g.beginPath(); trace(g, smooth(limb([[S[0] - Math.cos(a1 * r2d) * 18, S[1] - Math.sin(a1 * r2d) * 18], M2], [44 * B, 36]), true, 3)); g.fillStyle = col; g.fill();
    g.fillStyle = sk; g.beginPath(); g.ellipse(Wr[0] + Math.cos(a2 * r2d) * 20, Wr[1] + Math.sin(a2 * r2d) * 20, 24, 19, a2 * r2d, 0, 6.283); g.fill();
    return [Wr[0] + Math.cos(a2 * r2d) * 30, Wr[1] + Math.sin(a2 * r2d) * 30];
  };
  const back = drawArm(-1);
  // ---------- cabeça
  const hc = [16, shY - 120], look = (p.look || 0) + (kneel ? 6 : 0) + Math.sin(t * 1.1) * 1.5;
  g.save(); g.translate(hc[0], hc[1] + 60); g.rotate(look * r2d); g.translate(0, -60);
  bibHead(g, C, t, ph, wind, walk);
  g.restore();
  const front = drawArm(1);
  // objetos nas mãos
  if (p.hold === 'staff') { g.strokeStyle = '#6E4A2A'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(front[0] + 10, front[1] - 420); g.lineTo(front[0] + 40, front[1] + 520); g.stroke(); g.beginPath(); g.moveTo(front[0] + 10, front[1] - 420); g.quadraticCurveTo(front[0] - 30, front[1] - 520, front[0] + 40, front[1] - 540); g.quadraticCurveTo(front[0] + 100, front[1] - 520, front[0] + 70, front[1] - 470); g.stroke(); }
  if (p.hold === 'spear') { g.strokeStyle = '#6E5236'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(front[0] - 30, front[1] + 420); g.lineTo(front[0] + 40, front[1] - 640); g.stroke(); g.fillStyle = '#C8C2B4'; g.beginPath(); g.moveTo(front[0] + 26, front[1] - 630); g.lineTo(front[0] + 48, front[1] - 760); g.lineTo(front[0] + 64, front[1] - 626); g.fill(); }
  if (p.hold === 'lamb') { const lx = front[0] - 40, ly = front[1] - 30; g.fillStyle = '#F6EEDC'; [[0, 0, 70], [-60, 10, 56], [56, 6, 58], [-10, -40, 52], [30, 40, 48]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(lx + dx, ly + dy, r, 0, 6.283); g.fill(); }); g.fillStyle = '#4A3A34'; g.beginPath(); g.ellipse(lx + 110, ly - 20, 34, 26, 0.3, 0, 6.283); g.fill(); g.fillStyle = '#F6EEDC'; g.beginPath(); g.ellipse(lx + 92, ly - 50, 18, 9, -0.6, 0, 6.283); g.fill(); g.fillStyle = C.skin; g.beginPath(); g.ellipse(front[0], front[1], 30, 24, 0, 0, 6.283); g.fill(); }
  g.restore();
  // ---------- pintura e luz
  g.setTransform(1, 0, 0, 1, 0, 0);
  const M = [s * face, 0, 0, s, p.x, p.y];
  const rr = painterize(lc, M, [-620, -1080, 620, 40], { seed: who.length * 7 + 3, tex: 0.3, edge: 0.5, edgeBlur: 2 });
  lightRig(lc, rr, p.light || { dir: [-1, -0.5], key: 'rgba(255,224,170,0.3)', shade: 'rgba(60,30,80,0.42)', rim: 'rgba(255,232,190,1)', rimW: 6 * s + 2, rimA: 0.85 });
  if (C.glow) { g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,250,236,0.35)'; g.fillRect(rr[0], rr[1], rr[2], rr[3]); g.restore(); }
  if (p.alpha != null) dst.globalAlpha = p.alpha;
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); if (p.alpha != null) dst.globalAlpha = p.alpha; dst.drawImage(lc, rr[0], rr[1], rr[2], rr[3], rr[0], rr[1], rr[2], rr[3]); dst.restore();
  if (p.alpha != null) dst.globalAlpha = 1;
  return rr;
}
/** cabeça de perfil: cabelo de trás, rosto (testa, nariz, queixo), orelha, olho sereno, barba, cobertura (pano, capacete, gorro) */
function bibHead(g, C, t, ph, wind, walk) {
  const R = 62, hair = C.hair;
  // cabelo de trás (Sansão: sete mechas longas que balançam)
  if (C.locks) for (let i = 0; i < C.locks; i++) { const a = i / (C.locks - 1), sw = Math.sin(t * 2.2 + i * 0.7) * 12 + wind * 60 + (walk ? Math.sin(ph * 6.283 + i) * 8 : 0); g.strokeStyle = i % 2 ? hair : '#3A261C'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40 + a * 30, -30 + a * 10); g.bezierCurveTo(-90 - sw * 0.4, 60, -70 - sw, 180 + a * 40, -100 - sw * 1.3 + a * 30, 300 + a * 50); g.stroke(); }
  else if (!C.helmet && !C.headcloth) { g.fillStyle = hair; g.beginPath(); g.ellipse(-24, 0, R * 0.95, R * 1.05, 0, 0, 6.283); g.fill(); if (C.glow) { g.beginPath(); trace(g, smooth([[-50, -40], [-90 - wind * 30, 80], [-70 - wind * 40, 220], [-20, 120]], true, 3)); g.fill(); } }
  // rosto de perfil
  const face = smooth([[-46, -58], [10, -66], [44, -40], [56, -6], [74, 10], [58, 22], [56, 40], [44, 60], [16, 74], [-30, 64], [-56, 20]], true, 4);
  g.beginPath(); trace(g, face); g.fillStyle = C.skin; g.fill();
  g.save(); g.beginPath(); trace(g, face); g.clip(); g.fillStyle = C.skinS; g.globalAlpha = 0.35; g.beginPath(); g.ellipse(-70, 30, 50, 80, 0, 0, 6.283); g.fill(); g.restore();   // sombra na nuca
  g.fillStyle = C.skinS; g.globalAlpha = 0.7; g.beginPath(); g.ellipse(-14, 8, 9, 15, 0.1, 0, 6.283); g.fill(); g.globalAlpha = 1;   // orelha
  g.strokeStyle = '#3A2420'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, -10); g.quadraticCurveTo(38, -4, 46, -10); g.stroke();   // olho sereno (pálpebra)
  g.strokeStyle = C.skinS; g.lineWidth = 4; g.beginPath(); g.moveTo(26, -24); g.quadraticCurveTo(38, -30, 50, -24); g.stroke();   // sobrancelha suave
  if (C.beard) { g.fillStyle = hair; g.beginPath(); trace(g, smooth(C.beard === 'full' ? [[-30, 24], [10, 30], [56, 34], [52, 66], [24, 104], [-6, 96], [-34, 60]] : [[-24, 30], [20, 36], [54, 38], [46, 62], [16, 78], [-20, 64]], true, 4)); g.fill(); }
  // cobertura da cabeça
  if (C.helmet) {
    g.fillStyle = C.helmet; g.beginPath(); g.ellipse(-4, -40, 72, 52, 0, Math.PI, 0); g.lineTo(68, -24); g.lineTo(-76, -24); g.fill();
    g.beginPath(); g.moveTo(-60, -30); g.lineTo(-70, 40); g.lineTo(-40, 30); g.lineTo(-40, -30); g.fill();   // proteção da nuca
    g.fillStyle = 'rgba(255,240,200,0.35)'; g.beginPath(); g.ellipse(10, -60, 30, 14, -0.3, 0, 6.283); g.fill();
    if (C.cloak) { g.fillStyle = '#9E2E26'; g.beginPath(); trace(g, smooth([[-40, -84], [0, -110], [44, -86], [20, -76], [-20, -76]], true, 3)); g.fill(); }   // penacho
  } else if (C.headcloth) {
    g.fillStyle = C.headcloth; g.beginPath(); trace(g, smooth([[-70, -40], [-20, -76], [40, -66], [56, -36], [20, -40], [-30, -30], [-56, 40], [-80 - wind * 20, 140], [-96 - wind * 30, 60]], true, 4)); g.fill();
    g.fillStyle = C.band; g.beginPath(); g.roundRect(-64, -52, 116, 14, 7); g.fill();
  } else if (C.cap) {
    g.fillStyle = C.cap; g.beginPath(); trace(g, smooth([[-66, -30], [-50, -84], [10, -96], [52, -60], [44, -36]], true, 4)); g.fill();
    g.fillStyle = C.sash; g.fillRect(-64, -44, 112, 10);
  } else if (!C.locks) { g.fillStyle = hair; g.beginPath(); trace(g, smooth([[-60, -20], [-50, -70], [20, -80], [50, -48], [20, -50], [-20, -36]], true, 4)); g.fill(); }
  else { g.fillStyle = hair; g.beginPath(); trace(g, smooth([[-66, -10], [-52, -70], [24, -82], [52, -46], [16, -52], [-26, -40], [-50, 20]], true, 4)); g.fill(); }
}
/** brilho suave em volta de uma figura de luz (anjo): halo de luz no mundo, não é interface */
function holyGlow(ctx, x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = radial(ctx, x, y, r * 0.05, r, [[0, `rgba(255,244,214,${0.75 * a})`], [0.35, `rgba(255,232,180,${0.32 * a})`], [1, 'rgba(255,232,180,0)']]); ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
