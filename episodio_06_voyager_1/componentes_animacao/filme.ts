// Ponto de entrada do filme: criar(canvas) -> { seek(t) }. Usado pela página de render (window.seek) e pelo Remotion.
import { W, H, T, M, COR, mulberry32, FONTES, Ctx } from './core';
import { Espaco } from './espaco3d';
import { criarVoyager } from './voyager';
import { cena1, cena2, cena3, setVoyager } from './cenas_abertura';
import { legendas } from './legendas';

export { T };
export async function carregarFontes(base: string) {
  await Promise.all(FONTES.map(async ([fam, arq, peso]) => { const f = new FontFace(fam, `url(${base}/${arq})`, { weight: peso }); await f.load(); (document as any).fonts.add(f); }));
}

export async function criar(canvas: HTMLCanvasElement, opts: { fontes: string; texturas: string; legenda?: boolean }) {
  await carregarFontes(opts.fontes);
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d') as Ctx;
  const e = await Espaco.criar(opts.texturas); setVoyager(criarVoyager());
  // grão de filme: 4 texturas fixas com semente; a escolhida depende só do número do quadro
  const graos = [0, 1, 2, 3].map((s) => {
    const g = document.createElement('canvas'); g.width = 540; g.height = 960; const gc = g.getContext('2d')!; const im = gc.createImageData(540, 960); const r = mulberry32(900 + s);
    for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    gc.putImageData(im, 0, 0); return g;
  });
  function seek(t: number) {
    c.save(); c.fillStyle = COR.fundo; c.fillRect(0, 0, W, H);
    const cena = T.cenas.find((s) => t >= s.t0 && t < s.t1) ?? T.cenas[T.cenas.length - 1];
    if (cena.id === 's1') cena1(c, e, t);
    else if (cena.id === 's2') cena2(c, e, t);
    else cena3(c, e, t);
    // vinheta suave de lente e grão
    const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.5, H * 0.75); v.addColorStop(0, 'rgba(5,8,16,0)'); v.addColorStop(1, 'rgba(5,8,16,0.55)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
    const f = Math.round(t * 30), r = mulberry32(f + 11);
    c.globalAlpha = 0.045; c.globalCompositeOperation = 'overlay'; c.drawImage(graos[f % 4], -Math.floor(r() * 60), -Math.floor(r() * 60), W + 120, H + 120);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    if (opts.legenda !== false) legendas(c, t);
    c.restore();
  }
  return { seek, info: () => ({ dur: T.dur, fps: T.fps, cenas: T.cenas, marcos: M }) };
}
