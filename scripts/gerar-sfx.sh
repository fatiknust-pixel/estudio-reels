#!/usr/bin/env bash
# Gera os efeitos sonoros e a trilha de fundo só com ffmpeg (sem direitos autorais).
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
F="ffmpeg -y -loglevel error"

# whoosh: ruído com filtro passa-banda varrendo + fade
$F -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.9" -af "highpass=f=300,lowpass=f=4000,afade=t=in:d=0.18,afade=t=out:st=0.2:d=0.25,volume=0.9" whoosh.mp3
# pop: blip curto descendo de tom
$F -f lavfi -i "sine=f=900:d=0.09" -af "asetrate=44100*1.3,aresample=44100,afade=t=out:st=0.02:d=0.07,volume=0.6" pop.mp3
# carimbo: grave + estalo
$F -f lavfi -i "sine=f=70:d=0.35" -f lavfi -i "anoisesrc=d=0.06:c=white:a=0.8" \
  -filter_complex "[0]afade=t=out:st=0.05:d=0.3[a];[1]lowpass=f=2500[b];[a][b]amix=inputs=2:normalize=0,volume=1.6" carimbo.mp3
# tique: contador
$F -f lavfi -i "sine=f=1800:d=0.03" -af "afade=t=out:st=0.005:d=0.025,volume=0.35" tique.mp3
# ding: final/positivo
$F -f lavfi -i "sine=f=1320:d=0.6" -f lavfi -i "sine=f=1980:d=0.6" \
  -filter_complex "[0][1]amix=inputs=2,afade=t=out:st=0.05:d=0.55,volume=0.7" ding.mp3
# trilha: pad em lá menor com pulsação leve (loop de 16 s)
$F -f lavfi -i "sine=f=110:d=16" -f lavfi -i "sine=f=130.81:d=16" -f lavfi -i "sine=f=164.81:d=16" -f lavfi -i "sine=f=55:d=16" \
  -filter_complex "[0][1][2][3]amix=inputs=4,tremolo=f=1.6667:d=0.55,lowpass=f=900,afade=t=in:d=0.5,afade=t=out:st=15.5:d=0.5,volume=0.8" trilha.mp3
ls -la
