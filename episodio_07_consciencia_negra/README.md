# Além do Visível — Ep. 07 · 20 de novembro: a história por trás da data

| Arquivo | Conteúdo |
|---|---|
| `piloto_10s.mp4` | Piloto (11,87 s): calendário, 13 de maio × 20 de novembro, transição até 1971 |
| `narracao/narracao_original_recuperada_60s.mp3` | Narração enviada, **recuperada de zip truncado** (60,37 s) |
| `narracao/narracao_tratada.wav` | Mesma voz: EQ suave, de-esser, compressão leve, tempos idênticos |
| `roteiro_final.txt` · `storyboard.md` · `fontes_historicas.md` · `relatorio_qualidade.md` · `titulo_descricao_tags.txt` | Documentação |
| `mapa_sincronizacao.json` · `legendas.srt` · `legendas_piloto.srt` | Tempos da fala real e legendas |
| `remotion/` | Projeto Remotion editável (React + TS). `src/tema.ts` reúne cores, fontes e grade; `src/cenas/Cena01.tsx` é a cena do piloto |
| `audio/` | `som.py` (trilha, efeitos e mixagem), `sincronizar.py`, `transcrever.py`, `beats.json`, `acertos.json` |

## Comandos (a partir desta pasta)
```sh
(cd remotion && npm install)
python3 audio/transcrever.py narracao/<16k>.wav documentacao/transcricao_whisper.json   # tempos por palavra
python3 audio/sincronizar.py                    # mapa_sincronizacao.json + legendas
python3 audio/som.py piloto && cp audio/mix_piloto.wav remotion/public/   # trilha, beats.json medido, mix -14 LUFS
node render.mjs --sheet out/folha.png           # um quadro por batida (folha de contato)
node render.mjs --video out/piloto_video.mp4    # imagem: H.264 yuv420p CRF 16
node render.mjs --mux out/piloto_video.mp4 audio/mix_piloto.wav piloto_10s.mp4
(cd remotion && npm run studio)                 # edição no Remotion Studio
```
Dependências: Node 22, Chromium do ambiente, FFmpeg, Python 3 com numpy, scipy, soundfile, pyloudnorm e faster-whisper.
Fontes tipográficas: Playfair Display e IBM Plex Mono (OFL, via @fontsource). Mapa: Natural Earth (domínio público).
