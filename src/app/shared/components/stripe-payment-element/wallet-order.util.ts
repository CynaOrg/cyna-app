/**
 * Resolve the preferred wallet ordering for the current device.
 *
 * Stripe's Payment Request Button automatically picks the right wallet
 * (Apple Pay on iOS Safari/WKWebView, Google Pay on Android Chrome / browser
 * supporting payment request API). This helper exists for two reasons:
 *
 * 1. To express our UX preference for tests and any future explicit ordering.
 *    Per Tom: iOS-first when running natively on iOS (Capacitor), card-first
 *    elsewhere — Google Pay is out of scope for V1 (requires extra config).
 * 2. To document the priority list in code rather than spread across the page.
 *
 * Order is a simple readonly tuple of payment method identifiers.
 *
 * @param isNative true when running inside the Capacitor native shell.
 * @param platform navigator.platform string (iPad/iPhone/iPod => iOS).
 * @param userAgent navigator.userAgent string (iOS hint when on macOS Safari WKWebView).
 */
export function resolveWalletOrder(
  isNative: boolean,
  platform: string,
  userAgent: string,
): readonly string[] {
  const lowerPlatform = (platform || '').toLowerCase();
  const lowerUa = (userAgent || '').toLowerCase();

  const isIOS =
    lowerPlatform.includes('iphone') ||
    lowerPlatform.includes('ipad') ||
    lowerPlatform.includes('ipod') ||
    // iPadOS 13+ reports as MacIntel; sniff iPad via UA.
    /\b(ipad|iphone|ipod)\b/.test(lowerUa);

  if (isNative && isIOS) {
    return ['apple_pay', 'card'] as const;
  }

  if (isIOS) {
    // Mobile Safari (PWA / web) — wallet still works through Stripe.
    return ['apple_pay', 'card'] as const;
  }

  // Default: card first, leave room for google_pay later (out of V1 scope).
  return ['card', 'apple_pay'] as const;
}
