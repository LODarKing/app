#!/bin/bash
# Finalização: vídeo do Remotion (H.264 CRF 16) + mixagem -> MP4 H.264 yuv420p (faixa TV, BT.709) + AAC 48 kHz.
# Uso: ./finalizar.sh piloto|episodio
set -e
M=${1:-piloto}; V=remotion/out/${M}_video.mp4; A=audio/mix/${M}_mix.wav
OUT=$([ "$M" = piloto ] && echo piloto_10s.mp4 || echo video_final.mp4)
ffmpeg -loglevel error -y -i "$V" -i "$A" -map 0:v -map 1:a \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 16 -profile:v high \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
  -metadata title="Além do Visível — Ep. 04 — Por que os aviões não voam em linha reta no mapa?" \
  -metadata comment="Animação programática (Remotion/WebGL) e narração sintetizada por IA (Kokoro, voz pm_santa). Trilha e efeitos sintetizados em código." "$OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,color_range,r_frame_rate,sample_rate,channels -show_entries format=duration -of compact "$OUT"
ffmpeg -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|Peak|LRA:"
