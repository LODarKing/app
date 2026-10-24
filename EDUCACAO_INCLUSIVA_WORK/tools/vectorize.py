"""Vectorize a character model sheet into rig parts (SVG path layers) for the Remotion puppets.

Pipeline: colour quantization (k-means in Lab) -> majority filter -> optional repaint of regions
(e.g. eyes/mouth replaced by skin so they can be animated parametrically) -> split into parts by
polygons -> per part, per colour: stacked mask (union with all layers drawn above, so there are
never hairline gaps) -> potrace -> SVG path.  Output: JSON {parts:{name:{layers:[[color,d],...]}}}.

Usage: python3 tools/vectorize.py <config-name>
"""
import sys, json, os
import numpy as np, cv2, potrace

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R, 'tools'))
from vectorize_configs import CONFIGS


def quantize(img, K, seed=1, flood=None):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    fg = (lab[..., 0] < 246) | (np.abs(lab[..., 1] - 128) > 4) | (np.abs(lab[..., 2] - 128) > 4)
    if flood:  # background panel: flood from the border with a colour tolerance
        h, w = fg.shape; m = np.zeros((h + 2, w + 2), np.uint8); im2 = img.copy()
        for seed_pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
            cv2.floodFill(im2, m, seed_pt, (255, 255, 255), (flood,) * 3, (flood,) * 3, cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8) | 8)
        fg &= m[1:-1, 1:-1] == 0
    X = lab[fg]
    cv2.setRNGSeed(seed)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, 0.3)
    _, _, cent = cv2.kmeans(X[::5].copy(), K, None, crit, 4, cv2.KMEANS_PP_CENTERS)
    lbl = np.full(fg.shape, -1, np.int32)
    d = np.zeros((X.shape[0], K), np.float32)
    for k in range(K): d[:, k] = ((X - cent[k]) ** 2).sum(1)
    lbl[fg] = d.argmin(1)
    bgr = cv2.cvtColor(cent.reshape(1, K, 3).astype(np.uint8), cv2.COLOR_LAB2BGR)[0]
    hexes = ['#%02x%02x%02x' % tuple(int(v) for v in c[::-1]) for c in bgr]
    return lbl, hexes, cent


def majority(lbl, K, r=2):
    """mode filter over a (2r+1)^2 window, background (-1) treated as its own class"""
    best = np.full(lbl.shape, -1, np.int32); bestv = np.zeros(lbl.shape, np.float32)
    for k in range(-1, K):
        v = cv2.boxFilter((lbl == k).astype(np.float32), -1, (2 * r + 1, 2 * r + 1), normalize=False)
        m = v > bestv; best[m] = k; bestv[m] = v[m]
    return best


def poly_mask(shape, pts):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)


OUT_SCALE = 1.0
def trace(mask, turd=6, alphamax=1.0, tol=0.3):
    if mask.sum() < turd: return ''
    plist = potrace.Bitmap(~mask).trace(turdsize=turd, alphamax=alphamax, opticurve=True, opttolerance=tol)
    out = []
    for c in plist:
        k = OUT_SCALE; P = lambda p: f'{p.x * k:.1f} {p.y * k:.1f}'
        s = c.start_point; d = [f'M{P(s)}']
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{P(seg.c)} L{P(seg.end_point)}')
            else: d.append(f'C{P(seg.c1)} {P(seg.c2)} {P(seg.end_point)}')
        out.append(' '.join(d) + 'Z')
    return ' '.join(out)


