// Configuração editável do episódio: cores, fontes, textos, tempos das cenas e arquivos de áudio.
// Mudar um valor aqui e renderizar de novo — não é preciso mexer no desenho das cenas.
const CFG = {
  W: 1080, H: 1920, fps: 30,
  // margens para a interface do Instagram (Reels)
  safe: { top: 120, bottom: 280, side: 90 },
  cor: {
    fundo: '#14294A', fundoEsc: '#0E1F3B', fundoClaro: '#1B3560',
    creme: '#EFE2C4', cremeSombra: '#CDB98F', contorno: '#0A1630',
    destaque: '#F4C04E',          // amarelo: a única cor de destaque
    petroleo: '#3FA3A0',          // corda restante / cordão 1
    coral: '#E7765D',             // chicote / cordão 3
    ceu: '#8EC3EA',               // segunda corda
    texto: '#F6EEDC', textoSuave: '#AFC0D8',
  },
  // os 3 cordões têm sempre as mesmas cores (do começo ao fim do vídeo)
  cordoes: ['#3FA3A0', '#F4C04E', '#E7765D'],
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
  // ---------------------------------------------------------------- episódio (preenchido depois da narração)
  audio: { estilo: 'moderno', efeitos: 'musical', trilha: 'audio/trilha_piloto_moderno_musical.wav', narracao: [] },   // estilos: violao | piano | moderno · efeitos: nenhum | foley | musical | toques (audio/som_piloto.py)
};
