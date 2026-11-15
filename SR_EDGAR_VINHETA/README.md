# SR. EDGAR Barbearia — vinheta cinematográfica 9:16

Vinheta de 8 s, 1080×1920, 60 q/s, H.264 yuv420p (CRF 16) + AAC 320k estéreo, **−14,0 LUFS** integrados, pico real −1,2 dBTP.

## Entregas
| Arquivo | O quê |
|---|---|
| `SR_EDGAR_VINHETA_FINAL.mp4` | vinheta final 1080×1920 com som |
| `SR_EDGAR_VINHETA_PREVIEW.mp4` | prévia leve 540×960 com som (para revisão no celular) |
| `SR_EDGAR_FRAME_FINAL.png` | quadro final (7,95 s) em 1080×1920 |
| `SR_EDGAR_VINHETA_ALPHA.webm` | versão com fundo transparente (VP9 com canal alfa, 11 MB) |
| `SR_EDGAR_VINHETA_ALPHA.mov` | ProRes 4444 com alfa (384 MB — fora do git; `node render.mjs --video SR_EDGAR_VINHETA_ALPHA.mov --alpha`) |
| `audio/mix.wav` · `trilha.wav` · `efeitos.wav` | master, trilha e efeitos separados (48 kHz, 24 bits) |
| `revisao/` | folha de contato (um quadro por batida), original × quadro final, mapa de camadas, espectrograma, alfa sobre fundo azul |

## Fidelidade à marca
Nada da logo foi redesenhado nem trocado por fonte parecida. `tools/segmentar.py` separa a **imagem original** em 33 camadas
(5 anéis, barra, faixa curva, cabeça, tesoura + lâmina móvel, navalha, 8 letras de SR.EDGAR, Barbearia, raios, 4 estrelas, 8 caracteres de EST. 2016):
- o fundo da logo é chapado (#1A0D04), então o alfa sai por desmistura de cor contra ele;
- anéis separados por geometria (centro 549,9/578,9; raios 224,6 · 238,6 · 262,5 · 277,6 · 299,5 px) com sondas nas frestas;
- pontas de anel grudadas nas ferramentas removidas por abertura morfológica na direção das lâminas;
- ampliação 3× com borda re-afiada (mesma forma, contorno nítido nos closes).

Recompor as camadas devolve a logo com PSNR 39,3 dB (diferença só no antisserrilhado das bordas). O quadro final do vídeo
difere da logo original em 3,97/255 em média nos pixels da marca (grão de filme + reamostragem) — ver `revisao/original_x_quadro_final.png`.

## Roteiro (tempos em batidas de 80 bpm, grade medida: 79,97 bpm, fase −2,5 ms, resíduo 1,3 ms)
| Tempo | Imagem | Som |
|---|---|---|
| 0–0,75 s | escuro; feixe dourado atravessa a tesoura em close; a lâmina abre, **corta na batida** (0,375 s) com reflexo correndo pelo fio, e reabre | atrito de abertura, corte (deslize + choque + anel metálico), cello grave |
| 0,75–1,5 s | corte seco: navalha em close desliza pelo eixo enquanto a luz percorre a lâmina | navalha (ressonância 1,8→6,5 kHz + anel de aço) |
| 1,5–3 s | câmera recua e desfaz o ângulo holandês; ferramentas encaixam em 2,25 s; barra e anéis desenhados por linhas de luz; barbeiro revelado por luz lateral | contrabaixo, tambor de moldura, cliques metálicos no encaixe, brilho dos anéis |
| 3–5 s | câmera recua até o enquadramento final; coluna de luz atravessa o centro e revela **SR.EDGAR na batida grave** (3,75 s); faixa curva se desenha; arcos de baixo começam | subida + vácuo de 130 ms → impacto, tímpano, piano grave, naipe em ré menor |
| 5–6,5 s | raios se abrem, "Barbearia" é escrita, EST. 2016 sai de trás do anel, estrelas giram com reflexos; brilho metálico percorre o emblema | piano, ostinato, sininhos nas estrelas, chiado metálico |
| 6,5–8 s | aproximação quase imperceptível; a tesoura dá o corte final na batida (6,75 s); marca limpa e parada no último 1 s | assinatura: corte + ré menor com nona, cauda natural |

## Como refazer
```bash
python3 tools/segmentar.py          # camadas a partir de assets/original/logo_original.jpg
python3 tools/conferir_camadas.py   # mapa de camadas + erro de recomposição
python3 audio/som.py                # trilha, efeitos, master −14 LUFS, beats.json/beats.js (grade medida)
node render.mjs --sheet out/folha.png                      # um quadro por batida
node render.mjs --video out/v.mp4 && node render.mjs --mux out/v.mp4 audio/mix.wav SR_EDGAR_VINHETA_FINAL.mp4
node render.mjs --video out/p.mp4 --scale 0.5              # prévia
node render.mjs --video SR_EDGAR_VINHETA_ALPHA.mov --alpha # ProRes 4444 com alfa
```
Os tempos dos eventos ficam em `timeline.json` (em batidas), lidos tanto pela animação (`js/vinheta.js`) quanto pelo som (`audio/som.py`).
A animação é função pura do tempo (`window.seek(t)`), sem timers nem `Math.random` (ruído com mulberry32), com desfoque de movimento
por subquadros (obturador de 180°) só onde há movimento rápido.

Dependências: Node 22 + Playwright 1.63 (Chromium), FFmpeg, Python 3 com numpy, scipy, opencv-python-headless, pyloudnorm, soundfile.
