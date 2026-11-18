"""Validação no ARQUIVO FINAL (video_final.mp4), não no projeto. Extrai quadros com o FFmpeg e decodifica com ZXing-C++ e OpenCV.
Grava validacao_video.json. Uso: python3 ferramentas/validar_video.py"""
import json, subprocess, numpy as np, cv2, zxingcpp
V = 'video_final.mp4'
Q = json.load(open('projeto_remotion/src/qr_dados.json')); TL = json.load(open('projeto_remotion/src/timeline.json'))['episodio']
def quadro(t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', V, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3)
def ler(img):
    zx = [r.text for r in zxingcpp.read_barcodes(img)]
    try: cvt = cv2.QRCodeDetector().detectAndDecode(img)[0]
    except Exception: cvt = ''
    if not cvt:  # segundo detector do OpenCV (Aruco), independente do clássico
        try: cvt = cv2.QRCodeDetectorAruco().detectAndDecode(img)[0]
        except Exception: cvt = ''
    return zx, cvt
R = {}
# 1) QR final: de 50,8 s ao último quadro, a cada 0,5 s, em 3 resoluções (tela cheia, 1/2 e 1/3: câmera de outro celular)
alvo = Q['mensagem']['texto']; ok = []; base = None; dif = 0
for t in list(np.arange(50.8, 61.95, 0.5)) + [61.95]:
    img = quadro(t)
    card = img[545:1355, 135:945].astype(int)
    if base is None: base = card
    dif = max(dif, int(np.abs(card - base).max()))
    for esc in (1, 2, 3):
        im = cv2.resize(img, (1080 // esc, 1920 // esc), interpolation=cv2.INTER_AREA) if esc > 1 else img
        zx, cvt = ler(im); ok.append(dict(t=round(float(t), 2), escala=f'1/{esc}', zxing=alvo in zx, opencv=cvt == alvo))
R['qr_final'] = dict(texto_esperado=alvo, testes=len(ok), zxing_ok=sum(o['zxing'] for o in ok), opencv_ok=sum(o['opencv'] for o in ok),
                     falhas=[o for o in ok if not (o['zxing'] and o['opencv'])], estatico_desde=TL['c7Qr'] + 0.5,
                     variacao_max_pixels_no_cartao=dif)
# 2) correção de erros: dano A deve ser lido, dano B não
txt = Q['demoH']['texto']
R['dano_A'] = [dict(t=t, **dict(zip(('zxing', 'opencv'), ler(quadro(t))))) for t in (34.0, 35.0, 36.0)]
R['dano_B'] = [dict(t=t, **dict(zip(('zxing', 'opencv'), ler(quadro(t))))) for t in (39.6, 40.0)]
# 3) conteúdo identificado (cena 4) e cena 6 (código lido à esquerda; link no celular)
R['cena4'] = [dict(t=t, **dict(zip(('zxing', 'opencv'), ler(quadro(t))))) for t in (27.25, 28.0)]
c6 = quadro(45.75); R['cena6'] = dict(esquerda=ler(c6[560:1160, 0:560])[0], celular=ler(c6[560:960, 560:960])[0])
R['abertura'] = [dict(t=t, zxing=ler(quadro(t))[0]) for t in (0.0, 3.0, 8.3)]
json.dump(R, open('validacao_video.json', 'w'), ensure_ascii=False, indent=1)
q = R['qr_final']
print(f"QR final: {q['zxing_ok']}/{q['testes']} ZXing, {q['opencv_ok']}/{q['testes']} OpenCV; variação máx. de pixel no cartão após {q['estatico_desde']} s: {q['variacao_max_pixels_no_cartao']}")
for f in q['falhas']: print('  falha', f)
for k in ('dano_A', 'dano_B', 'cena4', 'abertura'): print(k, [(x['t'], x['zxing'], x.get('opencv', '-')) for x in R[k]])
print('cena6', R['cena6'])
