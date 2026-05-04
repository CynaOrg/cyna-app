#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

DEVICE="${SIM_DEVICE:-iPhone 17}"

echo "[sim:ios] Building Angular app..."
npm run build

echo "[sim:ios] Syncing Capacitor iOS..."
npx cap sync ios

echo "[sim:ios] Booting simulator '$DEVICE'..."
xcrun simctl boot "$DEVICE" 2>/dev/null || true
open -a Simulator

DEVICE_ID="$(xcrun simctl list devices | grep -E "^\s+$DEVICE \(" | head -1 | grep -oE '[A-F0-9-]{36}')"
if [ -z "$DEVICE_ID" ]; then
  echo "[sim:ios] ERROR: device '$DEVICE' not found" >&2
  exit 1
fi

echo "[sim:ios] Running on $DEVICE ($DEVICE_ID)..."
npx cap run ios --target "$DEVICE_ID"
