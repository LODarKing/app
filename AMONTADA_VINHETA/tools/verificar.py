#!/usr/bin/env python3
"""
Conferência técnica dos entregáveis em output/. Escreve qa/relatorio.md e preenche
'medidos' em beats.json com os ataques sonoros detectados no MP4 final.

Confere:
  • resolução, fps, duração, número de quadros, codec, pix_fmt, áudio (AAC, 48 kHz, estéreo)
  • loudness integrada e pico real do áudio do MP4 (filtro ebur128 do ffmpeg)
  • sincronia: cada acerto da timeline tem um ataque medido no áudio a ≤ 20 ms
               e uma mudança de imagem medida no vídeo no mesmo quadro (±1)
  • zona segura: o texto da composição final fica dentro da área livre da interface dos Reels
  • quadros vazios: nenhum quadro é só fundo antes da saída
"""
from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output"
QA = ROOT / "qa"
TL = json.loads((ROOT / "src/config/timeline.json").read_text())
FPS = TL["fps"]
BEAT = 60 / TL["bpm"]
CUES = {k: v * BEAT for k, v in TL["cues"].items() if k != "fim"}
W, H = TL["width"], TL["height"]

ok_geral = True
linhas: list[str] = []


def check(cond: bool, texto: str) -> None:
    global ok_geral
    ok_geral &= bool(cond)
    linhas.append(f"- {'✅' if cond else '❌'} {texto}")
    print(("OK   " if cond else "FALHA ") + texto)


def probe(p: Path) -> dict:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-count_frames", "-of", "json", str(p)],
        capture_output=True, text=True, check=True,
    )
    return json.loads(r.stdout)


def audio_de(p: Path) -> np.ndarray:
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "2", "-ar", "48000", "-"],
        capture_output=True, check=True,
    )
    return np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, 2)


def quadros_de(p: Path, w: int = 270, h: int = 480) -> np.ndarray:
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(p), "-vf", f"scale={w}:{h}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    )
    return np.frombuffer(r.stdout, dtype=np.uint8).reshape(-1, h, w, 3).astype(np.float32)


def ataques(x: np.ndarray, sr: int = 48000) -> tuple[np.ndarray, np.ndarray]:
    """Fluxo espectral (positivo) em janelas de 5 ms; devolve tempos e força dos picos."""
    mono = x.mean(axis=1)
    hop = int(0.005 * sr)
    win = 1024
    jan = np.hanning(win)
    frames = []
    for i in range(0, len(mono) - win, hop):
        frames.append(np.abs(np.fft.rfft(mono[i : i + win] * jan)))
    S = np.log1p(np.array(frames) * 10)
    flux = np.maximum(S[1:] - S[:-1], 0).sum(axis=1)
    flux = np.concatenate([[0], flux])
    t = (np.arange(len(flux)) * hop + win / 2) / sr
    # picos locais acima de um limiar adaptativo
    med = np.convolve(flux, np.ones(41) / 41, mode="same")
    picos = [
        i for i in range(2, len(flux) - 2)
        if flux[i] == flux[i - 2 : i + 3].max() and flux[i] > med[i] * 1.5 and flux[i] > 0.12 * flux.max()
    ]
    return t[picos], flux[picos]


