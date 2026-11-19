"""Alinhamento forçado (CTC) da narração original contra o texto conferido: wav2vec2 XLSR-53 português
(jonatasgrosman/wav2vec2-large-xlsr-53-portuguese) + torchaudio.functional.forced_align.
Números são alinhados pela forma falada (ex.: 2026 -> "dois mil e vinte e seis"), mas guardados na grafia da legenda.
Entrada: documentacao/palavras.json (texto do Whisper corrigido). Saída: documentacao/alinhamento.json
uso: python3 -I audio/alinhar.py"""
import json, re, subprocess, unicodedata, numpy as np, torch, torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
SRC = 'narracao_original/Voyager .mp3'
FALADO = {'18': 'dezoito', '2026': 'dois mil e vinte e seis', '26': 'vinte e seis', '24': 'vinte e quatro', '14': 'catorze',
          '1977': 'mil novecentos e setenta e sete', '1': 'um', '2012': 'dois mil e doze', '50': 'cinquenta', 'NASA': 'nasa'}
P = json.load(open('documentacao/palavras.json'))['palavras']
# junta os pedaços com hífen do Whisper ("Tornou" + "-se", "dia" + "-luz", "alcançá" + "-la")
W = []
for w in P:
    if w[0].startswith('-') and W: W[-1] = [W[-1][0] + w[0], W[-1][1], w[2]]
    else: W.append([w[0], w[1], w[2]])
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
y = torch.from_numpy(np.frombuffer(pcm, np.float32).copy())
NOME = 'jonatasgrosman/wav2vec2-large-xlsr-53-portuguese'
proc = Wav2Vec2Processor.from_pretrained(NOME); model = Wav2Vec2ForCTC.from_pretrained(NOME).eval()
vocab = proc.tokenizer.get_vocab(); blank = vocab.get('<pad>', 0); sep = vocab.get('|')
with torch.inference_mode():
    lp = torch.log_softmax(model(proc(y.numpy(), sampling_rate=16000, return_tensors='pt').input_values).logits, -1)
ratio = len(y) / 16000 / lp.shape[1]
def chars(s):
    s = s.lower(); s = re.sub(r"[^\w\s-]", '', s).replace('-', ' ')
    return [c for c in s if c in vocab or c == ' ']
tok, owner = [], []
for i, w in enumerate(W):
    core = re.sub(r'[.,!?]', '', w[0]); fal = FALADO.get(core, core)
    cs = [c for c in chars(fal) if c != ' ' or True]
    for c in cs:
        if c == ' ': continue
        tok.append(vocab[c]); owner.append(i)
    # separador de palavra entre palavras
    if i < len(W) - 1 and sep is not None: tok.append(sep); owner.append(-1)
ali, sc = torchaudio.functional.forced_align(lp, torch.tensor([tok]), blank=blank)
ali, sc = ali[0].numpy(), sc[0].exp().numpy()
# percorre os quadros: cada token alinhado ocupa uma sequência de quadros
spans = []; k = -1; prev = blank
for f, (a, s) in enumerate(zip(ali, sc)):
    if a == blank: prev = blank; continue
    if a != prev or (spans and spans[-1][2] != f - 1): k += 1; spans.append([k, f, f, [s]])
    else: spans[-1][2] = f; spans[-1][3].append(s)
    prev = a
assert len(spans) == len(tok), (len(spans), len(tok))
out = []
for i, w in enumerate(W):
    sp = [spans[j] for j in range(len(tok)) if owner[j] == i]
    a, b = sp[0][1] * ratio, (sp[-1][2] + 1) * ratio
    out.append({'palavra': w[0], 'ini': round(a, 3), 'fim': round(b, 3), 'conf': round(float(np.mean([np.mean(s[3]) for s in sp])), 2),
                'whisper_ini': w[1], 'desvio_ms': round((w[1] - a) * 1000)})
json.dump({'fonte': SRC, 'metodo': 'CTC forced alignment, ' + NOME + ', quadro de %.1f ms' % (ratio * 1000), 'palavras': out}, open('documentacao/alinhamento.json', 'w'), ensure_ascii=False, indent=1)
for o in out: print(f"{o['ini']:6.2f}-{o['fim']:6.2f} c{o['conf']:.2f} (whisper {o['whisper_ini']:6.2f}, {o['desvio_ms']:+5d} ms) {o['palavra']}")
