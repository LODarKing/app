// Design system do projeto (bíblia de arte em código). Tudo que se ajusta sem mexer no desenho fica aqui.
const CFG = {
  W: 1080, H: 1920, fps: 30, dur: 10,
  // Pigmentos da pintura egípcia + basalto da estela. Destaque de interface: ocre (único); azul-lápis só nas palavras-chave.
  cor: {
    papiro: '#E4CB93', papiroClaro: '#F0DFB1', papiroEsc: '#C7A464', fibra: '#A9844C',
    tinta: '#26170D',            // contorno e texto (tinta de fuligem)
    ocre: '#D9962A',             // DESTAQUE (palavra falada, sublinhados, carimbo de achado)
    ouro: '#E9BC4C', terracota: '#A8472A', lapis: '#22408A', turquesa: '#2E9C92',
    basalto: '#34373B', basaltoClaro: '#4D5258', basaltoEsc: '#222427',
    areia: '#D7B475', areiaEsc: '#B48A50', terra: '#8C5E34',
    linho: '#F2EBD8', pele: '#A44E2C', cabelo: '#17120F', bronze: '#B07A35',
  },
  fonte: { titulo: "'Cinzel'", ui: "'InterUI'", fen: "'Fen'", hier: "'Hier'" },
  // Legenda: faixa fora do topo (180 px) e do rodapé (280 px) do Reels; até 2 linhas, ~5 palavras por linha
  legenda: { px: 64, yTopo: 1428, larguraMax: 860, lh: 1.16 },
  // Blocos de legenda (a ordem segue as palavras da locução; a quebra de linha é manual)
  blocosLegenda: [
    ['Uma pedra de quase', 'três mil anos'],
    ['menciona a', 'casa de Davi.'],
    ['E não é lenda:'],
    ['é arqueologia', 'bíblica!'],
  ],
  chaves: ['casa de davi', 'arqueologia biblica'],   // palavras-chave em caixa azul-lápis
  textos: {
    gancho: ['E SE FOSSE', 'REAL?'],
    aviso: 'Estela de Tel Dan · séc. IX a.C. — ilustração',
    destaque: 'CASA DE DAVI',
    destaqueSub: '“bytdwd”, em aramaico antigo',
    dan: 'TEL DAN', danSub: 'norte do antigo Israel',
    achada: 'achada em Tel Dan, 1993',
    carimbo: 'VESTÍGIO HISTÓRICO',
    titulo: ['ARQUEOLOGIA', 'BÍBLICA'],
    subtitulo: 'A história sob nossos pés',
  },
};
