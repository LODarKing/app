#!/usr/bin/env python3
"""
Trilha original da vinheta “Enquanto Isso em Amontada…” — 100 % sintetizada aqui.

Lê src/config/timeline.json (a mesma fonte de tempo do vídeo) e escreve:
  public/audio/trilha-vinheta.wav   48 kHz, estéreo, 24 bits, −14 LUFS, pico real ≤ −1 dBTP
  beats.json                        grade de batidas e acertos usada pela imagem e pelo som

Ideia musical (120 bpm, 3,5 s):
  • Motivo-assinatura “reticência”: três notas curtas em semicolcheias (Dó#–Mi–Fá#)
    = os três pontos que abrem a vinheta. Pergunta.
  • No fim o motivo volta (Dó#–Mi–Lá) e resolve em Lá 6/9 no acerto final. Resposta.
  • Harmonia: Fá#m9 → Ré7M(9) (quando “Amontada…” entra) → Mi sus → Lá 6/9.
  • Pulso discreto: bumbo macio nos tempos, chimbal curto em semicolcheias, estalo nos tempos 2 e 4,
    baixo em colcheias “respirando” com o bumbo.
  • Efeitos: whoosh na 1ª revelação, impacto sutil em “Enquanto Isso”, deslize lateral e
    “zíper” na faixa de “Amontada…”, acento de encerramento.

Todo ruído vem do gerador mulberry32 com semente fixa: o arquivo sai idêntico a cada execução.
"""
from __future__ import annotations

import json
import math
import sys
import wave
from pathlib import Path

import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/config/timeline.json").read_text())

SR = 48000
DUR = TL["durationInFrames"] / TL["fps"]  # 3,5 s
N = int(round(DUR * SR))
BEAT = 60.0 / TL["bpm"]
CUE = {k: v * BEAT for k, v in TL["cues"].items()}  # segundos

LUFS_ALVO = -14.0
TP_MAX = -1.2  # margem abaixo de −1 dBTP


# ───────────────────────── utilidades ─────────────────────────

def mulberry32(n: int, seed: int) -> np.ndarray:
    """Ruído uniforme em [−1, 1) — mulberry32 vetorizado (o estado é um contador)."""
    i = np.arange(1, n + 1, dtype=np.uint64)
    a = (np.uint64(seed) + i * np.uint64(0x6D2B79F5)) & np.uint64(0xFFFFFFFF)
    t = a.astype(np.uint32)

    def imul(x, y):
        return ((x.astype(np.uint64) * y.astype(np.uint64)) & np.uint64(0xFFFFFFFF)).astype(np.uint32)

    t = imul(t ^ (t >> np.uint32(15)), t | np.uint32(1))
    t = t ^ (t + imul(t ^ (t >> np.uint32(7)), t | np.uint32(61)))
    t = t ^ (t >> np.uint32(14))
    return t.astype(np.float64) / 4294967296.0 * 2.0 - 1.0


def hz(nota: str) -> float:
    """'A4' → 440 Hz; aceita sustenido (#)."""
    nomes = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    n = nomes[nota[0]]
    resto = nota[1:]
    if resto.startswith("#"):
        n += 1
        resto = resto[1:]
    return 440.0 * 2 ** ((n + 12 * (int(resto) - 4)) / 12)


def tempo(n: int) -> np.ndarray:
    return np.arange(n) / SR


def poe(dst: np.ndarray, src: np.ndarray, t0: float, pan: float = 0.0, ganho: float = 1.0) -> None:
    """Soma um som mono (ou estéreo) no buffer estéreo dst, no instante t0, com pan de potência constante."""
    i0 = int(round(t0 * SR))
    if src.ndim == 1:
        ang = (pan + 1) * math.pi / 4
        src = np.stack([src * math.cos(ang), src * math.sin(ang)], axis=1)
    if i0 < 0:
        src = src[-i0:]
        i0 = 0
    n = min(len(src), N - i0)
    if n > 0:
        dst[i0 : i0 + n] += src[:n] * ganho


