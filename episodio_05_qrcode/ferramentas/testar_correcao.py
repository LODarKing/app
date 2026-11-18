"""Teste REAL da demonstração de correção de erros (cena 5), no código demoH (versão 6, nível H, 4 blocos × 43 palavras, 28 de correção).
Dano = buraco que mostra o fundo escuro do vídeo (#090E1A), como na animação. Para cada dano:
  - desenha a imagem como no vídeo e tenta ler com ZXing-C++ e OpenCV;
  - conta, por bloco, as palavras de código com erro de verdade (um módulo claro coberto pelo buraco vira escuro).
Grava projeto_remotion/src/danos.json (células do buraco, erros por bloco, resultado das leituras)."""
import json, numpy as np, zxingcpp, cv2
Q = json.load(open('projeto_remotion/src/qr_dados.json'))['demoH']
N, M = Q['size'], 4
data = np.array(Q['data']).reshape(N, N); ordem = Q['ordemDados']
NB, ND, NEC = 4, 15, 28; TOT = NB * (ND + NEC)
pos = {m: k for k, m in enumerate(ordem)}

def mulberry32(seed):
    a = seed & 0xffffffff
    def r():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xffffffff; t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xffffffff
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xffffffff)) & 0xffffffff
        return ((t ^ (t >> 14)) & 0xffffffff) / 4294967296
    return r

def rasgo(cx, cy, rx, ry, seed, passos=24):
    """buraco de borda irregular: raio varia com ruído de semente; devolve células [r, c] (incluindo zona de silêncio)"""
    r = mulberry32(seed); jit = [0.78 + 0.44 * r() for _ in range(passos)]
    cel = []
    for rr in range(-M, N + M):
        for cc in range(-M, N + M):
            dx, dy = (cc + 0.5 - cx) / rx, (rr + 0.5 - cy) / ry
            ang = (np.arctan2(dy, dx) % (2 * np.pi)) / (2 * np.pi) * passos
            i0 = int(ang) % passos; f = ang - int(ang); j = jit[i0] * (1 - f) + jit[(i0 + 1) % passos] * f
            if dx * dx + dy * dy < j * j: cel.append([rr, cc])
    return cel

def bloco(p): return p % NB if p < NB * ND else (p - NB * ND) % NB

def avaliar(cel, nome, s=14, pad=8):
    buraco = {(r, c) for r, c in cel}
    tam = (N + 2 * M + 2 * pad) * s
    im = np.zeros((tam, tam, 3), np.uint8); im[:] = (26, 14, 9)                         # fundo #090E1A (BGR)
    o = (pad) * s; im[o:o + (N + 2 * M) * s, o:o + (N + 2 * M) * s] = (252, 247, 245)     # cartão #F5F7FC
    for r in range(N):
        for c in range(N):
            if data[r, c]: y, x = (r + M + pad) * s, (c + M + pad) * s; im[y:y + s, x:x + s] = (26, 14, 9)
    for r, c in buraco: y, x = (r + M + pad) * s, (c + M + pad) * s; im[y:y + s, x:x + s] = (26, 14, 9)
    erros = [set() for _ in range(NB)]; reservado_atingido = 0
    for r, c in buraco:
        if not (0 <= r < N and 0 <= c < N): continue
        i = r * N + c
        if i not in pos: reservado_atingido += 1; continue
        k = pos[i]
        if k >= TOT * 8: continue                     # bits de sobra
        if data[r, c] == 0: erros[bloco(k // 8)].add(k // 8)
    zx = zxingcpp.read_barcodes(im); cvt = cv2.QRCodeDetector().detectAndDecode(im)[0]
    res = dict(nome=nome, celulas=sorted(cel), modulos_no_codigo=sum(1 for r, c in buraco if 0 <= r < N and 0 <= c < N),
               erros_por_bloco=[len(e) for e in erros], limite_por_bloco=NEC // 2, modulos_reservados_atingidos=reservado_atingido,
               zxing=[x.text for x in zx], opencv=cvt, lido=bool(zx) and zx[0].text == Q['texto'])
    cv2.imwrite(f'/tmp/claude-0/-home-user-app/ada75459-a42c-5ac1-aac1-7a34b8cbc7de/scratchpad/dano_{nome}.png', im)
    print(f"{nome}: {res['modulos_no_codigo']} módulos no buraco, erros/bloco {res['erros_por_bloco']} (limite {NEC//2}), "
          f"reservados {reservado_atingido} | ZXing {'LEU' if res['lido'] else 'falhou'}: {res['zxing']} | OpenCV: {cvt!r}")
    return res

if __name__ == '__main__':
    import sys
    # A: buraco interno escolhido entre 8 candidatos testados: o maior lido pelos DOIS decodificadores
    A = rasgo(30.5, 30.0, 8.0, 7.0, 9)
    # B: o mesmo buraco + um rasgo grande no centro-esquerda: tem de FALHAR nos dois
    B = A + [x for x in rasgo(14.5, 18.0, 10.0, 11.0, 77) if x not in A]
    ra, rb = avaliar(A, 'A'), avaliar(B, 'B')
    json.dump(dict(codigo='demoH', A=ra, B=rb), open('projeto_remotion/src/danos.json', 'w'))
