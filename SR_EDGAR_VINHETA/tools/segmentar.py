"""Segmentação da logomarca original em camadas independentes (sem redesenho).
Cada camada guarda os PIXELS ORIGINAIS da logo; o alfa vem de desmistura de cor contra o fundo chapado
(#1A0D04), então recompor todas as camadas no lugar devolve a imagem original.
Saída: assets/camadas/<nome>.png (ampliadas ESCALA× com borda re-afiada) e assets/camadas/camadas.json."""
import cv2, json, numpy as np
from scipy import ndimage as ndi

ESCALA = 3
im = cv2.imread('assets/original/logo_original.jpg').astype(np.float32)   # BGR
H, W = im.shape[:2]
BG = np.median(np.r_[im[:40, :40].reshape(-1, 3), im[-40:, -40:].reshape(-1, 3)], 0)
d = np.linalg.norm(im - BG, axis=2)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
CX, CY = 549.89, 578.90                                                     # centro dos anéis (ajuste no anel externo)
RR = np.hypot(xx - CX, yy - CY); TH = np.arctan2(yy - CY, xx - CX)
core = d > 60
lab = np.zeros((H, W), np.int32); nomes = ['_']
def nova(nome, m):
    if nome not in nomes: nomes.append(nome)
    lab[m & (lab == 0)] = nomes.index(nome)

# 1) barra superior
BAR = (yy >= 521) & (yy <= 534) & (xx > 150) & (xx < 950)
nova('barra', core & BAR)

# 2) anéis: faixa radial + sondas nas frestas internas/externas escuras (onde ferramenta/cabeça/faixa cruza, a sonda acende)
ANEIS = [('anel_branco_1', 224.6, 2.8), ('anel_cobre_1', 238.6, 5.7), ('anel_branco_2', 262.5, 2.7),
         ('anel_branco_3', 277.6, 2.9), ('anel_cobre_2', 299.5, 5.7)]
def amostra(r, th):
    x = CX + r * np.cos(th); y = CY + r * np.sin(th)
    return ndi.map_coordinates(d, [y.ravel(), x.ravel()], order=1).reshape(np.shape(th))
NA = 7200; ths = np.linspace(-np.pi, np.pi, NA, endpoint=False)
for nome, r, h in ANEIS:
    pin = np.max([amostra(r - h - dr, ths) for dr in (2.2, 3.0)], 0); pout = np.max([amostra(r + h + dr, ths) for dr in (2.2, 3.0)], 0)
    ok = (pin < 45) & (pout < 45)
    ok = ~ndi.binary_dilation(~ok, iterations=max(1, int(0.8 / (2 * np.pi * r / NA))))   # margem de 0,8 px no arco
    idx = ((TH + np.pi) / (2 * np.pi) * NA).astype(int) % NA
    band = (np.abs(RR - r) <= h + 1.0) & ok[idx] & ~BAR
    nova(nome, core & band)

# 3) demais componentes: classifica por posição
rest = core & (lab == 0)
n, cl, st, cen = cv2.connectedComponentsWithStats(rest.astype(np.uint8), 8)
pequenos = []
for i in range(1, n):
    x, y, w, h, a = st[i]; cxx, cyy = cen[i]; m = cl == i
    if a < 12: pequenos.append(i); continue
    # fragmentos de anel (pontas junto à barra etc.): ≥85% dos pixels dentro da faixa radial de um anel
    hit = None
    for nm_, r_, h_ in ANEIS:
        if (np.abs(RR[m] - r_) <= h_ + 1.6).mean() >= 0.85: hit = nm_
    if hit and a < 400 and not (y > 800 and 440 < x < 660): nova(hit, m); continue
    if y < 521:
        if cxx < 470 and not (w > 150 and cxx > 440): nome = 'tesoura'
        elif cxx > 640 and x > 600: nome = 'navalha'
        else: nome = 'cabeca'
    elif 545 < y < 560 and h > 100: nome = 'letra_%d' % int(cxx)
    elif 650 < y < 700 and a < 1000: nome = 'letra_%d' % int(cxx)           # o ponto de SR.EDGAR
    elif 700 < y < 740 and w > 150 and h < 60: nome = 'barbearia'
    elif 760 < y < 815 and 20 < w < 40 and 20 < h < 40 and a < 500: nome = 'estrela_%d' % int(cxx)
    elif 815 < y < 860 and h < 35: nome = 'est_%d' % int(cxx)
    else: nome = 'faixa_e_raios'
    nova(nome, m)
