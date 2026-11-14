// Legendas sincronizadas com a locução real (tempo de cada palavra vindo do alinhamento da ElevenLabs).
// Até 2 linhas, ~5 palavras por linha; palavra falada em ocre; palavras-chave em caixa azul-lápis.
// Faixa: y 1428–1610 (fora do topo de 180 px e do rodapé de 280 px do Reels).
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, '').trim();
const LEG = (() => {
  const P = TL.palavras.map(([w, a, b]) => ({ w, a, b })); let i = 0;
  const chave = new Set();
  for (const frase of CFG.chaves) { const fs = frase.split(' '); for (let k = 0; k + fs.length <= P.length; k++) if (fs.every((f, j) => norm(P[k + j].w) === f)) fs.forEach((_, j) => chave.add(k + j)); }
  const blocos = CFG.blocosLegenda.map((linhas) => ({ linhas: linhas.map((l) => l.split(' ').map((w) => { const idx = i++; if (!P[idx] || norm(P[idx].w) !== norm(w)) throw new Error(`legenda fora de ordem: "${w}" × "${P[idx] && P[idx].w}"`); return { ...P[idx], w, idx, chave: chave.has(idx) }; })) }));
  blocos.forEach((b, k) => { const ws = b.linhas.flat(); b.a = ws[0].a - 0.08; b.b = Math.min(k + 1 < blocos.length ? blocos[k + 1].linhas[0][0].a - 0.08 : 99, ws[ws.length - 1].b + 0.55); });
  return blocos;
})();
function legenda(t) {
  const L = CFG.legenda, bl = LEG.find((b) => t >= b.a && t < b.b); if (!bl) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const k = ease.back(prog(t, bl.a, bl.a + 0.16)), dy = (1 - k) * 26, lh = L.px * L.lh;
  const n = bl.linhas.length, y0 = L.yTopo + L.px * 0.9 + (n === 1 ? lh * 0.5 : 0);
  bl.linhas.forEach((ws, li) => {
    const larg = ws.map((w) => largura(w.w, L.px, 'ui', 900)), esp = L.px * 0.3, tot = larg.reduce((p, q) => p + q, 0) + esp * (ws.length - 1);
    let x = W / 2 - tot / 2; const y = y0 + li * lh + dy;
    // caixa azul-lápis contínua sob as palavras-chave vizinhas
    let caixa = null; const caixas = [];
    ws.forEach((w, j) => { if (w.chave) { if (!caixa) caixa = { x0: x }; caixa.x1 = x + larg[j]; } else if (caixa) { caixas.push(caixa); caixa = null; } x += larg[j] + esp; });
    if (caixa) caixas.push(caixa);
    for (const c of caixas) { ctx.save(); ctx.translate(0, 0); rr(c.x0 - 16, y - L.px * 0.86, c.x1 - c.x0 + 32, L.px * 1.12, 12); ctx.fillStyle = C.lapis; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
    x = W / 2 - tot / 2;
    ws.forEach((w, j) => {
      const falando = t >= w.a && t < (w.b + 0.06), s = falando ? 1.1 : 1, cx = x + larg[j] / 2;
      ctx.save(); ctx.translate(cx, y - L.px * 0.32); ctx.scale(s, s);
      texto(w.w, 0, L.px * 0.32, { px: L.px, peso: 900, al: 'center', cor: falando ? C.ouro : C.linho, contorno: w.chave ? 0 : 13, corContorno: C.tinta });
      ctx.restore(); x += larg[j] + esp;
    });
  });
}
