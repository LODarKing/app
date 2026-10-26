#!/bin/sh
# Pacote do projeto (v3 Remotion): código, configurações, referências do usuário, documentação, legendas e narração original.
cd "$(dirname "$0")/.."
rm -f deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip
zip -q -r -9 deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip \
  README.md src tools \
  remotion/package.json remotion/package-lock.json remotion/tsconfig.json remotion/remotion.config.ts remotion/README.md remotion/src \
  remotion/public/emblema.png remotion/public/emblema_recortado.png remotion/public/Poppins-*.ttf \
  assets/original_audio assets/generated_assets/fonts assets/researched_references assets/official_logos assets/geo \
  subtitles documentation \
  -x "*/__pycache__/*" "*.pyc" "src/v2/*"
ls -la deliverables/EDUCACAO_INCLUSIVA_PROJETO.zip
