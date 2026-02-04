/**
 * Reliable native platform detection for Capacitor.
 *
 * Capacitor.isNativePlatform() returns true on Safari macOS because
 * Safari exposes window.webkit.messageHandlers.bridge, which Capacitor
 * interprets as the iOS native bridge.
 * See: https://github.com/ionic-team/capacitor/issues/7241
 *
 * Instead we check for signals that are exclusively set by the native
 * Capacitor runtime and never present in a regular browser:
 *
 * 1. PluginHeaders — injected by native code (JSExport.java on Android,
 *    Swift bridge on iOS). Never present in a browser context.
 * 2. androidBridge — injected only by the Capacitor Android runtime.
 * 3. capacitor: protocol — default iOS URL scheme inside the native shell.
 */
export function isNativeCapacitor(): boolean {
  const cap = (window as any).Capacitor;

  // PluginHeaders is the most reliable single signal
  if (Array.isArray(cap?.PluginHeaders) && cap.PluginHeaders.length > 0) {
    return true;
  }

  // Android-specific bridge object
  if ((window as any).androidBridge) {
    return true;
  }

  // iOS default URL scheme (breaks only if iosScheme is overridden,
  // but PluginHeaders covers that case above)
  if (window.location.protocol === 'capacitor:') {
    return true;
  }

  return false;
}
