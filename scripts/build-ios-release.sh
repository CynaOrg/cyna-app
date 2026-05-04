#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

echo "[ios:release] Building Angular bundle (production)..."
npm run build -- --configuration production

echo "[ios:release] Syncing Capacitor iOS..."
npx cap sync ios

echo "[ios:release] Updating CocoaPods (if Podfile present)..."
if [ -f "$APP_DIR/ios/App/Podfile" ]; then
  (cd "$APP_DIR/ios/App" && pod install)
fi

echo "[ios:release] Opening Xcode..."
echo
echo "  ► Next steps in Xcode (free signing on Tom's iPhone):"
echo "    1. Select target 'App' in the project navigator"
echo "    2. Signing & Capabilities → Team → choose your Apple ID"
echo "       (Add account if needed: Xcode → Settings → Accounts)"
echo "    3. If bundle ID 'io.cyna.app' is taken by another developer:"
echo "       change to 'io.cyna.app.tom' (or any unique suffix)"
echo "    4. Connect iPhone via USB → 'Trust This Computer' on device"
echo "    5. Select your iPhone in the toolbar device picker"
echo "    6. Cmd+R to build & run"
echo "    7. On iPhone first launch:"
echo "       Settings → General → VPN & Device Management →"
echo "       Trust 'Apple Development: <your.email>'"
echo
echo "  ⚠  Free signing certificates expire after 7 days."
echo "     Re-run this script and re-launch from Xcode to refresh."
echo

npx cap open ios
