"""Monta timeline.js do piloto v4 (cena 02 — O Diário da Criação): eventos de cena na grade de 120 bpm,
falas restauradas (FELINOS_AUDIO/falas) com os tempos por palavra da transcrição final e o envelope de cada voz
(boca dos personagens, 24 valores por segundo). Rodar a partir de FELINOS_PILOTO_V4/."""
import json, shutil, numpy as np, soundfile as sf
AUD = '../FELINOS_AUDIO'
TR = json.load(open(f'{AUD}/documentacao/transcricao_editada.json'))
VOZES = [  # [quem, arquivo, início]
    ['miguel', 'Miguel_Felinos_D01', 2.0],
    ['lara', 'Lara_Felinos_D01', 5.0],
    ['narrador', 'Narrador_Felinos_02', 9.0],
]
EV = {
    'fps': 60, 'dur': 21.5, 'bpm': 120,
    # A. close do Diário (gancho): a pata do Pingo pousa, a pegada acende, a capa abre, as páginas correm
    'paw': 0.5, 'coverOpen': 1.0, 'riffle': 1.25, 'cutB': 1.75,
    # B. plano médio: ilustrações saem do livro e voam em volta de Lara e Miguel
    'cards': [2.0, 2.5, 3.0], 'miguelLook': 2.0, 'cutB2': 5.0, 'laraPoint': 6.0,
    # C. o Pingo mia e mergulha na página; a câmera entra na ilustração
    'cutC': 7.5, 'meow': 7.5, 'crouch': 7.75, 'leap': 8.0, 'splash': 8.25, 'portal': 9.0,
    # D. dentro do Diário: onça, tigre, leão e a família reunida
    'whip': 11.5, 'cutLion': 13.5, 'cutFam': 16.0, 'fam': [16.25, 16.75, 17.25], 'pingoLand': 18.5, 'write': 20.0,
}
words, mouth, voices = [], {}, []
for who, name, t0 in VOZES:
    a, sr = sf.read(f'{AUD}/falas/{name}.flac'); sf.write(f'audio/vozes/{name}.wav', a, sr, subtype='PCM_24')
    voices.append({'quem': who, 'arquivo': f'audio/vozes/{name}.wav', 'inicio': t0, 'dur': round(len(a) / sr, 3)})
    for w, s, e in TR[name]['palavras']:
        if w.startswith('-') and words: words[-1][0] += w; words[-1][2] = round(t0 + e, 3)   # "Prepare" + "-se"
        else: words.append([w, round(t0 + s, 3), round(t0 + e, 3), who])
    hop = sr // 24; r = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a), hop)])
    v = np.clip(r / (np.percentile(r, 90) + 1e-9), 0, 1.2) ** 0.8
    mouth[who] = {'t0': t0, 'fps': 24, 'v': [round(float(x), 2) for x in v]}
EV.update({'voices': voices, 'words': words, 'mouth': mouth})
open('timeline.js', 'w').write('const TL = ' + json.dumps(EV, ensure_ascii=False) + ';\n')
print('timeline.js:', len(words), 'palavras;', ', '.join(f"{v['quem']} {v['inicio']}–{v['inicio'] + v['dur']:.2f}s" for v in voices))
