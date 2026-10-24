#!/bin/sh
# waits for the running no-subs render, then renders the subtitled version (detached)
cd "$(dirname "$0")/../hyperframes/main"
while pgrep -f "hf_no_subs.mp4" > /dev/null; do sleep 20; done
date >> ../../renders/final/render_subs.log
npx hyperframes render -f 60 -q high -w 4 -o ../../renders/final/hf_with_subs.mp4 >> ../../renders/final/render_subs.log 2>&1
date >> ../../renders/final/render_subs.log
