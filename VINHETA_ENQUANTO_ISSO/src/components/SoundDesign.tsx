// Som: assinatura sonora sintetizada em código (audio/sonic_logo.py) — 120 BPM, Fá menor, motivo Dó5 Fá5 Mi♭5 · Lá♭5 Fá5 —
// masterizada em -14 LUFS e alinhada aos tempos de src/timeline.json. Versões, stems e documentação em
// entregaveis/rackel-sonic-logo/.
import React from 'react';
import { Audio, staticFile } from 'remotion';

export const SoundDesign: React.FC<{ on: boolean }> = ({ on }) => (on ? <Audio src={staticFile('audio/vinheta_mix.wav')} /> : null);
