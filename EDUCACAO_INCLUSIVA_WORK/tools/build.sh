#!/bin/sh
# Bundle the Three.js world for the HyperFrames composition
cd "$(dirname "$0")/.." && npx esbuild src/main.js --bundle --format=iife --loader:.json=json --outfile=hyperframes/main/world.js --log-level=warning
