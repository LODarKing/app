# Vinheta — "Enquanto Isso em Amontada…"

Abertura de 4,5 s para Reels (1080×1920, 30 q/s), em React + TypeScript + Remotion. Som sintetizado em Python.

## Entregáveis (`entregaveis/`)
| arquivo | conteúdo |
|---|---|
| `vinheta-enquanto-isso-em-amontada.mp4` | H.264 yuv420p CRF 16 + AAC 320k, -14 LUFS, pico ≤ -1,2 dBTP |
| `vinheta-enquanto-isso-em-amontada-sem-audio.mp4` | mesmo vídeo, sem trilha |
| `capa-vinheta.png` / `capa-vinheta_recorte4x5.png` | capa 9:16 e recorte 4:5 do feed (y 285–1635) |
| `rackel-sonic-logo/` | **assinatura sonora**: final (WAV 24 bits/48 kHz e MP3), instrumental, curta (1,75 s), stems, os três estudos, validação técnica e `IDENTIDADE_SONORA.md` (BPM, tonalidade, notas do motivo, timbres, comparação dos estudos) |
| `lettering/` | **lettering autoral**: três propostas em PNG + comparativo, SVGs editáveis (cor, monocromático, negativo, logotipo, quadro completo) e `LETTERING.md` |
| `folha-de-contato.png` | um quadro por colcheia |

## Roteiro (fonte única: `src/timeline.json`; som intocado: assinatura sonora em 120 BPM, Fá menor)
| s | imagem | som |
|---|---|---|
| 0,00–1,00 | boca editorial (cores chapadas, contorno vinho); o batom passa no lábio inferior e no superior | provocação "pock" + Dó5 Fá5 Mi♭5; grãos de seda |
| 1,00–1,25 | "mwah"; uma fita de batom se desprende do canto da boca e voa até a borda | estalo afinado, arpejo |
| 1,25–2,00 | o batom traça o contorno real de Amontada com o mesmo bisel das letras | traço ressonante + tiques de caneta |
| 2,00 | beijo-carimbo na sede; o rosa preenche o mapa; uma segunda fita desce do mapa | motivo nota 1 (Dó5) |
| 2,11–2,55 | "Enquanto" nasce do traço que chegou (letra a letra, traço a traço) | Fá5 |
| 2,375 / 2,50 | "Isso" e o "em" delicado | Mi♭5 · respiro |
| 2,75–3,00 | o batom volta e escreve "Amontada" (o travessão do A nasce primeiro); carimbo no impacto | Lá♭5 → impacto em Fá |
| 3,25 / 3,375 / 3,5 | as reticências caem como toques de batom | eco Mi♭6 · Lá♭6 · Fá6 |
| 3,5–4,0 | assinatura estável: mapa + beijo + lettering | cauda curta |
| 4,00–4,42 | quatro passadas gigantes do mesmo bisel cobrem a tela; termina em cereja chapado | passada de ar |

## Estrutura
```
src/
  timeline.json            tempos (lidos pela composição e pelo som)
  Root.tsx, index.ts       composições "Vinheta" (135 q) e "Capa" (still)
  components/
    MainComposition.tsx    camadas: fundo, mundo (mapa + boca sob a câmera), título, batom, saída, grão
    Background.tsx         papel rosa-claro + formas orgânicas que respiram
    Lips.tsx               boca editorial e máscaras do batom
    Lettering.tsx          desenha o lettering a partir dos esqueletos (revelação por caminho)
    TitleLettering.tsx     coreografia do lettering na vinheta
    Proposta.tsx           pranchas das três propostas
    Lipstick.tsx           desenho do batom
    LipstickAnimation.tsx  boca no mundo + batom em primeiro plano
    MapDrawAnimation.tsx   contorno com o bisel, fitas que se desprendem, preenchimento e anel do beijo
    ExitSwipe.tsx          saída (pincelada gigante do bisel)
    SoundDesign.tsx        toca a assinatura sonora (public/audio/vinheta_mix.wav)
    Capa.tsx               capa
  lib/anim.ts              easing, mola analítica, mulberry32, polilinhas
  lib/choreo.ts            câmera, boca e batom em função de t
  lib/layout.ts            paleta
  lettering/               motor (engine.js), letras (glyphs.js), composições (lockups.js), final.js, lipsPaths.js
  mapa/geo.ts, contorno.json  mapa em coordenadas de tela
assets/mapa_amontada_referencia.png   mapa fornecido
tools/vetorizar_mapa.py    raster → contorno (limiar, abertura morfológica tira as linhas de coordenada, Chaikin)
tools/grao.py              textura de grão com mulberry32
tools/exportar_svg.mjs     exporta o lettering e a assinatura em SVG editável
audio/sonic_logo.py        assinatura sonora: timbres, estudos A/B/C, final, instrumental, curta, stems, master -14 LUFS
audio/validar_som.py       validação técnica (notas, sincronia, mono, celular, espectros) + audio/beats.json
render.mjs                 render (folha de contato, quadros, capa, vídeos)
```

## Como refazer
```bash
npm install
python3 tools/vetorizar_mapa.py     # só se trocar o mapa
python3 audio/sonic_logo.py         # assinatura sonora e todas as versões
python3 audio/validar_som.py        # relatório técnico + beats.json
node render.mjs --sheet             # folha de contato (um quadro por batida; --oitavas para colcheias)
node render.mjs --propostas         # as três propostas de lettering + comparativo
node tools/exportar_svg.mjs         # SVGs editáveis
node render.mjs --tudo              # capa + vídeos com e sem áudio
npx remotion studio src/index.ts    # edição/pré-visualização
```
Determinismo: cada quadro é função pura de `frame/30`. Não há transições CSS, timers ou estado entre quadros, e todo ruído usa semente.
O Remotion faz o papel do `window.seek(t)` do estúdio.

## Identidade
- **Sem fontes.** O título é lettering autoral: esqueletos desenhados à mão e escritos por um bisel de batom virtual (espessura pela direção, pontas cortadas no ângulo do bisel). Detalhes em `entregaveis/lettering/LETTERING.md`.
- Cores: cereja `#D90429`, rosa vibrante `#FF4D6D`, rosa-pálido `#FFC9D3`/`#FFF1F2`, vinho `#7B0D1E`, creme `#FFF6EE`.
- Composição assimétrica: mapa levemente à direita, lettering em degraus à esquerda, dentro da área segura do Reels.
