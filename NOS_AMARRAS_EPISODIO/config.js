// Configuração editável do episódio: cores, fontes, textos, tempos das cenas e arquivos de áudio.
// Mudar um valor aqui e renderizar de novo — não é preciso mexer no desenho das cenas.
const CFG = {
  W: 1080, H: 1920, fps: 30,
  // margens para a interface do Instagram (Reels)
  safe: { top: 120, bottom: 280, side: 90 },
  // paleta da insígnia oficial da especialidade (cores medidas na imagem enviada): feltro verde + bordado branco-prata
  cor: {
    fundo: '#2D5D3C', fundoEsc: '#1C4329', fundoClaro: '#3E7A50',   // feltro verde (mediana, sombra e luz)
    creme: '#ECEBDF', cremeSombra: '#B8B9B0', contorno: '#0E2716',     // corda = linha do bordado; contorno verde-escuro
    destaque: '#F4C04E',          // amarelo: a única cor de destaque (contrasta com o verde)
    petroleo: '#8EC3EA',          // corda restante / cordão 1 (azul-céu: o petróleo sumia no verde)
    coral: '#E7765D',             // chicote / cordão 3
    ceu: '#8EC3EA',               // segunda corda
    texto: '#F4F5EE', textoSuave: '#C9DACB',
  },
  // os 3 cordões têm sempre as mesmas cores (do começo ao fim do vídeo)
  cordoes: ['#8EC3EA', '#F4C04E', '#E7765D'],
  fonte: { titulo: 'Zilla', ui: 'InterUI' },
  legenda: { yTopo: 1452, tamanho: 54, larguraMax: 880, linhasMax: 2 },
  bpm: 100,
  // ---------------------------------------------------------------- piloto (10 s, tempos provisórios, sem voz)
  piloto: {
    dur: 10.0,
    titulo: ['NÓS E', 'AMARRAS'],
    rotulos: { corda: 'CORDA', cordoes: '3 CORDÕES', nota3: '"3 fios" = 3 cordões', fios: 'FIOS', fibras: 'FIBRAS' },
    // tempos (s) — caem na grade de 100 bpm (batida = 0,6 s)
    t: { noFim: 2.4, tituloFim: 4.2, zoom0: 4.8, zoom1: 6.0, abre1: 7.2, fios1: 8.4 },
    // legendas provisórias = texto do roteiro proposto (a gravação real substitui)
    legendas: [
      [0.15, 3.30, 'Antes de aprender um nó, você precisa entender a corda!'],
      [3.45, 4.95, 'Bem-vindo a Nós e Amarras.'],
      [5.30, 7.75, 'A corda de três fios tem três cordões torcidos juntos.'],
      [7.85, 9.95, 'Cada cordão é feito de fios, e cada fio, de fibras.'],
    ],
  },
  // ---------------------------------------------------------------- episódio: uma cena por arquivo de narração
  // extra = segundos de imagem depois da fala (pausa para observar / encerramento); vo = início da fala na cena
  vo: 0.15,
  cenas: [
    { id: 's1', fala: 'cena01', extra: 0.7 }, { id: 's2', fala: 'cena02', extra: 0.6 }, { id: 's3', fala: 'cena03', extra: 0.7 },
    { id: 's4', fala: 'cena04', extra: 0.6 }, { id: 's5', fala: 'cena05', extra: 0.5 }, { id: 's6', fala: 'cena06', extra: 0.6 },
    { id: 's7', fala: 'cena07', extra: 0.7 }, { id: 's8', fala: 'cena08', extra: 0.8 }, { id: 's9', fala: 'cena09', extra: 3.6 },
  ],
  // quebras de legenda forçadas: depois destas palavras (por cena)
  quebras: { s1: ['Amontada'], s7: ['paus,'], s3: ['emenda,'] },
  // grafia das legendas (o reconhecedor de fala erra algumas palavras; a legenda segue o que foi DITO)
  grafia: [
    ['Ítalo Distrital', 'Ítalo, Distrital'], ['bem vindos', 'bem-vindos'], ['Amontada e', 'Amontada, e'],
    ['Cada cordão é feito de fios e cada fio de fibras', 'Cada cordão é feito de fios, e cada fio, de fibras'],
    ['anterior e isso', 'anterior, e isso'], ['baixo como', 'baixo, como'], ['Fibras naturais como', 'Fibras naturais, como'],
    ['desgarte', 'desgaste'], ['limpe como fabricante e orienta', 'limpe como o fabricante orienta'], ['Seque a sombra', 'Seque à sombra'],
    ['começar um amarras', 'começar uma amarra'], ['A amarras quadrada', 'A amarra quadrada'], ['cada amarras', 'cada amarra'],
    ['Amarra, prende', 'Amarra prende'], ['O mesmo nó feito no seio, dá', 'O mesmo nó, feito no seio, dá'],
    ['Poliéster estica', 'Poliéster: estica'], ['Sisal é áspero', 'Sisal é áspero'], ['Nylon, elástico', 'Nylon: elástico'],
    ['juntos com Deus', 'juntos, com Deus'], ['capítulo 4, versículo 12,', 'capítulo 4, versículo 12:'],
  ],
  audio: { estilo: 'moderno', efeitos: 'foley', trilha: 'audio/trilha_piloto_moderno_foley.wav', mix: 'audio/mix.wav' },   // estilos: violao | piano | moderno · efeitos: nenhum | foley | musical | toques (audio/som_piloto.py)
};
