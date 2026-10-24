#!/bin/sh
# Production renders through HyperFrames (60 fps, 1080x1920). Audio is muxed afterwards with FFmpeg.
cd "$(dirname "$0")/../hyperframes/main"
LOG=../../renders/final/render.log
echo "start subs $(date)" > $LOG
npx hyperframes render -f 60 -q high -w 4 -o ../../renders/final/hf_with_subs.mp4 >> $LOG 2>&1
echo "start nosubs $(date)" >> $LOG
npx hyperframes render -f 60 -q high -w 4 --variables '{"subs":"off"}' -o ../../renders/final/hf_no_subs.mp4 >> $LOG 2>&1
echo "done $(date)" >> $LOG
