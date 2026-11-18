"""Folha de contato: um quadro por batida (a cada 15 quadros = 0,5 s), com o tempo anotado."""
import sys, glob
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(src + '/*.jpeg')); cols = 7; tw, th = 270, 480
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 30)), '#202020'); d = ImageDraw.Draw(S)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 20)
for k, p in enumerate(fs):
    im = Image.open(p).resize((tw, th)); x, y = (k % cols) * tw, (k // cols) * (th + 30)
    S.paste(im, (x, y + 30)); d.text((x + 6, y + 4), f'{k*0.5:4.1f}s', fill='#ffffff', font=f)
S.save(dst); print(dst, S.size)
