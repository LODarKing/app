#!/usr/bin/env bash
# Refaz o episódio com a narração ÍNTEGRA (substitui o arquivo recuperado do zip truncado).
# uso (a partir desta pasta):  ./refazer_com_audio_completo.sh /caminho/Narração.mp3
# Tudo é recalculado a partir da fala real: transcrição, legendas, tempos do encerramento, trilha, mixagem, vídeo.
set -euo pipefail
ENT="$1"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENT"
cp "$ENT" narracao/narracao_original.mp3
ffmpeg -loglevel error -y -i narracao/narracao_original.mp3 -ar 16000 -ac 1 narracao/_16k.wav
python3 audio/transcrever.py narracao/_16k.wav documentacao/transcricao_whisper.json medium
rm -f narracao/_16k.wav
python3 audio/sincronizar.py            # para com erro se a fala diferir do texto das legendas
python3 audio/som.py episodio            # trilha + voz tratada + mix -14 LUFS (acertos finais na grade)
cp audio/mix_episodio.wav remotion/public/
node render.mjs --sheet out/folha_encerramento.png Episodio 56 80
node render.mjs --video out/episodio_video.mp4 Episodio
node render.mjs --mux out/episodio_video.mp4 audio/mix_episodio.wav video_final.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,sample_rate:format=duration -of compact video_final.mp4
ffmpeg -hide_banner -i video_final.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|Peak:"
