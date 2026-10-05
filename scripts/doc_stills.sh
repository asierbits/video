#!/usr/bin/env bash
# Uso: scripts/doc_stills.sh salida.png seg1 seg2 ...  -> hoja de contactos (3 columnas) del vídeo de YouTube
cd "$(dirname "$0")/.."
BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
out=$1; shift
files=()
for s in "$@"; do
  f=$(python3 -c "print(int(round($s*30)))")
  npx remotion still DocYouTube "out/doc_$f.png" --frame="$f" --scale=0.5 --browser-executable=$BROWSER --log=error
  files+=("out/doc_$f.png")
done
n=${#files[@]}; cols=3; rows=$(( (n + cols - 1) / cols ))
args=(); for f in "${files[@]}"; do args+=(-i "$f"); done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf '[%d:v]scale=640:360[v%d];' $i $i; done)$(for i in $(seq 0 $((n-1))); do printf '[v%d]' $i; done)xstack=inputs=$n:layout=$(python3 -c "
n=$n;c=3
print('|'.join(f'{(i%c)*640}_{(i//c)*360}' for i in range(n)))")" "$out"
