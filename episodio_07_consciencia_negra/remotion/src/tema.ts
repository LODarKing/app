// Identidade do episódio 07 — Além do Visível. Tudo que se ajusta sem mexer no desenho fica aqui.
export const FPS = 30, W = 1080, H = 1920;
export const COR = {
  fundo: '#090E1A',     // azul-escuro da marca
  ciano: '#00D9F5',     // destaque contemporâneo
  branco: '#F5F7FC',
  dourado: '#C8A45D',   // 20 de novembro / memória
  terracota: '#A95A3B', // contexto histórico (uso discreto)
  bege: '#E4D6BD',      // papel documental
  tinta: '#1A2133',     // células apagadas
};
// uma fonte de título (Playfair Display, serifada de impressão de época) e uma de interface (IBM Plex Mono, datilografada)
export const FONTE = { titulo: "'Playfair Display', serif", ui: "'IBM Plex Mono', monospace" };
// grade medida da trilha (audio/beats.json): 93 BPM, fase ~0
export const BPM = 93, BAT = 60 / 93, FASE = -0.0064;
export const b = (k: number) => FASE + k * BAT; // instante da batida k (s)

export const clamp = (x: number, a = 0, z = 1) => Math.min(z, Math.max(a, x));
export const lerp = (a: number, z: number, u: number) => a + (z - a) * u;
/** progresso 0→1 entre t0 e t1 */
export const prog = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
export const easeOut5 = (u: number) => 1 - Math.pow(1 - u, 5);
export const easeIn = (u: number) => u * u * u;
/** curva com leve ultrapassagem (assentamento de números) */
export const easeBack = (u: number) => { const c = 1.4; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };

/** ruído com semente (mulberry32) — nunca Math.random */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0; let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