# a faixa curva x raios internos (dentro do anel branco interno, abaixo da faixa)
k = nomes.index('faixa_e_raios'); m = lab == k
ys_, xs_ = np.nonzero(m)
fundo_faixa = np.full(W, -1)
for x in range(W):                                   # borda inferior da faixa curva = 1º trecho contínuo vindo de cima
    col = m[:, x] & (RR[:, x] > 224.5) if False else m[:, x]
    yy_c = np.nonzero(col)[0]
    if len(yy_c):
        y0 = yy_c[0]; y1 = y0
        while y1 + 1 < H and col[y1 + 1]: y1 += 1
        fundo_faixa[x] = y1
faixa = np.zeros_like(m)
for x in range(W):
    if fundo_faixa[x] >= 0:
        faixa[:fundo_faixa[x] + 1, x] = m[:fundo_faixa[x] + 1, x]
lab[m] = 0; nova('faixa', faixa); nova('raios', m & ~faixa)
# escudo escuro atrás de "Barbearia" (pixels mais escuros que o fundo) vai junto com os raios
disco = (RR < 223.5) & (yy > np.where(fundo_faixa >= 0, fundo_faixa, 9999)[None, :].repeat(H, 0) + 1.5)
# dentro da cabeça: rosto escuro preenchido (oculta anéis quando a cabeça se move)
kc = nomes.index('cabeca'); cab = ndi.binary_fill_holes(lab == kc)
for nm in ['tesoura', 'navalha']:
    kk = nomes.index(nm)
# pequenos detalhes internos à cabeça (sobrancelha, orelha) já são componentes 'cabeca'

# 3b) pontas de anel grudadas nas ferramentas: abertura morfológica com linhas na direção das lâminas;
#     o que some E está numa faixa de anel volta para o anel (ou é cobre, que nunca é ferramenta)
def linha(ang, L=13):
    k = np.zeros((L, L), np.uint8); c = L // 2; t = np.radians(ang)
    cv2.line(k, (int(round(c - c * np.cos(t))), int(round(c - c * np.sin(t)))), (int(round(c + c * np.cos(t))), int(round(c + c * np.sin(t)))), 1, 1)
    return k
cobre = ((im[..., 2] - im[..., 0]) > 60) & (im[..., 0] < 150)
for nm, angs in [('tesoura', range(48, 74, 3)), ('navalha', range(118, 136, 3)), ('cabeca', [])]:
    k = nomes.index(nm); m = (lab == k).astype(np.uint8)
    keep = np.zeros_like(m) if angs else m.copy()
    for a_ in angs: keep |= cv2.morphologyEx(m, cv2.MORPH_OPEN, linha(a_))
    for nm_, r_, h_ in ANEIS:
        band = np.abs(RR - r_) <= h_ + 1.2
        stub = (m > 0) & band & ((keep == 0) | cobre)
        lab[stub] = nomes.index(nm_)
        print(nm, '→', nm_, int(stub.sum()), 'px')

# 3c) a lâmina esquerda da tesoura é um componente separado: vira camada própria (gira no pivô para o "corte")
k = nomes.index('tesoura'); n_, cl_, st_, cen_ = cv2.connectedComponentsWithStats((lab == k).astype(np.uint8), 8)
for i in range(1, n_):
    if st_[i][4] > 800 and cen_[i][0] < 335 and cen_[i][1] < 430: lab[cl_ == i] = 0; nova('tesoura_lamina', cl_ == i)

