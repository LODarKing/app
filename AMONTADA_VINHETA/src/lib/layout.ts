import { LAYOUT, METRICS } from '../config/brand';
import { WIDTH } from '../config/timeline';
import { glyphPositions } from './measure';

export const TXT = {
  linha1: 'Enquanto',
  linha2: 'Isso',
  ligacao: 'em',
  cidade: 'Amontada',
  // a reticência “…” é desenhada como três retângulos idênticos aos do glifo da fonte,
  // para que cada ponto possa ser animado.
} as const;

export type Layout = ReturnType<typeof computeLayout>;

/** Geometria da composição final. Chamada depois que as fontes carregaram. */
export const computeLayout = () => {
  const L = LAYOUT;
  const g = L.tamanhoDourado;
  const xsCidade = glyphPositions(TXT.cidade, g);
  const larguraCidade = xsCidade[xsCidade.length - 1];
  const p = METRICS.ponto;
  // fim visual do 3º ponto
  const larguraBloco = larguraCidade + (p.lsb + 2 * p.passo + p.w) * g;
  const x0 = Math.round((WIDTH - larguraBloco) / 2);
  // alinhamento óptico: E e I têm 0,0405 em de margem lateral; o A, zero
  const lsbBranco = 0.0405 * L.tamanhoBranco;
  const pontos = [0, 1, 2].map((k) => ({
    x: x0 + larguraCidade + (p.lsb + k * p.passo) * g,
    y: L.base4 - p.h * g,
    w: p.w * g,
    h: p.h * g,
  }));
  const larguraEm = ((584 + 857) / 1000) * L.tamanhoEm; // avanços de “e” e “m” na Space Grotesk 500
  const xhEm = 0.486 * L.tamanhoEm;
  return {
    x0,
    xBranco: x0 - lsbBranco,
    larguraBloco,
    direita: x0 + larguraBloco,
    xsCidade,
    xs1: glyphPositions(TXT.linha1, L.tamanhoBranco),
    xs2: glyphPositions(TXT.linha2, L.tamanhoBranco),
    pontos,
    larguraEm,
    xhEm,
    /** centro vertical do fio quando vira a régua do “em” */
    yFioEm: L.base3 - xhEm / 2,
    /** centro vertical do fio na cena 2 (logo abaixo de “Isso”) */
    yFioCena2: L.base2 + L.deslocCena2 + 36,
    capBranco: METRICS.capHeight * L.tamanhoBranco,
    capDourado: METRICS.capHeight * g,
  };
};
