#!/bin/sh
# Shrinks the vendored deck bundle in deck/ so /deck loads fast.
# Run after re-extracting "ASFC Website Bundle.zip" into deck/.
# Needs: cwebp (brew install webp), sips (macOS), python3 with fontTools + brotli,
# and optionally ffmpeg for the video clips.
set -eu
cd "$(dirname "$0")/../deck"
command -v cwebp >/dev/null || { echo "cwebp missing: brew install webp"; exit 1; }

# to_webp <file> <max long edge, 0 keeps size> <quality>
to_webp() {
  f="$1"; max="$2"; q="$3"; out="${f%.*}.webp"
  [ -f "$f" ] || return 0
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}')
  if [ "$max" -gt 0 ] && [ "$w" -gt "$max" -o "$h" -gt "$max" ]; then
    if [ "$w" -ge "$h" ]; then resize="-resize $max 0"; else resize="-resize 0 $max"; fi
  else resize=""; fi
  # shellcheck disable=SC2086
  cwebp -quiet -q "$q" -m 6 $resize "$f" -o "$out"
  rm "$f"
  python3 - "$(basename "$f")" "$(basename "$out")" <<'PY'
import sys, pathlib
old, new = sys.argv[1:3]
p = pathlib.Path('index.html'); s = p.read_text()
if old in s: p.write_text(s.replace(old, new)); print(f"  {old} -> {new}")
PY
}

echo "Images"
to_webp assets/images/allthesmokeBTS.jpg 800 80
to_webp assets/images/cam-fourth-and-one.jpg 800 80
to_webp assets/images/spursreseason.JPG 800 80
to_webp "assets/images/youtube creator collective.jpg" 800 80
to_webp assets/images/bliss.jpg 1920 80
to_webp assets/images/bliss-wallpaper.jpg 1920 80
to_webp assets/images/kabu-banner.jpg 1600 82
to_webp assets/images/late-run-banner.jpg 0 85
to_webp assets/images/kabu-detective.png 0 88
to_webp assets/images/kabu-gomery.png 0 88
to_webp assets/images/kabu-strength.png 0 88
to_webp assets/images/spurs.png 256 90
for f in assets/screenshots/*.png; do to_webp "$f" 0 88; done

echo "Fonts"
python3 - <<'PY'
import glob, pathlib, re
from fontTools.ttLib import TTFont
html = pathlib.Path('index.html'); s = html.read_text()
for f in sorted(glob.glob('assets/fonts/*')):
    p = pathlib.Path(f)
    if p.read_bytes()[:4] == b'wOF2': continue
    font = TTFont(f); font.flavor = 'woff2'
    out = p.with_suffix('.woff2'); font.save(out)
    if out != p: p.unlink()
    s = s.replace(f"url('{f}') format('truetype')", f"url('{out}') format('woff2')")
    s = s.replace(f"url({f}) format('truetype')", f"url({out}) format('woff2')")
    print(f"  {p.name} -> {out.name} ({out.stat().st_size // 1024}KB)")
html.write_text(s)
PY

if command -v ffmpeg >/dev/null; then
  echo "Videos"
  for f in assets/media/*.mp4; do
    tmp="${f%.mp4}.tmp.mp4"
    ffmpeg -loglevel error -y -i "$f" -vf "scale=540:-2" -c:v libx264 -crf 27 -preset slow -movflags +faststart -an "$tmp"
    if [ "$(stat -f%z "$tmp")" -lt "$(stat -f%z "$f")" ]; then mv "$tmp" "$f"; echo "  $f re-encoded"; else rm "$tmp"; fi
  done
else
  echo "ffmpeg not found: skipping video re-encode"
fi

echo "Done. deck/assets is now $(du -sh assets | cut -f1)"
