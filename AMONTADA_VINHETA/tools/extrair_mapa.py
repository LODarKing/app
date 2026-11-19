#!/usr/bin/env python3
"""
Extrai só o contorno do município de Amontada do mapa enviado
(assets/referencia/mapa-amontada-enviado.png) e grava src/config/mapaAmontada.ts.

Passos:
  1. máscara do cinza de preenchimento do município (o branco do papel e o preto de textos,
     estradas e linhas de coordenada ficam de fora);
  2. fechamento morfológico + preenchimento de buracos: os nomes de localidades, rodovias e a
     cruz das coordenadas que cortam o polígono somem; a borda escura do município entra;
  3. maior região conectada (descarta o mapinha do Ceará no canto);
  4. suavização leve e contorno subpixel (nível 0,5);
  5. simplificação Ramer–Douglas–Peucker e normalização para caixa de 1000 de largura.
Nenhum nome, estrada ou marcador é levado para a vinheta: só a silhueta.
"""
import json
from pathlib import Path

import contourpy
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/referencia/mapa-amontada-enviado.png"
OUT = ROOT / "src/config/mapaAmontada.ts"

g = np.array(Image.open(SRC).convert("L")).astype(float)
cinza = (g >= 195) & (g <= 245)
# a borda do município é um traço escuro colado ao cinza: entra pelo fechamento
regiao = ndimage.binary_closing(cinza | ((g < 160) & ndimage.binary_dilation(cinza, iterations=2)), iterations=3)
regiao = ndimage.binary_fill_holes(regiao)
regiao = ndimage.binary_opening(regiao, iterations=2)  # remove pontas de linhas que vazam para fora
rot, n = ndimage.label(regiao)
tamanhos = ndimage.sum(regiao, rot, range(1, n + 1))
municipio = rot == (1 + int(np.argmax(tamanhos)))
suave = ndimage.gaussian_filter(municipio.astype(float), 1.1)

linhas = contourpy.contour_generator(z=np.pad(suave, 2)).lines(0.5)
poly = max(linhas, key=len) - 2  # (x, y) em pixels da imagem


def rdp(p: np.ndarray, eps: float) -> np.ndarray:
    if len(p) < 3:
        return p
    a, b = p[0], p[-1]
    ab = b - a
    nrm = float(np.hypot(*ab))
    v = p - a
    # distância ao segmento a–b (no laço fechado a == b: distância ao ponto a)
    d = np.abs(ab[0] * v[:, 1] - ab[1] * v[:, 0]) / nrm if nrm > 1e-9 else np.hypot(v[:, 0], v[:, 1])
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(p[: i + 1], eps)[:-1], rdp(p[i:], eps)])
    return np.vstack([a, b])


# começa o traço no ponto mais ao norte (a ponta do litoral) e segue o contorno
i0 = int(np.argmin(poly[:, 1]))
poly = np.vstack([poly[i0:], poly[1 : i0 + 1]])
simp = rdp(poly, 0.35)

x0, y0 = simp.min(axis=0)
x1, y1 = simp.max(axis=0)
esc = 1000 / (x1 - x0)
pts = (simp - [x0, y0]) * esc
largura, altura = 1000, round((y1 - y0) * esc, 1)
d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

OUT.write_text(
    "// Gerado por tools/extrair_mapa.py a partir de assets/referencia/mapa-amontada-enviado.png.\n"
    "// Só a silhueta do município de Amontada (CE): sem nomes, estradas ou marcadores.\n"
    f"export const MAPA = {json.dumps({'largura': largura, 'altura': altura, 'pontos': len(pts)})} as const;\n"
    f"export const MAPA_D = '{d}';\n"
)
# conferência visual: a silhueta sobre o mapa original
prev = Image.open(SRC).convert("RGB")
arr = np.array(prev)
borda = municipio ^ ndimage.binary_erosion(municipio, iterations=2)
arr[borda] = [227, 36, 59]
(ROOT / "qa").mkdir(exist_ok=True)
Image.fromarray(arr).save(ROOT / "qa/mapa-extracao.png")
print(f"{len(poly)} pontos → {len(pts)} após simplificação; caixa {largura} × {altura}")
