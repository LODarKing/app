"""Confere a segmentação: (1) mapa colorido das camadas; (2) recomposição × original (erro)."""
import cv2, json, numpy as np
M = json.load(open('assets/camadas/camadas.json')); S = M['escala']; W, H = M['origem']
bg = np.array(M['fundo_rgb'][::-1], np.float32)
comp = np.tile(bg, (H, W, 1)).astype(np.float32); vis = np.zeros((H, W, 3), np.float32)
rng = np.random.default_rng(5)
for c in M['camadas']:
    L = cv2.imread(f"assets/camadas/{c['nome']}.png", cv2.IMREAD_UNCHANGED).astype(np.float32)
    L = cv2.resize(L, (c['w'], c['h']), interpolation=cv2.INTER_AREA)
    a = L[..., 3:] / 255; sl = (slice(c['y'], c['y'] + c['h']), slice(c['x'], c['x'] + c['w']))
    comp[sl] = comp[sl] * (1 - a) + L[..., :3] * a
    col = rng.integers(70, 255, 3).astype(np.float32); vis[sl] = vis[sl] * (1 - a) + col * a
    cx, cy = c['x'] + c['w'] // 2, c['y'] + c['h'] // 2
orig = cv2.imread('assets/original/logo_original.jpg').astype(np.float32)
err = np.abs(comp - orig).mean(2)
print('erro médio %.2f, p99 %.1f, máx %.1f (níveis de 0–255)' % (err.mean(), np.percentile(err, 99), err.max()))
mse = ((comp - orig) ** 2).mean(); print('PSNR %.1f dB' % (10 * np.log10(255 ** 2 / mse)))
cv2.imwrite('out/mapa_camadas.png', vis.astype(np.uint8)); cv2.imwrite('out/recomposicao.png', comp.astype(np.uint8))
cv2.imwrite('out/erro_x8.png', np.clip(err * 8, 0, 255).astype(np.uint8))
