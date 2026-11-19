// Diagramação do título (px de tela 1080×1920). Faixa segura do Reels: texto entre y≈1000 e 1560, x ≤ 950.
// Larguras medidas no Anton: "Amontada..." = 4,694 × corpo (sem tracking).
const L = 74, AS = 188, TRACK = -0.012;
export const TITLE = {
  left: L,
  enquantoTop: 1084, enquantoSize: 124,
  emTop: 1226, emSize: 82,
  amontadaTop: 1296, amontadaSize: AS, track: TRACK,
  amontadaMidY: 1296 + AS * 0.6,
  amontadaRight: L + AS * (4.694 + 11 * TRACK),
};
export const COLORS = { red: '#D90429', cherry: '#EF476F', pink: '#FF4D6D', wine: '#7B0D1E', blush: '#FFF1F2', fill: '#FFC9D3' };
