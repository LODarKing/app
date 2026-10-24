# Remotion — piloto (v3)

Pilot of the first 10.6 s of scene 1, rebuilt in **Remotion** (React + SVG) after the user's feedback.
It covers the full narration line "Imagine chegar ao seu clube… Hoje, vamos descobrir", so the cut doesn't land mid-word.

## Characters
The user's own model sheets (in `assets/researched_references/`) are vectorized by `tools/vectorize.py`. The pipeline:

1. k-means color quantization in Lab space, then a majority filter.
2. Optional edge-preserving smoothing.
3. The source is split into rig parts by polygons. The settings live in `tools/vectorize_configs.py`.
4. Each color region is traced with potrace into stacked SVG layers. Layers are unioned with the ones above them, so no hairline gaps appear between colors.

What stays parametric, so it can be animated:

| Element | Character | File |
|---|---|---|
| Eyes (blink, gaze), brows, mouth (smile/open/worry) | all | `src/chars/Face.tsx`, `src/chars/Theo.tsx` |
| Open hand for waving | Gabriel, Desbravadora | `src/chars/rigs.tsx` |
| Rear wheel and caster (they roll with the distance travelled) | Theo | `src/chars/Theo.tsx` |
| Uniform insignia (the 1254-px profile sheet was too soft to trace them cleanly) | Theo | `src/chars/Theo.tsx` |

| Character | Sheet | View |
|---|---|---|
| Gabriel | `gabriel/00_referencia_original.jpeg` | front |
| Desbravadora | `desbravadora/guia_consistencia.png` (left figure, traced at 2×) | front |
| Theo | `theo/03_perfil_original.png` (traced at 2×) | profile, manual wheelchair |

Rigs:

- **Gabriel and the Desbravadora:** head, torso, hips/skirt, legs, and arms split at shoulder, elbow and wrist. Joint patches hide the seams.
- **Theo:** torso lean, head, and an arm on 2-bone IK whose hand stays locked to the push rim while pushing. The wheel rotation equals the distance travelled divided by the radius, so the wheel never slips.

## Set
`src/scene/Clubhouse.tsx` holds the clubhouse with a porch 4 steps high and no ramp. The stairs are the barrier and are what gets highlighted, never the person.

The set has parallax layers: sky, clouds, hills, tree line, trees, fence, building, and foreground bushes with light.

## Audio
`src/audio/pilot_mix.py` builds `public/piloto_mix.wav`:

- **Voice:** the user's restored voice (`audio/voice_edited.wav`, 0–10.6 s).
- **Music:** ducked under the voice.
- **Effects:** synthesized and synced to `src/timing.json` (pushes, braking, the barrier, the question mark, footsteps).
- **Master:** −14 LUFS, true peak ≤ −1 dBTP.

## Render
```sh
python3 tools/vectorize.py gabriel && python3 tools/vectorize.py girl && python3 tools/vectorize.py theo
python3 src/audio/pilot_mix.py
cd remotion && npm install
npx remotion render src/index.ts Piloto out/piloto_raw.mp4 --codec=h264 --crf=16 --concurrency=4
```
`remotion.config.ts` points Remotion at the pre-installed Chromium headless shell.
