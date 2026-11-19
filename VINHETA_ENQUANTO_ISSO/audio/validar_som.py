"""Validação técnica da assinatura sonora (não substitui escuta humana — não há escuta neste ambiente).
Mede: duração, ausência de silêncio, loudness BS.1770, pico verdadeiro, amostras saturadas, compatibilidade mono,
faixas de frequência, simulação de alto-falante de celular, presença da melodia, notas detectadas do motivo,
sincronia dos acertos com a animação, e gera espectrogramas e formas de onda.
Uso: python3 audio/validar_som.py   → entregaveis/rackel-sonic-logo/validacao/ + audio/beats.json"""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly, lfilter

SR = 48000
D = 'entregaveis/rackel-sonic-logo'; V = D + '/validacao'; os.makedirs(V, exist_ok=True)
T = json.load(open('src/timeline.json')); BEAT = 60 / T['bpm']; S16 = BEAT / 4

def load(p):
    with wave.open(p) as w:
        n, ch, sw = w.getnframes(), w.getnchannels(), w.getsampwidth(); b = w.readframes(n)
    if sw == 3:
        a = np.frombuffer(b, np.uint8).reshape(-1, 3); x = (a[:, 0].astype(np.int32) | (a[:, 1].astype(np.int32) << 8) | (a[:, 2].astype(np.int32) << 16))
        x = np.where(x >= 2 ** 23, x - 2 ** 24, x) / (2 ** 23 - 1)
    else: x = np.frombuffer(b, '<i2') / 32767
    return x.reshape(-1, ch).T, sw
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=1), axis=1); blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-12); z = z[l > -70]; rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[-0.691 + 10 * np.log10(z) > rel]; return -0.691 + 10 * np.log10(z.mean())
def tp(x): return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1, axis=1))) + 1e-12)
def band_db(m, lo, hi):
    S = np.abs(np.fft.rfft(m)) ** 2; f = np.fft.rfftfreq(len(m), 1 / SR); return 10 * np.log10(S[(f >= lo) & (f < hi)].sum() / S.sum() + 1e-12)
def phone(m): return filt(filt(m, 'highpass', 280, 4), 'lowpass', 9000, 2)   # alto-falante de celular aproximado

def onsets(m):
    mono = np.r_[np.zeros(int(0.1 * SR)), m]; hop, win = 240, 1024
    fr = np.lib.stride_tricks.sliding_window_view(np.pad(mono, (0, win)), win)[::hop] * np.hanning(win)
    S = np.abs(np.fft.rfft(fr, axis=1)); fl = np.maximum(0, np.diff(np.log1p(S * 10), axis=0)).sum(1)
    fl = (fl - np.median(fl)) / (np.std(fl) + 1e-9); t = ((np.arange(len(fl)) + 1) * hop + win / 2) / SR - 0.1
    return [float(t[i]) for i in range(8, len(fl) - 8) if fl[i] > 1.0 and fl[i] == fl[i - 8:i + 9].max()]

def pitch_at(m, t0, d=0.09):
    """nota dominante (MIDI) numa janela logo após o ataque — confere que o motivo tocado é o escrito"""
    i = int((t0 + 0.03) * SR); seg = m[i:i + int(d * SR)] * np.hanning(int(d * SR))
    seg = np.pad(seg, (0, 8 * len(seg))); S = np.abs(np.fft.rfft(seg)); f = np.fft.rfftfreq(len(seg), 1 / SR)
    S[(f < 300) | (f > 2000)] = 0; fp = f[np.argmax(S)]; return round(69 + 12 * np.log2(fp / 440), 2)
NOME = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
def nn(m): m = int(round(m)); return f'{NOME[m % 12]}{m // 12 - 1}'

