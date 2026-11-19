import data from './timeline.json';

export const FPS = data.fps;
export const DURATION = data.durationInFrames;
export const WIDTH = data.width;
export const HEIGHT = data.height;
export const BPM = data.bpm;

/** Duração de uma batida em quadros (120 bpm a 30 fps = 15 quadros). */
export const BEAT = (60 / BPM) * FPS;

export type CueName = keyof typeof data.cues;

/** Quadro (fracionário) exato de um acerto da trilha. */
export const cueExact = (name: CueName): number => data.cues[name] * BEAT;

/**
 * Quadro em que o movimento correspondente começa.
 * Arredonda para o quadro mais próximo: a imagem nunca fica mais de meio quadro (17 ms)
 * longe do som.
 */
export const cue = (name: CueName): number => Math.round(cueExact(name));
