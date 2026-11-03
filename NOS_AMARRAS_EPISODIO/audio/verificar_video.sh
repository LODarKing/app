#!/bin/bash
# Verificação do vídeo pronto: duração (imagem e som), quadros pretos, congelamentos, volume e varredura de 1 quadro/s.
# Uso: bash audio/verificar_video.sh ARQUIVO.mp4 [saida_varredura.png]
f="$1"; out="${2:-out/varredura.png}"
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,duration -of compact "$f"
ffmpeg -hide_banner -i "$f" -vf "blackdetect=d=0.1:pix_th=0.05,freezedetect=n=0.0005:d=2" -af ebur128=peak=true -f null - 2>&1 | grep -E "black_start|freeze_start|freeze_duration|^\s+I:|Peak:" | sed 's/.*\] //'
ffmpeg -loglevel error -y -i "$f" -vf "fps=1,scale=135:-1,tile=15x14" -frames:v 1 "$out" && echo "varredura: $out"
