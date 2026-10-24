// Series palette (brief §5.2) plus supporting colours for skin, hair, nature
// and historical settings. All values are sRGB hex.
export const P = {
  navy: '#211C55',
  deepPurple: '#190C3C',
  royal: '#2851D8',
  turquoise: '#13B9C5',
  yellow: '#FFEB00',
  green: '#70C94A',
  white: '#FFFFFF',

  ink: '#1A1033',          // outline colour (derived from deep purple)
  sky: '#8FD8F2',
  skyTop: '#4FB6E8',
  cloud: '#F4FBFF',
  grass: '#70C94A',
  grassDark: '#4FA63A',
  hill: '#5DB848',
  hillFar: '#9ADB7C',
  tree: '#3E9E46',
  treeDark: '#2E7D3A',
  trunk: '#7A4A2A',
  wood: '#C98B4E',
  woodDark: '#9A6233',
  stone: '#D9CDB8',
  stoneDark: '#B5A68C',
  concrete: '#C9CED8',
  concreteDark: '#A3AAB8',
  wall: '#F3E6C8',
  roof: '#E0533D',
  water: '#4FC3E8',
  waterDark: '#2A9CC8',
  sand: '#EBD3A0',
  gold: '#F6B91E',
  red: '#E5484D',
  orange: '#F28C28',
  pink: '#F49AC1',

  // Pathfinder activity outfit (stylised, no official insignia)
  shirt: '#F1E4C3',
  shirtShade: '#D9C79F',
  pants: '#211C55',
  pantsShade: '#17133F',
  scarf: '#FFEB00',
  scarfShade: '#E0C800',
  shoe: '#2B2238',
  belt: '#2B2238',

  skins: ['#F6D2B5', '#E9B48F', '#C98E64', '#A86B45', '#7A4A2E', '#5C3824'],
  hairs: ['#2B1B14', '#4A2C1C', '#6B3E22', '#A8692F', '#D9A55B', '#1A1A1A', '#8C8C8C'],
};

export function shade(hex, f = 0.82) {
  const c = parseInt(hex.slice(1), 16);
  const r = Math.round(((c >> 16) & 255) * f), g = Math.round(((c >> 8) & 255) * f), b = Math.round((c & 255) * f);
  return '#' + ((1 << 24) | (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b)).toString(16).slice(1);
}

export function mix(a, b, t) {
  const ca = parseInt(a.slice(1), 16), cb = parseInt(b.slice(1), 16);
  const ch = (s) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const A = ch(ca), B = ch(cb);
  const o = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + ((1 << 24) | (o[0] << 16) | (o[1] << 8) | o[2]).toString(16).slice(1);
}
