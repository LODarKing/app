#!/bin/sh
# Mux the HyperFrames renders with the mastered audio, encode the deliverables and run QC.
set -e
cd "$(dirname "$0")/.."
enc() {  # $1 = HyperFrames render, $2 = deliverable
  ffmpeg -v error -y -i "$1" -i audio/master.wav -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -profile:v high -level 4.2 -preset slow -crf 19 -maxrate 3.6M -bufsize 7.2M \
    -pix_fmt yuv420p -r 60 -g 120 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart -t 180 "$2"
}
enc renders/final/hf_with_subs.mp4 deliverables/EDUCACAO_INCLUSIVA_FINAL.mp4
enc renders/final/hf_no_subs.mp4 deliverables/EDUCACAO_INCLUSIVA_SEM_LEGENDAS.mp4
cp audio/voice_edited.wav audio/voice_comparison.wav deliverables/
cp subtitles/final.srt deliverables/
python3 tools/qc_final.py
