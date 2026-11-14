// Vetores originais (SVG path data), desenhados por camadas. Cada peça tem a origem no seu PIVÔ.
// Os mesmos dados são exportados como .svg editáveis em assets/vetores/ (node ferramentas/exportar_svg.mjs).
// Convenções egípcias: cabeça e pernas de perfil, ombros de frente, olho de frente (amendoado, com kohl).
const VET = {
  // ------------------------------------------------------------ estela de Tel Dan (fragmento de basalto, ilustração)
  // origem no centro do bloco; ~560 × 640 px. Bordas quebradas em segmentos retos (fratura de pedra).
  estela: 'M -252 -296 L -196 -312 L -150 -306 L -96 -322 L -40 -298 L 8 -310 L 62 -324 L 118 -306 L 170 -302 L 214 -276 L 246 -262 L 262 -206 L 270 -150 L 252 -96 L 258 -40 L 278 18 L 270 72 L 252 120 L 262 178 L 236 226 L 210 262 L 160 286 L 120 300 L 66 296 L 20 322 L -36 310 L -90 296 L -132 312 L -170 306 L -214 280 L -240 250 L -262 196 L -270 140 L -252 84 L -262 30 L -284 -30 L -280 -90 L -266 -150 L -270 -206 L -262 -250 Z',
  // faces de fratura (espessura da pedra vista na borda) — desenhadas mais escuras sobre a borda
  estelaFraturas: [
    'M -252 -296 L -196 -312 L -150 -306 L -96 -322 L -92 -304 L -150 -290 L -196 -296 L -240 -282 Z',
    'M 214 -276 L 246 -262 L 262 -206 L 270 -150 L 252 -96 L 238 -102 L 254 -152 L 246 -204 L 232 -252 Z',
    'M 210 262 L 160 286 L 120 300 L 66 296 L 20 322 L 16 304 L 64 280 L 118 284 L 156 270 L 200 248 Z',
    'M -262 196 L -270 140 L -252 84 L -262 30 L -284 -30 L -266 -30 L -246 30 L -236 84 L -252 140 L -246 192 Z',
  ],
  // ------------------------------------------------------------ personagem egípcio (de perfil, voltado para a direita)
  // tronco: origem na cintura; ombros de frente
  tronco: 'M -36 0 C -48 -60 -62 -120 -66 -150 L -88 -170 C -88 -190 -60 -196 -26 -198 L -20 -222 L 22 -222 L 26 -198 C 60 -196 92 -192 92 -170 L 70 -150 C 70 -120 66 -95 52 -70 C 42 -45 38 -20 38 0 Z',
  // saiote de linho (shendyt) com aba frontal: origem na cintura
  saiote: 'M -44 -8 L 44 -8 C 58 56 82 118 98 166 L 34 172 L -52 168 C -56 110 -54 50 -44 -8 Z',
  saioteAba: 'M 10 10 C 30 70 56 124 92 160 L 40 166 C 26 120 16 64 10 10 Z',
  // cabeça: origem na base do pescoço
  rosto: 'M 22 8 L 20 -22 C 28 -26 40 -30 46 -36 L 50 -44 L 47 -48 L 52 -54 L 49 -58 L 56 -64 C 58 -70 50 -74 47 -80 C 46 -90 42 -104 34 -116 L -10 -116 L -24 8 Z',
  peruca: 'M 38 -108 C 30 -134 -22 -142 -48 -112 C -62 -90 -64 -40 -60 6 L -8 10 L -4 -40 C 2 -62 8 -78 14 -90 C 22 -99 30 -104 38 -108 Z',
  olho: 'M 21 -79 Q 31 -87 41 -79 Q 31 -72 21 -79 Z',
  orelha: 'M -2 -70 C 8 -74 12 -60 8 -50 C 4 -44 -2 -46 -4 -52 Z',
  // mão que aponta: origem no punho, apontando para +x
  maoAponta: 'M 0 -12 C 10 -15 22 -16 32 -14 L 64 -11 C 70 -10 70 -3 64 -3 L 36 -3 C 40 2 40 8 34 11 C 24 15 10 14 0 12 Z',
  polegar: 'M 12 -13 C 16 -22 22 -27 28 -26 C 31 -24 28 -18 24 -13 Z',
  // mão fechada segurando rolo de papiro (braço de trás)
  maoFechada: 'M -2 -12 C 12 -16 26 -12 28 0 C 28 12 14 16 -2 12 Z',
  pe: 'M -16 -6 C -24 0 -26 14 -22 20 L 80 22 C 86 20 86 14 80 12 C 56 8 30 0 14 -8 Z',
  // ------------------------------------------------------------ ferramentas e objetos
  lupaAro: 'M 0 -100 A 100 100 0 1 1 0 100 A 100 100 0 1 1 0 -100 Z M 0 -78 A 78 78 0 1 0 0 78 A 78 78 0 1 0 0 -78 Z',
  lupaCabo: 'M -16 0 L 16 0 L 20 150 C 20 166 -20 166 -20 150 Z',
  lupaVirola: 'M -20 -6 L 20 -6 L 22 26 L -22 26 Z',
  pincelCabo: 'M -9 0 L 9 0 L 12 170 C 12 180 -12 180 -12 170 Z',
  pincelVirola: 'M -12 -24 L 12 -24 L 10 4 L -10 4 Z',
  // cartucho (contorno do carimbo): oval alongado com a barra de base
  cartucho: 'M -300 -66 L 300 -66 C 352 -66 352 66 300 66 L -300 66 C -352 66 -352 -66 -300 -66 Z',
  cartuchoBarra: 'M 352 -76 L 368 -76 L 368 76 L 352 76 Z',
};
// Sinais hieroglíficos usados SÓ como grafismo decorativo (sem tradução; nenhuma frase é composta).
const HIER_DECOR = ['\u{13080}', '\u{131A3}', '\u{132F9}', '\u{131F3}', '\u{13216}', '\u{13191}', '\u{13153}', '\u{131CB}', '\u{1308B}', '\u{1313F}', '\u{133CF}', '\u{1339B}', '\u{130C0}', '\u{132B9}'];
// Alfabeto fenício/aramaico antigo (Unicode U+10900–U+10915) para a escrita ILUSTRATIVA da estela.
const FEN = Array.from({ length: 22 }, (_, i) => String.fromCodePoint(0x10900 + i));
// "bytdwd" (casa de Davi): bet, yod, taw, dalet, waw, dalet — ordem lógica; a escrita corre da direita para a esquerda.
const BYTDWD = [0x10901, 0x10909, 0x10915, 0x10903, 0x10905, 0x10903].map((c) => String.fromCodePoint(c));
