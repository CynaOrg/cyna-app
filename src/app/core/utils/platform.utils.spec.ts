import { isAndroid, isNativeCapacitor } from './platform.utils';

describe('platform.utils', () => {
  let originalCap: unknown;
  let originalAndroid: unknown;

  beforeEach(() => {
    originalCap = (window as any).Capacitor;
    originalAndroid = (window as any).androidBridge;
  });

  afterEach(() => {
    if (originalCap === undefined) delete (window as any).Capacitor;
    else (window as any).Capacitor = originalCap;
    if (originalAndroid === undefined) delete (window as any).androidBridge;
    else (window as any).androidBridge = originalAndroid;
  });

  it('isNativeCapacitor returns false in a vanilla browser', () => {
    delete (window as any).Capacitor;
    delete (window as any).androidBridge;
    expect(isNativeCapacitor()).toBeFalse();
  });

  it('isNativeCapacitor returns true when PluginHeaders is populated', () => {
    (window as any).Capacitor = { PluginHeaders: [{ name: 'x' }] };
    expect(isNativeCapacitor()).toBeTrue();
  });

  it('isNativeCapacitor returns true when androidBridge is set', () => {
    delete (window as any).Capacitor;
    (window as any).androidBridge = {};
    expect(isNativeCapacitor()).toBeTrue();
  });

  it('isAndroid returns false when not native', () => {
    delete (window as any).Capacitor;
    delete (window as any).androidBridge;
    expect(isAndroid()).toBeFalse();
  });

  it('isAndroid returns true when native + getPlatform returns android', () => {
    (window as any).Capacitor = {
      PluginHeaders: [{ name: 'x' }],
      getPlatform: () => 'android',
    };
    expect(isAndroid()).toBeTrue();
  });

  it('isAndroid returns false when native + getPlatform returns ios', () => {
    (window as any).Capacitor = {
      PluginHeaders: [{ name: 'x' }],
      getPlatform: () => 'ios',
    };
    expect(isAndroid()).toBeFalse();
  });
});