# 4) atribuição da zona de antisserrilhado ao núcleo mais próximo
zona = d > 7
dist, (iy, ix) = ndi.distance_transform_edt(lab == 0, return_indices=True)
lab_full = np.where((lab == 0) & zona & (dist <= 3.0), lab[iy, ix], lab)

camadas = []; meta = {'origem': [W, H], 'escala': ESCALA, 'centro_aneis': [CX, CY], 'fundo_rgb': [float(BG[2]), float(BG[1]), float(BG[0])],
                      'aneis': {nm: {'r': r, 'meia_largura': h} for nm, r, h in ANEIS}}
def salvar(nome, mask_lab, preencher=None):
    m = mask_lab
    # alfa: miolo sólido = 1 (cabelo bege junto do branco não fica translúcido); borda = desmistura contra o fundo
    solido = m & (d > 90); miolo = ndi.binary_erosion(solido, iterations=1)
    dF = ndi.grey_dilation(np.where(miolo, d, 0), size=(5, 5))
    dF2 = ndi.grey_dilation(np.where(solido, d, 0), size=(7, 7)); dF = np.where(dF > 0, dF, dF2); dF = np.maximum(dF, 60)
    a = np.where(miolo, 1.0, np.clip(d / dF, 0, 1)) * m
    if preencher is not None: a = np.where(preencher, 1.0, a)
    a[a < 0.02] = 0
    C = np.where(a[..., None] > 0, BG + (im - BG) / np.maximum(a, 1e-3)[..., None], 0); C = np.clip(C, 0, 255)
    if preencher is not None: C = np.where(preencher[..., None] & (d[..., None] < 30), im, C)
    ys, xs = np.nonzero(a > 0)
    if len(ys) == 0: return
    x0, x1, y0, y1 = max(xs.min() - 4, 0), min(xs.max() + 5, W), max(ys.min() - 4, 0), min(ys.max() + 5, H)
    a = a[y0:y1, x0:x1]; C = C[y0:y1, x0:x1]
    # estende a cor para fora da forma (sem franja escura ao ampliar)
    w = (a > 0.5).astype(np.float32); Ce = C * w[..., None]; we = w.copy()
    for _ in range(6):
        Ce = cv2.blur(Ce, (3, 3)); we = cv2.blur(we, (3, 3))
        fill = (w == 0) & (we > 1e-4); C[fill] = (Ce[fill] / we[fill, None])
        Ce = C * (we > 1e-4)[..., None]; we = (we > 1e-4).astype(np.float32); w = we
    S = ESCALA; hh, ww = a.shape
    A = cv2.resize(a, (ww * S, hh * S), interpolation=cv2.INTER_CUBIC)
    A = np.clip((A - 0.5) * 1.9 + 0.5, 0, 1)                       # borda re-afiada (contorno de vetor, mesma forma)
    CC = np.clip(cv2.resize(C, (ww * S, hh * S), interpolation=cv2.INTER_CUBIC), 0, 255)
    rgba = np.dstack([CC, A * 255]).round().astype(np.uint8)
    cv2.imwrite(f'assets/camadas/{nome}.png', rgba)
    camadas.append({'nome': nome, 'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)})
    print(f'{nome:18s} {x0:4d},{y0:4d} {x1 - x0:4d}x{y1 - y0:4d}')

for k, nome in enumerate(nomes):
    if k == 0: continue
    m = lab_full == k
    if nome == 'raios': m = m | (disco & (lab_full == 0)); salvar(nome, m, preencher=disco & (lab_full == 0)); continue
    if nome == 'cabeca': salvar(nome, cab | m, preencher=cab & (lab_full == 0)); continue
    salvar(nome, m)
resto = (lab_full == 0) & (d > 25)
print('pixels não atribuídos com d>25:', int(resto.sum()))
cv2.imwrite('out/resto.png', (resto * 255).astype(np.uint8))
meta['camadas'] = camadas
json.dump(meta, open('assets/camadas/camadas.json', 'w'), indent=1)
open('assets/camadas/camadas.js', 'w').write('window.CAMADAS=' + json.dumps(meta) + ';\n')   # para a página (file:// sem fetch)
