# Vinheta — "Enquanto Isso em Amontada…"

Abertura de 4,5 s para Reels (1080×1920, 30 q/s), em React + TypeScript + Remotion. Som sintetizado em Python.

## Entregáveis (`entregaveis/`)
| arquivo | conteúdo |
|---|---|
| `vinheta-enquanto-isso-em-amontada.mp4` | H.264 yuv420p CRF 16 + AAC 320k, -14 LUFS, pico ≤ -1,2 dBTP |
| `vinheta-enquanto-isso-em-amontada-sem-audio.mp4` | mesmo vídeo, sem trilha |
| `capa-vinheta.png` / `capa-vinheta_recorte4x5.png` | capa 9:16 e recorte 4:5 do feed (y 285–1635) |
| `rackel-sonic-logo/` | **assinatura sonora**: final (WAV 24 bits/48 kHz e MP3), instrumental, curta (1,75 s), stems, os três estudos, validação técnica e `IDENTIDADE_SONORA.md` (BPM, tonalidade, notas do motivo, timbres, comparação dos estudos) |
| `folha-de-contato.png` | um quadro por colcheia |

## Roteiro (fonte única: `src/timeline.json`)
120 BPM, Fá menor. Motivo **Dó5 → Fá5 → Mi♭5 · Lá♭5 → Fá5** (semicolcheias 0, 1, 3, 6, 8). Detalhes em `entregaveis/rackel-sonic-logo/IDENTIDADE_SONORA.md`.

| s | imagem | som |
|---|---|---|
| 0,00–0,375 | boca nude chega com mola, o batom entra | provocação: "pock" + Dó5 Fá5 Mi♭5 (sem resolver) |
| 0,375–1,00 | batom no lábio inferior (dir. → esq.) e no superior (esq. → dir.) | grãos de seda afinados em fusas, panorâmica segue o batom |
| 1,00 | "mwah" + câmera recua; o batom voa até a borda | estalo labial afinado, arpejo D♭maj7 |
| 1,25–2,00 | o batom traça o contorno de Amontada | traço ressonante ritmado + tiques de caneta + E♭(add9) + subida |
| 2,00 | beijo-carimbo na sede, rosa preenche o mapa | motivo nota 1 (Dó5) + beijo |
| 2,125 / 2,375 | "Enquanto" / "Isso" sobem | Fá5 / Mi♭5 |
| 2,50 | "em" estala | a melodia respira (síncope) |
| 2,75–3,00 | o batom passa e revela "Amontada" | Lá♭5 sincopado → **impacto em Fá** (baixo, palma+beijo, Fm(add9), sinos) |
| 3,25 / 3,375 / 3,5 | as reticências caem | eco Mi♭6 · Lá♭6 · Fá6 (nota de encerramento) |
| 3,5–4,00 | composição parada para leitura | cauda curta |
| 4,00–4,42 | passadas diagonais do batom (vinho → vermelho), fim em vermelho chapado | passada de ar; silêncio a partir de 4,45 s para a fala entrar |

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
    SoundDesign.tsx        toca a assinatura sonora (public/audio/vinheta_mix.wav)
    Capa.tsx               capa
  lib/anim.ts              easing, mola analítica, mulberry32, polilinhas
  lib/choreo.ts            câmera, boca e batom em função de t
  lib/layout.ts            diagramação do título e paleta
  mapa/geo.ts, contorno.json  mapa em coordenadas de tela
assets/mapa_amontada_referencia.png   mapa fornecido
tools/vetorizar_mapa.py    raster → contorno (limiar, abertura morfológica tira as linhas de coordenada, Chaikin)
tools/grao.py              textura de grão com mulberry32
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
