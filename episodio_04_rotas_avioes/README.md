# Além do Visível, Ep. 04: Por que os aviões não voam em linha reta no mapa?

**Estado:** piloto renderizado, **aguardando aprovação** para o episódio completo.

## Entregáveis desta etapa
| Arquivo | O que é |
|---|---|
| `piloto_10s.mp4` | piloto v2 (17,2 s, voz ElevenLabs): gancho completo + transformação mapa → globo |
| `piloto_folha_de_contato.png` | quadros do piloto (1,6 por segundo) |
| `narracao_ia.wav` | narração **completa** do ElevenLabs montada (65,7 s), tratada, 48 kHz / 24 bits |
| `roteiro_final.txt` | roteiro com os tempos medidos de cada frase |
| `legendas.srt` | legendas da narração completa (mesma divisão de blocos da tela) |
| `storyboard.md` | storyboard das 6 cenas |
| `fontes_pesquisa.md` | fontes, coordenadas e cálculos |
| `relatorio_qualidade.md` | notas, medições e pendências |
| `configuracao_voz.json` | voz e parâmetros para as próximas produções |

`video_final.mp4`, `descricao_youtube.txt` e `tags_youtube.txt` vêm depois da aprovação.

## Como reproduzir
```bash
# 1. narração + tempos por palavra (Whisper)
python3 audio/narracao_elevenlabs.py  # monta a narração do ElevenLabs (audio/elevenlabs/)
# alternativa local: python3 audio/narracao.py (Kokoro)
python3 ferramentas_srt.py
# 2. trilha + efeitos + medição da grade (beats.json) + mixagem a -14 LUFS
python3 audio/som.py piloto
# 3. imagem (Remotion + WebGL)
cd remotion && npm install && node render.mjs Piloto out/piloto_video.mp4
#    folha de contato: node render.mjs Piloto x --stills 0,19,38 out/stills
# 4. finalização (H.264 yuv420p CRF 16 + AAC 48 kHz)
cd .. && ./finalizar.sh piloto
```
Dependências Python: numpy, scipy, soundfile, pyloudnorm, pedalboard, librosa, kokoro-onnx, faster-whisper.

## Estrutura do código (`remotion/src`)
- `geo.ts`: coordenadas, SLERP do círculo máximo, loxodromia, Mercator, distâncias, antimeridiano.
- `morph.ts`: transformação contínua folha plana → esfera (mesma fórmula do shader).
- `GlobeGL.tsx`: superfície da Terra em WebGL (Natural Earth 1:50m rasterizado com `d3-geo`).
- `Episode.tsx`: câmera, rotas, avião, marcadores, círculos de Tissot e título (função pura do quadro).
- `Captions.tsx`: legendas por palavra.
- `timeline.ts` + `data/eventos.json` + `data/beats.json`: eventos em batidas, fonte única para imagem e som.

**Contrato do estúdio:** cada quadro depende só do tempo. Não há setTimeout, requestAnimationFrame, transição de CSS nem estado entre quadros. O ruído do som usa semente fixa (`default_rng(20261117)`).

## Licenças
Tudo foi feito do zero para este episódio:
- fontes OFL: Barlow Condensed, Inter;
- dados Natural Earth: domínio público;
- voz Kokoro: Apache-2.0;
- trilha e efeitos: sintetizados em código.
