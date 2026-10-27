// Capa do Instagram (1080×1920) no estilo do episódio: o gancho "parece apenas um gatinho fofinho…" virou imagem —
// o Pingo sentado no Diário da Criação, e a sombra dele na luz do pôr do sol é a de um leão rugindo.
// O essencial fica na faixa central 1080×1350 (y 285–1635), que é o recorte 4:5 do perfil; o 3:4 (y 240–1680) também cabe.
'use strict';
function renderCapa(ctx, o = {}) {
  const t = o.t ?? 2.0, td = on2s(t);
  BOIL = 3; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // ---------- céu da savana ao pôr do sol, sol atrás do título
  ctx.drawImage(savannaBg(), -210, -200);
  glowSpot(ctx, 540, 940, 760, 'rgba(255,196,140,0.55)');
  ctx.fillStyle = '#FFF0D2'; ctx.beginPath(); ctx.arc(540, 940, 150, 0, 6.283); ctx.fill();
  sunRays(ctx, t, { x: 540, y: 940, ang: Math.PI, len: 1300, n: 9, width: 90, alpha: 0.26, seed: 31 });
  sunRays(ctx, t, { x: 540, y: 940, ang: 0, len: 1200, n: 7, width: 80, alpha: 0.12, seed: 37 });
  cloudsDrift(ctx, t, { y0: 120, y1: 560, n: 4, speed: 10, wrap: 1900, x0: -500, alpha: 0.75 });
  // ---------- a sombra do leão rugindo (o segredo do gatinho), projetada no horizonte
  const [sc, sg] = layer('capaSombra');
  drawBigCat(sg, 'lion', { x: 640, y: 1478, s: 1.2, flip: true, jaw: 0.95, headRot: -12, tail: 1.2, blink: 0 }, td, {});
  const [rc, rg] = layer('capaRim'); rg.drawImage(sc, 0, 0); rg.globalCompositeOperation = 'source-in'; rg.fillStyle = '#FFD08A'; rg.fillRect(0, 0, W, H);
  sg.globalCompositeOperation = 'source-in'; sg.fillStyle = 'rgba(58,32,62,1)'; sg.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.95; ctx.drawImage(rc, -7, -8); ctx.globalAlpha = 0.9; ctx.drawImage(sc, 0, 0); ctx.restore();   // contraluz âmbar na borda
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.5; ctx.filter = 'blur(14px)'; ctx.drawImage(sc, 0, 0); ctx.restore();
  // brilho dos olhos na sombra (âmbar, discreto)
  // ---------- chão da savana e capim
  inkShape(ctx, [[-40, 1430], [200, 1360], [540, 1340], [880, 1360], [1120, 1430], [1120, 1960, 1], [-40, 1960, 1]], { fill: '#5A3650', shade: '#4A2C44', shadeOff: [0, -30], line: BGL, lw: 4, wob: 0 });
  inkLine(ctx, [[160, 1370], [540, 1342], [920, 1370]], { line: '#F6C9A0', lw: 5, wob: 0, alpha: 0.85 });
  const rim = { dir: [0, -1], key: 'rgba(255,220,170,0.25)', shade: 'rgba(60,24,60,0.5)', rim: 'rgba(255,226,180,1)', rimW: 6, rimA: 0.95 };
  // ---------- o Diário da Criação e o Pingo sentado nele, iluminado de trás
  diaryBook(ctx, 600, 1392, -0.04, 0.96, 0.9);
  drawPingo(ctx, { x: 600, y: 1338, s: 0.6, tail: 1.9, look: [0, -2], dilate: 0.55, tilt: -4, blink: 0 });
  // capim em primeiro plano e partículas de luz
  for (let i = 0; i < 90; i++) { const x = -40 + i * 13 + rnd(i, 1) * 10, hh = 70 + rnd(i, 2) * 150, sw = 10 * Math.sin(i * 0.7); inkLine(ctx, [[x, 1960], [x + sw * 0.4, 1960 - hh * 0.55], [x + sw + (rnd(i, 3) - 0.5) * 30, 1960 - hh]], { line: i % 3 ? '#3E2438' : '#5A3450', lw: 6 + rnd(i, 4) * 4, wob: 0 }); }
  motes(ctx, t, [0, 700, W, 1000], { n: 40, seed: 77, color: '255,232,190', size: 4, alpha: 0.85 });
  vignette(ctx, '40,16,40', 0.42);
  // ---------- filtro pintado do episódio
  POST(ctx, 1);
  capaUI(ctx);
}
/** textos e marcas (depois do filtro, nítidos) */
function capaUI(ctx) {
  // tudo o que importa fica na faixa central 4:5 (1080×1350, y 285–1635) da arte 9:16; fora dela só céu e capim
  const B0 = 285, B1 = 1635;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const outline = (txt, x, y, fill, lw = 10) => { ctx.lineWidth = lw; ctx.strokeStyle = PLUM; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); };
  // cabeçalho centralizado: emblema oficial à esquerda, série no meio, insígnia oficial EN-024 à direita
  const em = document.getElementById('emblema'), ins = document.getElementById('insignia');
  ctx.save(); ctx.translate(122, B0 + 118); ctx.rotate(-0.06); ctx.drawImage(em, -56, -57, 112, 114); ctx.restore();
  ctx.save(); ctx.translate(958, B0 + 118); ctx.rotate(0.1);
  ctx.fillStyle = PLUM; ctx.beginPath(); ctx.arc(5, 7, 80, 0, 6.283); ctx.fill(); ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 72, 0, 6.283); ctx.clip(); ctx.drawImage(ins, -75, -75, 150, 150); ctx.restore(); ctx.restore();
  ctx.textAlign = 'center'; ctx.font = '900 38px InterUI';
  outline('SÉRIE ESPECIALIDADES', 540, B0 + 82, CREAM); outline('DOS DESBRAVADORES', 540, B0 + 126, CREAM);
  ctx.font = '900 38px InterUI'; outline('ESPECIALIDADE EN-024', 540, B0 + 174, ACCENT);
  // título "Felinos" escrito à mão, centralizado, com cópia âmbar fora de registro, sublinhado e estrelinha
  ctx.save(); ctx.translate(540, B0 + 470); ctx.rotate(-0.05);
  ctx.font = '700 290px Caveat'; ctx.textAlign = 'left'; const tw = ctx.measureText('Felinos').width, x0 = -tw / 2;
  ctx.fillStyle = ACCENT; ctx.fillText('Felinos', x0 + 12, 12);
  ctx.strokeStyle = PLUM; ctx.lineWidth = 32; ctx.strokeText('Felinos', x0, 0); ctx.fillStyle = CREAM; ctx.fillText('Felinos', x0, 0);
  ctx.strokeStyle = ACCENT; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.beginPath(); trace(ctx, smooth([[x0 + 14, 52], [x0 + tw * 0.45, 70], [x0 + tw * 0.97, 42]], false, 12), false); ctx.stroke();
  ctx.save(); ctx.translate(x0 + tw + 30, -210); ctx.rotate(0.2); ctx.fillStyle = ACCENT; ctx.strokeStyle = PLUM; ctx.lineWidth = 8; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
  // subtítulo em caixa de gibi
  ctx.save(); ctx.translate(540, B0 + 590); ctx.rotate(-0.03);
  ctx.font = '900 64px InterUI'; const sub = 'UMA AVENTURA SELVAGEM!', sw = ctx.measureText(sub).width;
  ctx.fillStyle = PLUM; ctx.beginPath(); ctx.roundRect(-sw / 2 - 30 + 10, -60 + 12, sw + 60, 90, 14); ctx.fill();
  halftoneBox(ctx, -sw / 2 - 30, -60, sw + 60, 90); ctx.textAlign = 'center'; ctx.fillStyle = PLUM; ctx.fillText(sub, 0, 8);
  ctx.restore();
  // onomatopeia do rugido da sombra
  ctx.save(); ctx.translate(210, B0 + 735); ctx.rotate(-0.16); ctx.font = '700 86px Caveat'; ctx.textAlign = 'center';
  ctx.fillStyle = ACCENT; ctx.fillText('ROOAAR!', 6, 6); outline('ROOAAR!', 0, 0, CREAM, 16); ctx.restore();
  // gancho e rodapé, ainda dentro da faixa
  ctx.textAlign = 'center'; ctx.font = '900 42px InterUI';
  outline('Parece só um gatinho fofinho...', 540, B1 - 150, CREAM, 12); outline('mas a família dele guarda segredos!', 540, B1 - 98, ACCENT, 12);
  ctx.font = '800 30px InterUI'; outline('DISTRITO DE DESBRAVADORES DE AMONTADA', 540, B1 - 40, CREAM, 9);
  ctx.restore();
}
