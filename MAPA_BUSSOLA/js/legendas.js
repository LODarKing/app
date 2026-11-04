// Legendas dinâmicas: blocos de 2 a 5 palavras, palavra a palavra, destaques em amarelo.
// Fonte da verdade: lista de palavras com início/fim (no piloto, distribuídas pela guia provisória; no final, alinhamento do áudio).
'use strict';
const LEG = (() => {
  const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  // palavras com tempo: dentro de cada fala, tempo proporcional ao nº de letras (+1)
  const palavras = [];
  if (TL.palavras) palavras.push(...TL.palavras);
  else for (const f of TL.falas) {
    const ws = f.txt.split(/\s+/), pesos = ws.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.5), tot = pesos.reduce((a, b) => a + b, 0);
    let t = f.t0; ws.forEach((w, i) => { const d = ((f.t1 - f.t0) * pesos[i]) / tot; palavras.push({ w, t0: t, t1: t + d }); t += d; });
  }
  // blocos
  const blocos = []; let wi = 0;
  for (const b of TL.blocos) {
    const n = b.split(/\s+/).length, ws = palavras.slice(wi, wi + n); wi += n;
    blocos.push({ ws, t0: ws[0].t0, t1: ws[ws.length - 1].t1 });
  }
  blocos.forEach((b, i) => { const nx = blocos[i + 1]; b.fim = nx ? Math.min(nx.t0, b.t1 + 0.6) : b.t1 + 0.5; });
  const dest = new Set(TL.destaques.map(norm));

  const Y = 1440, PX = 64, MAXW = 860, XC = 500; // centro deslocado p/ esquerda: fora da coluna de botões do Instagram
  function draw(ctx, t) {
    const b = blocos.find((b) => t >= b.t0 - 0.04 && t < b.fim);
    if (!b) return;
    font(ctx, 800, PX); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const sp = ctx.measureText(' ').width + 8, ws = b.ws.map((p) => ({ ...p, wd: ctx.measureText(p.w).width }));
    // quebra em até 2 linhas
    const linhas = [[]]; let lw = 0;
    for (const p of ws) { if (lw + p.wd > MAXW && linhas[linhas.length - 1].length) { linhas.push([]); lw = 0; } linhas[linhas.length - 1].push(p); lw += p.wd + sp; }
    linhas.forEach((ln, li) => {
      const tot = ln.reduce((a, p) => a + p.wd, 0) + sp * (ln.length - 1); let x = XC - tot / 2;
      const y = Y + (li - (linhas.length - 1)) * PX * 1.12;
      for (const p of ln) {
        const k = eo3(prog(t, p.t0 - 0.05, p.t0 + 0.12));
        if (k > 0) {
          const hl = dest.has(norm(p.w)), dy = (1 - k) * 18, sc = hl ? 1 + 0.05 * Math.sin(Math.PI * prog(t, p.t0, p.t0 + 0.3)) : 1;
          ctx.save(); ctx.translate(x + p.wd / 2, y + dy); ctx.scale(sc, sc); ctx.globalAlpha = k;
          ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(10,12,11,0.92)'; ctx.strokeText(p.w, -p.wd / 2, 0);
          ctx.fillStyle = hl ? PAL.amarelo : PAL.branco; ctx.fillText(p.w, -p.wd / 2, 0);
          ctx.restore();
        }
        x += p.wd + sp;
      }
    });
  }
  return { draw, palavras, blocos };
})();
