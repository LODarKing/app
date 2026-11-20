# Além do Visível — Ep. 07 · 20 de novembro: a história por trás da data

| Arquivo | Conteúdo |
|---|---|
| `piloto_10s.mp4` | Piloto aprovado (11,87 s) |
| `video_final.mp4` | **Episódio final** (70,07 s), narração íntegra |
| `refazer_com_audio_completo.sh` | Um comando: recebe um MP3 de narração e refaz transcrição, legendas, tempos do fim, trilha, mix e `video_final.mp4` |
| `capa/CAPA_EP07_CONSCIENCIA_NEGRA.png` | Capa 9:16 (essencial na faixa 4:5, y 285–1635) + `_recorte4x5.png` (perfil) + `_guia4x5.png` (conferência). Gerada pela composição `Capa` do Remotion: `node render.mjs --frame capa/CAPA_EP07_CONSCIENCIA_NEGRA.png 0 Capa` |
| `marca/Logo_AV.png` | Logo AV original enviada pelo canal (usada sem alteração) |
| `narracao/narracao_original.mp3` | Narração original (ElevenLabs), íntegra, 64,52 s |
| `narracao/narracao_tratada.wav` | Mesma voz: EQ suave, de-esser, compressão leve, tempos idênticos |
| `roteiro_final.txt` · `storyboard.md` · `fontes_historicas.md` · `relatorio_qualidade.md` · `titulo_descricao_tags.txt` | Documentação |
| `mapa_sincronizacao.json` · `legendas.srt` · `legendas_piloto.srt` | Tempos da fala real e legendas |
| `remotion/` | Projeto Remotion editável (React + TS). `src/tema.ts` reúne cores, fontes e grade; `src/cenas/Cena01..07.tsx` são as cenas; `src/comp/Pessoa.tsx` desenha as figuras da cena 06; `src/geo.ts` faz a projeção dos mapas |
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

# episódio completo
python3 audio/som.py episodio && cp audio/mix_episodio.wav remotion/public/
node render.mjs --sheet out/folha.png Episodio 39 50   # folha de contato de um trecho
node render.mjs --video out/episodio_video.mp4 Episodio  # (EpisodioSemLegenda = versão limpa)
node render.mjs --mux out/episodio_video.mp4 audio/mix_episodio.wav video_final.mp4
./refazer_com_audio_completo.sh Narração.mp3            # tudo de novo com o áudio íntegro
(cd remotion && npm run studio)                 # edição no Remotion Studio
```
Dependências: Node 22, Chromium do ambiente, FFmpeg, Python 3 com numpy, scipy, soundfile, pyloudnorm e faster-whisper.
Fontes tipográficas: Playfair Display e IBM Plex Mono (OFL, via @fontsource). Mapa: Natural Earth (domínio público).
