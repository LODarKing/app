"""Gera public/grain.png (textura de grão 512×512) com ruído de semente fixa (mulberry32, igual ao do JS)."""
import numpy as np
from PIL import Image
def mulberry32(seed):
    a = seed & 0xFFFFFFFF
    while True:
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF; t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        yield ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
g = mulberry32(1337); N = 512
v = np.array([next(g) for _ in range(N * N)]).reshape(N, N)
img = np.clip(128 + (v - 0.5) * 160, 0, 255).astype(np.uint8)
Image.fromarray(img, 'L').save('public/grain.png'); print('public/grain.png')
