// Legendas dinâmicas a partir da transcrição alinhada (tempos por palavra).
// Branco; destaques em ciano (sinal, sonda) e amarelo (datas, distâncias). Margens seguras de Shorts:
// bloco centrado em x = 510 com largura máx. 800 px (livre da coluna de botões à direita) e base em y ≈ 1400–1480
// (acima da faixa de título/descrição do app). Animação discreta: o bloco sobe 14 px ao entrar;
// a palavra ainda não dita aparece a 45 %, a dita a 100 %.
import { T, COR, RGB, rgba, F, seg, eOut3, largura, Ctx } from './core';

const CX = 510, Y1 = 1408, LH = 76, PX = 58;
export function legendas(c: Ctx, t: number) {
  const blk = T.legendas.find((b) => t >= b.ini && t < b.fim);
  if (!blk || blk.queimar === false) return;
  const kIn = eOut3(seg(t, blk.ini, blk.ini + 0.16)), kOut = seg(t, blk.fim - 0.12, blk.fim);
  const linhas = Math.max(...blk.palavras.map((w) => w.linha)) + 1;
  const dy = (1 - kIn) * 14 - kOut * 8, alfa = kIn * (1 - kOut);
  const font = F.titulo(PX, 700);
  for (let li = 0; li < linhas; li++) {
    const ws = blk.palavras.filter((w) => w.linha === li);
    const espaco = largura(c, ' ', font);
    const larg = ws.reduce((s, w) => s + largura(c, w.t, font), 0) + espaco * (ws.length - 1);
    let x = CX - larg / 2; const y = Y1 + (li - (linhas - 1)) * LH + (linhas === 1 ? 0 : LH / 2) + dy;
    for (const w of ws) {
      const dita = t >= w.ini - 0.03, cor = w.d === 'c' ? RGB.ciano : w.d === 'a' ? RGB.amarelo : RGB.branco;
      c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.shadowColor = 'rgba(9,14,26,0.9)'; c.shadowBlur = 14; c.shadowOffsetY = 3;
      c.fillStyle = rgba(cor, alfa * (dita ? 1 : 0.45)); c.fillText(w.t, x, y);
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
      x += largura(c, w.t, font) + espaco;
    }
  }
}
