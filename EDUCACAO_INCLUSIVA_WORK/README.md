# EDUCACAO_INCLUSIVA_WORK

Série Especialidades dos Desbravadores — episódio **Educação Inclusiva: Ninguém fica de fora!**
Reels 9:16 · 1080×1920 · 60 fps · 180 s · H.264 + AAC 48 kHz estéreo.

## Versão atual (v3, Remotion)

A animação foi refeita no **Remotion** (React + SVG) a partir das folhas de personagem enviadas pelo usuário, depois que o piloto foi aprovado.

- **Personagens:** Gabriel, Desbravadora e Theo foram vetorizados das referências em `assets/researched_references/` por `tools/vectorize.py`.
  - As áreas escondidas atrás de braços e pernas são preenchidas, para não aparecer buraco quando eles se movem.
  - Braços e mangas são peças desenhadas por inteiro.
  - Rostos, mãos abertas e as rodas da cadeira são paramétricos, para poderem ser animados.
- **Cenas:** `remotion/src/full/scenes/S01.tsx` a `S10.tsx`.
  - O encadeamento das cenas e as transições ficam em `remotion/src/full/Full.tsx`.
  - As legendas dinâmicas palavra por palavra ficam em `remotion/src/full/Captions.tsx`.
- **Cenas bíblicas e históricas (6, 7 e 8):** usam o estilo "livro ilustrado" com silhuetas (`remotion/src/full/story.tsx`). Não há folhas de referência para esses personagens, então nenhum rosto foi inventado.
- **Mapas:** Natural Earth 1:110m, de domínio público (`assets/geo`, convertido por `tools/geo_paths.py`).
- **Áudio:** `src/audio/full_mix.py` junta a voz editada, a música com *ducking* e 288 efeitos sincronizados com a animação. O resultado tem −14 LUFS e pico de −1,3 dBTP.

```sh
python3 tools/vectorize.py gabriel && python3 tools/vectorize.py girl && python3 tools/vectorize.py theo
python3 tools/geo_paths.py && python3 src/audio/full_mix.py && python3 tools/make_srt_v3.py
cd remotion && npm install
npx remotion render src/index.ts Completo out/completo_raw.mp4 --codec=h264 --crf=16 --concurrency=4
npx remotion render src/index.ts CompletoSemLegendas out/completo_semleg_raw.mp4 --codec=h264 --crf=16 --concurrency=4
npx remotion still src/index.ts Capa out/capa.png
cd .. && tools/finalize_v3.sh && tools/make_zip.sh
```

O piloto aprovado (0–10,6 s) está em `deliverables/piloto/`.

---

## Versão anterior (v1, Three.js + HyperFrames), mantida como histórico

## Estrutura

```
assets/original_audio/     gravações originais do narrador (intocadas) + SHA256SUMS
assets/generated_assets/   fontes Poppins (OFL)
audio/                     voice_original / voice_clean / voice_edited / voice_comparison /
                           music / sfx / master (.wav) + voice_edited_natural_tempo.flac
src/audio/                 diagnóstico, restauração, edição, trilha, efeitos, mixagem (Python)
src/core/                  paleta, matemática determinística, primitivas vetoriais, palco/compositor
src/rigs/ src/characters/  rig 2D com IK e elenco procedural
src/objects/               cadeiras de rodas, bengala longa, tablet de CAA, ícones/efeitos
src/environments/          clube, salas, cenários bíblicos e históricos
src/animations/            ciclos (caminhada com pés plantados, propulsão, bengala, gestos)
src/scenes/                s01…s10 + kit (atores) + ui (camada de tela)
src/main.js                linha do tempo mestre (evento hf-seek do HyperFrames, t = frame/fps)
hyperframes/main/          composição HyperFrames (index.html + world.js + gsap.min.js)
hyperframes/cover/         página da capa
tools/                     build, overlay/legendas, snapshots, prévias, folhas de contato
subtitles/                 final.srt + AUDIODESCRICAO.md
documentation/             relatórios, matriz de requisitos, linha do tempo, manifesto
renders/                   testes de personagem, prévias de cena, folhas de controle de qualidade
deliverables/              vídeos finais, capa, zip do projeto, relatório
```

## Reproduzir

Requisitos: Node 22, Python 3.13, FFmpeg 6, rubberband-cli 3.3,
`pip install numpy scipy librosa soundfile pyloudnorm faster-whisper pedalboard matplotlib pillow`
e `npm install` nesta pasta (three, gsap, hyperframes, esbuild).

```sh
# 1) áudio
python3 src/audio/analyze.py audio/takes_original > documentation/audio_diagnostic_raw.json
python3 src/audio/process_voice.py                          # cadeia de restauração -> audio/clean_takes
EQ_PRESET=v1 OUT_DIR=audio/clean_takes_vad python3 src/audio/process_voice.py   # base fixa para a análise dos pontos de corte
python3 src/audio/edit_voice.py                             # edição -> voice_edited_natural_mono.wav
rubberband --fine -F -D 178.2 --timemap audio/work/timemap.txt audio/voice_edited_natural_mono.wav audio/work/voice_stretched_mono.wav
python3 src/audio/master_voice.py && python3 src/audio/scene_bounds.py
python3 src/audio/music.py && python3 src/audio/sfx.py && python3 src/audio/mix.py
python3 src/audio/ab_compare.py
# 2) vídeo
tools/build.sh                      # empacota o mundo Three.js
python3 tools/build_overlay.py      # títulos, legendas (HTML/GSAP) + subtitles/final.srt
cd hyperframes/main && npx hyperframes render -f 60 -q high -w 4 -o ../../renders/final/hf_with_subs.mp4
npx hyperframes render -f 60 -q high -w 4 --variables '{"subs":"off"}' -o ../../renders/final/hf_no_subs.mp4
cd ../.. && tools/finalize.sh       # mux com master.wav + codificação final + controle de qualidade
```

Para conferir frames sem renderizar: `NODE_PATH=$(npm root -g) node tools/snap.cjs hyperframes/main/index.html out 12.5 40` (tempos em segundos).
