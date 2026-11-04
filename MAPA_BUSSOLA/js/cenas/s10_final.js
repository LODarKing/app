// Cena 10 — ENCERRAMENTO: volta à floresta (a mesma do início) com a rota completa desenhada; valores em tipografia cinética;
// cartão final com o nome da especialidade, código AR-021 e crédito da narração. Sem emblema: não há arquivo oficial de referência.
'use strict';
const A10 = (() => {
  const id = 's10', h = (t, tipo, g) => hit(id, t, tipo, g);
  return {
    caminho: h(F(id, 'caminho'), 'marca'), atencao: h(F(id, 'atenção'), 'marca'), autonomia: h(F(id, 'autonomia'), 'marca'), resp: h(F(id, 'responsabilidade'), 'marca'),
    reuna: h(F(id, 'reúna'), 'marca'), pratique: h(F(id, 'pratique'), 'marca'), cartao: h(F(id, 'conquiste') - 0.2, 'deslize'), nome: h(F(id, 'Mapa'), 'final'), fim: CENAS[id].dur,
  };
})();
function renderS10(ctx, t) {
  const a = A10, { P } = PISTA;
  const k = eio(prog(t, 0, a.cartao));
  const cam = { cx: lerp(-40, -60, k), cy: lerp(-80, -150, k), z: lerp(0.6, 0.53, k), r: lerp(0.03, 0, k) };
  MUNDO.drawFloresta(ctx, cam);
  // rota completa sobre a floresta
  const kr = eo3(prog(t, 0.1, 2.6));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = P.map((p) => MUNDO.proj(cam, p[0], p[1]));
  const tot = pts.length - 1, ate = kr * tot;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= Math.ceil(ate); i++) { const f = Math.min(1, ate - (i - 1)); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); }
  ctx.strokeStyle = PAL.preto; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = PAL.amarelo; ctx.lineWidth = 8; ctx.stroke();
  for (let i = 1; i < pts.length; i++) { if (ate < i - 0.05) break; const kp = eback(clamp((ate - i + 0.05) * 2.5), 1.7); ctx.save(); ctx.translate(pts[i][0], pts[i][1]); ctx.scale(kp, kp); ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fillStyle = PAL.amarelo; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.preto; ctx.stroke(); txt(ctx, String(i), 0, 2, 28, { fam: FONT_T, peso: 800, cor: PAL.preto, align: 'center', base: 'middle' }); ctx.restore(); }
  // tipografia cinética
  const o1 = a.reuna - 0.3, o2 = a.cartao;
  marca(ctx, t, 'MAIS QUE ENCONTRAR', 64, 250, 92, a.caminho, { out: o1 });
  marca(ctx, t, 'UM CAMINHO', 64, 350, 92, a.caminho + 0.15, { out: o1 });
  marca(ctx, t, 'ATENÇÃO', 64, 590, 120, a.atencao, { out: o1 });
  marca(ctx, t, 'AUTONOMIA', 64, 730, 120, a.autonomia, { out: o1 });
  marca(ctx, t, 'RESPONSABILIDADE', 64, 870, 120, a.resp, { out: o1 });
  marca(ctx, t, 'REÚNA SEU CLUBE', 64, 590, 110, a.reuna, { out: o2 });
  marca(ctx, t, 'PRATIQUE COM', 64, 730, 110, a.pratique, { out: o2 });
  marca(ctx, t, 'SEGURANÇA', 64, 870, 110, a.pratique + 0.15, { out: o2 });
  // cartão final
  const kc = eo5(prog(t, a.cartao, a.cartao + 0.6));
  if (kc > 0) {
    const y0 = lerp(1950, 330, kc);
    ctx.save(); ctx.translate(0, y0 - 330);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(14, 352, W - 28, 1010);
    ctx.fillStyle = PAL.areia; ctx.fillRect(0, 330, W, 1010);
    // curvas de nível discretas no cartão
    ctx.save(); ctx.beginPath(); ctx.rect(0, 330, W, 1010); ctx.clip(); ctx.translate(0, 0);
    MUNDO.applyCam(ctx, { cx: -560, cy: -760, z: 0.9, r: 0 }); ctx.strokeStyle = 'rgba(63,106,74,0.22)'; ctx.lineWidth = 2;
    ctx.beginPath(); for (const c of MUNDO.curvas) { if (c.lv % 20) continue; c.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); } ctx.stroke(); ctx.restore();
    ctx.restore();
    if (kc >= 0.98) {
      sobe(ctx, t, a.cartao + 0.5, 'ESPECIALIDADE DE', 70, 470, 42, { peso: 800, cor: PAL.preto });
      marca(ctx, t, 'MAPA E', 64, 650, 180, a.cartao + 0.6, { fundo: PAL.areia });
      marca(ctx, t, 'BÚSSOLA', 64, 830, 180, a.nome);
      const kchip = pop(t, a.nome + 0.3);
      if (kchip > 0) {
        ctx.save(); ctx.translate(70, 900); ctx.scale(kchip, kchip); rrect(ctx, 0, 0, 230, 72, 36); ctx.fillStyle = PAL.preto; ctx.fill();
        txt(ctx, 'AR-021', 115, 38, 44, { fam: FONT_T, peso: 800, cor: PAL.amarelo, align: 'center', base: 'middle' }); ctx.restore();
        sobe(ctx, t, a.nome + 0.4, 'Atividades Recreativas', 320, 952, 38, { peso: 700, cor: PAL.preto });
      }
      // bússola pequena, orientada (agulha no Norte)
      const kb = eo5(prog(t, a.cartao + 0.7, a.cartao + 1.3));
      if (kb > 0) drawBussola(ctx, { x: lerp(1300, 820, kb), y: 1120, s: 0.55, rot: lerp(0.8, 0.12, kb), limbo: 0.12, agulha: 0.25 * Math.exp(-3 * Math.max(0, t - a.cartao - 1.3)) * Math.cos(9 * Math.max(0, t - a.cartao - 1.3)) });
      sobe(ctx, t, a.nome + 0.7, 'Narração: Ítalo Marinho', 70, 1150, 42, { peso: 800, cor: PAL.preto });
      sobe(ctx, t, a.nome + 0.85, 'Desbravadores · conteúdo dos requisitos oficiais', 70, 1205, 28, { peso: 700, cor: PAL.preto });
      sobe(ctx, t, a.nome + 0.95, 'A prática de campo é feita com seu clube e instrutor.', 70, 1250, 28, { peso: 700, cor: PAL.preto });
    }
  }
}
RENDER.s10 = renderS10;
