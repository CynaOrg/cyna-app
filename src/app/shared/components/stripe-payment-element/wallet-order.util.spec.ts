import { resolveWalletOrder } from './wallet-order.util';

describe('resolveWalletOrder', () => {
  it('returns apple_pay first on native iOS Capacitor', () => {
    const order = resolveWalletOrder(
      true,
      'iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    );
    expect(order[0]).toBe('apple_pay');
    expect(order).toContain('card');
  });

  it('returns apple_pay first on iOS Mobile Safari (web)', () => {
    const order = resolveWalletOrder(
      false,
      'iPhone',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari',
    );
    expect(order[0]).toBe('apple_pay');
  });

  it('detects iPadOS reporting MacIntel via UA sniff', () => {
    const order = resolveWalletOrder(
      false,
      'MacIntel',
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit Version/17.0 Mobile',
    );
    expect(order[0]).toBe('apple_pay');
  });

  it('returns card first on Android', () => {
    const order = resolveWalletOrder(
      true,
      'Linux armv8l',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit',
    );
    expect(order[0]).toBe('card');
  });

  it('returns card first on desktop browsers', () => {
    const order = resolveWalletOrder(
      false,
      'Win32',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome',
    );
    expect(order[0]).toBe('card');
  });

  it('handles empty inputs without throwing', () => {
    expect(() => resolveWalletOrder(false, '', '')).not.toThrow();
    const order = resolveWalletOrder(false, '', '');
    expect(order[0]).toBe('card');
  });
});
