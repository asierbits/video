#!/usr/bin/env bash
# Une varias imágenes en una tira horizontal: scripts/sheet.sh salida.png a.png b.png ...
out=$1; shift
args=(); for f in "$@"; do args+=(-i "$f"); done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "hstack=inputs=$#,scale=iw/2:ih/2" "$out"
