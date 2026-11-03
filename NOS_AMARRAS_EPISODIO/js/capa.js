// Capa do Instagram (Reels 9:16, 1080×1920) no estilo do episódio: o gancho virou imagem — o nó oito e a corda que
// escreve "NÓS E AMARRAS". Tudo o que importa fica na faixa central 4:5 (1080×1350, y 285–1635); fora dela, só o feltro verde
// e a parte fixa da corda saindo pelo alto.
window.capa = () => {
  const B0 = 285, B1 = 1635;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; fundo();
  // ---------- cena principal: o quadro final do gancho (nó + título), reduzido e encaixado na faixa
  const sc = TL.cenas[0], esc = 0.68, ty = 470 - 190 * esc;
  BASE = new DOMMatrix([esc, 0, 0, esc, W / 2 * (1 - esc), ty]);
  // a parte fixa continua até a borda de cima (fora da faixa 4:5 é só fundo)
  camera(1, W / 2, H / 2);
  const r0 = NOS.gancho(), p0 = em(r0, 0), topo = corda([[p0.x, -900], [p0.x, (p0.y - 900) / 2], [p0.x, p0.y + 2]], { w: r0.w, cache: 'capaTopo' });
  desenhaCorda(topo, {});
  CENAS.s1(sc.dur - 0.01, sc);
  BASE = null; ctx.setTransform(1, 0, 0, 1, 0, 0);
  // ---------- cabeçalho: emblema oficial à esquerda, série no meio, insígnia oficial à direita
  const emb = document.getElementById('emblema'), ins = document.getElementById('insignia');
  ctx.save(); ctx.translate(132, B0 + 92); ctx.rotate(-0.05); ctx.drawImage(emb, -62, -63, 124, 127); ctx.restore();
  ctx.save(); ctx.translate(950, B0 + 92); ctx.rotate(0.06);
  ctx.fillStyle = C.contorno; ctx.beginPath(); ctx.arc(6, 8, 86, 0, 7); ctx.fill(); ctx.drawImage(ins, -88, -88, 176, 176); ctx.restore();
  const fio = (txt, x, y, px, cor, lw = 9) => { ctx.font = font(px, 'ui', 900); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = C.contorno; ctx.strokeText(txt, x, y); ctx.fillStyle = cor; ctx.fillText(txt, x, y); };
  fio('SÉRIE ESPECIALIDADES', 540, B0 + 62, 36, C.texto); fio('DOS DESBRAVADORES', 540, B0 + 104, 36, C.texto);
  fio('ESPECIALIDADE DE NÓS E AMARRAS', 540, B0 + 150, 32, C.destaque);
  // ---------- chamada (faixa de destaque) e gancho
  ctx.save(); ctx.translate(540, B1 - 250); ctx.rotate(-0.025);
  ctx.font = font(66, 'titulo', 700); const ch = 'TUDO COMEÇA NA CORDA!', cw = ctx.measureText(ch).width;
  ctx.fillStyle = C.contorno; rr(-cw / 2 - 40 + 10, -62 + 12, cw + 80, 96, 16); ctx.fill();
  ctx.fillStyle = C.destaque; rr(-cw / 2 - 40, -62, cw + 80, 96, 16); ctx.fill(); ctx.strokeStyle = C.contorno; ctx.lineWidth = 6; ctx.stroke();
  texto(ch, 0, 10, { px: 66, fam: 'titulo', peso: 700, cor: C.contorno, al: 'center' });
  ctx.restore();
  fio('Antes de aprender um nó,', 540, B1 - 140, 44, C.texto, 11);
  fio('você precisa entender a corda!', 540, B1 - 88, 44, C.destaque, 11);
  ctx.font = font(30, 'ui', 800); ctx.textAlign = 'center'; ctx.fillStyle = C.texto; ctx.fillText('DISTRITO DE DESBRAVADORES DE AMONTADA', 540, B1 - 28);
};
