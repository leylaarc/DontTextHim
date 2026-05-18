#!/usr/bin/env bash
# Capture App Store screenshots on iPad Pro 13-inch (M4) — 2064×2752 px portrait.
# Prereq: Xcode + Simulator. First run builds the native app (several minutes).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEVICE_NAME="${DEVICE_NAME:-iPad Pro 13-inch (M4)}"
OUT_DIR="${OUT_DIR:-$ROOT/marketing/screenshots/ipad-13}"

cd "$ROOT"
mkdir -p "$OUT_DIR"

UDID="$(xcrun simctl list devices available | grep "$DEVICE_NAME" | head -1 | sed -n 's/.*(\([^)]*\)).*/\1/p')"
if [[ -z "$UDID" ]]; then
  echo "Simulator not found: $DEVICE_NAME"
  exit 1
fi

echo "Simulator: $DEVICE_NAME ($UDID)"
xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator

if [[ ! -d "$ROOT/ios" ]]; then
  echo "Prebuild (first time only)…"
  npx expo prebuild --platform ios
fi

echo "Build + install on simulator (wait until the app opens)…"
npx expo run:ios --device "$UDID"

export PATH="$PATH:$HOME/.maestro/bin"
if ! command -v maestro >/dev/null 2>&1; then
  echo "Installing Maestro…"
  curl -Ls "https://get.maestro.mobile.dev" | bash
fi

MAESTRO_OUT="$ROOT/maestro/output/ipad-13-run"
rm -rf "$MAESTRO_OUT"
mkdir -p "$MAESTRO_OUT"

echo "Running Maestro screenshot flow…"
maestro test "$ROOT/maestro/ipad-13-screenshots.yaml" --test-output-dir "$MAESTRO_OUT"

cp -f "$MAESTRO_OUT"/*.png "$OUT_DIR/" 2>/dev/null || true
find "$MAESTRO_OUT" -name '*.png' -exec cp -f {} "$OUT_DIR/" \;

n="$(find "$OUT_DIR" -maxdepth 1 -name '*.png' | wc -l | tr -d ' ')"
echo ""
echo "Saved $n screenshot(s) to: $OUT_DIR"
echo "Upload the 2064×2752 portrait PNGs under App Store Connect → iPad → 13-inch display."
