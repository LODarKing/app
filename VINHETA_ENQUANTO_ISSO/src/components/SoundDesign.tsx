// Som: trilha + efeitos sintetizados em código (audio/sintetizar.py), mixados em -14 LUFS e alinhados à
// grade de 120 BPM lida de src/timeline.json. Aqui só se toca a mixagem final; as faixas separadas
// (stems) ficam em public/audio/ para quem quiser remixar.
import React from 'react';
import { Audio, staticFile } from 'remotion';

export const SoundDesign: React.FC<{ on: boolean }> = ({ on }) => (on ? <Audio src={staticFile('audio/vinheta_mix.wav')} /> : null);