def biquad(tipo: str, f: float, q: float = 0.707) -> tuple[np.ndarray, np.ndarray]:
    w = 2 * math.pi * f / SR
    al = math.sin(w) / (2 * q)
    c = math.cos(w)
    if tipo == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif tipo == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    elif tipo == "bp":
        b = [al, 0, -al]
    else:
        raise ValueError(tipo)
    a = [1 + al, -2 * c, 1 - al]
    return np.array(b) / a[0], np.array(a) / a[0]


def filtra(x: np.ndarray, tipo: str, f: float, q: float = 0.707) -> np.ndarray:
    b, a = biquad(tipo, f, q)
    return signal.lfilter(b, a, x, axis=0)


def svf(x: np.ndarray, corte: np.ndarray, q: float = 0.8, modo: str = "lp") -> np.ndarray:
    """Filtro de estado variável com frequência de corte variando no tempo (varreduras)."""
    out = np.zeros_like(x)
    ic1 = ic2 = 0.0
    k = 1.0 / q
    for n in range(len(x)):
        g = math.tan(math.pi * min(corte[n], 0.45 * SR) / SR)
        a1 = 1.0 / (1.0 + g * (g + k))
        v3 = x[n] - ic2
        v1 = a1 * ic1 + g * a1 * v3
        v2 = ic2 + g * v1
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[n] = v2 if modo == "lp" else (v1 if modo == "bp" else x[n] - k * v1 - v2)
    return out


def env_exp(n: int, ataque: float, decai: float) -> np.ndarray:
    t = tempo(n)
    a = np.clip(t / max(ataque, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - ataque, 0) / decai)


def fade(n: int, ini: float, fim: float) -> np.ndarray:
    """Janela com subida de ini s e descida de fim s (cosseno)."""
    w = np.ones(n)
    a = int(ini * SR)
    b = int(fim * SR)
    if a:
        w[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, a))
    if b:
        w[-b:] *= 0.5 + 0.5 * np.cos(np.linspace(0, math.pi, b))
    return w


def saw(f: float, n: int, fase: float = 0.0) -> np.ndarray:
    """Dente de serra limitada em banda (aditiva), sem aliasing."""
    t = tempo(n)
    out = np.zeros(n)
    k = 1
    while k * f < 9000 and k <= 40:
        out += np.sin(2 * math.pi * k * f * t + fase * k) / k
        k += 1
    return out * (2 / math.pi)


# ───────────────────────── instrumentos ─────────────────────────

def ponto(f: float, brilho: float = 1.0, dur: float = 0.55, seed: int = 1) -> np.ndarray:
    """O timbre-assinatura dos pontos: pluck FM com ataque de baqueta (marimba eletrônica)."""
    n = int(dur * SR)
    t = tempo(n)
    idx = 2.2 * brilho * np.exp(-t / 0.045)
    corpo = np.sin(2 * math.pi * f * t + idx * np.sin(2 * math.pi * f * 2.0 * t))
    baqueta = 0.32 * np.sin(2 * math.pi * f * 3.98 * t) * np.exp(-t / 0.035)
    sub = 0.25 * np.sin(2 * math.pi * f * 0.5 * t) * np.exp(-t / 0.12)
    click = filtra(mulberry32(n, seed) * np.exp(-t / 0.0025), "hp", 2500) * 0.35
    s = (corpo + baqueta + sub) * env_exp(n, 0.0015, 0.20) + click
    return s * fade(n, 0, 0.05)


def bumbo(n_dur: float = 0.42, forte: float = 1.0, seed: int = 3) -> np.ndarray:
    n = int(n_dur * SR)
    t = tempo(n)
    f = 55 + 110 * np.exp(-t / 0.028)
    fase = 2 * math.pi * np.cumsum(f) / SR
    corpo = np.sin(fase) * env_exp(n, 0.001, 0.10 + 0.06 * forte)
    corpo = np.tanh(1.6 * corpo) / np.tanh(1.6)  # harmônicos: o grave aparece no celular
    click = filtra(mulberry32(n, seed) * np.exp(-t / 0.0015), "bp", 3200, 0.9) * 0.4
    return (corpo + click) * forte


