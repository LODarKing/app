"""Narração por IA (Kokoro v1.0, voz pm_alex, pt-BR, motor local), frase a frase, com pausas escolhidas à mão.
Saídas: audio/narracao_bruta.wav (48 kHz), audio/narracao_ia.wav (tratada, 48 kHz, 24 bit),
audio/frases.json (início/fim de cada frase). Rodar de episodio_05_qrcode/:  python3 ferramentas/narracao.py"""
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Limiter

SR = 48000
MOD = '/home/user/app/VOZES/modelos/'
K = Kokoro(MOD + 'kokoro-v1.0.onnx', MOD + 'voices-v1.0.bin')
VOZ = 'pm_alex'
# (texto falado, velocidade, pausa DEPOIS em s). Pausas maiores nos pontos de virada pedidos no briefing.
FRASES = [
    ("Este quadrado parece uma bagunça.", 1.02, 0.38),
    ("Mas ele pode guardar uma mensagem, um endereço de internet... e até continuar funcionando quando parte dele está danificada!", 1.08, 0.62),
    ("Como isso é possível?", 0.98, 0.85),
    ("O segredo está na organização dos quadradinhos!", 1.04, 0.55),
    ("Um QR Code guarda informações em uma grade de pequenos módulos claros e escuros.", 1.06, 0.5),
    ("Aqueles três quadrados grandes nos cantos ajudam a câmera a encontrar e orientar o código.", 1.06, 0.5),
    ("Depois, o celular interpreta os padrões e reconstrói a informação armazenada.", 1.06, 0.42),
    ("Se o conteúdo for um endereço de internet, ele pode oferecer a opção de abrir o site.", 1.08, 0.8),
    ("E tem um detalhe surpreendente!", 0.98, 0.7),
    ("Alguns QR Codes possuem informações extras que permitem corrigir erros.", 1.05, 0.45),
    ("Por isso, dependendo do dano, eles podem continuar funcionando mesmo com partes comprometidas!", 1.08, 0.45),
    ("Mas existe um limite para essa recuperação.", 1.0, 0.75),
    ("E olha só: ler um QR Code não exige internet.", 1.04, 0.35),
    ("Abrir um site normalmente exige.", 1.02, 0.85),
    ("Agora vem o desafio!", 0.98, 0.6),
    ("Pause o vídeo no código que vai aparecer e descubra a mensagem secreta!", 1.06, 0.9),
    ("Além do Visível.", 0.95, 0.45),
    ("O extraordinário está nos detalhes.", 0.95, 0.0),
]
LEAD = 0.12  # a voz entra quase de imediato: o gancho é o primeiro segundo

def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(idx[0] - 240, 0): idx[-1] + 1200] if len(idx) else a

def main(n=None):
    frases = FRASES if n is None else FRASES[:n]
    out, info, t = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
    for i, (txt, sp, gap) in enumerate(frases):
        a, sr = K.create(txt, voice=VOZ, speed=sp, lang='pt-br')
        a = trim(resample_poly(a, SR, sr).astype(np.float32))
        sf.write(f'audio/frases/{i:02d}.wav', a, SR)
        info.append(dict(i=i, texto=txt, ini=round(t, 3), fim=round(t + len(a) / SR, 3)))
        out += [a, np.zeros(int(gap * SR), np.float32)]; t += len(a) / SR + gap
    out.append(np.zeros(int(0.3 * SR), np.float32))
    bruta = np.concatenate(out)
    sf.write('audio/narracao_bruta.wav', bruta, SR)
    # tratamento leve: corta graves inúteis, calor médio-grave, presença, de-esser simples (prateleira + compressão), compressão moderada
    fx = Pedalboard([HighpassFilter(70), LowShelfFilter(cutoff_frequency_hz=180, gain_db=2.0),
                     PeakFilter(cutoff_frequency_hz=320, gain_db=-1.2, q=1.0),
                     PeakFilter(cutoff_frequency_hz=3200, gain_db=1.5, q=0.9),
                     PeakFilter(cutoff_frequency_hz=7000, gain_db=-2.5, q=2.0),
                     HighShelfFilter(cutoff_frequency_hz=11000, gain_db=-1.0),
                     Compressor(threshold_db=-22, ratio=2.5, attack_ms=6, release_ms=110),
                     Limiter(threshold_db=-2.0, release_ms=80)])
    y = fx(bruta.reshape(1, -1), SR)[0]
    m = pyln.Meter(SR); y = y * 10 ** ((-18 - m.integrated_loudness(y)) / 20)  # nível de trabalho; a mix final vai a -14 LUFS
    sf.write('audio/narracao_ia.wav', y.astype(np.float32), SR, subtype='PCM_24')
    json.dump(dict(voz=VOZ, motor='kokoro-onnx v1.0', sr=SR, duracao=round(len(y) / SR, 3), frases=info),
              open('audio/frases.json', 'w'), ensure_ascii=False, indent=1)
    print('duração', round(len(y) / SR, 2), 's')
    for f in info: print(f"{f['ini']:6.2f}–{f['fim']:6.2f}  {f['texto']}")

if __name__ == '__main__':
    main()
