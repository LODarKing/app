"""Mede a grade de batidas da trilha (librosa) e grava beats.json; confere se os eventos da timeline caem na grade medida."""
import sys, json, numpy as np, librosa
nome = sys.argv[1] if len(sys.argv) > 1 else 'piloto'
y, sr = librosa.load(f'audio/{nome}_trilha.wav', sr=22050)
HOP = 64  # ~2,9 ms por quadro de análise: resolução fina para trilha curta
o0 = float(json.load(open('projeto_remotion/src/timeline.json'))[nome].get('ordem', 0))  # antes disso a trilha não tem pulso regular
ys = y[int(o0 * sr):]
oenv = librosa.onset.onset_strength(y=ys, sr=sr, hop_length=HOP)
tempo, fr = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=HOP, start_bpm=120, tightness=400, units='frames')
beats = librosa.frames_to_time(fr, sr=sr, hop_length=HOP) + o0
per_fit, fase_fit = np.polyfit(np.arange(len(beats)), beats, 1)  # reta pelas batidas medidas = grade
tempo = 60 / per_fit
bpm = float(np.atleast_1d(tempo)[0]); per = float(per_fit)
fase = float(fase_fit % per); fase = fase if fase < per / 2 else fase - per
E = json.load(open('projeto_remotion/src/timeline.json'))[nome]
grade = per / 2  # colcheia medida
desvios = {k: round(((v - fase) / grade - round((v - fase) / grade)) * grade * 1000, 1) for k, v in E.items() if k != 'duracao'}
json.dump(dict(trilha=f'audio/{nome}_trilha.wav', bpm_medido=round(bpm, 2), periodo_s=round(per, 4), fase_s=round(fase, 4),
               batidas=[round(float(b), 3) for b in beats], eventos_desvio_ms=desvios), open('beats.json', 'w'), indent=1)
print(f'BPM medido {bpm:.2f}, período {per:.4f} s, fase {fase*1000:.1f} ms; desvio dos eventos da colcheia (ms):', desvios)
