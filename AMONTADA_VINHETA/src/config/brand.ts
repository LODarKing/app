/**
 * Identidade do quadro “Enquanto Isso em Amontada…”.
 * Troque cores, fontes e tamanhos aqui; todos os componentes leem deste arquivo.
 */
export const COLORS = {
  /** Vinho profundo: fundo. Puxado para o vermelho, mas escuro o bastante para o rosa e o batom saltarem. */
  fundo: '#420D20',
  /** Vinho um pouco mais claro: o território de Amontada preenchido no mapa do fundo. */
  fundoClaro: '#541129',
  /** Branco quente, levemente rosado: “Enquanto Isso”, “em”, contornos e linhas finas. */
  branco: '#FBEFEE',
  /** Rosa: cor de destaque — “Amontada…”, o fio, a faixa, o estojo do batom e a cortina. */
  rosa: '#FF86AE',
  /** Vermelho batom: os lábios, a ponta do batom e as bordas da cortina. */
  vermelho: '#E3243B',
  /** Vermelho escuro: sombra do lábio superior, linha da boca, lado do batom. */
  vermelhoEscuro: '#A9142B',
} as const;

export const FONTS = {
  /** Fonte de título: Archivo (variável), peso 900, largura 62,5 % (extracondensada). */
  titulo: {
    family: 'Archivo Vinheta',
    file: 'fonts/Archivo-Variable-wdth-wght.woff2',
    weight: 900,
    /** font-stretch em %; corresponde ao eixo wdth da fonte (62–125). */
    stretch: 62.5,
    weightRange: '100 900',
    stretchRange: '62% 125%',
  },
  /** Fonte de interface: Space Grotesk (variável), usada só no “em”. */
  interface: {
    family: 'Space Grotesk Vinheta',
    file: 'fonts/SpaceGrotesk-Variable-wght.woff2',
    weight: 500,
    weightRange: '300 700',
  },
} as const;

/** Medidas da fonte de título (Archivo 900 / wdth 62,5), em em. Medidas com fontTools. */
export const METRICS = {
  capHeight: 0.686,
  /** O ponto final é um retângulo: 0,143 × 0,179 em, recuado 0,040 em, passo 0,2235 em. */
  ponto: { w: 0.143, h: 0.179, lsb: 0.04, passo: 0.2235 },
  espacoInterfaceX: 0.49,
} as const;

/**
 * Composição final (quadro 1080 × 1920).
 * Bloco de texto entre y 594 e 1187 (centro em y ≈ 890), margens laterais de 88 px, acima do meio da tela,
 * longe da legenda e dos botões do Instagram (parte de baixo e coluna da direita):
 * fica dentro da zona segura dos Reels (250 px livres no alto, 670 px embaixo, 65 px nos lados)
 * e também dentro do recorte 4:5 do feed.
 */
export const LAYOUT = {
  tamanhoBranco: 188,
  tamanhoCidade: 215,
  tamanhoEm: 66,
  /** Linhas de base de cada linha de texto na composição final. */
  base1: 723, // Enquanto
  base2: 907, // Isso
  base3: 989, // em
  base4: 1187, // Amontada…
  /** Na cena 2, “Enquanto Isso” fica sozinho e centralizado: tudo 150 px abaixo. */
  deslocCena2: 150,
  /** Espessura do fio rosa. */
  fio: 4,
  /** Boca: canto superior esquerdo da caixa (400 × 182 unidades) e escala. Centralizada no alto,
   *  acima do título, com espaço à direita para o batom entrar inteiro na tela. */
  boca: { x: 540 - 200 * 1.2, y: 292, escala: 1.2 },
  /** Mapa de Amontada (só o contorno): posição, largura, espessura do traço e opacidade.
   *  Fica atrás do título e desce até a área vazia de baixo, equilibrando a tela. */
  mapa: { x: 150, y: 560, largura: 860, traco: 5, opacidade: 0.7 },
  /** Pontos da abertura: 1,8× os pontos da reticência. */
  escalaPontosAbertura: 1.8,
} as const;
