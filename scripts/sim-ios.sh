#!/usr/bin/env bash
set -euo pipefail

DEVICE="${SIM_DEVICE:-iPhone 17}"

echo "[sim:ios] Building Angular app..."
npm run build

echo "[sim:ios] Syncing Capacitor iOS..."
npx cap sync ios

echo "[sim:ios] Booting simulator '$DEVICE' (if not already booted)..."
xcrun simctl boot "$DEVICE" 2>/dev/null || true
open -a Simulator

DEVICE_ID="$(xcrun simctl list devices | grep -E "^\s+$DEVICE \(" | head -1 | grep -oE '[A-F0-9-]{36}')"
if [ -z "$DEVICE_ID" ]; then
  echo "[sim:ios] ERROR: device '$DEVICE' not found in xcrun simctl list devices" >&2
  echo "[sim:ios] Available simulators (filter: $DEVICE):" >&2
  xcrun simctl list devices | grep -i "$DEVICE" || true
  exit 1
fi

echo "[sim:ios] Running on iOS simulator $DEVICE ($DEVICE_ID)..."
npx cap run ios --target "$DEVICE_ID"