def main() -> None:
    QA.mkdir(exist_ok=True)
    mp4 = OUT / "enquanto-isso-em-amontada.mp4"
    mudo = OUT / "enquanto-isso-sem-audio.mp4"
    for p in (mp4, mudo, OUT / "capa-vinheta.png", OUT / "trilha-vinheta.wav"):
        check(p.exists(), f"existe `{p.relative_to(ROOT)}`")
    if not mp4.exists():
        sys.exit(1)

    # ── formato ──
    linhas.append("\n### Formato\n")
    for p, com_audio in ((mp4, True), (mudo, False)):
        info = probe(p)
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        a = [s for s in info["streams"] if s["codec_type"] == "audio"]
        fr = v["r_frame_rate"].split("/")
        fps = int(fr[0]) / int(fr[1])
        dur = float(info["format"]["duration"])
        nome = p.name
        check(v["width"] == W and v["height"] == H, f"{nome}: {v['width']}×{v['height']}")
        check(abs(fps - FPS) < 1e-6, f"{nome}: {fps:g} fps")
        check(int(v["nb_read_frames"]) == TL["durationInFrames"], f"{nome}: {v['nb_read_frames']} quadros")
        check(abs(float(v.get("duration", dur)) - 3.5) < 0.02, f"{nome}: vídeo com {float(v.get('duration', dur)):.3f} s")
        check(v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p", f"{nome}: {v['codec_name']} {v['pix_fmt']} ({v.get('profile')})")
        if com_audio:
            check(len(a) == 1, f"{nome}: uma faixa de áudio")
            if a:
                s = a[0]
                check(s["codec_name"] == "aac" and int(s["sample_rate"]) == 48000 and int(s["channels"]) == 2,
                      f"{nome}: áudio {s['codec_name']} {s['sample_rate']} Hz, {s['channels']} canais")
        else:
            check(len(a) == 0, f"{nome}: sem faixa de áudio")

    # ── loudness ──
    linhas.append("\n### Áudio\n")
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(mp4), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    txt = r.stderr[r.stderr.rfind("Summary:"):]
    I = float(txt.split("I:")[1].split("LUFS")[0])
    tp = float(txt.split("Peak:")[1].split("dBFS")[0])
    check(-16.0 <= I <= -13.5, f"loudness integrada {I:.1f} LUFS (alvo −14)")
    check(tp <= -1.0, f"pico real {tp:.1f} dBTP (máx. −1)")
    x = audio_de(mp4)
    rms = 20 * math.log10(float(np.sqrt(np.mean(x**2))) + 1e-12)
    check(rms > -40, f"trilha presente no MP4 (RMS {rms:.1f} dBFS, {len(x) / 48000:.3f} s)")
    corr = float(np.corrcoef(x[:, 0], x[:, 1])[0, 1])
    check(0.2 < corr < 0.995, f"estéreo real (correlação L/R {corr:.2f})")
    check(float(np.abs(x[-int(0.01 * 48000):]).max()) < 0.01, "fim sem corte seco (último 10 ms abaixo de −40 dBFS)")

    # ── sincronia som ──
    linhas.append("\n### Sincronia\n")
    ts, forcas = ataques(x)
    medidos = {}
    for nome, t in CUES.items():
        if nome == "linha":
            continue  # o “linha” é a cauda do whoosh, sem ataque próprio
        d = np.abs(ts - t)
        i = int(d.argmin()) if len(d) else -1
        erro = float(d[i]) * 1000 if i >= 0 else 1e9
        medidos[nome] = round(float(ts[i]), 4) if i >= 0 else None
        check(erro <= 20, f"som: acerto `{nome}` em {t:.3f} s → ataque medido a {erro:.0f} ms")

    # ── sincronia imagem ──
    fr = quadros_de(mudo)
    # fração de pixels que mudaram de verdade (> 40 níveis): enxerga objetos pequenos como os pontos
    dif = (np.abs(np.diff(fr, axis=0)).max(axis=3) > 40).mean(axis=(1, 2)) * 100
    movimento = np.concatenate([[0], dif])
    for nome in ("ponto1", "ponto2", "ponto3", "enquanto", "sobe", "em", "bloco", "revela", "fimPonto1", "fimPonto2", "fimPonto3", "resolucao"):
        q = CUES[nome] * FPS
        janela = movimento[max(0, int(math.floor(q)) - 1) : int(math.ceil(q)) + 2]
        check(janela.max() > 0.05, f"imagem: há movimento no acerto `{nome}` (quadro {q:.2f}; {janela.max():.2f} % da tela muda)")

    # ── composição ──
    linhas.append("\n### Composição\n")
    fundo = np.array([0x15, 0x2A, 0x31], dtype=np.float32)
    for q in range(0, 88):
        f = fr[q]
        conteudo = (np.abs(f - fundo).max(axis=2) > 60).mean()
        if q >= 4 and conteudo < 0.0005:
            check(False, f"quadro {q} vazio (só fundo)")
    check(True, "nenhum quadro vazio entre a 1ª batida visual e a saída")
    final = quadros_de(mudo, W, H)[70]
    mask = np.abs(final - fundo).max(axis=2) > 60
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    check(x0 >= 65 and x1 <= W - 65, f"texto entre x={x0} e x={x1} (margens laterais ≥ 65 px)")
    check(y0 >= 250 and y1 <= H - 670, f"texto entre y={y0} e y={y1} (livre dos 250 px do topo e 670 px de baixo dos Reels)")
    check(y0 >= (H - 1350) / 2 and y1 <= (H + 1350) / 2, "texto inteiro dentro do recorte 4:5 do feed")

    # beats.json: ataques medidos
    bj = ROOT / "beats.json"
    beats = json.loads(bj.read_text())
    beats["medidos"] = {"fonte": "tools/verificar.py — fluxo espectral do áudio do MP4 final", "ataques_s": medidos}
    bj.write_text(json.dumps(beats, ensure_ascii=False, indent=2) + "\n")

    rel = QA / "relatorio.md"
    rel.write_text("# Relatório de conferência\n\nGerado por `tools/verificar.py`.\n\n" + "\n".join(linhas) + "\n")
    print(f"\n{'TUDO CERTO' if ok_geral else 'HÁ FALHAS'} — {rel.relative_to(ROOT)}")
    sys.exit(0 if ok_geral else 1)


if __name__ == "__main__":
    main()
