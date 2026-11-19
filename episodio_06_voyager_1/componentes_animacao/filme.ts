// Ponto de entrada do filme: criar(canvas) -> { seek(t) }. Usado pela página de render (window.seek) e pelo Remotion.
import { W, H, T, M, COR, mulberry32, FONTES, Ctx } from './core';
import { Espaco } from './espaco3d';
import { criarVoyager } from './voyager';
import * as THREE from 'three';
import { cena1, cena2, cena3, setVoyager } from './cenas_abertura';
import { SPR, cenaEscalaSinal, cena5 } from './cenas_meio';
import { cena6, cena7 } from './cenas_final';
import { criarJupiter, criarSaturno } from './planetas';
import { legendas } from './legendas';

export { T };
export async function carregarFontes(base: string) {
  await Promise.all(FONTES.map(async ([fam, arq, peso]) => { const f = new FontFace(fam, `url(${base}/${arq})`, { weight: peso }); await f.load(); (document as any).fonts.add(f); }));
}

export async function criar(canvas: HTMLCanvasElement, opts: { fontes: string; texturas: string; legenda?: boolean }) {
  await carregarFontes(opts.fontes);
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d') as Ctx;
  const e = await Espaco.criar(opts.texturas); const voy = criarVoyager(); setVoyager(voy);
  // imagens fixas (renderizadas em 3D uma única vez) para os infográficos
  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  e.terra.rotation.set(0.35, 6.1, 0);
  SPR.terra = e.imagem([], { pos: V3(0.9, 0.5, 3.2), alvo: V3(0, 0, 0), fov: 40 }, V3(1, 0.3, 0.8), 512, { terra: true });
  const az = 140 * Math.PI / 180, el = 18 * Math.PI / 180;
  SPR.voyager = e.imagem([voy], { pos: V3(Math.sin(az) * Math.cos(el) * 27, Math.sin(el) * 27, -Math.cos(az) * Math.cos(el) * 27), alvo: V3(0.6, 0.9, -1.0), fov: 30 }, V3(0, 0, 1), 768, { apoio: 0.6 });
  SPR.jupiter = e.imagem([criarJupiter(V3(1, 0.1, 0.6))], { pos: V3(0, 0, 3.4), alvo: V3(0, 0, 0), fov: 40 }, V3(1, 0.1, 0.6), 512);
  SPR.saturno = e.imagem([criarSaturno(V3(1, 0.2, 0.7))], { pos: V3(0, 0, 6.2), alvo: V3(0, 0, 0), fov: 46 }, V3(1, 0.2, 0.7), 768);
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
    else if (cena.id === 's3' && t < M.recuo) cena3(c, e, t);
    else if (cena.id === 's3' || cena.id === 's4') cenaEscalaSinal(c, e, t);
    else if (cena.id === 's5') cena5(c, e, t);
    else if (cena.id === 's6') cena6(c, e, t);
    else cena7(c, e, t);
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
