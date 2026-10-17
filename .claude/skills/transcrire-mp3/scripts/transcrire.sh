#!/usr/bin/env bash
# Transcribe one audio file with Whisper (local, Apple Silicon) into
# transcripts/bibnum/<id>-whisper.json and <id>.fr-orig.json3.
#
# usage: transcrire.sh <audio.mp3> <id> [model]
set -euo pipefail

audio=${1:?usage: transcrire.sh <audio.mp3> <id> [model]}
id=${2:?usage: transcrire.sh <audio.mp3> <id> [model]}
modele=${3:-mlx-community/whisper-large-v3-turbo}

racine=$(cd "$(dirname "$0")/../../../.." && pwd)
sortie="$racine/transcripts/bibnum"
mkdir -p "$sortie"

# A broken ffmpeg (missing dylib) fails silently in pipelines: check it first.
ffmpeg -version >/dev/null 2>&1 || { echo "ffmpeg is not runnable" >&2; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# Mono 16 kHz, loudness normalised. No denoising: it hurts Whisper more than
# tape hiss does.
ffmpeg -y -loglevel error -i "$audio" -ac 1 -ar 16000 -af loudnorm "$tmp/$id.wav"

# condition_on_previous_text off: avoids repetition loops on long files.
uvx --python 3.12 --from mlx-whisper mlx_whisper "$tmp/$id.wav" \
  --model "$modele" \
  --language fr \
  --condition-on-previous-text False \
  --word-timestamps True \
  --output-format json \
  --output-dir "$sortie" \
  --output-name "$id-whisper"

node "$(dirname "$0")/whisper-vers-json3.mjs" "$sortie/$id-whisper.json" "$sortie/$id.fr-orig.json3"
echo "$sortie/$id.fr-orig.json3"
