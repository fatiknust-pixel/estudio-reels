#!/usr/bin/env bash
# Renderiza os dois formatos e normaliza o volume (-14 LUFS, padrão de vídeos na internet).
# Uso: bash scripts/renderizar.sh            (16:9 e 9:16)
#      bash scripts/renderizar.sh 9x16       (só um formato)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
FORMATOS=("${@:-16x9 9x16}")
for fmt in ${FORMATOS[@]}; do
  case "$fmt" in
    16x9) comp=Framecraft ;;
    9x16) comp=FramecraftVertical ;;
    *) echo "formato desconhecido: $fmt"; exit 1 ;;
  esac
  npx remotion render src/index.ts "$comp" "out/bruto-$fmt.mp4" --concurrency="${CONCORRENCIA:-4}"
  ffmpeg -y -loglevel error -i "out/bruto-$fmt.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k "out/framecraft-$fmt.mp4"
  rm -f "out/bruto-$fmt.mp4"
  echo "✓ out/framecraft-$fmt.mp4"
done
