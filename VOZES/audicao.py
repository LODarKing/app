"""Teste de elenco de vozes (Felinos): gera amostras do narrador, da Lara e do Miguel com falas do roteiro.
Motor local, sem API: Kokoro (pf_dora, pm_alex, pm_santa). O Piper (faber, cadu) foi testado e descartado: errou palavras na conferência pelo Whisper.
Vozes jovens = voz neural + mistura de estilos (Kokoro) + ajuste de tom/timbre (pedalboard).
Saída: VOZES/amostras/*.wav e *.mp3, e VOZES/amostras/conferencia.json (transcrição de volta pelo Whisper).
Rodar a partir de VOZES/."""
import json, os, wave, io, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from pedalboard import Pedalboard, PitchShift, HighpassFilter, LowShelfFilter, HighShelfFilter, PeakFilter, Compressor, Reverb
from kokoro_onnx import Kokoro
from piper import PiperVoice

OUT = 'amostras'; os.makedirs(OUT, exist_ok=True)
SR = 48000
K = Kokoro('modelos/kokoro-v1.0.onnx', 'modelos/voices-v1.0.bin')
PIPER = {}

FALAS = {
    'narrador': ['Parece apenas um gatinho fofinho, não é?', 'Mas a família dele guarda segredos incríveis!',
                 'Daniel foi lançado numa cova de leões porque permaneceu fiel a Deus.'],
    'lara': ['Acho que alguém quer nos mostrar uma coisa!', 'Então não é magia. É uma adaptação incrível da natureza!'],
    'miguel': ['Ei, Lara! O que está acontecendo com esse livro?', 'Espera! O Pingo é parente de um tigre?'],
}

def kokoro(text, voice, speed=1.0):
    v = voice if isinstance(voice, np.ndarray) else voice
    a, sr = K.create(text, voice=v, speed=speed, lang='pt-br')
    return resample_poly(a, SR, sr).astype(np.float32)
def piper(text, name, speed=1.0):
    if name not in PIPER: PIPER[name] = PiperVoice.load(f'modelos/pt_BR-{name}-medium.onnx')
    from piper import SynthesisConfig
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w: PIPER[name].synthesize_wav(text, w, syn_config=SynthesisConfig(length_scale=1 / speed))
    buf.seek(0); a, sr = sf.read(buf)
    return resample_poly(a, SR, sr).astype(np.float32)
def blend(*pairs):
    return sum(K.get_voice_style(n) * w for n, w in pairs)

def polish(a, semis=0.0, bright=0.0, warm=0.0, room=0.0):
    """tom (semitons, muda o timbre junto = voz mais jovem), brilho, calor, sala leve; nível de amostra -16 LUFS"""
    fx = [HighpassFilter(75)]
    if semis: fx.append(PitchShift(semitones=semis))
    if warm: fx.append(LowShelfFilter(cutoff_frequency_hz=220, gain_db=warm))
    if bright: fx.append(HighShelfFilter(cutoff_frequency_hz=5000, gain_db=bright))
    fx += [PeakFilter(cutoff_frequency_hz=3000, gain_db=1.5, q=0.8), Compressor(threshold_db=-20, ratio=2.5, attack_ms=8, release_ms=120)]
    if room: fx.append(Reverb(room_size=0.18, wet_level=room, dry_level=1.0, damping=0.6))
    y = Pedalboard(fx)(a.reshape(1, -1), SR)[0]
    m = pyln.Meter(SR); y = y * 10 ** ((-16 - m.integrated_loudness(y)) / 20)
    return np.clip(y, -0.95, 0.95)

def take(lines, gen, gap=0.55):
    parts = []
    for i, l in enumerate(lines):
        parts.append(gen(l));
        if i < len(lines) - 1: parts.append(np.zeros(int(gap * SR), np.float32))
    return np.concatenate([np.zeros(int(0.25 * SR), np.float32), *parts, np.zeros(int(0.4 * SR), np.float32)])

ELENCO = {
    # ---------------- narrador(a): voz jovem, clara, expressiva, sem infantilizar
    'NARRADOR_A_Alex':     ('narrador', lambda l: kokoro(l, 'pm_alex', 0.98), dict(warm=1.5, room=0.05)),
    'NARRADOR_B_Santa':    ('narrador', lambda l: kokoro(l, 'pm_santa', 0.98), dict(warm=1.5, room=0.05)),
    'NARRADOR_C_mistura':  ('narrador', lambda l: kokoro(l, blend(('pm_alex', 0.5), ('pm_santa', 0.5)), 0.97), dict(warm=1.5, room=0.05)),
    'NARRADORA_D_Dora':    ('narrador', lambda l: kokoro(l, 'pf_dora', 0.98), dict(warm=1.0, room=0.05)),
    # ---------------- Lara, cerca de 12 anos: observadora, comunicativa
    'LARA_A_Dora_jovem':   ('lara', lambda l: kokoro(l, 'pf_dora', 1.05), dict(semis=2.0, bright=1.5)),
    'LARA_B_Dora_mais_jovem': ('lara', lambda l: kokoro(l, 'pf_dora', 1.08), dict(semis=3.5, bright=1.0)),
    'LARA_C_Dora_natural': ('lara', lambda l: kokoro(l, 'pf_dora', 1.04), dict(semis=0.8, bright=2.0)),
    # ---------------- Miguel, cerca de 13 anos: espontâneo, bem-humorado
    'MIGUEL_A_Alex_jovem': ('miguel', lambda l: kokoro(l, 'pm_alex', 1.06), dict(semis=4.0, bright=1.0)),
    'MIGUEL_B_Santa_jovem': ('miguel', lambda l: kokoro(l, 'pm_santa', 1.06), dict(semis=4.5, bright=1.0)),
    'MIGUEL_C_mistura':    ('miguel', lambda l: kokoro(l, blend(('pm_alex', 0.6), ('pf_dora', 0.4)), 1.06), dict(semis=2.0, bright=1.0)),
}

from faster_whisper import WhisperModel
asr = WhisperModel('small', device='cpu', compute_type='int8')
rep = {}
for name, (role, gen, fx) in ELENCO.items():
    a = polish(take(FALAS[role], gen), **fx)
    wav = f'{OUT}/{name}.wav'; sf.write(wav, a, SR, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-b:a', '192k', f'{OUT}/{name}.mp3'], check=True)
    segs, _ = asr.transcribe(resample_poly(a, 1, 3).astype(np.float32), language='pt', beam_size=5)
    heard = ' '.join(s.text.strip() for s in segs)
    rep[name] = {'papel': role, 'duracao_s': round(len(a) / SR, 2), 'roteiro': ' '.join(FALAS[role]), 'whisper_ouviu': heard}
    print(f'{name:26s} {len(a) / SR:5.1f}s | {heard}')
json.dump(rep, open(f'{OUT}/conferencia.json', 'w'), ensure_ascii=False, indent=1)
