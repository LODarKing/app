// Linha do tempo: tudo em batidas (grade medida em beats.json) e na narração (narracao_tempos.json).
import beatsData from './data/beats.json';
import narr from './data/narracao_tempos.json';
import ev from './data/eventos.json';

export const BEATS: number[] = beatsData.beats;
export const b = (k: number) => {
  if (k < 0) return BEATS[0] + k * (BEATS[1] - BEATS[0]);
  const i = Math.floor(k), f = k - i;
  const t0 = BEATS[Math.min(i, BEATS.length - 1)], t1 = BEATS[Math.min(i + 1, BEATS.length - 1)];
  return t0 + (t1 - t0) * f;
};
export const NARR = narr as { duracao: number; frases: { texto: string; inicio: number; fim: number; cena: number; palavras: { p: string; i: number; f: number }[] }[] };

// --- utilidades puras do tempo
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lin = (t: number, a: number, z: number) => clamp01((t - a) / (z - a));
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeOutBack = (x: number) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const seg = (t: number, a: number, z: number, e: (x: number) => number = easeInOut) => e(lin(t, a, z));
export const mix = (a: number, z: number, k: number) => a + (z - a) * k;

// --- eventos (em batidas, eventos.json) convertidos para segundos pela grade medida
export const EV = {
  ny: b(ev.ny), tk: b(ev.tk),
  retaIni: b(ev.retaIni), retaFim: b(ev.retaFim),
  curvaIni: b(ev.curvaIni), curvaFim: b(ev.curvaFim),
  aviaoIni: b(ev.aviaoIni), aviaoFim: b(ev.aviaoFim),
  titulo1: b(ev.titulo1), titulo2: b(ev.titulo2), tituloCurva: b(ev.tituloCurva),
  desvio: b(ev.desvio), desvioTxt: b(ev.desvioTxt),
  olha: b(ev.olha), destaque: b(ev.destaque), curtoTxt: b(ev.curtoTxt), tissot: ev.tissot.map(b), recua: b(ev.recua),
  uIni: b(ev.uIni), uFim: b(ev.uFim), sIni: b(ev.sIni), sFim: b(ev.sFim),
  fimPiloto: b(ev.fimPiloto),
};