def run(name):
    cfg = CONFIGS[name]
    img = cv2.imread(os.path.join(R, cfg['image']))
    if 'crop' in cfg:
        x0, y0, x1, y1 = cfg['crop']; img = img[y0:y1, x0:x1]
    if cfg.get('scale', 1) != 1:
        img = cv2.resize(img, None, fx=cfg['scale'], fy=cfg['scale'], interpolation=cv2.INTER_CUBIC)
    up = cfg.get('upsample', 1)
    if up != 1:
        img = cv2.resize(img, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
        sc = lambda pts: [(x * up, y * up) for x, y in pts]
        cfg = dict(cfg, repaint=[(sc(p), c) for p, c in cfg.get('repaint', [])],
                   parts={k: dict(v, poly=sc(v['poly'])) for k, v in cfg['parts'].items()})
    global OUT_SCALE; OUT_SCALE = 1.0 / up
    for _ in range(cfg.get('bilateral', 0)):   # edge-preserving smoothing of soft gradients
        img = cv2.bilateralFilter(img, 9, 38, 7)
    lbl, hexes, cent = quantize(img, cfg.get('K', 30), flood=cfg.get('flood'))
    K = len(hexes)
    lbl = majority(lbl, K, cfg.get('mode_r', 2))
    H, W = lbl.shape
    cb = cfg.get('clear_border', 0)
    if cb: lbl[:cb] = -1; lbl[-cb:] = -1; lbl[:, :cb] = -1; lbl[:, -cb:] = -1
    # drop colours (ground shadow etc.)
    for c in cfg.get('drop_near', []):
        for k, hx in enumerate(hexes):
            if dist_hex(hx, c) < cfg.get('drop_tol', 18): lbl[lbl == k] = -1
    # repaint regions: [polygon, 'nearest-to' hex] -> label of nearest palette entry
    for pts, col in cfg.get('repaint', []):
        k = nearest(hexes, col); m = poly_mask(lbl.shape, pts) & (lbl >= 0)
        lbl[m] = k
    # part assignment (first match wins, in listed priority order)
    taken = np.zeros(lbl.shape, bool); parts = {}
    for pname, spec in cfg['parts'].items():
        pm = poly_mask(lbl.shape, spec['poly']) & ~taken & (lbl >= 0)
        if spec.get('only'):  # restrict to colours near the listed ones
            ok = np.zeros(lbl.shape, bool)
            for col in spec['only']:
                for k, hx in enumerate(hexes):
                    if dist_hex(hx, col) < spec.get('tol', 30): ok |= lbl == k
            pm &= ok
        for col in spec.get('exclude', []):
            pm &= lbl != nearest(hexes, col)
        taken |= pm
        parts[pname] = pm
    out = {'size': [int(W * OUT_SCALE), int(H * OUT_SCALE)], 'palette': hexes, 'parts': {}}
    for pname, pm in list(parts.items()):
        if pname.startswith('_'): del parts[pname]; continue
        pm = cv2.morphologyEx(pm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
        n, cc, st, _ = cv2.connectedComponentsWithStats(pm.astype(np.uint8), 8)
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] < cfg.get('min_island', 60): pm[cc == i] = False
        parts[pname] = pm
    for pname, pm in parts.items():
        ks = [k for k in range(K) if (pm & (lbl == k)).sum() > 12]
        # stacking order: by area (desc) inside this part
        ks.sort(key=lambda k: -(pm & (lbl == k)).sum())
        layers = []
        for i, k in enumerate(ks):
            above = np.zeros(lbl.shape, bool)
            for k2 in ks[i:]: above |= (lbl == k2)
            m = above & pm
            if i == 0:  # base layer: fill holes and close small gaps of the whole part
                m = cv2.morphologyEx(pm.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5 * up, 5 * up), np.uint8)).astype(bool)
            else:
                m = cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & cv2.dilate(pm.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
            sp = cfg['parts'][pname]
            d = trace(m, sp.get('turd', cfg.get('turd', 6)), cfg.get('alphamax', 1.0), sp.get('ptol', cfg.get('tol', 0.3)))
            if d: layers.append([hexes[k], d])
        ys, xs = np.nonzero(pm)
        out['parts'][pname] = {'layers': layers, 'bbox': [int(xs.min() * OUT_SCALE), int(ys.min() * OUT_SCALE), int(xs.max() * OUT_SCALE), int(ys.max() * OUT_SCALE)] if len(xs) else None, 'pivot': cfg['parts'][pname].get('pivot')}
        print(pname, len(layers), 'layers')
    os.makedirs(os.path.dirname(os.path.join(R, cfg['out'])), exist_ok=True)
    json.dump(out, open(os.path.join(R, cfg['out']), 'w'))
    # preview svg
    W2, H2 = out['size']
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W2}" height="{H2}" viewBox="0 0 {W2} {H2}"><rect width="{W2}" height="{H2}" fill="#fff"/>']
    for pname in cfg.get('preview_order', list(out['parts'])):
        for c, d in out['parts'][pname]['layers']: svg.append(f'<path fill="{c}" fill-rule="evenodd" d="{d}"/>')
    svg.append('</svg>')
    open(os.path.join(R, cfg['out'].replace('.json', '_preview.svg')), 'w').write(''.join(svg))


def hex2lab(h):
    c = np.array([[[int(h[5:7], 16), int(h[3:5], 16), int(h[1:3], 16)]]], np.uint8)
    return cv2.cvtColor(c, cv2.COLOR_BGR2LAB)[0, 0].astype(float)
def dist_hex(a, b): return float(np.linalg.norm(hex2lab(a) - hex2lab(b)))
def nearest(hexes, col): return int(np.argmin([dist_hex(h, col) for h in hexes]))


if __name__ == '__main__':
    run(sys.argv[1])
