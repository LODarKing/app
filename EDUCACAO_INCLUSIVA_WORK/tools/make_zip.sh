#!/bin/sh
# Source package: code, composition, procedural assets, configs, docs, subtitles and the original narration.
cd "$(dirname "$0")/.."
rm -f deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip
zip -q -r -9 deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip \
  README.md package.json package-lock.json src tools \
  hyperframes/main/index.html hyperframes/main/world.js hyperframes/main/gsap.min.js hyperframes/main/dev.html \
  hyperframes/cover/cover.html hyperframes/character_test/index.html hyperframes/character_test/world.js \
  assets/original_audio assets/generated_assets/fonts \
  subtitles documentation \
  -x "*/__pycache__/*" "*.pyc"
ls -la deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip
