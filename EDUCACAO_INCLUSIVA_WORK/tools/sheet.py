# Usage: python3 tools/sheet.py out.png cols w img1 img2 ...  -> contact sheet (scaled to width w each)
import sys
from PIL import Image, ImageDraw
out, cols, w, *files = sys.argv[1:]; cols = int(cols); w = int(w)
ims = [Image.open(f).convert('RGB') for f in files]
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), (20, 16, 40))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im.resize((w, h)), (x, y))
    d.text((x + 6, y + 6), f.split('/')[-1][-22:], fill=(255, 235, 0))
sheet.save(out)
