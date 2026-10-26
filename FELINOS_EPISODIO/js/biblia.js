// Histórias bíblicas: figuras humanas em silhueta pintada (teatro de sombras sobre cenários dourados), sem rostos inventados.
// robeFigure: pessoa de túnica com poses simples (andar, correr, de pé, ajoelhado orando, segurando um cordeiro), cabelo longo ou curto,
// cajado ou lança; luz de recorte opcional. Leões e ovelhas também em silhueta / pintura simples.
'use strict';
const SILC = '#24162A';
function robeFigure(dst, p) {
  const { x, y, s, t = 0, pose = 'stand', hair = 'short', flip = false, staff = false, spear = false, lamb = false, color = SILC, rim = null, rimDir = [-1, -0.4], arms = null, cloak = false, tall = 1 } = p;
  const [lc, g] = layer('robe'); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s * tall); g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  const walk = pose === 'walk' || pose === 'run', ph = t * (pose === 'run' ? 9 : 5.5), sw = walk ? Math.sin(ph) : 0, bob = walk ? Math.abs(Math.cos(ph)) * (pose === 'run' ? 16 : 8) : 0, lean = pose === 'run' ? 0.22 : walk ? 0.06 : 0;
  g.translate(0, -bob); g.rotate(lean);
  const kneel = pose === 'kneel', float = pose === 'float';
  // pernas (aparecem sob a túnica ao andar)
  if (!kneel && !float) { g.lineWidth = 34; [[1, sw], [-1, -sw]].forEach(([sd, k]) => { g.beginPath(); g.moveTo(sd * 18, -220); g.lineTo(sd * 18 + k * 70, -60); g.lineTo(sd * 18 + k * 90, 0); g.stroke(); g.beginPath(); g.ellipse(sd * 18 + k * 90 + 20, -6, 34, 14, 0, 0, 6.283); g.fill(); }); }
  // túnica (bainha balança)
  const hem = kneel ? -60 : float ? 0 : -150, flare = walk ? sw * 30 : float ? 18 * Math.sin(t * 1.3) : 0;
  g.beginPath(); g.moveTo(-58, -560); g.lineTo(58, -560); g.lineTo(96 + flare, hem); g.quadraticCurveTo(0, hem + 30, -96 + flare, hem); g.closePath(); g.fill();
  if (kneel) { g.beginPath(); trace(g, smooth([[-90, -70], [60, -110], [190, -60], [200, 0], [-90, 0]], true, 4)); g.fill(); }
  g.fillStyle = 'rgba(255,230,180,0.12)'; g.fillRect(-62, -400, 124, 14); g.fillStyle = color;   // faixa da cintura
  if (cloak) { g.beginPath(); g.moveTo(-60, -560); g.quadraticCurveTo(-170 - 40 * sw, -300, -140 - 60 * Math.abs(sw), -150); g.lineTo(-40, -200); g.fill(); }
  // cabeça e cabelo
  g.beginPath(); g.arc(0, -620, 52, 0, 6.283); g.fill(); g.fillRect(-20, -580, 40, 40);
  g.beginPath(); g.moveTo(44, -640); g.lineTo(70, -606); g.lineTo(44, -598); g.fill();
  if (hair === 'long') { g.beginPath(); g.moveTo(-50, -650); g.quadraticCurveTo(-90 - 10 * sw, -520, -70 - 20 * sw, -420); g.lineTo(-20, -470); g.lineTo(30, -640); g.fill(); [0, 1, 2].forEach((k) => { g.lineWidth = 16; g.beginPath(); g.moveTo(-30 + k * 10, -640); g.quadraticCurveTo(-80 - k * 6 - 14 * sw, -560, -60 - k * 10 - 22 * sw, -440 + k * 20); g.stroke(); }); }
  if (hair === 'beard') { g.beginPath(); g.moveTo(20, -620); g.quadraticCurveTo(60, -560, 10, -540); g.lineTo(-20, -590); g.fill(); }
  if (hair === 'helmet') { g.beginPath(); g.arc(0, -640, 58, Math.PI, 0); g.fill(); g.fillRect(-6, -720, 12, 40); }
  // braços
  g.lineWidth = 30; const A = arms || (pose === 'run' ? [[-150, 0.6 * sw], [-30, -0.6 * sw]] : walk ? [[100, 0.35 * sw], [80, -0.35 * sw]] : pose === 'pray' || kneel ? [[-40, 0], [-52, 0]] : lamb ? [[40, -0.8], [140, -0.6]] : [[95, 0.05], [85, -0.05]]);
  A.forEach(([deg, k], i) => { const sx = i ? 44 : -44, a1 = (deg * Math.PI / 180) + k, ex = sx + Math.cos(a1) * 120, ey = -520 + Math.sin(a1) * 120, a2 = a1 + (pose === 'pray' || kneel ? -0.6 : lamb ? -1.4 : 0.15), hx = ex + Math.cos(a2) * 110, hy = ey + Math.sin(a2) * 110; g.beginPath(); trace(g, smooth(limb([[sx, -536], [ex, ey], [hx, hy]], [34, 30, 34]), true, 3)); g.fill(); g.beginPath(); g.arc(hx + Math.cos(a2) * 18, hy + Math.sin(a2) * 18, 17, 0, 6.283); g.fill(); });
  if (staff) { g.lineWidth = 14; g.beginPath(); g.moveTo(130, -380); g.lineTo(150, 20); g.moveTo(130, -380); g.quadraticCurveTo(110, -460, 160, -480); g.quadraticCurveTo(200, -470, 180, -430); g.stroke(); }
  if (spear) { g.lineWidth = 12; g.beginPath(); g.moveTo(120, -820); g.lineTo(150, 40); g.stroke(); g.beginPath(); g.moveTo(108, -820); g.lineTo(120, -890); g.lineTo(134, -820); g.fill(); }
  if (lamb) { g.fillStyle = '#F2EAD8'; [[-60, -470], [-20, -490], [20, -470], [-40, -440], [0, -440]].forEach(([lx, ly]) => { g.beginPath(); g.arc(lx + 60, ly, 34, 0, 6.283); g.fill(); }); g.fillStyle = color; g.beginPath(); g.ellipse(130, -500, 26, 20, 0.3, 0, 6.283); g.fill(); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const sc = Math.abs(s), r = [Math.max(0, x - 260 * sc), Math.max(0, y - 960 * sc), Math.min(W, 520 * sc), Math.min(H, 1000 * sc)];
  if (rim) lightRig(lc, r, { dir: rimDir, key: 'rgba(0,0,0,0)', shade: 'rgba(0,0,0,0)', rim, rimW: 7, rimA: 0.95 });
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.drawImage(lc, r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]); dst.restore();
}
/** ovelha pintada (lã creme, cabeça escura) */
function sheep(g, x, y, s, t, flip = false, walk = 0) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s); const b = Math.abs(Math.sin(walk * 6)) * 6 * (walk ? 1 : 0);
  g.fillStyle = '#3A2A30'; [[-50, 0], [-20, 0], [30, 0], [60, 0]].forEach(([lx], i) => { g.fillRect(lx - 8 + (walk ? Math.sin(walk * 6 + i * 1.6) * 8 : 0), -60, 16, 60); });
  g.fillStyle = '#F2EAD8'; [[-60, -100], [-20, -120], [30, -116], [60, -96], [-30, -80], [20, -76]].forEach(([cx, cy]) => { g.beginPath(); g.arc(cx, cy - b, 46, 0, 6.283); g.fill(); });
  g.fillStyle = 'rgba(200,170,150,0.35)'; g.beginPath(); g.ellipse(0, -70 - b, 90, 26, 0, 0, 6.283); g.fill();
  g.fillStyle = '#3A2A30'; g.beginPath(); g.ellipse(100, -120 - b, 34, 26, 0.3, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(84, -138 - b, 16, 8, -0.6, 0, 6.283); g.fill();
  g.restore();
}
/** referência bíblica escrita à mão (fonte de título), canto superior */
function bibleRef(ctx, t, t0, t1, txt) { handTitle(ctx, t, t0, txt, 540, 300, { size: 104, color: '#FFE8B8', align: 'center', t1, rot: -0.03 }); }
/** feixe de luz suave vindo do alto (luz no mundo) */
function lightBeam(ctx, x, a, w = 260) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = linear(ctx, x, 0, x, H, [[0, `rgba(255,236,190,${0.7 * a})`], [0.8, `rgba(255,236,190,${0.25 * a})`], [1, 'rgba(255,236,190,0)']]); ctx.beginPath(); ctx.moveTo(x - w * 0.4, 0); ctx.lineTo(x + w * 0.4, 0); ctx.lineTo(x + w * 1.2, H); ctx.lineTo(x - w * 1.2, H); ctx.fill(); ctx.restore(); }
