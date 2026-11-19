import React from 'react';
import { spring } from 'remotion';
import { COLORS, FONTS, LAYOUT } from '../config/brand';
import { T } from '../config/coreografia';
import { FPS, WIDTH } from '../config/timeline';
import { TXT, type Layout } from '../lib/layout';
import { EASE, lerp, prog, SPRINGS } from '../lib/motion';

const estiloTitulo: React.CSSProperties = {
  fontFamily: `"${FONTS.titulo.family}"`,
  fontWeight: FONTS.titulo.weight,
  fontStretch: `${FONTS.titulo.stretch}%`,
  fontKerning: 'none', // as posições já trazem o kerning medido
};

/**
 * Uma linha do título que sobe de trás de uma máscara horizontal,
 * letra por letra (da esquerda para a direita), com overshoot controlado da mola
 * e o espaçamento entre letras se fechando junto.
 */
const LinhaQueSobe: React.FC<{
  frame: number;
  texto: string;
  xs: number[];
  x: number;
  base: number;
  inicio: number;
  mascara: number;
  id: string;
}> = ({ frame, texto, xs, x, base, inicio, mascara, id }) => {
  const tam = LAYOUT.tamanhoBranco;
  const dist = mascara - base + 0.74 * tam;
  return (
    <g>
      <clipPath id={id}>
        <rect x={0} y={0} width={WIDTH} height={mascara} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {texto.split('').map((ch, i) => {
          const s = spring({ frame: frame - inicio - i * T.stagger, fps: FPS, config: SPRINGS.impacto });
          const dy = (1 - s) * dist;
          const abre = (1 - s) * 0.06 * tam * i; // espaçamento extra que se fecha
          return (
            <text key={i} x={x + xs[i] + abre} y={base + dy} fill={COLORS.branco} fontSize={tam} style={estiloTitulo}>
              {ch}
            </text>
          );
        })}
      </g>
    </g>
  );
};

/** “Enquanto Isso” (duas linhas) + o “em”. */
export const Linhas: React.FC<{ frame: number; lay: Layout }> = ({ frame, lay }) => {
  const sobe = prog(frame, T.sobe[0], T.sobe[1], EASE.empurra);
  const dy = lerp(LAYOUT.deslocCena2, 0, sobe);
  const abre = prog(frame, T.emAbre[0], T.emAbre[1], EASE.expoOut);
  return (
    <g>
      <g transform={`translate(0 ${dy})`}>
        <LinhaQueSobe
          id="m1"
          frame={frame}
          texto={TXT.linha1}
          xs={lay.xs1}
          x={lay.xBranco}
          base={LAYOUT.base1}
          inicio={T.linha1}
          mascara={LAYOUT.base1 + 0.26 * LAYOUT.tamanhoBranco}
          // a máscara de “Enquanto” fica sob o “q”, com folga para a descendente
        />
        <LinhaQueSobe
          id="m2"
          frame={frame}
          texto={TXT.linha2}
          xs={lay.xs2}
          x={lay.xBranco}
          base={LAYOUT.base2}
          inicio={T.linha2}
          mascara={lay.yFioCena2 - LAYOUT.deslocCena2 - LAYOUT.fio / 2}
        />
      </g>
      {/* “em”: sai de trás da ponta esquerda do fio quando ele recua */}
      <clipPath id="mEm">
        <rect x={0} y={0} width={Math.max(0, lerp(lay.x0 - 40, lay.x0 + lay.larguraEm + 6, abre))} height={1920} />
      </clipPath>
      <g clipPath="url(#mEm)">
        <text
          x={lay.x0 - 0.052 * LAYOUT.tamanhoEm + lerp(-26, 0, abre)}
          y={LAYOUT.base3}
          fill={COLORS.branco}
          fillOpacity={0.82}
          fontSize={LAYOUT.tamanhoEm}
          style={{ fontFamily: `"${FONTS.interface.family}"`, fontWeight: FONTS.interface.weight }}
        >
          {TXT.ligacao}
        </text>
      </g>
    </g>
  );
};

export { estiloTitulo };
