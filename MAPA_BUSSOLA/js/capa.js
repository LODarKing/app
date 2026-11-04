// Capa do Instagram (9:16, 1080×1920). O essencial fica na faixa 4:5 do meio (y 285 a 1635), que é o recorte do perfil.
// Conceito: o gancho do episódio virado imagem. Floresta vista de cima com a trilha que se divide (?), e uma "lente" que mostra
// o mesmo terreno como mapa topográfico, com a bússola orientada por cima.
'use strict';
function renderCapa(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.setLineDash([]);
  const cam = { cx: 0, cy: -539, z: 0.9, r: 0 };
  MUNDO.drawFloresta(ctx, cam);
  // caminhos amarelos com "?" (como na abertura)
  ctx.save(); MUNDO.applyCam(ctx, cam); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const nm of ['esq', 'meio', 'dir']) {
    const pl = MUNDO.trilhas[nm], ac = MUNDO.comp[nm];
    ctx.beginPath(); ctx.moveTo(pl[0][0], pl[0][1]); for (let i = 1; i < pl.length && ac[i] <= 760; i++) ctx.lineTo(pl[i][0], pl[i][1]);
    ctx.setLineDash([26, 16]); ctx.lineWidth = 17; ctx.strokeStyle = 'rgba(10,12,11,0.75)'; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = PAL.amarelo; ctx.stroke();
  }
  ctx.restore(); ctx.setLineDash([]);
  // faixa escura atrás do cabeçalho e do título (cor sólida da mata, sem degradê)
  ctx.fillStyle = 'rgba(14,30,20,0.8)'; ctx.fillRect(0, 0, W, 892);
  ctx.fillStyle = 'rgba(14,30,20,0.85)'; ctx.fillRect(0, 1528, W, 392);
  // lente: o mesmo terreno como mapa topográfico
  const LX = 540, LY = 1250, LR = 240;
  ctx.save(); ctx.beginPath(); ctx.arc(LX, LY, LR, 0, 7); ctx.clip();
  const camL = { cx: 10 + (LX - 540) / 0.9, cy: -420 + (LY - 900) / 0.9, z: 0.9, r: 0 };
  ctx.translate(0, 0); MUNDO.drawMapa(ctx, { ...cam }, { cotas: false });
  ctx.save(); MUNDO.applyCam(ctx, cam); ctx.lineCap = 'round';
  for (const nm of ['esq', 'meio', 'dir']) { const pl = MUNDO.trilhas[nm], ac = MUNDO.comp[nm]; ctx.beginPath(); ctx.moveTo(pl[0][0], pl[0][1]); for (let i = 1; i < pl.length && ac[i] <= 760; i++) ctx.lineTo(pl[i][0], pl[i][1]); ctx.lineWidth = 9; ctx.strokeStyle = PAL.amarelo; ctx.stroke(); }
  ctx.restore(); ctx.restore();
  ctx.beginPath(); ctx.arc(LX, LY, LR, 0, 7); ctx.lineWidth = 12; ctx.strokeStyle = PAL.preto; ctx.stroke();
  ctx.beginPath(); ctx.arc(LX, LY, LR + 9, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = PAL.amarelo; ctx.stroke();
  // "?" logo depois da borda da lente, em cada caminho
  for (const nm of ['esq', 'meio', 'dir']) {
    const pl = MUNDO.trilhas[nm]; let q = pl[pl.length - 1];
    for (const p of pl) { const [x, y] = MUNDO.proj(cam, p[0], p[1]); if (Math.hypot(x - LX, y - LY) > LR + 62) { q = p; break; } }
    const [x, y] = MUNDO.proj(cam, q[0], q[1]);
    ctx.beginPath(); ctx.arc(x, y, 40, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke();
    txt(ctx, '?', x + 1, y + 3, 60, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center', base: 'middle' });
  }
  // bússola orientada sobre a lente
  drawBussola(ctx, { x: 905, y: 1330, s: 0.74, rot: -0.22, limbo: 0.22, agulha: 0, sombra: 1.2 });
  // cabeçalho da série
  const em = document.getElementById('emblema'); ctx.drawImage(em, 60, 310, 120, 122);
  txt(ctx, 'SÉRIE ESPECIALIDADES', 206, 352, 48, { fam: FONT_T, peso: 800, cor: PAL.branco });
  txt(ctx, 'DOS DESBRAVADORES', 206, 400, 48, { fam: FONT_T, peso: 800, cor: PAL.branco });
  txt(ctx, 'AR-021 · ATIVIDADES RECREATIVAS', 206, 440, 32, { peso: 800, cor: PAL.amarelo });
  // título
  txt(ctx, 'MAPA E', 60, 640, 210, { fam: FONT_T, peso: 800, cor: PAL.branco });
  font(ctx, 800, 230, FONT_T); const wb = ctx.measureText('BÚSSOLA').width;
  ctx.fillStyle = PAL.amarelo; ctx.fillRect(42, 680, wb + 36, 196);
  txt(ctx, 'BÚSSOLA', 60, 846, 230, { fam: FONT_T, peso: 800, cor: PAL.preto });
  // chamada
  rrect(ctx, 640, 520, 400, 120, 26); ctx.fillStyle = PAL.preto; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.amarelo; ctx.stroke();
  txt(ctx, 'SEM SINAL. SEM GPS.', 840, 558, 44, { fam: FONT_T, peso: 800, cor: PAL.branco, align: 'center', base: 'middle' });
  txt(ctx, 'E AGORA?', 840, 608, 48, { fam: FONT_T, peso: 800, cor: PAL.amarelo, align: 'center', base: 'middle' });
  // rodapé (dentro da faixa 4:5)
  txt(ctx, 'Como encontrar o caminho certo?', 540, 1584, 44, { peso: 800, cor: PAL.branco, align: 'center' });
  txt(ctx, 'DISTRITO DE DESBRAVADORES DE AMONTADA', 540, 1626, 30, { peso: 800, cor: PAL.amarelo, align: 'center' });
}
