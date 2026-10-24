#!/bin/sh
# Versão 3 (Remotion): codifica as entregas a partir dos renders do Remotion + mixagem completa e roda o controle de qualidade.
set -e
cd "$(dirname "$0")/.."
enc() {  # $1 = render do Remotion, $2 = entrega
  ffmpeg -v error -y -i "$1" -i remotion/public/completo_mix.wav -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -profile:v high -level 4.2 -preset slow -crf 18 -maxrate 4.5M -bufsize 9M \
    -pix_fmt yuv420p -r 60 -g 120 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart -t 180 "$2"
}
enc remotion/out/completo_raw.mp4 deliverables/EDUCACAO_INCLUSIVA_FINAL.mp4
enc remotion/out/completo_semleg_raw.mp4 deliverables/EDUCACAO_INCLUSIVA_SEM_LEGENDAS.mp4
cp audio/voice_edited.wav audio/voice_comparison.wav deliverables/
cp subtitles/final.srt deliverables/
cp remotion/out/capa.png deliverables/EDUCACAO_INCLUSIVA_CAPA.png
MASTER=audio/master_v3.wav python3 tools/qc_final.py
