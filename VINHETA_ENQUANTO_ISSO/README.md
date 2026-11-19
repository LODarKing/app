# Vinheta — "Enquanto Isso em Amontada…"

Abertura de 4,5 s para Reels (1080×1920, 30 q/s), em React + TypeScript + Remotion. Som sintetizado em Python.

## Entregáveis (`entregaveis/`)
| arquivo | conteúdo |
|---|---|
| `vinheta-enquanto-isso-em-amontada.mp4` | H.264 yuv420p CRF 16 + AAC 320k, -14 LUFS, pico -1,5 dBTP |
| `vinheta-enquanto-isso-em-amontada-sem-audio.mp4` | mesmo vídeo, sem trilha |
| `capa-vinheta.png` / `capa-vinheta_recorte4x5.png` | capa 9:16 e recorte 4:5 do feed (y 285–1635) |
| `audio/vinheta_mix.wav` | mixagem final (48 kHz, estéreo) |
| `audio/stems/{trilha,bateria,efeitos}.wav` | faixas separadas, mesmo ganho da mixagem |
| `audio/beats.json` | grade de 120 BPM, acertos e onsets medidos (desvio ≤ 5 ms) |
| `folha-de-contato.png` | um quadro por colcheia |

## Roteiro (fonte única: `src/timeline.json`)
| s | imagem | som |
|---|---|---|
| 0,00 | boca nude chega com mola, o batom entra pela direita | bumbo + acorde Fm9 "glam" |
| 0,25–0,60 | batom passa no lábio inferior (direita → esquerda), o vermelho é revelado pela máscara do gesto | textura cerosa, panorâmica acompanha o batom |
| 0,625–1,00 | lábio superior (esquerda → direita) | segunda passada |
| 1,00 | "mwah": a boca franze e solta; a câmera recua | estalo labial + whoosh descendente |
| 1,00–1,25 | o batom sai do canto da boca e voa até a borda do mapa enquanto a câmera recua | arpejo em semicolcheias |
| 1,25–2,00 | o batom traça só o contorno do município (litoral com o batom, o lado sul se desenha sozinho); a boca fica na sede | arpejo continua |
| 2,00 | beijo-carimbo na sede; o rosa preenche o mapa a partir dela (sem linhas internas nem pontos) | carimbo + sinos |
| 2,25 | "Enquanto Isso" sobe por máscara | estalo |
| 2,50–2,85 | "em" estala; o batom passa e revela "Amontada" | impacto + passada |
| 3,00 / 3,125 / 3,25 | as reticências caem uma a uma | três notas |
| 3,25–4,00 | composição parada para leitura | — |
| 4,00–4,42 | duas passadas diagonais com a ponta chanfrada do batom (vinho → vermelho); termina em vermelho chapado para o corte | whoosh + acerto final |

## Estrutura
```
src/
  timeline.json            tempos (lidos pela composição e pelo som)
  Root.tsx, index.ts       composições "Vinheta" (135 q) e "Capa" (still)
  components/
    MainComposition.tsx    camadas: fundo, mundo (mapa + boca sob a câmera), título, batom, saída, grão
    Background.tsx         papel rosa-claro + formas orgânicas que respiram
    Lips.tsx               desenho da boca (vetorial) e máscaras do batom
    Lipstick.tsx           desenho do batom
    LipstickAnimation.tsx  boca no mundo + batom em primeiro plano
    MapDrawAnimation.tsx   contorno, preenchimento e anel do beijo
    TitleAnimation.tsx     tipografia animada
    ExitSwipe.tsx          saída
    SoundDesign.tsx        toca a mixagem (pré-visualização no Studio)
    Capa.tsx               capa
  lib/anim.ts              easing, mola analítica, mulberry32, polilinhas
  lib/choreo.ts            câmera, boca e batom em função de t
  lib/layout.ts            diagramação do título e paleta
  mapa/geo.ts, contorno.json  mapa em coordenadas de tela
assets/mapa_amontada_referencia.png   mapa fornecido
tools/vetorizar_mapa.py    raster → contorno (limiar, abertura morfológica tira as linhas de coordenada, Chaikin)
tools/grao.py              textura de grão com mulberry32
audio/sintetizar.py        síntese, mixagem, -14 LUFS, medição da grade
render.mjs                 render (folha de contato, quadros, capa, vídeos)
```

## Como refazer
```bash
npm install
python3 tools/vetorizar_mapa.py     # só se trocar o mapa
python3 audio/sintetizar.py         # trilha + beats.json
node render.mjs --sheet             # folha de contato (um quadro por batida; --oitavas para colcheias)
node render.mjs --tudo              # capa + vídeos com e sem áudio
npx remotion studio src/index.ts    # edição/pré-visualização
```
Determinismo: cada quadro é função pura de `frame/30`. Não há transições CSS, timers ou estado entre quadros, e todo ruído usa semente.
O Remotion faz o papel do `window.seek(t)` do estúdio.

## Identidade
- Fontes: **Anton** para o título ("Enquanto Isso", "Amontada…") e **Poppins SemiBold Itálico** de apoio ("em").
- Cores: vermelho `#D90429` (destaque), vinho `#7B0D1E`, rosa vibrante `#FF4D6D`, rosa-claro `#FFF1F2`, preenchimento `#FFC9D3`.
- Diagramação alinhada à esquerda, dentro da área segura do Reels (texto entre y 1084 e 1480, x ≤ 940).
- Para trocar a cidade: novo raster em `assets/`, rode `tools/vetorizar_mapa.py`, ajuste a sede em `src/mapa/geo.ts` e o texto em `TitleAnimation.tsx` (largura do nome em `lib/layout.ts`).