files = {
    'final': D + '/rackel-sonic-logo-final.wav', 'instrumental': D + '/rackel-sonic-logo-instrumental.wav', 'curta': D + '/rackel-sonic-logo-short.wav',
    'estudo A': D + '/estudos/estudo-A-glam-electro.wav', 'estudo B': D + '/estudos/estudo-B-pop-signature.wav', 'estudo C': D + '/estudos/estudo-C-editorial-chic.wav',
}
rows, lines = {}, []
for k, p in files.items():
    x, sw = load(p); m = x.mean(0)
    blocks = np.sqrt(np.mean(m[: len(m) // 4800 * 4800].reshape(-1, 4800) ** 2, axis=1))
    silent = float(np.mean(20 * np.log10(blocks + 1e-9) < -50))
    corr = float(np.corrcoef(x[0], x[1])[0, 1])
    mono_drop = lufs(np.vstack([m, m])) - lufs(x)
    ph = phone(m); r = {
        'arquivo': os.path.relpath(p, D), 'bits': sw * 8, 'dur_s': round(x.shape[1] / SR, 3), 'lufs': round(lufs(x), 2), 'tp_dbtp': round(tp(x), 2),
        'amostras_no_teto': int(np.sum(np.abs(x) >= 0.9999)), 'trechos_silencio_100ms': f'{silent * 100:.0f}%',
        'corr_LR': round(corr, 3), 'mono_vs_estereo_LU': round(mono_drop, 2),
        'graves_<120Hz_dB': round(band_db(m, 20, 120), 1), 'medios_graves_120-400_dB': round(band_db(m, 120, 400), 1),
        'presenca_1-5k_dB': round(band_db(m, 1000, 5000), 1), 'celular_retém_dB': round(10 * np.log10(np.sum(ph ** 2) / np.sum(m ** 2)), 1),
        'fator_crista_dB': round(20 * np.log10(np.max(np.abs(m)) / np.sqrt(np.mean(m ** 2))), 1),
    }
    rows[k] = r
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-lavfi', 'showspectrumpic=s=1000x360:legend=1:scale=log:stop=16000,format=rgb24', f'{V}/espectro_{k.replace(" ", "_")}.png'], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-lavfi', 'showwavespic=s=1000x160:split_channels=1:colors=#D90429|#7B0D1E', f'{V}/onda_{k.replace(" ", "_")}.png'], check=True)

# presença da melodia (stem melodia vs. resto, na faixa em que o celular reproduz bem)
S = D + '/rackel-sonic-logo-stems/'
stem = {k: load(S + k + '.wav')[0].mean(0) for k in ('melodia', 'harmonia', 'baixo', 'percussao', 'efeitos')}
rest = sum(v for k, v in stem.items() if k != 'melodia')
def e(m, lo, hi): return np.sum(filt(m, 'bandpass', [lo, hi], 4) ** 2)
mel_ratio = 10 * np.log10(e(stem['melodia'], 500, 5000) / e(rest, 500, 5000))
mel_quiet = 10 * np.log10(e(phone(stem['melodia']), 500, 5000) / e(phone(rest), 500, 5000))
bass_ph = 10 * np.log10(np.sum(phone(stem['baixo']) ** 2) / np.sum(stem['baixo'] ** 2))
bass_share = 10 * np.log10(np.sum(phone(stem['baixo']) ** 2) / np.sum(phone(sum(stem.values())) ** 2))
# notas detectadas no stem de melodia
mot = T['motivo']; det = []
for tt, m in zip(mot['provocacao'] + mot['completo'] + mot['eco_final'], mot['notas_midi'][:3] + mot['notas_midi'] + [n + 12 for n in mot['notas_midi'][2:]]):
    got = pitch_at(stem['melodia'], tt); det.append((tt, nn(m), got, nn(got), abs(got - m) < 0.35))
# sincronia: acertos da animação × onsets medidos no arquivo final
xf, _ = load(files['final']); ons = onsets(xf.mean(0))
eventos = [('provocação: Dó5 + clique', 0.0), ('provocação: Fá5', mot['provocacao'][1]), ('batom toca o lábio (Mi♭5 + seda)', T['labioInferior'][0]),
           ('lábio superior', T['labioSuperior'][0]), ('"mwah" afinado (Dó6)', T['mwah']), ('batom começa o contorno', T['tracoMapa'][0]),
           ('beijo no mapa = motivo nota 1 (Dó5)', T['beijoMapa']), ('"Enquanto" = Fá5', T['enquantoIsso'][0]), ('"Isso" = Mi♭5', T['isso']),
           ('"em" (estalo, melodia respira)', T['em']), ('batom em "Amontada" = Lá♭5 sincopado', T['amontada'][0]), ('IMPACTO "Amontada" = Fá5', T['amontada'][1]),
           ('reticência 1 = Mi♭6', T['pontos'][0]), ('reticência 2 = Lá♭6', T['pontos'][1]), ('reticência 3 = Fá6 (fim)', T['pontos'][2])]
sync = []
for nome, t in eventos:
    near = min(ons, key=lambda o: abs(o - t)); sync.append({'evento': nome, 't': t, 'medido': round(near, 3), 'desvio_ms': round((near - t) * 1000, 1)})
json.dump({'bpm': T['bpm'], 'tonalidade': T['tonalidade'], 'batida_s': BEAT, 'motivo': mot['notas'], 'batidas': [round(k * BEAT, 3) for k in range(int(T['duracao'] / BEAT) + 1) if k * BEAT < T['duracao']],
           'onsets_medidos': [round(o, 3) for o in ons], 'acertos': sync, 'loudness_lufs': rows['final']['lufs'], 'pico_verdadeiro_dbtp': rows['final']['tp_dbtp']},
          open('audio/beats.json', 'w'), indent=1, ensure_ascii=False)

L = ['# Validação técnica — assinatura sonora', '', '> Sem escuta neste ambiente: tudo abaixo é medição. A avaliação auditiva fica para você (de preferência no celular, com e sem fone).', '']
cols = list(next(iter(rows.values())).keys())
L += ['| ' + ' | '.join(['versão'] + cols) + ' |', '|' + '---|' * (len(cols) + 1)]
for k, r in rows.items(): L.append('| ' + ' | '.join([k] + [str(r[c]) for c in cols]) + ' |')
L += ['', '**Leitura das colunas:** `celular_retém_dB` = energia que sobra depois de um filtro de alto-falante de celular (passa-altas 280 Hz, passa-baixas 9 kHz); quanto mais perto de 0, menos se perde. `mono_vs_estereo_LU` perto de 0 = soma mono sem cancelamento. `amostras_no_teto` = amostras em 0 dBFS (saturação digital).', '',
      '## Melodia e baixo no celular', f'- Melodia sobre o resto da mixagem, 500 Hz–5 kHz: **{mel_ratio:+.1f} dB** (com filtro de celular: **{mel_quiet:+.1f} dB**). Positivo = a melodia é o elemento mais forte da faixa onde o ouvido é mais sensível, por isso continua audível em volume baixo.',
      f'- Baixo depois do filtro de celular: **{bass_ph:.1f} dB** em relação ao original — a saturação gera harmônicos (175–440 Hz) que o alto-falante reproduz; os fundamentais (Fá2 87 Hz, Ré♭2 69 Hz, Mi♭2 78 Hz) ficam para fone e caixa de som. No celular, o baixo responde por **{bass_share:.1f} dB** da energia total que o alto-falante toca (entre -12 e -6 dB = presente sem embolar).', '',
      '## Notas detectadas no stem de melodia', '| t (s) | escrita | detectada | ok |', '|---|---|---|---|']
for tt, w, got, gn, ok in det: L.append(f'| {tt:.3f} | {w} | {gn} ({got}) | {"✔" if ok else "✘"} |')
L += ['', '## Sincronia com a animação (onsets medidos no arquivo final)', '| evento | t | medido | desvio |', '|---|---|---|---|']
for s in sync: L.append(f'| {s["evento"]} | {s["t"]:.3f} | {s["medido"]:.3f} | {s["desvio_ms"]:+.1f} ms |')
open(V + '/RELATORIO.md', 'w').write('\n'.join(L) + '\n')
print('\n'.join(L))
