/**
 * Identidade do quadro “Enquanto Isso em Amontada…”.
 * Troque cores, fontes e tamanhos aqui; todos os componentes leem deste arquivo.
 */
export const COLORS = {
  /** Azul-petróleo escuro: fundo. */
  petroleo: '#152A31',
  /** Tom um pouco mais claro do petróleo, para as linhas e formas do fundo. */
  petroleoClaro: '#1E3A43',
  /** Branco levemente quente: “Enquanto Isso”, “em”, linhas finas. */
  branco: '#F5F3ED',
  /** Amarelo-dourado: “Amontada…”, o fio, o bloco e a cortina de saída. */
  dourado: '#F5C451',
  /** Coral de apoio, em pequenas quantidades: o marcador do fio e a borda da cortina. */
  coral: '#EF715B',
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
  tamanhoDourado: 215,
  tamanhoEm: 66,
  /** Linhas de base de cada linha de texto na composição final. */
  base1: 723, // Enquanto
  base2: 907, // Isso
  base3: 989, // em
  base4: 1187, // Amontada…
  /** Na cena 2, “Enquanto Isso” fica sozinho e centralizado: tudo 150 px abaixo. */
  deslocCena2: 150,
  /** Espessura do fio dourado. */
  fio: 4,
  /** Pontos da abertura: 1,8× os pontos da reticência. */
  escalaPontosAbertura: 1.8,
} as const;
