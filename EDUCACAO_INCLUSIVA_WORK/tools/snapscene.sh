#!/bin/sh
# Usage: tools/snapscene.sh <sceneIndex1based> t1 t2 ... (local times) -> renders/scene_previews/sNN_sheet.png
cd "$(dirname "$0")/.."
N=$1; shift
S=$(python3 -c "import json;print(json.load(open('documentation/scene_bounds.json'))[$N-1]['start'])")
TS=$(python3 -c "import sys;print(' '.join(str(round($S+float(x),3)) for x in sys.argv[1:]))" "$@")
P=renders/scene_previews/s$(printf %02d $N)
rm -f ${P}_*.png
NODE_PATH=$(npm root -g) node tools/snap.cjs hyperframes/main/dev.html $P $TS | grep -v "^t=" 
python3 tools/sheet.py ${P}_sheet.png 4 270 ${P}_[0-9]*.png