def chimbal(vel: float, seed: int) -> np.ndarray:
    n = int(0.06 * SR)
    t = tempo(n)
    x = filtra(filtra(mulberry32(n, seed), "hp", 7800, 0.8), "hp", 7800, 0.8)
    return x * np.exp(-t / (0.012 + 0.01 * vel)) * vel


def estalo(seed: int) -> np.ndarray:
    """Estalo de dedos/palma curto (três microrrajadas)."""
    n = int(0.22 * SR)
    t = tempo(n)
    ruido = filtra(mulberry32(n, seed), "bp", 1650, 1.4)
    env = np.zeros(n)
    for k, off in enumerate((0.0, 0.009, 0.018)):
        i = int(off * SR)
        env[i:] += np.exp(-(t[: n - i]) / (0.006 if k < 2 else 0.05))
    return ruido * env * 0.9


def baixo(f: float, dur: float, ataque_sub: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = tempo(n)
    s = np.sin(2 * math.pi * f * t) + 0.35 * np.sin(2 * math.pi * 2 * f * t + 0.6)
    s = np.tanh(1.8 * s) / np.tanh(1.8)
    env = env_exp(n, 0.004, 0.22 * ataque_sub) * fade(n, 0, 0.02)
    return filtra(s * env, "lp", 900)


def whoosh(dur: float, f0: float, f1: float, seed: int, q: float = 1.6, curva: float = 2.0) -> np.ndarray:
    """Ruído com filtro passa-faixa varrendo de f0 a f1; envelope que cresce até o fim."""
    n = int(dur * SR)
    p = np.linspace(0, 1, n)
    corte = f0 * (f1 / f0) ** p
    x = svf(mulberry32(n, seed), corte, q, "bp")
    env = p**curva * fade(n, 0.0, 0.012)
    return x * env


def acorde_pad(notas: list[str], dur: float, seed_fase: int) -> np.ndarray:
    """Pad suave: três serras levemente desafinadas por nota (estéreo)."""
    n = int(dur * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    fases = (mulberry32(len(notas) * 3, seed_fase) + 1) * math.pi
    for j, nt in enumerate(notas):
        f = hz(nt)
        for v, (cents, pan) in enumerate(((-7, -0.6), (0, 0.0), (7, 0.6))):
            s = saw(f * 2 ** (cents / 1200), n, fases[j * 3 + v])
            ang = (pan + 1) * math.pi / 4
            L += s * math.cos(ang)
            R += s * math.sin(ang)
    return np.stack([L, R], axis=1) / (len(notas) * 3)


def reverb(x: np.ndarray, rt60: float = 1.1, pre: float = 0.014, seed: int = 99) -> np.ndarray:
    """Convolução com resposta ao impulso sintética (ruído decaindo), canais descorrelacionados."""
    n = int(rt60 * SR * 1.1)
    t = tempo(n)
    dec = np.exp(-6.9 * t / rt60)
    out = np.zeros_like(x)
    for c in range(2):
        ir = mulberry32(n, seed + c * 17) * dec
        ir = filtra(ir, "lp", 5200)
        ir = np.concatenate([np.zeros(int(pre * SR)), ir])
        ir /= np.sqrt(np.sum(ir**2))
        out[:, c] = signal.fftconvolve(x[:, c], ir)[: len(x)]
    return out


# ───────────────────────── composição ─────────────────────────

def compor() -> tuple[np.ndarray, dict]:
    musica = np.zeros((N, 2))
    sfx = np.zeros((N, 2))
    envio = np.zeros((N, 2))  # vai para a reverberação

    # — Pad: progressão que acompanha a revelação; o corte do filtro abre ao longo da vinheta —
    secoes = [
        (0.0, CUE["bloco"], ["F#3", "A3", "C#4", "E4", "G#4"]),          # Fá#m9
        (CUE["bloco"], CUE["fimPonto1"] - 0.125, ["D3", "F#3", "A3", "C#4", "E4"]),  # Ré7M(9)
        (CUE["fimPonto1"] - 0.125, CUE["resolucao"], ["E3", "A3", "B3", "D4", "F#4"]),  # Mi sus
        (CUE["resolucao"], DUR, ["A3", "C#4", "E4", "F#4", "B4"]),        # Lá 6/9
    ]
    pad = np.zeros((N, 2))
    for k, (a, b, notas) in enumerate(secoes):
        xf = 0.03
        ini = max(0.0, a - xf)
        bloco = acorde_pad(notas, b - ini + xf, 40 + k)
        bloco *= fade(len(bloco), 0.14 if k == 0 else xf, xf if b < DUR else 0.001)[:, None]
        poe(pad, bloco, ini)
    t = tempo(N)
    corte = 380 + 2600 * (t / DUR) ** 1.6
    corte = np.where(t >= CUE["resolucao"], corte * 1.25, corte)
    pad[:, 0] = svf(pad[:, 0], corte, 0.9)
    pad[:, 1] = svf(pad[:, 1], corte, 0.9)
    # “respiração” com o bumbo (sidechain) a partir do 1º tempo
    duck = np.ones(N)
    tempos_bumbo = [CUE["enquanto"], CUE["sobe"], CUE["bloco"], CUE["assinatura"], 2.5, CUE["resolucao"]]
    for tb in tempos_bumbo:
        i = int(tb * SR)
        m = min(N - i, int(0.3 * SR))
        duck[i : i + m] = np.minimum(duck[i : i + m], 1 - 0.55 * np.exp(-tempo(m) / 0.09))
    pad *= duck[:, None]
    pad *= fade(N, 0.01, 0.12)[:, None]
    musica += pad * 0.30
    envio += pad * 0.10

    # — Motivo “reticência” (abertura): Dó#5, Mi5, Fá#5, da esquerda para a direita como os pontos —
    for k, (nome, nt) in enumerate((("ponto1", "C#5"), ("ponto2", "E5"), ("ponto3", "F#5"))):
        s = ponto(hz(nt), 1.0 + 0.15 * k, seed=11 + k)
        poe(musica, s, CUE[nome], pan=-0.35 + 0.35 * k, ganho=0.42)
        poe(envio, s, CUE[nome], pan=-0.35 + 0.35 * k, ganho=0.16)
    # — Motivo de encerramento: Dó#5, Mi5, Lá5 (resposta) —
    for k, (nome, nt) in enumerate((("fimPonto1", "C#5"), ("fimPonto2", "E5"), ("fimPonto3", "A5"))):
        s = ponto(hz(nt), 1.0 + 0.15 * k, seed=21 + k)
        poe(musica, s, CUE[nome], pan=-0.35 + 0.35 * k, ganho=0.40)
        poe(envio, s, CUE[nome], pan=-0.35 + 0.35 * k, ganho=0.16)

    # — Bumbo nos tempos (a partir de “Enquanto Isso”), mais forte no acerto final —
    for tb in tempos_bumbo:
        forte = 1.25 if tb == CUE["resolucao"] else (1.0 if tb in (CUE["enquanto"], CUE["bloco"]) else 0.72)
        poe(musica, bumbo(forte=forte, seed=int(tb * 100)), tb, ganho=0.52)

    # — Chimbal em semicolcheias de 1,0 s a 2,9 s (acento nos contratempos) —
    st = BEAT / 4
    k = 0
    tt = CUE["sobe"]
    while tt < CUE["resolucao"] - 0.01:
        pos = k % 4
        vel = (0.55, 0.3, 0.9, 0.35)[pos]
        poe(musica, chimbal(vel, 500 + k), tt, pan=0.28, ganho=0.36)
        k += 1
        tt = CUE["sobe"] + k * st

    # — Estalo nos tempos 2 e 4 —
    for tb in (CUE["sobe"], CUE["assinatura"]):
        e = estalo(int(tb * 1000))
        poe(musica, e, tb, pan=-0.1, ganho=0.30)
        poe(envio, e, tb, ganho=0.22)

    # — Baixo em colcheias, respirando com o bumbo —
    linha = [
        (CUE["enquanto"], "F#2", 0.5, 1.6),
        (CUE["sobe"], "F#2", 0.25, 1.0), (CUE["sobe"] + 0.25, "F#2", 0.25, 0.8),
        (CUE["bloco"], "D2", 0.25, 1.4), (CUE["bloco"] + 0.25, "D2", 0.25, 0.8),
        (CUE["assinatura"], "D2", 0.25, 1.0), (CUE["assinatura"] + 0.25, "D2", 0.25, 0.8),
        (2.5, "E2", 0.25, 1.0), (2.75, "E2", 0.25, 0.8),
        (CUE["resolucao"], "A2", 0.5, 1.6),
    ]
    for (t0, nt, d, s) in linha:
        poe(musica, baixo(hz(nt), d + 0.05, s), t0, ganho=0.26)

    # ─── efeitos ───
    # whoosh suave da primeira revelação (os pontos viram o fio), da esquerda para a direita
    w = whoosh(CUE["enquanto"] - CUE["ponto3"] + 0.02, 500, 5200, seed=701, q=1.4, curva=1.6)
    wl = np.linspace(-0.7, 0.7, len(w))
    w2 = np.stack([w * np.cos((wl + 1) * math.pi / 4), w * np.sin((wl + 1) * math.pi / 4)], axis=1)
    poe(sfx, w2, CUE["ponto3"] - 0.0, ganho=0.55)
    poe(envio, w2, CUE["ponto3"], ganho=0.15)

    # impacto sutil em “Enquanto Isso”: baque grave + ar
    n = int(0.5 * SR)
    tt_ = tempo(n)
    baque = np.sin(2 * math.pi * np.cumsum(50 + 60 * np.exp(-tt_ / 0.05)) / SR) * env_exp(n, 0.002, 0.16)
    ar = filtra(mulberry32(n, 811), "lp", 1400) * env_exp(n, 0.001, 0.05)
    poe(sfx, baque * 0.55 + ar * 0.35, CUE["enquanto"], ganho=0.8)
    poe(envio, ar * 0.3, CUE["enquanto"])

    # o bloco sobe (1,0 s): sopro curto ascendente
    poe(sfx, whoosh(0.16, 700, 2600, seed=731, q=2.0), CUE["sobe"] - 0.14, pan=0.0, ganho=0.22)

    # “em”: toque de madeira, discreto
    n = int(0.12 * SR)
    tt_ = tempo(n)
    madeira = (np.sin(2 * math.pi * 1180 * tt_) + 0.4 * np.sin(2 * math.pi * 2630 * tt_)) * np.exp(-tt_ / 0.022)
    poe(sfx, madeira, CUE["em"], pan=-0.45, ganho=0.17)
    poe(envio, madeira, CUE["em"], ganho=0.10)

    # “Amontada…”: deslize lateral da faixa (esquerda → direita) e pouso no acerto
    d = 0.2
    w = whoosh(d, 900, 4200, seed=751, q=2.2, curva=1.3)
    wl = np.linspace(-0.85, 0.4, len(w))
    poe(sfx, np.stack([w * np.cos((wl + 1) * math.pi / 4), w * np.sin((wl + 1) * math.pi / 4)], axis=1), CUE["bloco"] - d, ganho=0.55)
    n = int(0.2 * SR)
    tt_ = tempo(n)
    pouso = np.sin(2 * math.pi * 165 * tt_) * np.exp(-tt_ / 0.05) + filtra(mulberry32(n, 761), "bp", 900, 1.0) * np.exp(-tt_ / 0.012) * 0.6
    poe(sfx, pouso, CUE["bloco"], pan=0.1, ganho=0.42)
    # a faixa recolhe para a direita: “zíper” descendente
    z = whoosh(0.2, 7000, 2200, seed=771, q=2.6, curva=0.6) * fade(int(0.2 * SR), 0.03, 0.06)
    zl = np.linspace(0.0, 0.8, len(z))
    poe(sfx, np.stack([z * np.cos((zl + 1) * math.pi / 4), z * np.sin((zl + 1) * math.pi / 4)], axis=1), CUE["revela"] - 0.08, ganho=0.42)

    # marcador coral (assinatura): “tic” agudo, quase subliminar
    n = int(0.05 * SR)
    tt_ = tempo(n)
    poe(sfx, np.sin(2 * math.pi * 3150 * tt_) * np.exp(-tt_ / 0.008), CUE["assinatura"], pan=-0.5, ganho=0.10)

    # saída: whoosh para a cortina + acento de encerramento
    d = 0.32
    w = whoosh(d, 400, 6000, seed=801, q=1.3, curva=2.2)
    wl = np.linspace(-0.8, 0.8, len(w))
    poe(sfx, np.stack([w * np.cos((wl + 1) * math.pi / 4), w * np.sin((wl + 1) * math.pi / 4)], axis=1), CUE["resolucao"] - d + 0.01, ganho=0.5)
    # acento final: acorde dedilhado curtíssimo + sino + ar
    for j, nt in enumerate(("A3", "E4", "F#4", "C#5", "B5")):
        s = ponto(hz(nt), 0.8, dur=0.5, seed=901 + j)
        poe(musica, s, CUE["resolucao"] + 0.004 * j, pan=-0.4 + 0.2 * j, ganho=0.20)
        poe(envio, s, CUE["resolucao"] + 0.004 * j, ganho=0.12)
    n = int(0.5 * SR)
    tt_ = tempo(n)
    sino = (np.sin(2 * math.pi * hz("A5") * tt_) + 0.5 * np.sin(2 * math.pi * hz("E6") * tt_ + 1.0)) * env_exp(n, 0.001, 0.22)
    poe(musica, sino, CUE["resolucao"], ganho=0.14)
    poe(envio, sino, CUE["resolucao"], ganho=0.16)
    ar = filtra(mulberry32(n, 951), "hp", 3500) * env_exp(n, 0.003, 0.12)
    poe(sfx, ar, CUE["resolucao"], ganho=0.10)
    # rastro da cortina saindo pela direita
    d = 0.36
    w = whoosh(d, 5000, 1200, seed=961, q=1.6, curva=0.5) * fade(int(d * SR), 0.05, 0.12)
    wl = np.linspace(-0.2, 0.9, len(w))
    poe(sfx, np.stack([w * np.cos((wl + 1) * math.pi / 4), w * np.sin((wl + 1) * math.pi / 4)], axis=1), CUE["resolucao"] + 0.07, ganho=0.16)

    # respiro antes do acento final: ~40 ms quase em silêncio “sugam” o whoosh,
    # e o acerto de 3,0 s bate limpo, com ataque nítido (o ouvido percebe o contraste)
    respiro = np.ones(N)
    a = int((CUE["resolucao"] - 0.045) * SR)
    b = int((CUE["resolucao"] - 0.003) * SR)
    r = int(0.006 * SR)
    respiro[a:b] = 0.12
    respiro[a - r : a] = np.linspace(1, 0.12, r)
    respiro[b : b + int(0.002 * SR)] = np.linspace(0.12, 1, int(0.002 * SR))
    musica *= respiro[:, None]
    sfx *= respiro[:, None]
    mix = musica + sfx + reverb(envio * respiro[:, None]) * 0.55
    acertos = {k: round(v, 4) for k, v in CUE.items()}
    return mix, acertos


# ───────────────────────── masterização ─────────────────────────

def pico_real(x: np.ndarray) -> float:
    """Pico real (dBTP) com sobreamostragem 4× (BS.1770)."""
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * math.log10(np.max(np.abs(up)) + 1e-12)


def limitador(x: np.ndarray, teto_db: float) -> np.ndarray:
    """Limitador com antecipação, detecção em 4× e soltura suave."""
    teto = 10 ** (teto_db / 20)
    up = np.max(np.abs(signal.resample_poly(x, 4, 1, axis=0)), axis=1)
    pk = up.reshape(-1, 4).max(axis=1)[: len(x)]
    g = np.minimum(1.0, teto / np.maximum(pk, 1e-9))
    look = int(0.002 * SR)
    gmin = np.array([g[max(0, i - look) : i + look + 1].min() for i in range(len(g))])
    out = np.empty_like(gmin)
    rel = math.exp(-1 / (0.06 * SR))
    atk = math.exp(-1 / (0.0008 * SR))
    v = 1.0
    for i, gi in enumerate(gmin):
        v = atk * v + (1 - atk) * gi if gi < v else rel * v + (1 - rel) * gi
        out[i] = min(v, gi)
    return x * out[:, None]


def masterizar(mix: np.ndarray) -> tuple[np.ndarray, float, float]:
    import pyloudnorm as pyln

    medidor = pyln.Meter(SR, block_size=0.4)
    # corte do subgrave que celular não reproduz (só ocuparia margem de pico)
    mix = filtra(filtra(mix, "hp", 38), "hp", 38)
    mix *= fade(N, 0.006, 0.12)[:, None]
    x = mix
    for _ in range(6):
        lufs = medidor.integrated_loudness(x)
        x = x * 10 ** ((LUFS_ALVO - lufs) / 20)
        if pico_real(x) > TP_MAX:
            x = limitador(x, TP_MAX - 0.15)
    lufs = medidor.integrated_loudness(x)
    tp = pico_real(x)
    return x, lufs, tp


def salvar_wav(caminho: Path, x: np.ndarray) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(np.round(x * 8388607), -8388608, 8388607).astype(np.int32)
    b = pcm.reshape(-1)
    raw = np.empty((len(b), 3), dtype=np.uint8)
    raw[:, 0] = b & 0xFF
    raw[:, 1] = (b >> 8) & 0xFF
    raw[:, 2] = (b >> 16) & 0xFF
    with wave.open(str(caminho), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw.tobytes())


def main() -> None:
    mix, acertos = compor()
    x, lufs, tp = masterizar(mix)
    if tp > -1.0:
        sys.exit(f"pico real {tp:.2f} dBTP acima de −1 dBTP")
    salvar_wav(ROOT / "public/audio/trilha-vinheta.wav", x)
    beats = {
        "_doc": "Grade de batidas da vinheta (gerada por audio/gerar_trilha.py a partir de src/config/timeline.json). "
        "Todo acerto sonoro cai num ponto desta grade (semicolcheia = 0,125 s). "
        "'medidos' é preenchido por tools/verificar.py com os ataques detectados no MP4 final.",
        "bpm": TL["bpm"],
        "fps": TL["fps"],
        "batida_s": BEAT,
        "batidas_s": [round(i * BEAT, 4) for i in range(int(DUR / BEAT) + 1)],
        "acertos_s": acertos,
        "acertos_quadro": {k: round(v * TL["fps"], 2) for k, v in acertos.items()},
    }
    antigo = ROOT / "beats.json"
    if antigo.exists():
        try:
            beats["medidos"] = json.loads(antigo.read_text()).get("medidos")
        except json.JSONDecodeError:
            pass
    antigo.write_text(json.dumps(beats, ensure_ascii=False, indent=2) + "\n")
    print(f"trilha: {DUR:.2f} s, 48 kHz estéreo 24 bits | {lufs:.2f} LUFS | pico real {tp:.2f} dBTP")


if __name__ == "__main__":
    main()
