import { Easing, interpolate } from 'remotion';


/** Progresso 0→1 entre dois quadros, com curva. */
export const prog = (
  frame: number,
  start: number,
  end: number,
  ease: (t: number) => number = (t) => t,
): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Curvas de movimento do projeto (nada linear em cena). */
export const EASE = {
  /** Saída rápida e pouso longo: entradas, revelações. */
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  /** Arranque e pouso editoriais: deslocamentos de layout. */
  editorial: Easing.bezier(0.7, 0, 0.18, 1),
  /** Empurrão do bloco de texto: arranca rápido para liberar espaço ao “em”. */
  empurra: Easing.bezier(0.45, 0, 0.12, 1),
  /** Aceleração para saídas. */
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  /** Varredura da cortina: começa decidida, termina suave. */
  wipe: Easing.bezier(0.62, 0, 0.22, 1),
  sine: Easing.bezier(0.37, 0, 0.63, 1),
};

/** Molas do projeto (spring do Remotion: função pura do quadro). */
export const SPRINGS = {
  /** Entrada com impacto: ~10 % de overshoot, estabiliza em ~12 quadros. */
  impacto: { damping: 16, stiffness: 260, mass: 0.7 },
  /** Pulo dos pontos: rápido e elástico. */
  ponto: { damping: 11, stiffness: 320, mass: 0.45 },
} as const;

/** Pulso curto (função alfa): 0 em t=0, pico 1 em t=tau, volta perto de 0 em ~5·tau. */
export const pulse = (t: number, tau: number): number => (t <= 0 ? 0 : (t / tau) * Math.exp(1 - t / tau));

/** Gerador mulberry32 com semente: ruído determinístico. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
