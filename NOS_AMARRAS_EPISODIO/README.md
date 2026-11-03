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

## Episódio completo (a partir desta pasta)
```sh
python3 audio/transcrever.py                             # transcrição das gravações originais (narracao/originais/*.wav)
python3 audio/tratar_narracao.py 1.15 narracao/tratadas  # tratamento leve + andamento 1,15× (autorizado) -> copiar para falas/
node audio/montar_timeline.mjs                           # timeline.js (cenas pelas palavras) + legendas + NOS_E_AMARRAS.srt
python3 audio/som_episodio.py                            # trilha + foley + narração, -14 LUFS -> audio/mix.wav
node render.mjs --sheet out/folha_s03.png s3             # folha de contato de uma cena
node render.mjs --video out/episodio_video.mp4           # imagem com legendas  (--sem-legenda para a versão limpa)
node render.mjs --mux out/episodio_video.mp4 audio/mix.wav NOS_E_AMARRAS_FINAL.mp4
```
Textos de legenda: grafia e quebras em `config.js` (`grafia`, `quebras`); tempos das cenas: `cenas[].extra` e `vo`.

## Comandos do piloto (a partir desta pasta)
```sh
python3 audio/som_piloto.py moderno musical              # trilha (violao|piano|moderno) + efeitos (nenhum|foley|musical|toques), -14 LUFS
node render.mjs --sheet out/folha_piloto.png             # um quadro por batida (ciclo de notas)
node render.mjs --lab out/lab_oito.png oito              # conferência de um nó: cruzamentos numerados e sequência C/B
node render.mjs --stills out/tira.png 1.0 1.033 1.066    # quadros seguidos
node render.mjs --video out/piloto_video.mp4 0 10        # imagem (H.264 yuv420p CRF 16)
node render.mjs --mux out/piloto_video.mp4 audio/trilha_piloto_moderno_musical.wav NOS_E_AMARRAS_PILOTO.mp4
```
Dependências: Node 22 com Playwright e o Chromium do ambiente, FFmpeg, e Python 3 com numpy, scipy, soundfile e pyloudnorm.

## Regras do motor da corda
- Toda forma nasce com **a ponta guiando a corda** ao longo do caminho final. Mudanças de forma são desfazer e refazer pela ponta, nunca interpolação que faça uma corda atravessar outra.
- Os cruzamentos são detectados automaticamente. O padrão `alt` alterna por cima e por baixo ao longo do caminho; um padrão explícito (`'OUUO…'`) é usado nos nós não alternados.
- O laboratório (`--lab`) mostra cada cruzamento numerado e a sequência C (cima) / B (baixo) ao longo da corda.
