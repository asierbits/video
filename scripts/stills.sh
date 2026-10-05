#!/usr/bin/env bash
# Uso: scripts/stills.sh prefijo frame1 frame2 ...  -> out/prefijo_<frame>.png (a media resolución)
cd "$(dirname "$0")/.."
BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
pre=$1; shift
for f in "$@"; do
  npx remotion still ${COMP:-KnokFilm} "out/${pre}_${f}.png" --frame="$f" --scale=0.5 ${BROWSER:+--browser-executable=$BROWSER} --log=error
done
