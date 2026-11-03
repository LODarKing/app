# Nós e Amarras — Série Especialidades dos Desbravadores

Vídeo vertical (1080×1920, 30 q/s, ≤ 180 s) sobre a parte teórica da especialidade de Nós e Amarras (AR-040).
Animação vetorial em canvas 2D, desenhada do zero em código. Render determinístico: `window.seek(t)` desenha o quadro do instante t.

## Pastas
| Caminho | Conteúdo |
|---|---|
| `config.js` | **Tudo que se edita sem mexer no desenho**: cores, fontes, textos e rótulos, tempos, legendas e arquivos de áudio. |
| `js/core.js` | Canvas, easing, ruído com semente, fundo, câmera, texto, legendas e setas de torção. |
| `js/rope.js` | Motor da corda: curva por pontos, cordões torcidos, sombreado, cruzamentos automáticos com regra por cima/por baixo, revelação pela ponta e acabamento das pontas. |
| `js/nos.js` | Desenhos dos nós (conferidos no laboratório). |
| `js/cenas/` | Uma cena por arquivo. |
| `audio/` | Síntese da trilha e dos efeitos (`som_piloto.py`, `timbres.py`), além de `beats.json` (batidas medidas) e `acertos.json`. |
| `documentacao/` | Fontes, nomenclatura, matriz de cobertura, roteiro, storyboard e notas das folhas de contato. |

## Comandos (a partir desta pasta)
```sh
python3 audio/som_piloto.py violao                       # trilha + efeitos (violao | piano | moderno), batidas medidas, -14 LUFS
node render.mjs --sheet out/folha_piloto.png             # um quadro por batida (ciclo de notas)
node render.mjs --lab out/lab_oito.png oito              # conferência de um nó: cruzamentos numerados e sequência C/B
node render.mjs --stills out/tira.png 1.0 1.033 1.066    # quadros seguidos
node render.mjs --video out/piloto_video.mp4 0 10        # imagem (H.264 yuv420p CRF 16)
node render.mjs --mux out/piloto_video.mp4 audio/trilha_piloto_violao.wav NOS_E_AMARRAS_PILOTO.mp4
```
Dependências: Node 22 com Playwright e o Chromium do ambiente, FFmpeg, e Python 3 com numpy, scipy, soundfile e pyloudnorm.

## Regras do motor da corda
- Toda forma nasce com **a ponta guiando a corda** ao longo do caminho final. Mudanças de forma são desfazer e refazer pela ponta, nunca interpolação que faça uma corda atravessar outra.
- Os cruzamentos são detectados automaticamente. O padrão `alt` alterna por cima e por baixo ao longo do caminho; um padrão explícito (`'OUUO…'`) é usado nos nós não alternados.
- O laboratório (`--lab`) mostra cada cruzamento numerado e a sequência C (cima) / B (baixo) ao longo da corda.
