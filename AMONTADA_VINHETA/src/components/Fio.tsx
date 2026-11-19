import React from 'react';
import { spring } from 'remotion';
import { COLORS, LAYOUT, METRICS } from '../config/brand';
import { T } from '../config/coreografia';
import { FPS, WIDTH } from '../config/timeline';
import type { Layout } from '../lib/layout';
import { EASE, lerp, prog, SPRINGS } from '../lib/motion';

/**
 * O fio rosa — a linha que costura a vinheta inteira:
 * 1) nasce como os três pontos da reticência (um por acerto),
 * 2) os pontos se esticam e viram uma linha que atravessa a tela (revela o título),
 * 3) sobe e vira a régua que acompanha o “em”.
 */
export const Fio: React.FC<{ frame: number; lay: Layout }> = ({ frame, lay }) => {
  const esc = LAYOUT.escalaPontosAbertura * LAYOUT.tamanhoCidade;
  const p = METRICS.ponto;
  const w = p.w * esc;
  const h = p.h * esc;
  const passo = p.passo * esc;
  const esp = LAYOUT.fio;

  const morph = prog(frame, T.fioMorph[0], T.fioMorph[1], EASE.expoOut);
  const sobe = prog(frame, T.sobe[0], T.sobe[1], EASE.empurra);
  const abre = prog(frame, T.emAbre[0], T.emAbre[1], EASE.expoOut);

  const yCentro = lerp(lay.yFioCena2, lay.yFioEm, sobe);
  const esquerda = lerp(lay.x0, lay.x0 + lay.larguraEm + 22, abre);
  const direita = lay.direita;
  const comp = direita - lay.x0;

  const pecas = [0, 1, 2].map((i) => {
    // ponto i: pulo de entrada (mola) no seu acerto
    const s = spring({ frame: frame - T.pontos[i], fps: FPS, config: SPRINGS.ponto });
    const cxPonto = WIDTH / 2 + (i - 1) * passo;
    // destino: um terço do fio
    const a = lay.x0 + (i * comp) / 3;
    // sobreposição crescente entre os segmentos: nenhuma emenda visível durante a fusão
    const b = lay.x0 + ((i + 1) * comp) / 3 + (i < 2 ? 8 * morph : 0);
    const x1 = lerp(cxPonto - (w * s) / 2, a, morph);
    const x2 = lerp(cxPonto + (w * s) / 2, b, morph);
    const alt = lerp(h * s, esp, morph);
    return { x1, x2, alt, visivel: frame >= T.pontos[i] };
  });

  // quando os segmentos já se tocam, o fio vira uma peça só (sem emendas)
  const inteiro = morph >= 0.8;
  const fusao = morph < 1;

  return (
    <g>
      {inteiro ? (
        fusao ? (
          <rect
            x={pecas[0].x1}
            y={yCentro - pecas[0].alt / 2}
            width={pecas[2].x2 - pecas[0].x1}
            height={pecas[0].alt}
            fill={COLORS.rosa}
          />
        ) : (
          <rect x={esquerda} y={yCentro - esp / 2} width={direita - esquerda} height={esp} fill={COLORS.rosa} />
        )
      ) : (
        pecas.map((pc, i) =>
          pc.visivel ? (
            <rect
              key={i}
              x={pc.x1}
              y={yCentro - pc.alt / 2}
              width={Math.max(0, pc.x2 - pc.x1)}
              height={Math.max(0, pc.alt)}
              fill={COLORS.rosa}
            />
          ) : null,
        )
      )}
    </g>
  );
};
